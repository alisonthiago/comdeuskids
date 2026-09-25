import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { STREAM_CATALOG } from '../data/streamCatalog'
import { useProfile } from '../context/ProfileContext'
import { useScreenTimeTracker } from '../hooks/useScreenTimeTracker'
import { evaluateParentalPolicy, formatRemainingTime } from '../lib/parentalPolicy'
import { verifyParentPin } from '../lib/pinService'
import MediaCastingControls from '../components/MediaCastingControls'
import {
  Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX,
  Maximize, Minimize, ArrowLeft, SkipForward, Settings,
  MessageSquare, Check, Sparkles, X, Lock, Unlock,
  Wifi, AlertTriangle, Moon, ShieldAlert
} from 'lucide-react'

// Ícone Oficial EpisodesMedium da Netflix
const EpisodesMediumIcon = ({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    data-icon="EpisodesMedium"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    role="img"
  >
    <path
      fill={color}
      fillRule="evenodd"
      d="M8 5h14v8h2V5a2 2 0 0 0-2-2H8zm10 4H4V7h14a2 2 0 0 1 2 2v8h-2zM0 13a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm14 6v-6H2v6z"
      clipRule="evenodd"
    />
  </svg>
)

// Ícones Oficiais do Pause Ad da Netflix
const PlayMediumIcon = ({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} data-icon="PlayMedium" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" role="img">
    <path fill={color} d="M5 2.7a1 1 0 0 1 1.48-.88l16.93 9.3a1 1 0 0 1 0 1.76l-16.93 9.3A1 1 0 0 1 5 21.31z" />
  </svg>
)

const ExpandSmallIcon = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg viewBox="0 0 16 16" width={size} height={size} data-icon="ExpandSmall" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" role="img">
    <path fill={color} fillRule="evenodd" d="m2.5 3.56 3.97 3.97 1.06-1.06L3.56 2.5H7V1H1.75a.75.75 0 0 0-.75.75V7h1.5zm11 8.88L9.53 8.47 8.47 9.53l3.97 3.97H9V15h5.25a.75.75 0 0 0 .75-.75V9h-1.5z" clipRule="evenodd" />
  </svg>
)

const FlagSmallIcon = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg viewBox="0 0 16 16" width={size} height={size} data-icon="FlagSmall" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" role="img">
    <path fill={color} fillRule="evenodd" d="M1.75 1a.75.75 0 0 0-.75.75V15h1.5V6.885c1.1.013 1.967.06 3 .167V9c0 .35.242.654.584.731 2.708.616 4.886 1.019 8.166 1.019A.75.75 0 0 0 15 10V5.369a.75.75 0 0 0-.75-.75c-1.484 0-2.493-.04-3.75-.17V2.5a.75.75 0 0 0-.584-.731C7.16 1.142 4.982 1 1.75 1m.75 4.385a33 33 0 0 1 3.84.252l.66.079V8.4c2.17.48 4.004.79 6.5.842V6.115a33 33 0 0 1-3.839-.252l-.66-.079v-2.68c-2.135-.443-3.969-.58-6.5-.601z" clipRule="evenodd" />
  </svg>
)

const LinkOutMediumIcon = ({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} data-icon="LinkOutMedium" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" role="img">
    <path fill={color} fillRule="evenodd" d="M4 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-8h-2v8H4V4h8V2zm11 2h3.586l-9.293 9.293 1.414 1.414L20 5.414V9h2V3a1 1 0 0 0-1-1h-6z" clipRule="evenodd" />
  </svg>
)

