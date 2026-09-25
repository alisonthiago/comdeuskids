import React from 'react'
import { CreditCard, Check, Sparkles, ShieldCheck } from 'lucide-react'

export default function Assinatura() {
  return (
    <div style={{
      maxWidth: 900,
      margin: '0 auto',
      padding: '24px 20px 80px',
      fontFamily: "'Baloo 2', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 14px',
        borderRadius: 9999,
        background: 'rgba(255, 185, 95, 0.15)',
        border: '1px solid rgba(255, 185, 95, 0.3)',
        color: '#ffb95f',
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: '0.08em',
        marginBottom: 16
      }}>
        <Sparkles size={14} />
        <span>STATUS DA CONTA</span>
      </div>

      <h1 style={{
        fontSize: 'clamp(26px, 3.5vw, 36px)',
        fontWeight: 800,
        color: '#ffffff',
        letterSpacing: '-0.02em',
        marginBottom: 8
      }}>
        Meu Plano & Assinatura
      </h1>

      <p style={{
        fontSize: 15,
        color: '#cbc3d7',
        marginBottom: 36,
        lineHeight: 1.6
      }}>
        Gerencie seu acesso ao catálogo infantil, lançamentos contínuos e materiais para impressão.
      </p>

      {/* CARD DO PLANO */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(28, 27, 29, 0.95) 100%)',
        border: '1px solid rgba(34, 197, 94, 0.3)',
        borderRadius: 24,
        padding: '36px 32px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
        maxWidth: 640
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{
            fontSize: 12,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#22c55e'
          }}>
            Acesso Completo Ativo
          </span>

          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            backgroundColor: 'rgba(113, 221, 143, 0.15)',
            border: '1px solid rgba(113, 221, 143, 0.3)',
            color: '#71dd8f',
            padding: '4px 10px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 700
          }}>
            <ShieldCheck size={14} />
            Membro Ativo
          </span>
        </div>

        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#ffffff', marginBottom: 12 }}>
          Plano Família Bíblica VIP
        </h2>

        <p style={{ fontSize: 15, color: '#cbc3d7', lineHeight: 1.6, marginBottom: 24 }}>
          Acesso ilimitado a todas as histórias em vídeo, clipes musicais, múltiplos perfis infantis e download de todos os cadernos de atividades em PDF de 300 DPI.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
          {[
            'Streaming ilimitado em até 4 telas simultâneas',
            'Downloads em PDF vetoriais em alta resolução para imprimir',
            'Controle parental com PIN e ambiente 100% seguro',
            'Acesso antecipado aos lançamentos mensais'
          ].map((benefit, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                backgroundColor: 'rgba(113, 221, 143, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#71dd8f',
                flexShrink: 0
              }}>
                <Check size={14} />
              </div>
              <span style={{ fontSize: 14, color: '#e5e1e4' }}>{benefit}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => alert('Sua assinatura está ativa e regular.')}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
              color: '#052e16',
              border: 'none',
              borderRadius: 12,
              fontWeight: 800,
              cursor: 'pointer',
              fontSize: 14,
              boxShadow: '0 4px 16px rgba(34, 197, 94, 0.35)'
            }}
          >
            Gerenciar Cobrança & Faturas
          </button>
        </div>
      </div>
    </div>
  )
}
