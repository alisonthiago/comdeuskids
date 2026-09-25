import React, { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Play, Plus, Check, ArrowLeft, Star, Clock,
  Calendar, Layers, ChevronRight
} from 'lucide-react'
import { STREAM_CATALOG } from '../../data/streamCatalog'
import { useTVSession } from '../../context/TVSessionContext'
import { useTVNavigation } from '../../hooks/useTVNavigation'
import TVPlayerModal from './TVPlayerModal'

export default function TVSeriesDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { myList, toggleMyList, isInMyList } = useTVSession()
  useTVNavigation()

  const series = useMemo(() => {
    return STREAM_CATALOG.find(c => c.slug === slug || c.id === slug || c.type === 'series') || STREAM_CATALOG[1]
  }, [slug])

  const [selectedSeason, setSelectedSeason] = useState(1)
  const [playingEpisode, setPlayingEpisode] = useState<any | null>(null)
  const isSaved = isInMyList(series.id)

  const episodes = series.seasons?.[0]?.episodes || [
    {
      id: 'ep-1',
      episode_number: 1,
      title: 'A Grande Missão e o Chamado',
      description: 'Noé recebe a missão de construir a arca segundo as instruções do Senhor.',
      duration_minutes: 24,
      thumbnail_url: series.thumbnail_url
    },
    {
      id: 'ep-2',
      episode_number: 2,
      title: 'Os Animais Chegam de Dois em Dois',
      description: 'Uma lição mágica de obediência e maravilha da criação divina.',
      duration_minutes: 26,
      thumbnail_url: series.thumbnail_url
    },
    {
      id: 'ep-3',
      episode_number: 3,
      title: 'A Chuva Cai e a Aliança Eterna',
      description: 'O arco-íris brilha como selo do amor eterno de Deus.',
      duration_minutes: 28,
      thumbnail_url: series.thumbnail_url
    }
  ]

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#131315',
      color: '#e5e1e4',
      fontFamily: 'var(--cdk-font-family, "Baloo 2", sans-serif)',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Background Banner */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '75%',
        height: '70vh',
        backgroundImage: `url(${series.banner_url || series.thumbnail_url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        filter: 'brightness(0.3)',
        pointerEvents: 'none'
      }} />

      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: '60%',
        background: 'linear-gradient(90deg, #131315 0%, #131315 70%, rgba(19,19,21,0) 100%)',
        pointerEvents: 'none'
      }} />

      {/* Topo da Série */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        padding: '50px 80px 30px',
        maxWidth: 1000
      }}>
        <button
          type="button"
          tabIndex={0}
          onClick={() => navigate('/tv')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '2px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 16,
            padding: '12px 24px',
            color: '#ffffff',
            fontSize: 18,
            fontWeight: 800,
            cursor: 'pointer',
            marginBottom: 24
          }}
        >
          <ArrowLeft size={24} />
          Voltar para Início TV
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
          <span style={{
            backgroundColor: '#22c55e',
            color: '#052e16',
            padding: '6px 16px',
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 800,
            textTransform: 'uppercase'
          }}>
            Série Original
          </span>
          <span style={{ backgroundColor: 'rgba(255,185,95,0.2)', color: '#ffb95f', padding: '6px 14px', borderRadius: 12, fontSize: 14, fontWeight: 800 }}>
            {series.age_range || 'Livre'}
          </span>
          <span style={{ fontSize: 16, color: '#cbc3d7', fontWeight: 700 }}>
            {episodes.length} Episódios
          </span>
        </div>

        <h1 style={{ fontSize: 'clamp(40px, 5vw, 60px)', fontWeight: 800, color: '#ffffff', margin: '0 0 16px', letterSpacing: '-0.02em' }}>
          {series.title}
        </h1>

        <p style={{ fontSize: 20, lineHeight: 1.6, color: '#cbc3d7', maxWidth: 800, margin: '0 0 24px' }}>
          {series.description}
        </p>

        <div style={{ display: 'flex', gap: 20 }}>
          <button
            type="button"
            tabIndex={0}
            autoFocus
            onClick={() => setPlayingEpisode(episodes[0])}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 14,
              backgroundColor: '#22c55e',
              color: '#052e16',
              border: '3px solid #ffffff',
              borderRadius: 20,
              padding: '16px 36px',
              fontSize: 22,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(34, 197, 94, 0.4)'
            }}
          >
            <Play size={28} fill="#052e16" />
            Assistir Ep. 1
          </button>

          <button
            type="button"
            tabIndex={0}
            onClick={() => toggleMyList(series.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              backgroundColor: isSaved ? 'rgba(123, 208, 255, 0.2)' : 'rgba(255, 255, 255, 0.08)',
              color: isSaved ? '#7bd0ff' : '#cbc3d7',
              border: `2px solid ${isSaved ? '#7bd0ff' : 'rgba(255, 255, 255, 0.2)'}`,
              borderRadius: 20,
              padding: '16px 28px',
              fontSize: 20,
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            {isSaved ? <Check size={24} /> : <Plus size={24} />}
            {isSaved ? 'Na Lista' : 'Salvar'}
          </button>
        </div>
      </div>

      {/* Carrossel de Episódios na TV */}
      <div style={{ padding: '20px 80px 80px', position: 'relative', zIndex: 10 }}>
        <h3 style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', marginBottom: 20 }}>
          Episódios — Temporada {selectedSeason}
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: 24
        }}>
          {episodes.map((ep: any) => (
            <div
              key={ep.id}
              tabIndex={0}
              onClick={() => setPlayingEpisode(ep)}
              style={{
                backgroundColor: '#1c1b1d',
                borderRadius: 20,
                border: '2px solid #2a2a2c',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, border-color 0.2s ease'
              }}
            >
              <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', backgroundColor: '#0e0e10' }}>
                <img
                  src={ep.thumbnail_url || series.thumbnail_url}
                  alt={ep.title}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: 12,
                  left: 12,
                  backgroundColor: 'rgba(19,19,21,0.85)',
                  padding: '4px 12px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 800,
                  color: '#22c55e'
                }}>
                  Episódio {ep.episode_number}
                </div>
              </div>

              <div style={{ padding: 20 }}>
                <h4 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', margin: '0 0 6px' }}>
                  {ep.title}
                </h4>
                <p style={{ fontSize: 14, color: '#cbc3d7', margin: 0, lineHeight: 1.5 }}>
                  {ep.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {playingEpisode && (
        <TVPlayerModal
          content={{
            ...series,
            title: `${series.title}: Ep. ${playingEpisode.episode_number} — ${playingEpisode.title}`
          }}
          onClose={() => setPlayingEpisode(null)}
        />
      )}
    </div>
  )
}
