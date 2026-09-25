-- ==============================================================================
-- COM DEUS KIDS — FASE 6: COMERCIAL / BILLING / CHECKOUT / PAGAMENTOS / ENTITLEMENTS
-- Migration: 20260923000009_billing_and_entitlements.sql
-- ==============================================================================
-- EXTENDE E REUTILIZA O SCHEMA COMERCIAL EXISTENTE:
-- products, plans, orders, order_items, payments, entitlements
-- ADICIONA: prices, subscriptions, coupons, webhook_events, billing_events, invoices
-- ==============================================================================

-- 1. TABELA DE PREÇOS / OFERTAS (prices) — PRODUTO ≠ PREÇO
CREATE TABLE IF NOT EXISTS public.prices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID REFERENCES public.products(id) ON DELETE CASCADE,
  plan_id         UUID REFERENCES public.plans(id) ON DELETE CASCADE,
  name            TEXT NOT NULL, -- ex: 'Família Mensal', 'Família Anual', 'Igreja Anual'
  billing_cycle   TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly', 'quarterly', 'one_time', 'lifetime')),
  amount_cents    BIGINT NOT NULL CHECK (amount_cents >= 0), -- minor units: R$ 49,90 = 4990
  currency        TEXT NOT NULL DEFAULT 'BRL',
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  trial_days      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT chk_price_target CHECK (product_id IS NOT NULL OR plan_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_prices_plan ON public.prices(plan_id);
CREATE INDEX IF NOT EXISTS idx_prices_product ON public.prices(product_id);
CREATE INDEX IF NOT EXISTS idx_prices_active ON public.prices(is_active);

-- 2. EXTENSÃO DA TABELA ORDERS (Comprador User ou Organization + Minor Units)
DO $$
BEGIN
  -- Comprador Organization
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'organization_id') THEN
    ALTER TABLE public.orders ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;
  END IF;

  -- Valores monetários canônicos em centavos (Minor Units)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'subtotal_amount_cents') THEN
    ALTER TABLE public.orders ADD COLUMN subtotal_amount_cents BIGINT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'discount_amount_cents') THEN
    ALTER TABLE public.orders ADD COLUMN discount_amount_cents BIGINT DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'total_amount_cents') THEN
    ALTER TABLE public.orders ADD COLUMN total_amount_cents BIGINT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'paid_amount_cents') THEN
    ALTER TABLE public.orders ADD COLUMN paid_amount_cents BIGINT DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'refunded_amount_cents') THEN
    ALTER TABLE public.orders ADD COLUMN refunded_amount_cents BIGINT DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'gateway_fee_amount_cents') THEN
    ALTER TABLE public.orders ADD COLUMN gateway_fee_amount_cents BIGINT DEFAULT 0;
  END IF;

  -- Rastreamento comercial para Afiliados e Checkout Abandonado
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'affiliate_referral_id') THEN
    ALTER TABLE public.orders ADD COLUMN affiliate_referral_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'checkout_session_id') THEN
    ALTER TABLE public.orders ADD COLUMN checkout_session_id TEXT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_orders_org ON public.orders(organization_id);
CREATE INDEX IF NOT EXISTS idx_orders_checkout_session ON public.orders(checkout_session_id);

-- 3. EXTENSÃO DA TABELA ORDER_ITEMS (Snapshot de Preço e Price ID)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'price_id') THEN
    ALTER TABLE public.order_items ADD COLUMN price_id UUID REFERENCES public.prices(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'unit_price_cents') THEN
    ALTER TABLE public.order_items ADD COLUMN unit_price_cents BIGINT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'subtotal_cents') THEN
    ALTER TABLE public.order_items ADD COLUMN subtotal_cents BIGINT;
  END IF;
END $$;

