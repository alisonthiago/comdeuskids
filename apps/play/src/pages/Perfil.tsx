import React, { useState, useEffect } from 'react'
import { supabase } from '@comdeuskids/supabase'
import { User, Save, Sparkles, Lock, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Perfil() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<any>(null)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      setProfile(data)
      setFullName(data.full_name || '')
      setPhone(data.phone || '')
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
      setSuccessMsg(true)
      setTimeout(() => setSuccessMsg(false), 3000)
    }
    setSaving(false)
  }

  return (
    <div style={{
      maxWidth: 700,
      margin: '0 auto',
      padding: '24px 20px 80px',
      fontFamily: "'Baloo 2', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      <button
        type="button"
        onClick={() => navigate('/meu-perfil')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'none',
          border: 'none',
          color: '#22c55e',
          fontSize: 14,
          fontWeight: 700,
          cursor: 'pointer',
          marginBottom: 20
        }}
      >
        <ArrowLeft size={16} /> Voltar para o Perfil
      </button>

      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 14px',
        borderRadius: 9999,
        background: 'rgba(34, 197, 94, 0.15)',
        border: '1px solid rgba(34, 197, 94, 0.3)',
        color: '#22c55e',
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: '0.08em',
        marginBottom: 16
      }}>
        <Sparkles size={14} />
        <span>DADOS DA CONTA</span>
      </div>

      <h1 style={{
        fontSize: 'clamp(26px, 3.5vw, 36px)',
        fontWeight: 800,
        color: '#ffffff',
        letterSpacing: '-0.02em',
        marginBottom: 8
      }}>
        Configurações do Titular
      </h1>

      <p style={{
        fontSize: 15,
        color: '#cbc3d7',
        marginBottom: 32,
        lineHeight: 1.6
      }}>
        Informações de contato do responsável pela assinatura Com Deus Kids.
      </p>

      {successMsg && (
        <div style={{
          padding: '12px 18px',
          borderRadius: 12,
          backgroundColor: 'rgba(113, 221, 143, 0.15)',
          border: '1px solid rgba(113, 221, 143, 0.3)',
          color: '#71dd8f',
          fontSize: 14,
          fontWeight: 700,
          marginBottom: 24
        }}>
          ✓ Dados salvos com sucesso!
        </div>
      )}

      <form
        onSubmit={handleSave}
        style={{
          backgroundColor: '#1c1b1d',
          borderRadius: 24,
          padding: '32px',
          border: '1px solid #2a2a2c',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.45)'
        }}
      >
        <div style={{ marginBottom: 22 }}>
          <label style={{
            display: 'block',
            fontSize: 13,
            fontWeight: 700,
            color: '#e5e1e4',
            marginBottom: 8
          }}>
            E-mail de Acesso (Login)
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              disabled
              value={profile?.email || 'membro@comdeuskids.com.br'}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 12,
                border: '1px solid #353437',
                backgroundColor: '#151416',
                color: '#958ea0',
                fontSize: 14,
                cursor: 'not-allowed'
              }}
            />
            <Lock size={15} color="#958ea0" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }} />
          </div>
        </div>

        <div style={{ marginBottom: 22 }}>
          <label style={{
            display: 'block',
            fontSize: 13,
            fontWeight: 700,
            color: '#e5e1e4',
            marginBottom: 8
          }}>
            Nome Completo do Responsável
          </label>
          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="Seu nome"
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 12,
              border: '1px solid #353437',
              backgroundColor: '#201f21',
              color: '#ffffff',
              fontSize: 14,
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
          />
        </div>

        <div style={{ marginBottom: 32 }}>
          <label style={{
            display: 'block',
            fontSize: 13,
            fontWeight: 700,
            color: '#e5e1e4',
            marginBottom: 8
          }}>
            Telefone / WhatsApp
          </label>
          <input
            type="text"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="(00) 00000-0000"
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 12,
              border: '1px solid #353437',
              backgroundColor: '#201f21',
              color: '#ffffff',
              fontSize: 14,
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              color: '#052e16',
              border: 'none',
              borderRadius: 12,
              fontWeight: 800,
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: 14,
              boxShadow: '0 4px 16px rgba(34, 197, 94, 0.35)'
            }}
          >
            <Save size={16} />
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/selecionar-perfil')}
            style={{
              padding: '12px 20px',
              borderRadius: 12,
              border: '1px solid #353437',
              backgroundColor: '#2a2a2c',
              color: '#e5e1e4',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Gerenciar Perfis Infantis
          </button>
        </div>
      </form>
    </div>
  )
}
