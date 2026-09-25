import React from 'react'
import { Play, Plus, Check, Info, Star, Sparkles, Bell } from 'lucide-react'
import { StreamContent } from '@comdeuskids/types'

export interface StreamHeroProps {
  content: StreamContent
  badgeText: string
  badgeColor?: string
  badgeTextColor?: string
  title?: string
  description?: string
  metaTags?: string[]
  ratingPercent?: number
  bannerImg?: string
  isUpcoming?: boolean
  upcomingDateText?: string
  onPlay: (content: StreamContent) => void
  onMoreInfo: (content: StreamContent) => void
  isInList: boolean
  onToggleList: (id: string) => void
  onNotify?: (id: string) => void
}

export default function StreamHero({
  content,
  badgeText,
  badgeColor = 'rgba(238, 152, 0, 0.35)',
  badgeTextColor = '#ffb95f',
  title,
  description,
  metaTags = ['2026', 'LIVRE', 'Série Original', '4K HDR'],
  ratingPercent = 98,
  bannerImg,
  isUpcoming = false,
  upcomingDateText = 'Nova Temporada • Em 27 de Junho',
  onPlay,
  onMoreInfo,
  isInList,
  onToggleList,
  onNotify
}: StreamHeroProps) {
  const displayTitle = title || content.title
  const displayDesc = description || content.description
  const displayImg = bannerImg || content.banner_url || content.thumbnail_url || '/banners/arca_noe_banner.jpg'

  return (
    <section style={{
      position: 'relative',
      width: '100%',
      marginTop: 0,
      padding: 'clamp(64px, 7vh, 88px) clamp(16px, 2.5vw, 40px) 0',
      marginBottom: 0,
      boxSizing: 'border-box'
    }}>
      <div
        className="cdk-stream-hero-frame"
        style={{
        position: 'relative',
        width: '100%',
        height: 'clamp(420px, calc(100vh - 140px), 680px)',
        minHeight: 420,
        maxHeight: 680,
        overflow: 'hidden',
        borderRadius: 'clamp(18px, 2vw, 30px)',
        borderTop: '1px solid rgba(208, 188, 255, 0.52)',
        backgroundColor: '#0b0b0d',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end'
        }}
      >
        {/* Imagem de Fundo Widescreen */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${displayImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
          transform: 'scale(1.02)'
        }} />

        {/* Gradientes Atmosféricos de Fusão Cinematográfica - Fundo funde para #0c0d10 */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, #0c0d10 0%, rgba(12, 13, 16, 0.96) 18%, rgba(12, 13, 16, 0.52) 48%, transparent 82%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, rgba(12, 13, 16, 0.95) 0%, rgba(12, 13, 16, 0.6) 45%, transparent 85%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 100,
          background: 'linear-gradient(to bottom, rgba(12, 13, 16, 0.7) 0%, transparent 100%)',
          pointerEvents: 'none'
        }} />

        {/* Conteúdo Sobreposto do Hero Alinhado aos Trilhos */}
        <div style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: 1720,
          width: '100%',
          margin: '0 auto',
          padding: '0 clamp(20px, 3.5vw, 48px) clamp(32px, 5vh, 58px)',
          boxSizing: 'border-box'
        }}>
          <div style={{
            maxWidth: 780,
            display: 'flex',
            flexDirection: 'column',
            gap: 10
          }}>
          {/* Badge de Destaque */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
              borderRadius: 9999,
              backgroundColor: badgeColor,
              color: badgeTextColor,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <Sparkles size={13} color={badgeTextColor} />
              {badgeText}
            </span>
          </div>

          {/* Título Grande */}
          <h1 style={{
            fontSize: 'clamp(32px, 4.2vw, 50px)',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.02em',
            lineHeight: 1.05,
            margin: '2px 0 0',
            textShadow: '0 4px 24px rgba(0, 0, 0, 0.95)'
          }}>
            {displayTitle}
          </h1>

          {/* Faixa de Metadados */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
            fontSize: 12,
            color: '#cbc3d7'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#ffb95f', fontWeight: 800 }}>
              <Star size={13} fill="#ffb95f" color="#ffb95f" />
              {ratingPercent}% Recomendado
            </span>
            {metaTags.map((tag, idx) => (
              <React.Fragment key={tag}>
                <span style={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: '#494454' }} />
                <span style={idx === 1 ? {
                  backgroundColor: 'rgba(34, 197, 94, 0.25)',
                  color: '#4ade80',
                  padding: '2px 6px',
                  borderRadius: 4,
                  fontWeight: 800,
                  fontSize: 10
                } : idx === 3 ? {
                  backgroundColor: 'rgba(53, 52, 55, 0.75)',
                  color: '#e9ddff',
                  padding: '2px 6px',
                  borderRadius: 4,
                  fontWeight: 800,
                  fontSize: 10
                } : {}}>
                  {tag}
                </span>
              </React.Fragment>
            ))}
          </div>

          {/* Sinopse Curta */}
          <p style={{
            fontSize: 14,
            lineHeight: 1.45,
            color: '#cbc3d7',
            maxWidth: 620,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)'
          }}>
            {displayDesc}
          </p>

          {/* Botões de Ação */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 6, flexWrap: 'wrap' }}>
            {!isUpcoming ? (
              <button
                type="button"
                onClick={() => onPlay(content)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 30px',
                  borderRadius: 9999,
                  backgroundColor: '#ffffff',
                  color: '#0e0e10',
                  fontSize: 14,
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(255, 255, 255, 0.3)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
              >
                <Play size={18} fill="#0e0e10" />
                <span>ASSISTIR</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onNotify && onNotify(content.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 26px',
                  borderRadius: 9999,
                  backgroundColor: '#ffffff',
                  color: '#0e0e10',
                  fontSize: 14,
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(255, 255, 255, 0.3)'
                }}
              >
                <Bell size={18} />
                <span>AVISE-ME</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onToggleList(content.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 24px',
                borderRadius: 9999,
                backgroundColor: isInList ? '#22c55e' : 'rgba(38, 38, 42, 0.85)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                color: isInList ? '#052e16' : '#ffffff',
                fontSize: 14,
                fontWeight: 700,
                border: '1px solid rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {isInList ? <Check size={17} /> : <Plus size={17} />}
              <span>{isInList ? 'Na Minha Lista' : 'Minha Lista'}</span>
            </button>

            <button
              type="button"
              onClick={() => onMoreInfo(content)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 22px',
                borderRadius: 9999,
                backgroundColor: 'rgba(38, 38, 42, 0.85)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                color: '#ffffff',
                fontSize: 14,
                fontWeight: 700,
                border: '1px solid rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="Mais informações"
            >
              <Info size={17} />
              <span>Mais Informações</span>
            </button>
          </div>
        </div>
      </div>

        {/* Badge 'Em Breve' / Data no Canto Inferior Direito */}
        {isUpcoming && upcomingDateText && (
          <div style={{
            position: 'absolute',
            bottom: 22,
            right: 28,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: 'rgba(14, 14, 18, 0.88)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            padding: '7px 16px',
            borderRadius: 9999,
            fontSize: 12,
            fontWeight: 800,
            color: '#ffb95f',
            boxShadow: '0 4px 16px rgba(0,0,0,0.6)'
          }}>
            <span>📅</span>
            <span>{upcomingDateText}</span>
          </div>
        )}
      </div>
    </section>
  )
}
