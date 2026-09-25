import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useToast } from '../hooks/useToast'
import {
  Gamepad2, Plus, Edit2, Trash2, Play, CheckCircle2,
  AlertCircle, Sparkles, Filter, Eye, Trophy
} from 'lucide-react'

interface GameAdminItem {
  id: string
  slug: string
  title: string
  description: string
  game_type: string
  age_range: string
  difficulty: string
  cover_url: string
  status: 'draft' | 'published' | 'archived'
  play_count: number
  is_featured: boolean
}

const DEFAULT_GAMES_SEED: GameAdminItem[] = [
  {
    id: 'game-01',
    slug: 'construa-a-arca',
    title: 'Construa a Arca',
    description: 'Encaixe a quilha, casco e telhado da grande Arca de Noé.',
    game_type: 'puzzle',
    age_range: '3-5',
    difficulty: 'facil',
    cover_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    status: 'published',
    play_count: 142,
    is_featured: true
  },
  {
    id: 'game-02',
    slug: 'animais-para-a-arca',
    title: 'Animais para a Arca',
    description: 'Encontre os pares de animais e ajude Noé a levá-los à Arca.',
    game_type: 'memory',
    age_range: 'all',
    difficulty: 'facil',
    cover_url: 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=800&q=80',
    status: 'published',
    play_count: 310,
    is_featured: true
  },
  {
    id: 'game-03',
    slug: 'davi-contra-golias',
    title: 'Davi contra Golias',
    description: 'Colete as 5 pedras lisas pelo riacho e enfrente o desafio com coragem.',
    game_type: 'adventure',
    age_range: '6-8',
    difficulty: 'medio',
    cover_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    status: 'published',
    play_count: 489,
    is_featured: true
  },
  {
    id: 'game-05',
    slug: 'abra-o-mar-vermelho',
    title: 'Abra o Mar Vermelho',
    description: 'Ordene as ações de fé de Moisés para que as águas se abram.',
    game_type: 'sequence',
    age_range: 'all',
    difficulty: 'facil',
    cover_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    status: 'published',
    play_count: 215,
    is_featured: false
  },
  {
    id: 'game-07',
    slug: 'daniel-e-os-leoes',
    title: 'Daniel e os Leões',
    description: 'Labirinto bíblico na Babilônia com oração e proteção angelical.',
    game_type: 'maze',
    age_range: '6-8',
    difficulty: 'medio',
    cover_url: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=800&q=80',
    status: 'published',
    play_count: 340,
    is_featured: false
  },
  {
    id: 'game-17',
    slug: 'pesca-maravilhosa',
    title: 'Pesca Maravilhosa',
    description: 'Recolha peixes sobre a palavra de Jesus no mar límpido.',
    game_type: 'catch',
    age_range: 'all',
    difficulty: 'facil',
    cover_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
    status: 'published',
    play_count: 198,
    is_featured: false
  }
]

