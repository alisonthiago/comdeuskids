import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Tv, X, ChevronLeft, ChevronRight, BookOpen,
  Video, Palette, HelpCircle, Sparkles, MessageCircle,
  Volume2, Maximize2, Minimize2, Check, Users
} from 'lucide-react'
import { supabase } from '@comdeuskids/supabase'

export function ModoAula() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const lessonId = searchParams.get('aulaId')

  const [currentStep, setCurrentStep] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [reactions, setReactions] = useState({ lion: 14, rainbow: 18, star: 12 })
  const [lesson, setLesson] = useState<any>({
    title: 'A Arca de Noé e o Amor de Deus',
    biblical_reference: 'Gênesis 6:14 — 7:5',
    turma: 'Pequenos da Fé (5–7 anos)'
  })

  useEffect(() => {
    async function loadLesson() {
      if (!lessonId) return
      const { data } = await supabase
        .from('educational_lessons')
        .select('*')
        .eq('id', lessonId)
        .maybeSingle()

      if (data) {
        setLesson({
          title: data.title,
          biblical_reference: data.biblical_reference || 'Gênesis',
          turma: data.age_group || 'Turma Infantil'
        })
      }
    }
    loadLesson()
  }, [lessonId])

  const steps = [
    {
      id: 0,
      title: 'História Bíblica',
      icon: <BookOpen size={16} />,
      badge: 'Passo 1',
      stageText: '“Noé obedeceu a Deus com fé e amor, construindo a arca passo a passo com muita dedicação.”',
      stageSub: 'Os animais vieram de dois em dois para entrar em segurança, protegidos sob a bênção e a promessa do Criador.',
      teacherTips: [
        'Pergunte para as crianças: Quem já viu um arco-íris bem colorido no céu?',
        'Destaque que a arca foi um abrigo seguro preparado por Deus.',
        'Faça os sons dos animais junto com a turma (leão, passarinho, macaco).'
      ]
    },
    {
      id: 1,
      title: 'Vídeo Animado',
      icon: <Video size={16} />,
      badge: 'Passo 2',
      stageText: 'Assista agora ao episódio animado de Noé e o grande dilúvio.',
      stageSub: 'Uma animação bíblica de 4 minutos feita para encantar e ensinar os pequenos.',
      teacherTips: [
        'Peça silêncio e atenção para os detalhes dos bichinhos entrando na arca.',
        'Ao final, pergunte qual animal eles mais gostaram de ver.'
      ]
    },
    {
      id: 2,
      title: 'Diálogo & Reflexão',
      icon: <MessageCircle size={16} />,
      badge: 'Passo 3',
      stageText: '“O Senhor é meu pastor, nada me faltará.” — Deus sempre cumpre as Suas promessas.',
      stageSub: 'Momento de conversa em círculo: Como podemos confiar em Deus quando temos medo da chuva ou do trovão?',
      teacherTips: [
        'Deixe 2 ou 3 crianças compartilharem uma experiência com a família.',
        'Reforce que a palavra de Deus nunca falha.'
      ]
    },
    {
      id: 3,
      title: 'Pintura Digital',
      icon: <Palette size={16} />,
      badge: 'Passo 4',
      stageText: 'Hora de colorir! A arca e o arco-íris no tablet dos alunos.',
      stageSub: 'Os alunos receberam a prancheta no app Com Deus Kids Play para colorir.',
      teacherTips: [
        'Incentive o uso de cores vivas no arco-íris.',
        'Circule pela sala elogiando a criatividade de cada criança.'
      ]
    },
    {
      id: 4,
      title: 'Quiz Rápido',
      icon: <HelpCircle size={16} />,
      badge: 'Passo 5',
      stageText: 'Pergunta da Fé: Qual foi o pássaro que voltou com a folha de oliveira no bico?',
      stageSub: 'Opções na tela: A) O corvo | B) A pombinha branca | C) A águia.',
      teacherTips: [
        'Faça uma contagem regressiva animada de 10 segundos!',
        'Celebre a resposta correta de todos: A pombinha!'
      ]
    },
    {
      id: 5,
      title: 'Oração & Encerramento',
      icon: <Sparkles size={16} />,
      badge: 'Passo 6',
      stageText: '“Obrigado, Papai do Céu, por cuidar da minha família e por ser tão bom!”',
      stageSub: 'Momento de oração em conjunto com as mãos dadas e louvor final.',
      teacherTips: [
        'Convide uma criança voluntária para fazer a oração final.',
        'Entregue o adesivo da promessa de Deus para cada aluno.'
      ]
    }
  ]

  const activeStep = steps[currentStep]

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setIsFullscreen(false)
    }
  }

  const addReaction = (type: 'lion' | 'rainbow' | 'star') => {
    setReactions(prev => ({ ...prev, [type]: prev[type] + 1 }))
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFD', padding: 24 }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Top Control Bar */}
        <div className="s-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--s-primary-light)', color: 'var(--s-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Tv size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="s-badge s-badge-primary">Modo Aula Interativo</span>
                <span style={{ fontSize: 12, color: 'var(--s-text-muted)' }}>{lesson.turma}</span>
              </div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--s-text-title)', margin: '4px 0 0 0' }}>
                {lesson.title}
              </h1>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="s-btn s-btn-secondary" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              <span>{isFullscreen ? 'Janela Normal' : 'Modo Telão / Fullscreen'}</span>
            </button>
            <button className="s-btn s-btn-danger" onClick={() => navigate('/professor')}>
              <X size={16} /> Sair do Modo Aula
            </button>
          </div>
        </div>

        {/* Stepper de Etapas da Aula */}
        <div className="s-card" style={{ padding: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
            {steps.map(s => {
              const isCurrent = s.id === currentStep
              const isDone = s.id < currentStep

              return (
                <button
                  key={s.id}
                  onClick={() => setCurrentStep(s.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    padding: 10,
                    borderRadius: 12,
                    border: '1px solid',
                    borderColor: isCurrent ? 'var(--s-primary)' : 'var(--s-border)',
                    background: isCurrent ? 'var(--s-primary-light)' : '#fff',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: isCurrent ? 'var(--s-primary)' : 'var(--s-text-caption)' }}>
                      {s.badge}
                    </span>
                    <div style={{ color: isCurrent ? 'var(--s-primary)' : isDone ? 'var(--s-success)' : 'var(--s-text-caption)' }}>
                      {isDone ? <Check size={14} /> : s.icon}
                    </div>
                  </div>
                  <strong style={{ fontSize: 12, color: isCurrent ? 'var(--s-primary)' : 'var(--s-text-title)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {s.title}
                  </strong>
                  <div className="s-progress" style={{ height: 4 }}>
                    <div
                      className="s-progress-bar"
                      style={{
                        width: isDone ? '100%' : isCurrent ? '100%' : '0%',
                        background: isDone ? 'var(--s-success)' : 'var(--s-primary)'
                      }}
                    />
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Palco Principal e Guia do Professor */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)', gap: 20 }}>
          {/* Card Panorâmico de Projeção */}
          <div
            className="s-card"
            style={{
              padding: 0,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 460,
              background: 'linear-gradient(135deg, #171c23 0%, #2c3138 100%)',
              color: '#fff',
              position: 'relative'
            }}
          >
            <div style={{ padding: 28, position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span className="s-badge" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
                  <BookOpen size={12} style={{ marginRight: 4 }} /> {lesson.biblical_reference}
                </span>

                <span style={{ fontSize: 12, color: '#4edea3', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                  <span className="s-live-dot" style={{ background: '#4edea3' }} /> Projeção Ativa
                </span>
              </div>

              <blockquote style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.4, margin: '0 0 16px 0', textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
                {activeStep.stageText}
              </blockquote>

              <p style={{ fontSize: 15, color: '#dee2ec', lineHeight: 1.6, margin: 0, maxWidth: 600 }}>
                {activeStep.stageSub}
              </p>
            </div>

            {/* Reações da Sala */}
            <div style={{ padding: '16px 28px', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
              <span style={{ fontSize: 12, color: '#dee2ec', fontWeight: 600 }}>
                Reações das Crianças na Sala:
              </span>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => addReaction('lion')}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 999, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}
                >
                  🦁 {reactions.lion}
                </button>
                <button
                  onClick={() => addReaction('rainbow')}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 999, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}
                >
                  🌈 {reactions.rainbow}
                </button>
                <button
                  onClick={() => addReaction('star')}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 999, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}
                >
                  ✨ {reactions.star}
                </button>
              </div>
            </div>
          </div>

          {/* Guia de Condução do Professor */}
          <div className="s-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 20 }}>
            <div>
              <div className="s-section-head" style={{ marginBottom: 14 }}>
                <h2>Roteiro & Dicas do Professor</h2>
                <span className="s-badge s-badge-primary">{activeStep.badge}</span>
              </div>

              <div style={{ background: 'var(--s-surface-low)', padding: 16, borderRadius: 14, border: '1px solid var(--s-border)', marginBottom: 16 }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--s-primary)', fontWeight: 700, marginBottom: 8 }}>
                  Objetivo desta etapa
                </div>
                <div style={{ fontSize: 13.5, color: 'var(--s-text-title)', fontWeight: 600 }}>
                  {activeStep.title} — Engajar a turma e conectar a lição com a vida real.
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {activeStep.teacherTips.map((tip, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'var(--s-text-body)', lineHeight: 1.4 }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--s-primary-light)', color: 'var(--s-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0, marginTop: 1 }}>
                      {i + 1}
                    </div>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Controles de Navegação Anterior / Próxima */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--s-border)', paddingTop: 16 }}>
              <button
                className="s-btn s-btn-secondary"
                disabled={currentStep === 0}
                onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              >
                <ChevronLeft size={16} /> Etapa Anterior
              </button>

              <button
                className="s-btn s-btn-primary"
                disabled={currentStep === steps.length - 1}
                onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
              >
                <span>Próxima Etapa</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
