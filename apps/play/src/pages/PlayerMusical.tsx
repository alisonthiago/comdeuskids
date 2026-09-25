import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  ChevronDown, MoreHorizontal, Star, Sparkles, CheckCircle2,
  Heart, ListPlus, Shuffle, SkipBack, Play, Pause, SkipForward,
  Repeat1, Mic, Music, Tv, ArrowRight, Check
} from 'lucide-react'
import { useProfile } from '../context/ProfileContext'

interface TrackInfo {
  id: string
  title: string
  artist: string
  album: string
  playlistName: string
  coverUrl: string
  categoryBadge: string
  contentSlug: string
  totalDurationSec: number
  lyrics: {
    prev: string
    current: string
    next1: string
    next2: string
  }
}

const DEFAULT_TRACK: TrackInfo = {
  id: 'track-davi',
  title: 'Corajoso Como Davi',
  artist: 'Com Deus Kids',
  album: 'Álbum Heróis',
  playlistName: 'Louvores de Fé',
  coverUrl: '/thumbnails/player_davi_warrior.jpg',
  categoryBadge: 'Heróis da Fé',
  contentSlug: 'davi-e-golias',
  totalDurationSec: 204, // 3:24
  lyrics: {
    prev: 'O gigante era forte, mas o Senhor me guardou...',
    current: '♪ Mesmo pequeno eu não vou temer, com Deus na frente eu vou vencer! ♪',
    next1: 'Com cinco pedrinhas e a fé no coração...',
    next2: 'Vitória pra todo o Seu povo brilhou!'
  }
}

interface PlayerMusicalProps {
  track?: TrackInfo
  onMinimize?: () => void
}

