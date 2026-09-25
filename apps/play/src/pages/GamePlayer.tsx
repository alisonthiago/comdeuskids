import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@comdeuskids/supabase'
import { useProfile } from '../context/ProfileContext'
import { BIBLICAL_GAMES_CATALOG } from '../games/data/gamesCatalog'
import { GameDefinition } from '../games/types'
import { evaluateParentalPolicy } from '../lib/parentalPolicy'
import { Play, Search, Bell, Volume2, ArrowLeft, ChevronRight, Shield, Star, Heart, Download, Share2, ThumbsUp, MessageCircle, Trophy, Users } from 'lucide-react'

const GAMES_RUNNER_URL = (import.meta as any).env?.VITE_GAMES_URL || 'http://localhost:3004'

const FOOTER_COLS = [
  { title: 'CONTE\u00daDO INFANTIL', links: ['S\u00e9ries B\u00edblicas', 'Filmes Animados', 'Jogos Educativos', 'Louvores & Karaok\u00ea'] },
  { title: 'ESPA\u00c7O DA FAM\u00cdLIA', links: ['Painel dos Pais', 'Guia de Virtudes', 'Ajuda & Atendimento'] },
  { title: 'INSTITUCIONAL & LEGAL', links: ['Sobre N\u00f3s', 'Pol\u00edtica de Privacidade Infantil', 'Termos de Uso'] }
]

