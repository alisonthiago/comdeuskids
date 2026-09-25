import React, { useState, useEffect } from 'react'
import { cmsService } from '../lib/cmsService'
import { StreamContent, StreamQuizItem } from '@comdeuskids/types'
import { Award, Plus, Edit2, Trash2, CheckCircle, Save, X, BookOpen } from 'lucide-react'

export default function QuizzesManager() {
  const [contents, setContents] = useState<StreamContent[]>([])
  const [selectedContent, setSelectedContent] = useState<StreamContent | null>(null)
  const [editingQuiz, setEditingQuiz] = useState<StreamQuizItem[]>([])
  const [modalOpen, setModalOpen] = useState(false)

  const loadData = async () => {
    const list = await cmsService.getContents()
    setContents(list)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenQuiz = (content: StreamContent) => {
    setSelectedContent(content)
    const existing = content.quiz && content.quiz.length > 0
      ? content.quiz
      : [
          {
            question: '',
            options: ['', '', '', ''],
            correct_index: 0,
            explanation: ''
          }
        ]
    setEditingQuiz(existing)
    setModalOpen(true)
  }

  const handleAddQuestion = () => {
    setEditingQuiz([
      ...editingQuiz,
      {
        question: '',
        options: ['', '', '', ''],
        correct_index: 0,
        explanation: ''
      }
    ])
  }

  const handleRemoveQuestion = (index: number) => {
    setEditingQuiz(editingQuiz.filter((_, i) => i !== index))
  }

  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedContent) return

    const validQuestions = editingQuiz.filter(q => q.question.trim() !== '')

    await cmsService.saveContent({
      ...selectedContent,
      quiz: validQuestions
    })

    setModalOpen(false)
    await loadData()
  }

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e1b4b', margin: 0 }}>
          Editor de Quizzes Bíblicos
        </h1>
        <p style={{ color: '#64748b', fontSize: 14, margin: '4px 0 0' }}>
          Gerencie perguntas interativas vinculadas às histórias bíblicas e lições do APP.
        </p>
      </div>

      {/* Grade de Histórias e Seus Quizzes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {contents.map(item => {
          const hasQuiz = item.quiz && item.quiz.length > 0
          return (
            <div
              key={item.id}
              style={{
                background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden',
                display: 'flex', flexDirection: 'column'
              }}
            >
              <div style={{ height: 140, position: 'relative', background: '#1e1b4b' }}>
                <img src={item.thumbnail_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 11, padding: '2px 8px', borderRadius: 4 }}>
                  {item.category}
                </div>
              </div>

              <div style={{ padding: 18, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ margin: '0 0 6px', fontSize: 16, color: '#1e293b' }}>{item.title}</h3>
                <p style={{ margin: '0 0 14px', fontSize: 13, color: '#64748b', flex: 1 }}>{item.description}</p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: hasQuiz ? '#16a34a' : '#94a3b8' }}>
                    <Award size={16} />
                    <strong>{hasQuiz ? `${item.quiz!.length} Desafios` : 'Sem Quiz Cadastrado'}</strong>
                  </div>

                  <button
                    onClick={() => handleOpenQuiz(item)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
                      background: hasQuiz ? '#ede9fe' : '#7c3aed', color: hasQuiz ? '#7c3aed' : '#fff',
                      border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    <Edit2 size={13} />
                    {hasQuiz ? 'Editar Quiz' : 'Criar Quiz'}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal Editor de Perguntas */}
      {modalOpen && selectedContent && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20
        }} onClick={() => setModalOpen(false)}>
          <div style={{
            background: '#fff', borderRadius: 16, maxWidth: 700, width: '100%', maxHeight: '90vh',
            overflowY: 'auto', padding: 28
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 20, color: '#1e293b' }}>
                  Editor de Quiz: {selectedContent.title}
                </h2>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: '#64748b' }}>
                  Adicione perguntas de múltipla escolha para testar o aprendizado bíblico infantil.
                </p>
              </div>

              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveQuiz} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {editingQuiz.map((q, qIdx) => (
                <div key={qIdx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#7c3aed' }}>
                      Pergunta #{qIdx + 1}
                    </span>

                    {editingQuiz.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(qIdx)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <Trash2 size={14} /> Excluir
                      </button>
                    )}
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                      Enunciado da Pergunta *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: O que Jesus disse quando acalmou o mar?"
                      value={q.question}
                      onChange={e => {
                        const next = [...editingQuiz]
                        next[qIdx].question = e.target.value
                        setEditingQuiz(next)
                      }}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                    />
                  </div>

                  {/* 4 Alternativas */}
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                    Alternativas (Marque a correta no círculo):
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input
                          type="radio"
                          name={`correct_${qIdx}`}
                          checked={q.correct_index === oIdx}
                          onChange={() => {
                            const next = [...editingQuiz]
                            next[qIdx].correct_index = oIdx
                            setEditingQuiz(next)
                          }}
                          title="Marcar como resposta correta"
                        />
                        <input
                          type="text"
                          placeholder={`Opção ${String.fromCharCode(65 + oIdx)}`}
                          value={opt}
                          onChange={e => {
                            const next = [...editingQuiz]
                            const newOpts = [...next[qIdx].options]
                            newOpts[oIdx] = e.target.value
                            next[qIdx].options = newOpts
                            setEditingQuiz(next)
                          }}
                          style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                      Explicação Bíblica ao Responder
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Em Marcos 4:39 Jesus diz 'Aquieta-te' e a tempestade cessou."
                      value={q.explanation || ''}
                      onChange={e => {
                        const next = [...editingQuiz]
                        next[qIdx].explanation = e.target.value
                        setEditingQuiz(next)
                      }}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddQuestion}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px',
                  background: '#f1f5f9', border: '1px dashed #cbd5e1', borderRadius: 8,
                  fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer'
                }}
              >
                <Plus size={16} /> Adicionar Outra Pergunta
              </button>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{ padding: '10px 18px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', fontSize: 13, cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px',
                    background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8,
                    fontSize: 13, fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  <Save size={16} /> Salvar Quiz no Catálogo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
