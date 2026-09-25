import React, { useState } from 'react'
import {
  QrCode,
  Copy,
  CheckCircle,
  ExternalLink,
  Sparkles,
  Share2,
  Printer
} from 'lucide-react'
import { APP_URLS } from '../lib/env'

export function LinksDivulgacao() {
  const [copiedLink, setCopiedLink] = useState<string | null>(null)
  const affiliateCode = 'PARCEIRO-CDK'

  const links = [
    {
      title: 'Página Inicial & Apresentação Com Deus Kids',
      description: 'Ideal para apresentar a plataforma para novas famílias.',
      url: `${APP_URLS.site}?ref=${affiliateCode}`
    },
    {
      title: 'Checkout Direto — Plano Anual Família (Mais Vendido)',
      description: 'Direciona direto para o pagamento com sua comissão garantida.',
      url: `${APP_URLS.site}/checkout?plano=anual&ref=${affiliateCode}`
    },
    {
      title: 'Página de Materiais Bíblicos & Atividades em PDF',
      description: 'Excelente para professores, igrejas e tias de ministério infantil.',
      url: `${APP_URLS.site}/materiais?ref=${affiliateCode}`
    }
  ]

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedLink(url)
    setTimeout(() => setCopiedLink(null), 3000)
  }

  // QR Code URL em SVG/PNG gerado com precisão
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`${APP_URLS.site}?ref=${affiliateCode}`)}`

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', margin: '0 0 6px 0' }}>
          Meus Links de Afiliado & QR Codes
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
          Todos os acessos gerados através destes links e QR Codes são rastreados com atribuição de 60 dias.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Links de Divulgação */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {links.map((link, idx) => (
            <div
              key={idx}
              style={{
                background: '#13141c',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '20px'
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: '0 0 4px 0' }}>
                {link.title}
              </h3>
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 14px 0' }}>
                {link.description}
              </p>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: '#0b0c10',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.06)'
              }}>
                <span style={{
                  flex: 1,
                  fontSize: '13px',
                  color: '#34d399',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontFamily: 'monospace'
                }}>
                  {link.url}
                </span>

                <button
                  onClick={() => handleCopy(link.url)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    background: copiedLink === link.url ? 'rgba(34, 197, 94, 0.2)' : '#10b981',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  {copiedLink === link.url ? <CheckCircle size={14} /> : <Copy size={14} />}
                  {copiedLink === link.url ? 'Copiado!' : 'Copiar Link'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Card do QR Code para Apresentação na Igreja */}
        <div style={{
          background: '#13141c',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '24px',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: '0 0 6px 0' }}>
            QR Code Presencial
          </h3>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 16px 0' }}>
            Imprima ou projete na igreja para as famílias escanearem pelo celular.
          </p>

          <div style={{
            background: '#fff',
            padding: '16px',
            borderRadius: '12px',
            display: 'inline-block',
            marginBottom: '16px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
          }}>
            <img
              src={qrCodeUrl}
              alt="QR Code do Afiliado"
              style={{ width: '180px', height: '180px', display: 'block' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 600 }}>
              Código: <strong style={{ color: '#34d399' }}>{affiliateCode}</strong>
            </span>

            <button
              onClick={() => window.print()}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              <Printer size={15} /> Imprimir Placa / Cartaz
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