export default function GamePlayer() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { activeProfile } = useProfile()
  const [game, setGame] = useState<GameDefinition | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadGame() {
      setLoading(true)
      try {
        const { data, error } = await supabase.from('games').select('*').eq('slug', slug).single()
        if (!error && data) setGame(data as GameDefinition)
        else {
          const local = BIBLICAL_GAMES_CATALOG.find(g => g.slug === slug)
          if (local) setGame(local)
        }
      } catch {
        const local = BIBLICAL_GAMES_CATALOG.find(g => g.slug === slug)
        if (local) setGame(local)
      } finally { setLoading(false) }
    }
    if (slug) loadGame()
  }, [slug])

  const handleLaunchGame = () => {
    if (!game) return
    const policy = evaluateParentalPolicy(activeProfile, {
      contentAccessClass: 'educational' // Jogos bíblicos são educativos
    })

    if (!policy.allowed) {
      alert(`Controle Parental: ${policy.message}`)
      return
    }

    const profileParam = activeProfile?.id ? `?profile_id=${activeProfile.id}&game_id=${game.id}` : ''
    window.location.href = `${GAMES_RUNNER_URL}/play/${game.slug}${profileParam}`
  }

  const relatedGames = BIBLICAL_GAMES_CATALOG.filter(g => g.slug !== slug).slice(0, 8)

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0d0e14', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontFamily: 'var(--cdk-font-body)' }}>Carregando...</div>
  )

  if (!game) return (
    <div style={{ minHeight: '100vh', background: '#0d0e14', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', gap: 16, fontFamily: 'var(--cdk-font-body)' }}>
      <p>Jogo n\u00e3o encontrado</p>
      <button onClick={() => navigate('/jogos')} style={{ padding: '10px 24px', borderRadius: 10, background: '#22c55e', color: '#052e16', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Voltar</button>
    </div>
  )

  return (
    <div style={{ background: '#0d0e14', minHeight: '100vh', color: '#fff', fontFamily: 'var(--cdk-font-body)' }}>

      {/* TOP NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, zIndex: 100, background: 'rgba(13,14,20,0.96)', backdropFilter: 'blur(12px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #22c55e, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>\u271D\uFE0F</div>
          <span style={{ fontWeight: 800, fontSize: 16 }}>Com Deus Kids</span>
        </div>
        <div style={{ flex: 1, maxWidth: 420, margin: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.07)', borderRadius: 10, padding: '8px 14px' }}>
            <Search size={15} color="#6b7280" />
            <input placeholder="Buscar hist\u00f3rias, jogos e louvores..." style={{ border: 'none', background: 'transparent', color: '#fff', fontSize: 13, outline: 'none', width: '100%' }} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Volume2 size={20} color="#6b7280" style={{ cursor: 'pointer' }} />
          <Bell size={20} color="#6b7280" style={{ cursor: 'pointer' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>{activeProfile?.name || 'Sara'}</p>
              <p style={{ margin: 0, fontSize: 11, color: '#f59e0b' }}>\u2B50\u2B50\u2B50 N\u00edvel 3</p>
            </div>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#052e16', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>
              {(activeProfile?.name || 'S').charAt(0)}
            </div>
          </div>
        </div>
      </nav>

      <div style={{ padding: '20px 24px 48px', maxWidth: 1280, margin: '0 auto' }}>

        {/* BREADCRUMB */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button onClick={() => navigate('/jogos')} style={{ background: 'transparent', border: 'none', color: '#6b7280', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              <ArrowLeft size={14} /> Jogos B\u00edblicos
            </button>
            <ChevronRight size={14} color="#4b5563" />
            <span style={{ fontSize: 13, color: '#6b7280' }}>{game.game_type}</span>
            <ChevronRight size={14} color="#4b5563" />
            <span style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>{game.title}</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 8, padding: '4px 10px', fontSize: 12, color: '#f59e0b', fontWeight: 600 }}>\u23F1\uFE0F Tempo sugerido: 15 min</span>
            <span style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 8, padding: '4px 10px', fontSize: 12, color: '#34d399', fontWeight: 600 }}>\u2705 100% Livre & Crist\u00e3o</span>
          </div>
        </div>

        {/* MAIN 3-COL */}
        <div style={{ display: 'grid', gridTemplateColumns: '72px 1fr 72px', gap: 12, marginBottom: 20 }}>

          {/* LEFT THUMBNAILS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {relatedGames.slice(0, 5).map((g, i) => (
              <div key={g.id} onClick={() => navigate(`/jogos/${g.slug}`)} style={{ borderRadius: 8, overflow: 'hidden', cursor: 'pointer', border: g.slug === slug ? '2px solid #22c55e' : '2px solid transparent', transition: 'border-color 0.15s', flexShrink: 0 }}>
                <img src={g.cover_url} alt={g.title} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }} />
              </div>
            ))}
          </div>

          {/* CENTER PLAYER */}
          <div style={{ borderRadius: 16, overflow: 'hidden', position: 'relative', background: '#000' }}>
            {/* Top bar inside player */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ background: 'rgba(245,158,11,0.9)', color: '#000', fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 4, textTransform: 'uppercase' }}>\U0001F3AE MODO {game.game_type.toUpperCase()}</span>
                <span style={{ background: 'rgba(0,0,0,0.5)', color: '#f59e0b', fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4 }}>\U0001F3C6 1.250 PTS</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[Volume2, Play, ArrowLeft].map((Icon, i) => (
                  <div key={i} style={{ width: 32, height: 32, borderRadius: 6, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Icon size={15} color="#fff" />
                  </div>
                ))}
              </div>
            </div>

            {/* Game cover image */}
            <div style={{ position: 'relative', paddingTop: '56.25%' }}>
              <img src={game.cover_url} alt={game.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />

              {/* Center content overlay */}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                <span style={{ background: 'rgba(34,197,94,0.9)', color: '#052e16', fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 9999, textTransform: 'uppercase', letterSpacing: '1px' }}>JOGO EXCLUSIVO</span>
                <h1 style={{ margin: 0, fontSize: 'clamp(20px, 3vw, 36px)', fontWeight: 800, textAlign: 'center', lineHeight: 1.1, letterSpacing: '-0.5px' }}>{game.title}</h1>
                <p style={{ margin: 0, fontSize: 14, color: '#d1d5db', textAlign: 'center' }}>{game.instructions?.split('.')[0] || 'O Caminho Sagrado para a Vit\u00f3ria'}</p>
                <button onClick={handleLaunchGame} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 36px', borderRadius: 14, background: '#f59e0b', color: '#000', fontSize: 16, fontWeight: 800, border: 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#d97706' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#f59e0b' }}>
                  <Play size={20} fill="#000" /> JOGAR AGORA
                </button>
              </div>

              {/* Bottom status bar */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 16px', background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: '#34d399', fontWeight: 700 }}>\u2705 Pronto para iniciar!</span>
                  <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.15)', borderRadius: 9999, overflow: 'hidden' }}>
                    <div style={{ width: '100%', height: '100%', background: '#34d399', borderRadius: 9999 }} />
                  </div>
                  <span style={{ fontSize: 11, color: '#6b7280' }}>100% — 12.5 / 12.5 Mb</span>
                </div>
                <p style={{ margin: 0, fontSize: 11, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 6 }}>
                  \U0001F4CD <strong>Dica:</strong> {game.instructions?.substring(0, 60) || 'Use o joystick ou as teclas WASD para mover o personagem'}...
                </p>
              </div>
            </div>

            {/* Controls bar */}
            <div style={{ background: '#0d0e14', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: '#6b7280' }}>
              <div style={{ display: 'flex', gap: 14 }}>
                <span>CONTROLES:</span>
                {[['A D', 'Mover'], ['ESPA\u00c7O', 'Pular'], ['F', 'A\u00e7\u00e3o']].map(([key, label]) => (
                  <span key={key}><span style={{ background: '#1a1b25', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 4, padding: '1px 6px', fontSize: 11, fontWeight: 700, color: '#fff' }}>{key}</span> {label}</span>
                ))}
              </div>
              <span style={{ color: '#22c55e', fontWeight: 700, cursor: 'pointer' }}>\U0001F4F1 Modo Toque Ativo</span>
            </div>
          </div>

          {/* RIGHT THUMBNAILS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {relatedGames.slice(5, 10).map((g) => (
              <div key={g.id} onClick={() => navigate(`/jogos/${g.slug}`)} style={{ borderRadius: 8, overflow: 'hidden', cursor: 'pointer', border: '2px solid transparent', transition: 'border-color 0.15s', flexShrink: 0 }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(34,197,94,0.5)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent' }}>
                <img src={g.cover_url} alt={g.title} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }} />
              </div>
            ))}
            <div style={{ marginTop: 4, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trophy size={18} color="#f59e0b" />
              </div>
              <span style={{ fontSize: 9, color: '#6b7280', fontWeight: 700, textAlign: 'center' }}>Trofeus</span>
            </div>
          </div>
        </div>

        {/* GAME INFO CARD */}
        <div style={{ background: '#16171f', borderRadius: 14, padding: '16px 20px', marginBottom: 16, display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ width: 64, height: 64, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
            <img src={game.cover_url} alt={game.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>{game.title}</h2>
              <span style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 9999, textTransform: 'uppercase' }}>FASE 1: IN\u00cdCIO</span>
            </div>
            <p style={{ margin: '0 0 4px', fontSize: 12, color: '#6b7280' }}>Por Est\u00fadio Com Deus Kids Original</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#f59e0b', fontSize: 12, fontWeight: 700 }}><Star size={12} fill="#f59e0b" /> 4.9</span>
              <span style={{ fontSize: 12, color: '#6b7280' }}>(18.4k avalia\u00e7\u00f5es)</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#9ca3af', fontSize: 13 }}>
              <ThumbsUp size={16} /> <span style={{ fontWeight: 700 }}>48.5k</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#9ca3af', fontSize: 13 }}>
              <MessageCircle size={16} /> <span style={{ fontWeight: 700 }}>241</span>
            </div>
            <Download size={18} color="#9ca3af" style={{ cursor: 'pointer' }} />
            <Share2 size={18} color="#9ca3af" style={{ cursor: 'pointer' }} />
            <button onClick={handleLaunchGame} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#22c55e', color: '#052e16', border: 'none', borderRadius: 10, padding: '10px 18px', fontSize: 13, fontWeight: 800, cursor: 'pointer', transition: 'background 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#16a34a' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#22c55e' }}>
              <Users size={16} /> Jogar em Dupla
            </button>
          </div>
        </div>

        {/* SCRIPTURE SECTION */}
        <div style={{ background: '#16171f', borderRadius: 14, padding: '18px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, border: '1px solid rgba(34,197,94,0.2)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 18 }}>\U0001F4D6</span>
            </div>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: 11, color: '#22c55e', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Vers\u00edculo Chave da Miss\u00e3o &nbsp; {game.config?.chapter || 'Salmos 23:1'}</p>
              <p style={{ margin: '0 0 4px', fontSize: 14, fontStyle: 'italic', color: '#e5e7eb' }}>"{game.learning_goal || 'O Senhor \u00e9 o meu pastor e nada me faltar\u00e1.'}"</p>
              <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>Ao vencer o n\u00edvel, voc\u00ea desbloqueia o desenho oficial para colorir em fam\u00edlia!</p>
            </div>
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', borderRadius: 10, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
            <Download size={14} /> Baixar Desenho PDF
          </button>
        </div>

        {/* RELATED GAMES */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>\U0001F3AE Mais Jogos Que Voc\u00ea Vai Amar</h2>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6b7280' }}>Jogos 100% testados, sem an\u00fancios e com valores b\u00edblicos para todas as idades.</p>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['Todos', 'Aventura', 'Quebra-cabe\u00e7a', 'M\u00fasica & Louvor'].map((f, i) => (
                <button key={i} style={{ background: i === 0 ? '#22c55e' : 'rgba(255,255,255,0.07)', border: 'none', color: i === 0 ? '#052e16' : '#fff', fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 9999, cursor: 'pointer' }}>{f}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
            {relatedGames.map(g => (
              <div key={g.id} onClick={() => navigate(`/jogos/${g.slug}`)} style={{ cursor: 'pointer', transition: 'transform 0.18s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}>
                <div style={{ borderRadius: 10, overflow: 'hidden', position: 'relative', marginBottom: 6 }}>
                  <img src={g.cover_url} alt={g.title} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)' }} />
                  <span style={{ position: 'absolute', top: 5, left: 5, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', color: '#4ade80', fontSize: 8, fontWeight: 700, padding: '2px 5px', borderRadius: 3, textTransform: 'uppercase' }}>{g.game_type}</span>
                </div>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#e5e7eb', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SECURITY BANNER */}
        <div style={{ background: '#16171f', borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, border: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Shield size={20} color="#22c55e" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 800 }}>Ambiente 100% Seguro & Crist\u00e3o</p>
              <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>Conte\u00fado verificado e supervisionado por educadores e pastores. Sem an\u00fancios, sem rastreamento prejudicial.</p>
            </div>
          </div>
          <span style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, color: '#f59e0b', flexShrink: 0 }}>\U0001F512 Controle Parental Ativo</span>
        </div>

        {/* FOOTER */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 28, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: 'linear-gradient(135deg, #22c55e, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>\u271D\uFE0F</div>
              <span style={{ fontWeight: 800, fontSize: 14 }}>Com Deus Kids</span>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>Streaming crist\u00e3o seguro, alegre e inspirador para edificar as crian\u00e7as na f\u00e9.</p>
          </div>
          {FOOTER_COLS.map((col, i) => (
            <div key={i}>
              <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{col.title}</p>
              {col.links.map(link => (
                <p key={link} style={{ margin: '0 0 6px', fontSize: 12, color: '#9ca3af', cursor: 'pointer' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#9ca3af' }}
                >{link}</p>
              ))}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <p style={{ margin: 0, fontSize: 12, color: '#4b5563' }}>\u00A9 2025 Com Deus Kids. Todos os direitos reservados. Feito com amor celestial.</p>
          <div style={{ display: 'flex', gap: 16 }}>
            <span style={{ fontSize: 12, color: '#6b7280' }}>\U0001F6E1\uFE0F Prote\u00e7\u00e3o da Fam\u00edlia</span>
            <span style={{ fontSize: 12, color: '#6b7280' }}>\U0001F4FA Transmiss\u00e3o em Alta Defini\u00e7\u00e3o</span>
          </div>
        </div>
      </div>
    </div>
  )
}
