import React, { useState, useRef, useEffect } from 'react'
import { Play, Plus, Check, ThumbsUp, ChevronDown, Sparkles } from 'lucide-react'
import { StreamContent } from '@comdeuskids/types'

export interface StreamMediaCardProps {
  content: StreamContent
  aspect?: 'poster' | 'landscape'
  badgeText?: string
  badgeColor?: string
  subtitle?: string
  onPlay: (content: StreamContent) => void
  onSelect: (content: StreamContent) => void
  isInList: boolean
  onToggleList: (id: string) => void
  isLiked?: boolean
  onToggleLike?: (id: string) => void
}

/**
 * StreamMediaCard — Com Deus Kids
 * Card de mídia com expansão flutuante no hover (450ms delay).
 * - Não empurra os cards vizinhos (flutua com z-index alto)
 * - Auto-posicionamento para borda esquerda, centro e borda direita (nunca é cortado)
 * - Preview de vídeo/imagem com ações rápidas, metadados e sinopse
 */
export default function StreamMediaCard({
  content,
  aspect = 'poster',
  badgeText,
  badgeColor,
  subtitle,
  onPlay,
  onSelect,
  isInList,
  onToggleList,
  isLiked,
  onToggleLike
}: StreamMediaCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [isHovered, setIsHovered] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [previewVideoFailed, setPreviewVideoFailed] = useState(false)
  const [edgePosition, setEdgePosition] = useState<'left' | 'center' | 'right'>('center')

  const isPoster = aspect === 'poster'
  const cardWidth = isPoster ? 175 : 280
  const imageSrc = isPoster
    ? (content.thumbnail_url || '/posters/davi_vertical.png')
    : (content.banner_url || content.thumbnail_url || '/thumbnails/noe.jpg')

  const handleMouseEnter = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    setIsHovered(true)

    // Detectar posição na tela antes de expandir para não cortar nas bordas
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect()
      const windowWidth = window.innerWidth
      if (rect.left < 110) {
        setEdgePosition('left')
      } else if (windowWidth - rect.right < 110) {
        setEdgePosition('right')
      } else {
        setEdgePosition('center')
      }
    }

    // Delay de aproximadamente 400-450ms antes de expandir
    hoverTimerRef.current = setTimeout(() => {
      setPreviewVideoFailed(false)
      setIsExpanded(true)
    }, 450)
  }

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
    closeTimerRef.current = setTimeout(() => {
      setIsExpanded(false)
      setIsHovered(false)
    }, 140)
  }

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [])

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onSelect(content)}
      style={{
        flex: `0 0 ${cardWidth}px`,
        width: cardWidth,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        cursor: 'pointer',
        position: 'relative',
        zIndex: isExpanded ? 9999 : isHovered ? 20 : 1
      }}
    >
      {/* 1. CARD BASE ESTÁTICO (Mantém o grid e fluxo sem empurrar vizinhos) */}
      <div style={{
        position: 'relative',
        width: '100%',
        aspectRatio: isPoster ? '2 / 3' : '16 / 9',
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#1c1b1d',
        boxShadow: isHovered
          ? '0 12px 28px rgba(0, 0, 0, 0.75)'
          : '0 4px 16px rgba(0, 0, 0, 0.45)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        transform: isHovered && !isExpanded ? 'scale(1.03)' : 'none'
      }}>
        <img
          src={imageSrc}
          alt={content.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          loading="lazy"
        />

        {/* Gradiente inferior */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(14, 14, 16, 0.85) 0%, rgba(14, 14, 16, 0.2) 40%, transparent 80%)'
        }} />

        {/* Badge superior */}
        {badgeText && (
          <span style={{
            position: 'absolute',
            top: 8,
            left: 8,
            backgroundColor: badgeColor || 'rgba(19, 19, 21, 0.85)',
            backdropFilter: 'blur(8px)',
            color: '#ffffff',
            fontSize: 10,
            fontWeight: 800,
            padding: '3px 8px',
            borderRadius: 6,
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            {badgeText}
          </span>
        )}

        {/* Duração / Tipo */}
        <span style={{
          position: 'absolute',
          top: 8,
          right: 8,
          backgroundColor: 'rgba(19, 19, 21, 0.78)',
          backdropFilter: 'blur(8px)',
          color: '#e5e1e4',
          fontSize: 10,
          fontWeight: 700,
          padding: '3px 7px',
          borderRadius: 6
        }}>
          {content.type === 'series' ? 'Série' : `${content.duration_minutes || 45}m`}
        </span>
      </div>

      {/* 2. TÍTULO E SUBTÍTULO DO CARD BASE */}
      <div>
        <h4 style={{
          fontSize: 13,
          fontWeight: 700,
          color: '#ffffff',
          marginBottom: 2,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {content.title}
        </h4>
        <p style={{
          fontSize: 11,
          color: '#958ea0',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          margin: 0
        }}>
          {subtitle || content.tags?.[0] || 'História Bíblica'}
        </p>
      </div>

      {/* 3. CARD EXPANDIDO FLUTUANTE (Floating Expanded Card após delay de 450ms) */}
      {isExpanded && (
        <div
          onClick={(e) => {
            e.stopPropagation()
            onSelect(content)
          }}
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'min(580px, calc(100vw - 32px))',
            backgroundColor: '#19181b',
            borderRadius: 14,
            overflow: 'hidden',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.95), 0 0 24px rgba(160, 120, 255, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            zIndex: 1000,
            animation: 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Topo: Vídeo Preview (se houver) ou Pôster ampliado */}
          <div style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16 / 9',
            backgroundColor: '#0a0a0c',
            overflow: 'hidden'
          }}>
            {content.video_url && !previewVideoFailed ? (
              <video
                src={content.video_url}
                poster={content.banner_url || imageSrc}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                onError={() => setPreviewVideoFailed(true)}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <img
                src={content.banner_url || imageSrc}
                alt={content.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            )}

            {/* Gradiente de Fusão */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, #19181b 0%, rgba(25, 24, 27, 0.2) 40%, transparent 80%)'
            }} />

            {/* Badge de Relevância / Categoria */}
            <span style={{
              position: 'absolute',
              top: 8,
              left: 8,
              backgroundColor: 'rgba(255, 185, 95, 0.9)',
              color: '#052e16',
              fontSize: 9,
              fontWeight: 800,
              padding: '2px 6px',
              borderRadius: 4,
              letterSpacing: '0.04em'
            }}>
              {content.type === 'series' ? 'SÉRIE' : 'FILME'}
            </span>
          </div>

          {/* Corpo de Ações e Informações */}
          <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Linha de Botões de Ação */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* Botão Play */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onPlay(content)
                  }}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    color: '#0e0e10',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                    transition: 'transform 0.15s ease'
                  }}
                  title="Assistir agora"
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <Play size={16} fill="#0e0e10" style={{ marginLeft: 2 }} />
                </button>

                {/* Minha Lista */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleList(content.id)
                  }}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    backgroundColor: isInList ? '#22c55e' : 'rgba(255, 255, 255, 0.12)',
                    color: isInList ? '#052e16' : '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  title={isInList ? 'Remover da Minha Lista' : 'Adicionar à Minha Lista'}
                >
                  {isInList ? <Check size={14} /> : <Plus size={14} />}
                </button>

                {/* Curtir */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (onToggleLike) onToggleLike(content.id)
                  }}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    backgroundColor: isLiked ? 'rgba(255, 185, 95, 0.3)' : 'rgba(255, 255, 255, 0.12)',
                    color: isLiked ? '#ffb95f' : '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  title="Gostei"
                >
                  <ThumbsUp size={13} fill={isLiked ? '#ffb95f' : 'none'} />
                </button>
              </div>

              {/* Botão de Mais Detalhes */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect(content)
                }}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                title="Mais informações"
              >
                <ChevronDown size={16} />
              </button>
            </div>

            {/* Título e Metadados */}
            <div>
              <div style={{
                fontSize: 13,
                fontWeight: 800,
                color: '#ffffff',
                lineHeight: 1.2
              }}>
                {content.title}
              </div>

              {/* Linha de Metadados: 98% Relevante • Livre • Duração • HD */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginTop: 4,
                fontSize: 10,
                fontWeight: 700,
                flexWrap: 'wrap'
              }}>
                <span style={{ color: '#46d369' }}>98% relevante</span>
                <span style={{
                  padding: '1px 4px',
                  borderRadius: 3,
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: 9,
                  fontWeight: 800
                }}>
                  LIVRE
                </span>
                <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  {content.type === 'series' ? 'Série' : `${content.duration_minutes || 45}m`}
                </span>
                <span style={{
                  padding: '1px 4px',
                  borderRadius: 3,
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#ffffff',
                  fontSize: 9
                }}>
                  HD
                </span>
              </div>
            </div>

            {/* Sinopse Curta */}
            {content.description && (
              <p style={{
                fontSize: 10,
                color: '#cbc3d7',
                margin: 0,
                lineHeight: 1.3,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {content.description}
              </p>
            )}

            {/* Tags / Gêneros */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 9,
              color: '#22c55e',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              <span>✦ {content.tags?.[0] || 'História Bíblica'}</span>
              <span>•</span>
              <span>{content.tags?.[1] || 'Fé'}</span>
              <span>•</span>
              <span>Família</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
