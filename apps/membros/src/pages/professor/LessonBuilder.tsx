import React, { useState, useEffect } from 'react'
import {
  BookOpen, Plus, Trash2, Save, Share2,
  CheckCircle, Copy, ExternalLink, Palette,
  HelpCircle, Video, FileText, Layers,
  ArrowUp, ArrowDown, Eye, X, Clock,
  Calendar, Check, Sparkles, GraduationCap
} from 'lucide-react'
import { supabase } from '@comdeuskids/supabase'
import { useAuth } from '../../hooks/useAuth'

interface LessonBlock {
  id?: string
  block_type: 'story' | 'video' | 'quiz' | 'coloring' | 'homework' | 'material'
  title: string
  order_index: number
  points: number
  content_payload: any
}

interface LessonBuilderProps {
  organizationId?: string
}

export function LessonBuilder({ organizationId }: LessonBuilderProps = {}) {
  const { user } = useAuth()
  const [lessons, setLessons] = useState<any[]>([])
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null)
  const [classes, setClasses] = useState<any[]>([])

  // Formulário da Aula
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [biblicalReference, setBiblicalReference] = useState('')
  const [classId, setClassId] = useState<string>('')
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('published')
  const [dueDate, setDueDate] = useState<string>('')
  const [releaseAt, setReleaseAt] = useState<string>('')
  const [shareCode, setShareCode] = useState('')
  const [blocks, setBlocks] = useState<LessonBlock[]>([])
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

  // Carregar dados iniciais
  useEffect(() => {
    async function loadData() {
      if (!user) return

      // Carregar turmas
      let classQuery = supabase.from('educational_classes').select('*')
      if (organizationId) {
        classQuery = classQuery.or(`organization_id.eq.${organizationId},created_by.eq.${user.id}`)
      } else {
        classQuery = classQuery.eq('created_by', user.id)
      }
      const { data: cls } = await classQuery
      if (cls) setClasses(cls)

      // Carregar aulas do professor / igreja
      let lessonQuery = supabase.from('educational_lessons').select('*')
      if (organizationId) {
        lessonQuery = lessonQuery.or(`organization_id.eq.${organizationId},created_by.eq.${user.id}`)
      } else {
        lessonQuery = lessonQuery.eq('created_by', user.id)
      }
      const { data: les } = await lessonQuery.order('created_at', { ascending: false })

      if (les && les.length > 0) {
        setLessons(les)
        loadLessonDetails(les[0])
      } else {
        startNewLesson()
      }
    }
    loadData()
  }, [user, organizationId])

  const loadLessonDetails = async (lesson: any) => {
    setSelectedLessonId(lesson.id)
    setTitle(lesson.title)
    setDescription(lesson.description || '')
    setBiblicalReference(lesson.biblical_reference || '')
    setClassId(lesson.class_id || '')
    setStatus(lesson.status || 'published')
    setDueDate(lesson.due_date ? lesson.due_date.split('T')[0] : '')
    setShareCode(lesson.share_code || '')

    // Carregar blocos dinâmicos da aula
    const { data: blks } = await supabase
      .from('educational_lesson_blocks')
      .select('*')
      .eq('lesson_id', lesson.id)
      .order('order_index', { ascending: true })

    if (blks && blks.length > 0) {
      setBlocks(blks)
    } else {
      // Blocos padrão iniciais caso aula seja nova
      setBlocks([
        {
          block_type: 'story',
          title: 'História Bíblica Central',
          order_index: 0,
          points: 10,
          content_payload: { text: 'Narraremos hoje como Deus cuidou de Noé e dos animais com amor e fidelidade.' }
        },
        {
          block_type: 'quiz',
          title: 'Quiz de Fixação da Lição',
          order_index: 1,
          points: 10,
          content_payload: {
            question: 'Qual sinal Deus colocou no céu como aliança de paz?',
            options: ['Um arco-íris colorido', 'Uma nuvem em formato de coração', 'Um raio brilhante'],
            correct_index: 0
          }
        },
        {
          block_type: 'coloring',
          title: 'Pintura: A Arca e o Arco-Íris',
          order_index: 2,
          points: 10,
          content_payload: { instructions: 'Pinte a arca de Noé navegando nas águas com as cores mais alegres!' }
        }
      ])
    }
  }

  const startNewLesson = () => {
    setSelectedLessonId(null)
    setTitle('Nova Lição Bíblica')
    setDescription('')
    setBiblicalReference('')
    setClassId('')
    setStatus('published')
    setDueDate('')
    const generatedCode = 'AULA-' + Math.random().toString(36).substring(2, 7).toUpperCase()
    setShareCode(generatedCode)
    setBlocks([
      {
        block_type: 'story',
        title: 'História Bíblica',
        order_index: 0,
        points: 10,
        content_payload: { text: '' }
      },
      {
        block_type: 'quiz',
        title: 'Quiz da Fé',
        order_index: 1,
        points: 10,
        content_payload: {
          question: 'O que aprendemos hoje sobre o amor de Deus?',
          options: ['Que Ele sempre cuida de nós', 'Que devemos ter medo', 'Nada'],
          correct_index: 0
        }
      }
    ])
  }

  // Manipulação de Blocos
  const handleAddBlock = (type: LessonBlock['block_type']) => {
    const newBlock: LessonBlock = {
      block_type: type,
      title:
        type === 'story'
          ? 'História Bíblica'
          : type === 'video'
          ? 'Vídeo Bíblico'
          : type === 'quiz'
          ? 'Quiz da Fé'
          : type === 'coloring'
          ? 'Coloring Studio'
          : type === 'homework'
          ? 'Lição Prática'
          : 'Material de Apoio',
      order_index: blocks.length,
      points: 10,
      content_payload:
        type === 'quiz'
          ? { question: '', options: ['Opção 1', 'Opção 2'], correct_index: 0 }
          : type === 'coloring'
          ? { instructions: 'Colore o desenho com amor e criatividade!' }
          : type === 'video'
          ? { url: '' }
          : { text: '' }
    }
    setBlocks([...blocks, newBlock])
  }

  const handleRemoveBlock = (index: number) => {
    setBlocks(blocks.filter((_, i) => i !== index))
  }

  const moveBlockUp = (index: number) => {
    if (index === 0) return
    const updated = [...blocks]
    const temp = updated[index - 1]
    updated[index - 1] = updated[index]
    updated[index] = temp
    setBlocks(updated)
  }

  const moveBlockDown = (index: number) => {
    if (index === blocks.length - 1) return
    const updated = [...blocks]
    const temp = updated[index + 1]
    updated[index + 1] = updated[index]
    updated[index] = temp
    setBlocks(updated)
  }

  // Salvar no Banco
  const handleSave = async () => {
    if (!title.trim()) {
      alert('Por favor, informe o título da aula.')
      return
    }
    if (!user) return

    setSaving(true)
    try {
      let lessonId = selectedLessonId

      if (!lessonId) {
        const { data, error } = await supabase
          .from('educational_lessons')
          .insert({
            title,
            description,
            biblical_reference: biblicalReference,
            class_id: classId || null,
            organization_id: organizationId || null,
            created_by: user.id,
            status,
            due_date: dueDate || null,
            share_code: shareCode
          })
          .select()
          .single()

        if (error) throw error
        lessonId = data.id
        setSelectedLessonId(lessonId)
        setLessons([data, ...lessons])
      } else {
        const { error } = await supabase
          .from('educational_lessons')
          .update({
            title,
            description,
            biblical_reference: biblicalReference,
            class_id: classId || null,
            status,
            due_date: dueDate || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', lessonId)

        if (error) throw error
      }

      // Salvar blocos reordenados
      await supabase.from('educational_lesson_blocks').delete().eq('lesson_id', lessonId)

      const blocksToInsert = blocks.map((b, idx) => ({
        lesson_id: lessonId,
        block_type: b.block_type,
        title: b.title,
        order_index: idx,
        points: b.points || 10,
        content_payload: b.content_payload
      }))

      if (blocksToInsert.length > 0) {
        await supabase.from('educational_lesson_blocks').insert(blocksToInsert)
      }

      setFeedback('Aula e blocos salvos com sucesso!')
      setTimeout(() => setFeedback(null), 3500)
    } catch (err: any) {
      alert('Erro ao salvar aula: ' + (err.message || err))
    } finally {
      setSaving(false)
    }
  }

  const studentShareUrl = `${window.location.origin}/aula/${shareCode}`

  const copyShareLink = () => {
    navigator.clipboard.writeText(studentShareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  return (
    <div className="s-page s-page--wide">
      {/* Toast Feedback */}
      {feedback && (
        <div className="s-toast-container">
          <div className="s-toast s-toast-success">
            <CheckCircle size={18} />
            <span>{feedback}</span>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="s-page-header">
        <div>
          <span className="s-page-header__eyebrow">
            <GraduationCap size={13} style={{ display: 'inline', marginRight: 4 }} />
            Pedagógico • Lesson Builder
          </span>
          <h1>Montador de Aulas</h1>
          <p>Monte aulas modulares reordenáveis com histórias bíblicas, vídeos, quizzes, tela de pintura e materiais.</p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="s-btn s-btn-secondary" onClick={() => setPreviewOpen(true)}>
            <Eye size={15} /> Pré-visualizar
          </button>
          <button className="s-btn s-btn-primary" onClick={startNewLesson}>
            <Plus size={16} /> Nova Aula
          </button>
        </div>
      </div>

      {/* Caixa de Compartilhamento / Assignment com o Aluno */}
      <div
        className="s-card"
        style={{
          background: 'var(--s-surface-low)',
          borderColor: 'var(--s-primary-mid)',
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16
        }}
      >
        <div>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--s-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Acesso Individual do Aluno (Assignment)
          </span>
          <h4 style={{ fontSize: 18, fontWeight: 800, color: 'var(--s-text-title)', margin: '4px 0' }}>
            Código da Aula: <span style={{ color: 'var(--s-primary)', letterSpacing: '0.08em' }}>{shareCode}</span>
          </h4>
          <span style={{ fontSize: 12.5, color: 'var(--s-text-muted)' }}>
            O aluno acessa apenas esta aula atribuída sem necessidade de assinatura individual.
          </span>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="s-btn s-btn-primary s-btn-sm" onClick={copyShareLink}>
            <Copy size={14} /> {copied ? 'Link Copiado!' : 'Copiar Link da Aula'}
          </button>
          <a href={`/aula/${shareCode}`} target="_blank" rel="noopener noreferrer" className="s-btn s-btn-secondary s-btn-sm">
            <ExternalLink size={14} /> Abrir como Aluno
          </a>
        </div>
      </div>

      {/* Configurações da Aula & Atribuição */}
      <div className="s-card" style={{ marginBottom: 24 }}>
        <div className="s-section-head" style={{ marginBottom: 16 }}>
          <h2>Dados da Aula & Atribuição</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label className="s-label">Título da Aula *</label>
            <input
              type="text"
              className="s-input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Davi e Golias: A Força da Fé"
            />
          </div>

          <div>
            <label className="s-label">Status da Aula</label>
            <select
              className="s-select"
              value={status}
              onChange={e => setStatus(e.target.value as any)}
            >
              <option value="published">Publicada (Visível ao Aluno)</option>
              <option value="draft">Rascunho (Em Edição)</option>
              <option value="archived">Arquivada</option>
            </select>
          </div>

          <div>
            <label className="s-label">Prazo de Entrega</label>
            <input
              type="date"
              className="s-input"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label className="s-label">Referência Bíblica</label>
            <input
              type="text"
              className="s-input"
              value={biblicalReference}
              onChange={e => setBiblicalReference(e.target.value)}
              placeholder="Ex: 1 Samuel 17"
            />
          </div>

          <div>
            <label className="s-label">Turma Atribuída</label>
            <select
              className="s-select"
              value={classId}
              onChange={e => setClassId(e.target.value)}
            >
              <option value="">Todas as Turmas / Código Geral</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="s-label">Mensagem Inicial para o Aluno</label>
          <textarea
            rows={2}
            className="s-textarea"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Breve introdução carinhosa da lição..."
          />
        </div>
      </div>

      {/* Blocos da Aula */}
      <div style={{ marginBottom: 28 }}>
        <div className="s-section-head" style={{ marginBottom: 16 }}>
          <div>
            <h2>Blocos da Aula ({blocks.length})</h2>
            <span style={{ fontSize: 12, color: 'var(--s-text-muted)' }}>Arraste ou use as setas para reordenar a sequência</span>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="s-btn s-btn-secondary s-btn-sm" onClick={() => handleAddBlock('story')}>
              <FileText size={14} /> + História
            </button>
            <button className="s-btn s-btn-secondary s-btn-sm" onClick={() => handleAddBlock('quiz')}>
              <HelpCircle size={14} /> + Quiz
            </button>
            <button className="s-btn s-btn-secondary s-btn-sm" onClick={() => handleAddBlock('coloring')}>
              <Palette size={14} /> + Pintura Digital
            </button>
            <button className="s-btn s-btn-secondary s-btn-sm" onClick={() => handleAddBlock('homework')}>
              <CheckCircle size={14} /> + Lição Prática
            </button>
            <button className="s-btn s-btn-secondary s-btn-sm" onClick={() => handleAddBlock('video')}>
              <Video size={14} /> + Vídeo
            </button>
          </div>
        </div>

        {/* Lista Reordenável de Blocos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {blocks.map((block, index) => (
            <div key={index} className="s-card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                  <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--s-primary-light)', color: 'var(--s-primary)', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={block.title}
                    onChange={e => {
                      const updated = [...blocks]
                      updated[index].title = e.target.value
                      setBlocks(updated)
                    }}
                    style={{ background: 'transparent', border: 'none', color: 'var(--s-text-title)', fontSize: 15, fontWeight: 700, outline: 'none', width: '80%' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => moveBlockUp(index)}
                    disabled={index === 0}
                    className="s-btn-icon"
                    title="Mover para cima"
                    style={{ opacity: index === 0 ? 0.4 : 1 }}
                  >
                    <ArrowUp size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveBlockDown(index)}
                    disabled={index === blocks.length - 1}
                    className="s-btn-icon"
                    title="Mover para baixo"
                    style={{ opacity: index === blocks.length - 1 ? 0.4 : 1 }}
                  >
                    <ArrowDown size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveBlock(index)}
                    className="s-btn-icon"
                    style={{ color: 'var(--s-danger)' }}
                    title="Excluir bloco"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Conteúdo do Bloco */}
              {block.block_type === 'story' && (
                <textarea
                  rows={3}
                  className="s-textarea"
                  value={block.content_payload.text || ''}
                  onChange={e => {
                    const updated = [...blocks]
                    updated[index].content_payload.text = e.target.value
                    setBlocks(updated)
                  }}
                  placeholder="Texto bíblico e história contada de forma envolvente..."
                />
              )}

              {block.block_type === 'quiz' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <input
                    type="text"
                    className="s-input"
                    value={block.content_payload.question || ''}
                    onChange={e => {
                      const updated = [...blocks]
                      updated[index].content_payload.question = e.target.value
                      setBlocks(updated)
                    }}
                    placeholder="Pergunta do Quiz Bíblico..."
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {(block.content_payload.options || ['Opção A', 'Opção B']).map((opt: string, optIdx: number) => (
                      <div key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input
                          type="radio"
                          name={`quiz_radio_${index}`}
                          checked={block.content_payload.correct_index === optIdx}
                          onChange={() => {
                            const updated = [...blocks]
                            updated[index].content_payload.correct_index = optIdx
                            setBlocks(updated)
                          }}
                          style={{ accentColor: 'var(--s-success)', cursor: 'pointer' }}
                        />
                        <input
                          type="text"
                          className="s-input"
                          style={{ minHeight: 34, fontSize: 13 }}
                          value={opt}
                          onChange={e => {
                            const updated = [...blocks]
                            const newOptions = [...updated[index].content_payload.options]
                            newOptions[optIdx] = e.target.value
                            updated[index].content_payload.options = newOptions
                            setBlocks(updated)
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {block.block_type === 'coloring' && (
                <input
                  type="text"
                  className="s-input"
                  value={block.content_payload.instructions || ''}
                  onChange={e => {
                    const updated = [...blocks]
                    updated[index].content_payload.instructions = e.target.value
                    setBlocks(updated)
                  }}
                  placeholder="Instruções para colorir o desenho no Canvas Digital..."
                />
              )}

              {block.block_type === 'homework' && (
                <input
                  type="text"
                  className="s-input"
                  value={block.content_payload.prompt || ''}
                  onChange={e => {
                    const updated = [...blocks]
                    updated[index].content_payload.prompt = e.target.value
                    setBlocks(updated)
                  }}
                  placeholder="Pergunta aberta para reflexão da fé..."
                />
              )}

              {block.block_type === 'video' && (
                <input
                  type="text"
                  className="s-input"
                  value={block.content_payload.url || ''}
                  onChange={e => {
                    const updated = [...blocks]
                    updated[index].content_payload.url = e.target.value
                    setBlocks(updated)
                  }}
                  placeholder="URL do vídeo ou episódio Com Deus Kids..."
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Salvar Aula */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <button className="s-btn s-btn-primary s-btn-lg" onClick={handleSave} disabled={saving}>
          <Save size={18} /> {saving ? 'Salvando Aula...' : 'Salvar e Publicar Aula'}
        </button>
      </div>

      {/* Modal de Pré-visualização da Aula */}
      {previewOpen && (
        <div className="s-modal-overlay" onClick={() => setPreviewOpen(false)}>
          <div className="s-modal" style={{ maxWidth: 640, maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="s-modal-header">
              <div>
                <span style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--s-primary)', fontWeight: 700 }}>
                  Modo Pré-visualização (Visão do Aluno)
                </span>
                <h2 style={{ fontSize: 18, margin: '2px 0 0 0' }}>{title}</h2>
              </div>
              <button className="s-btn-icon" onClick={() => setPreviewOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {blocks.map((b, i) => (
                <div key={i} style={{ padding: 14, borderRadius: 12, background: 'var(--s-surface-low)', border: '1px solid var(--s-border)' }}>
                  <h4 style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--s-text-title)', margin: '0 0 6px 0' }}>
                    {i + 1}. {b.title}
                  </h4>
                  {b.block_type === 'story' && <p style={{ fontSize: 13, color: 'var(--s-text-body)', margin: 0 }}>{b.content_payload.text}</p>}
                  {b.block_type === 'quiz' && (
                    <div>
                      <p style={{ fontSize: 13, color: 'var(--s-text-title)', margin: '0 0 6px 0', fontWeight: 600 }}>{b.content_payload.question}</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {(b.content_payload.options || []).map((opt: string, oIdx: number) => (
                          <div key={oIdx} style={{ padding: '6px 10px', borderRadius: 8, background: '#fff', fontSize: 12, border: '1px solid var(--s-border)' }}>
                            {opt}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {b.block_type === 'coloring' && (
                    <div style={{ padding: 16, textAlign: 'center', background: '#fff', borderRadius: 10, color: 'var(--s-primary)', fontSize: 12.5, fontWeight: 600, border: '1px dashed var(--s-border-strong)' }}>
                      [Prancheta Digital de Pintura Ativa no Modo Aluno]
                    </div>
                  )}
                  {b.block_type === 'homework' && (
                    <p style={{ fontSize: 12.5, color: 'var(--s-text-muted)', margin: 0, fontStyle: 'italic' }}>
                      Prompt: "{b.content_payload.prompt}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
