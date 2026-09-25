import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ArrowLeft, Delete, CornerDownLeft, Play } from 'lucide-react'
import { STREAM_CATALOG } from '../../data/streamCatalog'
import { StreamContent } from '@comdeuskids/types'
import { useTVNavigation } from '../../hooks/useTVNavigation'
import TVPlayerModal from './TVPlayerModal'

export default function TVSearch() {
  const navigate = useNavigate()
  useTVNavigation()

  const [query, setQuery] = useState('')
  const [playingContent, setPlayingContent] = useState<StreamContent | null>(null)

  // Teclas do teclado virtual da Smart TV
  const KEYBOARD_ROWS = [
    ['A', 'B', 'C', 'D', 'E', 'F', '1', '2', '3'],
    ['G', 'H', 'I', 'J', 'K', 'L', '4', '5', '6'],
    ['M', 'N', 'O', 'P', 'Q', 'R', '7', '8', '9'],
    ['S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0']
  ]

  const handleKeyPress = (char: string) => {
    setQuery(prev => prev + char)
  }

  const handleBackspace = () => {
    setQuery(prev => prev.slice(0, -1))
  }

  const handleClear = () => {
    setQuery('')
  }

  const filteredResults = useMemo(() => {
    if (!query.trim()) return STREAM_CATALOG.slice(0, 8)
    const q = query.toLowerCase()
    return STREAM_CATALOG.filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.tags?.some(t => t.toLowerCase().includes(q))
    )
  }, [query])

  return (
    <div className="cdk-tv-body" style={{ minHeight: '100vh', background: '#08090b', padding: '40px 60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 30 }}>
        <button
          data-tv-focus
          className="cdk-tv-btn cdk-tv-focus"
          onClick={() => navigate('/tv')}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '50%',
            width: 54,
            height: 54,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={28} />
        </button>

        <h1 style={{ fontSize: 36, fontWeight: 800, color: '#fff' }}>Buscar na TV</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '440px 1fr', gap: 50, alignItems: 'start' }}>
        {/* Lado Esquerdo: Campo de Busca & Teclado Virtual para TV */}
        <div>
          {/* Display de Busca */}
          <div style={{
            background: '#12141f',
            border: '2px solid #292e42',
            borderRadius: 16,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            marginBottom: 24
          }}>
            <Search size={26} color="#22c55e" />
            <input
              type="text"
              placeholder="O que você quer assistir?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: 22,
                outline: 'none',
                width: '100%',
                fontWeight: 600
              }}
            />
            {query && (
              <button
                onClick={handleClear}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: '#94a3b8',
                  borderRadius: 6,
                  padding: '4px 8px',
                  cursor: 'pointer'
                }}
              >
                Limpar
              </button>
            )}
          </div>

          {/* Teclado Virtual na Tela da TV */}
          <div style={{
            background: '#0f111a',
            border: '1px solid #1f2333',
            borderRadius: 20,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 10
          }}>
            {KEYBOARD_ROWS.map((row, rIdx) => (
              <div key={rIdx} style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: 8 }}>
                {row.map(char => (
                  <button
                    key={char}
                    data-tv-focus
                    className="cdk-tv-btn cdk-tv-focus"
                    onClick={() => handleKeyPress(char)}
                    style={{
                      height: 48,
                      background: '#181b29',
                      border: '1px solid #2b3046',
                      borderRadius: 10,
                      color: '#fff',
                      fontSize: 18,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {char}
                  </button>
                ))}
              </div>
            ))}

            {/* Linha de Ações: Espaço e Apagar */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10, marginTop: 4 }}>
              <button
                data-tv-focus
                className="cdk-tv-btn cdk-tv-focus"
                onClick={() => handleKeyPress(' ')}
                style={{
                  height: 48,
                  background: '#181b29',
                  border: '1px solid #2b3046',
                  borderRadius: 10,
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                ESPAÇO
              </button>

              <button
                data-tv-focus
                className="cdk-tv-btn cdk-tv-focus"
                onClick={handleBackspace}
                style={{
                  height: 48,
                  background: '#241b24',
                  border: '1px solid #4a2838',
                  borderRadius: 10,
                  color: '#f87171',
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                <Delete size={18} /> APAGAR
              </button>
            </div>
          </div>
        </div>

        {/* Lado Direito: Resultados da Busca */}
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#94a3b8', marginBottom: 20 }}>
            {query.trim() ? `Resultados para "${query}" (${filteredResults.length})` : 'Sugestões para Você'}
          </h2>

          {filteredResults.length === 0 ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748b' }}>
              <p style={{ fontSize: 20 }}>Nenhum conteúdo encontrado para "{query}".</p>
              <p style={{ fontSize: 15, marginTop: 8 }}>Tente buscar por "Davi", "Jesus", "Bíblia" ou "Música".</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 24
            }}>
              {filteredResults.map(item => (
                <button
                  key={item.id}
                  data-tv-focus
                  className="cdk-tv-card cdk-tv-focus"
                  style={{ width: '100%', flex: 'none' }}
                  onClick={() => setPlayingContent(item)}
                >
                  <img src={item.thumbnail_url} alt={item.title} className="cdk-tv-card-img" />
                  <div className="cdk-tv-card-info">
                    <span className="cdk-tv-card-title">{item.title}</span>
                    <span style={{ fontSize: 13, color: '#22c55e' }}>{item.category}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {playingContent && (
        <TVPlayerModal
          content={playingContent}
          onClose={() => setPlayingContent(null)}
        />
      )}
    </div>
  )
}
