import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Play, Pause, Bookmark, Share2, Sparkles, Star,
  Shield, Heart, Trees, HandHeart, Smile, BarChart2,
  SlidersHorizontal, ArrowRight, Moon, BookOpen, Users,
  Mic, X, Volume2, VolumeX, CheckCircle2, Music,
  Compass, Radio
} from 'lucide-react'
import { useProfile } from '../context/ProfileContext'
import PlayerMusical from './PlayerMusical'

interface Track {
  id: string
  title: string
  artist: string
  duration: string
  remainingText?: string
  progressPercent?: number
  coverUrl: string
  badge?: string
  theme: string
}

interface Playlist {
  id: string
  title: string
  description: string
  trackCount: number
  totalMinutes: number
  icon: any
  accentColor: string
  bgGradient: string
}

const TRACKS_CONTINUE: Track[] = [
  {
    id: 'track-davi',
    title: 'Corajoso Como Davi',
    artist: 'Com Deus Kids',
    duration: '3:45',
    remainingText: '2:15 rest.',
    progressPercent: 65,
    coverUrl: '/thumbnails/song_david_pastor.jpg',
    badge: 'Tocando agora',
    theme: 'coragem'
  },
  {
    id: 'track-mundo',
    title: 'Deus Criou o Mundo Incrível',
    artist: 'Turminha Kids',
    duration: '2:30',
    remainingText: '1:10 rest.',
    progressPercent: 35,
    coverUrl: '/thumbnails/song_brilha_estrela.jpg',
    theme: 'criacao'
  },
  {
    id: 'track-arca',
    title: 'A Arca Flutuou com Amor',
    artist: 'Coral Infantil',
    duration: '3:20',
    remainingText: '3:00 rest.',
    progressPercent: 82,
    coverUrl: '/thumbnails/cante_com_noe.jpg',
    theme: 'amor'
  }
]

const FEATURED_SONGS: Track[] = [
  {
    id: 'song-1',
    title: 'David: Pastor & Herói',
    artist: 'Louvor de Fé',
    duration: '3:45',
    coverUrl: '/thumbnails/song_david_pastor.jpg',
    badge: 'Top 1',
    theme: 'coragem'
  },
  {
    id: 'song-2',
    title: 'Brilha, Brilha Estrela da Fé',
    artist: 'Turminha Com Deus',
    duration: '2:50',
    coverUrl: '/thumbnails/song_brilha_estrela.jpg',
    badge: 'Sucesso',
    theme: 'amor'
  },
  {
    id: 'song-3',
    title: 'No Mar com Jonas',
    artist: 'Coral das Crianças',
    duration: '3:12',
    coverUrl: '/thumbnails/song_jonas_baleia.jpg',
    theme: 'coragem'
  },
  {
    id: 'song-4',
    title: 'Os Amigos de Daniel',
    artist: 'Aventuras da Bíblia',
    duration: '4:02',
    coverUrl: '/thumbnails/song_daniel_leoes.jpg',
    theme: 'gratidao'
  }
]

const MUSIC_COLLECTIONS = [...FEATURED_SONGS, ...TRACKS_CONTINUE]

const PLAYLISTS: Playlist[] = [
  {
    id: 'pl-dormir',
    title: 'Louvores para Dormir',
    description: 'Canções suaves de ninar com promessas de paz.',
    trackCount: 18,
    totalMinutes: 48,
    icon: Moon,
    accentColor: '#7bd0ff',
    bgGradient: 'from-surface-container to-surface-container-high'
  },
  {
    id: 'pl-historias',
    title: 'Histórias Cantadas',
    description: 'Narrativas bíblicas com ritmo e encanto infantil.',
    trackCount: 14,
    totalMinutes: 36,
    icon: BookOpen,
    accentColor: '#ffb95f',
    bgGradient: 'from-surface-container to-surface-container-high'
  },
  {
    id: 'pl-ebd',
    title: 'EBD & Família',
    description: 'Gesto, palmas e alegria no culto doméstico.',
    trackCount: 22,
    totalMinutes: 55,
    icon: Users,
    accentColor: '#22c55e',
    bgGradient: 'from-surface-container to-surface-container-high'
  },
  {
    id: 'pl-versiculos',
    title: 'Versículos na Mente',
    description: 'Memorizando a Palavra com melodias fáceis.',
    trackCount: 25,
    totalMinutes: 30,
    icon: Sparkles,
    accentColor: '#ffddb8',
    bgGradient: 'from-surface-container to-surface-container-high'
  }
]

