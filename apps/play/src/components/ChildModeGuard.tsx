import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfile } from '../context/ProfileContext'
import { verifyParentPin } from '../lib/pinService'
import { Lock, ArrowLeft, AlertCircle, ShieldAlert } from 'lucide-react'

interface ChildModeGuardProps {
  children: React.ReactNode
  title?: string
  description?: string
}

export default function ChildModeGuard({
  children,
  title = 'Área Restrita aos Responsáveis',
  description = 'Esta página contém configurações e gerenciamento adulto. Digite o PIN parental para continuar.'
}: ChildModeGuardProps) {
  const navigate = useNavigate()
  const { profiles, activeProfile, selectProfile } = useProfile()
  const [unlocked, setUnlocked] = useState(false)
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isLocked, setIsLocked] = useState(false)

  // Se o perfil ativo não for infantil, acesso livre imediato
  if (!activeProfile || activeProfile.profile_type !== 'kid' || unlocked) {
    return <>{children}</>
  }

  // Localiza perfil adulto da conta (responsável)
  const parentProfile = profiles.find(p => p.profile_type === 'parent') || activeProfile

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pin || pin.length < 4) {
      setErrorMsg('Digite um PIN com pelo menos 4 dígitos.')
      return
    }

    setLoading(true)
    setErrorMsg(null)

    try {
      const res = await verifyParentPin(parentProfile.id, pin)

      if (res.success) {
        setUnlocked(true)
        // Se houver perfil adulto na conta, ativa o perfil do responsável
        if (parentProfile.profile_type === 'parent') {
          selectProfile(parentProfile)
        }
      } else {
        if (res.error === 'LOCKED') {
          setIsLocked(true)
          setErrorMsg('PIN temporariamente bloqueado por excesso de tentativas. Tente novamente mais tarde.')
        } else if (res.attempts_remaining !== undefined) {
          setErrorMsg(`PIN incorreto. Você tem mais ${res.attempts_remaining} tentativa(s).`)
        } else {
          setErrorMsg('PIN incorreto ou não configurado.')
        }
      }
    } catch {
      setErrorMsg('Falha na verificação de segurança.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: '#0e0e11',
        color: '#f5f5f7',
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          backgroundColor: '#1b1b22',
          borderRadius: 24,
          border: '1px solid #2e2e38',
          padding: '36px 28px',
          textAlign: 'center',
          boxShadow: '0 20px 50px rgba(0,0,0,0.7)'
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            backgroundColor: 'rgba(34, 197, 94, 0.15)',
            color: '#22c55e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}
        >
          <Lock size={32} />
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>{title}</h2>
        <p style={{ fontSize: 13, color: '#a1a1aa', lineHeight: 1.6, marginBottom: 24 }}>
          {description}
        </p>

        <form onSubmit={handleUnlock} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input
            type="password"
            maxLength={6}
            value={pin}
            onChange={e => {
              setPin(e.target.value.replace(/\D/g, ''))
              setErrorMsg(null)
            }}
            placeholder="••••"
            autoFocus
            disabled={loading || isLocked}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: 14,
              backgroundColor: '#111116',
              border: errorMsg ? '1px solid #ef4444' : '1px solid #3b3b47',
              color: '#fff',
              fontSize: 28,
              textAlign: 'center',
              letterSpacing: 12,
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />

          {errorMsg && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: '#ef4444',
                fontSize: 13,
                justifyContent: 'center',
                textAlign: 'left'
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || isLocked || pin.length < 4}
            style={{
              padding: '14px',
              borderRadius: 12,
              backgroundColor: pin.length >= 4 && !isLocked ? '#22c55e' : '#2b2b36',
              color: pin.length >= 4 && !isLocked ? '#052e16' : '#fff',
              fontSize: 15,
              fontWeight: 700,
              border: 'none',
              cursor: pin.length >= 4 && !isLocked ? 'pointer' : 'not-allowed',
              transition: 'background 0.2s',
              marginTop: 8
            }}
          >
            {loading ? 'Validando...' : 'Desbloquear Acesso'}
          </button>
        </form>

        <button
          onClick={() => navigate('/inicio')}
          style={{
            marginTop: 20,
            background: 'none',
            border: 'none',
            color: '#a1a1aa',
            fontSize: 13,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <ArrowLeft size={16} /> Voltar para o Modo Infantil
        </button>
      </div>
    </div>
  )
}
