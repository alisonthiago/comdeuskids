import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Tv, CheckCircle2, AlertCircle, ShieldCheck, ArrowLeft } from 'lucide-react'
import { supabase } from '@comdeuskids/supabase'
import { tvPairingService } from '../../lib/tvPairing'

export default function TVAuthApprove() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const urlCode = searchParams.get('code') || ''
  const [code, setCode] = useState(urlCode.toUpperCase())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setAuthenticated(!!data?.user)
    })
  }, [])

  const handleConnect = async () => {
    if (!authenticated) {
      setError('Entre na sua conta Com Deus Kids antes de conectar uma TV.')
      return
    }
    if (!code || code.trim().length < 4) {
      setError('Por favor, informe o código exibido na sua TV (ex: CDK-8472)')
      return
    }

    setLoading(true)
    setError(null)

    // Formatar código
    let cleanCode = code.trim().toUpperCase()
    if (!cleanCode.startsWith('CDK-') && cleanCode.length === 4) {
      cleanCode = `CDK-${cleanCode}`
    }

    const authorized = await tvPairingService.authorizeSession(cleanCode)

    if (authorized.success) {
      setSuccess(true)
    } else {
      if (authorized.error === 'INVALID_OR_EXPIRED_CODE') {
        setError('Código inválido ou não encontrado. Verifique o código exibido na tela da sua TV.')
      } else if (authorized.error === 'EXPIRED') {
        setError('O código exibido na TV já expirou. Gere um novo código na tela da TV.')
      } else if (authorized.error === 'UNAUTHORIZED') {
        setError('Sessão expirada. Entre novamente na sua conta de responsável.')
      } else {
        setError(authorized.error || 'Não foi possível conectar a TV. Tente novamente.')
      }
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at top, #1a162b 0%, #090a0f 100%)',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: 'var(--cdk-font-body)'
    }}>
      <div style={{
        maxWidth: 460,
        width: '100%',
        background: '#12141c',
        border: '1px solid #232738',
        borderRadius: 24,
        padding: '36px 28px',
        boxShadow: '0 24px 64px rgba(0, 0, 0, 0.6)',
        textAlign: 'center'
      }}>
        {/* Ícone de TV */}
        <div style={{
          width: 72,
          height: 72,
          borderRadius: 20,
          background: 'linear-gradient(135deg, #16a34a, #22c55e)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          boxShadow: '0 12px 30px rgba(34, 197, 94, 0.4)'
        }}>
          <Tv size={36} color="#fff" />
        </div>

        {success ? (
          <div>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <CheckCircle2 size={36} />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>TV Conectada com Sucesso!</h2>
            <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.5, marginBottom: 24 }}>
              A sua Smart TV foi vinculada com segurança à sua conta Com Deus Kids. Olhe para a TV: ela já entrará na seleção de perfis!
            </p>
            <button
              onClick={() => navigate('/inicio')}
              style={{
                width: '100%',
                background: '#22c55e',
                border: 'none',
                color: '#052e16',
                padding: '14px',
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Continuar no Celular
            </button>
          </div>
        ) : (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
              Conectar Smart TV
            </h2>
            <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.5, marginBottom: 24 }}>
              Vincule sua televisão para assistir filmes bíblicos, séries e músicas diretamente no navegador da Smart TV.
            </p>

            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 12,
                padding: '12px 16px',
                color: '#f87171',
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 20,
                textAlign: 'left'
              }}>
                <AlertCircle size={20} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <div style={{ textAlign: 'left', marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Código exibido na TV
              </label>
              <input
                type="text"
                placeholder="Ex: CDK-8472"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={8}
                style={{
                  width: '100%',
                  marginTop: 8,
                  padding: '14px 18px',
                  borderRadius: 12,
                  background: '#0a0b10',
                  border: '2px solid #282c3c',
                  color: '#fff',
                  fontSize: 22,
                  fontFamily: 'monospace',
                  letterSpacing: 3,
                  textAlign: 'center',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Aviso de segurança */}
            <div style={{
              background: 'rgba(139, 92, 246, 0.08)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              borderRadius: 12,
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 13,
              color: '#22c55e',
              marginBottom: 24,
              textAlign: 'left'
            }}>
              <ShieldCheck size={20} color="#22c55e" style={{ flexShrink: 0 }} />
              <span>
                Conexão temporária e segura. Não compartilha sua senha com a Smart TV.
              </span>
            </div>

            <button
              onClick={handleConnect}
              disabled={!authenticated || loading}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                border: 'none',
                color: '#052e16',
                padding: '16px',
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 800,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 8px 24px rgba(34, 197, 94, 0.4)',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Conectando TV...' : 'CONECTAR SMART TV'}
            </button>
          </div>
        )}
      </div>

      {/* Voltar */}
      <button
        onClick={() => navigate('/inicio')}
        style={{
          background: 'none',
          border: 'none',
          color: '#64748b',
          fontSize: 14,
          marginTop: 20,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}
      >
        <ArrowLeft size={16} /> Voltar para o Com Deus Kids
      </button>
    </div>
  )
}
