import React, { useRef, useEffect, useState, useCallback } from 'react'
import { supabase } from '@comdeuskids/supabase'

// Sintetizador Procedural de Efeitos Sonoros Web Audio
function playSfx(type: 'jump' | 'sling' | 'hit' | 'coin' | 'fanfare' | 'click' | 'success') {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const now = ctx.currentTime

    if (type === 'jump') {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.setValueAtTime(160, now)
      osc.frequency.exponentialRampToValueAtTime(380, now + 0.15)
      gain.gain.setValueAtTime(0.2, now)
      gain.gain.linearRampToValueAtTime(0.01, now + 0.15)
      osc.start(now)
      osc.stop(now + 0.15)
    } else if (type === 'sling') {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.setValueAtTime(420, now)
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.18)
      gain.gain.setValueAtTime(0.25, now)
      gain.gain.linearRampToValueAtTime(0.01, now + 0.18)
      osc.start(now)
      osc.stop(now + 0.18)
    } else if (type === 'hit') {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(180, now)
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.22)
      gain.gain.setValueAtTime(0.35, now)
      gain.gain.linearRampToValueAtTime(0.01, now + 0.22)
      osc.start(now)
      osc.stop(now + 0.22)
    } else if (type === 'coin') {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.setValueAtTime(650, now)
      osc.frequency.setValueAtTime(950, now + 0.08)
      gain.gain.setValueAtTime(0.2, now)
      gain.gain.linearRampToValueAtTime(0.01, now + 0.2)
      osc.start(now)
      osc.stop(now + 0.2)
    } else if (type === 'click') {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.setValueAtTime(400, now)
      gain.gain.setValueAtTime(0.1, now)
      gain.gain.linearRampToValueAtTime(0.01, now + 0.04)
      osc.start(now)
      osc.stop(now + 0.04)
    } else if (type === 'success') {
      const notes = [440, 554, 659, 880]
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.setValueAtTime(freq, now + idx * 0.08)
        gain.gain.setValueAtTime(0.18, now + idx * 0.08)
        gain.gain.linearRampToValueAtTime(0.01, now + idx * 0.08 + 0.15)
        osc.start(now + idx * 0.08)
        osc.stop(now + idx * 0.08 + 0.15)
      })
    } else if (type === 'fanfare') {
      const chords = [392, 523, 659, 784, 1046]
      chords.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.setValueAtTime(freq, now + idx * 0.12)
        gain.gain.setValueAtTime(0.25, now + idx * 0.12)
        gain.gain.linearRampToValueAtTime(0.01, now + idx * 0.12 + 0.35)
        osc.start(now + idx * 0.12)
        osc.stop(now + idx * 0.12 + 0.35)
      })
    }
  } catch {
    // Silently continue if audio context not allowed yet
  }
}

export interface DaviGameProps {
  onExit?: () => void
  profileId?: string | null
}

interface Projectile {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  active: boolean
}

interface CollectibleStone {
  id: number
  x: number
  y: number
  collected: boolean
}

interface SoldierNPC {
  x: number
  y: number
  dialogue: string
  talked: boolean
}

