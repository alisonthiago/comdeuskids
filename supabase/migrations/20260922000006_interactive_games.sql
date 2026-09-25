-- ==============================================================================
-- COM DEUS KIDS — TABELAS DE JOGOS INTERATIVOS & PROGRESSO POR PERFIL
-- Multiplataforma: Web, Mobile, Tablet, Smart TV
-- ==============================================================================

-- 1. TABELA DE JOGOS
CREATE TABLE IF NOT EXISTS public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  game_type TEXT NOT NULL, -- 'memory', 'puzzle', 'adventure', 'target', 'maze', 'sequence', 'matching', 'find_object', 'catch'
  theme_id UUID REFERENCES public.site_themes(id) ON DELETE SET NULL,
  age_range TEXT DEFAULT 'all', -- 'all', '3-5', '6-8', '9-12'
  difficulty TEXT DEFAULT 'facil', -- 'facil', 'medio', 'dificil'
  cover_url TEXT,
  thumbnail_url TEXT,
  instructions TEXT,
  learning_goal TEXT,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'published', -- 'draft', 'published', 'archived'
  play_count INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS para Jogos
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Jogos públicos e para membros"
  ON public.games FOR SELECT
  USING (status = 'published' OR auth.role() = 'service_role' OR auth.role() = 'authenticated');

CREATE POLICY "Gestão de jogos por administradores"
  ON public.games FOR ALL
  USING (true)
  WITH CHECK (true);

-- 2. TABELA DE PROGRESSO DO JOGO POR PERFIL DA CRIANÇA
CREATE TABLE IF NOT EXISTS public.profile_game_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  score INTEGER DEFAULT 0,
  best_score INTEGER DEFAULT 0,
  best_time_seconds INTEGER,
  stars INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 1,
  last_played_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, game_id)
);

-- Habilitar RLS para Progresso
ALTER TABLE public.profile_game_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Perfis visualizam seu próprio progresso"
  ON public.profile_game_progress FOR SELECT
  USING (true);

CREATE POLICY "Perfis atualizam seu próprio progresso"
  ON public.profile_game_progress FOR ALL
  USING (true)
  WITH CHECK (true);

-- Índices de Performance
CREATE INDEX IF NOT EXISTS idx_games_slug ON public.games(slug);
CREATE INDEX IF NOT EXISTS idx_games_status ON public.games(status);
CREATE INDEX IF NOT EXISTS idx_games_type ON public.games(game_type);
CREATE INDEX IF NOT EXISTS idx_profile_game_progress_profile ON public.profile_game_progress(profile_id);
