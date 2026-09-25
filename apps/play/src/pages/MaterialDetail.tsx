import React, { useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ChevronLeft, Share2, Heart, ShieldCheck, BookOpen,
  FileText, Baby, Printer, Shield, Download,
  Eye, CheckCircle2, ChevronRight, ZoomIn, ZoomOut,
  Maximize2, Minimize2, Play, HelpCircle, Loader2, Sparkles,
  Check, X
} from 'lucide-react'
import { useProfile } from '../context/ProfileContext'
import { getAvatarImageUrl } from '../data/avatars'

interface PageSample {
  pageNumber: number
  title: string
  subtitle: string
  thumbUrl: string
  readerUrl: string
}

const PAGE_SAMPLES: PageSample[] = [
  {
    pageNumber: 1,
    title: 'Capa Ilustrada para Colorir',
    subtitle: 'Capa para Colorir',
    thumbUrl: '/materials/mat_sample_p1.jpg',
    readerUrl: '/materials/mat_sample_p1.jpg'
  },
  {
    pageNumber: 2,
    title: 'História Ilustrada: O Pequeno Pastor',
    subtitle: 'História Ilustrada',
    thumbUrl: '/materials/mat_sample_p2.jpg',
    readerUrl: '/materials/mat_sample_p2.jpg'
  },
  {
    pageNumber: 3,
    title: 'Caça-Palavras com Nomes Bíblicos',
    subtitle: 'Caça-Palavras',
    thumbUrl: '/materials/mat_sample_p3.jpg',
    readerUrl: '/materials/mat_sample_reader.jpg'
  },
  {
    pageNumber: 4,
    title: 'Labirinto: As 5 Pedrinhas de Davi',
    subtitle: 'Labirinto Bíblico',
    thumbUrl: '/materials/mat_sample_p4.jpg',
    readerUrl: '/materials/mat_sample_p4.jpg'
  },
  {
    pageNumber: 5,
    title: 'Máscaras & Fantoche de Dedo para Recortar',
    subtitle: 'Fantoche de Dedo',
    thumbUrl: '/materials/mat_sample_p5.jpg',
    readerUrl: '/materials/mat_sample_p5.jpg'
  }
]

const RELATED_MATERIALS = [
  {
    id: 'mat-arca',
    title: 'A Arca de Noé',
    subtitle: 'Caderno de Desenhos',
    pages: '32 PÁG',
    coverUrl: '/materials/mat_davi_cover.jpg', // fallback to noe if available
    altCover: '/thumbnails/noe.jpg',
    badgeColor: '#ffb95f'
  },
  {
    id: 'mat-samaritano',
    title: 'O Bom Samaritano',
    subtitle: 'Atividades Práticas',
    pages: '18 PÁG',
    coverUrl: '/materials/mat_rel_samaritano.jpg',
    badgeColor: '#ffb95f'
  },
  {
    id: 'mat-cancoes',
    title: 'Canções de Davi',
    subtitle: 'Partituras & Letras',
    pages: 'MÚSICA',
    coverUrl: '/materials/mat_rel_cancoes.jpg',
    badgeColor: '#7bd0ff'
  }
]

