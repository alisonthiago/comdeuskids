import React, { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Play, Plus, Check, ArrowLeft, Star, Clock,
  Calendar, Award, BookOpen, Shield
} from 'lucide-react'
import { STREAM_CATALOG } from '../../data/streamCatalog'
import { useTVSession } from '../../context/TVSessionContext'
import { useTVNavigation } from '../../hooks/useTVNavigation'
import TVPlayerModal from './TVPlayerModal'

export default function TVContentDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { myList, toggleMyList, isInMyList } = useTVSession()
  useTVNavigation()

  const content = useMemo(() => {
    return STREAM_CATALOG.find(c => c.slug === slug || c.id === slug) || STREAM_CATALOG[0]
  }, [slug])

  const [isPlaying, setIsPlaying] = useState(false)
  const isSaved = isInMyList(content.id)

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#131315',
      color: '#e5e1e4',
      fontFamily: 'var(--cdk-font-family, "Baloo 2", sans-serif)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Banner Backdrop */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '70%',
        height: '100vh',
        backgroundImage: `url(${content.banner_url || content.thumbnail_url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        filter: 'brightness(0.35)',
        pointerEvents: 'none'
      }} />

      {/* Gradientes de Fusão de TV */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: '60%',
        background: 'linear-gradient(90deg, #131315 0%, #131315 70%, rgba(19,19,21,0) 100%)',
        pointerEvents: 'none'
      }} />

      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '40vh',
        background: 'linear-gradient(0deg, #131315 0%, rgba(19,19,21,0) 100%)',
        pointerEvents: 'none'
      }} />

      {/* Conteúdo Principal (10-Foot UI) */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        padding: '50px 80px',
        maxWidth: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: 24
      }}>
        {/* Botão Voltar */}
        <button
          type="button"
          tabIndex={0}
          onClick={() => navigate('/tv')}
          style={{
            alignSelf: 'flex-start',
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
            transition: 'all 0.2s ease'
          }}
        >
          <ArrowLeft size={24} />
          Voltar para Início
        </button>

        {/* Badges de Categoria & Faixa Etária */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{
            backgroundColor: '#22c55e',
            color: '#052e16',
            padding: '6px 16px',
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}>
            {content.category}
          </span>
          <span style={{
            backgroundColor: 'rgba(255, 185, 95, 0.2)',
            color: '#ffb95f',
            padding: '6px 14px',
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 800
          }}>
            {content.age_range || 'Livre'}
          </span>
          {content.duration_minutes && (
            <span style={{ fontSize: 16, color: '#cbc3d7', fontWeight: 700 }}>
              {content.duration_minutes} min
            </span>
          )}
        </div>

        {/* Título Gigante */}
        <h1 style={{
          fontSize: 'clamp(40px, 5vw, 64px)',
          fontWeight: 800,
          color: '#ffffff',
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          margin: 0
        }}>
          {content.title}
        </h1>

        {/* Versículo Bíblico em Destaque */}
        {content.scripture_verse && (
          <div style={{
            backgroundColor: 'rgba(34, 197, 94, 0.12)',
            borderLeft: '4px solid #22c55e',
            padding: '16px 20px',
            borderRadius: '0 16px 16px 0',
            fontSize: 18,
            color: '#22c55e',
            fontWeight: 600,
            lineHeight: 1.5,
            maxWidth: 760
          }}>
            📖 {content.scripture_verse}
          </div>
        )}

        {/* Sinopse */}
        <p style={{
          fontSize: 20,
          lineHeight: 1.6,
          color: '#cbc3d7',
          maxWidth: 820,
          margin: 0
        }}>
          {content.description}
        </p>

        {/* Botões de Ação para Controle Remoto */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 12 }}>
          <button
            type="button"
            tabIndex={0}
            autoFocus
            onClick={() => setIsPlaying(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 14,
              backgroundColor: '#22c55e',
              color: '#052e16',
              border: '3px solid #ffffff',
              borderRadius: 20,
              padding: '18px 40px',
              fontSize: 22,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(34, 197, 94, 0.4)',
              transition: 'transform 0.2s ease'
            }}
          >
            <Play size={28} fill="#052e16" />
            Assistir na TV
          </button>

          <button
            type="button"
            tabIndex={0}
            onClick={() => toggleMyList(content.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              backgroundColor: isSaved ? 'rgba(123, 208, 255, 0.2)' : 'rgba(255, 255, 255, 0.08)',
              color: isSaved ? '#7bd0ff' : '#cbc3d7',
              border: `2px solid ${isSaved ? '#7bd0ff' : 'rgba(255, 255, 255, 0.2)'}`,
              borderRadius: 20,
              padding: '18px 32px',
              fontSize: 20,
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            {isSaved ? <Check size={24} /> : <Plus size={24} />}
            {isSaved ? 'Na Minha Lista' : 'Adicionar à Lista'}
          </button>
        </div>
      </div>

      {/* Modal Player para TV */}
      {isPlaying && (
        <TVPlayerModal
          content={content}
          onClose={() => setIsPlaying(false)}
        />
      )}
    </div>
  )
}
