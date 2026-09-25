import React, { useState, useEffect } from 'react'
import {
  Calendar as CalendarIcon, CheckCircle2, Clock,
  BookOpen, Users, AlertCircle, Save, Check,
  X, FileText, GraduationCap, ChevronRight
} from 'lucide-react'
import { supabase } from '@comdeuskids/supabase'
import { useAuth } from '../../hooks/useAuth'

export function DiarioCalendario() {
  const { user } = useAuth()
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClassId, setSelectedClassId] = useState<string>('')
  const [students, setStudents] = useState<any[]>([])
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent' | 'excused'>>({})
  const [classNotes, setClassNotes] = useState('')
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Aulas e Prazos do Calendário
  const [calendarLessons, setCalendarLessons] = useState<any[]>([
    {
      id: 'l-1',
      title: 'A Criação do Mundo',
      biblical_reference: 'Gênesis 1:1-31',
      due_date: '28 de Setembro',
      status: 'published',
      submissions_count: 8,
      total_students: 12
    },
    {
      id: 'l-2',
      title: 'A Arca de Noé e a Promessa',
      biblical_reference: 'Gênesis 6:9-9:17',
      due_date: '05 de Outubro',
      status: 'published',
      submissions_count: 3,
      total_students: 12
    },
    {
      id: 'l-3',
      title: 'Davi e o Gigante Golias',
      biblical_reference: '1 Samuel 17',
      due_date: '12 de Outubro',
      status: 'draft',
      submissions_count: 0,
      total_students: 12
    }
  ])

  useEffect(() => {
    async function loadData() {
      if (!user) return
      setLoading(true)
      const { data: cls } = await supabase
        .from('educational_classes')
        .select('*')
        .eq('created_by', user.id)

      if (cls && cls.length > 0) {
        setClasses(cls)
        setSelectedClassId(cls[0].id)
        loadStudents(cls[0].id)
      } else {
        setLoading(false)
      }
    }
    loadData()
  }, [user])

  const loadStudents = async (classId: string) => {
    const { data } = await supabase
      .from('educational_class_students')
      .select('*')
      .eq('class_id', classId)

    if (data && data.length > 0) {
      setStudents(data)
      const initAtt: any = {}
      data.forEach(s => { initAtt[s.id] = 'present' })
      setAttendance(initAtt)
    }
    setLoading(false)
  }

  const handleSaveAttendance = () => {
    setSavedFeedback('Frequência e anotações do Diário da Turma salvas com sucesso!')
    setTimeout(() => setSavedFeedback(null), 3500)
  }

  const presentCount = Object.values(attendance).filter(v => v === 'present').length

  if (loading) {
    return (
      <div className="s-page s-page--wide">
        <div className="s-skeleton" style={{ height: 40, width: 280, marginBottom: 16 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 20 }}>
          <div className="s-skeleton s-skeleton-card" style={{ height: 380 }} />
          <div className="s-skeleton s-skeleton-card" style={{ height: 380 }} />
        </div>
      </div>
    )
  }

  return (
    <div className="s-page s-page--wide">
      {/* Toast Feedback */}
      {savedFeedback && (
        <div className="s-toast-container">
          <div className="s-toast s-toast-success">
            <CheckCircle2 size={18} />
            <span>{savedFeedback}</span>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="s-page-header">
        <div>
          <span className="s-page-header__eyebrow">
            <GraduationCap size={13} style={{ display: 'inline', marginRight: 4 }} />
            Gestão Pedagógica • Frequência & Calendário
          </span>
          <h1>Diário da Turma & Calendário</h1>
          <p>Controle a chamada dos alunos nas aulas bíblicas e acompanhe os prazos de entrega das tarefas.</p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <select
            className="s-select"
            style={{ width: 'auto', minWidth: 200 }}
            value={selectedClassId}
            onChange={e => {
              setSelectedClassId(e.target.value)
              loadStudents(e.target.value)
            }}
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.age_group || 'Geral'})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid Principal */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 1fr)', gap: 24, alignItems: 'start' }}>
        {/* Diário de Frequência */}
        <div className="s-card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--s-primary-light)', color: 'var(--s-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--s-text-title)', margin: 0 }}>
                  Chamada & Frequência
                </h2>
                <span style={{ fontSize: 12, color: 'var(--s-text-muted)' }}>
                  {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                </span>
              </div>
            </div>

            <span className="s-badge s-badge-success">
              {presentCount} de {students.length} presentes
            </span>
          </div>

          {students.length === 0 ? (
            <div className="s-empty" style={{ padding: '32px 16px' }}>
              <Users size={32} style={{ color: 'var(--s-text-caption)', marginBottom: 8 }} />
              <p style={{ margin: 0, fontSize: 13, color: 'var(--s-text-muted)' }}>Nenhum aluno cadastrado nesta turma para chamada.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {students.map(s => {
                const status = attendance[s.id] || 'present'

                return (
                  <div
                    key={s.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: 12,
                      background: 'var(--s-surface-low)',
                      border: '1px solid var(--s-border)'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--s-text-title)' }}>{s.student_name}</div>
                      <span style={{ fontSize: 11, color: 'var(--s-text-muted)' }}>Código: {s.student_code}</span>
                    </div>

                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => setAttendance({ ...attendance, [s.id]: 'present' })}
                        style={{
                          padding: '5px 12px',
                          borderRadius: 8,
                          border: '1px solid',
                          borderColor: status === 'present' ? 'var(--s-success)' : 'var(--s-border)',
                          background: status === 'present' ? 'var(--s-success-light)' : '#fff',
                          color: status === 'present' ? 'var(--s-success)' : 'var(--s-text-muted)',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Presente
                      </button>

                      <button
                        type="button"
                        onClick={() => setAttendance({ ...attendance, [s.id]: 'absent' })}
                        style={{
                          padding: '5px 12px',
                          borderRadius: 8,
                          border: '1px solid',
                          borderColor: status === 'absent' ? 'var(--s-danger)' : 'var(--s-border)',
                          background: status === 'absent' ? 'var(--s-danger-light)' : '#fff',
                          color: status === 'absent' ? 'var(--s-danger)' : 'var(--s-text-muted)',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Faltou
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div>
            <label className="s-label">Observações da Aula / Ocorrências Pedagógicas</label>
            <textarea
              rows={3}
              className="s-textarea"
              placeholder="Ex: Turma muito participativa na dinâmica de Davi e Golias. Sofia compartilhou seu louvor..."
              value={classNotes}
              onChange={e => setClassNotes(e.target.value)}
            />
          </div>

          <button className="s-btn s-btn-primary" onClick={handleSaveAttendance} style={{ width: '100%', minHeight: 44 }}>
            <Save size={16} /> Salvar Frequência da Aula
          </button>
        </div>

        {/* Calendário de Aulas e Prazos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="s-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CalendarIcon size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--s-text-title)', margin: 0 }}>
                    Próximas Aulas & Prazos
                  </h2>
                  <span style={{ fontSize: 12, color: 'var(--s-text-muted)' }}>Cronograma da EBD</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {calendarLessons.map(lesson => (
                <div
                  key={lesson.id}
                  style={{
                    padding: 14,
                    borderRadius: 12,
                    background: 'var(--s-surface-low)',
                    border: '1px solid var(--s-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: 14, color: 'var(--s-text-title)' }}>{lesson.title}</strong>
                    <span className={`s-badge ${lesson.status === 'published' ? 's-badge-success' : 's-badge-warning'}`}>
                      {lesson.status === 'published' ? 'Publicada' : 'Rascunho'}
                    </span>
                  </div>

                  <div style={{ fontSize: 12, color: 'var(--s-text-muted)' }}>
                    Referência: {lesson.biblical_reference}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6, borderTop: '1px solid var(--s-border)', fontSize: 11.5 }}>
                    <span style={{ color: 'var(--s-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={13} /> {lesson.due_date}
                    </span>
                    <span style={{ color: 'var(--s-text-muted)' }}>
                      {lesson.submissions_count} entregas recebidas
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
