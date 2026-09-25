import React, { useState, useEffect } from 'react'
import {
  CheckCircle2, Clock, Palette, HelpCircle,
  FileText, Star, Save, CheckCircle, Eye,
  GraduationCap, MessageSquare, Send, Sparkles,
  ChevronRight, AlertTriangle
} from 'lucide-react'
import { supabase } from '@comdeuskids/supabase'
import { useAuth } from '../../hooks/useAuth'

export function EntregasCorrecoes() {
  const { user } = useAuth()
  const [submissions, setSubmissions] = useState<any[]>([])
  const [selectedSub, setSelectedSub] = useState<any | null>(null)
  const [feedbackText, setFeedbackText] = useState('')
  const [grade, setGrade] = useState<number>(10)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSubmissions() {
      if (!user) return
      setLoading(true)

      // Carregar entregas das aulas
      const { data } = await supabase
        .from('educational_submissions')
        .select(`
          *,
          lesson:educational_lessons(title, biblical_reference)
        `)
        .order('submitted_at', { ascending: false })

      if (data && data.length > 0) {
        setSubmissions(data)
        selectSubmission(data[0])
      } else {
        // Exemplos pedagógicos para visualização completa
        const mockSubs = [
          {
            id: 'sub-1',
            student_name: 'Davi Lucas (7 anos)',
            lesson: { title: 'A Criação do Mundo', biblical_reference: 'Gênesis 1' },
            score: 10,
            max_score: 10,
            status: 'submitted',
            feedback: '',
            submitted_at: new Date().toISOString(),
            answers: [
              { type: 'quiz', title: 'Quiz: O que Deus disse no 1º dia?', answer: 'Haja luz', is_correct: true },
              { type: 'coloring', title: 'Pintura: O Jardim de Deus', drawing_url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect width="100%" height="100%" fill="%23f0fdf4"/><circle cx="150" cy="90" r="40" fill="%23facc15"/><text x="150" y="155" text-anchor="middle" fill="%23166534" font-size="13" font-family="sans-serif" font-weight="bold">Sol e Flores de Davi</text></svg>' },
              { type: 'homework', title: 'Lição Prática', answer: 'Eu amo o sol e as flores que Deus fez com tanto carinho!' }
            ]
          },
          {
            id: 'sub-2',
            student_name: 'Ester Ferreira (6 anos)',
            lesson: { title: 'A Arca de Noé', biblical_reference: 'Gênesis 6' },
            score: 9,
            max_score: 10,
            status: 'reviewed',
            feedback: 'Parabéns, Ester! Sua pintura do arco-íris ficou linda e cheia de alegria!',
            submitted_at: new Date(Date.now() - 86400000).toISOString(),
            answers: [
              { type: 'quiz', title: 'Quantos de cada animal entraram na arca?', answer: 'Um casal de cada', is_correct: true },
              { type: 'coloring', title: 'Pintura: Arco-íris da Promessa', drawing_url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect width="100%" height="100%" fill="%23eff6ff"/><circle cx="150" cy="180" r="110" fill="none" stroke="%23ec4899" stroke-width="12"/><circle cx="150" cy="180" r="95" fill="none" stroke="%233b82f6" stroke-width="12"/><text x="150" y="90" text-anchor="middle" fill="%231e3a8a" font-size="13" font-family="sans-serif">Arco-íris da Ester</text></svg>' }
            ]
          },
          {
            id: 'sub-3',
            student_name: 'Samuel Silva (8 anos)',
            lesson: { title: 'Davi e Golias', biblical_reference: '1 Samuel 17' },
            score: 10,
            max_score: 10,
            status: 'submitted',
            feedback: '',
            submitted_at: new Date(Date.now() - 172800000).toISOString(),
            answers: [
              { type: 'quiz', title: 'O que Davi usou para vencer o gigante?', answer: 'Uma funda, 5 pedras e a fé em Deus', is_correct: true },
              { type: 'homework', title: 'O que aprendemos?', answer: 'Que com Deus podemos vencer qualquer medo!' }
            ]
          }
        ]
        setSubmissions(mockSubs)
        selectSubmission(mockSubs[0])
      }
      setLoading(false)
    }

    loadSubmissions()
  }, [user])

  function selectSubmission(sub: any) {
    setSelectedSub(sub)
    setFeedbackText(sub.feedback || '')
    setGrade(sub.score || 10)
  }

  const handleSaveEvaluation = async () => {
    if (!selectedSub) return
    setSaving(true)

    if (selectedSub.id && !selectedSub.id.startsWith('sub-')) {
      await supabase
        .from('educational_submissions')
        .update({
          score: grade,
          feedback: feedbackText,
          status: 'reviewed',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', selectedSub.id)
    }

    selectedSub.score = grade
    selectedSub.feedback = feedbackText
    selectedSub.status = 'reviewed'

    setSaving(false)
    setMessage('Avaliação e feedback registrados com sucesso!')
    setTimeout(() => setMessage(null), 3500)
  }

  const pendingCount = submissions.filter(s => s.status !== 'reviewed').length
  const reviewedCount = submissions.filter(s => s.status === 'reviewed').length

  if (loading) {
    return (
      <div className="s-page s-page--wide">
        <div className="s-skeleton" style={{ height: 40, width: 280, marginBottom: 16 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.6fr)', gap: 20 }}>
          <div className="s-skeleton s-skeleton-card" style={{ height: 400 }} />
          <div className="s-skeleton s-skeleton-card" style={{ height: 400 }} />
        </div>
      </div>
    )
  }

  return (
    <div className="s-page s-page--wide">
      {/* Toast Feedback */}
      {message && (
        <div className="s-toast-container">
          <div className="s-toast s-toast-success">
            <CheckCircle size={18} />
            <span>{message}</span>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="s-page-header">
        <div>
          <span className="s-page-header__eyebrow">
            <GraduationCap size={13} style={{ display: 'inline', marginRight: 4 }} />
            Painel Pedagógico • Ciclo de Aprendizagem
          </span>
          <h1>Atividades & Correções</h1>
          <p>Acompanhe entregas, corrija quizzes e visualize os desenhos dos alunos com feedback carinhoso.</p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <span className="s-badge s-badge-primary">
            {pendingCount} pendente{pendingCount !== 1 ? 's' : ''} de correção
          </span>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="s-grid-3" style={{ marginBottom: 24 }}>
        <div className="s-card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--s-success-light)', color: 'var(--s-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--s-text-caption)', fontWeight: 700 }}>Concluídas & Corrigidas</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--s-text-title)' }}>{reviewedCount} entregas</div>
          </div>
        </div>

        <div className="s-card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--s-primary-light)', color: 'var(--s-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--s-text-caption)', fontWeight: 700 }}>Aguardando Avaliação</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--s-primary)' }}>{pendingCount} requerem atenção</div>
          </div>
        </div>

        <div className="s-card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--s-text-caption)', fontWeight: 700 }}>Total Recebido</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--s-text-title)' }}>{submissions.length} atividades</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Submissions Feed + Evaluation Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 1.85fr)', gap: 24, alignItems: 'start' }}>
        {/* Coluna Esquerda: Lista de Entregas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="s-section-head">
            <h2>Alunos que Entregaram ({submissions.length})</h2>
          </div>

          {submissions.map(sub => {
            const isSelected = selectedSub?.id === sub.id
            const isReviewed = sub.status === 'reviewed'

            return (
              <div
                key={sub.id}
                onClick={() => selectSubmission(sub)}
                className="s-card"
                style={{
                  cursor: 'pointer',
                  border: isSelected ? '2px solid var(--s-primary)' : '1px solid var(--s-border)',
                  background: isSelected ? 'var(--s-surface)' : 'var(--s-surface)',
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: isReviewed ? 'var(--s-success-light)' : 'var(--s-primary-light)', color: isReviewed ? 'var(--s-success)' : 'var(--s-primary)', fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {sub.student_name.charAt(0)}
                    </div>
                    <div>
                      <strong style={{ fontSize: 14, color: 'var(--s-text-title)', display: 'block' }}>{sub.student_name}</strong>
                      <span style={{ fontSize: 11, color: 'var(--s-text-muted)' }}>{sub.lesson?.title || 'Lição Bíblica'}</span>
                    </div>
                  </div>

                  <span className={`s-badge ${isReviewed ? 's-badge-success' : 's-badge-warning'}`}>
                    {isReviewed ? 'Corrigido' : 'Pendente'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--s-border)', fontSize: 11.5 }}>
                  <span style={{ color: 'var(--s-text-muted)' }}>
                    Nota: <strong style={{ color: 'var(--s-text-title)' }}>{sub.score || 0} / 10</strong>
                  </span>
                  <span style={{ color: isSelected ? 'var(--s-primary)' : 'var(--s-text-caption)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    Ver respostas <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Coluna Direita: Detalhes da Submissão e Formulário de Avaliação */}
        {selectedSub ? (
          <div className="s-card s-card--large" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Header do Aluno */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 16, borderBottom: '1px solid var(--s-border)' }}>
              <div>
                <span style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--s-primary)', fontWeight: 700 }}>
                  Atividade Selecionada
                </span>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--s-text-title)', margin: '4px 0 2px 0' }}>
                  {selectedSub.student_name}
                </h2>
                <div style={{ fontSize: 12.5, color: 'var(--s-text-muted)' }}>
                  Aula: <strong>{selectedSub.lesson?.title}</strong> ({selectedSub.lesson?.biblical_reference || 'Bíblia'})
                </div>
              </div>

              <span className={`s-badge ${selectedSub.status === 'reviewed' ? 's-badge-success' : 's-badge-warning'}`}>
                {selectedSub.status === 'reviewed' ? 'Avaliação Finalizada' : 'Aguardando Feedback'}
              </span>
            </div>

            {/* Respostas e Trabalhos do Aluno */}
            <div>
              <div className="s-section-head" style={{ marginBottom: 12 }}>
                <h2>Trabalhos & Respostas Enviadas</h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {selectedSub.answers?.map((ans: any, idx: number) => (
                  <div key={idx} style={{ padding: 14, borderRadius: 12, background: 'var(--s-surface-low)', border: '1px solid var(--s-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      {ans.type === 'quiz' ? (
                        <HelpCircle size={16} style={{ color: 'var(--s-primary)' }} />
                      ) : ans.type === 'coloring' ? (
                        <Palette size={16} style={{ color: '#ec4899' }} />
                      ) : (
                        <FileText size={16} style={{ color: '#2563EB' }} />
                      )}
                      <strong style={{ fontSize: 13, color: 'var(--s-text-title)' }}>{ans.title}</strong>
                    </div>

                    {ans.drawing_url ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--s-border)', maxWidth: 320, background: '#fff' }}>
                          <img src={ans.drawing_url} alt="Desenho do aluno" style={{ width: '100%', height: 'auto', display: 'block' }} />
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--s-text-muted)' }}>Pintura digital realizada no Coloring Studio</span>
                      </div>
                    ) : (
                      <div style={{ fontSize: 13, color: 'var(--s-text-body)', padding: '8px 12px', background: '#fff', borderRadius: 8, border: '1px solid var(--s-border)' }}>
                        "{ans.answer}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Formulário de Nota e Feedback */}
            <div style={{ background: 'var(--s-surface-low)', padding: 18, borderRadius: 16, border: '1px solid var(--s-border)' }}>
              <div className="s-section-head" style={{ marginBottom: 12 }}>
                <h2>Nota & Mensagem de Incentivo</h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label className="s-label" style={{ margin: 0 }}>Pontuação (0 a 10)</label>
                    <strong style={{ fontSize: 16, color: 'var(--s-primary)' }}>{grade} / 10</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={grade}
                    onChange={e => setGrade(Number(e.target.value))}
                    className="s-range"
                  />
                </div>

                <div>
                  <label className="s-label">Mensagem para o Aluno e a Família</label>
                  <textarea
                    rows={3}
                    className="s-textarea"
                    placeholder="Escreva uma mensagem calorosa e bíblica de incentivo para a criança..."
                    value={feedbackText}
                    onChange={e => setFeedbackText(e.target.value)}
                  />
                </div>

                <button
                  className="s-btn s-btn-primary"
                  onClick={handleSaveEvaluation}
                  disabled={saving}
                  style={{ width: '100%', minHeight: 44 }}
                >
                  {saving ? 'Registrando...' : <><Save size={16} /> Salvar Avaliação e Enviar Feedback</>}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="s-card" style={{ padding: 48, textAlign: 'center' }}>
            <p style={{ color: 'var(--s-text-muted)', margin: 0 }}>Selecione um aluno na lista ao lado para ver o trabalho e avaliar.</p>
          </div>
        )}
      </div>
    </div>
  )
}
