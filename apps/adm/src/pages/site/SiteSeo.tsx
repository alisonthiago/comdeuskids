import React, { useState } from 'react'
import { BarChart3, Save, CheckCircle2, Globe, Search } from 'lucide-react'
import { useToast } from '../../hooks/useToast'

export default function SiteSeo() {
  const { toast } = useToast()
  const [siteTitle, setSiteTitle] = useState('Com Deus Kids — Materiais Bíblicos Infantis e Atividades em PDF')
  const [siteDescription, setSiteDescription] = useState('Centenas de cadernos de colorir, histórias bíblicas, jogos pedagógicos e devocionais infantis prontos para você baixar e imprimir.')
  const [canonicalUrl, setCanonicalUrl] = useState('https://comdeuskids.com.br')
  const [ogImageUrl, setOgImageUrl] = useState('https://comdeuskids.com.br/og-image.jpg')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast.success('Configurações globais de SEO salvas com sucesso!')
    }, 400)
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', paddingBottom: 48 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
          Configuração de SEO & Metadados do Site
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
          Parâmetros globais de indexação para o Google, redes sociais (WhatsApp, Instagram) e sitemaps.
        </p>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Título Principal */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
              Título Padrão do Site (Title Tag)
            </label>
            <input
              type="text"
              value={siteTitle}
              onChange={e => setSiteTitle(e.target.value)}
              required
              style={{ width: '100%', height: 42, borderRadius: 8, border: '1px solid #cbd5e1', padding: '0 12px', fontSize: 13.5, boxSizing: 'border-box' }}
            />
            <span style={{ fontSize: 11, color: '#64748b', marginTop: 4, display: 'block' }}>Recomendado: 50 a 60 caracteres.</span>
          </div>

          {/* Meta Description */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
              Descrição Padrão para Mecanismos de Busca (Meta Description)
            </label>
            <textarea
              rows={3}
              value={siteDescription}
              onChange={e => setSiteDescription(e.target.value)}
              required
              style={{ width: '100%', borderRadius: 8, border: '1px solid #cbd5e1', padding: '10px 12px', fontSize: 13, boxSizing: 'border-box', resize: 'vertical' }}
            />
            <span style={{ fontSize: 11, color: '#64748b', marginTop: 4, display: 'block' }}>Recomendado: 120 a 160 caracteres.</span>
          </div>

          {/* URL Canônica */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
              URL Canônica Principal
            </label>
            <input
              type="url"
              value={canonicalUrl}
              onChange={e => setCanonicalUrl(e.target.value)}
              required
              style={{ width: '100%', height: 42, borderRadius: 8, border: '1px solid #cbd5e1', padding: '0 12px', fontSize: 13.5, boxSizing: 'border-box' }}
            />
          </div>

          {/* Imagem de Compartilhamento Social (Open Graph) */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
              Imagem Social Open Graph (WhatsApp / Facebook / Twitter)
            </label>
            <input
              type="url"
              value={ogImageUrl}
              onChange={e => setOgImageUrl(e.target.value)}
              placeholder="https://..."
              style={{ width: '100%', height: 42, borderRadius: 8, border: '1px solid #cbd5e1', padding: '0 12px', fontSize: 13.5, boxSizing: 'border-box' }}
            />
            <span style={{ fontSize: 11, color: '#64748b', marginTop: 4, display: 'block' }}>Dimensão ideal: 1200 x 630 pixels.</span>
          </div>

          {/* Preview no Google */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Search size={14} /> Prévia de resultado na Pesquisa Google
            </div>
            <div style={{ color: '#1a0dab', fontSize: 16, fontWeight: 500, lineHeight: 1.3, cursor: 'pointer' }}>
              {siteTitle}
            </div>
            <div style={{ color: '#006621', fontSize: 12, margin: '2px 0 4px' }}>
              {canonicalUrl}
            </div>
            <div style={{ color: '#545454', fontSize: 12.5, lineHeight: 1.4 }}>
              {siteDescription}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
            <button
              type="submit"
              disabled={isSaving}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, height: 40, padding: '0 24px',
                background: '#2563eb', border: 'none', borderRadius: 8, fontSize: 13.5, fontWeight: 600,
                color: '#fff', cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,0.2)'
              }}
            >
              <Save size={16} /> {isSaving ? 'Salvando...' : 'Salvar Alterações de SEO'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
