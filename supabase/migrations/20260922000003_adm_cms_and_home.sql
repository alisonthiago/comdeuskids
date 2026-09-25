-- ============================================================
-- COM DEUS KIDS — ADM CMS, Streaming Home, Quizzes & Organizações
-- ============================================================

-- 1. Tabela Principal de Conteúdos de Streaming
CREATE TABLE IF NOT EXISTS public.stream_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  full_description TEXT,
  type TEXT NOT NULL DEFAULT 'video' CHECK (type IN ('movie', 'series', 'episode', 'video', 'story', 'drawing', 'song', 'clip', 'lesson')),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  category_name TEXT,
  age_rating TEXT DEFAULT 'Livre',
  tags TEXT[] DEFAULT '{}',
  thumbnail_url TEXT,
  banner_url TEXT,
  video_url TEXT,
  audio_url TEXT,
  trailer_url TEXT,
  duration_minutes INTEGER DEFAULT 0,
  scripture_verse TEXT,
  devotional_text TEXT,
  related_product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  related_quiz_id UUID,
  access_type TEXT DEFAULT 'subscription' CHECK (access_type IN ('free', 'subscription', 'individual')),
  allowed_plans TEXT[] DEFAULT '{"family", "church", "school"}',
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
  is_featured BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.stream_contents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura pública de conteúdos publicados"
  ON public.stream_contents
  FOR SELECT
  USING (status = 'published' OR auth.role() = 'authenticated');

CREATE POLICY "Administradores gerenciam conteúdos"
  ON public.stream_contents
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 2. Temporadas de Séries
CREATE TABLE IF NOT EXISTS public.stream_series_seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID NOT NULL REFERENCES public.stream_contents(id) ON DELETE CASCADE,
  season_number INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL DEFAULT 'Temporada 1',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.stream_series_seasons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura de temporadas" ON public.stream_series_seasons FOR SELECT USING (true);
CREATE POLICY "Gestão de temporadas" ON public.stream_series_seasons FOR ALL USING (true) WITH CHECK (true);

-- 3. Episódios de Séries
CREATE TABLE IF NOT EXISTS public.stream_episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID NOT NULL REFERENCES public.stream_contents(id) ON DELETE CASCADE,
  season_id UUID REFERENCES public.stream_series_seasons(id) ON DELETE CASCADE,
  episode_number INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  video_url TEXT,
  duration_minutes INTEGER DEFAULT 0,
  age_rating TEXT DEFAULT 'Livre',
  scripture_verse TEXT,
  devotional_text TEXT,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.stream_episodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura de episódios" ON public.stream_episodes FOR SELECT USING (true);
CREATE POLICY "Gestão de episódios" ON public.stream_episodes FOR ALL USING (true) WITH CHECK (true);

-- 4. Quizzes
CREATE TABLE IF NOT EXISTS public.stream_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES public.stream_contents(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.stream_quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura de quizzes" ON public.stream_quizzes FOR SELECT USING (true);
CREATE POLICY "Gestão de quizzes" ON public.stream_quizzes FOR ALL USING (true) WITH CHECK (true);

-- 5. Perguntas de Quiz
CREATE TABLE IF NOT EXISTS public.stream_quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.stream_quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_index INTEGER NOT NULL DEFAULT 0,
  explanation TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.stream_quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura de perguntas" ON public.stream_quiz_questions FOR SELECT USING (true);
CREATE POLICY "Gestão de perguntas" ON public.stream_quiz_questions FOR ALL USING (true) WITH CHECK (true);

-- 6. Configuração do Hero da Home do APP
CREATE TABLE IF NOT EXISTS public.app_home_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_content_id UUID REFERENCES public.stream_contents(id) ON DELETE SET NULL,
  hero_title TEXT,
  hero_subtitle TEXT,
  hero_banner_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.app_home_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura do hero" ON public.app_home_config FOR SELECT USING (true);
CREATE POLICY "Gestão do hero" ON public.app_home_config FOR ALL USING (true) WITH CHECK (true);

-- 7. Carrosséis Dinâmicos da Home do APP
CREATE TABLE IF NOT EXISTS public.app_home_carousels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  source_type TEXT NOT NULL DEFAULT 'category' CHECK (source_type IN ('category', 'type', 'manual', 'new', 'featured')),
  filter_value TEXT,
  content_ids UUID[] DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.app_home_carousels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura de carrosséis" ON public.app_home_carousels FOR SELECT USING (true);
CREATE POLICY "Gestão de carrosséis" ON public.app_home_carousels FOR ALL USING (true) WITH CHECK (true);

-- 8. Membros da Organização (Professores de Escola e Líderes de Igreja com login próprio)
CREATE TABLE IF NOT EXISTS public.account_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'teacher' CHECK (role IN ('teacher', 'leader', 'admin', 'member')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.account_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gestão de membros da conta" ON public.account_members FOR ALL USING (true) WITH CHECK (true);

-- 9. Logs de Ações Administrativas
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso a logs" ON public.admin_activity_logs FOR ALL USING (true) WITH CHECK (true);
