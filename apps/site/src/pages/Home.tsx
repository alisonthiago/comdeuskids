import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@comdeuskids/supabase'
import { Sparkles, ArrowRight, Download, Star, CheckCircle, ShieldCheck } from 'lucide-react'

export default function Home() {
  const [categories, setCategories] = useState<any[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [catRes, prodRes] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order', { ascending: true }).limit(8),
      supabase.from('products').select('*, category:categories(name)').eq('status', 'published').limit(6)
    ])

    if (catRes.data) setCategories(catRes.data)
    if (prodRes.data) setFeaturedProducts(prodRes.data)
    setLoading(false)
  }

  return (
    <div>
      {/* Hero Banner */}
      <section className="hero-banner">
        <div style={{ maxWidth: 850, margin: '0 auto' }}>
          <div className="badge-tag">
            <Sparkles size={14} /> Atividades Bíblicas em PDF de Alta Resolução
          </div>
          <h1 style={{ fontSize: 44, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 20 }}>
            Ensine as Escrituras de forma <span style={{ color: '#7c3aed' }}>lúdica, visual e inesquecível</span>
          </h1>
          <p style={{ fontSize: 18, color: '#475569', lineHeight: 1.6, maxWidth: 640, margin: '0 auto 32px' }}>
            Centenas de kits de colorir, histórias bíblicas, jogos pedagógicos e devocionais infantis prontos para você baixar e imprimir.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <Link
              to="/categorias"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 28px', background: '#7c3aed', color: '#fff',
                borderRadius: 12, fontWeight: 700, fontSize: 16,
                boxShadow: '0 8px 24px rgba(124, 58, 237, 0.3)'
              }}
            >
              Explorar Materiais <ArrowRight size={18} />
            </Link>

            <Link
              to="/planos"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 28px', background: '#fff', color: '#0f172a',
                border: '1px solid #cbd5e1', borderRadius: 12, fontWeight: 700, fontSize: 16
              }}
            >
              Conhecer Planos de Assinatura
            </Link>
          </div>
        </div>
      </section>

      {/* Categorias em Destaque */}
      <section style={{ maxWidth: 1200, margin: '60px auto 0', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>Categorias em Destaque</h2>
            <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>Escolha pelo tipo de atividade ideal para sua faixa etária</p>
          </div>
          <Link to="/categorias" style={{ fontSize: 14, fontWeight: 700, color: '#7c3aed', display: 'flex', alignItems: 'center', gap: 4 }}>
            Ver todas <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
          {categories.map(cat => (
            <Link
              key={cat.id}
              to={`/categoria/${cat.slug}`}
              style={{
                background: '#fff',
                border: '1px solid #f1f0f5',
                borderRadius: 14,
                padding: '20px 16px',
                textAlign: 'center',
                transition: 'all 0.2s',
                display: 'block'
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12, background: '#f5f3ff',
                color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px', fontWeight: 800, fontSize: 16
              }}>
                📖
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{cat.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Materiais Recentes / Vitrine */}
      <section style={{ maxWidth: 1200, margin: '72px auto 0', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>Kits Bíblicos Mais Procurados</h2>
            <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>Materiais completos com gabarito, ilustrações exclusivas e versículos</p>
          </div>
        </div>

        {featuredProducts.length === 0 ? (
          <div style={{ background: '#f8fafc', borderRadius: 16, padding: '48px 24px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
            <p style={{ color: '#64748b', fontSize: 15 }}>
              Novos materiais digitais estão sendo preparados no painel administrativo e estarão visíveis aqui em instantes.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
            {featuredProducts.map(prod => (
              <div key={prod.id} className="store-product-card">
                <div style={{ height: 180, background: prod.cover_image_url ? `url(${prod.cover_image_url}) center/cover` : '#ede9fe' }} />
                <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase' }}>
                    {prod.category?.name || 'Material Bíblico'}
                  </span>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: '6px 0 8px', color: '#0f172a' }}>
                    {prod.title}
                  </h3>
                  <div style={{ marginTop: 'auto', paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                      R$ {prod.price.toFixed(2)}
                    </div>
                    <Link
                      to={`/produto/${prod.slug}`}
                      style={{ padding: '8px 16px', background: '#7c3aed', color: '#fff', borderRadius: 8, fontWeight: 700, fontSize: 13 }}
                    >
                      Ver Detalhes
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
