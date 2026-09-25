import { useEffect, useState, useRef, useCallback } from 'react'
import { supabase } from '@comdeuskids/supabase'
import { AccountProfile, UsageSessionType } from '@comdeuskids/types'
import { getLocalTimeInTimezone } from '../lib/parentalPolicy'

interface TrackerOptions {
  activeProfile: AccountProfile | null
  usageType?: UsageSessionType
  contentId?: string | null
  isActivePlay?: boolean // true quando o vídeo estiver executando ou jogo estiver em interação ativa
}

interface ScreenTimeState {
  activeSecondsToday: number
  remainingSeconds: number | null
  limitReached: boolean
  loading: boolean
}

// Chave da sessão do dispositivo (reutilizada enquanto a aba estiver aberta)
function getDeviceSessionId(): string {
  let id = sessionStorage.getItem('cdk_device_session_id')
  if (!id) {
    id = `ds_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    sessionStorage.setItem('cdk_device_session_id', id)
  }
  return id
}

export function useScreenTimeTracker({
  activeProfile,
  usageType = 'video',
  contentId = null,
  isActivePlay = false
}: TrackerOptions): ScreenTimeState {
  const [activeSecondsToday, setActiveSecondsToday] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const sessionIdRef = useRef<string>(crypto.randomUUID())
  const pendingSecondsRef = useRef<number>(0)
  const lastActiveTimestampRef = useRef<number | null>(null)
  const deviceSessionId = useRef<string>(getDeviceSessionId()).current

  const isKid = activeProfile?.profile_type === 'kid'
  const hasDailyLimit = activeProfile?.daily_limit_minutes !== null && activeProfile?.daily_limit_minutes !== undefined
  const dailyLimitSeconds = hasDailyLimit ? (activeProfile!.daily_limit_minutes as number) * 60 : null

  // 1. Carregar uso inicial de hoje
  const fetchTodayUsage = useCallback(async () => {
    if (!activeProfile || !isKid) {
      setActiveSecondsToday(0)
      setLoading(false)
      return
    }

    try {
      const clientTz = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'America/Sao_Paulo'
      const { dateString } = getLocalTimeInTimezone(new Date(), activeProfile.timezone || clientTz)

      // Consulta agregada por sessões do dia
      const { data, error } = await supabase
        .from('profile_usage_sessions')
        .select('active_seconds')
        .eq('profile_id', activeProfile.id)
        .eq('usage_date', dateString)

      if (!error && data) {
        const total = data.reduce((acc, row) => acc + (row.active_seconds || 0), 0)
        setActiveSecondsToday(total)
      } else {
        // Fallback para cache local resiliente
        const localKey = `cdk_usage_${activeProfile.id}_${dateString}`
        const localCached = localStorage.getItem(localKey)
        if (localCached) {
          setActiveSecondsToday(Number(localCached) || 0)
        }
      }
    } catch {
      // Ignora erro de rede mantendo estado seguro
    } finally {
      setLoading(false)
    }
  }, [activeProfile, isKid])

  useEffect(() => {
    fetchTodayUsage()
  }, [fetchTodayUsage])

  // 2. Enviar batimento de uso para o Supabase
  const flushHeartbeat = useCallback(async () => {
    if (!activeProfile || !isKid || pendingSecondsRef.current <= 0) return

    const secondsToFlush = Math.min(pendingSecondsRef.current, 90) // Clamped a 90s
    pendingSecondsRef.current = 0

    // Atualiza estado local imediatamente
    setActiveSecondsToday(prev => {
      const updated = prev + secondsToFlush
      const clientTz = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'America/Sao_Paulo'
      const { dateString } = getLocalTimeInTimezone(new Date(), activeProfile.timezone || clientTz)
      localStorage.setItem(`cdk_usage_${activeProfile.id}_${dateString}`, String(updated))
      return updated
    })

    try {
      const clientTz = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'America/Sao_Paulo'
      await supabase.rpc('record_usage_heartbeat', {
        p_session_id: sessionIdRef.current,
        p_profile_id: activeProfile.id,
        p_device_session_id: deviceSessionId,
        p_usage_type: usageType,
        p_content_id: contentId || null,
        p_active_increment_seconds: secondsToFlush,
        p_client_timezone: activeProfile.timezone || clientTz
      })
    } catch (err) {
      console.warn('Erro ao registrar batimento de tempo:', err)
    }
  }, [activeProfile, isKid, deviceSessionId, usageType, contentId])

  // 3. Loop de contabilização de tempo ativo (somente quando reproduzindo e aba em foco)
  useEffect(() => {
    if (!activeProfile || !isKid || !isActivePlay) {
      lastActiveTimestampRef.current = null
      return
    }

    lastActiveTimestampRef.current = Date.now()

    const ticker = setInterval(() => {
      // REGRA: Não contar tempo se a aba estiver em segundo plano ou tela oculta
      if (document.hidden) {
        lastActiveTimestampRef.current = null
        return
      }

      const now = Date.now()
      if (lastActiveTimestampRef.current) {
        const deltaSeconds = Math.floor((now - lastActiveTimestampRef.current) / 1000)
        if (deltaSeconds > 0) {
          pendingSecondsRef.current += deltaSeconds
          lastActiveTimestampRef.current = now
        }
      } else {
        lastActiveTimestampRef.current = now
      }

      // Envia heartbeat em lotes a cada 30 segundos acumulados
      if (pendingSecondsRef.current >= 30) {
        flushHeartbeat()
      }
    }, 1000)

    return () => {
      clearInterval(ticker)
      // Flush ao pausar ou sair do player
      flushHeartbeat()
    }
  }, [activeProfile, isKid, isActivePlay, flushHeartbeat])

  // 4. Tratar evento de mudança de visibilidade da aba e fechamento
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pausou ou minimizou a aba: descarrega imediatamente o tempo pendente e suspende
        flushHeartbeat()
        lastActiveTimestampRef.current = null
      } else {
        if (isActivePlay) {
          lastActiveTimestampRef.current = Date.now()
        }
      }
    }

    const handleBeforeUnload = () => {
      flushHeartbeat()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [flushHeartbeat, isActivePlay])

  // 5. Cálculo de limites
  const remainingSeconds = dailyLimitSeconds !== null
    ? Math.max(0, dailyLimitSeconds - activeSecondsToday)
    : null

  const limitReached = dailyLimitSeconds !== null && activeSecondsToday >= dailyLimitSeconds

  return {
    activeSecondsToday,
    remainingSeconds,
    limitReached,
    loading
  }
}
