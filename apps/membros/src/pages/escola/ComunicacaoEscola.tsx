import React, { useState, useEffect } from 'react'
import {
  MessageSquare,
  Send,
  Users,
  Layers,
  Bus,
  Plus,
  CheckCircle2,
  Clock,
  X
} from 'lucide-react'
import { useSchool } from '../../hooks/useSchool'
import { supabase } from '@comdeuskids/supabase'

export function ComunicacaoEscola() {
  const { currentSchool, hasCapability } = useSchool()
  const [messages, setMessages] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [routes, setRoutes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  // Form states
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [targetAudience, setTargetAudience] = useState<'all_guardians' | 'class' | 'route' | 'team'>('all_guardians')
  const [selectedClassId, setSelectedClassId] = useState('')
  const [selectedRouteId, setSelectedRouteId] = useState('')
  const [channel, setChannel] = useState<'whatsapp' | 'email' | 'internal'>('whatsapp')
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    loadCommunications()
  }, [currentSchool])

  const loadCommunications = async () => {
    if (!currentSchool) return
    setLoading(true)
    try {
      const { data: cls } = await supabase
        .from('educational_classes')
        .select('*')
        .eq('organization_id', currentSchool.id)
      if (cls) setClasses(cls)

      const { data: rts } = await supabase
        .from('school_transport_routes')
        .select('*')
        .eq('organization_id', currentSchool.id)
      if (rts) setRoutes(rts)

      const { data: comms } = await supabase
        .from('school_communications')
        .select('*')
        .eq('organization_id', currentSchool.id)
        .order('created_at', { ascending: false })
      if (comms) setMessages(comms)
    } catch (err) {
      console.warn('Erro ao carregar comunicados da escola:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentSchool || !title.trim() || !content.trim()) return

    setSaving(true)
    setFeedback(null)

    try {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData?.user?.id
      if (!userId) throw new Error('Não autenticado')

      const { error } = await supabase.from('school_communications').insert({
        organization_id: currentSchool.id,
        title: title.trim(),
        message: content.trim(),
        target_audience: targetAudience,
        class_id: targetAudience === 'class' ? selectedClassId || null : null,
        route_id: targetAudience === 'route' ? selectedRouteId || null : null,
        channel,
        status: 'queued',
        recipients_count: 24,
        created_by: userId
      })

      if (error) throw error

      setFeedback('Comunicado registrado com sucesso na fila de envio!')
      setModalOpen(false)
      resetForm()
      await loadCommunications()
    } catch (err: any) {
      setFeedback(`Erro ao registrar comunicado: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setTitle('')
    setContent('')
    setTargetAudience('all_guardians')
    setSelectedClassId('')
    setSelectedRouteId('')
    setChannel('whatsapp')
  }

  return (
    <div className="s-page">
      <div className="s-header">
        <div>
          <span className="s-badge s-badge--primary" style={{ marginBottom: 6 }}>Circulares & Comunicação</span>
          <h1 className="s-title">
            Central de Comunicação Escolar
          </h1>
          <p className="s-subtitle">
            Disparos de circulares, avisos pedagógicos, tarefas e comunicados de transporte escolar.
          </p>
        </div>

        {hasCapability('school.communication.send') && (
          <button
            onClick={() => setModalOpen(true)}
            className="s-btn s-btn--primary"
          >
            <Plus size={18} /> Novo Comunicado
          </button>
        )}
      </div>

      {feedback && (
        <div style={{
          padding: '12px 18px',
          borderRadius: 12,
          background: 'rgba(0, 108, 73, 0.08)',
          border: '1px solid rgba(0, 108, 73, 0.2)',
          color: 'var(--s-emerald, #006c49)',
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 20
        }}>
          {feedback}
        </div>
      )}

      {/* Lista de Comunicados */}
      <div className="s-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--s-outline-variant)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--s-neutral)', margin: 0 }}>
            Histórico de Circulares & Comunicados ({messages.length})
          </h3>
        </div>

        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--s-neutral-variant)', fontSize: 14 }}>
            Carregando comunicados...
          </div>
        ) : messages.length === 0 ? (
          <div style={{ padding: 56, textAlign: 'center' }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--s-surface-variant)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12
            }}>
              <MessageSquare size={28} color="var(--s-primary)" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--s-neutral)', margin: '0 0 6px 0' }}>
              Nenhum comunicado registrado
            </h3>
            <p style={{ color: 'var(--s-neutral-variant)', fontSize: 13, margin: '0 auto 16px auto', maxWidth: 420 }}>
              Envie circulares para pais sobre reuniões, horários de transporte e tarefas de casa.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  padding: '18px 24px',
                  borderBottom: '1px solid var(--s-outline-variant)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 16
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span className="s-badge s-badge--amber">
                      {m.channel?.toUpperCase()}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--s-neutral-variant)' }}>
                      {new Date(m.created_at).toLocaleDateString('pt-BR')} às {new Date(m.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h4 style={{ fontSize: 15, fontWeight: 800, color: 'var(--s-neutral)', margin: '0 0 4px 0' }}>
                    {m.title}
                  </h4>
                  <p style={{ fontSize: 13, color: 'var(--s-neutral-variant)', margin: 0, lineHeight: 1.5 }}>
                    {m.message}
                  </p>
                </div>

                <span className="s-badge s-badge--primary">
                  {m.status?.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Novo Comunicado */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
          <div className="s-card" style={{ maxWidth: 520, width: '100%', padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--s-neutral)', margin: 0 }}>
                  Novo Comunicado Escolar
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: 12, color: 'var(--s-neutral-variant)' }}>
                  Avisos para turmas, pais ou monitores de transporte.
                </p>
              </div>
              <button onClick={() => setModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--s-neutral-variant)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSendMessage} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="s-label">Público Alvo</label>
                <select
                  value={targetAudience}
                  onChange={(e: any) => setTargetAudience(e.target.value)}
                  className="s-select"
                >
                  <option value="all_guardians">Todas as Famílias da Escola</option>
                  <option value="class">Turma Específica</option>
                  <option value="route">Rota de Transporte</option>
                  <option value="team">Corpo Docente</option>
                </select>
              </div>

              {targetAudience === 'class' && (
                <div>
                  <label className="s-label">Selecionar Turma</label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="s-select"
                  >
                    <option value="">Selecione uma turma</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {targetAudience === 'route' && (
                <div>
                  <label className="s-label">Selecionar Rota</label>
                  <select
                    value={selectedRouteId}
                    onChange={(e) => setSelectedRouteId(e.target.value)}
                    className="s-select"
                  >
                    <option value="">Selecione uma rota</option>
                    {routes.map((r) => (
                      <option key={r.id} value={r.id}>{r.route_name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="s-label">Assunto / Título *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Reunião de Pais & Horário Especial de Van"
                  className="s-input"
                />
              </div>

              <div>
                <label className="s-label">Mensagem *</label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Escreva a mensagem para as famílias..."
                  className="s-input"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="s-btn s-btn--secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="s-btn s-btn--primary"
                >
                  {saving ? 'Registrando...' : 'Enviar Comunicado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
