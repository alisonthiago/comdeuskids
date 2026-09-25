import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Bell, CheckCircle2, Film, BookOpen, Download,
  Sparkles, Trash2, ChevronLeft, ArrowRight, MessageSquare
} from 'lucide-react'

interface NotificationItem {
  id: string
  title: string
  message: string
  category: 'episodios' | 'licoes' | 'pdfs' | 'mensagens'
  categoryLabel: string
  timestamp: string
  read: boolean
  actionUrl: string
  actionLabel: string
  icon: 'film' | 'book' | 'download' | 'message'
}

export default function Notificacoes() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<'all' | 'episodios' | 'licoes' | 'pdfs' | 'mensagens'>('all')

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'Novo Episódio Disponível: A Arca de Noé — Episódio 4',
      message: 'A jornada continua! As águas começam a baixar e o arco-íris da promessa se revela no céu.',
      category: 'episodios',
      categoryLabel: 'Novos Lançamentos',
      timestamp: 'Há 2 horas',
      read: false,
      actionUrl: '/serie/a-arca-de-noe',
      actionLabel: 'Assistir Agora',
      icon: 'film'
    },
    {
      id: '2',
      title: 'Lição da Semana Atribuída: O Menino Davi',
      message: 'A Tia Débora atribuiu uma nova lição com versículo para memorização até domingo.',
      category: 'licoes',
      categoryLabel: 'Turma & EBD',
      timestamp: 'Ontem às 15:40',
      read: false,
      actionUrl: '/turmas/jardim-da-fe',
      actionLabel: 'Ver Lição',
      icon: 'book'
    },
    {
      id: '3',
      title: 'Novo Material em PDF: Kit de Colorir dos Discípulos',
      message: '12 páginas ilustradas para imprimir com atividades lúdicas e labirintos bíblicos.',
      category: 'pdfs',
      categoryLabel: 'Materiais em PDF',
      timestamp: 'Há 2 dias',
      read: true,
      actionUrl: '/materiais-em-pdf',
      actionLabel: 'Baixar PDF',
      icon: 'download'
    },
    {
      id: '4',
      title: 'Mensagem da Coordenação da Escola',
      message: 'Lembramos que nesta sexta-feira teremos o encerramento do módulo sobre os Frutos do Espírito.',
      category: 'mensagens',
      categoryLabel: 'Comunicado',
      timestamp: 'Há 3 dias',
      read: true,
      actionUrl: '/minha-escola',
      actionLabel: 'Acessar Escola',
      icon: 'message'
    }
  ])

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const filteredList = notifications.filter(n => filter === 'all' || n.category === filter)
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div style={{
      maxWidth: 900,
      margin: '0 auto',
      padding: '24px 16px 80px',
      fontFamily: "'Baloo 2', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      {/* Botão Voltar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
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
          Voltar
        </button>
        <span style={{ fontSize: 13, color: '#958ea0' }}>•</span>
        <span style={{ fontSize: 13, color: '#22c55e', fontWeight: 700 }}>Central de Notificações</span>
      </div>

      {/* Header com Ações */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        marginBottom: 24
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: 'rgba(34, 197, 94, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#22c55e'
          }}>
            <Bell size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Notificações
            </h1>
            <div style={{ fontSize: 13, color: '#958ea0', marginTop: 2 }}>
              {unreadCount > 0 ? `${unreadCount} não lidas` : 'Tudo em dia'}
            </div>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: '#201f21',
              color: '#22c55e',
              border: '1px solid #2a2a2c',
              borderRadius: 12,
              padding: '10px 18px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <CheckCircle2 size={16} />
            Marcar todas como lidas
          </button>
        )}
      </div>

      {/* Chips de Categorias */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        overflowX: 'auto',
        paddingBottom: 8,
        marginBottom: 20
      }}>
        {[
          { id: 'all', label: 'Todas' },
          { id: 'episodios', label: 'Episódios & Séries' },
          { id: 'licoes', label: 'Lições & EBD' },
          { id: 'pdfs', label: 'Materiais em PDF' },
          { id: 'mensagens', label: 'Comunicados' }
        ].map(cat => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setFilter(cat.id as any)}
            style={{
              background: filter === cat.id ? '#22c55e' : '#1c1b1d',
              color: filter === cat.id ? '#052e16' : '#cbc3d7',
              border: `1px solid ${filter === cat.id ? '#22c55e' : '#2a2a2c'}`,
              borderRadius: 20,
              padding: '7px 16px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease'
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Lista de Notificações */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filteredList.length === 0 ? (
          <div style={{
            backgroundColor: '#1c1b1d',
            borderRadius: 20,
            padding: '48px 24px',
            textAlign: 'center',
            color: '#958ea0',
            border: '1px solid #2a2a2c'
          }}>
            Nenhuma notificação encontrada nesta categoria.
          </div>
        ) : (
          filteredList.map(item => {
            const getIcon = () => {
              if (item.icon === 'film') return <Film size={20} color="#7bd0ff" />
              if (item.icon === 'book') return <BookOpen size={20} color="#ffb95f" />
              if (item.icon === 'download') return <Download size={20} color="#22c55e" />
              return <MessageSquare size={20} color="#009bd1" />
            }

            return (
              <div
                key={item.id}
                style={{
                  backgroundColor: item.read ? '#1c1b1d' : 'rgba(34, 197, 94, 0.08)',
                  borderRadius: 18,
                  padding: '20px 22px',
                  border: `1px solid ${item.read ? '#2a2a2c' : '#22c55e'}`,
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 16,
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flex: 1 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: '#201f21',
                    border: '1px solid #2a2a2c',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {getIcon()}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: '#22c55e',
                        backgroundColor: 'rgba(34, 197, 94, 0.15)',
                        padding: '2px 8px',
                        borderRadius: 10
                      }}>
                        {item.categoryLabel}
                      </span>
                      <span style={{ fontSize: 12, color: '#958ea0' }}>• {item.timestamp}</span>
                      {!item.read && (
                        <span style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: '#ffb95f'
                        }} />
                      )}
                    </div>

                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', margin: '0 0 6px' }}>
                      {item.title}
                    </h3>
                    <p style={{ fontSize: 13, color: '#cbc3d7', margin: '0 0 14px', lineHeight: 1.5 }}>
                      {item.message}
                    </p>

                    <Link
                      to={item.actionUrl}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        backgroundColor: '#201f21',
                        color: '#22c55e',
                        border: '1px solid #2a2a2c',
                        borderRadius: 10,
                        padding: '6px 14px',
                        fontSize: 12,
                        fontWeight: 800,
                        textDecoration: 'none'
                      }}
                    >
                      {item.actionLabel}
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => clearNotification(item.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#958ea0',
                    cursor: 'pointer',
                    padding: 6,
                    borderRadius: 8
                  }}
                  title="Remover Notificação"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