export default function PlayerMusical({ track = DEFAULT_TRACK, onMinimize }: PlayerMusicalProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isInMyList, toggleMyList } = useProfile()

  const [isPlaying, setIsPlaying] = useState(true)
  const [isLiked, setIsLiked] = useState(true)
  const [isShuffle, setIsShuffle] = useState(true)
  const [isRepeat, setIsRepeat] = useState(true)
  const [activeTab, setActiveTab] = useState<'lyrics' | 'queue'>('lyrics')
  const [currentSeconds, setCurrentSeconds] = useState(92) // 1:32
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const inList = isInMyList(track.id)

  // Timer simulado de áudio
  useEffect(() => {
    if (!isPlaying) return
    const timer = setInterval(() => {
      setCurrentSeconds((prev) => {
        if (prev >= track.totalDurationSec) {
          return 0
        }
        return prev + 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [isPlaying, track.totalDurationSec])

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const progressPercent = Math.min(100, Math.round((currentSeconds / track.totalDurationSec) * 100))

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2500)
  }

  const handleMinimize = () => {
    if (onMinimize) {
      onMinimize()
    } else {
      navigate(-1)
    }
  }

  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percent = Math.max(0, Math.min(1, clickX / rect.width))
    setCurrentSeconds(Math.floor(percent * track.totalDurationSec))
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#131315',
      color: '#e5e1e4',
      position: 'relative',
      overflowX: 'hidden',
      userSelect: 'none',
      paddingBottom: 40,
      fontFamily: "'Baloo 2', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      {/* CELESTIAL AMBIENT GLOW ORBS (1:1 STITCH) */}
      <div style={{
        position: 'absolute',
        top: -64,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 320,
        height: 320,
        borderRadius: '50%',
        backgroundColor: 'rgba(34, 197, 94, 0.15)',
        filter: 'blur(96px)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        top: 176,
        left: '25%',
        width: 224,
        height: 224,
        borderRadius: '50%',
        backgroundColor: 'rgba(238, 152, 0, 0.15)',
        filter: 'blur(64px)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        top: 384,
        right: 16,
        width: 256,
        height: 256,
        borderRadius: '50%',
        backgroundColor: 'rgba(34, 197, 94, 0.08)',
        filter: 'blur(96px)',
        pointerEvents: 'none'
      }} />

      <div style={{ width: '100%', maxWidth: 460, margin: '0 auto', position: 'relative', zIndex: 10 }}>

        {/* 1. TOP BAR NAVIGATION */}
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          position: 'relative',
          zIndex: 20
        }}>
          <button
            aria-label="Minimizar player"
            onClick={handleMinimize}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: 'rgba(32, 31, 33, 0.6)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: 'none',
              color: '#e5e1e4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              transition: 'transform 0.15s'
            }}
          >
            <ChevronDown size={24} />
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 200, textAlign: 'center' }}>
            <span style={{
              fontSize: 10,
              fontWeight: 800,
              color: '#ffb95f',
              letterSpacing: '0.08em',
              textTransform: 'uppercase'
            }}>
              Tocando da Playlist
            </span>
            <span style={{
              fontSize: 12,
              fontWeight: 700,
              color: '#e5e1e4',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {track.playlistName}
            </span>
          </div>

          <button
            aria-label="Mais opções"
            onClick={() => showToast('Opções de áudio e qualidade')}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: 'rgba(32, 31, 33, 0.6)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: 'none',
              color: '#e5e1e4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <MoreHorizontal size={20} />
          </button>
        </header>

        {/* 2. CENTER STAGE (ALBUM COVER & TRACK IDENTITY) */}
        <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 24px', marginTop: 12 }}>
          {/* Album Art Card with Layered Shadow & Halo */}
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: 310,
            aspectRatio: '1/1',
            borderRadius: 24,
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.7)'
          }}>
            {/* Ambient Halo Glow */}
            <div style={{
              position: 'absolute',
              inset: -4,
              borderRadius: 28,
              background: 'linear-gradient(to top right, rgba(238, 152, 0, 0.3), rgba(34, 197, 94, 0.25), rgba(74, 222, 128, 0.35))',
              filter: 'blur(8px)',
              opacity: 0.8
            }} />

            <div style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              borderRadius: 24,
              overflow: 'hidden',
              backgroundColor: '#0e0e10'
            }}>
              <img
                src={track.coverUrl}
                alt={track.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: 'scale(1.02)',
                  transition: 'transform 0.7s ease'
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/thumbnails/song_david_pastor.jpg'
                }}
              />

              {/* Floating Faith & Character Micro Badge */}
              <div style={{
                position: 'absolute',
                top: 12,
                left: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                borderRadius: 9999,
                backgroundColor: 'rgba(19, 19, 21, 0.8)',
                backdropFilter: 'blur(10px)'
              }}>
                <Star size={13} color="#ffb95f" fill="#ffb95f" />
                <span style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: '#ffb95f',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  {track.categoryBadge}
                </span>
              </div>

              {/* Sparkling Star Delight */}
              <div style={{
                position: 'absolute',
                bottom: 12,
                right: 12,
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: 'rgba(19, 19, 21, 0.75)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffb95f'
              }}>
                <Sparkles size={16} />
              </div>
            </div>
          </div>

          {/* Metadata & Primary Track Actions */}
          <div style={{
            width: '100%',
            maxWidth: 310,
            marginTop: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, paddingRight: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <h1 style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: '#e5e1e4',
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {track.title}
                </h1>
                <CheckCircle2 size={16} color="#22c55e" fill="#22c55e" style={{ flexShrink: 0 }} />
              </div>
              <p style={{
                fontSize: 13,
                color: '#9ca3af',
                margin: '2px 0 0',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {track.artist} • {track.album}
              </p>
            </div>

            {/* Action Fav & Add Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <button
                aria-label="Favoritar canção"
                onClick={() => {
                  setIsLiked(!isLiked)
                  showToast(isLiked ? 'Removido dos favoritos' : 'Adicionado aos favoritos!')
                }}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  backgroundColor: isLiked ? 'rgba(34, 197, 94, 0.2)' : '#2a2a2c',
                  border: 'none',
                  color: isLiked ? '#22c55e' : '#9ca3af',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.15s'
                }}
              >
                <Heart size={22} fill={isLiked ? '#22c55e' : 'none'} color={isLiked ? '#22c55e' : '#9ca3af'} />
              </button>

              <button
                aria-label="Adicionar à lista de reprodução"
                onClick={() => {
                  toggleMyList(track.id)
                  showToast(inList ? 'Removido da Minha Lista' : 'Salvo na Minha Lista!')
                }}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  backgroundColor: inList ? 'rgba(255, 185, 95, 0.25)' : '#2a2a2c',
                  border: 'none',
                  color: inList ? '#ffb95f' : '#e5e1e4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.15s'
                }}
              >
                <ListPlus size={20} />
              </button>
            </div>
          </div>
        </section>

        {/* 3. INTERACTIVE AUDIO SCRUBBER & TIMING */}
        <section style={{ padding: '0 24px', marginTop: 16, width: '100%', maxWidth: 340, margin: '16px auto 0' }}>
          <div
            onClick={handleScrubberClick}
            style={{
              position: 'relative',
              width: '100%',
              padding: '8px 0',
              cursor: 'pointer'
            }}
          >
            {/* Track Background */}
            <div style={{
              width: '100%',
              height: 6,
              borderRadius: 9999,
              backgroundColor: '#353437',
              overflow: 'hidden'
            }}>
              {/* Progress Fill Gradient */}
              <div style={{
                height: '100%',
                width: `${progressPercent}%`,
                borderRadius: 9999,
                background: 'linear-gradient(to right, #16a34a, #22c55e)',
                boxShadow: '0 0 10px rgba(34, 197, 94, 0.5)',
                transition: 'width 0.2s linear'
              }} />
            </div>

            {/* Glowing Draggable Thumb */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: `${progressPercent}%`,
              transform: 'translate(-50%, -50%)',
              width: 16,
              height: 16,
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              boxShadow: '0 2px 8px rgba(34, 197, 94, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#22c55e' }} />
            </div>
          </div>

          {/* Time Indicators */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
            <span style={{ fontSize: 12, color: '#cbc3d7', fontWeight: 600 }}>
              {formatTime(currentSeconds)}
            </span>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '2px 6px',
              borderRadius: 4,
              backgroundColor: '#1c1b1d'
            }}>
              <span style={{ fontSize: 10, color: '#7bd0ff', fontWeight: 800, letterSpacing: '0.06em' }}>
                HD ÁUDIO
              </span>
            </div>
            <span style={{ fontSize: 12, color: '#cbc3d7', fontWeight: 600 }}>
              {formatTime(track.totalDurationSec)}
            </span>
          </div>
        </section>

        {/* 4. PLAYBACK CONTROLS */}
        <section style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          marginTop: 12,
          maxWidth: 340,
          margin: '12px auto 0'
        }}>
          {/* Shuffle Toggle */}
          <button
            aria-label="Modo aleatório"
            onClick={() => {
              setIsShuffle(!isShuffle)
              showToast(isShuffle ? 'Modo aleatório desligado' : 'Modo aleatório ativado!')
            }}
            style={{
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              color: isShuffle ? '#22c55e' : '#958ea0',
              position: 'relative',
              cursor: 'pointer'
            }}
          >
            <Shuffle size={20} />
            {isShuffle && (
              <div style={{
                position: 'absolute',
                bottom: 4,
                width: 4,
                height: 4,
                borderRadius: '50%',
                backgroundColor: '#22c55e'
              }} />
            )}
          </button>

          {/* Skip Backward */}
          <button
            aria-label="Voltar canção"
            onClick={() => setCurrentSeconds(0)}
            style={{
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              color: '#e5e1e4',
              cursor: 'pointer',
              transition: 'transform 0.15s'
            }}
          >
            <SkipBack size={30} fill="#e5e1e4" />
          </button>

          {/* Circular Play/Pause Hero Button */}
          <button
            aria-label={isPlaying ? 'Pausar canção' : 'Reproduzir canção'}
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: '#22c55e',
              color: '#052e16',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(34, 197, 94, 0.45)',
              transition: 'transform 0.15s'
            }}
          >
            {isPlaying ? (
              <Pause size={32} fill="#052e16" />
            ) : (
              <Play size={32} fill="#052e16" style={{ marginLeft: 3 }} />
            )}
          </button>

          {/* Skip Forward */}
          <button
            aria-label="Avançar canção"
            onClick={() => {
              setCurrentSeconds(0)
              showToast('Próxima música da playlist')
            }}
            style={{
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              color: '#e5e1e4',
              cursor: 'pointer',
              transition: 'transform 0.15s'
            }}
          >
            <SkipForward size={30} fill="#e5e1e4" />
          </button>

          {/* Repeat Toggle */}
          <button
            aria-label="Repetir canção"
            onClick={() => {
              setIsRepeat(!isRepeat)
              showToast(isRepeat ? 'Repetição desligada' : 'Repetindo esta música!')
            }}
            style={{
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              color: isRepeat ? '#ffb95f' : '#958ea0',
              position: 'relative',
              cursor: 'pointer'
            }}
          >
            <Repeat1 size={20} />
            {isRepeat && (
              <div style={{
                position: 'absolute',
                bottom: 4,
                width: 4,
                height: 4,
                borderRadius: '50%',
                backgroundColor: '#ffb95f'
              }} />
            )}
          </button>
        </section>

        {/* 5. SYNCHRONIZED KARAOKE LYRICS PREVIEW SHEET */}
        <section style={{ padding: '0 16px', marginTop: 24 }}>
          <div style={{
            borderRadius: 24,
            backgroundColor: 'rgba(32, 31, 33, 0.75)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            padding: 16,
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            {/* Tab Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
              padding: '0 4px'
            }}>
              <div style={{ display: 'flex', gap: 16 }}>
                <button
                  onClick={() => setActiveTab('lyrics')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'none',
                    border: 'none',
                    fontSize: 13,
                    fontWeight: activeTab === 'lyrics' ? 800 : 600,
                    color: activeTab === 'lyrics' ? '#22c55e' : '#9ca3af',
                    cursor: 'pointer'
                  }}
                >
                  <Mic size={16} />
                  <span>Letra Cantada</span>
                </button>

                <button
                  onClick={() => setActiveTab('queue')}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: 13,
                    fontWeight: activeTab === 'queue' ? 800 : 600,
                    color: activeTab === 'queue' ? '#22c55e' : '#9ca3af',
                    cursor: 'pointer'
                  }}
                >
                  A Seguir (Fila)
                </button>
              </div>

              <span style={{
                fontSize: 10,
                fontWeight: 800,
                color: '#ffb95f',
                backgroundColor: 'rgba(238, 152, 0, 0.15)',
                padding: '2px 8px',
                borderRadius: 9999,
                textTransform: 'uppercase'
              }}>
                Sincronizado
              </span>
            </div>

            {/* Real-Time Karaoke Lines */}
            {activeTab === 'lyrics' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '4px 0' }}>
                {/* Previous Verse */}
                <p style={{
                  fontSize: 13,
                  color: 'rgba(156, 163, 175, 0.5)',
                  margin: 0,
                  lineHeight: 1.3
                }}>
                  {track.lyrics.prev}
                </p>

                {/* Current Glowing Live Verse */}
                <div style={{
                  borderRadius: 16,
                  backgroundColor: 'rgba(34, 197, 94, 0.15)',
                  padding: 12,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  boxShadow: 'inset 0 0 16px rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.3)'
                }}>
                  <Music size={18} color="#ffb95f" style={{ flexShrink: 0, marginTop: 2 }} />
                  <p style={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: '#e5e1e4',
                    margin: 0,
                    lineHeight: 1.35
                  }}>
                    {track.lyrics.current}
                  </p>
                </div>

                {/* Upcoming Verses */}
                <p style={{
                  fontSize: 13,
                  color: 'rgba(203, 195, 215, 0.75)',
                  margin: 0,
                  lineHeight: 1.3
                }}>
                  {track.lyrics.next1}
                </p>
                <p style={{
                  fontSize: 13,
                  color: 'rgba(203, 195, 215, 0.4)',
                  margin: 0,
                  lineHeight: 1.3
                }}>
                  {track.lyrics.next2}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '4px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: '#e5e1e4' }}>
                  <span>1. Brilha, Brilha Estrela da Fé</span>
                  <span style={{ color: '#cbc3d7', fontSize: 11 }}>2:50</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: '#e5e1e4' }}>
                  <span>2. No Mar com Jonas</span>
                  <span style={{ color: '#cbc3d7', fontSize: 11 }}>3:12</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: '#e5e1e4' }}>
                  <span>3. Os Amigos de Daniel</span>
                  <span style={{ color: '#cbc3d7', fontSize: 11 }}>4:02</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 6. ECOSYSTEM BRIDGE CARD: DAVI & GOLIAS JOURNEY */}
        <section style={{ padding: '0 16px', marginTop: 16 }}>
          <div style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 24,
            backgroundColor: '#2a2a2c',
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <div style={{
              position: 'absolute',
              right: -24,
              bottom: -24,
              width: 128,
              height: 128,
              borderRadius: '50%',
              backgroundColor: 'rgba(238, 152, 0, 0.15)',
              filter: 'blur(24px)',
              pointerEvents: 'none'
            }} />

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                backgroundColor: 'rgba(238, 152, 0, 0.2)',
                color: '#ffb95f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Tv size={26} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: '#ffb95f',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em'
                }}>
                  Aventura Completa
                </span>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: '#e5e1e4', margin: '2px 0 0' }}>
                  Assista ao Desenho Animado
                </h2>
                <p style={{
                  fontSize: 12,
                  color: '#cbc3d7',
                  margin: '2px 0 0',
                  lineHeight: 1.35,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  Gostou dessa canção? Conheça a jornada animada de Davi contra o gigante e responda ao Quiz Bíblico!
                </p>
              </div>
            </div>

            {/* Action Button to Bridge */}
            <button
              onClick={() => navigate(`/conteudo/${track.contentSlug}`)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 14,
                background: 'linear-gradient(90deg, #ee9800 0%, #ffb95f 100%)',
                color: '#472a00',
                fontSize: 13,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(238, 152, 0, 0.35)',
                transition: 'transform 0.15s'
              }}
            >
              <span>Ver História &amp; Jogar Quiz</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </section>
      </div>

      {/* TOAST FLUTUANTE */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(32, 31, 33, 0.95)',
          backdropFilter: 'blur(12px)',
          border: '1px solid #ffb95f',
          color: '#ffb95f',
          padding: '8px 18px',
          borderRadius: 9999,
          fontSize: 12,
          fontWeight: 800,
          zIndex: 99999,
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          <Sparkles size={14} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}
