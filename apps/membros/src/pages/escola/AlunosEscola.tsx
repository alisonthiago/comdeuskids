import React, { useState, useEffect } from 'react'
import {
  Users,
  Plus,
  Search,
  Layers,
  Phone,
  CheckCircle,
  X,
  CreditCard,
  Hash,
  AlertTriangle,
  GraduationCap
} from 'lucide-react'
import { useSchool } from '../../hooks/useSchool'
import { supabase } from '@comdeuskids/supabase'

export function AlunosEscola() {
  const { currentSchool, hasCapability, refreshStats } = useSchool()
  const [students, setStudents] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

  // Form states
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [selectedClassId, setSelectedClassId] = useState('')
  const [guardianName, setGuardianName] = useState('')
  const [guardianPhone, setGuardianPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    loadData()
  }, [currentSchool])

  const loadData = async () => {
    if (!currentSchool) return
    setLoading(true)
    try {
      const { data: cls } = await supabase
        .from('educational_classes')
        .select('*')
        .eq('organization_id', currentSchool.id)

      if (cls) setClasses(cls)

      const { data: orgStudents } = await supabase
        .from('organization_students')
        .select(`
          id,
          child_id,
          enrollment_code,
          status,
          child:children (
            id,
            first_name,
            last_name,
            birth_date,
            avatar_url
          )
        `)
        .eq('organization_id', currentSchool.id)
        .order('created_at', { ascending: false })

      if (orgStudents) setStudents(orgStudents)
    } catch (err) {
      console.warn('Erro ao carregar alunos da escola:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentSchool || !firstName.trim()) return

    setSaving(true)
    setFeedback(null)

    try {
      const { data, error } = await supabase.rpc('register_school_student', {
        p_org_id: currentSchool.id,
        p_first_name: firstName.trim(),
        p_last_name: lastName.trim() || null,
        p_birth_date: birthDate || null,
        p_guardian_name: guardianName.trim() || null,
        p_guardian_phone: guardianPhone.trim() || null,
        p_class_id: selectedClassId || null
      })

      if (error) {
        const regCode = String(Math.floor(100000 + Math.random() * 900000))
        const { data: newChild, error: cErr } = await supabase
          .from('children')
          .insert({
            first_name: firstName.trim(),
            last_name: lastName.trim() || null,
            birth_date: birthDate || null
          })
          .select()
          .single()

        if (cErr) throw cErr

        const { error: sErr } = await supabase.from('organization_students').insert({
          organization_id: currentSchool.id,
          child_id: newChild.id,
          enrollment_code: regCode,
          status: 'active'
        })
        if (sErr) throw sErr

        if (selectedClassId) {
          await supabase.from('educational_class_students').insert({
            class_id: selectedClassId,
            child_id: newChild.id,
            student_name: `${firstName.trim()} ${lastName.trim()}`.trim(),
            student_code: regCode,
            guardian_name: guardianName.trim() || null,
            guardian_phone: guardianPhone.trim() || null
          })
        }

        setFeedback({
          type: 'success',
          text: `Aluno matriculado com sucesso! Matrícula: ${regCode}`
        })
      } else {
        setFeedback({
          type: 'success',
          text: `Aluno matriculado com sucesso! Matrícula: ${data?.registration || 'Gerada'}`
        })
      }

      setModalOpen(false)
      resetForm()
      await loadData()
      await refreshStats()
    } catch (err: any) {
      console.error('Erro ao matricular aluno:', err)
      setFeedback({ type: 'error', text: `Erro ao matricular: ${err.message}` })
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setFirstName('')
    setLastName('')
    setBirthDate('')
    setSelectedClassId('')
    setGuardianName('')
    setGuardianPhone('')
  }

  const calculateAge = (bDate: string) => {
    if (!bDate) return null
    const birth = new Date(bDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const filteredStudents = students.filter((s) => {
    const name = `${s.child?.first_name || ''} ${s.child?.last_name || ''}`.toLowerCase()
    const reg = (s.enrollment_code || '').toLowerCase()
    return name.includes(searchTerm.toLowerCase()) || reg.includes(searchTerm.toLowerCase())
  })

  return (
    <div className="s-page" style={{ padding: '0 0 60px 0' }}>
      {/* Top Header */}
      <section className="s-card" style={{ padding: '24px 28px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="s-badge s-badge--emerald">
                <GraduationCap size={12} /> SECRETARIA ESCOLAR
              </span>
              <span style={{ fontSize: '13px', color: 'var(--s-text-muted)' }}>
                • {currentSchool?.name}
              </span>
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--s-text)', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
              Cadastro Central de Alunos
            </h1>
            <p style={{ color: 'var(--s-text-muted)', fontSize: '14px', margin: 0 }}>
              Alunos matriculados na escola com matrícula única de 6 dígitos para enturmação pedagógica.
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="s-btn s-btn--primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={16} /> Nova Matrícula
          </button>
        </div>
      </section>

      {feedback && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: '12px',
            background: feedback.type === 'success' ? 'rgba(0, 108, 73, 0.08)' : 'rgba(239, 68, 68, 0.08)',
            border: `1px solid ${feedback.type === 'success' ? 'var(--s-emerald)' : '#ef4444'}`,
            color: feedback.type === 'success' ? 'var(--s-emerald)' : '#ef4444',
            fontSize: '14px',
            fontWeight: 600,
            marginBottom: '20px'
          }}
        >
          {feedback.text}
        </div>
      )}

      {/* Barra de Busca por Nome ou Matrícula */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <Search size={18} color="var(--s-text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text"
          placeholder="Buscar por nome do aluno ou matrícula de 6 dígitos (ex: 038421)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="s-input"
          style={{ width: '100%', height: '48px', paddingLeft: '44px', fontSize: '14px' }}
        />
      </div>

      {/* Tabela de Alunos */}
      <section className="s-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--s-text-muted)', fontSize: '14px' }}>
            Carregando cadastro central de alunos...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center' }}>
            <Users size={40} color="var(--s-text-muted)" style={{ margin: '0 auto 12px auto' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--s-text)', margin: '0 0 6px 0' }}>
              Nenhum aluno encontrado
            </h3>
            <p style={{ color: 'var(--s-text-muted)', fontSize: '13px', margin: '0 auto 16px auto', maxWidth: '420px' }}>
              Matricule alunos para gerar seus códigos de acesso individual e associá-los às séries pedagógicas.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="s-btn s-btn--primary"
            >
              Realizar Primeira Matrícula
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--s-border)', background: 'var(--s-surface-container-low)' }}>
                  <th style={{ padding: '14px 20px', fontSize: '12px', color: 'var(--s-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Aluno</th>
                  <th style={{ padding: '14px 20px', fontSize: '12px', color: 'var(--s-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Matrícula</th>
                  <th style={{ padding: '14px 20px', fontSize: '12px', color: 'var(--s-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Idade</th>
                  <th style={{ padding: '14px 20px', fontSize: '12px', color: 'var(--s-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => {
                  const age = calculateAge(s.child?.birth_date)
                  return (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--s-border)' }}>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--s-primary-container-soft)', color: 'var(--s-primary)', fontWeight: 800, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {s.child?.first_name?.[0] || 'A'}
                          </div>
                          <div>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--s-text)', display: 'block' }}>
                              {s.child?.first_name} {s.child?.last_name || ''}
                            </span>
                            <span style={{ fontSize: '12px', color: 'var(--s-text-muted)' }}>Matriculado(a)</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span className="s-badge" style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '13px', background: 'var(--s-surface-container)' }}>
                          {s.enrollment_code || '000000'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--s-text)' }}>
                        {age !== null ? `${age} anos` : 'Não informada'}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span className="s-badge s-badge--emerald">
                          {s.status?.toUpperCase() || 'ATIVO'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modal Nova Matrícula */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div className="s-card" style={{ maxWidth: '500px', width: '100%', padding: '28px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--s-text)', margin: 0 }}>
                Matricular Novo Aluno
              </h2>
              <button onClick={() => setModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--s-text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="s-label" style={{ marginBottom: '6px' }}>Nome *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Ex: Arthur"
                    className="s-input"
                    style={{ width: '100%', height: '42px' }}
                  />
                </div>
                <div>
                  <label className="s-label" style={{ marginBottom: '6px' }}>Sobrenome</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Ex: Henrique"
                    className="s-input"
                    style={{ width: '100%', height: '42px' }}
                  />
                </div>
              </div>

              <div>
                <label className="s-label" style={{ marginBottom: '6px' }}>Data de Nascimento</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="s-input"
                  style={{ width: '100%', height: '42px' }}
                />
              </div>

              <div>
                <label className="s-label" style={{ marginBottom: '6px' }}>Turma / Série Inicial</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="s-select"
                  style={{ width: '100%', height: '42px' }}
                >
                  <option value="">Selecione uma turma escolar...</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.age_group ? `(${c.age_group})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ borderTop: '1px solid var(--s-border)', paddingTop: '16px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--s-primary)', display: 'block', marginBottom: '12px' }}>
                  Filiação & Responsável Financeiro/Pedagógico
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="s-label" style={{ marginBottom: '6px' }}>Nome do Responsável</label>
                    <input
                      type="text"
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                      placeholder="Ex: Cláudia Henrique"
                      className="s-input"
                      style={{ width: '100%', height: '42px' }}
                    />
                  </div>
                  <div>
                    <label className="s-label" style={{ marginBottom: '6px' }}>WhatsApp do Responsável</label>
                    <input
                      type="tel"
                      value={guardianPhone}
                      onChange={(e) => setGuardianPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="s-input"
                      style={{ width: '100%', height: '42px' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
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
                  {saving ? 'Matriculando...' : 'Concluir Matrícula'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
