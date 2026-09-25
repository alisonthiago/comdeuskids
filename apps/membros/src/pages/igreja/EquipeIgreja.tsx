import React, { useState, useEffect } from 'react'
import {
  Users,
  Shield,
  Plus,
  Mail,
  CheckCircle2,
  Lock,
  UserCheck,
  X,
  Sparkles,
  HeartHandshake
} from 'lucide-react'
import { useChurch } from '../../hooks/useChurch'
import { supabase } from '@comdeuskids/supabase'

export function EquipeIgreja() {
  const { currentChurch, hasCapability, role: myRole } = useChurch()
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [memberRole, setMemberRole] = useState('teacher')
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    loadTeam()
  }, [currentChurch])

  const loadTeam = async () => {
    if (!currentChurch) return
    setLoading(true)
    try {
      const { data } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', currentChurch.id)
        .eq('is_active', true)

      if (data) setMembers(data)
    } catch (err) {
      console.warn('Erro ao carregar equipe:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentChurch || !userEmail.trim()) return

    setSaving(true)
    setFeedback(null)

    try {
      const { data: userData } = await supabase.auth.getUser()
      const currentUserId = userData?.user?.id

      if (!currentUserId) throw new Error('Não autenticado')

      const { error } = await supabase.from('organization_members').insert({
        organization_id: currentChurch.id,
        user_id: currentUserId,
        role: memberRole,
        is_active: true
      })

      if (error) throw error

      setFeedback(`Membro registrado na equipe como ${memberRole}!`)
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
    owner: { label: 'Pastor / Líder Geral', color: 'var(--s-primary)', desc: 'Acesso irrestrito a configurações, equipe e relatórios' },
    admin: { label: 'Administrador Kids', color: '#005ac2', desc: 'Gestão operacional de turmas, aulas e membros' },
    coordinator: { label: 'Coordenador(a) do Ministério', color: 'var(--s-emerald)', desc: 'Gestão da escala, turmas, aulas e supervisão do check-in' },
    teacher: { label: 'Professor(a) de Sala', color: '#d97706', desc: 'Criação de aulas para suas turmas e chamada de retirada na sala' },
    reception: { label: 'Recepção & Portaria', color: '#db2777', desc: 'Operação rápida de entrada, crachás térmicos e entrega final' }
  }

  return (
    <div className="s-page" style={{ padding: '0 0 60px 0' }}>
      {/* Top Header */}
      <section className="s-card" style={{ padding: '24px 28px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="s-badge s-badge--emerald">
                <HeartHandshake size={12} /> CORPO DE VOLUNTÁRIOS
              </span>
              <span style={{ fontSize: '13px', color: 'var(--s-text-muted)' }}>
                • {currentChurch?.name}
              </span>
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--s-text)', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
              Equipe do Ministério Infantil
            </h1>
            <p style={{ color: 'var(--s-text-muted)', fontSize: '14px', margin: 0 }}>
              Líderes, coordenadores, professores e recepcionistas com permissões por capability.
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

      {/* Cards de Papéis & Capabilities */}
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
                      L
                    </div>
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--s-text)', display: 'block' }}>
                        Liderança Geral (Você)
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--s-text-muted)' }}>Titular da Organização</span>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <span className="s-badge s-badge--primary">
                    LÍDER GERAL
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
                        Equipe Kids
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
                  placeholder="ex: voluntario@igreja.com"
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
                  <option value="coordinator">Coordenador(a) do Ministério</option>
                  <option value="teacher">Professor(a) de Sala</option>
                  <option value="reception">Recepção & Check-in</option>
                  <option value="admin">Administrador(a) Kids</option>
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
