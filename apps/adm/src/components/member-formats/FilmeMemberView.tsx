import React, { useState } from 'react'
import { Film, Play, HeartHandshake, Clock, ShieldCheck, Download, Share2, Sparkles, MessageSquare } from 'lucide-react'

export default function FilmeMemberView({
  productId,
  productTitle,
  activeTab
}: {
  productId: string
  productTitle: string
  activeTab: string
}) {
  const [isPlaying, setIsPlaying] = useState(false)

  if (activeTab === 'guia') {
    return (
      <div style={{ marginTop: 20, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 26 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <HeartHandshake size={20} color="#2563eb" /> Guia de Conversa para a Família
            </h3>
            <small style={{ color: '#64748b' }}>Perguntas práticas para os pais conversarem com as crianças após assistirem ao filme</small>
          </div>
          <button
            onClick={() => alert('Baixando Guia da Família em PDF')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#eff4fe', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            <Download size={14} /> Baixar Guia em PDF
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 14 }}>
          <div style={{ background: '#f8fafc', borderLeft: '4px solid #3b82f6', padding: '14px 18px', borderRadius: '0 8px 8px 0' }}>
            <b style={{ color: '#1e3a8a', fontSize: 14 }}>1. O que mais chamou sua atenção na atitude do personagem principal?</b>
            <p style={{ fontSize: 13, color: '#475569', margin: '6px 0 0' }}>
              Deixe a criança expressar o sentimento dela sobre a coragem e obediência demonstrada.
            </p>
          </div>

          <div style={{ background: '#f8fafc', borderLeft: '4px solid #10b981', padding: '14px 18px', borderRadius: '0 8px 8px 0' }}>
            <b style={{ color: '#065f46', fontSize: 14 }}>2. Quando as coisas pareciam difíceis, em quem ele colocou a esperança?</b>
            <p style={{ fontSize: 13, color: '#475569', margin: '6px 0 0' }}>
              Relembre com os pequenos que mesmo no momento de maior medo, Deus nunca nos abandona.
            </p>
          </div>

          <div style={{ background: '#f8fafc', borderLeft: '4px solid #8b5cf6', padding: '14px 18px', borderRadius: '0 8px 8px 0' }}>
            <b style={{ color: '#4c1d95', fontSize: 14 }}>3. Oração em família para encerrar</b>
            <p style={{ fontSize: 13, color: '#475569', margin: '6px 0 0' }}>
              Deem as mãos e façam uma oração simples agradecendo a Deus pela lição aprendida juntos.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ marginTop: 20 }}>
      {/* Player de Cinema Estilo Sala de Exibição */}
      <div
        style={{
          background: '#090d16',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 12px 30px rgba(0,0,0,0.25)'
        }}
      >
        <div
          style={{
            position: 'relative',
            paddingTop: '46%',
            background: 'linear-gradient(180deg, #111827 0%, #030712 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {!isPlaying ? (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                textAlign: 'center',
                padding: 20
              }}
            >
              <button
                onClick={() => setIsPlaying(true)}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: '#2563eb',
                  border: '4px solid rgba(255,255,255,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  marginBottom: 14,
                  boxShadow: '0 0 20px rgba(37,99,235,0.6)'
                }}
              >
                <Play size={32} fill="#fff" color="#fff" style={{ marginLeft: 4 }} />
              </button>
              <span style={{ fontSize: 16, fontWeight: 700 }}>Assistir ao Filme Completo</span>
              <small style={{ color: '#94a3b8', marginTop: 4 }}>Qualidade Full HD 1080p · Áudio em Português</small>
            </div>
          ) : (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <Film size={48} color="#3b82f6" style={{ margin: '0 auto 10px' }} />
                <p style={{ fontSize: 15, fontWeight: 600 }}>Reproduzindo Filme Bíblico...</p>
                <button
                  onClick={() => setIsPlaying(false)}
                  style={{ marginTop: 10, padding: '6px 14px', borderRadius: 6, background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12 }}
                >
                  Pausar Player
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Barra de Informações do Filme */}
        <div style={{ padding: '16px 22px', background: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#38bdf8' }}>
              Cinema Com Deus Kids
            </span>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '2px 0 0' }}>{productTitle || 'Filme Bíblico'}</h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12, color: '#cbd5e1' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={14} color="#94a3b8" /> 1h 24m
            </span>
            <span>·</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#10b981', color: '#fff', padding: '1px 6px', borderRadius: 4, fontWeight: 700, fontSize: 11 }}>
              LIVRE
            </span>
            <span>·</span>
            <span>Áudio Estéreo 2.0</span>
          </div>
        </div>
      </div>
    </div>
  )
}
