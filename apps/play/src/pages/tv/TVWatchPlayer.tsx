import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Play, Pause, RotateCcw, RotateCw, Volume2,
  ArrowLeft, SkipForward, Sparkles, Moon
} from 'lucide-react'
import { STREAM_CATALOG } from '../../data/streamCatalog'
import { useTVSession } from '../../context/TVSessionContext'

import { tvInputController } from '../../services/TVInputController'

export default function TVWatchPlayer() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { watchProgress, saveProgress, checkParentalAccess, recordPlayback } = useTVSession()

  const content = STREAM_CATALOG.find(c => c.id === id || c.slug === id) || STREAM_CATALOG[0]
  const videoRef = useRef<HTMLVideoElement>(null)

  const [isPlaying, setIsPlaying] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(content.duration_minutes ? content.duration_minutes * 60 : 1200)
  const [showControls, setShowControls] = useState(true)
  const [accessBlocked, setAccessBlocked] = useState(false)
  const [blockMessage, setBlockMessage] = useState('')
  const hideTimerRef = useRef<any>(null)

  useEffect(() => {
    checkParentalAccess().then(result => {
      if (!result.allowed) {
        setAccessBlocked(true)
        if (result.reason === 'BEDTIME') {
          setBlockMessage('Hora do sono! O Com Deus Kids já está dormindo até amanhã.')
        } else if (result.reason === 'DAILY_LIMIT') {
          setBlockMessage('Tempo diário de tela atingido para hoje! Parabéns pelas atividades.')
        } else if (result.reason === 'PAUSED') {
          setBlockMessage('O perfil foi pausado pelos responsáveis na Central da Família.')
        } else if (result.reason === 'DAY_NOT_ALLOWED') {
          setBlockMessage('Hoje não é um dia liberado para assistir Com Deus Kids.')
        } else {
          setBlockMessage('Acesso restrito pelo controle parental.')
        }
      }
    })
  }, [checkParentalAccess])

  useEffect(() => {
    const existing = watchProgress[content.id]
    if (existing && existing.progress_seconds > 0 && videoRef.current) {
      videoRef.current.currentTime = existing.progress_seconds
      setCurrentTime(existing.progress_seconds)
    }
  }, [content.id, watchProgress])

  const resetHideTimer = useCallback(() => {
    setShowControls(true)
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    hideTimerRef.current = setTimeout(() => {
      setShowControls(false)
    }, 4000)
  }, [])

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play()
      setIsPlaying(true)
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }, [])

  const seek = useCallback((seconds: number) => {
    if (!videoRef.current) return
    videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.duration, videoRef.current.currentTime + seconds))
    resetHideTimer()
  }, [resetHideTimer])

  useEffect(() => {
    const unsubscribe = tvInputController.subscribe((action) => {
      resetHideTimer()

      if (action === 'PLAY_PAUSE') {
        togglePlay()
      } else if (action === 'LEFT') {
        seek(-10)
      } else if (action === 'RIGHT') {
        seek(10)
      } else if (action === 'BACK') {
        navigate(-1)
      }
    })

    resetHideTimer()

    return () => {
      unsubscribe()
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    }
  }, [resetHideTimer, togglePlay, seek, navigate])

  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    setCurrentTime(videoRef.current.currentTime)
    setDuration(videoRef.current.duration || duration)

    if (Math.floor(videoRef.current.currentTime) % 15 === 0 && videoRef.current.currentTime > 5) {
      saveProgress(
        content.id,
        videoRef.current.currentTime,
        videoRef.current.duration,
        content.title,
        content.thumbnail_url
      )
      recordPlayback(content.id, 15).then(result => {
        if (result.limitReached) {
          videoRef.current?.pause()
          setAccessBlocked(true)
          setBlockMessage('Tempo diário de tela atingido! Parabéns pelas atividades de hoje.')
        }
      })
    }
  }

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#000000',
      zIndex: 99999,
      fontFamily: 'var(--cdk-font-family)'
    }}>
      {accessBlocked ? (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'radial-gradient(circle at center, #1b1b26 0%, #08090d 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 40,
          textAlign: 'center',
          zIndex: 100000,
          fontFamily: 'var(--cdk-font-family, "Baloo 2", sans-serif)'
        }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'rgba(34, 197, 94, 0.15)',
            border: '2px solid rgba(34, 197, 94, 0.4)',
            color: '#22c55e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
            boxShadow: '0 0 30px rgba(34, 197, 94, 0.3)'
          }}>
            <Moon size={44} />
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#ffffff', marginBottom: 12 }}>
            Controle Parental da Família
          </h2>
          <p style={{ fontSize: 20, color: '#cbd5e1', maxWidth: 600, lineHeight: 1.5, marginBottom: 32 }}>
            {blockMessage}
          </p>
          <button
            data-tv-focus
            autoFocus
            onClick={() => navigate('/tv')}
            className="cdk-tv-btn cdk-tv-focus"
            style={{
              padding: '14px 32px',
              borderRadius: 14,
              background: '#22c55e',
              color: '#052e16',
              border: 'none',
              fontSize: 18,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(34, 197, 94, 0.4)'
            }}
          >
            Voltar ao Início da TV
          </button>
        </div>
      ) : (
        <video
          ref={videoRef}
          src={content.video_url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
          autoPlay
          playsInline
          preload="metadata"
          poster={content.thumbnail_url}
          onTimeUpdate={handleTimeUpdate}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      )}

      {/* Overlay de TV */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px 64px',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.95) 100%)',
        opacity: showControls ? 1 : 0,
        transition: 'opacity 0.3s ease',
        pointerEvents: showControls ? 'auto' : 'none'
      }}>
        {/* Topo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: '50%',
                width: 60,
                height: 60,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={30} />
            </button>
            <div>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#ffb95f', textTransform: 'uppercase' }}>
                {content.category}
              </span>
              <h2 style={{ fontSize: 32, fontWeight: 800, color: '#ffffff', margin: 0 }}>
                {content.title}
              </h2>
            </div>
          </div>

          <div style={{
            backgroundColor: 'rgba(34, 197, 94, 0.15)',
            padding: '10px 20px',
            borderRadius: 24,
            border: '2px solid rgba(34, 197, 94, 0.5)',
            color: '#22c55e',
            fontSize: 16,
            fontWeight: 800
          }}>
            Controle Remoto TV: [ENTER] Pausar • [←/→] 10s • [VOLTAR] Sair
          </div>
        </div>

        {/* Barra de Progresso e Tempo */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16 }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#ffffff', minWidth: 70 }}>
              {formatTime(currentTime)}
            </span>
            <div style={{
              flex: 1,
              height: 10,
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 5,
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${(currentTime / (duration || 1)) * 100}%`,
                backgroundColor: '#22c55e',
                borderRadius: 5
              }} />
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#958ea0', minWidth: 70 }}>
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
