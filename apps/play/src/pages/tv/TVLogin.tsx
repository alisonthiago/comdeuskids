import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tv, Smartphone, RefreshCw, LogIn, CheckCircle2 } from 'lucide-react'
import { tvPairingService, TVPairingSession } from '../../lib/tvPairing'
import { useTVNavigation } from '../../hooks/useTVNavigation'
import { tvDeviceTokenStorage } from '../../context/TVSessionContext'
import { supabase } from '@comdeuskids/supabase'

export default function TVLogin() {
  const navigate = useNavigate()
  useTVNavigation()

  const [session, setSession] = useState<TVPairingSession | null>(null)
  const [timeLeft, setTimeLeft] = useState<number>(600)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const pollIntervalRef = useRef<any>(null)

  const [migrationNeeded, setMigrationNeeded] = useState(false)
  const [initError, setInitError] = useState<string | null>(null)

  // Iniciar sessão de emparelhamento
  const initSession = async () => {
    setInitError(null)
    setMigrationNeeded(false)
    const result = await tvPairingService.createSession('Smart TV')
    if (result.needsMigration) {
      setMigrationNeeded(true)
      setInitError('É necessário aplicar a migration 20260924000015_secure_tv_streaming.sql no Supabase SQL Editor.')
      return
    }
    if (!result.session) {
      setInitError(result.error || 'Falha ao conectar ao servidor CDK.')
      return
    }
    const newSession = result.session
    tvDeviceTokenStorage.save(newSession.device_token)
    setSession(newSession)
    setTimeLeft(Math.max(0, Math.floor((new Date(newSession.expires_at).getTime() - Date.now()) / 1000)))
    setIsAuthorized(false)
  }

  useEffect(() => {
    initSession()
  }, [])

  // Polling para detectar autorização da TV pelo celular
  useEffect(() => {
    if (!session || isAuthorized) return

    pollIntervalRef.current = setInterval(() => {
      ;(async () => {
        const { data } = await supabase.rpc('get_tv_pairing_status', { p_device_token: session.device_token })
        const status = data?.status
        if (status === 'authorized') {
          setIsAuthorized(true)
          clearInterval(pollIntervalRef.current)
          setTimeout(() => {
            navigate('/tv/perfis')
          }, 1500)
        } else if (status === 'expired') {
          setSession(previous => previous ? { ...previous, status: 'expired' } : previous)
          clearInterval(pollIntervalRef.current)
        } else {
          const remaining = Math.max(0, Math.floor((new Date(session.expires_at).getTime() - Date.now()) / 1000))
          setTimeLeft(remaining)
        }
      })()
    }, 1500)

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    }
  }, [session, isAuthorized, navigate])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  // URL para onde o QR Code aponta
  const connectUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/tv/conectar?code=${session?.code || ''}`
    : `https://app.comdeuskids.com.br/tv/conectar`

  return (
    <div className="cdk-tv-body cdk-tv-login-screen">
      {/* Header com Marca */}
      <div className="cdk-tv-login-header">
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          background: 'linear-gradient(135deg, #16a34a, #22c55e)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(34, 197, 94, 0.4)'
        }}>
          <Tv size={28} color="#fff" />
        </div>
        <span className="cdk-tv-logo-badge">COM DEUS KIDS TV</span>
      </div>

      <div className="cdk-tv-login-grid">
        {/* Lado Esquerdo: QR Code */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <div className="cdk-tv-qr-box" style={{ background: '#ffffff', padding: 16, borderRadius: 20, boxShadow: '0 12px 36px rgba(0,0,0,0.5)' }}>
            {isAuthorized ? (
              <div style={{ textAlign: 'center', color: '#10b981', padding: 24 }}>
                <CheckCircle2 size={96} style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: 24, fontWeight: 800 }}>Conectado!</h3>
                <p style={{ color: '#64748b', fontSize: 14 }}>Entrando na conta...</p>
              </div>
            ) : migrationNeeded ? (
              <div style={{ textAlign: 'center', color: '#f59e0b', maxWidth: 220, padding: 12 }}>
                <RefreshCw size={44} style={{ margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>Banco de Dados</h4>
                <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>
                  Execute a migration <code>20260924000015_secure_tv_streaming.sql</code> no Supabase.
                </p>
                <button
                  data-tv-focus
                  onClick={initSession}
                  style={{
                    marginTop: 10,
                    padding: '6px 14px',
                    borderRadius: 8,
                    background: '#22c55e',
                    border: 'none',
                    color: '#052e16',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: 12
                  }}
                >
                  Tentar Novamente
                </button>
              </div>
            ) : session?.code ? (
              /* QR Code Dinâmico Real Escaneável por Celulares */
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(connectUrl)}&bgcolor=ffffff&color=090a0f&margin=1`}
                  alt={`QR Code para pareamento: ${session.code}`}
                  width={200}
                  height={200}
                  style={{ display: 'block', borderRadius: 8 }}
                />
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#64748b', padding: '40px 20px' }}>
                <RefreshCw size={40} className="cdk-tv-spin" style={{ margin: '0 auto 12px', color: '#22c55e' }} />
                <p style={{ fontSize: 14, fontWeight: 600 }}>Gerando código...</p>
              </div>
            )}
          </div>
          <span style={{ fontSize: 16, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Smartphone size={18} color="#22c55e" />
            No celular, abra comdeuskids.com.br/tv e informe o código
          </span>
        </div>


        {/* Lado Direito: Instruções e Código Temporário */}
        <div className="cdk-tv-login-info">
          <h1 className="cdk-tv-login-title">
            Entre na sua conta<br />Com Deus Kids
          </h1>

          <p className="cdk-tv-login-subtitle">
            1. Abra o navegador no seu celular ou computador<br />
            2. Acesse: <strong style={{ color: '#fff' }}>comdeuskids.com.br/tv</strong><br />
            3. Digite o código temporário abaixo:
          </p>

          <div className="cdk-tv-code-card">
            <span className="cdk-tv-code-label">Código de Ativação da TV</span>
            <span className="cdk-tv-code-display">{session?.code || 'CDK-....'}</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
              <div className="cdk-tv-status-badge">
                <span style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: isAuthorized ? '#10b981' : session?.status === 'expired' ? '#ef4444' : '#38bdf8',
                  boxShadow: '0 0 10px currentColor'
                }} />
                {isAuthorized
                  ? 'TV Conectada com sucesso!'
                  : session?.status === 'expired'
                  ? 'Código expirado'
                  : `Aguardando conexão... (${formatTime(timeLeft)})`}
              </div>

              {session?.status === 'expired' && (
                <button
                  data-tv-focus
                  className="cdk-tv-btn"
                  onClick={initSession}
                  style={{
                    background: '#22c55e',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 16px',
                    color: '#052e16',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <RefreshCw size={16} /> Gerar Novo Código
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            <button
              data-tv-focus
              className="cdk-tv-btn-email cdk-tv-focus"
              onClick={() => navigate('/login')}
            >
              <LogIn size={20} style={{ marginRight: 10, verticalAlign: 'middle' }} />
              Entrar com e-mail e senha
            </button>

            <button
              data-tv-focus
              className="cdk-tv-btn cdk-tv-focus"
              onClick={() => {
                localStorage.setItem('cdk_tv_demo_mode', 'true')
                navigate('/tv/perfis')
              }}
              style={{
                background: 'rgba(34, 197, 94, 0.15)',
                border: '2px solid #22c55e',
                color: '#22c55e',
                fontSize: 16,
                fontWeight: 700,
                padding: '14px 24px',
                borderRadius: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              🎮 Testar Controle Remoto na TV
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
