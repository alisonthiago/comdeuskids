import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Heart, ArrowLeft, Play, Trash2, Film,
  Sparkles, Check
} from 'lucide-react'
import { STREAM_CATALOG } from '../../data/streamCatalog'
import { useTVSession } from '../../context/TVSessionContext'
import { useTVNavigation } from '../../hooks/useTVNavigation'
import TVPlayerModal from './TVPlayerModal'

export default function TVMinhaLista() {
  const navigate = useNavigate()
  const { myList, toggleMyList, activeProfile } = useTVSession()
  useTVNavigation()

  const [playingContent, setPlayingContent] = useState<any | null>(null)

  // Lista de itens favoritados
  const savedItems = useMemo(() => {
    return myList.map(id => STREAM_CATALOG.find(c => c.id === id)).filter(Boolean)
  }, [myList])

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#131315',
      color: '#e5e1e4',
      fontFamily: 'var(--cdk-font-family, "Baloo 2", sans-serif)',
      padding: '50px 80px'
    }}>
      {/* Topo */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <button
            type="button"
            tabIndex={0}
            onClick={() => navigate('/tv')}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '2px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 16,
              padding: '12px 24px',
              color: '#ffffff',
              fontSize: 18,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10
            }}
          >
            <ArrowLeft size={22} />
            Início TV
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Heart size={24} color="#ffb95f" fill="#ffb95f" />
              <h1 style={{ fontSize: 36, fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Minha Lista na TV
              </h1>
            </div>
            <p style={{ fontSize: 16, color: '#958ea0', margin: '4px 0 0' }}>
              Histórias e vídeos salvos por {activeProfile?.name || 'Davi'}
            </p>
          </div>
        </div>

        <div style={{ fontSize: 18, color: '#22c55e', fontWeight: 800 }}>
          {savedItems.length} {savedItems.length === 1 ? 'título salvo' : 'títulos salvos'}
        </div>
      </div>

      {/* Grade de Cards TV */}
      {savedItems.length === 0 ? (
        <div style={{
          backgroundColor: '#1c1b1d',
          borderRadius: 24,
          padding: '80px 40px',
          textAlign: 'center',
          border: '2px solid #2a2a2c',
          maxWidth: 600,
          margin: '40px auto'
        }}>
          <Film size={60} color="#494454" style={{ marginBottom: 20 }} />
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#ffffff', margin: '0 0 10px' }}>
            Sua lista está vazia
          </h2>
          <p style={{ fontSize: 16, color: '#958ea0', margin: '0 0 24px' }}>
            Navegue pelo catálogo e clique em "Adicionar à Minha Lista" para encontrar seus vídeos favoritos aqui.
          </p>
          <button
            type="button"
            tabIndex={0}
            onClick={() => navigate('/tv')}
            style={{
              backgroundColor: '#22c55e',
              color: '#052e16',
              border: 'none',
              borderRadius: 16,
              padding: '14px 32px',
              fontSize: 18,
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Explorar Catálogo
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 28
        }}>
          {savedItems.map((item: any) => (
            <div
              key={item.id}
              tabIndex={0}
              onClick={() => setPlayingContent(item)}
              style={{
                backgroundColor: '#1c1b1d',
                borderRadius: 20,
                border: '3px solid #2a2a2c',
                overflow: 'hidden',
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
                  top: 12,
                  left: 12,
                  backgroundColor: 'rgba(19, 19, 21, 0.85)',
                  padding: '4px 10px',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 800,
                  color: '#22c55e'
                }}>
                  {item.category}
                </div>
              </div>

              <div style={{ padding: '20px 20px 24px' }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', margin: '0 0 8px' }}>
                  {item.title}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                  <span style={{ fontSize: 14, color: '#ffb95f', fontWeight: 700 }}>
                    {item.age_range || 'Livre'} • {item.duration_minutes || 25}m
                  </span>
                  <button
                    type="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleMyList(item.id)
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ffb4ab',
                      cursor: 'pointer',
                      padding: 4
                    }}
                    title="Remover da Lista"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {playingContent && (
        <TVPlayerModal
          content={playingContent}
          onClose={() => setPlayingContent(null)}
        />
      )}
    </div>
  )
}
