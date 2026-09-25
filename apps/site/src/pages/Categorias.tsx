import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@comdeuskids/supabase'
import { ArrowLeft, BookOpen, Sparkles, Filter, CheckCircle2 } from 'lucide-react'

export default function Categorias() {
  const { slug } = useParams<{ slug?: string }>()
  const [categories, setCategories] = useState<any[]>([])
  const [currentCategory, setCurrentCategory] = useState<any | null>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (slug) {
      loadCategoryDetail(slug)
    } else {
      loadAllCategories()
    }
  }, [slug])

  // Carrega todas as categorias para o índice geral /categorias
  const loadAllCategories = async () => {
    try {
      setLoading(true)
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('active', true)
        .order('sort_order', { ascending: true })

      setCategories(data || [])
      setCurrentCategory(null)
      setProducts([])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Carrega a categoria e seus produtos quando houver :slug
  const loadCategoryDetail = async (catSlug: string) => {
    try {
      setLoading(true)
      // 1. Buscar dados da categoria pelo slug
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', catSlug)
        .single()

      if (catError || !catData) {
        setCurrentCategory(null)
        setProducts([])
        setLoading(false)
        return
      }

      setCurrentCategory(catData)

      // 2. Buscar produtos vinculados a esta categoria
      const { data: prodsData, error: prodsError } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', catData.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (prodsError) throw prodsError
      setProducts(prodsData || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // ── Renderização da ROTA DINÂMICA: /categoria/:slug ──
  if (slug) {
    if (loading) {
      return (
        <div style={{ maxWidth: 1200, margin: '64px auto', padding: '0 24px', textAlign: 'center', color: '#64748b' }}>
          Carregando materiais da categoria...
        </div>
      )
    }

    if (!currentCategory) {
      return (
        <div style={{ maxWidth: 800, margin: '64px auto', padding: '0 24px', textAlign: 'center' }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>Categoria não encontrada</h1>
          <p style={{ color: '#64748b', marginBottom: 24 }}>A categoria que você procura não está ativa ou foi alterada.</p>
          <Link
            to="/categorias"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px',
              background: '#7c3aed', color: '#fff', borderRadius: 10, fontWeight: 700, fontSize: 14
            }}
          >
            <ArrowLeft size={16} /> Ver todas as categorias
          </Link>
        </div>
      )
    }

    return (
      <div style={{ maxWidth: 1200, margin: '40px auto 80px', padding: '0 24px' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#64748b', marginBottom: 24 }}>
          <Link to="/" style={{ color: '#64748b' }}>Início</Link>
          <span>/</span>
          <Link to="/categorias" style={{ color: '#64748b' }}>Categorias</Link>
          <span>/</span>
          <span style={{ color: '#0f172a', fontWeight: 600 }}>{currentCategory.name}</span>
        </div>

        {/* Header da Categoria */}
        <div style={{
          background: 'radial-gradient(circle at top right, #f5f3ff 0%, #ffffff 70%)',
          border: '1px solid #ede9fe',
          borderRadius: 20,
          padding: '40px 36px',
          marginBottom: 44,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20
        }}>
          <div style={{ maxWidth: 680 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#ede9fe', color: '#7c3aed', padding: '4px 12px',
              borderRadius: 999, fontSize: 12, fontWeight: 700, marginBottom: 12
            }}>
              <span>{currentCategory.icon || '🎨'}</span> Formato Pedagógico
            </div>
            <h1 style={{ fontSize: 36, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: '0 0 10px' }}>
              {currentCategory.name}
            </h1>
            <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.6, margin: 0 }}>
              {currentCategory.description || 'Atividades bíblicas e materiais de apoio infantil prontos para baixar e imprimir.'}
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#6d28d9', background: '#fff', border: '1px solid #ddd6fe', padding: '6px 14px', borderRadius: 8 }}>
              {products.length} {products.length === 1 ? 'material disponível' : 'materiais disponíveis'}
            </span>
          </div>
        </div>

        {/* Grade de Produtos da Categoria */}
        {products.length === 0 ? (
          <div style={{
            background: '#f8fafc', borderRadius: 16, padding: '60px 24px', textAlign: 'center',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📖</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
              Novos materiais sendo preparados!
            </h3>
            <p style={{ color: '#64748b', fontSize: 14, maxWidth: 480, margin: '0 auto 20px' }}>
              Nossa equipe pedagógica está preparando novos cadernos para a categoria <strong>{currentCategory.name}</strong>.
            </p>
            <Link
              to="/categorias"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13,
                fontWeight: 700, color: '#7c3aed'
              }}
            >
              <ArrowLeft size={15} /> Ver outras categorias disponíveis
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
            {products.map(prod => (
              <div key={prod.id} className="store-product-card">
                <div style={{
                  height: 180,
                  background: prod.cover_image_url ? `url(${prod.cover_image_url}) center/cover` : '#ede9fe',
                  borderBottom: '1px solid #f1f0f5'
                }} />
                <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase' }}>
                    {currentCategory.name}
                  </span>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: '6px 0 8px', color: '#0f172a' }}>
                    {prod.title}
                  </h3>
                  {prod.short_description && (
                    <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px', lineHeight: 1.4 }}>
                      {prod.short_description}
                    </p>
                  )}
                  <div style={{ marginTop: 'auto', paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f8fafc' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                      {prod.is_free ? (
                        <span style={{ color: '#16a34a' }}>Grátis</span>
                      ) : (
                        `R$ ${prod.price?.toFixed(2) || '0.00'}`
                      )}
                    </div>
                    <Link
                      to={`/produto/${prod.slug}`}
                      style={{
                        padding: '8px 16px', background: '#7c3aed', color: '#fff',
                        borderRadius: 8, fontWeight: 700, fontSize: 13, textDecoration: 'none'
                      }}
                    >
                      Ver Detalhes
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ── Renderização da ROTA GERAL: /categorias (Índice de Todas as Categorias) ──
  return (
    <div style={{ maxWidth: 1200, margin: '48px auto', padding: '0 24px' }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Categorias de Materiais</h1>
      <p style={{ fontSize: 16, color: '#64748b', marginBottom: 40 }}>
        Navegue por cadernos de colorir, atividades, calendários, jogos pedagógicos e devocionais bíblicos.
      </p>

      {loading ? (
        <div>Carregando categorias...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
          {categories.map(cat => (
            <Link
              key={cat.id}
              to={`/categoria/${cat.slug}`}
              style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: 16,
                padding: 24,
                transition: 'all 0.2s',
                display: 'block',
                textDecoration: 'none'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#7c3aed'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#e2e8f0'
                e.currentTarget.style.transform = 'none'
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 12 }}>{cat.icon || '🎨'}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>{cat.name}</h3>
              <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
                {cat.description || 'Materiais digitais prontos para download em alta resolução.'}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
