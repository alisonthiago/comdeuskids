import React, { useState, useEffect } from 'react'
import { supabase } from '@comdeuskids/supabase'
import { useAuth } from '../../hooks/useAuth'

interface ChildProfile {
  id: string
  name: string
  avatar_url: string | null
  daily_limit_minutes: number | null
  educational_mode: boolean
  bedtime_start: string | null
  bedtime_end: string | null
  temp_pause_until: string | null
}

export function ControlesParentais() {
  const { user } = useAuth()
  const [profiles, setProfiles] = useState<ChildProfile[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [dailyLimit, setDailyLimit] = useState(60)
  const [educationalMode, setEducationalMode] = useState(false)
  const [bedtimeStart, setBedtimeStart] = useState('21:00')
  const [bedtimeEnd, setBedtimeEnd] = useState('07:00')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!user) return
      const { data } = await supabase
        .from('account_profiles')
        .select('*')
        .eq('account_id', user.id)
        .eq('role', 'child')
      if (data?.length) {
        setProfiles(data as ChildProfile[])
        selectProfile(data[0] as ChildProfile)
      }
      setLoading(false)
    }
    load()
  }, [user])

  function selectProfile(profile: ChildProfile) {
    setSelectedId(profile.id)
    setDailyLimit(profile.daily_limit_minutes || 60)
    setEducationalMode(profile.educational_mode || false)
    setBedtimeStart(profile.bedtime_start || '21:00')
    setBedtimeEnd(profile.bedtime_end || '07:00')
  }

  const handleSave = async () => {
    if (!selectedId) return
    setSaving(true)
    setMessage(null)
    const { error } = await supabase
      .from('account_profiles')
      .update({
        daily_limit_minutes: dailyLimit,
        educational_mode: educationalMode,
        bedtime_start: bedtimeStart,
        bedtime_end: bedtimeEnd,
      })
      .eq('id', selectedId)
    setSaving(false)
    if (!error) {
      setProfiles(prev => prev.map(p =>
        p.id === selectedId
          ? { ...p, daily_limit_minutes: dailyLimit, educational_mode: educationalMode, bedtime_start: bedtimeStart, bedtime_end: bedtimeEnd }
          : p
      ))
      setMessage('Configurações salvas.')
      setTimeout(() => setMessage(null), 3000)
    }
  }

  if (loading) return <div>Carregando...</div>

  return (
    <div>
      <h1>Controles Parentais</h1>
      <p>Configuração de limites e horários de sono.</p>

      {message && <div>{message}</div>}

      {profiles.length === 0 ? (
        <p>Nenhum perfil infantil cadastrado.</p>
      ) : (
        <div>
          <div>
            <label>Selecione a criança: </label>
            <select value={selectedId} onChange={e => {
              const p = profiles.find(x => x.id === e.target.value)
              if (p) selectProfile(p)
            }}>
              {profiles.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label>Limite diário (minutos): </label>
            <input
              type="number"
              value={dailyLimit}
              onChange={e => setDailyLimit(Number(e.target.value))}
            />
          </div>

          <div>
            <label>
              <input
                type="checkbox"
                checked={educationalMode}
                onChange={e => setEducationalMode(e.target.checked)}
              />
              {' '}Modo educativo obrigatório
            </label>
          </div>

          <div>
            <label>Horário de dormir - Início: </label>
            <input
              type="time"
              value={bedtimeStart}
              onChange={e => setBedtimeStart(e.target.value)}
            />
            <label> Fim: </label>
            <input
              type="time"
              value={bedtimeEnd}
              onChange={e => setBedtimeEnd(e.target.value)}
            />
          </div>

          <button onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      )}
    </div>
  )
}

export default ControlesParentais
