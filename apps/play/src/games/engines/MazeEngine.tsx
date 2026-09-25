import React, { useState, useEffect } from 'react'
import { soundEffects } from '../utils/soundEffects'
import { useGameInput } from '../hooks/useGameInput'
import { Trophy, RotateCcw, Volume2, VolumeX, Pause, Play } from 'lucide-react'

interface MazeEngineProps {
  title: string
  characterEmoji: string
  characterName: string
  exitEmoji: string
  exitLabel: string
  obstacleEmoji: string
  collectibleEmoji: string
  totalCollectibles: number
  faithMessage: string
  onComplete: (stats: { timeSeconds: number; attempts: number; stars: number; score: number }) => void
  onExit: () => void
  onNextGame?: () => void
}

// Grade de Labirinto 7x7 (0 = caminho, 1 = parede, 2 = item, 3 = saída)
const INITIAL_MAZE_GRID = [
  [0, 0, 1, 0, 2, 0, 0],
  [1, 0, 1, 0, 1, 1, 0],
  [0, 0, 0, 0, 0, 1, 0],
  [0, 1, 1, 1, 0, 0, 2],
  [2, 0, 0, 1, 0, 1, 1],
  [1, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 0, 3]
]

export default function MazeEngine({
  title,
  characterEmoji,
  characterName,
  exitEmoji,
  exitLabel,
  obstacleEmoji,
  collectibleEmoji,
  totalCollectibles = 3,
  faithMessage,
  onComplete,
  onExit,
  onNextGame
}: MazeEngineProps) {
  const [grid, setGrid] = useState<number[][]>(INITIAL_MAZE_GRID)
  const [playerPos, setPlayerPos] = useState({ r: 0, c: 0 })
  const [collectedCount, setCollectedCount] = useState(0)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isMuted, setIsMuted] = useState(soundEffects.isMuted())

  const initGame = () => {
    // Clonar matriz
    const newGrid = INITIAL_MAZE_GRID.map(row => [...row])
    setGrid(newGrid)
    setPlayerPos({ r: 0, c: 0 })
    setCollectedCount(0)
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

  const tryMove = (dr: number, dc: number) => {
    if (isPaused || isCompleted) return

    const newR = playerPos.r + dr
    const newC = playerPos.c + dc

    // Limites
    if (newR < 0 || newR >= 7 || newC < 0 || newC >= 7) return
    // Parede
    if (grid[newR][newC] === 1) return

    // Coleta de Item
    if (grid[newR][newC] === 2) {
      soundEffects.playCollect()
      const nextGrid = [...grid.map(row => [...row])]
      nextGrid[newR][newC] = 0
      setGrid(nextGrid)
      setCollectedCount(prev => prev + 1)
    }

    // Saída
    if (grid[newR][newC] === 3) {
      soundEffects.playVictory()
      setIsCompleted(true)
      onComplete({
        timeSeconds: timerSeconds,
        attempts: 1,
        stars: 3,
        score: 1100
      })
    } else {
      soundEffects.playCardFlip()
    }

    setPlayerPos({ r: newR, c: newC })
  }

  // Controles TV e Teclado
  useGameInput({
    disabled: isCompleted,
    onAction: action => {
      if (action === 'MOVE_UP') tryMove(-1, 0)
      else if (action === 'MOVE_DOWN') tryMove(1, 0)
      else if (action === 'MOVE_LEFT') tryMove(0, -1)
      else if (action === 'MOVE_RIGHT') tryMove(0, 1)
      else if (action === 'PAUSE') setIsPaused(prev => !prev)
      else if (action === 'BACK') onExit()
    }
  })

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#1e1b4b',
      backgroundImage: 'radial-gradient(circle at 50% 30%, #312e81 0%, #0f172a 80%)',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      padding: 'clamp(10px, 2vw, 20px)',
      boxSizing: 'border-box',
      userSelect: 'none'
    }}>
      {/* HUD Superior */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        background: 'rgba(255, 255, 255, 0.06)',
        borderRadius: 16,
        marginBottom: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={onExit}
            style={{
              padding: '8px 14px',
              borderRadius: 10,
              background: 'rgba(255, 255, 255, 0.1)',
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
            <span style={{ fontSize: 12, color: '#c7d2fe' }}>Ajude {characterName}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 13, color: '#fcd34d', fontWeight: 700 }}>
            {collectibleEmoji} {collectedCount}/{totalCollectibles}
          </span>
          <span style={{ fontSize: 13, color: '#93c5fd', fontWeight: 700 }}>⏱ {timerSeconds}s</span>
        </div>
      </div>

      {/* ÁREA CENTRAL: LABIRINTO */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 6,
          background: 'rgba(0, 0, 0, 0.4)',
          padding: 12,
          borderRadius: 20,
          border: '2px solid rgba(255, 255, 255, 0.15)',
          maxWidth: 440,
          width: '100%',
          aspectRatio: '1 / 1'
        }}>
          {grid.map((row, r) =>
            row.map((cell, c) => {
              const isPlayer = playerPos.r === r && playerPos.c === c
              const isWall = cell === 1
              const isItem = cell === 2
              const isExit = cell === 3

              return (
                <div
                  key={`${r}-${c}`}
                  style={{
                    borderRadius: 10,
                    background: isWall
                      ? 'linear-gradient(135deg, #475569, #334155)'
                      : isExit
                      ? 'rgba(16, 185, 129, 0.3)'
                      : 'rgba(255, 255, 255, 0.05)',
                    border: isWall
                      ? '1px solid #64748b'
                      : isExit
                      ? '2px solid #10b981'
                      : '1px solid rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isPlayer ? 30 : 24,
                    transition: 'all 0.1s ease',
                    boxShadow: isPlayer ? '0 0 16px rgba(251, 191, 36, 0.6)' : 'none'
                  }}
                >
                  {isPlayer ? characterEmoji : isItem ? collectibleEmoji : isExit ? exitEmoji : isWall ? obstacleEmoji : ''}
                </div>
              )
            })
          )}
        </div>

        {/* CONTROLES DE TOQUE MOBILE (D-PAD) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 56px)',
          gap: 8,
          justifyContent: 'center',
          marginTop: 8
        }}>
          <div />
          <button
            onClick={() => tryMove(-1, 0)}
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#fff',
              fontSize: 20,
              cursor: 'pointer'
            }}
          >
            ▲
          </button>
          <div />
          <button
            onClick={() => tryMove(0, -1)}
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#fff',
              fontSize: 20,
              cursor: 'pointer'
            }}
          >
            ◀
          </button>
          <button
            onClick={() => tryMove(1, 0)}
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#fff',
              fontSize: 20,
              cursor: 'pointer'
            }}
          >
            ▼
          </button>
          <button
            onClick={() => tryMove(0, 1)}
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#fff',
              fontSize: 20,
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
          background: 'rgba(15, 23, 42, 0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e1b4b, #0f172a)',
            border: '2px solid #38bdf8',
            borderRadius: 24,
            padding: 32,
            textAlign: 'center',
            maxWidth: 400,
            width: '90%'
          }}>
            <Trophy size={56} color="#38bdf8" style={{ marginBottom: 12 }} />
            <h3 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 8px 0' }}>Livramento e Fé! 🦁</h3>
            <p style={{ color: '#c7d2fe', fontSize: 14, marginBottom: 20 }}>
              {faithMessage}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={initGame}
                style={{
                  padding: 14,
                  borderRadius: 12,
                  background: '#2563eb',
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
                  color: '#94a3b8',
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
