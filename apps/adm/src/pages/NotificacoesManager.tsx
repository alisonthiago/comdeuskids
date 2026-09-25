import React, { useState, useEffect } from 'react'
import { supabase } from '@comdeuskids/supabase'
import {
  Bell,
  Mail,
  MessageSquare,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Server,
  FileText,
  Sliders,
  Play
} from 'lucide-react'

interface DeliveryItem {
  id: string
  event_name: string
  template_key: string
  recipient_address: string
  recipient_name: string | null
  channel: 'email' | 'whatsapp' | 'in_app' | 'sms'
  category: 'transactional' | 'marketing'
  provider: string
  status: 'QUEUED' | 'PROCESSING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'BOUNCED' | 'CANCELED' | 'PENDING_CONFIGURATION'
  attempt_count: number
  max_attempts: number
  created_at: string
  next_attempt_at: string
  last_error: string | null
}

interface TemplateItem {
  id: string
  key: string
  name: string
  channel: string
  category: string
  subject: string | null
  content: string
  version: number
  status: string
}

interface ProviderItem {
  id: string
  provider_name: string
  channel: string
  is_enabled: boolean
  is_configured: boolean
  status: string
  environment: string
  last_tested_at: string | null
}

interface AutomationItem {
  id: string
  name: string
  trigger_event: string
  delay_seconds: number
  template_key: string
  channel: string
  is_active: boolean
}

