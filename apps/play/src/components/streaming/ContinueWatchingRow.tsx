import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { History, ChevronRight, Play } from 'lucide-react'
import { StreamContent } from '@comdeuskids/types'
import CarouselScrollContainer from './CarouselScrollContainer'

export interface ContinueWatchingItem {
  id: string
  content: StreamContent
  title: string
  episode: string
  image: string
  timeLeft: string
  progress: number
}

export interface ContinueWatchingRowProps {
  title?: string
  seeAllLink?: string
  items: ContinueWatchingItem[]
  onSelect: (content: StreamContent) => void
  onPlay: (content: StreamContent) => void
}

function ContinueWatchingCard({
  item,
  onSelect,
  onPlay
}: {
  item: ContinueWatchingItem
  onSelect: (content: StreamContent) => void
  onPlay: (content: StreamContent) => void
}) {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewVideoFailed, setPreviewVideoFailed] = useState(false)
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const openPreview = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    openTimer.current = setTimeout(() => setPreviewOpen(true), 400)
  }

  const closePreview = () => {
    if (openTimer.current) clearTimeout(openTimer.current)
    closeTimer.current = setTimeout(() => setPreviewOpen(false), 160)
  }

  useEffect(() => () => {
    if (openTimer.current) clearTimeout(openTimer.current)
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }, [])

  const videoUrl = item.content.trailer_url || item.content.video_url
  const previewImage = item.content.banner_url || item.image

  return (
    <div
      onClick={() => onSelect(item.content)}
      onMouseEnter={openPreview}
      onMouseLeave={closePreview}
      style={{
        flex: '0 0 280px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        cursor: 'pointer',
        position: 'relative',
        zIndex: previewOpen ? 40 : 1
      }}
    >
      <div style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16 / 9',
        borderRadius: 14,
        overflow: 'hidden',
        backgroundColor: '#201f21',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.45)'
      }}>
        <div style={{ width: '100%', height: '100%', backgroundImage: `url(${item.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(14, 14, 16, 0.85) 0%, transparent 60%)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onPlay(item.content) }}
            aria-label={`Continuar ${item.title}`}
            style={{ width: 42, height: 42, borderRadius: '50%', backgroundColor: 'rgba(19, 19, 21, 0.85)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e', border: '1px solid rgba(255, 255, 255, 0.2)', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
          >
            <Play size={20} fill="#22c55e" />
          </button>
        </div>
        <span style={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(19, 19, 21, 0.75)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', color: '#ffffff', fontSize: 10, fontWeight: 700, padding: '3px 7px', borderRadius: 6 }}>
          {item.timeLeft}
        </span>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, backgroundColor: 'rgba(53, 52, 55, 0.7)' }}>
          <div style={{ height: '100%', width: `${item.progress}%`, backgroundColor: '#22c55e', boxShadow: '0 0 8px rgba(34, 197, 94, 0.8)', borderRadius: '0 2px 2px 0' }} />
        </div>
      </div>
      <div>
        <h4 style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', marginBottom: 2 }}>{item.title}</h4>
        <p style={{ fontSize: 11, color: '#cbc3d7' }}>{item.episode}</p>
      </div>

      {previewOpen && (
        <div
          onClick={(e) => { e.stopPropagation(); onSelect(item.content) }}
          style={{ position: 'fixed', top: '50%', left: '50%', width: 'min(560px, calc(100vw - 32px))', transform: 'translate(-50%, -50%)', overflow: 'hidden', borderRadius: 18, background: '#19181b', border: '1px solid rgba(34,197,94,0.4)', boxShadow: '0 28px 80px rgba(0,0,0,0.92), 0 0 36px rgba(34,197,94,0.2)', animation: 'fadeIn 0.2s ease', zIndex: 1000 }}
        >
          <div style={{ position: 'relative', aspectRatio: '16 / 9', background: '#0a0a0c' }}>
            {videoUrl && !previewVideoFailed ? (
              <video src={videoUrl} poster={previewImage} autoPlay muted loop playsInline preload="metadata" onError={() => setPreviewVideoFailed(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <img src={previewImage} alt="" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #19181b 0%, transparent 75%)' }} />
          </div>
          <div style={{ padding: '10px 12px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button type="button" onClick={(e) => { e.stopPropagation(); onPlay(item.content) }} aria-label={`Assistir ${item.title}`} style={{ width: 34, height: 34, border: 0, borderRadius: '50%', background: '#fff', color: '#151419', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                <Play size={16} fill="currentColor" />
              </button>
              <strong style={{ color: '#fff', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</strong>
            </div>
            <p style={{ color: '#cbc3d7', fontSize: 10, margin: '9px 0 0' }}>{item.episode} · {item.timeLeft}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ContinueWatchingRow({
  title = 'Continuar Assistindo',
  seeAllLink = '/videos',
  items,
  onSelect,
  onPlay
}: ContinueWatchingRowProps) {
  if (!items || items.length === 0) return null

  return (
    <section style={{
      marginTop: 22,
      maxWidth: 1720,
      margin: '22px auto 0',
      padding: '0 clamp(20px, 3.5vw, 48px)',
      boxSizing: 'border-box'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <History size={18} color="#22c55e" />
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>
            {title}
          </h2>
        </div>
        {seeAllLink && (
          <Link
            to={seeAllLink}
            style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#22c55e', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}
          >
            Ver tudo <ChevronRight size={14} />
          </Link>
        )}
      </div>

      <CarouselScrollContainer>
        {items.map(item => <ContinueWatchingCard key={item.id} item={item} onSelect={onSelect} onPlay={onPlay} />)}
      </CarouselScrollContainer>
    </section>
  )
}
