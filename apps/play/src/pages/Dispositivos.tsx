import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Tv, Smartphone, Monitor, Tablet, LogOut,
  CheckCircle2, ChevronLeft, ShieldCheck, Plus, Clock
} from 'lucide-react'

import { supabase } from '@comdeuskids/supabase'

interface Device {
  id: string
  name: string
  type: 'tv' | 'mobile' | 'tablet' | 'browser'
  lastActive: string
  location: string
  isCurrent: boolean
}

export default function Dispositivos() {
  const navigate = useNavigate()
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [devices, setDevices] = useState<Device[]>([
    {
      id: 'current-session',
      name: 'Navegador Web Atual',
      type: 'browser',
      lastActive: 'Ativo agora',
      location: 'Sessão Web Segura',
      isCurrent: true
    }
  ])

  useEffect(() => {
    async function loadDevices() {
      setLoading(true)
      const currentDev: Device = {
        id: 'current-session',
        name: navigator.userAgent.includes('Macintosh') ? 'Navegador no macOS' : 'Navegador Web',
        type: 'browser',
        lastActive: 'Ativo agora',
        location: 'Sessão Web Segura',
        isCurrent: true
      }

      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setDevices([currentDev])
          setLoading(false)
          return
        }

        const { data: tvs, error } = await supabase
          .from('tv_pairing_sessions')
          .select('id, device_name, status, last_seen_at, created_at')
          .eq('user_id', user.id)
          .eq('status', 'authorized')
          .order('last_seen_at', { ascending: false })

        if (!error && tvs && tvs.length > 0) {
          const tvDevices: Device[] = tvs.map(tv => ({
            id: tv.id,
            name: tv.device_name || 'Smart TV',
            type: 'tv',
            lastActive: tv.last_seen_at ? new Date(tv.last_seen_at).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Recentemente',
            location: 'Smart TV Pareada',
            isCurrent: false
          }))
          setDevices([currentDev, ...tvDevices])
        } else {
          setDevices([currentDev])
        }
      } catch {
        setDevices([currentDev])
      } finally {
        setLoading(false)
      }
    }

    loadDevices()
  }, [])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleDisconnect = async (id: string, name: string) => {
    if (confirm(`Deseja desconectar ${name}?`)) {
      try {
        await supabase
          .from('tv_pairing_sessions')
          .update({ status: 'revoked' })
          .eq('id', id)
      } catch (e) {
        console.warn('Erro ao revogar sessão da TV:', e)
      }
      setDevices(prev => prev.filter(d => d.id !== id))
      showToast(`${name} foi desconectado com sucesso.`)
    }
  }

  const handleDisconnectAll = async () => {
    if (confirm('Deseja desconectar todos os outros dispositivos exceto este?')) {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase
            .from('tv_pairing_sessions')
            .update({ status: 'revoked' })
            .eq('user_id', user.id)
            .eq('status', 'authorized')
        }
      } catch (e) {
        console.warn('Erro ao revogar sessões:', e)
      }
      setDevices(prev => prev.filter(d => d.isCurrent))
      showToast('Todos os outros dispositivos foram desconectados.')
    }
  }

  return (
    <div style={{
      maxWidth: 1200,
      margin: '0 auto',
      padding: '144px 16px 112px',
      fontFamily: 'var(--cdk-font-family, "Baloo 2", sans-serif)'
    }}>

      {/* Toast flutuante */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          backgroundColor: '#201f21',
          color: '#ffffff',
          border: '1px solid #22c55e',
          borderRadius: 14,
          padding: '12px 20px',
          fontSize: 14,
          fontWeight: 700,
          boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <CheckCircle2 size={18} color="#7bd0ff" />
          {toastMessage}
        </div>
      )}

      {/* Voltar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button
          type="button"
          onClick={() => navigate('/conta')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid #2a2a2c',
            borderRadius: 12,
            padding: '8px 14px',
            color: '#cbc3d7',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <ChevronLeft size={16} />
          Voltar para Conta
        </button>
        <span style={{ fontSize: 13, color: '#958ea0' }}>•</span>
        <span style={{ fontSize: 13, color: '#22c55e', fontWeight: 700 }}>Aparelhos Conectados</span>
      </div>

      {/* Header */}
      <section style={{
        position: 'relative',
        backgroundColor: '#1c1b1d',
        borderRadius: 24,
        padding: '28px 24px',
        border: '1px solid #2a2a2c',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.45)',
        marginBottom: 28,
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 200,
          height: 200,
          borderRadius: '50%',
          backgroundColor: 'rgba(123, 208, 255, 0.12)',
          filter: 'blur(50px)',
          pointerEvents: 'none'
        }} />

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
          position: 'relative',
          zIndex: 2
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Tv size={18} color="#7bd0ff" />
              <span style={{ fontSize: 12, fontWeight: 800, color: '#7bd0ff', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Smart TVs, Tablets e Navegadores
              </span>
            </div>
            <h1 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 800, color: '#ffffff', margin: '0 0 6px' }}>
              Dispositivos Conectados
            </h1>
            <p style={{ fontSize: 14, color: '#cbc3d7', margin: 0 }}>
              Você possui <strong>{devices.length}</strong> aparelhos autorizados com acesso à sua conta.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Link
              to="/tv/conectar"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                backgroundColor: '#22c55e',
                color: '#052e16',
                borderRadius: 14,
                padding: '12px 22px',
                fontSize: 14,
                fontWeight: 800,
                textDecoration: 'none',
                boxShadow: '0 8px 24px rgba(34, 197, 94, 0.35)'
              }}
            >
              <Plus size={16} />
              Conectar Nova Smart TV
            </Link>
          </div>
        </div>
      </section>

      {/* Lista de Aparelhos */}
      <div style={{
        backgroundColor: '#1c1b1d',
        borderRadius: 20,
        border: '1px solid #2a2a2c',
        overflow: 'hidden'
      }}>
        {devices.map((dev, idx) => {
          const getIcon = () => {
            if (dev.type === 'tv') return <Tv size={22} color="#ffb95f" />
            if (dev.type === 'tablet') return <Tablet size={22} color="#7bd0ff" />
            if (dev.type === 'mobile') return <Smartphone size={22} color="#22c55e" />
            return <Monitor size={22} color="#22c55e" />
          }

          return (
            <div
              key={dev.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 24px',
                borderBottom: idx === devices.length - 1 ? 'none' : '1px solid #2a2a2c',
                flexWrap: 'wrap',
                gap: 16
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 50,
                  height: 50,
                  borderRadius: 14,
                  backgroundColor: '#201f21',
                  border: '1px solid #2a2a2c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {getIcon()}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: '#ffffff' }}>
                      {dev.name}
                    </span>
                    {dev.isCurrent && (
                      <span style={{
                        backgroundColor: 'rgba(0, 155, 209, 0.15)',
                        color: '#7bd0ff',
                        fontSize: 11,
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: 10
                      }}>
                        Este aparelho
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: '#958ea0', marginTop: 4 }}>
                    {dev.location} • <span style={{ color: dev.isCurrent ? '#7bd0ff' : '#cbc3d7' }}>{dev.lastActive}</span>
                  </div>
                </div>
              </div>

              {!dev.isCurrent ? (
                <button
                  type="button"
                  onClick={() => handleDisconnect(dev.id, dev.name)}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid #2a2a2c',
                    color: '#ffb4ab',
                    borderRadius: 10,
                    padding: '8px 16px',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <LogOut size={14} />
                  Desconectar
                </button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#7bd0ff', fontSize: 13, fontWeight: 700 }}>
                  <ShieldCheck size={16} />
                  Sessão Segura
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Botão Desconectar Todos */}
      {devices.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
          <button
            type="button"
            onClick={handleDisconnectAll}
            style={{
              backgroundColor: '#201f21',
              border: '1px solid #93000a',
              color: '#ffb4ab',
              borderRadius: 12,
              padding: '10px 20px',
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Desconectar todos os outros aparelhos
          </button>
        </div>
      )}
    </div>
  )
}
