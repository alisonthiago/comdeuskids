import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { cmsService } from '../lib/cmsService'
import { appUrl } from '../lib/appUrl'
import { StreamContent, StreamContentType, ContentStatus } from '@comdeuskids/types'
import {
  Plus, Search, Filter, Film, Tv, Video, BookOpen,
  Music, Eye, Edit2, Copy, CheckCircle, Clock, Archive,
  Trash2, ExternalLink, Sparkles, AlertCircle
} from 'lucide-react'

const CONTENT_TYPES: { type: string; label: string; icon: any }[] = [
  { type: 'all', label: 'Todos', icon: Sparkles },
  { type: 'movie', label: 'Filmes', icon: Film },
  { type: 'series', label: 'Séries', icon: Tv },
  { type: 'video', label: 'Vídeos', icon: Video },
  { type: 'story', label: 'Histórias Bíblicas', icon: BookOpen },
  { type: 'drawing', label: 'Desenhos', icon: Video },
  { type: 'song', label: 'Músicas', icon: Music },
  { type: 'clip', label: 'Clipes', icon: Video },
  { type: 'lesson', label: 'Lições', icon: BookOpen }
]

interface CentralConteudosProps {
  fixedType?: string
}

export default function CentralConteudos({ fixedType }: CentralConteudosProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const typeParam = fixedType || searchParams.get('type') || 'all'
  const typeInfo = CONTENT_TYPES.find(item => item.type === typeParam) || CONTENT_TYPES[0]
  const [contents, setContents] = useState<StreamContent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [previewContent, setPreviewContent] = useState<StreamContent | null>(null)

  const loadData = async () => {
    setLoading(true)
    const data = await cmsService.getContents({
      type: typeParam === 'all' ? undefined : typeParam,
      status: statusFilter === 'all' ? undefined : statusFilter,
      category: categoryFilter === 'all' ? undefined : categoryFilter,
      search: searchTerm
    })
    setContents(data)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [typeParam, statusFilter, categoryFilter, searchTerm])

  const handleDuplicate = async (id: string) => {
    const copy = await cmsService.duplicateContent(id)
    if (copy) {
      await loadData()
    }
  }

  const handleTogglePublish = async (id: string, currentStatus?: string) => {
    const isPublished = currentStatus === 'published'
    await cmsService.publishContent(id, !isPublished)
    await loadData()
  }

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Tem certeza que deseja excluir "${title}"?`)) {
      await cmsService.deleteContent(id)
      await loadData()
    }
  }

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Topo / Cabeçalho */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e1b4b', margin: 0 }}>
            {typeParam === 'all' ? 'Central de Conteúdos' : typeInfo.label}
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: '4px 0 0' }}>
            {typeParam === 'all'
              ? 'Gerenciamento do catálogo completo de streaming, filmes, séries, lições e quizzes.'
              : `Gerencie os conteúdos cadastrados em ${typeInfo.label.toLowerCase()}.`}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <a
            href={appUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost"
            style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', height: 40, padding: '0 16px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#475569' }}
          >
            <ExternalLink size={16} />
            Ver no APP
          </a>

          <button
            onClick={() => navigate('/admin/conteudos/novo')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, height: 40, padding: '0 20px',
              background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8,
              fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
            }}
          >
            <Plus size={18} />
            Novo Conteúdo
          </button>
        </div>
      </div>

      {/* Barra de Filtros & Busca */}
      <div style={{
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 260 }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 360 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Pesquisar por título ou tema..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%', padding: '9px 12px 9px 36px', borderRadius: 8,
                border: '1px solid #cbd5e1', fontSize: 13, outline: 'none'
              }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, color: '#475569', background: '#fff' }}
          >
            <option value="all">Todos os Status</option>
            <option value="published">Publicado</option>
            <option value="draft">Rascunho</option>
            <option value="archived">Arquivado</option>
          </select>
        </div>

        <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>
          {contents.length} {contents.length === 1 ? 'conteúdo encontrado' : 'conteúdos encontrados'}
        </div>
      </div>

      {/* Grade / Tabela de Conteúdos */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#7c3aed' }}>
          Carregando catálogo...
        </div>
      ) : contents.length === 0 ? (
        <div style={{
          background: '#fff', border: '2px dashed #e2e8f0', borderRadius: 16, padding: 60,
          textAlign: 'center', color: '#64748b'
        }}>
          <Film size={44} color="#94a3b8" style={{ marginBottom: 12 }} />
          <h3 style={{ color: '#1e293b', fontSize: 18, marginBottom: 6 }}>Nenhum conteúdo encontrado</h3>
          <p style={{ fontSize: 14, margin: '0 0 16px' }}>Tente alterar os filtros ou cadastre um novo título para a plataforma.</p>
          <button
            onClick={() => navigate('/admin/conteudos/novo')}
            style={{
              padding: '10px 20px', background: '#7c3aed', color: '#fff', border: 'none',
              borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer'
            }}
          >
            + Cadastrar Novo Conteúdo
          </button>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                <th style={{ padding: '12px 16px', width: 80 }}>Mídia</th>
                <th style={{ padding: '12px 16px' }}>Título & Sinopse</th>
                <th style={{ padding: '12px 16px' }}>Tipo</th>
                <th style={{ padding: '12px 16px' }}>Categoria</th>
                <th style={{ padding: '12px 16px' }}>Faixa</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {contents.map(item => {
                const isPublished = item.status === 'published'
                return (
                  <tr
                    key={item.id}
                    style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#fcfaff')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Thumbnail */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ width: 68, height: 42, borderRadius: 6, overflow: 'hidden', background: '#1e1b4b' }}>
                        <img src={item.thumbnail_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    </td>

                    {/* Título & Sinopse */}
                    <td style={{ padding: '12px 16px', maxWidth: 320 }}>
                      <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 14 }}>
                        {item.title}
                        {item.is_featured && (
                          <span style={{ marginLeft: 6, fontSize: 10, background: '#fef3c7', color: '#d97706', padding: '2px 6px', borderRadius: 4, fontWeight: 800 }}>
                            HERO
                          </span>
                        )}
                      </div>
                      <div style={{ color: '#64748b', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.description}
                      </div>
                    </td>

                    {/* Tipo */}
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ textTransform: 'capitalize', fontWeight: 600, color: '#6366f1' }}>
                        {item.type}
                      </span>
                    </td>

                    {/* Categoria */}
                    <td style={{ padding: '12px 16px', color: '#475569' }}>
                      {item.category}
                    </td>

                    {/* Faixa Etária */}
                    <td style={{ padding: '12px 16px', color: '#475569' }}>
                      {item.age_range || 'Livre'}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 999,
                        fontSize: 11, fontWeight: 700,
                        background: isPublished ? '#dcfce7' : '#f1f5f9',
                        color: isPublished ? '#15803d' : '#64748b'
                      }}>
                        {isPublished ? '● Publicado' : '○ Rascunho'}
                      </span>
                    </td>

                    {/* Ações */}
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <button
                          onClick={() => setPreviewContent(item)}
                          title="Visualizar Detalhes"
                          style={{ background: 'none', border: 'none', padding: 6, cursor: 'pointer', color: '#64748b' }}
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          onClick={() => navigate(`/admin/conteudos/${item.id}`)}
                          title="Editar Conteúdo"
                          style={{ background: 'none', border: 'none', padding: 6, cursor: 'pointer', color: '#7c3aed' }}
                        >
                          <Edit2 size={16} />
                        </button>

                        <button
                          onClick={() => handleDuplicate(item.id)}
                          title="Duplicar"
                          style={{ background: 'none', border: 'none', padding: 6, cursor: 'pointer', color: '#64748b' }}
                        >
                          <Copy size={16} />
                        </button>

                        <button
                          onClick={() => handleTogglePublish(item.id, item.status)}
                          title={isPublished ? 'Despublicar' : 'Publicar no APP'}
                          style={{
                            background: 'none', border: 'none', padding: 6, cursor: 'pointer',
                            color: isPublished ? '#f59e0b' : '#10b981'
                          }}
                        >
                          <CheckCircle size={16} />
                        </button>

                        <button
                          onClick={() => handleDelete(item.id, item.title)}
                          title="Excluir"
                          style={{ background: 'none', border: 'none', padding: 6, cursor: 'pointer', color: '#ef4444' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Pré-Visualização */}
      {previewContent && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20
        }} onClick={() => setPreviewContent(null)}>
          <div style={{
            background: '#fff', borderRadius: 16, maxWidth: 640, width: '100%', overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ position: 'relative', width: '100%', height: 240, background: '#000' }}>
              <img src={previewContent.banner_url || previewContent.thumbnail_url} alt={previewContent.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button
                onClick={() => setPreviewContent(null)}
                style={{
                  position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.6)',
                  color: '#fff', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 11, background: '#ede9fe', color: '#7c3aed', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                  {previewContent.category}
                </span>
                <span style={{ fontSize: 11, background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                  {previewContent.age_range || 'Livre'}
                </span>
                <span style={{ fontSize: 11, background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                  {previewContent.duration_minutes} min
                </span>
              </div>
              <h2 style={{ fontSize: 20, color: '#1e293b', marginBottom: 8 }}>{previewContent.title}</h2>
              <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.5, marginBottom: 16 }}>{previewContent.description}</p>

              {previewContent.scripture_verse && (
                <div style={{ background: '#f5f3ff', borderLeft: '3px solid #7c3aed', padding: 12, borderRadius: 6, marginBottom: 16, fontSize: 13, color: '#5b21b6' }}>
                  <strong>Versículo:</strong> {previewContent.scripture_verse}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button
                  onClick={() => navigate(`/admin/conteudos/${previewContent.id}`)}
                  style={{
                    padding: '8px 16px', background: '#7c3aed', color: '#fff', border: 'none',
                    borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Editar no CMS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
