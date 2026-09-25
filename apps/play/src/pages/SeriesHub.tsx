import React, { useMemo } from 'react'
import {
  Tv, Sparkles, Flame, Compass, BookOpen, Heart, Users, Star
} from 'lucide-react'
import { STREAM_CATALOG } from '../data/streamCatalog'
import { useProfile } from '../context/ProfileContext'
import { StreamContent } from '@comdeuskids/types'
import StreamHubPage, { HubRail } from '../components/streaming/StreamHubPage'

export default function SeriesHub() {
  const { activeProfile, watchProgress } = useProfile()

  // Todas as produções serializadas e narrativas episódicas
  const allSeries = useMemo(() => {
    const seriesOnly = STREAM_CATALOG.filter(c => c.type === 'series')
    // Também inclui produções episódicas ou com temporadas
    const episodic = STREAM_CATALOG.filter(c => c.type !== 'series' && (c.episodes || c.category === 'Histórias Bíblicas'))
    return [...seriesOnly, ...episodic]
  }, [])

  // Série em destaque no Hero: A Arca de Noé (ou Milagres de Jesus se educador)
  const featuredSeries = useMemo(() => {
    const profileType = activeProfile?.profile_type || 'child'
    if (profileType === 'teacher' || profileType === 'leader') {
      return STREAM_CATALOG.find(s => s.id === 'milagres-de-jesus') || allSeries[0]
    }
    return STREAM_CATALOG.find(s => s.id === 'arca-de-noe') || allSeries[0]
  }, [activeProfile, allSeries])

  // Continuar Assistindo Séries (sempre enriquecido com 5 itens)
  const continueWatchingSeries = useMemo(() => {
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
      const found = allSeries.find(c => c.id === contentId || c.slug === contentId)
      if (found && !prog.completed && prog.progress_seconds > 0) {
        const totalDur = prog.duration_seconds || (found.duration_minutes ? found.duration_minutes * 60 : 1500)
        const percent = Math.min(100, Math.round((prog.progress_seconds / totalDur) * 100))
        const remainingMin = Math.max(1, Math.round((totalDur - prog.progress_seconds) / 60))

        items.push({
          id: found.id,
          content: found,
          title: found.title,
          episode: prog.episode_number ? `T1:E${prog.episode_number} — ${prog.episode_title || 'Promessas de Deus'}` : 'T1:E3 — Promessas de Deus',
          image: found.thumbnail_url || found.banner_url || '/thumbnails/noe.jpg',
          timeLeft: `${remainingMin}m restantes`,
          progress: percent
        })
      }
    })

    const isSara = activeProfile?.name?.toLowerCase().includes('sara')
    const fallbackSeries = [
      {
        id: 'arca-de-noe',
        content: featuredSeries,
        title: 'A Arca de Noé',
        episode: isSara ? 'T1:E1 — O Chamado' : 'T1:E3 — Promessas de Deus',
        image: '/thumbnails/noe.jpg',
        timeLeft: isSara ? '17m restantes' : '18m restantes',
        progress: isSara ? 32 : 52
      },
      {
        id: 'historias-de-davi',
        content: STREAM_CATALOG.find(s => s.id === 'davi-golias') || featuredSeries,
        title: 'Histórias de Davi: Do Campo ao Trono',
        episode: 'T1:E2 — O Jovem Ungido',
        image: '/banners/hero_davi_golias.jpg',
        timeLeft: '14m restantes',
        progress: 45
      },
      {
        id: 'milagres-de-jesus',
        content: STREAM_CATALOG.find(s => s.id === 'milagres-de-jesus') || featuredSeries,
        title: 'Milagres de Jesus: Histórias de Amor',
        episode: 'T1:E5 — O Cego de Jericó',
        image: '/banners/arca_noe_banner.jpg',
        timeLeft: '9m restantes',
        progress: 78
      },
      {
        id: 'daniel-covas',
        content: STREAM_CATALOG.find(s => s.id === 'daniel-covas') || featuredSeries,
        title: 'Daniel na Babilônia',
        episode: 'T1:E4 — A Fidelidade do Profeta',
        image: '/thumbnails/daniel.jpg',
        timeLeft: '21m restantes',
        progress: 30
      },
      {
        id: 'moises-mar',
        content: STREAM_CATALOG.find(s => s.id === 'moises-mar') || featuredSeries,
        title: 'Moisés e o Êxodo',
        episode: 'T1:E1 — Do Egito ao Sinai',
        image: '/thumbnails/moises.jpg',
        timeLeft: '11m restantes',
        progress: 60
      }
    ]

    const combined = [...items]
    fallbackSeries.forEach(fb => {
      if (combined.length < 5 && !combined.some(it => it.id === fb.id)) {
        combined.push(fb)
      }
    })
    return combined
  }, [allSeries, featuredSeries, watchProgress, activeProfile])

  // Séries por Temática / Categorias solicitadas pelo usuário
  const seriesParaVoce = useMemo(() => {
    return STREAM_CATALOG.filter(c => ['arca-de-noe', 'milagres-de-jesus', 'davi-golias', 'jose-egito', 'rainha-ester'].includes(c.id))
  }, [])

  const originaisComDeusKids = useMemo(() => {
    return STREAM_CATALOG.filter(c => ['arca-de-noe', 'milagres-de-jesus', 'davi-golias', 'moises-mar', 'daniel-covas'].includes(c.id))
  }, [])

  const novosEpisodios = useMemo(() => {
    return STREAM_CATALOG.filter(c => c.is_new || ['arca-de-noe', 'milagres-de-jesus', 'jesus-tempestade', 'jonas-peixe'].includes(c.id))
  }, [])

  const heroisDaFe = useMemo(() => {
    return STREAM_CATALOG.filter(c => ['davi-golias', 'daniel-covas', 'moises-mar', 'sansao-forte', 'jose-egito', 'rainha-ester'].includes(c.id))
  }, [])

  const antigoTestamento = useMemo(() => {
    return STREAM_CATALOG.filter(c => ['arca-de-noe', 'davi-golias', 'moises-mar', 'daniel-covas', 'jose-egito', 'rainha-ester', 'sansao-forte', 'arca-alianca'].includes(c.id))
  }, [])

  const novoTestamento = useMemo(() => {
    return STREAM_CATALOG.filter(c => ['milagres-de-jesus', 'jesus-tempestade', 'criacao-mundo', 'louvores-coracao'].includes(c.id))
  }, [])

  // Top 10 Séries
  const top10Series = useMemo(() => [
    { rank: 1, content: STREAM_CATALOG.find(c => c.id === 'arca-de-noe') || featuredSeries, tag: '#1 em Séries' },
    { rank: 2, content: STREAM_CATALOG.find(c => c.id === 'milagres-de-jesus') || featuredSeries, tag: 'Nova Temporada' },
    { rank: 3, content: STREAM_CATALOG.find(c => c.id === 'davi-golias') || featuredSeries, tag: 'Mais Assistida' },
    { rank: 4, content: STREAM_CATALOG.find(c => c.id === 'daniel-covas') || featuredSeries, tag: 'Épico Bíblico' },
    { rank: 5, content: STREAM_CATALOG.find(c => c.id === 'jose-egito') || featuredSeries, tag: 'Favorito da Família' },
    { rank: 6, content: STREAM_CATALOG.find(c => c.id === 'moises-mar') || featuredSeries, tag: 'Milagres' },
    { rank: 7, content: STREAM_CATALOG.find(c => c.id === 'rainha-ester') || featuredSeries, tag: 'História Inspiradora' },
    { rank: 8, content: STREAM_CATALOG.find(c => c.id === 'arca-alianca') || featuredSeries, tag: 'Presença Sagrada' },
    { rank: 9, content: STREAM_CATALOG.find(c => c.id === 'jonas-peixe') || featuredSeries, tag: 'Obediência' },
    { rank: 10, content: STREAM_CATALOG.find(c => c.id === 'sansao-forte') || featuredSeries, tag: 'Fé & Superação' }
  ], [featuredSeries])

  // Configuração dos Trilhos de Séries seguindo a Home
  const rails: HubRail[] = useMemo(() => [
    {
      type: 'spotlight',
      id: 'series-para-voce',
      title: activeProfile?.name ? `Séries para você, ${activeProfile.name}` : 'Séries para você',
      icon: <Tv size={20} color="#ffb95f" />,
      spotlightItem: featuredSeries,
      spotlightBadge: 'SÉRIE ORIGINAL',
      spotlightSecondaryBadge: '2 TEMPORADAS',
      items: seriesParaVoce,
      seeAllLink: '/series',
      seeAllText: 'Ver mais séries'
    },
    {
      type: 'standard',
      id: 'originais-com-deus-kids',
      title: 'Originais Com Deus Kids',
      icon: <Sparkles size={18} color="#22c55e" />,
      items: originaisComDeusKids,
      aspect: 'landscape',
      seeAllLink: '/series',
      seeAllText: 'Ver todas',
      getBadgeText: () => 'ORIGINAL',
      getBadgeColor: () => 'rgba(238, 152, 0, 0.85)',
      getSubtitle: () => 'Temporada Completa • 4K'
    },
    {
      type: 'top10',
      id: 'top-10-series',
      title: 'Top 10 Séries no Com Deus Kids',
      items: top10Series
    },
    {
      type: 'standard',
      id: 'novos-episodios',
      title: 'Novos Episódios',
      icon: <Flame size={18} color="#ffb95f" />,
      items: novosEpisodios,
      aspect: 'poster',
      getBadgeText: () => 'NOVO EPISÓDIO',
      getBadgeColor: () => 'rgba(34, 197, 94, 0.85)'
    },
    {
      type: 'standard',
      id: 'herois-da-fe',
      title: 'Heróis da Fé',
      icon: <Star size={18} color="#ffb95f" />,
      items: heroisDaFe,
      aspect: 'poster'
    },
    {
      type: 'standard',
      id: 'antigo-testamento',
      title: 'Antigo Testamento',
      icon: <BookOpen size={18} color="#22c55e" />,
      items: antigoTestamento,
      aspect: 'landscape',
      getBadgeText: () => 'A.T.',
      getSubtitle: () => 'História Bíblica Épica'
    },
    {
      type: 'standard',
      id: 'novo-testamento',
      title: 'Novo Testamento',
      icon: <Heart size={18} color="#ffb95f" />,
      items: novoTestamento,
      aspect: 'poster',
      getBadgeText: () => 'N.T.'
    }
  ], [
    activeProfile,
    featuredSeries,
    seriesParaVoce,
    originaisComDeusKids,
    top10Series,
    novosEpisodios,
    heroisDaFe,
    antigoTestamento,
    novoTestamento
  ])

  return (
    <StreamHubPage
      hero={{
        content: featuredSeries,
        badgeText: 'SÉRIE ORIGINAL • TEMPORADA 2',
        badgeColor: 'rgba(238, 152, 0, 0.35)',
        badgeTextColor: '#ffb95f',
        title: featuredSeries.title.toUpperCase(),
        description: featuredSeries.description,
        metaTags: ['2026', 'LIVRE', '2 Temporadas', '4K HDR'],
        bannerImg: featuredSeries.banner_url || '/banners/arca_noe_banner.jpg',
        isUpcoming: false
      }}
      continueWatching={{
        title: activeProfile?.name ? `Continue sua maratona de séries, ${activeProfile.name}` : 'Continuar Assistindo Séries',
        items: continueWatchingSeries,
        seeAllLink: '/series'
      }}
      rails={rails}
    />
  )
}
