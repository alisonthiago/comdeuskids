import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { STREAM_CATALOG } from '../data/streamCatalog'
import {
  Award, CheckCircle2, XCircle, ChevronLeft, ChevronRight,
  RotateCcw, Sparkles, Download, Play, Trophy, Star
} from 'lucide-react'

export default function QuizDetail() {
  const { id, slug } = useParams<{ id?: string; slug?: string }>()
  const navigate = useNavigate()

  // Encontra o item de conteúdo correspondente
  const content = STREAM_CATALOG.find(c => c.id === id || c.slug === slug || c.id === 'davi-golias') || STREAM_CATALOG[0]
  const quizQuestions = content.quiz && content.quiz.length > 0 ? content.quiz : [
    {
      question: 'O que o jovem Davi cuidava antes de enfrentar o gigante?',
      options: ['De um exército', 'Das ovelhas do seu pai', 'De um navio', 'De uma plantação'],
      correct_index: 1,
      explanation: 'Davi era um pastor dedicado que cuidava com amor das ovelhinhas do pai!'
    },
    {
      question: 'Quantas pedrinhas lisas Davi escolheu no ribeiro?',
      options: ['1 pedrinha', '3 pedrinhas', '5 pedrinhas', '12 pedrinhas'],
      correct_index: 2,
      explanation: 'Davi pegou 5 pedras lisas no riacho para colocar em sua sacola.'
    },
    {
      question: 'Em nome de quem Davi venceu a batalha?',
      options: ['Em nome do Rei', 'Em seu próprio nome', 'Em nome do Senhor dos Exércitos', 'Em nome dos soldados'],
      correct_index: 2,
      explanation: 'Davi confiou inteiramente no poder do Deus Todo-Poderoso!'
    }
  ]

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  const currentQ = quizQuestions[currentIndex]

  const handleSelect = (index: number) => {
    if (isAnswered) return
    setSelectedOption(index)
    setIsAnswered(true)

    if (index === currentQ.correct_index) {
      setScore(prev => prev + 1)
    }
  }

  const handleNext = () => {
    if (currentIndex + 1 < quizQuestions.length) {
      setCurrentIndex(prev => prev + 1)
      setSelectedOption(null)
      setIsAnswered(false)
    } else {
      setIsCompleted(true)
    }
  }

  const handleRestart = () => {
    setCurrentIndex(0)
    setSelectedOption(null)
    setIsAnswered(false)
    setScore(0)
    setIsCompleted(false)
  }

  return (
    <div style={{
      maxWidth: 800,
      margin: '0 auto',
      padding: '24px 16px 80px',
      fontFamily: "'Baloo 2', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      {/* Botão Voltar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button
          type="button"
          onClick={() => navigate('/aprender')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid #2a2a2c',
            borderRadius: 12,
            padding: '8px 14px',
            color: '#cbc3d7',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <ChevronLeft size={16} />
          Voltar para Aprender
        </button>
        <span style={{ fontSize: 13, color: '#958ea0' }}>•</span>
        <span style={{ fontSize: 13, color: '#ffb95f', fontWeight: 800 }}>Desafio Bíblico</span>
      </div>

      {!isCompleted ? (
        <div style={{
          backgroundColor: '#1c1b1d',
          borderRadius: 24,
          padding: '32px 28px',
          border: '1px solid #2a2a2c',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.45)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Barra de Progresso */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#22c55e' }}>
                Pergunta {currentIndex + 1} de {quizQuestions.length}
              </span>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#ffb95f' }}>
                ⭐ {score * 50} Pontos
              </span>
            </div>
            <div style={{
              height: 8,
              backgroundColor: '#201f21',
              borderRadius: 4,
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${((currentIndex + 1) / quizQuestions.length) * 100}%`,
                backgroundColor: '#22c55e',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>

          {/* Pergunta */}
          <h2 style={{
            fontSize: 'clamp(20px, 3.5vw, 26px)',
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1.3,
            margin: '0 0 24px'
          }}>
            {currentQ.question}
          </h2>

          {/* Opções de Resposta */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedOption === idx
              const isCorrect = idx === currentQ.correct_index

              let bgColor = '#201f21'
              let borderColor = '#2a2a2c'
              let textColor = '#e5e1e4'

              if (isAnswered) {
                if (isCorrect) {
                  bgColor = 'rgba(0, 155, 209, 0.2)'
                  borderColor = '#009bd1'
                  textColor = '#7bd0ff'
                } else if (isSelected) {
                  bgColor = 'rgba(255, 180, 171, 0.2)'
                  borderColor = '#ffb4ab'
                  textColor = '#ffb4ab'
                }
              } else if (isSelected) {
                bgColor = 'rgba(34, 197, 94, 0.15)'
                borderColor = '#22c55e'
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelect(idx)}
                  disabled={isAnswered}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderRadius: 16,
                    backgroundColor: bgColor,
                    border: `2px solid ${borderColor}`,
                    color: textColor,
                    fontSize: 15,
                    fontWeight: 700,
                    textAlign: 'left',
                    cursor: isAnswered ? 'default' : 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 13,
                      fontWeight: 800
                    }}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{option}</span>
                  </div>

                  {isAnswered && isCorrect && <CheckCircle2 size={20} color="#7bd0ff" />}
                  {isAnswered && isSelected && !isCorrect && <XCircle size={20} color="#ffb4ab" />}
                </button>
              )
            })}
          </div>

          {/* Feedback & Explicação */}
          {isAnswered && (
            <div style={{
              marginTop: 24,
              padding: '16px 20px',
              borderRadius: 16,
              backgroundColor: selectedOption === currentQ.correct_index ? 'rgba(0, 155, 209, 0.15)' : 'rgba(255, 185, 95, 0.15)',
              border: `1px solid ${selectedOption === currentQ.correct_index ? '#009bd1' : '#ee9800'}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}>
              <div style={{
                fontSize: 14,
                fontWeight: 800,
                color: selectedOption === currentQ.correct_index ? '#7bd0ff' : '#ffb95f'
              }}>
                {selectedOption === currentQ.correct_index ? '🎉 Muito bem! Resposta Correta!' : '💡 Quase lá! Veja a explicação:'}
              </div>
              <p style={{ fontSize: 13, color: '#e5e1e4', margin: 0, lineHeight: 1.5 }}>
                {currentQ.explanation}
              </p>
            </div>
          )}

          {/* Botão Próxima Pergunta */}
          {isAnswered && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
              <button
                type="button"
                onClick={handleNext}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: '#22c55e',
                  color: '#052e16',
                  border: 'none',
                  borderRadius: 14,
                  padding: '12px 28px',
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(34, 197, 94, 0.4)'
                }}
              >
                {currentIndex + 1 < quizQuestions.length ? 'Próxima Pergunta' : 'Ver Resultado'}
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Tela de Conclusão */
        <div style={{
          backgroundColor: '#1c1b1d',
          borderRadius: 24,
          padding: '48px 32px',
          border: '1px solid #2a2a2c',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.45)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 185, 95, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffb95f',
            marginBottom: 20
          }}>
            <Trophy size={44} />
          </div>

          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#ffffff', margin: '0 0 10px' }}>
            Parabéns! Quiz Concluído!
          </h2>

          <p style={{ fontSize: 15, color: '#cbc3d7', margin: '0 0 24px', maxWidth: 450 }}>
            Você acertou <strong>{score}</strong> de <strong>{quizQuestions.length}</strong> perguntas na história de <strong>{content.title}</strong>!
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            backgroundColor: '#201f21',
            borderRadius: 16,
            padding: '16px 32px',
            border: '1px solid #2a2a2c',
            marginBottom: 32
          }}>
            <div>
              <div style={{ fontSize: 12, color: '#958ea0', fontWeight: 700 }}>PONTUAÇÃO</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#ffb95f' }}>+{score * 50} XP</div>
            </div>
            <div style={{ width: 1, height: 40, backgroundColor: '#2a2a2c' }} />
            <div>
              <div style={{ fontSize: 12, color: '#958ea0', fontWeight: 700 }}>PRECISÃO</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#7bd0ff' }}>
                {Math.round((score / quizQuestions.length) * 100)}%
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={handleRestart}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                backgroundColor: '#201f21',
                color: '#cbc3d7',
                border: '1px solid #2a2a2c',
                borderRadius: 12,
                padding: '12px 20px',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={16} />
              Refazer Quiz
            </button>

            {content.related_pdf_id && (
              <Link
                to="/materiais-em-pdf"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: '#ee9800',
                  color: '#ffffff',
                  borderRadius: 12,
                  padding: '12px 24px',
                  fontSize: 14,
                  fontWeight: 800,
                  textDecoration: 'none'
                }}
              >
                <Download size={16} />
                Baixar PDF de Atividades
              </Link>
            )}

            <button
              type="button"
              onClick={() => navigate('/aprender')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                backgroundColor: '#22c55e',
                color: '#052e16',
                border: 'none',
                borderRadius: 12,
                padding: '12px 24px',
                fontSize: 14,
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Explorar Outras Lições
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
