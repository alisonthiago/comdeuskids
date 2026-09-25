import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfile } from '../context/ProfileContext'
import {
  Users, CheckCircle2, Star, Sparkles, Flame, Tv, BookOpen,
  Gamepad2, Palette, Printer, Music, Play, Plus, CheckCircle,
  FileText, ListMusic, Film, ArrowRight, ShieldCheck, Heart,
  Settings, UserCheck, School, Bookmark, ChevronRight, X
} from 'lucide-react'

export default function MeuEspaco() {
  const navigate = useNavigate()
  const { activeProfile } = useProfile()
  const [showNewClassModal, setShowNewClassModal] = useState(false)
  const [newClassName, setNewClassName] = useState('')
  const [newClassAge, setNewClassAge] = useState('4 a 6 anos')

  const handleOpenDiary = (turmaName: string) => {
    alert(`Abrindo diário eletrônico da ${turmaName} — Chamada e presença sincronizadas!`)
  }

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newClassName.trim()) return
    alert(`Nova turma "${newClassName}" cadastrada com sucesso para a faixa ${newClassAge}!`)
    setShowNewClassModal(false)
    setNewClassName('')
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#131315',
      color: '#e5e1e4',
      paddingTop: 72,
      paddingBottom: 96,
      fontFamily: "'Baloo 2', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      <div className="cdk-content-container" style={{
        maxWidth: 960,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 20
      }}>

        {/* PROFILE IDENTITY & STATUS CARD (STITCH AMBIENT GLOW) */}
        <div style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 16,
          backgroundColor: '#1c1b1d',
          padding: 16,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          border: '1px solid rgba(255, 255, 255, 0.04)'
        }}>
          {/* Ambient Glows */}
          <div style={{
            position: 'absolute',
            top: -48,
            right: -48,
            width: 140,
            height: 140,
            borderRadius: '50%',
            backgroundColor: 'rgba(160, 120, 255, 0.15)',
            filter: 'blur(32px)',
            pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute',
            bottom: -48,
            left: -48,
            width: 140,
            height: 140,
            borderRadius: '50%',
            backgroundColor: 'rgba(238, 152, 0, 0.12)',
            filter: 'blur(32px)',
            pointerEvents: 'none'
          }} />

          {/* Profile Identity Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative', zIndex: 2 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: 76,
                height: 76,
                borderRadius: '50%',
                backgroundColor: 'rgba(160, 120, 255, 0.25)',
                padding: 3,
                boxShadow: '0 0 20px rgba(160, 120, 255, 0.4)'
              }}>
                <img
                  src="/avatars/profa_ana.png"
                  alt="Profª Ana"
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/avatars/davi.png'
                  }}
                />
              </div>
              <div style={{
                position: 'absolute',
                bottom: -4,
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#ffb95f',
                color: '#472a00',
                fontSize: 10,
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: 9999,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                whiteSpace: 'nowrap'
              }}>
                <Star size={10} fill="#472a00" />
                <span>Profª</span>
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <h1 style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: '#e5e1e4',
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {activeProfile?.profile_type === 'teacher' ? activeProfile.name : 'Profª Ana'}
                </h1>
                <CheckCircle2 size={16} color="#22c55e" fill="#22c55e" style={{ flexShrink: 0 }} />
              </div>

              <p style={{
                fontSize: 12,
                color: '#cbc3d7',
                margin: '2px 0 0',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                Escola Com Deus • Ministério Infantil
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  backgroundColor: '#2a2a2c',
                  padding: '2px 8px',
                  borderRadius: 9999,
                  color: '#ffb95f',
                  fontSize: 11,
                  fontWeight: 800
                }}>
                  <Flame size={12} fill="#ffb95f" />
                  Nível Semeador
                </span>
                <span style={{ fontSize: 11, color: '#cbc3d7' }}>32 Alunos</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 8, marginTop: 14, position: 'relative', zIndex: 2 }}>
            <button
              onClick={() => navigate('/selecionar-perfil')}
              style={{
                flex: 1,
                height: 38,
                borderRadius: 10,
                backgroundColor: '#2a2a2c',
                color: '#e5e1e4',
                fontSize: 12,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              <UserCheck size={15} />
              <span>Trocar Perfil</span>
            </button>

            <button
              onClick={() => navigate('/editar-perfil')}
              style={{
                height: 38,
                padding: '0 16px',
                borderRadius: 10,
                backgroundColor: '#2a2a2c',
                color: '#cbc3d7',
                fontSize: 12,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              <Settings size={15} />
              <span>Editar</span>
            </button>
          </div>

          {/* Mode Status Bar */}
          <div style={{
            marginTop: 12,
            backgroundColor: 'rgba(32, 31, 33, 0.65)',
            borderRadius: 10,
            padding: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            zIndex: 2
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                color: '#22c55e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <School size={15} />
              </div>
              <div style={{ minWidth: 0 }}>
                <span style={{
                  display: 'block',
                  fontSize: 10,
                  fontWeight: 800,
                  color: '#22c55e',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em'
                }}>
                  Modo Educador Ativo
                </span>
                <span style={{
                  fontSize: 11,
                  color: '#cbc3d7',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'block'
                }}>
                  Painel de ferramentas bíblicas liberado
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/inicio')}
              style={{
                flexShrink: 0,
                backgroundColor: '#22c55e',
                color: '#052e16',
                padding: '4px 10px',
                borderRadius: 9999,
                fontSize: 11,
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <span>Visão Aluno</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* SEÇÃO 1: FERRAMENTAS PARA MINHA AULA */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 16, borderRadius: 9999, backgroundColor: '#22c55e' }} />
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#e5e1e4', margin: 0 }}>
                Ferramentas para Minha Aula
              </h2>
            </div>
            <span style={{
              fontSize: 10,
              fontWeight: 800,
              color: '#ffb95f',
              letterSpacing: '0.06em',
              textTransform: 'uppercase'
            }}>
              Prontas p/ Uso
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {/* 1: Vídeos p/ Projetar */}
            <div
              onClick={() => navigate('/videos')}
              style={{
                backgroundColor: '#201f21',
                borderRadius: 14,
                padding: 14,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.04)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  backgroundColor: 'rgba(34, 197, 94, 0.15)',
                  color: '#22c55e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Tv size={20} />
                </div>
                <span style={{
                  backgroundColor: 'rgba(255, 185, 95, 0.2)',
                  color: '#ffb95f',
                  fontSize: 10,
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 9999
                }}>
                  Telão
                </span>
              </div>
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: '#e5e1e4', margin: 0 }}>
                  Vídeos p/ Projetar
                </h3>
                <p style={{ fontSize: 11, color: '#cbc3d7', margin: '2px 0 0', lineHeight: 1.3 }}>
                  Modo TV e telão sem distrações
                </p>
              </div>
            </div>

            {/* 2: Lições Estruturadas */}
            <div
              onClick={() => navigate('/serie/a-arca-de-noe')}
              style={{
                backgroundColor: '#201f21',
                borderRadius: 14,
                padding: 14,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.04)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  backgroundColor: 'rgba(255, 185, 95, 0.2)',
                  color: '#ffb95f',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <BookOpen size={20} />
                </div>
                <span style={{
                  backgroundColor: 'rgba(34, 197, 94, 0.15)',
                  color: '#22c55e',
                  fontSize: 10,
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 9999
                }}>
                  Guia
                </span>
              </div>
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: '#e5e1e4', margin: 0 }}>
                  Lições Estruturadas
                </h3>
                <p style={{ fontSize: 11, color: '#cbc3d7', margin: '2px 0 0', lineHeight: 1.3 }}>
                  Roteiro, objetivos e versículo-chave
                </p>
              </div>
            </div>

            {/* 3: Quizzes da Turma */}
            <div
              onClick={() => navigate('/aprender')}
              style={{
                backgroundColor: '#201f21',
                borderRadius: 14,
                padding: 14,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.04)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  backgroundColor: 'rgba(123, 208, 255, 0.2)',
                  color: '#7bd0ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Gamepad2 size={20} />
                </div>
                <span style={{
                  backgroundColor: '#2a2a2c',
                  color: '#7bd0ff',
                  fontSize: 10,
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 9999,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#7bd0ff' }} />
                  Ao Vivo
                </span>
              </div>
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: '#e5e1e4', margin: 0 }}>
                  Quizzes da Turma
                </h3>
                <p style={{ fontSize: 11, color: '#cbc3d7', margin: '2px 0 0', lineHeight: 1.3 }}>
                  Placar interativo de acertos
                </p>
              </div>
            </div>

            {/* 4: Atividades Prontas */}
            <div
              onClick={() => navigate('/downloads')}
              style={{
                backgroundColor: '#201f21',
                borderRadius: 14,
                padding: 14,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.04)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  backgroundColor: 'rgba(34, 197, 94, 0.15)',
                  color: '#22c55e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Palette size={20} />
                </div>
                <span style={{
                  backgroundColor: '#2a2a2c',
                  color: '#cbc3d7',
                  fontSize: 10,
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 9999
                }}>
                  Dinâmicas
                </span>
              </div>
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: '#e5e1e4', margin: 0 }}>
                  Atividades Prontas
                </h3>
                <p style={{ fontSize: 11, color: '#cbc3d7', margin: '2px 0 0', lineHeight: 1.3 }}>
                  Jogos em grupo e desenhos
                </p>
              </div>
            </div>

            {/* 5: Cadernos em PDF */}
            <div
              onClick={() => navigate('/downloads')}
              style={{
                backgroundColor: '#201f21',
                borderRadius: 14,
                padding: 14,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.04)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  backgroundColor: 'rgba(238, 152, 0, 0.2)',
                  color: '#ffb95f',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Printer size={20} />
                </div>
                <span style={{
                  backgroundColor: 'rgba(238, 152, 0, 0.25)',
                  color: '#ffb95f',
                  fontSize: 10,
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 9999
                }}>
                  WhatsApp
                </span>
              </div>
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: '#e5e1e4', margin: 0 }}>
                  Cadernos em PDF
                </h3>
                <p style={{ fontSize: 11, color: '#cbc3d7', margin: '2px 0 0', lineHeight: 1.3 }}>
                  Envio rápido em 1 toque
                </p>
              </div>
            </div>

            {/* 6: Louvores da Aula */}
            <div
              onClick={() => navigate('/clipes')}
              style={{
                backgroundColor: '#201f21',
                borderRadius: 14,
                padding: 14,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.04)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  backgroundColor: 'rgba(123, 208, 255, 0.2)',
                  color: '#7bd0ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Music size={20} />
                </div>
                <span style={{
                  backgroundColor: '#2a2a2c',
                  color: '#cbc3d7',
                  fontSize: 10,
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 9999
                }}>
                  Músicas
                </span>
              </div>
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: '#e5e1e4', margin: 0 }}>
                  Louvores da Aula
                </h3>
                <p style={{ fontSize: 11, color: '#cbc3d7', margin: '2px 0 0', lineHeight: 1.3 }}>
                  Com letra e gestos em vídeo
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SEÇÃO 2: MINHAS TURMAS & SALAS */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 16, borderRadius: 9999, backgroundColor: '#ffb95f' }} />
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#e5e1e4', margin: 0 }}>
                Minhas Turmas &amp; Salas
              </h2>
            </div>
            <button
              onClick={() => setShowNewClassModal(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#22c55e',
                fontSize: 12,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                cursor: 'pointer'
              }}
            >
              <span>Gerenciar</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Turma 1: Cordeirinhos */}
            <div style={{
              backgroundColor: '#201f21',
              borderRadius: 14,
              padding: 14,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              border: '1px solid rgba(255, 255, 255, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: 10
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: 'rgba(34, 197, 94, 0.15)',
                    color: '#22c55e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Users size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 800, color: '#e5e1e4', margin: 0 }}>
                      Turma Cordeirinhos
                    </h3>
                    <span style={{ fontSize: 11, color: '#cbc3d7' }}>
                      4 a 6 anos • 14 alunos ativos
                    </span>
                  </div>
                </div>
                <span style={{
                  backgroundColor: 'rgba(34, 197, 94, 0.15)',
                  color: '#22c55e',
                  padding: '3px 10px',
                  borderRadius: 9999,
                  fontSize: 11,
                  fontWeight: 800
                }}>
                  Sala 02
                </span>
              </div>

              <div style={{
                backgroundColor: 'rgba(42, 42, 44, 0.6)',
                borderRadius: 10,
                padding: '8px 10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                  <Bookmark size={16} color="#ffb95f" />
                  <div style={{ minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 9, fontWeight: 800, color: '#cbc3d7', textTransform: 'uppercase' }}>
                      Lição deste Domingo
                    </span>
                    <span style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#e5e1e4',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'block'
                    }}>
                      A Arca de Noé: Deus Cuida de Nós
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/serie/a-arca-de-noe')}
                  aria-label="Abrir lição A Arca de Noé"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: '#2a2a2c',
                    color: '#e5e1e4',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                >
                  <Play size={15} fill="#e5e1e4" />
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: '#cbc3d7' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle size={14} color="#ffb95f" />
                  <span>Chamada do dia pronta</span>
                </div>
                <button
                  onClick={() => handleOpenDiary('Turma Cordeirinhos')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#22c55e',
                    fontSize: 10,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    cursor: 'pointer'
                  }}
                >
                  Abrir Diário
                </button>
              </div>
            </div>

            {/* Turma 2: Soldados da Fé */}
            <div style={{
              backgroundColor: '#201f21',
              borderRadius: 14,
              padding: 14,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              border: '1px solid rgba(255, 255, 255, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: 10
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: 'rgba(238, 152, 0, 0.2)',
                    color: '#ffb95f',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 800, color: '#e5e1e4', margin: 0 }}>
                      Turma Soldados da Fé
                    </h3>
                    <span style={{ fontSize: 11, color: '#cbc3d7' }}>
                      7 a 9 anos • 18 alunos ativos
                    </span>
                  </div>
                </div>
                <span style={{
                  backgroundColor: 'rgba(255, 185, 95, 0.15)',
                  color: '#ffb95f',
                  padding: '3px 10px',
                  borderRadius: 9999,
                  fontSize: 11,
                  fontWeight: 800
                }}>
                  Auditório B
                </span>
              </div>

              <div style={{
                backgroundColor: 'rgba(42, 42, 44, 0.6)',
                borderRadius: 10,
                padding: '8px 10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                  <Bookmark size={16} color="#ffb95f" />
                  <div style={{ minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 9, fontWeight: 800, color: '#cbc3d7', textTransform: 'uppercase' }}>
                      Lição deste Domingo
                    </span>
                    <span style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#e5e1e4',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'block'
                    }}>
                      Davi e Golias: Coragem no Senhor
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/conteudo/davi-e-golias')}
                  aria-label="Abrir lição Davi e Golias"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: '#2a2a2c',
                    color: '#e5e1e4',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                >
                  <Play size={15} fill="#e5e1e4" />
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: '#cbc3d7' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Sparkles size={14} color="#7bd0ff" />
                  <span>Quiz interativo configurado</span>
                </div>
                <button
                  onClick={() => handleOpenDiary('Turma Soldados da Fé')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#22c55e',
                    fontSize: 10,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    cursor: 'pointer'
                  }}
                >
                  Abrir Diário
                </button>
              </div>
            </div>

            {/* Criar Nova Turma */}
            <button
              onClick={() => setShowNewClassModal(true)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 12,
                backgroundColor: '#1c1b1d',
                color: '#22c55e',
                fontSize: 13,
                fontWeight: 800,
                border: '1px dashed #353437',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              <div style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                backgroundColor: 'rgba(208, 188, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Plus size={16} />
              </div>
              <span>Criar Nova Turma ou Sala</span>
            </button>
          </div>
        </div>

        {/* SEÇÃO 3: MEUS MATERIAIS & DOWNLOADS OFFLINE */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 16, borderRadius: 9999, backgroundColor: '#7bd0ff' }} />
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#e5e1e4', margin: 0 }}>
                Materiais &amp; Downloads
              </h2>
            </div>
            <span style={{
              backgroundColor: '#201f21',
              color: '#7bd0ff',
              padding: '2px 8px',
              borderRadius: 9999,
              fontSize: 10,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              <CheckCircle size={11} />
              Offline
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            <div
              onClick={() => navigate('/downloads')}
              style={{
                backgroundColor: '#201f21',
                borderRadius: 12,
                padding: '12px 6px',
                textAlign: 'center',
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                color: '#22c55e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 4px'
              }}>
                <FileText size={18} />
              </div>
              <span style={{ display: 'block', fontSize: 18, fontWeight: 800, color: '#e5e1e4' }}>12</span>
              <span style={{ fontSize: 10, color: '#cbc3d7' }}>PDFs Salvos</span>
            </div>

            <div
              onClick={() => navigate('/clipes')}
              style={{
                backgroundColor: '#201f21',
                borderRadius: 12,
                padding: '12px 6px',
                textAlign: 'center',
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 185, 95, 0.2)',
                color: '#ffb95f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 4px'
              }}>
                <ListMusic size={18} />
              </div>
              <span style={{ display: 'block', fontSize: 18, fontWeight: 800, color: '#e5e1e4' }}>4</span>
              <span style={{ fontSize: 10, color: '#cbc3d7' }}>Playlists</span>
            </div>

            <div
              onClick={() => navigate('/videos')}
              style={{
                backgroundColor: '#201f21',
                borderRadius: 12,
                padding: '12px 6px',
                textAlign: 'center',
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: 'rgba(123, 208, 255, 0.2)',
                color: '#7bd0ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 4px'
              }}>
                <Film size={18} />
              </div>
              <span style={{ display: 'block', fontSize: 18, fontWeight: 800, color: '#e5e1e4' }}>6</span>
              <span style={{ fontSize: 10, color: '#cbc3d7' }}>Vídeos 4K</span>
            </div>
          </div>

          {/* Armazenamento da Sala */}
          <div style={{
            marginTop: 8,
            backgroundColor: 'rgba(42, 42, 44, 0.7)',
            borderRadius: 12,
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                color: '#22c55e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CheckCircle2 size={18} />
              </div>
              <div>
                <span style={{ display: 'block', fontSize: 13, fontWeight: 800, color: '#e5e1e4' }}>
                  Armazenamento da Sala
                </span>
                <span style={{ fontSize: 11, color: '#cbc3d7' }}>
                  1.4 GB usados • Disponível offline
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/downloads')}
              style={{
                padding: '5px 12px',
                borderRadius: 9999,
                backgroundColor: '#2a2a2c',
                color: '#e5e1e4',
                fontSize: 11,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Ver Todos
            </button>
          </div>
        </div>

        {/* MOTIVATIONAL SCRIPTURE CARD */}
        <div style={{
          position: 'relative',
          borderRadius: 14,
          backgroundColor: '#201f21',
          padding: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 185, 95, 0.2)',
            color: '#ffb95f',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Heart size={18} fill="#ffb95f" />
          </div>
          <div>
            <p style={{ fontSize: 12, fontStyle: 'italic', color: '#e5e1e4', margin: 0 }}>
              “Ensina a criança no caminho em que deve andar...”
            </p>
            <span style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#ffb95f', marginTop: 2 }}>
              Provérbios 22:6 • Bom trabalho hoje, Ana!
            </span>
          </div>
        </div>
      </div>

      {/* MODAL CRIAR NOVA TURMA */}
      {showNewClassModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 16
        }}>
          <div style={{
            width: '100%',
            maxWidth: 380,
            backgroundColor: '#201f21',
            borderRadius: 16,
            border: '1px solid #353437',
            padding: 20,
            boxShadow: '0 20px 50px rgba(0,0,0,0.7)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#e5e1e4', margin: 0 }}>
                Criar Nova Turma / Sala EBD
              </h3>
              <button
                onClick={() => setShowNewClassModal(false)}
                style={{ background: 'none', border: 'none', color: '#958ea0', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateClass} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#cbc3d7', marginBottom: 4 }}>
                  Nome da Turma ou Sala
                </label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="Ex: Turma Pequenos Gigantes"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    backgroundColor: '#131315',
                    border: '1px solid #494454',
                    color: '#fff',
                    fontSize: 13,
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#cbc3d7', marginBottom: 4 }}>
                  Faixa Etária
                </label>
                <select
                  value={newClassAge}
                  onChange={(e) => setNewClassAge(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    backgroundColor: '#131315',
                    border: '1px solid #494454',
                    color: '#fff',
                    fontSize: 13,
                    outline: 'none'
                  }}
                >
                  <option value="0 a 3 anos">Berçário / Maternal (0 a 3 anos)</option>
                  <option value="4 a 6 anos">Turma Infantil (4 a 6 anos)</option>
                  <option value="7 a 9 anos">Primários (7 a 9 anos)</option>
                  <option value="10+ anos">Juniores (10 a 12 anos)</option>
                </select>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  marginTop: 6,
                  padding: '12px',
                  borderRadius: 10,
                  backgroundColor: '#22c55e',
                  color: '#052e16',
                  fontWeight: 800,
                  fontSize: 13,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Salvar e Ativar Turma
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
