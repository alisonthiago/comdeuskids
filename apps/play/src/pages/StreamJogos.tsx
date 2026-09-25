import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Gamepad2, Play, Sparkles, Brain, Palette, Layers, Compass } from 'lucide-react'
import HeroCarousel, { HeroSlide } from '../components/stitch/HeroCarousel'
import StitchRail from '../components/stitch/StitchRail'
import StitchCard from '../components/stitch/StitchCard'
import StitchPills from '../components/stitch/StitchPills'
import { BIBLICAL_GAMES_CATALOG } from '../games/data/gamesCatalog'

export default function StreamJogos() {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState('todos')

  const filterPills = [
    { id: 'todos', label: '🎮 Todos' },
    { id: 'biblia', label: '📖 Bíblia' },
    { id: 'memoria', label: '🧠 Memória' },
    { id: 'raciocinio', label: '🧩 Raciocínio' },
    { id: 'colorir', label: '🎨 Colorir' }
  ]

  // Lista dos Jogos Oficiais Formatados com miniaturas 16:9 de Alta Definição
  const allGames = useMemo(() => [
    {
      id: 'memoria-biblica',
      slug: 'memoria-biblica',
      title: 'Memória Bíblica',
      sub: 'Personagens e Elementos Bíblicos • 4-8 anos',
      thumbnail: '/thumbnails/card_game_memoria.jpg',
      category: 'memoria',
      quality: 'JOGO',
      difficulty: 'Fácil',
      featured: true
    },
    {
      id: 'quebra-cabeca',
      slug: 'quebra-cabeca',
      title: 'Quebra-Cabeça',
      sub: 'Monte Cenas da Arca de Noé • 3-6 anos',
      thumbnail: '/thumbnails/card_game_quebracabeca.jpg',
      category: 'raciocinio',
      quality: 'JOGO',
      difficulty: 'Interativo',
      featured: true
    },
    {
      id: 'colorir',
      slug: 'colorir',
      title: 'Colorir',
      sub: 'Pinte Desenhos Bíblicos na Tela • Livre',
      thumbnail: '/thumbnails/card_game_colorir.jpg',
      category: 'colorir',
      quality: 'JOGO',
      difficulty: 'Criativo',
      featured: true
    },
    {
      id: 'game-zaqueu',
      slug: 'zaqueu',
      title: 'Zaqueu — O Encontro',
      sub: 'Aventura 3D em Jericó • 6-8 anos',
      thumbnail: '/banners/jogos_hero_kids.jpg',
      category: 'biblia',
      quality: 'JOGO',
      difficulty: 'Médio',
      featured: false
    },
    {
      id: 'game-ovelha',
      slug: 'a-ovelha-perdida',
      title: 'A Ovelha Perdida',
      sub: 'Resgate com o Bom Pastor • 5-8 anos',
      thumbnail: '/banners/hero_davi_golias.jpg',
      category: 'biblia',
      quality: 'JOGO',
      difficulty: 'Fácil',
      featured: false
    },
    {
      id: 'game-arca-montar',
      slug: 'construa-a-arca',
      title: 'Construa a Arca',
      sub: 'Encaixe de Madeira com Noé • 3-5 anos',
      thumbnail: '/thumbnails/card_noe.jpg',
      category: 'raciocinio',
      quality: 'JOGO',
      difficulty: 'Fácil',
      featured: false
    }
  ], [])

  // Filtragem dinâmica por Pill
  const filteredGames = useMemo(() => {
    if (activeFilter === 'todos') return allGames
    return allGames.filter(g => g.category === activeFilter)
  }, [allGames, activeFilter])

  const memoriaGames = useMemo(() => allGames.filter(g => g.category === 'memoria' || g.id === 'memoria-biblica'), [allGames])
  const raciocinioGames = useMemo(() => allGames.filter(g => g.category === 'raciocinio'), [allGames])
  const criativosGames = useMemo(() => allGames.filter(g => g.category === 'colorir' || g.category === 'biblia'), [allGames])

  const handleOpenGame = (gameId: string) => {
    const found = allGames.find(g => g.id === gameId)
    if (found) {
      navigate(`/jogos/${found.slug}`)
    } else {
      navigate(`/jogos/${gameId}`)
    }
  }

  // 1 Destaque Fixo Oficial de Jogos (Sem rotação de slides)
  const gamesHeroSlides: HeroSlide[] = useMemo(() => [
    {
      id: 'jogos-turminha',
      title: 'Jogos da Turminha Com Deus Kids',
      evidence: 'Jogo incluído na sua assinatura',
      attributes: ['Jogo Bíblico', 'Grupos', '1-4 jogadores', 'Mais de 10 minutos'],
      description: 'Aprender também é divertido! Embarque em aventuras bíblicas, desafios de raciocínio, memória e arte com a turminha.',
      bannerImage: '/banners/jogos_hero_kids.jpg',
      primaryActionText: 'Jogar agora',
      onPrimaryAction: () => handleOpenGame('memoria-biblica'),
      secondaryActionText: 'Mais informações',
      onSecondaryAction: () => handleOpenGame('quebra-cabeca')
    }
  ], [])

  return (
    <div className="cdk-stream-container" style={{ position: 'relative' }}>
      {/* Hero Carousel com Destaques de Jogos */}
      <HeroCarousel slides={gamesHeroSlides} ctaType="game" />

      {/* Pílulas de Filtros da Categoria */}
      <StitchPills items={filterPills} activeId={activeFilter} onChange={setActiveFilter} />

      {/* Trilho Principal: Todos os Jogos ou Filtrados */}
      <StitchRail
        title={activeFilter === 'todos' ? 'Destaques para Brincar e Aprender' : `Jogos de ${filterPills.find(p => p.id === activeFilter)?.label || 'Bíblia'}`}
        icon={<Gamepad2 size={22} color="#22c55e" />}
      >
        {filteredGames.map(game => (
          <StitchCard
            key={game.id}
            id={game.id}
            title={game.title}
            subtitle={game.sub}
            thumbnail={game.thumbnail}
            badgeText={game.quality}
            badgeVariant="game"
            playButtonColor="green"
            onClick={handleOpenGame}
          />
        ))}
      </StitchRail>

      {/* Trilho: Memória e Desafios Bíblicos */}
      {activeFilter === 'todos' && (
        <StitchRail title="Memória & Concentração" icon={<Brain size={20} color="#22c55e" />}>
          {memoriaGames.map(game => (
            <StitchCard
              key={`mem-${game.id}`}
              id={game.id}
              title={game.title}
              subtitle={game.sub}
              thumbnail={game.thumbnail}
              badgeText={game.quality}
              badgeVariant="game"
              playButtonColor="green"
              onClick={handleOpenGame}
            />
          ))}
        </StitchRail>
      )}

      {/* Trilho: Raciocínio & Quebra-Cabeças */}
      {activeFilter === 'todos' && (
        <StitchRail title="Raciocínio & Construção" icon={<Layers size={20} color="#f59e0b" />}>
          {raciocinioGames.map(game => (
            <StitchCard
              key={`rac-${game.id}`}
              id={game.id}
              title={game.title}
              subtitle={game.sub}
              thumbnail={game.thumbnail}
              badgeText={game.quality}
              badgeVariant="game"
              playButtonColor="green"
              onClick={handleOpenGame}
            />
          ))}
        </StitchRail>
      )}

      {/* Trilho: Pintura, Arte & Histórias */}
      {activeFilter === 'todos' && (
        <StitchRail title="Colorir & Histórias da Bíblia" icon={<Palette size={20} color="#38bdf8" />}>
          {criativosGames.map(game => (
            <StitchCard
              key={`col-${game.id}`}
              id={game.id}
              title={game.title}
              subtitle={game.sub}
              thumbnail={game.thumbnail}
              badgeText={game.quality}
              badgeVariant="game"
              playButtonColor="green"
              onClick={handleOpenGame}
            />
          ))}
        </StitchRail>
      )}
    </div>
  )
}
