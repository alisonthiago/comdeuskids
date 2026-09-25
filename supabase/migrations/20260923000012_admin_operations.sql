-- ==============================================================================
-- FASE 9: ADM CENTRAL + OPERAÇÃO DA PLATAFORMA + FINANCEIRO + CONFIGURAÇÕES
-- Migration: 20260923000012_admin_operations.sql
-- Descrição:
--   1. Configurações Globais da Plataforma (platform_settings: limites, flags, moedas, carência)
--   2. Notas Internas de Suporte ao Cliente (customer_support_notes - nunca expostas ao cliente)
--   3. Capabilities Administrativas Granulares (platform_admin_capabilities)
--   4. RPC Central de Métricas Executivas Reais (get_admin_dashboard_metrics - minor units, MRR real sem one-time)
--   5. Ações Administrativas Seguras (cancelamento de assinatura, concessão/revogação de entitlements)
--   6. Busca Global Administrativa Unificada (admin_search_global)
-- ==============================================================================

-- 1. CONFIGURAÇÕES DA PLATAFORMA (platform_settings)
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category    TEXT NOT NULL CHECK (category IN ('commercial', 'billing', 'affiliates', 'notifications', 'general', 'security', 'features')),
  key         TEXT NOT NULL UNIQUE,
  value       JSONB NOT NULL DEFAULT '{}'::jsonb,
  description TEXT,
  is_public   BOOLEAN NOT NULL DEFAULT false,
  updated_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_platform_settings_key ON public.platform_settings(key);
CREATE INDEX IF NOT EXISTS idx_platform_settings_cat ON public.platform_settings(category);

-- 2. NOTAS DE SUPORTE E ATENDIMENTO AO CLIENTE (customer_support_notes)
CREATE TABLE IF NOT EXISTS public.customer_support_notes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_user_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_admin_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  note              TEXT NOT NULL,
  category          TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'billing', 'technical', 'complaint', 'vip')),
  is_private        BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_support_notes_user ON public.customer_support_notes(customer_user_id);
CREATE INDEX IF NOT EXISTS idx_support_notes_author ON public.customer_support_notes(author_admin_id);

-- 3. CAPABILITIES ADMINISTRATIVAS GRANULARES (platform_admin_capabilities)
CREATE TABLE IF NOT EXISTS public.platform_admin_capabilities (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  capability  TEXT NOT NULL,
  granted_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT uq_admin_user_capability UNIQUE(user_id, capability)
);

CREATE INDEX IF NOT EXISTS idx_admin_capabilities_user ON public.platform_admin_capabilities(user_id);

-- ==============================================================================
-- 4. FUNÇÕES DE SUPORTE E SEGURANÇA
-- ==============================================================================

