import React from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useEnvironment, EnvironmentType } from '../context/EnvironmentContext'
import { ShieldAlert, ArrowLeft } from 'lucide-react'

interface ContextGuardProps {
  requiredContext: EnvironmentType
  children: React.ReactNode
}

export default function ContextGuard({ requiredContext, children }: ContextGuardProps) {
  const { hasAccessToContext, loading } = useEnvironment()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const targetOrgId = searchParams.get('org')

  if (loading) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#22c55e',
          fontSize: 14,
          fontWeight: 600
        }}
      >
        Validando permissões de ambiente...
      </div>
    )
  }

  const isAuthorized = hasAccessToContext(requiredContext, targetOrgId)

  if (!isAuthorized) {
    const contextLabels: Record<EnvironmentType, string> = {
      play: 'Play',
      family: 'Minha Família',
      teacher: 'Área do Professor',
      church: 'Minha Igreja',
      school: 'Minha Escola'
    }

    return (
      <div
        style={{
          maxWidth: 540,
          margin: '100px auto',
          padding: '36px 30px',
          backgroundColor: '#1c1b1d',
          borderRadius: 20,
          border: '1px solid #353437',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 80, 80, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            color: '#ff6b6b'
          }}
        >
          <ShieldAlert size={28} />
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#ffffff', marginBottom: 10 }}>
          Acesso Restrito
        </h2>

        <p style={{ fontSize: 14, color: '#cbc3d7', lineHeight: 1.6, marginBottom: 24 }}>
          Sua conta não possui autorização ou vínculo ativo com o ambiente institucional de{' '}
          <strong>{contextLabels[requiredContext] || requiredContext}</strong>.
          {targetOrgId && (
            <span style={{ display: 'block', fontSize: 12, color: '#8e8a93', marginTop: 6 }}>
              ID solicitado: <code>{targetOrgId}</code>
            </span>
          )}
        </p>

        <button
          type="button"
          onClick={() => navigate('/inicio')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            borderRadius: 9999,
            backgroundColor: '#ffffff',
            color: '#0e0e10',
            fontWeight: 700,
            fontSize: 14,
            border: 'none',
            cursor: 'pointer',
            transition: 'opacity 0.2s'
          }}
        >
          <ArrowLeft size={16} />
          Voltar para o Play
        </button>
      </div>
    )
  }

  return <>{children}</>
}
