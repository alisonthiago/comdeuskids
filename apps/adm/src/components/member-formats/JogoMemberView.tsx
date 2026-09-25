import React, { useState } from 'react'
import { Gamepad2, Trophy, Star, CheckCircle, XCircle, RotateCcw, BookOpen, Award, Users } from 'lucide-react'

type QuizQuestion = {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export default function JogoMemberView({
  productId,
  productTitle,
  activeTab
}: {
  productId: string
  productTitle: string
  activeTab: string
}) {
  const initialQuestions: QuizQuestion[] = [
    {
      id: 'q1',
      question: 'Quem construiu a grande arca para salvar os animais do dilúvio?',
      options: ['Moisés', 'Noé', 'Abraão', 'Davi'],
      correctIndex: 1,
      explanation: 'Noé obedeceu a Deus com fé e construiu a arca exatamente como o Senhor mandou (Gênesis 6).'
    },
    {
      id: 'q2',
      question: 'Quantas pedrinhas Davi pegou no riacho para enfrentar Golias?',
      options: ['3 pedrinhas', '5 pedrinhas', '7 pedrinhas', '12 pedrinhas'],
      correctIndex: 1,
      explanation: 'Davi escolheu cinco pedrinhas lisas no riacho e colocou na sua bolsa de pastor (1 Samuel 17:40).'
    },
    {
      id: 'q3',
      question: 'Qual profeta passou a noite inteira na cova dos leões sem se ferir?',
      options: ['Daniel', 'Elias', 'Jonas', 'Samuel'],
      correctIndex: 0,
      explanation: 'Deus enviou o seu anjo e fechou a boca dos leões porque Daniel confiou no Senhor (Daniel 6).'
    }
  ]

  const [currentQIndex, setCurrentQIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [gameFinished, setGameFinished] = useState(false)

  const currentQ = initialQuestions[currentQIndex]

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return
    setSelectedOption(idx)
    setIsAnswered(true)
    if (idx === currentQ.correctIndex) {
      setScore(prev => prev + 100)
    }
  }

  const handleNextQuestion = () => {
    if (currentQIndex < initialQuestions.length - 1) {
      setCurrentQIndex(prev => prev + 1)
      setSelectedOption(null)
      setIsAnswered(false)
    } else {
      setGameFinished(true)
    }
  }

  const handleRestart = () => {
    setCurrentQIndex(0)
    setSelectedOption(null)
    setIsAnswered(false)
    setScore(0)
    setGameFinished(false)
  }

  // Tabela de Ranking
  const leaderboard = [
    { rank: 1, name: 'Lucas Gabriel (7 anos)', points: 300, stars: 3, date: 'Hoje' },
    { rank: 2, name: 'Sofia Vitória (8 anos)', points: 300, stars: 3, date: 'Ontem' },
    { rank: 3, name: 'Mateus Oliveira (6 anos)', points: 200, stars: 2, date: 'Há 2 dias' },
    { rank: 4, name: 'Isabela Maria (9 anos)', points: 200, stars: 2, date: 'Há 3 dias' },
    { rank: 5, name: 'Pedro Henrique (7 anos)', points: 100, stars: 1, date: 'Há 4 dias' }
  ]

  if (activeTab === 'ranking') {
    return (
      <div style={{ marginTop: 20 }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Trophy size={18} color="#eab308" /> Tabela de Recordes Bíblicos
              </h3>
              <small style={{ color: '#64748b' }}>Os pequenos heróis da fé com maior pontuação neste jogo</small>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, background: '#fef9c3', color: '#854d0e', padding: '4px 10px', borderRadius: 20 }}>
              Temporada Ativa
            </span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                <th style={{ padding: '8px 12px' }}>Posição</th>
                <th style={{ padding: '8px 12px' }}>Participante</th>
                <th style={{ padding: '8px 12px' }}>Estrelas</th>
                <th style={{ padding: '8px 12px' }}>Pontuação</th>
                <th style={{ padding: '8px 12px' }}>Data</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map(item => (
                <tr key={item.rank} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '12px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: item.rank === 1 ? '#fef08a' : item.rank === 2 ? '#e2e8f0' : item.rank === 3 ? '#ffedd5' : '#f8fafc',
                        color: item.rank === 1 ? '#854d0e' : item.rank === 2 ? '#475569' : item.rank === 3 ? '#9a3412' : '#64748b',
                        fontWeight: 700,
                        fontSize: 12
                      }}
                    >
                      {item.rank}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontWeight: 600, color: '#1e293b' }}>{item.name}</td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {Array.from({ length: item.stars }).map((_, i) => (
                        <Star key={i} size={14} fill="#eab308" color="#eab308" />
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '12px', fontWeight: 700, color: '#2563eb' }}>{item.points} pts</td>
                  <td style={{ padding: '12px', color: '#94a3b8' }}>{item.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (activeTab === 'regras') {
    return (
      <div style={{ marginTop: 20, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>
          Regras e Guia Pedagógico do Jogo
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
          <p><strong>🎯 Objetivo:</strong> Fixar os ensinamentos bíblicos de forma divertida, estimulando a memorização e o raciocínio rápido das crianças.</p>
          <p><strong>⭐ Sistema de Pontos:</strong> Cada resposta correta na primeira tentativa rende 100 pontos e 1 estrela de honra bíblica.</p>
          <p><strong>📖 Explicação Bíblica:</strong> Ao responder cada pergunta, uma breve explicação bíblica com a referência do versículo é exibida para reforçar o aprendizado em família.</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ marginTop: 20 }}>
      {/* Simulador Jogável do Jogo Bíblico */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 4px 15px rgba(0,0,0,0.04)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, borderBottom: '1px solid #f1f5f9', paddingBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ background: '#eff4fe', color: '#2563eb', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
              Simulador Interativo
            </span>
            <span style={{ fontSize: 13, color: '#64748b' }}>
              Pergunta {currentQIndex + 1} de {initialQuestions.length}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#eab308', fontSize: 14 }}>
            <Award size={18} />
            <span>{score} Pontos</span>
          </div>
        </div>

        {!gameFinished ? (
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 20 }}>
              {currentQ.question}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginBottom: 20 }}>
              {currentQ.options.map((opt, idx) => {
                let bg = '#f8fafc'
                let border = '1px solid #cbd5e1'
                let color = '#334155'

                if (isAnswered) {
                  if (idx === currentQ.correctIndex) {
                    bg = '#dcfce7'
                    border = '2px solid #22c55e'
                    color = '#15803d'
                  } else if (idx === selectedOption) {
                    bg = '#fee2e2'
                    border = '2px solid #ef4444'
                    color = '#b91c1c'
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    style={{
                      background: bg,
                      border: border,
                      color: color,
                      borderRadius: 8,
                      padding: '14px 18px',
                      fontSize: 14,
                      fontWeight: 600,
                      textAlign: 'left',
                      cursor: isAnswered ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>{opt}</span>
                    {isAnswered && idx === currentQ.correctIndex && <CheckCircle size={18} color="#22c55e" />}
                    {isAnswered && idx === selectedOption && idx !== currentQ.correctIndex && <XCircle size={18} color="#ef4444" />}
                  </button>
                )
              })}
            </div>

            {isAnswered && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: 14, marginBottom: 18 }}>
                <b style={{ color: '#166534', fontSize: 13, display: 'block', marginBottom: 4 }}>
                  {selectedOption === currentQ.correctIndex ? '🎉 Resposta Correta! Glória a Deus!' : '💡 Veja a resposta bíblica:'}
                </b>
                <p style={{ fontSize: 13, color: '#15803d', margin: 0 }}>
                  {currentQ.explanation}
                </p>
              </div>
            )}

            {isAnswered && (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="dark"
                  onClick={handleNextQuestion}
                  style={{ padding: '9px 20px', borderRadius: 6, background: '#2563eb', color: '#fff', fontWeight: 600, cursor: 'pointer', border: 'none' }}
                >
                  {currentQIndex < initialQuestions.length - 1 ? 'Próxima Pergunta →' : 'Ver Resultado Final 🏆'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <Award size={52} color="#eab308" style={{ margin: '0 auto 12px' }} />
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b' }}>Parabéns, Campeão da Fé!</h2>
            <p style={{ fontSize: 14, color: '#64748b', margin: '8px 0 18px' }}>
              Você completou o quiz com <strong>{score} pontos</strong> e ganhou <strong>{Math.round(score / 100)} estrelas</strong>!
            </p>
            <button
              onClick={handleRestart}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: '#2563eb', color: '#fff', borderRadius: 8, fontWeight: 700, border: 'none', cursor: 'pointer' }}
            >
              <RotateCcw size={16} /> Jogar Novamente
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
