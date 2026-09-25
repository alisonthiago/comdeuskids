import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Users, Calendar, Clock, Play, Download, CheckCircle2,
  ChevronLeft, Award, BookOpen, FileText, Check, X,
  Sparkles, Plus, Edit2, ShieldAlert
} from 'lucide-react'
import { STREAM_CATALOG } from '../data/streamCatalog'

interface Student {
  id: string
  name: string
  avatar: string
  age: number
  present: boolean
  completedLessons: number
  totalLessons: number
  stars: number
}

export default function TurmaDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // Dados mockados realistas da turma baseados no ID ou padrão
  const classData = {
    id: id || 'jardim-da-fe',
    name: id === 'maternal' ? 'Maternal das Promessas' : id === 'kids-1' ? 'Kids 1 — Arca da Verdade' : 'Jardim da Fé',
    category: id === 'ebd' ? 'Escola Bíblica Dominical' : 'Ensino Fundamental Kids',
    ageRange: id === 'maternal' ? '2 a 3 anos' : id === 'kids-1' ? '7 a 9 anos' : '4 a 6 anos',
    teacher: {
      name: 'Profª Ana Lúcia',
      role: 'Educadora Principal',
      avatar: '/avatars/sara.png',
      email: 'ana.lucia@escola.comdeuskids.com'
    },
    room: 'Sala 03 — Andar Kids',
    schedule: 'Terças e Quintas • 14:00 às 15:30',
    currentLesson: STREAM_CATALOG.find(c => c.id === 'davi-golias') || STREAM_CATALOG[0],
    assignedMaterials: [
      { id: 'mat-1', title: 'Atividade de Colorir: A funda e a fé', size: '2.4 MB', type: 'PDF' },
      { id: 'mat-2', title: 'Guia do Professor: Lição 04 - Coragem', size: '1.8 MB', type: 'PDF' },
      { id: 'mat-3', title: 'Quiz Impresso: 5 Perguntas de Fixação', size: '890 KB', type: 'PDF' }
    ]
  }

  const [students, setStudents] = useState<Student[]>([
    { id: '1', name: 'Davi Lucas', avatar: '/avatars/davi.png', age: 5, present: true, completedLessons: 8, totalLessons: 10, stars: 45 },
    { id: '2', name: 'Sara Vitória', avatar: '/avatars/sara.png', age: 6, present: true, completedLessons: 10, totalLessons: 10, stars: 60 },
    { id: '3', name: 'Pedro Henrique', avatar: '/avatars/pedro.png', age: 5, present: false, completedLessons: 6, totalLessons: 10, stars: 32 },
    { id: '4', name: 'Rebeca Santos', avatar: '/avatars/rebeca.png', age: 4, present: true, completedLessons: 9, totalLessons: 10, stars: 52 },
    { id: '5', name: 'Mateus Oliveira', avatar: '/avatars/davi.png', age: 6, present: true, completedLessons: 7, totalLessons: 10, stars: 38 },
    { id: '6', name: 'Ester Ferreira', avatar: '/avatars/sara.png', age: 5, present: true, completedLessons: 10, totalLessons: 10, stars: 58 }
  ])

  const [attendanceSaved, setAttendanceSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'alunos' | 'atividades' | 'chamada'>('alunos')

  const toggleAttendance = (studentId: string) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, present: !s.present } : s))
    setAttendanceSaved(false)
  }

  const saveAttendance = () => {
    setAttendanceSaved(true)
    setTimeout(() => setAttendanceSaved(false), 3000)
  }

  const presentCount = students.filter(s => s.present).length

  return (
    <div style={{
      maxWidth: 1100,
      margin: '0 auto',
      padding: '24px 16px 80px',
      fontFamily: "'Baloo 2', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      {/* Botão Voltar & Migalha */}
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
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <ChevronLeft size={16} />
          Voltar
        </button>
        <span style={{ fontSize: 13, color: '#958ea0' }}>•</span>
        <span style={{ fontSize: 13, color: '#958ea0' }}>Turmas</span>
        <span style={{ fontSize: 13, color: '#958ea0' }}>•</span>
        <span style={{ fontSize: 13, color: '#22c55e', fontWeight: 700 }}>{classData.name}</span>
      </div>

      {/* Header da Turma */}
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
          width: 200,
          height: 200,
          borderRadius: '50%',
          backgroundColor: 'rgba(34, 197, 94, 0.12)',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                color: '#22c55e',
                padding: '4px 10px',
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>
                {classData.category}
              </span>
              <span style={{
                backgroundColor: 'rgba(255, 185, 95, 0.15)',
                color: '#ffb95f',
                padding: '4px 10px',
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 800
              }}>
                Faixa: {classData.ageRange}
              </span>
            </div>
            <h1 style={{
              fontSize: 'clamp(24px, 4vw, 32px)',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              margin: '0 0 8px'
            }}>
              {classData.name}
            </h1>
            <p style={{ fontSize: 14, color: '#cbc3d7', margin: 0, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <span>📍 {classData.room}</span>
              <span>⏰ {classData.schedule}</span>
            </p>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            backgroundColor: '#201f21',
            padding: '12px 18px',
            borderRadius: 16,
            border: '1px solid #2a2a2c'
          }}>
            <img
              src={classData.teacher.avatar}
              alt={classData.teacher.name}
              style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid #22c55e' }}
            />
            <div>
              <div style={{ fontSize: 11, color: '#958ea0', fontWeight: 700, textTransform: 'uppercase' }}>
                {classData.teacher.role}
              </div>
              <div style={{ fontSize: 14, color: '#ffffff', fontWeight: 800 }}>
                {classData.teacher.name}
              </div>
            </div>
          </div>
        </div>

        {/* Métricas rápidas da turma */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 14,
          marginTop: 24,
          paddingTop: 20,
          borderTop: '1px solid #2a2a2c'
        }}>
          <div style={{ backgroundColor: '#201f21', padding: '14px 16px', borderRadius: 14 }}>
            <div style={{ fontSize: 12, color: '#958ea0', fontWeight: 600 }}>Total de Alunos</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', marginTop: 4 }}>{students.length}</div>
          </div>
          <div style={{ backgroundColor: '#201f21', padding: '14px 16px', borderRadius: 14 }}>
            <div style={{ fontSize: 12, color: '#958ea0', fontWeight: 600 }}>Presença Hoje</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#7bd0ff', marginTop: 4 }}>
              {presentCount} / {students.length} <span style={{ fontSize: 13, color: '#958ea0' }}>({Math.round((presentCount / students.length) * 100)}%)</span>
            </div>
          </div>
          <div style={{ backgroundColor: '#201f21', padding: '14px 16px', borderRadius: 14 }}>
            <div style={{ fontSize: 12, color: '#958ea0', fontWeight: 600 }}>Engajamento Médio</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#ffb95f', marginTop: 4 }}>84%</div>
          </div>
          <div style={{ backgroundColor: '#201f21', padding: '14px 16px', borderRadius: 14 }}>
            <div style={{ fontSize: 12, color: '#958ea0', fontWeight: 600 }}>Estrelas Acumuladas</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#22c55e', marginTop: 4 }}>
              {students.reduce((acc, s) => acc + s.stars, 0)} ⭐
            </div>
          </div>
        </div>
      </section>

      {/* Lição Ativa em Destaque */}
      <section style={{
        backgroundColor: '#1c1b1d',
        borderRadius: 20,
        padding: '20px 24px',
        border: '1px solid #2a2a2c',
        marginBottom: 28,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img
            src={classData.currentLesson.thumbnail_url}
            alt={classData.currentLesson.title}
            style={{
              width: 120,
              height: 72,
              borderRadius: 12,
              objectFit: 'cover',
              boxShadow: '0 4px 16px rgba(0,0,0,0.5)'
            }}
          />
          <div>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#ffb95f', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Lição Ativa da Semana
            </span>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#ffffff', margin: '4px 0' }}>
              {classData.currentLesson.title}
            </h3>
            <p style={{ fontSize: 13, color: '#cbc3d7', margin: 0 }}>
              {classData.currentLesson.scripture_verse || '1 Samuel 17 • Fé, coragem e obediência'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            onClick={() => navigate(`/assistir/${classData.currentLesson.id}`)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: '#22c55e',
              color: '#052e16',
              border: 'none',
              borderRadius: 12,
              padding: '10px 18px',
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(34, 197, 94, 0.4)'
            }}
          >
            <Play size={16} fill="#ffffff" />
            Abrir Lição
          </button>
          <button
            type="button"
            onClick={() => navigate('/downloads')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: '#201f21',
              color: '#cbc3d7',
              border: '1px solid #2a2a2c',
              borderRadius: 12,
              padding: '10px 16px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Download size={15} />
            PDFs
          </button>
        </div>
      </section>

      {/* Navegação de Abas: Alunos | Chamada Rápida | Materiais Atribuídos */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        borderBottom: '1px solid #2a2a2c',
        paddingBottom: 14,
        marginBottom: 20
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('alunos')}
          style={{
            background: activeTab === 'alunos' ? '#22c55e' : '#1c1b1d',
            color: activeTab === 'alunos' ? '#052e16' : '#cbc3d7',
            border: 'none',
            borderRadius: 20,
            padding: '8px 18px',
            fontSize: 13,
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          Alunos ({students.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('chamada')}
          style={{
            background: activeTab === 'chamada' ? '#22c55e' : '#1c1b1d',
            color: activeTab === 'chamada' ? '#052e16' : '#cbc3d7',
            border: 'none',
            borderRadius: 20,
            padding: '8px 18px',
            fontSize: 13,
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          Lista de Chamada & Presença
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('atividades')}
          style={{
            background: activeTab === 'atividades' ? '#22c55e' : '#1c1b1d',
            color: activeTab === 'atividades' ? '#052e16' : '#cbc3d7',
            border: 'none',
            borderRadius: 20,
            padding: '8px 18px',
            fontSize: 13,
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          Materiais & PDFs ({classData.assignedMaterials.length})
        </button>
      </div>

      {/* CONTEÚDO DAS ABAS */}
      {activeTab === 'alunos' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16
        }}>
          {students.map(student => (
            <div
              key={student.id}
              style={{
                backgroundColor: '#1c1b1d',
                borderRadius: 16,
                padding: '16px 18px',
                border: '1px solid #2a2a2c',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                transition: 'transform 0.2s ease, border-color 0.2s ease'
              }}
            >
              <img
                src={student.avatar}
                alt={student.name}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #353437'
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4 style={{ fontSize: 15, fontWeight: 800, color: '#ffffff', margin: 0 }}>
                    {student.name}
                  </h4>
                  <span style={{ fontSize: 12, color: '#ffb95f', fontWeight: 800 }}>
                    ⭐ {student.stars}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#958ea0', marginTop: 3 }}>
                  {student.age} anos • {student.completedLessons}/{student.totalLessons} lições
                </div>
                {/* Barra de progresso do aluno */}
                <div style={{
                  height: 5,
                  backgroundColor: '#2a2a2c',
                  borderRadius: 3,
                  marginTop: 8,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${(student.completedLessons / student.totalLessons) * 100}%`,
                    backgroundColor: '#22c55e',
                    borderRadius: 3
                  }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'chamada' && (
        <div style={{
          backgroundColor: '#1c1b1d',
          borderRadius: 20,
          border: '1px solid #2a2a2c',
          padding: 20
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
            flexWrap: 'wrap',
            gap: 12
          }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Chamada da Aula — {new Date().toLocaleDateString('pt-BR')}
              </h3>
              <p style={{ fontSize: 13, color: '#958ea0', margin: '4px 0 0' }}>
                Clique no status para alternar entre Presente e Ausente.
              </p>
            </div>
            <button
              type="button"
              onClick={saveAttendance}
              style={{
                backgroundColor: attendanceSaved ? '#009bd1' : '#22c55e',
                color: attendanceSaved ? '#ffffff' : '#052e16',
                border: 'none',
                borderRadius: 12,
                padding: '10px 20px',
                fontSize: 13,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s ease'
              }}
            >
              <CheckCircle2 size={16} />
              {attendanceSaved ? 'Presença Salva!' : 'Salvar Chamada'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {students.map(student => (
              <div
                key={student.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: 12,
                  backgroundColor: '#201f21',
                  border: '1px solid #2a2a2c'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <img
                    src={student.avatar}
                    alt={student.name}
                    style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>{student.name}</div>
                    <div style={{ fontSize: 12, color: '#958ea0' }}>{student.age} anos</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleAttendance(student.id)}
                  style={{
                    backgroundColor: student.present ? 'rgba(123, 208, 255, 0.15)' : 'rgba(255, 180, 171, 0.15)',
                    color: student.present ? '#7bd0ff' : '#ffb4ab',
                    border: `1px solid ${student.present ? '#009bd1' : '#93000a'}`,
                    borderRadius: 20,
                    padding: '6px 14px',
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  {student.present ? <Check size={14} /> : <X size={14} />}
                  {student.present ? 'Presente' : 'Ausente'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'atividades' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {classData.assignedMaterials.map(mat => (
            <div
              key={mat.id}
              style={{
                backgroundColor: '#1c1b1d',
                borderRadius: 16,
                padding: '18px 20px',
                border: '1px solid #2a2a2c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: 'rgba(255, 185, 95, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffb95f'
                }}>
                  <FileText size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: 15, fontWeight: 800, color: '#ffffff', margin: 0 }}>
                    {mat.title}
                  </h4>
                  <div style={{ fontSize: 12, color: '#958ea0', marginTop: 4 }}>
                    Formato: {mat.type} • Tamanho: {mat.size}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Link
                  to="/materiais-em-pdf"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    backgroundColor: '#22c55e',
                    color: '#052e16',
                    borderRadius: 10,
                    padding: '8px 16px',
                    fontSize: 13,
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                >
                  <Download size={14} />
                  Baixar Material
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
