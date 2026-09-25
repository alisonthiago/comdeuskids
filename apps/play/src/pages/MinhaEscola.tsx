import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  GraduationCap, CheckCircle2, Play, Download, Eye,
  Users, UserPlus, Sparkles, Plus, MoreVertical,
  BookOpen, FileText, ShieldCheck, ChevronRight, Award,
  Calendar, School, ArrowRight, Clock, Star
} from 'lucide-react'

export default function MinhaEscola() {
  const navigate = useNavigate()
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2500)
  }

  const schoolClasses = [
    {
      id: 'maternal',
      name: 'Maternal das Promessas',
      ageRange: '2 a 3 anos',
      studentsCount: 18,
      teacherName: 'Tia Débora',
      teacherAvatar: '/avatars/sara.png',
      currentLesson: 'A Criação do Mundo',
      currentLessonThumb: '/thumbnails/criacao.jpg',
      progressPct: 85,
      nextClassTime: 'Segunda-feira • 09:00'
    },
    {
      id: 'jardim-da-fe',
      name: 'Jardim da Fé',
      ageRange: '4 a 6 anos',
      studentsCount: 32,
      teacherName: 'Profª Ana Lúcia',
      teacherAvatar: '/avatars/profa_ana.png',
      currentLesson: 'Davi e Golias: Coragem no Senhor',
      currentLessonThumb: '/thumbnails/davi.jpg',
      progressPct: 92,
      nextClassTime: 'Terça-feira • 14:00'
    },
    {
      id: 'kids-1',
      name: 'Kids 1 — Arca da Verdade',
      ageRange: '7 a 9 anos',
      studentsCount: 45,
      teacherName: 'Prof. Marcos Rocha',
      teacherAvatar: '/avatars/davi.png',
      currentLesson: 'A Arca de Noé: A Aliança Eterna',
      currentLessonThumb: '/thumbnails/noe.jpg',
      progressPct: 78,
      nextClassTime: 'Quarta-feira • 10:00'
    },
    {
      id: 'juniores',
      name: 'Juniores — Guerreiros da Luz',
      ageRange: '10 a 12 anos',
      studentsCount: 47,
      teacherName: 'Profª Raquel Santos',
      teacherAvatar: '/avatars/sara.png',
      currentLesson: 'Daniel na Cova dos Leões',
      currentLessonThumb: '/thumbnails/daniel_leoes.jpg',
      progressPct: 65,
      nextClassTime: 'Quinta-feira • 15:30'
    }
  ]

  const teachers = [
    { name: 'Profª Ana Lúcia', role: 'Coordenadora Pedagógica', classes: 'Jardim da Fé', avatar: '/avatars/profa_ana.png', status: 'Ativo' },
    { name: 'Tia Débora', role: 'Professora Titular', classes: 'Maternal das Promessas', avatar: '/avatars/sara.png', status: 'Ativo' },
    { name: 'Prof. Marcos Rocha', role: 'Professor Titular', classes: 'Kids 1 — Arca da Verdade', avatar: '/avatars/davi.png', status: 'Ativo' },
    { name: 'Profª Raquel Santos', role: 'Professora Titular', classes: 'Juniores — Guerreiros da Luz', avatar: '/avatars/sara.png', status: 'Ativo' },
    { name: 'Lucas Gabriel', role: 'Monitor Assistente', classes: 'Apoio Geral', avatar: '/avatars/pedro.png', status: 'Ativo' }
  ]

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#131315',
      color: '#e5e1e4',
      paddingTop: 104,
      paddingBottom: 96,
      fontFamily: "'Baloo 2', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      <div className="cdk-content-container" style={{ maxWidth: 1440, margin: '0 auto' }}>

        {/* ============================================================
            HEADER INSTITUCIONAL DA ESCOLA
            ============================================================ */}
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
            top: -50,
            right: -50,
            width: 220,
            height: 220,
            borderRadius: '50%',
            backgroundColor: 'rgba(160, 120, 255, 0.15)',
            filter: 'blur(50px)',
            pointerEvents: 'none'
          }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', marginBottom: 24, position: 'relative', zIndex: 2 }}>
            <div style={{
              position: 'relative',
              width: 76,
              height: 76,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #7bd0ff 0%, #22c55e 100%)',
              padding: 3,
              boxShadow: '0 8px 24px rgba(123, 208, 255, 0.35)',
              flexShrink: 0
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                backgroundColor: '#0e0e10',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#7bd0ff'
              }}>
                <GraduationCap size={38} />
              </div>
              <span style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 22,
                height: 22,
                borderRadius: '50%',
                backgroundColor: '#7bd0ff',
                color: '#00354a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #131315'
              }}>
                <CheckCircle2 size={14} />
              </span>
            </div>

            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                <span style={{
                  backgroundColor: 'rgba(123, 208, 255, 0.15)',
                  color: '#7bd0ff',
                  padding: '3px 10px',
                  borderRadius: 9999,
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase'
                }}>
                  Plano Escola Ativo
                </span>
                <span style={{ color: '#958ea0', fontSize: 13 }}>•</span>
                <span style={{ color: '#cbc3d7', fontSize: 13 }}>Ano Letivo 2026</span>
              </div>

              <h1 style={{
                fontSize: 'clamp(24px, 4vw, 32px)',
                fontWeight: 800,
                color: '#ffffff',
                margin: 0,
                lineHeight: 1.15
              }}>
                Colégio Cristão Princípios da Fé
              </h1>

              <p style={{ fontSize: 13, color: '#cbc3d7', margin: '4px 0 0' }}>
                Gestão Pedagógica • Educação Infantil e Fundamental I
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/membros/novo')}
                style={{
                  height: 42,
                  padding: '0 18px',
                  borderRadius: 12,
                  backgroundColor: '#22c55e',
                  color: '#052e16',
                  fontSize: 13,
                  fontWeight: 800,
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(34, 197, 94, 0.35)',
                  transition: 'transform 0.15s ease'
                }}
              >
                <UserPlus size={16} />
                <span>Convidar Educador</span>
              </button>

              <button
                onClick={() => showToast('Relatório pedagógico consolidado gerado em PDF!')}
                style={{
                  height: 42,
                  padding: '0 16px',
                  borderRadius: 12,
                  backgroundColor: '#2a2a2c',
                  color: '#e5e1e4',
                  fontSize: 13,
                  fontWeight: 700,
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer'
                }}
              >
                <Download size={16} />
                <span>Relatório Geral</span>
              </button>
            </div>
          </div>

          {/* 4 CARDS DE MÉTRICAS */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12
          }}>
            {[
              { label: 'Turmas Ativas', value: '4 Turmas', icon: School, color: '#7bd0ff' },
              { label: 'Alunos Matriculados', value: '142 Alunos', icon: Users, color: '#22c55e' },
              { label: 'Educadores & Monitores', value: '5 Membros', icon: Award, color: '#ffb95f' },
              { label: 'Atividades Impressas', value: '680 Cópias', icon: BookOpen, color: '#ffddb8' }
            ].map((stat, idx) => {
              const Icon = stat.icon
              return (
                <div key={idx} style={{
                  padding: 14,
                  borderRadius: 14,
                  backgroundColor: '#201f21',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    backgroundColor: `${stat.color}20`,
                    color: stat.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: '#cbc3d7', display: 'block' }}>{stat.label}</span>
                    <strong style={{ fontSize: 16, fontWeight: 800, color: '#ffffff' }}>{stat.value}</strong>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ============================================================
            TURMAS DA ESCOLA (GESTÃO DIRETA)
            ============================================================ */}
        <section style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <School size={22} color="#7bd0ff" />
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#e5e1e4', margin: 0 }}>
                Turmas & Salas de Aula
              </h2>
            </div>
            <span style={{ fontSize: 12, color: '#cbc3d7' }}>
              4 turmas registradas
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 16
          }}>
            {schoolClasses.map(turma => (
              <div
                key={turma.id}
                onClick={() => navigate(`/turmas/${turma.id}`)}
                style={{
                  backgroundColor: '#1c1b1d',
                  borderRadius: 18,
                  padding: 18,
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  transition: 'transform 0.15s ease, border-color 0.15s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.borderColor = 'rgba(123, 208, 255, 0.3)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                  <div>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 9999,
                      backgroundColor: 'rgba(123, 208, 255, 0.15)',
                      color: '#7bd0ff',
                      fontSize: 11,
                      fontWeight: 800
                    }}>
                      {turma.ageRange}
                    </span>
                    <h3 style={{ fontSize: 17, fontWeight: 800, color: '#ffffff', margin: '6px 0 2px' }}>
                      {turma.name}
                    </h3>
                    <span style={{ fontSize: 12, color: '#cbc3d7' }}>
                      {turma.studentsCount} alunos matriculados
                    </span>
                  </div>

                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    backgroundColor: '#2a2a2c',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#7bd0ff',
                    flexShrink: 0
                  }}>
                    <ChevronRight size={18} />
                  </div>
                </div>

                {/* Professor Responsável */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 10, backgroundColor: '#201f21' }}>
                  <img
                    src={turma.teacherAvatar}
                    alt={turma.teacherName}
                    style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                    onError={e => { (e.target as HTMLImageElement).src = '/avatars/profa_ana.png' }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#e5e1e4' }}>{turma.teacherName}</span>
                    <span style={{ fontSize: 10, color: '#958ea0' }}>Docente Titular</span>
                  </div>
                </div>

                {/* Conteúdo Atribuído da Semana */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img
                    src={turma.currentLessonThumb}
                    alt={turma.currentLesson}
                    style={{ width: 54, height: 36, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
                    onError={e => { (e.target as HTMLImageElement).src = '/thumbnails/davi.jpg' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#ffb95f', textTransform: 'uppercase' }}>Lição da Semana</span>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#e5e1e4', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {turma.currentLesson}
                    </p>
                  </div>
                </div>

                {/* Barra de Progresso Pedagógico */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                    <span style={{ color: '#cbc3d7' }}>Cumprimento do Plano:</span>
                    <strong style={{ color: '#7bd0ff' }}>{turma.progressPct}%</strong>
                  </div>
                  <div style={{ width: '100%', height: 5, borderRadius: 9999, backgroundColor: '#2a2a2c', overflow: 'hidden' }}>
                    <div style={{ width: `${turma.progressPct}%`, height: '100%', backgroundColor: '#7bd0ff' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================
            EQUIPE DE EDUCADORES & MEMBROS ESCOLARES
            ============================================================ */}
        <section style={{
          backgroundColor: '#1c1b1d',
          borderRadius: 24,
          padding: 24,
          border: '1px solid #2a2a2c',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          marginBottom: 36
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={20} color="#22c55e" />
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#e5e1e4', margin: 0 }}>
                Corpo Docente & Monitores
              </h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => navigate('/membros')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#22c55e',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <span>Ver Todos ({teachers.length})</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {teachers.map((m, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 12,
                backgroundColor: '#201f21',
                border: '1px solid rgba(255,255,255,0.03)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img
                    src={m.avatar}
                    alt={m.name}
                    style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                    onError={e => { (e.target as HTMLImageElement).src = '/avatars/profa_ana.png' }}
                  />
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#e5e1e4', display: 'block' }}>{m.name}</span>
                    <span style={{ fontSize: 11, color: '#958ea0' }}>{m.role} • {m.classes}</span>
                  </div>
                </div>

                <span style={{
                  padding: '2px 8px',
                  borderRadius: 9999,
                  backgroundColor: 'rgba(123, 208, 255, 0.15)',
                  color: '#7bd0ff',
                  fontSize: 10,
                  fontWeight: 800
                }}>
                  {m.status}
                </span>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* Toast Feedback */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(32, 31, 33, 0.95)',
          backdropFilter: 'blur(16px)',
          border: '1px solid #7bd0ff',
          color: '#7bd0ff',
          padding: '10px 20px',
          borderRadius: 9999,
          fontSize: 13,
          fontWeight: 800,
          zIndex: 100,
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)'
        }}>
          {toastMessage}
        </div>
      )}
    </div>
  )
}
