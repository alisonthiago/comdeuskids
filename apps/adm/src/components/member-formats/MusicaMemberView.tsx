import React, { useState } from 'react'
import { Music, Play, Pause, Plus, Volume2, Download, Trash2, FileText, Mic2, SkipForward, SkipBack } from 'lucide-react'

export type Track = {
  id: string
  trackNumber: number
  title: string
  artist: string
  duration: string
  lyrics?: string
  hasPlayback?: boolean
}

export default function MusicaMemberView({
  productId,
  productTitle,
  activeTab
}: {
  productId: string
  productTitle: string
  activeTab: string
}) {
  const storageKey = `cdk-music-${productId}`

  const initialTracks: Track[] = [
    {
      id: 't1',
      trackNumber: 1,
      title: 'Tudo Fez Deus (Louvor da Criação)',
      artist: 'Ministério Com Deus Kids',
      duration: '03:12',
      lyrics: 'O sol no céu a brilhar,\nAs estrelas a piscar...\nTudo fez o meu Deus com tanto amor!',
      hasPlayback: true
    },
    {
      id: 't2',
      trackNumber: 2,
      title: 'Coração de Criança',
      artist: 'Ministério Com Deus Kids',
      duration: '02:45',
      lyrics: 'Vinde a mim as criancinhas,\nDisse Jesus com ternura e paz...',
      hasPlayback: true
    },
    {
      id: 't3',
      trackNumber: 3,
      title: 'A Fé de Davi',
      artist: 'Ministério Com Deus Kids',
      duration: '03:30',
      lyrics: 'Não vou temer o gigante que se levantou,\nMinha vitória é certa no Senhor!',
      hasPlayback: false
    }
  ]

  const [tracks, setTracks] = useState<Track[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      return saved ? JSON.parse(saved) : initialTracks
    } catch {
      return initialTracks
    }
  })

  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(tracks[0]?.id || null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newArtist, setNewArtist] = useState('Ministério Com Deus Kids')
  const [newDuration, setNewDuration] = useState('03:20')
  const [newLyrics, setNewLyrics] = useState('')
  const [hasPlaybackCheck, setHasPlaybackCheck] = useState(true)

  const currentTrack = tracks.find(t => t.id === currentPlayingId) || tracks[0]

  const togglePlay = (id?: string) => {
    if (id && id !== currentPlayingId) {
      setCurrentPlayingId(id)
      setIsPlaying(true)
    } else {
      setIsPlaying(prev => !prev)
    }
  }

  const handleNext = () => {
    const idx = tracks.findIndex(t => t.id === currentPlayingId)
    if (idx !== -1 && idx < tracks.length - 1) {
      setCurrentPlayingId(tracks[idx + 1].id)
      setIsPlaying(true)
    }
  }

  const handlePrev = () => {
    const idx = tracks.findIndex(t => t.id === currentPlayingId)
    if (idx > 0) {
      setCurrentPlayingId(tracks[idx - 1].id)
      setIsPlaying(true)
    }
  }

  const handleAddTrack = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    const newTrack: Track = {
      id: `track-${Date.now()}`,
      trackNumber: tracks.length + 1,
      title: newTitle.trim(),
      artist: newArtist.trim() || 'Ministério Com Deus Kids',
      duration: newDuration.trim() || '03:00',
      lyrics: newLyrics.trim(),
      hasPlayback: hasPlaybackCheck
    }

    const updated = [...tracks, newTrack]
    setTracks(updated)
    localStorage.setItem(storageKey, JSON.stringify(updated))
    setNewTitle('')
    setNewLyrics('')
    setIsModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (!window.confirm('Tem certeza que deseja remover esta faixa musical?')) return
    const updated = tracks.filter(t => t.id !== id)
    setTracks(updated)
    localStorage.setItem(storageKey, JSON.stringify(updated))
  }

  if (activeTab === 'letras') {
    return (
      <div style={{ marginTop: 20, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
          Letras & Cifras para Louvor Infantil
        </h3>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
          Visualize as letras e baixe as partituras e cifras para a equipe de música da igreja.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {tracks.map(t => (
            <div key={t.id} style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: 0 }}>
                    Faixa {t.trackNumber}: {t.title}
                  </h4>
                  <small style={{ color: '#64748b' }}>Tom sugerido: Sol Maior (G) · Ritmo: Alegre 4/4</small>
                </div>
                <button
                  onClick={() => alert(`Baixando Cifra em PDF: ${t.title}`)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', background: '#eff4fe', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                >
                  <Download size={14} /> Baixar Cifra PDF
                </button>
              </div>
              <pre style={{ background: '#f8fafc', padding: 14, borderRadius: 6, fontSize: 12, fontFamily: 'monospace', color: '#334155', whiteSpace: 'pre-wrap', margin: 0 }}>
                {t.lyrics || 'Letra ainda não informada. Clique em editar dados para adicionar.'}
              </pre>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (activeTab === 'playbacks') {
    return (
      <div style={{ marginTop: 20, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
          Playbacks & Instrumentais
        </h3>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
          Áudios sem voz para as crianças apresentarem na igreja ou ensaiarem em casa.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tracks.filter(t => t.hasPlayback).map(t => (
            <div key={t.id} style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Mic2 size={20} color="#7c3aed" />
                <div>
                  <b style={{ display: 'block', fontSize: 14, color: '#1e293b' }}>{t.title} (Playback Instrumental)</b>
                  <small style={{ color: '#94a3b8' }}>Duração: {t.duration} · Qualidade 320 kbps</small>
                </div>
              </div>
              <button
                onClick={() => alert(`Baixando Playback: ${t.title}`)}
                style={{ padding: '7px 14px', background: '#eff4fe', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              >
                Baixar MP3
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ marginTop: 20 }}>
      {/* Player de Áudio em Destaque */}
      {currentTrack && (
        <div
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
            color: '#fff',
            borderRadius: 12,
            padding: 22,
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
            flexWrap: 'wrap',
            boxShadow: '0 10px 25px -5px rgba(49, 46, 129, 0.4)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 8,
                background: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Music size={28} color="#a5b4fc" />
            </div>
            <div>
              <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#c7d2fe', fontWeight: 600 }}>
                {isPlaying ? '▶ Reproduzindo agora' : '⏸ Pausado'}
              </span>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: '2px 0 0' }}>{currentTrack.title}</h3>
              <small style={{ color: '#a5b4fc' }}>{currentTrack.artist} · Faixa {currentTrack.trackNumber}</small>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              onClick={handlePrev}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
            >
              <SkipBack size={20} />
            </button>
            <button
              onClick={() => togglePlay()}
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: '#fff',
                color: '#312e81',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} fill="#312e81" />}
            </button>
            <button
              onClick={handleNext}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
            >
              <SkipForward size={20} />
            </button>
            <span style={{ fontSize: 13, color: '#c7d2fe', fontWeight: 600, marginLeft: 8 }}>
              {currentTrack.duration}
            </span>
          </div>
        </div>
      )}

      {/* Lista de Faixas */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h4 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: 0 }}>
          Faixas do Álbum ({tracks.length})
        </h4>
        <button
          className="dark"
          onClick={() => setIsModalOpen(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 6, fontWeight: 600, cursor: 'pointer', background: '#1e293b', color: '#fff' }}
        >
          <Plus size={16} /> Adicionar Faixa
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {tracks.map(t => {
          const isCurrent = t.id === currentPlayingId
          return (
            <div
              key={t.id}
              style={{
                background: isCurrent ? '#eff4fe' : '#fff',
                border: isCurrent ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                borderRadius: 8,
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <button
                  onClick={() => togglePlay(t.id)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: isCurrent && isPlaying ? '#2563eb' : '#f1f5f9',
                    color: isCurrent && isPlaying ? '#fff' : '#1e293b',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  {isCurrent && isPlaying ? <Pause size={14} /> : <Play size={14} />}
                </button>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                    {t.trackNumber}. {t.title}
                  </span>
                  <small style={{ display: 'block', color: '#64748b', fontSize: 11 }}>
                    {t.artist} {t.hasPlayback && '· Playback incluso'}
                  </small>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>{t.duration}</span>
                <button
                  onClick={() => alert(`Baixando MP3 da faixa: ${t.title}`)}
                  title="Baixar áudio"
                  style={{ padding: '6px 10px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 5, color: '#475569', cursor: 'pointer' }}
                >
                  <Download size={13} />
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  title="Remover faixa"
                  style={{ padding: '6px 8px', background: '#fff', border: '1px solid #fecaca', borderRadius: 5, color: '#ef4444', cursor: 'pointer' }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 10, width: '100%', maxWidth: 500, padding: 24, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Adicionar Faixa Musical</h3>
            <p style={{ fontSize: 12, color: '#64748b', marginBottom: 18 }}>Cadastre uma nova canção infantil ou louvor no álbum.</p>

            <form onSubmit={handleAddTrack}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Nome da canção *
                <input
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Ex.: O Barco de Noé Balança"
                  style={{ display: 'block', width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 6, marginTop: 4, fontSize: 13 }}
                />
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>
                  Artista / Ministério
                  <input
                    value={newArtist}
                    onChange={e => setNewArtist(e.target.value)}
                    placeholder="Ex.: Com Deus Kids"
                    style={{ display: 'block', width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6, marginTop: 4, fontSize: 13 }}
                  />
                </label>

                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>
                  Duração (mm:ss)
                  <input
                    value={newDuration}
                    onChange={e => setNewDuration(e.target.value)}
                    placeholder="03:15"
                    style={{ display: 'block', width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6, marginTop: 4, fontSize: 13 }}
                  />
                </label>
              </div>

              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', margin: '12px 0 6px' }}>
                Letra da canção
                <textarea
                  value={newLyrics}
                  onChange={e => setNewLyrics(e.target.value)}
                  placeholder="Cole a letra para facilitar a leitura das famílias e ministérios..."
                  style={{ display: 'block', width: '100%', height: 75, padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 6, marginTop: 4, fontSize: 13 }}
                />
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#334155', marginTop: 12, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={hasPlaybackCheck}
                  onChange={e => setHasPlaybackCheck(e.target.checked)}
                />
                Incluir versão Playback instrumental para apresentações
              </label>

              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff', fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', borderRadius: 6, background: '#2563eb', color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Salvar Faixa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
