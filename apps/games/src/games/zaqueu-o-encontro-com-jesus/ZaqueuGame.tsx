import React, { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { audioManager, VirtualControls } from '@comdeuskids/game-core'
import { JerichoWorld } from './engine/JerichoWorld'
import { ZaqueuCharacter } from './engine/ZaqueuCharacter'
import { ThirdPersonCamera } from './engine/ThirdPersonCamera'
import { NPCSystem } from './engine/NPCSystem'
import { ParticleSystem } from './engine/ParticleSystem'
import { GameHUD } from './ui/GameHUD'
import { PauseModal } from './ui/PauseModal'
import { StartScreen } from './ui/StartScreen'

interface ZaqueuGameProps {
  isPaused?: boolean
  isMuted?: boolean
  onExit?: () => void
}

export default function ZaqueuGame({ onExit }: ZaqueuGameProps) {
  const mountRef = useRef<HTMLDivElement>(null)

  // Estados de Gameplay
  const [gameStarted, setGameStarted] = useState(false)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [isPaused, setIsPaused] = useState(false)
  const [objectiveText, setObjectiveText] = useState('Siga o caminho até a praça')
  const [audioStarted, setAudioStarted] = useState(false)

  // Referências do Motor 3D
  const engineRef = useRef<{
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    world: JerichoWorld
    player: ZaqueuCharacter
    camController: ThirdPersonCamera
    npcs: NPCSystem
    particles: ParticleSystem
    animFrameId: number
    lastTime: number
  } | null>(null)

  // Input State
  const inputState = useRef({
    forward: 0,
    right: 0,
    isRunning: false,
    jumpRequested: false
  })

  // Touch drag para rotação de câmera
  const touchDragRef = useRef<{ lastX: number; lastY: number; isDragging: boolean }>({
    lastX: 0,
    lastY: 0,
    isDragging: false
  })

  // Iniciar áudio na primeira interação
  const ensureAudio = useCallback(() => {
    if (!audioStarted) {
      audioManager.init()
      audioManager.startJerichoAmbience()
      audioManager.startExplorationMusic()
      setAudioStarted(true)
    }
  }, [audioStarted])

  // ==========================================
  // INICIALIZAÇÃO DO THREE.JS E JERICÓ 3D
  // ==========================================
  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const width = container.clientWidth || window.innerWidth
    const height = container.clientHeight || window.innerHeight

    // 1. Cena e Câmera
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 150)
    camera.position.set(0, 3, -42)

    // 2. Renderizador WebGL de alta fidelidade
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    container.appendChild(renderer.domElement)

    // 3. Sistemas do Mundo
    const particles = new ParticleSystem(scene)
    const world = new JerichoWorld(scene)
    const player = new ZaqueuCharacter(particles)
    scene.add(player.mesh)

    // Posição inicial de Zaqueu (Entrada de Jericó)
    player.mesh.position.set(0, 0, -38)

    const camController = new ThirdPersonCamera(camera, player.mesh)
    const npcs = new NPCSystem(scene)

    engineRef.current = {
      scene,
      camera,
      renderer,
      world,
      player,
      camController,
      npcs,
      particles,
      animFrameId: 0,
      lastTime: performance.now()
    }

    // 4. Redimensionamento de janela
    const handleResize = () => {
      if (!container || !engineRef.current) return
      const w = container.clientWidth
      const h = container.clientHeight
      engineRef.current.camera.aspect = w / h
      engineRef.current.camera.updateProjectionMatrix()
      engineRef.current.renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    // 5. Controles do Mouse (Órbita da câmera 360°)
    let isMouseDown = false
    let lastMouseX = 0
    let lastMouseY = 0

    const handleMouseDown = (e: MouseEvent) => {
      ensureAudio()
      if (e.button === 0) {
        isMouseDown = true
        lastMouseX = e.clientX
        lastMouseY = e.clientY
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDown || !engineRef.current) return
      const dx = e.clientX - lastMouseX
      const dy = e.clientY - lastMouseY
      lastMouseX = e.clientX
      lastMouseY = e.clientY
      engineRef.current.camController.rotate(dx, dy)
    }

    const handleMouseUp = () => {
      isMouseDown = false
    }

    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    // 6. Controles de Teclado (WASD / Setas / Espaço / Shift)
    const handleKeyDown = (e: KeyboardEvent) => {
      ensureAudio()
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        setIsPaused(prev => {
          const next = !prev
          if (next) audioManager.pauseGameAudio()
          else audioManager.resumeGameAudio()
          return next
        })
        return
      }

      switch (e.key) {
        case 'w':
        case 'W':
        case 'ArrowUp':
          inputState.current.forward = 1
          break
        case 's':
        case 'S':
        case 'ArrowDown':
          inputState.current.forward = -1
          break
        case 'a':
        case 'A':
        case 'ArrowLeft':
          inputState.current.right = -1
          break
        case 'd':
        case 'D':
        case 'ArrowRight':
          inputState.current.right = 1
          break
        case 'Shift':
          inputState.current.isRunning = true
          break
        case ' ':
          e.preventDefault()
          inputState.current.jumpRequested = true
          break
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'w':
        case 'W':
        case 'ArrowUp':
          if (inputState.current.forward > 0) inputState.current.forward = 0
          break
        case 's':
        case 'S':
        case 'ArrowDown':
          if (inputState.current.forward < 0) inputState.current.forward = 0
          break
        case 'a':
        case 'A':
        case 'ArrowLeft':
          if (inputState.current.right < 0) inputState.current.right = 0
          break
        case 'd':
        case 'D':
        case 'ArrowRight':
          if (inputState.current.right > 0) inputState.current.right = 0
          break
        case 'Shift':
          inputState.current.isRunning = false
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    // ==========================================
    // GAME LOOP PRINCIPAL (60 FPS ESTÁVEIS)
    // ==========================================
    const animate = (currentTime: number) => {
      engineRef.current!.animFrameId = requestAnimationFrame(animate)

      const delta = Math.min((currentTime - engineRef.current!.lastTime) * 0.001, 0.1)
      engineRef.current!.lastTime = currentTime

      // Quando pausado, congela a física e animações
      if (isPaused) {
        engineRef.current!.renderer.render(engineRef.current!.scene, engineRef.current!.camera)
        return
      }

      const { world, player, camController, npcs, particles, scene, camera, renderer } = engineRef.current!

      // Se ainda estiver na Tela Inicial, orbita a câmera suavemente por Jericó
      if (!gameStarted) {
        camController.theta += delta * 0.12
        camController.update(delta)
        world.update(currentTime * 0.001, delta, player.mesh.position)
        npcs.update(delta, player.mesh.position)
        renderer.render(scene, camera)
        return
      }

      // 1. Pulo
      if (inputState.current.jumpRequested) {
        player.jump()
        inputState.current.jumpRequested = false
      }

      // 2. Movimento
      player.move(
        inputState.current.right,
        inputState.current.forward,
        inputState.current.isRunning,
        camController.theta,
        delta
      )

      // 3. Atualização de física com colisão de Jericó
      player.update(delta, nextPos => world.checkCollision(nextPos))

      // 4. Câmera acompanhando Zaqueu
      camController.update(delta)

      // 5. Partículas de poeira e vento
      particles.update(delta)

      // 6. Atualização do mundo (estrelas e folhas)
      world.update(currentTime * 0.001, delta, player.mesh.position, () => {
        setScore(prev => prev + 100)
      })

      // 7. Atualização dos moradores e ovelhas com som 3D
      npcs.update(delta, player.mesh.position)

      // 8. Renderização do quadro
      renderer.render(scene, camera)
    }

    engineRef.current.animFrameId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)

      if (engineRef.current) {
        cancelAnimationFrame(engineRef.current.animFrameId)
        engineRef.current.renderer.dispose()
        if (container.contains(engineRef.current.renderer.domElement)) {
          container.removeChild(engineRef.current.renderer.domElement)
        }
      }
      audioManager.stopJerichoAmbience()
      audioManager.stopExplorationMusic()
    }
  }, [isPaused, gameStarted, ensureAudio])

  // Controles Touch: Joystick virtual
  const handleVirtualMove = ({ x, y, isRunning }: { x: number; y: number; isRunning: boolean }) => {
    if (!gameStarted) return
    ensureAudio()
    inputState.current.right = x
    inputState.current.forward = -y
    inputState.current.isRunning = isRunning
  }

  const handleVirtualJump = () => {
    if (!gameStarted) return
    ensureAudio()
    inputState.current.jumpRequested = true
  }

  // Toque para girar câmera na tela do celular
  const handleTouchStartScreen = (e: React.TouchEvent) => {
    if (!gameStarted) return
    ensureAudio()
    const touch = e.touches[0]
    if (touch.clientY < window.innerHeight * 0.7) {
      touchDragRef.current = {
        lastX: touch.clientX,
        lastY: touch.clientY,
        isDragging: true
      }
    }
  }

  const handleTouchMoveScreen = (e: React.TouchEvent) => {
    if (!gameStarted || !touchDragRef.current.isDragging || !engineRef.current) return
    const touch = e.touches[0]
    const dx = touch.clientX - touchDragRef.current.lastX
    const dy = touch.clientY - touchDragRef.current.lastY
    touchDragRef.current.lastX = touch.clientX
    touchDragRef.current.lastY = touch.clientY
    engineRef.current.camController.rotate(dx * 1.5, dy * 1.5)
  }

  const handleTouchEndScreen = () => {
    touchDragRef.current.isDragging = false
  }

  const handleRestart = () => {
    if (engineRef.current) {
      engineRef.current.player.mesh.position.set(0, 0, -38)
      engineRef.current.player.velocity.set(0, 0, 0)
    }
    setLives(3)
    setScore(0)
    setIsPaused(false)
    audioManager.resumeGameAudio()
  }

  const handlePause = () => {
    ensureAudio()
    audioManager.playSFX('pause')
    audioManager.pauseGameAudio()
    setIsPaused(true)
  }

  const handleResume = () => {
    audioManager.playSFX('resume')
    audioManager.resumeGameAudio()
    setIsPaused(false)
  }

  const handleExitGame = () => {
    if (onExit) onExit()
    else window.location.href = 'http://localhost:3003/jogos'
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#0c0d14',
        userSelect: 'none'
      }}
      onTouchStart={handleTouchStartScreen}
      onTouchMove={handleTouchMoveScreen}
      onTouchEnd={handleTouchEndScreen}
    >
      {/* CANVAS THREE.JS */}
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

      {/* TELA INICIAL COM LOGO OFICIAL E BOTÃO JOGAR */}
      {!gameStarted && (
        <StartScreen
          onPlay={() => {
            setGameStarted(true)
            ensureAudio()
          }}
        />
      )}

      {/* HUD SUPERIOR E INFERIOR (ESTRELA, PAUSE, VIDAS, OBJETIVO) */}
      {gameStarted && (
        <GameHUD
          score={score}
          lives={lives}
          objectiveText={objectiveText}
          onPause={handlePause}
        />
      )}

      {/* CONTROLES TOUCH PARA DISPOSITIVOS MÓVEIS */}
      {gameStarted && (
        <VirtualControls
          onMove={handleVirtualMove}
          onJump={handleVirtualJump}
          disabled={isPaused}
        />
      )}

      {/* TELA DE PAUSA CONGELANTE */}
      <PauseModal
        isOpen={isPaused}
        onResume={handleResume}
        onRestart={handleRestart}
        onExit={handleExitGame}
      />
    </div>
  )
}

