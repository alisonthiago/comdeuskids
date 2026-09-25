-- ============================================================
-- COM DEUS KIDS — Schema Completo v1
-- FASE 1: Tabelas + Índices + Triggers
-- FASE 2: Auth Roles + RLS
-- ============================================================

-- ── Extensão UUID ────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Helper: auto-atualiza updated_at ────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── Helper: cria perfil automaticamente no signup ─────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'parent')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- PROFILES (extensão de auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  full_name     TEXT,
  avatar_url    TEXT,
  phone         TEXT,
  role          TEXT NOT NULL DEFAULT 'parent'
                  CHECK (role IN ('admin', 'parent', 'church', 'school')),
  -- Para igrejas/escolas
  organization_name TEXT,
  organization_doc  TEXT,  -- CNPJ
  -- Timestamps
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger: cria perfil automaticamente no signup
CREATE TRIGGER trg_auth_new_user
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- CATEGORIES (Adesivos, Calendários, Colorir, etc.)
-- ============================================================
CREATE TABLE public.categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  icon        TEXT,
  sort_order  INT NOT NULL DEFAULT 0,
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Categorias padrão
INSERT INTO public.categories (name, slug, sort_order) VALUES
  ('Adesivos',          'adesivos',          1),
  ('Calendários',       'calendarios',       2),
  ('Caça-palavras',     'caca-palavras',     3),
  ('Caligrafia',        'caligrafia',        4),
  ('Colorir',           'colorir',           5),
  ('Desenhar',          'desenhar',          6),
  ('Histórias',         'historias',         7),
  ('Jogos da Memória',  'jogos-da-memoria',  8),
  ('Jogos Interativos', 'jogos-interativos', 9),
  ('Labirintos',        'labirintos',        10),
  ('Lições',            'licoes',            11),
  ('Mapas',             'mapas',             12),
  ('Português',         'portugues',         13),
  ('Quiz',              'quiz',              14),
  ('Quebra-cabeças',    'quebra-cabecas',    15);

-- ============================================================
-- THEMES (Jesus, Noé, Natal, etc.)
-- ============================================================
CREATE TABLE public.themes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  sort_order  INT NOT NULL DEFAULT 0,
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_themes_updated_at
  BEFORE UPDATE ON public.themes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Temas padrão
INSERT INTO public.themes (name, slug, sort_order) VALUES
  ('Jesus',        'jesus',        1),
  ('Criação',      'criacao',      2),
  ('Noé',          'noe',          3),
  ('Abraão',       'abraao',       4),
  ('José',         'jose',         5),
  ('Moisés',       'moises',       6),
  ('Davi',         'davi',         7),
  ('Daniel',       'daniel',       8),
  ('Jonas',        'jonas',        9),
  ('Ester',        'ester',        10),
  ('Fé',           'fe',           11),
  ('Oração',       'oracao',       12),
  ('Amor',         'amor',         13),
  ('Perdão',       'perdao',       14),
  ('Obediência',   'obediencia',   15),
  ('Gratidão',     'gratidao',     16),
  ('Família',      'familia',      17),
  ('Natal',        'natal',        18),
  ('Páscoa',       'pascoa',       19);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE public.products (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  description      TEXT,
  short_description TEXT,
  cover_url        TEXT,         -- URL pública da capa (bucket product-covers)
  category_id      UUID NOT NULL REFERENCES public.categories(id),
  age_range        TEXT,         -- Ex: '4-6 anos', '7-10 anos', 'Todas'
  price            NUMERIC(10,2) NOT NULL DEFAULT 0,
  -- Produto gratuito ou pago
  is_free          BOOLEAN NOT NULL DEFAULT FALSE,
  status           TEXT NOT NULL DEFAULT 'draft'
                     CHECK (status IN ('draft', 'active', 'archived')),
  featured         BOOLEAN NOT NULL DEFAULT FALSE,
  published_at     TIMESTAMPTZ,
  -- SEO
  meta_title       TEXT,
  meta_description TEXT,
  -- Timestamps
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ   -- soft delete
);

CREATE INDEX idx_products_category    ON public.products(category_id);
CREATE INDEX idx_products_status      ON public.products(status);
CREATE INDEX idx_products_slug        ON public.products(slug);
CREATE INDEX idx_products_featured    ON public.products(featured) WHERE featured = TRUE;
CREATE INDEX idx_products_published   ON public.products(published_at DESC NULLS LAST);
CREATE INDEX idx_products_deleted     ON public.products(deleted_at) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- PRODUCT_THEMES (N:N — produto pode ter vários temas)
-- ============================================================
CREATE TABLE public.product_themes (
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  theme_id   UUID NOT NULL REFERENCES public.themes(id)   ON DELETE CASCADE,
  PRIMARY KEY (product_id, theme_id)
);

-- ============================================================
-- PRODUCT_FILES (arquivos digitais de cada produto)
-- ============================================================
CREATE TABLE public.product_files (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,         -- ex: 'atividade-colorir.pdf'
  display_name TEXT NOT NULL,         -- ex: 'Atividade para Colorir'
  storage_path TEXT NOT NULL,         -- path no bucket 'product-files'
  file_size    BIGINT,                -- bytes
  mime_type    TEXT NOT NULL DEFAULT 'application/pdf',
  sort_order   INT NOT NULL DEFAULT 0,
  -- Para professor / responsável (arquivo extra)
  is_teacher   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_files_product ON public.product_files(product_id);

CREATE TRIGGER trg_product_files_updated_at
  BEFORE UPDATE ON public.product_files
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- PLANS (estrutura para planos/assinaturas — regras comerciais TBD)
-- ============================================================
CREATE TABLE public.plans (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL UNIQUE,
  slug           TEXT NOT NULL UNIQUE,
  description    TEXT,
  target_role    TEXT CHECK (target_role IN ('parent', 'church', 'school', 'all')),
  price_monthly  NUMERIC(10,2),
  price_yearly   NUMERIC(10,2),
  -- Limites (NULL = ilimitado)
  max_users      INT,
  max_downloads  INT,
  -- Produtos incluídos: NULL = todos
  includes_all   BOOLEAN NOT NULL DEFAULT FALSE,
  -- Benefícios em texto (para exibição)
  benefits       JSONB,
  status         TEXT NOT NULL DEFAULT 'draft'
                   CHECK (status IN ('draft', 'active', 'archived')),
  sort_order     INT NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_plans_updated_at
  BEFORE UPDATE ON public.plans
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE public.orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id),
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'paid', 'cancelled', 'refunded', 'failed')),
  subtotal        NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount        NUMERIC(10,2) NOT NULL DEFAULT 0,
  total           NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency        TEXT NOT NULL DEFAULT 'BRL',
  coupon_code     TEXT,
  -- Metadata do cliente no momento da compra (snapshot)
  customer_email  TEXT NOT NULL,
  customer_name   TEXT,
  -- Timestamps
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id    ON public.orders(user_id);
CREATE INDEX idx_orders_status     ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- ORDER_ITEMS
-- ============================================================
CREATE TABLE public.order_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  -- Ou produto avulso, ou plano
  product_id   UUID REFERENCES public.products(id),
  plan_id      UUID REFERENCES public.plans(id),
  -- Snapshot do preço no momento da compra
  unit_price   NUMERIC(10,2) NOT NULL,
  quantity     INT NOT NULL DEFAULT 1,
  subtotal     NUMERIC(10,2) NOT NULL,
  -- Título no momento da compra (mesmo que produto seja renomeado)
  title_snapshot TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_item_has_product_or_plan
    CHECK (product_id IS NOT NULL OR plan_id IS NOT NULL)
);

