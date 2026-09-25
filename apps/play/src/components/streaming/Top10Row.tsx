import React from 'react'
import { Flame } from 'lucide-react'
import { StreamContent } from '@comdeuskids/types'
import CarouselScrollContainer from './CarouselScrollContainer'

export interface Top10Item {
  rank: number
  content: StreamContent
  tag: string
}

export interface Top10RowProps {
  title?: string
  items: Top10Item[]
  onSelect: (content: StreamContent) => void
}

export default function Top10Row({
  title = 'Top 10 para você',
  items,
  onSelect
}: Top10RowProps) {
  if (!items || items.length === 0) return null

  return (
    <section style={{
      marginTop: 34,
      maxWidth: 1720,
      margin: '34px auto 0',
      padding: '0 clamp(20px, 3.5vw, 48px)',
      boxSizing: 'border-box'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <Flame size={20} color="#ffb95f" />
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>
          {title}
        </h2>
      </div>

      <CarouselScrollContainer>
        {items.map(item => (
          <div
            key={item.rank}
            className="cdk-top10-card"
            onClick={() => onSelect(item.content)}
            style={{
              flex: '0 0 240px',
              height: 280,
              position: 'relative',
              display: 'flex',
              alignItems: 'flex-end',
              cursor: 'pointer',
              paddingLeft: 10
            }}
          >
            {/* Número Gigante Metálico Translúcido */}
            <span style={{
              position: 'absolute',
              left: -6,
              bottom: -8,
              fontSize: 155,
              fontWeight: 800,
              lineHeight: 1,
              userSelect: 'none',
              background: 'linear-gradient(to top, rgba(208, 188, 255, 0.9) 0%, rgba(208, 188, 255, 0.25) 50%, transparent 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              zIndex: 1,
              filter: 'drop-shadow(0 6px 14px rgba(160, 120, 255, 0.35))'
            }}>
              {item.rank}
            </span>

            {/* Poster 2:3 colocado à frente */}
            <div className="cdk-top10-poster" style={{
              position: 'relative',
              zIndex: 2,
              marginLeft: 'auto',
              width: 170,
              height: 250,
              borderRadius: 16,
              overflow: 'hidden',
              backgroundColor: '#201f21',
              boxShadow: '0 14px 32px rgba(0, 0, 0, 0.7)',
              transition: 'transform 0.25s cubic-bezier(0.2, 0, 0.1, 1), box-shadow 0.25s ease, border-color 0.25s ease'
            }}>
              <img
                src={item.content.thumbnail_url || '/posters/davi_vertical.png'}
                alt={item.content.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                loading="lazy"
              />

              <span style={{
                position: 'absolute',
                top: 8,
                left: 8,
                padding: '3px 8px',
                borderRadius: 6,
                backgroundColor: item.rank <= 3 ? '#22c55e' : 'rgba(19, 19, 21, 0.85)',
                color: item.rank <= 3 ? '#052e16' : '#ffffff',
                fontSize: 10,
                fontWeight: 800,
                textTransform: 'uppercase'
              }}>
                {item.tag}
              </span>
            </div>
          </div>
        ))}
      </CarouselScrollContainer>
    </section>
  )
}
