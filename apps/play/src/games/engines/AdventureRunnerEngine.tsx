import React, { useState, useEffect, useRef, useCallback } from 'react'
import { soundEffects } from '../utils/soundEffects'
import { useGameInput } from '../hooks/useGameInput'
import { Trophy, RotateCcw, Volume2, VolumeX, Pause, Play, Sparkles } from 'lucide-react'

interface AdventureRunnerEngineProps {
  title: string
  characterName: string
  characterEmoji: string
  targetItemsCount: number
  targetItemName: string
  targetItemEmoji: string
  bossName?: string
  bossEmoji?: string
  faithMessage: string
  onComplete: (stats: { timeSeconds: number; attempts: number; stars: number; score: number }) => void
  onExit: () => void
  onNextGame?: () => void
}

interface CollectibleItem {
  id: number
  x: number
  y: number
  collected: boolean
}

interface Obstacle {
  x: number
  width: number
  height: number
  label: string
}

export default function AdventureRunnerEngine({
  title,
  characterName,
  characterEmoji,
  targetItemsCount = 5,
  targetItemName,
  targetItemEmoji,
  bossName,
  bossEmoji,
  faithMessage,
  onComplete,
  onExit,
  onNextGame
}: AdventureRunnerEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Estados de Jogo
  const [phase, setPhase] = useState<'collecting' | 'boss_challenge' | 'completed'>('collecting')
  const [itemsCollected, setItemsCollected] = useState(0)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isMuted, setIsMuted] = useState(soundEffects.isMuted())

  // Posições físicas 2D (mundo virtual de 3000px de comprimento)
  const playerRef = useRef({
    x: 80,
    y: 0,
    vx: 0,
    vy: 0,
    isGrounded: true,
    facing: 'right'
  })

  // Itens e Obstáculos no mapa
  const [collectibles, setCollectibles] = useState<CollectibleItem[]>([])
  const [obstacles, setObstacles] = useState<Obstacle[]>([])

  // Boss / Desafio da Funda
  const [slingAngle, setSlingAngle] = useState(45)
  const [slingPower, setSlingPower] = useState(50)
  const [bossHealth, setBossHealth] = useState(100)
  const [stoneFlying, setStoneFlying] = useState(false)
  const [stonePos, setStonePos] = useState({ x: 100, y: 300 })

  const groundY = 280

  const initGame = () => {
    playerRef.current = {
      x: 80,
      y: groundY,
      vx: 0,
      vy: 0,
      isGrounded: true,
      facing: 'right'
    }

    // Gerar 5 itens espaçados
    const newItems: CollectibleItem[] = []
    const spacing = 450
    for (let i = 0; i < targetItemsCount; i++) {
      newItems.push({
        id: i + 1,
        x: 400 + i * spacing,
        y: groundY - 20,
        collected: false
      })
    }
    setCollectibles(newItems)

    // Obstáculos (pedras grandes ou troncos no caminho)
    setObstacles([
      { x: 300, width: 40, height: 35, label: '🪨' },
      { x: 750, width: 45, height: 40, label: '🪵' },
      { x: 1200, width: 40, height: 35, label: '🪨' },
      { x: 1650, width: 50, height: 40, label: '🪵' },
      { x: 2100, width: 45, height: 35, label: '🪨' }
    ])

    setItemsCollected(0)
    setPhase('collecting')
    setBossHealth(100)
    setTimerSeconds(0)
    setIsPaused(false)
    setStoneFlying(false)
  }

  useEffect(() => {
    initGame()
  }, [])

  useEffect(() => {
    if (phase === 'completed' || isPaused) return
    const timer = setInterval(() => setTimerSeconds(prev => prev + 1), 1000)
    return () => clearInterval(timer)
  }, [phase, isPaused])

  // Ações de Pulo e Movimento
  const handleJump = useCallback(() => {
    if (playerRef.current.isGrounded) {
      playerRef.current.vy = -13
      playerRef.current.isGrounded = false
      soundEffects.playJump()
    }
  }, [])

  const movePlayer = useCallback((dir: 'left' | 'right') => {
    if (dir === 'left') {
      playerRef.current.vx = -6
      playerRef.current.facing = 'left'
    } else {
      playerRef.current.vx = 6
      playerRef.current.facing = 'right'
    }
  }, [])

  const stopPlayer = useCallback(() => {
    playerRef.current.vx = 0
  }, [])

  // Disparar funda contra o desafio final
  const launchSlingStone = () => {
    if (stoneFlying) return
    setStoneFlying(true)
    soundEffects.playSnap()

    let progress = 0
    const startX = 140
    const startY = 260
    const targetX = 580
    const targetY = 200

    const anim = setInterval(() => {
      progress += 0.05
      const curX = startX + (targetX - startX) * progress
      const curY = startY + (targetY - startY) * progress - Math.sin(progress * Math.PI) * 120

      setStonePos({ x: curX, y: curY })

      if (progress >= 1) {
        clearInterval(anim)
        setStoneFlying(false)
        soundEffects.playMatchSuccess()
        setBossHealth(0)
        setTimeout(() => {
          soundEffects.playVictory()
          setPhase('completed')
          onComplete({
            timeSeconds: timerSeconds,
            attempts: 1,
            stars: 3,
            score: 1200
          })
        }, 800)
      }
    }, 25)
  }

  // Loop de Animação Canvas
  useEffect(() => {
    if (phase !== 'collecting') return

    let animationFrameId: number
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const loop = () => {
      if (!isPaused) {
        // Gravidade e Física
        const player = playerRef.current
        player.x += player.vx
        player.y += player.vy

        // Limite esquerdo
        if (player.x < 40) player.x = 40

        // Gravidade
        if (player.y < groundY) {
          player.vy += 0.8
        } else {
          player.y = groundY
          player.vy = 0
          player.isGrounded = true
        }

        // Colisão com Itens
        collectibles.forEach(item => {
          if (!item.collected && Math.abs(player.x - item.x) < 40 && Math.abs(player.y - item.y) < 50) {
            item.collected = true
            soundEffects.playCollect()
            setItemsCollected(prev => {
              const nextCount = prev + 1
              if (nextCount >= targetItemsCount) {
                setTimeout(() => setPhase('boss_challenge'), 600)
              }
              return nextCount
            })
          }
        })

        // Renderização
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Câmera centrada no jogador
        const cameraX = Math.max(0, player.x - canvas.width / 2)

        ctx.save()
        ctx.translate(-cameraX, 0)

        // Céu e Colinas de Fundo (Parallax Simples)
        ctx.fillStyle = '#6ee7b7'
        ctx.beginPath()
        ctx.arc(600, 380, 500, 0, Math.PI * 2)
        ctx.arc(1400, 420, 600, 0, Math.PI * 2)
        ctx.arc(2200, 390, 500, 0, Math.PI * 2)
        ctx.fill()

        // Chão de Terra e Grama
        ctx.fillStyle = '#4ade80'
        ctx.fillRect(0, groundY + 30, 3200, 120)
        ctx.fillStyle = '#92400e'
        ctx.fillRect(0, groundY + 50, 3200, 100)

        // Desenhar Obstáculos
        obstacles.forEach(obs => {
          ctx.font = '28px sans-serif'
          ctx.fillText(obs.label, obs.x, groundY + 25)
        })

        // Desenhar Itens Coletáveis
        collectibles.forEach(item => {
          if (!item.collected) {
            ctx.font = '32px sans-serif'
            ctx.fillText(targetItemEmoji, item.x, item.y + 10)
          }
        })

        // Desenhar Jogador
        ctx.font = '40px sans-serif'
        ctx.save()
        if (player.facing === 'left') {
          ctx.translate(player.x + 30, player.y + 20)
          ctx.scale(-1, 1)
          ctx.fillText(characterEmoji, 0, 0)
        } else {
          ctx.fillText(characterEmoji, player.x, player.y + 20)
        }
        ctx.restore()

        ctx.restore()
      }

      animationFrameId = requestAnimationFrame(loop)
    }

    loop()
    return () => cancelAnimationFrame(animationFrameId)
  }, [phase, isPaused, collectibles, obstacles, characterEmoji, targetItemEmoji, targetItemsCount])

  // Controles Unificados para TV e Teclado
  useGameInput({
    disabled: phase === 'completed',
    onAction: action => {
      if (action === 'MOVE_LEFT') {
        movePlayer('left')
        setTimeout(stopPlayer, 200)
      } else if (action === 'MOVE_RIGHT') {
        movePlayer('right')
        setTimeout(stopPlayer, 200)
      } else if (action === 'ACTION' || action === 'MOVE_UP') {
        if (phase === 'collecting') {
          handleJump()
        } else if (phase === 'boss_challenge') {
          launchSlingStone()
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
      backgroundColor: '#064e3b',
      backgroundImage: 'radial-gradient(circle at 50% 10%, #047857 0%, #064e3b 80%)',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      padding: 'clamp(8px, 1.5vw, 20px)',
      boxSizing: 'border-box',
      userSelect: 'none',
      overflow: 'hidden'
    }}>
      {/* HUD Superior com contagem de pedras/itens */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        background: 'rgba(0, 0, 0, 0.4)',
        borderRadius: 16,
        backdropFilter: 'blur(10px)',
        marginBottom: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={onExit}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              background: 'rgba(255, 255, 255, 0.15)',
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
            <span style={{ fontSize: 11, color: '#a7f3d0' }}>{characterName} em Ação</span>
          </div>
        </div>

        {/* Indicador de Coleta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '6px 14px',
            borderRadius: 9999,
            fontWeight: 800,
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <span>{targetItemEmoji}</span>
            <span>{itemsCollected}/{targetItemsCount} {targetItemName}</span>
          </div>

          <button
            onClick={() => {
              const next = !isMuted
              setIsMuted(next)
              soundEffects.setMuted(next)
            }}
            style={{
              padding: 6,
              borderRadius: 8,
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      </div>

      {/* ÁREA PRINCIPAL DO JOGO */}
      <div style={{
        flex: 1,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {phase === 'collecting' && (
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: 860,
            borderRadius: 24,
            overflow: 'hidden',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.4)'
          }}>
            <canvas
              ref={canvasRef}
              width={860}
              height={360}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                background: 'linear-gradient(180deg, #38bdf8 0%, #bbf7d0 100%)'
              }}
            />

            {/* Controles de Toque na Tela para Celular (Touch Mobile First) */}
            <div style={{
              position: 'absolute',
              bottom: 14,
              left: 14,
              right: 14,
              display: 'flex',
              justifyContent: 'space-between',
              pointerEvents: 'none'
            }}>
              {/* Direcionais Esquerda / Direita */}
              <div style={{ display: 'flex', gap: 10, pointerEvents: 'auto' }}>
                <button
                  onPointerDown={() => movePlayer('left')}
                  onPointerUp={stopPlayer}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    background: 'rgba(0, 0, 0, 0.55)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    color: '#ffffff',
                    fontSize: 24,
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  ◀
                </button>
                <button
                  onPointerDown={() => movePlayer('right')}
                  onPointerUp={stopPlayer}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    background: 'rgba(0, 0, 0, 0.55)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    color: '#ffffff',
                    fontSize: 24,
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  ▶
                </button>
              </div>

              {/* Botão de Pular */}
              <button
                onClick={handleJump}
                style={{
                  pointerEvents: 'auto',
                  padding: '0 24px',
                  height: 56,
                  borderRadius: 16,
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  border: '2px solid rgba(255, 255, 255, 0.4)',
                  color: '#ffffff',
                  fontSize: 16,
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}
              >
                PULAR ⬆
              </button>
            </div>
          </div>
        )}

        {/* FASE 2: DESAFIO FINAL DA FUNDA / CORAGEM E FÉ */}
        {phase === 'boss_challenge' && (
          <div style={{
            width: '100%',
            maxWidth: 780,
            background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
            borderRadius: 24,
            padding: 28,
            border: '2px solid #fbbf24',
            textAlign: 'center',
            position: 'relative'
          }}>
            <h3 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px 0', color: '#fcd34d' }}>
              Desafio de Fé e Precisão!
            </h3>
            <p style={{ color: '#cbd5e1', fontSize: 14, margin: '0 0 24px 0' }}>
              Davi preparou sua funda com as {targetItemsCount} pedras. Mire com calma e lance!
            </p>

            <div style={{
              height: 240,
              background: 'linear-gradient(180deg, #334155, #1e293b)',
              borderRadius: 16,
              position: 'relative',
              overflow: 'hidden',
              marginBottom: 20
            }}>
              {/* Davi com a Funda */}
              <div style={{
                position: 'absolute',
                left: 60,
                bottom: 40,
                fontSize: 64
              }}>
                {characterEmoji}
              </div>

              {/* Golias / Alvo */}
              <div style={{
                position: 'absolute',
                right: 80,
                bottom: 30,
                fontSize: bossHealth > 0 ? 80 : 50,
                transition: 'all 0.5s ease',
                opacity: bossHealth > 0 ? 1 : 0.4
              }}>
                {bossEmoji || '🛡️'}
              </div>

              {/* Pedra Voando */}
              {stoneFlying && (
                <div style={{
                  position: 'absolute',
                  left: stonePos.x,
                  top: stonePos.y,
                  fontSize: 24
                }}>
                  {targetItemEmoji}
                </div>
              )}
            </div>

            <button
              onClick={launchSlingStone}
              disabled={stoneFlying}
              style={{
                padding: '16px 36px',
                borderRadius: 16,
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#fff',
                fontSize: 18,
                fontWeight: 800,
                border: 'none',
                cursor: stoneFlying ? 'not-allowed' : 'pointer',
                boxShadow: '0 6px 20px rgba(245, 158, 11, 0.4)'
              }}
            >
              {stoneFlying ? 'Lançando...' : 'Lançar Pedra com a Funda! 🎯'}
            </button>
          </div>
        )}
      </div>

      {/* TELA DE VITÓRIA / RESULTADO */}
      {phase === 'completed' && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(6, 78, 59, 0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #065f46, #022c22)',
            border: '2px solid #34d399',
            borderRadius: 24,
            padding: 32,
            textAlign: 'center',
            maxWidth: 420,
            width: '90%'
          }}>
            <Trophy size={60} color="#fbbf24" style={{ marginBottom: 12 }} />
            <h3 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 8px 0' }}>
              Coragem e Fé! 🏆
            </h3>
            <p style={{ color: '#a7f3d0', fontSize: 15, margin: '0 0 16px 0' }}>
              {faithMessage}
            </p>

            <div style={{ fontSize: 32, marginBottom: 20 }}>⭐⭐⭐</div>

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
                  color: '#a7f3d0',
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