CREATE INDEX idx_order_items_order   ON public.order_items(order_id);
CREATE INDEX idx_order_items_product ON public.order_items(product_id);

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE public.payments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          UUID NOT NULL REFERENCES public.orders(id),
  gateway           TEXT NOT NULL DEFAULT 'pending'
                      CHECK (gateway IN ('stripe', 'mercadopago', 'pagseguro', 'asaas', 'manual', 'pending')),
  gateway_payment_id TEXT UNIQUE,   -- ID externo do gateway (para idempotência)
  gateway_event_id   TEXT,          -- ID do evento/webhook
  amount            NUMERIC(10,2) NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'BRL',
  status            TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'approved', 'refused', 'refunded', 'chargeback')),
  method            TEXT,           -- 'credit_card', 'pix', 'boleto'
  paid_at           TIMESTAMPTZ,
  -- Webhook payload (para debug e auditoria)
  raw_payload       JSONB,
  -- Idempotência: evita processar o mesmo pagamento duas vezes
  processed         BOOLEAN NOT NULL DEFAULT FALSE,
  processed_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_order_id          ON public.payments(order_id);
CREATE INDEX idx_payments_gateway_id        ON public.payments(gateway_payment_id);
CREATE INDEX idx_payments_status            ON public.payments(status);
CREATE UNIQUE INDEX idx_payments_gateway_event
  ON public.payments(gateway, gateway_event_id)
  WHERE gateway_event_id IS NOT NULL;

CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- ENTITLEMENTS (acesso concedido: quem pode baixar o quê)
-- ============================================================
CREATE TABLE public.entitlements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Acesso a produto avulso
  product_id  UUID REFERENCES public.products(id),
  -- Acesso via plano
  plan_id     UUID REFERENCES public.plans(id),
  -- Origem do acesso
  order_id    UUID REFERENCES public.orders(id),
  payment_id  UUID REFERENCES public.payments(id),
  -- Validade (NULL = vitalício para compras avulsas)
  expires_at  TIMESTAMPTZ,
  revoked     BOOLEAN NOT NULL DEFAULT FALSE,
  revoked_at  TIMESTAMPTZ,
  revoked_reason TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_entitlement_has_target
    CHECK (product_id IS NOT NULL OR plan_id IS NOT NULL)
);

CREATE UNIQUE INDEX idx_entitlements_user_product
  ON public.entitlements(user_id, product_id)
  WHERE product_id IS NOT NULL AND revoked = FALSE;

CREATE INDEX idx_entitlements_user    ON public.entitlements(user_id);
CREATE INDEX idx_entitlements_product ON public.entitlements(product_id);
CREATE INDEX idx_entitlements_payment ON public.entitlements(payment_id);

-- ============================================================
-- DOWNLOAD_LOGS (auditoria de downloads)
-- ============================================================
CREATE TABLE public.download_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id),
  product_file_id UUID NOT NULL REFERENCES public.product_files(id),
  entitlement_id UUID REFERENCES public.entitlements(id),
  -- URL assinada gerada (para rastreamento)
  signed_url_path TEXT,
  -- Metadata da requisição
  ip_address     INET,
  user_agent     TEXT,
  downloaded_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_download_logs_user    ON public.download_logs(user_id);
CREATE INDEX idx_download_logs_file    ON public.download_logs(product_file_id);
CREATE INDEX idx_download_logs_date    ON public.download_logs(downloaded_at DESC);

-- ============================================================
-- FASE 2: RLS — Row Level Security
-- ============================================================

ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.themes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_themes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_files   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entitlements    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.download_logs   ENABLE ROW LEVEL SECURITY;

-- ── Helper: verifica se o usuário logado é admin ─────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── Helper: verifica se usuário tem entitlement para produto ─
CREATE OR REPLACE FUNCTION public.has_entitlement(p_product_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.entitlements e
    WHERE e.user_id    = auth.uid()
      AND e.product_id = p_product_id
      AND e.revoked    = FALSE
      AND (e.expires_at IS NULL OR e.expires_at > NOW())
  )
  OR EXISTS (
    -- Acesso via plano que inclui tudo
    SELECT 1 FROM public.entitlements e
    JOIN public.plans pl ON pl.id = e.plan_id
    WHERE e.user_id  = auth.uid()
      AND e.plan_id  IS NOT NULL
      AND pl.includes_all = TRUE
      AND e.revoked  = FALSE
      AND (e.expires_at IS NULL OR e.expires_at > NOW())
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ────────────────────────────────────────────────────────────
-- POLICIES: profiles
-- ────────────────────────────────────────────────────────────
CREATE POLICY "profiles: admin vê todos"
  ON public.profiles FOR SELECT
  USING (public.is_admin() OR id = auth.uid());

CREATE POLICY "profiles: usuário edita o próprio"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "profiles: admin edita qualquer um"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- ────────────────────────────────────────────────────────────
-- POLICIES: categories — leitura pública, escrita só admin
-- ────────────────────────────────────────────────────────────
CREATE POLICY "categories: leitura pública"
  ON public.categories FOR SELECT
  USING (active = TRUE OR public.is_admin());

CREATE POLICY "categories: escrita admin"
  ON public.categories FOR ALL
  USING (public.is_admin());

-- ────────────────────────────────────────────────────────────
-- POLICIES: themes
-- ────────────────────────────────────────────────────────────
CREATE POLICY "themes: leitura pública"
  ON public.themes FOR SELECT
  USING (active = TRUE OR public.is_admin());

CREATE POLICY "themes: escrita admin"
  ON public.themes FOR ALL
  USING (public.is_admin());

-- ────────────────────────────────────────────────────────────
-- POLICIES: products
-- ────────────────────────────────────────────────────────────
-- Produtos ativos aparecem para todos (loja pública)
CREATE POLICY "products: leitura pública (ativos)"
  ON public.products FOR SELECT
  USING (
    (status = 'active' AND deleted_at IS NULL)
    OR public.is_admin()
  );

CREATE POLICY "products: escrita admin"
  ON public.products FOR ALL
  USING (public.is_admin());

-- ────────────────────────────────────────────────────────────
-- POLICIES: product_themes
-- ────────────────────────────────────────────────────────────
CREATE POLICY "product_themes: leitura pública"
  ON public.product_themes FOR SELECT
  USING (TRUE);

CREATE POLICY "product_themes: escrita admin"
  ON public.product_themes FOR ALL
  USING (public.is_admin());

-- ────────────────────────────────────────────────────────────
-- POLICIES: product_files — só quem tem acesso baixa
-- ────────────────────────────────────────────────────────────
-- Metadados (nome, display_name, etc.) visíveis se tiver entitlement
CREATE POLICY "product_files: visível com entitlement"
  ON public.product_files FOR SELECT
  USING (
    public.is_admin()
    OR public.has_entitlement(product_id)
    -- Produto gratuito libera listagem dos arquivos
    OR EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_id AND p.is_free = TRUE AND p.status = 'active'
    )
  );

