import React, { useState, useEffect } from 'react'
import {
  Users,
  Shield,
  Plus,
  Mail,
  CheckCircle2,
  Lock,
  GraduationCap,
  Bus,
  X
} from 'lucide-react'
import { useSchool } from '../../hooks/useSchool'
import { supabase } from '@comdeuskids/supabase'

export function EquipeEscola() {
  const { currentSchool, hasCapability } = useSchool()
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [memberRole, setMemberRole] = useState('teacher')
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    loadTeam()
  }, [currentSchool])

  const loadTeam = async () => {
    if (!currentSchool) return
    setLoading(true)
    try {
      const { data } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', currentSchool.id)
        .eq('is_active', true)

      if (data) setMembers(data)
    } catch (err) {
      console.warn('Erro ao carregar equipe escolar:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentSchool || !userEmail.trim()) return

    setSaving(true)
    setFeedback(null)

    try {
      const { data: userData } = await supabase.auth.getUser()
      const currentUserId = userData?.user?.id
      if (!currentUserId) throw new Error('Não autenticado')

      const { error } = await supabase.from('organization_members').insert({
        organization_id: currentSchool.id,
        user_id: currentUserId,
        role: memberRole,
        is_active: true
      })

      if (error) throw error

      setFeedback(`Membro adicionado à equipe escolar como ${memberRole}!`)
      setModalOpen(false)
      setUserEmail('')
      await loadTeam()
    } catch (err: any) {
      setFeedback(`Erro ao adicionar membro: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const roleLabels: Record<string, { label: string; color: string; desc: string }> = {
    owner: { label: 'Direção Geral / Mantenedora', color: 'var(--s-primary)', desc: 'Gestão institucional plena, corpo docente e plano da escola' },
    admin: { label: 'Secretaria / Administração', color: '#005ac2', desc: 'Matrículas centrais, documentação e expedição escolar' },
    coordinator: { label: 'Coordenação Pedagógica', color: '#d97706', desc: 'Supervisão pedagógica de turmas, planejamento e avaliações' },
    teacher: { label: 'Professor(a) Regente', color: 'var(--s-emerald)', desc: 'Planejamento de aulas no Lesson Builder, tarefas e notas' },
    transport: { label: 'Operador(a) de Transporte', color: '#00714d', desc: 'Gestão de vans, motoristas e embarque/desembarque de alunos' }
  }

  return (
    <div className="s-page" style={{ padding: '0 0 60px 0' }}>
      {/* Top Header */}
      <section className="s-card" style={{ padding: '24px 28px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="s-badge s-badge--emerald">
                <GraduationCap size={12} /> CORPO DOCENTE
              </span>
              <span style={{ fontSize: '13px', color: 'var(--s-text-muted)' }}>
                • {currentSchool?.name}
              </span>
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--s-text)', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
              Corpo Docente & Equipe Escolar
            </h1>
            <p style={{ color: 'var(--s-text-muted)', fontSize: '14px', margin: 0 }}>
              Direção, coordenadores pedagógicos, professores e equipe de transporte escolar.
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="s-btn s-btn--primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={16} /> Adicionar Membro
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

      {/* Cards de Papéis */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {Object.entries(roleLabels).map(([key, info]) => (
          <div
            key={key}
            className="s-card"
            style={{
              padding: '18px',
              borderLeft: `4px solid ${info.color}`
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--s-text)', margin: 0 }}>
                {info.label}
              </h3>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--s-text-muted)', margin: 0, lineHeight: 1.4 }}>
              {info.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Lista de Membros Ativos */}
      <section className="s-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--s-border)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--s-text)', margin: 0 }}>
            Membros Ativos ({members.length + 1})
          </h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--s-border)', background: 'var(--s-surface-container-low)' }}>
                <th style={{ padding: '14px 20px', fontSize: '12px', color: 'var(--s-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Membro</th>
                <th style={{ padding: '14px 20px', fontSize: '12px', color: 'var(--s-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Papel / Função</th>
                <th style={{ padding: '14px 20px', fontSize: '12px', color: 'var(--s-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {/* Dono Principal */}
              <tr style={{ borderBottom: '1px solid var(--s-border)' }}>
                <td style={{ padding: '14px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--s-primary-container-soft)', color: 'var(--s-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px' }}>
                      D
                    </div>
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--s-text)', display: 'block' }}>
                        Direção Geral (Você)
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--s-text-muted)' }}>Titular da Escola</span>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <span className="s-badge s-badge--primary">
                    DIREÇÃO GERAL
                  </span>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <span className="s-badge s-badge--emerald">ATIVO</span>
                </td>
              </tr>

              {/* Demais membros */}
              {members.map((m) => {
                const info = roleLabels[m.role] || { label: m.role, color: 'var(--s-text-muted)' }
                return (
                  <tr key={m.id} style={{ borderBottom: '1px solid var(--s-border)' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--s-text)', display: 'block' }}>
                        Educador(a) / Colaborador(a)
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--s-text-muted)' }}>ID: {m.user_id.slice(0, 8)}...</span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span className="s-badge" style={{ background: 'var(--s-surface-container)', color: 'var(--s-text)' }}>
                        {info.label?.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span className="s-badge s-badge--emerald">ATIVO</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal Adicionar Membro */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div className="s-card" style={{ maxWidth: '440px', width: '100%', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--s-text)', margin: 0 }}>
                Adicionar Membro à Equipe
              </h2>
              <button onClick={() => setModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--s-text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="s-label" style={{ marginBottom: '6px' }}>Email do Membro *</label>
                <input
                  type="email"
                  required
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="ex: professor@escola.com"
                  className="s-input"
                  style={{ width: '100%', height: '42px' }}
                />
              </div>

              <div>
                <label className="s-label" style={{ marginBottom: '6px' }}>Papel / Função</label>
                <select
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value)}
                  className="s-select"
                  style={{ width: '100%', height: '42px' }}
                >
                  <option value="coordinator">Coordenação Pedagógica</option>
                  <option value="teacher">Professor(a) Regente</option>
                  <option value="transport">Operador(a) de Transporte</option>
                  <option value="admin">Secretaria / Administração</option>
                </select>
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
                  {saving ? 'Adicionando...' : 'Adicionar Membro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
