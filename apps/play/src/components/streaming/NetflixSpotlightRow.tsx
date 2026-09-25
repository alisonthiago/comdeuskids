import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Play, Plus, Check, ChevronRight, Sparkles } from 'lucide-react'
import { StreamContent } from '@comdeuskids/types'
import CarouselScrollContainer from './CarouselScrollContainer'
import StreamMediaCard from './StreamMediaCard'

export interface NetflixSpotlightRowProps {
  title: string
  icon?: React.ReactNode
  seeAllLink?: string
  seeAllText?: string
  spotlightItem: StreamContent
  spotlightBadge?: string
  spotlightSecondaryBadge?: string
  items: StreamContent[]
  onSelect: (item: StreamContent) => void
  onPlay: (item: StreamContent) => void
  isInList: (id: string) => boolean
  onToggleList: (id: string) => void
  isLiked?: (id: string) => boolean
  onToggleLike?: (id: string) => void
}

export default function NetflixSpotlightRow({
  title,
  icon,
  seeAllLink,
  seeAllText = 'Ver tudo',
  spotlightItem,
  spotlightBadge = 'NOVA TEMPORADA',
  spotlightSecondaryBadge = '#1 EM DESTAQUE',
  items,
  onSelect,
  onPlay,
  isInList,
  onToggleList,
  isLiked,
  onToggleLike
}: NetflixSpotlightRowProps) {
  const [currentSpotlight, setCurrentSpotlight] = useState<StreamContent>(spotlightItem)
  const [isSpotlightHovered, setIsSpotlightHovered] = useState(false)

  // Sincroniza se a prop mudar
  React.useEffect(() => {
    setCurrentSpotlight(spotlightItem)
  }, [spotlightItem])

  const spotlightImg = currentSpotlight.banner_url || currentSpotlight.thumbnail_url || '/banners/arca_noe_banner.jpg'
  const inList = isInList(currentSpotlight.id)

  return (
    <section style={{
      marginTop: 34,
      maxWidth: 1720,
      margin: '34px auto 0',
      padding: '0 clamp(20px, 3.5vw, 48px)',
      boxSizing: 'border-box'
    }}>
      {/* Cabeçalho da Linha */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {icon}
          <h2 style={{
            fontSize: 'clamp(18px, 1.6vw, 22px)',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.01em'
          }}>
            {title}
          </h2>
        </div>
        {seeAllLink && (
          <Link
            to={seeAllLink}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              color: '#22c55e',
              fontSize: 13,
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'color 0.2s'
            }}
          >
            {seeAllText} <ChevronRight size={14} />
          </Link>
        )}
      </div>

      {/* Grid Híbrido Estilo Netflix: Cartão Destaque 16:9 Expandido + Carrossel de Cartazes 2:3 */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 18,
        width: '100%',
        overflowX: 'hidden'
      }}>
        {/* 1. CARTÃO EXPANDIDO EM DESTAQUE (16:9 + Sinopse abaixo) */}
        <div
          onClick={() => onSelect(currentSpotlight)}
          onMouseEnter={() => setIsSpotlightHovered(true)}
          onMouseLeave={() => setIsSpotlightHovered(false)}
          style={{
            flex: '0 0 clamp(320px, 28vw, 440px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            cursor: 'pointer',
            transition: 'transform 0.22s cubic-bezier(0.2, 0, 0.1, 1)',
            transform: isSpotlightHovered ? 'scale(1.02)' : 'none',
            zIndex: 10
          }}
        >
          {/* Imagem 16:9 com Moldura e Badges */}
          <div style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16 / 9',
            borderRadius: 16,
            overflow: 'hidden',
            backgroundColor: '#1b1b1e',
            border: isSpotlightHovered ? '1px solid rgba(34, 197, 94, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: isSpotlightHovered
              ? '0 16px 36px rgba(0, 0, 0, 0.8), 0 0 24px rgba(34, 197, 94, 0.3)'
              : '0 8px 24px rgba(0, 0, 0, 0.55)',
            transition: 'all 0.22s ease'
          }}>
            <img
              src={spotlightImg}
              alt={currentSpotlight.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: isSpotlightHovered ? 'scale(1.05)' : 'none',
                transition: 'transform 0.4s ease'
              }}
              loading="lazy"
            />

            {/* Vinheta Escura Inferior */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(14, 14, 16, 0.92) 0%, rgba(14, 14, 16, 0.3) 50%, transparent 80%)'
            }} />

            {/* Título Sobreposto no Banner */}
            <div style={{
              position: 'absolute',
              bottom: 12,
              left: 14,
              right: 14,
              zIndex: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 4
            }}>
              <span style={{
                fontSize: 'clamp(16px, 1.5vw, 20px)',
                fontWeight: 800,
                color: '#ffffff',
                textShadow: '0 2px 8px rgba(0,0,0,0.9)',
                lineHeight: 1.15
              }}>
                {currentSpotlight.title}
              </span>
            </div>

            {/* Badges Flutuantes Estilo Netflix */}
            <div style={{
              position: 'absolute',
              bottom: 44,
              left: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              zIndex: 3
            }}>
              {spotlightBadge && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  backgroundColor: 'rgba(238, 152, 0, 0.95)',
                  color: '#ffffff',
                  fontSize: 10,
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: 6,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
                }}>
                  <Sparkles size={11} fill="#ffffff" />
                  {spotlightBadge}
                </span>
              )}
              {spotlightSecondaryBadge && (
                <span style={{
                  backgroundColor: 'rgba(34, 197, 94, 0.92)',
                  color: '#052e16',
                  fontSize: 10,
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: 6,
                  textTransform: 'uppercase'
                }}>
                  {spotlightSecondaryBadge}
                </span>
              )}
            </div>

            {/* Botão Play Flutuante no Hover */}
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isSpotlightHovered ? 1 : 0,
              transition: 'opacity 0.2s ease',
              backgroundColor: 'rgba(0, 0, 0, 0.35)',
              backdropFilter: 'blur(3px)',
              zIndex: 4
            }}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onPlay(currentSpotlight)
                }}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  border: 'none',
                  color: '#0e0e10',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(255, 255, 255, 0.35)'
                }}
              >
                <Play size={24} fill="#0e0e10" />
              </button>
            </div>
          </div>

          {/* Metadados e Sinopse Abaixo do Card (Assinatura Netflix) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '0 4px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              fontWeight: 700,
              color: '#22c55e'
            }}>
              <span>{currentSpotlight.category || 'Animação Bíblica'}</span>
              <span style={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: '#625b71' }} />
              <span>{(currentSpotlight as any).release_year || '2026'}</span>
              <span style={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: '#625b71' }} />
              <span style={{
                backgroundColor: 'rgba(34, 197, 94, 0.25)',
                color: '#4ade80',
                padding: '1px 6px',
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 800
              }}>
                {currentSpotlight.age_range || 'LIVRE'}
              </span>
              <span style={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: '#625b71' }} />
              <span style={{ color: '#cbc3d7', fontSize: 11 }}>
                {currentSpotlight.type === 'series'
                  ? `${currentSpotlight.season_count || 2} Temporadas`
                  : `${currentSpotlight.duration_minutes || 45}m`}
              </span>
            </div>

            <p style={{
              fontSize: 13,
              lineHeight: 1.45,
              color: '#cbc3d7',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              margin: 0
            }}>
              {currentSpotlight.description}
            </p>
          </div>
        </div>

        {/* 2. CARROSSEL DE CARTAZES 2:3 AO LADO DO DESTAQUE */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <CarouselScrollContainer scrollStep={540}>
            {items.map(item => (
              <div
                key={item.id}
                onMouseEnter={() => setCurrentSpotlight(item)}
                style={{ display: 'contents' }}
              >
                <StreamMediaCard
                  content={item}
                  aspect="poster"
                  badgeText={item.is_new ? 'NOVO' : undefined}
                  subtitle={item.tags?.[0]}
                  onPlay={onPlay}
                  onSelect={onSelect}
                  isInList={isInList(item.id)}
                  onToggleList={onToggleList}
                  isLiked={isLiked ? isLiked(item.id) : false}
                  onToggleLike={onToggleLike}
                />
              </div>
            ))}
          </CarouselScrollContainer>
        </div>
      </div>
    </section>
  )
}
