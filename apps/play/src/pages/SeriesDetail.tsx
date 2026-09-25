import React, { useState, useMemo } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, Search, Star, Play, ChevronRight, Plus, Check,
  Heart, Download, Share2, RotateCcw, Volume2, Maximize,
  Award, BookOpen, FileText, CheckCircle2, Bookmark, Sparkles, X,
  HelpCircle, Shield, ChevronDown, Flame, Film, Tv
} from 'lucide-react'
import { useProfile } from '../context/ProfileContext'
import { getAvatarImageUrl } from '../data/avatars'
import { STREAM_CATALOG } from '../data/streamCatalog'
import { StreamContent, StreamEpisode } from '@comdeuskids/types'

export default function SeriesDetail() {
  const navigate = useNavigate()
  const { slug } = useParams<{ slug: string }>()
  const { activeProfile, isInMyList, toggleMyList, watchProgress } = useProfile()

  // 1. Localizar série dinâmica por slug ou id no catálogo
  const seriesContent: StreamContent = useMemo(() => {
    return STREAM_CATALOG.find(c => c.slug === slug || c.id === slug) ||
      STREAM_CATALOG.find(c => c.type === 'series') ||
      STREAM_CATALOG[1]
  }, [slug])

  // 2. Temporadas estruturadas dinamicamente
  const seasonsData = useMemo(() => {
    if (seriesContent.seasons && seriesContent.seasons.length > 0) {
      return seriesContent.seasons
    }

    // Fallback estruturado se a série tiver episódios planos
    const eps = seriesContent.episodes || [
      {
        id: `${seriesContent.id}-ep-1`,
        episode_number: 1,
        season_number: 1,
        title: 'O Chamado da Fé',
        duration_minutes: 24,
        thumbnail_url: seriesContent.thumbnail_url,
        synopsis: 'O início de uma jornada extraordinária de obediência e coragem diante dos desafios.',
        video_url: seriesContent.video_url
      },
      {
        id: `${seriesContent.id}-ep-2`,
        episode_number: 2,
        season_number: 1,
        title: 'Construindo o Impossível',
        duration_minutes: 25,
        thumbnail_url: seriesContent.thumbnail_url,
        synopsis: 'A união da família e a dedicação ao plano divino contra todas as adversidades.',
        video_url: seriesContent.video_url
      },
      {
        id: `${seriesContent.id}-ep-3`,
        episode_number: 3,
        season_number: 1,
        title: 'Promessas de Deus',
        duration_minutes: 26,
        thumbnail_url: seriesContent.thumbnail_url,
        synopsis: 'A fidelidade do Criador se manifesta e a esperança brilha para toda a humanidade.',
        video_url: seriesContent.video_url
      }
    ]

    return [
      {
        id: `${seriesContent.id}-season-1`,
        season_number: 1,
        title: 'Temporada 1',
        episodes: eps
      },
      {
        id: `${seriesContent.id}-season-2`,
        season_number: 2,
        title: 'Temporada 2 (Em Breve)',
        episodes: [
          {
            id: `${seriesContent.id}-ep-2-1`,
            episode_number: 1,
            season_number: 2,
            title: 'Novos Horizontes de Esperança',
            duration_minutes: 25,
            thumbnail_url: seriesContent.thumbnail_url,
            synopsis: 'A aliança se renova com grandes lições de amor e propósito divino.',
            video_url: seriesContent.video_url
          }
        ]
      }
    ]
  }, [seriesContent])

  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number>(1)
  const [isLiked, setIsLiked] = useState<boolean>(true)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [showSeasonDropdown, setShowSeasonDropdown] = useState<boolean>(false)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Lista de episódios da temporada atualmente selecionada
  const currentSeason = seasonsData.find(s => s.season_number === selectedSeasonNumber) || seasonsData[0]
  const currentEpisodes = currentSeason.episodes || []

  // Total de episódios da série inteira
  const totalEpisodesCount = seasonsData.reduce((acc, s) => acc + (s.episodes?.length || 0), 0)

  // 3. Progresso do PERFIL ATIVO (Isolamento real entre perfis)
  // Localiza qual episódio o perfil ativo está assistindo ou deve continuar
  const resumeEpisodeInfo = useMemo(() => {
    // Procura por episódios com progresso em andamento
    for (const season of seasonsData) {
      for (const ep of (season.episodes || [])) {
        const prog = watchProgress[ep.id]
        if (prog && prog.progress_seconds > 10 && !prog.completed) {
          const pct = Math.round((prog.progress_seconds / (prog.duration_seconds || (ep.duration_minutes ? ep.duration_minutes * 60 : 1200))) * 100)
          const mins = Math.floor(prog.progress_seconds / 60)
          return {
            isNew: false,
            episode: ep,
            seasonNumber: season.season_number,
            progressSeconds: prog.progress_seconds,
            progressPct: Math.min(95, pct),
            label: `Continuar T${season.season_number}:E${ep.episode_number}`,
            subLabel: `"${ep.title}" • ${mins} min assistidos (${pct}%)`
          }
        }
      }
    }

    // Se nenhum em andamento, verifica o primeiro não assistido
    for (const season of seasonsData) {
      for (const ep of (season.episodes || [])) {
        const prog = watchProgress[ep.id]
        if (!prog || !prog.completed) {
          return {
            isNew: !prog,
            episode: ep,
            seasonNumber: season.season_number,
            progressSeconds: 0,
            progressPct: 0,
            label: !prog ? 'Começar Série' : `Assistir T${season.season_number}:E${ep.episode_number}`,
            subLabel: `T${season.season_number}:E${ep.episode_number} • "${ep.title}"`
          }
        }
      }
    }

    // Se todos concluídos, sugere o primeiro
    const firstEp = seasonsData[0]?.episodes?.[0]
    return {
      isNew: false,
      episode: firstEp,
      seasonNumber: 1,
      progressSeconds: 0,
      progressPct: 100,
      label: 'Assistir Novamente Ep. 1',
      subLabel: `T1:E1 • "${firstEp?.title || 'Episódio 1'}"`
    }
  }, [seasonsData, watchProgress])

  // Sincroniza a temporada ativa com a do episódio em andamento caso o usuário ainda não tenha trocado manualmente
  React.useEffect(() => {
    if (resumeEpisodeInfo?.seasonNumber) {
      setSelectedSeasonNumber(resumeEpisodeInfo.seasonNumber)
    }
  }, [resumeEpisodeInfo?.seasonNumber])

  // Iniciar reprodução do episódio no Player
  const handlePlayEpisode = (episodeId: string) => {
    navigate(`/assistir/${episodeId}`)
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
    }
    showToast('Link da série copiado!')
  }

  const inList = isInMyList(seriesContent.id)
  const profileName = activeProfile?.name || 'Davi'
  const profileAvatar = getAvatarImageUrl(activeProfile?.avatar_url)

  // Personagens representativos da história
  const characters = [
    { name: 'Noé', role: 'Homem de Fé e Obediência', avatar: '/avatars/davi.png' },
    { name: 'Esposa de Noé', role: 'Apoio e Dedicação', avatar: '/avatars/sara.png' },
    { name: 'Sem, Cam e Jafé', role: 'Os Filhos Construtores', avatar: '/avatars/pedro.png' },
    { name: 'Animais da Arca', role: 'A Criação de Deus Salva', avatar: '/avatars/rebeca.png' }
  ]

  // Recomendações "Você Também Pode Gostar"
  const similarItems = STREAM_CATALOG.filter(c => c.id !== seriesContent.id).slice(0, 4)

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#131315',
      color: '#e5e1e4',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      paddingBottom: 90
    }}>
      {/* Toast flutuante */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          backgroundColor: '#201f21',
          color: '#ffffff',
          border: '1px solid #22c55e',
          borderRadius: 14,
          padding: '12px 20px',
          fontSize: 14,
          fontWeight: 700,
          boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <CheckCircle2 size={18} color="#7bd0ff" />
          {toastMessage}
        </div>
      )}

      {/* ============================================================
          1. HERO CINEMATOGRÁFICO WIDESCREEN DA SÉRIE
          ============================================================ */}
      <section style={{
        position: 'relative',
        width: '100%',
        minHeight: 'clamp(420px, 60vh, 600px)',
        display: 'flex',
        alignItems: 'flex-end',
        backgroundImage: `url(${seriesContent.banner_url || seriesContent.thumbnail_url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 20%',
        overflow: 'hidden'
      }}>
        {/* Scrims de Gradiente para Leitura e Profundidade */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(19, 19, 21, 0.4) 0%, rgba(19, 19, 21, 0.75) 60%, #131315 100%)'
        }} />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, rgba(19, 19, 21, 0.92) 0%, rgba(19, 19, 21, 0.6) 45%, transparent 100%)'
        }} />

        {/* Botão Superior Voltar */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            position: 'absolute',
            top: 24,
            left: 'clamp(16px, 4vw, 48px)',
            zIndex: 10,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: 'rgba(19, 19, 21, 0.75)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 14,
            padding: '8px 16px',
            color: '#ffffff',
            fontSize: 13,
            fontWeight: 800,
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={16} />
          Voltar
        </button>

        {/* Informações da Série no Hero */}
        <div style={{
          position: 'relative',
          zIndex: 5,
          padding: '0 clamp(16px, 4vw, 48px) 36px',
          maxWidth: 900,
          display: 'flex',
          flexDirection: 'column',
          gap: 14
        }}>
          {/* Badges de Destaque */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{
              backgroundColor: '#22c55e',
              color: '#052e16',
              padding: '4px 12px',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}>
              Série Original Com Deus Kids
            </span>

            <span style={{
              backgroundColor: 'rgba(255, 185, 95, 0.18)',
              color: '#ffb95f',
              padding: '4px 10px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}>
              <Star size={13} fill="#ffb95f" /> 98% recomendado
            </span>

            <span style={{ color: '#cbc3d7', fontSize: 13, fontWeight: 700 }}>2026</span>
            <span style={{ color: '#494454' }}>•</span>
            <span style={{
              backgroundColor: 'rgba(0, 155, 209, 0.2)',
              color: '#7bd0ff',
              padding: '2px 8px',
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 800
            }}>
              {seriesContent.age_range || 'LIVRE'}
            </span>
            <span style={{ color: '#494454' }}>•</span>
            <span style={{ color: '#cbc3d7', fontSize: 13, fontWeight: 700 }}>
              {seasonsData.length} Temporadas
            </span>
            <span style={{ color: '#494454' }}>•</span>
            <span style={{ color: '#cbc3d7', fontSize: 13, fontWeight: 700 }}>
              {totalEpisodesCount} Episódios
            </span>
            <span style={{
              backgroundColor: 'rgba(238, 152, 0, 0.25)',
              color: '#ffb95f',
              padding: '2px 8px',
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 800
            }}>
              4K HDR
            </span>
          </div>

          {/* Título Gigante da Série */}
          <h1 style={{
            fontSize: 'clamp(32px, 5vw, 56px)',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            margin: 0
          }}>
            {seriesContent.title}
          </h1>

          {/* Sinopse da Série */}
          <p style={{
            fontSize: 'clamp(14px, 1.8vw, 16px)',
            lineHeight: 1.6,
            color: '#cbc3d7',
            margin: 0,
            maxWidth: 780
          }}>
            {seriesContent.description}
          </p>

          {/* Botões de Ação do Hero */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginTop: 8 }}>
            {/* Botão Dinâmico de Continuar / Começar */}
            <button
              type="button"
              onClick={() => resumeEpisodeInfo.episode && handlePlayEpisode(resumeEpisodeInfo.episode.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                backgroundColor: '#22c55e',
                color: '#052e16',
                border: 'none',
                borderRadius: 16,
                padding: '14px 28px',
                fontSize: 15,
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(34, 197, 94, 0.4)',
                transition: 'transform 0.2s ease'
              }}
            >
              <div style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: '#052e16',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#22c55e'
              }}>
                <Play size={16} fill="#22c55e" style={{ marginLeft: 2 }} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ lineHeight: 1.1 }}>{resumeEpisodeInfo.label}</div>
                <div style={{ fontSize: 11, color: '#052e16', fontWeight: 700, marginTop: 2 }}>
                  {resumeEpisodeInfo.subLabel}
                </div>
              </div>
            </button>

            {/* Botão Minha Lista (Per-Profile) */}
            <button
              type="button"
              onClick={() => {
                toggleMyList(seriesContent.id)
                showToast(inList ? 'Série removida da sua lista' : `Série salva para ${profileName}!`)
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                backgroundColor: inList ? 'rgba(123, 208, 255, 0.18)' : '#201f21',
                color: inList ? '#7bd0ff' : '#cbc3d7',
                border: `1px solid ${inList ? '#009bd1' : '#2a2a2c'}`,
                borderRadius: 16,
                padding: '14px 22px',
                fontSize: 14,
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              {inList ? <Check size={18} /> : <Plus size={18} />}
              {inList ? 'Na Minha Lista' : 'Minha Lista'}
            </button>

            {/* Trailer */}
            <button
              type="button"
              onClick={() => handlePlayEpisode(seasonsData[0]?.episodes?.[0]?.id || seriesContent.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                backgroundColor: '#201f21',
                color: '#cbc3d7',
                border: '1px solid #2a2a2c',
                borderRadius: 16,
                padding: '14px 20px',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Film size={17} />
              Trailer
            </button>

            {/* Amei */}
            <button
              type="button"
              onClick={() => {
                setIsLiked(!isLiked)
                showToast(isLiked ? 'Curtida removida' : 'Você curtiu esta série!')
              }}
              style={{
                width: 46,
                height: 46,
                borderRadius: 14,
                backgroundColor: '#201f21',
                border: '1px solid #2a2a2c',
                color: isLiked ? '#ffb95f' : '#cbc3d7',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Curtir Série"
            >
              <Heart size={20} fill={isLiked ? '#ffb95f' : 'none'} />
            </button>

            {/* Compartilhar */}
            <button
              type="button"
              onClick={handleShare}
              style={{
                width: 46,
                height: 46,
                borderRadius: 14,
                backgroundColor: '#201f21',
                border: '1px solid #2a2a2c',
                color: '#cbc3d7',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Compartilhar"
            >
              <Share2 size={19} />
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================
          2. CORPO PRINCIPAL DA PÁGINA (MAX-WIDTH RESPONSIVO)
          ============================================================ */}
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '36px clamp(16px, 4vw, 48px) 0'
      }}>
        {/* CARD DE INFORMAÇÃO DO PERFIL ATIVO */}
        <div style={{
          backgroundColor: '#1c1b1d',
          border: '1px solid #2a2a2c',
          borderRadius: 18,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 14,
          marginBottom: 32
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img
              src={profileAvatar}
              alt={profileName}
              style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid #22c55e' }}
            />
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#ffffff' }}>
                Progresso individual de {profileName}
              </div>
              <div style={{ fontSize: 12, color: '#958ea0' }}>
                Os episódios assistidos e o tempo pausado pertencem exclusivamente a este perfil.
              </div>
            </div>
          </div>

          <div style={{ fontSize: 12, color: '#ffb95f', fontWeight: 800 }}>
            ⭐ Nível 3 • Explorador Bíblico
          </div>
        </div>

        {/* ============================================================
            3. SELETOR DE TEMPORADAS & LISTA DE EPISÓDIOS
            ============================================================ */}
        <section style={{ marginBottom: 48 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
            marginBottom: 20
          }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Episódios
            </h2>

            {/* Dropdown Interativo de Temporadas */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setShowSeasonDropdown(prev => !prev)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  backgroundColor: '#201f21',
                  color: '#ffffff',
                  border: '1px solid #353437',
                  borderRadius: 14,
                  padding: '10px 18px',
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                <span>{currentSeason.title}</span>
                <ChevronDown size={16} color="#22c55e" />
              </button>

              {showSeasonDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 6,
                  backgroundColor: '#1c1b1d',
                  border: '1px solid #353437',
                  borderRadius: 16,
                  padding: 8,
                  minWidth: 240,
                  boxShadow: '0 12px 36px rgba(0,0,0,0.8)',
                  zIndex: 20
                }}>
                  {seasonsData.map(season => (
                    <button
                      key={season.id}
                      type="button"
                      onClick={() => {
                        setSelectedSeasonNumber(season.season_number)
                        setShowSeasonDropdown(false)
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 10,
                        backgroundColor: selectedSeasonNumber === season.season_number ? 'rgba(34, 197, 94, 0.18)' : 'transparent',
                        color: selectedSeasonNumber === season.season_number ? '#22c55e' : '#cbc3d7',
                        border: 'none',
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <span>{season.title}</span>
                      <span style={{ fontSize: 11, color: '#958ea0' }}>
                        {season.episodes?.length || 0} eps
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Grade de Episódios com Cards 16:9 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {currentEpisodes.map((ep: StreamEpisode) => {
              const epProg = watchProgress[ep.id]
              const isCompleted = epProg?.completed
              const inProgress = epProg && epProg.progress_seconds > 10 && !isCompleted
              const progressPct = inProgress
                ? Math.min(95, Math.round((epProg.progress_seconds / (epProg.duration_seconds || (ep.duration_minutes ? ep.duration_minutes * 60 : 1200))) * 100))
                : (isCompleted ? 100 : 0)
              const minsWatched = inProgress ? Math.floor(epProg.progress_seconds / 60) : 0

              return (
                <div
                  key={ep.id}
                  onClick={() => handlePlayEpisode(ep.id)}
                  style={{
                    backgroundColor: '#1c1b1d',
                    borderRadius: 18,
                    border: '1px solid #2a2a2c',
                    padding: '16px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 18,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 18, flex: '1 1 500px', minWidth: 280 }}>
                    {/* Thumbnail 16:9 com Barra de Progresso */}
                    <div style={{
                      position: 'relative',
                      width: 'clamp(120px, 20vw, 170px)',
                      aspectRatio: '16/9',
                      borderRadius: 12,
                      overflow: 'hidden',
                      backgroundColor: '#0e0e10',
                      flexShrink: 0
                    }}>
                      <img
                        src={ep.thumbnail_url || seriesContent.thumbnail_url}
                        alt={ep.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />

                      {/* Botão Play Hover Overlay */}
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <div style={{
                          width: 34,
                          height: 34,
                          borderRadius: '50%',
                          backgroundColor: '#22c55e',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#052e16'
                        }}>
                          <Play size={16} fill="#052e16" style={{ marginLeft: 2 }} />
                        </div>
                      </div>

                      {/* Barra de Progresso Sobreposta */}
                      {progressPct > 0 && (
                        <div style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: 4,
                          backgroundColor: 'rgba(0,0,0,0.6)'
                        }}>
                          <div style={{
                            height: '100%',
                            width: `${progressPct}%`,
                            backgroundColor: isCompleted ? '#22c55e' : '#4ade80'
                          }} />
                        </div>
                      )}
                    </div>

                    {/* Informações do Episódio */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: '#ffb95f' }}>
                          EPISÓDIO {ep.episode_number}
                        </span>
                        <span style={{ fontSize: 12, color: '#958ea0' }}>• {ep.duration_minutes || 25} min</span>

                        {isCompleted && (
                          <span style={{
                            backgroundColor: 'rgba(0, 155, 209, 0.2)',
                            color: '#7bd0ff',
                            fontSize: 10,
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: 10,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 3
                          }}>
                            <Check size={12} /> Assistido
                          </span>
                        )}

                        {inProgress && (
                          <span style={{
                            backgroundColor: 'rgba(34, 197, 94, 0.2)',
                            color: '#22c55e',
                            fontSize: 10,
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: 10
                          }}>
                            {progressPct}% • {minsWatched}m assistidos
                          </span>
                        )}
                      </div>

                      <h3 style={{ fontSize: 17, fontWeight: 800, color: '#ffffff', margin: '0 0 6px', lineHeight: 1.2 }}>
                        {ep.title}
                      </h3>

                      <p style={{
                        fontSize: 13,
                        color: '#cbc3d7',
                        lineHeight: 1.4,
                        margin: 0,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {ep.synopsis}
                      </p>
                    </div>
                  </div>

                  {/* Ação do Episódio */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePlayEpisode(ep.id)
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        backgroundColor: inProgress ? '#22c55e' : '#201f21',
                        color: inProgress ? '#052e16' : '#cbc3d7',
                        border: `1px solid ${inProgress ? '#22c55e' : '#2a2a2c'}`,
                        borderRadius: 12,
                        padding: '10px 18px',
                        fontSize: 13,
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      <Play size={14} fill={inProgress ? '#ffffff' : 'none'} />
                      {inProgress ? 'Continuar' : isCompleted ? 'Rever' : 'Assistir'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ============================================================
            4. JORNADA DA CRIANÇA (DIFERENCIAL COM DEUS KIDS)
            ============================================================ */}
        <section style={{
          backgroundColor: '#1c1b1d',
          borderRadius: 24,
          border: '1px solid #2a2a2c',
          padding: '32px 28px',
          marginBottom: 48
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: 'rgba(255, 185, 95, 0.15)',
            color: '#ffb95f',
            padding: '4px 12px',
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: 12
          }}>
            <Sparkles size={14} />
            <span>Aprendizado e Fixação</span>
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', margin: '0 0 8px' }}>
            Jornada da Criança Nesta Aventura
          </h2>
          <p style={{ fontSize: 14, color: '#cbc3d7', margin: '0 0 24px' }}>
            Transforme cada episódio assistido em um momento enriquecedor de fé e aprendizado com 4 etapas guiadas:
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16
          }}>
            <div style={{ backgroundColor: '#201f21', borderRadius: 16, padding: '18px 16px', border: '1px solid #2a2a2c' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#22c55e', marginBottom: 4 }}>ETAPA 1</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', marginBottom: 6 }}>▶ Assistir</div>
              <div style={{ fontSize: 12, color: '#cbc3d7' }}>Aprecie a história bíblica 3D em alta resolução com valores eternos.</div>
            </div>

            <div style={{ backgroundColor: '#201f21', borderRadius: 16, padding: '18px 16px', border: '1px solid #2a2a2c' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#ffb95f', marginBottom: 4 }}>ETAPA 2</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', marginBottom: 6 }}>📖 Lição Viva</div>
              <div style={{ fontSize: 12, color: '#cbc3d7' }}>Memorize o versículo da semana e reflita sobre o princípio cristão trabalhado.</div>
            </div>

            <div style={{ backgroundColor: '#201f21', borderRadius: 16, padding: '18px 16px', border: '1px solid #2a2a2c' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#7bd0ff', marginBottom: 4 }}>ETAPA 3</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', marginBottom: 6 }}>🎯 Quiz Bíblico</div>
              <div style={{ fontSize: 12, color: '#cbc3d7' }}>Responda 3 perguntas divertidas e ganhe pontos de XP no perfil.</div>
            </div>

            <div style={{ backgroundColor: '#201f21', borderRadius: 16, padding: '18px 16px', border: '1px solid #2a2a2c' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#22c55e', marginBottom: 4 }}>ETAPA 4</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', marginBottom: 6 }}>🎨 Atividade em PDF</div>
              <div style={{ fontSize: 12, color: '#cbc3d7' }}>Baixe e imprima o caderno ilustrado com desenhos de colorir e caça-palavras.</div>
            </div>
          </div>
        </section>

        {/* ============================================================
            5. LIÇÃO VIVA, QUIZ & MATERIAL EM PDF
            ============================================================ */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 24,
          marginBottom: 48
        }}>
          {/* Lição Viva & Versículo */}
          <div style={{
            backgroundColor: '#1c1b1d',
            borderRadius: 20,
            border: '1px solid #2a2a2c',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  backgroundColor: 'rgba(255, 185, 95, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffb95f'
                }}>
                  <BookOpen size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#ffb95f', fontWeight: 800, textTransform: 'uppercase' }}>
                    Lição do Episódio
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#ffffff' }}>
                    Versículo da Aventura
                  </div>
                </div>
              </div>

              <div style={{
                backgroundColor: '#201f21',
                borderRadius: 14,
                padding: '14px 16px',
                border: '1px solid #2a2a2c',
                fontSize: 14,
                color: '#22c55e',
                fontWeight: 600,
                lineHeight: 1.5,
                marginBottom: 14
              }}>
                📖 {seriesContent.scripture_verse || '"Assim fez Noé; conforme a tudo o que Deus lhe mandou, assim o fez." — Gênesis 6:22'}
              </div>

              <div style={{ fontSize: 13, color: '#cbc3d7', lineHeight: 1.5, marginBottom: 16 }}>
                <strong>Valor trabalhado:</strong> Obediência e Fidelidade.<br />
                <em>"O que podemos aprender com Noé quando enfrentamos situações difíceis?"</em>
              </div>
            </div>

            <Link
              to="/aprender"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                backgroundColor: '#201f21',
                color: '#22c55e',
                border: '1px solid #22c55e',
                borderRadius: 12,
                padding: '10px 18px',
                fontSize: 13,
                fontWeight: 800,
                textDecoration: 'none'
              }}
            >
              <BookOpen size={16} />
              Começar Lição
            </Link>
          </div>

          {/* Quiz do Episódio */}
          <div style={{
            backgroundColor: '#1c1b1d',
            borderRadius: 20,
            border: '1px solid #2a2a2c',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  backgroundColor: 'rgba(34, 197, 94, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#22c55e'
                }}>
                  <Award size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#22c55e', fontWeight: 800, textTransform: 'uppercase' }}>
                    Quiz do Episódio
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#ffffff' }}>
                    Quiz da História
                  </div>
                </div>
              </div>

              <p style={{ fontSize: 13, color: '#cbc3d7', lineHeight: 1.5, marginBottom: 16 }}>
                Teste os conhecimentos adquiridos neste episódio! Responda 3 perguntas interativas e ganhe até 150 pontos de experiência.
              </p>

              <div style={{
                backgroundColor: '#201f21',
                borderRadius: 12,
                padding: '12px 14px',
                border: '1px solid #2a2a2c',
                marginBottom: 16,
                fontSize: 12,
                color: '#ffb95f',
                fontWeight: 700
              }}>
                ⭐ +50 XP por pergunta correta
              </div>
            </div>

            <Link
              to={`/quiz/${seriesContent.id}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                backgroundColor: '#22c55e',
                color: '#052e16',
                borderRadius: 12,
                padding: '10px 18px',
                fontSize: 13,
                fontWeight: 800,
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(34, 197, 94, 0.4)'
              }}
            >
              <Award size={16} />
              Começar Quiz
            </Link>
          </div>

          {/* Caderno de Atividades PDF */}
          <div style={{
            backgroundColor: '#1c1b1d',
            borderRadius: 20,
            border: '1px solid #2a2a2c',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  backgroundColor: 'rgba(123, 208, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#7bd0ff'
                }}>
                  <FileText size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#7bd0ff', fontWeight: 800, textTransform: 'uppercase' }}>
                    Material Digital
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#ffffff' }}>
                    Caderno de Atividades
                  </div>
                </div>
              </div>

              <p style={{ fontSize: 13, color: '#cbc3d7', lineHeight: 1.5, marginBottom: 16 }}>
                Kit de atividades infantis em PDF de alta qualidade com desenhos de Noé e a Arca para colorir, labirintos e jogos de ligar os pontos.
              </p>

              <div style={{ fontSize: 12, color: '#958ea0', marginBottom: 16 }}>
                16 páginas • Formato A4 • Pronto para impressão
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <Link
                to={seriesContent.related_pdf_id ? `/detalhes-do-material?id=${seriesContent.related_pdf_id}` : '/materiais-em-pdf'}
                style={{
                  flex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  backgroundColor: '#201f21',
                  color: '#7bd0ff',
                  border: '1px solid #009bd1',
                  borderRadius: 12,
                  padding: '10px 14px',
                  fontSize: 13,
                  fontWeight: 800,
                  textDecoration: 'none'
                }}
              >
                <FileText size={15} />
                Ver Material
              </Link>
              <Link
                to={seriesContent.related_pdf_id ? `/detalhes-do-material?id=${seriesContent.related_pdf_id}` : '/materiais-em-pdf'}
                style={{
                  flex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  backgroundColor: '#ee9800',
                  color: '#ffffff',
                  borderRadius: 12,
                  padding: '10px 14px',
                  fontSize: 13,
                  fontWeight: 800,
                  textDecoration: 'none'
                }}
              >
                <Download size={15} />
                Baixar PDF
              </Link>
            </div>
          </div>
        </div>

        {/* ============================================================
            6. PERSONAGENS DA HISTÓRIA
            ============================================================ */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#ffffff', marginBottom: 16 }}>
            Personagens Desta História
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 16
          }}>
            {characters.map(char => (
              <div
                key={char.name}
                style={{
                  backgroundColor: '#1c1b1d',
                  borderRadius: 16,
                  padding: 16,
                  border: '1px solid #2a2a2c',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14
                }}
              >
                <img
                  src={char.avatar}
                  alt={char.name}
                  style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid #353437' }}
                  onError={(e) => { (e.target as HTMLImageElement).src = '/avatars/davi.png' }}
                />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#ffffff' }}>{char.name}</div>
                  <div style={{ fontSize: 11, color: '#958ea0', marginTop: 2 }}>{char.role}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================
            7. VOCÊ TAMBÉM PODE GOSTAR (RECOMENDAÇÕES)
            ============================================================ */}
        <section style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#ffffff', marginBottom: 16 }}>
            Você Também Pode Gostar
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 18
          }}>
            {similarItems.map(item => (
              <div
                key={item.id}
                onClick={() => navigate(item.type === 'series' ? `/serie/${item.slug || item.id}` : `/conteudo/${item.slug || item.id}`)}
                style={{
                  backgroundColor: '#1c1b1d',
                  borderRadius: 16,
                  overflow: 'hidden',
                  border: '1px solid #2a2a2c',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', backgroundColor: '#0e0e10' }}>
                  <img
                    src={item.thumbnail_url}
                    alt={item.title}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    backgroundColor: 'rgba(19, 19, 21, 0.85)',
                    padding: '2px 8px',
                    borderRadius: 8,
                    fontSize: 10,
                    fontWeight: 800,
                    color: '#22c55e'
                  }}>
                    {item.category}
                  </div>
                </div>

                <div style={{ padding: '14px 16px' }}>
                  <h4 style={{ fontSize: 14, fontWeight: 800, color: '#ffffff', margin: '0 0 4px', lineHeight: 1.2 }}>
                    {item.title}
                  </h4>
                  <div style={{ fontSize: 11, color: '#ffb95f', fontWeight: 700 }}>
                    {item.age_range || 'Livre'} • {item.type === 'series' ? 'Série' : 'Filme'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
