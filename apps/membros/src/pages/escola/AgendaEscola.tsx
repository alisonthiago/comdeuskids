import React, { useState, useEffect } from 'react'
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  MapPin,
  CheckCircle2,
  X,
  School,
  Sparkles
} from 'lucide-react'
import { useSchool } from '../../hooks/useSchool'
import { supabase } from '@comdeuskids/supabase'

export function AgendaEscola() {
  const { currentSchool, hasCapability } = useSchool()
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  // Form states
  const [title, setTitle] = useState('')
  const [eventType, setEventType] = useState('exam')
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0])
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('11:00')
  const [location, setLocation] = useState('Auditório Principal')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    loadEvents()
  }, [currentSchool])

  const loadEvents = async () => {
    if (!currentSchool) return
    setLoading(true)
    try {
      const { data } = await supabase
        .from('school_calendar_events')
        .select('*')
        .eq('organization_id', currentSchool.id)
        .order('event_date', { ascending: true })

      if (data) setEvents(data)
    } catch (err) {
      console.warn('Erro ao carregar agenda escolar:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentSchool || !title.trim()) return

    setSaving(true)
    setFeedback(null)

    try {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData?.user?.id
      if (!userId) throw new Error('Não autenticado')

      const { error } = await supabase.from('school_calendar_events').insert({
        organization_id: currentSchool.id,
        title: title.trim(),
        event_type: eventType,
        event_date: eventDate,
        start_time: startTime,
        end_time: endTime || null,
        location: location.trim() || null,
        description: description.trim() || null,
        created_by: userId
      })

      if (error) throw error

      setFeedback('Evento cadastrado no calendário escolar!')
      setModalOpen(false)
      resetForm()
      await loadEvents()
    } catch (err: any) {
      setFeedback(`Erro ao salvar evento: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setTitle('')
    setEventType('exam')
    setStartTime('08:00')
    setEndTime('11:00')
    setLocation('Auditório Principal')
    setDescription('')
  }

  const typeLabels: Record<string, { label: string; badgeClass: string }> = {
    exam: { label: 'Avaliação / Prova', badgeClass: 's-badge--primary' },
    assignment: { label: 'Entrega de Trabalho', badgeClass: 's-badge--amber' },
    lesson: { label: 'Aula Especial', badgeClass: 's-badge--emerald' },
    meeting: { label: 'Reunião de Pais', badgeClass: 's-badge--neutral' },
    presentation: { label: 'Apresentação / Feira', badgeClass: 's-badge--amber' },
    field_trip: { label: 'Passeio Pedagógico', badgeClass: 's-badge--emerald' },
    holiday: { label: 'Recesso / Feriado', badgeClass: 's-badge--neutral' },
    event: { label: 'Evento', badgeClass: 's-badge--primary' },
    other: { label: 'Outro', badgeClass: 's-badge--neutral' }
  }

  return (
    <div className="s-page">
      <div className="s-header">
        <div>
          <span className="s-badge s-badge--primary" style={{ marginBottom: 6 }}>Calendário Acadêmico</span>
          <h1 className="s-title">Calendário & Agenda Escolar</h1>
          <p className="s-subtitle">
            Planejamento de avaliações, reuniões de pais, passeios pedagógicos e eventos do ano letivo.
          </p>
        </div>

        {hasCapability('school.agenda.manage') && (
          <button
            onClick={() => setModalOpen(true)}
            className="s-btn s-btn--primary"
          >
            <Plus size={18} /> Novo Evento
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

      {/* Lista de Eventos */}
      {loading ? (
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--s-neutral-variant)', fontSize: 14 }}>
          Carregando calendário escolar...
        </div>
      ) : events.length === 0 ? (
        <div className="s-card" style={{ padding: 56, textAlign: 'center' }}>
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
            <CalendarIcon size={28} color="var(--s-primary)" />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--s-neutral)', margin: '0 0 6px 0' }}>
            Nenhum evento agendado no calendário escolar
          </h3>
          <p style={{ color: 'var(--s-neutral-variant)', fontSize: 13, margin: '0 auto 16px auto', maxWidth: 420 }}>
            Cadastre reuniões pedagógicas, datas de provas e passeios para manter o corpo docente e os pais informados.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {events.map((evt) => {
            const badge = typeLabels[evt.event_type] || { label: evt.event_type, badgeClass: 's-badge--neutral' }
            const isToday = evt.event_date === new Date().toISOString().split('T')[0]
            return (
              <div
                key={evt.id}
                className="s-card"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 16,
                  borderColor: isToday ? 'var(--s-primary)' : undefined,
                  boxShadow: isToday ? '0 8px 24px rgba(171, 53, 0, 0.08)' : undefined
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span className={`s-badge ${badge.badgeClass}`}>
                      {badge.label}
                    </span>
                    {isToday && (
                      <span className="s-badge s-badge--emerald">
                        HOJE
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--s-neutral)', margin: '0 0 8px 0' }}>
                    {evt.title}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', fontSize: 13, color: 'var(--s-neutral-variant)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CalendarIcon size={15} color="var(--s-primary)" /> {new Date(evt.event_date).toLocaleDateString('pt-BR')}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={15} color="var(--s-primary)" /> {evt.start_time?.slice(0, 5)} {evt.end_time ? `às ${evt.end_time.slice(0, 5)}` : ''}
                    </span>
                    {evt.location && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MapPin size={15} color="var(--s-primary)" /> {evt.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal Novo Evento */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
          <div className="s-card" style={{ maxWidth: 500, width: '100%', padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--s-neutral)', margin: 0 }}>
                  Cadastrar Data no Calendário
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: 12, color: 'var(--s-neutral-variant)' }}>
                  Datas e comunicados visíveis para professores e responsáveis.
                </p>
              </div>
              <button onClick={() => setModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--s-neutral-variant)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="s-label">Título do Evento *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Avaliação Bimestral de História & Reunião Pedagógica"
                  className="s-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="s-label">Tipo</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="s-select"
                  >
                    <option value="exam">Avaliação / Prova</option>
                    <option value="assignment">Entrega de Trabalho</option>
                    <option value="lesson">Aula Especial</option>
                    <option value="meeting">Reunião de Pais</option>
                    <option value="presentation">Apresentação / Feira</option>
                    <option value="field_trip">Passeio Pedagógico</option>
                    <option value="holiday">Recesso / Feriado</option>
                    <option value="event">Evento</option>
                  </select>
                </div>
                <div>
                  <label className="s-label">Data *</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="s-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="s-label">Horário de Início *</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="s-input"
                  />
                </div>
                <div>
                  <label className="s-label">Horário de Término</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="s-input"
                  />
                </div>
              </div>

              <div>
                <label className="s-label">Local / Sala</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: Auditório Principal / Sala de Artes"
                  className="s-input"
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
                  {saving ? 'Salvando...' : 'Salvar no Calendário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
