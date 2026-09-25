import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Play, Film, Tv, Music, Gamepad2, Compass, Sparkles } from 'lucide-react'
import { useProfile } from '../context/ProfileContext'
import { STREAM_CATALOG } from '../data/streamCatalog'
import StitchRail from '../components/stitch/StitchRail'
import StitchCard from '../components/stitch/StitchCard'
import StitchPills from '../components/stitch/StitchPills'

export default function StreamMinhaLista() {
  const navigate = useNavigate()
  const { myList, activeProfile } = useProfile()
  const [activeCategory, setActiveCategory] = useState<string>('todos')

  const filterPills = [
    { id: 'todos', label: '⭐ Todos' },
    { id: 'videos', label: '🎬 Vídeos e filmes' },
    { id: 'series', label: '📺 Séries' },
    { id: 'musicas', label: '🎵 Músicas' },
    { id: 'jogos', label: '🎮 Jogos' }
  ]

  // Conteúdos salvos mapeados do catálogo
  const savedItems = useMemo(() => {
    // Se o perfil já salvou itens reais, usa esses IDs; caso contrário, provê itens padrão salvos
    const ids = (myList && myList.length > 0) ? myList : ['jose-egito', 'arca-de-noe', 'jonas-peixe', 'louvores-coracao']

    const list: Array<{
      id: string
      title: string
      sub: string
      thumbnail: string
      category: 'videos' | 'series' | 'musicas' | 'jogos'
      quality: string
      progress?: number
    }> = []

    // 1. José do Egito (Série)
    if (ids.includes('jose-egito')) {
      list.push({
        id: 'jose-egito',
        title: 'José do Egito',
        sub: 'Série • 10 episódios',
        thumbnail: '/thumbnails/card_jose_egito.jpg',
        category: 'series',
        quality: 'HD',
        progress: 42
      })
    }

    // 2. A Arca de Noé (Série)
    if (ids.includes('arca-de-noe')) {
      list.push({
        id: 'arca-de-noe',
        title: 'A Arca de Noé',
        sub: 'Série • 2 Temporadas',
        thumbnail: '/thumbnails/card_noe.jpg',
        category: 'series',
        quality: 'HD',
        progress: 65
      })
    }

    // 3. Jonas e o Peixe (Filme/Vídeo)
    if (ids.includes('jonas-peixe')) {
      list.push({
        id: 'jonas-peixe',
        title: 'Jonas e o Peixe',
        sub: 'Filme Bíblico • 24 min',
        thumbnail: '/thumbnails/card_jonas_torch.jpg',
        category: 'videos',
        quality: 'HD',
        progress: 88
      })
    }

    // 4. Sansão (Filme)
    if (ids.includes('sansao-forte')) {
      list.push({
        id: 'sansao-forte',
        title: 'Sansão, o Forte',
        sub: 'Filme • 30 min',
        thumbnail: '/thumbnails/card_sansao.jpg',
        category: 'videos',
        quality: '3D'
      })
    }

    // 5. Louvores do Coração (Música)
    if (ids.includes('louvores-coracao') || ids.includes('song-louvores')) {
      list.push({
        id: 'louvores-coracao',
        title: 'Louvores do Coração',
        sub: 'Adoração Infantil',
        thumbnail: '/thumbnails/louvores_coracao.jpg',
        category: 'musicas',
        quality: 'HD'
      })
    }

    // 6. Memória Bíblica (Jogo)
    list.push({
      id: 'memoria-biblica',
      title: 'Memória Bíblica',
      sub: 'Jogo Interativo',
      thumbnail: '/thumbnails/card_game_memoria.jpg',
      category: 'jogos',
      quality: 'JOGO'
    })

    return list
  }, [myList])

  const filteredItems = useMemo(() => {
    if (activeCategory === 'todos') return savedItems
    return savedItems.filter(item => item.category === activeCategory)
  }, [savedItems, activeCategory])

  const videosList = useMemo(() => savedItems.filter(i => i.category === 'videos'), [savedItems])
  const seriesList = useMemo(() => savedItems.filter(i => i.category === 'series'), [savedItems])
  const musicasList = useMemo(() => savedItems.filter(i => i.category === 'musicas'), [savedItems])
  const jogosList = useMemo(() => savedItems.filter(i => i.category === 'jogos'), [savedItems])

  const handleOpenItem = (id: string) => {
    if (id === 'memoria-biblica' || id === 'quebra-cabeca' || id === 'colorir') {
      navigate(`/jogos/${id}`)
    } else {
      navigate(`/assistir/${id}`)
    }
  }

  const isEmpty = savedItems.length === 0

  return (
    <div style={{ width: '100%', position: 'relative', overflowX: 'hidden', paddingBottom: 60 }}>
      {/* Header da Página Minha Lista */}
      <div style={{
        padding: '36px clamp(24px, 5vw, 64px) 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1.5px solid rgba(239, 68, 68, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f87171'
          }}>
            <Heart size={24} fill="#f87171" />
          </div>
          <div>
            <h1 style={{
              fontSize: 'clamp(28px, 3.5vw, 42px)',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              margin: 0
            }}>
              Minha Lista
            </h1>
            <p style={{ fontSize: 14, color: '#94a3b8', margin: '4px 0 0', fontWeight: 500 }}>
              {activeProfile ? `Histórias, músicas e jogos favoritos de ${activeProfile.name}` : 'Histórias e louvores salvos no seu perfil'}
            </p>
          </div>
        </div>
      </div>

      {/* Se não houver itens salvos, exibe o Empty State Acolhedor */}
      {isEmpty ? (
        <div style={{
          padding: '60px clamp(24px, 5vw, 64px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: 18,
          minHeight: '45vh'
        }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: 'rgba(34, 197, 94, 0.12)',
            border: '2px solid rgba(34, 197, 94, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#22c55e',
            boxShadow: '0 0 32px rgba(34, 197, 94, 0.2)'
          }}>
            <Sparkles size={38} />
          </div>

          <div style={{ maxWidth: 440 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', marginBottom: 8 }}>
              Sua lista ainda está vazia
            </h2>
            <p style={{ fontSize: 15, color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
              Que tal explorar as histórias bíblicas, séries e músicas e salvar suas favoritas para assistir quando quiser?
            </p>
          </div>

          <button
            type="button"
            data-tv-focus
            tabIndex={0}
            onClick={() => navigate('/inicio')}
            className="cdk-btn-watch-green cdk-tv-focus"
            style={{ marginTop: 8 }}
          >
            <Compass size={18} />
            Explorar Histórias
          </button>
        </div>
      ) : (
        <>
          {/* Pílulas de Filtros da Minha Lista */}
          <StitchPills items={filterPills} activeId={activeCategory} onChange={setActiveCategory} />

          {/* Quando uma categoria específica é selecionada */}
          {activeCategory !== 'todos' ? (
            <StitchRail
              title={filterPills.find(p => p.id === activeCategory)?.label || 'Salvos'}
              icon={<Heart size={20} color="#f87171" />}
            >
              {filteredItems.map(item => (
                <StitchCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  subtitle={item.sub}
                  thumbnail={item.thumbnail}
                  progress={item.progress}
                  badgeText={item.quality}
                  badgeVariant={item.category === 'jogos' ? 'game' : 'hd'}
                  playButtonColor={item.category === 'jogos' ? 'green' : 'yellow'}
                  onClick={handleOpenItem}
                />
              ))}
            </StitchRail>
          ) : (
            <>
              {/* Categoria 1: Vídeos e Filmes */}
              {videosList.length > 0 && (
                <StitchRail title="Vídeos e filmes" icon={<Film size={20} color="#38bdf8" />}>
                  {videosList.map(item => (
                    <StitchCard
                      key={item.id}
                      id={item.id}
                      title={item.title}
                      subtitle={item.sub}
                      thumbnail={item.thumbnail}
                      progress={item.progress}
                      badgeText={item.quality}
                      onClick={handleOpenItem}
                    />
                  ))}
                </StitchRail>
              )}

              {/* Categoria 2: Séries */}
              {seriesList.length > 0 && (
                <StitchRail title="Séries" icon={<Tv size={20} color="#22c55e" />}>
                  {seriesList.map(item => (
                    <StitchCard
                      key={item.id}
                      id={item.id}
                      title={item.title}
                      subtitle={item.sub}
                      thumbnail={item.thumbnail}
                      progress={item.progress}
                      badgeText={item.quality}
                      onClick={handleOpenItem}
                    />
                  ))}
                </StitchRail>
              )}

              {/* Categoria 3: Músicas */}
              {musicasList.length > 0 && (
                <StitchRail title="Músicas" icon={<Music size={20} color="#f59e0b" />}>
                  {musicasList.map(item => (
                    <StitchCard
                      key={item.id}
                      id={item.id}
                      title={item.title}
                      subtitle={item.sub}
                      thumbnail={item.thumbnail}
                      badgeText={item.quality}
                      onClick={handleOpenItem}
                    />
                  ))}
                </StitchRail>
              )}

              {/* Categoria 4: Jogos */}
              {jogosList.length > 0 && (
                <StitchRail title="Jogos" icon={<Gamepad2 size={20} color="#22c55e" />}>
                  {jogosList.map(item => (
                    <StitchCard
                      key={item.id}
                      id={item.id}
                      title={item.title}
                      subtitle={item.sub}
                      thumbnail={item.thumbnail}
                      badgeText={item.quality}
                      badgeVariant="game"
                      playButtonColor="green"
                      onClick={handleOpenItem}
                    />
                  ))}
                </StitchRail>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
