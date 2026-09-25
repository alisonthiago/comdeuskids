// ============================================================
// COM DEUS KIDS — Types Compartilhados
// ============================================================

export type UserRole = 'admin' | 'parent' | 'church' | 'school'

export type ProductStatus = 'draft' | 'published' | 'archived'

export type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'refunded'

export type PaymentMethod = 'pix' | 'credit_card' | 'boleto'

export interface Profile {
  id: string
  email: string
  full_name?: string | null
  avatar_url?: string | null
  phone?: string | null
  role: UserRole
  organization_name?: string | null
  organization_doc?: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
  icon?: string | null
  cover_url?: string | null
  sort_order: number
  active?: boolean
  show_in_site?: boolean
  show_in_menu?: boolean
  show_in_footer?: boolean
  show_in_home?: boolean
  status?: 'draft' | 'active' | 'archived'
  meta_title?: string | null
  meta_description?: string | null
  metadata?: Record<string, any>
  products_count?: number
  created_at: string
  updated_at?: string
}

export interface Collection {
  id: string
  name: string
  slug: string
  description?: string | null
  cover_url?: string | null
  banner_url?: string | null
  sort_order: number
  active?: boolean
  status?: 'draft' | 'active' | 'archived'
  meta_title?: string | null
  meta_description?: string | null
  metadata?: Record<string, any>
  products_count?: number
  created_at: string
  updated_at?: string
}

export interface Theme {
  id: string
  name: string
  slug: string
  description?: string | null
  sort_order?: number
  active?: boolean
  products_count?: number
  created_at: string
  updated_at?: string
}

export interface Product {
  id: string
  title: string
  slug: string
  description: string
  price: number
  sale_price?: number | null
  category_id?: string | null
  cover_image_url?: string | null
  preview_images?: string[]
  age_range?: string | null
  total_pages?: number | null
  status: ProductStatus
  is_featured: boolean
  is_free: boolean
  created_at: string
  updated_at: string
  category?: Category
  themes?: Theme[]
}

export interface ProductFile {
  id: string
  product_id: string
  file_name: string
  file_path: string
  file_size_bytes?: number | null
  mime_type: string
  page_count?: number | null
  version: string
  created_at: string
}

export interface Order {
  id: string
  user_id: string
  order_number: string
  status: OrderStatus
  total_amount: number
  payment_method?: PaymentMethod | null
  payment_gateway?: string | null
  payment_id?: string | null
  paid_at?: string | null
  created_at: string
  updated_at: string
  items?: OrderItem[]
  profile?: Profile
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  title: string
  price: number
  product?: Product
}

export interface Entitlement {
  id: string
  user_id: string
  product_id: string
  order_id?: string | null
  plan_id?: string | null
  access_type: 'purchase' | 'subscription' | 'free' | 'gift'
  valid_until?: string | null
  created_at: string
  product?: Product
}

export interface Plan {
  id: string
  name: string
  slug: string
  description: string
  price: number
  interval: 'monthly' | 'yearly'
  target_audience: 'family' | 'church' | 'school'
  features: string[]
  is_active: boolean
  created_at: string
}

export type ProfileRoleType = 'kid' | 'parent' | 'teacher' | 'leader'

export interface AccountProfile {
  id: string
  user_id: string
  name: string
  avatar_url: string
  profile_type: ProfileRoleType
  age?: number | null
  pin?: string | null
  pin_hash?: string | null
  pin_failed_attempts?: number
  pin_locked_until?: string | null
  timezone?: string | null
  daily_limit_minutes?: number | null
  bedtime_hour?: string | null
  allowed_start_time?: string | null
  allowed_end_time?: string | null
  allowed_days?: string[]
  is_paused?: boolean
  paused_until?: string | null
  strict_educational_only?: boolean
  child_id?: string | null
  created_at: string
  updated_at: string
}


