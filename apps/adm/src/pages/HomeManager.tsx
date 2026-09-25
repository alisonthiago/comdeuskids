import React, { useState, useEffect } from 'react'
import { cmsService } from '../lib/cmsService'
import { appUrl } from '../lib/appUrl'
import { StreamCarousel, AppHomeConfig, StreamContent } from '@comdeuskids/types'
import {
  Sparkles, Layers, Plus, Trash2, ArrowUp, ArrowDown,
  Eye, Check, ExternalLink, Save, Edit2
} from 'lucide-react'

export default function HomeManager() {
  const [heroConfig, setHeroConfig] = useState<AppHomeConfig>({
    hero_title: '',
    hero_subtitle: '',
    hero_banner_url: '',
    is_active: true
  })
  const [carousels, setCarousels] = useState<StreamCarousel[]>([])
  const [contents, setContents] = useState<StreamContent[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCarousel, setEditingCarousel] = useState<StreamCarousel | null>(null)

  // Carousel form
  const [cTitle, setCTitle] = useState('')
  const [cSlug, setCSlug] = useState('')
  const [cSourceType, setCSourceType] = useState<'category' | 'type' | 'manual' | 'new' | 'featured'>('category')
  const [cFilterValue, setCFilterValue] = useState('Histórias Bíblicas')

  const loadData = async () => {
    setLoading(false)
    const [h, c, items] = await Promise.all([
      cmsService.getHomeConfig(),
      cmsService.getCarousels(),
      cmsService.getContents()
    ])
    setHeroConfig(h)
    setCarousels(c)
    setContents(items)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault()
    await cmsService.saveHomeConfig(heroConfig)
    alert('Destaque Principal (Hero) atualizado com sucesso no APP!')
  }

  const handleOpenAddCarousel = () => {
    setEditingCarousel(null)
    setCTitle('')
    setCSlug('')
    setCSourceType('category')
    setCFilterValue('Histórias Bíblicas')
    setModalOpen(true)
  }

  const handleSaveCarousel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cTitle.trim()) return

    await cmsService.saveCarousel({
      id: editingCarousel?.id,
      title: cTitle.trim(),
      slug: cSlug.trim() || cTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      source_type: cSourceType,
      filter_value: cFilterValue,
      sort_order: editingCarousel ? editingCarousel.sort_order : carousels.length + 1,
      is_active: true
    })

    setModalOpen(false)
    await loadData()
  }

  const handleDeleteCarousel = async (id: string) => {
    if (window.confirm('Excluir este carrossel da Home do APP?')) {
      await cmsService.deleteCarousel(id)
      await loadData()
    }
  }

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= carousels.length) return

    const updated = [...carousels]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp

    // Reatribuir sort_order
    for (let i = 0; i < updated.length; i++) {
      updated[i].sort_order = i + 1
      await cmsService.saveCarousel(updated[i])
    }

    setCarousels(updated)
  }

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e1b4b', margin: 0 }}>
            Gerenciador da Home do APP
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: '4px 0 0' }}>
            Configure o Destaque Principal (Hero Banner) e os carrosséis dinâmicos sem editar código.
          </p>
        </div>

        <a
          href={`${appUrl}/inicio`}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: 8, height: 40, padding: '0 18px',
            background: '#fff', border: '1px solid #cbd5e1', borderRadius: 8,
            fontSize: 13, fontWeight: 600, color: '#475569', textDecoration: 'none'
          }}
        >
          <ExternalLink size={16} />
          Ver Home no APP
        </a>
      </div>

      {/* SEÇÃO 1: DESTAQUE PRINCIPAL (HERO BANNER) */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 28, marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <Sparkles size={20} color="#d97706" />
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Hero Banner (Destaque do Topo da Home)
          </h2>
        </div>

        <form onSubmit={handleSaveHero} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Vincular a um Conteúdo do Catálogo
              </label>
              <select
                value={heroConfig.hero_content_id || ''}
                onChange={e => {
                  const sel = contents.find(c => c.id === e.target.value)
                  if (sel) {
                    setHeroConfig({
                      ...heroConfig,
                      hero_content_id: sel.id,
                      hero_title: sel.title,
                      hero_subtitle: sel.description || '',
                      hero_banner_url: sel.banner_url || sel.thumbnail_url
                    })
                  }
                }}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, background: '#fff' }}
              >
                <option value="">Selecione um conteúdo...</option>
                {contents.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Título em Destaque
              </label>
              <input
                type="text"
                value={heroConfig.hero_title || ''}
                onChange={e => setHeroConfig({ ...heroConfig, hero_title: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
              Subtítulo / Sinopse do Hero
            </label>
            <input
              type="text"
              value={heroConfig.hero_subtitle || ''}
              onChange={e => setHeroConfig({ ...heroConfig, hero_subtitle: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
              URL da Imagem de Fundo em Alta Resolução (Banner Horizontal)
            </label>
            <input
              type="text"
              value={heroConfig.hero_banner_url || ''}
              onChange={e => setHeroConfig({ ...heroConfig, hero_banner_url: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
            />
          </div>

          {/* Preview do Banner */}
          {heroConfig.hero_banner_url && (
            <div style={{ position: 'relative', height: 160, borderRadius: 10, overflow: 'hidden', background: '#000', marginTop: 8 }}>
              <img src={heroConfig.hero_banner_url} alt="Banner Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
              <div style={{ position: 'absolute', bottom: 16, left: 20, color: '#fff' }}>
                <h3 style={{ margin: 0, fontSize: 18 }}>{heroConfig.hero_title}</h3>
                <p style={{ margin: '4px 0 0', fontSize: 12, opacity: 0.9 }}>{heroConfig.hero_subtitle}</p>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
            <button
              type="submit"
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px',
                background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8,
                fontSize: 13, fontWeight: 700, cursor: 'pointer'
              }}
            >
              <Save size={16} />
              Salvar Destaque Hero
            </button>
          </div>
        </form>
      </div>

      {/* SEÇÃO 2: CARROSSÉIS DINÂMICOS DA HOME */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Layers size={20} color="#7c3aed" />
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', margin: 0 }}>
              Carrosséis da Home ({carousels.length})
            </h2>
          </div>

          <button
            onClick={handleOpenAddCarousel}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
              background: '#ede9fe', color: '#7c3aed', border: 'none', borderRadius: 8,
              fontSize: 13, fontWeight: 700, cursor: 'pointer'
            }}
          >
            <Plus size={16} />
            Novo Carrossel
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {carousels.map((car, idx) => (
            <div
              key={car.id}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 18px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#94a3b8', width: 24 }}>
                  #{idx + 1}
                </span>

                <div>
                  <h4 style={{ margin: 0, fontSize: 15, color: '#1e293b' }}>{car.title}</h4>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4, fontSize: 12, color: '#64748b' }}>
                    <span>Origem: <strong>{car.source_type}</strong></span>
                    {car.filter_value && <span>• Filtro: <strong>{car.filter_value}</strong></span>}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  disabled={idx === 0}
                  onClick={() => handleMove(idx, 'up')}
                  style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: 6, padding: 6, cursor: idx === 0 ? 'not-allowed' : 'pointer', opacity: idx === 0 ? 0.3 : 1 }}
                  title="Mover para Cima"
                >
                  <ArrowUp size={15} />
                </button>

                <button
                  disabled={idx === carousels.length - 1}
                  onClick={() => handleMove(idx, 'down')}
                  style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: 6, padding: 6, cursor: idx === carousels.length - 1 ? 'not-allowed' : 'pointer', opacity: idx === carousels.length - 1 ? 0.3 : 1 }}
                  title="Mover para Baixo"
                >
                  <ArrowDown size={15} />
                </button>

                <button
                  onClick={() => {
                    setEditingCarousel(car)
                    setCTitle(car.title)
                    setCSlug(car.slug)
                    setCSourceType(car.source_type)
                    setCFilterValue(car.filter_value || '')
                    setModalOpen(true)
                  }}
                  style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: 6, padding: 6, cursor: 'pointer', color: '#7c3aed' }}
                  title="Editar Carrossel"
                >
                  <Edit2 size={15} />
                </button>

                <button
                  onClick={() => handleDeleteCarousel(car.id)}
                  style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: 6, padding: 6, cursor: 'pointer', color: '#ef4444' }}
                  title="Excluir"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Adicionar / Editar Carrossel */}
      {modalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20
        }} onClick={() => setModalOpen(false)}>
          <div style={{ background: '#fff', borderRadius: 14, maxWidth: 500, width: '100%', padding: 28 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18, color: '#1e293b' }}>
              {editingCarousel ? 'Editar Carrossel' : 'Novo Carrossel da Home'}
            </h3>

            <form onSubmit={handleSaveCarousel} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                  Título do Carrossel *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Histórias Bíblicas, Páscoa em Família..."
                  value={cTitle}
                  onChange={e => setCTitle(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                  Tipo de Origem
                </label>
                <select
                  value={cSourceType}
                  onChange={e => setCSourceType(e.target.value as any)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, background: '#fff' }}
                >
                  <option value="category">Por Categoria</option>
                  <option value="type">Por Tipo (filme, série, clipe, música)</option>
                  <option value="featured">Destaques</option>
                  <option value="new">Novidades Recentes</option>
                </select>
              </div>

              {cSourceType === 'category' && (
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                    Categoria do Filtro
                  </label>
                  <input
                    type="text"
                    value={cFilterValue}
                    onChange={e => setCFilterValue(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </div>
              )}

              {cSourceType === 'type' && (
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                    Tipo Específico
                  </label>
                  <select
                    value={cFilterValue}
                    onChange={e => setCFilterValue(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, background: '#fff' }}
                  >
                    <option value="movie">Filmes</option>
                    <option value="series">Séries</option>
                    <option value="story">Histórias Bíblicas</option>
                    <option value="song">Músicas</option>
                    <option value="clip">Clipes</option>
                    <option value="lesson">Lições</option>
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
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
                  Salvar Carrossel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
