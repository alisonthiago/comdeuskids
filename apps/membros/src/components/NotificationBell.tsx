import React, { useState, useEffect } from 'react'
import { supabase } from '@comdeuskids/supabase'
import { Bell, Check, Clock, ExternalLink, X } from 'lucide-react'

interface InAppNotification {
  id: string
  title: string
  summary: string
  content: string | null
  category: string
  context_type: string
  action_url: string | null
  is_read: boolean
  created_at: string
}

export function NotificationBell({ userId }: { userId?: string }) {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<InAppNotification[]>([])
  const [loading, setLoading] = useState(false)

  const fetchNotifications = async () => {
    if (!userId) return
    setLoading(true)
    try {
      const { data } = await supabase
        .from('notifications_in_app')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)

      if (data) setNotifications(data)
    } catch (err) {
      console.error('Erro ao buscar notificações in-app:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [userId])

  const unreadCount = notifications.filter(n => !n.is_read).length

  const markAsRead = async (id: string) => {
    try {
      await supabase
        .from('notifications_in_app')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', id)

      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      )
    } catch (err) {
      console.error('Erro ao marcar notificação como lida:', err)
    }
  }

  const markAllAsRead = async () => {
    if (!userId) return
    try {
      await supabase
        .from('notifications_in_app')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('is_read', false)

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch (err) {
      console.error('Erro ao marcar todas como lidas:', err)
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => {
          setOpen(!open)
          if (!open) fetchNotifications()
        }}
        title="Notificações"
        style={{
          background: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '8px',
          color: '#cbd5e1',
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative'
        }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              background: '#ef4444',
              color: '#fff',
              fontSize: 10,
              fontWeight: 800,
              width: 18,
              height: 18,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #0f172a'
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 46,
            right: 0,
            width: 340,
            maxHeight: 460,
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 12,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header do painel */}
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid #334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#0f172a'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Bell size={16} color="#a855f7" />
              <strong style={{ fontSize: 13, color: '#f8fafc' }}>Central de Notificações</strong>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#a855f7',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Marcar lidas
              </button>
            )}
          </div>

          {/* Lista de Notificações */}
          <div style={{ overflowY: 'auto', flex: 1, padding: '8px' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: '#64748b' }}>
                <Clock size={28} style={{ marginBottom: 6, opacity: 0.5 }} />
                <p style={{ margin: 0, fontSize: 13 }}>Nenhuma notificação por enquanto.</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 8,
                    marginBottom: 6,
                    background: n.is_read ? 'transparent' : 'rgba(168, 85, 247, 0.08)',
                    border: n.is_read ? '1px solid transparent' : '1px solid rgba(168, 85, 247, 0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '1px 6px',
                        borderRadius: 4,
                        background: '#334155',
                        color: '#cbd5e1'
                      }}
                    >
                      {n.context_type}
                    </span>
                    <span style={{ fontSize: 10, color: '#64748b' }}>
                      {new Date(n.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <strong style={{ fontSize: 13, color: '#f8fafc' }}>{n.title}</strong>
                  <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>{n.summary}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                    {n.action_url ? (
                      <a
                        href={n.action_url}
                        style={{
                          fontSize: 11,
                          color: '#a855f7',
                          fontWeight: 600,
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        Abrir <ExternalLink size={10} />
                      </a>
                    ) : <span />}

                    {!n.is_read && (
                      <button
                        onClick={() => markAsRead(n.id)}
                        title="Marcar como lida"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#64748b',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          fontSize: 11
                        }}
                      >
                        <Check size={12} /> Lida
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