export default function MaterialDetail() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { activeProfile } = useProfile()

  const [isFav, setIsFav] = useState(true)
  const [currentPage, setCurrentPage] = useState(3)
  const [isZoomed, setIsZoomed] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadSuccess, setDownloadSuccess] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [quizModalOpen, setQuizModalOpen] = useState(false)

  const readerRef = useRef<HTMLDivElement>(null)

  const avatarUrl = getAvatarImageUrl(activeProfile?.avatar_url)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const toggleFav = () => {
    setIsFav(!isFav)
    showToast(!isFav ? 'Adicionado aos seus favoritos!' : 'Removido dos favoritos')
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
    }
    showToast('Link do material copiado para a área de transferência!')
  }

  const triggerDownload = () => {
    if (isDownloading) return
    setIsDownloading(true)
    setDownloadSuccess(false)

    setTimeout(() => {
      setIsDownloading(false)
      setDownloadSuccess(true)
      showToast('Download concluído! Salvo para usar offline.')
    }, 1500)
  }

  const activeSample = PAGE_SAMPLES.find(p => p.pageNumber === currentPage) || PAGE_SAMPLES[2]

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1)
    }
  }

  const nextPage = () => {
    if (currentPage < 24) {
      setCurrentPage(prev => prev + 1)
    }
  }

  const toggleZoom = () => {
    setIsZoomed(!isZoomed)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      readerRef.current?.requestFullscreen?.().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen?.().catch(() => {})
      setIsFullscreen(false)
    }
  }

  const scrollToViewer = () => {
    const el = document.getElementById('pdf-viewer')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#131315',
      color: '#e5e1e4',
      paddingBottom: 96,
      fontFamily: "'Baloo 2', -apple-system, BlinkMacSystemFont, sans-serif",
      userSelect: 'none'
    }}>
      {/* HEADER FIXO TOPO (1:1 STITCH) */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 64,
        zIndex: 50,
        backgroundColor: 'rgba(19, 19, 21, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => navigate(-1)}
            aria-label="Voltar"
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              backgroundColor: '#2a2a2c',
              border: 'none',
              color: '#e5e1e4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.15s ease'
            }}
          >
            <ChevronLeft size={20} />
          </button>
          <h1 style={{
            fontSize: 18,
            fontWeight: 700,
            color: '#e5e1e4',
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: 200
          }}>
            Detalhes Do Material
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={handleShare}
            aria-label="Compartilhar"
            style={{
              width: 44,
              height: 44,
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
            <Share2 size={20} />
          </button>

          <button
            onClick={() => navigate('/editar-perfil')}
            aria-label="Perfil"
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: '#22c55e',
              border: 'none',
              cursor: 'pointer',
              overflow: 'hidden',
              padding: 0,
              boxShadow: '0 0 10px rgba(34, 197, 94, 0.35)'
            }}
          >
            <img
              src={avatarUrl}
              alt="Perfil"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/avatars/davi.png'
              }}
            />
          </button>
        </div>
      </header>

      {/* CONTAINER PRINCIPAL RESPONSIVO */}
      <main className="cdk-content-container" style={{ margin: '0 auto', paddingTop: 80, paddingBottom: 64 }}>

        {/* SUB-HEADER INFO & QUICK ACTIONS */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <BookOpen size={18} color="#22c55e" />
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#22c55e' }}>
              Materiais &amp; Atividades
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={toggleFav}
              aria-label="Favoritar"
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: '#2a2a2c',
                border: 'none',
                color: isFav ? '#22c55e' : '#958ea0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'transform 0.15s ease'
              }}
            >
              <Heart size={18} fill={isFav ? '#22c55e' : 'none'} />
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 10px',
              borderRadius: 9999,
              backgroundColor: 'rgba(255, 185, 95, 0.15)'
            }}>
              <ShieldCheck size={14} color="#ffb95f" />
              <span style={{ fontSize: 11, fontWeight: 800, color: '#ffb95f', letterSpacing: '0.05em' }}>
                OFICIAL
              </span>
            </div>
          </div>
        </div>

        {/* HERO SPOTLIGHT / PRIMARY MATERIAL CARD */}
        <section style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 16,
          backgroundColor: '#1c1b1d',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          {/* Luzes ambientes decorativas de fundo */}
          <div style={{
            position: 'absolute',
            top: -64,
            left: -64,
            width: 192,
            height: 192,
            borderRadius: '50%',
            backgroundColor: 'rgba(34, 197, 94, 0.2)',
            filter: 'blur(48px)',
            pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute',
            bottom: -64,
            right: -64,
            width: 192,
            height: 192,
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 185, 95, 0.1)',
            filter: 'blur(48px)',
            pointerEvents: 'none'
          }} />

          {/* Capa Vertical com Aspect Ratio 2:3 e Badges */}
          <div style={{
            position: 'relative',
            width: 176,
            aspectRatio: '2/3',
            borderRadius: 12,
            boxShadow: '0 12px 36px rgba(0,0,0,0.6)',
            overflow: 'hidden',
            backgroundColor: '#353437'
          }}>
            <img
              src="/materials/mat_davi_cover.jpg"
              alt="Capa do Kit Davi & Golias"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/thumbnails/player_davi_warrior.jpg'
              }}
            />

            {/* Quality Spec Badges */}
            <div style={{
              position: 'absolute',
              top: 8,
              left: 8,
              right: 8,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              pointerEvents: 'none'
            }}>
              <span style={{
                padding: '2px 8px',
                borderRadius: 9999,
                backgroundColor: 'rgba(14, 14, 16, 0.8)',
                backdropFilter: 'blur(8px)',
                fontSize: 11,
                fontWeight: 800,
                color: '#7bd0ff',
                letterSpacing: '0.05em'
              }}>
                300 DPI
              </span>
              <span style={{
                padding: '2px 8px',
                borderRadius: 9999,
                backgroundColor: 'rgba(34, 197, 94, 0.3)',
                backdropFilter: 'blur(8px)',
                fontSize: 11,
                fontWeight: 800,
                color: '#4ade80',
                letterSpacing: '0.05em'
              }}>
                PDF HD
              </span>
            </div>

            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '8px 0 6px',
              background: 'linear-gradient(to top, rgba(14, 14, 16, 0.95), rgba(14, 14, 16, 0.6), transparent)'
            }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#e5e1e4', letterSpacing: '0.05em' }}>
                PRONTO P/ IMPRIMIR
              </span>
            </div>
          </div>

          {/* Título & Headline */}
          <h2 style={{
            fontSize: 20,
            fontWeight: 700,
            color: '#e5e1e4',
            margin: '20px 0 0',
            lineHeight: 1.3
          }}>
            Davi &amp; Golias — Kit Infantil de Colorir &amp; Estudo Bíblico
          </h2>

          {/* Metadata Badges */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginTop: 12
          }}>
            <span style={{
              padding: '4px 10px',
              borderRadius: 9999,
              backgroundColor: '#2a2a2c',
              fontSize: 12,
              fontWeight: 700,
              color: '#cbc3d7',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              <FileText size={15} color="#22c55e" /> 24 Páginas
            </span>
            <span style={{
              padding: '4px 10px',
              borderRadius: 9999,
              backgroundColor: '#2a2a2c',
              fontSize: 12,
              fontWeight: 700,
              color: '#cbc3d7',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              <Baby size={15} color="#7bd0ff" /> 5 a 9 anos
            </span>
            <span style={{
              padding: '4px 10px',
              borderRadius: 9999,
              backgroundColor: '#2a2a2c',
              fontSize: 12,
              fontWeight: 700,
              color: '#cbc3d7',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              <Printer size={15} color="#ffb95f" /> Formato A4
            </span>
            <span style={{
              padding: '4px 10px',
              borderRadius: 9999,
              backgroundColor: 'rgba(238, 152, 0, 0.2)',
              fontSize: 12,
              fontWeight: 700,
              color: '#ffb95f',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              <Shield size={15} color="#ffb95f" fill="#ffb95f" /> Coragem &amp; Fé
            </span>
          </div>

          {/* Ações Primárias */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24 }}>
            <button
              onClick={scrollToViewer}
              style={{
                width: '100%',
                height: 48,
                borderRadius: 12,
                backgroundColor: '#22c55e',
                color: '#052e16',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                fontSize: 14,
                fontWeight: 800,
                letterSpacing: '0.02em',
                boxShadow: '0 4px 20px rgba(34, 197, 94, 0.4)',
                cursor: 'pointer'
              }}
            >
              <BookOpen size={18} />
              <span>ABRIR E FOLHEAR PDF</span>
            </button>

            <button
              onClick={triggerDownload}
              disabled={isDownloading}
              style={{
                width: '100%',
                height: 48,
                borderRadius: 12,
                backgroundColor: '#2a2a2c',
                color: '#e5e1e4',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: '0.02em',
                cursor: 'pointer',
                transition: 'background 0.2s ease'
              }}
            >
              {isDownloading ? (
                <>
                  <Loader2 size={18} color="#7bd0ff" className="animate-spin" />
                  <span>BAIXANDO ARQUIVO...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <CheckCircle2 size={18} color="#10b981" />
                  <span>ARQUIVO PRONTO</span>
                </>
              ) : (
                <>
                  <Download size={18} color="#7bd0ff" />
                  <span>BAIXAR PDF COMPLETO (18 MB)</span>
                </>
              )}
            </button>

            {downloadSuccess && (
              <p style={{
                fontSize: 12,
                color: '#7bd0ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                margin: '4px 0 0'
              }}>
                <CheckCircle2 size={14} /> Salvo para usar offline no dispositivo
              </p>
            )}
          </div>
        </section>

        {/* PRÉVIA DO CONTEÚDO (CARROSSEL HORIZONTAL) */}
        <section style={{ marginTop: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Eye size={18} color="#ffb95f" />
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#e5e1e4', margin: 0 }}>
                Prévia do Conteúdo
              </h3>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#cbc3d7' }}>
              5 de 24 amostras
            </span>
          </div>

          <div style={{
            display: 'flex',
            gap: 12,
            overflowX: 'auto',
            paddingBottom: 8,
            scrollbarWidth: 'none'
          }}>
            {PAGE_SAMPLES.map(sample => {
              const isSelected = sample.pageNumber === currentPage
              return (
                <div
                  key={sample.pageNumber}
                  onClick={() => setCurrentPage(sample.pageNumber)}
                  style={{
                    flexShrink: 0,
                    width: 144,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '1/1.41',
                    borderRadius: 10,
                    overflow: 'hidden',
                    backgroundColor: '#2a2a2c',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    border: isSelected ? '2px solid #22c55e' : '2px solid transparent',
                    transition: 'transform 0.15s ease'
                  }}>
                    <img
                      src={sample.thumbUrl}
                      alt={sample.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/materials/mat_sample_p1.jpg'
                      }}
                    />
                    {isSelected && (
                      <span style={{
                        position: 'absolute',
                        top: 6,
                        right: 6,
                        padding: '2px 6px',
                        borderRadius: 4,
                        backgroundColor: '#22c55e',
                        color: '#052e16',
                        fontSize: 10,
                        fontWeight: 800
                      }}>
                        Ativo
                      </span>
                    )}
                    <span style={{
                      position: 'absolute',
                      bottom: 6,
                      left: 6,
                      padding: '2px 6px',
                      borderRadius: 4,
                      backgroundColor: 'rgba(14, 14, 16, 0.8)',
                      fontSize: 10,
                      fontWeight: 800,
                      color: '#e5e1e4'
                    }}>
                      Pág 0{sample.pageNumber}
                    </span>
                  </div>
                  <p style={{
                    fontSize: 12,
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? '#22c55e' : '#e5e1e4',
                    margin: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {sample.subtitle}
                  </p>
                </div>
              )
            })}
          </div>
        </section>

        {/* INTERACTIVE EMBEDDED PDF READER MOCKUP */}
        <section
          id="pdf-viewer"
          ref={readerRef}
          style={{
            marginTop: 32,
            borderRadius: 16,
            backgroundColor: '#1c1b1d',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            scrollMarginTop: 80
          }}
        >
          {/* Reader Header Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: 12,
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ffb95f' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#e5e1e4' }}>
                Página {currentPage}: {activeSample.subtitle}
              </span>
            </div>
            <span style={{
              fontSize: 11,
              fontWeight: 800,
              color: '#22c55e',
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              padding: '2px 8px',
              borderRadius: 9999
            }}>
              Página {currentPage} de 24
            </span>
          </div>

          {/* PDF Canvas Viewport */}
          <div style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '1/1.3',
            backgroundColor: '#0e0e10',
            borderRadius: 12,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 12,
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.6)'
          }}>
            <img
              src={activeSample.readerUrl}
              alt="Visualizador de Página PDF"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                padding: 8,
                transform: isZoomed ? 'scale(1.25)' : 'scale(1)',
                transition: 'transform 0.25s ease'
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/materials/mat_sample_p1.jpg'
              }}
            />

            {/* Subtle Watermark Overlay */}
            <div style={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              padding: '2px 8px',
              borderRadius: 4,
              backgroundColor: 'rgba(14, 14, 16, 0.7)',
              backdropFilter: 'blur(4px)',
              pointerEvents: 'none'
            }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#958ea0' }}>
                Com Deus Kids • Uso Familiar
              </span>
            </div>
          </div>

          {/* PDF Control Dock */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 12,
            paddingTop: 4
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={prevPage}
                disabled={currentPage <= 1}
                style={{
                  height: 36,
                  padding: '0 12px',
                  borderRadius: 8,
                  backgroundColor: '#2a2a2c',
                  color: currentPage <= 1 ? '#494454' : '#e5e1e4',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: currentPage <= 1 ? 'not-allowed' : 'pointer'
                }}
              >
                <ChevronLeft size={16} /> Anterior
              </button>
              <button
                onClick={nextPage}
                disabled={currentPage >= 24}
                style={{
                  height: 36,
                  padding: '0 12px',
                  borderRadius: 8,
                  backgroundColor: '#2a2a2c',
                  color: currentPage >= 24 ? '#494454' : '#e5e1e4',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: currentPage >= 24 ? 'not-allowed' : 'pointer'
                }}
              >
                Próxima <ChevronRight size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={toggleZoom}
                aria-label="Aumentar Zoom"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  backgroundColor: '#2a2a2c',
                  color: isZoomed ? '#22c55e' : '#cbc3d7',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                {isZoomed ? <ZoomOut size={18} /> : <ZoomIn size={18} />}
              </button>
              <button
                onClick={toggleFullscreen}
                aria-label="Tela Cheia"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  backgroundColor: '#2a2a2c',
                  color: isFullscreen ? '#22c55e' : '#cbc3d7',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
            </div>
          </div>
        </section>

        {/* STREAMING CONNECTION BANNER: CONTINUE A AVENTURA */}
        <section style={{
          marginTop: 32,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 16,
          background: 'linear-gradient(135deg, #1c1b1d 0%, #201f21 50%, #2a2a2c 100%)',
          boxShadow: '0 16px 36px rgba(0,0,0,0.4)',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 14
        }}>
          <div style={{
            position: 'absolute',
            top: -32,
            right: -32,
            width: 128,
            height: 128,
            borderRadius: '50%',
            backgroundColor: 'rgba(238, 152, 0, 0.2)',
            filter: 'blur(32px)',
            pointerEvents: 'none'
          }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Play size={18} color="#ffb95f" fill="#ffb95f" />
            <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#ffb95f' }}>
              Continue a Aventura
            </span>
          </div>

          {/* 16:9 Landscape Media Card with Progress */}
          <div
            onClick={() => navigate('/conteudo/davi-e-golias')}
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16/9',
              borderRadius: 10,
              overflow: 'hidden',
              backgroundColor: '#353437',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              cursor: 'pointer'
            }}
          >
            <img
              src="/materials/mat_movie_frame.jpg"
              alt="Filme Animado Davi e Golias"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/thumbnails/player_davi_warrior.jpg'
              }}
            />

            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(14, 14, 16, 0.9) 0%, transparent 60%)',
              display: 'flex',
              alignItems: 'flex-end',
              padding: 12
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#052e16',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
                }}>
                  <Play size={18} fill="#052e16" />
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', margin: 0 }}>
                    Davi &amp; Golias: O Filme Animado
                  </p>
                  <p style={{ fontSize: 12, color: '#cbc3d7', margin: '2px 0 0' }}>
                    Episódio Especial • 45 min
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Bar at Bottom Edge */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{ width: '40%', height: '100%', backgroundColor: '#22c55e' }} />
            </div>
          </div>

          <p style={{ fontSize: 13, color: '#cbc3d7', margin: 0, lineHeight: 1.45 }}>
            Assista ao episódio antes de fazer as atividades para enriquecer a experiência e fixar o aprendizado bíblico em família!
          </p>

          {/* Dual Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button
              onClick={() => navigate('/conteudo/davi-e-golias')}
              style={{
                height: 44,
                borderRadius: 10,
                backgroundColor: '#ffffff',
                color: '#131315',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}
            >
              <Play size={16} fill="#131315" /> Assistir Filme
            </button>

            <button
              onClick={() => setQuizModalOpen(true)}
              style={{
                height: 44,
                borderRadius: 10,
                backgroundColor: '#353437',
                color: '#e5e1e4',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <HelpCircle size={16} color="#ffb95f" /> Quiz Bíblico (5)
            </button>
          </div>
        </section>

        {/* VOCÊ TAMBÉM PODE GOSTAR (RELATED MATERIALS) */}
        <section style={{ marginTop: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={18} color="#22c55e" />
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#e5e1e4', margin: 0 }}>
                Você também pode gostar
              </h3>
            </div>
            <button
              onClick={() => navigate('/materiais')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 12,
                fontWeight: 700,
                color: '#22c55e',
                cursor: 'pointer'
              }}
            >
              Ver todos
            </button>
          </div>

          {/* Horizontal Posters Reel */}
          <div style={{
            display: 'flex',
            gap: 12,
            overflowX: 'auto',
            paddingBottom: 8,
            scrollbarWidth: 'none'
          }}>
            {RELATED_MATERIALS.map(item => (
              <div
                key={item.id}
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                  showToast(`Abrindo livreto "${item.title}"...`)
                }}
                style={{
                  flexShrink: 0,
                  width: 144,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '2/3',
                  borderRadius: 10,
                  overflow: 'hidden',
                  backgroundColor: '#2a2a2c',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  transition: 'transform 0.15s ease'
                }}>
                  <img
                    src={item.coverUrl}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/materials/mat_davi_cover.jpg'
                    }}
                  />
                  <span style={{
                    position: 'absolute',
                    top: 6,
                    left: 6,
                    padding: '2px 6px',
                    borderRadius: 4,
                    backgroundColor: 'rgba(14, 14, 16, 0.8)',
                    fontSize: 10,
                    fontWeight: 800,
                    color: item.badgeColor
                  }}>
                    {item.pages}
                  </span>
                </div>
                <p style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#e5e1e4',
                  margin: '4px 0 0',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {item.title}
                </p>
                <p style={{
                  fontSize: 11,
                  color: '#cbc3d7',
                  margin: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {item.subtitle}
                </p>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* QUIZ BÍBLICO INTERATIVO MODAL */}
      {quizModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16
        }}>
          <div style={{
            width: '100%',
            maxWidth: 440,
            borderRadius: 20,
            backgroundColor: '#1c1b1d',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 24px 48px rgba(0,0,0,0.6)',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <HelpCircle size={22} color="#ffb95f" />
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#e5e1e4', margin: 0 }}>
                  Quiz: Davi &amp; Golias
                </h3>
              </div>
              <button
                onClick={() => setQuizModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#cbc3d7',
                  cursor: 'pointer',
                  padding: 4
                }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: 14, color: '#cbc3d7', margin: 0 }}>
              <strong>Pergunta 1 de 5:</strong> Quantas pedras lisas Davi pegou no ribeiro antes de enfrentar o gigante Golias?
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['3 pedras', '5 pedras (Resposta correta!)', '7 pedras', '12 pedras'].map((op, i) => (
                <button
                  key={i}
                  onClick={() => {
                    showToast(i === 1 ? '🎉 Parabéns! Resposta certa: 5 pedras!' : 'Tente novamente!')
                    if (i === 1) setQuizModalOpen(false)
                  }}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 12,
                    backgroundColor: '#2a2a2c',
                    color: '#e5e1e4',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    fontSize: 13,
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>{op}</span>
                  {i === 1 && <Sparkles size={14} color="#ffb95f" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TOAST FLUTUANTE DE FEEDBACK */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          left: 16,
          right: 16,
          maxWidth: 440,
          margin: '0 auto',
          zIndex: 100,
          animation: 'slideUp 0.3s ease'
        }}>
          <div style={{
            borderRadius: 16,
            backgroundColor: 'rgba(42, 42, 44, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            padding: '12px 16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            border: '1px solid rgba(208, 188, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: 'rgba(255, 185, 95, 0.2)',
              color: '#ffb95f',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Check size={20} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#e5e1e4' }}>
              {toastMessage}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
