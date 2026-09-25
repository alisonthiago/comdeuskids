import React, { useRef, useEffect, useState, useCallback } from 'react'
import { supabase } from '@comdeuskids/supabase'

export interface DanielGameProps {
  onExit?: () => void
  profileId?: string | null
}

// Sintetizador de Efeitos Sonoros Web Audio
function playSfx(type: 'step' | 'pray' | 'angel' | 'door' | 'torch' | 'victory') {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const now = ctx.currentTime

    if (type === 'step') {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.setValueAtTime(110, now)
      gain.gain.setValueAtTime(0.04, now)
      gain.gain.linearRampToValueAtTime(0.001, now + 0.05)
      osc.start(now)
      osc.stop(now + 0.05)
    } else if (type === 'pray' || type === 'angel') {
      const notes = [523.25, 659.25, 783.99, 1046.50]
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now + idx * 0.12)
        gain.gain.setValueAtTime(0.2, now + idx * 0.12)
        gain.gain.linearRampToValueAtTime(0.001, now + idx * 0.12 + 0.4)
        osc.start(now + idx * 0.12)
        osc.stop(now + idx * 0.12 + 0.4)
      })
    } else if (type === 'torch') {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(320, now)
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.15)
      gain.gain.setValueAtTime(0.15, now)
      gain.gain.linearRampToValueAtTime(0.01, now + 0.15)
      osc.start(now)
      osc.stop(now + 0.15)
    } else if (type === 'victory') {
      const chords = [440, 554, 659, 880, 1108]
      chords.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.setValueAtTime(freq, now + idx * 0.1)
        gain.gain.setValueAtTime(0.25, now + idx * 0.1)
        gain.gain.linearRampToValueAtTime(0.01, now + idx * 0.1 + 0.5)
        osc.start(now + idx * 0.1)
        osc.stop(now + idx * 0.1 + 0.5)
      })
    }
  } catch {
    // Ignore audio permission errors
  }
}