export default function JogosManager() {
  const [games, setGames] = useState<GameAdminItem[]>(DEFAULT_GAMES_SEED)
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingGame, setEditingGame] = useState<GameAdminItem | null>(null)

  // Form State
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [gameType, setGameType] = useState('memory')
  const [ageRange, setAgeRange] = useState('all')
  const [difficulty, setDifficulty] = useState('facil')
  const [coverUrl, setCoverUrl] = useState('')
  const [isFeatured, setIsFeatured] = useState(false)

  const { toast } = useToast()

  const fetchGames = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data && data.length > 0) {
        setGames(data as GameAdminItem[])
      } else {
        setGames(DEFAULT_GAMES_SEED)
      }
    } catch (err) {
      setGames(DEFAULT_GAMES_SEED)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGames()
  }, [])

  const handleOpenModal = (game?: GameAdminItem) => {
    if (game) {
      setEditingGame(game)
      setTitle(game.title)
      setSlug(game.slug)
      setDescription(game.description)
      setGameType(game.game_type)
      setAgeRange(game.age_range)
      setDifficulty(game.difficulty)
      setCoverUrl(game.cover_url)
      setIsFeatured(game.is_featured)
    } else {
      setEditingGame(null)
      setTitle('')
      setSlug('')
      setDescription('')
      setGameType('memory')
      setAgeRange('all')
      setDifficulty('facil')
      setCoverUrl('https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=800&q=80')
      setIsFeatured(false)
    }
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !slug) {
      toast.error('Título e slug são obrigatórios.')
      return
    }

    try {
      const payload: Omit<GameAdminItem, 'id' | 'play_count'> = {
        title,
        slug,
        description,
        game_type: gameType,
        age_range: ageRange,
        difficulty,
        cover_url: coverUrl,
        is_featured: isFeatured,
        status: 'published' as const
      }

      if (editingGame) {
        await supabase.from('games').update(payload).eq('id', editingGame.id)
        setGames(prev => prev.map(g => (g.id === editingGame.id ? { ...g, ...payload } : g)))
        toast.success('Jogo atualizado com sucesso!')
      } else {
        const { data } = await supabase.from('games').insert([payload]).select().single()
        if (data) {
          setGames(prev => [data as GameAdminItem, ...prev])
        } else {
          setGames(prev => [{ id: `game-${Date.now()}`, play_count: 0, ...payload } as GameAdminItem, ...prev])
        }
        toast.success('Novo jogo publicado na plataforma!')
      }

      setIsModalOpen(false)
    } catch (err: any) {
      toast.error(err.message || 'Falha ao salvar jogo.')
    }
  }

  return (
    <div style={{ padding: '24px 32px' }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 28
      }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', margin: '0 0 6px 0' }}>
            Jogos Interativos
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
            Gerencie os jogos bíblicos que rodam nativamente no navegador (Mobile, TV e Desktop).
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            borderRadius: 10,
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
          }}
        >
          <Plus size={18} /> Novo Jogo
        </button>
      </div>

      {/* Cards de Métricas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16,
        marginBottom: 28
      }}>
        <div style={{ background: '#fff', padding: 20, borderRadius: 16, border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Total de Jogos Ativos</span>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', marginTop: 4 }}>{games.length}</div>
        </div>
        <div style={{ background: '#fff', padding: 20, borderRadius: 16, border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Total de Partidas Jogadas</span>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#2563eb', marginTop: 4 }}>
            {games.reduce((acc, g) => acc + (g.play_count || 0), 0)}
          </div>
        </div>
        <div style={{ background: '#fff', padding: 20, borderRadius: 16, border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Motores Reutilizáveis</span>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#10b981', marginTop: 4 }}>6 Motores</div>
        </div>
      </div>

      {/* Tabela de Jogos */}
      <div style={{
        background: '#fff',
        borderRadius: 16,
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
              <th style={{ padding: '14px 20px', fontWeight: 700 }}>Capa & Jogo</th>
              <th style={{ padding: '14px 20px', fontWeight: 700 }}>Motor / Tipo</th>
              <th style={{ padding: '14px 20px', fontWeight: 700 }}>Faixa Etária</th>
              <th style={{ padding: '14px 20px', fontWeight: 700 }}>Dificuldade</th>
              <th style={{ padding: '14px 20px', fontWeight: 700 }}>Partidas</th>
              <th style={{ padding: '14px 20px', fontWeight: 700 }}>Status</th>
              <th style={{ padding: '14px 20px', fontWeight: 700, textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {games.map(game => (
              <tr key={game.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <img
                    src={game.cover_url}
                    alt={game.title}
                    style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontWeight: 800, color: '#0f172a' }}>{game.title}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>/{game.slug}</div>
                  </div>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: 9999,
                    background: '#e0e7ff',
                    color: '#4338ca',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    fontSize: 11
                  }}>
                    {game.game_type}
                  </span>
                </td>
                <td style={{ padding: '14px 20px', color: '#334155' }}>
                  {game.age_range === 'all' ? 'Livre' : `${game.age_range} anos`}
                </td>
                <td style={{ padding: '14px 20px', color: '#334155', textTransform: 'capitalize' }}>
                  {game.difficulty}
                </td>
                <td style={{ padding: '14px 20px', fontWeight: 700, color: '#0f172a' }}>
                  {game.play_count}
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: 6,
                    background: '#dcfce7',
                    color: '#15803d',
                    fontWeight: 700,
                    fontSize: 11
                  }}>
                    PUBLICADO
                  </span>
                </td>
                <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                  <button
                    onClick={() => handleOpenModal(game)}
                    style={{
                      padding: 6,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#64748b'
                    }}
                    title="Editar"
                  >
                    <Edit2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Criar / Editar Jogo */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 20,
            padding: 28,
            maxWidth: 540,
            width: '90%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 20, fontWeight: 800 }}>
              {editingGame ? 'Editar Jogo' : 'Novo Jogo Baseado em Motor'}
            </h3>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Título do Jogo
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => {
                    setTitle(e.target.value)
                    if (!editingGame) {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'))
                    }
                  }}
                  placeholder="Ex: Memória dos Discípulos"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Slug (URL no APP)
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  placeholder="ex: memoria-dos-discipulos"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Motor do Jogo
                  </label>
                  <select
                    value={gameType}
                    onChange={e => setGameType(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                  >
                    <option value="memory">Jogo da Memória</option>
                    <option value="puzzle">Quebra-Cabeça</option>
                    <option value="adventure">Aventura 2D</option>
                    <option value="sequence">Ordenação Narrativa</option>
                    <option value="maze">Labirinto Bíblico</option>
                    <option value="catch">Captura / Colheita</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Faixa Etária
                  </label>
                  <select
                    value={ageRange}
                    onChange={e => setAgeRange(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                  >
                    <option value="all">Todas as Idades</option>
                    <option value="3-5">3 a 5 anos</option>
                    <option value="6-8">6 a 8 anos</option>
                    <option value="9-12">9 a 12 anos</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                  URL da Capa
                </label>
                <input
                  type="text"
                  value={coverUrl}
                  onChange={e => setCoverUrl(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <input
                  type="checkbox"
                  id="featured"
                  checked={isFeatured}
                  onChange={e => setIsFeatured(e.target.checked)}
                />
                <label htmlFor="featured" style={{ fontSize: 13, color: '#334155', fontWeight: 600 }}>
                  Destacar no carrossel superior do APP
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '10px 18px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', fontWeight: 700 }}
                >
                  Salvar e Publicar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
