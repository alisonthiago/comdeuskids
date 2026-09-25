import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { STREAM_CATALOG } from '../data/streamCatalog'
import { useProfile } from '../context/ProfileContext'
import {
  BookOpen, Award, Download, Play, CheckCircle2,
  Sparkles, Star, ChevronRight, HelpCircle, Trophy,
  Flame, Check, Bookmark, FileText, ArrowRight, Target
} from 'lucide-react'

export default function Aprender() {
  const navigate = useNavigate()
  const { activeProfile } = useProfile()
  const [activeCategory, setActiveCategory] = useState<'licoes' | 'quizzes' | 'versiculos' | 'desafios' | 'progresso' | 'atividades'>('licoes')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [memorizedVerses, setMemorizedVerses] = useState<string[]>(['v-1'])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2500)
  }

  const profileName = activeProfile?.name || 'Davi'

  // Catálogo de Lições e Quizzes
  const learningItems = STREAM_CATALOG.filter(c => c.scripture_verse || c.quiz || c.type === 'lesson' || c.related_pdf_id)

  // Versículos da Semana (Memorização)
  const weeklyVerses = [
    {
      id: 'v-1',
      reference: '1 Samuel 17:45',
      verse: 'Você vem contra mim com espada e lança, mas eu vou contra você em nome do Senhor dos Exércitos!',
      theme: 'Coragem e Fé',
      story: 'Davi e Golias',
      xp: 50
    },
    {
      id: 'v-2',
      reference: 'Gênesis 9:13',
      verse: 'Porei o meu arco nas nuvens, e ele será o sinal da aliança entre mim e a terra.',
      theme: 'Obediência e Promessa',
      story: 'A Arca de Noé',
      xp: 50
    },
    {
      id: 'v-3',
      reference: 'Daniel 6:22',
      verse: 'O meu Deus enviou o seu anjo e fechou a boca dos leões, para que não me fizessem dano algum.',
      theme: 'Oração e Fidelidade',
      story: 'Daniel na Cova dos Leões',
      xp: 50
    },
    {
      id: 'v-4',
      reference: 'Filipenses 4:13',
      verse: 'Tudo posso naquele que me fortalece.',
      theme: 'Força no Senhor',
      story: 'Vida com Deus',
      xp: 50
    }
  ]

  // Desafios da Semana
  const weeklyMissions = [
    { id: 'm-1', title: 'Assistir a História de Davi e Golias', xp: 100, completed: true, icon: '⚔️' },
    { id: 'm-2', title: 'Responder ao Quiz de A Arca de Noé', xp: 150, completed: true, icon: '🚢' },
    { id: 'm-3', title: 'Memorizar o Versículo da Aliança (Gênesis 9:13)', xp: 80, completed: false, icon: '🌈' },
    { id: 'm-4', title: 'Baixar e Colorir o Caderno de Atividades', xp: 120, completed: false, icon: '🎨' }
  ]

  const handleToggleVerse = (id: string, ref: string) => {
    if (memorizedVerses.includes(id)) {
      setMemorizedVerses(prev => prev.filter(v => v !== id))
      showToast(`Versículo removido dos memorizados.`)
    } else {
      setMemorizedVerses(prev => [...prev, id])
      showToast(`Parabéns ${profileName}! +50 XP por memorizar ${ref}! ⭐`)
    }
  }

  return (
    <div style={{
      maxWidth: 1480,
      margin: '0 auto',
      padding: '84px 16px 80px',
      fontFamily: "'Baloo 2', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      {/* Toast flutuante */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: 28,
          right: 28,
          backgroundColor: '#201f21',
          color: '#ffffff',
          border: '1px solid #22c55e',
          borderRadius: 14,
          padding: '12px 20px',
          fontSize: 14,
          fontWeight: 700,
          boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <CheckCircle2 size={18} color="#7bd0ff" />
          {toastMessage}
        </div>
      )}

      {/* Topo Educativo Stitch Luminous */}
      <section style={{
        position: 'relative',
        backgroundColor: '#1c1b1d',
        borderRadius: 24,
        padding: '36px 32px',
        border: '1px solid #2a2a2c',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.45)',
        marginBottom: 32,
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 260,
          height: 260,
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 185, 95, 0.12)',
          filter: 'blur(60px)',
          pointerEvents: 'none'
        }} />

        <div style={{
          position: 'absolute',
          bottom: -40,
          left: -40,
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
          gap: 24,
          position: 'relative',
          zIndex: 2
        }}>
          <div style={{ maxWidth: 680 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: 'rgba(255, 185, 95, 0.15)',
              color: '#ffb95f',
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 16
            }}>
              <Trophy size={16} />
              <span>Área Educacional Com Deus Kids</span>
            </div>

            <h1 style={{
              fontSize: 'clamp(28px, 4vw, 40px)',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              margin: '0 0 14px'
            }}>
              Aprenda a Palavra de Deus <br />
              <span style={{
                background: 'linear-gradient(90deg, #22c55e 0%, #4ade80 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Brincando e Conquistando
              </span>
            </h1>

            <p style={{
              fontSize: 15,
              lineHeight: 1.6,
              color: '#cbc3d7',
              margin: 0
            }}>
              Uma área 100% pedagógica com 6 pilares: Lições bíblicas, Quizzes interativos,
              Memorização de versículos, Desafios semanais, Progresso espiritual e Atividades em PDF.
            </p>
          </div>

          {/* Card de Conquistas & XP */}
          <div style={{
            backgroundColor: '#201f21',
            borderRadius: 20,
            padding: '20px 24px',
            border: '1px solid #2a2a2c',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            minWidth: 250
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: '#958ea0', fontWeight: 700 }}>Seu Nível Bíblico</span>
              <span style={{ fontSize: 13, color: '#ffb95f', fontWeight: 800 }}>Nível 3 • Explorador</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 185, 95, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffb95f'
              }}>
                <Award size={24} />
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#ffffff' }}>420 XP</div>
                <div style={{ fontSize: 11, color: '#958ea0' }}>Faltam 80 XP para Nível 4</div>
              </div>
            </div>
            <div style={{
              height: 6,
              backgroundColor: '#2a2a2c',
              borderRadius: 3,
              overflow: 'hidden'
            }}>
              <div style={{ height: '100%', width: '75%', backgroundColor: '#ffb95f', borderRadius: 3 }} />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          OS 6 PILARES DA ÁREA APRENDER
          ============================================================ */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        overflowX: 'auto',
        paddingBottom: 8,
        marginBottom: 28,
        scrollbarWidth: 'none'
      }}>
        {[
          { id: 'licoes', label: '📖 Lições Bíblicas' },
          { id: 'quizzes', label: '🎯 Quizzes & Desafios' },
          { id: 'versiculos', label: '📜 Versículos da Semana' },
          { id: 'desafios', label: '⭐ Missões & Desafios' },
          { id: 'progresso', label: '🏆 Meu Progresso & XP' },
          { id: 'atividades', label: '🎨 Atividades em PDF' }
        ].map(cat => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id as any)}
            style={{
              background: activeCategory === cat.id ? '#22c55e' : '#1c1b1d',
              color: activeCategory === cat.id ? '#052e16' : '#cbc3d7',
              border: `1px solid ${activeCategory === cat.id ? '#22c55e' : '#2a2a2c'}`,
              borderRadius: 20,
              padding: '9px 20px',
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease'
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* ============================================================
          PILAR 1 & 2: LIÇÕES BÍBLICAS & QUIZZES
          ============================================================ */}
      {(activeCategory === 'licoes' || activeCategory === 'quizzes') && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 24
        }}>
          {learningItems.map(item => (
            <div
              key={item.id}
              style={{
                backgroundColor: '#1c1b1d',
                borderRadius: 20,
                border: '1px solid #2a2a2c',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                transition: 'transform 0.2s ease'
              }}
            >
              {/* Thumbnail com Pills */}
              <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', backgroundColor: '#0e0e10' }}>
                <img
                  src={item.thumbnail_url}
                  alt={item.title}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: 12,
                  left: 12,
                  backgroundColor: 'rgba(19, 19, 21, 0.85)',
                  backdropFilter: 'blur(10px)',
                  padding: '4px 10px',
                  borderRadius: 12,
                  fontSize: 11,
                  fontWeight: 800,
                  color: '#22c55e'
                }}>
                  {item.category}
                </div>

                {item.quiz && item.quiz.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    backgroundColor: 'rgba(255, 185, 95, 0.9)',
                    color: '#472a00',
                    padding: '4px 10px',
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}>
                    <HelpCircle size={13} />
                    {item.quiz.length} Desafios
                  </div>
                )}
              </div>

              {/* Conteúdo do Card */}
              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', margin: '0 0 8px', lineHeight: 1.3 }}>
                  {item.title}
                </h3>

                {item.scripture_verse && (
                  <div style={{
                    backgroundColor: '#201f21',
                    borderRadius: 10,
                    padding: '8px 12px',
                    fontSize: 12,
                    color: '#22c55e',
                    fontWeight: 600,
                    marginBottom: 12,
                    lineHeight: 1.4
                  }}>
                    📖 {item.scripture_verse.slice(0, 85)}...
                  </div>
                )}

                <p style={{
                  fontSize: 13,
                  color: '#cbc3d7',
                  lineHeight: 1.5,
                  margin: '0 0 16px',
                  flex: 1
                }}>
                  {item.description}
                </p>

                {/* Botões de Ação */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 'auto' }}>
                  {item.quiz && item.quiz.length > 0 ? (
                    <Link
                      to={`/quiz/${item.id}`}
                      style={{
                        flex: 1,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        backgroundColor: '#22c55e',
                        color: '#052e16',
                        padding: '10px 16px',
                        borderRadius: 12,
                        fontSize: 13,
                        fontWeight: 800,
                        textDecoration: 'none',
                        boxShadow: '0 4px 14px rgba(34, 197, 94, 0.4)'
                      }}
                    >
                      <Award size={15} />
                      Começar Quiz
                    </Link>
                  ) : (
                    <Link
                      to={item.type === 'series' ? `/serie/${item.slug || item.id}` : `/assistir/${item.id}`}
                      style={{
                        flex: 1,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        backgroundColor: '#22c55e',
                        color: '#052e16',
                        padding: '10px 16px',
                        borderRadius: 12,
                        fontSize: 13,
                        fontWeight: 800,
                        textDecoration: 'none'
                      }}
                    >
                      <Play size={15} fill="#052e16" />
                      Assistir Lição
                    </Link>
                  )}

                  {item.related_pdf_id && (
                    <Link
                      to="/materiais-em-pdf"
                      title="Baixar PDF de Atividades"
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 12,
                        backgroundColor: '#201f21',
                        border: '1px solid #2a2a2c',
                        color: '#ffb95f',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textDecoration: 'none'
                      }}
                    >
                      <Download size={16} />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============================================================
          PILAR 3: VERSÍCULOS DA SEMANA (MEMORIZAÇÃO BÍBLICA)
          ============================================================ */}
      {activeCategory === 'versiculos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ marginBottom: 12 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Versículos da Semana para {profileName}
            </h2>
            <p style={{ fontSize: 14, color: '#cbc3d7', margin: '4px 0 0' }}>
              Leia, repita e decore a Palavra. Clique em "Memorizei" para registrar no seu perfil e ganhar XP!
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 18
          }}>
            {weeklyVerses.map(v => {
              const isMemorized = memorizedVerses.includes(v.id)
              return (
                <div
                  key={v.id}
                  style={{
                    backgroundColor: '#1c1b1d',
                    borderRadius: 20,
                    padding: 24,
                    border: isMemorized ? '1px solid #22c55e' : '1px solid #2a2a2c',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.35)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{
                        backgroundColor: 'rgba(255, 185, 95, 0.15)',
                        color: '#ffb95f',
                        padding: '3px 10px',
                        borderRadius: 12,
                        fontSize: 11,
                        fontWeight: 800
                      }}>
                        {v.theme}
                      </span>
                      <span style={{ fontSize: 12, color: '#22c55e', fontWeight: 800 }}>+{v.xp} XP</span>
                    </div>

                    <h3 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', margin: '0 0 10px' }}>
                      {v.reference}
                    </h3>

                    <div style={{
                      backgroundColor: '#201f21',
                      borderRadius: 14,
                      padding: 16,
                      fontSize: 15,
                      color: '#e5e1e4',
                      lineHeight: 1.6,
                      fontStyle: 'italic',
                      marginBottom: 14,
                      border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                      "{v.verse}"
                    </div>

                    <div style={{ fontSize: 12, color: '#958ea0', marginBottom: 16 }}>
                      História: <strong>{v.story}</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleVerse(v.id, v.reference)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: 12,
                      backgroundColor: isMemorized ? 'rgba(0, 155, 209, 0.2)' : '#22c55e',
                      color: isMemorized ? '#7bd0ff' : '#052e16',
                      border: isMemorized ? '1px solid #009bd1' : 'none',
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxShadow: isMemorized ? 'none' : '0 4px 14px rgba(34, 197, 94, 0.4)'
                    }}
                  >
                    {isMemorized ? <CheckCircle2 size={16} /> : <Bookmark size={16} />}
                    <span>{isMemorized ? 'Memorizado com Sucesso ✓' : 'Marcar como Memorizado (+50 XP)'}</span>
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ============================================================
          PILAR 4: MISSÕES & DESAFIOS SEMANAIS
          ============================================================ */}
      {activeCategory === 'desafios' && (
        <div>
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Missões da Semana
            </h2>
            <p style={{ fontSize: 14, color: '#cbc3d7', margin: '4px 0 0' }}>
              Complete tarefas bíblicas e desbloqueie novas medalhas e títulos para seu avatar.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 16
          }}>
            {weeklyMissions.map(m => (
              <div
                key={m.id}
                style={{
                  backgroundColor: '#1c1b1d',
                  borderRadius: 18,
                  padding: 20,
                  border: m.completed ? '1px solid rgba(123, 208, 255, 0.3)' : '1px solid #2a2a2c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    backgroundColor: m.completed ? 'rgba(0, 155, 209, 0.15)' : '#201f21',
                    fontSize: 22,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {m.icon}
                  </div>
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 800, color: '#ffffff', margin: '0 0 4px' }}>
                      {m.title}
                    </h4>
                    <span style={{ fontSize: 12, color: '#ffb95f', fontWeight: 800 }}>
                      +{m.xp} XP
                    </span>
                  </div>
                </div>

                {m.completed ? (
                  <span style={{
                    backgroundColor: 'rgba(0, 155, 209, 0.2)',
                    color: '#7bd0ff',
                    fontSize: 12,
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}>
                    <Check size={14} /> Concluído
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => showToast('Missão iniciada! Boa aventura!')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 10,
                      backgroundColor: '#22c55e',
                      color: '#052e16',
                      border: 'none',
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    Iniciar
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================
          PILAR 5: MEU PROGRESSO & XP
          ============================================================ */}
      {activeCategory === 'progresso' && (
        <div style={{
          backgroundColor: '#1c1b1d',
          borderRadius: 24,
          padding: 32,
          border: '1px solid #2a2a2c'
        }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#ffffff', margin: '0 0 8px' }}>
            Jornada de Aprendizado de {profileName}
          </h2>
          <p style={{ fontSize: 14, color: '#cbc3d7', margin: '0 0 24px' }}>
            Veja sua evolução diária, versículos guardados no coração e quizzes conquistados.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            marginBottom: 32
          }}>
            <div style={{ backgroundColor: '#201f21', borderRadius: 16, padding: 18, border: '1px solid #2a2a2c' }}>
              <div style={{ fontSize: 11, color: '#958ea0', fontWeight: 700 }}>XP Acumulado</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#ffb95f', marginTop: 4 }}>420 XP</div>
              <div style={{ fontSize: 11, color: '#cbc3d7', marginTop: 2 }}>Nível 3 • Explorador Bíblico</div>
            </div>

            <div style={{ backgroundColor: '#201f21', borderRadius: 16, padding: 18, border: '1px solid #2a2a2c' }}>
              <div style={{ fontSize: 11, color: '#958ea0', fontWeight: 700 }}>Histórias Assistidas</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#22c55e', marginTop: 4 }}>8 Aventuras</div>
              <div style={{ fontSize: 11, color: '#cbc3d7', marginTop: 2 }}>100% de aproveitamento</div>
            </div>

            <div style={{ backgroundColor: '#201f21', borderRadius: 16, padding: 18, border: '1px solid #2a2a2c' }}>
              <div style={{ fontSize: 11, color: '#958ea0', fontWeight: 700 }}>Versículos Memorizados</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#7bd0ff', marginTop: 4 }}>
                {memorizedVerses.length} Guardados
              </div>
              <div style={{ fontSize: 11, color: '#cbc3d7', marginTop: 2 }}>Palavra no coração</div>
            </div>

            <div style={{ backgroundColor: '#201f21', borderRadius: 16, padding: 18, border: '1px solid #2a2a2c' }}>
              <div style={{ fontSize: 11, color: '#958ea0', fontWeight: 700 }}>Sequência Diária</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#ffb95f', marginTop: 4 }}>🔥 7 Dias</div>
              <div style={{ fontSize: 11, color: '#cbc3d7', marginTop: 2 }}>Em chamas com Deus!</div>
            </div>
          </div>

          <Link
            to="/meu-com-deus-kids"
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
              textDecoration: 'none'
            }}
          >
            <span>Ver Central Pessoal Completa</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      )}

      {/* ============================================================
          PILAR 6: ATIVIDADES EM PDF
          ============================================================ */}
      {activeCategory === 'atividades' && (
        <div style={{
          backgroundColor: '#1c1b1d',
          borderRadius: 24,
          padding: 32,
          border: '1px solid #2a2a2c'
        }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#ffffff', margin: '0 0 8px' }}>
            Atividades Bíblicas em PDF para Imprimir
          </h2>
          <p style={{ fontSize: 14, color: '#cbc3d7', margin: '0 0 24px' }}>
            Cadernos ilustrados de colorir, caça-palavras bíblicos, labirintos e folhas de estudo.
          </p>

          <Link
            to="/materiais-em-pdf"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: '#ee9800',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: 14,
              fontSize: 14,
              fontWeight: 800,
              textDecoration: 'none'
            }}
          >
            <Download size={16} />
            <span>Acessar Central Completa de PDFs</span>
          </Link>
        </div>
      )}
    </div>
  )
}
