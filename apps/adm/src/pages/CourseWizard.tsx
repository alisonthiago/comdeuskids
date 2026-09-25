import React, { useEffect, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clapperboard,
  Download,
  Film,
  Gamepad2,
  GraduationCap,
  ImagePlus,
  Music,
  Puzzle,
  UsersRound,
  Video
} from 'lucide-react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

type CourseForm = {
  title: string
  description: string
  language: string
  country: string
  category: string
  coverUrl: string
  price: string
  payment: string
  refund: string
  area: string
}

const initial: CourseForm = {
  title: '',
  description: '',
  language: 'Português (Brasil)',
  country: 'Brasil',
  category: 'Educação cristã',
  coverUrl: '',
  price: '',
  payment: 'Pagamento à vista',
  refund: '7 dias',
  area: 'com-deus-kids'
}

const steps = ['Formato', 'Informações', 'Precificação', 'Área de Membros']
const categories = [
  'Educação cristã',
  'Histórias bíblicas',
  'Música e artes',
  'Desenvolvimento infantil',
  'Materiais para EBD',
  'Outros'
]

type ProductMeta = {
  label: string
  titlePlaceholder: string
  descPlaceholder: string
  icon: any
  formatDesc: string
  infoDesc: string
  areaDesc: string
  btnLabel: string
}

const PRODUCT_META: Record<string, ProductMeta> = {
  curso: {
    label: 'Curso Online',
    titlePlaceholder: 'Ex.: Curso Bíblia para Crianças',
    descPlaceholder: 'Conte o que os alunos vão aprender neste curso.',
    icon: GraduationCap,
    formatDesc: 'Aulas em vídeo, texto, quizzes e materiais em uma área exclusiva para os alunos.',
    infoDesc: 'Esses dados serão exibidos para quem comprar o seu curso.',
    areaDesc: 'Este curso será criado na sua Área de Membros Com Deus Kids. Depois você poderá adicionar módulos, aulas, quizzes e materiais.',
    btnLabel: 'Cadastrar curso'
  },
  arquivo: {
    label: 'Arquivo / Material Digital',
    titlePlaceholder: 'Ex.: Caderno de Atividades Bíblicas em PDF',
    descPlaceholder: 'Descreva os materiais inclusos, páginas para colorir ou apostilas.',
    icon: Download,
    formatDesc: 'PDFs, cadernos de atividades e materiais digitais para baixar e imprimir.',
    infoDesc: 'Esses dados serão exibidos para quem for baixar ou comprar o arquivo.',
    areaDesc: 'Seus arquivos serão disponibilizados com proteção e download fácil na Área de Membros Com Deus Kids.',
    btnLabel: 'Cadastrar arquivo'
  },
  serie: {
    label: 'Série Bíblica',
    titlePlaceholder: 'Ex.: Série Heróis da Fé - Temporada 1',
    descPlaceholder: 'Sinopse geral da história, personagens bíblicos e temas abordados.',
    icon: Clapperboard,
    formatDesc: 'Histórias bíblicas organizadas em temporadas e episódios em vídeo.',
    infoDesc: 'Esses dados serão exibidos no catálogo de séries para as famílias.',
    areaDesc: 'Sua série será adicionada ao catálogo oficial da Área de Membros Com Deus Kids para organizar temporadas e episódios.',
    btnLabel: 'Cadastrar série'
  },
  musica: {
    label: 'Músicas & Louvores',
    titlePlaceholder: 'Ex.: Álbum Louvores da Criação',
    descPlaceholder: 'Descreva o álbum, ministério de louvor ou cantor, e temas das canções.',
    icon: Music,
    formatDesc: 'Louvores infantis, canções e álbuns com player de áudio, letras e cifras.',
    infoDesc: 'Esses dados serão exibidos no player de áudio e na loja para os ouvintes.',
    areaDesc: 'Seu álbum musical terá um player dedicado na Área de Membros Com Deus Kids com suporte a cifras e playbacks.',
    btnLabel: 'Cadastrar álbum musical'
  },
  jogo: {
    label: 'Jogo Bíblico Interativo',
    titlePlaceholder: 'Ex.: Quiz Bíblico dos Discípulos',
    descPlaceholder: 'Objetivo do jogo, instruções e lição bíblica que a criança vai fixar.',
    icon: Gamepad2,
    formatDesc: 'Jogos interativos bíblicos para aprender brincando com ranking e recordes.',
    infoDesc: 'Esses dados serão exibidos para as crianças e pais antes de iniciar a partida.',
    areaDesc: 'O jogo será publicado na Área de Membros Com Deus Kids com sistema de pontuação e ranking.',
    btnLabel: 'Cadastrar jogo'
  },
  filme: {
    label: 'Filme Bíblico',
    titlePlaceholder: 'Ex.: A História de Daniel - O Filme',
    descPlaceholder: 'Sinopse cinematográfica, duração e ensinamento bíblico central.',
    icon: Film,
    formatDesc: 'Filmes e aventuras bíblicas completas para assistir em família.',
    infoDesc: 'Ficha técnica e sinopse que serão exibidas na tela de reprodução.',
    areaDesc: 'O filme terá uma sala de cinema dedicada com trailer e guia da família na Área de Membros Com Deus Kids.',
    btnLabel: 'Cadastrar filme'
  },
  video: {
    label: 'Vídeo / Clipe Bíblico',
    titlePlaceholder: 'Ex.: Clipe Musical Arca de Noé',
    descPlaceholder: 'Descreva o conteúdo do vídeo, faixa etária e lição.',
    icon: Video,
    formatDesc: 'Vídeos, clipes e histórias pontuais para ensinar e inspirar.',
    infoDesc: 'Informações exibidas no player e nos detalhes do vídeo.',
    areaDesc: 'O vídeo estará disponível na Área de Membros Com Deus Kids com materiais de apoio anexados.',
    btnLabel: 'Cadastrar vídeo'
  },
  brincadeira: {
    label: 'Brincadeira & Dinâmica',
    titlePlaceholder: 'Ex.: Dinâmica da Armadura de Deus',
    descPlaceholder: 'Objetivo pedagógico da dinâmica, versículo bíblico e lição prática.',
    icon: Puzzle,
    formatDesc: 'Dinâmicas e brincadeiras educativas para casa, células e igreja.',
    infoDesc: 'Informações que ajudarão pais e líderes de ministério infantil a conduzir a dinâmica.',
    areaDesc: 'A dinâmica contará com roteiro passo a passo e cartelas para impressão na Área de Membros Com Deus Kids.',
    btnLabel: 'Cadastrar dinâmica'
  }
}