const THEMES = [
  { key: 'all', label: 'Todos os Temas', icon: Star },
  { key: 'coragem', label: 'Coragem & Fé', icon: Shield, color: '#ffb95f' },
  { key: 'amor', label: 'Amor de Deus', icon: Heart, color: '#7bd0ff' },
  { key: 'criacao', label: 'A Criação', icon: Trees, color: '#ffb95f' },
  { key: 'gratidao', label: 'Gratidão', icon: HandHeart, color: '#22c55e' },
  { key: 'amigo', label: 'Jesus Meu Amigo', icon: Smile, color: '#ffb95f' }
]

export default function MusicasLouvores() {
  const navigate = useNavigate()
  const { activeProfile, isInMyList, toggleMyList } = useProfile()

  const [selectedTheme, setSelectedTheme] = useState('all')
  const [currentPlayingTrack, setCurrentPlayingTrack] = useState<Track>(TRACKS_CONTINUE[0])
  const [isPlaying, setIsPlaying] = useState(true)
  const [showMiniPlayer, setShowMiniPlayer] = useState(true)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isSavedAlbum, setIsSavedAlbum] = useState(false)
  const [micModalOpen, setMicModalOpen] = useState(false)
  const [micRecording, setMicRecording] = useState(false)
  const [expandedPlayer, setExpandedPlayer] = useState(false)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2500)
  }

  const handlePlayTrack = (track: Track) => {
    setCurrentPlayingTrack(track)
    setIsPlaying(true)
    setShowMiniPlayer(true)
    showToast(`Tocando: ${track.title}`)
  }

  const handleTogglePlay = () => {
    setIsPlaying(prev => !prev)
  }

  const handleStartMicChallenge = () => {
    setMicModalOpen(true)
    setMicRecording(false)
  }

  const handleRecordVoice = () => {
    setMicRecording(true)
    setTimeout(() => {
      setMicRecording(false)
      setMicModalOpen(false)
      showToast('Parabéns! Gravação enviada com sucesso e +50 estrelas celestiais!')
    }, 3200)
  }

  const filteredSongs = selectedTheme === 'all'
    ? FEATURED_SONGS
    : FEATURED_SONGS.filter(s => s.theme === selectedTheme)

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse 80% 48% at 50% -8%, rgba(34, 197, 94, 0.12) 0%, rgba(19, 19, 21, 0.98) 52%, #0c0d10 100%)',
      color: '#e5e1e4',
      paddingBottom: showMiniPlayer ? 150 : 90,
      fontFamily: "'Baloo 2', -apple-system, BlinkMacSystemFont, sans-serif",
      userSelect: 'none'
    }}>
      {/* LAYOUT MUSICAL: NAVEGAÇÃO LATERAL NO DESKTOP */}
      <div className="cdk-music-layout">
        <aside className="cdk-music-sidebar" aria-label="Navegação musical">
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '4px 8px 18px' }}>
            <div style={{ width: 30, height: 30, borderRadius: 10, display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#052e16' }}>
              <Music size={17} />
            </div>
            <div>
              <strong style={{ display: 'block', color: '#fff', fontSize: 13 }}>Com Deus Kids</strong>
              <span style={{ color: '#4ade80', fontSize: 10, fontWeight: 800, letterSpacing: '.08em' }}>MÚSICAS</span>
            </div>
          </div>

          <div className="cdk-music-sidebar-group">
            <button onClick={() => navigate('/inicio')}><Compass size={17} />Início</button>
            <button className="active" onClick={() => setSelectedTheme('all')}><Music size={17} />Músicas & Louvores</button>
            <button onClick={() => showToast('Busca musical em breve')}><Radio size={17} />Explorar</button>
          </div>

          <div className="cdk-music-sidebar-divider" />
          <p className="cdk-music-sidebar-label">SUA BIBLIOTECA</p>
          <div className="cdk-music-sidebar-group">
            <button onClick={() => showToast('Seus favoritos estão sendo sincronizados')}><Heart size={17} />Curtidas</button>
            <button onClick={() => showToast('Suas playlists aparecem aqui')}><BookOpen size={17} />Playlists</button>
          </div>

          <p className="cdk-music-sidebar-label">POR TEMA</p>
          <div className="cdk-music-sidebar-group">
            <button onClick={() => setSelectedTheme('coragem')}><Shield size={17} />Coragem & Fé</button>
            <button onClick={() => setSelectedTheme('amor')}><Heart size={17} />Amor de Deus</button>
            <button onClick={() => setSelectedTheme('gratidao')}><Sparkles size={17} />Gratidão</button>
          </div>
        </aside>

        {/* CONTEÚDO PRINCIPAL */}
        <div className="cdk-container cdk-music-content" style={{ paddingTop: 'clamp(64px, 7vh, 88px)', paddingBottom: 64, paddingLeft: 0, paddingRight: 0 }}>

      {/* 1. HERO MUSICAL BILLBOARD (1:1 STITCH) */}
      <section style={{ padding: '0 0 28px' }}>
        <div style={{
          position: 'relative',
          width: '100%',
          borderRadius: 'clamp(18px, 2vw, 30px)',
          overflow: 'hidden',
          backgroundColor: '#1c1b1d',
          borderTop: '1px solid rgba(34, 197, 94, 0.3)'
        }}>
          {/* Visual Backdrop Campfire */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: 'clamp(360px, calc(100vh - 260px), 520px)',
            backgroundImage: "url('/banners/louvores_hero_campfire.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}>
            {/* Scrims de Fusão */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, #0e0e10 0%, rgba(14, 14, 16, 0.65) 50%, transparent 100%)'
            }} />
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to right, rgba(14, 14, 16, 0.8) 0%, transparent 60%)'
            }} />

            {/* Badge Flutuante no Topo */}
            <div style={{
              position: 'absolute',
              top: 16,
              right: 16,
              backgroundColor: 'rgba(53, 52, 55, 0.8)',
              backdropFilter: 'blur(10px)',
              padding: '4px 12px',
              borderRadius: 9999,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}>
              <Sparkles size={14} color="#ffb95f" />
              <span style={{ fontSize: 10, fontWeight: 800, color: '#ffb95f', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Especial
              </span>
            </div>

            {/* Hero Bottom Details */}
            <div style={{
              position: 'absolute',
              inset: 'auto 0 0 0',
              padding: 'clamp(24px, 3vw, 40px)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}>
              {/* Metadata Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: 9999,
                  backgroundColor: '#22c55e',
                  color: '#052e16',
                  fontSize: 10,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em'
                }}>
                  Novo Álbum
                </span>
                <span style={{ color: '#cbc3d7', fontSize: 12 }}>•</span>
                <span style={{
                  color: '#ffb95f',
                  fontSize: 12,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}>
                  <Users size={14} />
                  Turminha Com Deus
                </span>
              </div>

              {/* Title */}
              <h1 style={{
                fontSize: 'clamp(26px, 6vw, 32px)',
                fontWeight: 800,
                color: '#ffffff',
                lineHeight: 1.15,
                margin: 0,
                textShadow: '0 2px 10px rgba(0,0,0,0.8)'
              }}>
                Louvores para Cantar Juntos
              </h1>

              {/* Subtitle */}
              <p style={{
                fontSize: 13,
                color: '#cbc3d7',
                lineHeight: 1.45,
                margin: 0,
                maxWidth: '92%',
                textShadow: '0 1px 4px rgba(0,0,0,0.8)'
              }}>
                Canções inspiradoras para memorizar versículos, adorar e se divertir com toda a família!
              </p>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 6 }}>
                <button
                  onClick={() => {
                    handlePlayTrack(TRACKS_CONTINUE[0])
                    setExpandedPlayer(true)
                  }}
                  style={{
                    flex: 1,
                    height: 46,
                    borderRadius: 12,
                    backgroundColor: '#22c55e',
                    color: '#052e16',
                    fontSize: 14,
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 0 20px rgba(34, 197, 94, 0.45)',
                    transition: 'transform 0.15s'
                  }}
                >
                  <Play size={20} fill="#052e16" color="#052e16" />
                  <span>Ouvir Agora</span>
                </button>

                <button
                  aria-label="Adicionar à lista"
                  onClick={() => {
                    setIsSavedAlbum(!isSavedAlbum)
                    showToast(isSavedAlbum ? 'Removido da Minha Lista' : 'Álbum salvo na Minha Lista!')
                  }}
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 12,
                    backgroundColor: 'rgba(57, 57, 59, 0.5)',
                    backdropFilter: 'blur(12px)',
                    border: 'none',
                    color: isSavedAlbum ? '#ffb95f' : '#e5e1e4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    transition: 'transform 0.15s'
                  }}
                >
                  <Bookmark size={20} fill={isSavedAlbum ? '#ffb95f' : 'none'} />
                </button>

                <button
                  aria-label="Compartilhar"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: 'Louvores para Cantar Juntos', url: window.location.href })
                    } else {
                      navigator.clipboard.writeText(window.location.href)
                      showToast('Link do álbum copiado!')
                    }
                  }}
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 12,
                    backgroundColor: 'rgba(57, 57, 59, 0.5)',
                    backdropFilter: 'blur(12px)',
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
                  <Share2 size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TEMAS MUSICAIS (INTERACTIVE CATEGORY CHIPS) */}
      <section style={{ width: '100%', padding: '0 0 20px 0' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 4,
          scrollbarWidth: 'none'
        }}>
          {THEMES.map((theme) => {
            const Icon = theme.icon
            const isSelected = selectedTheme === theme.key
            return (
              <button
                key={theme.key}
                onClick={() => setSelectedTheme(theme.key)}
                style={{
                  flexShrink: 0,
                  padding: '8px 16px',
                  borderRadius: 9999,
                  backgroundColor: isSelected ? '#22c55e' : '#2a2a2c',
                  color: isSelected ? '#052e16' : '#9ca3af',
                  fontSize: 12,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 2px 12px rgba(34, 197, 94, 0.35)' : 'none',
                  transition: 'all 0.15s'
                }}
              >
                <Icon size={15} color={isSelected ? '#052e16' : (theme.color || '#9ca3af')} />
                <span>{theme.label}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* 3. CONTINUE OUVINDO (HORIZONTAL TRACK PROGRESSION) */}
      <section style={{ width: '100%', padding: '0 0 28px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#ffb95f',
              boxShadow: '0 0 8px #ffb95f'
            }} />
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#e5e1e4', margin: 0 }}>
              Continue Ouvindo
            </h2>
          </div>
          <span
            onClick={() => showToast('Histórico completo em sincronização')}
            style={{ fontSize: 12, fontWeight: 700, color: '#22c55e', cursor: 'pointer' }}
          >
            Ver histórico
          </span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          overflowX: 'auto',
          paddingBottom: 8,
          scrollbarWidth: 'none'
        }}>
          {TRACKS_CONTINUE.map((track) => (
            <div
              key={track.id}
              onClick={() => handlePlayTrack(track)}
              style={{
                flexShrink: 0,
                width: 240,
                backgroundColor: '#201f21',
                borderRadius: 14,
                overflow: 'hidden',
                boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
                cursor: 'pointer',
                transition: 'transform 0.15s'
              }}
            >
              <div style={{
                position: 'relative',
                width: '100%',
                height: 120,
                backgroundImage: `url(${track.coverUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(14, 14, 16, 0.4)'
                }} />

                {track.badge && (
                  <div style={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    padding: '2px 8px',
                    borderRadius: 9999,
                    backgroundColor: 'rgba(14, 14, 16, 0.85)',
                    color: '#ffb95f',
                    fontSize: 10,
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}>
                    <Star size={11} fill="#ffb95f" />
                    <span>{track.badge}</span>
                  </div>
                )}

                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    backgroundColor: currentPlayingTrack.id === track.id && isPlaying ? '#ffb95f' : '#22c55e',
                    color: '#052e16',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
                  }}>
                    {currentPlayingTrack.id === track.id && isPlaying
                      ? <Pause size={20} fill="#052e16" />
                      : <Play size={20} fill="#052e16" style={{ marginLeft: 2 }} />}
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  backgroundColor: 'rgba(57, 57, 59, 0.6)'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${track.progressPercent || 50}%`,
                    backgroundColor: '#ffb95f',
                    borderRadius: 9999
                  }} />
                </div>
              </div>

              <div style={{ padding: '10px 12px' }}>
                <span style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: '#e5e1e4',
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {track.title}
                </span>
                <span style={{
                  fontSize: 12,
                  color: '#cbc3d7',
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  margin: '2px 0 6px'
                }}>
                  {track.artist}
                </span>

                <div style={{
                  width: '100%',
                  height: 4,
                  borderRadius: 9999,
                  backgroundColor: '#353437',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${track.progressPercent || 50}%`,
                    height: '100%',
                    backgroundColor: '#22c55e'
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontSize: 10, color: '#cbc3d7' }}>
                    {track.duration}
                  </span>
                  <span style={{ fontSize: 10, color: '#22c55e', fontWeight: 700 }}>
                    {track.remainingText}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. MÚSICAS EM DESTAQUE (SQUARE ALBUM GRID RESPONSIVO) */}
      <section style={{ width: '100%', padding: '0 0 28px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#e5e1e4', margin: 0 }}>
              Músicas em Destaque
            </h2>
            <p style={{ fontSize: 12, color: '#cbc3d7', margin: '2px 0 0' }}>
              As canções favoritas de milhares de pequenos
            </p>
          </div>
          <button
            onClick={() => showToast('Classificando por mais ouvidas')}
            style={{
              padding: 8,
              borderRadius: '50%',
              backgroundColor: '#201f21',
              color: '#cbc3d7',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
          {filteredSongs.map((song) => (
            <div
              key={song.id}
              onClick={() => handlePlayTrack(song)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                backgroundColor: '#1c1b1d',
                borderRadius: 14,
                padding: 6,
                cursor: 'pointer',
                transition: 'transform 0.15s'
              }}
            >
              <div style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '1/1',
                borderRadius: 10,
                overflow: 'hidden',
                backgroundColor: '#2a2a2c'
              }}>
                <img
                  src={song.coverUrl}
                  alt={song.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/banners/louvores_hero_campfire.jpg'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.15)'
                }} />

                {song.badge && (
                  <div style={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    padding: '2px 8px',
                    borderRadius: 9999,
                    backgroundColor: song.badge === 'Top 1' ? '#22c55e' : '#ee9800',
                    color: song.badge === 'Top 1' ? '#052e16' : '#fff',
                    fontSize: 10,
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.4)'
                  }}>
                    <Star size={10} fill={song.badge === 'Top 1' ? '#052e16' : '#fff'} />
                    <span>{song.badge}</span>
                  </div>
                )}

                <div style={{
                  position: 'absolute',
                  bottom: 8,
                  right: 8,
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(14, 14, 16, 0.8)',
                  backdropFilter: 'blur(8px)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Play size={14} fill="#ffffff" />
                </div>
              </div>

              <div style={{ padding: '0 4px 4px' }}>
                <span style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: '#e5e1e4',
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {song.title}
                </span>
                <span style={{
                  fontSize: 11,
                  color: '#cbc3d7',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {song.artist} • {song.duration}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. ÁLBUNS E COLEÇÕES */}
      <section style={{ width: '100%', padding: '0 0 28px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#e5e1e4', margin: 0 }}>Álbuns para celebrar</h2>
            <p style={{ fontSize: 12, color: '#cbc3d7', margin: '2px 0 0' }}>Coleções para cada momento com Deus</p>
          </div>
          <button onClick={() => showToast('Mais álbuns chegando em breve')} style={{ background: 'none', border: 0, color: '#22c55e', cursor: 'pointer', fontSize: 12, fontWeight: 800 }}>Ver todos</button>
        </div>
        <div className="cdk-music-album-grid">
          {MUSIC_COLLECTIONS.map((album) => (
            <button key={`album-${album.id}`} type="button" onClick={() => handlePlayTrack(album)} className="cdk-music-album-card">
              <img src={album.coverUrl} alt="" />
              <strong>{album.title}</strong>
              <span>{album.artist}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 5. PLAYLISTS PARA VOCÊ (CURATED STORY BANNERS) */}
      <section style={{ width: '100%', padding: '0 0 28px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#e5e1e4', margin: 0 }}>
              Playlists para Você
            </h2>
            <p style={{ fontSize: 12, color: '#cbc3d7', margin: '2px 0 0' }}>
              Momentos pensados para o dia e a noite
            </p>
          </div>
          <button
            onClick={() => showToast('Explorando todas as playlists!')}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: '#201f21',
              color: '#cbc3d7',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <ArrowRight size={16} />
          </button>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          overflowX: 'auto',
          paddingBottom: 8,
          scrollbarWidth: 'none'
        }}>
          {PLAYLISTS.map((pl) => {
            const Icon = pl.icon
            return (
              <div
                key={pl.id}
                onClick={() => showToast(`Iniciando playlist: ${pl.title}`)}
                style={{
                  flexShrink: 0,
                  width: 200,
                  borderRadius: 16,
                  padding: 16,
                  backgroundColor: '#201f21',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 6px 18px rgba(0,0,0,0.35)',
                  cursor: 'pointer',
                  transition: 'transform 0.15s'
                }}
              >
                <div style={{
                  position: 'absolute',
                  right: -16,
                  bottom: -16,
                  width: 90,
                  height: 90,
                  borderRadius: '50%',
                  backgroundColor: `${pl.accentColor}20`,
                  filter: 'blur(20px)',
                  pointerEvents: 'none'
                }} />

                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: `${pl.accentColor}25`,
                  color: pl.accentColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 14
                }}>
                  <Icon size={24} />
                </div>

                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#e5e1e4', margin: '0 0 4px', lineHeight: 1.2 }}>
                  {pl.title}
                </h3>
                <p style={{ fontSize: 11, color: '#cbc3d7', margin: 0, lineHeight: 1.4, minHeight: 32 }}>
                  {pl.description}
                </p>

                <div style={{
                  marginTop: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  color: pl.accentColor,
                  fontSize: 11,
                  fontWeight: 700
                }}>
                  <span>{pl.trackCount} músicas</span>
                  <span>•</span>
                  <span>{pl.totalMinutes} min</span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* 6. WEEKLY SINGING CHALLENGE (INTERACTIVE CARD) */}
      <section style={{ padding: '0 0 28px 0' }}>
        <div style={{
          width: '100%',
          borderRadius: 20,
          padding: 16,
          background: 'linear-gradient(90deg, rgba(34, 197, 94, 0.25) 0%, rgba(32, 31, 33, 0.9) 60%, rgba(42, 42, 44, 0.9) 100%)',
          border: '1px solid rgba(34, 197, 94, 0.25)',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: '72%' }}>
            <span style={{
              padding: '2px 8px',
              borderRadius: 9999,
              backgroundColor: '#ffb95f',
              color: '#472a00',
              fontSize: 10,
              fontWeight: 800,
              width: 'fit-content',
              textTransform: 'uppercase'
            }}>
              Desafio da Semana
            </span>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Aprenda o Salmo 23 cantando!
            </h3>
            <p style={{ fontSize: 12, color: '#cbc3d7', margin: 0, lineHeight: 1.35 }}>
              Grave com a turminha e ganhe a medalhinha Estrela de Ouro.
            </p>
          </div>

          <button
            onClick={handleStartMicChallenge}
            style={{
              width: 54,
              height: 54,
              borderRadius: 16,
              backgroundColor: '#22c55e',
              color: '#052e16',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(34, 197, 94, 0.45)',
              border: 'none',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'transform 0.15s'
            }}
          >
            <Mic size={26} />
          </button>
        </div>
      </section>

        </div>{/* fim conteúdo principal */}

        <aside className="cdk-music-right-rail" aria-label="Destaques musicais">
          <p className="cdk-music-sidebar-label">EM ALTA AGORA</p>
          <div className="cdk-music-now-playing">
            <img src={currentPlayingTrack.coverUrl} alt="" />
            <div><strong>{currentPlayingTrack.title}</strong><span>{currentPlayingTrack.artist}</span></div>
            <button type="button" onClick={handleTogglePlay} aria-label="Pausar ou tocar">{isPlaying ? <Pause size={15} /> : <Play size={15} />}</button>
          </div>
          <div className="cdk-music-sidebar-divider" />
          <p className="cdk-music-sidebar-label">RECOMENDADO PARA VOCÊ</p>
          {FEATURED_SONGS.slice(0, 3).map((song, index) => (
            <button key={song.id} type="button" className="cdk-music-rail-track" onClick={() => handlePlayTrack(song)}>
              <span>{index + 1}</span><img src={song.coverUrl} alt="" /><div><strong>{song.title}</strong><small>{song.artist}</small></div>
            </button>
          ))}
        </aside>
      </div>{/* fim layout musical */}

      {/* 7. DOCKED FLOATING MINI-PLAYER (1:1 STITCH) */}
      {showMiniPlayer && (
        <div style={{
          position: 'fixed',
          bottom: 74,
          left: 16,
          right: 16,
          zIndex: 40,
          maxWidth: 500,
          margin: '0 auto'
        }}>
          <div style={{
            backgroundColor: 'rgba(32, 31, 33, 0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: 14,
            padding: '8px 12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12
          }}>
            <div
              onClick={() => setExpandedPlayer(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden', minWidth: 0, cursor: 'pointer' }}
            >
              <div style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                backgroundColor: '#2a2a2c',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#22c55e'
              }}>
                <Music size={20} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#e5e1e4',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {currentPlayingTrack.title}
                </span>
                <span style={{
                  fontSize: 11,
                  color: '#cbc3d7',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {currentPlayingTrack.artist}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <button
                aria-label="Reproduzir ou Pausar"
                onClick={handleTogglePlay}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: 'none',
                  border: 'none',
                  color: '#22c55e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
              </button>

              <button
                aria-label="Fechar Player"
                onClick={() => setShowMiniPlayer(false)}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: 'none',
                  border: 'none',
                  color: '#cbc3d7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DESAFIO DO MICROFONE */}
      {micModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          backgroundColor: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16
        }}>
          <div style={{
            width: '100%',
            maxWidth: 360,
            backgroundColor: '#201f21',
            borderRadius: 20,
            padding: 24,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
            border: '1px solid #353437'
          }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: micRecording ? 'rgba(255, 180, 171, 0.3)' : 'rgba(34, 197, 94, 0.2)',
              color: micRecording ? '#ffb4ab' : '#22c55e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: micRecording ? '0 0 24px rgba(255, 180, 171, 0.6)' : 'none',
              transition: 'all 0.3s'
            }}>
              <Mic size={32} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0 }}>
                {micRecording ? 'Gravando sua voz...' : 'Cante o Salmo 23!'}
              </h3>
              <p style={{ fontSize: 13, color: '#cbc3d7', margin: 0, lineHeight: 1.4 }}>
                {micRecording
                  ? '"O Senhor é o meu pastor, nada me faltará..."'
                  : 'Aperte o botão abaixo, cante junto com a melodia e ganhe sua medalha de ouro!'}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 8 }}>
              {!micRecording ? (
                <button
                  onClick={handleRecordVoice}
                  style={{
                    width: '100%',
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: '#22c55e',
                    color: '#052e16',
                    fontSize: 14,
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Começar a Gravar
                </button>
              ) : (
                <div style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: '#ffb4ab',
                  animation: 'pulse 1s infinite'
                }}>
                  Ouvindo sua linda voz... 🎵
                </div>
              )}

              <button
                onClick={() => setMicModalOpen(false)}
                style={{
                  width: '100%',
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: 'transparent',
                  color: '#cbc3d7',
                  fontSize: 13,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST FLUTUANTE */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: showMiniPlayer ? 135 : 80,
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

      {/* FULL SCREEN EXPANDED MUSIC PLAYER (1:1 STITCH) */}
      {expandedPlayer && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          backgroundColor: '#131315',
          overflowY: 'auto'
        }}>
          <PlayerMusical
            track={{
              id: currentPlayingTrack.id,
              title: currentPlayingTrack.title,
              artist: currentPlayingTrack.artist,
              album: 'Álbum Heróis',
              playlistName: 'Louvores de Fé',
              coverUrl: currentPlayingTrack.coverUrl,
              categoryBadge: 'Heróis da Fé',
              contentSlug: 'davi-e-golias',
              totalDurationSec: 204,
              lyrics: {
                prev: 'O gigante era forte, mas o Senhor me guardou...',
                current: '♪ Mesmo pequeno eu não vou temer, com Deus na frente eu vou vencer! ♪',
                next1: 'Com cinco pedrinhas e a fé no coração...',
                next2: 'Vitória pra todo o Seu povo brilhou!'
              }
            }}
            onMinimize={() => setExpandedPlayer(false)}
          />
        </div>
      )}
    </div>
  )
}
