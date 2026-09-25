import React, { useState, useEffect } from 'react'
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  MapPin,
  Tag,
  CheckCircle2,
  X,
  PlayCircle,
  AlertCircle
} from 'lucide-react'
import { useChurch } from '../../hooks/useChurch'
import { supabase } from '@comdeuskids/supabase'
import { useNavigate } from 'react-router-dom'

export function AgendaIgreja() {
  const { currentChurch, hasCapability, refreshStats } = useChurch()
  const navigate = useNavigate()
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  // Form states
  const [title, setTitle] = useState('')
  const [eventType, setEventType] = useState('ebd')
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0])
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('11:30')
  const [location, setLocation] = useState('Templo Principal / Salas Kids')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    loadEvents()
  }, [currentChurch])

  const loadEvents = async () => {
    if (!currentChurch) return
    setLoading(true)
    try {
      const { data } = await supabase
        .from('church_events')
        .select('*')
        .eq('organization_id', currentChurch.id)
        .order('event_date', { ascending: true })

      if (data) setEvents(data)
    } catch (err) {
      console.warn('Erro ao carregar eventos:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentChurch || !title.trim()) return

    setSaving(true)
    setFeedback(null)

    try {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData?.user?.id
      if (!userId) throw new Error('Não autenticado')

      const { error } = await supabase.from('church_events').insert({
        organization_id: currentChurch.id,
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

      setFeedback('Evento cadastrado na agenda da igreja!')
      setModalOpen(false)
      resetForm()
      await loadEvents()
    } catch (err: any) {
      setFeedback(`Erro ao salvar evento: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleStartCheckinSession = async (evt: any) => {
    if (!currentChurch) return
    try {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData?.user?.id
      if (!userId) return

      await supabase.from('church_checkin_sessions').insert({
        organization_id: currentChurch.id,
        event_id: evt.id,
        title: `Sessão: ${evt.title}`,
        session_date: evt.event_date,
        status: 'open',
        created_by: userId
      })

      await refreshStats()
      navigate('/igreja/checkin')
    } catch (err) {
      console.error('Erro ao iniciar sessão:', err)
    }
  }

  const resetForm = () => {
    setTitle('')
    setEventType('ebd')
    setStartTime('09:00')
    setEndTime('11:30')
    setLocation('Templo Principal / Salas Kids')
    setDescription('')
  }

  const typeLabels: Record<string, { label: string; badgeClass: string }> = {
    ebd: { label: 'EBD', badgeClass: 's-badge--emerald' },
    service: { label: 'Culto', badgeClass: 's-badge--primary' },
    kids_service: { label: 'Culto Infantil', badgeClass: 's-badge--primary' },
    class: { label: 'Classe Especial', badgeClass: 's-badge--amber' },
    rehearsal: { label: 'Ensaio', badgeClass: 's-badge--neutral' },
    event: { label: 'Evento Especial', badgeClass: 's-badge--amber' },
    congress: { label: 'Congresso Kids', badgeClass: 's-badge--primary' },
    other: { label: 'Outro', badgeClass: 's-badge--neutral' }
  }

  return (
    <div className="s-page">
      {/* Header */}
      <div className="s-header">
        <div>
          <span className="s-badge s-badge--primary" style={{ marginBottom: 6 }}>Calendário & Cultos</span>
          <h1 className="s-title">Agenda do Ministério Infantil</h1>
          <p className="s-subtitle">
            Planejamento de cultos, EBD, cultos infantis e congressos com criação direta de sessão de check-in.
          </p>
        </div>

        {hasCapability('church.agenda.manage') && (
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
          Carregando agenda...
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
            Nenhum evento na agenda
          </h3>
          <p style={{ color: 'var(--s-neutral-variant)', fontSize: 13, margin: '0 auto 16px auto', maxWidth: 420 }}>
            Cadastre os cultos, aulas da EBD e eventos do calendário da igreja para abrir sessões de recepção e check-in.
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

                <div>
                  <button
                    onClick={() => handleStartCheckinSession(evt)}
                    className="s-btn s-btn--secondary"
                    style={{ color: 'var(--s-primary)', borderColor: 'var(--s-outline-variant)' }}
                  >
                    <PlayCircle size={17} /> Abrir Sessão de Check-in
                  </button>
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
                  Cadastrar Evento na Agenda
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: 12, color: 'var(--s-neutral-variant)' }}>
                  Eventos abrem portas para chamadas e recepção rápida no domingo.
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
                  placeholder="Ex: Escola Bíblica Dominical - Especial Páscoa"
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
                    <option value="ebd">EBD</option>
                    <option value="kids_service">Culto Infantil</option>
                    <option value="service">Culto Geral</option>
                    <option value="class">Classe Especial</option>
                    <option value="rehearsal">Ensaio</option>
                    <option value="event">Evento</option>
                    <option value="congress">Congresso</option>
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
                  placeholder="Ex: Templo Principal / Salas Kids"
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
                  {saving ? 'Salvando...' : 'Salvar Evento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
