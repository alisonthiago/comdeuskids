import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Check, Plus, Tv, Sparkles, Flame, History } from 'lucide-react'
import { useProfile } from '../context/ProfileContext'
import HeroCarousel, { HeroSlide } from '../components/stitch/HeroCarousel'
import StitchRail from '../components/stitch/StitchRail'
import StitchCard from '../components/stitch/StitchCard'

export default function StreamSeries() {
  const navigate = useNavigate()
  const { toggleMyList, isInMyList } = useProfile()

  // 1. Continue assistindo
  const continueWatching = useMemo(() => [
    {
      id: 'jose-egito',
      title: 'José do Egito',
      sub: 'T1:E1 • 18 min',
      thumbnail: '/thumbnails/card_jose_egito.jpg',
      progress: 42,
      quality: 'HD'
    },
    {
      id: 'arca-de-noe',
      title: 'A Arca de Noé',
      sub: 'T1:E3 • 12 min',
      thumbnail: '/thumbnails/card_noe.jpg',
      progress: 65,
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

  // 2. Séries bíblicas
  const seriesBiblicas = useMemo(() => [
    {
      id: 'jose-egito',
      title: 'José do Egito',
      sub: '10 episódios • Completa',
      thumbnail: '/thumbnails/card_jose_egito.jpg',
      quality: 'HD'
    },
    {
      id: 'arca-de-noe',
      title: 'A Arca de Noé',
      sub: '10 episódios • 2 Temporadas',
      thumbnail: '/thumbnails/card_noe.jpg',
      quality: 'HD'
    },
    {
      id: 'historias-de-davi',
      title: 'Histórias de Davi',
      sub: '6 episódios • 3D',
      thumbnail: '/banners/hero_davi_golias.jpg',
      quality: '3D'
    },
    {
      id: 'daniel-covas',
      title: 'Daniel na Babilônia',
      sub: '4 episódios • Bíblica',
      thumbnail: '/thumbnails/daniel.jpg',
      quality: 'HD'
    },
    {
      id: 'moises-mar',
      title: 'Moisés e o Êxodo',
      sub: '5 episódios • Épica',
      thumbnail: '/thumbnails/moises.jpg',
      quality: 'HD'
    }
  ], [])

  // 3. Aventuras da Bíblia
  const aventurasBiblia = useMemo(() => [
    {
      id: 'jonas-peixe',
      title: 'Jonas e o Peixe',
      sub: 'Aventura Marítima',
      thumbnail: '/thumbnails/card_jonas_torch.jpg',
      quality: 'HD'
    },
    {
      id: 'sansao-forte',
      title: 'Sansão, o Forte',
      sub: 'A Verdadeira Força',
      thumbnail: '/thumbnails/card_sansao.jpg',
      quality: '3D'
    },
    {
      id: 'davi-golias',
      title: 'Davi e Golias',
      sub: 'A Força da Fé',
      thumbnail: '/banners/hero_davi_golias.jpg',
      quality: 'HD'
    },
    {
      id: 'rainha-ester',
      title: 'Rainha Ester',
      sub: 'Coragem pela Nação',
      thumbnail: '/thumbnails/card_jose_egito.jpg',
      quality: 'HD'
    }
  ], [])

  // 4. Histórias de Jesus
  const historiasJesus = useMemo(() => [
    {
      id: 'milagres-de-jesus',
      title: 'Milagres de Jesus',
      sub: 'Histórias de Amor',
      thumbnail: '/thumbnails/jesus_tempestade.jpg',
      quality: 'HD'
    },
    {
      id: 'jesus-tempestade',
      title: 'Jesus e a Tempestade',
      sub: 'Paz sobre as Águas',
      thumbnail: '/thumbnails/jesus_tempestade.jpg',
      quality: 'HD'
    },
    {
      id: 'multiplicacao-paes',
      title: 'A Multiplicação dos Pães',
      sub: 'O Milagre do Compartilhar',
      thumbnail: '/thumbnails/card_noe.jpg',
      quality: 'HD'
    },
    {
      id: 'bom-samaritano',
      title: 'O Bom Samaritano',
      sub: 'Amor ao Próximo',
      thumbnail: '/thumbnails/card_sansao.jpg',
      quality: 'HD'
    }
  ], [])

  // 5. Mais assistidas
  const maisAssistidas = useMemo(() => [
    {
      id: 'jose-egito',
      title: '1. José do Egito',
      sub: 'Top 1 da Semana',
      thumbnail: '/thumbnails/card_jose_egito.jpg',
      quality: 'HD'
    },
    {
      id: 'jonas-peixe',
      title: '2. Jonas e o Peixe',
      sub: 'Top 2 da Semana',
      thumbnail: '/thumbnails/card_jonas_torch.jpg',
      quality: 'HD'
    },
    {
      id: 'arca-de-noe',
      title: '3. A Arca de Noé',
      sub: 'Top 3 da Semana',
      thumbnail: '/thumbnails/card_noe.jpg',
      quality: 'HD'
    },
    {
      id: 'historias-de-davi',
      title: '4. Davi e Golias',
      sub: 'Top 4 da Semana',
      thumbnail: '/banners/hero_davi_golias.jpg',
      quality: '3D'
    }
  ], [])

  // 6. Novos episódios
  const novosEpisodios = useMemo(() => [
    {
      id: 'jose-ep5',
      title: 'José: Um Novo Começo',
      sub: 'Episódio 5 • Inédito',
      thumbnail: '/thumbnails/card_jose_egito.jpg',
      quality: 'HD'
    },
    {
      id: 'noe-ep5',
      title: 'Noé: A Aliança Eterna',
      sub: 'Temporada 2 • Final',
      thumbnail: '/thumbnails/card_noe.jpg',
      quality: 'HD'
    },
    {
      id: 'davi-ep4',
      title: 'Davi: A Harpa da Paz',
      sub: 'Novo • Louvores',
      thumbnail: '/banners/hero_davi_golias.jpg',
      quality: 'HD'
    },
    {
      id: 'jonas-ep2',
      title: 'Jonas: A Cidade Salva',
      sub: 'Novo Episódio',
      thumbnail: '/thumbnails/card_jonas_torch.jpg',
      quality: 'HD'
    }
  ], [])

  const handlePlay = (id: string) => navigate(`/assistir/${id}`)

  // 1 Destaque Fixo Oficial de Séries (Sem rotação de slides)
  const seriesHeroSlides: HeroSlide[] = useMemo(() => [
    {
      id: 'jose-egito',
      title: 'José do Egito',
      evidence: 'Série Bíblica Original',
      attributes: ['Série', '10 episódios', 'HD', 'Família'],
      description: 'A incrível história de José, que com fé e obediência viu Deus transformar desafios em grandes propósitos.',
      bannerImage: '/banners/jose_egito_hero.jpg',
      primaryActionText: 'Assistir 1º episódio',
      onPrimaryAction: () => handlePlay('jose-egito'),
      secondaryActionText: isInMyList('jose-egito') ? 'Na Minha Lista' : 'Minha Lista',
      secondaryActionIcon: isInMyList('jose-egito') ? <Check size={18} color="#22c55e" /> : <Plus size={18} />,
      onSecondaryAction: () => toggleMyList('jose-egito')
    }
  ], [isInMyList, toggleMyList])

  return (
    <div className="cdk-stream-container" style={{ position: 'relative' }}>
      {/* Hero Carousel com Destaques de Séries */}
      <HeroCarousel slides={seriesHeroSlides} ctaType="series" />

      {/* 1. Continue assistindo */}
      <StitchRail title="Continue assistindo" icon={<History size={20} color="#22c55e" />}>
        {continueWatching.map(card => (
          <StitchCard
            key={card.id}
            id={card.id}
            title={card.title}
            subtitle={card.sub}
            thumbnail={card.thumbnail}
            progress={card.progress}
            badgeText={card.quality}
            onClick={handlePlay}
          />
        ))}
      </StitchRail>

      {/* 2. Séries bíblicas */}
      <StitchRail title="Séries bíblicas" icon={<Tv size={20} color="#22c55e" />} seeAllLink="/series">
        {seriesBiblicas.map(card => (
          <StitchCard
            key={card.id}
            id={card.id}
            title={card.title}
            subtitle={card.sub}
            thumbnail={card.thumbnail}
            badgeText={card.quality}
            onClick={handlePlay}
          />
        ))}
      </StitchRail>

      {/* 3. Aventuras da Bíblia */}
      <StitchRail title="Aventuras da Bíblia" icon={<Sparkles size={20} color="#ffb95f" />} seeAllLink="/series">
        {aventurasBiblia.map(card => (
          <StitchCard
            key={card.id}
            id={card.id}
            title={card.title}
            subtitle={card.sub}
            thumbnail={card.thumbnail}
            badgeText={card.quality}
            onClick={handlePlay}
          />
        ))}
      </StitchRail>

      {/* 4. Histórias de Jesus */}
      <StitchRail title="Histórias de Jesus" icon={<Sparkles size={20} color="#60a5fa" />} seeAllLink="/series">
        {historiasJesus.map(card => (
          <StitchCard
            key={card.id}
            id={card.id}
            title={card.title}
            subtitle={card.sub}
            thumbnail={card.thumbnail}
            badgeText={card.quality}
            onClick={handlePlay}
          />
        ))}
      </StitchRail>

      {/* 5. Mais assistidas */}
      <StitchRail title="Mais assistidas" icon={<Flame size={20} color="#f97316" />} seeAllLink="/series">
        {maisAssistidas.map(card => (
          <StitchCard
            key={card.id}
            id={card.id}
            title={card.title}
            subtitle={card.sub}
            thumbnail={card.thumbnail}
            badgeText={card.quality}
            onClick={handlePlay}
          />
        ))}
      </StitchRail>

      {/* 6. Novos episódios */}
      <StitchRail title="Novos episódios" icon={<Tv size={20} color="#22c55e" />} seeAllLink="/series">
        {novosEpisodios.map(card => (
          <StitchCard
            key={card.id}
            id={card.id}
            title={card.title}
            subtitle={card.sub}
            thumbnail={card.thumbnail}
            badgeText={card.quality}
            onClick={handlePlay}
          />
        ))}
      </StitchRail>
    </div>
  )
}
