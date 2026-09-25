import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@comdeuskids/supabase'
import { Check, ShieldCheck, Download, Sparkles } from 'lucide-react'

export default function ProdutoDetalhe() {
  const { slug } = useParams()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    supabase.from('products').select('*, category:categories(name)').eq('slug', slug).single()
      .then(({ data }) => {
        setProduct(data)
        setLoading(false)
      })
  }, [slug])

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}>Carregando produto...</div>
  if (!product) return <div style={{ textAlign: 'center', padding: 80 }}>Produto não encontrado.</div>

  return (
    <div style={{ maxWidth: 1100, margin: '56px auto', padding: '0 24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 48 }}>
        {/* Capa */}
        <div style={{
          borderRadius: 20,
          background: product.cover_image_url ? `url(${product.cover_image_url}) center/cover` : '#ede9fe',
          minHeight: 400,
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {!product.cover_image_url && <span style={{ fontSize: 48 }}>📖</span>}
        </div>

        {/* Informações */}
        <div>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase' }}>
            {product.category?.name || 'Material Bíblico'}
          </span>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', margin: '8px 0 16px' }}>
            {product.title}
          </h1>

          <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 24 }}>
            R$ {product.price.toFixed(2)}
          </div>

          <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.6, marginBottom: 32 }}>
            {product.description}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 36 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#334155' }}>
              <Check size={16} color="#16a34a" /> Arquivo em formato PDF pronto para imprimir
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#334155' }}>
              <Download size={16} color="#7c3aed" /> Acesso imediato na sua área de membros após confirmação
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#334155' }}>
              <ShieldCheck size={16} color="#7c3aed" /> Compra segura com garantia incondicional de 7 dias
            </div>
          </div>

          <Link
            to={`/checkout?produto=${product.id}`}
            style={{
              display: 'block',
              textAlign: 'center',
              padding: '16px 0',
              background: '#7c3aed',
              color: '#fff',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 16,
              boxShadow: '0 8px 24px rgba(124, 58, 237, 0.3)'
            }}
          >
            Comprar Agora e Baixar PDF
          </Link>
        </div>
      </div>
    </div>
  )
}
