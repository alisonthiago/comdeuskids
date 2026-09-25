import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, X, ArrowLeft, Tv } from 'lucide-react'
import { TVProfile, useTVSession } from '../../context/TVSessionContext'
import { CDK_AVATARS, getAvatarImageUrl } from '../../data/avatars'
import { useTVNavigation } from '../../hooks/useTVNavigation'

export default function TVSelectProfile() {
  const navigate = useNavigate()
  const { profiles, selectProfile, verifyProfilePin, loading } = useTVSession()
  useTVNavigation()

  // PIN Modal State
  const [pinModalProfile, setPinModalProfile] = useState<TVProfile | null>(null)
  const [pinInput, setPinInput] = useState<string>('')
  const [pinError, setPinError] = useState(false)

  const handleProfileClick = async (profile: TVProfile) => {
    if (profile.has_pin) {
      setPinModalProfile(profile)
      setPinInput('')
      setPinError(false)
    } else {
      await selectProfile(profile)
      navigate('/tv')
    }
  }

  const handlePinNumClick = (digit: string) => {
    if (pinInput.length < 4) {
      const next = pinInput + digit
      setPinInput(next)
      setPinError(false)
      if (next.length === 4) {
        verifyPin(next)
      }
    }
  }

  const [pinLockMessage, setPinLockMessage] = useState<string | null>(null)

  const verifyPin = async (enteredPin: string) => {
    if (!pinModalProfile) return
    const res = await verifyProfilePin(pinModalProfile.id, enteredPin)
    if (res.success) {
      await selectProfile(pinModalProfile)
      navigate('/tv')
    } else {
      setPinError(true)
      if (res.error === 'LOCKED') {
        setPinLockMessage('Perfil temporariamente bloqueado por 15 minutos (excesso de tentativas).')
      } else {
        setPinLockMessage('PIN incorreto. Tente novamente.')
      }
      setTimeout(() => {
        setPinInput('')
        setPinError(false)
      }, 1200)
    }
  }

  const handlePinBackspace = () => {
    setPinInput(prev => prev.slice(0, -1))
  }

  const getAvatarMeta = (avatarKey: string) => {
    const found = CDK_AVATARS.find(a => a.id === avatarKey)
    return found || {
      name: avatarKey,
      iconEmoji: '🌟',
      bgGradient: 'linear-gradient(135deg, #16a34a, #22c55e)'
    }
  }

  return (
    <div className="cdk-tv-body cdk-tv-select-screen">
      {/* Indicador TV no topo */}
      <div style={{
        position: 'absolute',
        top: 36,
        left: 50,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        color: '#22c55e'
      }}>
        <Tv size={24} />
        <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: 1 }}>COM DEUS KIDS • SMART TV</span>
      </div>

      <h1 className="cdk-tv-select-title">Quem vai assistir?</h1>
      <p className="cdk-tv-select-sub">Navegue com as setas do controle e pressione OK</p>

      {loading ? (
        <div style={{ color: '#22c55e', fontSize: 22 }}>Carregando perfis da família...</div>
      ) : profiles.length === 0 ? (
        <div style={{ textAlign: 'center', maxWidth: 520, margin: '40px auto' }}>
          <p style={{ color: '#cbd5e1', fontSize: 20, marginBottom: 24, lineHeight: 1.6 }}>
            Nenhum perfil infantil encontrado nesta conta. Acesse o Com Deus Kids no seu celular ou computador para cadastrar os perfis das crianças.
          </p>
          <button
            data-tv-focus
            className="cdk-tv-btn cdk-tv-focus"
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 28px',
              borderRadius: 12,
              background: '#22c55e',
              color: '#052e16',
              border: 'none',
              fontSize: 18,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Atualizar Perfis
          </button>
        </div>
      ) : (
        <div className="cdk-tv-profiles-row">
          {profiles.map((profile, idx) => {
            const avatar = getAvatarMeta(profile.avatar_url)
            return (
              <button
                key={profile.id}
                data-tv-focus
                autoFocus={idx === 0}
                className="cdk-tv-profile-card cdk-tv-focus"
                onClick={() => handleProfileClick(profile)}
              >
                <div
                  className="cdk-tv-avatar-circle"
                  style={{ background: avatar.bgGradient, position: 'relative' }}
                >
                  <img
                    src={getAvatarImageUrl(profile.avatar_url)}
                    alt={profile.name}
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                    onError={event => { (event.target as HTMLImageElement).src = '/avatars/davi.png' }}
                  />
                  {profile.has_pin && (
                    <div style={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      background: 'rgba(0,0,0,0.7)',
                      borderRadius: '50%',
                      padding: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Lock size={16} color="#fbbf24" />
                    </div>
                  )}
                </div>
                <span className="cdk-tv-profile-name">{profile.name}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* PIN Modal com Teclado Virtual para Controle Remoto */}
      {pinModalProfile && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 6, 9, 0.92)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#12141d',
            border: '2px solid #282c3f',
            borderRadius: 28,
            padding: '40px 50px',
            textAlign: 'center',
            maxWidth: 440,
            width: '100%',
            boxShadow: '0 30px 80px rgba(0,0,0,0.9)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: -10 }}>
              <button
                data-tv-focus
                onClick={() => setPinModalProfile(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: 8
                }}
              >
                <X size={28} />
              </button>
            </div>

            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'rgba(251, 191, 36, 0.15)',
              color: '#fbbf24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <Lock size={28} />
            </div>

            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Digite seu PIN</h2>
            <p style={{ color: '#94a3b8', fontSize: 16, marginBottom: 24 }}>
              Perfil de <strong>{pinModalProfile.name}</strong> protegido
            </p>

            {/* Marcadores do PIN ○ ○ ○ ○ */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 20,
              marginBottom: 30
            }}>
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: pinInput.length > i
                      ? (pinError ? '#ef4444' : '#22c55e')
                      : 'transparent',
                    border: `3px solid ${pinError ? '#ef4444' : '#475569'}`,
                    transition: 'all 0.2s ease',
                    boxShadow: pinInput.length > i ? '0 0 14px rgba(34, 197, 94, 0.8)' : 'none'
                  }}
                />
              ))}
            </div>

            {pinError && (
              <p style={{ color: '#ef4444', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>
                {pinLockMessage || 'PIN incorreto. Tente novamente.'}
              </p>
            )}

            {/* Teclado Numérico Virtual para Controle Remoto */}
            <div className="cdk-tv-numpad">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                <button
                  key={num}
                  data-tv-focus
                  className="cdk-tv-num-btn cdk-tv-focus"
                  onClick={() => handlePinNumClick(num)}
                >
                  {num}
                </button>
              ))}
              <button
                data-tv-focus
                className="cdk-tv-num-btn cdk-tv-focus"
                onClick={handlePinBackspace}
                style={{ fontSize: 18, color: '#f87171' }}
              >
                ⌫
              </button>
              <button
                data-tv-focus
                className="cdk-tv-num-btn cdk-tv-focus"
                onClick={() => handlePinNumClick('0')}
              >
                0
              </button>
              <button
                data-tv-focus
                className="cdk-tv-num-btn cdk-tv-focus"
                onClick={() => setPinModalProfile(null)}
                style={{ fontSize: 16, color: '#94a3b8' }}
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Botão Sair da TV */}
      <button
        data-tv-focus
        onClick={() => navigate('/tv/login')}
        style={{
          background: 'none',
          border: '1px solid #334155',
          borderRadius: 12,
          padding: '12px 24px',
          color: '#94a3b8',
          fontSize: 16,
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginTop: 20
        }}
      >
        <ArrowLeft size={18} /> Sair desta TV / Trocar Conta
      </button>
    </div>
  )
}
