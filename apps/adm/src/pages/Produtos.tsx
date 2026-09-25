import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Search, Package, Edit2, Trash2, ExternalLink,
  CheckCircle2, Sparkles, Filter, AlertCircle, BookOpen
} from 'lucide-react'
import { supabase } from '@comdeuskids/supabase'
import { cmsService } from '../lib/cmsService'
import { useToast } from '../hooks/useToast'
import { getProductType, productTypes, ProductType } from '../data/productTypes'

interface ProductItem {
  id: string
  product_type?: ProductType | null
  source?: 'product' | 'stream' | 'game'
  typeLabel?: string
  title: string
  slug: string
  description?: string
  short_description?: string
  price: number
  cover_url?: string
  category_id?: string
  is_free?: boolean
  age_range?: string
  status: string
  featured?: boolean
  created_at: string
  category?: {
    id: string
    name: string
    slug: string
  }
}

interface CategoryOption {
  id: string
  name: string
  slug: string
}

export default function Produtos() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<ProductItem[]>([])
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [loading, setLoading] = useState(true)
  const [catalogWarning, setCatalogWarning] = useState('')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(() => new URLSearchParams(window.location.search).get('novo') === '1')
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // Form states
  const [productType, setProductType] = useState<ProductType | ''>(() => getProductType(new URLSearchParams(window.location.search).get('tipo'))?.type || '')
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [price, setPrice] = useState('19.90')
  const [isFree, setIsFree] = useState(false)
  const [ageRange, setAgeRange] = useState('Todas')
  const [shortDescription, setShortDescription] = useState('')
  const [description, setDescription] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [status, setStatus] = useState<'active' | 'draft' | 'archived'>('active')
  const [featured, setFeatured] = useState(false)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  useEffect(() => {
    loadCategories()
    loadProducts()
  }, [])

  const loadCategories = async () => {
    try {
      const { data } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('active', true)
        .order('name', { ascending: true })

      if (data && data.length > 0) {
        setCategories(data)
        if (!categoryId) setCategoryId(data[0].id)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const loadProducts = async () => {
    try {
      setLoading(true)
      const [productResult, contents, gameResult] = await Promise.all([supabase
        .from('products')
        .select('*, category:categories(id, name, slug)')
        .is('deleted_at', null)
        .order('created_at', { ascending: false }), cmsService.getContents(), Promise.resolve({ data: [], error: null })])
      setCatalogWarning(productResult.error ? 'Os produtos da loja não puderam ser carregados.' : '')
      const commercial = productResult.data || []
      const localCourses = Object.keys(localStorage)
        .filter(key => key.startsWith('cdk-course-') && !key.startsWith('cdk-course-modules-'))
        .map(key => {
          try {
            const course = JSON.parse(localStorage.getItem(key) || '')
            return { id: course.id, title: course.title, slug: course.slug, description: course.description, price: Number(course.price || 0), source: 'product' as const, product_type: 'curso' as const, cover_url: course.coverUrl || undefined, age_range: 'Todas', status: course.status || 'draft', created_at: course.created_at, category: { id: '', name: 'Cursos', slug: 'cursos' } } as ProductItem
          } catch { return null }
        }).filter((course): course is NonNullable<typeof course> => course !== null)
      const streamTypes: Record<string, ProductType> = { movie: 'filme', series: 'serie', song: 'musica', lesson: 'curso', video: 'video', clip: 'video', story: 'video', drawing: 'video', game: 'jogo' }
      const combined: ProductItem[] = [
        ...commercial.map(p => ({ ...p, source: 'product' as const })),
        ...localCourses.filter(course => !commercial.some(product => product.id === course.id)),
        ...contents.filter(c => !(c as typeof c & { related_product_id?: string }).related_product_id || !commercial.some(p => p.id === (c as typeof c & { related_product_id?: string }).related_product_id)).map(c => ({
          id: c.id, title: c.title, slug: c.slug, description: c.description, price: 0,
          source: 'stream' as const, product_type: streamTypes[c.type] || 'video',
          cover_url: c.thumbnail_url, age_range: c.age_range, category_id: c.category_id,
          category: { id: c.category_id || '', name: c.category || 'Streaming', slug: '' },
          status: c.status === 'published' ? 'active' : c.status || 'draft', created_at: c.created_at || ''
        })),
        ...(gameResult.data || []).map((g: any) => ({ ...g, source: 'game' as const, product_type: 'jogo' as const, price: 0, status: g.status === 'published' ? 'active' : g.status }))
      ]
      setProducts(combined.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || '')))
    } catch (err: any) {
      console.error(err)
      toast.error('Erro ao carregar produtos.')
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleTitleChange = (val: string) => {
    setTitle(val)
    if (!slugManuallyEdited) {
      setSlug(generateSlug(val))
    }
  }

  const openCreateModal = () => {
    setEditingProduct(null)
    setProductType('')
    setTitle('')
    setSlug('')
    if (categories.length > 0) setCategoryId(categories[0].id)
    setPrice('19.90')
    setIsFree(false)
    setAgeRange('Todas')
    setShortDescription('')
    setDescription('')
    setCoverUrl('')
    setStatus('active')
    setFeatured(false)
    setSlugManuallyEdited(false)
    setModalOpen(true)
  }

  const openEditModal = (prod: ProductItem) => {
    if (prod.source === 'stream') { navigate(`/admin/conteudos/${prod.id}`); return }
    if (prod.source === 'game') { navigate('/admin/jogos'); return }
    setEditingProduct(prod)
    setProductType(getProductType(prod.product_type)?.type || '')
    setTitle(prod.title)
    setSlug(prod.slug)
    setCategoryId(prod.category_id || (categories[0]?.id || ''))
    setPrice(prod.price ? String(prod.price) : '0.00')
    setIsFree(Boolean(prod.is_free))
    setAgeRange(prod.age_range || 'Todas')
    setShortDescription(prod.short_description || '')
    setDescription(prod.description || '')
    setCoverUrl(prod.cover_url || '')
    setStatus((prod.status as any) || 'active')
    setFeatured(Boolean(prod.featured))
    setSlugManuallyEdited(true)
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.warning('O título do produto é obrigatório.')
      return
    }

    if (!productType) {
      toast.warning('Selecione o tipo do produto.')
      return
    }

    if (!categoryId) {
      toast.warning('Selecione uma categoria para o produto.')
      return
    }

    const finalSlug = slug.trim() || generateSlug(title)
    setIsSaving(true)

    try {
      const payload: any = {
        title: title.trim(),
        product_type: productType,
        slug: finalSlug,
        category_id: categoryId,
        price: isFree ? 0 : parseFloat(price) || 0,
        is_free: isFree,
        age_range: ageRange,
        short_description: shortDescription.trim() || null,
        description: description.trim() || null,
        cover_url: coverUrl.trim() || null,
        status: status,
        featured: featured
      }

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingProduct.id)

        if (error) throw error
        toast.success(`Produto "${title}" atualizado com sucesso!`)
      } else {
        const { error } = await supabase
          .from('products')
          .insert([payload])

        if (error) throw error
        toast.success(`Produto "${title}" cadastrado com sucesso!`)
      }

      setModalOpen(false)
      loadProducts()
    } catch (err: any) {
      console.error(err)
      toast.error('Erro ao salvar produto: ' + (err.message || 'Verifique os dados.'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (prod: ProductItem) => {
    if (!window.confirm(`Tem certeza de que deseja remover o produto "${prod.title}"?`)) return
    try {
      const localKey = `cdk-course-${prod.id}`
      if (localStorage.getItem(localKey)) {
        localStorage.removeItem(localKey)
        localStorage.removeItem(`cdk-course-modules-${prod.id}`)
        setProducts(all => all.filter(item => item.id !== prod.id))
        toast.success('Produto excluído com sucesso.')
        return
      }
      // Soft delete para preservar integridade
      const { error } = await supabase
        .from('products')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', prod.id)

      if (error) throw error
      toast.success('Produto removido do catálogo.')
      loadProducts()
    } catch (err: any) {
      toast.error('Erro ao remover: ' + err.message)
    }
  }

  const handleActivation = async (prod: ProductItem) => {
    const nextStatus = prod.status === 'active' ? 'draft' : 'active'
    try {
      const localKey = `cdk-course-${prod.id}`
      const stored = localStorage.getItem(localKey)
      if (stored) {
        localStorage.setItem(localKey, JSON.stringify({ ...JSON.parse(stored), status: nextStatus }))
      } else if (prod.source === 'product') {
        const { error } = await supabase.from('products').update({ status: nextStatus }).eq('id', prod.id)
        if (error) throw error
      } else {
        toast.warning('A ativação deste tipo de conteúdo deve ser feita na tela de edição.')
        return
      }
      setProducts(all => all.map(item => item.id === prod.id ? { ...item, status: nextStatus } : item))
      toast.success(nextStatus === 'active' ? 'Produto ativado e publicado.' : 'Produto desativado e movido para rascunho.')
    } catch (err: any) {
      toast.error('Não foi possível alterar o status: ' + (err.message || 'tente novamente.'))
    }
  }

  const filtered = products.filter(p => {
    const matchesSearch = p.title?.toLowerCase().includes(search.toLowerCase()) ||
                          p.slug?.toLowerCase().includes(search.toLowerCase())
    const matchesCat = selectedCategoryFilter === 'all' || p.category_id === selectedCategoryFilter
    return matchesSearch && matchesCat && (typeFilter === 'all' || p.product_type === typeFilter)
  })

  return (
    <div className="hm-products">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            Produtos
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
            Todos os seus produtos, conteúdos e jogos em um só lugar.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/admin/produtos/novo')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, background: '#111',
            color: '#fff', border: 'none', borderRadius: 4, padding: '10px 18px',
            fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: 'none'
          }}
        >
          <Plus size={16} /> Criar produto
        </button>
      </div>

      <section className="hm-products-tools">
        <article><Sparkles size={18} /><div><strong>Materiais digitais</strong><span>Organize atividades e PDFs na área de membros.</span></div></article>
        <article><Package size={18} /><div><strong>Coleções</strong><span>Reúna recursos para uma jornada de aprendizado.</span></div></article>
        <article><ExternalLink size={18} /><div><strong>Vitrine do site</strong><span>Apresente seus materiais para as famílias.</span></div></article>
        <article><CheckCircle2 size={18} /><div><strong>Downloads</strong><span>Acompanhe os materiais publicados.</span></div></article>
      </section>

      <div className="hm-products-tabs"><button className="active">Meus produtos</button></div>

      {/* Filtros e Busca */}
      <div style={{
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 16px',
        marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, minWidth: 260, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            placeholder="Buscar produto por título ou slug..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: 13, color: '#1e293b' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={15} color="#64748b" />
          <select aria-label="Tipo de produto" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ height: 36, borderRadius: 8, border: '1px solid #cbd5e1', padding: '0 12px', background: '#fff' }}>
            <option value="all">Todos os tipos</option>{productTypes.map(t => <option key={t.type} value={t.type}>{t.title}</option>)}
          </select>
          <select
            value={selectedCategoryFilter}
            onChange={e => setSelectedCategoryFilter(e.target.value)}
            style={{
              height: 36, borderRadius: 8, border: '1px solid #cbd5e1', padding: '0 12px',
              fontSize: 12.5, color: '#334155', outline: 'none', background: '#fff'
            }}
          >
            <option value="all">Todas as Categorias</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {catalogWarning && <p role="status" style={{ padding: '12px 16px', marginBottom: 16, border: '1px solid #fde68a', borderRadius: 8, color: '#92400e', background: '#fffbeb', fontSize: 13 }}>{catalogWarning}</p>}
      <section className="hm-product-grid">
        {loading ? <p className="hm-products-empty">Carregando produtos…</p> : filtered.length === 0 ? <p className="hm-products-empty">Nenhum produto encontrado. Crie o primeiro material para ele aparecer aqui.</p> : filtered.map(prod => (
          <article className="hm-product-card" key={`card-${prod.source}-${prod.id}`}>
            <div className="hm-product-cover" style={prod.cover_url ? { backgroundImage: `url(${prod.cover_url})` } : undefined}>
              {!prod.cover_url && <Package size={38} />}
              <span>{getProductType(prod.product_type)?.title || 'Produto'} <Package size={13} /></span>
            </div>
            <div className="hm-product-info">
              <b className={prod.status === 'active' ? 'live' : ''}>{prod.status === 'active' ? 'Publicado' : prod.status === 'archived' ? 'Arquivado' : 'Rascunho'}</b>
              <small>ID {prod.id.slice(0, 8)}</small>
              <h3>{prod.title}</h3>
              <p>{prod.category?.name || 'Material digital'} · {prod.age_range || 'Todas as idades'}</p>
              <footer><button onClick={() => openEditModal(prod)}>Editar produto</button><div className="hm-product-actions">{prod.source === 'product' && <><button type="button" className={prod.status === 'active' ? 'is-active' : ''} onClick={() => handleActivation(prod)} title={prod.status === 'active' ? 'Desativar produto' : 'Ativar produto'}>{prod.status === 'active' ? 'Ativo' : 'Ativar'}</button><button type="button" className="delete" onClick={() => handleDelete(prod)} title="Excluir produto" aria-label={`Excluir ${prod.title}`}><Trash2 size={15} /></button><a href={`http://localhost:3000/produto/${prod.slug}`} target="_blank" rel="noreferrer" title="Ver no site"><ExternalLink size={15} /></a></>}</div></footer>
            </div>
          </article>
        ))}
      </section>

      {/* Tabela de Produtos */}
      <div className="products-legacy" style={{
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '14px 16px' }}>Produto</th>
                <th style={{ padding: '14px 16px' }}>Categoria</th>
                <th style={{ padding: '14px 16px' }}>Preço</th>
                <th style={{ padding: '14px 16px' }}>Faixa Etária</th>
                <th style={{ padding: '14px 16px' }}>Status</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Carregando produtos...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Nenhum material encontrado. Cadastre um produto para vinculá-lo à categoria.</td></tr>
              ) : (
                filtered.filter(prod => prod.source === 'product').map(prod => {
                  const isActive = prod.status === 'active'
                  return (
                    <tr key={prod.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 44, height: 44, borderRadius: 8,
                            background: prod.cover_url ? `url(${prod.cover_url}) center/cover` : '#f1f5f9',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                          }}>
                            {!prod.cover_url && <Package size={18} color="#94a3b8" />}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{prod.title}</div>
                            <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>/produto/{prod.slug}</div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#6d28d9', background: '#ede9fe', padding: '3px 8px', borderRadius: 6 }}>
                          {prod.category?.name || 'Sem categoria'}
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a' }}>
                        {prod.is_free ? (
                          <span style={{ color: '#16a34a' }}>Grátis</span>
                        ) : (
                          `R$ ${prod.price?.toFixed(2) || '0.00'}`
                        )}
                      </td>

                      <td style={{ padding: '14px 16px', color: '#64748b' }}>
                        {prod.age_range || 'Todas'}
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999,
                          background: isActive ? '#dcfce7' : '#f1f5f9',
                          color: isActive ? '#15803d' : '#64748b'
                        }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: isActive ? '#16a34a' : '#94a3b8' }} />
                          {isActive ? 'Publicado' : 'Rascunho'}
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <a
                            href={`http://localhost:3000/produto/${prod.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Ver no site"
                            style={{ width: 30, height: 30, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569' }}
                          >
                            <ExternalLink size={13} />
                          </a>
                          <button
                            type="button"
                            onClick={() => openEditModal(prod)}
                            title="Editar produto"
                            style={{ width: 30, height: 30, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', cursor: 'pointer' }}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(prod)}
                            title="Excluir produto"
                            style={{ width: 30, height: 30, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', cursor: 'pointer' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Criar / Editar Produto */}
      {modalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, width: '100%', maxWidth: 600,
            maxHeight: '90vh', overflowY: 'auto', padding: 28, boxSizing: 'border-box'
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '0 0 16px' }}>
              {editingProduct ? 'Editar produto' : `Cadastrar produto${productType ? ` — ${getProductType(productType)?.title}` : ''}`}
            </h2>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label htmlFor="product-type" style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Tipo de produto *</label>
                <select id="product-type" value={productType} onChange={e => setProductType(e.target.value as ProductType)} required
                  style={{ width: '100%', height: 40, borderRadius: 8, border: '1px solid #cbd5e1', padding: '0 12px', fontSize: 13.5, background: '#fff' }}>
                  <option value="" disabled>Selecione o tipo</option>
                  {productTypes.map(item => <option key={item.type} value={item.type}>{item.title}</option>)}
                </select>
                <p style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>{getProductType(productType)?.text}</p>
              </div>
              {/* Título */}
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Título do Produto *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => handleTitleChange(e.target.value)}
                  placeholder="Ex: Encontre o Caminho — Jesus, Caderno de Colorir Davi..."
                  required
                  style={{ width: '100%', height: 40, borderRadius: 8, border: '1px solid #cbd5e1', padding: '0 12px', fontSize: 13.5, boxSizing: 'border-box' }}
                />
              </div>

              {/* Slug */}
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Slug (URL no site) *
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>/produto/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={e => { setSlug(generateSlug(e.target.value)); setSlugManuallyEdited(true) }}
                    required
                    style={{ flex: 1, height: 40, borderRadius: 8, border: '1px solid #cbd5e1', padding: '0 12px', fontSize: 13.5, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Categoria Select Dinâmico */}
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Categoria do produto *
                </label>
                <select
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  required
                  style={{ width: '100%', height: 40, borderRadius: 8, border: '1px solid #cbd5e1', padding: '0 12px', fontSize: 13.5, boxSizing: 'border-box', background: '#fff' }}
                >
                  <option value="" disabled>Selecione uma categoria cadastrada no CMS</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <span style={{ fontSize: 11, color: '#64748b', marginTop: 4, display: 'block' }}>
                  Ao publicar, o produto aparecerá automaticamente na página desta categoria.
                </span>
              </div>

              {/* Preço e Grátis */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    disabled={isFree}
                    style={{ width: '100%', height: 40, borderRadius: 8, border: '1px solid #cbd5e1', padding: '0 12px', fontSize: 13.5, boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Faixa Etária</label>
                  <select
                    value={ageRange}
                    onChange={e => setAgeRange(e.target.value)}
                    style={{ width: '100%', height: 40, borderRadius: 8, border: '1px solid #cbd5e1', padding: '0 12px', fontSize: 13.5, boxSizing: 'border-box', background: '#fff' }}
                  >
                    <option value="Todas">Todas as idades</option>
                    <option value="2-4 anos">2 a 4 anos (Maternal)</option>
                    <option value="5-7 anos">5 a 7 anos (Primários)</option>
                    <option value="8-10 anos">8 a 10 anos (Juniores)</option>
                    <option value="11+ anos">11+ anos</option>
                  </select>
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                <input type="checkbox" checked={isFree} onChange={e => setIsFree(e.target.checked)} />
                <span style={{ fontWeight: 600 }}>Produto gratuito</span>
              </label>

              {/* Capa URL */}
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>URL da capa do produto</label>
                <input
                  type="url"
                  value={coverUrl}
                  onChange={e => setCoverUrl(e.target.value)}
                  placeholder="https://..."
                  style={{ width: '100%', height: 40, borderRadius: 8, border: '1px solid #cbd5e1', padding: '0 12px', fontSize: 13.5, boxSizing: 'border-box' }}
                />
              </div>

              {/* Descrição Curta */}
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Descrição Curta (para os cards)</label>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={e => setShortDescription(e.target.value)}
                  placeholder="Ex: 40 páginas com versículos e ilustrações..."
                  style={{ width: '100%', height: 40, borderRadius: 8, border: '1px solid #cbd5e1', padding: '0 12px', fontSize: 13.5, boxSizing: 'border-box' }}
                />
              </div>

              {/* Descrição Completa */}
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Descrição Completa</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Detalhes pedagógicos, formato do arquivo, etc..."
                  style={{ width: '100%', borderRadius: 8, border: '1px solid #cbd5e1', padding: '10px 12px', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>

              {/* Status */}
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: '#334155' }}>Status:</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                  <input type="radio" name="pstatus" checked={status === 'active'} onChange={() => setStatus('active')} /> Publicado
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                  <input type="radio" name="pstatus" checked={status === 'draft'} onChange={() => setStatus('draft')} /> Rascunho
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={isSaving}
                  style={{ height: 38, padding: '0 18px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13, color: '#475569', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{ height: 38, padding: '0 20px', background: '#2563eb', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' }}
                >
                  {isSaving ? 'Salvando...' : editingProduct ? 'Salvar Alterações' : 'Cadastrar produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