-- 4. EXTENSÃO DA TABELA PAYMENTS (Segurança PCI, Pix QR Code e Minor Units)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'organization_id') THEN
    ALTER TABLE public.payments ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'amount_cents') THEN
    ALTER TABLE public.payments ADD COLUMN amount_cents BIGINT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'card_brand') THEN
    ALTER TABLE public.payments ADD COLUMN card_brand TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'card_last4') THEN
    ALTER TABLE public.payments ADD COLUMN card_last4 TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'installments') THEN
    ALTER TABLE public.payments ADD COLUMN installments INT DEFAULT 1;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'pix_qr_code') THEN
    ALTER TABLE public.payments ADD COLUMN pix_qr_code TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'pix_qr_code_url') THEN
    ALTER TABLE public.payments ADD COLUMN pix_qr_code_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'pix_expires_at') THEN
    ALTER TABLE public.payments ADD COLUMN pix_expires_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'refunded_amount_cents') THEN
    ALTER TABLE public.payments ADD COLUMN refunded_amount_cents BIGINT DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'is_chargeback') THEN
    ALTER TABLE public.payments ADD COLUMN is_chargeback BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- 5. TABELA DE ASSINATURAS RECORRENTES (subscriptions)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id         UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  plan_id                 UUID NOT NULL REFERENCES public.plans(id) ON DELETE RESTRICT,
  price_id                UUID REFERENCES public.prices(id) ON DELETE RESTRICT,
  order_id                UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  status                  TEXT NOT NULL DEFAULT 'active'
                            CHECK (status IN ('trialing', 'pending', 'active', 'past_due', 'canceled', 'expired')),
  started_at              TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  current_period_start    TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  current_period_end      TIMESTAMPTZ NOT NULL,
  cancel_at_period_end    BOOLEAN NOT NULL DEFAULT FALSE,
  canceled_at             TIMESTAMPTZ,
  ended_at                TIMESTAMPTZ,
  trial_ends_at           TIMESTAMPTZ,
  grace_period_ends_at    TIMESTAMPTZ,
  gateway_subscription_id TEXT,
  metadata                JSONB DEFAULT '{}'::jsonb,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_subs_user ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subs_org ON public.subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_subs_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subs_period ON public.subscriptions(current_period_end);

-- 6. EXTENSÃO DA TABELA ENTITLEMENTS (Organização, Assinatura e Limites Canônicos)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'entitlements' AND column_name = 'organization_id') THEN
    ALTER TABLE public.entitlements ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'entitlements' AND column_name = 'subscription_id') THEN
    ALTER TABLE public.entitlements ADD COLUMN subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'entitlements' AND column_name = 'feature_key') THEN
    ALTER TABLE public.entitlements ADD COLUMN feature_key TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'entitlements' AND column_name = 'quantity') THEN
    ALTER TABLE public.entitlements ADD COLUMN quantity INT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'entitlements' AND column_name = 'limits') THEN
    ALTER TABLE public.entitlements ADD COLUMN limits JSONB DEFAULT '{}'::jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'entitlements' AND column_name = 'status') THEN
    ALTER TABLE public.entitlements ADD COLUMN status TEXT NOT NULL DEFAULT 'active'
      CHECK (status IN ('active', 'past_due', 'suspended', 'revoked', 'expired'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'entitlements' AND column_name = 'valid_from') THEN
    ALTER TABLE public.entitlements ADD COLUMN valid_from TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now());
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_entitlements_org ON public.entitlements(organization_id);
CREATE INDEX IF NOT EXISTS idx_entitlements_sub ON public.entitlements(subscription_id);
CREATE INDEX IF NOT EXISTS idx_entitlements_feature ON public.entitlements(feature_key);

-- 7. TABELA DE CUPONS / DESCONTOS (coupons)
CREATE TABLE IF NOT EXISTS public.coupons (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            TEXT NOT NULL UNIQUE,
  discount_type   TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value  BIGINT NOT NULL, -- 20 para 20% ou 1000 para R$ 10,00
  max_uses        INT,
  uses_count      INT NOT NULL DEFAULT 0,
  valid_from      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  valid_until     TIMESTAMPTZ,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);

-- 8. REGISTRO DE EVENTOS DE WEBHOOK (webhook_events) — IDEMPOTÊNCIA & REPLAY SHIELD
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway           TEXT NOT NULL,
  external_event_id TEXT NOT NULL,
  event_type        TEXT NOT NULL,
  payload           JSONB NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'processed', 'failed', 'ignored')),
  attempts          INT NOT NULL DEFAULT 0,
  error_message     TEXT,
  received_at       TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  processed_at      TIMESTAMPTZ,
  CONSTRAINT uq_webhook_gateway_event UNIQUE (gateway, external_event_id)
);

