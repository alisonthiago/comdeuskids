import React, { useState, useEffect } from 'react'
import {
  Layers,
  Plus,
  Users,
  Search,
  BookOpen,
  GraduationCap,
  X,
  CheckCircle2,
  Trash2,
  Sparkles,
  ChevronRight
} from 'lucide-react'
import { useSchool } from '../../hooks/useSchool'
import { supabase } from '@comdeuskids/supabase'

export function TurmasEscola() {
  const { currentSchool, hasCapability, refreshStats } = useSchool()
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState<any | null>(null)
  const [classStudents, setClassStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalNewClass, setModalNewClass] = useState(false)
  const [modalAddStudent, setModalAddStudent] = useState(false)

  // Form states turma
  const [className, setClassName] = useState('')
  const [ageGroup, setAgeGroup] = useState('1º Ano Fundamental')
  const [description, setDescription] = useState('')
  const [savingClass, setSavingClass] = useState(false)

  // Busca e vínculo de aluno central existente
  const [searchStudentTerm, setSearchStudentTerm] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [linking, setLinking] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    loadClasses()
  }, [currentSchool])

  const loadClasses = async () => {
    if (!currentSchool) return
    setLoading(true)
    try {
      const { data } = await supabase
        .from('educational_classes')
        .select('*')
        .eq('organization_id', currentSchool.id)
        .order('created_at', { ascending: true })

      if (data && data.length > 0) {
        setClasses(data)
        loadClassDetails(data[0])
      } else {
        setClasses([])
        setSelectedClass(null)
      }
    } catch (err) {
      console.warn('Erro ao carregar turmas da escola:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadClassDetails = async (cls: any) => {
    setSelectedClass(cls)
    try {
      const { data: stds } = await supabase
        .from('educational_class_students')
        .select('*')
        .eq('class_id', cls.id)
        .eq('is_active', true)

      if (stds) setClassStudents(stds)
    } catch (err) {
      console.warn('Erro ao carregar alunos da turma:', err)
    }
  }

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentSchool || !className.trim()) return

    setSavingClass(true)
    setFeedback(null)

    try {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData?.user?.id
      if (!userId) throw new Error('Não autenticado')

      const { data, error } = await supabase
        .from('educational_classes')
        .insert({
          organization_id: currentSchool.id,
          created_by: userId,
          name: className.trim(),
          age_group: ageGroup,
          description: description.trim() || null,
          color_tag: '#ab3500',
          is_active: true
        })
        .select()
        .single()

      if (error) throw error

      setFeedback('Turma / Série criada com sucesso!')
      setModalNewClass(false)
      setClassName('')
      setDescription('')
      await loadClasses()
      await refreshStats()
    } catch (err: any) {
      setFeedback(`Erro ao criar turma: ${err.message}`)
    } finally {
      setSavingClass(false)
    }
  }

  useEffect(() => {
    if (!currentSchool || searchStudentTerm.trim().length < 2) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      try {
        const { data } = await supabase
          .from('organization_students')
          .select(`
            id,
            child_id,
            enrollment_code,
            child:children (id, first_name, last_name, birth_date)
          `)
          .eq('organization_id', currentSchool.id)
          .eq('status', 'active')
          .limit(8)

        if (data) {
          const filtered = data.filter((item: any) => {
            const name = `${item.child?.first_name || ''} ${item.child?.last_name || ''}`.toLowerCase()
            const reg = (item.enrollment_code || '').toLowerCase()
            return name.includes(searchStudentTerm.toLowerCase()) || reg.includes(searchStudentTerm.toLowerCase())
          })
          setSearchResults(filtered)
        }
      } catch (err) {
        console.warn('Erro na busca central de alunos:', err)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [searchStudentTerm, currentSchool])

  const handleLinkStudent = async (student: any) => {
    if (!selectedClass) return
    setLinking(true)
    try {
      const childName = `${student.child?.first_name || ''} ${student.child?.last_name || ''}`.trim()
      const { error } = await supabase.from('educational_class_students').insert({
        class_id: selectedClass.id,
        child_id: student.child_id,
        student_name: childName,
        student_code: student.enrollment_code,
        is_active: true
      })

      if (error) throw error

      setFeedback(`Aluno ${childName} enturmado com sucesso!`)
      setModalAddStudent(false)
      setSearchStudentTerm('')
      setSearchResults([])
      await loadClassDetails(selectedClass)
    } catch (err: any) {
      setFeedback(`Erro ao enturmar aluno: ${err.message}`)
    } finally {
      setLinking(false)
    }
  }

  return (
    <div className="s-page" style={{ padding: '0 0 60px 0' }}>
      {/* Top Header */}
      <section className="s-card" style={{ padding: '24px 28px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="s-badge s-badge--emerald">
                <Layers size={12} /> SÉRIES & TURMAS
              </span>
              <span style={{ fontSize: '13px', color: 'var(--s-text-muted)' }}>
                • {currentSchool?.name}
              </span>
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--s-text)', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
              Séries & Turmas Escolares
            </h1>
            <p style={{ color: 'var(--s-text-muted)', fontSize: '14px', margin: 0 }}>
              Turmas integradas ao Motor Educacional com busca e enturmação de alunos do cadastro central.
            </p>
          </div>

          <button
            onClick={() => setModalNewClass(true)}
            className="s-btn s-btn--primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={16} /> Nova Turma / Série
          </button>
        </div>
      </section>

      {feedback && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: '12px',
            background: 'rgba(0, 108, 73, 0.08)',
            border: '1px solid var(--s-emerald)',
            color: 'var(--s-emerald)',
            fontSize: '14px',
            fontWeight: 600,
            marginBottom: '20px'
          }}
        >
          {feedback}
        </div>
      )}

      {/* Grid com Seleção de Turmas e Lista de Alunos Enturmados */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', alignItems: 'start' }}>
        {/* Painel Esquerdo: Lista de Turmas */}
        <section className="s-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--s-border)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--s-text)', margin: 0 }}>
              Turmas da Escola ({classes.length})
            </h3>
          </div>

          {loading ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--s-text-muted)', fontSize: '13px' }}>
              Carregando turmas...
            </div>
          ) : classes.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--s-text-muted)', fontSize: '13px' }}>
              Nenhuma turma cadastrada.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {classes.map((c) => {
                const isSelected = selectedClass?.id === c.id
                return (
                  <div
                    key={c.id}
                    onClick={() => loadClassDetails(c)}
                    style={{
                      padding: '14px 20px',
                      borderBottom: '1px solid var(--s-border)',
                      background: isSelected ? 'var(--s-primary-container-soft)' : 'transparent',
                      cursor: 'pointer',
                      borderLeft: isSelected ? '4px solid var(--s-primary)' : '4px solid transparent',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--s-text)', display: 'block' }}>
                      {c.name}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--s-text-muted)' }}>
                      {c.age_group || 'Sem série especificada'}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Painel Direito: Detalhes da Turma & Alunos Enturmados */}
        {selectedClass ? (
          <section className="s-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span className="s-badge s-badge--emerald" style={{ fontSize: '11px' }}>
                  {selectedClass.age_group}
                </span>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--s-text)', margin: '6px 0 0 0' }}>
                  {selectedClass.name}
                </h2>
              </div>

              <button
                onClick={() => setModalAddStudent(true)}
                className="s-btn s-btn--primary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
              >
                <Plus size={16} /> Enturmar Aluno Existente
              </button>
            </div>

            {/* Lista de Alunos na Turma */}
            <div style={{ borderTop: '1px solid var(--s-border)', paddingTop: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--s-text)', marginBottom: '14px' }}>
                Alunos Matriculados nesta Turma ({classStudents.length})
              </h3>

              {classStudents.length === 0 ? (
                <div style={{ padding: '32px 16px', textAlign: 'center', background: 'var(--s-surface-container-low)', borderRadius: '14px' }}>
                  <Users size={32} color="var(--s-text-muted)" style={{ margin: '0 auto 8px auto' }} />
                  <p style={{ color: 'var(--s-text-muted)', fontSize: '13px', margin: 0 }}>
                    Nenhum aluno vinculado a esta turma ainda. Use o botão acima para puxar alunos do cadastro central.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {classStudents.map((cs) => (
                    <div
                      key={cs.id}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '12px',
                        background: 'var(--s-surface-container-low)',
                        border: '1px solid var(--s-border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span className="s-badge" style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 800, background: 'var(--s-surface-container-lowest)' }}>
                          {cs.student_code || '------'}
                        </span>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--s-text)' }}>
                          {cs.student_name}
                        </span>
                      </div>
                      <span className="s-badge s-badge--emerald">Enturmado</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--s-text-muted)' }}>
            Selecione uma turma para ver os alunos.
          </div>
        )}
      </div>

      {/* Modal Criar Turma */}
      {modalNewClass && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div className="s-card" style={{ maxWidth: '440px', width: '100%', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--s-text)', margin: 0 }}>
                Criar Nova Série / Turma
              </h2>
              <button onClick={() => setModalNewClass(false)} style={{ background: 'transparent', border: 'none', color: 'var(--s-text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateClass} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="s-label" style={{ marginBottom: '6px' }}>Nome da Turma *</label>
                <input
                  type="text"
                  required
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="Ex: 1º Ano A — Manhã"
                  className="s-input"
                  style={{ width: '100%', height: '42px' }}
                />
              </div>

              <div>
                <label className="s-label" style={{ marginBottom: '6px' }}>Faixa Etária / Série</label>
                <select
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  className="s-select"
                  style={{ width: '100%', height: '42px' }}
                >
                  <option value="Maternal (2-3 anos)">Maternal (2–3 anos)</option>
                  <option value="Jardim I (4 anos)">Jardim I (4 anos)</option>
                  <option value="Jardim II (5 anos)">Jardim II (5 anos)</option>
                  <option value="1º Ano Fundamental">1º Ano Fundamental</option>
                  <option value="2º Ano Fundamental">2º Ano Fundamental</option>
                  <option value="3º Ano Fundamental">3º Ano Fundamental</option>
                  <option value="4º Ano Fundamental">4º Ano Fundamental</option>
                  <option value="5º Ano Fundamental">5º Ano Fundamental</option>
                </select>
              </div>

              <div>
                <label className="s-label" style={{ marginBottom: '6px' }}>Descrição / Sala</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Sala 03 • Prédio Principal"
                  className="s-input"
                  style={{ width: '100%', height: '42px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setModalNewClass(false)}
                  className="s-btn s-btn--secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingClass}
                  className="s-btn s-btn--primary"
                >
                  {savingClass ? 'Criando...' : 'Criar Turma'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Enturmar Aluno Existente */}
      {modalAddStudent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div className="s-card" style={{ maxWidth: '480px', width: '100%', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--s-text)', margin: 0 }}>
                Enturmar Aluno em {selectedClass?.name}
              </h2>
              <button onClick={() => setModalAddStudent(false)} style={{ background: 'transparent', border: 'none', color: 'var(--s-text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ color: 'var(--s-text-muted)', fontSize: '13px', margin: '0 0 16px 0' }}>
              Busque pelo nome ou matrícula de 6 dígitos no cadastro central da escola:
            </p>

            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <Search size={16} color="var(--s-text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Nome ou matrícula..."
                value={searchStudentTerm}
                onChange={(e) => setSearchStudentTerm(e.target.value)}
                className="s-input"
                style={{ width: '100%', height: '42px', paddingLeft: '36px' }}
              />
            </div>

            {searchResults.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
                {searchResults.map((res) => (
                  <div
                    key={res.id}
                    onClick={() => handleLinkStudent(res)}
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      background: 'var(--s-surface-container-low)',
                      border: '1px solid var(--s-border)',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--s-text)', display: 'block' }}>
                        {res.child?.first_name} {res.child?.last_name || ''}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--s-text-muted)' }}>Matrícula: #{res.enrollment_code}</span>
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--s-primary)', fontWeight: 700 }}>+ Enturmar</span>
                  </div>
                ))}
              </div>
            ) : searchStudentTerm.length >= 2 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--s-text-muted)', fontSize: '13px' }}>
                Nenhum aluno encontrado para "{searchStudentTerm}".
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
