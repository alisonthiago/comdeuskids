import { supabase } from '@comdeuskids/supabase'
import { StreamContent, StreamCarousel, AppHomeConfig } from '@comdeuskids/types'
import { STREAM_CATALOG } from '../data/streamCatalog'

const STORAGE_CONTENTS_KEY = 'cdk_cms_contents'
const STORAGE_CAROUSELS_KEY = 'cdk_cms_carousels'
const STORAGE_HOME_KEY = 'cdk_cms_home'

export const cmsClient = {
  getContents: async (): Promise<StreamContent[]> => {
    try {
      const { data, error } = await supabase
        .from('stream_contents')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      if (!error && data && data.length > 0) {
        return data as StreamContent[]
      }
    } catch {}

    const stored = localStorage.getItem(STORAGE_CONTENTS_KEY)
    if (stored) {
      const parsed: StreamContent[] = JSON.parse(stored)
      const published = parsed.filter(c => c.status === 'published' || c.status === undefined)
      if (published.length > 0) return published
    }

    return STREAM_CATALOG
  },

  getHomeConfig: async (): Promise<AppHomeConfig> => {
    try {
      const { data, error } = await supabase
        .from('app_home_config')
        .select('*')
        .eq('is_active', true)
        .limit(1)
        .single()

      if (!error && data) return data as AppHomeConfig
    } catch {}

    const stored = localStorage.getItem(STORAGE_HOME_KEY)
    if (stored) return JSON.parse(stored)

    return {
      hero_content_id: 'davi-golias',
      hero_title: 'Davi e Golias: A Força da Fé',
      hero_subtitle: 'Com apenas pedras e uma funda, o jovem pastor Davi enfrenta o gigante guerreiro Golias.',
      hero_banner_url: '/banners/hero_davi_golias.jpg',
      is_active: true
    }
  },

  getCarousels: async (): Promise<StreamCarousel[]> => {
    try {
      const { data, error } = await supabase
        .from('app_home_carousels')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (!error && data && data.length > 0) return data as StreamCarousel[]
    } catch {}

    const stored = localStorage.getItem(STORAGE_CAROUSELS_KEY)
    if (stored) {
      const parsed: StreamCarousel[] = JSON.parse(stored)
      const active = parsed.filter(c => c.is_active)
      if (active.length > 0) return active
    }

    return [
      {
        id: 'car-historias',
        title: 'Histórias da Bíblia',
        slug: 'historias-da-biblia',
        source_type: 'category',
        filter_value: 'Histórias Bíblicas',
        sort_order: 1,
        is_active: true
      },
      {
        id: 'car-jesus',
        title: 'Aprendendo com Jesus',
        slug: 'aprendendo-com-jesus',
        source_type: 'category',
        filter_value: 'Aprendendo com Jesus',
        sort_order: 2,
        is_active: true
      },
      {
        id: 'car-series',
        title: 'Séries Animadas CDK',
        slug: 'series-cdk',
        source_type: 'type',
        filter_value: 'series',
        sort_order: 3,
        is_active: true
      },
      {
        id: 'car-clipes',
        title: 'Clipes & Músicas para Crianças',
        slug: 'clipes-musicas',
        source_type: 'category',
        filter_value: 'Clipes & Músicas',
        sort_order: 4,
        is_active: true
      }
    ]
  },

  getAvatars: async () => {
    try {
      const { data, error } = await supabase
        .from('avatars')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (!error && data && data.length > 0) {
        return data.map(a => ({
          id: a.id,
          name: a.name,
          subtitle: a.subtitle || '',
          category: a.category,
          role: a.role,
          image_url: a.image_url,
          bgGradient: a.bg_gradient || 'linear-gradient(135deg, #16a34a, #22c55e)',
          iconEmoji: a.icon_emoji || '⭐',
          description: a.description || ''
        }))
      }
    } catch {}

    return null
  }
}

