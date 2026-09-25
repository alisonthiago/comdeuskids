import type { AccountProfile, ParentalPolicyResult, ParentalBlockReason } from '@comdeuskids/types'

export interface EvaluatePolicyOptions {
  currentDate?: Date
  activeSecondsToday?: number
  contentAccessClass?: 'general' | 'educational'
  clientTimezone?: string
}

const DAY_KEYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab']

/**
 * Obtém a data, dia da semana e hora formatada em um timezone específico
 */
export function getLocalTimeInTimezone(date: Date, timezone?: string | null): {
  dayOfWeek: string
  timeString: string
  dateString: string
} {
  const effectiveTz = timezone || (typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'America/Sao_Paulo')

  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: effectiveTz,
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })

    const parts = formatter.formatToParts(date)
    const map = Object.fromEntries(parts.map(p => [p.type, p.value]))

    // Mapear dia em inglês para a chave de 3 letras do sistema ('seg', 'ter', etc.)
    const weekdayMap: Record<string, string> = {
      Sun: 'dom',
      Mon: 'seg',
      Tue: 'ter',
      Wed: 'qua',
      Thu: 'qui',
      Fri: 'sex',
      Sat: 'sab'
    }
    const dayOfWeek = weekdayMap[map.weekday] || DAY_KEYS[date.getDay()]
    const timeString = `${map.hour}:${map.minute}`
    const dateString = `${map.year}-${map.month}-${map.day}`

    return { dayOfWeek, timeString, dateString }
  } catch {
    // Fallback defensivo usando horário local do ambiente
    const dayOfWeek = DAY_KEYS[date.getDay()]
    const timeString = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    const dateString = date.toISOString().slice(0, 10)
    return { dayOfWeek, timeString, dateString }
  }
}

/**
 * Formata segundos restantes de forma amigável para exibição
 */
export function formatRemainingTime(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined) return 'Ilimitado'
  if (seconds <= 0) return '0 min'
  const mins = Math.floor(seconds / 60)
  if (mins < 60) return `${mins} min`
  const hours = Math.floor(mins / 60)
  const remMins = mins % 60
  return remMins > 0 ? `${hours}h ${remMins}m` : `${hours}h`
}

/**
 * MOTOR CENTRAL DE CONTROLE PARENTAL (ParentalPolicyEngine)
 * Centraliza 100% das regras parentais sem duplicações em telas ou players.
 * NUNCA bloqueia perfis adultos (parent / teacher / leader).
 */
