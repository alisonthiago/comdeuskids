import React, { useState, useEffect } from 'react'
import { soundEffects } from '../utils/soundEffects'
import { useGameInput } from '../hooks/useGameInput'
import { Trophy, RotateCcw, Volume2, VolumeX } from 'lucide-react'

interface CatchActionEngineProps {
  title: string
  subtitle?: string
  catcherEmoji: string
  catcherName: string
  targetItemEmoji: string
  targetCount: number
  targetItemName: string
  faithMessage: string
  onComplete: (stats: { timeSeconds: number; attempts: number; stars: number; score: number }) => void
  onExit: () => void
  onNextGame?: () => void
}

interface FallingItem {
  id: number
  x: number
  y: number
  speed: number
  caught: boolean
}

export default function CatchActionEngine({
  title,
  subtitle,
  catcherEmoji,
  catcherName,
  targetItemEmoji,
  targetCount = 10,
  targetItemName,
  faithMessage,
  onComplete,
  onExit,
  onNextGame
}: CatchActionEngineProps) {
  const [catcherX, setCatcherX] = useState(50) // porcentagem 0-100%
  const [items, setItems] = useState<FallingItem[]>([])
  const [caughtCount, setCaughtCount] = useState(0)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isMuted, setIsMuted] = useState(soundEffects.isMuted())

  const initGame = () => {
    setCatcherX(50)
    setItems([])
    setCaughtCount(0)
    setTimerSeconds(0)
    setIsCompleted(false)
    setIsPaused(false)
  }

  useEffect(() => {
    initGame()
  }, [])

  useEffect(() => {
    if (isCompleted || isPaused) return
    const timer = setInterval(() => setTimerSeconds(prev => prev + 1), 1000)
    return () => clearInterval(timer)
  }, [isCompleted, isPaused])

  // Spawn e queda contínua de peixes/pães
  useEffect(() => {
    if (isCompleted || isPaused) return

    // Gerador de novos itens
    const spawner = setInterval(() => {
      setItems(prev => {
        if (prev.length >= 6) return prev
        const newItem: FallingItem = {
          id: Date.now() + Math.random(),
          x: Math.floor(Math.random() * 80) + 10, // 10% a 90%
          y: 0,
          speed: 2 + Math.random() * 2,
          caught: false
        }
        return [...prev, newItem]
      })
    }, 1100)

    // Gravidade dos itens
    const ticker = setInterval(() => {
      setItems(prev =>
        prev
          .map(item => {
            const nextY = item.y + item.speed
            // Detectar captura (altura 75% a 85% e proximidade do catcherX)
            if (!item.caught && nextY >= 75 && nextY <= 85 && Math.abs(item.x - catcherX) < 12) {
              soundEffects.playCollect()
              setCaughtCount(c => {
                const next = c + 1
                if (next >= targetCount) {
                  soundEffects.playVictory()
                  setIsCompleted(true)
                  onComplete({
                    timeSeconds: timerSeconds,
                    attempts: 1,
                    stars: 3,
                    score: 1000
                  })
                }
                return next
              })
              return { ...item, caught: true }
            }
            return { ...item, y: nextY }
          })
          .filter(item => item.y < 95 && !item.caught)
      )
    }, 40)

    return () => {
      clearInterval(spawner)
      clearInterval(ticker)
    }
  }, [isCompleted, isPaused, catcherX, targetCount, timerSeconds, onComplete])

  // Controles TV e Teclado
  useGameInput({
    disabled: isCompleted,
    onAction: action => {
      if (action === 'MOVE_LEFT') {
        setCatcherX(prev => Math.max(10, prev - 10))
      } else if (action === 'MOVE_RIGHT') {
        setCatcherX(prev => Math.min(90, prev + 10))
      } else if (action === 'PAUSE') {
        setIsPaused(prev => !prev)
      } else if (action === 'BACK') {
        onExit()
      }
    }
  })

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#0369a1',
      backgroundImage: 'radial-gradient(circle at 50% 10%, #0284c7 0%, #0c4a6e 80%)',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      padding: 'clamp(10px, 2vw, 20px)',
      boxSizing: 'border-box',
      userSelect: 'none',
      overflow: 'hidden'
    }}>
      {/* HUD Superior */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 16,
        marginBottom: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={onExit}
            style={{
              padding: '8px 14px',
              borderRadius: 10,
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            ← Voltar
          </button>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{title}</h2>
            {subtitle && <span style={{ fontSize: 12, color: '#bae6fd' }}>{subtitle}</span>}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 14, color: '#fef08a', fontWeight: 800 }}>
            {targetItemEmoji} {caughtCount}/{targetCount} {targetItemName}
          </span>
          <span style={{ fontSize: 13, color: '#ffffff', fontWeight: 700 }}>⏱ {timerSeconds}s</span>
        </div>
      </div>

      {/* ÁREA DE AÇÃO (MAR / CAMPO) */}
      <div style={{
        flex: 1,
        position: 'relative',
        background: 'rgba(0, 0, 0, 0.2)',
        borderRadius: 24,
        overflow: 'hidden',
        border: '2px solid rgba(255, 255, 255, 0.2)'
      }}>
        {/* Itens caindo / nadando */}
        {items.map(item => (
          <div
            key={item.id}
            style={{
              position: 'absolute',
              left: `${item.x}%`,
              top: `${item.y}%`,
              fontSize: 36,
              transform: 'translate(-50%, -50%)',
              transition: 'top 0.04s linear'
            }}
          >
            {targetItemEmoji}
          </div>
        ))}

        {/* Catcher (Rede / Barco / Cesta) */}
        <div style={{
          position: 'absolute',
          left: `${catcherX}%`,
          top: '80%',
          transform: 'translate(-50%, -50%)',
          fontSize: 56,
          transition: 'left 0.1s ease-out'
        }}>
          {catcherEmoji}
        </div>

        {/* Controles de Toque na Tela para Celular */}
        <div style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          right: 16,
          display: 'flex',
          justifyContent: 'space-between',
          pointerEvents: 'none'
        }}>
          <button
            onPointerDown={() => setCatcherX(prev => Math.max(10, prev - 12))}
            style={{
              pointerEvents: 'auto',
              width: 64,
              height: 64,
              borderRadius: 20,
              background: 'rgba(0, 0, 0, 0.6)',
              border: '2px solid rgba(255, 255, 255, 0.4)',
              color: '#fff',
              fontSize: 28,
              cursor: 'pointer'
            }}
          >
            ◀
          </button>
          <button
            onPointerDown={() => setCatcherX(prev => Math.min(90, prev + 12))}
            style={{
              pointerEvents: 'auto',
              width: 64,
              height: 64,
              borderRadius: 20,
              background: 'rgba(0, 0, 0, 0.6)',
              border: '2px solid rgba(255, 255, 255, 0.4)',
              color: '#fff',
              fontSize: 28,
              cursor: 'pointer'
            }}
          >
            ▶
          </button>
        </div>
      </div>

      {/* MODAL VITÓRIA */}
      {isCompleted && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(12, 74, 110, 0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #0284c7, #075985)',
            border: '2px solid #7dd3fc',
            borderRadius: 24,
            padding: 32,
            textAlign: 'center',
            maxWidth: 400,
            width: '90%'
          }}>
            <Trophy size={56} color="#fef08a" style={{ marginBottom: 12 }} />
            <h3 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 8px 0' }}>Milagre da Fartura! 🐟</h3>
            <p style={{ color: '#e0f2fe', fontSize: 14, marginBottom: 20 }}>
              {faithMessage}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={initGame}
                style={{
                  padding: 14,
                  borderRadius: 12,
                  background: '#f59e0b',
                  color: '#fff',
                  border: 'none',
                  fontSize: 16,
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                <RotateCcw size={18} /> Jogar Novamente
              </button>
              <button
                onClick={onExit}
                style={{
                  padding: 12,
                  borderRadius: 12,
                  background: 'transparent',
                  color: '#bae6fd',
                  border: 'none',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Voltar aos Jogos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
