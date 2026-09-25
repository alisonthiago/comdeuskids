import React, { useRef, useEffect, useState, useCallback } from 'react'
import { soundEffects, useGameInput } from '@comdeuskids/game-core'

interface DaviGameEngineProps {
  isPaused: boolean
  isMuted: boolean
  score: number
  lives: number
  setScore: React.Dispatch<React.SetStateAction<number>>
  setLives: React.Dispatch<React.SetStateAction<number>>
  triggerVictory: (finalScore: number) => void
  triggerGameOver: () => void
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
  alpha: number
}

interface FloatingText {
  id: number
  x: number
  y: number
  text: string
  alpha: number
  color: string
}

export default function DaviGameEngine({
  isPaused,
  isMuted,
  score,
  lives,
  setScore,
  setLives,
  triggerVictory,
  triggerGameOver
}: DaviGameEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Fases do Jogo
  // 1 = O Rebanho e o Leão
  // 2 = O Ribeiro e as 5 Pedras Lisas
  // 3 = O Confronto com o Gigante Golias
  const [currentLevel, setCurrentLevel] = useState<1 | 2 | 3>(1)

  // Davi: Posição, física e animação
  const playerRef = useRef({
    x: 100,
    y: 300,
    vx: 0,
    vy: 0,
    width: 44,
    height: 60,
    isGrounded: true,
    facing: 'right' as 'left' | 'right',
    animFrame: 0,
    isAttacking: false,
    invincibleTimer: 0
  })

  // Leão (Fase 1)
  const lionRef = useRef({
    x: 820,
    y: 295,
    vx: -2.2,
    health: 3,
    isDefeated: false,
    facing: 'left'
  })

  // Golias (Fase 3)
  const goliasRef = useRef({
    x: 850,
    y: 220,
    width: 80,
    height: 140,
    health: 5,
    isDefeated: false,
    attackTimer: 0
  })

  // Projéteis da Funda de Davi (Pedras atiradas)
  const [projectiles, setProjectiles] = useState<Array<{ id: number; x: number; y: number; vx: number; vy: number }>>([])

  // Itens Coletáveis no Mapa
  const [collectibles, setCollectibles] = useState<Array<{ id: number; x: number; y: number; type: 'stone' | 'sheep'; collected: boolean }>>([])

  // Sistema de Partículas e Textos Flutuantes
  const particlesRef = useRef<Particle[]>([])
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([])

  const groundY = 360

  // Inicializar o Nível
  const initLevel = useCallback((level: 1 | 2 | 3) => {
    setCurrentLevel(level)
    playerRef.current.x = 100
    playerRef.current.y = groundY - 60
    playerRef.current.vx = 0
    playerRef.current.vy = 0
    playerRef.current.isGrounded = true
    playerRef.current.invincibleTimer = 0
    setProjectiles([])
    particlesRef.current = []

    if (level === 1) {
      // Fase 1: Salvar as Ovelhinhas e afugentar o Leão
      lionRef.current = { x: 860, y: groundY - 60, vx: -2.2, health: 3, isDefeated: false, facing: 'left' }
      setCollectibles([
        { id: 1, x: 260, y: groundY - 45, type: 'sheep', collected: false },
        { id: 2, x: 480, y: groundY - 45, type: 'sheep', collected: false },
        { id: 3, x: 700, y: groundY - 45, type: 'sheep', collected: false }
      ])
    } else if (level === 2) {
      // Fase 2: Coletar as 5 Pedras Lisas no ribeiro pulando troncos
      setCollectibles([
        { id: 10, x: 220, y: groundY - 40, type: 'stone', collected: false },
        { id: 11, x: 420, y: groundY - 90, type: 'stone', collected: false },
        { id: 12, x: 620, y: groundY - 40, type: 'stone', collected: false },
        { id: 13, x: 820, y: groundY - 90, type: 'stone', collected: false },
        { id: 14, x: 1020, y: groundY - 40, type: 'stone', collected: false }
      ])
    } else if (level === 3) {
      // Fase 3: Golias no Vale de Elá
      goliasRef.current = { x: 780, y: groundY - 140, width: 80, height: 140, health: 5, isDefeated: false, attackTimer: 0 }
    }
  }, [groundY])

  useEffect(() => {
    initLevel(1)
  }, [initLevel])

  // Gerar Partículas (Poeira ao andar, estrelas ao pegar pedra, impacto ao acertar)
  const spawnParticles = (x: number, y: number, color: string, count = 8) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.7) * 6,
        color,
        size: Math.random() * 5 + 3,
        alpha: 1
      })
    }
  }

  // Texto Flutuante (+100 PONTOS!)
  const spawnFloatingText = (x: number, y: number, text: string, color = '#fbbf24') => {
    const id = Date.now() + Math.random()
    setFloatingTexts(prev => [...prev, { id, x, y, text, alpha: 1, color }])
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== id))
    }, 900)
  }

  // Controles
  const jump = useCallback(() => {
    if (playerRef.current.isGrounded && !isPaused) {
      playerRef.current.vy = -14
      playerRef.current.isGrounded = false
      soundEffects.playJump()
      spawnParticles(playerRef.current.x + 20, playerRef.current.y + 60, '#cbd5e1', 5)
    }
  }, [isPaused])

  const moveLeft = useCallback(() => {
    playerRef.current.vx = -6
    playerRef.current.facing = 'left'
  }, [])

  const moveRight = useCallback(() => {
    playerRef.current.vx = 6
    playerRef.current.facing = 'right'
  }, [])

  const stopMove = useCallback(() => {
    playerRef.current.vx = 0
  }, [])

  // Disparo da Funda
  const shootSling = useCallback(() => {
    if (isPaused) return
    playerRef.current.isAttacking = true
    soundEffects.playSnap()

    const stoneVx = playerRef.current.facing === 'right' ? 14 : -14
    const newStone = {
      id: Date.now() + Math.random(),
      x: playerRef.current.x + (playerRef.current.facing === 'right' ? 45 : -10),
      y: playerRef.current.y + 20,
      vx: stoneVx,
      vy: -2
    }
    setProjectiles(prev => [...prev, newStone])

    setTimeout(() => {
      playerRef.current.isAttacking = false
    }, 200)
  }, [isPaused])

  // Hook Universal de Input
  useGameInput({
    disabled: isPaused,
    onAction: action => {
      if (action === 'LEFT') {
        moveLeft()
        setTimeout(stopMove, 150)
      } else if (action === 'RIGHT') {
        moveRight()
        setTimeout(stopMove, 150)
      } else if (action === 'UP' || action === 'JUMP' || action === 'ACTION') {
        jump()
      } else if (action === 'SECONDARY_ACTION') {
        shootSling()
      }
    }
  })

  // GAME LOOP REAL (60 FPS VIA REQUESTANIMATIONFRAME)
  useEffect(() => {
    let animId: number
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const loop = () => {
      if (!isPaused) {
        const p = playerRef.current

        // Física de Davi
        p.x += p.vx
        p.y += p.vy

        // Gravidade
        if (p.y < groundY - p.height) {
          p.vy += 0.8
        } else {
          p.y = groundY - p.height
          p.vy = 0
          p.isGrounded = true
        }

        // Limites de Tela
        if (p.x < 30) p.x = 30
        if (p.x > 1150) p.x = 1150

        // Atualizar Timer de Invencibilidade
        if (p.invincibleTimer > 0) p.invincibleTimer -= 1

        // Atualizar Projéteis
        setProjectiles(prev =>
          prev
            .map(proj => ({ ...proj, x: proj.x + proj.vx, y: proj.y + proj.vy }))
            .filter(proj => proj.x > 0 && proj.x < 1200)
        )

        // ==========================================
        // LÓGICA DA FASE 1: LEÃO
        // ==========================================
        if (currentLevel === 1 && !lionRef.current.isDefeated) {
          const lion = lionRef.current
          lion.x += lion.vx
          if (lion.x < 550) lion.vx = 2.2
          if (lion.x > 950) lion.vx = -2.2

          // Colisão de Projétil da Funda com o Leão
          projectiles.forEach(proj => {
            if (Math.abs(proj.x - lion.x) < 40 && Math.abs(proj.y - lion.y) < 50) {
              lion.health -= 1
              soundEffects.playMatchSuccess()
              spawnParticles(lion.x, lion.y, '#f59e0b', 12)
              spawnFloatingText(lion.x, lion.y - 20, '-1 VIDA!', '#ef4444')
              if (lion.health <= 0) {
                lion.isDefeated = true
                spawnFloatingText(lion.x, lion.y - 40, '🦁 LEÃO AFUGENTADO! +500 PONTOS', '#10b981')
                setScore(s => s + 500)
                setTimeout(() => initLevel(2), 1500)
              }
            }
          })

          // Dano no Jogador
          if (p.invincibleTimer === 0 && Math.abs(p.x - lion.x) < 35 && Math.abs(p.y - lion.y) < 40) {
            setLives(l => {
              const next = l - 1
              if (next <= 0) triggerGameOver()
              return next
            })
            p.invincibleTimer = 60
            p.vy = -8
            p.vx = p.x < lion.x ? -10 : 10
            spawnParticles(p.x, p.y, '#ef4444', 10)
          }
        }

        // ==========================================
        // LÓGICA DA FASE 2: COLETÁVEIS (PEDRAS LISAS)
        // ==========================================
        if (currentLevel === 2) {
          collectibles.forEach(item => {
            if (!item.collected && Math.abs(p.x - item.x) < 35 && Math.abs(p.y - item.y) < 45) {
              item.collected = true
              soundEffects.playCollect()
              spawnParticles(item.x, item.y, '#38bdf8', 10)
              spawnFloatingText(item.x, item.y - 20, '🪨 PEDRA LISA! +100', '#38bdf8')
              setScore(s => s + 100)

              // Se coletou todas as 5 pedras
              const allStones = collectibles.filter(c => c.type === 'stone')
              const collectedCount = allStones.filter(c => c.collected).length
              if (collectedCount === allStones.length) {
                spawnFloatingText(p.x, p.y - 60, 'FÉ E CORAGEM! AVANÇANDO PARA GOLIAS 🛡️', '#fbbf24')
                setTimeout(() => initLevel(3), 1600)
              }
            }
          })
        }

        // ==========================================
        // LÓGICA DA FASE 3: O GIGANTE GOLIAS
        // ==========================================
        if (currentLevel === 3 && !goliasRef.current.isDefeated) {
          const golias = goliasRef.current

          projectiles.forEach(proj => {
            if (proj.x >= golias.x && proj.x <= golias.x + golias.width && proj.y >= golias.y && proj.y <= golias.y + golias.height) {
              golias.health -= 1
              soundEffects.playMatchSuccess()
              spawnParticles(proj.x, proj.y, '#fbbf24', 16)
              spawnFloatingText(golias.x, golias.y - 20, 'ALVO ATINGIDO! 🎯', '#f59e0b')

              if (golias.health <= 0) {
                golias.isDefeated = true
                spawnParticles(golias.x + 40, golias.y + 60, '#10b981', 40)
                spawnFloatingText(golias.x, golias.y - 60, 'GOLIAS VENCIDO PELA FÉ! +2000', '#10b981')
                setScore(s => s + 2000)
                setTimeout(() => {
                  triggerVictory(score + 2000)
                }, 1800)
              }
            }
          })
        }

        // ==========================================
        // RENDERIZAÇÃO GRÁFICA (CANVAS 2D)
        // ==========================================
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // 1. Céu e Montanhas de Judá (Parallax)
        const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height)
        skyGrad.addColorStop(0, '#38bdf8')
        skyGrad.addColorStop(0.7, '#bae6fd')
        skyGrad.addColorStop(1, '#fef08a')
        ctx.fillStyle = skyGrad
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Sol Radiante
        ctx.fillStyle = '#fef08a'
        ctx.beginPath()
        ctx.arc(1050, 90, 50, 0, Math.PI * 2)
        ctx.fill()

        // Montanhas ao Fundo
        ctx.fillStyle = '#6ee7b7'
        ctx.beginPath()
        ctx.arc(200, 380, 260, 0, Math.PI * 2)
        ctx.arc(600, 420, 320, 0, Math.PI * 2)
        ctx.arc(1050, 400, 280, 0, Math.PI * 2)
        ctx.fill()

        // 2. Chão com Textura de Grama e Solo
        ctx.fillStyle = '#22c55e'
        ctx.fillRect(0, groundY, canvas.width, 20)
        ctx.fillStyle = '#78350f'
        ctx.fillRect(0, groundY + 20, canvas.width, canvas.height - (groundY + 20))

        // 3. Desenhar Ovelhinhas e Pedras Coletáveis
        collectibles.forEach(item => {
          if (!item.collected) {
            ctx.font = item.type === 'sheep' ? '32px sans-serif' : '26px sans-serif'
            ctx.fillText(item.type === 'sheep' ? '🐑' : '🪨', item.x, item.y + 20)
          }
        })

        // 4. Desenhar Leão (Fase 1)
        if (currentLevel === 1 && !lionRef.current.isDefeated) {
          ctx.font = '54px sans-serif'
          ctx.save()
          if (lionRef.current.vx > 0) {
            ctx.translate(lionRef.current.x + 50, lionRef.current.y + 40)
            ctx.scale(-1, 1)
            ctx.fillText('🦁', 0, 0)
          } else {
            ctx.fillText('🦁', lionRef.current.x, lionRef.current.y + 40)
          }
          ctx.restore()
        }

        // 5. Desenhar Golias (Fase 3)
        if (currentLevel === 3 && !goliasRef.current.isDefeated) {
          ctx.font = '100px sans-serif'
          ctx.fillText('🛡️', goliasRef.current.x, goliasRef.current.y + 110)
          // Barra de Vida de Golias
          ctx.fillStyle = '#ef4444'
          ctx.fillRect(goliasRef.current.x, goliasRef.current.y - 15, goliasRef.current.width, 8)
          ctx.fillStyle = '#10b981'
          ctx.fillRect(goliasRef.current.x, goliasRef.current.y - 15, (goliasRef.current.width / 5) * goliasRef.current.health, 8)
        }

        // 6. Desenhar Projéteis da Funda
        ctx.fillStyle = '#334155'
        projectiles.forEach(proj => {
          ctx.beginPath()
          ctx.arc(proj.x, proj.y, 6, 0, Math.PI * 2)
          ctx.fill()
        })

        // 7. Desenhar Davi (Personagem Principal com Estados)
        ctx.save()
        if (p.invincibleTimer % 4 < 2) {
          ctx.font = '50px sans-serif'
          if (p.facing === 'left') {
            ctx.translate(p.x + 40, p.y + 48)
            ctx.scale(-1, 1)
            ctx.fillText('👦', 0, 0)
          } else {
            ctx.fillText('👦', p.x, p.y + 48)
          }
        }
        ctx.restore()

        // 8. Partículas
        particlesRef.current.forEach((part, idx) => {
          part.x += part.vx
          part.y += part.vy
          part.alpha -= 0.02
          if (part.alpha <= 0) {
            particlesRef.current.splice(idx, 1)
          } else {
            ctx.fillStyle = part.color
            ctx.globalAlpha = part.alpha
            ctx.beginPath()
            ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2)
            ctx.fill()
            ctx.globalAlpha = 1
          }
        })
      }

      animId = requestAnimationFrame(loop)
    }

    animId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animId)
  }, [isPaused, currentLevel, projectiles, collectibles, score, triggerVictory, triggerGameOver, groundY, setScore, setLives, initLevel])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        width={1200}
        height={500}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />

      {/* Indicador de Fase e Objetivo Flutuante no Topo */}
      <div style={{
        position: 'absolute',
        top: 80,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: 9999,
        padding: '6px 20px',
        color: '#fbbf24',
        fontSize: 14,
        fontWeight: 800,
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}>
        {currentLevel === 1 && 'Fase 1: Salve as ovelhinhas 🐑 e afugente o leão 🦁 com a funda!'}
        {currentLevel === 2 && 'Fase 2: Colete as 5 pedras lisas 🪨 no ribeiro!'}
        {currentLevel === 3 && 'Fase 3: Enfrente Golias 🛡️ com fé e coragem!'}
      </div>

      {/* Textos Flutuantes Dinâmicos (+100 PONTOS!) */}
      {floatingTexts.map(ft => (
        <div
          key={ft.id}
          style={{
            position: 'absolute',
            left: ft.x,
            top: ft.y,
            color: ft.color,
            fontSize: 18,
            fontWeight: 900,
            textShadow: '0 2px 6px #000',
            pointerEvents: 'none',
            animation: 'floatUp 0.8s ease-out forwards'
          }}
        >
          {ft.text}
        </div>
      ))}

      {/* GAMEPAD VIRTUAL PARA CELULAR E TABLET (TOUCH CONTROLS AMPLOS) */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        display: 'flex',
        justifyContent: 'space-between',
        pointerEvents: 'none'
      }}>
        {/* Direcionais Esquerda e Direita */}
        <div style={{ display: 'flex', gap: 14, pointerEvents: 'auto' }}>
          <button
            onPointerDown={moveLeft}
            onPointerUp={stopMove}
            style={{
              width: 66,
              height: 66,
              borderRadius: 20,
              background: 'rgba(0, 0, 0, 0.65)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              color: '#ffffff',
              fontSize: 28,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 6px 16px rgba(0,0,0,0.4)'
            }}
          >
            ◀
          </button>
          <button
            onPointerDown={moveRight}
            onPointerUp={stopMove}
            style={{
              width: 66,
              height: 66,
              borderRadius: 20,
              background: 'rgba(0, 0, 0, 0.65)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              color: '#ffffff',
              fontSize: 28,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 6px 16px rgba(0,0,0,0.4)'
            }}
          >
            ▶
          </button>
        </div>

        {/* Botões de Ação (Pular e Atirar Funda) */}
        <div style={{ display: 'flex', gap: 14, pointerEvents: 'auto' }}>
          <button
            onClick={shootSling}
            style={{
              width: 66,
              height: 66,
              borderRadius: 20,
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              border: '2px solid rgba(255, 255, 255, 0.4)',
              color: '#ffffff',
              fontSize: 24,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 16px rgba(245, 158, 11, 0.5)'
            }}
            title="Atirar Funda"
          >
            🎯
          </button>
          <button
            onClick={jump}
            style={{
              width: 72,
              height: 66,
              borderRadius: 20,
              background: 'linear-gradient(135deg, #10b981, #059669)',
              border: '2px solid rgba(255, 255, 255, 0.4)',
              color: '#ffffff',
              fontSize: 16,
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 16px rgba(16, 185, 129, 0.5)'
            }}
          >
            PULAR ⬆
          </button>
        </div>
      </div>
    </div>
  )
}
