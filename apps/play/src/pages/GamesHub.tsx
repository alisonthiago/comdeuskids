import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@comdeuskids/supabase'
import { useProfile } from '../context/ProfileContext'
import { BIBLICAL_GAMES_CATALOG } from '../games/data/gamesCatalog'
import { GameDefinition, ProfileGameProgress } from '../games/types'
import { Play, Search, Bell, Volume2, ChevronRight, Star, Shield } from 'lucide-react'

const CATEGORY_PILLS = [
  { id: 'all', label: 'Todos os Jogos', emoji: '\u2B50' },
  { id: 'quiz', label: 'Quizzes da B\u00edbia', emoji: '\U0001F4D6' },
  { id: 'adventure', label: 'Aventura & A\u00e7\u00e3o', emoji: '\u2694\uFE0F' },
  { id: 'puzzle', label: 'Quebra-Cabe\u00e7a', emoji: '\U0001F9E9' },
  { id: 'memory', label: 'Arca dos Bichos', emoji: '\U0001F981' },
  { id: 'sequence', label: 'Hist\u00f3rias em Ordem', emoji: '\U0001F4DC' },
  { id: 'maze', label: 'Her\u00f3is da F\u00e9', emoji: '\U0001F3C6' },
]

const FAMILY_MODES = [
  {
    emoji: '\U0001F46A',
    title: 'Desafio em Fam\u00edlia',
    desc: 'Conecte celulares ou jogue na TV da sala com perguntas b\u00edblicas para pais e filhos responderem juntos.',
    badge: '2 a 6 Jogadores',
    color: '#f59e0b'
  },
  {
    emoji: '\U0001F319',
    title: 'Modo Sons de Paz',
    desc: 'Quebra-cabe\u00e7as lentos com m\u00fasicas de ninar e louvores instrumentais suaves para antes do sono.',
    badge: 'Sem Sons Agitados',
    color: '#22c55e'
  },
  {
    emoji: '\U0001F4DA',
    title: 'Primeiras Palavras de F\u00e9',
    desc: 'Ensine letras, n\u00fameros e virtudes como amor, bondade e ora\u00e7\u00e3o com narra\u00e7\u00e3o carinhosa em portugu\u00eas.',
    badge: '3 a 6 anos',
    color: '#10b981'
  }
]

const FOOTER_COLS = [
  { title: 'CONTE\u00daDO INFANTIL', links: ['S\u00e9ries B\u00edblicas', 'Filmes Animados', 'Jogos Educativos', 'Louvores & Karaok\u00ea', 'Desenhos para Colorir'] },
  { title: 'ESPA\u00c7O DA FAM\u00cdLIA', links: ['Painel dos Pais', 'Guia de Virtudes', 'Gest\u00e3o de Tempo de Tela', 'Ajuda & Atendimento'] },
  { title: 'INSTITUCIONAL & LEGAL', links: ['Sobre N\u00f3s', 'Pol\u00edtica de Privacidade Infantil', 'Termos de Uso', 'Selo de Conformidade COPPA'] }
]

