import React, { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, Play, RotateCcw, Volume2, Trophy, ShieldAlert, Sparkles, X } from 'lucide-react'
import { GameDefinition } from '../../games/types'
import { tvInputController } from '../../services/TVInputController'
import { useTVSession } from '../../context/TVSessionContext'

// Game Engines locais
import AdventureRunnerEngine from '../../games/engines/AdventureRunnerEngine'
import MemoryEngine from '../../games/engines/MemoryEngine'
import CatchActionEngine from '../../games/engines/CatchActionEngine'
import PuzzleEngine from '../../games/engines/PuzzleEngine'
import MazeEngine from '../../games/engines/MazeEngine'
import SequenceStepEngine from '../../games/engines/SequenceStepEngine'

interface TVGameModalProps {
  game: GameDefinition
  onClose: () => void
}

export default function TVGameModal({ game, onClose }: TVGameModalProps) {
  const { checkParentalAccess } = useTVSession()
  const [accessBlocked, setAccessBlocked] = useState(false)
  const [blockMessage, setBlockMessage] = useState('')
  const [isPaused, setIsPaused] = useState(false)
  const [showHelperBanner, setShowHelperBanner] = useState(true)
  const [gameKey, setGameKey] = useState(0)

  // 1. Verificação de controle parental antes de abrir o jogo
  useEffect(() => {
    checkParentalAccess().then(res => {
      if (!res.allowed) {
        setAccessBlocked(true)
        if (res.reason === 'BEDTIME') {
          setBlockMessage('Hora de dormir! O Com Deus Kids já descansou até amanhã.')
        } else if (res.reason === 'DAILY_LIMIT') {
          setBlockMessage('Tempo de tela de hoje finalizado. Parabéns pelas atividades!')
        } else if (res.reason === 'PAUSED') {
          setBlockMessage('Este perfil está pausado temporariamente pelos responsáveis.')
        } else {
          setBlockMessage('Acesso restrito pelo controle parental.')
        }
      }
    })
  }, [checkParentalAccess])

  // 2. Banner de ajuda do controle remoto desaparece após 6 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHelperBanner(false)
    }, 6000)
    return () => clearTimeout(timer)
  }, [])

  // 3. Gerenciamento de Pausa e Troca entre GAME INPUT MODE e TV NAVIGATION MODE
  const handleOpenPauseMenu = useCallback(() => {
    setIsPaused(true)
    // No menu de pausa, voltar para modo de navegação com D-pad para escolher opções
    tvInputController.setMode('NAV')
  }, [])

  const handleResumeGame = useCallback(() => {
    setIsPaused(false)
    // Ao retomar o jogo, voltar para o GAME INPUT MODE
    tvInputController.setMode('GAME')
  }, [])

  const handleRestartGame = useCallback(() => {
    setGameKey(k => k + 1)
    setIsPaused(false)
    tvInputController.setMode('GAME')
  }, [])

  const handleExitGame = useCallback(() => {
    tvInputController.setMode('NAV')
    onClose()
  }, [onClose])

  // Escuta ações canônicas globais quando em pausa
  useEffect(() => {
    const unsubscribe = tvInputController.subscribe(action => {
      if (action === 'BACK' && !isPaused && !accessBlocked) {
        handleOpenPauseMenu()
      } else if (action === 'BACK' && isPaused) {
        handleResumeGame()
      }
    })

    return () => {
      unsubscribe()
    }
  }, [isPaused, accessBlocked, handleOpenPauseMenu, handleResumeGame])

  if (accessBlocked) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        className="cdk-tv-modal"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 6, 9, 0.96)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 40,
          color: '#fff',
          textAlign: 'center'
        }}
      >
        <ShieldAlert size={80} color="#f87171" style={{ marginBottom: 24 }} />
        <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>Acesso Bloqueado</h2>
        <p style={{ fontSize: 22, color: '#cbd5e1', maxWidth: 600, marginBottom: 32 }}>{blockMessage}</p>
        <button
          data-tv-focus
          autoFocus
          className="cdk-tv-btn cdk-tv-focus"
          onClick={handleExitGame}
          style={{
            padding: '16px 40px',
            background: '#22c55e',
            color: '#052e16',
            borderRadius: 16,
            fontSize: 20,
            fontWeight: 800,
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Voltar ao Catálogo
        </button>
      </div>
    )
  }

  // Renderizador dos motores de jogo
  const renderEngine = () => {
    const cfg = game.config || {}

    if (game.game_type === 'memory') {
      const pairs = cfg.pairs || [
        { key: 'leao', label: 'Leãozinho', emoji: '🦁' },
        { key: 'elefante', label: 'Elefante', emoji: '🐘' },
        { key: 'girafa', label: 'Girafa', emoji: '🦒' },
        { key: 'ovelha', label: 'Ovelhinha', emoji: '🐑' },
        { key: 'pomba', label: 'Pombinha', emoji: '🕊️' },
        { key: 'urso', label: 'Ursinho', emoji: '🐻' }
      ]
      return (
        <MemoryEngine
          key={gameKey}
          title={game.title}
          pairs={pairs}
          onComplete={() => {}}
          onExit={handleOpenPauseMenu}
        />
      )
    }

    if (game.game_type === 'puzzle') {
      return (
        <PuzzleEngine
          key={gameKey}
          title={game.title}
          targetIllustrationName={cfg.targetIllustrationName || 'Grande Arca de Madeira de Gofer'}
          pieces={cfg.pieces || [
            { id: 'p1', label: 'Quilha Base', emoji: '🪵', color: '#b45309' },
            { id: 'p2', label: 'Casco Lateral', emoji: '🚢', color: '#d97706' },
            { id: 'p3', label: 'Grande Janela', emoji: '🪟', color: '#0284c7' },
            { id: 'p4', label: 'Telhado Firme', emoji: '🏠', color: '#92400e' }
          ]}
          onComplete={() => {}}
          onExit={handleOpenPauseMenu}
        />
      )
    }

    if (game.game_type === 'maze') {
      return (
        <MazeEngine
          key={gameKey}
          title={game.title}
          characterName={cfg.characterName || 'Daniel'}
          characterEmoji={cfg.characterEmoji || '🏃'}
          exitEmoji={cfg.exitEmoji || '👼'}
          exitLabel={cfg.exitLabel || 'Anjo Protetor'}
          obstacleEmoji={cfg.obstacleEmoji || '🦁'}
          collectibleEmoji={cfg.collectibleEmoji || '⭐'}
          totalCollectibles={cfg.totalCollectibles || 3}
          faithMessage={cfg.faithMessage || 'Deus guarda os seus passos com amor e fidelidade!'}
          onComplete={() => {}}
          onExit={handleOpenPauseMenu}
        />
      )
    }

    if (game.game_type === 'sequence') {
      return (
        <SequenceStepEngine
          key={gameKey}
          title={game.title}
          narrativeGoal={cfg.narrativeGoal || game.description}
          steps={cfg.steps || []}
          onComplete={() => {}}
          onExit={handleOpenPauseMenu}
        />
      )
    }

    if (game.game_type === 'catch') {
      return (
        <CatchActionEngine
          key={gameKey}
          title={game.title}
          catcherEmoji={cfg.catcherEmoji || '🧺'}
          catcherName={cfg.catcherName || 'Cesto Seguro'}
          targetItemEmoji={cfg.targetItemEmoji || '✨'}
          targetItemName={cfg.targetItemName || 'Bênçãos'}
          targetCount={cfg.targetCount || 10}
          faithMessage={cfg.faithMessage || 'Deus cuida de cada detalhe com amor!'}
          onComplete={() => {}}
          onExit={handleOpenPauseMenu}
        />
      )
    }

    // Default Adventure Runner Engine (Davi, Zaqueu, Ovelha Perdida, etc.)
    return (
      <AdventureRunnerEngine
        key={gameKey}
        title={game.title}
        characterName={cfg.characterName || (game.slug.includes('davi') ? 'Davi' : 'Herói da Fé')}
        characterEmoji={cfg.characterEmoji || '👦'}
        targetItemsCount={cfg.targetItemsCount || 5}
        targetItemName={cfg.targetItemName || (game.slug.includes('davi') ? 'Pedras Lisas' : 'Sementes de Fé')}
        targetItemEmoji={cfg.targetItemEmoji || (game.slug.includes('davi') ? '🪨' : '✨')}
        bossName={cfg.bossName || (game.slug.includes('davi') ? 'Golias' : undefined)}
        bossEmoji={cfg.bossEmoji || (game.slug.includes('davi') ? '🛡️' : undefined)}
        faithMessage={cfg.faithMessage || 'A vitória não depende de tamanho ou força, mas do poder de Deus!'}
        onComplete={() => {}}
        onExit={handleOpenPauseMenu}
      />
    )
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="cdk-tv-modal cdk-tv-game-modal"
      data-tv-modal-active="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: '#06070a',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* 1. HUD SUPERIOR DE GUIA DO CONTROLE REMOTO */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 28px',
          background: 'linear-gradient(180deg, rgba(6,7,10,0.85) 0%, transparent 100%)',
          pointerEvents: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              background: '#22c55e',
              color: '#052e16',
              fontSize: 12,
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: 6,
              letterSpacing: 1
            }}
          >
            🎮 GAME INPUT MODE
          </span>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#f3f4f6' }}>{game.title}</span>
        </div>

        {/* Mapeamento de Teclas do Controle da TV */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            background: 'rgba(15, 17, 26, 0.75)',
            backdropFilter: 'blur(8px)',
            padding: '6px 14px',
            borderRadius: 20,
            fontSize: 13,
            color: '#e2e8f0',
            border: '1px solid rgba(255,255,255,0.08)'
          }}
        >
          <span>
            <strong style={{ color: '#22c55e' }}>← →</strong> Mover
          </span>
          <span>
            <strong style={{ color: '#38bdf8' }}>↑ / OK</strong> Ação / Pular
          </span>
          <span>
            <strong style={{ color: '#fbbf24' }}>BACK</strong> Pausar / Sair
          </span>
        </div>
      </div>

      {/* 2. BANNER DE BOAS-VINDAS COM INSTRUÇÃO TV (Auto-ocultado) */}
      {showHelperBanner && (
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 60,
            background: 'rgba(15, 17, 26, 0.95)',
            border: '2px solid #22c55e',
            boxShadow: '0 12px 40px rgba(34, 197, 94, 0.4)',
            padding: '16px 32px',
            borderRadius: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            animation: 'fadeIn 0.3s ease-out',
            pointerEvents: 'none'
          }}
        >
          <Sparkles size={28} color="#22c55e" />
          <div>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#fff' }}>
              Controle Remoto Conectado ao Jogo!
            </p>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#cbd5e1' }}>
              Use as setas para mover e o botão OK para pular ou executar ações. Aperte <strong>Voltar</strong> a qualquer momento para pausar.
            </p>
          </div>
        </div>
      )}

      {/* 3. MÁQUINA DE JOGO */}
      <div style={{ flex: 1, width: '100%', height: '100%' }}>{renderEngine()}</div>

      {/* 4. MODAL DE PAUSA DO JOGO (10-FOOT UI NAVEGÁVEL PELO CONTROLE) */}
      {isPaused && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(5, 6, 9, 0.9)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            padding: 30
          }}
        >
          <div
            style={{
              background: '#12141f',
              border: '2px solid #2d334d',
              borderRadius: 28,
              padding: '40px 50px',
              maxWidth: 520,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 24px 60px rgba(0,0,0,0.8)'
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'rgba(139, 92, 246, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20
              }}
            >
              <Trophy size={32} color="#22c55e" />
            </div>

            <h3 style={{ fontSize: 32, fontWeight: 800, margin: '0 0 10px', textAlign: 'center' }}>
              Jogo Pausado
            </h3>
            <p style={{ fontSize: 16, color: '#94a3b8', margin: '0 0 32px', textAlign: 'center' }}>
              {game.title} • Com Deus Kids
            </p>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <button
                data-tv-focus
                autoFocus
                className="cdk-tv-btn cdk-tv-focus"
                onClick={handleResumeGame}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  padding: '16px 24px',
                  borderRadius: 14,
                  background: '#22c55e',
                  color: '#052e16',
                  fontSize: 18,
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <Play size={20} fill="#052e16" />
                Continuar Jogando
              </button>

              <button
                data-tv-focus
                className="cdk-tv-btn cdk-tv-focus"
                onClick={handleRestartGame}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  padding: '16px 24px',
                  borderRadius: 14,
                  background: 'rgba(255,255,255,0.08)',
                  color: '#fff',
                  fontSize: 18,
                  fontWeight: 700,
                  border: '1px solid rgba(255,255,255,0.15)',
                  cursor: 'pointer'
                }}
              >
                <RotateCcw size={20} />
                Reiniciar Fase
              </button>

              <button
                data-tv-focus
                data-tv-back-btn
                className="cdk-tv-btn cdk-tv-focus"
                onClick={handleExitGame}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  padding: '16px 24px',
                  borderRadius: 14,
                  background: 'transparent',
                  color: '#f87171',
                  fontSize: 18,
                  fontWeight: 700,
                  border: '1px solid rgba(248, 113, 113, 0.3)',
                  cursor: 'pointer'
                }}
              >
                <ArrowLeft size={20} />
                Sair para a TV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
