import React from 'react'
import { Play } from 'lucide-react'

export interface StitchCardProps {
  id: string
  title: string
  subtitle?: string
  thumbnail: string
  progress?: number
  badgeText?: string
  badgeVariant?: 'hd' | '3d' | 'game' | 'green'
  playButtonColor?: 'yellow' | 'green'
  onClick: (id: string) => void
  priority?: boolean
}

export default function StitchCard({
  id,
  title,
  subtitle,
  thumbnail,
  progress,
  badgeText,
  badgeVariant = 'hd',
  playButtonColor = 'yellow',
  onClick,
  priority = false
}: StitchCardProps) {
  const isGreenPlay = playButtonColor === 'green'

  return (
    <button
      type="button"
      data-tv-focus
      tabIndex={0}
      onClick={() => onClick(id)}
      className="cdk-stitch-card cdk-tv-focus"
      aria-label={`${title}${subtitle ? ` - ${subtitle}` : ''}`}
    >
      <div className="cdk-card-media">
        <img
          src={thumbnail}
          alt={title}
          className="cdk-card-img"
          loading={priority ? 'eager' : 'lazy'}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/banners/arca_noe_banner.jpg'
          }}
        />

        {/* Circular Play Button */}
        <div
          className="cdk-card-play-btn"
          style={isGreenPlay ? { borderColor: '#22c55e', color: '#22c55e' } : undefined}
        >
          <Play size={15} fill={isGreenPlay ? '#22c55e' : '#eab308'} />
        </div>

        {/* Quality / Type Badge */}
        {badgeText && (
          <div
            className="cdk-card-quality-badge"
            style={
              badgeVariant === 'game'
                ? { background: '#052e16', color: '#4ade80', fontWeight: 800 }
                : undefined
            }
          >
            {badgeText}
          </div>
        )}

        {/* Progress bar if present */}
        {typeof progress === 'number' && progress > 0 && (
          <div className="cdk-card-progress-track">
            <div className="cdk-card-progress-bar" style={{ width: `${Math.min(100, progress)}%` }} />
          </div>
        )}
      </div>

      <span className="cdk-card-title">{title}</span>
      {subtitle && <span className="cdk-card-sub">{subtitle}</span>}
    </button>
  )
}
