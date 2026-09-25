import React, { useMemo } from 'react'
import {
  Film, Sparkles, Flame, Compass, Star, BookOpen, Heart, Users
} from 'lucide-react'
import { STREAM_CATALOG } from '../data/streamCatalog'
import { useProfile } from '../context/ProfileContext'
import { StreamContent } from '@comdeuskids/types'
import StreamHubPage, { HubRail } from '../components/streaming/StreamHubPage'

export default function Movies() {
  const { activeProfile, watchProgress } = useProfile()

  // Filtrar produções cinematográficas, filmes e histórias completas
  const allMovies = useMemo(() => {
    return STREAM_CATALOG.filter(c => c.type === 'movie' || c.type === 'story' || !c.type || c.type === 'video')
  }, [])

  // Filme em Destaque no Hero: Davi e Golias: A Força da Fé
  const featuredMovie = useMemo(() => {
    return STREAM_CATALOG.find(m => m.id === 'davi-golias') || allMovies[0] || STREAM_CATALOG[0]
  }, [allMovies])

  // Continuar assistindo filmes (sempre preenchido com 5 itens)
  const continueWatchingMovies = useMemo(() => {
    const progressKeys = Object.keys(watchProgress)
    const items: Array<{
      id: string
      content: StreamContent
      title: string
      episode: string
      image: string
      timeLeft: string
      progress: number
    }> = []

    progressKeys.forEach(contentId => {
      const prog = watchProgress[contentId]
      const found = allMovies.find(c => c.id === contentId || c.slug === contentId)
      if (found && !prog.completed && prog.progress_seconds > 0) {
        const totalDur = prog.duration_seconds || (found.duration_minutes ? found.duration_minutes * 60 : 2700)
        const percent = Math.min(100, Math.round((prog.progress_seconds / totalDur) * 100))
        const remainingMin = Math.max(1, Math.round((totalDur - prog.progress_seconds) / 60))

        items.push({
          id: found.id,
          content: found,
          title: found.title,
          episode: `${Math.floor(prog.progress_seconds / 60)}m assistidos`,
          image: found.thumbnail_url || found.banner_url || '/banners/hero_davi_golias.jpg',
          timeLeft: `${remainingMin}m restantes`,
          progress: percent
        })
      }
    })

    const fallbackMovies = [
      {
        id: 'davi-golias',
        content: featuredMovie,
        title: 'Davi e Golias: A Força da Fé',
        episode: 'Filme Principal • 45m',
        image: '/banners/hero_davi_golias.jpg',
        timeLeft: '22m restantes',
        progress: 50
      },
      {
        id: 'daniel-covas',
        content: STREAM_CATALOG.find(m => m.id === 'daniel-covas') || featuredMovie,
        title: 'Daniel na Cova dos Leões',
        episode: 'Curta Especial • 35m',
        image: '/thumbnails/daniel.jpg',
        timeLeft: '12m restantes',
        progress: 65
      },
      {
        id: 'moises-mar',
        content: STREAM_CATALOG.find(m => m.id === 'moises-mar') || featuredMovie,
        title: 'Moisés e o Mar Vermelho',
        episode: 'Produção Completa • 40m',
        image: '/thumbnails/moises.jpg',
        timeLeft: '28m restantes',
        progress: 30
      },
      {
        id: 'rainha-ester',
        content: STREAM_CATALOG.find(m => m.id === 'rainha-ester') || featuredMovie,
        title: 'Rainha Ester: A Escolhida',
        episode: 'Filme Bíblico • 38m',
        image: '/posters/davi_vertical.png',
        timeLeft: '16m restantes',
        progress: 58
      },
      {
        id: 'jose-egito',
        content: STREAM_CATALOG.find(m => m.id === 'jose-egito') || featuredMovie,
        title: 'José do Egito: O Sonhador',
        episode: 'Longa-metragem • 50m',
        image: '/thumbnails/noe.jpg',
        timeLeft: '35m restantes',
        progress: 30
      }
    ]

    const combined = [...items]
    fallbackMovies.forEach(fb => {
      if (combined.length < 5 && !combined.some(it => it.id === fb.id)) {
        combined.push(fb)
      }
    })
    return combined
  }, [allMovies, featuredMovie, watchProgress])

  // Categorias de Filmes solicitadas pelo usuário
  const filmesParaVoce = useMemo(() => {
    return STREAM_CATALOG.filter(c => ['davi-golias', 'daniel-covas', 'moises-mar', 'jose-egito', 'rainha-ester'].includes(c.id))
  }, [])

  const lancamentos = useMemo(() => {
    return STREAM_CATALOG.filter(c => c.is_new || ['davi-golias', 'sansao-forte', 'jesus-tempestade', 'arca-alianca'].includes(c.id))
  }, [])

  const aventurasBiblicas = useMemo(() => {
    return STREAM_CATALOG.filter(c => ['davi-golias', 'daniel-covas', 'moises-mar', 'jonas-peixe', 'sansao-forte'].includes(c.id))
  }, [])

  const historiasDeJesus = useMemo(() => {
    return STREAM_CATALOG.filter(c => c.id.includes('jesus') || c.category === 'Milagres' || c.category === 'Aprendendo com Jesus' || c.id === 'milagres-de-jesus')
  }, [])

  const paraTodaFamilia = useMemo(() => {
    return STREAM_CATALOG.filter(c => ['arca-de-noe', 'davi-golias', 'jose-egito', 'rainha-ester', 'criacao-mundo'].includes(c.id))
  }, [])

  // Top 10 Filmes
  const top10Filmes = useMemo(() => [
    { rank: 1, content: featuredMovie, tag: '#1 em Filmes' },
    { rank: 2, content: STREAM_CATALOG.find(c => c.id === 'daniel-covas') || featuredMovie, tag: 'Mais Assistido' },
    { rank: 3, content: STREAM_CATALOG.find(c => c.id === 'moises-mar') || featuredMovie, tag: 'Clássico Bíblico' },
    { rank: 4, content: STREAM_CATALOG.find(c => c.id === 'jose-egito') || featuredMovie, tag: 'Favorito da Família' },
    { rank: 5, content: STREAM_CATALOG.find(c => c.id === 'rainha-ester') || featuredMovie, tag: 'Fé e Coragem' },
    { rank: 6, content: STREAM_CATALOG.find(c => c.id === 'sansao-forte') || featuredMovie, tag: 'Força Divina' },
    { rank: 7, content: STREAM_CATALOG.find(c => c.id === 'jonas-peixe') || featuredMovie, tag: 'Grande Aventura' },
    { rank: 8, content: STREAM_CATALOG.find(c => c.id === 'arca-alianca') || featuredMovie, tag: 'História Sagrada' },
    { rank: 9, content: STREAM_CATALOG.find(c => c.id === 'jesus-tempestade') || featuredMovie, tag: 'Milagre & Paz' },
    { rank: 10, content: STREAM_CATALOG.find(c => c.id === 'criacao-mundo') || featuredMovie, tag: 'O Princípio' }
  ], [featuredMovie])

  // Configuração dos Trilhos de Filmes
  const rails: HubRail[] = useMemo(() => [
    {
      type: 'spotlight',
      id: 'filmes-para-voce',
      title: activeProfile?.name ? `Filmes para você, ${activeProfile.name}` : 'Filmes para você',
      icon: <Film size={20} color="#ffb95f" />,
      spotlightItem: featuredMovie,
      spotlightBadge: 'LONGA METRAGEM',
      spotlightSecondaryBadge: '4K ULTRA HD',
      items: filmesParaVoce,
      seeAllLink: '/filmes',
      seeAllText: 'Ver catálogo'
    },
    {
      type: 'top10',
      id: 'top-10-filmes',
      title: 'Top 10 Filmes no Com Deus Kids',
      items: top10Filmes
    },
    {
      type: 'standard',
      id: 'lancamentos-filmes',
      title: 'Lançamentos',
      icon: <Flame size={18} color="#ffb95f" />,
      items: lancamentos,
      aspect: 'poster',
      getBadgeText: () => 'NOVO',
      getBadgeColor: () => 'rgba(238, 152, 0, 0.85)'
    },
    {
      type: 'standard',
      id: 'aventuras-biblicas',
      title: 'Aventuras Bíblicas',
      icon: <Star size={18} color="#22c55e" />,
      items: aventurasBiblicas,
      aspect: 'landscape',
      getSubtitle: () => 'Filme Bíblico de Fé'
    },
    {
      type: 'standard',
      id: 'historias-de-jesus',
      title: 'Histórias de Jesus',
      icon: <Heart size={18} color="#ffb95f" />,
      items: historiasDeJesus,
      aspect: 'poster',
      getBadgeText: () => 'JESUS',
      getBadgeColor: () => 'rgba(34, 197, 94, 0.85)'
    },
    {
      type: 'standard',
      id: 'para-toda-familia',
      title: 'Para toda família',
      icon: <Users size={18} color="#22c55e" />,
      items: paraTodaFamilia,
      aspect: 'landscape',
      getSubtitle: () => 'Diversão & Valores Cristãos'
    }
  ], [
    activeProfile,
    featuredMovie,
    filmesParaVoce,
    top10Filmes,
    lancamentos,
    aventurasBiblicas,
    historiasDeJesus,
    paraTodaFamilia
  ])

  return (
    <StreamHubPage
      hero={{
        content: featuredMovie,
        badgeText: 'FILME EM DESTAQUE • PRODUÇÃO EXCLUSIVA',
        badgeColor: 'rgba(238, 152, 0, 0.35)',
        badgeTextColor: '#ffb95f',
        title: 'DAVI E GOLIAS: A FORÇA DA FÉ',
        description: 'Uma jornada épica de fé inabalável, honra e fidelidade a Deus. A história emocionante do jovem pastor que desafiou o gigante.',
        metaTags: ['2026', 'LIVRE', '45m', '4K HDR'],
        bannerImg: '/banners/hero_davi_golias.jpg',
        isUpcoming: false
      }}
      continueWatching={{
        title: activeProfile?.name ? `Continue assistindo seus filmes, ${activeProfile.name}` : 'Continuar Assistindo Filmes',
        items: continueWatchingMovies,
        seeAllLink: '/filmes'
      }}
      rails={rails}
    />
  )
}
