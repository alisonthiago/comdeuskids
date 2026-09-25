import React, { useState, useEffect } from 'react'
import { soundEffects } from '../utils/soundEffects'
import { useGameInput } from '../hooks/useGameInput'
import { Trophy, RotateCcw, Volume2, VolumeX, Pause, Play, CheckCircle2 } from 'lucide-react'

interface SequenceStep {
  id: string
  label: string
  emoji: string
  description?: string
  correctOrder: number
}

interface SequenceStepEngineProps {
  title: string
  subtitle?: string
  narrativeGoal: string
  steps: SequenceStep[]
  onComplete: (stats: { timeSeconds: number; attempts: number; stars: number; score: number }) => void
  onExit: () => void
  onNextGame?: () => void
}

export default function SequenceStepEngine({
  title,
  subtitle,
  narrativeGoal,
  steps,
  onComplete,
  onExit,
  onNextGame
}: SequenceStepEngineProps) {
  const [placedSteps, setPlacedSteps] = useState<SequenceStep[]>([])
  const [availableSteps, setAvailableSteps] = useState<SequenceStep[]>([])
  const [selectedAvailableIdx, setSelectedAvailableIdx] = useState(0)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isMuted, setIsMuted] = useState(soundEffects.isMuted())
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const initGame = () => {
    // Embaralhar os passos
    const shuffled = [...steps].sort(() => Math.random() - 0.5)
    setAvailableSteps(shuffled)
    setPlacedSteps([])
    setSelectedAvailableIdx(0)
    setTimerSeconds(0)
    setIsCompleted(false)
    setIsPaused(false)
    setErrorMessage(null)
  }

  useEffect(() => {
    initGame()
  }, [steps])

  useEffect(() => {
    if (isCompleted || isPaused) return
    const timer = setInterval(() => setTimerSeconds(prev => prev + 1), 1000)
    return () => clearInterval(timer)
  }, [isCompleted, isPaused])

  const handleSelectStep = (step: SequenceStep) => {
    if (isPaused || isCompleted) return

    const expectedOrder = placedSteps.length
    if (step.correctOrder === expectedOrder) {
      soundEffects.playSnap()
      setErrorMessage(null)
      const nextPlaced = [...placedSteps, step]
      setPlacedSteps(nextPlaced)
      setAvailableSteps(prev => prev.filter(s => s.id !== step.id))
      setSelectedAvailableIdx(0)

      if (nextPlaced.length === steps.length) {
        soundEffects.playVictory()
        setIsCompleted(true)
        onComplete({
          timeSeconds: timerSeconds,
          attempts: steps.length,
          stars: 3,
          score: 1000
        })
      }
    } else {
      setErrorMessage('Essa ainda não é a ordem certa da história! Tente outra cena.')
      setTimeout(() => setErrorMessage(null), 2500)
    }
  }

  // Suporte a TV
  useGameInput({
    disabled: isCompleted,
    onAction: action => {
      if (action === 'MOVE_LEFT') {
        setSelectedAvailableIdx(prev => (prev > 0 ? prev - 1 : availableSteps.length - 1))
      } else if (action === 'MOVE_RIGHT') {
        setSelectedAvailableIdx(prev => (prev < availableSteps.length - 1 ? prev + 1 : 0))
      } else if (action === 'ACTION') {
        if (availableSteps[selectedAvailableIdx]) {
          handleSelectStep(availableSteps[selectedAvailableIdx])
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
      backgroundColor: '#111827',
      backgroundImage: 'radial-gradient(circle at top, #1f2937 0%, #111827 75%)',
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
            {subtitle && <span style={{ fontSize: 12, color: '#9ca3af' }}>{subtitle}</span>}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 13, color: '#f59e0b', fontWeight: 700 }}>⏱ {timerSeconds}s</span>
          <button
            onClick={() => {
              const next = !isMuted
              setIsMuted(next)
              soundEffects.setMuted(next)
            }}
            style={{ padding: 6, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, color: '#fff' }}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      </div>

      {/* ÁREA CENTRAL: LINHA DO TEMPO DA HISTÓRIA */}
      <div style={{
        flex: 1,
        maxWidth: 860,
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 20,
          padding: 20,
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: 16, color: '#e5e7eb' }}>{narrativeGoal}</h3>
          <div style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            {steps.map((_, idx) => {
              const placed = placedSteps[idx]
              return (
                <div
                  key={idx}
                  style={{
                    width: 110,
                    height: 120,
                    borderRadius: 16,
                    border: placed ? '2px solid #10b981' : '2px dashed rgba(255, 255, 255, 0.2)',
                    background: placed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0, 0, 0, 0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 8,
                    textAlign: 'center'
                  }}
                >
                  {placed ? (
                    <>
                      <span style={{ fontSize: 36 }}>{placed.emoji}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, marginTop: 4 }}>{placed.label}</span>
                      <CheckCircle2 size={14} color="#10b981" style={{ marginTop: 2 }} />
                    </>
                  ) : (
                    <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>Passo {idx + 1}</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {errorMessage && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid #ef4444',
            borderRadius: 12,
            padding: '10px 16px',
            color: '#fca5a5',
            fontSize: 13,
            textAlign: 'center',
            fontWeight: 600
          }}>
            {errorMessage}
          </div>
        )}

        {/* CENAS DISPONÍVEIS PARA ESCOLHER */}
        <div style={{
          background: 'rgba(31, 41, 55, 0.7)',
          borderRadius: 20,
          padding: 16,
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 700, display: 'block', marginBottom: 12 }}>
            Qual é a próxima cena? (Toque ou use as setas da TV):
          </span>
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 6 }}>
            {availableSteps.map((step, idx) => {
              const isTVFocus = selectedAvailableIdx === idx
              return (
                <button
                  key={step.id}
                  onClick={() => handleSelectStep(step)}
                  style={{
                    flex: '0 0 auto',
                    width: 120,
                    height: 120,
                    borderRadius: 16,
                    background: 'linear-gradient(135deg, #374151, #1f2937)',
                    border: isTVFocus ? '3px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transform: isTVFocus ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: isTVFocus ? '0 0 16px rgba(245, 158, 11, 0.4)' : 'none',
                    padding: 8
                  }}
                >
                  <span style={{ fontSize: 36 }}>{step.emoji}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, marginTop: 6, textAlign: 'center' }}>
                    {step.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* MODAL DE CONCLUSÃO */}
      {isCompleted && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1f2937, #111827)',
            border: '2px solid #10b981',
            borderRadius: 24,
            padding: 32,
            textAlign: 'center',
            maxWidth: 400,
            width: '90%'
          }}>
            <Trophy size={56} color="#10b981" style={{ marginBottom: 12 }} />
            <h3 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 8px 0' }}>História em Ordem! 📖</h3>
            <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 20 }}>
              Você colocou todos os acontecimentos sagrados na sequência perfeita!
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={initGame}
                style={{
                  padding: 14,
                  borderRadius: 12,
                  background: '#10b981',
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
                  color: '#9ca3af',
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
