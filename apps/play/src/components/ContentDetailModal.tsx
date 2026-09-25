import React, { useState, useRef, useEffect } from 'react'
import { StreamContent, StreamEpisode } from '@comdeuskids/types'
import { useProfile } from '../context/ProfileContext'
import {
  X, Play, Pause, Plus, Check, Volume2, VolumeX,
  Maximize, RotateCcw, BookOpen, Award, FileText,
  Download, Clock, Tag
} from 'lucide-react'

interface ContentDetailModalProps {
  content: StreamContent
  onClose: () => void
  initialAutoPlay?: boolean
}

export default function ContentDetailModal({
  content,
  onClose,
  initialAutoPlay = false
}: ContentDetailModalProps) {
  const { activeProfile, isInMyList, toggleMyList, watchProgress, saveProgress } = useProfile()
  const inList = isInMyList(content.id)

  const [activeTab, setActiveTab] = useState<'video' | 'episodes' | 'lesson' | 'quiz' | 'pdf'>('video')
  const [isPlaying, setIsPlaying] = useState(initialAutoPlay)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [selectedEpisode, setSelectedEpisode] = useState<StreamEpisode | null>(
    content.episodes && content.episodes.length > 0 ? content.episodes[0] : null
  )

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)

  // Carregar progresso salvo para este perfil
  const savedProg = watchProgress[content.id]

  useEffect(() => {
    if (videoRef.current && savedProg && savedProg.progress_seconds > 0) {
      videoRef.current.currentTime = savedProg.progress_seconds
      setCurrentTime(savedProg.progress_seconds)
    }
  }, [savedProg])

  // Intervalo para salvar progresso a cada 4 segundos durante reprodução
  useEffect(() => {
    if (!isPlaying) return

    const timer = setInterval(() => {
      if (videoRef.current) {
        const cur = Math.floor(videoRef.current.currentTime)
        const dur = Math.floor(videoRef.current.duration) || (content.duration_minutes ? content.duration_minutes * 60 : 1200)
        saveProgress(content.id, cur, dur, content.title, content.thumbnail_url)
      }
    }, 4000)

    return () => clearInterval(timer)
  }, [isPlaying, content, saveProgress])

  const handlePlayPause = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
      const cur = Math.floor(videoRef.current.currentTime)
      const dur = Math.floor(videoRef.current.duration) || 1200
      saveProgress(content.id, cur, dur, content.title, content.thumbnail_url)
    } else {
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
      setDuration(videoRef.current.duration || 0)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value)
    if (videoRef.current) {
      videoRef.current.currentTime = val
      setCurrentTime(val)
    }
  }

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen()
      }
    }
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  // Quiz helper
  const handleSelectQuizOption = (qIdx: number, oIdx: number) => {
    if (quizSubmitted) return
    setQuizAnswers(prev => ({ ...prev, [qIdx]: oIdx }))
  }

  const calculateQuizScore = () => {
    if (!content.quiz) return { correct: 0, total: 0 }
    let correct = 0
    content.quiz.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correct_index) correct++
    })
    return { correct, total: content.quiz.length }
  }

  const currentVideoSrc = selectedEpisode?.video_url || content.video_url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'

  return (
    <div className="cdk-modal-backdrop" onClick={onClose}>
      <div className="cdk-detail-modal" onClick={e => e.stopPropagation()}>
        {/* Botão Fechar no Canto */}
        <button className="cdk-detail-close-btn" onClick={onClose} title="Fechar">
          <X size={20} />
        </button>

        {/* ÁREA DO PLAYER DE VÍDEO (Estilo Streaming Netflix) */}
        <div className="cdk-detail-player-wrapper">
          <video
            ref={videoRef}
            src={currentVideoSrc}
            poster={content.banner_url || content.thumbnail_url}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => {
              setIsPlaying(false)
              if (videoRef.current) {
                saveProgress(content.id, Math.floor(videoRef.current.duration), Math.floor(videoRef.current.duration), content.title, content.thumbnail_url)
              }
            }}
            muted={isMuted}
            playsInline
            className="cdk-detail-video"
          />

          {/* Overlay de Controles Modernos */}
          <div className="cdk-player-controls-overlay">
            <div className="cdk-player-progress-bar-container">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="cdk-player-range"
              />
            </div>

            <div className="cdk-player-buttons-bar">
              <div className="cdk-controls-left">
                <button
                  type="button"
                  className="cdk-player-btn play-btn"
                  onClick={handlePlayPause}
                  title={isPlaying ? 'Pausar' : 'Reproduzir'}
                >
                  {isPlaying ? <Pause size={22} /> : <Play size={22} fill="currentColor" />}
                </button>

                <button
                  type="button"
                  className="cdk-player-btn"
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10)
                    }
                  }}
                  title="Voltar 10 segundos"
                >
                  <RotateCcw size={18} />
                </button>

                <button
                  type="button"
                  className="cdk-player-btn"
                  onClick={() => setIsMuted(!isMuted)}
                  title={isMuted ? 'Ativar som' : 'Silenciar'}
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>

                <span className="cdk-time-display">
                  {formatTime(currentTime)} / {formatTime(duration || (content.duration_minutes ? content.duration_minutes * 60 : 0))}
                </span>
              </div>

              <div className="cdk-controls-right">
                <button
                  type="button"
                  className="cdk-player-btn"
                  onClick={handleFullscreen}
                  title="Tela Cheia"
                >
                  <Maximize size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CABEÇALHO DO CONTEÚDO */}
        <div className="cdk-detail-info-header">
          <div className="cdk-info-main">
            <div className="cdk-info-badges">
              <span className="cdk-badge-category">{content.category}</span>
              {content.age_range && <span className="cdk-badge-age">{content.age_range}</span>}
              {content.duration_minutes && (
                <span className="cdk-badge-duration">
                  <Clock size={13} /> {content.duration_minutes} min
                </span>
              )}
              {content.is_new && <span className="cdk-badge-new">NOVO</span>}
            </div>

            <h1 className="cdk-detail-title">{selectedEpisode ? `${content.title} — ${selectedEpisode.title}` : content.title}</h1>
            <p className="cdk-detail-desc">{selectedEpisode?.synopsis || content.description}</p>

            {/* Ações Primárias */}
            <div className="cdk-detail-actions-row">
              <button
                type="button"
                className="cdk-action-btn-primary"
                onClick={handlePlayPause}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
                <span>{isPlaying ? 'Pausar Vídeo' : 'Assistir Agora'}</span>
              </button>

              <button
                type="button"
                className={`cdk-action-btn-secondary ${inList ? 'active' : ''}`}
                onClick={() => toggleMyList(content.id)}
              >
                {inList ? <Check size={18} /> : <Plus size={18} />}
                <span>{inList ? 'Na Minha Lista' : 'Minha Lista'}</span>
              </button>

              {content.related_pdf_title && (
                <button
                  type="button"
                  className="cdk-action-btn-pdf"
                  onClick={() => setActiveTab('pdf')}
                >
                  <Download size={18} />
                  <span>Material em PDF</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ABAS MULTIDISCIPLINARES (Streaming + Aprendizado Bíblico + PDF) */}
        <div className="cdk-detail-tabs-bar">
          <button
            type="button"
            className={`cdk-tab-btn ${activeTab === 'video' ? 'active' : ''}`}
            onClick={() => setActiveTab('video')}
          >
            Sobre a História
          </button>

          {content.episodes && content.episodes.length > 0 && (
            <button
              type="button"
              className={`cdk-tab-btn ${activeTab === 'episodes' ? 'active' : ''}`}
              onClick={() => setActiveTab('episodes')}
            >
              Episódios ({content.episodes.length})
            </button>
          )}

          {content.scripture_verse && (
            <button
              type="button"
              className={`cdk-tab-btn ${activeTab === 'lesson' ? 'active' : ''}`}
              onClick={() => setActiveTab('lesson')}
            >
              Lição Bíblica & Versículo
            </button>
          )}

          {content.quiz && content.quiz.length > 0 && (
            <button
              type="button"
              className={`cdk-tab-btn ${activeTab === 'quiz' ? 'active' : ''}`}
              onClick={() => setActiveTab('quiz')}
            >
              Quiz Interativo ({content.quiz.length})
            </button>
          )}

          {content.related_pdf_title && (
            <button
              type="button"
              className={`cdk-tab-btn ${activeTab === 'pdf' ? 'active' : ''}`}
              onClick={() => setActiveTab('pdf')}
            >
              Atividade para Imprimir (PDF)
            </button>
          )}
        </div>

        {/* CONTEÚDO DAS ABAS */}
        <div className="cdk-tab-content-area">
          {/* ABA 1: Sobre */}
          {activeTab === 'video' && (
            <div className="cdk-tab-pane">
              <div className="cdk-pane-grid">
                <div>
                  <h3>Sinopse Completa</h3>
                  <p className="cdk-text-block">{content.description}</p>

                  {content.tags && content.tags.length > 0 && (
                    <div className="cdk-tags-cluster">
                      {content.tags.map(t => (
                        <span key={t} className="cdk-tag-item">
                          <Tag size={12} /> {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="cdk-pane-sidebar">
                  <div className="cdk-detail-meta-box">
                    <span>Faixa Etária:</span>
                    <strong>{content.age_range || 'Livre'}</strong>
                  </div>
                  <div className="cdk-detail-meta-box">
                    <span>Gênero:</span>
                    <strong>{content.category}</strong>
                  </div>
                  <div className="cdk-detail-meta-box">
                    <span>Progresso de {activeProfile?.name}:</span>
                    <strong>
                      {savedProg && savedProg.duration_seconds > 0
                        ? `${Math.round((savedProg.progress_seconds / savedProg.duration_seconds) * 100)}% concluído`
                        : 'Ainda não iniciado'}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ABA 2: Episódios de Séries */}
          {activeTab === 'episodes' && content.episodes && (
            <div className="cdk-tab-pane">
              <h3 className="cdk-pane-heading">Temporada 1</h3>
              <div className="cdk-episodes-list">
                {content.episodes.map(ep => {
                  const isSelected = selectedEpisode?.id === ep.id
                  return (
                    <div
                      key={ep.id}
                      className={`cdk-episode-row ${isSelected ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedEpisode(ep)
                        setIsPlaying(true)
                        if (videoRef.current) {
                          videoRef.current.currentTime = 0
                          videoRef.current.play()
                        }
                      }}
                    >
                      <span className="cdk-ep-num">{ep.episode_number}</span>
                      <div className="cdk-ep-thumb-wrapper">
                        <img src={ep.thumbnail_url} alt={ep.title} className="cdk-ep-thumb" />
                        <div className="cdk-ep-play-overlay">
                          <Play size={18} fill="#fff" />
                        </div>
                      </div>
                      <div className="cdk-ep-info">
                        <div className="cdk-ep-title-row">
                          <h4>{ep.title}</h4>
                          <span className="cdk-ep-dur">{ep.duration_minutes}m</span>
                        </div>
                        <p>{ep.synopsis}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ABA 3: Lição Bíblica & Devocional */}
          {activeTab === 'lesson' && (
            <div className="cdk-tab-pane">
              <div className="cdk-devotional-card">
                <div className="cdk-devotional-icon">
                  <BookOpen size={28} />
                </div>
                <div>
                  <span className="cdk-devo-label">VERSÍCULO CHAVE PARA MEMORIZAR</span>
                  <blockquote className="cdk-verse-quote">{content.scripture_verse}</blockquote>
                </div>
              </div>

              {content.devotional_text && (
                <div className="cdk-devo-takeaway">
                  <h4>💡 O que aprendemos para a nossa vida?</h4>
                  <p>{content.devotional_text}</p>
                </div>
              )}
            </div>
          )}

          {/* ABA 4: Quiz Interativo */}
          {activeTab === 'quiz' && content.quiz && (
            <div className="cdk-tab-pane">
              <div className="cdk-quiz-wrapper">
                <div className="cdk-quiz-header">
                  <Award size={24} color="#f59e0b" />
                  <div>
                    <h3>Desafio Bíblico Com Deus Kids</h3>
                    <p>Responda às perguntas para ganhar sua estrelinha de conhecimento!</p>
                  </div>
                </div>

                <div className="cdk-quiz-questions">
                  {content.quiz.map((q, qIdx) => (
                    <div key={qIdx} className="cdk-question-block">
                      <span className="cdk-q-number">Pergunta {qIdx + 1} de {content.quiz!.length}</span>
                      <h4 className="cdk-q-text">{q.question}</h4>

                      <div className="cdk-options-grid">
                        {q.options.map((opt, oIdx) => {
                          const isSelected = quizAnswers[qIdx] === oIdx
                          const isCorrect = q.correct_index === oIdx
                          let optionClass = ''

                          if (quizSubmitted) {
                            if (isCorrect) optionClass = 'correct'
                            else if (isSelected) optionClass = 'wrong'
                          } else if (isSelected) {
                            optionClass = 'selected'
                          }

                          return (
                            <button
                              key={oIdx}
                              type="button"
                              className={`cdk-quiz-opt ${optionClass}`}
                              onClick={() => handleSelectQuizOption(qIdx, oIdx)}
                            >
                              <span className="cdk-opt-bullet">{String.fromCharCode(65 + oIdx)}</span>
                              <span>{opt}</span>
                            </button>
                          )
                        })}
                      </div>

                      {quizSubmitted && q.explanation && (
                        <div className="cdk-quiz-expl">
                          <strong>Explicação:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="cdk-quiz-footer">
                  {!quizSubmitted ? (
                    <button
                      type="button"
                      className="cdk-btn-save"
                      onClick={() => setQuizSubmitted(true)}
                    >
                      Verificar Respostas!
                    </button>
                  ) : (
                    <div className="cdk-score-banner">
                      <div className="cdk-score-badge">
                        Parabéns {activeProfile?.name}! Você acertou {calculateQuizScore().correct} de {calculateQuizScore().total} perguntas!
                      </div>
                      <button
                        type="button"
                        className="cdk-btn-cancel"
                        onClick={() => {
                          setQuizAnswers({})
                          setQuizSubmitted(false)
                        }}
                      >
                        Refazer Quiz
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ABA 5: Material em PDF */}
          {activeTab === 'pdf' && (
            <div className="cdk-tab-pane">
              <div className="cdk-pdf-integration-card">
                <div className="cdk-pdf-cover-fake">
                  <FileText size={48} color="#22c55e" />
                  <span>PDF CDK</span>
                </div>
                <div className="cdk-pdf-details">
                  <span className="cdk-pdf-pill">ATIVIDADE DE FIXAÇÃO & COLORIR</span>
                  <h3>{content.related_pdf_title || 'Material de Apoio e Desenhos'}</h3>
                  <p>
                    Caderno com atividades impressas, desenhos dos personagens para colorir,
                    caça-palavras e labirintos bíblicos para serem usados em casa, na escola ou na EBD da igreja.
                  </p>
                  <div className="cdk-pdf-meta">
                    <span>📄 {content.related_pdf_pages || 16} Páginas em Alta Resolução</span>
                    <span>✨ Pronto para imprimir em papel A4</span>
                  </div>
                  <div className="cdk-pdf-actions">
                    <a
                      href="/downloads"
                      className="cdk-btn-download-pdf"
                    >
                      <Download size={18} />
                      Baixar Caderno em PDF
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
