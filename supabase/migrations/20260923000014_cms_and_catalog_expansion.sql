-- ==============================================================================
-- COM DEUS KIDS — FASE 12: CONTEÚDO REAL, CATÁLOGO, CMS, PLANOS & AVATARES
-- Migration: 20260923000014_cms_and_catalog_expansion.sql
-- ==============================================================================

-- 1. TABELA DE AVATARES ADMINISTRÁVEIS (Biblioteca de Avatares dos Perfis Infantis)
CREATE TABLE IF NOT EXISTS public.avatars (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  subtitle TEXT,
  category TEXT NOT NULL DEFAULT 'heroes' CHECK (category IN ('heroes', 'teachers', 'animals', 'biblical')),
  role TEXT NOT NULL DEFAULT 'kid' CHECK (role IN ('kid', 'parent', 'teacher', 'leader', 'all')),
  image_url TEXT NOT NULL,
  bg_gradient TEXT,
  icon_emoji TEXT,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.avatars ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura pública de avatares ativos" ON public.avatars;
CREATE POLICY "Leitura pública de avatares ativos"
  ON public.avatars FOR SELECT
  USING (is_active = TRUE OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Administradores gerenciam avatares" ON public.avatars;
CREATE POLICY "Administradores gerenciam avatares"
  ON public.avatars FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- SEED INICIAL DE AVATARES OFICIAIS DO COM DEUS KIDS
INSERT INTO public.avatars (id, name, subtitle, category, role, image_url, bg_gradient, icon_emoji, description, sort_order)
VALUES
  ('davi', 'Davi', 'Pastorzinho', 'heroes', 'kid', '/avatars/davi.png', 'linear-gradient(135deg, #f59e0b, #d97706)', '👦', 'Corajoso pastorzinho que confia no Senhor', 1),
  ('sara', 'Sara', 'Com Florzinha', 'heroes', 'kid', '/avatars/sara.png', 'linear-gradient(135deg, #ec4899, #be185d)', '👧', 'Menina cheia de fé e alegria', 2),
  ('noe', 'Noé', 'Com Túnica', 'heroes', 'kid', '/avatars/noe.png', 'linear-gradient(135deg, #10b981, #047857)', '⛵', 'Amigo dos animais e obediente a Deus', 3),
  ('ester', 'Ester', 'Diadema Dourado', 'heroes', 'kid', '/avatars/ester.png', 'linear-gradient(135deg, #8b5cf6, #6d28d9)', '👑', 'Rainha sábia e cheia de graça', 4),
  ('daniel', 'Daniel', 'Amigo dos Leões', 'heroes', 'kid', '/avatars/daniel.png', 'linear-gradient(135deg, #3b82f6, #1d4ed8)', '🦁', 'Jovem fiel em oração', 5),
  ('ovelhinha', 'Ovelhinha', 'Do Bom Pastor', 'animals', 'kid', '/avatars/ovelhinha.png', 'linear-gradient(135deg, #f1f5f9, #cbd5e1)', '🐑', 'A ovelha que ouve a voz do pastor', 6),
  ('leaozinho', 'Leãozinho', 'Da Tribo de Judá', 'animals', 'kid', '/avatars/leaozinho.png', 'linear-gradient(135deg, #f97316, #c2410c)', '🦁', 'Forte e corajoso no Senhor', 7),
  ('pombinha', 'Pombinha', 'Da Paz', 'animals', 'kid', '/avatars/pombinha.png', 'linear-gradient(135deg, #06b6d4, #0891b2)', '🕊️', 'Símbolo da paz e do Espírito Santo', 8)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  subtitle = EXCLUDED.subtitle,
  image_url = EXCLUDED.image_url,
  bg_gradient = EXCLUDED.bg_gradient,
  icon_emoji = EXCLUDED.icon_emoji,
  sort_order = EXCLUDED.sort_order;

-- 2. EXPANSÃO DE TIPOS E CAMPOS EM stream_contents
DO $$
BEGIN
  -- Remover restrição antiga de tipos para suportar o catálogo completo
  ALTER TABLE public.stream_contents DROP CONSTRAINT IF EXISTS stream_contents_type_check;

  -- Adicionar nova restrição ampla de tipos canônicos
  ALTER TABLE public.stream_contents ADD CONSTRAINT stream_contents_type_check 
    CHECK (type IN ('movie', 'series', 'episode', 'video', 'story', 'drawing', 'song', 'music', 'clip', 'lesson', 'devotional', 'quiz', 'game', 'pdf', 'activity', 'coloring'));

  -- Adicionar colunas complementares se não existirem
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stream_contents' AND column_name = 'age_range') THEN
    ALTER TABLE public.stream_contents ADD COLUMN age_range TEXT DEFAULT 'Livre';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stream_contents' AND column_name = 'publish_at') THEN
    ALTER TABLE public.stream_contents ADD COLUMN publish_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stream_contents' AND column_name = 'unpublish_at') THEN
    ALTER TABLE public.stream_contents ADD COLUMN unpublish_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stream_contents' AND column_name = 'season_count') THEN
    ALTER TABLE public.stream_contents ADD COLUMN season_count INTEGER DEFAULT 1;
  END IF;
END $$;

-- 3. EXPANSÃO DE CAMPOS EM plans (Editor de Planos Comerciais)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plans' AND column_name = 'cta_text') THEN
    ALTER TABLE public.plans ADD COLUMN cta_text TEXT DEFAULT 'Assinar Agora';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plans' AND column_name = 'is_featured') THEN
    ALTER TABLE public.plans ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plans' AND column_name = 'target_audience') THEN
    ALTER TABLE public.plans ADD COLUMN target_audience TEXT DEFAULT 'family';
  END IF;
END $$;

-- Permitir gerenciamento de plans e prices por autenticados (ADM)
DROP POLICY IF EXISTS "Leitura pública de planos ativos" ON public.plans;
CREATE POLICY "Leitura pública de planos ativos" ON public.plans FOR SELECT USING (true);

DROP POLICY IF EXISTS "Gestão de planos por autenticados" ON public.plans;
CREATE POLICY "Gestão de planos por autenticados" ON public.plans FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Leitura pública de preços" ON public.prices;
CREATE POLICY "Leitura pública de preços" ON public.prices FOR SELECT USING (true);

DROP POLICY IF EXISTS "Gestão de preços por autenticados" ON public.prices;
CREATE POLICY "Gestão de preços por autenticados" ON public.prices FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. SEED DE FILEIRAS EDITORIAIS DA HOME (app_home_carousels)
INSERT INTO public.app_home_carousels (title, slug, source_type, filter_value, sort_order, is_active)
VALUES
  ('Destaques da Semana', 'destaques', 'featured', NULL, 1, TRUE),
  ('Histórias da Bíblia', 'historias-da-biblia', 'category', 'Histórias Bíblicas', 2, TRUE),
  ('Séries Animadas CDK', 'series-cdk', 'type', 'series', 3, TRUE),
  ('Clipes & Músicas', 'clipes-musicas', 'category', 'Clipes & Músicas', 4, TRUE),
  ('Aprendendo com Jesus', 'aprendendo-com-jesus', 'category', 'Aprendendo com Jesus', 5, TRUE)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  source_type = EXCLUDED.source_type,
  filter_value = EXCLUDED.filter_value,
  sort_order = EXCLUDED.sort_order;