CREATE INDEX IF NOT EXISTS idx_webhooks_gateway ON public.webhook_events(gateway);
CREATE INDEX IF NOT EXISTS idx_webhooks_status ON public.webhook_events(status);

-- 9. EVENT BUS INTERNO (billing_events) — CONSUMIDO FUTURAMENTE POR AFILIADOS / BREVO
CREATE TABLE IF NOT EXISTS public.billing_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name      TEXT NOT NULL, -- ex: 'order.paid', 'subscription.activated', 'entitlement.revoked'
  entity_type     TEXT NOT NULL, -- 'order', 'payment', 'subscription', 'entitlement'
  entity_id       UUID NOT NULL,
  user_id         UUID,
  organization_id UUID,
  payload         JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_billing_events_name ON public.billing_events(event_name);
CREATE INDEX IF NOT EXISTS idx_billing_events_entity ON public.billing_events(entity_type, entity_id);

-- 10. FATURAS / RECIBOS (invoices)
CREATE TABLE IF NOT EXISTS public.invoices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number  TEXT NOT NULL UNIQUE,
  order_id        UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  user_id         UUID NOT NULL REFERENCES auth.users(id),
  organization_id UUID REFERENCES public.organizations(id),
  amount_cents    BIGINT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('draft', 'open', 'paid', 'uncollectible', 'void')),
  period_start    TIMESTAMPTZ,
  period_end      TIMESTAMPTZ,
  payment_method  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_invoices_user ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_org ON public.invoices(organization_id);

-- ==============================================================================
-- 11. RPCs ATÔMICAS DO MOTOR DE BILLING & ENTITLEMENTS
-- ==============================================================================

