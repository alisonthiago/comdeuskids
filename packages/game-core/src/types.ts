export type CanonicalAction =
  | 'LEFT'
  | 'RIGHT'
  | 'UP'
  | 'DOWN'
  | 'JUMP'
  | 'ACTION'
  | 'SECONDARY_ACTION'
  | 'PAUSE'
  | 'BACK'

export interface GameDefinition {
  id: string
  slug: string
  title: string
  description: string
  game_type: 'adventure' | 'memory' | 'puzzle' | 'sequence' | 'maze' | 'catch' | 'custom'
  age_range: 'all' | '3-5' | '6-8' | '9-12'
  difficulty: 'facil' | 'medio' | 'dificil'
  cover_url: string
  thumbnail_url?: string
  instructions: string
  learning_goal?: string
  config: Record<string, any>
  is_featured?: boolean
  status: 'draft' | 'published' | 'archived'
  play_count?: number
}

export interface ProfileGameProgress {
  id?: string
  profile_id: string
  game_id: string
  completed: boolean
  score: number
  best_score: number
  best_time_seconds?: number
  stars: number
  attempts: number
  last_played_at?: string
}

export interface AchievementItem {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  progressPercent: number
}
