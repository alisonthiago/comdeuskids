import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Volume2, VolumeX, ArrowLeft, Heart, MessageSquare, Share2,
  Bookmark, ChevronDown, ChevronUp, Play, Pause, Disc,
  Sparkles, Check, X, Send, Music2
} from 'lucide-react'
import { useProfile } from '../context/ProfileContext'

interface ClipItem {
  id: string
  title: string
  description: string
  hashtags: string[]
  creatorName: string
  creatorBadge: string
  creatorAvatar: string
  audioTitle: string
  backdropImage: string
  videoUrl: string
  likes: number
  commentsCount: number
  fullContentRoute: string
}

const CLIPS_FEED: ClipItem[] = [
  {
    id: 'davi-harpa',
    title: 'Corajoso Como Davi — Clipe Oficial 3D ⚔️',
    description: 'Davi dedilha sua harpa e louva a Deus com fé antes de enfrentar o gigante Golias!',
    hashtags: ['#ComDeusKids', '#DaviEGolias', '#Coragem', '#Fé'],
    creatorName: 'Turminha Com Deus',
    creatorBadge: 'Oficial',
    creatorAvatar: '/avatars/davi.png',
    audioTitle: '♫ Som original • Louvores Com Deus Kids',
    backdropImage: '/banners/hero_davi_golias.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    likes: 858000,
    commentsCount: 3527,
    fullContentRoute: '/conteudo/davi-e-golias'
  },
  {
    id: 'cante-com-noe',
    title: 'Cante com Noé! A Bicharada no Ritmo da Fé 🌈🦁',
    description: 'Os animais entram de dois em dois na Arca cantando louvores sob a aliança do arco-íris!',
    hashtags: ['#ArcaDeNoé', '#Alegria', '#Animais', '#Promessa'],
    creatorName: 'Turminha Com Deus',
    creatorBadge: 'Oficial',
    creatorAvatar: '/avatars/sara.png',
    audioTitle: '♫ O Arco-Íris da Promessa • Com Deus Kids',
    backdropImage: '/thumbnails/cante_com_noe.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    likes: 420000,
    commentsCount: 1890,
    fullContentRoute: '/serie/a-arca-de-noe'
  },
  {
    id: 'soldadinho-cristo',
    title: 'Soldadinho de Cristo — A Armadura de Deus 🛡️✨',
    description: 'Coloque o capacete da salvação, a couraça da justiça e empunhe o escudo da fé!',
    hashtags: ['#Soldadinho', '#ArmaduraDeDeus', '#HeróisDaFé'],
    creatorName: 'Turminha Com Deus',
    creatorBadge: 'Oficial',
    creatorAvatar: '/avatars/pedro.png',
    audioTitle: '♫ Marcha da Vitória • Soldadinhos do Rei',
    backdropImage: '/thumbnails/soldadinho_cristo.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    likes: 612000,
    commentsCount: 2410,
    fullContentRoute: '/conteudo/davi-e-golias'
  },
  {
    id: 'louvores-coracao',
    title: 'Aleluia nas Estrelas — Louvores do Coração Kids 🌟🎸',
    description: 'Uma canção mágica de agradecimento ao Criador das estrelas e do universo!',
    hashtags: ['#Aleluia', '#Criação', '#LouvorInfantil'],
    creatorName: 'Turminha Com Deus',
    creatorBadge: 'Oficial',
    creatorAvatar: '/avatars/sara.png',
    audioTitle: '♫ Aleluia nas Estrelas • Turminha Com Deus',
    backdropImage: '/thumbnails/louvores_coracao.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    likes: 315000,
    commentsCount: 980,
    fullContentRoute: '/musicas'
  },
  {
    id: 'milagres-tempestade',
    title: 'O Mestre Acalma a Tempestade — Milagres no Mar ⛵🌊',
    description: 'Quando as ondas parecerem altas, lembre-se: Jesus tem poder sobre o vento e o mar!',
    hashtags: ['#MilagresDeJesus', '#Paz', '#Confiança'],
    creatorName: 'Turminha Com Deus',
    creatorBadge: 'Oficial',
    creatorAvatar: '/avatars/davi.png',
    audioTitle: '♫ Acalma a Tempestade • Com Deus Kids',
    backdropImage: '/banners/arca_noe_banner.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    likes: 540000,
    commentsCount: 2150,
    fullContentRoute: '/videos'
  }
]

