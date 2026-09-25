import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { StreamContent } from '@comdeuskids/types'
import CarouselScrollContainer from './CarouselScrollContainer'
import StreamMediaCard from './StreamMediaCard'

export interface ContentRowProps {
  title: string
  icon?: React.ReactNode
  seeAllLink?: string
  seeAllText?: string
  items: StreamContent[]
  aspect?: 'poster' | 'landscape'
  getBadgeText?: (item: StreamContent) => string | undefined
  getBadgeColor?: (item: StreamContent) => string | undefined
  getSubtitle?: (item: StreamContent) => string | undefined
  onSelect: (item: StreamContent) => void
  onPlay: (item: StreamContent) => void
  isInList: (id: string) => boolean
  onToggleList: (id: string) => void
  isLiked?: (id: string) => boolean
  onToggleLike?: (id: string) => void
}

export default function ContentRow({
  title,
  icon,
  seeAllLink,
  seeAllText = 'Ver mais',
  items,
  aspect = 'poster',
  getBadgeText,
  getBadgeColor,
  getSubtitle,
  onSelect,
  onPlay,
  isInList,
  onToggleList,
  isLiked,
  onToggleLike
}: ContentRowProps) {
  if (!items || items.length === 0) return null

  return (
    <section style={{
      marginTop: 34,
      maxWidth: 1720,
      margin: '34px auto 0',
      padding: '0 clamp(20px, 3.5vw, 48px)',
      boxSizing: 'border-box'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {icon}
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>
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
              fontSize: 12,
              fontWeight: 700,
              textDecoration: 'none'
            }}
          >
            {seeAllText} <ChevronRight size={14} />
          </Link>
        )}
      </div>

      <CarouselScrollContainer>
        {items.map(item => (
          <StreamMediaCard
            key={item.id}
            content={item}
            aspect={aspect}
            badgeText={getBadgeText ? getBadgeText(item) : item.is_new ? 'NOVO' : undefined}
            badgeColor={getBadgeColor ? getBadgeColor(item) : undefined}
            subtitle={getSubtitle ? getSubtitle(item) : item.tags?.[0]}
            onPlay={onPlay}
            onSelect={onSelect}
            isInList={isInList(item.id)}
            onToggleList={onToggleList}
            isLiked={isLiked ? isLiked(item.id) : false}
            onToggleLike={onToggleLike}
          />
        ))}
      </CarouselScrollContainer>
    </section>
  )
}
