import React, { useState, useEffect } from 'react'
import { soundEffects } from '../utils/soundEffects'
import { useGameInput } from '../hooks/useGameInput'
import { Sparkles, Trophy, RotateCcw, ArrowRight, Volume2, VolumeX, Pause, Play } from 'lucide-react'

interface MemoryCard {
  id: string
  key: string
  label: string
  emoji: string
  imageUrl?: string
}

interface MemoryEngineProps {
  title: string
  subtitle?: string
  pairs: Array<{ key: string; label: string; emoji: string; imageUrl?: string }>
  onComplete: (stats: { timeSeconds: number; attempts: number; stars: number; score: number }) => void
  onExit: () => void
  onNextGame?: () => void
}

export default function MemoryEngine({
  title,
  subtitle,
  pairs,
  onComplete,
  onExit,
  onNextGame
}: MemoryEngineProps) {
  const [cards, setCards] = useState<MemoryCard[]>([])
  const [flippedIndices, setFlippedIndices] = useState<number[]>([])
  const [matchedKeys, setMatchedKeys] = useState<string[]>([])
  const [attempts, setAttempts] = useState(0)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isMuted, setIsMuted] = useState(soundEffects.isMuted())
  const [selectedGridIndex, setSelectedGridIndex] = useState(0)

  // Inicializa o baralho embaralhado
  const initGame = () => {
    const deck: MemoryCard[] = []
    pairs.forEach(p => {
      deck.push({ id: `${p.key}-1`, key: p.key, label: p.label, emoji: p.emoji, imageUrl: p.imageUrl })
      deck.push({ id: `${p.key}-2`, key: p.key, label: p.label, emoji: p.emoji, imageUrl: p.imageUrl })
    })
    // Embaralhar (Fisher-Yates)
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[deck[i], deck[j]] = [deck[j], deck[i]]
    }
    setCards(deck)
    setFlippedIndices([])
    setMatchedKeys([])
    setAttempts(0)
    setTimerSeconds(0)
    setIsCompleted(false)
    setIsPaused(false)
    setSelectedGridIndex(0)
  }

  useEffect(() => {
    initGame()
  }, [pairs])

  // Temporizador
  useEffect(() => {
    if (isCompleted || isPaused) return
    const interval = setInterval(() => {
      setTimerSeconds(prev => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [isCompleted, isPaused])

  const handleCardClick = (index: number) => {
    if (isPaused || isCompleted) return
    if (flippedIndices.length >= 2) return
    if (flippedIndices.includes(index)) return
    if (matchedKeys.includes(cards[index].key)) return

    soundEffects.playCardFlip()
    const nextFlipped = [...flippedIndices, index]
    setFlippedIndices(nextFlipped)

    if (nextFlipped.length === 2) {
      setAttempts(prev => prev + 1)
      const firstCard = cards[nextFlipped[0]]
      const secondCard = cards[nextFlipped[1]]

      if (firstCard.key === secondCard.key) {
        soundEffects.playMatchSuccess()
        const nextMatched = [...matchedKeys, firstCard.key]
        setMatchedKeys(nextMatched)
        setFlippedIndices([])

        // Vitória!
        if (nextMatched.length === pairs.length) {
          soundEffects.playVictory()
          setIsCompleted(true)
          const stars = attempts <= pairs.length + 2 ? 3 : attempts <= pairs.length + 5 ? 2 : 1
          const calculatedScore = Math.max(100, 1000 - timerSeconds * 10 - attempts * 20)
          onComplete({
            timeSeconds: timerSeconds,
            attempts: attempts + 1,
            stars,
            score: calculatedScore
          })
        }
      } else {
        setTimeout(() => {
          setFlippedIndices([])
        }, 950)
      }
    }
  }

  // Suporte à navegação por controle remoto (Smart TV)
  useGameInput({
    disabled: isCompleted,
    onAction: action => {
      const cols = window.innerWidth > 640 ? 4 : 3
      if (action === 'MOVE_LEFT') {
        setSelectedGridIndex(prev => (prev > 0 ? prev - 1 : cards.length - 1))
      } else if (action === 'MOVE_RIGHT') {
        setSelectedGridIndex(prev => (prev < cards.length - 1 ? prev + 1 : 0))
      } else if (action === 'MOVE_UP') {
        setSelectedGridIndex(prev => (prev - cols >= 0 ? prev - cols : prev))
      } else if (action === 'MOVE_DOWN') {
        setSelectedGridIndex(prev => (prev + cols < cards.length ? prev + cols : prev))
      } else if (action === 'ACTION') {
        handleCardClick(selectedGridIndex)
      } else if (action === 'PAUSE') {
        setIsPaused(prev => !prev)
      } else if (action === 'BACK') {
        onExit()
      }
    }
  })

  const toggleSound = () => {
    const nextState = !isMuted
    setIsMuted(nextState)
    soundEffects.setMuted(nextState)
  }

  return (
    <div className="cdk-game-viewport" style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#0c0d14',
      backgroundImage: 'radial-gradient(ellipse at top, #1e1b4b 0%, #0c0d14 70%)',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      padding: 'clamp(12px, 2.5vw, 24px)',
      boxSizing: 'border-box',
      userSelect: 'none'
    }}>
      {/* HUD Superior / Safe Area */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
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
            <h2 style={{ margin: 0, fontSize: 'clamp(16px, 2vw, 20px)', fontWeight: 800 }}>{title}</h2>
            {subtitle && <span style={{ fontSize: 12, color: '#a5b4fc' }}>{subtitle}</span>}
          </div>
        </div>

        {/* Indicadores de Tempo, Tentativas e Controles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: 13, color: '#fcd34d', fontWeight: 700 }}>
            ⏱ {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
          </div>
          <div style={{ fontSize: 13, color: '#93c5fd', fontWeight: 700 }}>
            Tentativas: {attempts}
          </div>
          <button
            onClick={toggleSound}
            style={{
              padding: 8,
              borderRadius: 10,
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer'
            }}
            title={isMuted ? 'Ativar Som' : 'Silenciar'}
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
            title="Pausar Jogo"
          >
            {isPaused ? <Play size={18} /> : <Pause size={18} />}
          </button>
        </div>
      </div>

      {/* Grade de Cartas Responsiva */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: `repeat(${cards.length <= 12 ? '4' : '6'}, minmax(0, 1fr))`,
        gap: 'clamp(8px, 1.5vw, 16px)',
        alignContent: 'center',
        justifyContent: 'center',
        maxWidth: 960,
        margin: '0 auto',
        width: '100%'
      }}>
        {cards.map((card, index) => {
          const isFlipped = flippedIndices.includes(index) || matchedKeys.includes(card.key)
          const isTVFocused = selectedGridIndex === index

          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(index)}
              style={{
                aspectRatio: '1 / 1',
                borderRadius: 16,
                border: isTVFocused
                  ? '3px solid #fbbf24'
                  : '2px solid rgba(255, 255, 255, 0.12)',
                background: isFlipped
                  ? matchedKeys.includes(card.key)
                    ? 'linear-gradient(135deg, #10b981, #047857)'
                    : 'linear-gradient(135deg, #4f46e5, #4338ca)'
                  : 'linear-gradient(135deg, #1e1b4b, #312e81)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isTVFocused ? 'scale(1.05)' : 'scale(1)',
                boxShadow: isTVFocused
                  ? '0 0 20px rgba(251, 191, 36, 0.5)'
                  : '0 4px 12px rgba(0, 0, 0, 0.3)',
                padding: 6
              }}
            >
              {isFlipped ? (
                <>
                  <span style={{ fontSize: 'clamp(28px, 4.5vw, 48px)', lineHeight: 1 }}>{card.emoji}</span>
                  <span style={{
                    fontSize: 'clamp(10px, 1.2vw, 13px)',
                    fontWeight: 800,
                    marginTop: 4,
                    color: '#ffffff',
                    textAlign: 'center'
                  }}>
                    {card.label}
                  </span>
                </>
              ) : (
                <Sparkles size={28} color="#818cf8" style={{ opacity: 0.6 }} />
              )}
            </button>
          )
        })}
      </div>

      {/* Modal de Pausa */}
      {isPaused && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#18181b',
            border: '1px solid #3f3f46',
            borderRadius: 24,
            padding: 32,
            textAlign: 'center',
            maxWidth: 360,
            width: '90%'
          }}>
            <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Jogo Pausado ⏸</h3>
            <p style={{ color: '#a1a1aa', fontSize: 14, marginBottom: 24 }}>Hora de respirar um pouquinho!</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={() => setIsPaused(false)}
                style={{
                  padding: '12px 20px',
                  borderRadius: 12,
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Continuar Jogando
              </button>
              <button
                onClick={initGame}
                style={{
                  padding: '12px 20px',
                  borderRadius: 12,
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  border: 'none',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Recomeçar Partida
              </button>
              <button
                onClick={onExit}
                style={{
                  padding: '12px 20px',
                  borderRadius: 12,
                  background: 'transparent',
                  color: '#f87171',
                  border: 'none',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Sair dos Jogos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Conclusão / Celebração */}
      {isCompleted && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(10, 10, 18, 0.92)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e1b4b, #0f172a)',
            border: '2px solid #fbbf24',
            borderRadius: 28,
            padding: '36px 28px',
            textAlign: 'center',
            maxWidth: 420,
            width: '90%',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)'
          }}>
            <Trophy size={56} color="#fbbf24" style={{ marginBottom: 12 }} />
            <h3 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 6px 0', color: '#fff' }}>
              Parabéns! 🎉
            </h3>
            <p style={{ color: '#c7d2fe', fontSize: 15, margin: '0 0 20px 0' }}>
              Você completou com louvor: {title}
            </p>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 8,
              fontSize: 32,
              marginBottom: 20
            }}>
              ⭐ ⭐ ⭐
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 16,
              padding: 14,
              marginBottom: 24,
              fontSize: 13
            }}>
              <div>
                <span style={{ color: '#94a3b8', display: 'block' }}>Tempo</span>
                <strong style={{ fontSize: 18, color: '#fcd34d' }}>{timerSeconds}s</strong>
              </div>
              <div>
                <span style={{ color: '#94a3b8', display: 'block' }}>Tentativas</span>
                <strong style={{ fontSize: 18, color: '#60a5fa' }}>{attempts}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={initGame}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '14px',
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  color: '#052e16',
                  border: 'none',
                  fontSize: 16,
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                <RotateCcw size={18} /> Jogar Novamente
              </button>
              {onNextGame && (
                <button
                  onClick={onNextGame}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '14px',
                    borderRadius: 14,
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#fff',
                    border: 'none',
                    fontSize: 16,
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Próximo Jogo <ArrowRight size={18} />
                </button>
              )}
              <button
                onClick={onExit}
                style={{
                  padding: '12px',
                  borderRadius: 14,
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
