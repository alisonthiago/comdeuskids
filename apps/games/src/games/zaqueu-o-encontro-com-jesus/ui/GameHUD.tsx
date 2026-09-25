import React from 'react'
import { Pause } from 'lucide-react'

interface GameHUDProps {
  score: number
  lives: number
  maxLives?: number
  objectiveText: string
  onPause: () => void
}

export function GameHUD({
  score,
  lives,
  maxLives = 3,
  objectiveText,
  onPause
}: GameHUDProps) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 40,
        padding: 'clamp(14px, 2.5vw, 24px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        userSelect: 'none',
        fontFamily: "'Inter', sans-serif"
      }}
    >
      {/* BARRA SUPERIOR (PONTOS / PAUSE) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Estrela de Pontos */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            border: '2px solid rgba(251, 191, 36, 0.8)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(8px)',
            borderRadius: 999,
            padding: '6px 16px 6px 10px',
            color: '#ffffff'
          }}
        >
          <span style={{ fontSize: 22, filter: 'drop-shadow(0 2px 4px rgba(245, 158, 11, 0.6))' }}>⭐</span>
          <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: '0.05em', color: '#fef08a' }}>
            {score.toString().padStart(3, '0')}
          </span>
        </div>

        {/* Botão de Pausa */}
        <button
          onClick={onPause}
          style={{
            pointerEvents: 'auto',
            width: 46,
            height: 46,
            borderRadius: 14,
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            border: '2px solid rgba(255, 255, 255, 0.25)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(8px)',
            transition: 'transform 0.15s ease, background 0.15s ease'
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1.0)')}
        >
          <Pause size={22} fill="#ffffff" />
        </button>
      </div>

      {/* BARRA INFERIOR (OBJETIVO E VIDAS) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16 }}>
        {/* Banner de Objetivo (Estilo Pergaminho Claro como no Storyboard) */}
        <div
          style={{
            maxWidth: 'min(360px, 60vw)',
            backgroundColor: 'rgba(254, 243, 199, 0.95)',
            border: '2px solid #d97706',
            borderRadius: 16,
            padding: '10px 16px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
            backdropFilter: 'blur(4px)'
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#92400e', marginBottom: 2 }}>
            Objetivo
          </div>
          <div style={{ fontSize: 'clamp(13px, 1.8vw, 15px)', fontWeight: 800, color: '#78350f', lineHeight: 1.3 }}>
            {objectiveText}
          </div>
        </div>

        {/* Vidas (Corações ❤️ ❤️ ❤️) */}
        <div
          style={{
            display: 'flex',
            gap: 6,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            borderRadius: 999,
            padding: '8px 14px',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
          }}
        >
          {Array.from({ length: maxLives }).map((_, idx) => {
            const hasHeart = idx < lives
            return (
              <span
                key={idx}
                style={{
                  fontSize: 24,
                  filter: hasHeart ? 'drop-shadow(0 2px 6px rgba(239, 68, 68, 0.7))' : 'grayscale(100%) opacity(0.35)',
                  transition: 'transform 0.2s ease'
                }}
              >
                ❤️
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}