export default function DaviGame({ onExit, profileId }: DaviGameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Estados de Jogo
  const [stage, setStage] = useState<1 | 2 | 3 | 4 | 5>(1)
  const [objective, setObjective] = useState<string>('Proteja o rebanho! Afugente as feras com a funda!')
  const [score, setScore] = useState<number>(0)
  const [stonesCount, setStonesCount] = useState<number>(0)
  const [lives, setLives] = useState<number>(3)
  const [isPaused, setIsPaused] = useState<boolean>(false)
  const [gameWon, setGameWon] = useState<boolean>(false)
  const [gameOver, setGameOver] = useState<boolean>(false)
  const [dialogueText, setDialogueText] = useState<string | null>(null)

  // Mira da Funda
  const [isAiming, setIsAiming] = useState<boolean>(false)
  const [aimAngle, setAimAngle] = useState<number>(-Math.PI / 4)
  const [aimPower, setAimPower] = useState<number>(14)

  // Referências para o loop de física e render
  const stateRef = useRef({
    player: {
      x: 120,
      y: 380,
      vx: 0,
      vy: 0,
      width: 46,
      height: 70,
      isGrounded: true,
      facing: 'right' as 'left' | 'right',
      animTimer: 0
    },
    golias: {
      x: 820,
      y: 310,
      width: 90,
      height: 140,
      health: 3,
      maxHealth: 3,
      facing: 'left' as 'left' | 'right',
      animTimer: 0,
      hitTimer: 0,
      defeated: false
    },
    cameraX: 0,
    cameraY: 0,
    projectiles: [] as Projectile[],
    stones: [
      { id: 1, x: 260, y: 410, collected: false },
      { id: 2, x: 380, y: 405, collected: false },
      { id: 3, x: 510, y: 412, collected: false },
      { id: 4, x: 650, y: 408, collected: false },
      { id: 5, x: 790, y: 415, collected: false }
    ] as CollectibleStone[],
    soldiers: [
      { x: 300, y: 380, dialogue: 'Golias desafia o exército há 40 dias... Ninguém ousa enfrentá-lo!', talked: false },
      { x: 550, y: 380, dialogue: 'Você é apenas um jovem pastor! Como poderá enfrentá-lo?', talked: false },
      { x: 820, y: 380, dialogue: 'O Senhor seja contigo, Davi!', talked: false }
    ] as SoldierNPC[],
    predator: {
      x: 750,
      y: 380,
      vx: -1.5,
      alive: true
    }
  })

  // Imagens carregadas
  const imagesRef = useRef<{
    davi?: HTMLImageElement
    soldier?: HTMLImageElement
    goliasIdle?: HTMLImageElement
    goliasAttack?: HTMLImageElement
    goliasHurt?: HTMLImageElement
    sheep?: HTMLImageElement
  }>({})

  // Controles
  const inputRef = useRef({
    left: false,
    right: false,
    jump: false,
    aim: false,
    shoot: false
  })

  // Carregar Assets
  useEffect(() => {
    const daviImg = new Image()
    daviImg.src = '/assets/davi-e-golias/PNG/Adventurer/adventurer_tilesheet.png'

    const soldierImg = new Image()
    soldierImg.src = '/assets/davi-e-golias/PNG/Soldier/soldier_tilesheet.png'

    const goliasImg = new Image()
    goliasImg.src = '/assets/davi-e-golias/golias/Idle.png'

    const goliasHurtImg = new Image()
    goliasHurtImg.src = '/assets/davi-e-golias/golias/Hurt.png'

    const sheepImg = new Image()
    sheepImg.src = '/assets/a-ovelha-perdida/HappySheep_Idle.png'

    imagesRef.current = {
      davi: daviImg,
      soldier: soldierImg,
      goliasIdle: goliasImg,
      goliasHurt: goliasHurtImg,
      sheep: sheepImg
    }
  }, [])

  // Disparo da Funda
  const shootSling = useCallback(() => {
    const s = stateRef.current
    if (stonesCount <= 0 && stage !== 1) {
      setDialogueText('Você precisa das 5 pedras do ribeiro no seu alforje!')
      return
    }

    playSfx('sling') // Som de arremesso
    const pX = s.player.facing === 'right' ? s.player.x + 35 : s.player.x + 10
    const pY = s.player.y + 25

    const speed = aimPower
    const vx = Math.cos(aimAngle) * speed * (s.player.facing === 'right' ? 1 : -1)
    const vy = Math.sin(aimAngle) * speed

    s.projectiles.push({
      id: Date.now() + Math.random(),
      x: pX,
      y: pY,
      vx,
      vy,
      radius: 6,
      active: true
    })

    if (stage === 5 && stonesCount > 0) {
      setStonesCount(prev => Math.max(0, prev - 1))
    }
  }, [aimAngle, aimPower, stage, stonesCount])

  // Controles de Teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault()
      }
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') inputRef.current.left = true
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') inputRef.current.right = true
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
        if (!inputRef.current.jump) {
          const s = stateRef.current
          if (s.player.isGrounded) {
            s.player.vy = -12
            s.player.isGrounded = false
            playSfx('jump')
          }
        }
        inputRef.current.jump = true
      }
      if (e.key === 'f' || e.key === 'F' || e.key === 'Enter') {
        shootSling()
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') inputRef.current.left = false
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') inputRef.current.right = false
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') inputRef.current.jump = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [shootSling])

  // Salvar Progresso no Supabase
  const handleSaveVictory = useCallback(async () => {
    playSfx('fanfare')
    setGameWon(true)
    if (profileId) {
      try {
        await supabase.from('profile_game_progress').upsert({
          profile_id: profileId,
          game_id: 'davi-e-golias',
          completed: true,
          score: score + 500,
          best_score: score + 500,
          best_time_seconds: 60,
          stars: 3,
          attempts: 1,
          last_played_at: new Date().toISOString()
        }, { onConflict: 'profile_id,game_id' })
      } catch (err) {
        console.warn('Erro ao salvar progresso de Davi:', err)
      }
    }
  }, [profileId, score])

  // Loop Principal de Física e Renderização
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let lastTime = performance.now()

    const GROUND_Y = 440

    const loop = (currentTime: number) => {
      const delta = Math.min((currentTime - lastTime) / 1000, 0.1)
      lastTime = currentTime

      const vw = canvas.width = window.innerWidth
      const vh = canvas.height = window.innerHeight

      const s = stateRef.current

      if (!isPaused && !gameWon && !gameOver) {
        // Movimento Horizontal de Davi
        if (inputRef.current.left) {
          s.player.vx = -220
          s.player.facing = 'left'
        } else if (inputRef.current.right) {
          s.player.vx = 220
          s.player.facing = 'right'
        } else {
          s.player.vx *= 0.8
        }

        s.player.x += s.player.vx * delta

        // Gravidade
        s.player.vy += 28 * delta * 20
        s.player.y += s.player.vy * delta * 20

        if (s.player.y >= GROUND_Y - s.player.height) {
          s.player.y = GROUND_Y - s.player.height
          s.player.vy = 0
          s.player.isGrounded = true
        }

        s.player.animTimer += delta * (Math.abs(s.player.vx) > 10 ? 8 : 2)

        // Limites do mapa
        s.player.x = Math.max(20, Math.min(1100, s.player.x))

        // Fases e Objetivos
        if (stage === 1) {
          // Predador se aproximando
          if (s.predator.alive) {
            s.predator.x += s.predator.vx * delta * 60
            if (s.predator.x <= 250) {
              s.predator.vx = 1.5
            } else if (s.predator.x >= 780) {
              s.predator.vx = -1.5
            }
          }
        } else if (stage === 2) {
          // Coleta de Pedras no Riacho
          s.stones.forEach(st => {
            if (!st.collected) {
              const dist = Math.hypot(s.player.x + 23 - st.x, s.player.y + 35 - st.y)
              if (dist < 40) {
                st.collected = true
                playSfx('coin')
                setStonesCount(prev => {
                  const updated = prev + 1
                  if (updated >= 5) {
                    playSfx('success')
                    setTimeout(() => {
                      setStage(3)
                      setObjective('Fase 3: Entregue os pães no acampamento e fale com os soldados!')
                      s.player.x = 80
                    }, 800)
                  }
                  return updated
                })
                setScore(p => p + 50)
              }
            }
          })
        } else if (stage === 3) {
          // Interação com Soldados
          s.soldiers.forEach(soldier => {
            const dist = Math.hypot(s.player.x - soldier.x, s.player.y - soldier.y)
            if (dist < 60 && !soldier.talked) {
              soldier.talked = true
              setDialogueText(soldier.dialogue)
              playSfx('click')
              setScore(p => p + 30)
            }
          })

          if (s.player.x > 950) {
            setStage(4)
            setObjective('Fase 4: Desça ao Vale de Elá para responder ao desafio!')
            s.player.x = 80
            setDialogueText(null)
          }
        } else if (stage === 4) {
          if (s.player.x > 950) {
            setStage(5)
            setObjective('Fase 5: Mire na testa do gigante com a funda! Confie no Senhor!')
            s.player.x = 100
          }
        } else if (stage === 5) {
          // Golias
          s.golias.animTimer += delta * 4
          if (s.golias.hitTimer > 0) s.golias.hitTimer -= delta
        }

        // Projéteis
        for (let i = s.projectiles.length - 1; i >= 0; i--) {
          const p = s.projectiles[i]
          p.x += p.vx * delta * 50
          p.y += p.vy * delta * 50
          p.vy += 0.35 // Gravidade da pedra

          // Colisão com Predador (Fase 1)
          if (stage === 1 && s.predator.alive) {
            if (Math.hypot(p.x - s.predator.x, p.y - s.predator.y) < 40) {
              s.predator.alive = false
              p.active = false
              playSfx('hit')
              setScore(sc => sc + 100)
              setObjective('Excelente! As ovelhas estão a salvo! Agora vá até o riacho!')
              setTimeout(() => {
                setStage(2)
                setObjective('Fase 2: Colete as 5 pedras lisas na água do ribeiro!')
                s.player.x = 60
              }, 1200)
            }
          }

          // Colisão com Golias (Fase 5)
          if (stage === 5 && !s.golias.defeated) {
            // Ponto crítico: a cabeça de Golias (y entre 310 e 350)
            if (p.x >= s.golias.x - 20 && p.x <= s.golias.x + s.golias.width + 20 &&
                p.y >= s.golias.y - 10 && p.y <= s.golias.y + 60) {
              p.active = false
              s.golias.health -= 1
              s.golias.hitTimer = 0.5
              playSfx('hit')

              if (s.golias.health <= 0) {
                s.golias.defeated = true
                handleSaveVictory()
              }
            }
          }

          if (p.y > GROUND_Y || p.x > 1200 || p.x < -100 || !p.active) {
            s.projectiles.splice(i, 1)
          }
        }
      }

      // ==========================================
      // RENDERIZAÇÃO GRÁFICA
      // ==========================================
      ctx.clearRect(0, 0, vw, vh)

      const ZOOM = Math.min(2.1, Math.max(1.7, vw / 700))
      const viewW = vw / ZOOM
      const viewH = vh / ZOOM

      // Foco da Câmera
      const targetCamX = Math.max(0, Math.min(1200 - viewW, s.player.x - viewW * 0.4))
      const targetCamY = Math.max(0, Math.min(600 - viewH, GROUND_Y - viewH * 0.75))
      s.cameraX += (targetCamX - s.cameraX) * 0.1
      s.cameraY += (targetCamY - s.cameraY) * 0.1

      // 1. Céu com atmosfera de acordo com a fase
      const skyGrad = ctx.createLinearGradient(0, 0, 0, vh)
      if (stage === 1 || stage === 2) {
        skyGrad.addColorStop(0, '#38bdf8')
        skyGrad.addColorStop(1, '#bae6fd')
      } else if (stage === 3) {
        skyGrad.addColorStop(0, '#f59e0b')
        skyGrad.addColorStop(1, '#fef3c7')
      } else {
        // Vale de Elá / Confronto épico
        skyGrad.addColorStop(0, '#ea580c')
        skyGrad.addColorStop(0.6, '#f97316')
        skyGrad.addColorStop(1, '#fed7aa')
      }
      ctx.fillStyle = skyGrad
      ctx.fillRect(0, 0, vw, vh)

      // 2. Colinas de Judá ao fundo (Parallax)
      ctx.save()
      ctx.translate(-s.cameraX * 0.2, 0)
      ctx.fillStyle = stage >= 4 ? '#b45309' : '#86efac'
      ctx.beginPath()
      ctx.moveTo(-100, vh)
      for (let x = -100; x <= vw + 1500; x += 300) {
        ctx.quadraticCurveTo(x + 150, vh - 260 - Math.sin(x * 0.01) * 40, x + 300, vh)
      }
      ctx.fill()
      ctx.restore()

      // 3. Mundo Central com ZOOM
      ctx.save()
      ctx.scale(ZOOM, ZOOM)
      ctx.translate(-s.cameraX, -s.cameraY)

      // Chão e Platô
      ctx.fillStyle = stage >= 4 ? '#78350f' : '#15803d'
      ctx.fillRect(-100, GROUND_Y, 1400, 300)

      // Grama/Camada Superior
      ctx.fillStyle = stage >= 4 ? '#92400e' : '#22c55e'
      ctx.fillRect(-100, GROUND_Y, 1400, 14)

      // Cenários Específicos por Fase
      const imgs = imagesRef.current

      if (stage === 1) {
        // Rebanho de Ovelhas
        if (imgs.sheep) {
          ctx.drawImage(imgs.sheep, 0, 0, 128, 128, 180, GROUND_Y - 45, 60, 48)
          ctx.drawImage(imgs.sheep, 128, 0, 128, 128, 290, GROUND_Y - 45, 60, 48)
        }
        // Predador (Lobo/Fera)
        if (s.predator.alive) {
          ctx.fillStyle = '#475569'
          ctx.fillRect(s.predator.x, s.predator.y - 30, 45, 30)
          ctx.fillStyle = '#ef4444'
          ctx.beginPath()
          ctx.arc(s.predator.x + 8, s.predator.y - 20, 3, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = '#fff'
          ctx.font = '12px sans-serif'
          ctx.fillText('🐺 Fera!', s.predator.x, s.predator.y - 38)
        }
      } else if (stage === 2) {
        // Riacho com Água Corrente
        ctx.fillStyle = 'rgba(56, 189, 248, 0.75)'
        ctx.fillRect(200, GROUND_Y + 5, 650, 40)
        // Pedras Lisas Coletáveis
        s.stones.forEach(st => {
          if (!st.collected) {
            ctx.fillStyle = '#f8fafc'
            ctx.beginPath()
            ctx.arc(st.x, st.y, 8, 0, Math.PI * 2)
            ctx.fill()
            ctx.fillStyle = '#38bdf8'
            ctx.beginPath()
            ctx.arc(st.x, st.y, 14, 0, Math.PI * 2)
            ctx.stroke()
            ctx.fillStyle = '#fff'
            ctx.font = '10px sans-serif'
            ctx.fillText('🪨', st.x - 7, st.y + 4)
          }
        })
      } else if (stage === 3) {
        // Tendas e Soldados do Exército de Israel
        s.soldiers.forEach(soldier => {
          if (imgs.soldier) {
            // Desenhar soldado hebreu
            ctx.drawImage(imgs.soldier, 0, 0, 80, 110, soldier.x, soldier.y - 15, 52, 72)
          }
          // Tenda militar
          ctx.fillStyle = '#cbd5e1'
          ctx.beginPath()
          ctx.moveTo(soldier.x - 40, GROUND_Y)
          ctx.lineTo(soldier.x, GROUND_Y - 90)
          ctx.lineTo(soldier.x + 40, GROUND_Y)
          ctx.fill()
          ctx.fillStyle = '#3b82f6'
          ctx.fillRect(soldier.x - 2, GROUND_Y - 95, 4, 15)
        })
      } else if (stage === 5) {
        // Golias: O Gigante Filisteu
        const g = s.golias
        if (!g.defeated) {
          const gImg = g.hitTimer > 0 ? imgs.goliasHurt : imgs.goliasIdle
          if (gImg) {
            ctx.drawImage(gImg, 0, 0, 64, 64, g.x, g.y, g.width, g.height)
          } else {
            ctx.fillStyle = g.hitTimer > 0 ? '#ef4444' : '#1e293b'
            ctx.fillRect(g.x, g.y, g.width, g.height)
          }

          // Barra de Vida de Golias
          ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
          ctx.fillRect(g.x, g.y - 25, g.width, 10)
          ctx.fillStyle = '#ef4444'
          ctx.fillRect(g.x + 2, g.y - 23, (g.width - 4) * (g.health / g.maxHealth), 6)
          ctx.fillStyle = '#fff'
          ctx.font = 'bold 11px sans-serif'
          ctx.fillText('GOLIAS (Testa Desprotegida!)', g.x - 25, g.y - 32)
        } else {
          // Golias Caído
          ctx.save()
          ctx.translate(g.x + g.width / 2, GROUND_Y - 20)
          ctx.rotate(Math.PI / 2)
          if (imgs.goliasHurt) {
            ctx.drawImage(imgs.goliasHurt, 0, 0, 64, 64, -g.width / 2, -g.height / 2, g.width, g.height)
          }
          ctx.restore()
        }
      }

      // Desenhar Davi (Protagonista com Túnica e Funda)
      const p = s.player
      if (imgs.davi) {
        const frameCol = Math.floor(p.animTimer % 8)
        const frameX = frameCol * 80
        const frameY = Math.abs(p.vx) > 10 ? 110 : 0
        ctx.save()
        if (p.facing === 'left') {
          ctx.translate(p.x + p.width, p.y)
          ctx.scale(-1, 1)
          ctx.drawImage(imgs.davi, frameX, frameY, 80, 110, 0, 0, p.width, p.height)
        } else {
          ctx.drawImage(imgs.davi, frameX, frameY, 80, 110, p.x, p.y, p.width, p.height)
        }
        ctx.restore()
      } else {
        ctx.fillStyle = '#0284c7'
        ctx.fillRect(p.x, p.y, p.width, p.height)
      }

      // Linha de Trajetória da Mira (Fase 1 ou Fase 5)
      if (stage === 1 || stage === 5) {
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.7)'
        ctx.lineWidth = 2
        ctx.setLineDash([4, 4])
        ctx.beginPath()
        let simX = p.facing === 'right' ? p.x + 35 : p.x + 10
        let simY = p.y + 25
        let simVx = Math.cos(aimAngle) * aimPower * (p.facing === 'right' ? 1 : -1)
        let simVy = Math.sin(aimAngle) * aimPower
        ctx.moveTo(simX, simY)
        for (let step = 0; step < 18; step++) {
          simX += simVx * 0.4
          simY += simVy * 0.4
          simVy += 0.35 * 0.4
          ctx.lineTo(simX, simY)
        }
        ctx.stroke()
        ctx.setLineDash([])
      }

      // Projéteis (Pedras atiradas)
      s.projectiles.forEach(proj => {
        ctx.fillStyle = '#f8fafc'
        ctx.beginPath()
        ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#94a3b8'
        ctx.stroke()
      })

      ctx.restore()

      animationId = requestAnimationFrame(loop)
    }

    animationId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animationId)
  }, [stage, isPaused, gameWon, gameOver, aimAngle, aimPower, stonesCount, handleSaveVictory])

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', userSelect: 'none', background: '#000', fontFamily: 'system-ui, sans-serif' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />

      {/* HUD Superior */}
      <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 14, alignItems: 'center', zIndex: 20 }}>
        <div style={{ background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', padding: '8px 16px', borderRadius: 999, border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fef08a', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>⭐</span>
          <span>{score}</span>
        </div>
        <div style={{ background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', padding: '8px 16px', borderRadius: 999, border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>🪨 Alforje:</span>
          <span>{stonesCount}/5 Pedras</span>
        </div>
        <div style={{ background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', padding: '8px 14px', borderRadius: 999, border: '1px solid rgba(255, 255, 255, 0.15)', color: '#38bdf8', fontWeight: 600 }}>
          Fase {stage} de 5
        </div>
      </div>

      {/* Botão Sair */}
      <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 20, display: 'flex', gap: 10 }}>
        <button
          onClick={onExit}
          style={{ background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#fff', borderRadius: 999, padding: '8px 16px', cursor: 'pointer', fontWeight: 600 }}
        >
          ✕ Sair
        </button>
      </div>

      {/* Toast de Missão / Objetivo */}
      <div style={{ position: 'absolute', bottom: 20, left: 20, maxWidth: 440, background: 'rgba(254, 240, 138, 0.95)', backdropFilter: 'blur(8px)', padding: '12px 18px', borderRadius: 16, border: '2px solid #ca8a04', color: '#713f12', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', zIndex: 20 }}>
        <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#854d0e', marginBottom: 2 }}>Missão Atual</div>
        <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3 }}>{objective}</div>
      </div>

      {/* Caixa de Diálogo dos Soldados */}
      {dialogueText && (
        <div style={{ position: 'absolute', top: 80, left: '50%', transform: 'translateX(-50%)', background: 'rgba(15, 23, 42, 0.9)', color: '#fff', padding: '14px 24px', borderRadius: 16, border: '1px solid #38bdf8', maxWidth: 500, textAlign: 'center', zIndex: 30, boxShadow: '0 8px 30px rgba(0,0,0,0.4)' }}>
          <div style={{ fontSize: 13, color: '#38bdf8', fontWeight: 700, marginBottom: 4 }}>Soldado de Israel:</div>
          <div style={{ fontSize: 15, fontWeight: 500 }}>"{dialogueText}"</div>
        </div>
      )}

      {/* Controles Virtuais Touch (Mobile e Desktop) */}
      <div style={{ position: 'absolute', bottom: 20, right: 20, display: 'flex', gap: 12, zIndex: 25 }}>
        <button
          onTouchStart={() => inputRef.current.left = true}
          onTouchEnd={() => inputRef.current.left = false}
          onMouseDown={() => inputRef.current.left = true}
          onMouseUp={() => inputRef.current.left = false}
          style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(30, 41, 59, 0.8)', color: '#fff', border: '2px solid rgba(255,255,255,0.2)', fontSize: 20, cursor: 'pointer' }}
        >
          ◀
        </button>
        <button
          onTouchStart={() => inputRef.current.right = true}
          onTouchEnd={() => inputRef.current.right = false}
          onMouseDown={() => inputRef.current.right = true}
          onMouseUp={() => inputRef.current.right = false}
          style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(30, 41, 59, 0.8)', color: '#fff', border: '2px solid rgba(255,255,255,0.2)', fontSize: 20, cursor: 'pointer' }}
        >
          ▶
        </button>
        <button
          onTouchStart={() => {
            const s = stateRef.current
            if (s.player.isGrounded) {
              s.player.vy = -12
              s.player.isGrounded = false
              playSfx('jump')
            }
          }}
          onClick={() => {
            const s = stateRef.current
            if (s.player.isGrounded) {
              s.player.vy = -12
              s.player.isGrounded = false
              playSfx('jump')
            }
          }}
          style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(30, 41, 59, 0.8)', color: '#fff', border: '2px solid rgba(255,255,255,0.2)', fontSize: 13, fontWeight: 'bold', cursor: 'pointer' }}
        >
          PULOU
        </button>
        <button
          onClick={shootSling}
          style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', border: '2px solid #fef08a', fontSize: 13, fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(217, 119, 6, 0.5)' }}
        >
          FUNDA
        </button>
      </div>

      {/* Modal de Vitória Bíblica */}
      {gameWon && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 100, color: '#fff' }}>
          <div style={{ background: 'linear-gradient(180deg, #1e293b, #0f172a)', border: '2px solid #ca8a04', padding: '32px 40px', borderRadius: 28, maxWidth: 520, textAlign: 'center', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}>
            <div style={{ fontSize: 56, marginBottom: 8 }}>🏆</div>
            <h2 style={{ fontSize: 26, fontWeight: 900, color: '#fef08a', margin: '0 0 10px 0' }}>Vitória da Fé!</h2>
            <p style={{ fontSize: 15, color: '#94a3b8', margin: '0 0 16px 0', lineHeight: 1.5 }}>
              Golias caiu ao chão! A coragem e a confiança de Davi no Deus de Israel trouxeram libertação ao povo!
            </p>
            <div style={{ background: 'rgba(254, 240, 138, 0.1)', borderLeft: '4px solid #facc15', padding: '12px 16px', borderRadius: 8, textAlign: 'left', margin: '0 0 24px 0', fontSize: 13, color: '#fef9c3', fontStyle: 'italic', lineHeight: 1.4 }}>
              "Tu vens a mim com espada, e com lança, e com escudo; porém eu vou a ti em nome do Senhor dos Exércitos, o Deus dos exércitos de Israel."
              <div style={{ fontWeight: 'bold', fontStyle: 'normal', marginTop: 4, color: '#facc15' }}>— 1 Samuel 17:45</div>
            </div>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setGameWon(false)
                  setStage(1)
                  setStonesCount(0)
                  setScore(0)
                  stateRef.current.player.x = 120
                  stateRef.current.golias.health = 3
                  stateRef.current.golias.defeated = false
                  stateRef.current.predator.alive = true
                }}
                style={{ background: '#334155', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 14, fontWeight: 700, cursor: 'pointer' }}
              >
                Jogar Novamente
              </button>
              <button
                onClick={onExit}
                style={{ background: 'linear-gradient(135deg, #eab308, #ca8a04)', color: '#000', border: 'none', padding: '12px 28px', borderRadius: 14, fontWeight: 800, cursor: 'pointer' }}
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
