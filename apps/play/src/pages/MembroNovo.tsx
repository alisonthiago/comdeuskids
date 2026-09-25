import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  UserPlus, ChevronLeft, CheckCircle2, Shield,
  Mail, User, BookOpen, Sparkles, Check
} from 'lucide-react'

export default function MembroNovo() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'professor' | 'monitor' | 'lider' | 'gestor'>('professor')
  const [assignedClass, setAssignedClass] = useState('jardim-da-fe')
  const [permissions, setPermissions] = useState({
    manageAttendance: true,
    assignLessons: true,
    downloadMaterials: true,
    viewReports: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSuccess(true)
      setTimeout(() => {
        navigate('/membros')
      }, 1500)
    }, 800)
  }

  const togglePermission = (key: keyof typeof permissions) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div style={{
      maxWidth: 760,
      margin: '0 auto',
      padding: '24px 16px 80px',
      fontFamily: "'Baloo 2', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      {/* Voltar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button
          type="button"
          onClick={() => navigate('/membros')}
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
          Voltar para Membros
        </button>
      </div>

      <div style={{
        backgroundColor: '#1c1b1d',
        borderRadius: 24,
        padding: '32px 28px',
        border: '1px solid #2a2a2c',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.45)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: -30,
          right: -30,
          width: 180,
          height: 180,
          borderRadius: '50%',
          backgroundColor: 'rgba(160, 120, 255, 0.15)',
          filter: 'blur(50px)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: 'rgba(34, 197, 94, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#22c55e'
          }}>
            <UserPlus size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Convidar Novo Educador / Membro
            </h1>
            <p style={{ fontSize: 13, color: '#958ea0', margin: '3px 0 0' }}>
              O educador receberá um e-mail com link de ativação individual para acessar suas turmas.
            </p>
          </div>
        </div>

        {isSuccess ? (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12
          }}>
            <CheckCircle2 size={48} color="#7bd0ff" />
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Convite Enviado com Sucesso!
            </h3>
            <p style={{ fontSize: 14, color: '#cbc3d7', margin: 0 }}>
              Um link foi enviado para <strong>{email}</strong>. Redirecionando para a equipe...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Nome Completo */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#cbc3d7', marginBottom: 8 }}>
                Nome Completo do Educador
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#201f21',
                border: '1px solid #2a2a2c',
                borderRadius: 14,
                padding: '12px 16px',
                gap: 10
              }}>
                <User size={18} color="#958ea0" />
                <input
                  type="text"
                  required
                  placeholder="Ex.: Rebeca Silveira"
                  value={name}
                  onChange={e => setName(e.target.value)}
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
            </div>

            {/* E-mail de Acesso */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#cbc3d7', marginBottom: 8 }}>
                E-mail Institucional ou Pessoal
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#201f21',
                border: '1px solid #2a2a2c',
                borderRadius: 14,
                padding: '12px 16px',
                gap: 10
              }}>
                <Mail size={18} color="#958ea0" />
                <input
                  type="email"
                  required
                  placeholder="rebeca.silveira@igreja.org"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
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
            </div>

            {/* Função / Papel */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#cbc3d7', marginBottom: 8 }}>
                Papel na Organização
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
                {[
                  { id: 'professor', title: 'Professor(a)', desc: 'Gere turma e aulas' },
                  { id: 'monitor', title: 'Monitor(a)', desc: 'Apoio e chamada' },
                  { id: 'lider', title: 'Líder de EBD', desc: 'Coordena turmas' },
                  { id: 'gestor', title: 'Gestor Geral', desc: 'Acesso total' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRole(item.id as any)}
                    style={{
                      backgroundColor: role === item.id ? 'rgba(34, 197, 94, 0.15)' : '#201f21',
                      border: `1px solid ${role === item.id ? '#22c55e' : '#2a2a2c'}`,
                      borderRadius: 14,
                      padding: '14px 12px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 800, color: role === item.id ? '#22c55e' : '#ffffff' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: 11, color: '#958ea0', marginTop: 4 }}>
                      {item.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Turma Atribuída */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#cbc3d7', marginBottom: 8 }}>
                Turma Atribuída Inicialmente
              </label>
              <select
                value={assignedClass}
                onChange={e => setAssignedClass(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#201f21',
                  border: '1px solid #2a2a2c',
                  borderRadius: 14,
                  padding: '12px 16px',
                  color: '#ffffff',
                  fontSize: 14,
                  outline: 'none'
                }}
              >
                <option value="maternal">Maternal das Promessas (2 a 3 anos)</option>
                <option value="jardim-da-fe">Jardim da Fé (4 a 6 anos)</option>
                <option value="kids-1">Kids 1 — Arca da Verdade (7 a 9 anos)</option>
                <option value="juniores">Juniores — Guerreiros da Luz (10 a 12 anos)</option>
                <option value="todas">Todas as Turmas (Coordenação Geral)</option>
              </select>
            </div>

            {/* Permissões Específicas */}
            <div style={{ backgroundColor: '#201f21', borderRadius: 16, padding: '16px 20px', border: '1px solid #2a2a2c' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#cbc3d7', marginBottom: 12 }}>
                Permissões da Conta
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { key: 'manageAttendance' as const, label: 'Fazer chamada e controlar frequência dos alunos' },
                  { key: 'assignLessons' as const, label: 'Definir vídeos e histórias em destaque na semana' },
                  { key: 'downloadMaterials' as const, label: 'Baixar PDFs e atividades para impressão' },
                  { key: 'viewReports' as const, label: 'Visualizar relatórios gerais de engajamento' }
                ].map(p => (
                  <label
                    key={p.key}
                    onClick={() => togglePermission(p.key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      cursor: 'pointer',
                      fontSize: 13,
                      color: '#ffffff'
                    }}
                  >
                    <div style={{
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      backgroundColor: permissions[p.key] ? '#22c55e' : '#1c1b1d',
                      border: `1px solid ${permissions[p.key] ? '#22c55e' : '#353437'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#052e16',
                      flexShrink: 0
                    }}>
                      {permissions[p.key] && <Check size={14} />}
                    </div>
                    <span>{p.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Ações */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, marginTop: 10 }}>
              <button
                type="button"
                onClick={() => navigate('/membros')}
                style={{
                  backgroundColor: 'transparent',
                  color: '#cbc3d7',
                  border: '1px solid #2a2a2c',
                  borderRadius: 14,
                  padding: '12px 20px',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  backgroundColor: '#22c55e',
                  color: '#052e16',
                  border: 'none',
                  borderRadius: 14,
                  padding: '12px 28px',
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(160, 120, 255, 0.4)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <UserPlus size={18} />
                {isSubmitting ? 'Enviando Convite...' : 'Enviar Convite'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