export default function NotificacoesManager() {
  const [activeTab, setActiveTab] = useState<'deliveries' | 'templates' | 'providers' | 'automations'>('deliveries')
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>([])
  const [templates, setTemplates] = useState<TemplateItem[]>([])
  const [providers, setProviders] = useState<ProviderItem[]>([])
  const [automations, setAutomations] = useState<AutomationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [retryingId, setRetryingId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      // Carrega provedores (metadados apenas, sem secrets)
      const { data: provData } = await supabase
        .from('notification_providers')
        .select('*')
        .order('provider_name')
      if (provData) setProviders(provData)

      // Carrega templates
      const { data: tplData } = await supabase
        .from('notification_templates')
        .select('*')
        .order('name')
      if (tplData) setTemplates(tplData)

      // Carrega automações
      const { data: autoData } = await supabase
        .from('notification_automations')
        .select('*')
        .order('name')
      if (autoData) setAutomations(autoData)

      // Carrega histórico de entregas
      const { data: delData } = await supabase
        .from('notification_deliveries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      if (delData) setDeliveries(delData)
    } catch (err) {
      console.error('Erro ao carregar dados do Notification Engine:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleRetry = async (deliveryId: string) => {
    setRetryingId(deliveryId)
    setFeedback(null)
    try {
      const { data, error } = await supabase.rpc('retry_notification_delivery', {
        p_delivery_id: deliveryId
      })
      if (error) {
        setFeedback(`Erro ao reprocessar: ${error.message}`)
      } else if (data?.success) {
        setFeedback(`Tentativa agendada com sucesso com backoff exponencial!`)
        await loadData()
      } else {
        setFeedback(`Não foi possível reprocessar: ${data?.message || 'Limite atingido'}`)
      }
    } catch (err: any) {
      setFeedback(`Falha: ${err.message}`)
    } finally {
      setRetryingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
      case 'ACTIVE':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: '#dcfce7', color: '#15803d' }}>
            <CheckCircle2 size={12} /> {status}
          </span>
        )
      case 'SENT':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: '#e0e7ff', color: '#4338ca' }}>
            <Send size={12} /> {status}
          </span>
        )
      case 'PENDING_CONFIGURATION':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: '#fef3c7', color: '#b45309' }}>
            <Clock size={12} /> PENDENTE CONFIGURAÇÃO
          </span>
        )
      case 'FAILED':
      case 'BOUNCED':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: '#fee2e2', color: '#b91c1c' }}>
            <AlertTriangle size={12} /> {status}
          </span>
        )
      default:
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: '#f1f5f9', color: '#475569' }}>
            <Clock size={12} /> {status}
          </span>
        )
    }
  }

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1200, margin: '0 auto', fontFamily: 'inherit' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e1b4b', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Bell size={26} color="#7c3aed" /> Central de Comunicação & Notificações
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: '6px 0 0' }}>
            Notification Engine unificado: Gestão de templates, status de provedores, automações e histórico de entregas.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 8,
            border: '1px solid #cbd5e1',
            background: '#fff',
            color: '#334155',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Atualizar
        </button>
      </div>

      {feedback && (
        <div style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', fontSize: 13, fontWeight: 500 }}>
          {feedback}
        </div>
      )}

      {/* Navegação de Abas */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #e2e8f0', marginBottom: 24 }}>
        <button
          onClick={() => setActiveTab('deliveries')}
          style={{
            padding: '10px 18px',
            border: 'none',
            borderBottom: activeTab === 'deliveries' ? '2px solid #7c3aed' : '2px solid transparent',
            background: 'transparent',
            color: activeTab === 'deliveries' ? '#7c3aed' : '#64748b',
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <Send size={16} /> Entregas & Outbox ({deliveries.length})
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          style={{
            padding: '10px 18px',
            border: 'none',
            borderBottom: activeTab === 'templates' ? '2px solid #7c3aed' : '2px solid transparent',
            background: 'transparent',
            color: activeTab === 'templates' ? '#7c3aed' : '#64748b',
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <FileText size={16} /> Templates Canônicos ({templates.length})
        </button>
        <button
          onClick={() => setActiveTab('providers')}
          style={{
            padding: '10px 18px',
            border: 'none',
            borderBottom: activeTab === 'providers' ? '2px solid #7c3aed' : '2px solid transparent',
            background: 'transparent',
            color: activeTab === 'providers' ? '#7c3aed' : '#64748b',
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <Server size={16} /> Provedores & Gateway ({providers.length})
        </button>
        <button
          onClick={() => setActiveTab('automations')}
          style={{
            padding: '10px 18px',
            border: 'none',
            borderBottom: activeTab === 'automations' ? '2px solid #7c3aed' : '2px solid transparent',
            background: 'transparent',
            color: activeTab === 'automations' ? '#7c3aed' : '#64748b',
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <Sliders size={16} /> Automações de Eventos ({automations.length})
        </button>
      </div>

      {/* ABA 1: ENTREGAS & OUTBOX */}
      {activeTab === 'deliveries' && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
          {deliveries.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>
              <Send size={40} style={{ marginBottom: 12 }} />
              <p style={{ margin: 0, fontWeight: 600 }}>Nenhum evento de notificação disparado recentemente.</p>
              <p style={{ margin: '4px 0 0', fontSize: 13 }}>As entregas geradas por Billing, Igreja, Escola ou Afiliados aparecerão aqui.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                  <th style={{ padding: '12px 16px' }}>Data / Hora</th>
                  <th style={{ padding: '12px 16px' }}>Evento</th>
                  <th style={{ padding: '12px 16px' }}>Destinatário</th>
                  <th style={{ padding: '12px 16px' }}>Canal / Provedor</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map(del => (
                  <tr key={del.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', color: '#64748b', fontSize: 12 }}>
                      {new Date(del.created_at).toLocaleString('pt-BR')}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <strong style={{ color: '#1e293b' }}>{del.event_name}</strong>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>tpl: {del.template_key}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#334155' }}>{del.recipient_name || 'Usuário'}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{del.recipient_address}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {del.channel === 'email' && <Mail size={14} color="#3b82f6" />}
                        {del.channel === 'whatsapp' && <MessageSquare size={14} color="#10b981" />}
                        {del.channel === 'in_app' && <Bell size={14} color="#8b5cf6" />}
                        <span style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: 11 }}>{del.channel}</span>
                      </div>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>via {del.provider}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {getStatusBadge(del.status)}
                      {del.attempt_count > 0 && (
                        <span style={{ marginLeft: 6, fontSize: 11, color: '#94a3b8' }}>
                          ({del.attempt_count}/{del.max_attempts})
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      {(del.status === 'FAILED' || del.status === 'PENDING_CONFIGURATION') && (
                        <button
                          onClick={() => handleRetry(del.id)}
                          disabled={retryingId === del.id}
                          style={{
                            padding: '4px 10px',
                            borderRadius: 6,
                            border: '1px solid #cbd5e1',
                            background: '#f8fafc',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          {retryingId === del.id ? 'Processando...' : 'Reenviar'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ABA 2: TEMPLATES */}
      {activeTab === 'templates' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
          {templates.map(tpl => (
            <div key={tpl.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '2px 8px',
                  borderRadius: 6,
                  background: tpl.category === 'marketing' ? '#fef3c7' : '#ede9fe',
                  color: tpl.category === 'marketing' ? '#b45309' : '#6d28d9'
                }}>
                  {tpl.category}
                </span>
                <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>v{tpl.version}</span>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#1e293b' }}>{tpl.name}</h3>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                <strong>Key:</strong> <code>{tpl.key}</code> ({tpl.channel})
              </div>
              {tpl.subject && (
                <div style={{ fontSize: 12, color: '#475569', background: '#f8fafc', padding: '6px 10px', borderRadius: 6 }}>
                  <strong>Assunto:</strong> {tpl.subject}
                </div>
              )}
              <div style={{ fontSize: 12, color: '#334155', background: '#f8fafc', padding: '8px 10px', borderRadius: 6, fontStyle: 'italic', flex: 1 }}>
                "{tpl.content}"
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ABA 3: PROVEDORES */}
      {activeTab === 'providers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <ShieldAlert size={22} color="#2563eb" />
            <div style={{ fontSize: 13, color: '#1e40af' }}>
              <strong>Segurança & Privacidade Rigorosa:</strong> Nenhuma chave de API (Brevo API Key, Evolution API Token) é trafegada para o navegador ou salva no banco de dados. Os segredos residem exclusivamente nas variáveis de ambiente seguras do servidor.
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {providers.map(prov => (
              <div key={prov.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, textTransform: 'capitalize', color: '#1e293b' }}>
                    {prov.provider_name.replace('_', ' ')}
                  </h3>
                  {getStatusBadge(prov.status)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: '#64748b' }}>
                  <div><strong>Canal:</strong> {prov.channel.toUpperCase()}</div>
                  <div><strong>Ambiente:</strong> {prov.environment}</div>
                  <div>
                    <strong>Integração:</strong> {prov.is_configured ? 'Ativa e pronta' : 'Pendente de credencial em variáveis de ambiente'}
                  </div>
                  <div><strong>Último Teste:</strong> {prov.last_tested_at ? new Date(prov.last_tested_at).toLocaleString('pt-BR') : 'Ainda não executado'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 4: AUTOMAÇÕES */}
      {activeTab === 'automations' && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                <th style={{ padding: '12px 16px' }}>Regra de Automação</th>
                <th style={{ padding: '12px 16px' }}>Evento Disparador (Trigger)</th>
                <th style={{ padding: '12px 16px' }}>Tempo de Espera (Delay)</th>
                <th style={{ padding: '12px 16px' }}>Template & Canal</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {automations.map(auto => (
                <tr key={auto.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#1e293b' }}>
                    {auto.name}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, color: '#0f172a' }}>
                      {auto.trigger_event}
                    </code>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#64748b' }}>
                    {auto.delay_seconds === 0 ? 'Imediato (0s)' : `${auto.delay_seconds / 60} minutos`}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <strong>{auto.template_key}</strong> <span style={{ color: '#94a3b8' }}>({auto.channel})</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 700,
                      background: auto.is_active ? '#dcfce7' : '#f1f5f9',
                      color: auto.is_active ? '#15803d' : '#64748b'
                    }}>
                      {auto.is_active ? 'ATIVO' : 'PAUSADO'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
