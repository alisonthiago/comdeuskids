import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen, Search, Bookmark, BookmarkCheck, Star, Play,
  Download, Printer, Palette, School, Home, Brain,
  History, Tv, HelpCircle, FileText, CheckCircle2,
  SlidersHorizontal, Scissors, Compass, HeartHandshake,
  Check, ArrowRight, X, Sparkles, Eye, ShieldCheck
} from 'lucide-react'
import { useProfile } from '../context/ProfileContext'
import { getAvatarImageUrl } from '../data/avatars'

interface MaterialItem {
  id: string
  title: string
  ageRange: string
  pagesText: string
  rating: string
  coverUrl: string
  category: string
  heroTag?: string
  badgeBg?: string
}

const IN_PROGRESS_MATERIALS = [
  {
    id: 'prog-1',
    title: 'A Criação do Mundo',
    category: 'Caderno de Desenho',
    coverUrl: '/thumbnails/cante_com_noe.jpg',
    progress: 75,
    remainingText: 'Faltam 3 páginas',
    accentColor: '#22c55e'
  },
  {
    id: 'prog-2',
    title: 'Davi & Golias',
    category: 'Desafios & Labirintos',
    coverUrl: '/thumbnails/player_davi_warrior.jpg',
    progress: 40,
    remainingText: 'Faltam 6 labirintos',
    accentColor: '#ffb95f'
  },
  {
    id: 'prog-3',
    title: 'A Arca de Noé',
    category: 'Recortar & Montar',
    coverUrl: '/thumbnails/noe.jpg',
    progress: 90,
    remainingText: 'Quase concluído!',
    accentColor: '#22c55e'
  }
]

const FEATURED_WORKBOOKS: MaterialItem[] = [
  {
    id: 'mat-jesus',
    title: 'Jesus: Amigo de Todos',
    ageRange: '4 a 8 anos',
    pagesText: 'PDF • 64 PÁG',
    rating: '5.0',
    coverUrl: '/thumbnails/mat_jesus_amigo.jpg',
    category: 'Colorir',
    heroTag: 'jesus',
    badgeBg: '#22c55e'
  },
  {
    id: 'mat-fruto',
    title: 'Fruto do Espírito Santo',
    ageRange: '3 a 7 anos',
    pagesText: 'PDF • 32 PÁG',
    rating: '4.9',
    coverUrl: '/thumbnails/mat_fruto_espirito.jpg',
    category: 'Colorir',
    heroTag: 'jesus',
    badgeBg: '#22c55e'
  },
  {
    id: 'mat-arca',
    title: 'A Grande Arca de Noé',
    ageRange: 'Todas as idades',
    pagesText: 'MEGA KIT • 48 PÁG',
    rating: '5.0',
    coverUrl: '/thumbnails/mat_arca_kit.jpg',
    category: 'Cortar & Montar',
    heroTag: 'noe',
    badgeBg: '#ee9800'
  },
  {
    id: 'mat-moises',
    title: 'Moisés & o Mar Vermelho',
    ageRange: '6 a 10 anos',
    pagesText: 'PDF • 28 PÁG',
    rating: '4.8',
    coverUrl: '/thumbnails/mat_moises_mar.jpg',
    category: 'Labirintos',
    heroTag: 'moises',
    badgeBg: '#22c55e'
  }
]

const HERO_FILTER_LIST = [
  { key: 'all', name: 'Todos', avatar: '/avatars/davi.png', ringColor: '#22c55e' },
  { key: 'jesus', name: 'Jesus', avatar: '/thumbnails/mat_jesus_amigo.jpg', ringColor: '#ffb95f' },
  { key: 'davi', name: 'Davi', avatar: '/avatars/davi.png', ringColor: '#22c55e' },
  { key: 'ester', name: 'Ester', avatar: '/thumbnails/rainha_ester.jpg', ringColor: '#ffb95f' },
  { key: 'noe', name: 'Noé', avatar: '/thumbnails/noe.jpg', ringColor: '#7bd0ff' },
  { key: 'daniel', name: 'Daniel', avatar: '/thumbnails/daniel_leoes.jpg', ringColor: '#22c55e' },
  { key: 'moises', name: 'Moisés', avatar: '/thumbnails/moises_mar.jpg', ringColor: '#ffb95f' },
  { key: 'jonas', name: 'Jonas', avatar: '/thumbnails/jonas_peixe.jpg', ringColor: '#7bd0ff' }
]

