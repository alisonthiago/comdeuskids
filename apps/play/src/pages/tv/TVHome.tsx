import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Home, Search, Film, Tv, Music, BookOpen, Heart, Users, LogOut,
  Play, Plus, Check, Info, FileText, X, ChevronRight, Award, Gamepad2
} from 'lucide-react'
import { STREAM_CATALOG } from '../../data/streamCatalog'
import { StreamContent } from '@comdeuskids/types'
import { useTVSession } from '../../context/TVSessionContext'
import { CDK_AVATARS, getAvatarImageUrl } from '../../data/avatars'
import { useTVNavigation } from '../../hooks/useTVNavigation'
import { BIBLICAL_GAMES_CATALOG } from '../../games/data/gamesCatalog'
import { GameDefinition } from '../../games/types'
import TVPlayerModal from './TVPlayerModal'
import TVGameModal from './TVGameModal'

export default function TVHome() {
  const navigate = useNavigate()
  const { activeProfile, myList, toggleMyList, isInMyList, watchProgress, disconnect } = useTVSession()
  useTVNavigation()

  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [selectedContent, setSelectedContent] = useState<StreamContent | null>(null)
  const [playingContent, setPlayingContent] = useState<StreamContent | null>(null)
  const [playingGame, setPlayingGame] = useState<GameDefinition | null>(null)
  const [activeTab, setActiveTab] = useState<'info' | 'lesson' | 'episodes'>('info')

  // Hero Content: primeiro conteúdo marcado como destaque
  const heroContent = useMemo(() => {
    return STREAM_CATALOG.find(c => c.is_featured) || STREAM_CATALOG[0]
  }, [])

  // Carrosséis categorizados
  const continueWatchingItems = useMemo(() => {
    return Object.keys(watchProgress)
      .map(id => {
        const item = STREAM_CATALOG.find(c => c.id === id)
        if (!item) return null
        return {
          ...item,
          progress: watchProgress[id]
        }
      })
      .filter(Boolean) as (StreamContent & { progress: any })[]
  }, [watchProgress])

  const bibleStories = useMemo(() => {
    return STREAM_CATALOG.filter(c => c.category === 'Histórias Bíblicas' || c.tags?.includes('Bíblia'))
  }, [])

  const series = useMemo(() => {
    return STREAM_CATALOG.filter(c => c.type === 'series')
  }, [])

  const movies = useMemo(() => {
    return STREAM_CATALOG.filter(c => c.type === 'movie')
  }, [])

  const songs = useMemo(() => {
    return STREAM_CATALOG.filter(c => c.type === 'song' || c.category === 'Músicas e Louvores')
  }, [])

  const learning = useMemo(() => {
    return STREAM_CATALOG.filter(c => c.category === 'Aprendendo com Jesus' || c.related_pdf_id)
  }, [])

  const avatarMeta = useMemo(() => {
    if (!activeProfile) return null
    return CDK_AVATARS.find(a => a.id === activeProfile.avatar_url)
  }, [activeProfile])

  // Mock de episódios para séries
  const sampleEpisodes = [
    { num: '01', title: 'A Criação do Mundo', duration: '14 min', desc: 'No princípio, criou Deus os céus e a terra cheios de luz e vida.' },
    { num: '02', title: 'A Arca de Noé', duration: '16 min', desc: 'A obediência de Noé e o grande arco-íris da aliança de Deus.' },
    { num: '03', title: 'Abraão e as Estrelas', duration: '15 min', desc: 'A promessa de uma grande nação tão numerosa quanto as estrelas.' },
    { num: '04', title: 'José do Egito: O Sonhador', duration: '18 min', desc: 'Como o perdão e o amor transformaram a vida de José.' },
    { num: '05', title: 'Moisés e o Mar Vermelho', duration: '20 min', desc: 'As águas se abrem com o poder do Deus Todo-Poderoso.' }
  ]

  return (
    <div className="cdk-tv-body cdk-tv-home" style={{ display: 'flex', flexDirection: 'column', width: '100%', minHeight: '100vh' }}>
      {/* 1. HEADER SUPERIOR STREAMING TV (SEM MENU LATERAL) */}
      <header className="cdk-tv-top-header" role="banner">
        <div className="cdk-tv-header-inner">
          <div className="cdk-tv-brand">
            <span className="cdk-header-brand-title">Com Deus</span>
            <span className="cdk-header-brand-kids">Kids</span>
          </div>

          <nav className="cdk-tv-tabs" aria-label="Navegação TV">
            <button
              data-tv-focus
              tabIndex={0}
              className={`cdk-tv-tab cdk-tv-focus ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              Início
            </button>
            <button
              data-tv-focus
              tabIndex={0}
              className={`cdk-tv-tab cdk-tv-focus ${activeCategory === 'series' ? 'active' : ''}`}
              onClick={() => setActiveCategory('series')}
            >
              Séries
            </button>
            <button
              data-tv-focus
              tabIndex={0}
              className={`cdk-tv-tab cdk-tv-focus ${activeCategory === 'songs' ? 'active' : ''}`}
              onClick={() => setActiveCategory('songs')}
            >
              Músicas
            </button>
            <button
              data-tv-focus
              tabIndex={0}
              className={`cdk-tv-tab cdk-tv-focus ${activeCategory === 'games' ? 'active' : ''}`}
              onClick={() => setActiveCategory('games')}
            >
              Jogos
            </button>
            <button
              data-tv-focus
              tabIndex={0}
              className="cdk-tv-tab cdk-tv-focus"
              onClick={() => navigate('/tv/minha-lista')}
            >
              Minha Lista
            </button>
          </nav>

          <div className="cdk-tv-actions">
            <button
              data-tv-focus
              tabIndex={0}
              className="cdk-tv-icon-btn cdk-tv-focus"
              onClick={() => navigate('/tv/buscar')}
              title="Buscar"
              aria-label="Buscar"
            >
              <Search size={22} />
            </button>

            <button
              data-tv-focus
              tabIndex={0}
              className="cdk-tv-profile-btn cdk-tv-focus"
              onClick={() => navigate('/tv/perfis')}
              title={activeProfile?.name || 'Perfil'}
              aria-label="Perfil"
            >
              <div className="cdk-tv-avatar-badge">
                <img
                  src={getAvatarImageUrl(activeProfile?.avatar_url)}
                  alt={activeProfile?.name || 'Perfil'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <span className="cdk-tv-profile-label">{activeProfile?.name || 'Perfil'}</span>
            </button>

            <button
              data-tv-focus
              tabIndex={0}
              className="cdk-tv-icon-btn cdk-tv-focus"
              onClick={() => { disconnect(); navigate('/tv/login') }}
              title="Sair desta TV"
              aria-label="Sair desta TV"
              style={{ color: '#f87171' }}
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. CONTEÚDO PRINCIPAL DA TV (100% LARGURA) */}
      <main className="cdk-tv-main-content">

        {/* HERO BANNER GIGANTE TV */}
        <section
          className="cdk-tv-hero"
          style={{ backgroundImage: `linear-gradient(to top, #08090b 10%, rgba(8,9,11,0.6) 50%, rgba(8,9,11,0.2) 100%), url(${heroContent.banner_url})` }}
        >
          <div className="cdk-tv-hero-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                background: '#22c55e',
                color: '#052e16',
                fontWeight: 800,
                fontSize: 13,
                padding: '4px 10px',
                borderRadius: 6,
                letterSpacing: 1
              }}>
                DESTAQUE ESPECIAL
              </span>
              <span style={{ color: '#cbd5e1', fontSize: 15, fontWeight: 600 }}>
                {heroContent.age_range} • {heroContent.category}
              </span>
            </div>

            <h1 className="cdk-tv-hero-title">{heroContent.title}</h1>
            <p className="cdk-tv-hero-desc">{heroContent.description}</p>

            <div className="cdk-tv-hero-actions">
              <button
                data-tv-focus
                autoFocus
                className="cdk-tv-btn-play cdk-tv-focus"
                onClick={() => setPlayingContent(heroContent)}
              >
                <Play size={24} fill="#08090b" /> ASSISTIR
              </button>

              <button
                data-tv-focus
                className="cdk-tv-btn-list cdk-tv-focus"
                onClick={() => toggleMyList(heroContent.id)}
              >
                {isInMyList(heroContent.id) ? (
                  <>
                    <Check size={24} color="#10b981" /> NA MINHA LISTA
                  </>
                ) : (
                  <>
                    <Plus size={24} /> MINHA LISTA
                  </>
                )}
              </button>

              <button
                data-tv-focus
                className="cdk-tv-btn-list cdk-tv-focus"
                onClick={() => setSelectedContent(heroContent)}
              >
                <Info size={24} /> DETALHES
              </button>
            </div>
          </div>
        </section>

        {/* FILEIRAS DE CARROSSEIS TV NAVEGÁVEIS POR D-PAD */}
        <div className="cdk-tv-carousels-container">
          {/* Continuar Assistindo (Compartilhado com Celular e PC!) */}
          {continueWatchingItems.length > 0 && (
            <div className="cdk-tv-row">
              <h2 className="cdk-tv-row-title">Continuar assistindo</h2>
              <div className="cdk-tv-cards-scroll">
                {continueWatchingItems.map(item => {
                  const percent = item.progress.duration_seconds > 0
                    ? (item.progress.progress_seconds / item.progress.duration_seconds) * 100
                    : 25
                  return (
                    <button
                      key={item.id}
                      data-tv-focus
                      className="cdk-tv-card cdk-tv-focus"
                      onClick={() => setPlayingContent(item)}
                    >
                      <img src={item.thumbnail_url} alt={item.title} className="cdk-tv-card-img" />
                      <div className="cdk-tv-card-info">
                        <span className="cdk-tv-card-title">{item.title}</span>
                      </div>
                      {/* Barra de progresso visível no card */}
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 6,
                        background: 'rgba(255,255,255,0.2)'
                      }}>
                        <div style={{ width: `${percent}%`, height: '100%', background: '#22c55e' }} />
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Jogos Bíblicos no Controle Remoto da TV */}
          {(activeCategory === 'all' || activeCategory === 'games') && (
            <div className="cdk-tv-row">
              <h2 className="cdk-tv-row-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Gamepad2 size={26} color="#22c55e" /> Jogos Bíblicos • Modo Controle Remoto
              </h2>
              <div className="cdk-tv-cards-scroll">
                {BIBLICAL_GAMES_CATALOG.map(game => (
                  <button
                    key={game.id}
                    data-tv-focus
                    className="cdk-tv-card cdk-tv-focus"
                    onClick={() => setPlayingGame(game)}
                    style={{ position: 'relative' }}
                  >
                    <img src={game.cover_url} alt={game.title} className="cdk-tv-card-img" />
                    <div className="cdk-tv-card-info">
                      <span className="cdk-tv-card-title">{game.title}</span>
                    </div>
                    <div style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      background: 'rgba(139, 92, 246, 0.95)',
                      color: '#fff',
                      fontSize: 10,
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: 6,
                      letterSpacing: 0.5,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                    }}>
                      JOGAR 🎮
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Top 10 Mais Assistidos */}
          <div className="cdk-tv-row">
            <h2 className="cdk-tv-row-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Award size={26} color="#fbbf24" /> Top 10 Mais Assistidos pelas Crianças
            </h2>
            <div className="cdk-tv-cards-scroll">
              {STREAM_CATALOG.slice(0, 6).map((item, idx) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    fontSize: 72,
                    fontWeight: 800,
                    lineHeight: 1,
                    color: '#282d3f',
                    fontFamily: 'impact, sans-serif'
                  }}>
                    {idx + 1}
                  </span>
                  <button
                    data-tv-focus
                    className="cdk-tv-card cdk-tv-focus"
                    onClick={() => setSelectedContent(item)}
                  >
                    <img src={item.thumbnail_url} alt={item.title} className="cdk-tv-card-img" />
                    <div className="cdk-tv-card-info">
                      <span className="cdk-tv-card-title">{item.title}</span>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Histórias da Bíblia */}
          <div className="cdk-tv-row">
            <h2 className="cdk-tv-row-title">Histórias da Bíblia</h2>
            <div className="cdk-tv-cards-scroll">
              {bibleStories.map(item => (
                <button
                  key={item.id}
                  data-tv-focus
                  className="cdk-tv-card cdk-tv-focus"
                  onClick={() => setSelectedContent(item)}
                >
                  <img src={item.thumbnail_url} alt={item.title} className="cdk-tv-card-img" />
                  <div className="cdk-tv-card-info">
                    <span className="cdk-tv-card-title">{item.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Séries */}
          <div className="cdk-tv-row">
            <h2 className="cdk-tv-row-title">Séries</h2>
            <div className="cdk-tv-cards-scroll">
              {series.concat(STREAM_CATALOG.slice(0, 4)).map(item => (
                <button
                  key={item.id}
                  data-tv-focus
                  className="cdk-tv-card cdk-tv-focus"
                  onClick={() => setSelectedContent(item)}
                >
                  <img src={item.thumbnail_url} alt={item.title} className="cdk-tv-card-img" />
                  <div className="cdk-tv-card-info">
                    <span className="cdk-tv-card-title">{item.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Filmes */}
          <div className="cdk-tv-row">
            <h2 className="cdk-tv-row-title">Filmes</h2>
            <div className="cdk-tv-cards-scroll">
              {movies.concat(STREAM_CATALOG.slice(2, 6)).map(item => (
                <button
                  key={item.id}
                  data-tv-focus
                  className="cdk-tv-card cdk-tv-focus"
                  onClick={() => setSelectedContent(item)}
                >
                  <img src={item.thumbnail_url} alt={item.title} className="cdk-tv-card-img" />
                  <div className="cdk-tv-card-info">
                    <span className="cdk-tv-card-title">{item.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Músicas */}
          <div className="cdk-tv-row">
            <h2 className="cdk-tv-row-title">Músicas e Louvores</h2>
            <div className="cdk-tv-cards-scroll">
              {songs.concat(STREAM_CATALOG.slice(1, 5)).map(item => (
                <button
                  key={item.id}
                  data-tv-focus
                  className="cdk-tv-card cdk-tv-focus"
                  onClick={() => setSelectedContent(item)}
                >
                  <img src={item.thumbnail_url} alt={item.title} className="cdk-tv-card-img" />
                  <div className="cdk-tv-card-info">
                    <span className="cdk-tv-card-title">{item.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Aprender */}
          <div className="cdk-tv-row">
            <h2 className="cdk-tv-row-title">Aprender & Atividades</h2>
            <div className="cdk-tv-cards-scroll">
              {learning.concat(STREAM_CATALOG.slice(0, 3)).map(item => (
                <button
                  key={item.id}
                  data-tv-focus
                  className="cdk-tv-card cdk-tv-focus"
                  onClick={() => setSelectedContent(item)}
                >
                  <img src={item.thumbnail_url} alt={item.title} className="cdk-tv-card-img" />
                  <div className="cdk-tv-card-info">
                    <span className="cdk-tv-card-title">{item.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* 3. MODAL CINEMATOGRÁFICO DE DETALHES NA TV */}
      {selectedContent && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 6, 9, 0.95)',
          backdropFilter: 'blur(16px)',
          zIndex: 2000,
          display: 'flex',
          overflowY: 'auto'
        }}>
          <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Banner Ocupando Topo */}
            <div style={{
              height: '50vh',
              backgroundSize: 'cover',
              backgroundPosition: 'center 20%',
              backgroundImage: `linear-gradient(to top, #08090b 5%, transparent 100%), url(${selectedContent.banner_url || selectedContent.thumbnail_url})`,
              position: 'relative',
              display: 'flex',
              alignItems: 'flex-start',
              padding: '40px 60px',
              justifyContent: 'space-between'
            }}>
              <span style={{
                background: 'rgba(0,0,0,0.6)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 700
              }}>
                {selectedContent.age_range} • {selectedContent.category}
              </span>

              <button
                data-tv-focus
                className="cdk-tv-btn cdk-tv-focus"
                onClick={() => setSelectedContent(null)}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.7)',
                  border: '2px solid rgba(255,255,255,0.2)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={28} />
              </button>
            </div>

            {/* Conteúdo dos Detalhes */}
            <div style={{ padding: '0 80px 80px', marginTop: -40, zIndex: 10 }}>
              <h1 style={{ fontSize: 52, fontWeight: 800, marginBottom: 12 }}>{selectedContent.title}</h1>
              <p style={{ fontSize: 20, color: '#94a3b8', maxWidth: 900, lineHeight: 1.6, marginBottom: 28 }}>
                {selectedContent.description}
              </p>

              {/* Botões Grandes de Ação TV */}
              <div style={{ display: 'flex', gap: 20, marginBottom: 40 }}>
                <button
                  data-tv-focus
                  autoFocus
                  className="cdk-tv-btn-play cdk-tv-focus"
                  onClick={() => {
                    setPlayingContent(selectedContent)
                    setSelectedContent(null)
                  }}
                >
                  <Play size={24} fill="#08090b" /> ASSISTIR
                </button>

                <button
                  data-tv-focus
                  className="cdk-tv-btn-list cdk-tv-focus"
                  onClick={() => toggleMyList(selectedContent.id)}
                >
                  {isInMyList(selectedContent.id) ? (
                    <>
                      <Check size={24} color="#10b981" /> NA MINHA LISTA
                    </>
                  ) : (
                    <>
                      <Plus size={24} /> MINHA LISTA
                    </>
                  )}
                </button>

                <button
                  data-tv-focus
                  className={`cdk-tv-btn-list cdk-tv-focus ${activeTab === 'lesson' ? 'active' : ''}`}
                  onClick={() => setActiveTab('lesson')}
                >
                  <BookOpen size={24} /> LIÇÃO BÍBLICA
                </button>

                {selectedContent.type === 'series' && (
                  <button
                    data-tv-focus
                    className={`cdk-tv-btn-list cdk-tv-focus ${activeTab === 'episodes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('episodes')}
                  >
                    <Tv size={24} /> EPISÓDIOS
                  </button>
                )}
              </div>

              {/* Aba de Lição Bíblica */}
              {activeTab === 'lesson' && selectedContent.scripture_verse && (
                <div style={{
                  background: '#12141e',
                  border: '2px solid #282d42',
                  borderRadius: 20,
                  padding: 32,
                  maxWidth: 900,
                  marginBottom: 30
                }}>
                  <span style={{ fontSize: 14, color: '#22c55e', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 800 }}>
                    Palavra de Deus para Crianças
                  </span>
                  <blockquote style={{ fontSize: 22, color: '#fff', fontStyle: 'italic', margin: '14px 0 20px', lineHeight: 1.5 }}>
                    {selectedContent.scripture_verse}
                  </blockquote>
                  <p style={{ fontSize: 17, color: '#cbd5e1', lineHeight: 1.6 }}>
                    {selectedContent.devotional_text}
                  </p>
                </div>
              )}

              {/* Lista de Episódios para Séries (Navegáveis ↑ ↓ pelo controle) */}
              <div style={{ marginTop: 20 }}>
                <h3 style={{ fontSize: 26, fontWeight: 800, marginBottom: 20 }}>Episódios</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 900 }}>
                  {sampleEpisodes.map((ep) => (
                    <button
                      key={ep.num}
                      data-tv-focus
                      className="cdk-tv-btn cdk-tv-focus"
                      onClick={() => {
                        setPlayingContent(selectedContent)
                        setSelectedContent(null)
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '18px 24px',
                        background: '#12141f',
                        border: '2px solid #232738',
                        borderRadius: 16,
                        color: '#fff',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        <span style={{ fontSize: 24, fontWeight: 800, color: '#22c55e', fontFamily: 'monospace' }}>
                          {ep.num}
                        </span>
                        <div>
                          <h4 style={{ fontSize: 18, fontWeight: 700 }}>{ep.title}</h4>
                          <p style={{ fontSize: 14, color: '#94a3b8', marginTop: 4 }}>{ep.desc}</p>
                        </div>
                      </div>
                      <span style={{ fontSize: 15, color: '#64748b' }}>{ep.duration}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. PLAYER DE TELA CHEIA TV */}
      {playingContent && (
        <TVPlayerModal
          content={playingContent}
          onClose={() => setPlayingContent(null)}
        />
      )}

      {/* 5. JOGO DE TELA CHEIA TV (GAME INPUT MODE) */}
      {playingGame && (
        <TVGameModal
          game={playingGame}
          onClose={() => setPlayingGame(null)}
        />
      )}
    </div>
  )
}
