import React, { useState } from 'react'
import { supabase } from '@comdeuskids/supabase'
import { useAuth } from '../../hooks/useAuth'

interface CreateProfileDrawerProps {
  onClose: () => void
  onSuccess: (newProfile: any) => void
}

export function CreateProfileDrawer({ onClose, onSuccess }: CreateProfileDrawerProps) {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [dailyLimit, setDailyLimit] = useState(60)
  const [educationalMode, setEducationalMode] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setErrorMsg('Informe o nome da criança.')
      return
    }
    if (!user) return

    setSaving(true)
    setErrorMsg(null)

    const payload = {
      account_id: user.id,
      name: name.trim(),
      role: 'child',
      daily_limit_minutes: dailyLimit,
      educational_mode: educationalMode,
      bedtime_start: '21:00',
      bedtime_end: '07:00'
    }

    const { data, error } = await supabase
      .from('account_profiles')
      .insert(payload)
      .select()
      .single()

    setSaving(false)

    if (error) {
      setErrorMsg('Erro ao cadastrar: ' + error.message)
      return
    }

    if (data) {
      onSuccess(data)
    }
  }

  return (
    <div>
      <h3>Novo Perfil Infantil</h3>
      {errorMsg && <div>{errorMsg}</div>}
      <form onSubmit={handleSave}>
        <div>
          <label>Nome: </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nome da criança"
          />
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
            {' '}Modo educativo
          </label>
        </div>
        <div>
          <button type="submit" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar Criança'}
          </button>
          <button type="button" onClick={onClose}>Cancelar</button>
        </div>
      </form>
    </div>
  )
}

export default CreateProfileDrawer
