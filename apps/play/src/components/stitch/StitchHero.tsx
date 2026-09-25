import React from 'react'
import { Play } from 'lucide-react'

export interface StitchHeroBadge {
  text: string
  variant?: 'green' | 'gray'
}

export interface StitchHeroProps {
  title: string
  description: string
  bannerImage: string
  badges?: StitchHeroBadge[]
  primaryActionText?: string
  primaryActionIcon?: React.ReactNode
  onPrimaryAction: () => void
  secondaryActionText?: string
  secondaryActionIcon?: React.ReactNode
  onSecondaryAction?: () => void
}

export default function StitchHero({
  title,
  description,
  bannerImage,
  badges,
  primaryActionText = 'Assistir agora',
  primaryActionIcon = <Play size={18} fill="#052e16" />,
  onPrimaryAction,
  secondaryActionText,
  secondaryActionIcon,
  onSecondaryAction
}: StitchHeroProps) {
  return (
    <div className="cdk-billboard-wrapper">
      <section className="cdk-billboard-card">
        <img
          src={bannerImage}
          alt={title}
          className="cdk-billboard-backdrop"
          loading="eager"
        />
        <div className="cdk-media-overlay" />
        <div className="cdk-billboard-content">
        <h1 className="cdk-hero-title">{title}</h1>

        {badges && badges.length > 0 && (
          <div className="cdk-hero-badges">
            {badges.map((b, i) => (
              <span
                key={i}
                className={b.variant === 'green' ? 'cdk-hero-badge-green' : 'cdk-hero-badge-gray'}
              >
                {b.text}
              </span>
            ))}
          </div>
        )}

        <p className="cdk-hero-desc">{description}</p>

        <div className="cdk-hero-actions">
          <button
            type="button"
            data-tv-focus
            tabIndex={0}
            onClick={onPrimaryAction}
            className="cdk-btn-watch-green cdk-tv-focus"
          >
            {primaryActionIcon}
            {primaryActionText}
          </button>

          {secondaryActionText && onSecondaryAction && (
            <button
              type="button"
              data-tv-focus
              tabIndex={0}
              onClick={onSecondaryAction}
              className="cdk-btn-glass cdk-tv-focus"
            >
              {secondaryActionIcon}
              {secondaryActionText}
            </button>
          )}
        </div>
      </div>
    </section>
  </div>
  )
}