export interface WatchProgress {
  id?: string
  profile_id: string
  content_id: string
  content_title?: string | null
  content_thumbnail?: string | null
  content_type?: string
  progress_seconds: number
  duration_seconds: number
  completed: boolean
  updated_at?: string
  series_id?: string
  series_title?: string
  season_number?: number
  episode_id?: string
  episode_number?: number
  episode_title?: string
}

export interface StreamEpisode {
  id: string
  episode_number: number
  season_number?: number
  title: string
  duration_minutes: number
  thumbnail_url: string
  synopsis: string
  video_url: string
  subtitle_tracks?: StreamSubtitleTrack[]
  progress_seconds?: number
  completed?: boolean
}

export interface StreamSubtitleTrack {
  label: string
  src: string
  srclang: string
  default?: boolean
}

export interface StreamSeason {
  id: string
  season_number: number
  title: string
  episodes: StreamEpisode[]
}

export interface StreamQuizItem {
  question: string
  options: string[]
  correct_index: number
  explanation?: string
}

export type StreamContentType =
  | 'movie'
  | 'series'
  | 'episode'
  | 'video'
  | 'story'
  | 'drawing'
  | 'song'
  | 'clip'
  | 'lesson'
  | 'quiz'
  | 'activity'

export type ContentStatus = 'draft' | 'published' | 'scheduled' | 'archived'

export interface StreamContent {
  id: string
  title: string
  slug: string
  description: string
  full_description?: string
  type: StreamContentType
  category: string
  category_id?: string
  tags?: string[]
  thumbnail_url: string
  banner_url?: string
  video_url?: string
  audio_url?: string
  trailer_url?: string
  subtitle_tracks?: StreamSubtitleTrack[]
  duration_minutes?: number
  age_range?: string
  is_featured?: boolean
  is_new?: boolean
  season_count?: number
  seasons?: StreamSeason[]
  episodes?: StreamEpisode[]
  related_pdf_id?: string
  related_pdf_title?: string
  related_pdf_pages?: number
  scripture_verse?: string
  devotional_text?: string
  quiz?: StreamQuizItem[]
  access_type?: 'free' | 'subscription' | 'individual'
  access_class?: 'general' | 'educational'
  allowed_plans?: string[]
  status?: ContentStatus
  view_count?: number
  sort_order?: number
  created_at?: string
  updated_at?: string
  metadata?: {
    characters?: string[]
    bible_reference?: string
    testament?: 'old' | 'new'
    bible_book?: string
    related_content_ids?: string[]
    artist?: string
    album?: string
    lyrics?: string
    pdf_url?: string
    pdf_cover_url?: string
    page_count?: number
  }
}

export interface StreamCarousel {
  id: string
  title: string
  slug: string
  source_type: 'category' | 'type' | 'manual' | 'new' | 'featured'
  filter_value?: string
  content_ids?: string[]
  sort_order: number
  is_active: boolean
  created_at?: string
}

export interface AppHomeConfig {
  id?: string
  hero_content_id?: string
  hero_title?: string
  hero_subtitle?: string
  hero_banner_url?: string
  is_active: boolean
  updated_at?: string
}

export interface AccountMember {
  id: string
  organization_id: string
  user_id?: string | null
  email: string
  full_name: string
  role: 'teacher' | 'leader' | 'admin' | 'member'
  status: 'active' | 'invited' | 'suspended'
  created_at: string
}

export interface AdminActivityLog {
  id: string
  admin_email: string
  action: string
  entity_type: string
  entity_id?: string
  details?: Record<string, any>
  created_at: string
}

export interface CMSPlanConfig {
  id: string
  name: string
  slug: string
  target_audience: 'family' | 'church' | 'school'
  price: number
  interval: 'monthly' | 'yearly'
  status: 'active' | 'archived'
  max_profiles: number
  max_members: number
  max_concurrent_streams: number
  allowed_features: {
    movies: boolean
    series: boolean
    videos: boolean
    songs: boolean
    clips: boolean
    lessons: boolean
    quizzes: boolean
    pdfs: boolean
    downloads: boolean
  }
}

