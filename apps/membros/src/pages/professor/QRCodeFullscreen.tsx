import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  QrCode, Copy, Check, Tv, ArrowRight,
  Sparkles, Users, X, Play, RefreshCw
} from 'lucide-react'

export function QRCodeFullscreen() {
  const navigate = useNavigate()
  const [accessCode, setAccessCode] = useState('482 731')
  const [copied, setCopied] = useState(false)
  const [connectedStudents, setConnectedStudents] = useState([
    { name: 'Arthur M.', initial: 'A', bg: 'var(--s-primary)', color: '#fff' },
    { name: 'Sofia Ramos', initial: 'S', bg: 'var(--s-success)', color: '#fff' },
    { name: 'Lucas G.', initial: 'L', bg: '#2563EB', color: '#fff' },
    { name: 'Maria Alice', initial: 'M', bg: '#7C3AED', color: '#fff' },
    { name: 'Davi Lucas', initial: 'D', bg: '#D97706', color: '#fff' },
    { name: 'Ester F.', initial: 'E', bg: '#DB2777', color: '#fff' },
  ])

  const copyCode = () => {
    navigator.clipboard.writeText(accessCode.replace(/\s+/g, ''))
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFD', padding: '32px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Header de Projeção */}
        <div className="s-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span className="s-badge s-badge-primary">Projeção em Sala • Telão Kids</span>
              <span style={{ fontSize: 12, color: 'var(--s-text-muted)' }}>Exploradores da Bíblia (8–10 anos)</span>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--s-text-title)', margin: 0 }}>
              Conecte-se à Aula: <span style={{ color: 'var(--s-primary)' }}>Davi e o Gigante Golias</span>
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--s-surface-low)', padding: '6px 14px', borderRadius: 999, border: '1px solid var(--s-border)' }}>
              <span className="s-live-dot" />
              <strong style={{ fontSize: 13, color: 'var(--s-text-title)' }}>
                {connectedStudents.length} alunos conectados
              </strong>
            </div>

            <button className="s-btn s-btn-ghost s-btn-sm" onClick={() => navigate('/professor')}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Card Central com QR Code e Código de 6 Dígitos */}
        <div className="s-card s-card--large" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.3fr)', gap: 36, alignItems: 'center' }}>
          {/* QR Code */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--s-surface-low)', borderRadius: 20, border: '1px solid var(--s-border)' }}>
            <div style={{ width: 220, height: 220, background: '#fff', padding: 16, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--s-shadow-sm)' }}>
              <svg viewBox="0 0 240 240" style={{ width: '100%', height: '100%' }}>
                <rect x="16" y="16" width="60" height="60" rx="8" fill="#16181D" />
                <rect x="24" y="24" width="44" height="44" rx="4" fill="#FFFFFF" />
                <rect x="34" y="34" width="24" height="24" rx="2" fill="#16181D" />

                <rect x="164" y="16" width="60" height="60" rx="8" fill="#16181D" />
                <rect x="172" y="24" width="44" height="44" rx="4" fill="#FFFFFF" />
                <rect x="182" y="34" width="24" height="24" rx="2" fill="#16181D" />

                <rect x="16" y="164" width="60" height="60" rx="8" fill="#16181D" />
                <rect x="24" y="172" width="44" height="44" rx="4" fill="#FFFFFF" />
                <rect x="34" y="182" width="24" height="24" rx="2" fill="#16181D" />

                <rect x="88" y="20" width="14" height="14" rx="2" fill="#16181D" />
                <rect x="110" y="20" width="14" height="24" rx="2" fill="#16181D" />
                <rect x="134" y="30" width="18" height="14" rx="2" fill="#16181D" />
                <rect x="88" y="44" width="20" height="14" rx="2" fill="#16181D" />
                <rect x="88" y="70" width="14" height="34" rx="2" fill="#16181D" />
                <rect x="112" y="54" width="38" height="14" rx="2" fill="#16181D" />
                <rect x="160" y="86" width="24" height="14" rx="2" fill="#16181D" />

                <circle cx="120" cy="120" r="24" fill="#F4512A" />
                <path d="M112 114L128 120L112 126Z" fill="#FFFFFF" />

                <rect x="88" y="146" width="34" height="16" rx="2" fill="#16181D" />
                <rect x="132" y="134" width="18" height="34" rx="2" fill="#16181D" />
                <rect x="160" y="138" width="24" height="18" rx="2" fill="#16181D" />
                <rect x="88" y="174" width="20" height="30" rx="2" fill="#16181D" />
                <rect x="118" y="178" width="34" height="14" rx="2" fill="#16181D" />
                <rect x="160" y="192" width="42" height="28" rx="2" fill="#16181D" />
              </svg>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--s-text-muted)', marginTop: 12 }}>
              <Tv size={14} /> Foco dinâmico otimizado para TV
            </div>
          </div>

          {/* Código de Acesso & Instruções */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--s-text-caption)', letterSpacing: '0.08em' }}>
                Código de Acesso Rápido
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
                <div style={{ padding: '10px 24px', background: 'var(--s-surface-low)', borderRadius: 16, fontSize: 36, fontWeight: 800, letterSpacing: '0.18em', color: 'var(--s-text-title)', border: '1px solid var(--s-border)' }}>
                  {accessCode}
                </div>
                <button className="s-btn s-btn-secondary" onClick={copyCode} title="Copiar código">
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
            </div>

            <div style={{ background: 'var(--s-surface-low)', padding: 14, borderRadius: 14, border: '1px solid var(--s-border)' }}>
              <strong style={{ fontSize: 13, color: 'var(--s-text-title)', display: 'block', marginBottom: 2 }}>
                Instruções para os Alunos na Sala
              </strong>
              <p style={{ fontSize: 12.5, color: 'var(--s-text-muted)', margin: 0, lineHeight: 1.5 }}>
                Abra o aplicativo <strong>Com Deus Kids Play</strong> no tablet ou celular e aponte a câmera para o QR Code ou digite o código de 6 dígitos.
              </p>
            </div>

            {/* Alunos na Sala de Espera */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--s-text-caption)' }}>
                  Alunos na Sala de Espera
                </span>
                <span style={{ fontSize: 11, color: 'var(--s-success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span className="s-live-dot" /> Sincronização ao vivo
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {connectedStudents.map((st, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px 4px 4px', borderRadius: 999, background: 'var(--s-surface-low)', border: '1px solid var(--s-border)' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: st.bg, color: st.color, fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {st.initial}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--s-text-title)' }}>{st.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
              <Link to="/professor/aulas/modo" className="s-btn s-btn-primary s-btn-lg" style={{ flex: 1 }}>
                <Play size={18} /> Iniciar Aula Agora
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
