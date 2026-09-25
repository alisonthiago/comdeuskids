import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Users, UserPlus, Search, Shield, Mail, Phone,
  CheckCircle2, Clock, MoreVertical, Trash2, Edit2,
  ChevronLeft, Sparkles, Filter, Lock
} from 'lucide-react'

interface Member {
  id: string
  name: string
  email: string
  role: 'gestor' | 'professor' | 'lider' | 'monitor'
  roleLabel: string
  status: 'ativo' | 'convidado' | 'inativo'
  turma?: string
  lastAccess: string
  avatar: string
}

export default function Membros() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'gestor' | 'professor' | 'lider' | 'monitor'>('all')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const [members, setMembers] = useState<Member[]>([
    {
      id: '1',
      name: 'Pastor Samuel Mendes',
      email: 'pastor.samuel@comunidade.com',
      role: 'gestor',
      roleLabel: 'Administrador / Gestor Geral',
      status: 'ativo',
      turma: 'Todas as Turmas',
      lastAccess: 'Hoje às 08:30',
      avatar: '/avatars/pastor_samuel.png'
    },
    {
      id: '2',
      name: 'Tia Débora Santos',
      email: 'debora.santos@ebd.com',
      role: 'professor',
      roleLabel: 'Professora Titular',
      status: 'ativo',
      turma: 'Maternal das Promessas',
      lastAccess: 'Hoje às 09:15',
      avatar: '/avatars/tia_debora.png'
    },
    {
      id: '3',
      name: 'Profª Ana Lúcia',
      email: 'ana.lucia@escola.comdeuskids.com',
      role: 'professor',
      roleLabel: 'Professora Titular',
      status: 'ativo',
      turma: 'Jardim da Fé',
      lastAccess: 'Ontem às 17:40',
      avatar: '/avatars/profa_ana.png'
    },
    {
      id: '4',
      name: 'Lucas Ferreira',
      email: 'lucas.f@igreja.org',
      role: 'lider',
      roleLabel: 'Líder Ministério Infantil',
      status: 'ativo',
      turma: 'Juniores Guerreiros',
      lastAccess: 'Há 2 dias',
      avatar: '/avatars/davi.png'
    },
    {
      id: '5',
      name: 'Mariana Costa',
      email: 'mariana.costa@gmail.com',
      role: 'monitor',
      roleLabel: 'Monitora de Apoio',
      status: 'convidado',
      turma: 'Maternal das Promessas',
      lastAccess: 'Aguardando aceite',
      avatar: '/avatars/sara.png'
    }
  ])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleResendInvite = (email: string) => {
    showToast(`Convite reenviado com sucesso para ${email}!`)
  }

  const handleDeleteMember = (id: string, name: string) => {
    if (confirm(`Deseja remover o acesso de ${name}?`)) {
      setMembers(prev => prev.filter(m => m.id !== id))
      showToast(`Acesso de ${name} revogado.`)
    }
  }

  const filteredMembers = members.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || m.role === roleFilter
    return matchesSearch && matchesRole
  })

  return (
    <div style={{
      maxWidth: 1360,
      margin: '0 auto',
      padding: '104px 16px 96px',
      fontFamily: "'Baloo 2', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      {/* Toast flutuante */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          backgroundColor: '#201f21',
          color: '#ffffff',
          border: '1px solid #22c55e',
          borderRadius: 14,
          padding: '12px 20px',
          fontSize: 14,
          fontWeight: 700,
          boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <CheckCircle2 size={18} color="#7bd0ff" />
          {toastMessage}
        </div>
      )}

      {/* Voltar & Migalha */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid #2a2a2c',
            borderRadius: 12,
            padding: '8px 14px',
            color: '#cbc3d7',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <ChevronLeft size={16} />
          Voltar
        </button>
        <span style={{ fontSize: 13, color: '#958ea0' }}>•</span>
        <span style={{ fontSize: 13, color: '#4ade80', fontWeight: 700 }}>Gestão de Membros e Equipe</span>
      </div>

      {/* Header Institucional de Membros */}
      <section style={{
        position: 'relative',
        backgroundColor: '#1c1b1d',
        borderRadius: 24,
        padding: '28px 24px',
        border: '1px solid #2a2a2c',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.45)',
        marginBottom: 28,
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 220,
          height: 220,
          borderRadius: '50%',
          backgroundColor: 'rgba(160, 120, 255, 0.12)',
          filter: 'blur(50px)',
          pointerEvents: 'none'
        }} />

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
          position: 'relative',
          zIndex: 2
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Users size={18} color="#ffb95f" />
              <span style={{ fontSize: 12, fontWeight: 800, color: '#ffb95f', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Organização & Permissões
              </span>
            </div>
            <h1 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 800, color: '#ffffff', margin: '0 0 8px' }}>
              Equipe e Educadores
            </h1>
            <p style={{ fontSize: 14, color: '#cbc3d7', margin: 0, maxWidth: 620 }}>
              Gerencie quem tem acesso individual à plataforma para dar aulas, acompanhar turmas e lançar atividades com Deus Kids.
            </p>
          </div>

          <Link
            to="/membros/novo"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: '#22c55e',
              color: '#052e16',
              padding: '12px 24px',
              borderRadius: 14,
              fontSize: 14,
              fontWeight: 800,
              textDecoration: 'none',
              boxShadow: '0 8px 24px rgba(34, 197, 94, 0.35)',
              transition: 'all 0.2s ease'
            }}
          >
            <UserPlus size={18} />
            Convidar Membro
          </Link>
        </div>

        {/* Resumo de Licenças e Vagas */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 14,
          marginTop: 24,
          paddingTop: 20,
          borderTop: '1px solid #2a2a2c'
        }}>
          <div style={{ backgroundColor: '#201f21', padding: '14px 16px', borderRadius: 14 }}>
            <div style={{ fontSize: 12, color: '#958ea0', fontWeight: 600 }}>Licenças Ativas</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', marginTop: 4 }}>
              {members.length} <span style={{ fontSize: 13, color: '#958ea0' }}>/ 10 vagas</span>
            </div>
          </div>
          <div style={{ backgroundColor: '#201f21', padding: '14px 16px', borderRadius: 14 }}>
            <div style={{ fontSize: 12, color: '#958ea0', fontWeight: 600 }}>Professores & Monitores</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#7bd0ff', marginTop: 4 }}>
              {members.filter(m => m.role === 'professor' || m.role === 'monitor').length}
            </div>
          </div>
          <div style={{ backgroundColor: '#201f21', padding: '14px 16px', borderRadius: 14 }}>
            <div style={{ fontSize: 12, color: '#958ea0', fontWeight: 600 }}>Gestores & Líderes</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#ffb95f', marginTop: 4 }}>
              {members.filter(m => m.role === 'gestor' || m.role === 'lider').length}
            </div>
          </div>
          <div style={{ backgroundColor: '#201f21', padding: '14px 16px', borderRadius: 14 }}>
            <div style={{ fontSize: 12, color: '#958ea0', fontWeight: 600 }}>Convites Pendentes</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#4ade80', marginTop: 4 }}>
              {members.filter(m => m.status === 'convidado').length}
            </div>
          </div>
        </div>
      </section>

      {/* Barra de Busca e Filtros */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 14,
        marginBottom: 20
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#1c1b1d',
          border: '1px solid #2a2a2c',
          borderRadius: 14,
          padding: '8px 16px',
          flex: '1 1 280px',
          maxWidth: 400
        }}>
          <Search size={18} color="#958ea0" style={{ marginRight: 10 }} />
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              background: 'none',
              border: 'none',
              outline: 'none',
              color: '#ffffff',
              fontSize: 14,
              width: '100%'
            }}
          />
        </div>

        {/* Chips de filtro de papel */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'Todos' },
            { id: 'gestor', label: 'Gestores' },
            { id: 'professor', label: 'Professores' },
            { id: 'lider', label: 'Líderes' },
            { id: 'monitor', label: 'Monitores' }
          ].map(chip => (
            <button
              key={chip.id}
              type="button"
              onClick={() => setRoleFilter(chip.id as any)}
              style={{
                background: roleFilter === chip.id ? '#22c55e' : '#1c1b1d',
                color: roleFilter === chip.id ? '#052e16' : '#cbc3d7',
                border: '1px solid #2a2a2c',
                borderRadius: 20,
                padding: '7px 16px',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Membros */}
      <div style={{
        backgroundColor: '#1c1b1d',
        borderRadius: 20,
        border: '1px solid #2a2a2c',
        overflow: 'hidden'
      }}>
        {filteredMembers.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: '#958ea0' }}>
            Nenhum membro encontrado com os filtros aplicados.
          </div>
        ) : (
          filteredMembers.map((member, idx) => (
            <div
              key={member.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '18px 22px',
                borderBottom: idx === filteredMembers.length - 1 ? 'none' : '1px solid #2a2a2c',
                flexWrap: 'wrap',
                gap: 16,
                transition: 'background-color 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <img
                  src={member.avatar}
                  alt={member.name}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #2a2a2c'
                  }}
                  onError={e => { (e.target as HTMLImageElement).src = '/avatars/davi.png' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: '#ffffff' }}>
                      {member.name}
                    </span>
                    <span style={{
                      backgroundColor: member.role === 'gestor' ? 'rgba(255, 185, 95, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                      color: member.role === 'gestor' ? '#ffb95f' : '#22c55e',
                      fontSize: 11,
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 12
                    }}>
                      {member.roleLabel}
                    </span>
                    {member.status === 'convidado' && (
                      <span style={{
                        backgroundColor: 'rgba(255, 180, 171, 0.15)',
                        color: '#ffb4ab',
                        fontSize: 11,
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: 12
                      }}>
                        Pendente
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: '#958ea0', marginTop: 4 }}>
                    {member.email} • {member.turma || 'Geral'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ textAlign: 'right', marginRight: 8 }}>
                  <div style={{ fontSize: 11, color: '#958ea0' }}>Último acesso</div>
                  <div style={{ fontSize: 12, color: '#cbc3d7', fontWeight: 600 }}>{member.lastAccess}</div>
                </div>

                {member.status === 'convidado' ? (
                  <button
                    type="button"
                    onClick={() => handleResendInvite(member.email)}
                    style={{
                      background: 'rgba(34, 197, 94, 0.15)',
                      color: '#22c55e',
                      border: '1px solid #22c55e',
                      borderRadius: 10,
                      padding: '6px 12px',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Reenviar Convite
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => showToast(`Permissões de ${member.name} abertas para edição`)}
                    style={{
                      background: '#201f21',
                      color: '#cbc3d7',
                      border: '1px solid #2a2a2c',
                      borderRadius: 10,
                      padding: '6px 12px',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Editar Papel
                  </button>
                )}

                {member.role !== 'gestor' && (
                  <button
                    type="button"
                    onClick={() => handleDeleteMember(member.id, member.name)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ffb4ab',
                      cursor: 'pointer',
                      padding: 6,
                      borderRadius: 8
                    }}
                    title="Remover Acesso"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
