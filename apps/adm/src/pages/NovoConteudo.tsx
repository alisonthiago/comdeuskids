import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { cmsService } from '../lib/cmsService'
import { StreamContent, StreamContentType, ContentStatus } from '@comdeuskids/types'
import {
  ArrowLeft, Check, Film, Tv, Video, BookOpen,
  Music, Award, FileText, Lock, Globe, Save, Sparkles,
  Plus, Trash2, HelpCircle
} from 'lucide-react'

const STEPS = [
  { num: 1, title: 'Informações', desc: 'Título, tipo e sinopse' },
  { num: 2, title: 'Classificação', desc: 'Categoria e faixa etária' },
  { num: 3, title: 'Mídia & Vídeo', desc: 'Imagens e URLs de reprodução' },
  { num: 4, title: 'Aprendizado', desc: 'Versículo, quiz e PDF' },
  { num: 5, title: 'Acesso & Planos', desc: 'Regras de liberação' },
  { num: 6, title: 'Publicação', desc: 'Status e salvar' }
]

export default function NovoConteudo() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Form State
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [type, setType] = useState<StreamContentType>('story')
  const [description, setDescription] = useState('')
  const [fullDescription, setFullDescription] = useState('')

  const [category, setCategory] = useState('Histórias Bíblicas')
  const [tags, setTags] = useState('Fé, Coragem, Milagres')
  const [ageRange, setAgeRange] = useState('Livre')

  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [bannerUrl, setBannerUrl] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [audioUrl, setAudioUrl] = useState('')
  const [trailerUrl, setTrailerUrl] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(15)

  const [scriptureVerse, setScriptureVerse] = useState('')
  const [devotionalText, setDevotionalText] = useState('')
  const [relatedPdfTitle, setRelatedPdfTitle] = useState('')
  const [relatedPdfPages, setRelatedPdfPages] = useState(12)

  // Mini Quiz
  const [quizQuestion, setQuizQuestion] = useState('')
  const [quizOptions, setQuizOptions] = useState(['', '', '', ''])
  const [quizCorrectIndex, setQuizCorrectIndex] = useState(0)
  const [quizExplanation, setQuizExplanation] = useState('')

  const [accessType, setAccessType] = useState<'free' | 'subscription' | 'individual'>('subscription')
  const [allowedPlans, setAllowedPlans] = useState<string[]>(['family', 'church', 'school'])

  const [status, setStatus] = useState<ContentStatus>('published')
  const [isFeatured, setIsFeatured] = useState(false)

  // Carregar conteúdo existente se for edição
  useEffect(() => {
    if (id) {
      cmsService.getContentById(id).then(item => {
        if (item) {
          setTitle(item.title)
          setSlug(item.slug)
          setType(item.type)
          setDescription(item.description || '')
          setFullDescription(item.full_description || '')
          setCategory(item.category || 'Histórias Bíblicas')
          setTags(item.tags ? item.tags.join(', ') : '')
          setAgeRange(item.age_range || 'Livre')
          setThumbnailUrl(item.thumbnail_url || '')
          setBannerUrl(item.banner_url || '')
          setVideoUrl(item.video_url || '')
          setAudioUrl(item.audio_url || '')
          setTrailerUrl(item.trailer_url || '')
          setDurationMinutes(item.duration_minutes || 15)
          setScriptureVerse(item.scripture_verse || '')
          setDevotionalText(item.devotional_text || '')
          setRelatedPdfTitle(item.related_pdf_title || '')
          setRelatedPdfPages(item.related_pdf_pages || 12)
          setAccessType(item.access_type || 'subscription')
          setAllowedPlans(item.allowed_plans || ['family', 'church', 'school'])
          setStatus(item.status || 'published')
          setIsFeatured(item.is_featured || false)

          if (item.quiz && item.quiz.length > 0) {
            setQuizQuestion(item.quiz[0].question)
            setQuizOptions(item.quiz[0].options)
            setQuizCorrectIndex(item.quiz[0].correct_index)
            setQuizExplanation(item.quiz[0].explanation || '')
          }
        }
      })
    }
  }, [id])

  const handleTitleChange = (val: string) => {
    setTitle(val)
    if (!id) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
    }
  }

  const togglePlan = (plan: string) => {
    if (allowedPlans.includes(plan)) {
      setAllowedPlans(allowedPlans.filter(p => p !== plan))
    } else {
      setAllowedPlans([...allowedPlans, plan])
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)

    const quizData = quizQuestion.trim()
      ? [
          {
            question: quizQuestion,
            options: quizOptions.filter(o => o.trim() !== ''),
            correct_index: quizCorrectIndex,
            explanation: quizExplanation
          }
        ]
      : []

    await cmsService.saveContent({
      id: id || undefined,
      title: title.trim(),
      slug: slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      type,
      description: description.trim(),
      full_description: fullDescription.trim(),
      category,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      age_range: ageRange,
      thumbnail_url: thumbnailUrl.trim() || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=700&auto=format&fit=crop&q=80',
      banner_url: bannerUrl.trim(),
      video_url: videoUrl.trim() || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      audio_url: audioUrl.trim(),
      trailer_url: trailerUrl.trim(),
      duration_minutes: Number(durationMinutes),
      scripture_verse: scriptureVerse.trim(),
      devotional_text: devotionalText.trim(),
      related_pdf_title: relatedPdfTitle.trim(),
      related_pdf_pages: Number(relatedPdfPages),
      quiz: quizData,
      access_type: accessType,
      allowed_plans: allowedPlans,
      status,
      is_featured: isFeatured
    })

    setLoading(false)
    navigate('/admin/conteudos')
  }

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Voltar e Título */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <button
          onClick={() => navigate('/admin/conteudos')}
          style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 8, cursor: 'pointer', color: '#475569' }}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1e1b4b', margin: 0 }}>
            {id ? 'Editar Conteúdo' : 'Novo Conteúdo de Streaming'}
          </h1>
          <p style={{ color: '#64748b', fontSize: 13, margin: '2px 0 0' }}>
            Preencha as informações do filme, série, história, música ou atividade.
          </p>
        </div>
      </div>

      {/* Barra de Progresso dos 6 Passos */}
      <div style={{
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '16px 20px',
        display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 28
      }}>
        {STEPS.map(s => {
          const isCurrent = currentStep === s.num
          const isPast = currentStep > s.num
          return (
            <div
              key={s.num}
              onClick={() => setCurrentStep(s.num)}
              style={{
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 10,
                borderBottom: isCurrent ? '3px solid #7c3aed' : '3px solid transparent',
                paddingBottom: 10
              }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: isCurrent ? '#7c3aed' : isPast ? '#10b981' : '#f1f5f9',
                color: isCurrent || isPast ? '#fff' : '#64748b',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 12
              }}>
                {isPast ? <Check size={14} /> : s.num}
              </div>
              <div style={{ display: 'none', flexDirection: 'column' }} className="step-label">
                <span style={{ fontSize: 12, fontWeight: 700, color: isCurrent ? '#7c3aed' : '#1e293b' }}>
                  {s.title}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Formulário Principal */}
      <form onSubmit={handleSave} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 32 }}>
        {/* ETAPA 1: INFORMAÇÕES */}
        {currentStep === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h2 style={{ fontSize: 18, color: '#1e1b4b', margin: '0 0 4px' }}>Etapa 1: Informações Básicas</h2>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Título do Conteúdo *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Davi e Golias: A Força da Fé"
                value={title}
                onChange={e => handleTitleChange(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Slug / URL Amigável
                </label>
                <input
                  type="text"
                  placeholder="davi-e-golias"
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Tipo de Conteúdo
                </label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as StreamContentType)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, background: '#fff' }}
                >
                  <option value="story">História Bíblica</option>
                  <option value="movie">Filme</option>
                  <option value="series">Série</option>
                  <option value="video">Vídeo</option>
                  <option value="drawing">Desenho Animado</option>
                  <option value="clip">Clipe Vertical</option>
                  <option value="song">Música Infantil</option>
                  <option value="lesson">Lição Bíblica</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Descrição Curta (Exibida nos Cards e na Home) *
              </label>
              <textarea
                rows={2}
                required
                placeholder="Resumo em 1 ou 2 frases que chame a atenção das crianças e pais..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Descrição Completa / Sinopse
              </label>
              <textarea
                rows={4}
                placeholder="História completa, contexto bíblico e moral..."
                value={fullDescription}
                onChange={e => setFullDescription(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
              />
            </div>
          </div>
        )}

        {/* ETAPA 2: CLASSIFICAÇÃO */}
        {currentStep === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h2 style={{ fontSize: 18, color: '#1e1b4b', margin: '0 0 4px' }}>Etapa 2: Classificação & Temas</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Categoria Principal
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, background: '#fff' }}
                >
                  <option value="Histórias Bíblicas">Histórias Bíblicas</option>
                  <option value="Aprendendo com Jesus">Aprendendo com Jesus</option>
                  <option value="Séries CDK">Séries CDK</option>
                  <option value="Clipes & Músicas">Clipes & Músicas</option>
                  <option value="Parábolas">Parábolas</option>
                  <option value="Antigo Testamento">Antigo Testamento</option>
                  <option value="Novo Testamento">Novo Testamento</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Faixa Etária Recomendada
                </label>
                <select
                  value={ageRange}
                  onChange={e => setAgeRange(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, background: '#fff' }}
                >
                  <option value="Livre">Livre (Todas as idades)</option>
                  <option value="3-5 anos">3 a 5 anos (Maternal)</option>
                  <option value="6-9 anos">6 a 9 anos (Primários)</option>
                  <option value="10-12 anos">10 a 12 anos (Juniores)</option>
                  <option value="Pais e Professores">Pais e Professores (Adulto)</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Tags / Virtudes Cristãs (separadas por vírgula)
              </label>
              <input
                type="text"
                placeholder="Fé, Coragem, Oração, Obediência, Família"
                value={tags}
                onChange={e => setTags(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
              />
            </div>
          </div>
        )}

        {/* ETAPA 3: MÍDIA */}
        {currentStep === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h2 style={{ fontSize: 18, color: '#1e1b4b', margin: '0 0 4px' }}>Etapa 3: Mídia & Vídeo</h2>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                URL da Thumbnail / Capa do Card (16:9)
              </label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/photo-..."
                value={thumbnailUrl}
                onChange={e => setThumbnailUrl(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                URL do Banner Grande / Hero (Opcional - Alta Resolução)
              </label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/photo-..."
                value={bannerUrl}
                onChange={e => setBannerUrl(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  URL do Vídeo (MP4 / HLS / CDN) *
                </label>
                <input
                  type="text"
                  placeholder="https://commondatastorage.googleapis.com/...mp4"
                  value={videoUrl}
                  onChange={e => setVideoUrl(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Duração (minutos)
                </label>
                <input
                  type="number"
                  min={1}
                  value={durationMinutes}
                  onChange={e => setDurationMinutes(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ETAPA 4: APRENDIZADO & QUIZZES */}
        {currentStep === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h2 style={{ fontSize: 18, color: '#1e1b4b', margin: '0 0 4px' }}>Etapa 4: Aprendizado Bíblico Integrado</h2>
            <p style={{ color: '#64748b', fontSize: 13, margin: '0 0 12px' }}>
              Diferencial CDK: associe o versículo de memorização, quiz de perguntas e caderno de atividades em PDF!
            </p>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Versículo Bíblico Chave
              </label>
              <input
                type="text"
                placeholder="Ex: 1 Samuel 17:45 — O Senhor dos Exércitos é a nossa força!"
                value={scriptureVerse}
                onChange={e => setScriptureVerse(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Reflexão Devocional / Lição Prática
              </label>
              <textarea
                rows={2}
                placeholder="O que essa história ensina para o dia a dia da criança na escola e na família..."
                value={devotionalText}
                onChange={e => setDevotionalText(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
              />
            </div>

            {/* Editor de Pergunta de Quiz */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Award size={18} color="#d97706" />
                <h4 style={{ margin: 0, fontSize: 14, color: '#1e293b' }}>Quiz Interativo da História</h4>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                  Enunciado da Pergunta
                </label>
                <input
                  type="text"
                  placeholder="Ex: Quantas pedrinhas lisas Davi escolheu no ribeiro?"
                  value={quizQuestion}
                  onChange={e => setQuizQuestion(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                {quizOptions.map((opt, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="radio"
                      name="correctOption"
                      checked={quizCorrectIndex === idx}
                      onChange={() => setQuizCorrectIndex(idx)}
                      title="Marcar como resposta correta"
                    />
                    <input
                      type="text"
                      placeholder={`Alternativa ${String.fromCharCode(65 + idx)}`}
                      value={opt}
                      onChange={e => {
                        const next = [...quizOptions]
                        next[idx] = e.target.value
                        setQuizOptions(next)
                      }}
                      style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                  Explicação do Quiz (ao acertar)
                </label>
                <input
                  type="text"
                  placeholder="Davi pegou cinco pedrinhas no riacho antes de encontrar o gigante!"
                  value={quizExplanation}
                  onChange={e => setQuizExplanation(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
              </div>
            </div>

            {/* Conexão com PDF */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Título do Material em PDF Relacionado
              </label>
              <input
                type="text"
                placeholder="Ex: Caderno de Atividades e Colorir — Davi e Golias"
                value={relatedPdfTitle}
                onChange={e => setRelatedPdfTitle(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
              />
            </div>
          </div>
        )}

        {/* ETAPA 5: ACESSO & PLANOS */}
        {currentStep === 5 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h2 style={{ fontSize: 18, color: '#1e1b4b', margin: '0 0 4px' }}>Etapa 5: Acesso & Planos</h2>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 8 }}>
                Modelo de Acesso
              </label>
              <div style={{ display: 'flex', gap: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="accessType"
                    checked={accessType === 'subscription'}
                    onChange={() => setAccessType('subscription')}
                  />
                  Incluído na Assinatura
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="accessType"
                    checked={accessType === 'free'}
                    onChange={() => setAccessType('free')}
                  />
                  Gratuito para Todos (Degustação)
                </label>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 8 }}>
                Planos Permitidos
              </label>
              <div style={{ display: 'flex', gap: 16 }}>
                {[
                  { id: 'family', label: '👨‍👩‍👧 Plano Família' },
                  { id: 'church', label: '⛪ Plano Igreja' },
                  { id: 'school', label: '🏫 Plano Escola' }
                ].map(p => (
                  <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={allowedPlans.includes(p.id)}
                      onChange={() => togglePlan(p.id)}
                    />
                    {p.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ETAPA 6: PUBLICAÇÃO */}
        {currentStep === 6 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h2 style={{ fontSize: 18, color: '#1e1b4b', margin: '0 0 4px' }}>Etapa 6: Publicação & Destaque</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Status de Publicação
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as ContentStatus)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, background: '#fff' }}
                >
                  <option value="published">● Publicado Imediatamente no APP</option>
                  <option value="draft">○ Rascunho (Não visível no APP)</option>
                  <option value="scheduled">🕒 Agendado</option>
                  <option value="archived">📦 Arquivado</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', paddingTop: 24 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: '#d97706', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={e => setIsFeatured(e.target.checked)}
                  />
                  ⭐ Definir como Destaque Principal (Hero Banner da Home)
                </label>
              </div>
            </div>

            <div style={{ background: '#f8fafc', borderRadius: 12, padding: 20, border: '1px solid #e2e8f0', marginTop: 12 }}>
              <h4 style={{ margin: '0 0 8px', color: '#1e293b' }}>Resumo da Publicação</h4>
              <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
                Ao salvar, o conteúdo <strong>{title || 'Sem título'}</strong> será atualizado instantaneamente no banco de dados e ficará visível na plataforma de streaming dos membros.
              </p>
            </div>
          </div>
        )}

        {/* Barra de Navegação Inferior dos Passos */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 32, paddingTop: 20, borderTop: '1px solid #e2e8f0' }}>
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            style={{
              padding: '10px 20px', borderRadius: 8, border: '1px solid #cbd5e1',
              background: '#fff', color: '#475569', fontSize: 13, fontWeight: 600, cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
              opacity: currentStep === 1 ? 0.5 : 1
            }}
          >
            ← Voltar
          </button>

          <div style={{ display: 'flex', gap: 12 }}>
            {currentStep < 6 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => Math.min(6, prev + 1))}
                style={{
                  padding: '10px 24px', borderRadius: 8, border: 'none',
                  background: '#7c3aed', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer'
                }}
              >
                Próximo Passo →
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 28px', borderRadius: 8, border: 'none',
                  background: '#10b981', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
              >
                <Save size={18} />
                {loading ? 'Salvando...' : 'Salvar & Publicar no APP'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