const CATEGORIES = [
  { key: 'all', label: 'Todos', icon: Sparkles },
  { key: 'colorir', label: 'Colorir', icon: Palette, color: '#ffb95f' },
  { key: 'labirintos', label: 'Labirintos', icon: Compass, color: '#7bd0ff' },
  { key: 'caca-palavras', label: 'Caça-Palavras', icon: Search, color: '#22c55e' },
  { key: 'recortar', label: 'Cortar & Montar', icon: Scissors, color: '#ffb95f' },
  { key: 'ebd', label: 'Lições EBD', icon: BookOpen, color: '#7bd0ff' },
  { key: 'devocionais', label: 'Devocionais', icon: HeartHandshake, color: '#22c55e' }
]

export default function Downloads() {
  const navigate = useNavigate()
  const { activeProfile } = useProfile()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedHero, setSelectedHero] = useState('all')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [licenseModalOpen, setLicenseModalOpen] = useState(false)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleDownloadPdf = (title: string) => {
    showToast(`Download Concluído! "${title}" pronto para imprimir em PDF HD (A4).`)
  }

  const avatarUrl = getAvatarImageUrl(activeProfile?.avatar_url)

  const filteredWorkbooks = FEATURED_WORKBOOKS.filter(wb => {
    const matchHero = selectedHero === 'all' || wb.heroTag === selectedHero
    const matchSearch = !searchQuery.trim() || wb.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchHero && matchSearch
  })

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#131315',
      color: '#e5e1e4',
      paddingBottom: 96,
      fontFamily: "'Baloo 2', -apple-system, BlinkMacSystemFont, sans-serif",
      userSelect: 'none'
    }}>
      {/* O StreamLayout já fornece a navegação fixa do aplicativo. */}
      <header style={{
        display: 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 112,
        zIndex: 50,
        backgroundColor: 'rgba(19, 19, 21, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 8,
        padding: '0 var(--page-padding-x, 24px)'
      }}>
        {/* Linha 1: Marca & Ações */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px rgba(34, 197, 94, 0.4)'
            }}>
              <BookOpen size={20} color="#0e0e10" strokeWidth={2.5} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: '#ffb95f', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Com Deus Kids
              </span>
              <h1 style={{ fontSize: 18, fontWeight: 800, color: '#e5e1e4', margin: '2px 0 0' }}>
                Materiais
              </h1>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => showToast('Seus cadernos salvos sincronizados!')}
              style={{
                width: 40,
                height: 40,
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
              <BookmarkCheck size={22} />
            </button>

            <button
              onClick={() => navigate('/editar-perfil')}
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                backgroundColor: '#22c55e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 10px rgba(34, 197, 94, 0.35)',
                border: 'none',
                cursor: 'pointer',
                overflow: 'hidden',
                padding: 0
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
        </div>

        {/* Linha 2: Barra de Busca Integrada */}
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={18} color="#cbc3d7" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Buscar livretos, desenhos para colorir e cards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: 40,
              paddingLeft: 38,
              paddingRight: 16,
              borderRadius: 12,
              backgroundColor: '#2a2a2c',
              border: 'none',
              color: '#e5e1e4',
              fontSize: 12,
              fontWeight: 500,
              outline: 'none',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)'
            }}
          />
        </div>
      </header>

      {/* CONTAINER PRINCIPAL RESPONSIVO */}
      <main className="cdk-container" style={{ margin: '0 auto', paddingTop: 88, paddingBottom: 64 }}>

        {/* SUBTÍTULO E BUSCA COM FILTROS RÁPIDOS */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ffb95f', boxShadow: '0 0 8px #ffb95f' }} />
              <span style={{ fontSize: 11, fontWeight: 800, color: '#ffb95f', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Materiais &amp; Atividades
              </span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#cbc3d7', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Printer size={15} color="#7bd0ff" />
              Impressão Liberada
            </span>
          </div>

          <p style={{ fontSize: 14, color: '#cbc3d7', margin: 0, lineHeight: 1.45 }}>
            Atividades para aprender, brincar e crescer com Deus em família ou na EBD.
          </p>

          {/* Tags Rápidas de Busca */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            overflowX: 'auto',
            padding: '4px 0',
            scrollbarWidth: 'none'
          }}>
            {[
              { label: 'Colorir Hoje', icon: Palette, color: '#ffb95f' },
              { label: 'EBD Dominical', icon: School, color: '#7bd0ff' },
              { label: 'Para Casa', icon: Home, color: '#22c55e' },
              { label: 'Labirintos', icon: Brain, color: '#ffddb8' }
            ].map((tag, idx) => {
              const Icon = tag.icon
              return (
                <button
                  key={idx}
                  onClick={() => setSearchQuery(tag.label)}
                  style={{
                    flexShrink: 0,
                    padding: '6px 12px',
                    borderRadius: 9999,
                    backgroundColor: '#2a2a2c',
                    color: '#cbc3d7',
                    fontSize: 12,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <Icon size={14} color={tag.color} />
                  <span>{tag.label}</span>
                </button>
              )
            })}
          </div>
        </section>

        {/* HERO CINEMATOGRÁFICO (COLEÇÃO ESPECIAL) */}
        <section style={{
          position: 'relative',
          width: '100%',
          borderRadius: 24,
          overflow: 'hidden',
          backgroundColor: '#1c1b1d',
          boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
          marginTop: 20
        }}>
          {/* Imagem de Fundo 3D Pixar */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: 320,
            backgroundImage: "url('/banners/materiais_hero.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, #1c1b1d 0%, rgba(28, 27, 29, 0.6) 50%, transparent 100%)'
            }} />
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to right, rgba(28, 27, 29, 0.8) 0%, transparent 60%)'
            }} />

            {/* Selo Especial Superior */}
            <div style={{
              position: 'absolute',
              top: 16,
              left: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
              borderRadius: 9999,
              backgroundColor: 'rgba(14, 14, 16, 0.8)',
              backdropFilter: 'blur(10px)'
            }}>
              <Star size={14} color="#ffb95f" fill="#ffb95f" />
              <span style={{ fontSize: 10, fontWeight: 800, color: '#ffb95f', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Coleção Especial de Páscoa
              </span>
            </div>
          </div>

          {/* Conteúdo do Hero */}
          <div style={{
            position: 'relative',
            marginTop: -88,
            padding: '0 20px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8
          }}>
            <h2 style={{
              fontSize: 'clamp(22px, 5vw, 26px)',
              fontWeight: 800,
              color: '#e5e1e4',
              lineHeight: 1.2,
              margin: 0
            }}>
              Aprender Também Pode Ser Divertido!
            </h2>
            <p style={{ fontSize: 13, color: '#cbc3d7', margin: 0, lineHeight: 1.45 }}>
              Cadernos de colorir, jogos, quizzes bíblicos e atividades prontas para imprimir em família ou no ministério infantil.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 6 }}>
              <button
                onClick={() => showToast('Explorando todos os kits de atividades')}
                style={{
                  flex: 1,
                  height: 46,
                  borderRadius: 14,
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
                  boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)'
                }}
              >
                <Palette size={18} />
                <span>Explorar Coleções</span>
              </button>

              <button
                onClick={() => showToast('Meus cadernos salvos')}
                style={{
                  height: 46,
                  padding: '0 18px',
                  borderRadius: 14,
                  backgroundColor: 'rgba(53, 52, 55, 0.7)',
                  backdropFilter: 'blur(10px)',
                  color: '#e5e1e4',
                  fontSize: 14,
                  fontWeight: 700,
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  cursor: 'pointer'
                }}
              >
                <Bookmark size={18} />
                <span>Meus Salvos</span>
              </button>
            </div>
          </div>
        </section>

        {/* CARROSSEL: CONTINUE DE ONDE PAROU */}
        <section style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 24,
                height: 24,
                borderRadius: 8,
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#22c55e'
              }}>
                <History size={16} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#e5e1e4', margin: 0 }}>
                Continue de Onde Parou
              </h3>
            </div>
            <span
              onClick={() => showToast('Todos os cadernos em andamento')}
              style={{ fontSize: 12, fontWeight: 700, color: '#22c55e', cursor: 'pointer' }}
            >
              Ver todos
            </span>
          </div>

          <div style={{
            display: 'flex',
            gap: 12,
            overflowX: 'auto',
            paddingBottom: 6,
            scrollbarWidth: 'none'
          }}>
            {IN_PROGRESS_MATERIALS.map((item) => (
              <div
                key={item.id}
                style={{
                  flexShrink: 0,
                  width: 240,
                  borderRadius: 16,
                  backgroundColor: '#201f21',
                  padding: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
                }}
              >
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: 110,
                  borderRadius: 12,
                  overflow: 'hidden',
                  backgroundColor: '#2a2a2c'
                }}>
                  <img
                    src={item.coverUrl}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    padding: '2px 8px',
                    borderRadius: 6,
                    backgroundColor: 'rgba(14, 14, 16, 0.85)',
                    backdropFilter: 'blur(8px)',
                    color: '#ffb95f',
                    fontSize: 10,
                    fontWeight: 800
                  }}>
                    {item.progress}% Feito
                  </span>

                  {/* Barra de Progresso Embutida */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 5,
                    backgroundColor: '#353437'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${item.progress}%`,
                      backgroundColor: item.accentColor,
                      boxShadow: `0 0 8px ${item.accentColor}`
                    }} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#7bd0ff', textTransform: 'uppercase' }}>
                    {item.category}
                  </span>
                  <h4 style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: '#e5e1e4',
                    margin: '2px 0',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {item.title}
                  </h4>
                  <span style={{ fontSize: 11, color: '#cbc3d7' }}>
                    {item.remainingText}
                  </span>
                </div>

                <button
                  onClick={() => navigate('/materiais-em-pdf')}
                  style={{
                    width: '100%',
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: '#2a2a2c',
                    color: item.accentColor,
                    fontSize: 12,
                    fontWeight: 800,
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    cursor: 'pointer',
                    transition: 'background 0.15s'
                  }}
                >
                  <Play size={14} fill="currentColor" />
                  <span>Continuar</span>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* CONEXÃO EXCLUSIVA: VOCÊ ASSISTIU NO STREAMING */}
        <section style={{
          marginTop: 28,
          borderRadius: 24,
          background: 'linear-gradient(135deg, #201f21 0%, #2a2a2c 100%)',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Tv size={20} color="#ffb95f" />
            <span style={{ fontSize: 11, fontWeight: 800, color: '#ffb95f', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Você Assistiu no Streaming
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              overflow: 'hidden',
              backgroundColor: '#353437',
              flexShrink: 0
            }}>
              <img
                src="/banners/hero_davi_golias.jpg"
                alt="Davi e Golias"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#e5e1e4', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Davi &amp; Golias (45 min)
              </h3>
              <p style={{ fontSize: 12, color: '#cbc3d7', margin: '4px 0 0', lineHeight: 1.35 }}>
                Aprofunde o aprendizado com o kit prático oficial do episódio!
              </p>
            </div>
          </div>

          {/* Mini Vitrine Interativa de 3 Atividades */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, paddingTop: 4 }}>
            <div
              onClick={() => navigate('/conteudo/davi-e-golias')}
              style={{
                padding: '10px 6px',
                borderRadius: 12,
                backgroundColor: 'rgba(42, 42, 44, 0.6)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: 4,
                cursor: 'pointer'
              }}
            >
              <BookOpen size={18} color="#7bd0ff" />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#e5e1e4' }}>Lição do Dia</span>
              <span style={{ fontSize: 10, color: '#cbc3d7' }}>3 min leitura</span>
            </div>

            <div
              onClick={() => navigate('/conteudo/davi-e-golias')}
              style={{
                padding: '10px 6px',
                borderRadius: 12,
                backgroundColor: 'rgba(42, 42, 44, 0.6)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: 4,
                cursor: 'pointer'
              }}
            >
              <HelpCircle size={18} color="#ffb95f" />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#e5e1e4' }}>Fazer Quiz</span>
              <span style={{ fontSize: 10, color: '#cbc3d7' }}>5 perguntas</span>
            </div>

            <div
              onClick={() => handleDownloadPdf('Kit de Colorir Davi & Golias')}
              style={{
                padding: '10px 6px',
                borderRadius: 12,
                backgroundColor: 'rgba(42, 42, 44, 0.6)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: 4,
                cursor: 'pointer'
              }}
            >
              <Palette size={18} color="#22c55e" />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#e5e1e4' }}>Colorir</span>
              <span style={{ fontSize: 10, color: '#cbc3d7' }}>24 páginas</span>
            </div>
          </div>

          {/* CTA de Download do Caderno Temático Oficial */}
          <button
            onClick={() => handleDownloadPdf('Caderno Completo Davi & Golias')}
            style={{
              width: '100%',
              height: 44,
              borderRadius: 12,
              backgroundColor: '#ffb95f',
              color: '#472a00',
              fontSize: 13,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 0 16px rgba(255, 185, 95, 0.35)',
              marginTop: 4
            }}
          >
            <Download size={18} />
            <span>Baixar Caderno Completo em PDF (Grátis)</span>
          </button>
        </section>

        {/* FILTROS LÚDICOS POR CATEGORIA */}
        <section style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#e5e1e4', margin: 0 }}>
            Categorias de Atividades
          </h3>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            overflowX: 'auto',
            padding: '2px 0',
            scrollbarWidth: 'none'
          }}>
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon
              const isSelected = selectedCategory === cat.key
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  style={{
                    flexShrink: 0,
                    padding: '8px 16px',
                    borderRadius: 9999,
                    backgroundColor: isSelected ? '#22c55e' : '#2a2a2c',
                    color: isSelected ? '#052e16' : '#cbc3d7',
                    fontSize: 12,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 0 12px rgba(34, 197, 94, 0.45)' : 'none'
                  }}
                >
                  <Icon size={14} color={isSelected ? '#052e16' : (cat.color || '#cbc3d7')} />
                  <span>{cat.label}</span>
                </button>
              )
            })}
          </div>
        </section>

        {/* SEÇÃO: CADERNOS EM DESTAQUE (GRID 2 COLUNAS) */}
        <section style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#e5e1e4', margin: 0 }}>
                Cadernos em Destaque
              </h3>
              <span style={{ fontSize: 12, color: '#cbc3d7' }}>
                Prontos para imprimir em formato A4
              </span>
            </div>
            <button
              onClick={() => showToast('Catálogo com mais de 40 cadernos liberado!')}
              style={{ background: 'none', border: 'none', color: '#22c55e', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
            >
              Ver +40
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {filteredWorkbooks.map((wb) => (
              <div
                key={wb.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 16,
                  backgroundColor: '#201f21',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}
              >
                <div style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '3/4',
                  backgroundColor: '#2a2a2c',
                  overflow: 'hidden'
                }}>
                  <img
                    src={wb.coverUrl}
                    alt={wb.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    padding: '2px 8px',
                    borderRadius: 6,
                    backgroundColor: wb.badgeBg || '#22c55e',
                    color: '#fff',
                    fontSize: 10,
                    fontWeight: 800
                  }}>
                    {wb.pagesText}
                  </div>
                  <div style={{
                    position: 'absolute',
                    bottom: 8,
                    left: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '2px 6px',
                    borderRadius: 6,
                    backgroundColor: 'rgba(14, 14, 16, 0.8)',
                    backdropFilter: 'blur(8px)',
                    color: '#e5e1e4',
                    fontSize: 10,
                    fontWeight: 800
                  }}>
                    <Star size={12} color="#ffb95f" fill="#ffb95f" />
                    <span>{wb.rating}</span>
                  </div>
                </div>

                <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#ffb95f', textTransform: 'uppercase' }}>
                    {wb.ageRange}
                  </span>
                  <h4 style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: '#e5e1e4',
                    margin: 0,
                    lineHeight: 1.25,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {wb.title}
                  </h4>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingTop: 4 }}>
                    <button
                      onClick={() => navigate('/materiais-em-pdf')}
                      style={{
                        flex: 1,
                        height: 32,
                        borderRadius: 8,
                        backgroundColor: '#2a2a2c',
                        color: '#e5e1e4',
                        fontSize: 11,
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Abrir
                    </button>
                    <button
                      aria-label="Baixar PDF"
                      onClick={() => handleDownloadPdf(wb.title)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        backgroundColor: 'rgba(34, 197, 94, 0.15)',
                        color: '#22c55e',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <Download size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* COLEÇÃO POR PERSONAGENS FAVORITOS (APRENDA COM SEUS HERÓIS) */}
        <section style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Star size={18} color="#ffb95f" fill="#ffb95f" />
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#e5e1e4', margin: 0 }}>
                Aprenda com seus Heróis
              </h3>
            </div>
            <span style={{ fontSize: 12, color: '#cbc3d7' }}>
              Toque para filtrar
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            overflowX: 'auto',
            padding: '6px 0',
            scrollbarWidth: 'none'
          }}>
            {HERO_FILTER_LIST.map((hero) => (
              <button
                key={hero.key}
                onClick={() => {
                  setSelectedHero(hero.key)
                  showToast(hero.key === 'all' ? 'Exibindo todos os personagens' : `Filtrando atividades de ${hero.name}`)
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  flexShrink: 0,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'transform 0.15s'
                }}
              >
                <div style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  padding: 2,
                  background: selectedHero === hero.key
                    ? 'linear-gradient(135deg, #22c55e, #ffb95f)'
                    : `linear-gradient(135deg, ${hero.ringColor}, #2a2a2c)`,
                  boxShadow: selectedHero === hero.key ? '0 0 14px rgba(34, 197, 94, 0.5)' : 'none'
                }}>
                  <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    backgroundColor: '#201f21'
                  }}>
                    <img
                      src={hero.avatar}
                      alt={hero.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/avatars/davi.png'
                      }}
                    />
                  </div>
                </div>
                <span style={{
                  fontSize: 12,
                  fontWeight: selectedHero === hero.key ? 800 : 600,
                  color: selectedHero === hero.key ? '#22c55e' : '#e5e1e4'
                }}>
                  {hero.name}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* SEÇÃO EDUCADOR / PAIS: APOIO PEDAGÓGICO */}
        <section style={{
          marginTop: 28,
          borderRadius: 24,
          backgroundColor: '#1c1b1d',
          padding: 18,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            right: -24,
            bottom: -24,
            width: 140,
            height: 140,
            borderRadius: '50%',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            filter: 'blur(30px)',
            pointerEvents: 'none'
          }} />

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{
              width: 46,
              height: 46,
              borderRadius: 14,
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              color: '#22c55e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <School size={24} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: '#ffb95f', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Espaço dos Pais &amp; EBD
              </span>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#e5e1e4', margin: '2px 0 0' }}>
                Para Sua Aula &amp; Ministério Infantil
              </h3>
            </div>
          </div>

          <p style={{ fontSize: 13, color: '#cbc3d7', margin: 0, lineHeight: 1.45 }}>
            Acesso liberado a planejamentos de aula lúdicos, dinâmicas bíblicas e autorização oficial para imprimir cópias ilimitadas para suas turmas.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 4 }}>
            <button
              onClick={() => navigate('/meu-espaco')}
              style={{
                flex: 1,
                height: 42,
                borderRadius: 12,
                backgroundColor: '#2a2a2c',
                color: '#e5e1e4',
                fontSize: 12,
                fontWeight: 700,
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                cursor: 'pointer'
              }}
            >
              <FileText size={16} color="#7bd0ff" />
              <span>Planos de Aula</span>
            </button>

            <button
              onClick={() => setLicenseModalOpen(true)}
              style={{
                flex: 1,
                height: 42,
                borderRadius: 12,
                backgroundColor: '#2a2a2c',
                color: '#e5e1e4',
                fontSize: 12,
                fontWeight: 700,
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                cursor: 'pointer'
              }}
            >
              <ShieldCheck size={16} color="#ffb95f" />
              <span>Licença Impressão</span>
            </button>
          </div>
        </section>
      </main>

      {/* MODAL LICENÇA DE IMPRESSÃO */}
      {licenseModalOpen && (
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
            maxWidth: 380,
            backgroundColor: '#201f21',
            borderRadius: 20,
            padding: 24,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 14,
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
            border: '1px solid #353437'
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 185, 95, 0.2)',
              color: '#ffb95f',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={32} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0 }}>
                Licença Oficial de Impressão
              </h3>
              <p style={{ fontSize: 13, color: '#cbc3d7', margin: 0, lineHeight: 1.45 }}>
                Sua assinatura Com Deus Kids concede autorização formal para imprimir quantas cópias desejar para uso em família, salas de EBD e ministério infantil da sua igreja local.
              </p>
            </div>

            <button
              onClick={() => setLicenseModalOpen(false)}
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
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* TOAST FLUTUANTE DE DOWNLOAD FEEDBACK */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: 80,
          left: 16,
          right: 16,
          zIndex: 99999,
          maxWidth: 480,
          margin: '0 auto'
        }}>
          <div style={{
            borderRadius: 16,
            backgroundColor: 'rgba(42, 42, 44, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            padding: 14,
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            border: '1px solid rgba(255, 185, 95, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                backgroundColor: 'rgba(255, 185, 95, 0.2)',
                color: '#ffb95f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <CheckCircle2 size={22} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#e5e1e4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Download Concluído!
                </span>
                <span style={{ fontSize: 11, color: '#cbc3d7', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Pronto para imprimir em PDF HD (A4).
                </span>
              </div>
            </div>

            <button
              onClick={() => setToastMessage(null)}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                backgroundColor: '#22c55e',
                color: '#052e16',
                fontSize: 11,
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              Abrir Arquivo
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
