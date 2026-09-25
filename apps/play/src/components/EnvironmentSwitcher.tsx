import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Play,
  Home,
  GraduationCap,
  Church,
  School,
  Settings,
  LogOut,
  Check,
  UserCheck
} from 'lucide-react'
import { useEnvironment, EnvironmentOption } from '../context/EnvironmentContext'
import { useProfile } from '../context/ProfileContext'
import { verifyParentPin } from '../lib/pinService'
import { supabase } from '@comdeuskids/supabase'
import { Lock, AlertCircle } from 'lucide-react'

interface EnvironmentSwitcherProps {
  onClose?: () => void
}

export default function EnvironmentSwitcher({ onClose }: EnvironmentSwitcherProps) {
  const { userDisplayName, environments, currentEnvironment, switchEnvironment } = useEnvironment()
  const { profiles, activeProfile, selectProfile } = useProfile()
  const navigate = useNavigate()

  const [pinPromptEnv, setPinPromptEnv] = useState<EnvironmentOption | null>(null)
  const [pinInput, setPinInput] = useState('')
  const [pinLoading, setPinLoading] = useState(false)
  const [pinError, setPinError] = useState<string | null>(null)

  const isKid = activeProfile?.profile_type === 'kid'
  const parentProfile = profiles.find(p => p.profile_type === 'parent') || activeProfile

  const handleSelect = (env: EnvironmentOption) => {
    // Se perfil infantil tentar alternar para ambiente não-play, exigir PIN dos pais
    if (isKid && env.type !== 'play') {
      setPinPromptEnv(env)
      setPinInput('')
      setPinError(null)
      return
    }

    switchEnvironment(env.id)
    if (onClose) onClose()
  }

  const handleUnlockPin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pinPromptEnv || !parentProfile) return

    setPinLoading(true)
    setPinError(null)

    try {
      const res = await verifyParentPin(parentProfile.id, pinInput)
      if (res.success) {
        if (parentProfile.profile_type === 'parent') {
          selectProfile(parentProfile)
        }
        switchEnvironment(pinPromptEnv.id)
        if (onClose) onClose()
      } else {
        setPinError('PIN incorreto.')
      }
    } catch {
      setPinError('Erro ao validar PIN.')
    } finally {
      setPinLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    if (onClose) onClose()
    navigate('/login')
  }

  const renderIcon = (iconName: EnvironmentOption['icon'], color: string) => {
    switch (iconName) {
      case 'Play':
        return <Play size={15} color={color} fill={color} />
      case 'Home':
        return <Home size={16} color={color} />
      case 'GraduationCap':
        return <GraduationCap size={16} color={color} />
      case 'Church':
        return <Church size={16} color={color} />
      case 'School':
        return <School size={16} color={color} />
      default:
        return <Play size={15} color={color} />
    }
  }

  return (
    <div
      style={{
        width: 270,
        backgroundColor: '#1c1b1d',
        border: '1px solid #353437',
        borderRadius: 16,
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        zIndex: 1000,
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }}
    >
      {/* CABEÇALHO DO USUÁRIO */}
      <div
        style={{
          padding: '8px 10px 10px',
          borderBottom: '1px solid #2a2a2c',
          marginBottom: 4
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#22c55e'
            }}
          >
            <UserCheck size={16} />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: '#ffffff',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap'
              }}
            >
              {userDisplayName}
            </div>
            <div style={{ fontSize: 11, color: '#8e8a93', fontWeight: 500 }}>
              Trocar Ambiente
            </div>
          </div>
        </div>
      </div>

      {/* LISTA DE AMBIENTES AUTORIZADOS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {environments.map((env) => {
          const isActive = currentEnvironment?.id === env.id
          const accentColor =
            env.type === 'play'
              ? '#22c55e'
              : env.type === 'family'
              ? '#ffb95f'
              : env.type === 'church'
              ? '#7bd0ff'
              : env.type === 'school'
              ? '#55e396'
              : '#22c55e'

          return (
            <button
              key={env.id}
              type="button"
              onClick={() => handleSelect(env)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '9px 12px',
                borderRadius: 10,
                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                border: isActive ? `1px solid ${accentColor}40` : '1px solid transparent',
                color: isActive ? '#ffffff' : '#cbc3d7',
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)'
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  {renderIcon(env.icon, accentColor)}
                </span>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <div style={{ fontSize: 13, color: isActive ? '#ffffff' : '#e5e1e4' }}>
                    {env.title}
                  </div>
                  {env.roleLabel && (
                    <div style={{ fontSize: 10, color: accentColor, fontWeight: 700 }}>
                      {env.roleLabel}
                    </div>
                  )}
                </div>
              </div>

              {isKid && env.type !== 'play' && (
                <Lock size={12} color="#8e8a93" style={{ flexShrink: 0, marginRight: 4 }} />
              )}
              {isActive && <Check size={14} color={accentColor} style={{ flexShrink: 0 }} />}
            </button>
          )
        })}
      </div>

      {/* PROMPT DE PIN DOS PAIS EM CHILD MODE */}
      {pinPromptEnv && (
        <div style={{ padding: '10px', backgroundColor: 'rgba(255, 185, 95, 0.08)', borderRadius: 10, margin: '6px 0', border: '1px solid rgba(255, 185, 95, 0.2)' }}>
          <div style={{ fontSize: 11, color: '#ffb95f', fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Lock size={12} /> PIN dos Pais ({pinPromptEnv.title}):
          </div>
          <form onSubmit={handleUnlockPin} style={{ display: 'flex', gap: 6 }}>
            <input
              type="password"
              maxLength={6}
              value={pinInput}
              onChange={e => setPinInput(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              autoFocus
              style={{
                width: 80,
                padding: '6px 8px',
                borderRadius: 6,
                backgroundColor: '#111116',
                border: pinError ? '1px solid #ffb4ab' : '1px solid #494454',
                color: '#fff',
                fontSize: 14,
                textAlign: 'center',
                letterSpacing: 4,
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={pinLoading || pinInput.length < 4}
              style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: 6,
                backgroundColor: '#22c55e',
                color: '#052e16',
                fontSize: 12,
                fontWeight: 700,
                border: 'none',
                cursor: pinInput.length >= 4 ? 'pointer' : 'not-allowed'
              }}
            >
              {pinLoading ? '...' : 'Entrar'}
            </button>
            <button
              type="button"
              onClick={() => setPinPromptEnv(null)}
              style={{
                padding: '6px 8px',
                borderRadius: 6,
                backgroundColor: 'transparent',
                color: '#8e8a93',
                fontSize: 12,
                border: '1px solid #353437',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </form>
          {pinError && (
            <div style={{ fontSize: 10, color: '#ff8585', marginTop: 4 }}>{pinError}</div>
          )}
        </div>
      )}

      <div style={{ height: 1, backgroundColor: '#2a2a2c', margin: '4px 0' }} />

      {/* MINHA CONTA & SAIR */}
      <button
        type="button"
        onClick={() => {
          if (onClose) onClose()
          navigate('/conta')
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          width: '100%',
          padding: '8px 12px',
          borderRadius: 8,
          background: 'none',
          border: 'none',
          color: '#cbc3d7',
          fontSize: 13,
          fontWeight: 600,
          textAlign: 'left',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        <Settings size={15} color="#8e8a93" />
        Minha Conta
      </button>

      <button
        type="button"
        onClick={handleSignOut}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          width: '100%',
          padding: '8px 12px',
          borderRadius: 8,
          background: 'none',
          border: 'none',
          color: '#ff8585',
          fontSize: 13,
          fontWeight: 600,
          textAlign: 'left',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 80, 80, 0.08)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        <LogOut size={15} color="#ff8585" />
        Sair
      </button>
    </div>
  )
}
