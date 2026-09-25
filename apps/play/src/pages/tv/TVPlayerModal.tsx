import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, RotateCcw, RotateCw, Volume2, MessageSquare, ArrowLeft, SkipForward, Moon } from 'lucide-react'
import { StreamContent } from '@comdeuskids/types'
import { useTVSession } from '../../context/TVSessionContext'

import { tvInputController } from '../../services/TVInputController'

interface TVPlayerModalProps {
  content: StreamContent
  onClose: () => void
}

export default function TVPlayerModal({ content, onClose }: TVPlayerModalProps) {
  const { watchProgress, saveProgress, checkParentalAccess, recordPlayback } = useTVSession()
  const videoRef = useRef<HTMLVideoElement>(null)

  const [isPlaying, setIsPlaying] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(content.duration_minutes ? content.duration_minutes * 60 : 1200)
  const [showControls, setShowControls] = useState(true)
  const [accessBlocked, setAccessBlocked] = useState(false)
  const [blockMessage, setBlockMessage] = useState('')
  const hideTimerRef = useRef<any>(null)

  // Verificação de controle parental (horário e limite diário)
  useEffect(() => {
    checkParentalAccess().then(res => {
      if (!res.allowed) {
        setAccessBlocked(true)
        if (res.reason === 'BEDTIME') {
          setBlockMessage('Hora do sono! O Com Deus Kids já está dormindo até amanhã.')
        } else if (res.reason === 'DAILY_LIMIT') {
          setBlockMessage('Tempo diário de tela atingido para hoje! Parabéns pelas atividades.')
        } else if (res.reason === 'PAUSED') {
          setBlockMessage('O perfil foi pausado pelos responsáveis na Central da Família.')
        } else if (res.reason === 'DAY_NOT_ALLOWED') {
          setBlockMessage('Hoje não é um dia liberado para assistir Com Deus Kids.')
        } else {
          setBlockMessage('Acesso restrito pelo controle parental.')
        }
      }
    })
  }, [checkParentalAccess])

  // Retomar do progresso anterior se existir
  useEffect(() => {
    const existing = watchProgress[content.id]
    if (existing && existing.progress_seconds > 0 && videoRef.current) {
      videoRef.current.currentTime = existing.progress_seconds
      setCurrentTime(existing.progress_seconds)
    }
  }, [content.id, watchProgress])

  // Resetar timer de auto-hide dos controles
  const resetHideTimer = useCallback(() => {
    setShowControls(true)
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    hideTimerRef.current = setTimeout(() => {
      setShowControls(false)
    }, 3500)
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
    videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds))
    resetHideTimer()
  }, [duration, resetHideTimer])

  const handleClose = useCallback(() => {
    if (videoRef.current) {
      saveProgress(content.id, videoRef.current.currentTime, duration, content.title, content.thumbnail_url)
    }
    onClose()
  }, [content, duration, onClose, saveProgress])

  // Teclas do controle remoto normalizadas via TVInputController
  useEffect(() => {
    const unsubscribe = tvInputController.subscribe((action) => {
      resetHideTimer()

      if (action === 'PLAY_PAUSE') {
        togglePlay()
      } else if (action === 'LEFT') {
        const active = document.activeElement
        if (!active || active === document.body || active.tagName === 'VIDEO') {
          seek(-10)
        }
      } else if (action === 'RIGHT') {
        const active = document.activeElement
        if (!active || active === document.body || active.tagName === 'VIDEO') {
          seek(10)
        }
      } else if (action === 'BACK') {
        handleClose()
      }
    })

    resetHideTimer()

    return () => {
      unsubscribe()
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    }
  }, [resetHideTimer, togglePlay, seek, handleClose])

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime
      setCurrentTime(cur)
      if (videoRef.current.duration) {
        setDuration(videoRef.current.duration)
      }
      // Salvar progresso a cada 10 segundos
      if (Math.floor(cur) % 10 === 0) {
        saveProgress(content.id, cur, duration, content.title, content.thumbnail_url)
      }
      // Registro de batimento de uso parental a cada 15 segundos
      if (Math.floor(cur) % 15 === 0 && cur > 5) {
        recordPlayback(content.id, 15).then(res => {
          if (res.limitReached) {
            videoRef.current?.pause()
            setAccessBlocked(true)
            setBlockMessage('Tempo diário de tela atingido! Parabéns pelas atividades de hoje.')
          }
        })
      }
    }
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      className="cdk-tv-body"
      onMouseMove={resetHideTimer}
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000',
        zIndex: 9999,
        overflow: 'hidden'
      }}
    >
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
            onClick={onClose}
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
            Voltar ao Catálogo da TV
          </button>
        </div>
      ) : (
        <>
          {/* Vídeo HTML5 de Alta Performance */}
          <video
            ref={videoRef}
            src={content.video_url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
            poster={content.banner_url || content.thumbnail_url}
            autoPlay
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleClose}
            style={{
              width: '100vw',
              height: '100vh',
              objectFit: 'contain'
            }}
            onClick={togglePlay}
          />
        </>
      )}

      {/* Floating HUD de Controles para Smart TV */}
      <div className={`cdk-tv-player-hud ${!showControls ? 'idle' : ''}`}>
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <button
              data-tv-focus
              onClick={handleClose}
              className="cdk-tv-btn cdk-tv-focus"
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                borderRadius: '50%',
                width: 56,
                height: 56,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={28} />
            </button>
            <div>
              <span style={{ fontSize: 15, color: '#22c55e', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>
                {content.category || 'Com Deus Kids'}
              </span>
              <h2 style={{ fontSize: 32, fontWeight: 800, color: '#fff' }}>{content.title}</h2>
            </div>
          </div>

          <div style={{
            background: 'rgba(0,0,0,0.6)',
            padding: '8px 16px',
            borderRadius: 10,
            fontSize: 16,
            color: '#cbd5e1',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            {content.age_range || 'Livre'}
          </div>
        </div>

        {/* Centro: Controles Grandes de TV */}
        <div className="cdk-tv-player-controls">
          <button
            data-tv-focus
            className="cdk-tv-player-icon-btn cdk-tv-focus"
            onClick={() => seek(-10)}
            title="Voltar 10 segundos"
          >
            <RotateCcw size={32} />
          </button>

          <button
            data-tv-focus
            autoFocus
            className="cdk-tv-player-icon-btn primary cdk-tv-focus"
            onClick={togglePlay}
            title={isPlaying ? 'Pausar' : 'Reproduzir'}
          >
            {isPlaying ? <Pause size={42} /> : <Play size={42} style={{ marginLeft: 4 }} />}
          </button>

          <button
            data-tv-focus
            className="cdk-tv-player-icon-btn cdk-tv-focus"
            onClick={() => seek(10)}
            title="Avançar 10 segundos"
          >
            <RotateCw size={32} />
          </button>
        </div>

        {/* Rodapé: Barra de Progresso, Tempos e Opções */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <span style={{ fontSize: 18, fontFamily: 'monospace', color: '#cbd5e1' }}>
              {formatTime(currentTime)}
            </span>

            {/* Barra de Progresso Interativa */}
            <div
              style={{
                flex: 1,
                height: 10,
                background: 'rgba(255,255,255,0.25)',
                borderRadius: 5,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${progressPercent}%`,
                  background: 'linear-gradient(90deg, #16a34a, #22c55e)',
                  borderRadius: 5
                }}
              />
            </div>

            <span style={{ fontSize: 18, fontFamily: 'monospace', color: '#cbd5e1' }}>
              {formatTime(duration)}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 16, color: '#94a3b8' }}>
              Use as setas ◀ ▶ do controle para avançar/retroceder 10s • OK para pausar
            </span>

            <div style={{ display: 'flex', gap: 16 }}>
              <button
                data-tv-focus
                className="cdk-tv-btn cdk-tv-focus"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: 10,
                  padding: '10px 18px',
                  color: '#fff',
                  fontSize: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer'
                }}
              >
                <Volume2 size={20} /> Áudio: Português
              </button>

              <button
                data-tv-focus
                className="cdk-tv-btn cdk-tv-focus"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: 10,
                  padding: '10px 18px',
                  color: '#fff',
                  fontSize: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer'
                }}
              >
                <MessageSquare size={20} /> Legendas
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