export default function Clips() {
  const navigate = useNavigate()
  const { isInMyList, toggleMyList, activeProfile } = useProfile()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(true)
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({ 'davi-harpa': true })
  const [likesCountMap, setLikesCountMap] = useState<Record<string, number>>({
    'davi-harpa': 858000,
    'cante-com-noe': 420000,
    'soldadinho-cristo': 612000,
    'louvores-coracao': 315000,
    'milagres-tempestade': 540000
  })
  const [showComments, setShowComments] = useState(false)
  const [commentsList, setCommentsList] = useState<string[]>([
    'Minha filha amou esse louvor! Canta o dia todo 🙏❤️',
    'Que animação linda e abençoada!',
    'Glória a Deus por conteúdos seguros e edificantes para nossas crianças!'
  ])
  const [newComment, setNewComment] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const feedContainerRef = useRef<HTMLDivElement>(null)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const lastScrollTime = useRef<number>(0)
  const touchStartY = useRef<number | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2500)
  }

  // Formatar números grandes (ex: 858 mil)
  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1).replace('.0', '')} mi`
    if (count >= 1000) return `${(count / 1000).toFixed(0)} mil`
    return `${count}`
  }

  // Pular para o próximo vídeo com snap suave
  const scrollToClip = useCallback((index: number) => {
    if (index < 0 || index >= CLIPS_FEED.length) return
    setCurrentIndex(index)
    setProgress(0)

    const container = feedContainerRef.current
    if (container) {
      const targetChild = container.children[index] as HTMLElement
      if (targetChild) {
        targetChild.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }, [])

  const handleNext = () => {
    if (currentIndex < CLIPS_FEED.length - 1) {
      scrollToClip(currentIndex + 1)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      scrollToClip(currentIndex - 1)
    }
  }

  // Controlar reprodução quando o índice muda
  useEffect(() => {
    videoRefs.current.forEach((vid, idx) => {
      if (!vid) return
      if (idx === currentIndex) {
        vid.currentTime = 0
        vid.muted = isMuted
        vid.play().catch(() => {})
        setIsPlaying(true)
      } else {
        vid.pause()
      }
    })
  }, [currentIndex, isMuted])

  // Atualizar barra de progresso do vídeo ativo
  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const vid = e.currentTarget
    if (vid.duration) {
      setProgress((vid.currentTime / vid.duration) * 100)
    }
  }

  // Alternar Play / Pause
  const togglePlay = () => {
    const currentVideo = videoRefs.current[currentIndex]
    if (!currentVideo) return
    if (currentVideo.paused) {
      currentVideo.play().catch(() => {})
      setIsPlaying(true)
    } else {
      currentVideo.pause()
      setIsPlaying(false)
    }
  }

  // Curtir vídeo
  const handleToggleLike = (clipId: string) => {
    const isLiked = !!likedMap[clipId]
    setLikedMap(prev => ({ ...prev, [clipId]: !isLiked }))
    setLikesCountMap(prev => ({
      ...prev,
      [clipId]: (prev[clipId] || 0) + (isLiked ? -1 : 1)
    }))
  }

  // Salvar na Minha Lista (Per-Profile)
  const handleToggleSave = (clipId: string) => {
    toggleMyList(clipId)
    const isSaved = isInMyList(clipId)
    showToast(isSaved ? 'Removido da Minha Lista' : `Salvo para ${activeProfile?.name || 'seu perfil'}!`)
  }

  // Compartilhar
  const handleShare = (clip: ClipItem) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
    }
    showToast('Link do clipe copiado!')
  }

  // Adicionar comentário
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    setCommentsList(prev => [newComment.trim(), ...prev])
    setNewComment('')
    setLikesCountMap(prev => ({
      ...prev,
      [CLIPS_FEED[currentIndex].id]: (prev[CLIPS_FEED[currentIndex].id] || 0)
    }))
  }

  // Navegação por teclado: [Seta Baixo] / [Seta Cima] / [Espaço]
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault()
        handleNext()
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault()
        handlePrev()
      } else if (e.key === ' ') {
        e.preventDefault()
        togglePlay()
      } else if (e.key === 'm' || e.key === 'M') {
        setIsMuted(prev => !prev)
      } else if (e.key === 'Escape') {
        navigate('/inicio')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, isPlaying])

  // Capturar Mouse Wheel com Snap Inteligente (evita scroll contínuo e pula de 1 em 1)
  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now()
    if (now - lastScrollTime.current < 550) return // Throttle de 550ms
    if (Math.abs(e.deltaY) > 25) {
      lastScrollTime.current = now
      if (e.deltaY > 0) {
        handleNext()
      } else {
        handlePrev()
      }
    }
  }

  // Touch Swipe para celular e tablets
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return
    const touchEndY = e.changedTouches[0].clientY
    const diff = touchStartY.current - touchEndY

    if (diff > 45) {
      handleNext()
    } else if (diff < -45) {
      handlePrev()
    }
    touchStartY.current = null
  }

  return (
    <div
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#0b0b0d',
        color: '#ffffff',
        fontFamily: "'Baloo 2', -apple-system, BlinkMacSystemFont, sans-serif",
        overflow: 'hidden',
        zIndex: 50
      }}
    >
      {/* Toast flutuante */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#201f21',
          color: '#ffffff',
          border: '1px solid #22c55e',
          borderRadius: 14,
          padding: '10px 20px',
          fontSize: 13,
          fontWeight: 800,
          boxShadow: '0 12px 32px rgba(0,0,0,0.8)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <Sparkles size={16} color="#22c55e" />
          {toastMessage}
        </div>
      )}

      {/* Barra de Topo Discreta */}
      <header style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 64,
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 60,
        background: 'linear-gradient(180deg, rgba(11,11,13,0.8) 0%, transparent 100%)',
        pointerEvents: 'none'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, pointerEvents: 'auto' }}>
          <button
            type="button"
            onClick={() => navigate('/inicio')}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(10px)',
              border: 'none',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title="Voltar ao Início"
          >
            <ArrowLeft size={20} />
          </button>

          <span style={{
            fontSize: 16,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            Clipes Kids <span style={{ color: '#4ade80', fontSize: 13 }}>• Shorts</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, pointerEvents: 'auto' }}>
          <button
            type="button"
            onClick={() => setIsMuted(prev => !prev)}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(10px)',
              border: 'none',
              color: isMuted ? '#ffb4ab' : '#22c55e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title={isMuted ? 'Ativar som' : 'Silenciar'}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      </header>

      {/* CONTAINER VERTICAL COM SCROLL SNAP */}
      <div
        ref={feedContainerRef}
        style={{
          width: '100%',
          height: '100vh',
          overflowY: 'scroll',
          scrollSnapType: 'y mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {CLIPS_FEED.map((clip, index) => {
          const isCurrent = index === currentIndex
          const isLiked = !!likedMap[clip.id]
          const isSaved = isInMyList(clip.id)
          const likesCount = likesCountMap[clip.id] || clip.likes

          return (
            <div
              key={clip.id}
              style={{
                width: '100%',
                height: '100vh',
                scrollSnapAlign: 'start',
                scrollSnapStop: 'always',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                padding: '16px 20px'
              }}
            >
              {/* ÁREA CENTRAL: CARD DE VÍDEO 9:16 + BOTÕES LATERAIS IDÊNTICO AO YOUTUBE SHORTS */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: 16,
                height: 'min(calc(100vh - 36px), 840px)',
                position: 'relative'
              }}>
                {/* 1. O CARD DE VÍDEO VERTICAL 9:16 */}
                <div
                  onClick={togglePlay}
                  style={{
                    position: 'relative',
                    height: '100%',
                    aspectRatio: '9/16',
                    borderRadius: 20,
                    overflow: 'hidden',
                    backgroundColor: '#000000',
                    boxShadow: '0 16px 50px rgba(0, 0, 0, 0.9)',
                    cursor: 'pointer'
                  }}
                >
                  {/* Elemento de Vídeo com Fallback de Pôster */}
                  <video
                    ref={el => (videoRefs.current[index] = el)}
                    src={clip.videoUrl}
                    poster={clip.backdropImage}
                    playsInline
                    loop
                    muted={isMuted}
                    onTimeUpdate={isCurrent ? handleTimeUpdate : undefined}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />

                  {/* Scrims de Gradiente para Leitura Perfeita */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 25%, transparent 60%, rgba(0,0,0,0.92) 100%)',
                    pointerEvents: 'none'
                  }} />

                  {/* Ícone Play/Pause Central ao Clicar */}
                  {!isPlaying && isCurrent && (
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 68,
                      height: 68,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(0, 0, 0, 0.65)',
                      backdropFilter: 'blur(8px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      pointerEvents: 'none',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
                    }}>
                      <Play size={32} fill="#ffffff" style={{ marginLeft: 3 }} />
                    </div>
                  )}

                  {/* OVERLAY INFERIOR DO VÍDEO (Canal, Título, Hashtags, Som) */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '20px 18px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    pointerEvents: 'none'
                  }}>
                    {/* Linha do Canal + Seguir */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img
                        src={clip.creatorAvatar}
                        alt={clip.creatorName}
                        style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: '2px solid #22c55e' }}
                      />
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#ffffff' }}>
                        @{clip.creatorName.replace(/\s+/g, '')}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          showToast('Você está seguindo o canal!')
                        }}
                        style={{
                          backgroundColor: '#ffffff',
                          color: '#131315',
                          border: 'none',
                          borderRadius: 20,
                          padding: '4px 12px',
                          fontSize: 11,
                          fontWeight: 800,
                          cursor: 'pointer',
                          pointerEvents: 'auto'
                        }}
                      >
                        Inscrever-se
                      </button>
                    </div>

                    {/* Título do Clipe */}
                    <h2 style={{
                      fontSize: 'clamp(14px, 2vw, 15px)',
                      fontWeight: 800,
                      color: '#ffffff',
                      margin: 0,
                      lineHeight: 1.35,
                      textShadow: '0 2px 6px rgba(0,0,0,0.8)'
                    }}>
                      {clip.title}
                    </h2>

                    {/* Hashtags */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {clip.hashtags.map(tag => (
                        <span key={tag} style={{ fontSize: 12, fontWeight: 700, color: '#4ade80' }}>
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Áudio / Trilha Musical */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#cbc3d7' }}>
                      <Music2 size={13} color="#ffb95f" />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {clip.audioTitle}
                      </span>
                    </div>

                    {/* Barra de Progresso Fina no Rodapé */}
                    {isCurrent && (
                      <div style={{
                        width: '100%',
                        height: 3,
                        backgroundColor: 'rgba(255, 255, 255, 0.25)',
                        borderRadius: 2,
                        overflow: 'hidden',
                        marginTop: 4
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${progress}%`,
                          backgroundColor: '#22c55e'
                        }} />
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. BARRA VERTICAL LATERAL DIREITA DE AÇÕES (EXATO YOUTUBE SHORTS) */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 16,
                  paddingBottom: 8,
                  zIndex: 20
                }}>
                  {/* Curtir (Like) */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <button
                      type="button"
                      onClick={() => handleToggleLike(clip.id)}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        backgroundColor: isLiked ? 'rgba(34, 197, 94, 0.25)' : '#201f21',
                        border: 'none',
                        color: isLiked ? '#22c55e' : '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                        transition: 'transform 0.15s ease'
                      }}
                      title="Curtir"
                    >
                      <Heart size={24} fill={isLiked ? '#22c55e' : 'none'} color={isLiked ? '#22c55e' : '#ffffff'} />
                    </button>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#ffffff' }}>
                      {formatCount(likesCount)}
                    </span>
                  </div>

                  {/* Comentários */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <button
                      type="button"
                      onClick={() => setShowComments(true)}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        backgroundColor: '#201f21',
                        border: 'none',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                      }}
                      title="Comentários"
                    >
                      <MessageSquare size={22} />
                    </button>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#ffffff' }}>
                      {formatCount(clip.commentsCount)}
                    </span>
                  </div>

                  {/* Compartilhar */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <button
                      type="button"
                      onClick={() => handleShare(clip)}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        backgroundColor: '#201f21',
                        border: 'none',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                      }}
                      title="Compartilhar"
                    >
                      <Share2 size={22} />
                    </button>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#cbc3d7' }}>
                      Compartilhar
                    </span>
                  </div>

                  {/* Salvar na Minha Lista */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <button
                      type="button"
                      onClick={() => handleToggleSave(clip.id)}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        backgroundColor: isSaved ? 'rgba(255, 185, 95, 0.25)' : '#201f21',
                        border: 'none',
                        color: isSaved ? '#ffb95f' : '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                      }}
                      title="Minha Lista"
                    >
                      <Bookmark size={22} fill={isSaved ? '#ffb95f' : 'none'} />
                    </button>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#cbc3d7' }}>
                      Salvar
                    </span>
                  </div>

                  {/* Ícone de Trilha Musical Giratória */}
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      backgroundColor: '#1c1b1d',
                      border: '2px solid #22c55e',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffb95f',
                      boxShadow: '0 4px 14px rgba(34, 197, 94, 0.4)',
                      marginTop: 4
                    }}
                  >
                    <Disc size={22} />
                  </div>

                  {/* 3. BOTÕES DE NAVEGAÇÃO RÁPIDA (PULAR PARA PRÓXIMO / ANTERIOR) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={handlePrev}
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          backgroundColor: '#201f21',
                          border: '1px solid #353437',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                        }}
                        title="Clipe Anterior (↑)"
                      >
                        <ChevronUp size={24} />
                      </button>
                    )}

                    {index < CLIPS_FEED.length - 1 && (
                      <button
                        type="button"
                        onClick={handleNext}
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          backgroundColor: '#201f21',
                          border: '1px solid #353437',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                        }}
                        title="Próximo Clipe (↓)"
                      >
                        <ChevronDown size={24} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* DRAWER / MODAL LATERAL DE COMENTÁRIOS */}
      {showComments && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(420px, 100vw)',
          backgroundColor: '#1c1b1d',
          borderLeft: '1px solid #2a2a2c',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.8)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Topo do Drawer */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid #2a2a2c'
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Comentários ({commentsList.length})
            </h3>
            <button
              type="button"
              onClick={() => setShowComments(false)}
              style={{ background: 'none', border: 'none', color: '#cbc3d7', cursor: 'pointer', padding: 4 }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Lista de Comentários */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {commentsList.map((comm, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(34, 197, 94, 0.2)',
                  color: '#22c55e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: 13,
                  flexShrink: 0
                }}>
                  {String.fromCharCode(65 + (idx % 6))}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#958ea0', marginBottom: 2 }}>
                    Família Abençoada • {idx === 0 ? 'Agora mesmo' : `Há ${idx * 3} horas`}
                  </div>
                  <div style={{ fontSize: 13, color: '#e5e1e4', lineHeight: 1.4 }}>
                    {comm}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input de Novo Comentário */}
          <form
            onSubmit={handleAddComment}
            style={{
              padding: '16px 20px',
              borderTop: '1px solid #2a2a2c',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              backgroundColor: '#131315'
            }}
          >
            <input
              type="text"
              placeholder="Adicionar um comentário abençoado..."
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              style={{
                flex: 1,
                backgroundColor: '#201f21',
                border: '1px solid #2a2a2c',
                borderRadius: 20,
                padding: '10px 16px',
                color: '#ffffff',
                fontSize: 13,
                outline: 'none'
              }}
            />
            <button
              type="submit"
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: '#22c55e',
                border: 'none',
                color: '#052e16',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              <Send size={16} color="#052e16" />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
