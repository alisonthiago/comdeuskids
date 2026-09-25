import React, { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, ExternalLink, Sparkles } from 'lucide-react'
import { supabase } from '@comdeuskids/supabase'
import { Theme } from '@comdeuskids/types'
import { useToast } from '../../hooks/useToast'

export default function SiteTemas() {
  const [themes, setThemes] = useState<Theme[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [sortOrder, setSortOrder] = useState<number>(0)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadThemes()
  }, [])

  const loadThemes = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('themes')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) throw error
      setThemes(data || [])
    } catch (err: any) {
      console.error(err)
      toast.error('Erro ao carregar temas.')
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
    setEditingTheme(null)
    setName('')
    setSlug('')
    setDescription('')
    setSortOrder(themes.length + 1)
    setModalOpen(true)
  }

  const openEditModal = (t: Theme) => {
    setEditingTheme(t)
    setName(t.name)
    setSlug(t.slug)
    setDescription(t.description || '')
    setSortOrder(t.sort_order || 0)
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
        sort_order: Number(sortOrder) || 0,
        active: true
      }

      if (editingTheme) {
        const { error } = await supabase.from('themes').update(payload).eq('id', editingTheme.id)
        if (error) throw error
        toast.success(`Tema "${name}" atualizado!`)
      } else {
        const { error } = await supabase.from('themes').insert([payload])
        if (error) throw error
        toast.success(`Tema "${name}" criado com sucesso!`)
      }

      setModalOpen(false)
      loadThemes()
    } catch (err: any) {
      toast.error('Erro ao salvar tema: ' + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (t: Theme) => {
    if (!window.confirm(`Tem certeza de que deseja excluir o tema "${t.name}"?`)) return
    try {
      const { error } = await supabase.from('themes').delete().eq('id', t.id)
      if (error) throw error
      toast.success('Tema excluído com sucesso.')
      loadThemes()
    } catch (err: any) {
      toast.error('Erro ao excluir: ' + err.message)
    }
  }

  const filteredThemes = themes.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 48 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            Temas Bíblicos do Site
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
            Assuntos e personagens das Escrituras (Jesus, Oração, Fé, Páscoa, Criação...).
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
          <Plus size={16} /> Novo Tema
        </button>
      </div>

      <div style={{
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 16px',
        marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12
      }}>
        <Search size={18} color="#94a3b8" />
        <input
          type="text"
          placeholder="Buscar tema por nome ou slug..."
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
              <th style={{ padding: '14px 16px' }}>Tema</th>
              <th style={{ padding: '14px 16px' }}>Slug / Rota</th>
              <th style={{ padding: '14px 16px' }}>Descrição</th>
              <th style={{ padding: '14px 16px', textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Carregando temas...</td></tr>
            ) : filteredThemes.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Nenhum tema encontrado.</td></tr>
            ) : (
              filteredThemes.map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 16px', color: '#64748b', fontWeight: 600 }}>#{t.sort_order}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{t.name}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 12, background: '#f1f5f9', padding: '3px 8px', borderRadius: 6, color: '#334155' }}>
                      /tema/{t.slug}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#64748b' }}>
                    {t.description || '—'}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <a
                        href={`http://localhost:3000/tema/${t.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        title="Ver no site"
                        style={{ width: 30, height: 30, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569' }}
                      >
                        <ExternalLink size={14} />
                      </a>
                      <button
                        type="button"
                        onClick={() => openEditModal(t)}
                        style={{ width: 30, height: 30, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', cursor: 'pointer' }}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(t)}
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
              {editingTheme ? 'Editar Tema Bíblico' : 'Novo Tema Bíblico'}
            </h2>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Nome do Tema *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => { setName(e.target.value); if (!editingTheme) setSlug(generateSlug(e.target.value)) }}
                  required
                  placeholder="Ex: Jesus, Oração, Páscoa..."
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
                  placeholder="Descrição do assunto bíblico..."
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
