import React, { useState, useEffect } from 'react'
import { cmsService, DBAvatar } from '../lib/cmsService'
import { Sparkles, Plus, Edit2, Trash2, Check, X, ArrowUp, ArrowDown, User } from 'lucide-react'

export default function AvataresManager() {
  const [avatars, setAvatars] = useState<DBAvatar[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingAvatar, setEditingAvatar] = useState<DBAvatar | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    const list = await cmsService.getAvatars(true)
    setAvatars(list)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleToggleActive = async (id: string, current: boolean) => {
    await cmsService.toggleAvatarActive(id, !current)
    await loadData()
    setToastMessage(`Avatar ${!current ? 'ativado' : 'desativado'} com sucesso!`)
    setTimeout(() => setToastMessage(null), 2500)
  }

  const handleOpenAdd = () => {
    setEditingAvatar({
      id: '',
      name: '',
      subtitle: '',
      category: 'heroes',
      role: 'kid',
      image_url: '/avatars/novo.png',
      icon_emoji: '⭐',
      bg_gradient: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
      description: '',
      sort_order: avatars.length + 1,
      is_active: true
    })
    setModalOpen(true)
  }

  const handleEdit = (avatar: DBAvatar) => {
    setEditingAvatar({ ...avatar })
    setModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Deseja excluir este avatar da biblioteca?')) {
      await cmsService.deleteAvatar(id)
      await loadData()
      setToastMessage('Avatar excluído!')
      setTimeout(() => setToastMessage(null), 2500)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAvatar || !editingAvatar.name.trim()) return

    const avatarId =
      editingAvatar.id.trim() ||
      editingAvatar.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    await cmsService.saveAvatar({
      ...editingAvatar,
      id: avatarId,
      name: editingAvatar.name.trim()
    })

    setModalOpen(false)
    await loadData()
    setToastMessage('Avatar salvo com sucesso!')
    setTimeout(() => setToastMessage(null), 2500)
  }

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e1b4b', margin: 0 }}>
            Biblioteca de Avatares dos Perfis Infantis
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: '4px 0 0' }}>
            Gerencie os personagens disponíveis para as crianças escolherem em seus perfis no Com Deus Kids Play.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#7c3aed', color: '#fff', padding: '10px 18px',
            borderRadius: 10, border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)'
          }}
        >
          <Plus size={16} /> Novo Personagem / Avatar
        </button>
      </div>

      {toastMessage && (
        <div style={{
          background: '#dcfce7', color: '#15803d', padding: '10px 16px',
          borderRadius: 8, fontSize: 13, fontWeight: 700, marginBottom: 20
        }}>
          {toastMessage}
        </div>
      )}

      {loading ? (
        <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>Carregando biblioteca de avatares...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          {avatars.map(avatar => {
            const catBadge =
              avatar.category === 'heroes'
                ? { label: 'Heróis Bíblicos', bg: '#fef3c7', color: '#b45309' }
                : avatar.category === 'animals'
                ? { label: 'Animais da Bíblia', bg: '#dcfce7', color: '#15803d' }
                : avatar.category === 'teachers'
                ? { label: 'Educadores', bg: '#ede9fe', color: '#7c3aed' }
                : { label: 'Histórias Bíblicas', bg: '#e0f2fe', color: '#0369a1' }

            return (
              <div
                key={avatar.id}
                style={{
                  background: '#fff',
                  border: avatar.is_active ? '1px solid #e2e8f0' : '1px dashed #cbd5e1',
                  opacity: avatar.is_active ? 1 : 0.7,
                  borderRadius: 16,
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 999,
                    background: catBadge.bg, color: catBadge.color
                  }}>
                    {catBadge.label.toUpperCase()}
                  </span>

                  <button
                    onClick={() => handleToggleActive(avatar.id, avatar.is_active)}
                    style={{
                      border: 'none', background: 'transparent', cursor: 'pointer',
                      fontSize: 11, fontWeight: 700,
                      color: avatar.is_active ? '#16a34a' : '#94a3b8'
                    }}
                  >
                    ● {avatar.is_active ? 'Ativo no Play' : 'Inativo'}
                  </button>
                </div>

                {/* Avatar Preview */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: avatar.bg_gradient || 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 26, boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    {avatar.icon_emoji || '⭐'}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, color: '#0f172a' }}>{avatar.name}</h3>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{avatar.subtitle || 'Personagem CDK'}</div>
                  </div>
                </div>

                {avatar.description && (
                  <p style={{ margin: 0, fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>
                    {avatar.description}
                  </p>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>Ordem: #{avatar.sort_order}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => handleEdit(avatar)}
                      style={{ padding: '6px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(avatar.id)}
                      style={{ padding: '6px 10px', background: '#fef2f2', border: '1px solid #fee2e2', color: '#dc2626', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal Criar / Editar Avatar */}
      {modalOpen && editingAvatar && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            style={{ background: '#fff', borderRadius: 16, maxWidth: 500, width: '100%', padding: 24 }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ margin: '0 0 16px', fontSize: 18, color: '#1e293b' }}>
              {editingAvatar.id ? 'Editar Personagem / Avatar' : 'Novo Personagem para Perfis Infantis'}
            </h2>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                    Nome do Personagem
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Noé"
                    value={editingAvatar.name}
                    onChange={e => setEditingAvatar({ ...editingAvatar, name: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                    Emoji Ícone
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: ⛵"
                    value={editingAvatar.icon_emoji || ''}
                    onChange={e => setEditingAvatar({ ...editingAvatar, icon_emoji: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 16, textAlign: 'center' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                  Subtítulo / Característica
                </label>
                <input
                  type="text"
                  placeholder="Ex: Amigo dos Animais"
                  value={editingAvatar.subtitle || ''}
                  onChange={e => setEditingAvatar({ ...editingAvatar, subtitle: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                    Categoria
                  </label>
                  <select
                    value={editingAvatar.category}
                    onChange={e => setEditingAvatar({ ...editingAvatar, category: e.target.value as any })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  >
                    <option value="heroes">Heróis Bíblicos</option>
                    <option value="animals">Animais da Bíblia</option>
                    <option value="teachers">Educadores</option>
                    <option value="biblical">Histórias Bíblicas</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                    Ordem de Exibição
                  </label>
                  <input
                    type="number"
                    value={editingAvatar.sort_order}
                    onChange={e => setEditingAvatar({ ...editingAvatar, sort_order: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                  Gradiente de Fundo (CSS)
                </label>
                <input
                  type="text"
                  placeholder="linear-gradient(135deg, #10b981, #047857)"
                  value={editingAvatar.bg_gradient || ''}
                  onChange={e => setEditingAvatar({ ...editingAvatar, bg_gradient: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                  Frase de Inspiração
                </label>
                <input
                  type="text"
                  placeholder="Ex: Obediente e fiel aos mandamentos do Senhor"
                  value={editingAvatar.description || ''}
                  onChange={e => setEditingAvatar({ ...editingAvatar, description: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff', fontSize: 13, cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: 6, border: 'none', background: '#7c3aed', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                >
                  Salvar Personagem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
