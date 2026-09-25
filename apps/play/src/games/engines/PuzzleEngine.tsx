import React, { useState, useEffect } from 'react'
import { soundEffects } from '../utils/soundEffects'
import { useGameInput } from '../hooks/useGameInput'
import { Trophy, RotateCcw, Volume2, VolumeX, Pause, Play, Check } from 'lucide-react'

interface PuzzlePiece {
  id: string
  label: string
  emoji: string
  targetSlot: number
  color: string
}

interface PuzzleEngineProps {
  title: string
  subtitle?: string
  pieces: Array<{ id: string; label: string; emoji: string; color?: string }>
  targetIllustrationName: string
  onComplete: (stats: { timeSeconds: number; attempts: number; stars: number; score: number }) => void
  onExit: () => void
  onNextGame?: () => void
}

export default function PuzzleEngine({
  title,
  subtitle,
  pieces,
  targetIllustrationName,
  onComplete,
  onExit,
  onNextGame
}: PuzzleEngineProps) {
  // Estado dos slots colocados (índice 0 a pieces.length - 1)
  const [placedSlots, setPlacedSlots] = useState<Record<number, PuzzlePiece | null>>({})
  // Peças disponíveis na bandeja
  const [availablePieces, setAvailablePieces] = useState<PuzzlePiece[]>([])
  // Seleção na TV / Teclado
  const [selectedPieceIndex, setSelectedPieceIndex] = useState<number | null>(null)
  const [activeTrayIndex, setActiveTrayIndex] = useState(0)
  const [activeSlotTarget, setActiveSlotTarget] = useState(0)
  const [selectionMode, setSelectionMode] = useState<'tray' | 'slots'>('tray')

  const [timerSeconds, setTimerSeconds] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isMuted, setIsMuted] = useState(soundEffects.isMuted())

  const defaultColors = ['#f59e0b', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6', '#14b8a6']

  const initGame = () => {
    const formattedPieces: PuzzlePiece[] = pieces.map((p, idx) => ({
      id: p.id,
      label: p.label,
      emoji: p.emoji,
      targetSlot: idx,
      color: p.color || defaultColors[idx % defaultColors.length]
    }))

    // Embaralhar bandeja
    const shuffled = [...formattedPieces].sort(() => Math.random() - 0.5)
    setAvailablePieces(shuffled)

    const initialSlots: Record<number, PuzzlePiece | null> = {}
    formattedPieces.forEach((_, idx) => {
      initialSlots[idx] = null
    })
    setPlacedSlots(initialSlots)

    setSelectedPieceIndex(null)
    setActiveTrayIndex(0)
    setActiveSlotTarget(0)
    setSelectionMode('tray')
    setTimerSeconds(0)
    setIsCompleted(false)
    setIsPaused(false)
  }

  useEffect(() => {
    initGame()
  }, [pieces])

  useEffect(() => {
    if (isCompleted || isPaused) return
    const timer = setInterval(() => setTimerSeconds(prev => prev + 1), 1000)
    return () => clearInterval(timer)
  }, [isCompleted, isPaused])

  const handlePlacePiece = (piece: PuzzlePiece, slotIndex: number) => {
    if (isPaused || isCompleted) return

    // Se o slot corresponder à peça (ou for livre para encaixar na ordem)
    if (piece.targetSlot === slotIndex) {
      soundEffects.playSnap()
      setPlacedSlots(prev => ({ ...prev, [slotIndex]: piece }))
      setAvailablePieces(prev => prev.filter(p => p.id !== piece.id))
      setSelectedPieceIndex(null)
      setSelectionMode('tray')

      // Verificar vitória
      const remainingCount = availablePieces.filter(p => p.id !== piece.id).length
      if (remainingCount === 0) {
        soundEffects.playVictory()
        setIsCompleted(true)
        const score = Math.max(200, 1000 - timerSeconds * 12)
        onComplete({
          timeSeconds: timerSeconds,
          attempts: pieces.length,
          stars: 3,
          score
        })
      }
    } else {
      // Som de erro sutil ou feedback
      setSelectedPieceIndex(null)
      setSelectionMode('tray')
    }
  }

  // Input Universal para TV e Teclado
  useGameInput({
    disabled: isCompleted,
    onAction: action => {
      if (action === 'MOVE_LEFT') {
        if (selectionMode === 'tray') {
          setActiveTrayIndex(prev => (prev > 0 ? prev - 1 : availablePieces.length - 1))
        } else {
          setActiveSlotTarget(prev => (prev > 0 ? prev - 1 : pieces.length - 1))
        }
      } else if (action === 'MOVE_RIGHT') {
        if (selectionMode === 'tray') {
          setActiveTrayIndex(prev => (prev < availablePieces.length - 1 ? prev + 1 : 0))
        } else {
          setActiveSlotTarget(prev => (prev < pieces.length - 1 ? prev + 1 : 0))
        }
      } else if (action === 'MOVE_UP' || action === 'MOVE_DOWN') {
        setSelectionMode(prev => (prev === 'tray' ? 'slots' : 'tray'))
      } else if (action === 'ACTION') {
        if (selectionMode === 'tray') {
          if (availablePieces[activeTrayIndex]) {
            setSelectedPieceIndex(activeTrayIndex)
            setSelectionMode('slots')
          }
        } else {
          if (selectedPieceIndex !== null && availablePieces[selectedPieceIndex]) {
            handlePlacePiece(availablePieces[selectedPieceIndex], activeSlotTarget)
          }
        }
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
      backgroundColor: '#090a10',
      backgroundImage: 'radial-gradient(circle at 50% 20%, #1e293b 0%, #090a10 75%)',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      padding: 'clamp(12px, 2vw, 24px)',
      boxSizing: 'border-box',
      userSelect: 'none'
    }}>
      {/* HUD Superior */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        marginBottom: 20
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
            <h2 style={{ margin: 0, fontSize: 'clamp(16px, 2vw, 20px)', fontWeight: 800 }}>{title}</h2>
            {subtitle && <span style={{ fontSize: 12, color: '#94a3b8' }}>{subtitle}</span>}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: 14, color: '#fbbf24', fontWeight: 700 }}>
            ⏱ {timerSeconds}s
          </div>
          <button
            onClick={() => {
              const nextState = !isMuted
              setIsMuted(nextState)
              soundEffects.setMuted(nextState)
            }}
            style={{
              padding: 8,
              borderRadius: 10,
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer'
            }}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <button
            onClick={() => setIsPaused(prev => !prev)}
            style={{
              padding: 8,
              borderRadius: 10,
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer'
            }}
          >
            {isPaused ? <Play size={18} /> : <Pause size={18} />}
          </button>
        </div>
      </div>

      {/* ÁREA CENTRAL: ESTRUTURA DO QUEBRA-CABEÇA COM SLOTS */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        maxWidth: 880,
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Placa do Quebra-Cabeça montando */}
        <div style={{
          width: '100%',
          background: 'rgba(255, 255, 255, 0.04)',
          borderRadius: 24,
          padding: '24px',
          border: '2px dashed rgba(255, 255, 255, 0.15)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 16, color: '#cbd5e1' }}>
            {targetIllustrationName}
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${pieces.length <= 6 ? pieces.length : 4}, minmax(0, 1fr))`,
            gap: 12
          }}>
            {pieces.map((piece, slotIdx) => {
              const placed = placedSlots[slotIdx]
              const isTargeting = selectionMode === 'slots' && activeSlotTarget === slotIdx

              return (
                <div
                  key={piece.id}
                  onClick={() => {
                    if (selectedPieceIndex !== null && availablePieces[selectedPieceIndex]) {
                      handlePlacePiece(availablePieces[selectedPieceIndex], slotIdx)
                    }
                  }}
                  style={{
                    aspectRatio: '1 / 1',
                    borderRadius: 16,
                    border: isTargeting
                      ? '3px solid #f59e0b'
                      : placed
                      ? '2px solid rgba(255, 255, 255, 0.2)'
                      : '2px dashed rgba(255, 255, 255, 0.2)',
                    background: placed
                      ? placed.color
                      : 'rgba(0, 0, 0, 0.25)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    transform: isTargeting ? 'scale(1.05)' : 'scale(1)',
                    cursor: selectedPieceIndex !== null ? 'pointer' : 'default',
                    padding: 8
                  }}
                >
                  {placed ? (
                    <>
                      <span style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}>{placed.emoji}</span>
                      <span style={{ fontSize: 12, fontWeight: 800, marginTop: 4 }}>{placed.label}</span>
                    </>
                  ) : (
                    <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>
                      Parte {slotIdx + 1}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* BANDEJA INFERIOR DE PEÇAS DISPONÍVEIS */}
        <div style={{
          width: '100%',
          background: 'rgba(15, 23, 42, 0.8)',
          borderRadius: 20,
          padding: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 700 }}>
              Peças para Encaixar (Toque na peça e depois na posição):
            </span>
            <span style={{ fontSize: 12, color: '#f59e0b' }}>
              {availablePieces.length} restantes
            </span>
          </div>

          <div style={{
            display: 'flex',
            gap: 12,
            overflowX: 'auto',
            paddingBottom: 4
          }}>
            {availablePieces.map((p, idx) => {
              const isSelected = selectedPieceIndex === idx
              const isFocusedTV = selectionMode === 'tray' && activeTrayIndex === idx

              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPieceIndex(idx)
                    setSelectionMode('slots')
                  }}
                  style={{
                    flex: '0 0 auto',
                    width: 90,
                    height: 90,
                    borderRadius: 16,
                    border: isSelected || isFocusedTV
                      ? '3px solid #38bdf8'
                      : '2px solid rgba(255, 255, 255, 0.15)',
                    background: p.color,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transform: isSelected || isFocusedTV ? 'scale(1.08)' : 'scale(1)',
                    boxShadow: isSelected
                      ? '0 0 16px rgba(56, 189, 248, 0.6)'
                      : '0 4px 8px rgba(0,0,0,0.3)',
                    transition: 'all 0.15s ease',
                    color: '#fff',
                    padding: 4
                  }}
                >
                  <span style={{ fontSize: 32 }}>{p.emoji}</span>
                  <span style={{ fontSize: 11, fontWeight: 800, marginTop: 2, textAlign: 'center' }}>
                    {p.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Modal Vitória */}
      {isCompleted && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(10, 10, 18, 0.92)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e293b, #0f172a)',
            border: '2px solid #38bdf8',
            borderRadius: 24,
            padding: 32,
            textAlign: 'center',
            maxWidth: 400,
            width: '90%'
          }}>
            <Trophy size={56} color="#38bdf8" style={{ marginBottom: 12 }} />
            <h3 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 8px 0' }}>Construção Completa! 🌟</h3>
            <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 20 }}>
              Você colocou todas as partes no lugar certo!
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={initGame}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: 14,
                  borderRadius: 12,
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <RotateCcw size={18} /> Montar Novamente
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
