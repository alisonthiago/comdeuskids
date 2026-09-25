import React, { useState, useEffect } from 'react'
import {
  Users,
  Plus,
  Search,
  Shield,
  Heart,
  AlertTriangle,
  Layers,
  Edit,
  CheckCircle,
  X,
  Phone,
  UserCheck
} from 'lucide-react'
import { useChurch } from '../../hooks/useChurch'
import { supabase } from '@comdeuskids/supabase'

export function CriancasIgreja() {
  const { currentChurch, hasCapability } = useChurch()
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
  const [careNote, setCareNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [currentChurch])

  const loadData = async () => {
    if (!currentChurch) return
    setLoading(true)
    try {
      const { data: cls } = await supabase
        .from('educational_classes')
        .select('*')
        .or(`organization_id.eq.${currentChurch.id}`)

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
        .eq('organization_id', currentChurch.id)
        .eq('status', 'active')

      if (orgStudents) {
        setStudents(orgStudents)
      }
    } catch (err) {
      console.warn('Erro ao carregar crianças da igreja:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveChild = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentChurch || !firstName.trim()) return

    setSaving(true)
    setFeedback(null)

    try {
      const { data: newChild, error: childErr } = await supabase
        .from('children')
        .insert({
          first_name: firstName.trim(),
          last_name: lastName.trim() || null,
          birth_date: birthDate || null
        })
        .select()
        .single()

      if (childErr) throw childErr

      const { error: studentErr } = await supabase
        .from('organization_students')
        .insert({
          organization_id: currentChurch.id,
          child_id: newChild.id,
          status: 'active'
        })

      if (studentErr) throw studentErr

      if (guardianName.trim()) {
        const { data: newGuardian } = await supabase
          .from('guardians')
          .insert({
            full_name: guardianName.trim(),
            phone: guardianPhone.trim() || null
          })
          .select()
          .single()

        if (newGuardian) {
          await supabase.from('child_guardians').insert({
            child_id: newChild.id,
            guardian_id: newGuardian.id,
            kinship: 'Responsável',
            is_primary: true,
            can_pickup: true
          })
        }
      }

      if (careNote.trim()) {
        await supabase.from('child_care_notes').insert({
          child_id: newChild.id,
          note_type: 'allergy',
          description: careNote.trim()
        })
      }

      if (selectedClassId) {
        await supabase.from('educational_class_students').insert({
          class_id: selectedClassId,
          child_id: newChild.id,
          student_name: `${firstName.trim()} ${lastName.trim()}`.trim(),
          guardian_name: guardianName.trim() || null,
          guardian_phone: guardianPhone.trim() || null
        })
      }

      setFeedback('Criança cadastrada com sucesso no Ministério Infantil!')
      setModalOpen(false)
      resetForm()
      await loadData()
    } catch (err: any) {
      console.error('Erro ao salvar criança:', err)
      setFeedback(`Erro ao salvar: ${err.message || 'Falha de autorização'}`)
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
    setCareNote('')
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
    return name.includes(searchTerm.toLowerCase())
  })

  return (
    <div className="s-page" style={{ padding: '0 0 60px 0' }}>
      {/* Top Header */}
      <section className="s-card" style={{ padding: '24px 28px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="s-badge s-badge--emerald">
                <Users size={12} /> MEMBROS MIRINS
              </span>
              <span style={{ fontSize: '13px', color: 'var(--s-text-muted)' }}>
                • {currentChurch?.name}
              </span>
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--s-text)', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
              Crianças do Ministério Infantil
            </h1>
            <p style={{ color: 'var(--s-text-muted)', fontSize: '14px', margin: 0 }}>
              Cadastro unificado de crianças, faixas etárias, responsáveis e observações de cuidado da igreja.
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="s-btn s-btn--primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={16} /> Cadastrar Nova Criança
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

      {/* Barra de Busca */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <Search size={18} color="var(--s-text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text"
          placeholder="Buscar criança por nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="s-input"
          style={{ width: '100%', height: '48px', paddingLeft: '44px', fontSize: '14px' }}
        />
      </div>

      {/* Grid / Tabela de Crianças */}
      <section className="s-card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--s-text-muted)', fontSize: '14px' }}>
            Carregando cadastro de crianças...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center' }}>
            <Users size={40} color="var(--s-text-muted)" style={{ margin: '0 auto 12px auto' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--s-text)', margin: '0 0 6px 0' }}>
              Nenhuma criança encontrada
            </h3>
            <p style={{ color: 'var(--s-text-muted)', fontSize: '13px', margin: '0 auto 16px auto', maxWidth: '420px' }}>
              Cadastre as crianças que participam do culto infantil e das classes da EBD para emitir credenciais de check-in.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="s-btn s-btn--primary"
            >
              Cadastrar Primeira Criança
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--s-border)', background: 'var(--s-surface-container-low)' }}>
                  <th style={{ padding: '14px 20px', fontSize: '12px', color: 'var(--s-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Criança</th>
                  <th style={{ padding: '14px 20px', fontSize: '12px', color: 'var(--s-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Idade</th>
                  <th style={{ padding: '14px 20px', fontSize: '12px', color: 'var(--s-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '14px 20px', fontSize: '12px', color: 'var(--s-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Igreja</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => {
                  const age = calculateAge(s.child?.birth_date)
                  return (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--s-border)', transition: 'background 0.15s ease' }}>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--s-primary-container-soft)', color: 'var(--s-primary)', fontWeight: 800, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {s.child?.first_name?.[0] || 'C'}
                          </div>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--s-text)' }}>
                            {s.child?.first_name} {s.child?.last_name || ''}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--s-text)' }}>
                        {age !== null ? `${age} anos` : 'Não informada'}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span className="s-badge s-badge--emerald">
                          {s.status?.toUpperCase() || 'ATIVO'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--s-text-muted)' }}>
                        {currentChurch?.name}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modal de Cadastro de Criança */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div className="s-card" style={{ maxWidth: '520px', width: '100%', padding: '28px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--s-text)', margin: 0 }}>
                Cadastrar Criança na Igreja
              </h2>
              <button onClick={() => setModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--s-text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveChild} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="s-label" style={{ marginBottom: '6px' }}>Nome *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Ex: Samuel"
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
                    placeholder="Ex: Silva"
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
                <label className="s-label" style={{ marginBottom: '6px' }}>Classe / Turma EBD</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="s-select"
                  style={{ width: '100%', height: '42px' }}
                >
                  <option value="">Selecione uma turma (opcional)</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.age_group ? `(${c.age_group})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ borderTop: '1px solid var(--s-border)', paddingTop: '16px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--s-emerald)', display: 'block', marginBottom: '12px' }}>
                  Responsável Principal
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="s-label" style={{ marginBottom: '6px' }}>Nome do Responsável</label>
                    <input
                      type="text"
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                      placeholder="Ex: Maria Silva"
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

              <div>
                <label className="s-label" style={{ marginBottom: '6px' }}>
                  Alergias ou Observações de Cuidado (Opcional)
                </label>
                <input
                  type="text"
                  value={careNote}
                  onChange={(e) => setCareNote(e.target.value)}
                  placeholder="Ex: Alergia a amendoim, intolerância a lactose..."
                  className="s-input"
                  style={{ width: '100%', height: '42px' }}
                />
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
                  {saving ? 'Salvando...' : 'Salvar Criança'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