-- 11.1 CÁLCULO CANÔNICO DE CHECKOUT (Segurança: Frontend nunca altera preço)
CREATE OR REPLACE FUNCTION public.calculate_checkout_total(
  p_price_id UUID,
  p_coupon_code TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_price RECORD;
  v_discount_cents BIGINT := 0;
  v_total_cents BIGINT;
  v_coupon RECORD;
BEGIN
  -- Buscar preço oficial
  SELECT * INTO v_price FROM public.prices WHERE id = p_price_id AND is_active = TRUE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Preço ou oferta não encontrada ou inativa';
  END IF;

  -- Processar cupom se fornecido
  IF p_coupon_code IS NOT NULL AND trim(p_coupon_code) != '' THEN
    SELECT * INTO v_coupon FROM public.coupons 
    WHERE code = upper(trim(p_coupon_code))
      AND is_active = TRUE
      AND (valid_until IS NULL OR valid_until > timezone('utc', now()))
      AND (max_uses IS NULL OR uses_count < max_uses);

    IF FOUND THEN
      IF v_coupon.discount_type = 'percentage' THEN
        v_discount_cents := (v_price.amount_cents * v_coupon.discount_value) / 100;
      ELSE
        v_discount_cents := LEAST(v_coupon.discount_value, v_price.amount_cents);
      END IF;
    END IF;
  END IF;

  v_total_cents := GREATEST(0, v_price.amount_cents - v_discount_cents);

  RETURN jsonb_build_object(
    'price_id', v_price.id,
    'subtotal_cents', v_price.amount_cents,
    'discount_cents', v_discount_cents,
    'total_cents', v_total_cents,
    'currency', v_price.currency,
    'billing_cycle', v_price.billing_cycle
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11.2 PROCESSAMENTO ATÔMICO DE PAGAMENTO APROVADO & LIBERAÇÃO DE ACESSO
CREATE OR REPLACE FUNCTION public.process_billing_order_paid(
  p_order_id UUID,
  p_payment_id UUID,
  p_gateway_event_id TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
  v_item RECORD;
  v_price RECORD;
  v_plan RECORD;
  v_sub_id UUID;
  v_period_interval INTERVAL;
  v_period_end TIMESTAMPTZ;
  v_feature_key TEXT;
  v_limits JSONB;
BEGIN
  -- 1. Obter e bloquear pedido
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pedido não encontrado';
  END IF;

  -- Idempotência: Se o pedido já estiver marcado como 'paid', não duplicar assinaturas ou acessos
  IF v_order.status = 'paid' THEN
    RETURN jsonb_build_object('success', true, 'message', 'Pedido já estava pago (Idempotente)');
  END IF;

  -- 2. Atualizar status do Pedido
  UPDATE public.orders
  SET status = 'paid',
      paid_amount_cents = COALESCE(total_amount_cents, (total * 100)::bigint),
      updated_at = timezone('utc', now())
  WHERE id = p_order_id;

  -- 3. Atualizar status do Pagamento
  UPDATE public.payments
  SET status = 'approved',
      paid_at = timezone('utc', now()),
      processed = TRUE,
      processed_at = timezone('utc', now()),
      gateway_event_id = COALESCE(p_gateway_event_id, gateway_event_id),
      updated_at = timezone('utc', now())
  WHERE id = p_payment_id;

  -- 4. Processar itens do pedido
  FOR v_item IN SELECT * FROM public.order_items WHERE order_id = p_order_id LOOP
    
    -- Caso A: Assinatura / Plano Recorrente
    IF v_item.plan_id IS NOT NULL THEN
      SELECT * INTO v_plan FROM public.plans WHERE id = v_item.plan_id;
      
      -- Determinar período do ciclo
      IF v_item.price_id IS NOT NULL THEN
        SELECT * INTO v_price FROM public.prices WHERE id = v_item.price_id;
        IF v_price.billing_cycle = 'yearly' THEN
          v_period_interval := interval '1 year';
        ELSE
          v_period_interval := interval '1 month';
        END IF;
      ELSE
        v_period_interval := interval '1 month';
      END IF;

      v_period_end := timezone('utc', now()) + v_period_interval;

      -- Criar Assinatura Canônica
      INSERT INTO public.subscriptions (
        user_id,
        organization_id,
        plan_id,
        price_id,
        order_id,
        status,
        started_at,
        current_period_start,
        current_period_end,
        cancel_at_period_end
      ) VALUES (
        v_order.user_id,
        v_order.organization_id,
        v_item.plan_id,
        v_item.price_id,
        p_order_id,
        'active',
        timezone('utc', now()),
        timezone('utc', now()),
        v_period_end,
        FALSE
      ) RETURNING id INTO v_sub_id;

      -- Mapear feature_key e limits conforme target_role do plano
      IF v_plan.target_role = 'church' THEN
        v_feature_key := 'church.kids';
        v_limits := jsonb_build_object('max_children', COALESCE(v_plan.max_users, 200), 'catalog_full', true);
      ELSIF v_plan.target_role = 'school' THEN
        v_feature_key := 'school.operations';
        v_limits := jsonb_build_object('max_students', COALESCE(v_plan.max_users, 500), 'catalog_full', true);
      ELSIF v_plan.target_role = 'teacher' THEN
        v_feature_key := 'teacher.engine';
        v_limits := jsonb_build_object('max_students', COALESCE(v_plan.max_users, 50), 'catalog_full', true);
      ELSE
        v_feature_key := 'family.streaming';
        v_limits := jsonb_build_object('max_profiles', COALESCE(v_plan.max_users, 5), 'catalog_full', true);
      END IF;

      -- Conceder Entitlement Ativo
      INSERT INTO public.entitlements (
        user_id,
        organization_id,
        plan_id,
        subscription_id,
        order_id,
        payment_id,
        feature_key,
        limits,
        status,
        expires_at
      ) VALUES (
        v_order.user_id,
        v_order.organization_id,
        v_item.plan_id,
        v_sub_id,
        p_order_id,
        p_payment_id,
        v_feature_key,
        v_limits,
        'active',
        v_period_end
      );

      -- Emitir Eventos Canônicos no Barramento Interno
      INSERT INTO public.billing_events (event_name, entity_type, entity_id, user_id, organization_id, payload)
      VALUES ('subscription.activated', 'subscription', v_sub_id, v_order.user_id, v_order.organization_id, jsonb_build_object('plan_id', v_item.plan_id, 'period_end', v_period_end));

      INSERT INTO public.billing_events (event_name, entity_type, entity_id, user_id, organization_id, payload)
      VALUES ('entitlement.granted', 'entitlement', v_sub_id, v_order.user_id, v_order.organization_id, jsonb_build_object('feature_key', v_feature_key, 'limits', v_limits));

    -- Caso B: Produto Digital Avulso (Acesso vitalício ou permanente sem subscription)
    ELSIF v_item.product_id IS NOT NULL THEN
      INSERT INTO public.entitlements (
        user_id,
        organization_id,
        product_id,
        order_id,
        payment_id,
        feature_key,
        status,
        expires_at
      ) VALUES (
        v_order.user_id,
        v_order.organization_id,
        v_item.product_id,
        p_order_id,
        p_payment_id,
        'product.digital_access',
        'active',
        NULL -- vitalício
      );

      INSERT INTO public.billing_events (event_name, entity_type, entity_id, user_id, organization_id, payload)
      VALUES ('entitlement.granted', 'entitlement', v_item.product_id, v_order.user_id, v_order.organization_id, jsonb_build_object('product_id', v_item.product_id, 'permanent', true));
    END IF;

  END LOOP;

  -- 5. Registrar evento de Pedido e Pagamento no Barramento
  INSERT INTO public.billing_events (event_name, entity_type, entity_id, user_id, organization_id, payload)
  VALUES ('order.paid', 'order', p_order_id, v_order.user_id, v_order.organization_id, jsonb_build_object('amount_cents', v_order.total_amount_cents));

  INSERT INTO public.billing_events (event_name, entity_type, entity_id, user_id, organization_id, payload)
  VALUES ('payment.approved', 'payment', p_payment_id, v_order.user_id, v_order.organization_id, jsonb_build_object('order_id', p_order_id));

  RETURN jsonb_build_object('success', true, 'order_id', p_order_id, 'status', 'paid');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11.3 CANCELAMENTO DE ASSINATURA (Preserva acesso até o fim do período se cancel_at_period_end = true)
CREATE OR REPLACE FUNCTION public.handle_subscription_cancellation(
  p_subscription_id UUID,
  p_cancel_at_period_end BOOLEAN DEFAULT TRUE,
  p_reason TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_sub RECORD;
BEGIN
  SELECT * INTO v_sub FROM public.subscriptions WHERE id = p_subscription_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Assinatura não encontrada';
  END IF;

  IF p_cancel_at_period_end THEN
    -- Mantém status 'active' e o entitlement até a data do current_period_end
    UPDATE public.subscriptions
    SET cancel_at_period_end = TRUE,
        canceled_at = timezone('utc', now()),
        metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{cancel_reason}', to_jsonb(p_reason), true),
        updated_at = timezone('utc', now())
    WHERE id = p_subscription_id;

    INSERT INTO public.billing_events (event_name, entity_type, entity_id, user_id, organization_id, payload)
    VALUES ('subscription.canceled_scheduled', 'subscription', p_subscription_id, v_sub.user_id, v_sub.organization_id, jsonb_build_object('active_until', v_sub.current_period_end, 'reason', p_reason));

    RETURN jsonb_build_object('success', true, 'status', 'active', 'cancel_at_period_end', true, 'active_until', v_sub.current_period_end);
  ELSE
    -- Cancelamento imediato (revogação total instantânea)
    UPDATE public.subscriptions
    SET status = 'canceled',
        cancel_at_period_end = FALSE,
        canceled_at = timezone('utc', now()),
        ended_at = timezone('utc', now()),
        updated_at = timezone('utc', now())
    WHERE id = p_subscription_id;

    UPDATE public.entitlements
    SET status = 'revoked',
        revoked = TRUE,
        revoked_at = timezone('utc', now()),
        revoked_reason = COALESCE(p_reason, 'Cancelamento imediato de assinatura')
    WHERE subscription_id = p_subscription_id;

    INSERT INTO public.billing_events (event_name, entity_type, entity_id, user_id, organization_id, payload)
    VALUES ('subscription.canceled', 'subscription', p_subscription_id, v_sub.user_id, v_sub.organization_id, jsonb_build_object('ended_at', now(), 'reason', p_reason));

    INSERT INTO public.billing_events (event_name, entity_type, entity_id, user_id, organization_id, payload)
    VALUES ('entitlement.revoked', 'subscription', p_subscription_id, v_sub.user_id, v_sub.organization_id, jsonb_build_object('reason', p_reason));

    RETURN jsonb_build_object('success', true, 'status', 'canceled', 'revoked_immediately', true);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11.4 REEMBOLSO / ESTORNO / CHARGEBACK (Revoga ou suspende acesso canônico)
CREATE OR REPLACE FUNCTION public.handle_payment_refund(
  p_payment_id UUID,
  p_refund_amount_cents BIGINT DEFAULT NULL,
  p_reason TEXT DEFAULT NULL,
  p_is_chargeback BOOLEAN DEFAULT FALSE
) RETURNS JSONB AS $$
DECLARE
  v_pay RECORD;
  v_order RECORD;
  v_new_status TEXT;
  v_event_name TEXT;
BEGIN
  SELECT * INTO v_pay FROM public.payments WHERE id = p_payment_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pagamento não encontrado';
  END IF;

  v_new_status := CASE WHEN p_is_chargeback THEN 'chargeback' ELSE 'refunded' END;
  v_event_name := CASE WHEN p_is_chargeback THEN 'payment.chargeback' ELSE 'payment.refunded' END;

  UPDATE public.payments
  SET status = v_new_status,
      refunded_amount_cents = COALESCE(p_refund_amount_cents, amount_cents),
      is_chargeback = p_is_chargeback,
      updated_at = timezone('utc', now())
  WHERE id = p_payment_id;

  UPDATE public.orders
  SET status = v_new_status,
      refunded_amount_cents = COALESCE(p_refund_amount_cents, total_amount_cents),
      updated_at = timezone('utc', now())
  WHERE id = v_pay.order_id;

  -- Revogar entitlements gerados por esse pagamento
  UPDATE public.entitlements
  SET status = 'revoked',
      revoked = TRUE,
      revoked_at = timezone('utc', now()),
      revoked_reason = CASE WHEN p_is_chargeback THEN 'Chargeback recebido' ELSE 'Reembolso efetuado' END
  WHERE payment_id = p_payment_id;

  -- Suspender/Cancelar assinatura vinculada
  UPDATE public.subscriptions
  SET status = 'canceled',
      ended_at = timezone('utc', now()),
      updated_at = timezone('utc', now())
  WHERE order_id = v_pay.order_id;

  -- Registrar no Barramento
  INSERT INTO public.billing_events (event_name, entity_type, entity_id, user_id, organization_id, payload)
  VALUES (v_event_name, 'payment', p_payment_id, v_pay.order_id, v_pay.organization_id, jsonb_build_object('refund_amount_cents', p_refund_amount_cents, 'reason', p_reason));

  INSERT INTO public.billing_events (event_name, entity_type, entity_id, user_id, organization_id, payload)
  VALUES ('entitlement.revoked', 'payment', p_payment_id, v_pay.order_id, v_pay.organization_id, jsonb_build_object('reason', v_new_status));

  RETURN jsonb_build_object('success', true, 'status', v_new_status);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 12. ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- POLICIES: prices (Público para leitura de ofertas ativas)
DROP POLICY IF EXISTS "Leitura pública de ofertas e preços ativos" ON public.prices;
CREATE POLICY "Leitura pública de ofertas e preços ativos"
  ON public.prices FOR SELECT
  TO anon, authenticated
  USING (is_active = TRUE);

-- POLICIES: subscriptions (Usuário vê suas próprias ou de sua organização com capability)
DROP POLICY IF EXISTS "Usuários e organizações visualizam suas assinaturas" ON public.subscriptions;
CREATE POLICY "Usuários e organizações visualizam suas assinaturas"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    (organization_id IS NOT NULL AND public.is_org_member(organization_id))
  );

-- POLICIES: invoices
DROP POLICY IF EXISTS "Usuários e organizações visualizam suas faturas" ON public.invoices;
CREATE POLICY "Usuários e organizações visualizam suas faturas"
  ON public.invoices FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    (organization_id IS NOT NULL AND public.is_org_member(organization_id))
  );

-- POLICIES: coupons (Leitura para validar cupons ativos)
DROP POLICY IF EXISTS "Leitura de cupons ativos" ON public.coupons;
CREATE POLICY "Leitura de cupons ativos"
  ON public.coupons FOR SELECT
  TO anon, authenticated
  USING (is_active = TRUE AND (valid_until IS NULL OR valid_until > timezone('utc', now())));

-- POLICIES: billing_events (Restrito a administradores internos ou dono da entidade)
DROP POLICY IF EXISTS "Auditoria restrita a administradores" ON public.billing_events;
CREATE POLICY "Auditoria restrita a administradores"
  ON public.billing_events FOR SELECT
  TO authenticated
  USING (
    public.is_admin() OR
    user_id = auth.uid() OR
    (organization_id IS NOT NULL AND public.is_org_member(organization_id))
  );

-- ==============================================================================
-- 13. SEED DOS PLANOS CANÔNICOS E PREÇOS EM CENTAVOS (MINOR UNITS)
-- ==============================================================================
-- Atualizar constraint target_role de plans para incluir 'teacher'
ALTER TABLE public.plans DROP CONSTRAINT IF EXISTS plans_target_role_check;
ALTER TABLE public.plans ADD CONSTRAINT plans_target_role_check 
  CHECK (target_role IN ('parent', 'teacher', 'church', 'school', 'all'));

INSERT INTO public.plans (id, name, slug, description, target_role, price_monthly, price_yearly, max_users, includes_all, status)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Com Deus Kids Família', 'familia', 'Streaming bíblico infantil, controle de tempo de tela e até 5 perfis infantis', 'parent', 29.90, 299.00, 5, TRUE, 'active'),
  ('22222222-2222-2222-2222-222222222222', 'Com Deus Kids Professor Individual', 'professor', 'Motor educacional completo, Lesson Builder, diário de bordo e até 50 alunos', 'teacher', 39.90, 399.00, 50, TRUE, 'active'),
  ('33333333-3333-3333-3333-333333333333', 'Com Deus Kids Igreja / EBD', 'igreja', 'Gestão de Ministério Infantil, check-in seguro com crachá QR, turmas e até 200 crianças', 'church', 99.00, 990.00, 200, TRUE, 'active'),
  ('44444444-4444-4444-4444-444444444444', 'Com Deus Kids Escola', 'escola', 'Gestão escolar institucional, matrícula de 6 dígitos, transporte escolar e até 500 alunos', 'school', 199.00, 1990.00, 500, TRUE, 'active')
ON CONFLICT (slug) DO UPDATE
SET target_role = EXCLUDED.target_role,
    price_monthly = EXCLUDED.price_monthly,
    price_yearly = EXCLUDED.price_yearly,
    max_users = EXCLUDED.max_users,
    status = 'active';

-- PREÇOS ASSOCIADOS AOS PLANOS (MINOR UNITS EM CENTAVOS)
INSERT INTO public.prices (plan_id, name, billing_cycle, amount_cents, currency, is_active)
VALUES
  -- Família
  ('11111111-1111-1111-1111-111111111111', 'Família Mensal', 'monthly', 2990, 'BRL', TRUE),
  ('11111111-1111-1111-1111-111111111111', 'Família Anual', 'yearly', 29900, 'BRL', TRUE),
  -- Professor
  ('22222222-2222-2222-2222-222222222222', 'Professor Mensal', 'monthly', 3990, 'BRL', TRUE),
  ('22222222-2222-2222-2222-222222222222', 'Professor Anual', 'yearly', 39900, 'BRL', TRUE),
  -- Igreja
  ('33333333-3333-3333-3333-333333333333', 'Igreja Mensal', 'monthly', 9900, 'BRL', TRUE),
  ('33333333-3333-3333-3333-333333333333', 'Igreja Anual', 'yearly', 99000, 'BRL', TRUE),
  -- Escola
  ('44444444-4444-4444-4444-444444444444', 'Escola Mensal', 'monthly', 19900, 'BRL', TRUE),
  ('44444444-4444-4444-4444-444444444444', 'Escola Anual', 'yearly', 199000, 'BRL', TRUE)
ON CONFLICT DO NOTHING;

-- CUPOM DE EXEMPLO CANÔNICO (10% OFF)
INSERT INTO public.coupons (code, discount_type, discount_value, max_uses, is_active)
VALUES ('COMDEUS10', 'percentage', 10, 1000, TRUE)
ON CONFLICT (code) DO NOTHING;
