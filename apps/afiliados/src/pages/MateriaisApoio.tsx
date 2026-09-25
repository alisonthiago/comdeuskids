import React, { useState } from 'react'
import { Share2, Copy, CheckCircle, MessageSquare, Download } from 'lucide-react'

export function MateriaisApoio() {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const texts = [
    {
      id: 't-1',
      title: 'Mensagem para WhatsApp (Famílias e Pais)',
      text: 'Paz do Senhor, irmãos! Quero indicar uma plataforma incrível que meus filhos estão amando: o Com Deus Kids! Tem desenhos bíblicos seguros, quizzes, músicas cristãs e até controle de tempo para os pais. Acesse pelo meu link para conhecer: https://www.comdeuskids.com.br?ref=PARCEIRO-CDK'
    },
    {
      id: 't-2',
      title: 'Mensagem para Pastores e Líderes de EBD',
      text: 'Olá pastor / líder de ministério infantil! Conheci a plataforma Com Deus Kids que traz todo o catálogo bíblico infantil e um motor de aulas com lições prontas, quizzes e atividades em PDF para o ministério infantil da nossa igreja. Vale muito a pena conferir: https://www.comdeuskids.com.br?ref=PARCEIRO-CDK'
    }
  ]

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 3000)
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', margin: '0 0 6px 0' }}>
          Materiais de Divulgação
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
          Textos prontos e materiais oficiais para você divulgar em grupos de igreja, famílias e ministérios.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {texts.map(t => (
          <div
            key={t.id}
            style={{
              background: '#13141c',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={16} color="#34d399" /> {t.title}
              </h3>
              <button
                onClick={() => handleCopy(t.id, t.text)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  background: copiedId === t.id ? 'rgba(34, 197, 94, 0.2)' : '#10b981',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                {copiedId === t.id ? <CheckCircle size={14} /> : <Copy size={14} />}
                {copiedId === t.id ? 'Copiado!' : 'Copiar Texto'}
              </button>
            </div>
            <div style={{ background: '#0b0c10', borderRadius: '8px', padding: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ fontSize: '13px', lineHeight: 1.6, color: '#cbd5e1', margin: 0 }}>
                {t.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
