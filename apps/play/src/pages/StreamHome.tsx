import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Play, Info, Music, Gamepad2, ChevronRight, Check, Plus } from 'lucide-react'
import { useProfile } from '../context/ProfileContext'
import { STREAM_CATALOG } from '../data/streamCatalog'
import { BIBLICAL_GAMES_CATALOG } from '../games/data/gamesCatalog'
import { StreamContent } from '@comdeuskids/types'
import HeroCarousel, { HeroSlide } from '../components/stitch/HeroCarousel'

export default function StreamHome() {
  const navigate = useNavigate()
  const location = useLocation()
  const { activeProfile, watchProgress, toggleMyList, isInMyList } = useProfile()

  // Tab interna ativa (Início, Séries, Músicas, Jogos, Minha Lista)
  const [activeTab, setActiveTab] = useState<'inicio' | 'series' | 'musicas' | 'jogos' | 'minha-lista'>(() => {
    if (location.pathname.startsWith('/series') || location.pathname === '/serie') return 'series'
    if (location.pathname.startsWith('/musicas') || location.pathname.startsWith('/louvores')) return 'musicas'
    if (location.pathname.startsWith('/jogos')) return 'jogos'
    if (location.pathname.startsWith('/minha-lista')) return 'minha-lista'
    return 'inicio'
  })

  // Mantém a aba sincronizada ao clicar nos botões do header ou sidebar
  useEffect(() => {
    if (location.pathname.startsWith('/series') || location.pathname === '/serie') {
      setActiveTab('series')
    } else if (location.pathname.startsWith('/musicas') || location.pathname.startsWith('/louvores')) {
      setActiveTab('musicas')
    } else if (location.pathname.startsWith('/jogos')) {
      setActiveTab('jogos')
    } else if (location.pathname.startsWith('/minha-lista')) {
      setActiveTab('minha-lista')
    } else {
      setActiveTab('inicio')
    }
  }, [location.pathname])

  // Sub-tabs da Série (Episódios, Sobre a série, Personagens, Atividades)
  const [seriesSubTab, setSeriesSubTab] = useState<'episodios' | 'sobre' | 'personagens' | 'atividades'>('episodios')

  // Filtro de Músicas (Todos, Louvores, Clipes, Playback, Mais tocadas)
  const [musicFilter, setMusicFilter] = useState<string>('todos')

  // 1. CARDS DE CONTINUE ASSISTINDO (1:1 com os screenshots)
  const continueWatchingCards = useMemo(() => [
    {
      id: 'arca-de-noe',
      title: 'A Arca de Noé',
      sub: 'T1:E3 • 12 min',
      thumbnail: '/thumbnails/card_noe.jpg',
      progress: 65,
      quality: 'HD'
    },
    {
      id: 'jose-egito',
      title: 'José do Egito',
      sub: 'T1:E1 • 18 min',
      thumbnail: '/thumbnails/card_jose_egito.jpg',
      progress: 42,
      quality: 'HD'
    },
    {
      id: 'jonas-peixe',
      title: 'Jonas e o Peixe',
      sub: 'Filme • 24 min',
      thumbnail: '/thumbnails/card_jonas_torch.jpg',
      progress: 88,
      quality: 'HD'
    },
    {
      id: 'sansao-forte',
      title: 'Sansão',
      sub: 'Filme • 30 min',
      thumbnail: '/thumbnails/card_sansao.jpg',
      progress: 25,
      quality: '3D'
    }
  ], [])

  // 2. EPISÓDIOS DE JOSÉ DO EGITO (1:1 com os screenshots)
  const joseEpisodes = useMemo(() => [
    {
      id: 'jose-ep1',
      num: '01',
      title: '01. O sonho de José',
      duration: '12 min',
      thumbnail: '/thumbnails/card_jose_egito.jpg',
      quality: 'HD'
    },
    {
      id: 'jose-ep2',
      num: '02',
      title: '02. A traição',
      duration: '11 min',
      thumbnail: '/thumbnails/card_noe.jpg',
      quality: 'HD'
    },
    {
      id: 'jose-ep3',
      num: '03',
      title: '03. No Egito',
      duration: '13 min',
      thumbnail: '/thumbnails/card_jonas_torch.jpg',
      quality: 'HD'
    },
    {
      id: 'jose-ep4',
      num: '04',
      title: '04. O cárcere',
      duration: '12 min',
      thumbnail: '/thumbnails/card_sansao.jpg',
      quality: 'HD'
    },
    {
      id: 'jose-ep5',
      num: '05',
      title: '05. Um novo começo',
      duration: '14 min',
      thumbnail: '/thumbnails/card_jose_egito.jpg',
      quality: 'HD'
    }
  ], [])

  // 3. MÚSICAS & LOUVORES MAIS TOCADAS (1:1 com os screenshots)
  const popularSongsCards = useMemo(() => [
    {
      id: 'song-davi',
      title: 'Aventura com Davi',
      sub: 'Louvor Infantil',
      thumbnail: '/thumbnails/song_david_pastor.jpg',
      quality: 'HD'
    },
    {
      id: 'song-arca',
      title: 'Monte a Arca',
      sub: 'Clipe Animado',
      thumbnail: '/thumbnails/cante_com_noe.jpg',
      quality: 'HD'
    },
    {
      id: 'song-quiz',
      title: 'Quiz da Bíblia',
      sub: 'Canção Educativa',
      thumbnail: '/thumbnails/soldadinho_cristo.jpg',
      quality: 'HD'
    },
    {
      id: 'song-memoria',
      title: 'Memória Bíblica',
      sub: 'Clipe Especial',
      thumbnail: '/thumbnails/song_daniel_leoes.jpg',
      quality: 'HD'
    },
    {
      id: 'song-labirinto',
      title: 'Labirinto da Fé',
      sub: 'Playback',
      thumbnail: '/thumbnails/song_jonas_baleia.jpg',
      quality: 'HD'
    },
    {
      id: 'song-pinte',
      title: 'Pinte e Aprenda',
      sub: 'Canção de Arte',
      thumbnail: '/thumbnails/louvores_coracao.jpg',
      quality: 'HD'
    }
  ], [])

  const handlePlayContent = (contentId: string) => {
    navigate(`/assistir/${contentId}`)
  }

  const handleOpenDetails = (contentId: string) => {
    navigate(`/conteudo/${contentId}`)
  }

  // Slides do HeroCarousel para a Home (4 Destaques Oficiais)
  // 1 Destaque Fixo Oficial Com Deus Kids (Sem rotação de slides)
  const homeHeroSlides: HeroSlide[] = useMemo(() => [
    {
      id: 'jonas-peixe',
      title: 'Jonas e o Peixe',
      evidence: 'Destaque Oficial Com Deus Kids',
      attributes: ['Filme 3D', 'Livre', 'Bíblia Infantil', '24 min'],
      description: 'Uma história emocionante sobre obediência, misericórdia e um recomeço guiado pelo amor de Deus.',
      bannerImage: '/banners/jonas_hero_whale.jpg',
      primaryActionText: 'Assistir agora',
      onPrimaryAction: () => handlePlayContent('jonas-peixe'),
      secondaryActionText: 'Mais informações',
      onSecondaryAction: () => handleOpenDetails('jonas-peixe')
    }
  ], [])

  // 1 Destaque Fixo de Séries
  const seriesHeroSlides: HeroSlide[] = useMemo(() => [
    {
      id: 'jose-egito',
      title: 'José do Egito',
      evidence: 'Série Original',
      attributes: ['Série', '10 episódios', 'HD'],
      description: 'A incrível história de José, que com fé e obediência viu Deus transformar desafios em grandes propósitos.',
      bannerImage: '/banners/jose_egito_hero.jpg',
      primaryActionText: 'Assistir 1º episódio',
      onPrimaryAction: () => handlePlayContent('jose-egito'),
      secondaryActionText: isInMyList('jose-egito') ? 'Na Minha Lista' : 'Minha Lista',
      secondaryActionIcon: isInMyList('jose-egito') ? <Check size={18} color="#22c55e" /> : <Plus size={18} />,
      onSecondaryAction: () => toggleMyList('jose-egito')
    }
  ], [isInMyList, toggleMyList])

  // 1 Destaque Fixo de Músicas
  const musicHeroSlides: HeroSlide[] = useMemo(() => [
    {
      id: 'louvores-coracao',
      title: 'Louvores do Coração',
      evidence: 'Álbum Oficial Com Deus Kids',
      attributes: ['Músicas', 'HD Áudio', 'Livre'],
      description: 'Músicas que ensinam, alegram e aproximam as crianças de Deus com adoração sincera e ritmos alegres.',
      bannerImage: '/banners/louvores_hero_girl.jpg',
      primaryActionText: 'Ouvir agora',
      onPrimaryAction: () => handlePlayContent('louvores-coracao'),
      secondaryActionText: 'Minha Lista',
      onSecondaryAction: () => toggleMyList('louvores-coracao')
    }
  ], [toggleMyList])

  return (
    <div className="cdk-stream-container" style={{ position: 'relative' }}>
      {/* ========================================================
          HERO CAROUSEL CONTIDO (Espaço externo e proporção cinema)
          ======================================================== */}

      {/* CASO 1: ABA INÍCIO — 4 Destaques em Carrossel */}
      {activeTab === 'inicio' && (
        <HeroCarousel slides={homeHeroSlides} ctaType="video" />
      )}

      {/* CASO 2: ABA SÉRIES — Carrossel de Séries */}
      {activeTab === 'series' && (
        <HeroCarousel slides={seriesHeroSlides} ctaType="series" />
      )}

      {/* CASO 3: ABA MÚSICAS — Carrossel de Músicas */}
      {activeTab === 'musicas' && (
        <HeroCarousel slides={musicHeroSlides} ctaType="music" />
      )}

      {/* ========================================================
          SUB-FILTROS INTERATIVOS
          ======================================================== */}

      {/* Sub-tabs de Séries */}
      {activeTab === 'series' && (
        <div className="cdk-filter-pills-row">
          <button
            type="button"
            data-tv-focus
            tabIndex={0}
            onClick={() => setSeriesSubTab('episodios')}
            className={`cdk-filter-pill cdk-tv-focus ${seriesSubTab === 'episodios' ? 'active' : ''}`}
          >
            Episódios
          </button>
          <button
            type="button"
            data-tv-focus
            tabIndex={0}
            onClick={() => setSeriesSubTab('sobre')}
            className={`cdk-filter-pill cdk-tv-focus ${seriesSubTab === 'sobre' ? 'active' : ''}`}
          >
            Sobre a série
          </button>
          <button
            type="button"
            data-tv-focus
            tabIndex={0}
            onClick={() => setSeriesSubTab('personagens')}
            className={`cdk-filter-pill cdk-tv-focus ${seriesSubTab === 'personagens' ? 'active' : ''}`}
          >
            Personagens
          </button>
          <button
            type="button"
            data-tv-focus
            tabIndex={0}
            onClick={() => setSeriesSubTab('atividades')}
            className={`cdk-filter-pill cdk-tv-focus ${seriesSubTab === 'atividades' ? 'active' : ''}`}
          >
            Atividades
          </button>
        </div>
      )}

      {/* Pills de Categorias de Música */}
      {activeTab === 'musicas' && (
        <div className="cdk-filter-pills-row">
          <button
            type="button"
            data-tv-focus
            tabIndex={0}
            onClick={() => setMusicFilter('todos')}
            className="cdk-filter-pill cdk-music-pill-all cdk-tv-focus"
          >
            🎵 Todos
          </button>
          <button
            type="button"
            data-tv-focus
            tabIndex={0}
            onClick={() => setMusicFilter('louvores')}
            className="cdk-filter-pill cdk-music-pill-praise cdk-tv-focus"
          >
            🎤 Louvores
          </button>
          <button
            type="button"
            data-tv-focus
            tabIndex={0}
            onClick={() => setMusicFilter('clipes')}
            className="cdk-filter-pill cdk-music-pill-clips cdk-tv-focus"
          >
            🎬 Clipes
          </button>
          <button
            type="button"
            data-tv-focus
            tabIndex={0}
            onClick={() => setMusicFilter('playback')}
            className="cdk-filter-pill cdk-music-pill-playback cdk-tv-focus"
          >
            ⭐ Playback
          </button>
          <button
            type="button"
            data-tv-focus
            tabIndex={0}
            onClick={() => setMusicFilter('mais-tocadas')}
            className="cdk-filter-pill cdk-music-pill-popular cdk-tv-focus"
          >
            🔥 Mais tocadas
          </button>
        </div>
      )}

      {/* ========================================================
          RAILS DE CARROSSEL / CARDS 16:9
          ======================================================== */}

      {/* 1. SEÇÃO CONTINUE ASSISTINDO (Aparece na Home) */}
      {activeTab === 'inicio' && (
        <section className="cdk-stitch-rail">
          <div className="cdk-rail-header">
            <h2 className="cdk-rail-title">Continue assistindo</h2>
          </div>

          <div className="cdk-cards-scroll-container">
            {continueWatchingCards.map(card => (
              <button
                key={card.id}
                type="button"
                data-tv-focus
                tabIndex={0}
                onClick={() => handlePlayContent(card.id)}
                className="cdk-stitch-card cdk-tv-focus"
              >
                <div className="cdk-card-media">
                  <img
                    src={card.thumbnail}
                    alt={card.title}
                    className="cdk-card-img"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/banners/arca_noe_banner.jpg'
                    }}
                  />
                  {/* Badge de Play Circular Amarelo/Verde */}
                  <div className="cdk-card-play-btn">
                    <Play size={15} fill="#eab308" />
                  </div>
                  {/* Badge HD / 3D */}
                  <div className="cdk-card-quality-badge">{card.quality}</div>
                  {/* Barra de Progresso Verde */}
                  <div className="cdk-card-progress-track">
                    <div
                      className="cdk-card-progress-bar"
                      style={{ width: `${card.progress}%` }}
                    />
                  </div>
                </div>
                <span className="cdk-card-title">{card.title}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 2. SEÇÃO TEMPORADA 1 (Séries) */}
      {activeTab === 'series' && (
        <section className="cdk-stitch-rail">
          <div className="cdk-rail-header">
            <h2 className="cdk-rail-title">Temporada 1</h2>
          </div>

          <div className="cdk-cards-scroll-container">
            {joseEpisodes.map(ep => (
              <button
                key={ep.id}
                type="button"
                data-tv-focus
                tabIndex={0}
                onClick={() => handlePlayContent('jose-egito')}
                className="cdk-stitch-card cdk-tv-focus"
              >
                <div className="cdk-card-media">
                  <img
                    src={ep.thumbnail}
                    alt={ep.title}
                    className="cdk-card-img"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/banners/arca_noe_banner.jpg'
                    }}
                  />
                  <div className="cdk-card-play-btn">
                    <Play size={15} fill="#eab308" />
                  </div>
                  <div className="cdk-card-quality-badge">{ep.quality}</div>
                </div>
                <span className="cdk-card-title">{ep.title}</span>
                <span className="cdk-card-sub">{ep.duration}</span>
              </button>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px' }}>
              <ChevronRight size={28} color="#94a3b8" />
            </div>
          </div>
        </section>
      )}

      {/* 3. SEÇÃO MAIS TOCADAS (Músicas) */}
      {activeTab === 'musicas' && (
        <section className="cdk-stitch-rail">
          <div className="cdk-rail-header">
            <h2 className="cdk-rail-title">Mais tocadas</h2>
          </div>

          <div className="cdk-cards-scroll-container">
            {popularSongsCards.map(song => (
              <button
                key={song.id}
                type="button"
                data-tv-focus
                tabIndex={0}
                onClick={() => handlePlayContent(song.id)}
                className="cdk-stitch-card cdk-tv-focus"
              >
                <div className="cdk-card-media">
                  <img
                    src={song.thumbnail}
                    alt={song.title}
                    className="cdk-card-img"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/banners/louvores_hero_campfire.jpg'
                    }}
                  />
                  <div className="cdk-card-play-btn">
                    <Play size={15} fill="#eab308" />
                  </div>
                  <div className="cdk-card-quality-badge">{song.quality}</div>
                </div>
                <span className="cdk-card-title">{song.title}</span>
                <span className="cdk-card-sub">{song.sub}</span>
              </button>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px' }}>
              <ChevronRight size={28} color="#94a3b8" />
            </div>
          </div>
        </section>
      )}

      {/* 4. SEÇÃO JOGOS BÍBLICOS */}
      {activeTab === 'jogos' && (
        <section className="cdk-stitch-rail">
          <div className="cdk-rail-header">
            <h2 className="cdk-rail-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Gamepad2 size={24} color="#22c55e" /> Jogos Bíblicos Interativos
            </h2>
          </div>

          <div className="cdk-cards-scroll-container">
            {BIBLICAL_GAMES_CATALOG.map(game => (
              <button
                key={game.id}
                type="button"
                data-tv-focus
                tabIndex={0}
                onClick={() => navigate(`/jogos/${game.id}`)}
                className="cdk-stitch-card cdk-tv-focus"
              >
                <div className="cdk-card-media">
                  <img
                    src={game.thumbnail_url}
                    alt={game.title}
                    className="cdk-card-img"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/banners/hero_davi_golias.jpg'
                    }}
                  />
                  <div className="cdk-card-play-btn" style={{ borderColor: '#22c55e', color: '#22c55e' }}>
                    <Play size={15} fill="#22c55e" />
                  </div>
                  <div className="cdk-card-quality-badge" style={{ background: '#052e16', color: '#4ade80' }}>
                    JOGO
                  </div>
                </div>
                <span className="cdk-card-title">{game.title}</span>
                <span className="cdk-card-sub">{game.difficulty === 'facil' ? 'Fácil' : 'Interativo'} • {game.age_range}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 5. SEÇÃO MINHA LISTA */}
      {activeTab === 'minha-lista' && (
        <section className="cdk-stitch-rail">
          <div className="cdk-rail-header">
            <h2 className="cdk-rail-title">Minha Lista de Favoritos</h2>
          </div>

          <div className="cdk-cards-scroll-container">
            {STREAM_CATALOG.slice(0, 6).map(item => (
              <button
                key={item.id}
                type="button"
                data-tv-focus
                tabIndex={0}
                onClick={() => handlePlayContent(item.id)}
                className="cdk-stitch-card cdk-tv-focus"
              >
                <div className="cdk-card-media">
                  <img
                    src={item.thumbnail_url || item.banner_url}
                    alt={item.title}
                    className="cdk-card-img"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/banners/arca_noe_banner.jpg'
                    }}
                  />
                  <div className="cdk-card-play-btn">
                    <Play size={15} fill="#eab308" />
                  </div>
                  <div className="cdk-card-quality-badge">4K</div>
                </div>
                <span className="cdk-card-title">{item.title}</span>
                <span className="cdk-card-sub">{item.category}</span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
