import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Play, ChevronLeft, ChevronRight, Info, Check, Plus, Gamepad2, Music, Volume2, VolumeX } from 'lucide-react'

export interface HeroSlideBadge {
  text: string
  variant?: 'green' | 'gray'
}

export interface HeroSlide {
  id: string
  title: string
  description: string
  bannerImage: string
  evidence?: string // Ex: "Incluído na sua assinatura Com Deus Kids"
  attributes?: string[] // Ex: ["Filme 3D", "Livre", "HD"]
  badges?: HeroSlideBadge[]
  metadata?: string
  primaryActionText?: string
  primaryActionIcon?: React.ReactNode
  onPrimaryAction?: () => void
  secondaryActionText?: string
  secondaryActionIcon?: React.ReactNode
  onSecondaryAction?: () => void
}

export interface HeroCarouselProps {
  slides: HeroSlide[]
  autoplayInterval?: number // em ms, padrão 7000ms (7s)
  ctaType?: 'video' | 'series' | 'music' | 'game'
  className?: string
}

export default function HeroCarousel({
  slides,
  autoplayInterval = 7000,
  ctaType = 'video',
  className = ''
}: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const touchStartXRef = useRef<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const count = slides.length

  const getDefaultPrimaryIcon = () => {
    switch (ctaType) {
      case 'game':
        return <Gamepad2 size={18} color="#052e16" />
      case 'music':
        return <Music size={18} color="#052e16" />
      case 'series':
      case 'video':
      default:
        return <Play size={18} fill="#052e16" />
    }
  }

  const getDefaultPrimaryText = () => {
    switch (ctaType) {
      case 'game':
        return 'Jogar agora'
      case 'music':
        return 'Ouvir agora'
      case 'series':
        return 'Assistir 1º episódio'
      case 'video':
      default:
        return 'Assistir agora'
    }
  }

  const nextSlide = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % count)
  }, [count])

  const prevSlide = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + count) % count)
  }, [count])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  // Autoplay inteligente: respeita interação do usuário e reduced motion
  useEffect(() => {
    if (count <= 1 || isPaused) return

    // Respeita prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    timerRef.current = setTimeout(() => {
      nextSlide()
    }, autoplayInterval)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [currentIndex, isPaused, count, autoplayInterval, nextSlide])

  // Suporte a swipe em telas touch/mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX
    setIsPaused(true)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return
    const diffX = touchStartXRef.current - e.changedTouches[0].clientX
    if (Math.abs(diffX) > 40) {
      if (diffX > 0) {
        nextSlide()
      } else {
        prevSlide()
      }
    }
    touchStartXRef.current = null
    setIsPaused(false)
  }

  // Suporte a teclas direcionais (ArrowLeft / ArrowRight) para acessibilidade e TV
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      prevSlide()
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      nextSlide()
    }
  }

  const [isMuted, setIsMuted] = useState(true)

  if (!slides || slides.length === 0) return null

  return (
    <div className={`cdk-billboard-wrapper ${className}`}>
      <div
        className="cdk-billboard-card"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="region"
        aria-roledescription="carrossel de destaques"
        aria-label="Destaques Com Deus Kids"
      >
        {/* Controle de Som / Áudio no Canto Direito (Padrão Netflix Billboard) */}
        <div className="cdk-billboard-controls">
          <button
            type="button"
            data-tv-focus
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation()
              setIsMuted(prev => !prev)
            }}
            className="cdk-billboard-sound-btn cdk-tv-focus"
            aria-label={isMuted ? "Ativar som" : "Desativar som"}
            title={isMuted ? "Ativar som" : "Desativar som"}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>

        {/* Camadas de Slides (GPU-accelerated opacity transition) */}
        {slides.map((slide, idx) => {
          const isActive = idx === currentIndex
          const evidenceText = slide.evidence || slide.badges?.find(b => b.variant === 'green')?.text

          return (
            <div
              key={slide.id}
              className={`cdk-billboard-slide ${isActive ? 'active' : ''}`}
              aria-hidden={!isActive}
            >
              {/* Imagem Backdrop Full Bleed do Billboard */}
              <img
                src={slide.bannerImage}
                alt={slide.title}
                className="cdk-billboard-backdrop"
                loading={idx === 0 ? 'eager' : 'lazy'}
                // @ts-ignore
                fetchpriority={idx === 0 ? 'high' : 'auto'}
              />

              {/* Regra Global: Universal Media Hero Overlay (esquerda escura + base fundindo) */}
              <div className="cdk-media-overlay" />

              {/* Conteúdo Protegido (Evidence, Título, Atributos, Sinopse, Ações) */}
              <div className="cdk-billboard-content">
                {/* 1. Evidence Badge / Chave do Destaque (ex: "Incluído na sua assinatura" / "Destaque Oficial") */}
                {evidenceText && (
                  <div className="cdk-billboard-evidence">
                    <span className="cdk-evidence-text">{evidenceText}</span>
                  </div>
                )}

                {/* 2. Título Principal em Baloo 2 */}
                <h1 className="cdk-hero-title">{slide.title}</h1>

                {/* 3. Atributos Separados por Bullet (•) + Selo de Classificação Indicativa Livre */}
                <div className="cdk-billboard-attributes">
                  {slide.attributes && slide.attributes.length > 0 ? (
                    slide.attributes.map((attr, i) => (
                      <React.Fragment key={i}>
                        <span className="cdk-attr-tag">{attr}</span>
                        {i < slide.attributes!.length - 1 && (
                          <span className="cdk-attr-dot" aria-hidden="true">•</span>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    slide.badges && slide.badges.length > 0 ? (
                      slide.badges
                        .filter(b => b.text !== evidenceText)
                        .map((b, i, arr) => (
                          <React.Fragment key={i}>
                            <span className="cdk-attr-tag">{b.text}</span>
                            {i < arr.length - 1 && (
                              <span className="cdk-attr-dot" aria-hidden="true">•</span>
                            )}
                          </React.Fragment>
                        ))
                    ) : null
                  )}
                  {/* Selo oficial de Classificação Livre (Verde com "L") */}
                  <span className="cdk-attr-dot" aria-hidden="true">•</span>
                  <span className="cdk-maturity-badge" title="Classificação indicativa: Livre para todas as idades">
                    L
                  </span>
                </div>

                {/* 4. Sinopse do Destaque */}
                <div className="cdk-billboard-metadata">
                  <p className="cdk-hero-desc">{slide.description}</p>
                </div>

                {/* 5. Linha de Ações (Assistir / Jogar / Ouvir + Mais informações) */}
                <div className="cdk-hero-actions">
                  <button
                    type="button"
                    data-tv-focus
                    tabIndex={isActive ? 0 : -1}
                    onClick={slide.onPrimaryAction}
                    className="cdk-btn-watch-green cdk-tv-focus"
                    aria-label={`${slide.primaryActionText || getDefaultPrimaryText()}: ${slide.title}`}
                  >
                    {slide.primaryActionIcon || getDefaultPrimaryIcon()}
                    {slide.primaryActionText || getDefaultPrimaryText()}
                  </button>

                  {slide.secondaryActionText && (
                    <button
                      type="button"
                      data-tv-focus
                      tabIndex={isActive ? 0 : -1}
                      onClick={slide.onSecondaryAction}
                      className="cdk-btn-glass cdk-tv-focus"
                      aria-label={`${slide.secondaryActionText}: ${slide.title}`}
                    >
                      {slide.secondaryActionIcon || <Info size={18} />}
                      {slide.secondaryActionText}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {/* Botão Anterior Discreto */}
        {count > 1 && (
          <button
            type="button"
            data-tv-focus
            tabIndex={0}
            onClick={prevSlide}
            className="cdk-carousel-nav-btn cdk-carousel-nav-prev cdk-tv-focus"
            title="Destaque anterior"
            aria-label="Destaque anterior"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Botão Próximo Discreto */}
        {count > 1 && (
          <button
            type="button"
            data-tv-focus
            tabIndex={0}
            onClick={nextSlide}
            className="cdk-carousel-nav-btn cdk-carousel-nav-next cdk-tv-focus"
            title="Próximo destaque"
            aria-label="Próximo destaque"
          >
            <ChevronRight size={24} />
          </button>
        )}

        {/* Indicadores Discretos: ● ○ ○ ○ */}
        {count > 1 && (
          <div className="cdk-carousel-indicators" role="tablist" aria-label="Slides do carrossel">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                data-tv-focus
                tabIndex={0}
                role="tab"
                aria-selected={idx === currentIndex}
                onClick={() => goToSlide(idx)}
                className={`cdk-carousel-dot cdk-tv-focus ${idx === currentIndex ? 'active' : ''}`}
                title={`Ver destaque ${idx + 1}: ${s.title}`}
                aria-label={`Ver destaque ${idx + 1}: ${s.title}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
