-- ============================================================
-- COM DEUS KIDS — Suporte a CMS do Site Público
-- Categorias com Visibilidade, Coleções e Metadados Editoriais
-- (100% Idempotente — seguro para executar múltiplas vezes)
-- ============================================================

-- 1. Ampliar a tabela categories para controle completo do CMS
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS cover_url TEXT,
  ADD COLUMN IF NOT EXISTS show_in_site BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS show_in_menu BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS show_in_footer BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS show_in_home BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived')),
  ADD COLUMN IF NOT EXISTS meta_title TEXT,
  ADD COLUMN IF NOT EXISTS meta_description TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_categories_status ON public.categories(status);
CREATE INDEX IF NOT EXISTS idx_categories_footer ON public.categories(show_in_footer) WHERE show_in_footer = TRUE;
CREATE INDEX IF NOT EXISTS idx_categories_home   ON public.categories(show_in_home) WHERE show_in_home = TRUE;

-- 2. Tabela de Coleções Editoriais (Histórias de Jesus, Heróis da Fé, etc.)
CREATE TABLE IF NOT EXISTS public.collections (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL UNIQUE,
  slug             TEXT NOT NULL UNIQUE,
  description      TEXT,
  cover_url        TEXT,
  banner_url       TEXT,
  sort_order       INT NOT NULL DEFAULT 0,
  active           BOOLEAN NOT NULL DEFAULT TRUE,
  status           TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived')),
  meta_title       TEXT,
  meta_description TEXT,
  metadata         JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger com DROP IF EXISTS para não dar erro se já existir
DROP TRIGGER IF EXISTS trg_collections_updated_at ON public.collections;
CREATE TRIGGER trg_collections_updated_at
  BEFORE UPDATE ON public.collections
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3. Relação N:N entre Produtos e Coleções
CREATE TABLE IF NOT EXISTS public.product_collections (
  product_id    UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  sort_order    INT NOT NULL DEFAULT 0,
  PRIMARY KEY (product_id, collection_id)
);

-- 4. RLS para Coleções com DROP POLICY IF EXISTS
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_collections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "collections: leitura pública" ON public.collections;
CREATE POLICY "collections: leitura pública"
  ON public.collections FOR SELECT
  USING (active = TRUE OR public.is_admin());

DROP POLICY IF EXISTS "collections: escrita admin" ON public.collections;
CREATE POLICY "collections: escrita admin"
  ON public.collections FOR ALL
  USING (public.is_admin());

DROP POLICY IF EXISTS "product_collections: leitura pública" ON public.product_collections;
CREATE POLICY "product_collections: leitura pública"
  ON public.product_collections FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "product_collections: escrita admin" ON public.product_collections;
CREATE POLICY "product_collections: escrita admin"
  ON public.product_collections FOR ALL
  USING (public.is_admin());
