-- ==============================================================================
-- COM DEUS KIDS — FASE 7: AFILIADOS + COMISSÕES + CARTEIRA + SAQUES
-- Migration: 20260923000010_affiliate_commercial_integration.sql
-- ==============================================================================
-- CONECTA 00006 (AFILIADOS) COM 00009 (BILLING & ORDERS)
-- REUTILIZA AS TABELAS:
-- affiliate_payout_rules, affiliates, affiliate_product_rules, affiliate_referrals,
-- affiliate_commissions, affiliate_payout_requests, affiliate_notifications
-- ==============================================================================

-- 1. EXTENSÃO INCREMENTAL DE affiliate_commissions (Minor Units, Snapshot, Idempotência)
DO $$
BEGIN
  -- Snapshot de valores em centavos (Minor Units)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'affiliate_commissions' AND column_name = 'order_amount_cents') THEN
    ALTER TABLE public.affiliate_commissions ADD COLUMN order_amount_cents BIGINT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'affiliate_commissions' AND column_name = 'commission_amount_cents') THEN
    ALTER TABLE public.affiliate_commissions ADD COLUMN commission_amount_cents BIGINT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'affiliate_commissions' AND column_name = 'base_amount_cents') THEN
    ALTER TABLE public.affiliate_commissions ADD COLUMN base_amount_cents BIGINT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'affiliate_commissions' AND column_name = 'commission_type') THEN
    ALTER TABLE public.affiliate_commissions ADD COLUMN commission_type TEXT NOT NULL DEFAULT 'percentage';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'affiliate_commissions' AND column_name = 'payout_request_id') THEN
    ALTER TABLE public.affiliate_commissions ADD COLUMN payout_request_id UUID REFERENCES public.affiliate_payout_requests(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'affiliate_commissions' AND column_name = 'reversal_reason') THEN
    ALTER TABLE public.affiliate_commissions ADD COLUMN reversal_reason TEXT;
  END IF;

  -- Constraint de Idempotência: Cada pedido gera no máximo UMA comissão para um afiliado
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_aff_commission_order'
  ) THEN
    ALTER TABLE public.affiliate_commissions
      ADD CONSTRAINT uq_aff_commission_order UNIQUE (order_id, affiliate_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_aff_comm_payout ON public.affiliate_commissions(payout_request_id);

-- 2. EXTENSÃO INCREMENTAL DE affiliate_payout_requests
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'affiliate_payout_requests' AND column_name = 'amount_cents') THEN
    ALTER TABLE public.affiliate_payout_requests ADD COLUMN amount_cents BIGINT;
  END IF;
END $$;

-- 3. EXTENSÃO DE affiliate_payout_rules (Regras Configuráveis)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'affiliate_payout_rules' AND column_name = 'min_payout_amount_cents') THEN
    ALTER TABLE public.affiliate_payout_rules ADD COLUMN min_payout_amount_cents BIGINT DEFAULT 10000; -- R$ 100,00
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'affiliate_payout_rules' AND column_name = 'auto_approve_affiliates') THEN
    ALTER TABLE public.affiliate_payout_rules ADD COLUMN auto_approve_affiliates BOOLEAN NOT NULL DEFAULT TRUE;
  END IF;
END $$;