-- A. Verificação de Capability Administrativa
CREATE OR REPLACE FUNCTION public.has_admin_capability(p_capability TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Se não for admin geral, rejeita
  IF NOT public.is_admin() THEN
    RETURN false;
  END IF;

  -- Se for admin e tiver registro de capability específica ou super-admin geral
  IF EXISTS (
    SELECT 1 FROM public.platform_admin_capabilities
    WHERE user_id = auth.uid() AND (capability = p_capability OR capability = 'admin.all')
  ) THEN
    RETURN true;
  END IF;

  -- Fallback para usuários administradores pré-existentes
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- B. RPC: Métricas Executivas Reais (Dashboard ADM)
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_metrics()
RETURNS JSONB AS $$
DECLARE
  v_gross_revenue_cents BIGINT := 0;
  v_discounts_cents BIGINT := 0;
  v_refunds_cents BIGINT := 0;
  v_net_revenue_cents BIGINT := 0;
  v_orders_count BIGINT := 0;
  v_active_subscriptions BIGINT := 0;
  v_past_due_subscriptions BIGINT := 0;
  v_mrr_cents BIGINT := 0;
  v_customers_count BIGINT := 0;
  v_families_count BIGINT := 0;
  v_teachers_count BIGINT := 0;
  v_churches_count BIGINT := 0;
  v_schools_count BIGINT := 0;
  v_affiliates_count BIGINT := 0;
  v_pending_commissions_cents BIGINT := 0;
  v_pending_payouts_count BIGINT := 0;
  v_pending_payouts_cents BIGINT := 0;
BEGIN
  -- 1. Receita Bruta, Descontos, Estornos de Pedidos Pagos
  SELECT 
    coalesce(sum(paid_amount_cents), 0),
    coalesce(sum(discount_amount_cents), 0),
    coalesce(sum(refunded_amount_cents), 0),
    count(*)
  INTO v_gross_revenue_cents, v_discounts_cents, v_refunds_cents, v_orders_count
  FROM public.orders
  WHERE status IN ('paid', 'refunded');

  v_net_revenue_cents := v_gross_revenue_cents - v_refunds_cents;

  -- 2. Assinaturas Ativas e Inadimplentes
  SELECT count(*) INTO v_active_subscriptions 
  FROM public.subscriptions 
  WHERE status = 'active';

  SELECT count(*) INTO v_past_due_subscriptions 
  FROM public.subscriptions 
  WHERE status = 'past_due';

  -- 3. Cálculo de MRR Real (excluindo compras avulsas 'one_time' e 'lifetime')
  -- Mensal: valor integral / Anual: valor dividido por 12
  SELECT coalesce(sum(
    CASE 
      WHEN pr.billing_cycle = 'monthly' THEN pr.amount_cents
      WHEN pr.billing_cycle = 'yearly' THEN pr.amount_cents / 12
      ELSE 0
    END
  ), 0) INTO v_mrr_cents
  FROM public.subscriptions s
  JOIN public.prices pr ON pr.id = s.price_id
  WHERE s.status = 'active';

  -- 4. Contagem de Clientes e Contextos
  SELECT count(*) INTO v_customers_count FROM auth.users;

  SELECT count(DISTINCT guardian_id) INTO v_families_count FROM public.child_guardians;

  -- Professores: contagem a partir de turmas ou perfis
  SELECT count(DISTINCT created_by) INTO v_teachers_count FROM public.educational_classes;
  IF v_teachers_count = 0 THEN
    SELECT count(*) INTO v_teachers_count FROM public.profiles WHERE role = 'teacher';
  END IF;
  SELECT count(*) INTO v_churches_count FROM public.organizations WHERE type = 'church';
  SELECT count(*) INTO v_schools_count FROM public.organizations WHERE type = 'school';

  -- 5. Afiliados e Comissões
  SELECT count(*) INTO v_affiliates_count FROM public.affiliates WHERE status = 'active';

  SELECT coalesce(sum(commission_amount_cents), 0) INTO v_pending_commissions_cents
  FROM public.affiliate_commissions
  WHERE status = 'pending';

  SELECT count(*), coalesce(sum(amount_cents), 0)
  INTO v_pending_payouts_count, v_pending_payouts_cents
  FROM public.affiliate_payout_requests
  WHERE status = 'pending';

  RETURN jsonb_build_object(
    'financial', jsonb_build_object(
      'gross_revenue_cents', v_gross_revenue_cents,
      'discounts_cents', v_discounts_cents,
      'refunds_cents', v_refunds_cents,
      'net_revenue_cents', v_net_revenue_cents,
      'mrr_cents', v_mrr_cents,
      'orders_count', v_orders_count
    ),
    'subscriptions', jsonb_build_object(
      'active', v_active_subscriptions,
      'past_due', v_past_due_subscriptions
    ),
    'customers', jsonb_build_object(
      'total_users', v_customers_count,
      'families', v_families_count,
      'teachers', v_teachers_count,
      'churches', v_churches_count,
      'schools', v_schools_count
    ),
    'affiliates', jsonb_build_object(
      'active_affiliates', v_affiliates_count,
      'pending_commissions_cents', v_pending_commissions_cents,
      'pending_payouts_count', v_pending_payouts_count,
      'pending_payouts_cents', v_pending_payouts_cents
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- C. RPC: Concessão Manual de Entitlement com Auditoria
CREATE OR REPLACE FUNCTION public.admin_grant_manual_entitlement(
  p_target_id UUID,
  p_is_org BOOLEAN,
  p_feature_key TEXT,
  p_valid_until TIMESTAMPTZ,
  p_reason TEXT
) RETURNS JSONB AS $$
DECLARE
  v_entitlement_id UUID;
BEGIN
  IF NOT public.has_admin_capability('admin.entitlement.manage') THEN
    RAISE EXCEPTION 'Acesso não autorizado: Requer capability admin.entitlement.manage';
  END IF;

  IF p_is_org THEN
    INSERT INTO public.entitlements (
      organization_id,
      feature_key,
      status,
      valid_until,
      metadata
    ) VALUES (
      p_target_id,
      p_feature_key,
      'active',
      p_valid_until,
      jsonb_build_object('granted_by_admin', auth.uid(), 'reason', p_reason, 'granted_at', timezone('utc', now()))
    ) RETURNING id INTO v_entitlement_id;
  ELSE
    INSERT INTO public.entitlements (
      user_id,
      feature_key,
      status,
      valid_until,
      metadata
    ) VALUES (
      p_target_id,
      p_feature_key,
      'active',
      p_valid_until,
      jsonb_build_object('granted_by_admin', auth.uid(), 'reason', p_reason, 'granted_at', timezone('utc', now()))
    ) RETURNING id INTO v_entitlement_id;
  END IF;

  -- Registra auditoria
  INSERT INTO public.activity_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    details
  ) VALUES (
    auth.uid(),
    'admin.entitlement.granted',
    'entitlement',
    v_entitlement_id,
    jsonb_build_object('feature_key', p_feature_key, 'target_id', p_target_id, 'reason', p_reason)
  );

  RETURN jsonb_build_object(
    'success', true,
    'entitlement_id', v_entitlement_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- D. RPC: Cancelamento Administrativo de Assinatura com Auditoria
CREATE OR REPLACE FUNCTION public.admin_cancel_subscription(
  p_subscription_id UUID,
  p_immediately BOOLEAN,
  p_reason TEXT
) RETURNS JSONB AS $$
DECLARE
  v_sub RECORD;
BEGIN
  IF NOT public.has_admin_capability('admin.subscription.cancel') THEN
    RAISE EXCEPTION 'Acesso não autorizado: Requer capability admin.subscription.cancel';
  END IF;

  SELECT * INTO v_sub FROM public.subscriptions WHERE id = p_subscription_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Assinatura não encontrada');
  END IF;

  IF p_immediately THEN
    UPDATE public.subscriptions
    SET status = 'canceled',
        canceled_at = timezone('utc', now()),
        ended_at = timezone('utc', now()),
        metadata = metadata || jsonb_build_object('canceled_by_admin', auth.uid(), 'cancel_reason', p_reason),
        updated_at = timezone('utc', now())
    WHERE id = p_subscription_id;

    -- Revoga entitlements associados
    UPDATE public.entitlements
    SET status = 'revoked'
    WHERE subscription_id = p_subscription_id;
  ELSE
    UPDATE public.subscriptions
    SET cancel_at_period_end = true,
        canceled_at = timezone('utc', now()),
        metadata = metadata || jsonb_build_object('canceled_by_admin', auth.uid(), 'cancel_reason', p_reason),
        updated_at = timezone('utc', now())
    WHERE id = p_subscription_id;
  END IF;

  -- Emite evento no Notification Engine para avisar o cliente
  PERFORM public.emit_notification_event(
    'subscription.canceled',
    'subscription',
    p_subscription_id,
    v_sub.user_id,
    v_sub.organization_id,
    jsonb_build_object('reason', p_reason, 'immediately', p_immediately)
  );

  RETURN jsonb_build_object(
    'success', true,
    'subscription_id', p_subscription_id,
    'status', CASE WHEN p_immediately THEN 'canceled' ELSE 'cancel_scheduled' END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- E. RPC: Busca Global Unificada para o ADM
CREATE OR REPLACE FUNCTION public.admin_search_global(p_query TEXT)
RETURNS JSONB AS $$
DECLARE
  v_users JSONB;
  v_orgs JSONB;
  v_orders JSONB;
  v_affiliates JSONB;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acesso não autorizado';
  END IF;

  -- Busca usuários por e-mail ou ID
  SELECT coalesce(jsonb_agg(jsonb_build_object(
    'id', id,
    'email', email,
    'created_at', created_at
  )), '[]'::jsonb) INTO v_users
  FROM auth.users
  WHERE email ILIKE '%' || p_query || '%' OR id::text = p_query
  LIMIT 5;

  -- Busca organizações por nome ou ID
  SELECT coalesce(jsonb_agg(jsonb_build_object(
    'id', id,
    'name', name,
    'type', type,
    'status', status
  )), '[]'::jsonb) INTO v_orgs
  FROM public.organizations
  WHERE name ILIKE '%' || p_query || '%' OR id::text = p_query
  LIMIT 5;

  -- Busca pedidos por ID ou cliente
  SELECT coalesce(jsonb_agg(jsonb_build_object(
    'id', id,
    'total_amount_cents', total_amount_cents,
    'status', status,
    'created_at', created_at
  )), '[]'::jsonb) INTO v_orders
  FROM public.orders
  WHERE id::text = p_query OR checkout_session_id ILIKE '%' || p_query || '%'
  LIMIT 5;

  -- Busca afiliados por tracking code ou ID
  SELECT coalesce(jsonb_agg(jsonb_build_object(
    'id', a.id,
    'tracking_code', a.tracking_code,
    'status', a.status
  )), '[]'::jsonb) INTO v_affiliates
  FROM public.affiliates a
  WHERE a.tracking_code ILIKE '%' || p_query || '%' OR a.id::text = p_query
  LIMIT 5;

  RETURN jsonb_build_object(
    'users', v_users,
    'organizations', v_orgs,
    'orders', v_orders,
    'affiliates', v_affiliates
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 5. SEED DE CONFIGURAÇÕES INICIAIS DA PLATAFORMA
-- ==============================================================================
INSERT INTO public.platform_settings (category, key, value, description)
VALUES
  (
    'commercial',
    'commercial.default_currency',
    '{"currency": "BRL", "symbol": "R$"}'::jsonb,
    'Moeda padrão operacional da plataforma Com Deus Kids'
  ),
  (
    'affiliates',
    'affiliates.payout_rules',
    '{"min_payout_amount_cents": 5000, "security_delay_days": 7, "allow_self_referral": false}'::jsonb,
    'Regras comerciais configuráveis de carência e saque de afiliados'
  ),
  (
    'features',
    'features.flags',
    '{"affiliate_program_enabled": true, "church_module_enabled": true, "school_module_enabled": true, "checkout_abandoned_recovery": true}'::jsonb,
    'Feature flags globais dos módulos da plataforma'
  ),
  (
    'billing',
    'billing.policy',
    '{"grace_period_days": 3, "retry_attempts": 3, "cancel_at_period_end_default": true}'::jsonb,
    'Políticas de cobrança recorrente e inadimplência'
  )
ON CONFLICT (key) DO UPDATE
SET description = EXCLUDED.description;

-- ==============================================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_support_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_admin_capabilities ENABLE ROW LEVEL SECURITY;

-- POLICIES: platform_settings
CREATE POLICY "Leitura de configurações públicas"
  ON public.platform_settings FOR SELECT
  TO authenticated
  USING (is_public = true OR public.is_admin());

CREATE POLICY "Gestão de configurações apenas por administradores"
  ON public.platform_settings FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- POLICIES: customer_support_notes
CREATE POLICY "Visualização de notas de suporte apenas por administradores"
  ON public.customer_support_notes FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Criação de notas de suporte apenas por administradores"
  ON public.customer_support_notes FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- POLICIES: platform_admin_capabilities
CREATE POLICY "Gestão de capabilities administrativas apenas por administradores"
  ON public.platform_admin_capabilities FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