export default function DanielGame({ onExit, profileId }: DanielGameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Estados de Fases (1 a 5)
  const [stage, setStage] = useState<1 | 2 | 3 | 4 | 5>(1)
  const [objective, setObjective] = useState<string>('Fase 1: Atravesse o palácio até o seu aposento de oração!')
  const [score, setScore] = useState<number>(0)
  const [torchesLit, setTorchesLit] = useState<number>(0)
  const [prayerTime, setPrayerTime] = useState<number>(0)
  const [gameWon, setGameWon] = useState<boolean>(false)
  const [dialogue, setDialogue] = useState<string | null>(null)

  // Imagens
  const imagesRef = useRef<{
    daniel?: HTMLImageElement
    dungeonTile?: HTMLImageElement
  }>({})

  // Daniel: Posição e física Top-Down (8 direções)
  const stateRef = useRef({
    player: {
      x: 150,
      y: 300,
      vx: 0,
      vy: 0,
      speed: 180,
      width: 44,
      height: 60,
      facing: 'down' as 'up' | 'down' | 'left' | 'right',
      animTimer: 0
    },
    torches: [
      { x: 300, y: 160, lit: false },
      { x: 600, y: 160, lit: false },
      { x: 450, y: 440, lit: false },
      { x: 750, y: 440, lit: false }
    ],
    lions: [
      { x: 480, y: 240, sleeping: true, breathe: 0 },
      { x: 620, y: 360, sleeping: true, breathe: 1.5 },
      { x: 340, y: 380, sleeping: true, breathe: 2.8 }
    ],
    angelHalo: {
      active: false,
      alpha: 0
    }
  })

  // Inputs
  const inputRef = useRef({
    up: false,
    down: false,
    left: false,
    right: false,
    interact: false
  })

  // Carregar Assets
  useEffect(() => {
    const danielImg = new Image()
    danielImg.src = '/assets/daniel-na-cova-dos-leoes/PNG/Player/player_tilesheet.png'

    const dungeonImg = new Image()
    dungeonImg.src = '/assets/daniel-na-cova-dos-leoes/32x32 Dungeon Pack/Dungeon_00.png'

    imagesRef.current = {
      daniel: danielImg,
      dungeonTile: dungeonImg
    }
  }, [])

  // Teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault()
      }
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') inputRef.current.up = true
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') inputRef.current.down = true
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') inputRef.current.left = true
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') inputRef.current.right = true
      if (e.key === 'e' || e.key === 'E' || e.key === ' ') {
        inputRef.current.interact = true
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') inputRef.current.up = false
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') inputRef.current.down = false
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') inputRef.current.left = false
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') inputRef.current.right = false
      if (e.key === 'e' || e.key === 'E' || e.key === ' ') inputRef.current.interact = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // Salvar Progresso no Supabase
  const handleSaveVictory = useCallback(async () => {
    playSfx('victory')
    setGameWon(true)
    if (profileId) {
      try {
        await supabase.from('profile_game_progress').upsert({
          profile_id: profileId,
          game_id: 'daniel-na-cova-dos-leoes',
          completed: true,
          score: score + 600,
          best_score: score + 600,
          best_time_seconds: 75,
          stars: 3,
          attempts: 1,
          last_played_at: new Date().toISOString()
        }, { onConflict: 'profile_id,game_id' })
      } catch (err) {
        console.warn('Erro ao salvar progresso de Daniel:', err)
      }
    }
  }, [profileId, score])

  // Loop de Jogo Top-Down
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let lastTime = performance.now()

    const loop = (currentTime: number) => {
      const delta = Math.min((currentTime - lastTime) / 1000, 0.1)
      lastTime = currentTime

      const vw = canvas.width = window.innerWidth
      const vh = canvas.height = window.innerHeight

      const s = stateRef.current
      const p = s.player

      if (!gameWon) {
        // Movimento Top-Down 8 Direções
        let mx = 0
        let my = 0
        if (inputRef.current.up) my -= 1
        if (inputRef.current.down) my += 1
        if (inputRef.current.left) mx -= 1
        if (inputRef.current.right) mx += 1

        if (mx !== 0 && my !== 0) {
          mx *= 0.7071
          my *= 0.7071
        }

        p.x += mx * p.speed * delta
        p.y += my * p.speed * delta

        if (mx > 0) p.facing = 'right'
        else if (mx < 0) p.facing = 'left'
        else if (my > 0) p.facing = 'down'
        else if (my < 0) p.facing = 'up'

        if (mx !== 0 || my !== 0) {
          p.animTimer += delta * 8
          if (Math.floor(p.animTimer) % 4 === 0) playSfx('step')
        }

        // Limites da Sala / Câmara
        p.x = Math.max(80, Math.min(vw - 120, p.x))
        p.y = Math.max(120, Math.min(vh - 120, p.y))

        // Lógica de Fases
        if (stage === 1) {
          if (p.x > vw - 160) {
            setStage(2)
            setObjective('Fase 2: Aproxime-se da janela aberta voltada para Jerusalém e faça sua oração!')
            p.x = 120
            playSfx('door')
          }
        } else if (stage === 2) {
          // Janela de Oração no alto (x ~ vw / 2, y ~ 130)
          const distToWindow = Math.hypot(p.x - vw / 2, p.y - 140)
          if (distToWindow < 70) {
            setPrayerTime(prev => {
              const updated = prev + delta
              if (updated >= 3 && stage === 2) {
                playSfx('pray')
                setStage(3)
                setObjective('Fase 3: Os guardas o levaram ao subterrâneo. Acenda as 4 tochas nos corredores!')
                p.x = 120
                setScore(sc => sc + 100)
              }
              return updated
            })
          }
        } else if (stage === 3) {
          // Acender tochas
          s.torches.forEach(t => {
            if (!t.lit && Math.hypot(p.x - t.x, p.y - t.y) < 50) {
              t.lit = true
              playSfx('torch')
              setTorchesLit(tl => {
                const count = tl + 1
                if (count >= 4) {
                  setStage(4)
                  setObjective('Fase 4: Você entrou na Cova dos Leões! O Anjo do Senhor fecha a boca das feras!')
                  p.x = 140
                  p.y = 300
                  s.angelHalo.active = true
                }
                return count
              })
              setScore(sc => sc + 50)
            }
          })
        } else if (stage === 4) {
          // Cova dos Leões - Preservação pacífica
          s.angelHalo.alpha = Math.min(1, s.angelHalo.alpha + delta * 0.8)
          s.lions.forEach(lion => {
            lion.breathe += delta * 2
          })
          if (s.angelHalo.alpha >= 0.95 && stage === 4) {
            setTimeout(() => {
              setStage(5)
              setObjective('Fase 5: O amanhecer chegou! Suba até a entrada para responder ao Rei Dario!')
              setScore(sc => sc + 150)
            }, 3000)
          }
        } else if (stage === 5) {
          // Romper da aurora e proclamação
          if (p.x > vw - 180) {
            handleSaveVictory()
          }
        }
      }

      // ==========================================
      // RENDERIZAÇÃO GRÁFICA TOP-DOWN
      // ==========================================
      ctx.clearRect(0, 0, vw, vh)

      // Fundo da Sala / Câmara de Pedra
      const floorGrad = ctx.createRadialGradient(vw / 2, vh / 2, 80, vw / 2, vh / 2, vw * 0.6)
      if (stage === 1) {
        floorGrad.addColorStop(0, '#1e293b') // Mármore Babilônico
        floorGrad.addColorStop(1, '#0f172a')
      } else if (stage === 2) {
        floorGrad.addColorStop(0, '#334155') // Aposento de Oração
        floorGrad.addColorStop(1, '#1e1b4b')
      } else if (stage === 3 || stage === 4) {
        floorGrad.addColorStop(0, '#1c1917') // Cova subterrânea
        floorGrad.addColorStop(1, '#0c0a09')
      } else {
        floorGrad.addColorStop(0, '#fef08a') // Amanhecer dourado
        floorGrad.addColorStop(1, '#78350f')
      }
      ctx.fillStyle = floorGrad
      ctx.fillRect(0, 0, vw, vh)

      // Paredes de Pedra
      ctx.fillStyle = '#1e293b'
      ctx.fillRect(40, 80, vw - 80, 20)
      ctx.fillRect(40, vh - 60, vw - 80, 20)
      ctx.fillRect(40, 80, 20, vh - 140)
      ctx.fillRect(vw - 60, 80, 20, vh - 140)

      // Grade decorativa de chão (Lajotas)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)'
      ctx.lineWidth = 1
      for (let x = 60; x < vw - 60; x += 64) {
        ctx.beginPath()
        ctx.moveTo(x, 100)
        ctx.lineTo(x, vh - 60)
        ctx.stroke()
      }
      for (let y = 100; y < vh - 60; y += 64) {
        ctx.beginPath()
        ctx.moveTo(60, y)
        ctx.lineTo(vw - 60, y)
        ctx.stroke()
      }

      // Elementos Específicos por Fase
      if (stage === 2) {
        // Janela Aberta para Jerusalém com Raios de Sol
        const winX = vw / 2
        const winY = 90
        ctx.fillStyle = '#38bdf8'
        ctx.fillRect(winX - 40, winY, 80, 16)
        ctx.fillStyle = 'rgba(254, 240, 138, 0.25)'
        ctx.beginPath()
        ctx.moveTo(winX - 40, winY + 16)
        ctx.lineTo(winX - 120, winY + 220)
        ctx.lineTo(winX + 120, winY + 220)
        ctx.lineTo(winX + 40, winY + 16)
        ctx.fill()

        ctx.fillStyle = '#fef08a'
        ctx.font = 'bold 13px sans-serif'
        ctx.fillText('🏛️ Janela voltada para Jerusalém (Fé)', winX - 110, winY + 45)
      } else if (stage === 3) {
        // Tochas nas Paredes
        s.torches.forEach(t => {
          ctx.fillStyle = t.lit ? '#f59e0b' : '#64748b'
          ctx.beginPath()
          ctx.arc(t.x, t.y, 8, 0, Math.PI * 2)
          ctx.fill()
          if (t.lit) {
            ctx.fillStyle = 'rgba(245, 158, 11, 0.25)'
            ctx.beginPath()
            ctx.arc(t.x, t.y, 45, 0, Math.PI * 2)
            ctx.fill()
          }
        })
      } else if (stage === 4 || stage === 5) {
        // Leões na Cova (Deitados / Pacíficos)
        s.lions.forEach((lion, i) => {
          const breatheOffset = Math.sin(lion.breathe) * 2
          ctx.fillStyle = '#b45309'
          ctx.beginPath()
          ctx.ellipse(lion.x, lion.y, 38 + breatheOffset, 24, 0, 0, Math.PI * 2)
          ctx.fill()
          // Juba do Leão
          ctx.fillStyle = '#78350f'
          ctx.beginPath()
          ctx.arc(lion.x - 24, lion.y, 18, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = '#fef3c7'
          ctx.font = '11px sans-serif'
          ctx.fillText(`🦁 Leão Manso #${i + 1}`, lion.x - 30, lion.y - 28)
        })

        // Luz do Anjo do Senhor (Halo Divino)
        if (s.angelHalo.active) {
          ctx.fillStyle = `rgba(254, 240, 138, ${s.angelHalo.alpha * 0.35})`
          ctx.beginPath()
          ctx.arc(p.x + 22, p.y + 30, 130, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = `rgba(255, 255, 255, ${s.angelHalo.alpha * 0.8})`
          ctx.beginPath()
          ctx.arc(p.x + 22, p.y - 15, 14, 0, Math.PI * 2)
          ctx.stroke()
          ctx.fillStyle = '#fff'
          ctx.font = 'bold 12px sans-serif'
          ctx.fillText('✨ Anjo do Senhor Protegendo', p.x - 60, p.y - 25)
        }
      }

      // Desenhar Daniel
      const imgs = imagesRef.current
      if (imgs.daniel) {
        const frameCol = Math.floor(p.animTimer % 8)
        const frameX = frameCol * 80
        const frameY = p.facing === 'down' ? 0 : p.facing === 'up' ? 220 : 110
        ctx.save()
        if (p.facing === 'left') {
          ctx.translate(p.x + p.width, p.y)
          ctx.scale(-1, 1)
          ctx.drawImage(imgs.daniel, frameX, frameY, 80, 110, 0, 0, p.width, p.height)
        } else {
          ctx.drawImage(imgs.daniel, frameX, frameY, 80, 110, p.x, p.y, p.width, p.height)
        }
        ctx.restore()
      } else {
        ctx.fillStyle = '#3b82f6'
        ctx.fillRect(p.x, p.y, p.width, p.height)
      }

      animationId = requestAnimationFrame(loop)
    }

    animationId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animationId)
  }, [stage, gameWon, handleSaveVictory])

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', userSelect: 'none', background: '#000', fontFamily: 'system-ui, sans-serif' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />

      {/* HUD Superior */}
      <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 14, alignItems: 'center', zIndex: 20 }}>
        <div style={{ background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', padding: '8px 16px', borderRadius: 999, border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fef08a', fontWeight: 'bold' }}>
          ⭐ {score} Pontos
        </div>
        <div style={{ background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', padding: '8px 16px', borderRadius: 999, border: '1px solid rgba(255, 255, 255, 0.15)', color: '#38bdf8', fontWeight: 600 }}>
          Fase {stage} de 5
        </div>
      </div>

      {/* Botão Sair */}
      <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 20 }}>
        <button
          onClick={onExit}
          style={{ background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#fff', borderRadius: 999, padding: '8px 16px', cursor: 'pointer', fontWeight: 600 }}
        >
          ✕ Sair
        </button>
      </div>

      {/* Toast de Missão */}
      <div style={{ position: 'absolute', bottom: 20, left: 20, maxWidth: 440, background: 'rgba(30, 41, 59, 0.95)', backdropFilter: 'blur(8px)', padding: '12px 18px', borderRadius: 16, border: '2px solid #38bdf8', color: '#f8fafc', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', zIndex: 20 }}>
        <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#38bdf8', marginBottom: 2 }}>Missão Atual</div>
        <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3 }}>{objective}</div>
      </div>

      {/* Controles Touch D-Pad */}
      <div style={{ position: 'absolute', bottom: 20, right: 20, display: 'grid', gridTemplateColumns: 'repeat(3, 50px)', gridTemplateRows: 'repeat(3, 50px)', gap: 6, zIndex: 25 }}>
        <div />
        <button
          onTouchStart={() => inputRef.current.up = true}
          onTouchEnd={() => inputRef.current.up = false}
          onMouseDown={() => inputRef.current.up = true}
          onMouseUp={() => inputRef.current.up = false}
          style={{ borderRadius: 12, background: 'rgba(30, 41, 59, 0.85)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', fontSize: 18, cursor: 'pointer' }}
        >
          ▲
        </button>
        <div />
        <button
          onTouchStart={() => inputRef.current.left = true}
          onTouchEnd={() => inputRef.current.left = false}
          onMouseDown={() => inputRef.current.left = true}
          onMouseUp={() => inputRef.current.left = false}
          style={{ borderRadius: 12, background: 'rgba(30, 41, 59, 0.85)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', fontSize: 18, cursor: 'pointer' }}
        >
          ◀
        </button>
        <button
          onTouchStart={() => inputRef.current.interact = true}
          onTouchEnd={() => inputRef.current.interact = false}
          onMouseDown={() => inputRef.current.interact = true}
          onMouseUp={() => inputRef.current.interact = false}
          style={{ borderRadius: 12, background: 'linear-gradient(135deg, #38bdf8, #0284c7)', color: '#fff', border: 'none', fontSize: 11, fontWeight: 'bold', cursor: 'pointer' }}
        >
          AÇÃO
        </button>
        <button
          onTouchStart={() => inputRef.current.right = true}
          onTouchEnd={() => inputRef.current.right = false}
          onMouseDown={() => inputRef.current.right = true}
          onMouseUp={() => inputRef.current.right = false}
          style={{ borderRadius: 12, background: 'rgba(30, 41, 59, 0.85)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', fontSize: 18, cursor: 'pointer' }}
        >
          ▶
        </button>
        <div />
        <button
          onTouchStart={() => inputRef.current.down = true}
          onTouchEnd={() => inputRef.current.down = false}
          onMouseDown={() => inputRef.current.down = true}
          onMouseUp={() => inputRef.current.down = false}
          style={{ borderRadius: 12, background: 'rgba(30, 41, 59, 0.85)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', fontSize: 18, cursor: 'pointer' }}
        >
          ▼
        </button>
        <div />
      </div>

      {/* Modal de Vitória Bíblica */}
      {gameWon && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 100, color: '#fff' }}>
          <div style={{ background: 'linear-gradient(180deg, #1e293b, #0f172a)', border: '2px solid #38bdf8', padding: '32px 40px', borderRadius: 28, maxWidth: 520, textAlign: 'center', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}>
            <div style={{ fontSize: 56, marginBottom: 8 }}>🦁</div>
            <h2 style={{ fontSize: 26, fontWeight: 900, color: '#38bdf8', margin: '0 0 10px 0' }}>Livramento Divino!</h2>
            <p style={{ fontSize: 15, color: '#94a3b8', margin: '0 0 16px 0', lineHeight: 1.5 }}>
              A fidelidade inabalável de Daniel na oração foi recompensada! O Senhor enviou o Seu anjo e guardou a sua vida diante dos leões!
            </p>
            <div style={{ background: 'rgba(56, 189, 248, 0.1)', borderLeft: '4px solid #38bdf8', padding: '12px 16px', borderRadius: 8, textAlign: 'left', margin: '0 0 24px 0', fontSize: 13, color: '#e0f2fe', fontStyle: 'italic', lineHeight: 1.4 }}>
              "O meu Deus enviou o seu anjo e fechou a boca dos leões, para que não me fizessem dano algum."
              <div style={{ fontWeight: 'bold', fontStyle: 'normal', marginTop: 4, color: '#38bdf8' }}>— Daniel 6:22</div>
            </div>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setGameWon(false)
                  setStage(1)
                  setTorchesLit(0)
                  setScore(0)
                  stateRef.current.player.x = 150
                  stateRef.current.player.y = 300
                  stateRef.current.angelHalo.active = false
                  stateRef.current.angelHalo.alpha = 0
                }}
                style={{ background: '#334155', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 14, fontWeight: 700, cursor: 'pointer' }}
              >
                Jogar Novamente
              </button>
              <button
                onClick={onExit}
                style={{ background: 'linear-gradient(135deg, #38bdf8, #0284c7)', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: 14, fontWeight: 800, cursor: 'pointer' }}
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
