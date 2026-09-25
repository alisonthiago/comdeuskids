import { supabase } from './supabase'
import {
  StreamContent,
  StreamContentType,
  ContentStatus,
  StreamCarousel,
  AppHomeConfig,
  CMSPlanConfig,
  AdminActivityLog,
  StreamQuizItem
} from '@comdeuskids/types'

export interface DBAvatar {
  id: string
  name: string
  subtitle?: string
  category: 'heroes' | 'teachers' | 'animals' | 'biblical'
  role: 'kid' | 'parent' | 'teacher' | 'leader' | 'all'
  image_url: string
  bg_gradient?: string
  icon_emoji?: string
  description?: string
  sort_order: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

const STORAGE_CONTENTS_KEY = 'cdk_cms_contents'
const STORAGE_CAROUSELS_KEY = 'cdk_cms_carousels'
const STORAGE_HOME_KEY = 'cdk_cms_home'
const STORAGE_PLANS_KEY = 'cdk_cms_plans'
const STORAGE_LOGS_KEY = 'cdk_cms_logs'
const STORAGE_AVATARS_KEY = 'cdk_cms_avatars'

const SEED_CONTENTS: StreamContent[] = [
  {
    id: 'davi-golias',
    title: 'Davi e Golias: A Força da Fé',
    slug: 'davi-e-golias',
    description: 'Com apenas pedras e uma funda, o jovem pastor Davi enfrenta o gigante guerreiro Golias.',
    full_description: 'Com apenas pedras e uma funda, o jovem pastor Davi enfrenta o gigante guerreiro Golias. Uma lição inesquecível de coragem, lealdade e confiança plena em Deus para toda a família.',
    type: 'movie',
    category: 'Histórias Bíblicas',
    tags: ['Coragem', 'Fé', 'Milagres', 'Pastor'],
    thumbnail_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=700&auto=format&fit=crop&q=80',
    banner_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1400&auto=format&fit=crop&q=80',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration_minutes: 24,
    age_range: 'Livre',
    is_featured: true,
    is_new: true,
    status: 'published',
    access_type: 'subscription',
    allowed_plans: ['family', 'church', 'school'],
    view_count: 342,
    scripture_verse: '1 Samuel 17:45 — "Você vem contra mim com espada e lança, mas eu vou contra você em nome do Senhor dos Exércitos!"',
    devotional_text: 'Quando enfrentamos problemas gigantes, não precisamos ter medo. O Senhor é muito maior do que qualquer gigante na nossa vida!',
    related_pdf_id: 'pdf-davi-atividades',
    related_pdf_title: 'Caderno de Atividades e Desenhos para Colorir — Davi e Golias',
    related_pdf_pages: 16,
    quiz: [
      {
        question: 'Qual era a profissão do jovem Davi antes de ir ao acampamento?',
        options: ['General do exército', 'Pescador', 'Pastor de ovelhas', 'Ferreiro'],
        correct_index: 2,
        explanation: 'Davi cuidava com muito amor das ovelhas do seu pai Jessé!'
      },
      {
        question: 'Quantas pedrinhas lisas Davi pegou no riacho?',
        options: ['Uma pedrinha', 'Três pedrinhas', 'Cinco pedrinhas', 'Dez pedrinhas'],
        correct_index: 2,
        explanation: 'Davi escolheu cinco pedrinhas lisas do ribeiro.'
      }
    ],
    created_at: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: 'jesus-tempestade',
    title: 'Jesus Acalma a Tempestade',
    slug: 'jesus-acalma-tempestade',
    description: 'No meio de ondas furiosas e ventos fortes, os discípulos temem. Mas Jesus acalma o mar.',
    type: 'story',
    category: 'Aprendendo com Jesus',
    tags: ['Paz', 'Milagres', 'Confiança'],
    thumbnail_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700&auto=format&fit=crop&q=80',
    banner_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1400&auto=format&fit=crop&q=80',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    duration_minutes: 18,
    age_range: 'Livre',
    is_featured: false,
    is_new: true,
    status: 'published',
    access_type: 'subscription',
    allowed_plans: ['family', 'church', 'school'],
    view_count: 215,
    scripture_verse: 'Marcos 4:39 — "Ele se levantou, repreendeu o vento e disse ao mar: Aquieta-te!"',
    devotional_text: 'Mesmo quando as tempestades da vida parecem fortes, Jesus está no nosso barquinho.',
    created_at: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: 'arca-noe',
    title: 'A Grande Arca de Noé',
    slug: 'a-arca-de-noe',
    description: 'Noé constrói uma arca colossal por ordem de Deus e salva pares de todos os animais.',
    type: 'story',
    category: 'Histórias Bíblicas',
    tags: ['Obediência', 'Animais', 'Aliança'],
    thumbnail_url: 'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?w=700&auto=format&fit=crop&q=80',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    duration_minutes: 22,
    age_range: 'Livre',
    status: 'published',
    access_type: 'subscription',
    allowed_plans: ['family', 'church', 'school'],
    view_count: 189,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'aventuras-da-fe',
    title: 'Aventuras da Fé (1ª Temporada)',
    slug: 'aventuras-da-fe',
    description: 'Série animada que acompanha crianças viajando pelas grandes épocas bíblicas.',
    type: 'series',
    category: 'Séries CDK',
    tags: ['Animação', 'Aventura', 'Temporadas'],
    thumbnail_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=700&auto=format&fit=crop&q=80',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    duration_minutes: 15,
    season_count: 1,
    episodes: [
      {
        id: 'ep-1',
        season_number: 1,
        episode_number: 1,
        title: 'O Chamado de Abraão',
        duration_minutes: 14,
        thumbnail_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80',
        synopsis: 'Abraão ouve a voz de Deus para sair da sua terra.',
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
      },
      {
        id: 'ep-2',
        season_number: 1,
        episode_number: 2,
        title: 'A Promessa sob as Estrelas',
        duration_minutes: 16,
        thumbnail_url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=500&auto=format&fit=crop&q=80',
        synopsis: 'Deus convida Abraão a contar as estrelas do céu.',
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
      }
    ],
    age_range: 'Livre',
    status: 'published',
    access_type: 'subscription',
    allowed_plans: ['family', 'church', 'school'],
    view_count: 512,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'clip-alegria-coracao',
    title: 'A Alegria Está no Coração (Clipe)',
    slug: 'clipe-alegria-coracao',
    description: 'Clipe musical infantil super colorido e animado com a turminha CDK.',
    type: 'clip',
    category: 'Clipes & Músicas',
    tags: ['Música', 'Louvor', 'Dança'],
    thumbnail_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=700&auto=format&fit=crop&q=80',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    duration_minutes: 4,
    age_range: 'Livre',
    status: 'published',
    access_type: 'free',
    allowed_plans: ['family', 'church', 'school'],
    view_count: 420,
    created_at: new Date().toISOString()
  }
]

const SEED_CAROUSELS: StreamCarousel[] = [
  {
    id: 'car-destaque',
    title: 'Destaques da Semana',
    slug: 'destaques',
    source_type: 'featured',
    sort_order: 1,
    is_active: true
  },
  {
    id: 'car-historias',
    title: 'Histórias da Bíblia',
    slug: 'historias-da-biblia',
    source_type: 'category',
    filter_value: 'Histórias Bíblicas',
    sort_order: 2,
    is_active: true
  },
  {
    id: 'car-jesus',
    title: 'Aprendendo com Jesus',
    slug: 'aprendendo-com-jesus',
    source_type: 'category',
    filter_value: 'Aprendendo com Jesus',
    sort_order: 3,
    is_active: true
  },
  {
    id: 'car-series',
    title: 'Séries Animadas CDK',
    slug: 'series-cdk',
    source_type: 'type',
    filter_value: 'series',
    sort_order: 4,
    is_active: true
  },
  {
    id: 'car-clipes',
    title: 'Clipes & Músicas para Crianças',
    slug: 'clipes-musicas',
    source_type: 'category',
    filter_value: 'Clipes & Músicas',
    sort_order: 5,
    is_active: true
  }
]

const SEED_PLANS: CMSPlanConfig[] = [
  {
    id: 'plano-familia',
    name: 'Plano Família CDK',
    slug: 'familia',
    target_audience: 'family',
    price: 29.90,
    interval: 'monthly',
    status: 'active',
    max_profiles: 5,
    max_members: 1,
    max_concurrent_streams: 3,
    allowed_features: {
      movies: true,
      series: true,
      videos: true,
      songs: true,
      clips: true,
      lessons: true,
      quizzes: true,
      pdfs: true,
      downloads: true
    }
  },
  {
    id: 'plano-igreja',
    name: 'Plano Igreja & Ministério Infantil',
    slug: 'igreja',
    target_audience: 'church',
    price: 89.90,
    interval: 'monthly',
    status: 'active',
    max_profiles: 15,
    max_members: 10,
    max_concurrent_streams: 8,
    allowed_features: {
      movies: true,
      series: true,
      videos: true,
      songs: true,
      clips: true,
      lessons: true,
      quizzes: true,
      pdfs: true,
      downloads: true
    }
  },
  {
    id: 'plano-escola',
    name: 'Plano Escola Cristã & EBD',
    slug: 'escola',
    target_audience: 'school',
    price: 149.90,
    interval: 'monthly',
    status: 'active',
    max_profiles: 35,
    max_members: 25,
    max_concurrent_streams: 15,
    allowed_features: {
      movies: true,
      series: true,
      videos: true,
      songs: true,
      clips: true,
      lessons: true,
      quizzes: true,
      pdfs: true,
      downloads: true
    }
  }
]

function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str)
}

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export const cmsService = {
  // -------------------------------------------------------------
  // CONTEÚDOS (CRUD & FILTROS)
  // -------------------------------------------------------------
  getContents: async (filters?: {
    type?: string
    status?: string
    category?: string
    search?: string
  }): Promise<StreamContent[]> => {
    try {
      const { data, error } = await supabase
        .from('stream_contents')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        const formatted: StreamContent[] = data.map(item => ({
          id: item.id,
          title: item.title,
          slug: item.slug,
          description: item.description || '',
          full_description: item.full_description || item.description || '',
          type: item.type as StreamContentType,
          category: item.category_name || 'Geral',
          category_id: item.category_id,
          tags: item.tags || [],
          thumbnail_url: item.thumbnail_url || '',
          banner_url: item.banner_url || '',
          video_url: item.video_url || '',
          audio_url: item.audio_url || '',
          trailer_url: item.trailer_url || '',
          duration_minutes: item.duration_minutes || 0,
          age_range: item.age_range || item.age_rating || 'Livre',
          is_featured: item.is_featured || false,
          is_new: true,
          status: item.status || 'published',
          access_type: item.access_type || 'subscription',
          allowed_plans: item.allowed_plans || ['family', 'church', 'school'],
          scripture_verse: item.scripture_verse,
          devotional_text: item.devotional_text,
          view_count: item.view_count || 0,
          sort_order: item.sort_order || 0,
          created_at: item.created_at,
          updated_at: item.updated_at
        }))
        localStorage.setItem(STORAGE_CONTENTS_KEY, JSON.stringify(formatted))
        return applyFilters(formatted, filters)
      }
    } catch (e) {
      console.warn('Fallback stream_contents:', e)
    }

    const stored = localStorage.getItem(STORAGE_CONTENTS_KEY)
    const list: StreamContent[] = stored ? JSON.parse(stored) : []
    return applyFilters(list, filters)
  },

  getContentById: async (id: string): Promise<StreamContent | null> => {
    try {
      const query = isValidUUID(id)
        ? supabase.from('stream_contents').select('*').eq('id', id).maybeSingle()
        : supabase.from('stream_contents').select('*').eq('slug', id).maybeSingle()

      const { data, error } = await query
      if (!error && data) {
        return {
          id: data.id,
          title: data.title,
          slug: data.slug,
          description: data.description || '',
          full_description: data.full_description || data.description || '',
          type: data.type as StreamContentType,
          category: data.category_name || 'Geral',
          category_id: data.category_id,
          tags: data.tags || [],
          thumbnail_url: data.thumbnail_url || '',
          banner_url: data.banner_url || '',
          video_url: data.video_url || '',
          audio_url: data.audio_url || '',
          trailer_url: data.trailer_url || '',
          duration_minutes: data.duration_minutes || 0,
          age_range: data.age_range || data.age_rating || 'Livre',
          is_featured: data.is_featured || false,
          status: data.status || 'published',
          access_type: data.access_type || 'subscription',
          allowed_plans: data.allowed_plans || ['family', 'church', 'school'],
          scripture_verse: data.scripture_verse,
          devotional_text: data.devotional_text,
          view_count: data.view_count || 0,
          sort_order: data.sort_order || 0,
          created_at: data.created_at,
          updated_at: data.updated_at
        }
      }
    } catch {}

    const list = await cmsService.getContents()
    return list.find(c => c.id === id || c.slug === id) || null
  },

  saveContent: async (content: Partial<StreamContent> & { title: string }): Promise<StreamContent> => {
    const list = await cmsService.getContents()
    const now = new Date().toISOString()
    const targetId = content.id && isValidUUID(content.id) ? content.id : generateUUID()
    const slug = content.slug || content.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    const fullItem: StreamContent = {
      id: targetId,
      title: content.title,
      slug,
      description: content.description || '',
      full_description: content.full_description || content.description || '',
      type: (content.type as StreamContentType) || 'video',
      category: content.category || 'Geral',
      category_id: content.category_id,
      tags: content.tags || [],
      thumbnail_url: content.thumbnail_url || '',
      banner_url: content.banner_url,
      video_url: content.video_url || '',
      audio_url: content.audio_url,
      trailer_url: content.trailer_url,
      duration_minutes: content.duration_minutes || 15,
      age_range: content.age_range || 'Livre',
      is_featured: content.is_featured || false,
      is_new: content.is_new !== undefined ? content.is_new : true,
      status: content.status || 'published',
      access_type: content.access_type || 'subscription',
      allowed_plans: content.allowed_plans || ['family', 'church', 'school'],
      scripture_verse: content.scripture_verse,
      devotional_text: content.devotional_text,
      related_pdf_title: content.related_pdf_title,
      related_pdf_pages: content.related_pdf_pages,
      quiz: content.quiz || [],
      episodes: content.episodes || [],
      view_count: content.view_count || 0,
      sort_order: content.sort_order || 0,
      created_at: content.created_at || now,
      updated_at: now
    }

    // Upsert no Supabase com colunas compatíveis
    const dbPayload = {
      id: targetId,
      title: fullItem.title,
      slug: fullItem.slug,
      description: fullItem.description,
      full_description: fullItem.full_description,
      type: fullItem.type,
      category_name: fullItem.category,
      category_id: fullItem.category_id || null,
      age_rating: fullItem.age_range || 'Livre',
      age_range: fullItem.age_range || 'Livre',
      tags: fullItem.tags || [],
      thumbnail_url: fullItem.thumbnail_url || null,
      banner_url: fullItem.banner_url || null,
      video_url: fullItem.video_url || null,
      audio_url: fullItem.audio_url || null,
      trailer_url: fullItem.trailer_url || null,
      duration_minutes: fullItem.duration_minutes || 0,
      scripture_verse: fullItem.scripture_verse || null,
      devotional_text: fullItem.devotional_text || null,
      access_type: fullItem.access_type || 'subscription',
      allowed_plans: fullItem.allowed_plans || ['family', 'church', 'school'],
      status: fullItem.status || 'published',
      is_featured: fullItem.is_featured || false,
      view_count: fullItem.view_count || 0,
      sort_order: fullItem.sort_order || 0,
      updated_at: now
    }

    try {
      const { error } = await supabase.from('stream_contents').upsert(dbPayload)
      if (error) console.error('Error saving stream_content to Supabase:', error)

      // Se for série e tiver episódios, salvar temporadas e episódios
      if (fullItem.type === 'series' && fullItem.episodes && fullItem.episodes.length > 0) {
        const seasonId = generateUUID()
        await supabase.from('stream_series_seasons').upsert({
          id: seasonId,
          series_id: targetId,
          season_number: 1,
          title: 'Temporada 1'
        })

        for (const ep of fullItem.episodes) {
          await supabase.from('stream_episodes').upsert({
            id: ep.id && isValidUUID(ep.id) ? ep.id : generateUUID(),
            series_id: targetId,
            season_id: seasonId,
            episode_number: ep.episode_number || 1,
            title: ep.title,
            description: ep.synopsis || '',
            thumbnail_url: ep.thumbnail_url || null,
            video_url: ep.video_url || null,
            duration_minutes: ep.duration_minutes || 10,
            status: 'published'
          })
        }
      }
    } catch (e) {
      console.warn('Sync Supabase stream_contents exception:', e)
    }

    // Atualizar Storage local
    const existingIndex = list.findIndex(c => c.id === targetId || c.slug === slug)
    let updatedList: StreamContent[]
    if (existingIndex >= 0) {
      updatedList = [...list]
      updatedList[existingIndex] = fullItem
    } else {
      updatedList = [fullItem, ...list]
    }

    localStorage.setItem(STORAGE_CONTENTS_KEY, JSON.stringify(updatedList))
    await cmsService.logAdminAction('Salvar Conteúdo', 'stream_content', targetId, { title: fullItem.title, type: fullItem.type })
    return fullItem
  },

  deleteContent: async (id: string): Promise<boolean> => {
    try {
      await supabase.from('stream_contents').delete().eq('id', id)
    } catch {}

    const list = await cmsService.getContents()
    const filtered = list.filter(c => c.id !== id)
    localStorage.setItem(STORAGE_CONTENTS_KEY, JSON.stringify(filtered))
    await cmsService.logAdminAction('Excluir Conteúdo', 'stream_content', id)
    return true
  },

  duplicateContent: async (id: string): Promise<StreamContent | null> => {
    const original = await cmsService.getContentById(id)
    if (!original) return null

    const duplicateData: Partial<StreamContent> & { title: string } = {
      ...original,
      id: generateUUID(),
      title: `${original.title} (Cópia)`,
      slug: `${original.slug}-copia-${Date.now().toString().slice(-4)}`,
      status: 'draft',
      is_featured: false,
      view_count: 0
    }

    return await cmsService.saveContent(duplicateData)
  },

  publishContent: async (id: string, publish: boolean): Promise<boolean> => {
    const item = await cmsService.getContentById(id)
    if (!item) return false

    item.status = publish ? 'published' : 'draft'
    await cmsService.saveContent(item)
    return true
  },

  // -------------------------------------------------------------
  // CARROSSÉIS DA HOME DO APP
  // -------------------------------------------------------------
  getCarousels: async (): Promise<StreamCarousel[]> => {
    try {
      const { data, error } = await supabase
        .from('app_home_carousels')
        .select('*')
        .order('sort_order', { ascending: true })

      if (!error && data && data.length > 0) {
        localStorage.setItem(STORAGE_CAROUSELS_KEY, JSON.stringify(data))
        return data as StreamCarousel[]
      }
    } catch {}

    const stored = localStorage.getItem(STORAGE_CAROUSELS_KEY)
    if (stored) return JSON.parse(stored)

    localStorage.setItem(STORAGE_CAROUSELS_KEY, JSON.stringify(SEED_CAROUSELS))
    return SEED_CAROUSELS
  },

  saveCarousel: async (carousel: Partial<StreamCarousel> & { title: string }): Promise<StreamCarousel> => {
    const list = await cmsService.getCarousels()
    const targetId = carousel.id && isValidUUID(carousel.id) ? carousel.id : generateUUID()
    const slug = carousel.slug || carousel.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')

    const fullItem: StreamCarousel = {
      id: targetId,
      title: carousel.title,
      slug,
      source_type: carousel.source_type || 'category',
      filter_value: carousel.filter_value || '',
      content_ids: carousel.content_ids || [],
      sort_order: carousel.sort_order || list.length + 1,
      is_active: carousel.is_active !== undefined ? carousel.is_active : true,
      created_at: carousel.created_at || new Date().toISOString()
    }

    try {
      await supabase.from('app_home_carousels').upsert(fullItem)
    } catch {}

    const index = list.findIndex(c => c.id === targetId || c.slug === slug)
    let updatedList: StreamCarousel[]
    if (index >= 0) {
      updatedList = [...list]
      updatedList[index] = fullItem
    } else {
      updatedList = [...list, fullItem]
    }

    localStorage.setItem(STORAGE_CAROUSELS_KEY, JSON.stringify(updatedList))
    await cmsService.logAdminAction('Salvar Carrossel', 'home_carousel', targetId, { title: fullItem.title })
    return fullItem
  },

  deleteCarousel: async (id: string): Promise<boolean> => {
    try {
      await supabase.from('app_home_carousels').delete().eq('id', id)
    } catch {}

    const list = await cmsService.getCarousels()
    const filtered = list.filter(c => c.id !== id)
    localStorage.setItem(STORAGE_CAROUSELS_KEY, JSON.stringify(filtered))
    await cmsService.logAdminAction('Excluir Carrossel', 'home_carousel', id)
    return true
  },

  // -------------------------------------------------------------
  // HERO DA HOME DO APP
  // -------------------------------------------------------------
  getHomeConfig: async (): Promise<AppHomeConfig> => {
    try {
      const { data, error } = await supabase
        .from('app_home_config')
        .select('*')
        .limit(1)
        .maybeSingle()

      if (!error && data) {
        localStorage.setItem(STORAGE_HOME_KEY, JSON.stringify(data))
        return data as AppHomeConfig
      }
    } catch {}

    const stored = localStorage.getItem(STORAGE_HOME_KEY)
    if (stored) return JSON.parse(stored)

    const defaultHero: AppHomeConfig = {
      hero_title: 'Com Deus Kids Play',
      hero_subtitle: 'Conteúdo bíblico infantil de excelência para todas as famílias, igrejas e escolas.',
      hero_banner_url: '/banners/arca_noe_banner.jpg',
      is_active: true
    }
    return defaultHero
  },

  saveHomeConfig: async (config: AppHomeConfig): Promise<AppHomeConfig> => {
    try {
      const targetId = config.id && isValidUUID(config.id) ? config.id : generateUUID()
      const payload = {
        ...config,
        id: targetId,
        updated_at: new Date().toISOString()
      }
      await supabase.from('app_home_config').upsert(payload)
      config.id = targetId
    } catch (e) {
      console.warn('saveHomeConfig error:', e)
    }

    localStorage.setItem(STORAGE_HOME_KEY, JSON.stringify(config))
    await cmsService.logAdminAction('Atualizar Hero da Home', 'app_home_config', 'hero', config)
    return config
  },

  // -------------------------------------------------------------
  // BIBLIOTECA DE AVATARES (public.avatars)
  // -------------------------------------------------------------
  getAvatars: async (includeInactive = false): Promise<DBAvatar[]> => {
    try {
      let query = supabase.from('avatars').select('*').order('sort_order', { ascending: true })
      if (!includeInactive) {
        query = query.eq('is_active', true)
      }
      const { data, error } = await query
      if (!error && data && data.length > 0) {
        localStorage.setItem(STORAGE_AVATARS_KEY, JSON.stringify(data))
        return data as DBAvatar[]
      }
    } catch {}

    const stored = localStorage.getItem(STORAGE_AVATARS_KEY)
    return stored ? JSON.parse(stored) : []
  },

  saveAvatar: async (avatar: DBAvatar): Promise<DBAvatar> => {
    const now = new Date().toISOString()
    const payload = {
      ...avatar,
      updated_at: now
    }
    try {
      await supabase.from('avatars').upsert(payload)
    } catch (e) {
      console.warn('saveAvatar error:', e)
    }

    const list = await cmsService.getAvatars(true)
    const index = list.findIndex(a => a.id === avatar.id)
    let updated: DBAvatar[]
    if (index >= 0) {
      updated = [...list]
      updated[index] = payload
    } else {
      updated = [...list, payload]
    }
    localStorage.setItem(STORAGE_AVATARS_KEY, JSON.stringify(updated))
    await cmsService.logAdminAction('Salvar Avatar', 'avatar', avatar.id, { name: avatar.name })
    return payload
  },

  toggleAvatarActive: async (id: string, isActive: boolean): Promise<boolean> => {
    try {
      await supabase.from('avatars').update({ is_active: isActive, updated_at: new Date().toISOString() }).eq('id', id)
    } catch {}
    const list = await cmsService.getAvatars(true)
    const found = list.find(a => a.id === id)
    if (found) {
      found.is_active = isActive
      localStorage.setItem(STORAGE_AVATARS_KEY, JSON.stringify(list))
    }
    return true
  },

  deleteAvatar: async (id: string): Promise<boolean> => {
    try {
      await supabase.from('avatars').delete().eq('id', id)
    } catch {}
    const list = await cmsService.getAvatars(true)
    const filtered = list.filter(a => a.id !== id)
    localStorage.setItem(STORAGE_AVATARS_KEY, JSON.stringify(filtered))
    await cmsService.logAdminAction('Excluir Avatar', 'avatar', id)
    return true
  },

  // -------------------------------------------------------------
  // PLANOS & PREÇOS CANÔNICOS (public.plans & public.prices)
  // -------------------------------------------------------------
  getPlansConfig: async (): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*, prices(*)')
        .order('sort_order', { ascending: true })

      if (!error && data && data.length > 0) {
        localStorage.setItem(STORAGE_PLANS_KEY, JSON.stringify(data))
        return data
      }
    } catch {}

    const stored = localStorage.getItem(STORAGE_PLANS_KEY)
    if (stored) return JSON.parse(stored)

    return []
  },

  savePlanConfig: async (plan: any): Promise<any> => {
    try {
      const { error: planErr } = await supabase.from('plans').upsert({
        id: plan.id,
        name: plan.name,
        slug: plan.slug,
        description: plan.description,
        target_role: plan.target_role || plan.target_audience || 'parent',
        target_audience: plan.target_audience || 'family',
        price_monthly: plan.price_monthly,
        price_yearly: plan.price_yearly,
        max_users: plan.max_users,
        includes_all: plan.includes_all !== undefined ? plan.includes_all : true,
        status: plan.status || 'active',
        cta_text: plan.cta_text || 'Assinar Agora',
        is_featured: plan.is_featured || false,
        sort_order: plan.sort_order || 0,
        updated_at: new Date().toISOString()
      })
      if (planErr) console.error('Error saving plan to Supabase:', planErr)

      // Atualizar prices se fornecidos
      if (plan.price_monthly !== undefined) {
        await supabase.from('prices')
          .update({ amount_cents: Math.round(plan.price_monthly * 100), updated_at: new Date().toISOString() })
          .eq('plan_id', plan.id)
          .eq('billing_cycle', 'monthly')
      }
      if (plan.price_yearly !== undefined) {
        await supabase.from('prices')
          .update({ amount_cents: Math.round(plan.price_yearly * 100), updated_at: new Date().toISOString() })
          .eq('plan_id', plan.id)
          .eq('billing_cycle', 'yearly')
      }
    } catch (e) {
      console.warn('savePlanConfig Supabase error:', e)
    }

    const list = await cmsService.getPlansConfig()
    const index = list.findIndex(p => p.id === plan.id)
    let updated: any[]
    if (index >= 0) {
      updated = [...list]
      updated[index] = plan
    } else {
      updated = [...list, plan]
    }
    localStorage.setItem(STORAGE_PLANS_KEY, JSON.stringify(updated))
    await cmsService.logAdminAction('Atualizar Plano', 'plan', plan.id, { name: plan.name, price_monthly: plan.price_monthly })
    return plan
  },

  // -------------------------------------------------------------
  // LOGS ADMINISTRATIVOS
  // -------------------------------------------------------------
  getAdminLogs: async (): Promise<AdminActivityLog[]> => {
    const stored = localStorage.getItem(STORAGE_LOGS_KEY)
    return stored ? JSON.parse(stored) : []
  },

  logAdminAction: async (action: string, entityType: string, entityId?: string, details?: Record<string, any>) => {
    const log: AdminActivityLog = {
      id: `log_${Date.now()}`,
      admin_email: 'admin@comdeuskids.com.br',
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
      created_at: new Date().toISOString()
    }

    try {
      await supabase.from('admin_activity_logs').insert(log)
    } catch {}

    const stored = localStorage.getItem(STORAGE_LOGS_KEY)
    const list: AdminActivityLog[] = stored ? JSON.parse(stored) : []
    const updated = [log, ...list].slice(0, 100)
    localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(updated))
  }
}

function applyFilters(list: StreamContent[], filters?: {
  type?: string
  status?: string
  category?: string
  search?: string
}): StreamContent[] {
  if (!filters) return list

  return list.filter(item => {
    if (filters.type && filters.type !== 'all' && item.type !== filters.type) return false
    if (filters.status && filters.status !== 'all' && item.status !== filters.status) return false
    if (filters.category && filters.category !== 'all' && item.category !== filters.category) return false
    if (filters.search && filters.search.trim() !== '') {
      const q = filters.search.toLowerCase()
      const inTitle = item.title.toLowerCase().includes(q)
      const inDesc = item.description?.toLowerCase().includes(q)
      if (!inTitle && !inDesc) return false
    }
    return true
  })
}
