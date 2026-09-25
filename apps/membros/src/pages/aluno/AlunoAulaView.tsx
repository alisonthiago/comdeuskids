import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  BookOpen,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Send,
  Award,
  ArrowRight,
  UserCheck,
  Clock,
  Printer,
  FileText
} from 'lucide-react'
import { supabase } from '@comdeuskids/supabase'
import { ColoringStudio } from '../../components/ColoringStudio'

export function AlunoAulaView() {
  const { code } = useParams<{ code: string }>()
  const [lesson, setLesson] = useState<any | null>(null)
  const [blocks, setBlocks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Identificação do Aluno
  const [studentName, setStudentName] = useState('')
  const [isIdentified, setIsIdentified] = useState(false)

  // Sessão Educacional & Tempo
  const [startedAt, setStartedAt] = useState<string>('')
  const [durationMinutes, setDurationMinutes] = useState<number>(0)

  // Respostas e Autosave
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({})
  const [homeworkAnswers, setHomeworkAnswers] = useState<Record<number, string>>({})
  const [drawingDataUrl, setDrawingDataUrl] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [calculatedScore, setCalculatedScore] = useState<number>(10)
  const [quizResults, setQuizResults] = useState<{ total: number; correct: number }>({ total: 0, correct: 0 })

  const storageKey = `cdk_student_draft_${code || 'general'}`

  // Carregar dados da aula
  useEffect(() => {
    async function loadLesson() {
      setLoading(true)
      const { data: les } = await supabase
        .from('educational_lessons')
        .select('*')
        .eq('share_code', code?.toUpperCase())
        .single()

      if (les) {
        setLesson(les)
        const { data: bks } = await supabase
          .from('educational_lesson_blocks')
          .select('*')
          .eq('lesson_id', les.id)
          .order('order_index', { ascending: true })

        if (bks) setBlocks(bks)
      } else {
        setLesson(null)
      }

      // Tentar restaurar sessão do aluno
      const savedProgress = localStorage.getItem(storageKey)
      if (savedProgress) {
        try {
          const parsed = JSON.parse(savedProgress)
          if (parsed.studentName) {
            setStudentName(parsed.studentName)
            setIsIdentified(true)
          }
          if (parsed.quizAnswers) setQuizAnswers(parsed.quizAnswers)
          if (parsed.homeworkAnswers) setHomeworkAnswers(parsed.homeworkAnswers)
          if (parsed.startedAt) setStartedAt(parsed.startedAt)
        } catch {}
      }

      setLoading(false)
    }

    loadLesson()
  }, [code])

  // Autosave contínuo do progresso
  useEffect(() => {
    if (!isIdentified) return
    const payload = {
      studentName,
      quizAnswers,
      homeworkAnswers,
      startedAt
    }
    localStorage.setItem(storageKey, JSON.stringify(payload))
  }, [quizAnswers, homeworkAnswers, isIdentified, studentName])

  const handleStartLesson = () => {
    if (!studentName.trim()) return
    const now = new Date().toISOString()
    setStartedAt(now)
    setIsIdentified(true)
    localStorage.setItem(storageKey, JSON.stringify({ studentName, startedAt: now }))
  }

  const handleSubmit = async () => {
    if (!studentName.trim()) {
      alert('Por favor, informe seu nome para entregar a atividade.')
      return
    }

    setSubmitting(true)

    // Calcular acertos e pontuação automática do quiz
    let correctCount = 0
    let totalQuiz = 0
    let totalPoints = 0
    let maxPoints = 0

    blocks.forEach((blk, idx) => {
      if (blk.block_type === 'quiz') {
        totalQuiz++
        const selected = quizAnswers[idx]
        const correct = blk.content_payload.correct_index
        maxPoints += blk.points || 10
        if (selected === correct) {
          correctCount++
          totalPoints += blk.points || 10
        }
      }
    })

    const finalScore = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 10 * 10) / 10 : 10
    setCalculatedScore(finalScore)
    setQuizResults({ total: totalQuiz, correct: correctCount })

    // Calcular duração em minutos
    const submitTime = new Date()
    const startTime = startedAt ? new Date(startedAt) : new Date()
    const diffMin = Math.max(1, Math.round((submitTime.getTime() - startTime.getTime()) / 60000))
    setDurationMinutes(diffMin)

    // Gravar no Supabase se houver aula real
    if (lesson?.id) {
      const { data: sub } = await supabase
        .from('educational_submissions')
        .insert({
          lesson_id: lesson.id,
          student_name: studentName,
          status: 'submitted',
          score: finalScore,
          max_score: 10,
          submitted_at: submitTime.toISOString()
        })
        .select()
        .single()

      if (sub) {
        // Gravar cada resposta
        for (let i = 0; i < blocks.length; i++) {
          const blk = blocks[i]
          if (blk.block_type === 'quiz') {
            await supabase.from('educational_submission_answers').insert({
              submission_id: sub.id,
              block_id: blk.id,
              block_type: 'quiz',
              answer_payload: { selected_option: quizAnswers[i] },
              is_correct: quizAnswers[i] === blk.content_payload.correct_index,
              points_awarded: quizAnswers[i] === blk.content_payload.correct_index ? (blk.points || 10) : 0
            })
          } else if (blk.block_type === 'coloring') {
            await supabase.from('educational_submission_answers').insert({
              submission_id: sub.id,
              block_id: blk.id,
              block_type: 'coloring',
              answer_payload: { drawing_url: drawingDataUrl }
            })
          } else if (blk.block_type === 'homework') {
            await supabase.from('educational_submission_answers').insert({
              submission_id: sub.id,
              block_id: blk.id,
              block_type: 'homework',
              answer_payload: { text: homeworkAnswers[i] || '' }
            })
          }
        }
      }
    }

    // Limpar rascunho após entrega bem-sucedida
    localStorage.removeItem(storageKey)
    localStorage.removeItem(`cdk_drawing_${code}`)

    setSubmitting(false)
    setIsCompleted(true)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b0c10', color: '#fff' }}>
        Carregando aula bíblica...
      </div>
    )
  }

  // Código inválido ou aula inexistente: mensagem genérica sem vazar dados
  if (!lesson) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0b0c10',
        padding: '24px',
        color: '#fff',
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }}>
        <div style={{
          maxWidth: '460px',
          width: '100%',
          background: '#13141c',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '40px 28px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#f87171',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <HelpCircle size={32} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 10px 0' }}>
            Aula não encontrada
          </h2>
          <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '24px' }}>
            Não encontramos nenhuma aula ativa com o código informado. Verifique com seu professor se o código ou o link está correto.
          </p>
          <Link
            to="/familia"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '8px',
              background: '#334155',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '13px'
            }}
          >
            Voltar ao Início
          </Link>
        </div>
      </div>
    )
  }

  // Tela de Conclusão / Parabéns
  if (isCompleted) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0b0c10',
        padding: '20px',
        color: '#fff',
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }}>
        <div style={{
          maxWidth: '520px',
          width: '100%',
          background: '#13141c',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '40px 28px',
          textAlign: 'center',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #facc15, #f59e0b)',
            color: '#78350f',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 10px 25px rgba(250, 204, 21, 0.4)'
          }}>
            <Award size={48} />
          </div>

          <h2 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 8px 0', color: '#fff' }}>
            Parabéns, {studentName}! 🌟
          </h2>
          <p style={{ fontSize: '15px', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '24px' }}>
            Sua atividade foi entregue para o professor! Você demonstrou dedicação e carinho na Palavra de Deus.
          </p>

          {/* Resumo Acolhedor Sem Ranking */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid rgba(255,255,255,0.06)',
            marginBottom: '28px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px'
          }}>
            <div>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>Acertos no Quiz</span>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>
                {quizResults.correct} de {quizResults.total}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>Tempo de Dedicação</span>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#60a5fa', marginTop: '4px' }}>
                {durationMinutes} min
              </div>
            </div>
          </div>

          <Link
            to="/familia"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '14px'
            }}
          >
            Voltar para a Área de Membros
          </Link>
        </div>
      </div>
    )
  }

  // Tela de Identificação Inicial
  if (!isIdentified) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0b0c10',
        padding: '20px',
        color: '#fff',
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }}>
        <div style={{
          maxWidth: '440px',
          width: '100%',
          background: '#13141c',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '36px 28px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <BookOpen size={32} />
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 6px 0' }}>
            {lesson?.title}
          </h2>
          <span style={{ fontSize: '13px', color: '#60a5fa', fontWeight: 600 }}>
            {lesson?.biblical_reference}
          </span>

          <p style={{ fontSize: '14px', color: '#94a3b8', margin: '16px 0 24px 0' }}>
            Digite seu nome para iniciar sua aula bíblica interativa:
          </p>

          <input
            type="text"
            value={studentName}
            onChange={e => setStudentName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleStartLesson() }}
            placeholder="Seu lindo nome..."
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              background: '#0b0c10',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff',
              fontSize: '15px',
              marginBottom: '16px',
              textAlign: 'center'
            }}
          />

          <button
            onClick={handleStartLesson}
            disabled={!studentName.trim()}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
              fontWeight: 700,
              fontSize: '15px',
              cursor: studentName.trim() ? 'pointer' : 'not-allowed',
              opacity: studentName.trim() ? 1 : 0.6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            Entrar na Sala de Aula <ArrowRight size={18} />
          </button>
        </div>
      </div>
    )
  }

  // Sala de Aula do Aluno
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0b0c10',
      color: '#fff',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      padding: '30px 20px'
    }}>
      <div style={{ maxWidth: '820px', margin: '0 auto' }}>
        {/* Cabeçalho */}
        <div style={{
          background: '#13141c',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '24px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase' }}>
              Aula Bíblica Interativa
            </span>
            <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0 2px 0' }}>
              {lesson?.title}
            </h1>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>
              {lesson?.biblical_reference} • Aluno(a): <strong style={{ color: '#fff' }}>{studentName}</strong>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              background: 'rgba(59, 130, 246, 0.15)',
              color: '#60a5fa',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <UserCheck size={14} /> Aluno Identificado
            </span>
            <span style={{
              background: 'rgba(34, 197, 94, 0.15)',
              color: '#4ade80',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Clock size={14} /> Autosave Ativo
            </span>
          </div>
        </div>

        {/* Blocos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '36px' }}>
          {blocks.map((block, idx) => (
            <div
              key={idx}
              style={{
                background: '#13141c',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '24px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'rgba(59, 130, 246, 0.2)',
                  color: '#60a5fa',
                  fontSize: '13px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {idx + 1}
                </span>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#fff', margin: 0 }}>
                  {block.title}
                </h3>
              </div>

              {/* História Bíblica */}
              {block.block_type === 'story' && (
                <div style={{ background: '#0b0c10', borderRadius: '12px', padding: '18px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ fontSize: '15px', lineHeight: 1.8, color: '#cbd5e1', margin: 0 }}>
                    {block.content_payload.text}
                  </p>
                </div>
              )}

              {/* Quiz Bíblico */}
              {block.block_type === 'quiz' && (
                <div>
                  <p style={{ fontSize: '15px', fontWeight: 600, color: '#fff', marginBottom: '14px' }}>
                    {block.content_payload.question}
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {(block.content_payload.options || []).map((opt: string, optIdx: number) => {
                      const isSelected = quizAnswers[idx] === optIdx
                      return (
                        <button
                          key={optIdx}
                          onClick={() => setQuizAnswers({ ...quizAnswers, [idx]: optIdx })}
                          style={{
                            padding: '12px 16px',
                            borderRadius: '10px',
                            background: isSelected ? 'rgba(59, 130, 246, 0.25)' : '#0b0c10',
                            border: isSelected ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.08)',
                            color: isSelected ? '#fff' : '#cbd5e1',
                            fontWeight: 600,
                            fontSize: '14px',
                            textAlign: 'left',
                            cursor: 'pointer'
                          }}
                        >
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Estúdio de Pintura Digital Completo */}
              {block.block_type === 'coloring' && (
                <div>
                  <ColoringStudio
                    initialInstructions={block.content_payload.instructions}
                    storageKey={`cdk_drawing_${code || 'general'}`}
                    onSave={dataUrl => setDrawingDataUrl(dataUrl)}
                  />
                </div>
              )}

              {/* Lição de Casa */}
              {block.block_type === 'homework' && (
                <div>
                  <p style={{ fontSize: '15px', fontWeight: 600, color: '#fff', marginBottom: '12px' }}>
                    {block.content_payload.prompt}
                  </p>
                  <textarea
                    rows={3}
                    value={homeworkAnswers[idx] || ''}
                    onChange={e => setHomeworkAnswers({ ...homeworkAnswers, [idx]: e.target.value })}
                    placeholder="Escreva sua respostinha aqui..."
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      background: '#0b0c10',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      fontSize: '14px'
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Botão Entregar */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '14px 40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: '#fff',
              border: 'none',
              fontWeight: 800,
              fontSize: '16px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 10px 25px rgba(34, 197, 94, 0.4)'
            }}
          >
            <Send size={18} /> {submitting ? 'Enviando ao Professor...' : 'Finalizar e Enviar Aula'}
          </button>
        </div>
      </div>
    </div>
  )
}
