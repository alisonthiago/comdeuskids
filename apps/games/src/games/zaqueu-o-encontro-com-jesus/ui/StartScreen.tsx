import React, { useState } from 'react'
import { Play, BookOpen, Settings, Volume2, VolumeX } from 'lucide-react'
import { audioManager, AudioVolumes } from '@comdeuskids/game-core'

interface StartScreenProps {
  onPlay: () => void
}

export function StartScreen({ onPlay }: StartScreenProps) {
  const [activeModal, setActiveModal] = useState<'none' | 'history' | 'settings'>('none')
  const [volumes, setVolumes] = useState<AudioVolumes>(() => audioManager.getVolumes())

  const handleStartGame = () => {
    audioManager.init()
    audioManager.playSFX('ui_confirm')
    onPlay()
  }

  const handleVolumeChange = (channel: keyof Omit<AudioVolumes, 'muted'>, val: number) => {
    audioManager.setVolume(channel, val)
    setVolumes(audioManager.getVolumes())
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 60,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, rgba(12, 13, 20, 0.4) 0%, rgba(12, 13, 20, 0.85) 100%)',
        backdropFilter: 'blur(3px)',
        userSelect: 'none',
        padding: 24,
        fontFamily: "'Inter', sans-serif"
      }}
    >
      {/* CABEÇALHO */}
      <div
        style={{
          fontSize: 'clamp(11px, 1.8vw, 15px)',
          fontWeight: 900,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: '#fef08a',
          textShadow: '0 2px 10px rgba(0,0,0,0.8)',
          marginBottom: 12
        }}
      >
        COM DEUS KIDS APRESENTA
      </div>

      {/* LOGO OFICIAL DO JOGO EM PNG */}
      <div style={{ marginBottom: 28, maxWidth: 'min(90vw, 540px)', textAlign: 'center' }}>
        <img
          src="/assets/zaqueu/zaqueu_logo.png"
          alt="Zaqueu — O Encontro com Jesus"
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: 240,
            objectFit: 'contain',
            filter: 'drop-shadow(0 15px 35px rgba(0,0,0,0.7))'
          }}
        />
      </div>

      {/* BOTÕES PRINCIPAIS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%', maxWidth: 320 }}>
        {/* BOTÃO JOGAR PRINCIPAL */}
        <button
          onClick={handleStartGame}
          style={{
            padding: '16px 28px',
            borderRadius: 20,
            background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
            color: '#ffffff',
            border: '3px solid rgba(255, 255, 255, 0.8)',
            boxShadow: '0 10px 30px rgba(34, 197, 94, 0.6)',
            fontSize: 22,
            fontWeight: 900,
            letterSpacing: '0.06em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            cursor: 'pointer',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.05)'
            e.currentTarget.style.boxShadow = '0 12px 35px rgba(34, 197, 94, 0.8)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1.0)'
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(34, 197, 94, 0.6)'
          }}
        >
          <Play size={24} fill="#ffffff" />
          <span>JOGAR</span>
        </button>

        {/* HISTÓRIA BÍBLICA */}
        <button
          onClick={() => {
            audioManager.playSFX('ui_click')
            setActiveModal('history')
          }}
          style={{
            padding: '12px 20px',
            borderRadius: 16,
            background: 'rgba(255, 255, 255, 0.12)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(8px)',
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: '0.04em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            cursor: 'pointer'
          }}
        >
          <BookOpen size={18} />
          <span>HISTÓRIA BÍBLICA</span>
        </button>

        {/* CONFIGURAÇÕES */}
        <button
          onClick={() => {
            audioManager.playSFX('ui_click')
            setActiveModal('settings')
          }}
          style={{
            padding: '12px 20px',
            borderRadius: 16,
            background: 'rgba(255, 255, 255, 0.12)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(8px)',
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: '0.04em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            cursor: 'pointer'
          }}
        >
          <Settings size={18} />
          <span>CONFIGURAÇÕES</span>
        </button>
      </div>

      {/* MODAL: HISTÓRIA BÍBLICA (LUCAS 19:1-10 ESTILO PERGAMINHO) */}
      {activeModal === 'history' && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(5, 7, 15, 0.85)',
            backdropFilter: 'blur(10px)',
            zIndex: 70,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 520,
              backgroundColor: '#fef3c7',
              border: '3px solid #d97706',
              borderRadius: 24,
              padding: 28,
              boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
              color: '#78350f',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#92400e' }}>
                📖 Lucas 19:1–10
              </h3>
              <span style={{ fontSize: 13, fontWeight: 700, backgroundColor: '#fde68a', padding: '4px 10px', borderRadius: 999 }}>
                Jericó
              </span>
            </div>

            <p style={{ fontSize: 15, lineHeight: 1.6, margin: '0 0 14px 0', color: '#451a03' }}>
              “Jesus estava passando pela cidade de Jericó. Zaqueu, um homem de baixa estatura, queria muito vê-Lo,
              mas não conseguia por causa da grande multidão.”
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.6, margin: '0 0 20px 0', color: '#451a03' }}>
              “Então ele correu adiante e subiu em uma figueira brava para conseguir enxergá-Lo. Ao chegar àquele lugar,
              Jesus olhou para cima e disse: <i>‘Zaqueu, desça depressa, pois hoje me convém ficar em sua casa!’</i>”
            </p>

            <button
              onClick={() => setActiveModal('none')}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 14,
                backgroundColor: '#d97706',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              FECHAR
            </button>
          </div>
        </div>
      )}

      {/* MODAL: CONFIGURAÇÕES DE ÁUDIO */}
      {activeModal === 'settings' && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(5, 7, 15, 0.85)',
            backdropFilter: 'blur(10px)',
            zIndex: 70,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 440,
              background: 'linear-gradient(145deg, #1e1b4b 0%, #0f172a 100%)',
              border: '2px solid rgba(251, 191, 36, 0.5)',
              borderRadius: 24,
              padding: 28,
              boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
              color: '#ffffff',
              textAlign: 'left'
            }}
          >
            <h3 style={{ margin: '0 0 20px 0', fontSize: 20, fontWeight: 900, color: '#fbbf24' }}>
              ⚙️ Ajustes de Som
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span>Volume Geral</span>
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
                  <span>Música Instrumental</span>
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
                  <span>Efeitos Sonoros</span>
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

              <button
                onClick={() => setActiveModal('none')}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 14,
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 800,
                  cursor: 'pointer',
                  marginTop: 10
                }}
              >
                SALVAR E VOLTAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
