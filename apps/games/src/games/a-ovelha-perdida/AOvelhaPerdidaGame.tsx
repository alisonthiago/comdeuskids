import React, { useEffect, useRef, useState, useCallback } from 'react'
import { audioManager, VirtualControls } from '@comdeuskids/game-core'
import { Pause, Play, RotateCcw, Volume2, VolumeX, Sparkles, Heart, Trophy, BookOpen } from 'lucide-react'
import { GameStage, Platform, Collectible, Checkpoint, Particle } from './types'
import { WORLD_WIDTH, WORLD_HEIGHT, GROUND_Y, createPlatforms, createCollectibles, createCheckpoints } from './engine/LevelMap'
import { Physics2D, Entity2D } from './engine/Physics2D'

interface AOvelhaPerdidaGameProps {
  onExit?: () => void
}

export default function AOvelhaPerdidaGame({ onExit }: AOvelhaPerdidaGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Estados de Gameplay
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [cluesFound, setCluesFound] = useState(0)
  const [sheepRescued, setSheepRescued] = useState(false)
  const [currentStage, setCurrentStage] = useState<GameStage>(1)
  const [objectiveText, setObjectiveText] = useState('Uma ovelhinha se perdeu. Saia da vila para procurá-la!')
  const [isPaused, setIsPaused] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [audioStarted, setAudioStarted] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [showStoryModal, setShowStoryModal] = useState(false)

  // Referência do Estado do Jogo (Evita re-renderizações desnecessárias no loop)
  const gameState = useRef<{
    player: Entity2D
    sheep: Entity2D
    platforms: Platform[]
    collectibles: Collectible[]
    checkpoints: Checkpoint[]
    particles: Particle[]
    cameraX: number
    cameraY: number
    lastCheckpoint: { x: number; y: number }
    animFrame: number
    sheepAnimTimer: number
    playerAnimTimer: number
    sheepBaaTimer: number
  }>({
    player: {
      x: 100,
      y: 500,
      vx: 0,
      vy: 0,
      w: 42,
      h: 56,
      isGrounded: true,
      facingRight: true
    },
    sheep: {
      x: 4420,
      y: GROUND_Y - 260,
      vx: 0,
      vy: 0,
      w: 48,
      h: 36,
      isGrounded: true,
      facingRight: false
    },
    platforms: createPlatforms(),
    collectibles: createCollectibles(),
    checkpoints: createCheckpoints(),
    particles: [],
    cameraX: 0,
    cameraY: 0,
    lastCheckpoint: { x: 100, y: 500 },
    animFrame: 0,
    sheepAnimTimer: 0,
    playerAnimTimer: 0,
    sheepBaaTimer: 4
  })

  // Input State
  const inputState = useRef({
    x: 0,
    isRunning: false,
    jumpRequested: false
  })

  // Texturas Carregadas
  const imagesRef = useRef<Record<string, HTMLImageElement>>({})

  // Carregar imagens do pacote Tiny Swords sob demanda
  useEffect(() => {
    const assets = [
      { key: 'player', src: '/assets/a-ovelha-perdida/Pawn_Blue.png' },
      { key: 'sheep_idle', src: '/assets/a-ovelha-perdida/HappySheep_Idle.png' },
      { key: 'sheep_bounce', src: '/assets/a-ovelha-perdida/HappySheep_Bouncing.png' },
      { key: 'tree', src: '/assets/a-ovelha-perdida/Tree.png' },
      { key: 'house_blue', src: '/assets/a-ovelha-perdida/House_Blue.png' },
      { key: 'house_yellow', src: '/assets/a-ovelha-perdida/House_Yellow.png' },
      { key: 'tile_flat', src: '/assets/a-ovelha-perdida/Tilemap_Flat.png' },
      { key: 'bridge', src: '/assets/a-ovelha-perdida/Bridge_All.png' },
      { key: 'rock', src: '/assets/a-ovelha-perdida/Rocks_01.png' }
    ]

    assets.forEach(item => {
      const img = new Image()
      img.src = item.src
      img.onload = () => {
        imagesRef.current[item.key] = img
      }
    })
  }, [])

  const ensureAudio = useCallback(() => {
    if (!audioStarted) {
      audioManager.init()
      audioManager.startJerichoAmbience()
      audioManager.startExplorationMusic()
      setAudioStarted(true)
    }
  }, [audioStarted])

  // Cronômetro do jogo
  useEffect(() => {
    if (isPaused || gameWon || gameOver) return
    const timer = setInterval(() => {
      setElapsedSeconds(s => s + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [isPaused, gameWon, gameOver])

  // Controles de Teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      ensureAudio()
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        setIsPaused(prev => !prev)
        return
      }

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          inputState.current.x = -1
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          inputState.current.x = 1
          break
        case 'Shift':
          inputState.current.isRunning = true
          break
        case ' ':
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault()
          inputState.current.jumpRequested = true
          break
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (inputState.current.x < 0) inputState.current.x = 0
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (inputState.current.x > 0) inputState.current.x = 0
          break
        case 'Shift':
          inputState.current.isRunning = false
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [ensureAudio])

  // LOOP PRINCIPAL DO JOGO (CANVAS 2D A 60 FPS)
  useEffect(() => {
    let animId = 0
    let lastTime = performance.now()

    const loop = (currentTime: number) => {
      animId = requestAnimationFrame(loop)

      const delta = Math.min((currentTime - lastTime) * 0.001, 0.05)
      lastTime = currentTime

      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Dimensões do viewport
      const vw = canvas.width
      const vh = canvas.height

      const state = gameState.current

      // Se pausado ou em vitória/derrota, apenas desenha o estado atual
      if (!isPaused && !gameWon && !gameOver) {
        // 1. Atualizar Física do Jogador
        const { jumped, landed } = Physics2D.updatePlayer(
          state.player,
          inputState.current.x,
          inputState.current.isRunning,
          inputState.current.jumpRequested,
          state.platforms,
          delta
        )
        inputState.current.jumpRequested = false

        if (jumped) {
          audioManager.playSFX('jump')
          // Partículas de poeira no pulo
          for (let i = 0; i < 4; i++) {
            state.particles.push({
              x: state.player.x + 20,
              y: state.player.y + 54,
              vx: (Math.random() - 0.5) * 60,
              vy: -20 - Math.random() * 30,
              life: 0,
              maxLife: 0.3,
              color: '#d4a373',
              size: 3
            })
          }
        }
        if (landed) {
          audioManager.playSFX('land')
        }

        // 2. Balido Distante da Ovelha
        state.sheepBaaTimer -= delta
        if (state.sheepBaaTimer <= 0) {
          state.sheepBaaTimer = 6 + Math.random() * 6
          const distToSheep = Math.abs(state.player.x - state.sheep.x)
          if (distToSheep < 1400) {
            audioManager.playSFX('sheep_baa')
          }
        }

        // 3. Checagem de Resgate da Ovelha (Fase 5)
        if (!sheepRescued) {
          const dist = Math.hypot(state.player.x - state.sheep.x, state.player.y - state.sheep.y)
          if (dist < 80) {
            setSheepRescued(true)
            audioManager.playSFX('sheep_baa')
            audioManager.playSFX('checkpoint')
            setObjectiveText('Você encontrou a ovelha! Agora leve-a de volta para a vila com segurança!')

            // Chuva de corações e estrelas no momento do resgate
            for (let i = 0; i < 20; i++) {
              state.particles.push({
                x: state.sheep.x + 20,
                y: state.sheep.y + 10,
                vx: (Math.random() - 0.5) * 120,
                vy: -80 - Math.random() * 80,
                life: 0,
                maxLife: 0.8,
                color: i % 2 === 0 ? '#ef4444' : '#fbbf24',
                size: 5
              })
            }
          }
        } else {
          // Ovelhinha segue o pastor saltitando!
          Physics2D.updateSheepFollower(state.sheep, state.player, state.platforms, delta)

          // Checar se voltou à vila (X <= 320)
          if (state.player.x <= 320) {
            setGameWon(true)
            audioManager.playSFX('victory')
          }
        }

        // 4. Checagem de Coletáveis
        state.collectibles.forEach(item => {
          if (!item.collected && Physics2D.checkCollectibleOverlap(state.player, item)) {
            item.collected = true

            if (item.type === 'star') {
              setScore(s => s + 100)
              audioManager.playSFX('collect')
            } else if (item.type === 'wool_clue') {
              setScore(s => s + 250)
              setCluesFound(c => {
                const next = c + 1
                setObjectiveText(`Siga as pistas de lã encontradas pelo caminho (${next}/3)!`)
                return next
              })
              audioManager.playSFX('checkpoint')
            } else if (item.type === 'heart') {
              setLives(l => Math.min(3, l + 1))
              audioManager.playSFX('collect')
            }

            // Partículas de coleta
            for (let i = 0; i < 8; i++) {
              state.particles.push({
                x: item.x + 16,
                y: item.y + 16,
                vx: (Math.random() - 0.5) * 100,
                vy: -50 - Math.random() * 60,
                life: 0,
                maxLife: 0.5,
                color: item.type === 'heart' ? '#ef4444' : '#f59e0b',
                size: 4
              })
            }
          }
        })

        // 5. Checagem de Checkpoints
        state.checkpoints.forEach(cp => {
          if (!cp.reached && Physics2D.checkCheckpointOverlap(state.player, cp)) {
            cp.reached = true
            state.lastCheckpoint = { x: cp.x, y: cp.y }
            audioManager.playSFX('checkpoint')
          }
        })

        // 6. Atualização de Fases Narrativas por Posição
        if (!sheepRescued) {
          if (state.player.x < 850 && currentStage !== 1) {
            setCurrentStage(1)
            setObjectiveText('Fase 1: Saia da vila e siga a trilha para o vale.')
          } else if (state.player.x >= 850 && state.player.x < 1800 && currentStage !== 2) {
            setCurrentStage(2)
            setObjectiveText('Fase 2: Atravesse a ponte de madeira e suba a colina.')
          } else if (state.player.x >= 1800 && state.player.x < 2800 && currentStage !== 3) {
            setCurrentStage(3)
            setObjectiveText('Fase 3: Siga as pistas de lã deixadas pela ovelhinha!')
          } else if (state.player.x >= 2800 && state.player.x < 3800 && currentStage !== 4) {
            setCurrentStage(4)
            setObjectiveText('Fase 4: Suba pelas plataformas da floresta de rochas.')
          } else if (state.player.x >= 3800 && currentStage !== 5) {
            setCurrentStage(5)
            setObjectiveText('Fase 5: A ovelhinha está no cume! Aproxime-se para resgatá-la!')
          }
        }

        // 7. Câmera Suave em Parallax com Zoom de Proximidade (2x)
        const ZOOM = Math.min(2.4, Math.max(1.9, vw / 680))
        const viewW = vw / ZOOM
        const viewH = vh / ZOOM

        const targetCamX = state.player.x - viewW * 0.45
        const targetCamY = state.player.y - viewH * 0.65
        state.cameraX += (targetCamX - state.cameraX) * Math.min(1, delta * 6)
        state.cameraY += (targetCamY - state.cameraY) * Math.min(1, delta * 6)

        // Limites da câmera no mundo virtual
        state.cameraX = Math.max(0, Math.min(WORLD_WIDTH - viewW, state.cameraX))
        state.cameraY = Math.max(0, Math.min(WORLD_HEIGHT - viewH + 80, state.cameraY))

        // 8. Timers de Animação
        state.playerAnimTimer += delta * (Math.abs(state.player.vx) > 10 ? (inputState.current.isRunning ? 12 : 8) : 4)
        state.sheepAnimTimer += delta * 6

        // 9. Atualizar Partículas
        for (let i = state.particles.length - 1; i >= 0; i--) {
          const p = state.particles[i]
          p.life += delta
          if (p.life >= p.maxLife) {
            state.particles.splice(i, 1)
            continue
          }
          p.x += p.vx * delta
          p.y += p.vy * delta
        }
      }

      // ==========================================
      // RENDERIZAÇÃO DO MUNDO (CANVAS)
      // ==========================================
      ctx.clearRect(0, 0, vw, vh)

      const ZOOM = Math.min(2.4, Math.max(1.9, vw / 680))

      // 1. Céu com Gradiente Suave
      const skyGrad = ctx.createLinearGradient(0, 0, 0, vh)
      skyGrad.addColorStop(0, '#38bdf8')
      skyGrad.addColorStop(0.5, '#7dd3fc')
      skyGrad.addColorStop(1, '#e0f2fe')
      ctx.fillStyle = skyGrad
      ctx.fillRect(0, 0, vw, vh)

      // 2. Sol Dourado Suave
      ctx.fillStyle = 'rgba(254, 240, 138, 0.35)'
      ctx.beginPath()
      ctx.arc(vw - 110, 85, 75, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#fef08a'
      ctx.beginPath()
      ctx.arc(vw - 110, 85, 42, 0, Math.PI * 2)
      ctx.fill()

      // 3. Nuvens Flutuantes no Céu (Parallax Suave)
      const cloudTime = currentTime * 0.015
      const drawCloud = (cx: number, cy: number, scale: number) => {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
        ctx.beginPath()
        ctx.arc(cx, cy, 22 * scale, 0, Math.PI * 2)
        ctx.arc(cx + 22 * scale, cy - 10 * scale, 28 * scale, 0, Math.PI * 2)
        ctx.arc(cx + 50 * scale, cy, 22 * scale, 0, Math.PI * 2)
        ctx.arc(cx + 22 * scale, cy + 6 * scale, 18 * scale, 0, Math.PI * 2)
        ctx.fill()
      }

      drawCloud(((180 + cloudTime - state.cameraX * 0.05) % (vw + 300)) - 100, 65, 1.2)
      drawCloud(((580 + cloudTime * 0.8 - state.cameraX * 0.05) % (vw + 300)) - 100, 110, 0.9)
      drawCloud(((1050 + cloudTime * 1.1 - state.cameraX * 0.05) % (vw + 300)) - 100, 48, 1.3)

      // 4. Montanhas Distantes (Parallax Layer 1 - 0.15x)
      ctx.save()
      ctx.translate(-state.cameraX * 0.15, 0)
      ctx.fillStyle = '#bae6fd'
      ctx.beginPath()
      ctx.moveTo(-100, vh)
      for (let x = -100; x <= vw + 3000; x += 320) {
        ctx.quadraticCurveTo(x + 160, vh - 220 - Math.sin(x * 0.01) * 35, x + 320, vh)
      }
      ctx.fill()
      ctx.restore()

      // 5. Colinas Verdes Médias (Parallax Layer 2 - 0.35x)
      ctx.save()
      ctx.translate(-state.cameraX * 0.35, 0)
      ctx.fillStyle = '#86efac'
      ctx.beginPath()
      ctx.moveTo(-100, vh)
      for (let x = -100; x <= vw + 3000; x += 280) {
        ctx.quadraticCurveTo(x + 140, vh - 130 - Math.cos(x * 0.01) * 30, x + 280, vh)
      }
      ctx.fill()
      ctx.restore()

      // ==========================================
      // 6. RENDERIZAÇÃO DO MUNDO PRINCIPAL (COM ZOOM)
      // ==========================================
      ctx.save()
      ctx.scale(ZOOM, ZOOM)
      ctx.translate(-state.cameraX, -state.cameraY)

      const imgs = imagesRef.current

      // Desenhar Casas da Vila (Fase 1)
      if (imgs.house_yellow) {
        ctx.drawImage(imgs.house_yellow, 80, GROUND_Y - 180, 140, 195)
      }
      if (imgs.house_blue) {
        ctx.drawImage(imgs.house_blue, 400, GROUND_Y - 180, 140, 195)
      }

      // Desenhar Árvores no Cenário
      if (imgs.tree) {
        const treePositions = [20, 720, 1420, 1780, 2300, 2750, 2980, 3600, 3950]
        treePositions.forEach(tx => {
          const sway = Math.sin(currentTime * 0.002 + tx) * 2
          ctx.drawImage(imgs.tree, 0, 0, 192, 192, tx, GROUND_Y - 180 + sway, 170, 182)
        })
      }

      // Desenhar Plataformas e Chão
      state.platforms.forEach(p => {
        if (p.type === 'bridge' && imgs.bridge) {
          ctx.drawImage(imgs.bridge, p.x, p.y, p.w, p.h + 20)
        } else if (p.type === 'rock' && imgs.rock) {
          ctx.drawImage(imgs.rock, 0, 0, 128, 128, p.x, p.y, p.w, p.h + 10)
        } else if (p.type === 'floating') {
          ctx.fillStyle = '#22c55e'
          ctx.beginPath()
          ctx.roundRect(p.x, p.y, p.w, p.h, [8, 8, 4, 4])
          ctx.fill()
          ctx.fillStyle = '#78350f'
          ctx.fillRect(p.x, p.y + 10, p.w, p.h - 10)
        } else {
          // Chão de grama natural vibrante
          ctx.fillStyle = '#16a34a'
          ctx.fillRect(p.x, p.y, p.w, 14)
          ctx.fillStyle = '#4ade80'
          ctx.fillRect(p.x, p.y, p.w, 4)

          // Terra marrom rica descendo até a base do mundo
          ctx.fillStyle = '#78350f'
          ctx.fillRect(p.x, p.y + 14, p.w, p.h + 300)

          // Pedregulhos de detalhe na terra
          ctx.fillStyle = '#92400e'
          for (let bx = p.x + 24; bx < p.x + p.w - 24; bx += 54) {
            ctx.beginPath()
            ctx.arc(bx, p.y + 36, 5, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      })

      // Desenhar Coletáveis (Estrelas, Pistas de Lã e Corações)
      state.collectibles.forEach(item => {
        if (item.collected) return
        const bob = Math.sin(currentTime * 0.004 + item.bobOffset) * 6

        if (item.type === 'star') {
          ctx.font = '26px sans-serif'
          ctx.fillText('⭐', item.x, item.y + bob)
        } else if (item.type === 'wool_clue') {
          ctx.font = '28px sans-serif'
          ctx.fillText('🧶', item.x, item.y + bob)

          ctx.fillStyle = 'rgba(255, 255, 255, 0.45)'
          ctx.beginPath()
          ctx.arc(item.x + 15, item.y + bob - 10, 20, 0, Math.PI * 2)
          ctx.fill()
        } else if (item.type === 'heart') {
          ctx.font = '26px sans-serif'
          ctx.fillText('❤️', item.x, item.y + bob)
        }
      })

      // Desenhar Checkpoints (Bandeirolas)
      state.checkpoints.forEach(cp => {
        ctx.fillStyle = cp.reached ? '#22c55e' : '#cbd5e1'
        ctx.fillRect(cp.x, cp.y, 4, 30)
        ctx.fillStyle = cp.reached ? '#eab308' : '#94a3b8'
        ctx.beginPath()
        ctx.moveTo(cp.x + 4, cp.y)
        ctx.lineTo(cp.x + 24, cp.y + 8)
        ctx.lineTo(cp.x + 4, cp.y + 16)
        ctx.fill()
      })

      // Desenhar Ovelhinha (Happy Sheep do Tiny Swords)
      const sheepImg = sheepRescued && Math.abs(state.sheep.vx) > 10 ? imgs.sheep_bounce : imgs.sheep_idle
      if (sheepImg) {
        const frameCount = sheepImg === imgs.sheep_bounce ? 6 : 8
        const sFrame = Math.floor(state.sheepAnimTimer) % frameCount
        ctx.save()
        ctx.translate(state.sheep.x + state.sheep.w / 2, state.sheep.y + state.sheep.h / 2)
        if (!state.sheep.facingRight) ctx.scale(-1, 1)

        // Desenhar frame de 128x128 da spritesheet
        ctx.drawImage(
          sheepImg,
          sFrame * 128,
          0,
          128,
          128,
          -state.sheep.w / 2 - 10,
          -state.sheep.h / 2 - 20,
          72,
          72
        )
        ctx.restore()
      } else {
        // Fallback visual da ovelha
        ctx.font = '32px sans-serif'
        ctx.fillText('🐑', state.sheep.x, state.sheep.y + 30)
      }

      // Desenhar Jogador (Pastor / Pawn do Tiny Swords)
      if (imgs.player) {
        // Spritesheet de 1152x1152 (6 colunas x 6 linhas de 192x192 cada)
        const isMoving = Math.abs(state.player.vx) > 10
        const row = isMoving ? 1 : 0 // Linha 0 = Idle, Linha 1 = Run
        const pFrame = Math.floor(state.playerAnimTimer) % 6

        ctx.save()
        ctx.translate(state.player.x + state.player.w / 2, state.player.y + state.player.h / 2)
        if (!state.player.facingRight) ctx.scale(-1, 1)

        ctx.drawImage(
          imgs.player,
          pFrame * 192,
          row * 192,
          192,
          192,
          -state.player.w / 2 - 40,
          -state.player.h / 2 - 48,
          120,
          120
        )
        ctx.restore()
      } else {
        // Fallback do pastor
        ctx.fillStyle = '#3b82f6'
        ctx.fillRect(state.player.x, state.player.y, state.player.w, state.player.h)
      }

      // Desenhar Partículas
      state.particles.forEach(p => {
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      })

      ctx.restore()
    }

    animId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animId)
  }, [isPaused, gameWon, gameOver, sheepRescued, currentStage])

  // Ajuste de Resolução do Canvas
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Ações de Controles Touch
  const handleVirtualMove = ({ x, isRunning }: { x: number; isRunning: boolean }) => {
    ensureAudio()
    inputState.current.x = x
    inputState.current.isRunning = isRunning
  }

  const handleVirtualJump = () => {
    ensureAudio()
    inputState.current.jumpRequested = true
  }

  const handleRestart = () => {
    const state = gameState.current
    state.player.x = state.lastCheckpoint.x
    state.player.y = state.lastCheckpoint.y
    state.player.vx = 0
    state.player.vy = 0
    setLives(3)
    setGameOver(false)
    setIsPaused(false)
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#7dd3fc',
        userSelect: 'none',
        fontFamily: "'Inter', sans-serif"
      }}
    >
      {/* CANVAS PRINCIPAL */}
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

      {/* HUD SUPERIOR */}
      <div
        style={{
          position: 'absolute',
          top: 18,
          left: 18,
          right: 18,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'none',
          zIndex: 40
        }}
      >
        {/* Estrelas e Pontos */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            border: '2px solid rgba(251, 191, 36, 0.8)',
            borderRadius: 999,
            padding: '6px 16px 6px 10px',
            color: '#ffffff',
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(8px)'
          }}
        >
          <span style={{ fontSize: 20 }}>⭐</span>
          <span style={{ fontSize: 18, fontWeight: 900, color: '#fef08a' }}>
            {score.toString().padStart(3, '0')}
          </span>
          {cluesFound > 0 && (
            <span style={{ fontSize: 13, color: '#e2e8f0', marginLeft: 6, fontWeight: 700 }}>
              🧶 {cluesFound}/3
            </span>
          )}
        </div>

        {/* Botão de Pausa */}
        <button
          onClick={() => {
            ensureAudio()
            setIsPaused(true)
          }}
          style={{
            pointerEvents: 'auto',
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)'
          }}
        >
          <Pause size={20} />
        </button>
      </div>

      {/* HUD INFERIOR */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          pointerEvents: 'none',
          zIndex: 40
        }}
      >
        {/* Banner do Objetivo (Estilo Pergaminho Claro) */}
        <div
          style={{
            maxWidth: 'min(420px, 65vw)',
            backgroundColor: 'rgba(254, 243, 199, 0.95)',
            border: '2px solid #d97706',
            borderRadius: 16,
            padding: '10px 18px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(6px)'
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: '#92400e', marginBottom: 2 }}>
            MISSÃO ATUAL
          </div>
          <div style={{ fontSize: 'clamp(13px, 1.8vw, 15px)', fontWeight: 800, color: '#78350f', lineHeight: 1.3 }}>
            {objectiveText}
          </div>
        </div>

        {/* Vidas ❤️ ❤️ ❤️ */}
        <div
          style={{
            display: 'flex',
            gap: 6,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            borderRadius: 999,
            padding: '8px 14px',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.15)'
          }}
        >
          {Array.from({ length: 3 }).map((_, idx) => (
            <span
              key={idx}
              style={{
                fontSize: 22,
                filter: idx < lives ? 'drop-shadow(0 2px 4px rgba(239, 68, 68, 0.7))' : 'grayscale(100%) opacity(0.35)'
              }}
            >
              ❤️
            </span>
          ))}
        </div>
      </div>

      {/* CONTROLES VIRTUAIS TOUCH */}
      <VirtualControls
        onMove={({ x, isRunning }) => handleVirtualMove({ x, isRunning })}
        onJump={handleVirtualJump}
        disabled={isPaused || gameWon || gameOver}
      />

      {/* MODAL DE PAUSA */}
      {isPaused && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(5, 7, 15, 0.85)',
            backdropFilter: 'blur(10px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 420,
              background: 'linear-gradient(145deg, #1e1b4b 0%, #0f172a 100%)',
              borderRadius: 24,
              border: '2px solid rgba(251, 191, 36, 0.5)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
              padding: 28,
              textAlign: 'center',
              color: '#ffffff'
            }}
          >
            <h2 style={{ fontSize: 24, fontWeight: 900, color: '#fbbf24', margin: '0 0 20px 0' }}>
              JOGO PAUSADO
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                onClick={() => setIsPaused(false)}
                style={{
                  padding: '14px',
                  borderRadius: 16,
                  backgroundColor: '#22c55e',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: 16,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                <Play size={18} fill="#fff" /> CONTINUAR
              </button>

              <button
                onClick={handleRestart}
                style={{
                  padding: '12px',
                  borderRadius: 16,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.2)',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                <RotateCcw size={16} /> RECOMEÇAR FASE
              </button>

              <button
                onClick={() => setShowStoryModal(true)}
                style={{
                  padding: '12px',
                  borderRadius: 16,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.2)',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                <BookOpen size={16} /> HISTÓRIA BÍBLICA
              </button>

              <button
                onClick={onExit ? onExit : () => (window.location.href = 'http://localhost:3003/jogos')}
                style={{
                  padding: '12px',
                  borderRadius: 16,
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  color: '#f87171',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  marginTop: 6
                }}
              >
                SAIR DO JOGO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TELA DE VITÓRIA / MISSÃO CONCLUÍDA */}
      {gameWon && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(5, 7, 15, 0.9)',
            backdropFilter: 'blur(12px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 480,
              background: 'linear-gradient(145deg, #1e1b4b 0%, #0f172a 100%)',
              border: '3px solid #fbbf24',
              borderRadius: 28,
              padding: 32,
              textAlign: 'center',
              color: '#ffffff',
              boxShadow: '0 25px 60px rgba(0,0,0,0.8)'
            }}
          >
            <div style={{ fontSize: 44, marginBottom: 8 }}>✨ 🐑 ✨</div>
            <h2 style={{ fontSize: 26, fontWeight: 900, color: '#fbbf24', margin: '0 0 8px 0' }}>
              MISSÃO CONCLUÍDA!
            </h2>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#86efac', marginBottom: 16 }}>
              A Ovelha Perdida foi encontrada!
            </div>

            {/* Estrelas */}
            <div style={{ fontSize: 32, letterSpacing: '0.2em', marginBottom: 16 }}>
              ⭐⭐⭐
            </div>

            {/* Mensagem Bíblica de Lucas 15:6 */}
            <div
              style={{
                backgroundColor: 'rgba(254, 243, 199, 0.15)',
                border: '1px solid rgba(251, 191, 36, 0.4)',
                borderRadius: 16,
                padding: '14px 18px',
                fontSize: 14,
                lineHeight: 1.5,
                color: '#fef08a',
                marginBottom: 24,
                fontStyle: 'italic'
              }}
            >
              “Alegrai-vos comigo, porque já achei a minha ovelha perdida.”
              <div style={{ fontSize: 12, fontWeight: 800, marginTop: 4, fontStyle: 'normal', color: '#fbbf24' }}>
                Lucas 15:6
              </div>
            </div>

            {/* Estatísticas */}
            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 24, fontSize: 14 }}>
              <div>
                <div style={{ color: '#94a3b8', fontSize: 12 }}>PONTOS</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#fbbf24' }}>{score}</div>
              </div>
              <div>
                <div style={{ color: '#94a3b8', fontSize: 12 }}>TEMPO</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#38bdf8' }}>
                  {Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, '0')}
                </div>
              </div>
              <div>
                <div style={{ color: '#94a3b8', fontSize: 12 }}>PISTAS</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#4ade80' }}>{cluesFound}/3</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={() => {
                  setGameWon(false)
                  setSheepRescued(false)
                  gameState.current.player.x = 100
                  gameState.current.player.y = 500
                  gameState.current.sheep.x = 4420
                  gameState.current.sheep.y = GROUND_Y - 260
                  setScore(0)
                  setCluesFound(0)
                  setElapsedSeconds(0)
                  setCurrentStage(1)
                  setObjectiveText('Uma ovelhinha se perdeu. Saia da vila para procurá-la!')
                }}
                style={{
                  padding: '14px',
                  borderRadius: 16,
                  backgroundColor: '#22c55e',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                JOGAR NOVAMENTE
              </button>

              <button
                onClick={onExit ? onExit : () => (window.location.href = 'http://localhost:3003/jogos')}
                style={{
                  padding: '12px',
                  borderRadius: 16,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.2)',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                VOLTAR AOS JOGOS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE HISTÓRIA BÍBLICA */}
      {showStoryModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(5, 7, 15, 0.85)',
            backdropFilter: 'blur(10px)',
            zIndex: 110,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 480,
              backgroundColor: '#fef3c7',
              border: '3px solid #d97706',
              borderRadius: 24,
              padding: 28,
              color: '#78350f',
              textAlign: 'left'
            }}
          >
            <h3 style={{ margin: '0 0 12px 0', fontSize: 20, fontWeight: 900, color: '#92400e' }}>
              📖 A Parábola da Ovelha Perdida
            </h3>
            <p style={{ fontSize: 14, lineHeight: 1.6, margin: '0 0 12px 0' }}>
              “Qual de vós é o homem que, possuindo cem ovelhas e perdendo uma delas, não deixa no deserto as noventa e nove e não vai após a perdida até que a encontre?”
            </p>
            <p style={{ fontSize: 14, lineHeight: 1.6, margin: '0 0 16px 0' }}>
              “E, achando-a, a põe sobre os ombros, cheio de júbilo. Assim vos digo que haverá mais júbilo no céu por um pecador que se arrepende...” — Lucas 15:4–7
            </p>
            <button
              onClick={() => setShowStoryModal(false)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 14,
                backgroundColor: '#d97706',
                color: '#fff',
                border: 'none',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              ENTENDI
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
