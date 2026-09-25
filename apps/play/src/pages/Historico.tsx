import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { STREAM_CATALOG } from '../data/streamCatalog'
import { useProfile } from '../context/ProfileContext'
import {
  History, Play, Trash2, Clock, CheckCircle2,
  ChevronLeft, Sparkles, Film, Music
} from 'lucide-react'

export default function Historico() {
  const navigate = useNavigate()
  const { activeProfile, watchProgress } = useProfile()
  const [filter, setFilter] = useState<'all' | 'movie' | 'series' | 'song'>('all')

  // Gera lista de histórico a partir do STREAM_CATALOG e progresso
  const initialHistory = [
    {
      content: STREAM_CATALOG.find(c => c.id === 'davi-golias') || STREAM_CATALOG[0],
      progressPct: 75,
      watchedDate: 'Hoje às 10:15',
      durationLeft: '11 min restantes'
    },
    {
      content: STREAM_CATALOG.find(c => c.id === 'arca-de-noe') || STREAM_CATALOG[1],
      progressPct: 40,
      watchedDate: 'Ontem às 18:30',
      durationLeft: '15 min restantes'
    },
    {
      content: STREAM_CATALOG.find(c => c.id === 'musica-alegria') || STREAM_CATALOG[2],
      progressPct: 100,
      watchedDate: 'Há 2 dias',
      durationLeft: 'Concluído'
    },
    {
      content: STREAM_CATALOG.find(c => c.id === 'criacao-do-mundo') || STREAM_CATALOG[3],
      progressPct: 90,
      watchedDate: 'Há 3 dias',
      durationLeft: '2 min restantes'
    }
  ]

  const [historyItems, setHistoryItems] = useState(initialHistory)

  const handleRemove = (id: string) => {
    setHistoryItems(prev => prev.filter(item => item.content.id !== id))
  }

  const handleClearAll = () => {
    if (confirm('Deseja limpar todo o histórico de visualização deste perfil?')) {
      setHistoryItems([])
    }
  }

  const filteredItems = historyItems.filter(item => {
    if (filter === 'all') return true
    return item.content.type === filter
  })

  return (
    <div style={{
      maxWidth: 1360,
      margin: '0 auto',
      padding: '104px 16px 96px',
      fontFamily: "'Baloo 2', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      {/* Voltar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid #2a2a2c',
            borderRadius: 12,
            padding: '8px 14px',
            color: '#cbc3d7',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <ChevronLeft size={16} />
          Voltar
        </button>
        <span style={{ fontSize: 13, color: '#958ea0' }}>•</span>
        <span style={{ fontSize: 13, color: '#22c55e', fontWeight: 700 }}>Histórico de Exibição</span>
      </div>

      {/* Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        marginBottom: 28
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            backgroundColor: 'rgba(34, 197, 94, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#22c55e'
          }}>
            <History size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: 'clamp(22px, 3.5vw, 28px)', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Histórico de {activeProfile?.name || 'Davi'}
            </h1>
            <p style={{ fontSize: 13, color: '#958ea0', margin: '4px 0 0' }}>
              Retome de onde parou seus vídeos, episódios e louvores favoritos.
            </p>
          </div>
        </div>

        {historyItems.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            style={{
              backgroundColor: '#201f21',
              border: '1px solid #2a2a2c',
              color: '#ffb4ab',
              borderRadius: 12,
              padding: '10px 18px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <Trash2 size={15} />
            Limpar Histórico
          </button>
        )}
      </div>

      {/* Chips de Filtro */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
        {[
          { id: 'all', label: 'Tudo' },
          { id: 'movie', label: 'Filmes & Histórias' },
          { id: 'series', label: 'Séries' },
          { id: 'song', label: 'Músicas' }
        ].map(cat => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setFilter(cat.id as any)}
            style={{
              background: filter === cat.id ? '#22c55e' : '#1c1b1d',
              color: filter === cat.id ? '#052e16' : '#cbc3d7',
              border: `1px solid ${filter === cat.id ? '#22c55e' : '#2a2a2c'}`,
              borderRadius: 20,
              padding: '7px 16px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grade de Itens */}
      {filteredItems.length === 0 ? (
        <div style={{
          backgroundColor: '#1c1b1d',
          borderRadius: 20,
          padding: '48px 24px',
          textAlign: 'center',
          color: '#958ea0',
          border: '1px solid #2a2a2c'
        }}>
          Nenhum conteúdo assistido nesta categoria ainda.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 20
        }}>
          {filteredItems.map(item => (
            <div
              key={item.content.id}
              style={{
                backgroundColor: '#1c1b1d',
                borderRadius: 16,
                border: '1px solid #2a2a2c',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Thumbnail com barra de progresso */}
              <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', backgroundColor: '#0e0e10' }}>
                <img
                  src={item.content.thumbnail_url}
                  alt={item.content.title}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />

                {/* Barra de Progresso Sobreposta */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  backgroundColor: 'rgba(0, 0, 0, 0.6)'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${item.progressPct}%`,
                    backgroundColor: '#22c55e'
                  }} />
                </div>
              </div>

              {/* Corpo */}
              <div style={{ padding: '14px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ fontSize: 15, fontWeight: 800, color: '#ffffff', margin: '0 0 6px', lineHeight: 1.3 }}>
                  {item.content.title}
                </h4>

                <div style={{ fontSize: 12, color: '#958ea0', display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span>{item.durationLeft}</span>
                  <span>{item.watchedDate}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 'auto' }}>
                  <Link
                    to={`/assistir/${item.content.id}`}
                    style={{
                      flex: 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      backgroundColor: '#22c55e',
                      color: '#052e16',
                      borderRadius: 10,
                      padding: '8px 12px',
                      fontSize: 13,
                      fontWeight: 800,
                      textDecoration: 'none',
                      boxShadow: '0 2px 10px rgba(34, 197, 94, 0.28)'
                    }}
                  >
                    <Play size={14} fill="#052e16" />
                    Continuar
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleRemove(item.content.id)}
                    style={{
                      backgroundColor: '#201f21',
                      border: '1px solid #2a2a2c',
                      color: '#958ea0',
                      borderRadius: 10,
                      width: 36,
                      height: 36,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                    title="Remover do Histórico"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