export default function WatchPlayer() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { saveProgress, watchProgress, activeProfile, profiles, selectProfile } = useProfile()
  const parentProfile = profiles.find(p => p.profile_type === 'parent') || activeProfile

  // 1. Resolver se é um conteúdo direto ou um episódio de série
  let foundSeries: any = null
  let foundSeason: any = null
  let foundEpisode: any = null
  let nextEpisode: any = null

  for (const item of STREAM_CATALOG) {
    if (item.seasons) {
      for (let sIdx = 0; sIdx < item.seasons.length; sIdx++) {
        const season = item.seasons[sIdx]
        if (season.episodes) {
          const epIndex = season.episodes.findIndex(e => e.id === id)
          if (epIndex !== -1) {
            foundEpisode = season.episodes[epIndex]
            foundSeries = item
            foundSeason = season
            if (epIndex + 1 < season.episodes.length) {
              nextEpisode = season.episodes[epIndex + 1]
            } else if (sIdx + 1 < item.seasons.length && item.seasons[sIdx + 1].episodes && item.seasons[sIdx + 1].episodes.length > 0) {
              nextEpisode = item.seasons[sIdx + 1].episodes[0]
            }
            break
          }
        }
      }
    } else if (item.episodes) {
      const epIndex = item.episodes.findIndex(e => e.id === id)
      if (epIndex !== -1) {
        foundEpisode = item.episodes[epIndex]
        foundSeries = item
        if (epIndex + 1 < item.episodes.length) {
          nextEpisode = item.episodes[epIndex + 1]
        }
        break
      }
    }
    if (foundEpisode) break
  }

  const directContent = STREAM_CATALOG.find(c => c.id === id || c.slug === id)
  const content: {
    id: string
    title: string
    subtitle?: string
    video_url?: string
    thumbnail_url?: string
    category?: string
  duration_minutes?: number
    subtitle_tracks?: Array<{ label: string; src: string; srclang: string; default?: boolean }>
  } = foundEpisode ? {
    id: foundEpisode.id,
    title: foundSeries.title,
    subtitle: `T${foundSeason?.season_number || foundEpisode.season_number || 1}:E${foundEpisode.episode_number} • ${foundEpisode.title}`,
    video_url: foundEpisode.video_url || foundSeries.video_url,
    thumbnail_url: foundEpisode.thumbnail_url || foundSeries.thumbnail_url,
    category: foundSeries.category,
    duration_minutes: foundEpisode.duration_minutes || foundSeries.duration_minutes
  } : (directContent || STREAM_CATALOG[0])
  const subtitleTracks = content.subtitle_tracks || []

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const [isPlaying, setIsPlaying] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(100)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [showSubtitlesModal, setShowSubtitlesModal] = useState(false)
  const [selectedSubtitle, setSelectedSubtitle] = useState('Desativada')

  // Configurações Adicionais do Player (Velocidade, Qualidade, Bloqueio Infantil e Conexão)
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1)
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false)
  const [childLock, setChildLock] = useState<boolean>(false)
  const [connectionError, setConnectionError] = useState<boolean>(false)

  // Rastreamento de tempo de tela infantil real
  const { activeSecondsToday } = useScreenTimeTracker({
    activeProfile,
    usageType: 'video',
    contentId: id,
    isActivePlay: isPlaying
  })

  // Avaliação centralizada da política parental
  const parentalPolicy = evaluateParentalPolicy(activeProfile, {
    activeSecondsToday,
    contentAccessClass: (directContent as any)?.access_class || 'general'
  })

  const [parentOverrideUnlocked, setParentOverrideUnlocked] = useState(false)
  const [showOverrideModal, setShowOverrideModal] = useState(false)
  const [overridePin, setOverridePin] = useState('')
  const [overrideError, setOverrideError] = useState<string | null>(null)
  const [overrideLoading, setOverrideLoading] = useState(false)

  const isBlockedByPolicy = !parentOverrideUnlocked && !parentalPolicy.allowed

  useEffect(() => {
    if (isBlockedByPolicy && isPlaying) {
      if (videoRef.current) {
        videoRef.current.pause()
      }
      setIsPlaying(false)
    }
  }, [isBlockedByPolicy, isPlaying])

  const handleParentUnlock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!parentProfile || !overridePin) return
    setOverrideLoading(true)
    setOverrideError(null)

    try {
      const res = await verifyParentPin(parentProfile.id, overridePin)
      if (res.success) {
        setParentOverrideUnlocked(true)
        setShowOverrideModal(false)
        if (videoRef.current) {
          videoRef.current.play()
          setIsPlaying(true)
        }
      } else {
        setOverrideError('PIN incorreto.')
      }
    } catch {
      setOverrideError('Erro ao validar PIN.')
    } finally {
      setOverrideLoading(false)
    }
  }

  // Drawer / Painel de Episódios da Série (Ícone EpisodesMedium da Netflix)
  const [showEpisodesDrawer, setShowEpisodesDrawer] = useState<boolean>(false)
  const [selectedDrawerSeason, setSelectedDrawerSeason] = useState<number>(() => foundSeason?.season_number || 1)

  // Tela de Anúncio em Pausa da Netflix (data-uia="pause-ad")
  const [showPauseAd, setShowPauseAd] = useState<boolean>(false)

  // Autoplay & Próximo Episódio
  const [autoplayEnabled, setAutoplayEnabled] = useState(() => {
    return localStorage.getItem('cdk_autoplay') !== 'false'
  })
  const [showNextOverlay, setShowNextOverlay] = useState(false)
  const [nextCountdown, setNextCountdown] = useState(10)
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed)
    if (videoRef.current) {
      videoRef.current.playbackRate = speed
    }
    setShowSettingsModal(false)
  }

  const handleSubtitleChange = (label: string) => {
    const video = videoRef.current
    if (video) {
      Array.from(video.textTracks).forEach(track => {
        track.mode = track.label === label ? 'showing' : 'disabled'
      })
    }
    setSelectedSubtitle(label)
  }

  useEffect(() => {
    const syncFullscreenState = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', syncFullscreenState)
    return () => document.removeEventListener('fullscreenchange', syncFullscreenState)
  }, [])

  useEffect(() => () => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
  }, [])

  // Retomar do tempo salvo para o perfil ativo
  useEffect(() => {
    const saved = watchProgress[content.id]
    if (saved && saved.progress_seconds > 5 && videoRef.current) {
      videoRef.current.currentTime = saved.progress_seconds
      setCurrentTime(saved.progress_seconds)
    }
  }, [content.id, watchProgress])

  // Ocultar controles após 3.5s de inatividade do mouse
  const handleMouseMove = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !showNextOverlay && !showPauseAd) {
        setShowControls(false)
      }
    }, 3500)
  }

  const togglePlay = () => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play()
      setIsPlaying(true)
      setShowPauseAd(false)
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
      setShowPauseAd(true)
      // Salva progresso ao pausar
      saveProgress(content.id, videoRef.current.currentTime, videoRef.current.duration, content.title, content.thumbnail_url)
    }
  }

  const seek = (seconds: number) => {
    if (!videoRef.current) return
    const newTime = Math.max(0, Math.min(videoRef.current.duration, videoRef.current.currentTime + seconds))
    videoRef.current.currentTime = newTime
    setCurrentTime(newTime)
    saveProgress(content.id, newTime, videoRef.current.duration, content.title, content.thumbnail_url)
  }

  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    const cur = videoRef.current.currentTime
    const dur = videoRef.current.duration || 100
    setCurrentTime(cur)
    setDuration(dur)

    // Salva progresso periodicamente a cada 10 segundos
    if (Math.floor(cur) % 10 === 0 && cur > 5) {
      saveProgress(
        content.id,
        cur,
        dur,
        content.title,
        content.thumbnail_url,
        foundSeries ? {
          seriesId: foundSeries.id,
          seriesTitle: foundSeries.title,
          seasonNumber: foundSeason?.season_number || 1,
          episodeId: foundEpisode?.id,
          episodeNumber: foundEpisode?.episode_number,
          episodeTitle: foundEpisode?.title,
          contentType: 'series'
        } : undefined
      )
    }

    // Ativar overlay do Próximo Episódio nos últimos 15 segundos se houver próximo episódio
    if (nextEpisode && dur > 20 && cur >= dur - 15 && !showNextOverlay) {
      setShowNextOverlay(true)
      setNextCountdown(10)
    }
  }

  // Contagem regressiva do próximo episódio
  useEffect(() => {
    if (showNextOverlay && autoplayEnabled && nextEpisode) {
      countdownIntervalRef.current = setInterval(() => {
        setNextCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current!)
            handlePlayNext()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
    }

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
    }
  }, [showNextOverlay, autoplayEnabled, nextEpisode])

  const handlePlayNext = () => {
    if (!nextEpisode) return
    if (videoRef.current) {
      saveProgress(content.id, duration, duration, content.title, content.thumbnail_url)
    }
    setShowNextOverlay(false)
    navigate(`/assistir/${nextEpisode.id}`, { replace: true })
  }

  const handleCancelNext = () => {
    setShowNextOverlay(false)
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
  }

  const toggleAutoplay = () => {
    const nextVal = !autoplayEnabled
    setAutoplayEnabled(nextVal)
    localStorage.setItem('cdk_autoplay', String(nextVal))
  }

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    const newMuted = !isMuted
    videoRef.current.muted = newMuted
    setIsMuted(newMuted)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    setVolume(val)
    if (videoRef.current) {
      videoRef.current.volume = val
      videoRef.current.muted = val === 0
      setIsMuted(val === 0)
    }
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => console.warn(err))
    } else {
      document.exitFullscreen()
    }
  }

  const handleBack = () => {
    if (videoRef.current) {
      saveProgress(content.id, videoRef.current.currentTime, videoRef.current.duration, content.title, content.thumbnail_url)
    }
    if (foundSeries) {
      navigate(`/serie/${foundSeries.slug || foundSeries.id}`)
    } else {
      navigate(-1)
    }
  }

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Lista de episódios para o Drawer (Netflix Episodes Panel)
  const drawerEpisodes = foundSeries
    ? (foundSeries.seasons && foundSeries.seasons.length > 0
        ? (foundSeries.seasons.find((s: any) => s.season_number === selectedDrawerSeason)?.episodes || foundSeries.seasons[0]?.episodes || [])
        : (foundSeries.episodes || []))
    : []

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#000000',
        zIndex: 99999,
        fontFamily: 'var(--cdk-font-family)',
        cursor: showControls || showNextOverlay || showEpisodesDrawer ? 'default' : 'none'
      }}
    >
      {/* Canvas de Vídeo Estrutura Fiel Netflix: data-uia="video-canvas" */}
      <div
        className="default-ltr-iqcdef-cache-18tyyic"
        data-uia="video-canvas"
        style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}
      >
        <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
          <div id={content.id} style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
            <video
              ref={videoRef}
              disablePictureInPicture
              tabIndex={-1}
              src={content.video_url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
              autoPlay
              playsInline
              preload="metadata"
              poster={content.thumbnail_url}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={() => {
                if (videoRef.current) {
                  const contentSlug = (content as any).slug
                  const saved = watchProgress[content.id] || (contentSlug ? watchProgress[contentSlug] : null)
                  if (saved && saved.progress_seconds > 5 && !saved.completed) {
                    const resumePoint = Math.min(saved.progress_seconds, (videoRef.current.duration || 1000) - 5)
                    videoRef.current.currentTime = resumePoint
                    setCurrentTime(resumePoint)
                  }
                  setDuration(videoRef.current.duration || 0)
                }
              }}
              onClick={togglePlay}
              onError={() => setConnectionError(true)}
              onPlaying={() => setConnectionError(false)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => {
                saveProgress(content.id, duration, duration, content.title, content.thumbnail_url)
                if (nextEpisode) {
                  setShowNextOverlay(true)
                  setNextCountdown(10)
                }
              }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            >
              {subtitleTracks.map(track => (
                <track
                  key={track.src}
                  kind="subtitles"
                  label={track.label}
                  src={track.src}
                  srcLang={track.srclang}
                  default={track.default}
                />
              ))}
            </video>
            <div className="player-timedtext" style={{ display: 'none', direction: 'ltr' }} />
          </div>
        </div>
      </div>

      {/* BANNER DE RECONEXÃO EM CASO DE ERRO NA REDE */}
      {connectionError && (
        <div style={{
          position: 'absolute',
          top: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#93000a',
          color: '#ffdad6',
          padding: '12px 24px',
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
          zIndex: 100000,
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <AlertTriangle size={20} />
          <span style={{ fontSize: 13, fontWeight: 700 }}>
            Instabilidade na rede. Recuperando streaming sem perder o progresso salvo...
          </span>
          <button
            type="button"
            onClick={() => {
              if (videoRef.current) {
                videoRef.current.load()
                videoRef.current.play()
                setConnectionError(false)
              }
            }}
            style={{
              padding: '6px 14px',
              borderRadius: 10,
              backgroundColor: '#ffb4ab',
              color: '#690005',
              border: 'none',
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Reconectar Agora
          </button>
        </div>
      )}

      {/* BOTÃO PULAR ABERTURA (0s a 85s) */}
      {!childLock && currentTime >= 2 && currentTime <= 85 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            seek(85 - currentTime)
          }}
          style={{
            position: 'absolute',
            bottom: showControls ? 110 : 36,
            right: 32,
            backgroundColor: 'rgba(28, 27, 29, 0.9)',
            border: '1px solid #22c55e',
            borderRadius: 14,
            padding: '10px 20px',
            color: '#ffffff',
            fontSize: 13,
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            zIndex: 1000,
            transition: 'bottom 0.2s ease'
          }}
        >
          <SkipForward size={16} color="#22c55e" />
          <span>Pular Abertura</span>
        </button>
      )}

      {/* OVERLAY DE BLOQUEIO INFANTIL ATIVO */}
      {childLock && (
        <div
          onClick={() => setChildLock(false)}
          style={{
            position: 'absolute',
            top: 24,
            left: 24,
            backgroundColor: 'rgba(34, 197, 94, 0.25)',
            backdropFilter: 'blur(12px)',
            border: '1px solid #22c55e',
            borderRadius: 20,
            padding: '8px 16px',
            color: '#ffffff',
            fontSize: 12,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            zIndex: 100000
          }}
          title="Toque para desbloquear os controles"
        >
          <Lock size={15} color="#ffb95f" />
          <span>Tela Bloqueada (Toque para Liberar)</span>
        </div>
      )}

      {/* OVERLAY DE PRÓXIMO EPISÓDIO */}
      {showNextOverlay && nextEpisode && (
        <div style={{
          position: 'absolute',
          bottom: 100,
          right: 32,
          backgroundColor: '#1c1b1d',
          border: '2px solid #22c55e',
          borderRadius: 20,
          padding: '20px 24px',
          boxShadow: '0 16px 48px rgba(0,0,0,0.9)',
          zIndex: 10000,
          maxWidth: 420,
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#ffb95f', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Próximo Episódio em {nextCountdown}s...
            </span>
            <button
              type="button"
              onClick={handleCancelNext}
              style={{ background: 'none', border: 'none', color: '#958ea0', cursor: 'pointer', padding: 2 }}
            >
              <X size={18} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img
              src={nextEpisode.thumbnail_url || content.thumbnail_url}
              alt={nextEpisode.title}
              style={{ width: 90, height: 50, borderRadius: 10, objectFit: 'cover' }}
            />
            <div>
              <div style={{ fontSize: 11, color: '#22c55e', fontWeight: 700 }}>
                Episódio {nextEpisode.episode_number}
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#ffffff', lineHeight: 1.2, marginTop: 2 }}>
                {nextEpisode.title}
              </div>
              <div style={{ fontSize: 12, color: '#958ea0', marginTop: 2 }}>
                {nextEpisode.duration_minutes || 24} min
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
            <button
              type="button"
              onClick={handlePlayNext}
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                backgroundColor: '#22c55e',
                color: '#052e16',
                border: 'none',
                borderRadius: 12,
                padding: '10px 16px',
                fontSize: 13,
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(160, 120, 255, 0.4)'
              }}
            >
              <Play size={14} fill="#ffffff" />
              Assistir Agora
            </button>

            <button
              type="button"
              onClick={handleCancelNext}
              style={{
                backgroundColor: '#201f21',
                border: '1px solid #2a2a2c',
                color: '#cbc3d7',
                borderRadius: 12,
                padding: '10px 16px',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* OVERLAY DE CONTROLES */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 32px',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.95) 100%)',
        opacity: showControls && !childLock ? 1 : 0,
        pointerEvents: showControls && !childLock ? 'auto' : 'none',
        transition: 'opacity 0.3s ease'
      }}>
        {/* BARRA SUPERIOR: Voltar, Título, Episódio, Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              type="button"
              onClick={handleBack}
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(10px)',
                border: 'none',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              title="Voltar para a Série"
            >
              <ArrowLeft size={22} />
            </button>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: '#ffb95f',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em'
                }}>
                  {content.category}
                </span>
                {content.subtitle && (
                  <>
                    <span style={{ color: '#958ea0', fontSize: 11 }}>•</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#22c55e' }}>
                      {content.subtitle}
                    </span>
                  </>
                )}
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#ffffff', margin: 0 }}>
                {content.title}
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Toggle Autoplay */}
            <button
              type="button"
              onClick={toggleAutoplay}
              style={{
                backgroundColor: autoplayEnabled ? 'rgba(0, 155, 209, 0.2)' : '#201f21',
                border: `1px solid ${autoplayEnabled ? '#009bd1' : '#2a2a2c'}`,
                borderRadius: 20,
                padding: '6px 14px',
                color: autoplayEnabled ? '#7bd0ff' : '#958ea0',
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer'
              }}
              title="Reproduzir próximo episódio automaticamente"
            >
              Autoplay: {autoplayEnabled ? 'LIGADO' : 'DESLIGADO'}
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: 'rgba(34, 197, 94, 0.2)',
              padding: '6px 14px',
              borderRadius: 20,
              border: '1px solid rgba(34, 197, 94, 0.4)',
              color: '#22c55e',
              fontSize: 12,
              fontWeight: 800
            }}>
              <Sparkles size={14} />
              <span>Com Deus Kids</span>
            </div>
          </div>
        </div>

        {/* CENTRO: Botão Play/Pause Gigante ao Pausar */}
        {!isPlaying && !showNextOverlay && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none'
          }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: 'rgba(34, 197, 94, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#052e16',
              boxShadow: '0 8px 32px rgba(0,0,0,0.6)'
            }}>
              <Play size={40} fill="#052e16" style={{ marginLeft: 4 }} />
            </div>
          </div>
        )}

        {/* BARRA INFERIOR: Scrubber, Botões de Controle, Áudio/Legendas */}
        <div>
          {/* Linha do Tempo (Scrubber) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#cbc3d7', minWidth: 46 }}>
              {formatTime(currentTime)}
            </span>

            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleScrubberChange}
              style={{
                flex: 1,
                accentColor: '#22c55e',
                cursor: 'pointer',
                height: 6
              }}
            />

            <span style={{ fontSize: 13, fontWeight: 700, color: '#958ea0', minWidth: 46 }}>
              {formatTime(duration)}
            </span>
          </div>

          {/* Botões Inferiores */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Lado Esquerdo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <button
                type="button"
                onClick={togglePlay}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  padding: 4
                }}
              >
                {isPlaying ? <Pause size={26} /> : <Play size={26} fill="#ffffff" />}
              </button>

              <button
                type="button"
                onClick={() => seek(-10)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#cbc3d7',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}
                title="Voltar 10 segundos"
              >
                <RotateCcw size={22} />
                <span style={{ fontSize: 11, fontWeight: 800 }}>10</span>
              </button>

              <button
                type="button"
                onClick={() => seek(10)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#cbc3d7',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}
                title="Avançar 10 segundos"
              >
                <RotateCw size={22} />
                <span style={{ fontSize: 11, fontWeight: 800 }}>10</span>
              </button>

              {nextEpisode && (
                <button
                  type="button"
                  onClick={handlePlayNext}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#22c55e',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: 4
                  }}
                  title={`Próximo Episódio: ${nextEpisode.title}`}
                >
                  <SkipForward size={22} />
                </button>
              )}

              {/* Volume */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8 }}>
                <button
                  type="button"
                  onClick={toggleMute}
                  style={{ background: 'none', border: 'none', color: '#cbc3d7', cursor: 'pointer' }}
                >
                  {isMuted || volume === 0 ? <VolumeX size={22} /> : <Volume2 size={22} />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  style={{
                    width: 70,
                    accentColor: '#22c55e',
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>

            {/* Lado Direito */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {/* Botão de Episódios Oficial Netflix (apenas para séries) */}
              {foundSeries && (
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    data-uia="control-episodes"
                    onClick={() => {
                      setShowEpisodesDrawer(prev => !prev)
                      setShowSubtitlesModal(false)
                      setShowSettingsModal(false)
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: showEpisodesDrawer ? '#22c55e' : '#cbc3d7',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 4,
                      transition: 'color 0.2s ease, transform 0.2s ease'
                    }}
                    title="Episódios"
                  >
                    <EpisodesMediumIcon size={24} color={showEpisodesDrawer ? '#22c55e' : '#cbc3d7'} />
                  </button>
                </div>
              )}

              {/* Menu de Áudio e Legendas */}
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setShowSubtitlesModal(prev => !prev)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: showSubtitlesModal ? '#22c55e' : '#cbc3d7',
                    cursor: 'pointer'
                  }}
                  title="Áudio e Legendas"
                >
                  <MessageSquare size={22} />
                </button>

                {showSubtitlesModal && (
                  <div style={{
                    position: 'absolute',
                    bottom: 40,
                    right: 0,
                    backgroundColor: '#1c1b1d',
                    border: '1px solid #2a2a2c',
                    borderRadius: 16,
                    padding: 16,
                    minWidth: 260,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
                    zIndex: 100
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#22c55e', textTransform: 'uppercase', marginBottom: 8 }}>
                      Áudio
                    </div>
                    <p style={{ margin: 0, padding: '6px 8px', color: '#cbc3d7', fontSize: 13, fontWeight: 600 }}>
                      Português (Original)
                    </p>

                    <div style={{ width: '100%', height: 1, backgroundColor: '#2a2a2c', margin: '10px 0' }} />

                    <div style={{ fontSize: 12, fontWeight: 800, color: '#22c55e', textTransform: 'uppercase', marginBottom: 8 }}>
                      Legendas
                    </div>
                    {subtitleTracks.length === 0 ? (
                      <p style={{ margin: 0, padding: '6px 8px', color: '#958ea0', fontSize: 13 }}>
                        Legendas não disponíveis para este vídeo.
                      </p>
                    ) : ['Desativada', ...subtitleTracks.map(track => track.label)].map(opt => (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => handleSubtitleChange(opt)}
                        style={{
                          width: '100%',
                          border: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 8px',
                          borderRadius: 8,
                          cursor: 'pointer',
                          backgroundColor: selectedSubtitle === opt ? 'rgba(34, 197, 94, 0.15)' : 'transparent',
                          color: selectedSubtitle === opt ? '#22c55e' : '#cbc3d7',
                          fontSize: 13,
                          fontWeight: 600
                        }}
                      >
                        <span>{opt}</span>
                        {selectedSubtitle === opt && <Check size={14} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Menu de Configurações (Velocidade & Qualidade) */}
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(prev => !prev)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: showSettingsModal ? '#22c55e' : '#cbc3d7',
                    cursor: 'pointer'
                  }}
                  title="Velocidade e Qualidade de Reprodução"
                >
                  <Settings size={22} />
                </button>

                {showSettingsModal && (
                  <div style={{
                    position: 'absolute',
                    bottom: 40,
                    right: 0,
                    backgroundColor: '#1c1b1d',
                    border: '1px solid #2a2a2c',
                    borderRadius: 16,
                    padding: 16,
                    minWidth: 240,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
                    zIndex: 100
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#ffb95f', textTransform: 'uppercase', marginBottom: 8 }}>
                      Velocidade
                    </div>
                    {[0.75, 1, 1.25, 1.5].map(spd => (
                      <div
                        key={spd}
                        onClick={() => handleSpeedChange(spd)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 8px',
                          borderRadius: 8,
                          cursor: 'pointer',
                          backgroundColor: playbackSpeed === spd ? 'rgba(255, 185, 95, 0.15)' : 'transparent',
                          color: playbackSpeed === spd ? '#ffb95f' : '#cbc3d7',
                          fontSize: 13,
                          fontWeight: 700
                        }}
                      >
                        <span>{spd === 1 ? '1x (Normal)' : `${spd}x`}</span>
                        {playbackSpeed === spd && <Check size={14} />}
                      </div>
                    ))}

                    <div style={{ width: '100%', height: 1, backgroundColor: '#2a2a2c', margin: '10px 0' }} />

                    <div style={{ fontSize: 12, fontWeight: 800, color: '#7bd0ff', textTransform: 'uppercase', marginBottom: 8 }}>
                      Qualidade do Vídeo
                    </div>
                    <p style={{ margin: 0, padding: '6px 8px', color: '#cbc3d7', fontSize: 13, lineHeight: 1.35 }}>
                      Automática. A seleção manual será habilitada quando o conteúdo tiver múltiplas qualidades disponíveis.
                    </p>
                  </div>
                )}
              </div>

              {/* Bloqueio Infantil */}
              <button
                type="button"
                onClick={() => setChildLock(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#cbc3d7',
                  cursor: 'pointer'
                }}
                title="Bloquear Tela para Crianças"
              >
                <Lock size={20} />
              </button>

              {/* Controles de Transmissão (Google Cast & AirPlay) */}
              <MediaCastingControls
                video={videoRef.current}
                title={content.title}
                poster={content.thumbnail_url}
                src={content.video_url}
              />

              {/* Fullscreen */}
              <button
                type="button"
                onClick={toggleFullscreen}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#cbc3d7',
                  cursor: 'pointer'
                }}
                title={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
              >
                {isFullscreen ? <Minimize size={22} /> : <Maximize size={22} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PAINEL / DRAWER DE EPISÓDIOS (Fiel à Screenshot 1 da Netflix) */}
      {showEpisodesDrawer && foundSeries && (
        <div
          data-uia="episodes-panel"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: 'clamp(340px, 35vw, 460px)',
            backgroundColor: 'rgba(24, 24, 26, 0.98)',
            backdropFilter: 'blur(20px)',
            borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
            zIndex: 100005,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '-20px 0 60px rgba(0, 0, 0, 0.95)',
            boxSizing: 'border-box'
          }}
        >
          {/* Header do Painel (← Temporada 1) */}
          <div style={{
            padding: '24px 24px 16px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <button
              type="button"
              onClick={() => setShowEpisodesDrawer(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                cursor: 'pointer',
                padding: 0
              }}
            >
              <ArrowLeft size={22} />
              <span style={{ fontSize: 20, fontWeight: 800, color: '#ffffff' }}>
                {foundSeries.seasons?.find((s: any) => s.season_number === selectedDrawerSeason)?.title || `Temporada ${selectedDrawerSeason}`}
              </span>
            </button>

            {/* Seletor rápido se tiver múltiplas temporadas */}
            {foundSeries.seasons && foundSeries.seasons.length > 1 && (
              <select
                value={selectedDrawerSeason}
                onChange={(e) => setSelectedDrawerSeason(Number(e.target.value))}
                style={{
                  backgroundColor: '#2a2a2c',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: 6,
                  padding: '4px 8px',
                  fontSize: 12,
                  fontWeight: 700,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {foundSeries.seasons.map((s: any) => (
                  <option key={s.season_number} value={s.season_number}>
                    {s.title || `Temporada ${s.season_number}`}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Lista de Episódios Estilo Netflix */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: 6
          }}>
            {drawerEpisodes.map((ep: any) => {
              const isCurrent = ep.id === content.id
              const epProgress = watchProgress[ep.id]
              const progressPct = isCurrent
                ? (currentTime / (duration || 100)) * 100
                : (epProgress ? (epProgress.progress_seconds / epProgress.duration_seconds) * 100 : 0)

              // Item Ativo / Expandido com borda branca e miniatura (Screenshot 1)
              if (isCurrent) {
                return (
                  <div
                    key={ep.id}
                    style={{
                      border: '2px solid #ffffff',
                      borderRadius: 4,
                      backgroundColor: '#202022',
                      padding: '16px 14px',
                      margin: '6px 0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12
                    }}
                  >
                    {/* Linha superior: 4  Episódio 4 + barra de progresso vermelha */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', minWidth: 16 }}>
                          {ep.episode_number}
                        </span>
                        <span style={{ fontSize: 16, fontWeight: 700, color: '#ffffff' }}>
                          {ep.title}
                        </span>
                      </div>

                      {/* Barra de Progresso Vermelha da Netflix */}
                      <div style={{
                        width: 72,
                        height: 3,
                        backgroundColor: '#555555',
                        borderRadius: 2,
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${Math.min(100, Math.max(8, progressPct))}%`,
                          height: '100%',
                          backgroundColor: '#e50914'
                        }} />
                      </div>
                    </div>

                    {/* Linha inferior: Thumbnail com "Assistindo" + Sinopse */}
                    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                      <div style={{
                        position: 'relative',
                        width: 130,
                        height: 74,
                        borderRadius: 4,
                        overflow: 'hidden',
                        flexShrink: 0,
                        backgroundColor: '#000000'
                      }}>
                        <img
                          src={ep.thumbnail_url || foundSeries.thumbnail_url}
                          alt={ep.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          backgroundColor: 'rgba(0, 0, 0, 0.65)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          color: '#ffffff',
                          fontSize: 12,
                          fontWeight: 700
                        }}>
                          {/* Ondas Sonoras / Visualizer */}
                          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 12 }}>
                            <span style={{ width: 2, height: 8, backgroundColor: '#ffffff', borderRadius: 1 }} />
                            <span style={{ width: 2, height: 12, backgroundColor: '#ffffff', borderRadius: 1 }} />
                            <span style={{ width: 2, height: 6, backgroundColor: '#ffffff', borderRadius: 1 }} />
                          </div>
                          <span>Assistindo</span>
                        </div>
                      </div>

                      <p style={{
                        fontSize: 13,
                        color: 'rgba(255, 255, 255, 0.88)',
                        margin: 0,
                        lineHeight: 1.35,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {ep.description || `${foundSeries.title} - Assista a essa emocionante história e aprenda lições valiosas.`}
                      </p>
                    </div>
                  </div>
                )
              }

              // Item Inativo: Linha limpa com número, título e barra de progresso (Screenshot 1)
              return (
                <div
                  key={ep.id}
                  onClick={() => {
                    if (videoRef.current) {
                      saveProgress(content.id, videoRef.current.currentTime, videoRef.current.duration, content.title, content.thumbnail_url)
                    }
                    setShowEpisodesDrawer(false)
                    navigate(`/assistir/${ep.id}`)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 12px',
                    borderRadius: 4,
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255, 255, 255, 0.75)', minWidth: 16 }}>
                      {ep.episode_number}
                    </span>
                    <span style={{ fontSize: 15, fontWeight: 600, color: '#ffffff' }}>
                      {ep.title}
                    </span>
                  </div>

                  {/* Barra de Progresso Vermelha */}
                  <div style={{
                    width: 72,
                    height: 3,
                    backgroundColor: '#404040',
                    borderRadius: 2,
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${Math.min(100, progressPct)}%`,
                      height: '100%',
                      backgroundColor: progressPct > 0 ? '#e50914' : 'transparent'
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* TELA DE ANÚNCIO EM PAUSA (Pause Ad Oficial da Netflix - Screenshots 2 & 3) */}
      {showPauseAd && !isPlaying && (
        <div
          dir="ltr"
          role="dialog"
          data-uia="pause-ad"
          tabIndex={0}
          className="default-ltr-iqcdef-cache-1d51pnj"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(10, 8, 14, 0.88)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100002,
            padding: 'clamp(20px, 4vw, 60px)',
            boxSizing: 'border-box',
            animation: 'fadeIn 0.25s ease'
          }}
          onClick={(e) => {
            // Se clicar no fundo, retoma a reprodução
            if (e.target === e.currentTarget) {
              togglePlay()
            }
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            maxWidth: 1100,
            width: '100%',
            gap: 'clamp(24px, 4vw, 60px)',
            position: 'relative'
          }}>
            {/* LADO ESQUERDO: Card Flutuante de Conteúdo (data-uia="pause-ad-title-display") */}
            <div
              data-uia="pause-ad-title-display"
              className="default-ltr-iqcdef-cache-1f744vj"
              style={{
                position: 'relative',
                width: 'clamp(250px, 24vw, 340px)',
                height: 'clamp(360px, 50vh, 480px)',
                borderRadius: 14,
                overflow: 'hidden',
                boxShadow: '0 24px 64px rgba(0, 0, 0, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                flexShrink: 0
              }}
            >
              {/* Imagem de Fundo do Card */}
              <img
                alt={content.title}
                src={content.thumbnail_url || foundSeries?.thumbnail_url || '/placeholder.jpg'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />

              {/* Gradiente Escuro na Base */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.1) 75%)'
              }} />

              {/* Botão de Expandir no topo direito do card */}
              <div className="default-ltr-iqcdef-cache-35ym6f" style={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }}>
                <button
                  data-uia="pause-ad-expand-button"
                  aria-label="Mostrar tela de pausa"
                  type="button"
                  onClick={() => setShowPauseAd(false)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(0, 0, 0, 0.65)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <div className="default-ltr-iqcdef-cache-1imzg6u">
                    <ExpandSmallIcon size={16} />
                  </div>
                </button>
              </div>

              {/* Título da Série em Destaque */}
              <div style={{
                position: 'absolute',
                bottom: 76,
                left: 18,
                right: 18,
                textAlign: 'center'
              }}>
                <h3 style={{
                  fontSize: 'clamp(18px, 2vw, 24px)',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#ffffff',
                  margin: 0,
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.9)'
                }}>
                  {content.title}
                </h3>
              </div>

              {/* Informações da Pausa com Botão de Play Circular */}
              <div
                data-uia="pause-ad-title-display-info-container"
                className="default-ltr-iqcdef-cache-8sll74"
                style={{
                  position: 'absolute',
                  bottom: 16,
                  left: 16,
                  right: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}
              >
                <button
                  aria-label="Assistir"
                  data-uia="pause-ad-play-button"
                  type="button"
                  onClick={togglePlay}
                  className="pause-ad-play-button"
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
                    flexShrink: 0,
                    transition: 'transform 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <PlayMediumIcon size={24} color="#000000" />
                </button>

                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>
                    {content.subtitle || `T1:E${foundEpisode?.episode_number || 1} "${foundEpisode?.title || content.title}"`}
                  </span>
                  <span style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.7)', marginTop: 3 }}>
                    Restam {Math.max(1, Math.round((duration - currentTime) / 60))} minutos
                  </span>
                </div>
              </div>

              {/* Barra de Progresso Vermelha na Borda Inferior */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 3,
                backgroundColor: 'rgba(255, 255, 255, 0.2)'
              }}>
                <div style={{
                  width: `${Math.min(100, Math.max(3, (currentTime / (duration || 100)) * 100))}%`,
                  height: '100%',
                  backgroundColor: '#e50914'
                }} />
              </div>
            </div>

            {/* LADO DIREITO: Seção Oficial do Anúncio (Screenshot 2) */}
            <section
              className="default-ltr-iqcdef-cache-1nal45g"
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: 'clamp(320px, 44vh, 420px)',
                color: '#ffffff'
              }}
            >
              {/* Topo do Anúncio: Botão de Flag + Badge "Anúncio" */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                <button
                  aria-label="Comunique um problema"
                  type="button"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    border: 'none',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  title="Comunique um problema"
                >
                  <FlagSmallIcon size={16} />
                </button>
                <div
                  className="default-ltr-iqcdef-cache-ywc2pw"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(8px)',
                    padding: '4px 12px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    color: '#ffffff'
                  }}
                >
                  Anúncio
                </div>
              </div>

              {/* Mensagem Principal da Campanha */}
              <div style={{ padding: '0 10px' }}>
                <div style={{
                  display: 'inline-block',
                  backgroundColor: '#ffb95f',
                  color: '#472a00',
                  padding: '4px 14px',
                  borderRadius: 9999,
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: 12
                }}>
                  NOVO • CLUBE COM DEUS KIDS
                </div>

                <h2 style={{
                  fontSize: 'clamp(28px, 4vw, 44px)',
                  fontWeight: 800,
                  lineHeight: 1.1,
                  margin: '0 0 12px',
                  letterSpacing: '-0.02em',
                  color: '#ffffff'
                }}>
                  livros 3D, atividades e<br />
                  <span style={{ fontStyle: 'italic', fontWeight: 400, color: '#22c55e' }}>
                    desenhos que edificam
                  </span>
                </h2>

                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 18px',
                  borderRadius: 9999,
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  color: 'rgba(255, 255, 255, 0.9)'
                }}>
                  <span>✦</span>
                  <span>HISTÓRIAS BÍBLICAS, SEGURANÇA TOTAL E VALORES CRISTÃOS</span>
                </div>
              </div>

              {/* Botão de Link Externo com LinkOutMediumIcon */}
              <div data-uia="pause-ad-clickable-link">
                <a
                  href="https://comdeuskids.com.br"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 22px',
                    borderRadius: 8,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    fontSize: 14,
                    fontWeight: 700,
                    textDecoration: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <LinkOutMediumIcon size={20} />
                  <span>loja.comdeuskids.com.br/clube</span>
                </a>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* OVERLAY DE CONTROLE PARENTAL (HORA DE DORMIR / LIMITE DIÁRIO / PAUSA DOS PAIS) */}
      {isBlockedByPolicy && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            backgroundColor: 'rgba(10, 10, 14, 0.96)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            fontFamily: "'Plus Jakarta Sans', sans-serif"
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 440,
              backgroundColor: '#1b1b22',
              borderRadius: 24,
              border: '1px solid #35343f',
              padding: '36px 28px',
              textAlign: 'center',
              boxShadow: '0 24px 60px rgba(0,0,0,0.8)'
            }}
          >
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: '50%',
                backgroundColor: parentalPolicy.isBedtime
                  ? 'rgba(123, 208, 255, 0.15)'
                  : 'rgba(255, 185, 95, 0.15)',
                color: parentalPolicy.isBedtime ? '#7bd0ff' : '#ffb95f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}
            >
              {parentalPolicy.isBedtime ? (
                <Moon size={36} />
              ) : (
                <ShieldAlert size={36} />
              )}
            </div>

            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12, color: '#ffffff' }}>
              {parentalPolicy.isBedtime
                ? 'Hora de Dormir! 🌙'
                : parentalPolicy.limitReached
                ? 'Tempo de Tela Finalizado ⏰'
                : parentalPolicy.effectivePaused
                ? 'Pausa dos Pais 🛡️'
                : 'Modo Educativo Ativo 📚'}
            </h2>

            <p style={{ fontSize: 14, color: '#cbc3d7', lineHeight: 1.6, marginBottom: 28 }}>
              {parentalPolicy.message || 'O uso deste perfil está temporariamente limitado pelas regras da família.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                onClick={() => navigate('/inicio')}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 12,
                  backgroundColor: '#22c55e',
                  color: '#052e16',
                  fontSize: 15,
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Voltar para o Início
              </button>

              <button
                onClick={() => {
                  setShowOverrideModal(true)
                  setOverridePin('')
                  setOverrideError(null)
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#a1a1aa',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                <Lock size={14} /> Sou o responsável (Desbloquear com PIN)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE DESBLOQUEIO COM PIN DOS PAIS DENTRO DO PLAYER */}
      {showOverrideModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100000,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 360,
              backgroundColor: '#201f21',
              borderRadius: 20,
              border: '1px solid #353437',
              padding: 24,
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
              textAlign: 'center'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#e5e1e4', margin: 0 }}>
                PIN do Responsável
              </h3>
              <button
                onClick={() => setShowOverrideModal(false)}
                style={{ background: 'none', border: 'none', color: '#958ea0', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: 12, color: '#cbc3d7', marginBottom: 16 }}>
              Digite o PIN para liberar a reprodução nesta sessão.
            </p>

            <form onSubmit={handleParentUnlock} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                type="password"
                maxLength={6}
                value={overridePin}
                onChange={e => setOverridePin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                autoFocus
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 10,
                  backgroundColor: '#111116',
                  border: overrideError ? '1px solid #ff8585' : '1px solid #494454',
                  color: '#fff',
                  fontSize: 22,
                  textAlign: 'center',
                  letterSpacing: 8,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />

              {overrideError && (
                <div style={{ fontSize: 12, color: '#ff8585' }}>{overrideError}</div>
              )}

              <button
                type="submit"
                disabled={overrideLoading || overridePin.length < 4}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 10,
                  backgroundColor: overridePin.length >= 4 ? '#22c55e' : '#353437',
                  color: overridePin.length >= 4 ? '#052e16' : '#fff',
                  fontSize: 13,
                  fontWeight: 800,
                  border: 'none',
                  cursor: overridePin.length >= 4 ? 'pointer' : 'not-allowed'
                }}
              >
                {overrideLoading ? 'Validando...' : 'Liberar Reprodução'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
