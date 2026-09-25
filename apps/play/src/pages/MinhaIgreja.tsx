import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Church, CheckCircle2, Play, Download, Eye, Gamepad2,
  Users, UserPlus, Lock, LockOpen, Sparkles, Plus, MoreVertical,
  BookOpen, FileText, Film, ShieldCheck, Heart
} from 'lucide-react'

export default function MinhaIgreja() {
  const navigate = useNavigate()
  const [invitedEmail, setInvitedEmail] = useState('')
  const [showInviteModal, setShowInviteModal] = useState(false)

  return (
    <div style={{
      maxWidth: 1360,
      margin: '0 auto',
      padding: '88px 16px 96px',
      fontFamily: "'Baloo 2', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      {/* ============================================================
          HEADER INSTITUCIONAL DA IGREJA
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
          width: 200,
          height: 200,
          borderRadius: '50%',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          filter: 'blur(50px)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', marginBottom: 24, position: 'relative', zIndex: 2 }}>
          <div style={{
            position: 'relative',
            width: 76,
            height: 76,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
            padding: 3,
            boxShadow: '0 8px 24px rgba(34, 197, 94, 0.35)',
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
              color: '#ffb95f'
            }}>
              <Church size={38} />
            </div>
            <span style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 22,
              height: 22,
              borderRadius: '50%',
              backgroundColor: '#ee9800',
              color: '#5b3800',
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
                backgroundColor: 'rgba(255, 185, 95, 0.15)',
                color: '#ffb95f',
                padding: '3px 10px',
                borderRadius: 9999,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase'
              }}>
                Plano Igreja Ativo
              </span>
              <span style={{ color: '#494454' }}>•</span>
              <span style={{ color: '#cbc3d7', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
                Ministério Infantil
              </span>
            </div>

            <h1 style={{ fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: '4px 0' }}>
              Igreja Batista Central
            </h1>

            <p style={{ fontSize: 13, color: '#958ea0' }}>
              Comunidade Conectada • ID #IBC-8842
            </p>
          </div>
        </div>

        {/* Faixa de Métricas Rápidas */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
          position: 'relative',
          zIndex: 2
        }}>
          <div style={{
            backgroundColor: 'rgba(32, 31, 33, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: 14,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            border: '1px solid #2a2a2c'
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>3 Convidados</div>
              <div style={{ fontSize: 12, color: '#958ea0' }}>Líderes &amp; Professores</div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'rgba(32, 31, 33, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: 14,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            border: '1px solid #2a2a2c'
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255, 185, 95, 0.15)', color: '#ffb95f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={18} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>4 Turmas</div>
              <div style={{ fontSize: 12, color: '#958ea0' }}>Salas e Berçário</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          BARRA DE AÇÕES RÁPIDAS
          ============================================================ */}
      <div style={{
        display: 'flex',
        gap: 10,
        overflowX: 'auto',
        paddingBottom: 8,
        marginBottom: 28
      }} className="no-scrollbar">
        <button
          type="button"
          onClick={() => navigate('/inicio')}
          style={{
            padding: '10px 18px',
            borderRadius: 12,
            backgroundColor: '#22c55e',
            color: '#052e16',
            fontSize: 13,
            fontWeight: 800,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 14px rgba(34, 197, 94, 0.3)'
          }}
        >
          <Play size={16} fill="#052e16" />
          <span>Próximo Culto Infantil</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/downloads')}
          style={{
            padding: '10px 18px',
            borderRadius: 12,
            backgroundColor: '#2a2a2c',
            border: '1px solid #353437',
            color: '#ffffff',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            whiteSpace: 'nowrap'
          }}
        >
          <BookOpen size={16} color="#ffb95f" />
          <span>Materiais EBD</span>
        </button>

        <button
          type="button"
          onClick={() => setShowInviteModal(true)}
          style={{
            padding: '10px 18px',
            borderRadius: 12,
            backgroundColor: '#2a2a2c',
            border: '1px solid #353437',
            color: '#ffffff',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            whiteSpace: 'nowrap'
          }}
        >
          <Users size={16} color="#7bd0ff" />
          <span>Equipe</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/downloads')}
          style={{
            padding: '10px 18px',
            borderRadius: 12,
            backgroundColor: '#2a2a2c',
            border: '1px solid #353437',
            color: '#ffffff',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            whiteSpace: 'nowrap'
          }}
        >
          <FileText size={16} color="#958ea0" />
          <span>PDFs</span>
        </button>
      </div>

      {/* ============================================================
          SEÇÃO 1: CONTEÚDOS PARA O PRÓXIMO ENCONTRO (TEMA DO MÊS)
          ============================================================ */}
      <section style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 4, height: 18, borderRadius: 9999, backgroundColor: '#ffb95f' }} />
            <h2 style={{ fontSize: 14, fontWeight: 800, color: '#cbc3d7', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Conteúdos para o Próximo Encontro
            </h2>
          </div>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#ffb95f' }}>Tema do Mês</span>
        </div>

        {/* Billboard Cinematográfico de Destaque */}
        <div style={{
          backgroundColor: '#0e0e10',
          borderRadius: 20,
          overflow: 'hidden',
          border: '1px solid #2a2a2c',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5)'
        }}>
          {/* Header com Arte */}
          <div style={{
            position: 'relative',
            height: 200,
            backgroundImage: "url('/banners/hero_davi_golias.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center 30%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 16
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, #201f21 0%, rgba(32, 31, 33, 0.4) 50%, transparent 100%)'
            }} />

            <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: 8 }}>
              <span style={{
                backgroundColor: 'rgba(14, 14, 16, 0.85)',
                backdropFilter: 'blur(8px)',
                color: '#ffb95f',
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: 10,
                fontWeight: 800,
                textTransform: 'uppercase'
              }}>
                Em Destaque
              </span>
              <span style={{
                backgroundColor: '#ee9800',
                color: '#5b3800',
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: 10,
                fontWeight: 800,
                textTransform: 'uppercase'
              }}>
                Livre
              </span>
            </div>

            <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#ffb95f', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  História do Mês
                </span>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: '#ffffff', margin: '2px 0 0' }}>
                  A Coragem de Davi
                </h3>
              </div>

              <button
                type="button"
                onClick={() => navigate('/inicio')}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  border: 'none',
                  color: '#052e16',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(34, 197, 94, 0.45)'
                }}
              >
                <Play size={22} fill="#052e16" />
              </button>
            </div>
          </div>

          {/* Módulos Inclusos */}
          <div style={{ padding: 16, backgroundColor: '#201f21', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{
              backgroundColor: '#2a2a2c',
              borderRadius: 14,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255, 185, 95, 0.15)', color: '#ffb95f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>Guia do Líder - Culto Infantil</div>
                  <div style={{ fontSize: 12, color: '#958ea0' }}>PDF Completo • 12 Páginas ilustradas</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/downloads')}
                style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#353437', border: 'none', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                title="Baixar Guia"
              >
                <Download size={16} />
              </button>
            </div>

            <div style={{
              backgroundColor: '#2a2a2c',
              borderRadius: 14,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Film size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>Vídeo de Abertura &amp; Louvor</div>
                  <div style={{ fontSize: 12, color: '#958ea0' }}>Duração 45 min • Alta Definição 4K</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/inicio')}
                style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#353437', border: 'none', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                title="Visualizar Vídeo"
              >
                <Eye size={16} />
              </button>
            </div>

            <div style={{
              backgroundColor: '#2a2a2c',
              borderRadius: 14,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(123, 208, 255, 0.15)', color: '#7bd0ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Gamepad2 size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>Roteiro de Oração e Quiz em Equipe</div>
                  <div style={{ fontSize: 12, color: '#958ea0' }}>Dinâmica de 20 min com cartões interativos</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/aprender')}
                style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#353437', border: 'none', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                title="Acessar Quiz"
              >
                <Gamepad2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SEÇÃO 2: EQUIPE & PROFESSORES CONVIDADOS
          ============================================================ */}
      <section style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 4, height: 18, borderRadius: 9999, backgroundColor: '#22c55e' }} />
            <h2 style={{ fontSize: 14, fontWeight: 800, color: '#cbc3d7', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Minha Equipe &amp; Professores Convidados
            </h2>
          </div>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#22c55e' }}>Logins Próprios</span>
        </div>

        {/* Caixa Informativa */}
        <div style={{
          padding: '14px 16px',
          borderRadius: 14,
          backgroundColor: '#2a2a2c',
          display: 'flex',
          gap: 12,
          alignItems: 'flex-start',
          marginBottom: 14,
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <ShieldCheck size={20} color="#22c55e" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: 13, color: '#cbc3d7', lineHeight: 1.5, margin: 0 }}>
            Professores e líderes convidados utilizam suas <strong style={{ color: '#ffffff' }}>próprias credenciais</strong> para acessar planejamentos e materiais, enquanto as crianças utilizam apenas os perfis de sala com PIN protegido.
          </p>
        </div>

        {/* Lista de Membros */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {/* Membro 1: Profª Ana */}
          <div style={{
            backgroundColor: '#201f21',
            borderRadius: 16,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid #2a2a2c'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <img
                src="/avatars/profa_ana.png"
                alt="Profª Ana"
                style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>Profª Ana</div>
                <div style={{ fontSize: 12, color: '#958ea0' }}>Coordenadora Pedagógica</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                backgroundColor: 'rgba(123, 208, 255, 0.15)',
                color: '#7bd0ff',
                padding: '3px 10px',
                borderRadius: 9999,
                fontSize: 10,
                fontWeight: 800,
                textTransform: 'uppercase'
              }}>
                Ativo
              </span>
            </div>
          </div>

          {/* Membro 2: Líder João */}
          <div style={{
            backgroundColor: '#201f21',
            borderRadius: 16,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid #2a2a2c'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <img
                src="/avatars/joao.png"
                alt="Líder João"
                style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>Líder João</div>
                <div style={{ fontSize: 12, color: '#958ea0' }}>Ministério de Louvor Kids</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                backgroundColor: 'rgba(123, 208, 255, 0.15)',
                color: '#7bd0ff',
                padding: '3px 10px',
                borderRadius: 9999,
                fontSize: 10,
                fontWeight: 800,
                textTransform: 'uppercase'
              }}>
                Ativo
              </span>
            </div>
          </div>

          {/* Membro 3: Prof. Carlos */}
          <div style={{
            backgroundColor: '#201f21',
            borderRadius: 16,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid #2a2a2c'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <img
                src="/avatars/carlos.png"
                alt="Prof. Carlos"
                style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>Prof. Carlos</div>
                <div style={{ fontSize: 12, color: '#958ea0' }}>Professor EBD 7–9 anos</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                backgroundColor: 'rgba(238, 152, 0, 0.2)',
                color: '#ffb95f',
                padding: '3px 10px',
                borderRadius: 9999,
                fontSize: 10,
                fontWeight: 800,
                textTransform: 'uppercase'
              }}>
                Pendente
              </span>
            </div>
          </div>
        </div>

        {/* Botão de Adicionar Membro */}
        <button
          type="button"
          onClick={() => setShowInviteModal(true)}
          style={{
            width: '100%',
            padding: '14px 20px',
            borderRadius: 14,
            backgroundColor: '#22c55e',
            color: '#052e16',
            fontSize: 14,
            fontWeight: 800,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow: '0 6px 20px rgba(34, 197, 94, 0.35)'
          }}
        >
          <UserPlus size={18} />
          <span>+ Adicionar Novo Membro</span>
        </button>
      </section>

      {/* ============================================================
          SEÇÃO 3: PERFIS DE CONSUMO (CRIANÇAS & SALAS)
          ============================================================ */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 4, height: 18, borderRadius: 9999, backgroundColor: '#7bd0ff' }} />
            <h2 style={{ fontSize: 14, fontWeight: 800, color: '#cbc3d7', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Perfis de Consumo (Crianças &amp; Salas)
            </h2>
          </div>
          <span style={{ fontSize: 12, color: '#958ea0' }}>Protegidos por PIN</span>
        </div>

        <div style={{
          display: 'flex',
          gap: 14,
          overflowX: 'auto',
          paddingBottom: 10
        }} className="no-scrollbar">
          {/* Sala 1: Turma 4-6 */}
          <div style={{
            flex: '0 0 150px',
            backgroundColor: '#201f21',
            borderRadius: 18,
            padding: 18,
            textAlign: 'center',
            border: '1px solid #2a2a2c',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12
          }}>
            <div style={{
              position: 'relative',
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #22c55e, #ffb95f)',
              padding: 2
            }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#0e0e10', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
                <BookOpen size={26} />
              </div>
              <span style={{ position: 'absolute', bottom: -2, right: -2, width: 20, height: 20, borderRadius: '50%', backgroundColor: '#ee9800', color: '#5b3800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lock size={12} />
              </span>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>Turma 4–6</div>
              <div style={{ fontSize: 11, color: '#ffb95f', fontWeight: 600 }}>PIN Ativo</div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/inicio')}
              style={{
                width: '100%',
                padding: '6px 0',
                borderRadius: 8,
                backgroundColor: '#2a2a2c',
                color: '#cbc3d7',
                border: 'none',
                fontSize: 11,
                fontWeight: 800,
                textTransform: 'uppercase',
                cursor: 'pointer'
              }}
            >
              Abrir Sala
            </button>
          </div>

          {/* Sala 2: Turma 7-9 */}
          <div style={{
            flex: '0 0 150px',
            backgroundColor: '#201f21',
            borderRadius: 18,
            padding: 18,
            textAlign: 'center',
            border: '1px solid #2a2a2c',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12
          }}>
            <div style={{
              position: 'relative',
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #7bd0ff, #22c55e)',
              padding: 2
            }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#0e0e10', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7bd0ff' }}>
                <Users size={26} />
              </div>
              <span style={{ position: 'absolute', bottom: -2, right: -2, width: 20, height: 20, borderRadius: '50%', backgroundColor: '#ee9800', color: '#5b3800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lock size={12} />
              </span>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>Turma 7–9</div>
              <div style={{ fontSize: 11, color: '#ffb95f', fontWeight: 600 }}>PIN Ativo</div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/inicio')}
              style={{
                width: '100%',
                padding: '6px 0',
                borderRadius: 8,
                backgroundColor: '#2a2a2c',
                color: '#cbc3d7',
                border: 'none',
                fontSize: 11,
                fontWeight: 800,
                textTransform: 'uppercase',
                cursor: 'pointer'
              }}
            >
              Abrir Sala
            </button>
          </div>

          {/* Sala 3: Berçário Kids */}
          <div style={{
            flex: '0 0 150px',
            backgroundColor: '#201f21',
            borderRadius: 18,
            padding: 18,
            textAlign: 'center',
            border: '1px solid #2a2a2c',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12
          }}>
            <div style={{
              position: 'relative',
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ffb95f, #22c55e)',
              padding: 2
            }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#0e0e10', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffb95f' }}>
                <Heart size={26} />
              </div>
              <span style={{ position: 'absolute', bottom: -2, right: -2, width: 20, height: 20, borderRadius: '50%', backgroundColor: '#353437', color: '#958ea0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LockOpen size={12} />
              </span>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>Berçário Kids</div>
              <div style={{ fontSize: 11, color: '#958ea0', fontWeight: 600 }}>0–3 anos</div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/inicio')}
              style={{
                width: '100%',
                padding: '6px 0',
                borderRadius: 8,
                backgroundColor: '#2a2a2c',
                color: '#cbc3d7',
                border: 'none',
                fontSize: 11,
                fontWeight: 800,
                textTransform: 'uppercase',
                cursor: 'pointer'
              }}
            >
              Abrir Sala
            </button>
          </div>

          {/* + Nova Sala */}
          <button
            type="button"
            onClick={() => alert('Criar novo perfil de sala.')}
            style={{
              flex: '0 0 150px',
              backgroundColor: '#1c1b1d',
              borderRadius: 18,
              padding: 18,
              border: '1px dashed #353437',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer'
            }}
          >
            <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#2a2a2c', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={24} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>+ Nova Sala</div>
            <div style={{ fontSize: 11, color: '#958ea0' }}>Criar Perfil</div>
          </button>
        </div>
      </section>

      {/* MODAL DE CONVIDAR NOVO MEMBRO */}
      {showInviteModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            backgroundColor: '#1c1b1d',
            borderRadius: 24,
            padding: 32,
            maxWidth: 440,
            width: '100%',
            border: '1px solid #353437',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8)'
          }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#ffffff', marginBottom: 8 }}>
              Convidar Professor ou Líder
            </h3>
            <p style={{ fontSize: 13, color: '#cbc3d7', marginBottom: 20, lineHeight: 1.5 }}>
              O convidado receberá um e-mail com acesso liberado às ferramentas da Igreja Batista Central.
            </p>

            <input
              type="email"
              placeholder="email-do-professor@igreja.org"
              value={invitedEmail}
              onChange={e => setInvitedEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 12,
                backgroundColor: '#201f21',
                border: '1px solid #353437',
                color: '#ffffff',
                fontSize: 14,
                outline: 'none',
                marginBottom: 20
              }}
            />

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                style={{ flex: 1, padding: 12, borderRadius: 12, backgroundColor: '#2a2a2c', color: '#cbc3d7', border: 'none', fontWeight: 700, cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  alert(`Convite enviado com sucesso para: ${invitedEmail || 'professor@igreja.org'}`)
                  setShowInviteModal(false)
                  setInvitedEmail('')
                }}
                style={{ flex: 1, padding: 12, borderRadius: 12, backgroundColor: '#22c55e', color: '#052e16', border: 'none', fontWeight: 800, cursor: 'pointer' }}
              >
                Enviar Convite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
