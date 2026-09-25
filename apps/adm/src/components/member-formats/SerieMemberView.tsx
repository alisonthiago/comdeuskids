import React, { useState } from 'react'
import { Clapperboard, Plus, Play, Clock, Film, BookOpen, Trash2, Edit3, CheckCircle } from 'lucide-react'

export type Episode = {
  id: string
  number: number
  title: string
  duration: string
  synopsis: string
  thumbnailUrl?: string
  videoUrl?: string
}

export type Season = {
  id: string
  number: number
  title: string
  episodes: Episode[]
}

export default function SerieMemberView({
  productId,
  productTitle,
  activeTab
}: {
  productId: string
  productTitle: string
  activeTab: string
}) {
  const storageKey = `cdk-series-${productId}`

  const initialSeasons: Season[] = [
    {
      id: 's1',
      number: 1,
      title: 'Temporada 1: O Começo de Tudo (Gênesis)',
      episodes: [
        {
          id: 'ep1',
          number: 1,
          title: 'A Criação do Mundo',
          duration: '14 min',
          synopsis: 'Deus cria o céu, a terra, as plantas, os animais e o primeiro homem com muito amor.'
        },
        {
          id: 'ep2',
          number: 2,
          title: 'A Arca de Noé e o Grande Arco-Íris',
          duration: '18 min',
          synopsis: 'A obediência de Noé e a aliança eterna que Deus fez com toda a criação.'
        },
        {
          id: 'ep3',
          number: 3,
          title: 'A Torre de Babel e a Confusão das Línguas',
          duration: '12 min',
          synopsis: 'A importância da humildade e de confiar na vontade do Senhor.'
        }
      ]
    },
    {
      id: 's2',
      number: 2,
      title: 'Temporada 2: Os Heróis da Fé',
      episodes: [
        {
          id: 'ep4',
          number: 1,
          title: 'Davi e o Gigante Golias',
          duration: '16 min',
          synopsis: 'Com apenas uma funda, cinco pedrinhas e fé no Deus vivo, o jovem pastor vence o gigante.'
        }
      ]
    }
  ]

  const [seasons, setSeasons] = useState<Season[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      return saved ? JSON.parse(saved) : initialSeasons
    } catch {
      return initialSeasons
    }
  })

  const [activeSeasonId, setActiveSeasonId] = useState<string>(seasons[0]?.id || 's1')
  const [isEpModalOpen, setIsEpModalOpen] = useState(false)
  const [newEpTitle, setNewEpTitle] = useState('')
  const [newEpDuration, setNewEpDuration] = useState('15 min')
  const [newEpSynopsis, setNewEpSynopsis] = useState('')

  const activeSeason = seasons.find(s => s.id === activeSeasonId) || seasons[0]

  const saveSeasons = (updated: Season[]) => {
    setSeasons(updated)
    localStorage.setItem(storageKey, JSON.stringify(updated))
  }

  const handleAddSeason = () => {
    const nextNumber = seasons.length + 1
    const newSeason: Season = {
      id: `season-${Date.now()}`,
      number: nextNumber,
      title: `Temporada ${nextNumber}`,
      episodes: []
    }
    const updated = [...seasons, newSeason]
    saveSeasons(updated)
    setActiveSeasonId(newSeason.id)
  }

  const handleAddEpisode = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEpTitle.trim() || !activeSeason) return

    const nextEpNumber = (activeSeason.episodes?.length || 0) + 1
    const newEpisode: Episode = {
      id: `ep-${Date.now()}`,
      number: nextEpNumber,
      title: newEpTitle.trim(),
      duration: newEpDuration.trim() || '15 min',
      synopsis: newEpSynopsis.trim()
    }

    const updated = seasons.map(s => {
      if (s.id === activeSeason.id) {
        return { ...s, episodes: [...(s.episodes || []), newEpisode] }
      }
      return s
    })

    saveSeasons(updated)
    setNewEpTitle('')
    setNewEpSynopsis('')
    setIsEpModalOpen(false)
  }

  const handleDeleteEpisode = (epId: string) => {
    if (!window.confirm('Tem certeza que deseja remover este episódio?')) return
    const updated = seasons.map(s => {
      if (s.id === activeSeason.id) {
        return { ...s, episodes: s.episodes.filter(e => e.id !== epId) }
      }
      return s
    })
    saveSeasons(updated)
  }

  if (activeTab === 'materiais') {
    return (
      <div style={{ marginTop: 20, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
          Materiais de Apoio & Guias da Série
        </h3>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 18 }}>
          Disponibilize PDFs de atividades, desenhos de colorir e perguntas para debate familiar de cada episódio.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 6, background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 11 }}>PDF</div>
              <div>
                <b style={{ display: 'block', fontSize: 13, color: '#1e293b' }}>Guia de Perguntas para a Família.pdf</b>
                <small style={{ color: '#94a3b8' }}>Temporada 1 · 2.4 MB</small>
              </div>
            </div>
            <button style={{ padding: '6px 12px', background: '#eff4fe', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: 5, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Baixar</button>
          </div>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 6, background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 11 }}>ZIP</div>
              <div>
                <b style={{ display: 'block', fontSize: 13, color: '#1e293b' }}>Desenhos para Colorir dos Personagens.zip</b>
                <small style={{ color: '#94a3b8' }}>15 ilustrações · 18 MB</small>
              </div>
            </div>
            <button style={{ padding: '6px 12px', background: '#eff4fe', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: 5, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Baixar</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ marginTop: 20 }}>
      {/* Seletor de Temporadas */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {seasons.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSeasonId(s.id)}
              style={{
                padding: '8px 16px',
                borderRadius: 20,
                border: s.id === activeSeason?.id ? '2px solid #2563eb' : '1px solid #cbd5e1',
                background: s.id === activeSeason?.id ? '#eff4fe' : '#fff',
                color: s.id === activeSeason?.id ? '#1e40af' : '#475569',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {s.title} ({s.episodes?.length || 0})
            </button>
          ))}
          <button
            onClick={handleAddSeason}
            style={{
              padding: '7px 14px',
              borderRadius: 20,
              border: '1px dashed #94a3b8',
              background: 'none',
              color: '#475569',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <Plus size={14} /> Nova Temporada
          </button>
        </div>

        <button
          className="dark"
          onClick={() => setIsEpModalOpen(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 6, fontWeight: 600, cursor: 'pointer', background: '#1e293b', color: '#fff' }}
        >
          <Plus size={16} /> Adicionar Episódio
        </button>
      </div>

      {/* Lista de Episódios da Temporada */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {(!activeSeason || !activeSeason.episodes || activeSeason.episodes.length === 0) ? (
          <div style={{ background: '#fff', border: '1px dashed #cbd5e1', borderRadius: 8, padding: '40px 20px', textAlign: 'center' }}>
            <Clapperboard size={36} color="#94a3b8" style={{ margin: '0 auto 10px' }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#334155' }}>Nenhum episódio cadastrado nesta temporada</h3>
            <p style={{ fontSize: 13, color: '#64748b', maxWidth: 400, margin: '6px auto 16px' }}>
              Adicione os episódios em vídeo com duração e sinopse bíblica.
            </p>
            <button
              onClick={() => setIsEpModalOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 6, fontWeight: 600, cursor: 'pointer', background: '#2563eb', color: '#fff', border: 'none' }}
            >
              <Plus size={16} /> Adicionar Primeiro Episódio
            </button>
          </div>
        ) : (
          activeSeason.episodes.map(ep => (
            <div
              key={ep.id}
              style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                flexWrap: 'wrap'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 260, flex: 1 }}>
                <div
                  style={{
                    width: 72,
                    height: 48,
                    borderRadius: 6,
                    background: '#0f172a',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}
                >
                  <Play size={20} fill="#fff" />
                  <span style={{ position: 'absolute', bottom: 2, right: 4, fontSize: 9, opacity: 0.8 }}>EP {ep.number}</span>
                </div>
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: 0 }}>
                    Episódio {ep.number}: {ep.title}
                  </h4>
                  {ep.synopsis && (
                    <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0' }}>{ep.synopsis}</p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#94a3b8' }}>
                    <Clock size={12} />
                    <span>Duração: <strong>{ep.duration}</strong></span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  title="Reproduzir episódio"
                  onClick={() => alert(`Iniciando player do Episódio ${ep.number}: ${ep.title}`)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 12px', background: '#eff4fe', border: '1px solid #bfdbfe', borderRadius: 6, fontSize: 12, fontWeight: 600, color: '#2563eb', cursor: 'pointer' }}
                >
                  <Play size={14} /> Assistir
                </button>
                <button
                  title="Excluir episódio"
                  onClick={() => handleDeleteEpisode(ep.id)}
                  style={{ padding: '7px 10px', background: '#fff', border: '1px solid #fecaca', borderRadius: 6, color: '#ef4444', cursor: 'pointer' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isEpModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 10, width: '100%', maxWidth: 500, padding: 24, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
              Novo Episódio - {activeSeason?.title}
            </h3>
            <p style={{ fontSize: 12, color: '#64748b', marginBottom: 18 }}>
              Informe o título, duração e a sinopse do episódio bíblico.
            </p>

            <form onSubmit={handleAddEpisode}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Título do episódio *
                <input
                  required
                  value={newEpTitle}
                  onChange={e => setNewEpTitle(e.target.value)}
                  placeholder="Ex.: Daniel na Cova dos Leões"
                  style={{ display: 'block', width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 6, marginTop: 4, fontSize: 13 }}
                />
              </label>

              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', margin: '14px 0 6px' }}>
                Sinopse do episódio
                <textarea
                  value={newEpSynopsis}
                  onChange={e => setNewEpSynopsis(e.target.value)}
                  placeholder="Conte resumidamente o que as crianças vão aprender neste episódio..."
                  style={{ display: 'block', width: '100%', height: 75, padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 6, marginTop: 4, fontSize: 13 }}
                />
              </label>

              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginTop: 14 }}>
                Duração estimada
                <input
                  value={newEpDuration}
                  onChange={e => setNewEpDuration(e.target.value)}
                  placeholder="Ex.: 18 min"
                  style={{ display: 'block', width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6, marginTop: 4, fontSize: 13 }}
                />
              </label>

              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsEpModalOpen(false)}
                  style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff', fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', borderRadius: 6, background: '#2563eb', color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Salvar Episódio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
