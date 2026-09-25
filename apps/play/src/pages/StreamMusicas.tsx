import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Check, Plus, Music, Heart, Mic2, Sparkles, Flame, Radio } from 'lucide-react'
import { useProfile } from '../context/ProfileContext'
import HeroCarousel, { HeroSlide } from '../components/stitch/HeroCarousel'
import StitchRail from '../components/stitch/StitchRail'
import StitchCard from '../components/stitch/StitchCard'
import StitchPills from '../components/stitch/StitchPills'

export default function StreamMusicas() {
  const navigate = useNavigate()
  const { toggleMyList, isInMyList } = useProfile()
  const [activeFilter, setActiveFilter] = useState('todos')

  const filterPills = [
    { id: 'todos', label: '🎵 Todos', customClass: 'cdk-music-pill-all' },
    { id: 'louvores', label: '🎤 Louvores para crianças', customClass: 'cdk-music-pill-praise' },
    { id: 'cante', label: '🎬 Cante com a gente', customClass: 'cdk-music-pill-clips' },
    { id: 'aprender', label: '⭐ Músicas para aprender', customClass: 'cdk-music-pill-playback' },
    { id: 'favoritas', label: '💖 Favoritas', customClass: 'cdk-music-pill-popular' },
    { id: 'novidades', label: '🔥 Novidades', customClass: 'cdk-music-pill-all' }
  ]

  // 1. Continue ouvindo
  const continueOuvindo = useMemo(() => [
    {
      id: 'song-davi',
      title: 'Aventura com Davi',
      sub: 'Louvor Infantil • 03:12',
      thumbnail: '/thumbnails/song_david_pastor.jpg',
      progress: 60,
      quality: 'HD'
    },
    {
      id: 'song-arca',
      title: 'Monte a Arca',
      sub: 'Clipe Animado • 02:45',
      thumbnail: '/thumbnails/cante_com_noe.jpg',
      progress: 35,
      quality: 'HD'
    },
    {
      id: 'song-louvores',
      title: 'Louvores do Coração',
      sub: 'Adoração Kids • 04:10',
      thumbnail: '/thumbnails/louvores_coracao.jpg',
      progress: 80,
      quality: 'HD'
    }
  ], [])

  // 2. Louvores para crianças
  const louvoresCriancas = useMemo(() => [
    {
      id: 'song-davi',
      title: 'Aventura com Davi',
      sub: 'A Força do Louvor',
      thumbnail: '/thumbnails/song_david_pastor.jpg',
      quality: 'HD'
    },
    {
      id: 'song-soldadinho',
      title: 'Soldadinho de Cristo',
      sub: 'Marcha da Fé',
      thumbnail: '/thumbnails/soldadinho_cristo.jpg',
      quality: 'HD'
    },
    {
      id: 'song-aleluia',
      title: 'Aleluia nas Estrelas',
      sub: 'Criação e Luz',
      thumbnail: '/thumbnails/louvores_coracao.jpg',
      quality: 'HD'
    },
    {
      id: 'song-brilha',
      title: 'Brilha Estrelinha da Fé',
      sub: 'Canção de Paz',
      thumbnail: '/thumbnails/song_brilha_estrela.jpg',
      quality: 'HD'
    }
  ], [])

  // 3. Cante com a gente
  const canteComAGente = useMemo(() => [
    {
      id: 'song-arca',
      title: 'Cante com Noé',
      sub: 'Bicharada no Ritmo',
      thumbnail: '/thumbnails/cante_com_noe.jpg',
      quality: 'HD'
    },
    {
      id: 'song-daniel',
      title: 'Daniel e os Leões Dançarinos',
      sub: 'Clipe Musical 3D',
      thumbnail: '/thumbnails/song_daniel_leoes.jpg',
      quality: 'HD'
    },
    {
      id: 'song-jonas',
      title: 'O Peixinho que Ouve a Deus',
      sub: 'Música Animada',
      thumbnail: '/thumbnails/song_jonas_baleia.jpg',
      quality: 'HD'
    }
  ], [])

  // 4. Músicas para aprender
  const musicasAprender = useMemo(() => [
    {
      id: 'song-quiz',
      title: 'Quiz Musical da Bíblia',
      sub: 'Aprenda Cantando',
      thumbnail: '/thumbnails/soldadinho_cristo.jpg',
      quality: 'HD'
    },
    {
      id: 'song-memoria',
      title: 'Frutos do Espírito',
      sub: 'Amor, Alegria e Paz',
      thumbnail: '/thumbnails/song_daniel_leoes.jpg',
      quality: 'HD'
    },
    {
      id: 'song-labirinto',
      title: 'Os 10 Mandamentos Kids',
      sub: 'Canção de Sabedoria',
      thumbnail: '/thumbnails/song_jonas_baleia.jpg',
      quality: 'HD'
    },
    {
      id: 'song-pinte',
      title: 'Livros da Bíblia em Canção',
      sub: 'Gênesis a Apocalipse',
      thumbnail: '/thumbnails/louvores_coracao.jpg',
      quality: 'HD'
    }
  ], [])

  // 5. Favoritas
  const favoritas = useMemo(() => [
    {
      id: 'song-louvores-fav',
      title: 'Louvores do Coração',
      sub: '1º Lugar nas Playlists',
      thumbnail: '/thumbnails/louvores_coracao.jpg',
      quality: 'HD'
    },
    {
      id: 'song-davi-fav',
      title: 'O Pequeno Pastor Davi',
      sub: 'Mais Salva pelas Crianças',
      thumbnail: '/thumbnails/song_david_pastor.jpg',
      quality: 'HD'
    },
    {
      id: 'song-arca-fav',
      title: 'O Arco-Íris da Aliança',
      sub: 'Favorita das Famílias',
      thumbnail: '/thumbnails/cante_com_noe.jpg',
      quality: 'HD'
    }
  ], [])

  // 6. Novidades
  const novidades = useMemo(() => [
    {
      id: 'song-novo-1',
      title: 'Em Todo Tempo Louvarei',
      sub: 'Lançamento Exclusivo',
      thumbnail: '/thumbnails/song_brilha_estrela.jpg',
      quality: 'HD'
    },
    {
      id: 'song-novo-2',
      title: 'Oração dos Pequeninos',
      sub: 'Canção de Ninar Cristã',
      thumbnail: '/thumbnails/song_jonas_baleia.jpg',
      quality: 'HD'
    },
    {
      id: 'song-novo-3',
      title: 'Somos Todos Irmãos',
      sub: 'Clipe Especial 3D',
      thumbnail: '/thumbnails/song_daniel_leoes.jpg',
      quality: 'HD'
    }
  ], [])

  const handlePlayMusic = (id: string) => navigate(`/assistir/${id}`)

  // 1 Destaque Fixo Oficial de Músicas (Sem rotação de slides)
  const musicHeroSlides: HeroSlide[] = useMemo(() => [
    {
      id: 'louvores-coracao',
      title: 'Louvores do Coração',
      evidence: 'Álbum Oficial Com Deus Kids',
      attributes: ['Músicas', 'HD Áudio', 'Livre'],
      description: 'Músicas que ensinam, alegram e aproximam as crianças de Deus com adoração sincera e ritmos contagiantes.',
      bannerImage: '/banners/louvores_hero_girl.jpg',
      primaryActionText: 'Ouvir agora',
      onPrimaryAction: () => handlePlayMusic('louvores-coracao'),
      secondaryActionText: isInMyList('louvores-coracao') ? 'Na Minha Lista' : 'Minha Lista',
      secondaryActionIcon: isInMyList('louvores-coracao') ? <Check size={18} color="#22c55e" /> : <Plus size={18} />,
      onSecondaryAction: () => toggleMyList('louvores-coracao')
    }
  ], [isInMyList, toggleMyList])

  return (
    <div className="cdk-stream-container" style={{ position: 'relative' }}>
      {/* Hero Carousel com Destaques de Músicas */}
      <HeroCarousel slides={musicHeroSlides} ctaType="music" />

      {/* Pílulas de Filtros */}
      <StitchPills items={filterPills} activeId={activeFilter} onChange={setActiveFilter} />

      {/* 1. Continue ouvindo */}
      <StitchRail title="Continue ouvindo" icon={<Radio size={20} color="#22c55e" />}>
        {continueOuvindo.map(card => (
          <StitchCard
            key={card.id}
            id={card.id}
            title={card.title}
            subtitle={card.sub}
            thumbnail={card.thumbnail}
            progress={card.progress}
            badgeText={card.quality}
            onClick={handlePlayMusic}
          />
        ))}
      </StitchRail>

      {/* 2. Louvores para crianças */}
      <StitchRail title="Louvores para crianças" icon={<Music size={20} color="#22c55e" />} seeAllLink="/musicas">
        {louvoresCriancas.map(card => (
          <StitchCard
            key={card.id}
            id={card.id}
            title={card.title}
            subtitle={card.sub}
            thumbnail={card.thumbnail}
            badgeText={card.quality}
            onClick={handlePlayMusic}
          />
        ))}
      </StitchRail>

      {/* 3. Cante com a gente */}
      <StitchRail title="Cante com a gente" icon={<Mic2 size={20} color="#f59e0b" />} seeAllLink="/musicas">
        {canteComAGente.map(card => (
          <StitchCard
            key={card.id}
            id={card.id}
            title={card.title}
            subtitle={card.sub}
            thumbnail={card.thumbnail}
            badgeText={card.quality}
            onClick={handlePlayMusic}
          />
        ))}
      </StitchRail>

      {/* 4. Músicas para aprender */}
      <StitchRail title="Músicas para aprender" icon={<Sparkles size={20} color="#38bdf8" />} seeAllLink="/musicas">
        {musicasAprender.map(card => (
          <StitchCard
            key={card.id}
            id={card.id}
            title={card.title}
            subtitle={card.sub}
            thumbnail={card.thumbnail}
            badgeText={card.quality}
            onClick={handlePlayMusic}
          />
        ))}
      </StitchRail>

      {/* 5. Favoritas */}
      <StitchRail title="Favoritas" icon={<Heart size={20} color="#f43f5e" />} seeAllLink="/musicas">
        {favoritas.map(card => (
          <StitchCard
            key={card.id}
            id={card.id}
            title={card.title}
            subtitle={card.sub}
            thumbnail={card.thumbnail}
            badgeText={card.quality}
            onClick={handlePlayMusic}
          />
        ))}
      </StitchRail>

      {/* 6. Novidades */}
      <StitchRail title="Novidades" icon={<Flame size={20} color="#eab308" />} seeAllLink="/musicas">
        {novidades.map(card => (
          <StitchCard
            key={card.id}
            id={card.id}
            title={card.title}
            subtitle={card.sub}
            thumbnail={card.thumbnail}
            badgeText={card.quality}
            onClick={handlePlayMusic}
          />
        ))}
      </StitchRail>
    </div>
  )
}
