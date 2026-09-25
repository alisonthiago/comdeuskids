import React, { useState } from 'react'
import { StreamContent, WatchProgress } from '@comdeuskids/types'
import { useProfile } from '../context/ProfileContext'
import { Play, Plus, Check } from 'lucide-react'

interface StreamCardProps {
  content: StreamContent
  onSelect: (content: StreamContent) => void
  showProgress?: boolean
  progressData?: WatchProgress
}

export default function StreamCard({
  content,
  onSelect,
  showProgress = false,
  progressData
}: StreamCardProps) {
  const { isInMyList, toggleMyList } = useProfile()
  const inList = isInMyList(content.id)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewVideoFailed, setPreviewVideoFailed] = useState(false)

  const progressPercentage =
    progressData && progressData.duration_seconds > 0
      ? Math.min(100, Math.round((progressData.progress_seconds / progressData.duration_seconds) * 100))
      : 0

  const remainingMinutes =
    progressData && progressData.duration_seconds > 0
      ? Math.max(1, Math.round((progressData.duration_seconds - progressData.progress_seconds) / 60))
      : null

  return (
    <div className="cdk-stream-card" onClick={() => onSelect(content)} onMouseEnter={() => { setPreviewVideoFailed(false); setPreviewOpen(true) }} onMouseLeave={() => setPreviewOpen(false)}>
      <div className="cdk-card-image-wrap">
        <img
          src={content.thumbnail_url}
          alt={content.title}
          loading="lazy"
          decoding="async"
          className="cdk-card-img"
        />

        {/* Overlay com botão play ao passar o mouse */}
        <div className="cdk-card-hover-overlay">
          <div className="cdk-card-play-bubble">
            <Play size={20} fill="#fff" />
          </div>

          <button
            type="button"
            className="cdk-card-add-btn"
            title={inList ? 'Remover da Minha Lista' : 'Adicionar à Minha Lista'}
            onClick={e => {
              e.stopPropagation()
              toggleMyList(content.id)
            }}
          >
            {inList ? <Check size={16} /> : <Plus size={16} />}
          </button>
        </div>

        {/* Badge se for novo */}
        {content.is_new && <span className="cdk-card-badge-new">NOVO</span>}

        {/* BARRA DE PROGRESSO VERMELHA/VIOLETA (Estilo Netflix Continue Watching) */}
        {showProgress && progressPercentage > 0 && (
          <div className="cdk-card-progress-bar-wrap">
            <div
              className="cdk-card-progress-bar-fill"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}
      </div>

      <div className="cdk-card-footer">
        <h4 className="cdk-card-title">{content.title}</h4>

        {showProgress && remainingMinutes !== null ? (
          <div className="cdk-card-progress-text">
            <span>{content.type === 'series' ? 'S1:E1' : 'Vídeo'}</span>
            <span>•</span>
            <span className="cdk-remaining-label">{remainingMinutes}m restantes</span>
          </div>
        ) : (
          <div className="cdk-card-meta-line">
            <span className="cdk-card-category">{content.category}</span>
            {content.duration_minutes && <span>• {content.duration_minutes}m</span>}
          </div>
        )}
      </div>

      {previewOpen && (
        <div onClick={e => { e.stopPropagation(); onSelect(content) }} style={{ position: 'fixed', zIndex: 1000, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 'min(580px, calc(100vw - 32px))', overflow: 'hidden', borderRadius: 18, background: '#19181b', border: '1px solid rgba(208,188,255,.48)', boxShadow: '0 28px 80px rgba(0,0,0,.92)' }}>
          <div style={{ position: 'relative', aspectRatio: '16 / 9', background: '#0a0a0c' }}>
            {content.video_url && !previewVideoFailed ? <video src={content.video_url} poster={content.banner_url || content.thumbnail_url} autoPlay muted loop playsInline preload="metadata" onError={() => setPreviewVideoFailed(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <img src={content.banner_url || content.thumbnail_url} alt="" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #19181b 0%, transparent 70%)' }} />
          </div>
          <div style={{ padding: '14px 16px' }}><strong style={{ color: '#fff', fontSize: 16 }}>{content.title}</strong><p style={{ margin: '5px 0 0', color: '#cbc3d7', fontSize: 12 }}>{content.category} · {content.duration_minutes || 45} min</p></div>
        </div>
      )}
    </div>
  )
}