export default function GamesHub() {
  const navigate = useNavigate()
  const { activeProfile } = useProfile()
  const [games, setGames] = useState<GameDefinition[]>(BIBLICAL_GAMES_CATALOG)
  const [userProgress, setUserProgress] = useState<Record<string, ProfileGameProgress>>({})
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase.from('games').select('*').eq('status', 'published').order('sort_order', { ascending: true })
        if (!error && data && data.length > 0) setGames(data as GameDefinition[])
        else setGames(BIBLICAL_GAMES_CATALOG)
        if (activeProfile?.id) {
          const { data: prog } = await supabase.from('profile_game_progress').select('*').eq('profile_id', activeProfile.id)
          if (prog) {
            const map: Record<string, ProfileGameProgress> = {}
            prog.forEach((p: any) => { map[p.game_id] = p })
            setUserProgress(map)
          }
        }
      } catch { setGames(BIBLICAL_GAMES_CATALOG) }
    }
    load()
  }, [activeProfile?.id])

  const featured = games.find(g => g.is_featured) || games[0]
  const others = games.filter(g => g.id !== featured?.id)
  const leftGames = others.slice(0, 3)
  const rightGames = others.slice(3, 11)

  return (
    <div style={{ background: '#0d0e14', minHeight: '100vh', color: '#fff', fontFamily: 'var(--cdk-font-body)' }}>

      {/* TOP NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, zIndex: 100, background: 'rgba(13,14,20,0.96)', backdropFilter: 'blur(12px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#052e16', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>\u271D\uFE0F</div>
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

      <div style={{ padding: '28px 24px 48px', maxWidth: 1280, margin: '0 auto' }}>

        {/* HEADER ROW */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>\U0001F3AE</span>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Jogos & Quizzes B\u00edblicos</h1>
            <span style={{ background: '#22c55e', color: '#052e16', fontSize: 11, fontWeight: 800, padding: '3px 9px', borderRadius: 6 }}>{games.length} JOGOS</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 10, padding: '8px 14px', cursor: 'pointer' }}>
            <span>\U0001F3C6</span>
            <div>
              <p style={{ margin: 0, fontSize: 10, color: '#f59e0b', fontWeight: 700, textTransform: 'uppercase' }}>Miss\u00e3o do Dia</p>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700 }}>Vencer Quiz de Davi: +200 Pts</p>
            </div>
          </div>
        </div>

        {/* CATEGORY PILLS */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 20, scrollbarWidth: 'none', paddingBottom: 4 }}>
          {CATEGORY_PILLS.map(cat => {
            const active = selectedCategory === cat.id
            return (
              <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 9999, border: 'none', whiteSpace: 'nowrap', background: active ? '#fff' : 'rgba(255,255,255,0.07)', color: active ? '#0d0e14' : '#d1d5db', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}>
                {cat.emoji} {cat.label}
              </button>
            )
          })}
        </div>

        {/* MAIN 3-COL */}
        <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 256px', gap: 12, marginBottom: 28 }}>

          {/* LEFT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {leftGames.map(game => (
              <div key={game.id} onClick={() => navigate(`/jogos/${game.slug}`)} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', background: '#1a1b25', transition: 'transform 0.2s', flexShrink: 0 }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}>
                <img src={game.cover_url} alt={game.title} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 55%)' }} />
                <div style={{ position: 'absolute', bottom: 6, left: 6, right: 6 }}>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>{game.title}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CENTER: Featured hero */}
          {featured && (
            <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', cursor: 'pointer' }} onClick={() => navigate(`/jogos/${featured.slug}`)}>
              <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                <img src={featured.cover_url} alt={featured.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.2) 55%, transparent 100%)' }} />
                <div style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.5)', borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 800, color: '#f59e0b' }}>+150 XP</div>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.35)' }}>
                    <Play size={26} fill="#fff" color="#fff" style={{ marginLeft: 3 }} />
                  </div>
                </div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 20px 16px' }}>
                  <span style={{ background: '#f59e0b', color: '#000', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase' }}>\U0001F3AE AVENTURA B\u00cdBLICA</span>
                  <h2 style={{ margin: '8px 0 4px', fontSize: 'clamp(18px, 2.2vw, 28px)', fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.1 }}>{featured.title}</h2>
                  <p style={{ margin: '0 0 10px', fontSize: 13, color: '#d1d5db', lineHeight: 1.4, maxWidth: 440 }}>{featured.description}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f59e0b', fontSize: 13, fontWeight: 700 }}><Star size={13} fill="#f59e0b" /> 4.9</span>
                    <span style={{ fontSize: 12, color: '#9ca3af' }}>\u2022 {featured.age_range === 'all' ? 'Livre' : `${featured.age_range} anos`}</span>
                    <span style={{ fontSize: 12, color: '#9ca3af', textTransform: 'capitalize' }}>\u2022 {featured.game_type}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RIGHT */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, alignContent: 'start' }}>
            {rightGames.map(game => (
              <div key={game.id} onClick={() => navigate(`/jogos/${game.slug}`)} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', cursor: 'pointer', background: '#1a1b25', transition: 'transform 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}>
                <img src={game.cover_url} alt={game.title} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 55%)' }} />
                <div style={{ position: 'absolute', top: 4, left: 4, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', padding: '1px 5px', borderRadius: 3, fontSize: 8, fontWeight: 700, color: '#22c55e', textTransform: 'uppercase' }}>{game.game_type}</div>
                <div style={{ position: 'absolute', bottom: 4, left: 5, right: 5 }}>
                  <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{game.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* USER PROGRESS */}
        <div style={{ background: '#16171f', borderRadius: 16, padding: '20px 24px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #16a34a, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18 }}>
              {(activeProfile?.name || 'S').charAt(0)}
            </div>
            <span style={{ position: 'absolute', bottom: -2, right: -2, background: '#f59e0b', color: '#000', fontSize: 9, fontWeight: 800, padding: '1px 4px', borderRadius: 4 }}>3</span>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>{activeProfile?.name || 'Sara'}, Pequena Heroína</p>
              <span style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4 }}>6 anos</span>
            </div>
            <p style={{ margin: '0 0 8px', fontSize: 12, color: '#6b7280' }}>Nível 3: Discípulo Curioso &nbsp; 1.450 / 2.000 XP</p>
            <div style={{ position: 'relative', height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 9999 }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '72.5%', background: 'linear-gradient(90deg, #16a34a, #22c55e)', borderRadius: 9999 }} />
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 11, color: '#6b7280' }}>Faltam 550 XP para desbloquear o t\u00edtulo "Defensor da Coragem"</p>
          </div>
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#f59e0b' }}>1.450</p>
            <p style={{ margin: 0, fontSize: 11, color: '#6b7280' }}>PONTOS DE F\u00c9 \u2B50</p>
          </div>
          <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, padding: '12px 16px', flexShrink: 0 }}>
            <p style={{ margin: '0 0 2px', fontSize: 10, color: '#f59e0b', fontWeight: 700, textTransform: 'uppercase' }}>Conquista de Hoje</p>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 800 }}>\U0001F3C6 Selo de Davi Conquistado!</p>
            <p style={{ margin: 0, fontSize: 11, color: '#6b7280' }}>3 trofeus novos hoje</p>
          </div>
        </div>

        {/* FAMILY MODES */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>\u26A1 Modos Especiais para a Fam\u00edlia</h2>
            <button style={{ background: 'transparent', border: 'none', color: '#22c55e', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>Ver Todos os Modos <ChevronRight size={16} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
            {FAMILY_MODES.map((mode, i) => (
              <div key={i} style={{ background: '#16171f', borderRadius: 14, padding: '18px 20px', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', transition: 'border-color 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(34,197,94,0.4)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${mode.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{mode.emoji}</div>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800 }}>{mode.title}</h3>
                </div>
                <p style={{ margin: '0 0 12px', fontSize: 12, color: '#9ca3af', lineHeight: 1.5 }}>{mode.desc}</p>
                <span style={{ background: `${mode.color}20`, color: mode.color, fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6 }}>{mode.badge}</span>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', flexShrink: 0 }}>
            <span>\U0001F512</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b' }}>Controle Parental Ativo</span>
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 28, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: 'linear-gradient(135deg, #16a34a, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>✝️</div>
              <span style={{ fontWeight: 800, fontSize: 14 }}>Com Deus Kids</span>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>Streaming crist\u00e3o seguro, alegre e inspirador desenvolvido para edificar as crian\u00e7as em todas as etapas de aprendizado da f\u00e9.</p>
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