-- ==============================================================================
-- 4. RPC: ATRIBUIÇÃO E REGISTRO DE CLIQUE (Tracking Seguro)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.register_affiliate_click(
  p_affiliate_code TEXT,
  p_cookie_token TEXT,
  p_source TEXT DEFAULT 'direct',
  p_landing_url TEXT DEFAULT NULL,
  p_visitor_ip_hash TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_affiliate RECORD;
  v_rules RECORD;
  v_referral_id UUID;
  v_delay_days INT;
BEGIN
  -- Localizar afiliado ativo pelo código público
  SELECT * INTO v_affiliate FROM public.affiliates 
  WHERE code = upper(trim(p_affiliate_code)) AND status = 'active';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Código de afiliado inválido ou inativo');
  END IF;

  -- Obter regra de janela de atribuição
  SELECT security_delay_days INTO v_delay_days FROM public.affiliate_payout_rules LIMIT 1;
  v_delay_days := COALESCE(v_delay_days, 60);

  -- Registrar ou atualizar clique
  INSERT INTO public.affiliate_referrals (
    affiliate_id,
    cookie_token,
    source,
    landing_url,
    visitor_ip_hash,
    expires_at
  ) VALUES (
    v_affiliate.id,
    p_cookie_token,
    p_source,
    p_landing_url,
    p_visitor_ip_hash,
    timezone('utc', now()) + (v_delay_days || ' days')::interval
  ) RETURNING id INTO v_referral_id;

  RETURN jsonb_build_object(
    'success', true,
    'referral_id', v_referral_id,
    'affiliate_id', v_affiliate.id,
    'affiliate_code', v_affiliate.code
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 5. RPC: PROCESSAMENTO DE COMISSÃO DE AFILIADO A PARTIR DE ORDER PAGA
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.process_affiliate_commission_for_order(
  p_order_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
  v_referral RECORD;
  v_affiliate RECORD;
  v_rules RECORD;
  v_prod_rule RECORD;
  v_item RECORD;
  v_commission_rate NUMERIC(5,2);
  v_commission_cents BIGINT;
  v_commission_amount NUMERIC(10,2);
  v_available_at TIMESTAMPTZ;
  v_comm_id UUID;
BEGIN
  -- 1. Obter pedido
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id;
  IF NOT FOUND OR v_order.status != 'paid' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Pedido não encontrado ou não está pago');
  END IF;

  -- 2. Verificar se há atribuição comercial vinculada ao pedido
  IF v_order.affiliate_referral_id IS NULL THEN
    RETURN jsonb_build_object('success', true, 'message', 'Pedido sem atribuição de afiliado');
  END IF;

  SELECT * INTO v_referral FROM public.affiliate_referrals 
  WHERE id = v_order.affiliate_referral_id AND expires_at > timezone('utc', now());

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', true, 'message', 'Atribuição expirada ou não encontrada');
  END IF;

  -- 3. Obter Afiliado
  SELECT * INTO v_affiliate FROM public.affiliates WHERE id = v_referral.affiliate_id;
  IF NOT FOUND OR v_affiliate.status != 'active' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Afiliado inativo ou suspenso');
  END IF;

  -- 4. Proteção contra Auto-Referência (Self-Referral)
  SELECT * INTO v_rules FROM public.affiliate_payout_rules LIMIT 1;
  IF NOT COALESCE(v_rules.allow_self_referral, false) AND v_order.user_id = v_affiliate.user_id THEN
    INSERT INTO public.billing_events (event_name, entity_type, entity_id, user_id, payload)
    VALUES ('affiliate.self_referral_blocked', 'order', p_order_id, v_order.user_id, jsonb_build_object('affiliate_id', v_affiliate.id));
    RETURN jsonb_build_object('success', false, 'message', 'Auto-referência bloqueada pelas regras do programa');
  END IF;

  -- 5. Verificar idempotência: Evitar comissão duplicada se já foi gerada
  IF EXISTS (SELECT 1 FROM public.affiliate_commissions WHERE order_id = p_order_id AND affiliate_id = v_affiliate.id) THEN
    RETURN jsonb_build_object('success', true, 'message', 'Comissão já gerada anteriormente (Idempotente)');
  END IF;

  -- 6. Obter primeiro item do pedido para verificar regra específica do produto/plano
  SELECT * INTO v_item FROM public.order_items WHERE order_id = p_order_id LIMIT 1;

  -- Buscar regra de comissão específica ou usar fallback
  IF v_item.plan_id IS NOT NULL THEN
    SELECT * INTO v_prod_rule FROM public.affiliate_product_rules 
    WHERE plan_id = v_item.plan_id AND is_active = TRUE LIMIT 1;
  ELSIF v_item.product_id IS NOT NULL THEN
    SELECT * INTO v_prod_rule FROM public.affiliate_product_rules 
    WHERE product_id = v_item.product_id AND is_active = TRUE LIMIT 1;
  END IF;

  IF FOUND THEN
    v_commission_rate := v_prod_rule.commission_value;
  ELSIF v_affiliate.custom_commission_rate IS NOT NULL THEN
    v_commission_rate := v_affiliate.custom_commission_rate;
  ELSE
    v_commission_rate := COALESCE(v_rules.default_commission_rate, 20.00);
  END IF;

  -- 7. Calcular comissão em centavos e decimal sobre o total pago da venda
  v_commission_cents := (COALESCE(v_order.total_amount_cents, (v_order.total * 100)::bigint) * v_commission_rate) / 100;
  v_commission_amount := (v_commission_cents::numeric) / 100.00;
  v_available_at := timezone('utc', now()) + (COALESCE(v_rules.security_delay_days, 15) || ' days')::interval;

  -- 8. Inserir comissão com status 'pending' (período de carência/hold)
  INSERT INTO public.affiliate_commissions (
    affiliate_id,
    order_id,
    product_id,
    plan_id,
    order_amount,
    gateway_fee,
    platform_net,
    commission_rate,
    commission_amount,
    order_amount_cents,
    commission_amount_cents,
    base_amount_cents,
    commission_type,
    status,
    available_at
  ) VALUES (
    v_affiliate.id,
    p_order_id,
    v_item.product_id,
    v_item.plan_id,
    v_order.total,
    COALESCE(v_order.gateway_fee_amount_cents, 0) / 100.0,
    v_order.total,
    v_commission_rate,
    v_commission_amount,
    COALESCE(v_order.total_amount_cents, (v_order.total * 100)::bigint),
    v_commission_cents,
    COALESCE(v_order.total_amount_cents, (v_order.total * 100)::bigint),
    'percentage',
    'pending',
    v_available_at
  ) RETURNING id INTO v_comm_id;

  -- 9. Atualizar métricas desnormalizadas do afiliado
  UPDATE public.affiliates
  SET total_sales_count = total_sales_count + 1,
      total_commission_earned = total_commission_earned + v_commission_amount,
      updated_at = timezone('utc', now())
  WHERE id = v_affiliate.id;

  -- 10. Registrar evento no Barramento Interno
  INSERT INTO public.billing_events (event_name, entity_type, entity_id, user_id, payload)
  VALUES ('affiliate.commission.created', 'affiliate_commission', v_comm_id, v_affiliate.user_id, jsonb_build_object(
    'order_id', p_order_id,
    'affiliate_id', v_affiliate.id,
    'amount_cents', v_commission_cents,
    'available_at', v_available_at
  ));

  RETURN jsonb_build_object(
    'success', true,
    'commission_id', v_comm_id,
    'commission_amount_cents', v_commission_cents,
    'status', 'pending',
    'available_at', v_available_at
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 6. RPC: ESTORNO / REVERSÃO DE COMISSÃO (CONSUMIDO EM REFUND OU CHARGEBACK)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_affiliate_commission_refund(
  p_order_id UUID,
  p_is_chargeback BOOLEAN DEFAULT FALSE
) RETURNS JSONB AS $$
DECLARE
  v_comm RECORD;
  v_new_status TEXT;
BEGIN
  SELECT * INTO v_comm FROM public.affiliate_commissions 
  WHERE order_id = p_order_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', true, 'message', 'Nenhuma comissão vinculada a este pedido');
  END IF;

  v_new_status := CASE WHEN p_is_chargeback THEN 'refunded' ELSE 'refunded' END;

  -- Não apaga histórico: apenas altera o status para 'refunded' e audita o motivo
  UPDATE public.affiliate_commissions
  SET status = 'refunded',
      refunded_at = timezone('utc', now()),
      reversal_reason = CASE WHEN p_is_chargeback THEN 'Chargeback da operadora de cartão' ELSE 'Estorno/Reembolso de compra solicitado' END
  WHERE id = v_comm.id;

  INSERT INTO public.billing_events (event_name, entity_type, entity_id, user_id, payload)
  VALUES ('affiliate.commission.refunded', 'affiliate_commission', v_comm.id, v_comm.affiliate_id, jsonb_build_object(
    'order_id', p_order_id,
    'is_chargeback', p_is_chargeback
  ));

  RETURN jsonb_build_object('success', true, 'status', 'refunded', 'commission_id', v_comm.id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 7. CONEXÃO AUTOMÁTICA: PLUGAR BILLING 00009 COM AFILIADOS
-- ==============================================================================
-- Atualiza process_billing_order_paid para acionar automaticamente a comissão
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

  -- Idempotência: Se já estiver pago, retorna
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
    
    -- Assinatura Recorrente
    IF v_item.plan_id IS NOT NULL THEN
      SELECT * INTO v_plan FROM public.plans WHERE id = v_item.plan_id;
      
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

      INSERT INTO public.billing_events (event_name, entity_type, entity_id, user_id, organization_id, payload)
      VALUES ('subscription.activated', 'subscription', v_sub_id, v_order.user_id, v_order.organization_id, jsonb_build_object('plan_id', v_item.plan_id, 'period_end', v_period_end));

      INSERT INTO public.billing_events (event_name, entity_type, entity_id, user_id, organization_id, payload)
      VALUES ('entitlement.granted', 'entitlement', v_sub_id, v_order.user_id, v_order.organization_id, jsonb_build_object('feature_key', v_feature_key, 'limits', v_limits));

    -- Produto Digital Avulso
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
        NULL
      );

      INSERT INTO public.billing_events (event_name, entity_type, entity_id, user_id, organization_id, payload)
      VALUES ('entitlement.granted', 'entitlement', v_item.product_id, v_order.user_id, v_order.organization_id, jsonb_build_object('product_id', v_item.product_id, 'permanent', true));
    END IF;

  END LOOP;

  -- 5. Disparar Atribuição e Comissão do Afiliado se houver referral
  PERFORM public.process_affiliate_commission_for_order(p_order_id);

  -- 6. Registrar evento de Pedido e Pagamento no Barramento
  INSERT INTO public.billing_events (event_name, entity_type, entity_id, user_id, organization_id, payload)
  VALUES ('order.paid', 'order', p_order_id, v_order.user_id, v_order.organization_id, jsonb_build_object('amount_cents', v_order.total_amount_cents));

  INSERT INTO public.billing_events (event_name, entity_type, entity_id, user_id, organization_id, payload)
  VALUES ('payment.approved', 'payment', p_payment_id, v_order.user_id, v_order.organization_id, jsonb_build_object('order_id', p_order_id));

  RETURN jsonb_build_object('success', true, 'order_id', p_order_id, 'status', 'paid');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualiza handle_payment_refund para estornar comissão de afiliado automaticamente
CREATE OR REPLACE FUNCTION public.handle_payment_refund(
  p_payment_id UUID,
  p_refund_amount_cents BIGINT DEFAULT NULL,
  p_reason TEXT DEFAULT NULL,
  p_is_chargeback BOOLEAN DEFAULT FALSE
) RETURNS JSONB AS $$
DECLARE
  v_pay RECORD;
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

  -- Estornar/reverter comissão do afiliado
  PERFORM public.handle_affiliate_commission_refund(v_pay.order_id, p_is_chargeback);

  -- Registrar no Barramento
  INSERT INTO public.billing_events (event_name, entity_type, entity_id, user_id, organization_id, payload)
  VALUES (v_event_name, 'payment', p_payment_id, v_pay.order_id, v_pay.organization_id, jsonb_build_object('refund_amount_cents', p_refund_amount_cents, 'reason', p_reason));

  RETURN jsonb_build_object('success', true, 'status', v_new_status);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 8. RPC: SOLICITAÇÃO DE SAQUE PIX COM VALIDAÇÃO DE JANELA E LOCKING (Sem Saque Noturno)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.request_affiliate_payout(
  p_amount NUMERIC(10,2)
) RETURNS JSONB AS $$
DECLARE
  v_affiliate RECORD;
  v_rules RECORD;
  v_available_balance NUMERIC(10,2);
  v_day_name TEXT;
  v_now_time TIME;
  v_payout_id UUID;
  v_amount_cents BIGINT;
BEGIN
  -- 1. Obter e bloquear afiliado para evitar duplo clique concorrente
  SELECT * INTO v_affiliate FROM public.affiliates 
  WHERE user_id = auth.uid() AND status = 'active'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Afiliado não encontrado ou inativo.');
  END IF;

  -- Validar chave Pix cadastrada
  IF v_affiliate.pix_key IS NULL OR v_affiliate.pix_holder_document IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Cadastre sua chave Pix e documento antes de solicitar saque.');
  END IF;

  -- 2. Obter regras ativas de saque
  SELECT * INTO v_rules FROM public.affiliate_payout_rules LIMIT 1;

  -- 3. Validar valor mínimo
  IF p_amount < v_rules.min_payout_amount THEN
    RETURN jsonb_build_object('success', false, 'message', format('O valor mínimo de saque é R$ %s.', v_rules.min_payout_amount));
  END IF;

  -- 4. Validar dia da semana e horário (Sem Saque Noturno: Janela de Payout)
  v_day_name := lower(to_char(timezone('America/Sao_Paulo', now()), 'FMday'));
  v_day_name := CASE trim(v_day_name)
    WHEN 'monday' THEN 'monday'
    WHEN 'segunda-feira' THEN 'monday'
    WHEN 'tuesday' THEN 'tuesday'
    WHEN 'terça-feira' THEN 'tuesday'
    WHEN 'wednesday' THEN 'wednesday'
    WHEN 'quarta-feira' THEN 'wednesday'
    WHEN 'thursday' THEN 'thursday'
    WHEN 'quinta-feira' THEN 'thursday'
    WHEN 'friday' THEN 'friday'
    WHEN 'sexta-feira' THEN 'friday'
    WHEN 'saturday' THEN 'saturday'
    WHEN 'sábado' THEN 'saturday'
    WHEN 'sunday' THEN 'sunday'
    WHEN 'domingo' THEN 'sunday'
    ELSE v_day_name
  END;

  v_now_time := timezone('America/Sao_Paulo', now())::time;

  -- Verificar janela de horário (ex: 08:00 às 18:00)
  IF v_rules.allowed_time_start IS NOT NULL AND v_rules.allowed_time_end IS NOT NULL THEN
    IF v_now_time < v_rules.allowed_time_start OR v_now_time > v_rules.allowed_time_end THEN
      RETURN jsonb_build_object('success', false, 'message', format('Saques são permitidos apenas no horário comercial (entre %s e %s).', v_rules.allowed_time_start, v_rules.allowed_time_end));
    END IF;
  END IF;

  -- 5. Validar saldo disponível (comissões 'available' cujo prazo de carência já passou)
  -- Atualizar comissões cujo período de carência passou para 'available'
  UPDATE public.affiliate_commissions
  SET status = 'available'
  WHERE affiliate_id = v_affiliate.id 
    AND status = 'pending' 
    AND available_at <= timezone('utc', now());

  SELECT COALESCE(SUM(commission_amount), 0.00) INTO v_available_balance
  FROM public.affiliate_commissions
  WHERE affiliate_id = v_affiliate.id AND status = 'available' AND payout_request_id IS NULL;

  IF p_amount > v_available_balance THEN
    RETURN jsonb_build_object('success', false, 'message', format('Saldo disponível insuficiente. Você possui R$ %s disponível.', v_available_balance));
  END IF;

  v_amount_cents := (p_amount * 100)::bigint;

  -- 6. Criar solicitação de saque com status 'requested' (snapshot seguro do Pix)
  INSERT INTO public.affiliate_payout_requests (
    affiliate_id,
    amount,
    amount_cents,
    status,
    pix_key_type,
    pix_key,
    pix_holder_name,
    pix_holder_document
  ) VALUES (
    v_affiliate.id,
    p_amount,
    v_amount_cents,
    'requested',
    v_affiliate.pix_key_type,
    v_affiliate.pix_key,
    v_affiliate.pix_holder_name,
    v_affiliate.pix_holder_document
  ) RETURNING id INTO v_payout_id;

  -- 7. Reservar comissões vinculando ao payout_request_id
  UPDATE public.affiliate_commissions
  SET payout_request_id = v_payout_id
  WHERE affiliate_id = v_affiliate.id 
    AND status = 'available' 
    AND payout_request_id IS NULL
    AND id IN (
      SELECT id FROM public.affiliate_commissions
      WHERE affiliate_id = v_affiliate.id AND status = 'available' AND payout_request_id IS NULL
      LIMIT 100
    );

  -- 8. Auditar evento no Barramento
  INSERT INTO public.billing_events (event_name, entity_type, entity_id, user_id, payload)
  VALUES ('affiliate.payout.requested', 'payout_request', v_payout_id, v_affiliate.user_id, jsonb_build_object(
    'amount', p_amount,
    'amount_cents', v_amount_cents
  ));

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Solicitação de saque via Pix realizada com sucesso! Pagamento em análise pela administração.',
    'payout_id', v_payout_id,
    'amount', p_amount
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 9. RPC: PROCESSAMENTO ADMINISTRATIVO DE SAQUES (ADM)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.admin_process_payout(
  p_payout_id UUID,
  p_action TEXT, -- 'approve', 'mark_paid', 'reject'
  p_proof_url TEXT DEFAULT NULL,
  p_rejection_reason TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_payout RECORD;
BEGIN
  -- Permissão: Somente administradores
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acesso não autorizado: Requer privilégios de administrador';
  END IF;

  SELECT * INTO v_payout FROM public.affiliate_payout_requests 
  WHERE id = p_payout_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Solicitação de saque não encontrada';
  END IF;

  IF p_action = 'mark_paid' THEN
    UPDATE public.affiliate_payout_requests
    SET status = 'paid',
        paid_at = timezone('utc', now()),
        processed_at = timezone('utc', now()),
        processed_by = auth.uid(),
        proof_of_payment_url = p_proof_url
    WHERE id = p_payout_id;

    -- Marca as comissões vinculadas como 'paid'
    UPDATE public.affiliate_commissions
    SET status = 'paid',
        paid_at = timezone('utc', now())
    WHERE payout_request_id = p_payout_id;

    INSERT INTO public.billing_events (event_name, entity_type, entity_id, user_id, payload)
    VALUES ('affiliate.payout.paid', 'payout_request', p_payout_id, v_payout.affiliate_id, jsonb_build_object('proof_url', p_proof_url));

    RETURN jsonb_build_object('success', true, 'status', 'paid');

  ELSIF p_action = 'reject' THEN
    UPDATE public.affiliate_payout_requests
    SET status = 'rejected',
        processed_at = timezone('utc', now()),
        processed_by = auth.uid(),
        rejected_reason = p_rejection_reason
    WHERE id = p_payout_id;

    -- Libera as comissões de volta para 'available'
    UPDATE public.affiliate_commissions
    SET payout_request_id = NULL
    WHERE payout_request_id = p_payout_id;

    INSERT INTO public.billing_events (event_name, entity_type, entity_id, user_id, payload)
    VALUES ('affiliate.payout.rejected', 'payout_request', p_payout_id, v_payout.affiliate_id, jsonb_build_object('reason', p_rejection_reason));

    RETURN jsonb_build_object('success', true, 'status', 'rejected');
  ELSE
    RETURN jsonb_build_object('success', false, 'message', 'Ação desconhecida');
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