CREATE POLICY "product_files: escrita admin"
  ON public.product_files FOR ALL
  USING (public.is_admin());

-- ────────────────────────────────────────────────────────────
-- POLICIES: plans
-- ────────────────────────────────────────────────────────────
CREATE POLICY "plans: leitura pública (ativos)"
  ON public.plans FOR SELECT
  USING (status = 'active' OR public.is_admin());

CREATE POLICY "plans: escrita admin"
  ON public.plans FOR ALL
  USING (public.is_admin());

-- ────────────────────────────────────────────────────────────
-- POLICIES: orders — usuário vê apenas os próprios
-- ────────────────────────────────────────────────────────────
CREATE POLICY "orders: usuário vê os próprios"
  ON public.orders FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "orders: usuário cria"
  ON public.orders FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "orders: admin atualiza"
  ON public.orders FOR UPDATE
  USING (public.is_admin());

-- ────────────────────────────────────────────────────────────
-- POLICIES: order_items
-- ────────────────────────────────────────────────────────────
CREATE POLICY "order_items: usuário vê os próprios"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
    OR public.is_admin()
  );

CREATE POLICY "order_items: inserção pelo sistema"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
    OR public.is_admin()
  );

-- ────────────────────────────────────────────────────────────
-- POLICIES: payments — admin vê tudo, usuário vê os próprios
-- ────────────────────────────────────────────────────────────
CREATE POLICY "payments: usuário vê os próprios"
  ON public.payments FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
    OR public.is_admin()
  );

-- Pagamentos são inseridos/atualizados SOMENTE via Edge Function (SECURITY DEFINER)
-- Frontend nunca escreve diretamente em payments

-- ────────────────────────────────────────────────────────────
-- POLICIES: entitlements — usuário vê os próprios
-- ────────────────────────────────────────────────────────────
CREATE POLICY "entitlements: usuário vê os próprios"
  ON public.entitlements FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

-- Entitlements são criados SOMENTE via Edge Function (webhook de pagamento)

-- ────────────────────────────────────────────────────────────
-- POLICIES: download_logs
-- ────────────────────────────────────────────────────────────
CREATE POLICY "download_logs: usuário vê os próprios"
  ON public.download_logs FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

-- ============================================================
-- STORAGE: criar buckets
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'product-covers',
    'product-covers',
    TRUE,   -- público: imagens de capa aparecem na loja sem autenticação
    5242880, -- 5 MB
    ARRAY['image/jpeg','image/png','image/webp','image/gif']
  ),
  (
    'product-files',
    'product-files',
    FALSE,  -- PRIVADO: PDFs só via URL assinada com expiração
    52428800, -- 50 MB
    ARRAY['application/pdf','application/zip','image/jpeg','image/png']
  )
ON CONFLICT (id) DO NOTHING;

-- ── Storage Policies: product-covers (público) ──────────────
CREATE POLICY "covers: leitura pública"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-covers');

CREATE POLICY "covers: upload admin"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-covers' AND public.is_admin());

CREATE POLICY "covers: delete admin"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-covers' AND public.is_admin());

-- ── Storage Policies: product-files (privado) ───────────────
-- NINGUÉM acessa diretamente — somente via Edge Function com URL assinada
CREATE POLICY "files: sem leitura direta"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-files' AND public.is_admin());

CREATE POLICY "files: upload admin"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-files' AND public.is_admin());

CREATE POLICY "files: delete admin"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-files' AND public.is_admin());