export default function CourseWizard() {
  const navigate = useNavigate()
  const { step: stepParam } = useParams()
  const [searchParams] = useSearchParams()
  const tipo = searchParams.get('tipo') || 'curso'
  const meta = PRODUCT_META[tipo] || PRODUCT_META.curso
  const MetaIcon = meta.icon

  const step = Math.min(4, Math.max(2, Number(stepParam) || 2))
  const [form, setForm] = useState<CourseForm>(initial)
  const [coverPreview, setCoverPreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [dbCategoryId, setDbCategoryId] = useState('')

  useEffect(() => {
    supabase
      .from('categories')
      .select('id')
      .eq('active', true)
      .limit(1)
      .then(({ data }) => setDbCategoryId(data?.[0]?.id || ''))
  }, [])

  const update = (key: keyof CourseForm, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const goToStep = (nextStep: number) => {
    const query = tipo ? `?tipo=${tipo}` : ''
    navigate(`/products/bw/add/${nextStep}/info${query}`)
  }

  const next = () => {
    setError('')
    goToStep(Math.min(4, step + 1))
  }

  const upload = (file?: File) => {
    if (!file) return
    const url = URL.createObjectURL(file)
    setCoverPreview(url)
    update('coverUrl', url)
  }

  const createProduct = async () => {
    if (saving) return
    setSaving(true)
    setError('')

    const defaultTitle = `Novo ${meta.label}`
    const defaultDesc = `Descrição de ${meta.label.toLowerCase()}`
    const title = form.title.trim() || defaultTitle
    const description = form.description.trim() || defaultDesc
    const slug =
      title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || `${tipo}-${Date.now()}`

    const localId = `${tipo}-${Date.now()}`
    const numPrice = Number(form.price.replace(',', '.')) || 0

    const productRecord = {
      id: localId,
      ...form,
      title,
      description,
      slug,
      product_type: tipo,
      type: tipo,
      price: numPrice,
      is_free: numPrice === 0,
      created_at: new Date().toISOString()
    }

    try {
      if (dbCategoryId) {
        const { data, error: insertError } = await supabase
          .from('products')
          .insert({
            title,
            slug,
            description,
            short_description: description.slice(0, 180),
            cover_url: form.coverUrl || null,
            category_id: dbCategoryId,
            price: numPrice,
            is_free: numPrice === 0,
            status: 'draft'
          })
          .select('id')
          .single()

        if (!insertError && data) {
          productRecord.id = data.id
        }
      }

      // Salva localmente com chave padronizada e compatível
      localStorage.setItem(`cdk-product-${productRecord.id}`, JSON.stringify(productRecord))
      localStorage.setItem(`cdk-course-${productRecord.id}`, JSON.stringify(productRecord))

      navigate(`/membro/${tipo}/${productRecord.id}`, { state: { created: true } })
    } catch {
      localStorage.setItem(`cdk-product-${productRecord.id}`, JSON.stringify(productRecord))
      localStorage.setItem(`cdk-course-${productRecord.id}`, JSON.stringify(productRecord))
      navigate(`/membro/${tipo}/${productRecord.id}`, { state: { created: true } })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="course-wizard">
      <aside className="course-wizard__steps">
        <div className="course-wizard__type">
          <span>Formato do produto:</span>
          <strong>{meta.label}</strong>
        </div>
        {steps.map((label, index) => (
          <button
            key={label}
            type="button"
            onClick={() => goToStep(index + 1)}
            className={step === index + 1 ? 'current' : step > index + 1 ? 'done' : ''}
          >
            <i>{step > index + 1 ? <Check size={13} /> : index + 1}</i>
            <span>
              <b>{label}</b>
              {index > 0 && (
                <small>
                  {
                    [
                      '',
                      `Descreva seu ${meta.label.toLowerCase()}`,
                      'Defina o valor e a estratégia de venda',
                      'Adicione à Área de Membros CDK'
                    ][index]
                  }
                </small>
              )}
            </span>
          </button>
        ))}
      </aside>

      <main className="course-wizard__main">
        {step === 1 && (
          <section className="course-wizard__section">
            <MetaIcon size={42} />
            <h1>{meta.label}</h1>
            <p>{meta.formatDesc}</p>
            <div className="course-format-card">
              <MetaIcon size={24} />
              <div>
                <strong>{meta.label}</strong>
                <span>{meta.formatDesc}</span>
              </div>
              <Check />
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="course-wizard__section">
            <h1>Informações básicas</h1>
            <p>{meta.infoDesc}</p>
            <label>
              Nome do produto *
              <input
                value={form.title}
                onChange={e => update('title', e.target.value)}
                placeholder={meta.titlePlaceholder}
              />
            </label>
            <label>
              Descrição *
              <textarea
                value={form.description}
                maxLength={2000}
                onChange={e => update('description', e.target.value)}
                placeholder={meta.descPlaceholder}
              />
              <small>{form.description.length}/2000</small>
            </label>
            <div className="course-wizard__two">
              <label>
                Idioma do produto
                <select value={form.language} onChange={e => update('language', e.target.value)}>
                  <option>Português (Brasil)</option>
                  <option>Español</option>
                  <option>English</option>
                </select>
              </label>
              <label>
                Principal país para vendas
                <select value={form.country} onChange={e => update('country', e.target.value)}>
                  <option>Brasil</option>
                  <option>Portugal</option>
                  <option>Estados Unidos</option>
                </select>
              </label>
            </div>
            <label>
              Imagem de capa / Banner
              <div className="course-upload">
                {coverPreview ? (
                  <img src={coverPreview} alt="Prévia da capa" />
                ) : (
                  <>
                    <ImagePlus />
                    <span>Arraste uma imagem aqui ou</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={e => upload(e.target.files?.[0])}
                />
                <b>Selecionar arquivo</b>
              </div>
              <small>JPG, PNG ou WebP. Tamanho máximo: 5 MB.</small>
            </label>
            <fieldset>
              <legend>Categoria *</legend>
              {categories.map(category => (
                <button
                  type="button"
                  className={form.category === category ? 'selected' : ''}
                  onClick={() => update('category', category)}
                  key={category}
                >
                  {category}
                </button>
              ))}
            </fieldset>
          </section>
        )}

        {step === 3 && (
          <section className="course-wizard__section">
            <h1>Precificação</h1>
            <p>Defina a moeda, o valor e a estratégia de venda.</p>
            <label>
              Moeda
              <select>
                <option>Real Brasileiro (R$)</option>
              </select>
            </label>
            <label>
              Prazo para solicitação de reembolso
              <select value={form.refund} onChange={e => update('refund', e.target.value)}>
                <option>7 dias</option>
                <option>15 dias</option>
                <option>30 dias</option>
              </select>
            </label>
            <label>
              Forma de pagamento
              <select value={form.payment} onChange={e => update('payment', e.target.value)}>
                <option>Pagamento à vista</option>
                <option>Parcelado com taxas para o cliente</option>
                <option>Parcelado sem taxas para o cliente</option>
              </select>
            </label>
            <label>
              Valor do produto *
              <div className="course-price">
                <span>R$</span>
                <input
                  inputMode="decimal"
                  value={form.price}
                  onChange={e => update('price', e.target.value.replace(',', '.'))}
                  placeholder="0,00 (ou deixe 0 para Gratuito)"
                />
              </div>
            </label>
          </section>
        )}

        {step === 4 && (
          <section className="course-wizard__section">
            <h1>Área de Membros</h1>
            <p>Onde seus membros terão acesso ao conteúdo e aos recursos.</p>
            <button className="course-area-card selected" onClick={() => update('area', 'com-deus-kids')}>
              <span className="course-area-card__mark">CDK</span>
              <div>
                <strong>Com Deus Kids</strong>
                <small>Área de membros oficial da plataforma</small>
              </div>
              <Check />
            </button>
            <div className="course-area-note">
              <UsersRound />
              {meta.areaDesc}
            </div>
          </section>
        )}

        {error && <p className="course-wizard__error">{error}</p>}

        <footer>
          <button
            type="button"
            onClick={() => (step === 2 ? navigate('/admin/produtos/novo') : goToStep(step - 1))}
          >
            <ArrowLeft size={17} />
            Anterior
          </button>
          {step < 4 ? (
            <button type="button" className="primary" onClick={next}>
              Próximo <ArrowRight size={17} />
            </button>
          ) : (
            <button
              type="button"
              className="primary"
              onClick={createProduct}
              disabled={saving}
            >
              {saving ? 'Criando...' : meta.btnLabel}
            </button>
          )}
        </footer>
      </main>
    </div>
  )
}
