import React, { useState, useEffect } from 'react'
import {
  Play, Pause, RotateCcw, Volume2, VolumeX,
  Maximize2, Minimize2, Award, CheckCircle2, ChevronRight, X
} from 'lucide-react'
import { soundEffects } from '../audio/AudioManager'

export interface AchievementItem {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  progressPercent: number
}

interface GameShellProps {
  title: string
  subtitle: string
  coverUrl: string
  logoText?: string
  themeColor?: string
  achievements?: AchievementItem[]
  onRestart?: () => void
  onExit?: () => void
  children: (props: {
    isPaused: boolean
    isMuted: boolean
    score: number
    lives: number
    setScore: React.Dispatch<React.SetStateAction<number>>
    setLives: React.Dispatch<React.SetStateAction<number>>
    triggerVictory: (finalScore: number) => void
    triggerGameOver: () => void
  }) => React.ReactNode
}

export default function GameShell({
  title,
  subtitle,
  coverUrl,
  logoText,
  themeColor = '#f59e0b',
  achievements = [],
  onRestart,
  onExit,
  children
}: GameShellProps) {
  // Estados da Máquina de Estados do Jogo
  const [gameState, setGameState] = useState<'loading' | 'menu' | 'countdown' | 'playing' | 'paused' | 'victory' | 'gameover'>('loading')
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [countdownNum, setCountdownNum] = useState(3)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMuted, setIsMuted] = useState(soundEffects.isMuted())
  const [showAwardsModal, setShowAwardsModal] = useState(false)

  // Estatísticas durante o jogo
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [finalScore, setFinalScore] = useState(0)

  // 1. Simulação do Splash Loading (0% a 100% como no Subway Surfers / Poki)
  useEffect(() => {
    let current = 0
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 18) + 12
      if (current >= 100) {
        current = 100
        setLoadingProgress(100)
        clearInterval(interval)
        setTimeout(() => setGameState('menu'), 400)
      } else {
        setLoadingProgress(current)
      }
    }, 80)
    return () => clearInterval(interval)
  }, [])

  // 2. Contagem Regressiva para Iniciar (3, 2, 1, VAI!)
  const handleStartGame = () => {
    soundEffects.playCardFlip()
    setGameState('countdown')
    setCountdownNum(3)

    let count = 3
    const interval = setInterval(() => {
      count -= 1
      if (count <= 0) {
        clearInterval(interval)
        setCountdownNum(0)
        soundEffects.playSnap()
        setTimeout(() => setGameState('playing'), 400)
      } else {
        soundEffects.playCardFlip()
        setCountdownNum(count)
      }
    }, 700)
  }

  // 3. Controle de Pausa
  const togglePause = () => {
    if (gameState === 'playing') {
      setGameState('paused')
    } else if (gameState === 'paused') {
      setGameState('playing')
    }
  }

  // 4. Controle de Som
  const toggleMute = () => {
    const next = !isMuted
    setIsMuted(next)
    soundEffects.setMuted(next)
  }

  // 5. Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setIsFullscreen(false)
    }
  }

  // 6. Triggers de Vitória e Game Over
  const triggerVictory = (points: number) => {
    setFinalScore(points)
    soundEffects.playVictory()
    setGameState('victory')
  }

  const triggerGameOver = () => {
    setFinalScore(score)
    setGameState('gameover')
  }

  const handleRestart = () => {
    setScore(0)
    setLives(3)
    onRestart?.()
    handleStartGame()
  }

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#07080d',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      userSelect: 'none',
      overflow: 'hidden',
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
    }}>
      {/* ============================================================ */}
      {/* TELA 1: LOADING SPLASH SCREEN (ESTILO SUBWAY SURFERS / POKI)   */}
      {/* ============================================================ */}
      {gameState === 'loading' && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, #0f172a 0%, #020617 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          {/* Logo / Arte Central */}
          <div style={{
            fontSize: 'clamp(36px, 6vw, 64px)',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            textTransform: 'uppercase',
            color: '#ffffff',
            textShadow: '0 8px 30px rgba(0, 0, 0, 0.8), 0 0 40px #f59e0b',
            marginBottom: 32,
            textAlign: 'center'
          }}>
            {logoText || title}
          </div>

          <div style={{ fontSize: 14, color: '#94a3b8', fontWeight: 700, marginBottom: 16 }}>
            CARREGANDO MUNDO BÍBLICO...
          </div>

          {/* Barra de Porcentagem 0-100% */}
          <div style={{
            width: 'clamp(240px, 50vw, 420px)',
            height: 24,
            background: 'rgba(0, 0, 0, 0.7)',
            borderRadius: 9999,
            padding: 3,
            border: '2px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${loadingProgress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
              borderRadius: 9999,
              transition: 'width 0.1s ease',
              boxShadow: '0 0 15px #f59e0b'
            }} />
            <span style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 900,
              color: '#ffffff',
              textShadow: '0 1px 2px #000'
            }}>
              {loadingProgress}%
            </span>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TELA 2: MENU PRINCIPAL (PRESS TO PLAY, AWARDS, CONFIGURAÇÕES) */}
      {/* ============================================================ */}
      {gameState === 'menu' && (
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${coverUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'clamp(20px, 4vw, 48px)',
          boxSizing: 'border-box',
          zIndex: 90
        }}>
          {/* Overlay escuro elegante */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.5) 0%, rgba(2, 6, 23, 0.85) 100%)',
            backdropFilter: 'blur(4px)'
          }} />

          {/* Top Bar do Menu */}
          <div style={{
            position: 'relative',
            zIndex: 2,
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <button
              onClick={onExit}
              style={{
                padding: '8px 16px',
                borderRadius: 12,
                background: 'rgba(0, 0, 0, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#fff',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              ← Voltar
            </button>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={toggleMute}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'rgba(0, 0, 0, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <button
                onClick={toggleFullscreen}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'rgba(0, 0, 0, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </button>
            </div>
          </div>

          {/* Centro: Título do Jogo e Botão Principal PRESS TO PLAY */}
          <div style={{
            position: 'relative',
            zIndex: 2,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <div style={{
              fontSize: 'clamp(38px, 7vw, 76px)',
              fontWeight: 900,
              textTransform: 'uppercase',
              color: '#ffffff',
              letterSpacing: '-0.02em',
              textShadow: '0 8px 40px rgba(0,0,0,0.8), 0 0 30px #f59e0b',
              lineHeight: 1
            }}>
              {logoText || title}
            </div>

            <p style={{
              fontSize: 'clamp(14px, 2vw, 18px)',
              color: '#cbd5e1',
              fontWeight: 600,
              margin: '12px 0 36px 0',
              maxWidth: 480
            }}>
              {subtitle}
            </p>

            {/* BOTÃO PRESS TO PLAY */}
            <button
              onClick={handleStartGame}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 14,
                padding: '18px 48px',
                borderRadius: 9999,
                background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
                color: '#000000',
                fontSize: 'clamp(20px, 3vw, 26px)',
                fontWeight: 900,
                border: '4px solid #fef3c7',
                cursor: 'pointer',
                boxShadow: '0 12px 36px rgba(245, 158, 11, 0.6), inset 0 2px 4px #ffffff',
                transform: 'scale(1)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.06)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <Play size={28} fill="#000" /> PRESS TO PLAY
            </button>
          </div>

          {/* Rodapé: Botões de Conquistas (Awards), Missões e Loja/Personagens */}
          <div style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            gap: 16,
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <button
              onClick={() => setShowAwardsModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 24px',
                borderRadius: 16,
                background: 'rgba(30, 41, 59, 0.85)',
                border: '2px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontSize: 14,
                fontWeight: 800,
                cursor: 'pointer',
                backdropFilter: 'blur(10px)'
              }}
            >
              <Award size={20} color="#fbbf24" /> CONQUISTAS (AWARDS)
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TELA 3: CONTAGEM REGRESSIVA 3, 2, 1, VAI!                     */}
      {/* ============================================================ */}
      {gameState === 'countdown' && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 80
        }}>
          <div style={{
            fontSize: 'clamp(90px, 18vw, 180px)',
            fontWeight: 900,
            color: countdownNum === 0 ? '#10b981' : '#fbbf24',
            textShadow: '0 0 40px currentColor',
            animation: 'pulse 0.6s infinite alternate'
          }}>
            {countdownNum === 0 ? 'VAI!' : countdownNum}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* HUD SUPERIOR DURANTE O GAMEPLAY (VIDAS, PONTUAÇÃO, PAUSE)    */}
      {/* ============================================================ */}
      {(gameState === 'playing' || gameState === 'paused') && (
        <header style={{
          position: 'absolute',
          top: 14,
          left: 14,
          right: 14,
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 50,
          pointerEvents: 'none'
        }}>
          {/* Vidas ❤️❤️❤️ */}
          <div style={{
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255, 255, 255, 0.15)',
            padding: '8px 16px',
            borderRadius: 9999,
            fontSize: 22
          }}>
            {[1, 2, 3].map(heartIdx => (
              <span key={heartIdx} style={{ opacity: heartIdx <= lives ? 1 : 0.25, transition: 'opacity 0.2s' }}>
                ❤️
              </span>
            ))}
          </div>

          {/* Pontuação Dinâmica */}
          <div style={{
            pointerEvents: 'auto',
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(251, 191, 36, 0.4)',
            padding: '8px 24px',
            borderRadius: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <span style={{ fontSize: 13, color: '#fbbf24', fontWeight: 800 }}>PONTOS</span>
            <span style={{ fontSize: 22, color: '#ffffff', fontWeight: 900, minWidth: 60, textAlign: 'right' }}>
              {score}
            </span>
          </div>

          {/* Ações (Pausa, Mudo, Fullscreen) */}
          <div style={{ pointerEvents: 'auto', display: 'flex', gap: 8 }}>
            <button
              onClick={toggleMute}
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: 'rgba(0, 0, 0, 0.65)',
                border: '2px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <button
              onClick={togglePause}
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: 'rgba(0, 0, 0, 0.65)',
                border: '2px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Pause size={18} />
            </button>
          </div>
        </header>
      )}

      {/* ============================================================ */}
      {/* GAMEPLAY REAL (RENDERIZADO PELA ENGINE DO JOGO)              */}
      {/* ============================================================ */}
      <main style={{ flex: 1, position: 'relative', width: '100%', height: '100%' }}>
        {children({
          isPaused: gameState !== 'playing',
          isMuted,
          score,
          lives,
          setScore,
          setLives,
          triggerVictory,
          triggerGameOver
        })}
      </main>

      {/* ============================================================ */}
      {/* MODAL: JOGO PAUSADO                                          */}
      {/* ============================================================ */}
      {gameState === 'paused' && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 80
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e293b, #0f172a)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 28,
            padding: 36,
            textAlign: 'center',
            maxWidth: 380,
            width: '90%'
          }}>
            <h3 style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: '0 0 8px 0' }}>
              Jogo Pausado ⏸
            </h3>
            <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 24px 0' }}>
              Respire fundo e continue sua aventura!
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                onClick={() => setGameState('playing')}
                style={{
                  padding: '14px',
                  borderRadius: 14,
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  fontSize: 16,
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                ▶ Continuar
              </button>
              <button
                onClick={handleRestart}
                style={{
                  padding: '14px',
                  borderRadius: 14,
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  border: 'none',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                ↻ Recomeçar
              </button>
              <button
                onClick={() => setGameState('menu')}
                style={{
                  padding: '14px',
                  borderRadius: 14,
                  background: 'transparent',
                  color: '#f87171',
                  border: 'none',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                🚪 Sair do Jogo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: CONQUISTAS (AWARDS) ESTILO SUBWAY SURFERS             */}
      {/* ============================================================ */}
      {showAwardsModal && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
            borderRadius: 24,
            padding: 24,
            maxWidth: 480,
            width: '90%',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
            color: '#0f172a'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Award size={28} color="#d97706" />
                <h3 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>Conquistas (Awards)</h3>
              </div>
              <button
                onClick={() => setShowAwardsModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {achievements.map(ach => (
                <div key={ach.id} style={{
                  background: '#ffffff',
                  borderRadius: 16,
                  padding: 14,
                  border: '1px solid #cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14
                }}>
                  <div style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: ach.unlocked ? '#fef3c7' : '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 26
                  }}>
                    {ach.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: '#0f172a' }}>{ach.title}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{ach.description}</div>
                    {/* Barra de Progresso da Conquista */}
                    <div style={{
                      height: 6,
                      background: '#e2e8f0',
                      borderRadius: 9999,
                      marginTop: 6,
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${ach.progressPercent}%`,
                        height: '100%',
                        background: '#f59e0b'
                      }} />
                    </div>
                  </div>
                  {ach.unlocked && <CheckCircle2 size={24} color="#10b981" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TELA DE VITÓRIA / RESULTADO FINAL                             */}
      {/* ============================================================ */}
      {gameState === 'victory' && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 80
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e293b, #0f172a)',
            border: '3px solid #fbbf24',
            borderRadius: 32,
            padding: 40,
            textAlign: 'center',
            maxWidth: 420,
            width: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.8)'
          }}>
            <div style={{ fontSize: 60, marginBottom: 8 }}>🏆</div>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: '#fff', margin: '0 0 6px 0' }}>
              VOCÊ VENCEU!
            </h2>
            <p style={{ color: '#94a3b8', fontSize: 15, margin: '0 0 20px 0' }}>
              Glória a Deus por sua coragem e sabedoria!
            </p>
            <div style={{ fontSize: 36, marginBottom: 20 }}>⭐⭐⭐</div>

            <div style={{
              background: 'rgba(0, 0, 0, 0.4)',
              borderRadius: 16,
              padding: 16,
              marginBottom: 24
            }}>
              <span style={{ fontSize: 13, color: '#fbbf24', fontWeight: 800 }}>PONTUAÇÃO FINAL</span>
              <div style={{ fontSize: 36, fontWeight: 900, color: '#fff' }}>{finalScore}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                onClick={handleRestart}
                style={{
                  padding: '16px',
                  borderRadius: 16,
                  background: 'linear-gradient(135deg, #fbbf24, #d97706)',
                  color: '#000',
                  fontSize: 16,
                  fontWeight: 900,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Jogar Novamente
              </button>
              <button
                onClick={() => setGameState('menu')}
                style={{
                  padding: '12px',
                  borderRadius: 16,
                  background: 'transparent',
                  color: '#94a3b8',
                  fontSize: 14,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Voltar ao Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TELA DE GAME OVER (NÃO DESISTA!)                             */}
      {/* ============================================================ */}
      {gameState === 'gameover' && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.92)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 80
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e1b4b, #0f172a)',
            border: '2px solid #ef4444',
            borderRadius: 32,
            padding: 40,
            textAlign: 'center',
            maxWidth: 400,
            width: '90%'
          }}>
            <div style={{ fontSize: 60, marginBottom: 8 }}>💪</div>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: '0 0 6px 0' }}>
              NÃO DESISTA!
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: 14, margin: '0 0 24px 0' }}>
              "O Senhor é a minha força e o meu escudo." Tente mais uma vez!
            </p>

            <button
              onClick={handleRestart}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: 16,
                background: '#2563eb',
                color: '#fff',
                fontSize: 16,
                fontWeight: 900,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