// ============================================================
// FASE 1: Core de Identidade Infantil & Multi-Tenant
// ============================================================

export interface Child {
  id: string
  first_name: string
  last_name?: string | null
  birth_date?: string | null
  gender?: 'male' | 'female' | 'unspecified' | null
  avatar_url?: string | null
  is_active: boolean
  archived_at?: string | null
  created_at: string
  updated_at: string
}

export interface Guardian {
  id: string
  user_id?: string | null
  full_name: string
  phone?: string | null
  email?: string | null
  photo_url?: string | null
  document_id?: string | null
  is_active: boolean
  archived_at?: string | null
  created_at: string
  updated_at: string
}

export interface ChildGuardian {
  id: string
  child_id: string
  guardian_id: string
  kinship: string
  is_primary: boolean
  is_financial_responsible: boolean
  can_pickup: boolean
  can_authorize_pickup: boolean
  emergency_priority: number
  notification_preferences?: {
    whatsapp?: boolean
    email?: boolean
    push?: boolean
  }
  created_at: string
  child?: Child
  guardian?: Guardian
}

export type OrganizationType = 'church' | 'school' | 'ministry' | 'independent_teacher'

export interface Organization {
  id: string
  name: string
  slug: string
  type: OrganizationType
  document?: string | null
  phone?: string | null
  email?: string | null
  owner_id: string
  settings?: Record<string, any>
  is_active: boolean
  archived_at?: string | null
  created_at: string
  updated_at: string
}

export type OrganizationRole = 'owner' | 'admin' | 'coordinator' | 'teacher' | 'reception' | 'transport'

export interface OrganizationMember {
  id: string
  organization_id: string
  user_id: string
  role: OrganizationRole
  custom_capabilities?: string[]
  is_active: boolean
  created_at: string
  updated_at: string
  organization?: Organization
}

export interface OrganizationStudent {
  id: string
  organization_id: string
  child_id: string
  enrollment_code?: string | null
  status: 'active' | 'inactive' | 'transferred' | 'archived'
  enrolled_at: string
  archived_at?: string | null
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
  child?: Child
  organization?: Organization
}

export interface ChildCareNote {
  id: string
  child_id: string
  note_type: 'allergy' | 'dietary' | 'medical' | 'special_support' | 'general'
  description: string
  severity?: 'low' | 'medium' | 'critical' | null
  is_active: boolean
  created_by?: string | null
  created_at: string
  updated_at: string
}

export type ActiveContextType = 'play' | 'family' | 'teacher' | 'church' | 'school' | 'admin'

export interface ActiveContext {
  type: ActiveContextType
  label: string
  organizationId?: string | null
  role?: string | null
  iconName?: string
}

// ============================================================
// FASE 2: Central da Família, Tempo de Tela & Controle Parental
// ============================================================

export type UsageSessionType = 'video' | 'game' | 'quiz' | 'general'

export interface ProfileUsageSession {
  id: string
  profile_id: string
  user_id: string
  device_session_id: string
  usage_date: string
  started_at: string
  last_heartbeat_at: string
  ended_at?: string | null
  active_seconds: number
  usage_type: UsageSessionType
  content_id?: string | null
  created_at: string
  updated_at: string
}

export type ParentalBlockReason =
  | 'MANUAL_PAUSED'
  | 'TEMPORARY_PAUSED'
  | 'BEDTIME_WINDOW'
  | 'DAY_NOT_ALLOWED'
  | 'DAILY_LIMIT_REACHED'
  | 'EDUCATIONAL_ONLY_RESTRICTION'

export interface ParentalPolicyResult {
  allowed: boolean
  reason?: ParentalBlockReason
  message?: string
  remainingSeconds?: number | null
  educationalOnly: boolean
  effectivePaused: boolean
  isBedtime: boolean
  isDayAllowed: boolean
  limitReached: boolean
}


