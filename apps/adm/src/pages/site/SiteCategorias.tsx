import React, { useState, useEffect } from 'react'
import {
  Layers, Plus, Search, Edit2, Trash2, ExternalLink,
  CheckCircle, Eye, EyeOff, Sparkles, AlertCircle, ArrowUpDown
} from 'lucide-react'
import { supabase } from '@comdeuskids/supabase'
import { Category } from '@comdeuskids/types'
import { useToast } from '../../hooks/useToast'

interface CategoryWithCount extends Category {
  products_count: number
}

export default function SiteCategorias() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryWithCount | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // Form states
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [icon, setIcon] = useState('')
  const [sortOrder, setSortOrder] = useState<number>(0)
  const [status, setStatus] = useState<'draft' | 'active' | 'archived'>('active')
  const [showInSite, setShowInSite] = useState(true)
  const [showInMenu, setShowInMenu] = useState(true)
  const [showInFooter, setShowInFooter] = useState(true)
  const [showInHome, setShowInHome] = useState(false)
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      // Carregar categorias
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })

      if (catError) throw catError

      // Carregar contagem real de produtos associados a cada categoria
      const { data: prodData } = await supabase
        .from('products')
        .select('category_id')
        .is('deleted_at', null)

      const countsMap: Record<string, number> = {}
      if (prodData) {
        prodData.forEach((p: { category_id: string | null }) => {
          if (p.category_id) {
            countsMap[p.category_id] = (countsMap[p.category_id] || 0) + 1
          }
        })
      }

      const list: CategoryWithCount[] = (catData || []).map(cat => ({
        ...cat,
        show_in_site: cat.show_in_site ?? true,
        show_in_menu: cat.show_in_menu ?? true,
        show_in_footer: cat.show_in_footer ?? true,
        show_in_home: cat.show_in_home ?? false,
        status: (cat.status as 'draft' | 'active' | 'archived') || (cat.active ? 'active' : 'archived'),
        products_count: countsMap[cat.id] || 0
      }))

      setCategories(list)
    } catch (err: any) {
      console.error(err)
      toast.error('Erro ao carregar categorias.')
    } finally {
      setLoading(false)
    }
  }

  // Gera slug automaticamente
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleNameChange = (val: string) => {
    setName(val)
    if (!slugManuallyEdited) {
      setSlug(generateSlug(val))
    }
  }

  const openCreateModal = () => {
    setEditingCategory(null)
    setName('')
    setSlug('')
    setDescription('')
    setCoverUrl('')
    setIcon('')
    setSortOrder(categories.length + 1)
    setStatus('active')
    setShowInSite(true)
    setShowInMenu(true)
    setShowInFooter(true)
    setShowInHome(false)
    setMetaTitle('')
    setMetaDescription('')
    setSlugManuallyEdited(false)
    setModalOpen(true)
  }

  const openEditModal = (cat: CategoryWithCount) => {
    setEditingCategory(cat)
    setName(cat.name)
    setSlug(cat.slug)
    setDescription(cat.description || '')
    setCoverUrl(cat.cover_url || '')
    setIcon(cat.icon || '')
    setSortOrder(cat.sort_order || 0)
    setStatus(cat.status || 'active')
    setShowInSite(cat.show_in_site ?? true)
    setShowInMenu(cat.show_in_menu ?? true)
    setShowInFooter(cat.show_in_footer ?? true)
    setShowInHome(cat.show_in_home ?? false)
    setMetaTitle(cat.meta_title || '')
    setMetaDescription(cat.meta_description || '')
    setSlugManuallyEdited(true)
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.warning('O nome da categoria é obrigatório.')
      return
    }

    const finalSlug = slug.trim() || generateSlug(name)

    setIsSaving(true)
    try {
      const payload: any = {
        name: name.trim(),
        slug: finalSlug,
        description: description.trim() || null,
        icon: icon.trim() || null,
        cover_url: coverUrl.trim() || null,
        sort_order: Number(sortOrder) || 0,
        active: status === 'active',
        status: status,
        show_in_site: showInSite,
        show_in_menu: showInMenu,
        show_in_footer: showInFooter,
        show_in_home: showInHome,
        meta_title: metaTitle.trim() || null,
        meta_description: metaDescription.trim() || null
      }

      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update(payload)
          .eq('id', editingCategory.id)

        if (error) {
          // Se colunas novas não estiverem ainda aplicadas no DB remoto, salva compatível
          if (error.message.includes('column')) {
            const fallbackPayload = {
              name: payload.name,
              slug: payload.slug,
              description: payload.description,
              icon: payload.icon,
              sort_order: payload.sort_order,
              active: payload.active
            }
            const { error: errFallback } = await supabase
              .from('categories')
              .update(fallbackPayload)
              .eq('id', editingCategory.id)
            if (errFallback) throw errFallback
          } else {
            throw error
          }
        }
        toast.success(`Categoria "${name}" atualizada com sucesso!`)
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([payload])

        if (error) {
          if (error.message.includes('column')) {
            const fallbackPayload = {
              name: payload.name,
              slug: payload.slug,
              description: payload.description,
              icon: payload.icon,
              sort_order: payload.sort_order,
              active: payload.active
            }
            const { error: errFallback } = await supabase
              .from('categories')
              .insert([fallbackPayload])
            if (errFallback) throw errFallback
          } else {
            throw error
          }
        }
        toast.success(`Categoria "${name}" publicada com sucesso!`)
      }

      setModalOpen(false)
      loadCategories()
    } catch (err: any) {
      console.error(err)
      toast.error('Erro ao salvar categoria: ' + (err.message || 'Verifique os dados.'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleStatus = async (cat: CategoryWithCount) => {
    const nextStatus = cat.status === 'active' ? 'archived' : 'active'
    try {
      const { error } = await supabase
        .from('categories')
        .update({
          active: nextStatus === 'active',
          status: nextStatus
        })
        .eq('id', cat.id)

      if (error) {
        await supabase
          .from('categories')
          .update({ active: nextStatus === 'active' })
          .eq('id', cat.id)
      }

      toast.success(`Categoria "${cat.name}" ${nextStatus === 'active' ? 'ativada' : 'desativada'}.`)
      loadCategories()
    } catch (err: any) {
      toast.error('Não foi possível alterar o status.')
    }
  }

  const handleDelete = async (cat: CategoryWithCount) => {
    if (cat.products_count > 0) {
      toast.warning(`Esta categoria possui ${cat.products_count} produto(s) vinculado(s). Desvincule os produtos antes de excluir.`)
      return
    }

    if (!window.confirm(`Tem certeza de que deseja excluir a categoria "${cat.name}"?`)) return

    try {
      const { error } = await supabase.from('categories').delete().eq('id', cat.id)
      if (error) throw error
      toast.success('Categoria excluída com sucesso.')
      loadCategories()
    } catch (err: any) {
      toast.error('Erro ao excluir categoria: ' + err.message)
    }
  }

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 48 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            Categorias Públicas do Site
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
            Formatos de atividades e materiais digitais comercializados no storefront.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="button"
            className="btn-primary"
            onClick={openCreateModal}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, background: '#2563eb',
              color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,0.25)'
            }}
          >
            <Plus size={16} /> Nova Categoria
          </button>
        </div>
      </div>

      {/* Barra de Pesquisa e Filtros */}
      <div style={{
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 16px',
        marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12
      }}>
        <Search size={18} color="#94a3b8" />
        <input
          type="text"
          placeholder="Buscar categoria por nome ou slug..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{
            border: 'none', outline: 'none', width: '100%', fontSize: 13, color: '#1e293b'
          }}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            style={{ border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: 12 }}
          >
            Limpar
          </button>
        )}
      </div>

      {/* Tabela de Categorias */}
      <div style={{
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '14px 16px', width: 60 }}>Ordem</th>
                <th style={{ padding: '14px 16px' }}>Nome & Ícone</th>
                <th style={{ padding: '14px 16px' }}>Slug / Rota</th>
                <th style={{ padding: '14px 16px' }}>Produtos</th>
                <th style={{ padding: '14px 16px' }}>Visibilidade</th>
                <th style={{ padding: '14px 16px' }}>Status</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                    Carregando categorias do CMS...
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                    Nenhuma categoria encontrada.
                  </td>
                </tr>
              ) : (
                filteredCategories.map(cat => {
                  const isActive = cat.status === 'active' || cat.active
                  return (
                    <tr
                      key={cat.id}
                      style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#fbfcfe')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Ordem */}
                      <td style={{ padding: '14px 16px', color: '#64748b', fontWeight: 600 }}>
                        #{cat.sort_order}
                      </td>

                      {/* Nome & Ícone */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: 8, background: '#eff6ff',
                            color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 14, fontWeight: 700
                          }}>
                            {cat.icon || '🎨'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{cat.name}</div>
                            {cat.description && (
                              <div style={{ fontSize: 11, color: '#94a3b8', maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {cat.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Slug */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          fontFamily: 'monospace', fontSize: 12, background: '#f1f5f9',
                          padding: '3px 8px', borderRadius: 6, color: '#334155'
                        }}>
                          /categoria/{cat.slug}
                        </span>
                      </td>

                      {/* Produtos */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          fontWeight: 700, color: cat.products_count > 0 ? '#0f172a' : '#94a3b8'
                        }}>
                          {cat.products_count} {cat.products_count === 1 ? 'produto' : 'produtos'}
                        </span>
                      </td>

                      {/* Visibilidade */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {cat.show_in_site && (
                            <span style={{ fontSize: 10, fontWeight: 600, background: '#dbeafe', color: '#1d4ed8', padding: '2px 6px', borderRadius: 4 }}>Site</span>
                          )}
                          {cat.show_in_menu && (
                            <span style={{ fontSize: 10, fontWeight: 600, background: '#e0e7ff', color: '#4338ca', padding: '2px 6px', borderRadius: 4 }}>Menu</span>
                          )}
                          {cat.show_in_footer && (
                            <span style={{ fontSize: 10, fontWeight: 600, background: '#ede9fe', color: '#6d28d9', padding: '2px 6px', borderRadius: 4 }}>Rodapé</span>
                          )}
                          {cat.show_in_home && (
                            <span style={{ fontSize: 10, fontWeight: 600, background: '#fef3c7', color: '#b45309', padding: '2px 6px', borderRadius: 4 }}>Home</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999,
                          background: isActive ? '#dcfce7' : '#f1f5f9',
                          color: isActive ? '#15803d' : '#64748b'
                        }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: isActive ? '#16a34a' : '#94a3b8' }} />
                          {isActive ? 'Publicada' : 'Inativa'}
                        </span>
                      </td>

                      {/* Ações */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          {/* Visualizar no Site */}
                          <a
                            href={`http://localhost:3000/categoria/${cat.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Ver página no Site público"
                            style={{
                              width: 30, height: 30, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', textDecoration: 'none'
                            }}
                          >
                            <ExternalLink size={14} />
                          </a>

                          {/* Alternar Ativo/Inativo */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(cat)}
                            title={isActive ? 'Desativar categoria' : 'Ativar categoria'}
                            style={{
                              width: 30, height: 30, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              background: '#f8fafc', border: '1px solid #e2e8f0', color: isActive ? '#16a34a' : '#94a3b8', cursor: 'pointer'
                            }}
                          >
                            {isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                          </button>

                          {/* Editar */}
                          <button
                            type="button"
                            onClick={() => openEditModal(cat)}
                            title="Editar categoria"
                            style={{
                              width: 30, height: 30, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', cursor: 'pointer'
                            }}
                          >
                            <Edit2 size={14} />
                          </button>

                          {/* Excluir */}
                          <button
                            type="button"
                            onClick={() => handleDelete(cat)}
                            title={cat.products_count > 0 ? 'Não é possível excluir com produtos vinculados' : 'Excluir categoria'}
                            disabled={cat.products_count > 0}
                            style={{
                              width: 30, height: 30, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              background: '#fef2f2', border: '1px solid #fecaca', color: cat.products_count > 0 ? '#cbd5e1' : '#dc2626',
                              cursor: cat.products_count > 0 ? 'not-allowed' : 'pointer'
                            }}
                          >
                            <Trash2 size={14} />
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

      {/* Modal de Criação / Edição */}
      {modalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, width: '100%', maxWidth: 580,
            maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            padding: 28, boxSizing: 'border-box'
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '0 0 16px' }}>
              {editingCategory ? 'Editar Categoria do Site' : 'Nova Categoria do Site'}
            </h2>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Nome */}
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Nome da Categoria *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => handleNameChange(e.target.value)}
                  placeholder="Ex: Labirintos, Colorir, Caça-palavras..."
                  required
                  style={{
                    width: '100%', height: 40, borderRadius: 8, border: '1px solid #cbd5e1',
                    padding: '0 12px', fontSize: 13.5, boxSizing: 'border-box', outline: 'none'
                  }}
                />
              </div>

              {/* Slug */}
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Slug (URL no site) *
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>/categoria/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={e => {
                      setSlug(generateSlug(e.target.value))
                      setSlugManuallyEdited(true)
                    }}
                    placeholder="labirintos"
                    required
                    style={{
                      flex: 1, height: 40, borderRadius: 8, border: '1px solid #cbd5e1',
                      padding: '0 12px', fontSize: 13.5, boxSizing: 'border-box', outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Descrição para a Vitrine
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Atividades bíblicas de labirinto para aprender brincando..."
                  style={{
                    width: '100%', borderRadius: 8, border: '1px solid #cbd5e1',
                    padding: '10px 12px', fontSize: 13, boxSizing: 'border-box', outline: 'none', resize: 'vertical'
                  }}
                />
              </div>

              {/* Ícone e Ordem */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    Ícone / Emoji
                  </label>
                  <input
                    type="text"
                    value={icon}
                    onChange={e => setIcon(e.target.value)}
                    placeholder="🎨 ou 🧩"
                    style={{
                      width: '100%', height: 40, borderRadius: 8, border: '1px solid #cbd5e1',
                      padding: '0 12px', fontSize: 13.5, boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    Ordem de Exibição
                  </label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={e => setSortOrder(Number(e.target.value))}
                    style={{
                      width: '100%', height: 40, borderRadius: 8, border: '1px solid #cbd5e1',
                      padding: '0 12px', fontSize: 13.5, boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Capa URL */}
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  URL da Imagem / Banner da Categoria (Opcional)
                </label>
                <input
                  type="url"
                  value={coverUrl}
                  onChange={e => setCoverUrl(e.target.value)}
                  placeholder="https://..."
                  style={{
                    width: '100%', height: 40, borderRadius: 8, border: '1px solid #cbd5e1',
                    padding: '0 12px', fontSize: 13.5, boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Status */}
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Status de Publicação
                </label>
                <div style={{ display: 'flex', gap: 12 }}>
                  {[
                    { id: 'active', label: 'Publicado' },
                    { id: 'draft', label: 'Rascunho' },
                    { id: 'archived', label: 'Inativo' }
                  ].map(item => (
                    <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="status"
                        checked={status === item.id}
                        onChange={() => setStatus(item.id as any)}
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Visibilidade */}
              <div style={{ background: '#f8fafc', padding: 14, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 10, textTransform: 'uppercase' }}>
                  Onde Exibir no Site Público
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, cursor: 'pointer' }}>
                    <input type="checkbox" checked={showInSite} onChange={e => setShowInSite(e.target.checked)} />
                    <span>Mostrar no site</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, cursor: 'pointer' }}>
                    <input type="checkbox" checked={showInMenu} onChange={e => setShowInMenu(e.target.checked)} />
                    <span>Mostrar no menu</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, cursor: 'pointer' }}>
                    <input type="checkbox" checked={showInFooter} onChange={e => setShowInFooter(e.target.checked)} />
                    <span>Mostrar no rodapé</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, cursor: 'pointer' }}>
                    <input type="checkbox" checked={showInHome} onChange={e => setShowInHome(e.target.checked)} />
                    <span>Destacar na Home</span>
                  </label>
                </div>
              </div>

              {/* SEO */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 10 }}>
                  SEO (Otimização para o Google)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <input
                    type="text"
                    placeholder="Título SEO (Meta Title)"
                    value={metaTitle}
                    onChange={e => setMetaTitle(e.target.value)}
                    style={{
                      width: '100%', height: 38, borderRadius: 8, border: '1px solid #cbd5e1',
                      padding: '0 12px', fontSize: 12.5, boxSizing: 'border-box'
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Descrição SEO (Meta Description)"
                    value={metaDescription}
                    onChange={e => setMetaDescription(e.target.value)}
                    style={{
                      width: '100%', height: 38, borderRadius: 8, border: '1px solid #cbd5e1',
                      padding: '0 12px', fontSize: 12.5, boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Botões do Modal */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={isSaving}
                  style={{
                    height: 38, padding: '0 18px', background: '#fff', border: '1px solid #cbd5e1',
                    borderRadius: 8, fontSize: 13, color: '#475569', cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{
                    height: 38, padding: '0 20px', background: '#2563eb', border: 'none',
                    borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer'
                  }}
                >
                  {isSaving ? 'Salvando...' : editingCategory ? 'Salvar Alterações' : 'Criar e Publicar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
