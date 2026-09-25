import React, { useState } from 'react'
import { audioManager, AudioVolumes } from '@comdeuskids/game-core'
import { Play, RotateCcw, HelpCircle, Volume2, VolumeX, LogOut } from 'lucide-react'

interface PauseModalProps {
  isOpen: boolean
  onResume: () => void
  onRestart: () => void
  onExit: () => void
}

export function PauseModal({ isOpen, onResume, onRestart, onExit }: PauseModalProps) {
  const [activeTab, setActiveTab] = useState<'menu' | 'audio' | 'controls'>('menu')
  const [volumes, setVolumes] = useState<AudioVolumes>(() => audioManager.getVolumes())

  if (!isOpen) return null

  const handleVolumeChange = (channel: keyof Omit<AudioVolumes, 'muted'>, val: number) => {
    audioManager.setVolume(channel, val)
    setVolumes(audioManager.getVolumes())
  }

  const handleToggleMute = () => {
    const next = !volumes.muted
    audioManager.setMuted(next)
    setVolumes(audioManager.getVolumes())
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 7, 15, 0.85)',
        backdropFilter: 'blur(12px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        fontFamily: "'Inter', sans-serif",
        color: '#ffffff'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          background: 'linear-gradient(145deg, #1e1b4b 0%, #0f172a 100%)',
          borderRadius: 28,
          border: '2px solid rgba(251, 191, 36, 0.4)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
          padding: 32,
          textAlign: 'center',
          boxSizing: 'border-box'
        }}
      >
        <h2
          style={{
            fontSize: 26,
            fontWeight: 900,
            letterSpacing: '0.04em',
            margin: '0 0 24px 0',
            color: '#fbbf24',
            textShadow: '0 2px 10px rgba(245, 158, 11, 0.4)'
          }}
        >
          {activeTab === 'menu' && 'JOGO PAUSADO'}
          {activeTab === 'audio' && 'AJUSTES DE ÁUDIO'}
          {activeTab === 'controls' && 'COMO JOGAR'}
        </h2>

        {/* ABA: MENU PRINCIPAL */}
        {activeTab === 'menu' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <button
              onClick={onResume}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                padding: '14px 20px',
                borderRadius: 16,
                backgroundColor: '#22c55e',
                color: '#ffffff',
                border: 'none',
                fontSize: 16,
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(34, 197, 94, 0.4)',
                transition: 'transform 0.15s ease'
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.02)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1.0)')}
            >
              <Play size={20} fill="#ffffff" />
              CONTINUAR
            </button>

            <button
              onClick={onRestart}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                padding: '14px 20px',
                borderRadius: 16,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={18} />
              RECOMEÇAR FASE
            </button>

            <button
              onClick={() => setActiveTab('controls')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                padding: '14px 20px',
                borderRadius: 16,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <HelpCircle size={18} />
              COMO JOGAR
            </button>

            <button
              onClick={() => setActiveTab('audio')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                padding: '14px 20px',
                borderRadius: 16,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Volume2 size={18} />
              ÁUDIO & SONS
            </button>

            <button
              onClick={onExit}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                padding: '14px 20px',
                borderRadius: 16,
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                marginTop: 6
              }}
            >
              <LogOut size={18} />
              SAIR DO JOGO
            </button>
          </div>
        )}

        {/* ABA: CONTROLES */}
        {activeTab === 'controls' && (
          <div style={{ textAlign: 'left', fontSize: 14, color: '#cbd5e1', lineHeight: 1.6 }}>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontWeight: 800, color: '#fbbf24', marginBottom: 4 }}>💻 No Computador:</div>
              <div>• <b>WASD</b> ou <b>Setas</b>: Andar por Jericó</div>
              <div>• <b>Shift</b>: Correr com poeira</div>
              <div>• <b>Espaço</b>: Pular</div>
              <div>• <b>Mouse / Arrasto</b>: Girar câmera 360°</div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={{ fontWeight: 800, color: '#fbbf24', marginBottom: 4 }}>📱 No Celular / Tablet:</div>
              <div>• <b>Joystick à esquerda</b>: Mover Zaqueu</div>
              <div>• <b>Botão Pular à direita</b>: Salto</div>
              <div>• <b>Deslizar na tela</b>: Mudar ângulo da visão</div>
            </div>

            <button
              onClick={() => setActiveTab('menu')}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 14,
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              VOLTAR
            </button>
          </div>
        )}

        {/* ABA: ÁUDIO */}
        {activeTab === 'audio' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'left' }}>
            {/* MUTE GERAL */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700 }}>Silenciar Todos os Sons</span>
              <button
                onClick={handleToggleMute}
                style={{
                  padding: '8px 16px',
                  borderRadius: 12,
                  backgroundColor: volumes.muted ? '#ef4444' : '#334155',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                {volumes.muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                {volumes.muted ? 'Mudo Ativado' : 'Som Ativo'}
              </button>
            </div>

            {/* SLIDERS */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span>Som Geral (Master)</span>
                <span>{volumes.master}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={volumes.master}
                onChange={e => handleVolumeChange('master', Number(e.target.value))}
                style={{ width: '100%', accentColor: '#fbbf24' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span>Música de Fundo</span>
                <span>{volumes.music}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={volumes.music}
                onChange={e => handleVolumeChange('music', Number(e.target.value))}
                style={{ width: '100%', accentColor: '#fbbf24' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span>Efeitos Sonoros (Passos, Pulo, Coleta)</span>
                <span>{volumes.sfx}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={volumes.sfx}
                onChange={e => handleVolumeChange('sfx', Number(e.target.value))}
                style={{ width: '100%', accentColor: '#fbbf24' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span>Ambiente (Vento, Pássaros, Ovelhas)</span>
                <span>{volumes.ambience}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={volumes.ambience}
                onChange={e => handleVolumeChange('ambience', Number(e.target.value))}
                style={{ width: '100%', accentColor: '#fbbf24' }}
              />
            </div>

            <button
              onClick={() => setActiveTab('menu')}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 14,
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                cursor: 'pointer',
                marginTop: 8
              }}
            >
              VOLTAR AO MENU
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
