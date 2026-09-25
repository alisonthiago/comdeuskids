import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Layers, Users, Plus, Trash2, CheckCircle2,
  Sparkles, KeyRound, Copy, Check, X,
  GraduationCap, Calendar, Download, QrCode,
  ArrowRight, Phone, UserCheck, Shield
} from 'lucide-react'
import { supabase } from '@comdeuskids/supabase'
import { useAuth } from '../../hooks/useAuth'

export function TurmasAlunos() {
  const { user } = useAuth()
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Formulário Nova Turma
  const [newClassName, setNewClassName] = useState('')
  const [newClassAge, setNewClassAge] = useState('6-8 anos')
  const [newClassRoom, setNewClassRoom] = useState('Sala 01')
  const [showClassModal, setShowClassModal] = useState(false)
  const [savingClass, setSavingClass] = useState(false)

  // Formulário Novo Aluno
  const [newStudentName, setNewStudentName] = useState('')
  const [newGuardianName, setNewGuardianName] = useState('')
  const [newGuardianPhone, setNewGuardianPhone] = useState('')
  const [showStudentModal, setShowStudentModal] = useState(false)
  const [savingStudent, setSavingStudent] = useState(false)

  // Feedback & Copy
  const [copiedCode, setCopiedCode] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    async function loadClasses() {
      if (!user) return
      setLoading(true)
      const { data } = await supabase
        .from('educational_classes')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })

      if (data && data.length > 0) {
        setClasses(data)
        setSelectedClassId(data[0].id)
        loadStudents(data[0].id)
      } else {
        // Criar turma padrão se não houver
        const initial = {
          name: 'Pequenos da Fé',
          description: 'Turma de EBD dominical e atividades pedagógicas',
          age_group: '5-7 anos',
          created_by: user.id
        }
        const { data: created } = await supabase
          .from('educational_classes')
          .insert(initial)
          .select()
          .single()

        if (created) {
          setClasses([created])
          setSelectedClassId(created.id)
          loadStudents(created.id)
        }
      }
      setLoading(false)
    }

    loadClasses()
  }, [user])

  const loadStudents = async (classId: string) => {
    const { data } = await supabase
      .from('educational_class_students')
      .select('*')
      .eq('class_id', classId)
      .order('student_name', { ascending: true })

    if (data) {
      setStudents(data)
    }
  }

  const handleSelectClass = (classId: string) => {
    setSelectedClassId(classId)
    loadStudents(classId)
  }

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newClassName.trim()) return
    setSavingClass(true)

    const { data, error } = await supabase
      .from('educational_classes')
      .insert({
        name: newClassName.trim(),
        age_group: newClassAge,
        description: newClassRoom,
        created_by: user.id
      })
      .select()
      .single()

    setSavingClass(false)

    if (data) {
      setClasses([data, ...classes])
      setSelectedClassId(data.id)
      setStudents([])
      setShowClassModal(false)
      setNewClassName('')
      setFeedback(`Turma "${data.name}" criada com sucesso!`)
      setTimeout(() => setFeedback(null), 3500)
    }
  }

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClassId || !newStudentName.trim()) return
    setSavingStudent(true)
    const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase()

    const { data, error } = await supabase
      .from('educational_class_students')
      .insert({
        class_id: selectedClassId,
        student_name: newStudentName.trim(),
        guardian_name: newGuardianName.trim() || null,
        guardian_phone: newGuardianPhone.trim() || null,
        student_code: randomCode
      })
      .select()
      .single()

    setSavingStudent(false)

    if (data) {
      setStudents(prev => [...prev, data])
      setShowStudentModal(false)
      setNewStudentName('')
      setNewGuardianName('')
      setNewGuardianPhone('')
      setFeedback(`Aluno(a) "${data.student_name}" matriculado(a)!`)
      setTimeout(() => setFeedback(null), 3500)
    }
  }

  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    if (!window.confirm(`Deseja desvincular o aluno ${studentName} desta turma?`)) return
    const { error } = await supabase
      .from('educational_class_students')
      .delete()
      .eq('id', studentId)

    if (!error) {
      setStudents(prev => prev.filter(s => s.id !== studentId))
      setFeedback(`Aluno ${studentName} removido da turma.`)
      setTimeout(() => setFeedback(null), 3500)
    }
  }

  const selectedClass = classes.find(c => c.id === selectedClassId)
  const classCode = selectedClass?.id ? `CDK-${selectedClass.id.slice(0, 4).toUpperCase()}` : 'CDK-2025'

  const copyClassCode = () => {
    navigator.clipboard.writeText(classCode)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  if (loading) {
    return (
      <div className="s-page s-page--wide">
        <div className="s-skeleton" style={{ height: 40, width: 260, marginBottom: 16 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 20 }}>
          <div className="s-skeleton s-skeleton-card" style={{ height: 350 }} />
          <div className="s-skeleton s-skeleton-card" style={{ height: 350 }} />
        </div>
      </div>
    )
  }

  return (
    <div className="s-page s-page--wide">
      {/* Toast Feedback */}
      {feedback && (
        <div className="s-toast-container">
          <div className="s-toast s-toast-success">
            <CheckCircle2 size={18} />
            <span>{feedback}</span>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="s-page-header">
        <div>
          <span className="s-page-header__eyebrow">
            <GraduationCap size={13} style={{ display: 'inline', marginRight: 4 }} />
            Educação Cristã • Gestão Acadêmica
          </span>
          <h1>Minhas Turmas</h1>
          <p>Gerencie turmas, frequência de alunos e códigos de acesso às aulas.</p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="s-btn s-btn-primary" onClick={() => setShowClassModal(true)}>
            <Plus size={16} /> Criar Turma
          </button>
        </div>
      </div>

      {/* Workspace Principal (Grid de Turmas + Painel da Turma Selecionada) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 1.15fr)', gap: 24, alignItems: 'start' }}>
        {/* Coluna Esquerda: Lista de Turmas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="s-section-head">
            <h2>Turmas do Ano Letivo ({classes.length})</h2>
            <span style={{ fontSize: 12, color: 'var(--s-text-muted)' }}>Clique para gerenciar alunos</span>
          </div>

          {classes.map(c => {
            const isSelected = c.id === selectedClassId

            return (
              <div
                key={c.id}
                onClick={() => handleSelectClass(c.id)}
                className="s-card"
                style={{
                  cursor: 'pointer',
                  border: isSelected ? '2px solid var(--s-primary)' : '1px solid var(--s-border)',
                  background: isSelected ? 'var(--s-surface)' : 'var(--s-surface)',
                  boxShadow: isSelected ? 'var(--s-shadow-sm)' : 'var(--s-shadow-xs)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16
                }}
              >
                {isSelected && (
                  <div style={{ position: 'absolute', top: -10, right: 16, background: 'var(--s-primary)', color: '#fff', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', padding: '3px 10px', borderRadius: 999 }}>
                    Selecionada
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: isSelected ? 'var(--s-primary-light)' : 'var(--s-surface-low)', color: isSelected ? 'var(--s-primary)' : 'var(--s-text-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Layers size={22} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--s-text-title)', margin: 0 }}>
                          {c.name}
                        </h3>
                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: 'var(--s-surface-mid)', color: 'var(--s-text-muted)' }}>
                          {c.age_group || 'Geral'}
                        </span>
                      </div>
                      <p style={{ fontSize: 12.5, color: 'var(--s-text-muted)', margin: '3px 0 0 0' }}>
                        {c.description || 'Turma com atividades bíblicas e acompanhamento de tarefas.'}
                      </p>
                    </div>
                  </div>
                  <span className="s-badge s-badge-success">Ativa</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, padding: 12, borderRadius: 12, background: 'var(--s-surface-low)' }}>
                  <div>
                    <span style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--s-text-caption)', fontWeight: 700 }}>Alunos</span>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--s-text-title)' }}>
                      {isSelected ? students.length : '—'}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--s-text-caption)', fontWeight: 700 }}>Faixa Etária</span>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--s-primary)' }}>
                      {c.age_group || '5-9a'}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--s-text-caption)', fontWeight: 700 }}>Status</span>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--s-success)' }}>
                      Sincronizada
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link to={`/professor/aulas?turmaId=${c.id}`} className="s-btn s-btn-secondary s-btn-sm" onClick={e => e.stopPropagation()}>
                      Aulas da Turma
                    </Link>
                    <Link to="/professor/diario" className="s-btn s-btn-ghost s-btn-sm" onClick={e => e.stopPropagation()}>
                      Diário
                    </Link>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: isSelected ? 'var(--s-primary)' : 'var(--s-text-caption)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    Ver alunos <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Coluna Direita: Painel de Gestão da Turma Selecionada */}
        <div style={{ position: 'sticky', top: 80 }}>
          {selectedClass ? (
            <div className="s-card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Header da Turma Selecionada */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--s-primary)', fontWeight: 700, letterSpacing: '0.06em' }}>
                      Painel de Gestão da Turma
                    </span>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--s-text-title)', margin: '4px 0 2px 0' }}>
                      {selectedClass.name}
                    </h2>
                    <div style={{ fontSize: 12, color: 'var(--s-text-muted)' }}>
                      {selectedClass.age_group} • <strong>{students.length} alunos cadastrados</strong>
                    </div>
                  </div>

                  <button className="s-btn s-btn-primary s-btn-sm" onClick={() => setShowStudentModal(true)}>
                    <Plus size={14} /> Matricular Aluno
                  </button>
                </div>
              </div>

              {/* Código de Convite da Turma */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 14, background: 'var(--s-surface-low)', borderRadius: 14, border: '1px solid var(--s-border)' }}>
                <div>
                  <span style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--s-text-caption)', fontWeight: 700 }}>
                    Código de Acesso dos Alunos / Pais
                  </span>
                  <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '0.1em', color: 'var(--s-primary)', marginTop: 2 }}>
                    {classCode}
                  </div>
                </div>
                <button
                  className="s-btn s-btn-secondary s-btn-sm"
                  onClick={copyClassCode}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  {copiedCode ? <><Check size={14} /> Copiado!</> : <><Copy size={14} /> Copiar</>}
                </button>
              </div>

              {/* Lista de Alunos */}
              <div>
                <div className="s-section-head" style={{ marginBottom: 12 }}>
                  <h2>Alunos da Turma ({students.length})</h2>
                </div>

                {students.length === 0 ? (
                  <div className="s-empty" style={{ padding: '32px 16px' }}>
                    <Users size={32} style={{ color: 'var(--s-text-caption)', marginBottom: 8 }} />
                    <h3 style={{ fontSize: 15, margin: 0 }}>Nenhum aluno cadastrado</h3>
                    <p style={{ fontSize: 12.5, margin: '4px 0 12px 0' }}>Matricule o primeiro aluno para gerar o código individual.</p>
                    <button className="s-btn s-btn-primary s-btn-sm" onClick={() => setShowStudentModal(true)}>
                      <Plus size={14} /> Matricular aluno agora
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 420, overflowY: 'auto' }}>
                    {students.map(student => (
                      <div
                        key={student.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 14px',
                          borderRadius: 12,
                          background: 'var(--s-surface-low)',
                          border: '1px solid var(--s-border)',
                          gap: 12
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              background: 'var(--s-primary-light)',
                              color: 'var(--s-primary)',
                              fontWeight: 800,
                              fontSize: 14,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            {student.student_name.charAt(0).toUpperCase()}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--s-text-title)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {student.student_name}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--s-text-muted)', marginTop: 2 }}>
                              Resp.: {student.guardian_name || 'Não informado'} {student.guardian_phone ? `(${student.guardian_phone})` : ''}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: '#fff', border: '1px solid var(--s-border)', color: 'var(--s-text-title)', fontFamily: 'monospace' }}>
                            {student.student_code}
                          </span>
                          <button
                            className="s-btn-icon"
                            style={{ color: 'var(--s-danger)' }}
                            title="Remover aluno"
                            onClick={() => handleDeleteStudent(student.id, student.student_name)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="s-card" style={{ padding: 32, textAlign: 'center' }}>
              <p style={{ color: 'var(--s-text-muted)', margin: 0 }}>Selecione uma turma para ver os alunos.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Criar Nova Turma */}
      {showClassModal && (
        <div className="s-modal-overlay" onClick={() => setShowClassModal(false)}>
          <div className="s-modal" onClick={e => e.stopPropagation()}>
            <div className="s-modal-header">
              <h2>Criar Nova Turma</h2>
              <button className="s-btn-icon" onClick={() => setShowClassModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateClass} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="s-label">Nome da Turma</label>
                <input
                  type="text"
                  className="s-input"
                  placeholder="Ex: Exploradores da Fé, Valentes de Davi..."
                  value={newClassName}
                  onChange={e => setNewClassName(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="s-label">Faixa Etária</label>
                <select
                  className="s-select"
                  value={newClassAge}
                  onChange={e => setNewClassAge(e.target.value)}
                >
                  <option value="3-5 anos">Maternal / Jardim (3 a 5 anos)</option>
                  <option value="6-8 anos">Primários (6 a 8 anos)</option>
                  <option value="9-11 anos">Juniores (9 a 11 anos)</option>
                  <option value="12+ anos">Adolescentes (12+ anos)</option>
                  <option value="Geral">Multifaixa / Geral</option>
                </select>
              </div>

              <div>
                <label className="s-label">Sala ou Descrição</label>
                <input
                  type="text"
                  className="s-input"
                  placeholder="Ex: Sala 02 • Primeiro andar"
                  value={newClassRoom}
                  onChange={e => setNewClassRoom(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" className="s-btn s-btn-secondary" style={{ flex: 1 }} onClick={() => setShowClassModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="s-btn s-btn-primary" style={{ flex: 1 }} disabled={savingClass}>
                  {savingClass ? 'Salvando...' : 'Salvar Turma'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Adicionar Aluno */}
      {showStudentModal && (
        <div className="s-modal-overlay" onClick={() => setShowStudentModal(false)}>
          <div className="s-modal" onClick={e => e.stopPropagation()}>
            <div className="s-modal-header">
              <h2>Matricular Aluno na Turma</h2>
              <button className="s-btn-icon" onClick={() => setShowStudentModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="s-label">Nome Completo do Aluno</label>
                <input
                  type="text"
                  className="s-input"
                  placeholder="Ex: Davi Lucas Ferreira"
                  value={newStudentName}
                  onChange={e => setNewStudentName(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="s-label">Nome do Responsável (Opcional)</label>
                <input
                  type="text"
                  className="s-input"
                  placeholder="Ex: Maria Ferreira"
                  value={newGuardianName}
                  onChange={e => setNewGuardianName(e.target.value)}
                />
              </div>

              <div>
                <label className="s-label">WhatsApp do Responsável (Opcional)</label>
                <input
                  type="text"
                  className="s-input"
                  placeholder="Ex: (11) 98765-4321"
                  value={newGuardianPhone}
                  onChange={e => setNewGuardianPhone(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" className="s-btn s-btn-secondary" style={{ flex: 1 }} onClick={() => setShowStudentModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="s-btn s-btn-primary" style={{ flex: 1 }} disabled={savingStudent}>
                  {savingStudent ? 'Matriculando...' : 'Confirmar Matrícula'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
