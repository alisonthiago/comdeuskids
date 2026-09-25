import React, { useMemo } from 'react'
import {
  Video, Sparkles, Flame, Compass, BookOpen, Star, Users, Heart
} from 'lucide-react'
import { STREAM_CATALOG } from '../data/streamCatalog'
import { useProfile } from '../context/ProfileContext'
import { StreamContent } from '@comdeuskids/types'
import StreamHubPage, { HubRail } from '../components/streaming/StreamHubPage'

export default function Videos() {
  const { activeProfile, watchProgress } = useProfile()

  // Todos os vídeos e produções
  const allVideos = useMemo(() => STREAM_CATALOG, [])

  // Vídeo em destaque no Hero: Daniel na Cova dos Leões
  const featuredVideo = useMemo(() => {
    return STREAM_CATALOG.find(c => c.id === 'daniel-covas') || STREAM_CATALOG[0]
  }, [])

  // Continuar assistindo vídeos (sempre preenchido com 5 itens)
  const continueWatchingVideos = useMemo(() => {
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
      const found = STREAM_CATALOG.find(c => c.id === contentId || c.slug === contentId)
      if (found && !prog.completed && prog.progress_seconds > 0) {
        const totalDur = prog.duration_seconds || (found.duration_minutes ? found.duration_minutes * 60 : 1500)
        const percent = Math.min(100, Math.round((prog.progress_seconds / totalDur) * 100))
        const remainingMin = Math.max(1, Math.round((totalDur - prog.progress_seconds) / 60))

        items.push({
          id: found.id,
          content: found,
          title: found.title,
          episode: `${Math.floor(prog.progress_seconds / 60)}m assistidos`,
          image: found.thumbnail_url || found.banner_url || '/thumbnails/daniel.jpg',
          timeLeft: `${remainingMin}m restantes`,
          progress: percent
        })
      }
    })

    const fallbackVideos = [
      {
        id: 'daniel-covas',
        content: featuredVideo,
        title: 'Daniel na Cova dos Leões',
        episode: 'Vídeo em Destaque • 35m',
        image: '/thumbnails/daniel.jpg',
        timeLeft: '18m restantes',
        progress: 42
      },
      {
        id: 'jesus-tempestade',
        content: STREAM_CATALOG.find(c => c.id === 'jesus-tempestade') || featuredVideo,
        title: 'Jesus Acalma a Tempestade',
        episode: 'Vídeo Bíblico • 22m',
        image: '/thumbnails/jesus_tempestade.jpg',
        timeLeft: '8m restantes',
        progress: 70
      },
      {
        id: 'moises-mar',
        content: STREAM_CATALOG.find(c => c.id === 'moises-mar') || featuredVideo,
        title: 'Moisés e o Mar Vermelho',
        episode: 'Grande Milagre • 28m',
        image: '/thumbnails/moises.jpg',
        timeLeft: '14m restantes',
        progress: 55
      },
      {
        id: 'jonas-peixe',
        content: STREAM_CATALOG.find(c => c.id === 'jonas-peixe') || featuredVideo,
        title: 'Jonas e o Grande Peixe',
        episode: 'História Divertida • 20m',
        image: '/thumbnails/noe.jpg',
        timeLeft: '12m restantes',
        progress: 40
      },
      {
        id: 'sansao-forte',
        content: STREAM_CATALOG.find(c => c.id === 'sansao-forte') || featuredVideo,
        title: 'Sansão: Força e Propósito',
        episode: 'Episódio Bíblico • 30m',
        image: '/banners/hero_davi_golias.jpg',
        timeLeft: '20m restantes',
        progress: 35
      }
    ]

    const combined = [...items]
    fallbackVideos.forEach(fb => {
      if (combined.length < 5 && !combined.some(it => it.id === fb.id)) {
        combined.push(fb)
      }
    })
    return combined
  }, [featuredVideo, watchProgress])

  // Categorias de Vídeos solicitadas pelo usuário
  const recomendados = useMemo(() => {
    return STREAM_CATALOG.filter(c => ['daniel-covas', 'jesus-tempestade', 'moises-mar', 'arca-de-noe', 'davi-golias'].includes(c.id))
  }, [])

  const historiasBiblicas = useMemo(() => {
    return STREAM_CATALOG.filter(c => c.category === 'Histórias Bíblicas' || ['arca-de-noe', 'davi-golias', 'moises-mar', 'jose-egito'].includes(c.id))
  }, [])

  const aprendendoComJesus = useMemo(() => {
    return STREAM_CATALOG.filter(c => c.category === 'Aprendendo com Jesus' || c.id.includes('jesus') || c.id === 'milagres-de-jesus')
  }, [])

  const maisAssistidos = useMemo(() => {
    return STREAM_CATALOG.filter(c => ['davi-golias', 'arca-de-noe', 'daniel-covas', 'milagres-de-jesus', 'moises-mar', 'rainha-ester'].includes(c.id))
  }, [])

  const novosVideos = useMemo(() => {
    return STREAM_CATALOG.filter(c => c.is_new || ['davi-golias', 'arca-alianca', 'jesus-tempestade', 'sansao-forte'].includes(c.id))
  }, [])

  // Top 10 Vídeos
  const top10Videos = useMemo(() => [
    { rank: 1, content: featuredVideo, tag: '#1 em Vídeos' },
    { rank: 2, content: STREAM_CATALOG.find(c => c.id === 'davi-golias') || featuredVideo, tag: 'História Mais Amada' },
    { rank: 3, content: STREAM_CATALOG.find(c => c.id === 'arca-de-noe') || featuredVideo, tag: 'Clássico Animado' },
    { rank: 4, content: STREAM_CATALOG.find(c => c.id === 'jesus-tempestade') || featuredVideo, tag: 'Mensagem de Paz' },
    { rank: 5, content: STREAM_CATALOG.find(c => c.id === 'moises-mar') || featuredVideo, tag: 'Milagre Inesquecível' },
    { rank: 6, content: STREAM_CATALOG.find(c => c.id === 'milagres-de-jesus') || featuredVideo, tag: 'Comunhão & Amor' },
    { rank: 7, content: STREAM_CATALOG.find(c => c.id === 'rainha-ester') || featuredVideo, tag: 'Coragem Real' },
    { rank: 8, content: STREAM_CATALOG.find(c => c.id === 'jose-egito') || featuredVideo, tag: 'Perdão e Família' },
    { rank: 9, content: STREAM_CATALOG.find(c => c.id === 'jonas-peixe') || featuredVideo, tag: 'Aventura no Mar' },
    { rank: 10, content: STREAM_CATALOG.find(c => c.id === 'sansao-forte') || featuredVideo, tag: 'Força da Oração' }
  ], [featuredVideo])

  // Configuração dos Trilhos de Vídeos
  const rails: HubRail[] = useMemo(() => [
    {
      type: 'spotlight',
      id: 'recomendados-videos',
      title: activeProfile?.name ? `Recomendados para você, ${activeProfile.name}` : 'Recomendados para você',
      icon: <Video size={20} color="#ffb95f" />,
      spotlightItem: featuredVideo,
      spotlightBadge: 'VÍDEO EM ALTA',
      spotlightSecondaryBadge: '4K HDR',
      items: recomendados,
      seeAllLink: '/videos',
      seeAllText: 'Ver mais'
    },
    {
      type: 'top10',
      id: 'top-10-videos',
      title: 'Mais Assistidos',
      items: top10Videos
    },
    {
      type: 'standard',
      id: 'historias-biblicas',
      title: 'Histórias Bíblicas',
      icon: <BookOpen size={18} color="#22c55e" />,
      items: historiasBiblicas,
      aspect: 'poster',
      getBadgeText: () => 'BÍBLIA',
      getBadgeColor: () => 'rgba(238, 152, 0, 0.85)'
    },
    {
      type: 'standard',
      id: 'aprendendo-com-jesus',
      title: 'Aprendendo com Jesus',
      icon: <Heart size={18} color="#ffb95f" />,
      items: aprendendoComJesus,
      aspect: 'landscape',
      getSubtitle: () => 'Ensinamentos de Amor & Graça'
    },
    {
      type: 'standard',
      id: 'novos-videos',
      title: 'Novos Vídeos',
      icon: <Flame size={18} color="#ffb95f" />,
      items: novosVideos,
      aspect: 'poster',
      getBadgeText: () => 'NOVO',
      getBadgeColor: () => 'rgba(160, 120, 255, 0.85)'
    }
  ], [
    activeProfile,
    featuredVideo,
    recomendados,
    top10Videos,
    historiasBiblicas,
    aprendendoComJesus,
    novosVideos
  ])

  return (
    <StreamHubPage
      hero={{
        content: featuredVideo,
        badgeText: 'VÍDEO EM DESTAQUE • HISTÓRIA DE FÉ',
        badgeColor: 'rgba(238, 152, 0, 0.35)',
        badgeTextColor: '#ffb95f',
        title: 'DANIEL NA COVA DOS LEÕES',
        description: 'Uma lição viva de integridade, oração constante e fé perante os maiores desafios. Deus fecha a boca dos leões e protege o seu servo.',
        metaTags: ['2026', 'LIVRE', '35m', '4K HDR'],
        bannerImg: '/thumbnails/daniel.jpg',
        isUpcoming: false
      }}
      continueWatching={{
        title: activeProfile?.name ? `Continue assistindo seus vídeos, ${activeProfile.name}` : 'Continuar Assistindo Vídeos',
        items: continueWatchingVideos,
        seeAllLink: '/videos'
      }}
      rails={rails}
    />
  )
}
