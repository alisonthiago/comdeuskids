import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useProfile } from '../context/ProfileContext'
import { getAvatarImageUrl } from '../data/avatars'
import { STREAM_CATALOG } from '../data/streamCatalog'
import {
  Play, Heart, Clock, Award, Sparkles, BookOpen, Download,
  Music, Film, Star, ChevronRight, CheckCircle2, Bookmark,
  Flame, Shield, ArrowRight, RotateCcw, Compass
} from 'lucide-react'

export default function MeuComDeusKids() {
  const navigate = useNavigate()
  const { activeProfile, myList, watchProgress } = useProfile()
  const [activeTab, setActiveTab] = useState<'todos' | 'assistindo' | 'ouvindo' | 'lista' | 'conquistas' | 'materiais'>('todos')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2500)
  }

  const profileName = activeProfile?.name || 'Davi'
  const profileAvatar = getAvatarImageUrl(activeProfile?.avatar_url)

  // 1. Itens em Andamento (Continuar Assistindo)
  const continueWatchingItems = STREAM_CATALOG.filter(item => {
    const prog = watchProgress[item.id]
    if (prog && prog.progress_seconds > 10 && !prog.completed) return true
    if (item.seasons) {
      for (const s of item.seasons) {
        for (const ep of (s.episodes || [])) {
          const epProg = watchProgress[ep.id]
          if (epProg && epProg.progress_seconds > 10 && !epProg.completed) return true
        }
      }
    }
    return false
  })

  // Fallback amigável com itens bíblicos caso a conta ainda não tenha assistido
  const defaultContinueWatching = continueWatchingItems.length > 0
    ? continueWatchingItems
    : [STREAM_CATALOG[1], STREAM_CATALOG[0]]

  // 2. Músicas & Louvores (Continuar Ouvindo)
  const continueListeningItems = STREAM_CATALOG.filter(c => c.category === 'Músicas')
  const defaultContinueListening = continueListeningItems.length > 0 ? continueListeningItems : [
    {
      id: 'musica-davi',
      title: 'O Gigante Caiu!',
      subtitle: 'Com Deus Kids Louvor',
      thumbnail_url: '/posters/davi_vertical.png',
      duration: '03:15'
    },
    {
      id: 'musica-noe',
      title: 'Arco-Íris da Aliança',
      subtitle: 'A Arca de Noé Canções',
      thumbnail_url: '/thumbnails/noe.jpg',
      duration: '02:48'
    }
  ]

  // 3. Minha Lista
  const myListItems = STREAM_CATALOG.filter(item => myList.includes(item.id))

  // 4. Conquistas & Medalhas do Perfil
  const achievements = [
    { id: 'streak-7', title: '7 Dias na Fé', desc: 'Completou 7 dias seguidos aprendendo a Palavra', icon: '🔥', earned: true, date: 'Hoje' },
    { id: 'first-story', title: 'Primeira Aventura', desc: 'Assistiu à primeira história completa', icon: '⭐', earned: true, date: 'Ontem' },
    { id: 'quiz-master', title: 'Mestre do Quiz', desc: 'Acertou 100% no Quiz de Davi e Golias', icon: '🎯', earned: true, date: 'Há 3 dias' },
    { id: 'ark-builder', title: 'Amigo de Noé', desc: 'Completou os 5 episódios da 1ª temporada', icon: '🚢', earned: true, date: 'Esta semana' },
    { id: 'pdf-artist', title: 'Pintor Celestial', desc: 'Baixou e coloriu 3 cadernos de atividades', icon: '🎨', earned: false, progress: '2 de 3' },
    { id: 'super-bible', title: 'Guardião dos Versículos', desc: 'Memorizou 5 versículos da semana', icon: '📖', earned: false, progress: '3 de 5' }
  ]

  // 5. Meus Materiais & Atividades
  const myMaterials = [
    { id: 'mat-davi', title: 'Davi & Golias — Kit de Desenhos & Labirintos', pages: 16, format: 'PDF A4', status: 'Baixado' },
    { id: 'mat-noe', title: 'A Arca de Noé — Caderno de Colorir e Caça-Palavras', pages: 32, format: 'PDF A4', status: 'Baixado' },
    { id: 'mat-daniel', title: 'Daniel na Cova dos Leões — Atividades de Memorização', pages: 12, format: 'PDF A4', status: 'Disponível' }
  ]

  // 6. Recomendações Personalizadas
  const recommendations = STREAM_CATALOG.slice(0, 4)

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#131315',
      color: '#e5e1e4',
      paddingTop: 84,
      paddingBottom: 144,
      fontFamily: "'Baloo 2', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      {/* Toast Feedback */}
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

      <div style={{ maxWidth: 1480, margin: '0 auto', padding: '0 clamp(16px, 4vw, 40px)' }}>

        {/* ============================================================
            1. HERO HUB PESSOAL: "MEU COM DEUS KIDS"
            ============================================================ */}
        <section style={{
          position: 'relative',
          backgroundColor: '#1c1b1d',
          borderRadius: 24,
          padding: '32px 28px',
          border: '1px solid #2a2a2c',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.45)',
          marginBottom: 52,
          overflow: 'hidden'
        }}>
          {/* Ambient Glow */}
          <div style={{
            position: 'absolute',
            top: -40,
            right: -40,
            width: 240,
            height: 240,
            borderRadius: '50%',
            backgroundColor: 'rgba(34, 197, 94, 0.12)',
            filter: 'blur(60px)',
            pointerEvents: 'none'
          }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
            {/* Dados do Perfil */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <div style={{
                position: 'relative',
                width: 84,
                height: 84,
                borderRadius: '50%',
                padding: 3,
                background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                boxShadow: '0 8px 24px rgba(34, 197, 94, 0.35)',
                flexShrink: 0
              }}>
                <img
                  src={profileAvatar}
                  alt={profileName}
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                  onError={(e) => { (e.target as HTMLImageElement).src = '/avatars/davi.png' }}
                />
                <span style={{
                  position: 'absolute',
                  bottom: 2,
                  right: 2,
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: '#ffb95f',
                  color: '#472a00',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: 12,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
                }}>
                  ⭐
                </span>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                  <span style={{
                    backgroundColor: 'rgba(34, 197, 94, 0.15)',
                    color: '#22c55e',
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase'
                  }}>
                    Espaço Exclusivo
                  </span>
                  <span style={{ color: '#ffb95f', fontSize: 13, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Flame size={15} fill="#ffb95f" /> 7 dias seguidos aprendendo
                  </span>
                </div>

                <h1 style={{
                  fontSize: 'clamp(26px, 4vw, 36px)',
                  fontWeight: 800,
                  color: '#ffffff',
                  margin: 0,
                  lineHeight: 1.15
                }}>
                  Meu Com Deus Kids • {profileName}
                </h1>

                <p style={{ fontSize: 14, color: '#cbc3d7', margin: '6px 0 0' }}>
                  Sua central de histórias, louvores, atividades, medalhas e progresso espiritual.
                </p>
              </div>
            </div>

            {/* Ações Rápidas */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => navigate('/meu-perfil')}
                style={{
                  padding: '10px 18px',
                  borderRadius: 14,
                  backgroundColor: '#201f21',
                  color: '#22c55e',
                  border: '1px solid #353437',
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Editar Perfil / Avatar
              </button>

              <button
                type="button"
                onClick={() => navigate('/selecionar-perfil')}
                style={{
                  padding: '10px 18px',
                  borderRadius: 14,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: '#cbc3d7',
                  border: '1px solid #2a2a2c',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Trocar Perfil
              </button>
            </div>
          </div>

          {/* CARD DE VERSÍCULO DO DIA PARA O PERFIL */}
          <div style={{
            marginTop: 24,
            backgroundColor: '#201f21',
            borderRadius: 16,
            padding: '16px 20px',
            border: '1px solid rgba(208, 188, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 14
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: 'rgba(255, 185, 95, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffb95f'
              }}>
                <BookOpen size={18} />
              </div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#ffb95f', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Versículo do Dia para {profileName}
                </span>
                <div style={{ fontSize: 14, color: '#ffffff', fontWeight: 700, marginTop: 2 }}>
                  "Tudo posso naquele que me fortalece." — Filipenses 4:13
                </div>
              </div>
            </div>

            <Link
              to="/aprender"
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: '#22c55e',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <span>Ver Lição do Dia</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        {/* ============================================================
            2. ABAS DE NAVEGAÇÃO DA CENTRAL PESSOAL
            ============================================================ */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          overflowX: 'auto',
          paddingBottom: 10,
          marginBottom: 48,
          scrollbarWidth: 'none'
        }}>
          {[
            { id: 'todos', label: 'Tudo' },
            { id: 'assistindo', label: 'Continuar Assistindo' },
            { id: 'ouvindo', label: 'Continuar Ouvindo' },
            { id: 'lista', label: `Minha Lista (${myList.length})` },
            { id: 'conquistas', label: 'Minhas Conquistas' },
            { id: 'materiais', label: 'Meus Materiais & Atividades' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '9px 20px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 800,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                border: activeTab === tab.id ? '1px solid #22c55e' : '1px solid #2a2a2c',
                backgroundColor: activeTab === tab.id ? '#22c55e' : '#1c1b1d',
                color: activeTab === tab.id ? '#052e16' : '#cbc3d7',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ============================================================
            3. SEÇÃO: CONTINUAR ASSISTINDO
            ============================================================ */}
        {(activeTab === 'todos' || activeTab === 'assistindo') && (
          <section style={{ marginBottom: 64 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Film size={20} color="#22c55e" />
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Continuar Assistindo
                </h2>
              </div>
              <span style={{ fontSize: 12, color: '#958ea0' }}>Retome de onde parou</span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 20
            }}>
              {defaultContinueWatching.map((item: any) => {
                const epProg = watchProgress[item.id] || { progress_seconds: 758, duration_seconds: 1500 }
                const pct = Math.min(95, Math.round((epProg.progress_seconds / epProg.duration_seconds) * 100))
                const mins = Math.floor(epProg.progress_seconds / 60)

                return (
                  <div
                    key={item.id}
                    onClick={() => navigate(item.type === 'series' ? `/serie/${item.slug || item.id}` : `/assistir/${item.id}`)}
                    style={{
                      backgroundColor: '#1c1b1d',
                      borderRadius: 18,
                      overflow: 'hidden',
                      border: '1px solid #2a2a2c',
                      cursor: 'pointer',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                      transition: 'transform 0.2s ease'
                    }}
                  >
                    <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', backgroundColor: '#0e0e10' }}>
                      <img
                        src={item.thumbnail_url}
                        alt={item.title}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                      />

                      {/* Play Hover Bubble */}
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <div style={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          backgroundColor: 'rgba(34, 197, 94, 0.95)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#052e16'
                        }}>
                          <Play size={20} fill="#052e16" style={{ marginLeft: 2 }} />
                        </div>
                      </div>

                      {/* Barra de Progresso */}
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 5,
                        backgroundColor: 'rgba(0,0,0,0.6)'
                      }}>
                        <div style={{ height: '100%', width: `${pct}%`, backgroundColor: '#22c55e' }} />
                      </div>
                    </div>

                    <div style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: '#ffb95f' }}>
                          {item.type === 'series' ? 'Série 3D' : 'Filme'}
                        </span>
                        <span style={{ fontSize: 11, color: '#958ea0' }}>{mins} min assistidos</span>
                      </div>
                      <h3 style={{ fontSize: 15, fontWeight: 800, color: '#ffffff', margin: '0 0 8px', lineHeight: 1.2 }}>
                        {item.title}
                      </h3>
                      <button
                        type="button"
                        style={{
                          width: '100%',
                          padding: '8px',
                          borderRadius: 10,
                          backgroundColor: '#201f21',
                          color: '#22c55e',
                          border: '1px solid #353437',
                          fontSize: 12,
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6
                        }}
                      >
                        <Play size={13} fill="#22c55e" />
                        Continuar
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ============================================================
            4. SEÇÃO: CONTINUAR OUVINDO (LOUVORES & MÚSICAS)
            ============================================================ */}
        {(activeTab === 'todos' || activeTab === 'ouvindo') && (
          <section style={{ marginBottom: 64 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Music size={20} color="#ffb95f" />
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Continuar Ouvindo
                </h2>
              </div>
              <Link to="/musicas" style={{ fontSize: 12, color: '#ffb95f', fontWeight: 800, textDecoration: 'none' }}>
                Ver Todas as Músicas →
              </Link>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 16
            }}>
              {defaultContinueListening.map((track: any) => (
                <div
                  key={track.id}
                  onClick={() => navigate('/player-musical')}
                  style={{
                    backgroundColor: '#1c1b1d',
                    borderRadius: 16,
                    padding: 14,
                    border: '1px solid #2a2a2c',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <img
                    src={track.thumbnail_url}
                    alt={track.title}
                    style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {track.title}
                    </div>
                    <div style={{ fontSize: 12, color: '#958ea0', marginTop: 2 }}>
                      {track.subtitle || 'Com Deus Kids'}
                    </div>
                  </div>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    backgroundColor: '#ffb95f',
                    color: '#472a00',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Play size={16} fill="#472a00" style={{ marginLeft: 2 }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ============================================================
            5. SEÇÃO: MINHA LISTA
            ============================================================ */}
        {(activeTab === 'todos' || activeTab === 'lista') && (
          <section style={{ marginBottom: 64 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Bookmark size={20} color="#7bd0ff" />
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Minha Lista ({myList.length})
                </h2>
              </div>
              <Link to="/minha-lista" style={{ fontSize: 12, color: '#7bd0ff', fontWeight: 800, textDecoration: 'none' }}>
                Gerenciar Lista →
              </Link>
            </div>

            {myListItems.length === 0 ? (
              <div style={{
                backgroundColor: '#1c1b1d',
                borderRadius: 18,
                padding: '32px 24px',
                textAlign: 'center',
                border: '1px dashed #353437'
              }}>
                <Bookmark size={36} color="#494454" style={{ marginBottom: 12 }} />
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', margin: '0 0 6px' }}>
                  Sua lista está vazia
                </h3>
                <p style={{ fontSize: 13, color: '#958ea0', margin: '0 0 16px' }}>
                  Adicione histórias e episódios favoritos clicando no botão "+ Minha Lista".
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/videos')}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 12,
                    backgroundColor: '#22c55e',
                    color: '#052e16',
                    border: 'none',
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Explorar Catálogo
                </button>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: 16
              }}>
                {myListItems.map(item => (
                  <div
                    key={item.id}
                    onClick={() => navigate(item.type === 'series' ? `/serie/${item.slug || item.id}` : `/conteudo/${item.slug || item.id}`)}
                    style={{
                      backgroundColor: '#1c1b1d',
                      borderRadius: 16,
                      overflow: 'hidden',
                      border: '1px solid #2a2a2c',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%' }}>
                      <img
                        src={item.thumbnail_url}
                        alt={item.title}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ padding: 12 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#ffffff' }}>{item.title}</div>
                      <div style={{ fontSize: 11, color: '#ffb95f', marginTop: 2 }}>{item.category}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ============================================================
            6. SEÇÃO: MINHAS CONQUISTAS & MEDALHAS BÍBLICAS
            ============================================================ */}
        {(activeTab === 'todos' || activeTab === 'conquistas') && (
          <section style={{ marginBottom: 64 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Award size={20} color="#ffb95f" />
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Minhas Conquistas & Medalhas
                </h2>
              </div>
              <span style={{ fontSize: 12, color: '#ffb95f', fontWeight: 800 }}>4 de 6 Conquistadas</span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 16
            }}>
              {achievements.map(ach => (
                <div
                  key={ach.id}
                  style={{
                    backgroundColor: '#1c1b1d',
                    borderRadius: 18,
                    padding: '18px 16px',
                    border: ach.earned ? '1px solid rgba(255, 185, 95, 0.3)' : '1px solid #2a2a2c',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 14,
                    opacity: ach.earned ? 1 : 0.65
                  }}
                >
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    backgroundColor: ach.earned ? 'rgba(255, 185, 95, 0.15)' : '#201f21',
                    fontSize: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {ach.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <h4 style={{ fontSize: 14, fontWeight: 800, color: '#ffffff', margin: 0 }}>
                        {ach.title}
                      </h4>
                      {ach.earned ? (
                        <span style={{ fontSize: 10, color: '#ffb95f', fontWeight: 800 }}>✓ Ganho</span>
                      ) : (
                        <span style={{ fontSize: 10, color: '#958ea0' }}>{ach.progress}</span>
                      )}
                    </div>
                    <p style={{ fontSize: 12, color: '#cbc3d7', margin: '4px 0 0', lineHeight: 1.4 }}>
                      {ach.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ============================================================
            7. SEÇÃO: MEUS MATERIAIS & ATIVIDADES
            ============================================================ */}
        {(activeTab === 'todos' || activeTab === 'materiais') && (
          <section style={{ marginBottom: 64 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BookOpen size={20} color="#7bd0ff" />
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Meus Materiais & Atividades
                </h2>
              </div>
              <Link to="/materiais-em-pdf" style={{ fontSize: 12, color: '#7bd0ff', fontWeight: 800, textDecoration: 'none' }}>
                Ver Todos os PDFs →
              </Link>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 16
            }}>
              {myMaterials.map(mat => (
                <div
                  key={mat.id}
                  style={{
                    backgroundColor: '#1c1b1d',
                    borderRadius: 16,
                    padding: '16px 18px',
                    border: '1px solid #2a2a2c',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 14
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 800, color: '#ffffff', margin: '0 0 4px' }}>
                      {mat.title}
                    </h4>
                    <div style={{ fontSize: 12, color: '#958ea0' }}>
                      {mat.pages} páginas • {mat.format} • <span style={{ color: '#7bd0ff' }}>{mat.status}</span>
                    </div>
                  </div>
                  <Link
                    to="/materiais-em-pdf"
                    style={{
                      padding: '8px 14px',
                      borderRadius: 10,
                      backgroundColor: '#201f21',
                      color: '#22c55e',
                      border: '1px solid #353437',
                      fontSize: 12,
                      fontWeight: 800,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <Download size={14} />
                    Abrir
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ============================================================
            8. RECOMENDAÇÕES PARA VOCÊ
            ============================================================ */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Compass size={20} color="#22c55e" />
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Recomendações para {profileName}
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 18
          }}>
            {recommendations.map(rec => (
              <div
                key={rec.id}
                onClick={() => navigate(rec.type === 'series' ? `/serie/${rec.slug || rec.id}` : `/conteudo/${rec.slug || rec.id}`)}
                style={{
                  backgroundColor: '#1c1b1d',
                  borderRadius: 16,
                  overflow: 'hidden',
                  border: '1px solid #2a2a2c',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', backgroundColor: '#0e0e10' }}>
                  <img
                    src={rec.thumbnail_url}
                    alt={rec.title}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    backgroundColor: 'rgba(19, 19, 21, 0.85)',
                    padding: '2px 8px',
                    borderRadius: 8,
                    fontSize: 10,
                    fontWeight: 800,
                    color: '#22c55e'
                  }}>
                    {rec.category}
                  </div>
                </div>
                <div style={{ padding: '12px 14px' }}>
                  <h4 style={{ fontSize: 14, fontWeight: 800, color: '#ffffff', margin: '0 0 4px' }}>
                    {rec.title}
                  </h4>
                  <div style={{ fontSize: 11, color: '#ffb95f', fontWeight: 700 }}>
                    {rec.age_range || 'Livre'} • {rec.type === 'series' ? 'Série 3D' : 'Filme'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
