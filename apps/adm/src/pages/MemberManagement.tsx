import React, { useEffect, useState } from 'react'
import {
  Archive, Bell, BookOpen, CalendarDays, CheckSquare, ChevronDown, CircleHelp, Clapperboard,
  DollarSign, Download, Edit2, FileQuestion, Film, FolderOpen, Gamepad2, Globe, GraduationCap,
  HeartHandshake, Home, Image, LayoutDashboard, Megaphone, MessageCircle, Music, Palette,
  Play, Plus, Puzzle, Save, Search, Settings, SlidersHorizontal, Tag, Trophy, UsersRound, Video, X
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ArquivoMemberView from '../components/member-formats/ArquivoMemberView'
import SerieMemberView from '../components/member-formats/SerieMemberView'
import MusicaMemberView from '../components/member-formats/MusicaMemberView'
import JogoMemberView from '../components/member-formats/JogoMemberView'
import FilmeMemberView from '../components/member-formats/FilmeMemberView'
import VideoMemberView from '../components/member-formats/VideoMemberView'
import BrincadeiraMemberView from '../components/member-formats/BrincadeiraMemberView'

type Item = { id: string; title: string; type: 'Aula' | 'Quiz' | 'Material' }
type Module = { id: string; title: string; items: Item[] }
type Course = {
  id: string
  title: string
  description?: string
  coverUrl?: string
  category?: string
  language?: string
  country?: string
  price?: string | number
  payment?: string
  refund?: string
  area?: string
  status?: string
  slug?: string
  created_at?: string
}
type Turma = { id: string; name: string; isDefault?: boolean; membersCount: number; createdAt: string }

const COURSE_CATEGORIES = [
  'Educação cristã',
  'Histórias bíblicas',
  'Música e artes',
  'Desenvolvimento infantil',
  'Materiais para EBD',
  'Outros'
]
const COURSE_LANGUAGES = ['Português (Brasil)', 'Español', 'English']
const COURSE_COUNTRIES = ['Brasil', 'Portugal', 'Estados Unidos']
const COURSE_REFUNDS = ['7 dias', '15 dias', '30 dias']
const COURSE_PAYMENTS = [
  'Pagamento à vista',
  'Parcelado com taxas para o cliente',
  'Parcelado sem taxas para o cliente'
]

function CourseEditForm({
  initialCourse,
  onSave,
  onCancel,
  isPage = false
}: {
  initialCourse: Course
  onSave: (data: Partial<Course>) => Promise<void> | void
  onCancel?: () => void
  isPage?: boolean
}) {
  const [formTitle, setFormTitle] = useState(initialCourse.title || '')
  const [formDescription, setFormDescription] = useState(initialCourse.description || '')
  const [formCategory, setFormCategory] = useState(initialCourse.category || 'Educação cristã')
  const [formLanguage, setFormLanguage] = useState(initialCourse.language || 'Português (Brasil)')
  const [formCountry, setFormCountry] = useState(initialCourse.country || 'Brasil')
  const [formCoverUrl, setFormCoverUrl] = useState(initialCourse.coverUrl || '')
  const [formPrice, setFormPrice] = useState(String(initialCourse.price ?? '0'))
  const [formPayment, setFormPayment] = useState(initialCourse.payment || 'Pagamento à vista')
  const [formRefund, setFormRefund] = useState(initialCourse.refund || '7 dias')
  const [formStatus, setFormStatus] = useState(initialCourse.status || 'draft')
  const [isSaving, setIsSaving] = useState(false)
  const [feedback, setFeedback] = useState('')

  const handleImageFile = (file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = e => {
      const res = e.target?.result as string
      if (res) setFormCoverUrl(res)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim()) {
      alert('Por favor, digite o nome do curso.')
      return
    }
    setIsSaving(true)
    try {
      await onSave({
        title: formTitle.trim(),
        description: formDescription.trim(),
        category: formCategory,
        language: formLanguage,
        country: formCountry,
        coverUrl: formCoverUrl,
        price: formPrice,
        payment: formPayment,
        refund: formRefund,
        status: formStatus
      })
      setFeedback('Alterações salvas com sucesso!')
      setTimeout(() => setFeedback(''), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form className="course-edit-panel" onSubmit={handleSubmit}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <h3>{isPage ? 'Configurações e Dados do Produto' : 'Editar Dados do Curso'}</h3>
        {onCancel && (
          <button type="button" onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={20} color="#64748b" />
          </button>
        )}
      </div>
      <p>Edite todas as informações que você cadastrou no assistente de criação do curso.</p>

      {feedback && (
        <div style={{ padding: '10px 16px', background: '#ecfdf5', color: '#047857', borderRadius: 6, marginBottom: 16, fontSize: 13, fontWeight: 600 }}>
          ✓ {feedback}
        </div>
      )}

      <div className="course-edit-grid">
        <div className="course-edit-field">
          <label>Nome do curso *</label>
          <input
            value={formTitle}
            onChange={e => setFormTitle(e.target.value)}
            placeholder="Ex.: Curso Bíblia para Crianças"
            required
          />
        </div>

        <div className="course-edit-field">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <label>Descrição *</label>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>{formDescription.length}/2000</span>
          </div>
          <textarea
            rows={4}
            maxLength={2000}
            value={formDescription}
            onChange={e => setFormDescription(e.target.value)}
            placeholder="Conte o que os alunos vão aprender neste curso."
          />
        </div>

        <div className="course-edit-field">
          <label>Categoria do curso *</label>
          <div className="course-category-pills">
            {COURSE_CATEGORIES.map(cat => (
              <button
                type="button"
                key={cat}
                className={`course-category-pill ${formCategory === cat ? 'selected' : ''}`}
                onClick={() => setFormCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="course-edit-two">
          <div className="course-edit-field">
            <label>Idioma do produto</label>
            <select value={formLanguage} onChange={e => setFormLanguage(e.target.value)}>
              {COURSE_LANGUAGES.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          <div className="course-edit-field">
            <label>Principal país para vendas</label>
            <select value={formCountry} onChange={e => setFormCountry(e.target.value)}>
              {COURSE_COUNTRIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="course-edit-field">
          <label>Imagem de Capa do Curso</label>
          <div className="course-cover-preview">
            {formCoverUrl ? (
              <img src={formCoverUrl} alt="Capa" />
            ) : (
              <div className="course-cover-box">
                <GraduationCap size={32} />
              </div>
            )}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={e => handleImageFile(e.target.files?.[0])}
                style={{ fontSize: 12 }}
              />
              <input
                value={formCoverUrl}
                onChange={e => setFormCoverUrl(e.target.value)}
                placeholder="Ou cole a URL direta da imagem (https://...)"
                style={{ fontSize: 12, padding: '7px 10px' }}
              />
            </div>
          </div>
        </div>

        <div className="course-edit-two">
          <div className="course-edit-field">
            <label>Valor do curso (R$)</label>
            <input
              type="text"
              inputMode="decimal"
              value={formPrice}
              onChange={e => setFormPrice(e.target.value.replace(',', '.'))}
              placeholder="0,00"
            />
          </div>

          <div className="course-edit-field">
            <label>Prazo para reembolso</label>
            <select value={formRefund} onChange={e => setFormRefund(e.target.value)}>
              {COURSE_REFUNDS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="course-edit-two">
          <div className="course-edit-field">
            <label>Forma de pagamento</label>
            <select value={formPayment} onChange={e => setFormPayment(e.target.value)}>
              {COURSE_PAYMENTS.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="course-edit-field">
            <label>Status de publicação</label>
            <select value={formStatus} onChange={e => setFormStatus(e.target.value)}>
              <option value="draft">Em rascunho</option>
              <option value="active">Publicado (Ativo)</option>
            </select>
          </div>
        </div>
      </div>

      <footer style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 28, paddingTop: 18, borderTop: '1px solid #f1f5f9' }}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '9px 16px',
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              background: '#fff',
              color: '#475569',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer'
            }}
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className="dark"
          disabled={isSaving}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '9px 18px',
            borderRadius: 6,
            background: '#5275e5',
            color: '#fff',
            border: '1px solid #5275e5',
            fontWeight: 600,
            fontSize: 13,
            cursor: isSaving ? 'not-allowed' : 'pointer'
          }}
        >
          <Save size={16} /> {isSaving ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </footer>
    </form>
  )
}


export type ProductFormatTab = {
  label: string
  slug: string
  icon: any
}

export type ProductFormatConfig = {
  type: string
  label: string
  sublabel: string
  icon: any
  noticeText: string
  tabs: ProductFormatTab[]
}

export const PRODUCT_CONFIG_MAP: Record<string, ProductFormatConfig> = {
  curso: {
    type: 'curso',
    label: 'Curso Online',
    sublabel: 'Aulas em vídeo, textos, quizzes e materiais para aprender.',
    icon: GraduationCap,
    noticeText: 'Cadastre os módulos e aulas abaixo. Depois de revisar os conteúdos, você poderá publicar o curso para seus alunos.',
    tabs: [
      { label: 'Conteúdo', slug: 'conteudo', icon: BookOpen },
      { label: 'Turmas', slug: 'turmas', icon: UsersRound },
      { label: 'Usuários', slug: 'usuarios', icon: UsersRound },
      { label: 'Comentários', slug: 'comentarios', icon: MessageCircle },
      { label: 'Certificado', slug: 'certificado', icon: GraduationCap },
      { label: 'Configurações', slug: 'configuracoes', icon: Settings }
    ]
  },
  arquivo: {
    type: 'arquivo',
    label: 'Arquivos & Downloads',
    sublabel: 'PDFs, atividades e materiais digitais para baixar e imprimir.',
    icon: Download,
    noticeText: 'Gerencie os arquivos e apostilas disponíveis para download. Acompanhe a quantidade de downloads e o acesso dos membros.',
    tabs: [
      { label: 'Arquivos para Download', slug: 'conteudo', icon: Download },
      { label: 'Estatísticas', slug: 'estatisticas', icon: LayoutDashboard },
      { label: 'Usuários', slug: 'usuarios', icon: UsersRound },
      { label: 'Avaliações & Dúvidas', slug: 'comentarios', icon: MessageCircle },
      { label: 'Configurações', slug: 'configuracoes', icon: Settings }
    ]
  },
  serie: {
    type: 'serie',
    label: 'Série Bíblica',
    sublabel: 'Histórias bíblicas organizadas em temporadas e episódios.',
    icon: Clapperboard,
    noticeText: 'Organize sua série em temporadas e cadastre cada episódio com sinopse e vídeo para as famílias assistirem.',
    tabs: [
      { label: 'Temporadas & Episódios', slug: 'conteudo', icon: Clapperboard },
      { label: 'Materiais da Série', slug: 'materiais', icon: BookOpen },
      { label: 'Usuários', slug: 'usuarios', icon: UsersRound },
      { label: 'Comentários', slug: 'comentarios', icon: MessageCircle },
      { label: 'Configurações', slug: 'configuracoes', icon: Settings }
    ]
  },
  musica: {
    type: 'musica',
    label: 'Músicas & Louvores',
    sublabel: 'Louvores infantis, canções e álbuns para toda a família.',
    icon: Music,
    noticeText: 'Gerencie a playlist do álbum, letras completas, partituras/cifras e playbacks instrumentais para o ministério infantil.',
    tabs: [
      { label: 'Faixas & Player', slug: 'conteudo', icon: Music },
      { label: 'Letras & Cifras', slug: 'letras', icon: BookOpen },
      { label: 'Playbacks', slug: 'playbacks', icon: Play },
      { label: 'Usuários', slug: 'usuarios', icon: UsersRound },
      { label: 'Comentários', slug: 'comentarios', icon: MessageCircle },
      { label: 'Configurações', slug: 'configuracoes', icon: Settings }
    ]
  },
  jogo: {
    type: 'jogo',
    label: 'Jogo Interativo',
    sublabel: 'Jogos interativos para aprender e se divertir com a Bíblia.',
    icon: Gamepad2,
    noticeText: 'Ajuste as fases e perguntas do jogo bíblico, teste a jogabilidade no simulador e veja o ranking dos pequenos campeões.',
    tabs: [
      { label: 'Jogo & Fases', slug: 'conteudo', icon: Gamepad2 },
      { label: 'Ranking & Recordes', slug: 'ranking', icon: Trophy },
      { label: 'Regras do Jogo', slug: 'regras', icon: BookOpen },
      { label: 'Usuários', slug: 'usuarios', icon: UsersRound },
      { label: 'Dúvidas', slug: 'comentarios', icon: MessageCircle },
      { label: 'Configurações', slug: 'configuracoes', icon: Settings }
    ]
  },
  filme: {
    type: 'filme',
    label: 'Filme Bíblico',
    sublabel: 'Filmes e aventuras bíblicas para assistir em família.',
    icon: Film,
    noticeText: 'Sala de cinema Com Deus Kids. Configure o player do filme completo, trailer e o guia de conversa para pais e filhos.',
    tabs: [
      { label: 'Player do Filme', slug: 'conteudo', icon: Film },
      { label: 'Guia da Família', slug: 'guia', icon: HeartHandshake },
      { label: 'Usuários', slug: 'usuarios', icon: UsersRound },
      { label: 'Avaliações', slug: 'comentarios', icon: MessageCircle },
      { label: 'Configurações', slug: 'configuracoes', icon: Settings }
    ]
  },
  video: {
    type: 'video',
    label: 'Vídeo Bíblico',
    sublabel: 'Vídeos, clipes e histórias para ensinar e inspirar.',
    icon: Video,
    noticeText: 'Gerencie o player do vídeo e os materiais complementares para download.',
    tabs: [
      { label: 'Vídeo Principal', slug: 'conteudo', icon: Video },
      { label: 'Materiais de Apoio', slug: 'materiais', icon: BookOpen },
      { label: 'Usuários', slug: 'usuarios', icon: UsersRound },
      { label: 'Comentários', slug: 'comentarios', icon: MessageCircle },
      { label: 'Configurações', slug: 'configuracoes', icon: Settings }
    ]
  },
  brincadeira: {
    type: 'brincadeira',
    label: 'Brincadeira & Dinâmica',
    sublabel: 'Dinâmicas e brincadeiras educativas para casa e igreja.',
    icon: Puzzle,
    noticeText: 'Consulte o roteiro completo com versículo base, checklist de materiais e cartelas para imprimir.',
    tabs: [
      { label: 'Roteiro da Dinâmica', slug: 'conteudo', icon: Puzzle },
      { label: 'Lista de Materiais', slug: 'materiais', icon: CheckSquare },
      { label: 'Anexos para Imprimir', slug: 'imprimiveis', icon: Download },
      { label: 'Usuários', slug: 'usuarios', icon: UsersRound },
      { label: 'Relatos & Fotos', slug: 'comentarios', icon: MessageCircle },
      { label: 'Configurações', slug: 'configuracoes', icon: Settings }
    ]
  }
}

const labels: Record<string, string> = {
  curso: 'Curso Online',
  musica: 'Música',
  filme: 'Filme',
  arquivo: 'Arquivo',
  serie: 'Série',
  video: 'Vídeo',
  jogo: 'Jogo',
  brincadeira: 'Brincadeira'
}

const areaPages: Record<string, { title: string; description: string; action: string }> = {
  inicio: { title: 'Início', description: 'Acompanhe os primeiros passos e as atividades da sua Área de Membros.', action: 'Ver orientações' },
  agenda: { title: 'Agenda', description: 'Crie lives, eventos online e encontros presenciais para seus alunos.', action: 'Criar evento' },
  comunidades: { title: 'Comunidades', description: 'Crie espaços de conversa para aproximar alunos e fortalecer o aprendizado.', action: 'Criar comunidade' },
  moderacao: { title: 'Moderação', description: 'Revise comentários e participações que aguardam aprovação.', action: 'Ver itens pendentes' },
  membros: { title: 'Membros', description: 'Consulte os alunos que têm acesso a este produto e acompanhe o progresso.', action: 'Ver membros' },
  vendas: { title: 'Vendas', description: 'Configure ferramentas para criar ofertas e impulsionar as vendas do produto.', action: 'Ver ferramentas de vendas' },
  combos: { title: 'Combos', description: 'Combine produtos para criar novas ofertas para seu público.', action: 'Criar combo' },
  personalizacao: { title: 'Personalização', description: 'Personalize as páginas e a experiência dos alunos na Área de Membros.', action: 'Personalizar área' },
  gamificacao: { title: 'Gamificação', description: 'Configure regras, reconhecimentos e recompensas para os alunos.', action: 'Configurar gamificação' },
  mensagens: { title: 'Mensagens', description: 'Envie comunicados e acompanhe as conversas com seus membros.', action: 'Nova mensagem' },
  insights: { title: 'Insights', description: 'Acompanhe os dados de acesso, engajamento e evolução dos alunos.', action: 'Ver insights' },
  configuracoes: { title: 'Configurações', description: 'Ajuste as informações e preferências desta Área de Membros.', action: 'Abrir configurações' }
}

type TabType = string

const TAB_SLUG_MAP: Record<string, string> = {
  conteudo: 'Conteúdo',
  turmas: 'Turmas',
  usuarios: 'Usuários',
  comentarios: 'Comentários',
  certificado: 'Certificado',
  produtos: 'Conteúdo',
  estatisticas: 'Estatísticas',
  materiais: 'Materiais',
  letras: 'Letras & Cifras',
  playbacks: 'Playbacks',
  ranking: 'Ranking & Recordes',
  regras: 'Regras do Jogo',
  guia: 'Guia da Família',
  imprimiveis: 'Anexos para Imprimir',
  roteiro: 'Roteiro da Dinâmica',
  faixas: 'Faixas & Player',
  episodios: 'Temporadas & Episódios',
  arquivos: 'Arquivos para Download'
}

const normalizeSlug = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

type ProductSummary = {
  id: string
  title: string
  description?: string
  coverUrl?: string
  type: string
  typeLabel: string
  status: 'active' | 'draft' | string
  modulesCount: number
  itemsCount: number
  turmasCount: number
  price?: number
}

function MemberAreaInicio({
  currentProduct,
  currentType,
  currentId,
  currentModulesCount,
  currentItemsCount,
  onOpenEdit
}: {
  currentProduct: Course
  currentType: string
  currentId: string
  currentModulesCount: number
  currentItemsCount: number
  onOpenEdit?: () => void
}) {
  const navigate = useNavigate()
  const [products, setProducts] = useState<ProductSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState('all')

  useEffect(() => {
    let isMounted = true

    const fetchAllProducts = async () => {
      setLoading(true)
      const list: ProductSummary[] = []
      const seenIds = new Set<string>()

      // 1. Current product from state
      if (currentProduct && currentId) {
        seenIds.add(currentId)

        let turmasCount = 1
        const turmasRaw = localStorage.getItem(`cdk-course-turmas-${currentId}`)
        if (turmasRaw) {
          try {
            const parsed = JSON.parse(turmasRaw)
            if (Array.isArray(parsed) && parsed.length > 0) turmasCount = parsed.length
          } catch {}
        }

        list.push({
          id: currentId,
          title: currentProduct.title,
          description: currentProduct.description || '',
          coverUrl: currentProduct.coverUrl || '',
          type: currentType || 'curso',
          typeLabel: labels[currentType || 'curso'] || 'Curso Online',
          status: currentProduct.status || 'draft',
          modulesCount: currentModulesCount,
          itemsCount: currentItemsCount,
          turmasCount,
          price: Number(currentProduct.price || 0)
        })
      }

      // 2. From localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (
          key &&
          key.startsWith('cdk-course-') &&
          !key.startsWith('cdk-course-modules-') &&
          !key.startsWith('cdk-course-turmas-') &&
          !key.startsWith('cdk-course-cert-')
        ) {
          try {
            const raw = localStorage.getItem(key)
            if (raw) {
              const parsed = JSON.parse(raw)
              const pId = parsed.id || key.replace('cdk-course-', '')
              if (pId && !seenIds.has(pId)) {
                seenIds.add(pId)

                let modulesCount = 0
                let itemsCount = 0
                const modsRaw = localStorage.getItem(`cdk-course-modules-${pId}`)
                if (modsRaw) {
                  try {
                    const mods = JSON.parse(modsRaw)
                    if (Array.isArray(mods)) {
                      modulesCount = mods.length
                      itemsCount = mods.reduce((acc: number, m: any) => acc + (m.items?.length || 0), 0)
                    }
                  } catch {}
                }

                let turmasCount = 1
                const turmasRaw = localStorage.getItem(`cdk-course-turmas-${pId}`)
                if (turmasRaw) {
                  try {
                    const t = JSON.parse(turmasRaw)
                    if (Array.isArray(t) && t.length > 0) turmasCount = t.length
                  } catch {}
                }

                list.push({
                  id: pId,
                  title: parsed.title || 'Curso sem título',
                  description: parsed.description || '',
                  coverUrl: parsed.coverUrl || parsed.cover_url || '',
                  type: parsed.type || 'curso',
                  typeLabel: labels[parsed.type || 'curso'] || 'Curso Online',
                  status: parsed.status || 'draft',
                  modulesCount,
                  itemsCount,
                  turmasCount,
                  price: Number(parsed.price || 0)
                })
              }
            }
          } catch {}
        }
      }

      // 3. From Supabase database products table
      try {
        const { data } = await supabase
          .from('products')
          .select('*')
          .is('deleted_at', null)
          .order('created_at', { ascending: false })

        if (data && Array.isArray(data)) {
          for (const item of data) {
            if (!seenIds.has(item.id)) {
              seenIds.add(item.id)

              let modulesCount = 0
              let itemsCount = 0
              const modsRaw = localStorage.getItem(`cdk-course-modules-${item.id}`)
              if (modsRaw) {
                try {
                  const mods = JSON.parse(modsRaw)
                  if (Array.isArray(mods)) {
                    modulesCount = mods.length
                    itemsCount = mods.reduce((acc: number, m: any) => acc + (m.items?.length || 0), 0)
                  }
                } catch {}
              }

              let turmasCount = 1
              const turmasRaw = localStorage.getItem(`cdk-course-turmas-${item.id}`)
              if (turmasRaw) {
                try {
                  const t = JSON.parse(turmasRaw)
                  if (Array.isArray(t) && t.length > 0) turmasCount = t.length
                } catch {}
              }

              list.push({
                id: item.id,
                title: item.title,
                description: item.description || item.short_description || '',
                coverUrl: item.cover_url || '',
                type: item.product_type || 'curso',
                typeLabel: labels[item.product_type || 'curso'] || 'Curso Online',
                status: item.status || 'active',
                modulesCount,
                itemsCount,
                turmasCount,
                price: Number(item.price || 0)
              })
            }
          }
        }
      } catch (err) {
        console.error('Error fetching supabase products:', err)
      }

      if (isMounted) {
        setProducts(list)
        setLoading(false)
      }
    }

    fetchAllProducts()

    return () => {
      isMounted = false
    }
  }, [currentProduct, currentType, currentId, currentModulesCount, currentItemsCount])

  // Filtered products
  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
    const matchesType = selectedType === 'all' || p.type === selectedType
    return matchesSearch && matchesType
  })

  // Aggregated metrics
  const totalProducts = products.length
  const totalCourses = products.filter(p => p.type === 'curso').length
  const totalModules = products.reduce((acc, p) => acc + p.modulesCount, 0)
  const totalItems = products.reduce((acc, p) => acc + p.itemsCount, 0)
  const totalTurmas = products.reduce((acc, p) => acc + p.turmasCount, 0)

  // Types available for filter pills
  const availableTypes = Array.from(new Set(products.map(p => p.type).filter(Boolean)))

  return (
    <section className="member-area__page" style={{ paddingBottom: 40 }}>
      {/* HEADER DA PÁGINA */}
      <div className="member-area__page-heading">
        <div>
          <h2>Início</h2>
          <p>Visão geral de todos os produtos e conteúdos cadastrados na sua Área de Membros.</p>
        </div>
        <button className="dark" onClick={() => navigate('/products/bw/add/1/type')}>
          <Plus size={18} /> Novo Produto
        </button>
      </div>

      {/* PAINEL DE DESTAQUE: PRODUTO ATUAL */}
      {currentProduct && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #dde3eb',
          borderRadius: 12,
          padding: 24,
          marginTop: 24,
          boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
            marginBottom: 18
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 58,
                height: 58,
                borderRadius: 10,
                background: '#eff4fe',
                color: '#5275e5',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
                overflow: 'hidden'
              }}>
                {currentProduct.coverUrl ? (
                  <img src={currentProduct.coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <GraduationCap size={28} />
                )}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', background: '#eff4fe', color: '#3b82f6', padding: '2px 8px', borderRadius: 4 }}>
                    {labels[currentType] || 'Curso Online'}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 600, background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 4 }}>
                    {currentProduct.status === 'active' ? 'Publicado' : 'Em rascunho'}
                  </span>
                  {currentProduct.category && (
                    <span style={{ fontSize: 11, fontWeight: 600, background: '#f0fdf4', color: '#166534', padding: '2px 8px', borderRadius: 4 }}>
                      {currentProduct.category}
                    </span>
                  )}
                  {currentProduct.price !== undefined && (
                    <span style={{ fontSize: 11, fontWeight: 600, background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: 4 }}>
                      {Number(currentProduct.price) > 0 ? `R$ ${Number(currentProduct.price).toFixed(2).replace('.', ',')}` : 'Gratuito'}
                    </span>
                  )}
                </div>
                <h3 style={{ margin: '4px 0 2px', fontSize: 19, fontWeight: 700, color: '#1e293b' }}>
                  {currentProduct.title}
                </h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: 13 }}>
                  {currentProduct.description || 'Prepare os conteúdos que serão exibidos para os seus alunos.'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {onOpenEdit && (
                <button
                  onClick={onOpenEdit}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '9px 15px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    background: '#fff',
                    color: '#1e293b',
                    font: '600 13px var(--font-family)',
                    cursor: 'pointer'
                  }}
                >
                  <Edit2 size={16} /> Editar Informações
                </button>
              )}
              <button
                className="dark"
                onClick={() => navigate(`/membro/${currentType}/${currentId}/conteudo`)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '9px 15px',
                  borderRadius: 6,
                  background: '#5275e5',
                  color: '#fff',
                  border: '1px solid #5275e5',
                  font: '600 13px var(--font-family)',
                  cursor: 'pointer'
                }}
              >
                <BookOpen size={16} /> Gerenciar Conteúdo
              </button>
              <button
                onClick={() => navigate(`/membro/${currentType}/${currentId}/turmas`)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '9px 15px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  color: '#334155',
                  font: '600 13px var(--font-family)',
                  cursor: 'pointer'
                }}
              >
                <UsersRound size={16} /> Turmas
              </button>
              <button
                onClick={() => navigate(`/membro/${currentType}/${currentId}/usuarios`)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '9px 15px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  color: '#334155',
                  font: '600 13px var(--font-family)',
                  cursor: 'pointer'
                }}
              >
                Usuários
              </button>
              <button
                onClick={() => navigate(`/membro/${currentType}/${currentId}/certificado`)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '9px 15px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  color: '#334155',
                  font: '600 13px var(--font-family)',
                  cursor: 'pointer'
                }}
              >
                Certificado
              </button>
            </div>
          </div>

          {/* DADOS DETALHADOS CADASTRADOS NO ASSISTENTE */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12,
            marginBottom: 16,
            padding: '14px 16px',
            background: '#f8fafc',
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            fontSize: 13
          }}>
            <div>
              <span style={{ display: 'block', color: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>Categoria</span>
              <strong style={{ color: '#1e293b' }}>{currentProduct.category || 'Educação cristã'}</strong>
            </div>
            <div>
              <span style={{ display: 'block', color: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>Idioma & País</span>
              <strong style={{ color: '#1e293b' }}>{currentProduct.language || 'Português (Brasil)'} · {currentProduct.country || 'Brasil'}</strong>
            </div>
            <div>
              <span style={{ display: 'block', color: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>Preço de Venda</span>
              <strong style={{ color: '#047857' }}>
                {Number(currentProduct.price) > 0 ? `R$ ${Number(currentProduct.price).toFixed(2).replace('.', ',')}` : 'Gratuito'}
              </strong>
            </div>
            <div>
              <span style={{ display: 'block', color: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>Pagamento & Reembolso</span>
              <strong style={{ color: '#1e293b' }}>{currentProduct.payment || 'Pagamento à vista'} ({currentProduct.refund || '7 dias'})</strong>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: 12,
            paddingTop: 16,
            borderTop: '1px solid #f1f5f9'
          }}>
            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 8 }}>
              <span style={{ display: 'block', color: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>Módulos</span>
              <b style={{ fontSize: 18, color: '#1e293b' }}>{currentModulesCount}</b>
            </div>
            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 8 }}>
              <span style={{ display: 'block', color: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>Aulas / Conteúdos</span>
              <b style={{ fontSize: 18, color: '#1e293b' }}>{currentItemsCount}</b>
            </div>
            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 8 }}>
              <span style={{ display: 'block', color: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>Turmas</span>
              <b style={{ fontSize: 18, color: '#1e293b' }}>
                {products.find(p => p.id === currentId)?.turmasCount || 1}
              </b>
            </div>
            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 8 }}>
              <span style={{ display: 'block', color: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>Certificado</span>
              <b style={{ fontSize: 18, color: '#1e293b' }}>
                {localStorage.getItem(`cdk-course-cert-${currentId}`) === 'true' ? 'Ativado' : 'Desativado'}
              </b>
            </div>
          </div>
        </div>
      )}

      {/* ESTATÍSTICAS GERAIS */}
      <div className="member-overview__stats">
        <div className="member-overview__stat">
          <div><FolderOpen size={22} /></div>
          <div>
            <small>Total de Produtos</small>
            <b>{totalProducts}</b>
          </div>
        </div>
        <div className="member-overview__stat">
          <div><GraduationCap size={22} /></div>
          <div>
            <small>Cursos Online</small>
            <b>{totalCourses}</b>
          </div>
        </div>
        <div className="member-overview__stat">
          <div><BookOpen size={22} /></div>
          <div>
            <small>Módulos & Aulas</small>
            <b>{totalModules} mód. · {totalItems} aulas</b>
          </div>
        </div>
        <div className="member-overview__stat">
          <div><UsersRound size={22} /></div>
          <div>
            <small>Turmas Ativas</small>
            <b>{totalTurmas}</b>
          </div>
        </div>
      </div>

      {/* SEÇÃO TODOS OS PRODUTOS */}
      <div style={{ marginTop: 24, marginBottom: 14 }}>
        <h3 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 700, color: '#1e293b' }}>
          Todos os Produtos da Área de Membros
        </h3>
        <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
          Selecione qualquer produto para gerenciar conteúdos, turmas e configurações.
        </p>
      </div>

      {/* BUSCA E FILTROS */}
      <div className="member-overview__search-bar">
        <div className="member-overview__search">
          <Search size={18} color="#94a3b8" />
          <input
            placeholder="Buscar por título ou descrição..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => setSelectedType('all')}
            style={{
              padding: '6px 14px',
              borderRadius: 99,
              border: selectedType === 'all' ? '1px solid #5275e5' : '1px solid #cbd5e1',
              background: selectedType === 'all' ? '#eff4fe' : '#ffffff',
              color: selectedType === 'all' ? '#5275e5' : '#475569',
              fontWeight: 600,
              fontSize: 12,
              cursor: 'pointer'
            }}
          >
            Todos ({products.length})
          </button>
          {availableTypes.map(t => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              style={{
                padding: '6px 14px',
                borderRadius: 99,
                border: selectedType === t ? '1px solid #5275e5' : '1px solid #cbd5e1',
                background: selectedType === t ? '#eff4fe' : '#ffffff',
                color: selectedType === t ? '#5275e5' : '#475569',
                fontWeight: 600,
                fontSize: 12,
                cursor: 'pointer'
              }}
            >
              {labels[t] || t} ({products.filter(p => p.type === t).length})
            </button>
          ))}
        </div>
      </div>

      {/* GRID DE CARDS DOS PRODUTOS */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
          Carregando produtos da Área de Membros...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="member-area__page-empty">
          <FolderOpen size={44} />
          <h3>Nenhum produto encontrado</h3>
          <p>
            {search
              ? 'Nenhum produto corresponde à sua pesquisa. Tente outro termo.'
              : 'Você ainda não cadastrou outros produtos nesta Área de Membros.'}
          </p>
          <button className="dark" onClick={() => navigate('/products/bw/add/1/type')}>
            <Plus size={16} /> Cadastrar Produto
          </button>
        </div>
      ) : (
        <div className="member-overview__grid">
          {filteredProducts.map(p => (
            <article key={p.id} className="member-overview__card">
              <div className="member-overview__card-cover">
                {p.coverUrl ? (
                  <img src={p.coverUrl} alt={p.title} />
                ) : (
                  <div style={{ display: 'grid', placeItems: 'center', width: '100%', height: '100%', background: 'linear-gradient(135deg, #eef2f6 0%, #dbeafe 100%)' }}>
                    <GraduationCap size={44} style={{ color: '#5275e5' }} />
                  </div>
                )}
                <span className="member-overview__badge-type">{p.typeLabel}</span>
                <span className={`member-overview__badge-status ${p.status === 'active' ? 'active' : 'draft'}`}>
                  {p.status === 'active' ? 'Ativo' : 'Em rascunho'}
                </span>
              </div>

              <div className="member-overview__card-body">
                <h3>{p.title}</h3>
                <p>{p.description || 'Sem descrição cadastrada.'}</p>

                <div className="member-overview__meta">
                  <span>
                    <BookOpen size={14} />
                    {p.modulesCount} módulo{p.modulesCount === 1 ? '' : 's'} · {p.itemsCount} aula{p.itemsCount === 1 ? '' : 's'}
                  </span>
                  <span>
                    <UsersRound size={14} />
                    {p.turmasCount} turma{p.turmasCount === 1 ? '' : 's'}
                  </span>
                </div>
              </div>

              <footer className="member-overview__card-footer">
                <button onClick={() => navigate(`/membro/${p.type}/${p.id}/turmas`)}>
                  Turmas
                </button>
                <button
                  className="primary"
                  onClick={() => navigate(`/membro/${p.type}/${p.id}/conteudo`)}
                >
                  Gerenciar Aulas e Módulos →
                </button>
              </footer>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function MemberAreaPage({ page }: { page: string }) {
  const content = areaPages[page] || areaPages.inicio
  return (
    <section className="member-area__page">
      <div className="member-area__page-heading">
        <div>
          <h2>{content.title}</h2>
          <p>{content.description}</p>
        </div>
        <button className="dark">{content.action}</button>
      </div>
      <div className="member-area__page-empty">
        <LayoutDashboard size={44} />
        <h3>{content.title} da Área de Membros</h3>
        <p>{content.description}</p>
        <button>{content.action}</button>
      </div>
    </section>
  )
}

function CourseManagementTab({
  tab,
  courseId,
  onCreateClass
}: {
  tab: 'Turmas' | 'Usuários' | 'Comentários' | 'Certificado'
  courseId: string
  onCreateClass: () => void
}) {
  const [turmas, setTurmas] = useState<Turma[]>(() => {
    const saved = localStorage.getItem(`cdk-course-turmas-${courseId}`)
    if (saved) {
      try { return JSON.parse(saved) } catch {}
    }
    return [{
      id: 'default',
      name: 'Turma A',
      isDefault: true,
      membersCount: 0,
      createdAt: new Intl.DateTimeFormat('pt-BR').format(new Date())
    }]
  })
  const [turmaFilter, setTurmaFilter] = useState('')
  const [commentTab, setCommentTab] = useState('Não revisado')
  const [certificateActive, setCertificateActive] = useState(() => {
    return localStorage.getItem(`cdk-course-cert-${courseId}`) === 'true'
  })

  useEffect(() => {
    if (courseId) {
      localStorage.setItem(`cdk-course-turmas-${courseId}`, JSON.stringify(turmas))
    }
  }, [courseId, turmas])

  const handleCreateTurma = () => {
    const name = window.prompt('Digite o nome da nova turma:', `Turma ${String.fromCharCode(65 + turmas.length)}`)
    if (!name || !name.trim()) return
    const newTurma: Turma = {
      id: crypto.randomUUID(),
      name: name.trim(),
      isDefault: false,
      membersCount: 0,
      createdAt: new Intl.DateTimeFormat('pt-BR').format(new Date())
    }
    setTurmas(prev => [...prev, newTurma])
  }

  const toggleCertificate = () => {
    setCertificateActive(prev => {
      const next = !prev
      localStorage.setItem(`cdk-course-cert-${courseId}`, String(next))
      return next
    })
  }

  const filteredTurmas = turmas.filter(t => t.name.toLowerCase().includes(turmaFilter.toLowerCase()))

  if (tab === 'Turmas') {
    return (
      <section className="course-management">
        <header>
          <div>
            <h2>Crie turmas de alunos</h2>
            <p>Defina o nome e selecione as ofertas que levarão seus alunos para esta turma.</p>
          </div>
          <button className="dark" onClick={handleCreateTurma}>
            <Plus size={18} />Criar turma
          </button>
        </header>
        <div className="course-management__filters">
          <button>Ordenar por <ChevronDown size={16} /></button>
          <label>
            <Search size={17} />
            <input
              placeholder="Pesquisar nome de turma"
              value={turmaFilter}
              onChange={e => setTurmaFilter(e.target.value)}
            />
          </label>
        </div>
        <div className="course-management__table">
          <div>
            <span>Turma</span>
            <span>Membros</span>
            <span>Data de criação</span>
            <span />
          </div>
          {filteredTurmas.map(t => (
            <div key={t.id}>
              <strong>
                {t.name} {t.isDefault && <small>Turma padrão</small>}
              </strong>
              <b>{t.membersCount} membros</b>
              <span>{t.createdAt}</span>
              <button title="Mais opções">⋮</button>
            </div>
          ))}
          {filteredTurmas.length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
              Nenhuma turma encontrada.
            </div>
          )}
        </div>
      </section>
    )
  }

  if (tab === 'Usuários') {
    return (
      <section className="course-management">
        <header>
          <div>
            <h2>Gerencie acessos dos usuários</h2>
            <p>Faça o controle dos usuários do seu produto, visualize dados e crie segmentações.</p>
          </div>
          <div className="course-management__header-actions">
            <button><Plus size={18} />Importar Usuários</button>
            <button className="dark"><Plus size={18} />Nova Segmentação</button>
          </div>
        </header>
        <div className="course-management__subtab">Todos</div>
        <div className="course-management__search">
          <button>Filtros <ChevronDown size={16} /></button>
          <label>
            <Search size={17} />
            <input placeholder="Procure por nome ou e-mail" />
          </label>
        </div>
        <div className="course-management__stats">
          <article><small>Total</small><b>0</b><span>0% dos usuários</span></article>
          <article><small>Conclusão</small><b>0%</b><span>concluíram o curso</span></article>
          <article><small>Progresso</small><b>0%</b><span>média dos usuários</span></article>
          <article><small>Engajamento</small><b>Nenhum</b><span>média dos usuários</span></article>
        </div>
        <div className="course-management__blank">Nenhum usuário encontrado.</div>
      </section>
    )
  }

  if (tab === 'Comentários') {
    const commentTabs = ['Não revisado', 'Aprovados', 'Reprovados', 'Marcados como Spam', 'Todos']
    return (
      <section className="course-management">
        <header>
          <div><h2>Comentários</h2></div>
        </header>
        <div className="course-management__comment-tabs">
          {commentTabs.map(cTab => (
            <button
              key={cTab}
              className={commentTab === cTab ? 'selected' : ''}
              onClick={() => setCommentTab(cTab)}
            >
              {cTab}
            </button>
          ))}
        </div>
        <div className="course-management__comment-filters">
          <label>Busca<span><Search size={17} /><input placeholder="Procure por nome ou e-mail" /></span></label>
          <label>Turma<select><option>Selecionar tudo</option></select></label>
          <label>Módulo<select><option>Escolha uma opção</option></select></label>
          <label>Página<select><option>Escolha uma opção</option></select></label>
        </div>
        <div className="course-management__blank">Nenhuma nova mensagem enquanto você esteve fora.</div>
      </section>
    )
  }

  return (
    <section className="course-management">
      <header>
        <div>
          <h2>Certificado</h2>
          <p>Ative e personalize o certificado entregue aos alunos ao concluir o curso.</p>
        </div>
      </header>
      <div className="course-certificate__toggle">
        <div>
          <b>Publicação</b>
          <span>Ativar certificado para alunos?</span>
        </div>
        <button
          role="switch"
          aria-checked={certificateActive}
          style={{ cursor: 'pointer', background: certificateActive ? '#5275e5' : '#e5e7eb' }}
          onClick={toggleCertificate}
        />
      </div>
      <div className="course-certificate">
        <h3>Personalizar certificado</h3>
        <p>Personalize o certificado do curso e inclua as informações que desejar.</p>
        <div className="course-certificate__toolbar">
          <button>Imagem de fundo</button>
          <button>Fonte</button>
          <button>Tags</button>
        </div>
        <div className="course-certificate__preview">
          <b>CERTIFICADO DE CONCLUSÃO</b>
          <span>Certificamos que</span>
          <strong>NOME DO PARTICIPANTE</strong>
          <span>concluiu o curso</span>
          <strong>NOME DO CURSO</strong>
          <small>Data de término · Organizador</small>
        </div>
        <footer>
          <button className="dark" onClick={() => window.alert('Certificado salvo com sucesso!')}>
            Salvar
          </button>
        </footer>
      </div>
    </section>
  )
}

export default function MemberManagement() {
  const params = useParams()
  const navigate = useNavigate()

  // Separação dos 2 Escopos: Área Geral CDK vs Gestão do Curso Específico
  const isGeneralMode = !params.id || params.type === 'geral' || params.type === 'produtos' || params.type === 'inicio'
  const isCourseMode = !isGeneralMode && Boolean(params.id)

  const type = isCourseMode ? (params.type || 'curso') : 'curso'
  const id = isCourseMode ? (params.id || '') : ''
  const section = isCourseMode
    ? (params.section || 'conteudo')
    : (params.section || (params.type === 'produtos' ? 'produtos' : (params.type === 'inicio' ? 'inicio' : 'inicio')))

  const label = labels[type] || 'Produto'

  const [product, setProduct] = useState<Course | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [modal, setModal] = useState<'module' | 'item' | null>(null)
  const [name, setName] = useState('')
  const [selectedModule, setSelectedModule] = useState('')
  const [newItemType, setNewItemType] = useState<Item['type']>('Aula')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const normSection = normalizeSlug(section || '')
  const isTabSection = isCourseMode && (!section || normSection in TAB_SLUG_MAP)
  const contentTab: TabType = isTabSection ? (TAB_SLUG_MAP[normSection] || 'Conteúdo') : 'Conteúdo'
  const activeMenu = isCourseMode ? normSection : (normSection || 'inicio')

  useEffect(() => {
    if (!isCourseMode || !id) return

    const raw = localStorage.getItem(`cdk-course-${id}`)
    let localCourse: Course | null = null
    if (raw) {
      try {
        localCourse = JSON.parse(raw)
      } catch {}
    }

    Promise.resolve(supabase.from('products').select('*').eq('id', id).single())
      .then(({ data }) => {
        if (data) {
          const merged: Course = {
            id: data.id,
            title: data.title || localCourse?.title || `${label} sem título`,
            description: data.description || localCourse?.description || '',
            coverUrl: data.cover_url || localCourse?.coverUrl || '',
            category: localCourse?.category || 'Educação cristã',
            language: localCourse?.language || 'Português (Brasil)',
            country: localCourse?.country || 'Brasil',
            price: data.price !== undefined ? data.price : (localCourse?.price !== undefined ? localCourse.price : 0),
            payment: localCourse?.payment || 'Pagamento à vista',
            refund: localCourse?.refund || '7 dias',
            area: localCourse?.area || 'com-deus-kids',
            status: data.status || localCourse?.status || 'draft',
            slug: data.slug || localCourse?.slug || ''
          }
          setProduct(merged)
          localStorage.setItem(`cdk-course-${id}`, JSON.stringify(merged))
        } else if (localCourse) {
          setProduct(localCourse)
        } else {
          const fallback: Course = {
            id,
            title: `${label} sem título`,
            category: 'Educação cristã',
            language: 'Português (Brasil)',
            country: 'Brasil',
            payment: 'Pagamento à vista',
            refund: '7 dias',
            price: 0,
            status: 'draft'
          }
          setProduct(fallback)
          localStorage.setItem(`cdk-course-${id}`, JSON.stringify(fallback))
        }
      })
      .catch(() => {
        if (localCourse) {
          setProduct(localCourse)
        } else {
          const fallback: Course = {
            id,
            title: `${label} sem título`,
            category: 'Educação cristã',
            language: 'Português (Brasil)',
            country: 'Brasil',
            payment: 'Pagamento à vista',
            refund: '7 dias',
            price: 0,
            status: 'draft'
          }
          setProduct(fallback)
        }
      })

    const saved = localStorage.getItem(`cdk-course-modules-${id}`)
    if (saved) {
      try { setModules(JSON.parse(saved)) } catch {}
    }
  }, [id, label, isCourseMode])

  useEffect(() => {
    if (id && modules.length > 0) {
      localStorage.setItem(`cdk-course-modules-${id}`, JSON.stringify(modules))
    }
  }, [id, modules])

  const handleSaveCourse = async (updatedData: Partial<Course>) => {
    if (!product) return
    const updatedCourse: Course = {
      ...product,
      ...updatedData,
      title: (updatedData.title !== undefined ? updatedData.title : product.title).trim(),
      description: (updatedData.description !== undefined ? updatedData.description : product.description || '').trim()
    }

    setProduct(updatedCourse)
    localStorage.setItem(`cdk-course-${id}`, JSON.stringify(updatedCourse))

    try {
      const numPrice = Number(String(updatedCourse.price || '0').replace(',', '.')) || 0
      await supabase.from('products').update({
        title: updatedCourse.title,
        description: updatedCourse.description,
        short_description: (updatedCourse.description || '').slice(0, 180),
        cover_url: updatedCourse.coverUrl || null,
        price: numPrice,
        is_free: numPrice === 0,
        status: updatedCourse.status === 'active' || updatedCourse.status === 'published' ? 'active' : 'draft'
      }).eq('id', id)
    } catch (err) {
      console.warn('Could not update in supabase directly:', err)
    }

    setIsEditModalOpen(false)
  }

  const save = () => {
    if (!name.trim()) return
    if (modal === 'module') {
      setModules(all => [...all, { id: crypto.randomUUID(), title: name.trim(), items: [] }])
    }
    if (modal === 'item' && selectedModule) {
      setModules(all =>
        all.map(module =>
          module.id === selectedModule
            ? { ...module, items: [...module.items, { id: crypto.randomUUID(), title: name.trim(), type: newItemType }] }
            : module
        )
      )
    }
    setName('')
    setModal(null)
  }

  const addItem = (moduleId: string) => {
    setSelectedModule(moduleId)
    setNewItemType('Aula')
    setModal('item')
  }

  const productMeta = PRODUCT_CONFIG_MAP[type] || PRODUCT_CONFIG_MAP.curso
  const ProductIcon = productMeta.icon

  const generalMenu = [
    { icon: Home, name: 'Início', id: 'inicio' },
    { icon: FolderOpen, name: 'Produtos', id: 'produtos' },
    { icon: CalendarDays, name: 'Agenda', id: 'agenda' },
    { icon: MessageCircle, name: 'Comunidades', id: 'comunidades' },
    { icon: SlidersHorizontal, name: 'Moderação', id: 'moderacao' },
    { icon: UsersRound, name: 'Membros', id: 'membros' },
    { icon: Megaphone, name: 'Vendas', id: 'vendas' },
    { icon: Archive, name: 'Combos', id: 'combos' },
    { icon: Palette, name: 'Personalização', id: 'personalizacao' },
    { icon: Gamepad2, name: 'Gamificação', id: 'gamificacao' },
    { icon: MessageCircle, name: 'Mensagens', id: 'mensagens' },
    { icon: LayoutDashboard, name: 'Insights', id: 'insights' },
    { icon: Settings, name: 'Configurações Gerais', id: 'configuracoes' }
  ]

  if (isCourseMode && !product) return null

  return (
    <div className="member-area">
      <div className="member-area__body">
        {/* HEADER LATERAL / SIDEBAR FIXO */}
        <aside
          className="member-area__side"
          style={{
            position: 'sticky',
            top: 88,
            alignSelf: 'start',
            height: 'fit-content',
            maxHeight: 'calc(100vh - 100px)',
            overflowY: 'auto'
          }}
        >
          {/* IDENTIFICAÇÃO DA ÁREA CDK */}
          <div className="member-area__area-name" style={{ marginBottom: 10 }}>
            <span>CDK</span>
            <div>
              <b style={{ display: 'block' }}>Com Deus Kids</b>
              <small style={{ color: '#64748b', fontSize: 11 }}>Área de Membros Oficial</small>
            </div>
          </div>

          {/* CARD DE CONTEXTO QUANDO UM PRODUTO ESTÁ ABERTO */}
          {isCourseMode ? (
            <div style={{
              background: '#eff4fe',
              border: '1px solid #bfdbfe',
              borderRadius: 8,
              padding: '10px 12px',
              marginBottom: 14
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#2563eb' }}>
                  Editando {productMeta.label}
                </span>
                <span style={{ fontSize: 10, fontWeight: 600, background: '#dbeafe', color: '#1e40af', padding: '1px 6px', borderRadius: 3 }}>
                  {product?.status === 'active' ? 'Ativo' : 'Rascunho'}
                </span>
              </div>
              <strong style={{ display: 'block', fontSize: 13, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {product?.title || `${productMeta.label} Aberto`}
              </strong>
              <button
                onClick={() => navigate('/membro/geral/produtos')}
                style={{
                  marginTop: 8,
                  width: '100%',
                  padding: '5px 8px',
                  background: '#ffffff',
                  border: '1px solid #93c5fd',
                  borderRadius: 5,
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#1d4ed8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4
                }}
              >
                ← Voltar para Área Geral CDK
              </button>
            </div>
          ) : (
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: '8px 12px',
              marginBottom: 14,
              fontSize: 12,
              color: '#64748b'
            }}>
              Painel Geral da Plataforma
            </div>
          )}

          {/* MENU CONFORME O ESCOPO ATUAL */}
          {isCourseMode ? (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', padding: '4px 8px 8px' }}>
                Gestão de {productMeta.label}
              </div>
              {productMeta.tabs.map(({ icon: TabIcon, label: tabName, slug: tabSlug }) => {
                const isItemActive = activeMenu === tabSlug || (tabSlug === 'conteudo' && (!section || normSection === 'conteudo' || normSection === 'produtos'))
                return (
                  <button
                    key={tabSlug}
                    className={isItemActive ? 'active' : ''}
                    aria-current={isItemActive ? 'page' : undefined}
                    onClick={() => navigate(`/membro/${type}/${id}/${tabSlug}`)}
                  >
                    <TabIcon size={19} />
                    {tabName}
                  </button>
                )
              })}

              <div style={{ borderTop: '1px solid #e2e8f0', margin: '14px 0 10px', paddingTop: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', padding: '0 8px 6px' }}>
                  Área Geral CDK
                </div>
                <button
                  onClick={() => navigate('/membro/geral/produtos')}
                  style={{ color: '#475569' }}
                >
                  <FolderOpen size={19} />
                  Todos os Produtos
                </button>
                <button
                  onClick={() => navigate('/membro/geral/inicio')}
                  style={{ color: '#475569' }}
                >
                  <Home size={19} />
                  Início Geral CDK
                </button>
              </div>
            </>
          ) : (
            generalMenu.map(({ icon: Icon, name: menuName, id: page }) => (
              <button
                key={page}
                className={activeMenu === page ? 'active' : ''}
                aria-current={activeMenu === page ? 'page' : undefined}
                onClick={() => navigate(`/membro/geral/${page}`)}
              >
                <Icon size={21} />
                {menuName}
              </button>
            ))
          )}

          <button className="member-area__help">
            <CircleHelp size={21} />Central de Ajuda
          </button>
        </aside>

        {/* ÁREA PRINCIPAL */}
        <main style={{ minWidth: 0 }}>
          {/* CASO 1: ÁREA GERAL CDK (Sem curso específico) */}
          {!isCourseMode || !product ? (
            section === 'inicio' || section === 'produtos' ? (
              <MemberAreaInicio
                currentProduct={null as any}
                currentType=""
                currentId=""
                currentModulesCount={0}
                currentItemsCount={0}
              />
            ) : (
              <MemberAreaPage page={section} />
            )
          ) : (
            /* CASO 2: GESTÃO DO CURSO ESPECÍFICO */
            <>
              {/* HEADER DO PRODUTO */}
              <header className="member-area__product" style={{ paddingTop: 0 }}>
                <div className="member-area__product-top">
                  <Link to="/membro/geral/produtos">← Voltar para Área de Membros CDK</Link>
                  <div className="member-area__header-actions">
                    <button
                      title="Editar Informações do Curso"
                      onClick={() => setIsEditModalOpen(true)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        width: 'auto',
                        padding: '0 14px',
                        height: 35,
                        borderRadius: 4,
                        border: '1px solid #cbd5e1',
                        background: '#fff',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <Edit2 size={15} /> Editar Dados
                    </button>
                    <button title="Visualizar Conteúdo" onClick={() => navigate(`/membro/${type}/${id}/conteudo`)}><Search size={18} /></button>
                    <button title="Configurações do Curso" onClick={() => navigate(`/membro/${type}/${id}/configuracoes`)}><Settings size={18} /></button>
                  </div>
                </div>

                <div className="member-area__product-title">
                  {product.coverUrl ? (
                    <img src={product.coverUrl} alt="" />
                  ) : (
                    <span><ProductIcon size={22} /></span>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <small>{productMeta.label} · {product.status === 'active' ? 'Publicado' : 'Em rascunho'}</small>
                      {product.category && (
                        <span style={{ fontSize: 11, fontWeight: 600, background: '#eff4fe', color: '#3b82f6', padding: '2px 8px', borderRadius: 4 }}>
                          {product.category}
                        </span>
                      )}
                      {product.language && (
                        <span style={{ fontSize: 11, fontWeight: 500, background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: 4 }}>
                          {product.language}
                        </span>
                      )}
                      {product.price !== undefined && (
                        <span style={{ fontSize: 11, fontWeight: 600, background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: 4 }}>
                          {Number(product.price) > 0 ? `R$ ${Number(product.price).toFixed(2).replace('.', ',')}` : 'Gratuito'}
                        </span>
                      )}
                    </div>
                    <h1>{product.title}</h1>
                    <p>{product.description || `Prepare os conteúdos de ${productMeta.label.toLowerCase()} que serão exibidos para os seus membros.`}</p>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, fontSize: 12, color: '#64748b', flexWrap: 'wrap' }}>
                      <span><strong>País:</strong> {product.country || 'Brasil'}</span>
                      <span>·</span>
                      <span><strong>Reembolso:</strong> {product.refund || '7 dias'}</span>
                      <span>·</span>
                      <span><strong>Pagamento:</strong> {product.payment || 'Pagamento à vista'}</span>
                      <button
                        onClick={() => setIsEditModalOpen(true)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#5275e5',
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: 0,
                          marginLeft: 4,
                          textDecoration: 'underline'
                        }}
                      >
                        Editar dados do produto
                      </button>
                    </div>
                  </div>
                </div>
              </header>

              {/* AVISO DO PRODUTO */}
              <div className="member-area__notice">
                {productMeta.noticeText}
              </div>

              {/* ABAS DO PRODUTO */}
              <div className="member-area__tabs" style={{ marginTop: 24 }}>
                {productMeta.tabs.filter(t => t.slug !== 'configuracoes').map(tab => {
                  const isTabActive = activeMenu === tab.slug || (tab.slug === 'conteudo' && (!section || normSection === 'conteudo' || normSection === 'produtos'))
                  return (
                    <button
                      key={tab.slug}
                      className={isTabActive && section !== 'configuracoes' ? 'active' : ''}
                      onClick={() => navigate(`/membro/${type}/${id}/${tab.slug}`)}
                    >
                      {tab.label}
                    </button>
                  )
                })}
              </div>

              {/* CONTEÚDO ESPECÍFICO DO PRODUTO */}
              {section === 'configuracoes' ? (
                <div style={{ maxWidth: 880, padding: '16px 0 50px' }}>
                  <CourseEditForm
                    initialCourse={product}
                    onSave={handleSaveCourse}
                    isPage={true}
                  />
                </div>
              ) : section === 'turmas' && type === 'curso' ? (
                <div style={{ paddingTop: 8 }}>
                  <CourseManagementTab
                    tab="Turmas"
                    courseId={id}
                    onCreateClass={() => {}}
                  />
                </div>
              ) : section === 'usuarios' ? (
                <div style={{ paddingTop: 8 }}>
                  <CourseManagementTab
                    tab="Usuários"
                    courseId={id}
                    onCreateClass={() => {}}
                  />
                </div>
              ) : section === 'comentarios' ? (
                <div style={{ paddingTop: 8 }}>
                  <CourseManagementTab
                    tab="Comentários"
                    courseId={id}
                    onCreateClass={() => {}}
                  />
                </div>
              ) : section === 'certificado' && type === 'curso' ? (
                <div style={{ paddingTop: 8 }}>
                  <CourseManagementTab
                    tab="Certificado"
                    courseId={id}
                    onCreateClass={() => {}}
                  />
                </div>
              ) : type === 'arquivo' ? (
                <ArquivoMemberView
                  productId={id}
                  productTitle={product.title}
                  activeTab={normSection}
                />
              ) : type === 'serie' ? (
                <SerieMemberView
                  productId={id}
                  productTitle={product.title}
                  activeTab={normSection}
                />
              ) : type === 'musica' ? (
                <MusicaMemberView
                  productId={id}
                  productTitle={product.title}
                  activeTab={normSection}
                />
              ) : type === 'jogo' ? (
                <JogoMemberView
                  productId={id}
                  productTitle={product.title}
                  activeTab={normSection}
                />
              ) : type === 'filme' ? (
                <FilmeMemberView
                  productId={id}
                  productTitle={product.title}
                  activeTab={normSection}
                />
              ) : type === 'video' ? (
                <VideoMemberView
                  productId={id}
                  productTitle={product.title}
                  activeTab={normSection}
                />
              ) : type === 'brincadeira' ? (
                <BrincadeiraMemberView
                  productId={id}
                  productTitle={product.title}
                  activeTab={normSection}
                />
              ) : (
                /* CURSO ONLINE (ou fallback padrão) */
                <>
                  <div className="member-area__tools" style={{ marginTop: 20 }}>
                    <div className="member-area__pills">
                      <button className="selected">Principal</button>
                      <button>Adicional</button>
                      <button>Trilhas</button>
                    </div>
                    <div>
                      <button aria-label="Pesquisar conteúdo"><Search size={20} /></button>
                      <button><Image size={18} />Enviar arquivos</button>
                      <button className="dark" onClick={() => setModal('module')}>
                        Criar <ChevronDown size={16} />
                      </button>
                    </div>
                  </div>

                  <label className="member-area__selectall">
                    <input type="checkbox" />Selecionar todos
                  </label>

                  {modules.length === 0 ? (
                    <div className="member-area__empty">
                      <Video size={48} />
                      <h2>Crie o conteúdo do curso</h2>
                      <p>Comece criando um módulo. Depois adicione aulas, vídeos, textos, quizzes ou materiais.</p>
                      <button className="dark" onClick={() => setModal('module')}>
                        <Plus size={17} />Criar módulo
                      </button>
                    </div>
                  ) : (
                    <section className="member-area__modules">
                      {modules.map(module => (
                        <article key={module.id}>
                          <header>
                            <span className="member-area__grip">⠿</span>
                            <input type="checkbox" />
                            <div>
                              <b>{module.title}</b>
                              <small>
                                <BookOpen size={13} /> Módulo principal · {module.items.length} conteúdo{module.items.length === 1 ? '' : 's'} · <button onClick={() => navigate(`/membro/${type}/${id}/turmas`)}>Mostrar turmas</button>
                              </small>
                            </div>
                            <button title="Adicionar conteúdo" onClick={() => addItem(module.id)}>
                              <Plus size={19} />
                            </button>
                            <button title="Mais opções">⋮</button>
                          </header>
                          <div className="member-area__items">
                            {module.items.map(item => (
                              <div key={item.id}>
                                <Video size={16} />
                                <span>{item.title}</span>
                                <small>{item.type}</small>
                              </div>
                            ))}
                            <button onClick={() => addItem(module.id)}>
                              <Plus size={18} />Adicionar
                            </button>
                          </div>
                        </article>
                      ))}
                    </section>
                  )}
                </>
              )}
            </>
          )}
        </main>
      </div>


      {modal && (
        <div className="member-area__modal" role="dialog" aria-modal="true">
          <section>
            <h2>{modal === 'module' ? 'Novo módulo principal' : 'Novo conteúdo'}</h2>
            <p>{modal === 'module' ? 'Agrupe o conteúdo do curso em módulos.' : 'Escolha o tipo e o nome do conteúdo.'}</p>
            {modal === 'item' && (
              <div className="member-area__content-types">
                {(['Aula', 'Quiz', 'Material'] as Item['type'][]).map(itemType => (
                  <button
                    key={itemType}
                    className={newItemType === itemType ? 'selected' : ''}
                    onClick={() => setNewItemType(itemType)}
                  >
                    {itemType === 'Aula' ? <Video /> : itemType === 'Quiz' ? <FileQuestion /> : <BookOpen />}
                    <span>{itemType}</span>
                  </button>
                ))}
              </div>
            )}
            <label>
              Nome {modal === 'module' ? 'do módulo' : 'do conteúdo'} *
              <input
                autoFocus
                value={name}
                onChange={event => setName(event.target.value)}
                placeholder={modal === 'module' ? 'Ex.: Módulo 1 — Boas-vindas' : 'Ex.: Aula 1 — Comece aqui'}
              />
            </label>
            <footer>
              <button onClick={() => setModal(null)}>Cancelar</button>
              <button className="dark" onClick={save}>
                {modal === 'module' ? 'Criar módulo' : 'Adicionar conteúdo'}
              </button>
            </footer>
          </section>
        </div>
      )}

      {isEditModalOpen && product && (
        <div className="member-area__modal" role="dialog" aria-modal="true" style={{ zIndex: 120 }}>
          <div style={{ width: 'min(720px, 100%)', maxHeight: '90vh', overflowY: 'auto' }}>
            <CourseEditForm
              initialCourse={product}
              onSave={handleSaveCourse}
              onCancel={() => setIsEditModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

