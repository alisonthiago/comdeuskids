import React, { useState, useEffect } from 'react'
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react'
import { APP_URLS } from '../lib/env'

interface ChildModeProtectionProps {
  children: React.ReactNode
}

export function ChildModeProtection({ children }: ChildModeProtectionProps) {
  const [isBlocked, setIsBlocked] = useState(false)
  const [activeChildName, setActiveChildName] = useState<string | null>(null)

  useEffect(() => {
    // Verifica se há perfil infantil ativo vindo do Play
    try {
      const storedProfile = localStorage.getItem('cdk_active_profile')
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile)
        if (parsed.is_child || parsed.role === 'child' || parsed.birth_date) {
          setIsBlocked(true)
          setActiveChildName(parsed.name || 'Criança')
        }
      }
    } catch {
      // Ignora erro de parsing
    }
  }, [])

  if (isBlocked) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0b0c10',
        color: '#fff',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        padding: '24px'
      }}>
        <div style={{
          maxWidth: '460px',
          width: '100%',
          background: '#13141c',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '36px 30px',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.12)',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <Lock size={32} />
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '10px' }}>
            Área Exclusiva para Adultos
          </h2>

          <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '24px' }}>
            O perfil infantil {activeChildName ? <strong>"{activeChildName}"</strong> : ''} está protegido pelos Controles Parentais. Para acessar a Área de Membros, acesse como responsável.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => {
                localStorage.removeItem('cdk_active_profile')
                setIsBlocked(false)
              }}
              style={{
                width: '100%',
                padding: '12px 18px',
                borderRadius: '8px',
                background: '#7c3aed',
                color: '#fff',
                border: 'none',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              Sou o Responsável (Desbloquear)
            </button>

            <a
              href={APP_URLS.play}
              style={{
                width: '100%',
                padding: '12px 18px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.06)',
                color: '#cbd5e1',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                border: '1px solid rgba(255,255,255,0.08)'
              }}
            >
              <ArrowLeft size={16} /> Voltar para o Play
            </a>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