export function evaluateParentalPolicy(
  profile: AccountProfile | null,
  options: EvaluatePolicyOptions = {}
): ParentalPolicyResult {
  // 1. Adultos nunca são bloqueados por controle parental
  if (!profile || profile.profile_type !== 'kid') {
    return {
      allowed: true,
      educationalOnly: false,
      effectivePaused: false,
      isBedtime: false,
      isDayAllowed: true,
      limitReached: false,
      remainingSeconds: null
    }
  }

  const now = options.currentDate || new Date()
  const timezone = profile.timezone || options.clientTimezone
  const { dayOfWeek, timeString } = getLocalTimeInTimezone(now, timezone)

  // 2. PAUSA EFETIVA (Manual ou Temporária com Expiração Automática)
  let effectivePaused = false
  let pauseReason: ParentalBlockReason | undefined = undefined

  if (profile.is_paused) {
    if (profile.paused_until) {
      const untilDate = new Date(profile.paused_until)
      if (untilDate.getTime() > now.getTime()) {
        effectivePaused = true
        pauseReason = 'TEMPORARY_PAUSED'
      } else {
        // Pausa temporária expirou! O perfil volta a funcionar normalmente
        effectivePaused = false
      }
    } else {
      // Pausa manual contínua
      effectivePaused = true
      pauseReason = 'MANUAL_PAUSED'
    }
  }

  if (effectivePaused) {
    return {
      allowed: false,
      reason: pauseReason,
      message:
        pauseReason === 'TEMPORARY_PAUSED'
          ? 'Perfil em pausa temporária configurada pelos responsáveis.'
          : 'Perfil pausado pelos responsáveis.',
      educationalOnly: !!profile.strict_educational_only,
      effectivePaused: true,
      isBedtime: false,
      isDayAllowed: true,
      limitReached: false,
      remainingSeconds: 0
    }
  }

  // 3. DIAS PERMITIDOS
  const allowedDays = profile.allowed_days && profile.allowed_days.length > 0
    ? profile.allowed_days
    : ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom']

  const isDayAllowed = allowedDays.includes(dayOfWeek)
  if (!isDayAllowed) {
    return {
      allowed: false,
      reason: 'DAY_NOT_ALLOWED',
      message: 'Hoje não é um dia liberado para uso do Com Deus Kids pelos responsáveis.',
      educationalOnly: !!profile.strict_educational_only,
      effectivePaused: false,
      isBedtime: false,
      isDayAllowed: false,
      limitReached: false,
      remainingSeconds: 0
    }
  }

  // 4. JANELA DE HORÁRIO / HORÁRIO DE DORMIR (Bedtime Window)
  const startTime = profile.allowed_start_time || '07:00'
  const endTime = profile.allowed_end_time || profile.bedtime_hour || '21:30'

  // Checagem segura de janela
  let isBedtime = false
  if (startTime < endTime) {
    // Ex: 07:00 até 21:30 (janela normal diurna)
    isBedtime = timeString < startTime || timeString >= endTime
  } else {
    // Janela que cruza meia-noite (ex: 20:00 até 02:00)
    isBedtime = timeString < startTime && timeString >= endTime
  }

  if (isBedtime) {
    return {
      allowed: false,
      reason: 'BEDTIME_WINDOW',
      message: 'Hora do soninho! O Com Deus Kids já está dormindo até amanhã.',
      educationalOnly: !!profile.strict_educational_only,
      effectivePaused: false,
      isBedtime: true,
      isDayAllowed: true,
      limitReached: false,
      remainingSeconds: 0
    }
  }

  // 5. LIMITE DIÁRIO (daily_limit_minutes: NULL = SEM LIMITE, 120 = 120 minutos)
  const hasDailyLimit = profile.daily_limit_minutes !== null && profile.daily_limit_minutes !== undefined
  let remainingSeconds: number | null = null
  let limitReached = false

  if (hasDailyLimit) {
    const limitSeconds = (profile.daily_limit_minutes as number) * 60
    const consumedSeconds = options.activeSecondsToday || 0
    remainingSeconds = Math.max(0, limitSeconds - consumedSeconds)

    if (consumedSeconds >= limitSeconds) {
      limitReached = true
      return {
        allowed: false,
        reason: 'DAILY_LIMIT_REACHED',
        message: 'Tempo de tela diário atingido! Parabéns pelas atividades de hoje.',
        educationalOnly: !!profile.strict_educational_only,
        effectivePaused: false,
        isBedtime: false,
        isDayAllowed: true,
        limitReached: true,
        remainingSeconds: 0
      }
    }
  }

  // 6. MODO EDUCATIVO ESTRITO (strict_educational_only)
  const isStrictEducational = !!profile.strict_educational_only
  if (isStrictEducational && options.contentAccessClass === 'general') {
    return {
      allowed: false,
      reason: 'EDUCATIONAL_ONLY_RESTRICTION',
      message: 'Este perfil está em Modo Educativo. Apenas conteúdos classificados como educativos estão liberados.',
      educationalOnly: true,
      effectivePaused: false,
      isBedtime: false,
      isDayAllowed: true,
      limitReached: false,
      remainingSeconds
    }
  }

  // Tudo liberado com conformidade total
  return {
    allowed: true,
    educationalOnly: isStrictEducational,
    effectivePaused: false,
    isBedtime: false,
    isDayAllowed: true,
    limitReached: false,
    remainingSeconds
  }
}
