import React, { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, ExternalLink, BookOpen } from 'lucide-react'
import { supabase } from '@comdeuskids/supabase'
import { Collection } from '@comdeuskids/types'
import { useToast } from '../../hooks/useToast'

export default function SiteColecoes() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [sortOrder, setSortOrder] = useState<number>(0)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadCollections()
  }, [])

  const loadCollections = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) {
        // Se tabela não existir ainda no Supabase remoto, mock para visualização
        if (error.message.includes('relation') || error.code === '42P01') {
          setCollections([
            { id: '1', name: 'Histórias de Jesus', slug: 'historias-de-jesus', description: 'O ministério, milagres e parábolas de Cristo.', sort_order: 1, created_at: new Date().toISOString() },
            { id: '2', name: 'Heróis da Fé', slug: 'herois-da-fe', description: 'Davi, Moisés, Daniel, Ester e grandes personagens bíblicos.', sort_order: 2, created_at: new Date().toISOString() },
            { id: '3', name: 'Antigo Testamento para Crianças', slug: 'antigo-testamento', description: 'A criação do mundo, a arca de Noé e os profetas.', sort_order: 3, created_at: new Date().toISOString() }
          ])
          return
        }
        throw error
      }
      setCollections(data || [])
    } catch (err: any) {
      console.error(err)
      toast.error('Erro ao carregar coleções.')
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

  const openCreateModal = () => {
    setEditingCollection(null)
    setName('')
    setSlug('')
    setDescription('')
    setCoverUrl('')
    setSortOrder(collections.length + 1)
    setModalOpen(true)
  }

  const openEditModal = (c: Collection) => {
    setEditingCollection(c)
    setName(c.name)
    setSlug(c.slug)
    setDescription(c.description || '')
    setCoverUrl(c.cover_url || '')
    setSortOrder(c.sort_order || 0)
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSaving(true)
    try {
      const finalSlug = slug.trim() || generateSlug(name)
      const payload = {
        name: name.trim(),
        slug: finalSlug,
        description: description.trim() || null,
        cover_url: coverUrl.trim() || null,
        sort_order: Number(sortOrder) || 0,
        active: true
      }

      if (editingCollection) {
        const { error } = await supabase.from('collections').update(payload).eq('id', editingCollection.id)
        if (error) throw error
        toast.success(`Coleção "${name}" atualizada!`)
      } else {
        const { error } = await supabase.from('collections').insert([payload])
        if (error) throw error
        toast.success(`Coleção "${name}" criada com sucesso!`)
      }

      setModalOpen(false)
      loadCollections()
    } catch (err: any) {
      toast.error('Erro ao salvar coleção: ' + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (c: Collection) => {
    if (!window.confirm(`Tem certeza de que deseja excluir a coleção "${c.name}"?`)) return
    try {
      const { error } = await supabase.from('collections').delete().eq('id', c.id)
      if (error) throw error
      toast.success('Coleção excluída.')
      loadCollections()
    } catch (err: any) {
      toast.error('Erro ao excluir: ' + err.message)
    }
  }

  const filtered = collections.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 48 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            Coleções Editoriais do Site
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
            Agrupamentos e séries temáticas de materiais digitais e historinhas.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, background: '#2563eb',
            color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px',
            fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,0.25)'
          }}
        >
          <Plus size={16} /> Nova Coleção
        </button>
      </div>

      <div style={{
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 16px',
        marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12
      }}>
        <Search size={18} color="#94a3b8" />
        <input
          type="text"
          placeholder="Buscar coleção por título ou slug..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ border: 'none', outline: 'none', width: '100%', fontSize: 13, color: '#1e293b' }}
        />
      </div>

      <div style={{
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '14px 16px', width: 60 }}>Ordem</th>
              <th style={{ padding: '14px 16px' }}>Coleção</th>
              <th style={{ padding: '14px 16px' }}>Slug / Rota</th>
              <th style={{ padding: '14px 16px' }}>Descrição</th>
              <th style={{ padding: '14px 16px', textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Carregando coleções...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Nenhuma coleção encontrada.</td></tr>
            ) : (
              filtered.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 16px', color: '#64748b', fontWeight: 600 }}>#{c.sort_order}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{c.name}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 12, background: '#f1f5f9', padding: '3px 8px', borderRadius: 6, color: '#334155' }}>
                      /colecao/{c.slug}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#64748b' }}>
                    {c.description || '—'}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <a
                        href={`http://localhost:3000/colecao/${c.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        title="Ver no site"
                        style={{ width: 30, height: 30, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569' }}
                      >
                        <ExternalLink size={14} />
                      </a>
                      <button
                        type="button"
                        onClick={() => openEditModal(c)}
                        style={{ width: 30, height: 30, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', cursor: 'pointer' }}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c)}
                        style={{ width: 30, height: 30, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', cursor: 'pointer' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480, padding: 28, boxSizing: 'border-box' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '0 0 16px' }}>
              {editingCollection ? 'Editar Coleção' : 'Nova Coleção'}
            </h2>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Nome da Coleção *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => { setName(e.target.value); if (!editingCollection) setSlug(generateSlug(e.target.value)) }}
                  required
                  placeholder="Ex: Histórias de Jesus, Heróis da Fé..."
                  style={{ width: '100%', height: 40, borderRadius: 8, border: '1px solid #cbd5e1', padding: '0 12px', fontSize: 13.5, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={e => setSlug(generateSlug(e.target.value))}
                  required
                  style={{ width: '100%', height: 40, borderRadius: 8, border: '1px solid #cbd5e1', padding: '0 12px', fontSize: 13.5, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Descrição</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Descrição da série temática..."
                  style={{ width: '100%', borderRadius: 8, border: '1px solid #cbd5e1', padding: '10px 12px', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Ordem</label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={e => setSortOrder(Number(e.target.value))}
                  style={{ width: '100%', height: 40, borderRadius: 8, border: '1px solid #cbd5e1', padding: '0 12px', fontSize: 13.5, boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setModalOpen(false)} style={{ height: 38, padding: '0 18px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13, color: '#475569', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" disabled={isSaving} style={{ height: 38, padding: '0 20px', background: '#2563eb', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' }}>Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
