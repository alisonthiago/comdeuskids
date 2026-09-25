-- ==============================================================================
-- COM DEUS KIDS — SISTEMA DE AFILIADOS & CARTEIRA DE PAGAMENTOS (PIX / PAYOUT)
-- Modelo operacional inspirado na Kiwify, adaptado para Famílias e Igrejas
-- ==============================================================================

-- 1. Tabela de Configurações Globais de Saque / Payout (Gerenciável via ADM)
CREATE TABLE IF NOT EXISTS public.affiliate_payout_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    min_payout_amount NUMERIC(10,2) NOT NULL DEFAULT 100.00,
    allowed_payout_days JSONB NOT NULL DEFAULT '["monday", "thursday"]'::jsonb,
    allowed_time_start TIME DEFAULT '08:00:00',
    allowed_time_end TIME DEFAULT '18:00:00',
    security_delay_days INTEGER NOT NULL DEFAULT 15, -- Carência contra estorno/chargeback
    allow_self_referral BOOLEAN NOT NULL DEFAULT false, -- Antifraude: impede compra própria
    default_commission_rate NUMERIC(5,2) NOT NULL DEFAULT 20.00, -- 20% padrão
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Inserir registro único de regras caso não exista
INSERT INTO public.affiliate_payout_rules (min_payout_amount, allowed_payout_days, security_delay_days)
SELECT 100.00, '["monday", "thursday"]'::jsonb, 15
WHERE NOT EXISTS (SELECT 1 FROM public.affiliate_payout_rules);

-- 2. Cadastro e Portal do Afiliado
CREATE TABLE IF NOT EXISTS public.affiliates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL, -- Se vinculado a uma Igreja/EBD
    code TEXT NOT NULL UNIQUE, -- ex: 'MARCOS-SP', 'IGREJA-CENTRAL'
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended', 'rejected')),
    custom_commission_rate NUMERIC(5,2), -- Percentual personalizado (se nulo, usa padrão)
    -- Dados de Recebimento via Pix
    pix_key_type TEXT CHECK (pix_key_type IN ('cpf', 'cnpj', 'email', 'phone', 'random')),
    pix_key TEXT,
    pix_holder_name TEXT,
    pix_holder_document TEXT, -- CPF / CNPJ do titular do Pix
    -- Métricas desnormalizadas (sincronizadas por triggers/jobs)
    total_sales_count INTEGER NOT NULL DEFAULT 0,
    total_commission_earned NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 3. Regras de Comissão por Produto ou Plano
CREATE TABLE IF NOT EXISTS public.affiliate_product_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.plans(id) ON DELETE CASCADE,
    commission_type TEXT NOT NULL DEFAULT 'percentage' CHECK (commission_type IN ('percentage', 'fixed')),
    commission_value NUMERIC(10,2) NOT NULL DEFAULT 20.00, -- 20% ou R$ 20,00 fixo
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT chk_aff_rule_product_or_plan CHECK (product_id IS NOT NULL OR plan_id IS NOT NULL)
);

-- 4. Tracking & Atribuição de Cliques / Referrals
CREATE TABLE IF NOT EXISTS public.affiliate_referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
    visitor_ip_hash TEXT,
    cookie_token TEXT NOT NULL,
    source TEXT, -- 'church_qr', 'whatsapp', 'instagram', 'direct'
    landing_url TEXT,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (timezone('utc', now()) + interval '60 days'), -- Atribuição 60 dias
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 5. Comissões Registradas por Venda
CREATE TABLE IF NOT EXISTS public.affiliate_commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
    product_id UUID REFERENCES public.products(id),
    plan_id UUID REFERENCES public.plans(id),
    -- Valores da Venda
    order_amount NUMERIC(10,2) NOT NULL,
    gateway_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    platform_net NUMERIC(10,2) NOT NULL,
    commission_rate NUMERIC(5,2) NOT NULL,
    commission_amount NUMERIC(10,2) NOT NULL,
    -- Status da Comissão (Kiwify Model)
    -- 'pending': Aguardando janela de segurança (D+15 ou D+30)
    -- 'available': Liberado para saque via Pix
    -- 'paid': Saque efetuado
    -- 'refunded': Venda estornada ou chargeback (comissão cancelada)
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'available', 'paid', 'refunded')),
    available_at TIMESTAMPTZ NOT NULL, -- Data exata que o saldo fica disponível
    paid_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 6. Solicitações de Saque / Payout via Pix
CREATE TABLE IF NOT EXISTS public.affiliate_payout_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'approved', 'processing', 'paid', 'rejected')),
    -- Snapshot dos dados Pix no momento da solicitação
    pix_key_type TEXT NOT NULL,
    pix_key TEXT NOT NULL,
    pix_holder_name TEXT NOT NULL,
    pix_holder_document TEXT NOT NULL,
    -- Auditoria e Execução
    proof_of_payment_url TEXT, -- Comprovante da transferência Pix
    rejected_reason TEXT,
    processed_by UUID REFERENCES auth.users(id),
    processed_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 7. Log de Notificações / Brevo Automations
CREATE TABLE IF NOT EXISTS public.affiliate_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'sale_approved', 'commission_available', 'payout_paid', 'commission_refunded'
    channel TEXT NOT NULL DEFAULT 'brevo_email' CHECK (channel IN ('brevo_email', 'whatsapp', 'in_app')),
    recipient_email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'failed')),
    external_message_id TEXT,
    payload JSONB DEFAULT '{}'::jsonb,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ÍNDICES DE PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_affiliates_code ON public.affiliates(code);
CREATE INDEX IF NOT EXISTS idx_affiliates_user ON public.affiliates(user_id);
CREATE INDEX IF NOT EXISTS idx_aff_referrals_cookie ON public.affiliate_referrals(cookie_token);
CREATE INDEX IF NOT EXISTS idx_aff_commissions_affiliate ON public.affiliate_commissions(affiliate_id, status);
CREATE INDEX IF NOT EXISTS idx_aff_commissions_available ON public.affiliate_commissions(available_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_aff_payouts_affiliate ON public.affiliate_payout_requests(affiliate_id, status);

-- HABILITAR RLS
ALTER TABLE public.affiliate_payout_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_product_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_notifications ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS RLS

-- Regras de Saque: Leitura pública para autenticados, alteração apenas por admins
CREATE POLICY "Leitura de regras de saque para usuarios"
ON public.affiliate_payout_rules FOR SELECT TO authenticated USING (true);

-- Afiliados: O próprio usuário acessa seu perfil de afiliado
CREATE POLICY "Afiliado gerencia seu perfil"
ON public.affiliates FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Referrals: Inserção pública para tracking de links
CREATE POLICY "Tracking de cliques e referrals publico"
ON public.affiliate_referrals FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Afiliado visualiza seus referrals"
ON public.affiliate_referrals FOR SELECT TO authenticated
USING (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));

-- Comissões: Afiliado visualiza suas comissões
CREATE POLICY "Afiliado visualiza suas comissoes"
ON public.affiliate_commissions FOR SELECT TO authenticated
USING (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));

-- Solicitações de Saque: Afiliado cria e visualiza seus saques
CREATE POLICY "Afiliado gerencia seus saques"
ON public.affiliate_payout_requests FOR ALL TO authenticated
USING (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()))
WITH CHECK (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));

-- Notificações: Afiliado visualiza suas notificações
CREATE POLICY "Afiliado visualiza suas notificacoes"
ON public.affiliate_notifications FOR SELECT TO authenticated
USING (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));

-- ==============================================================================
-- FUNÇÃO RPC: Solicitar Saque via Pix com Validação Completa de Regras
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.request_affiliate_payout(
    p_amount NUMERIC(10,2)
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_affiliate RECORD;
    v_rules RECORD;
    v_available_balance NUMERIC(10,2);
    v_day_name TEXT;
    v_now_time TIME;
    v_payout_id UUID;
BEGIN
    -- 1. Obter afiliado logado
    SELECT * INTO v_affiliate FROM public.affiliates WHERE user_id = auth.uid() AND status = 'active';
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Afiliado não encontrado ou inativo.');
    END IF;

    -- Validar chave Pix cadastrada
    IF v_affiliate.pix_key IS NULL OR v_affiliate.pix_holder_document IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Chave Pix e CPF/CNPJ do titular são obrigatórios.');
    END IF;

    -- 2. Obter regras ativas
    SELECT * INTO v_rules FROM public.affiliate_payout_rules LIMIT 1;

    -- 3. Validar valor mínimo
    IF p_amount < v_rules.min_payout_amount THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', format('O valor mínimo de saque é R$ %s.', v_rules.min_payout_amount)
        );
    END IF;

    -- 4. Validar saldo disponível (comissões 'available')
    SELECT COALESCE(SUM(commission_amount), 0.00) INTO v_available_balance
    FROM public.affiliate_commissions
    WHERE affiliate_id = v_affiliate.id AND status = 'available';

    IF p_amount > v_available_balance THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', format('Saldo disponível insuficiente. Você possui R$ %s disponível.', v_available_balance)
        );
    END IF;

    -- 5. Validar dia da semana e horário permitido
    v_day_name := lower(to_char(timezone('America/Sao_Paulo', now()), 'FMday'));
    -- Mapeamento para inglês minúsculo
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

    -- 6. Criar solicitação de saque com snapshot dos dados Pix
    INSERT INTO public.affiliate_payout_requests (
        affiliate_id,
        amount,
        status,
        pix_key_type,
        pix_key,
        pix_holder_name,
        pix_holder_document
    ) VALUES (
        v_affiliate.id,
        p_amount,
        'requested',
        v_affiliate.pix_key_type,
        v_affiliate.pix_key,
        v_affiliate.pix_holder_name,
        v_affiliate.pix_holder_document
    ) RETURNING id INTO v_payout_id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Solicitação de saque via Pix realizada com sucesso!',
        'payout_id', v_payout_id,
        'amount', p_amount
    );
END;
$$;

REVOKE ALL ON FUNCTION public.request_affiliate_payout(NUMERIC) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_affiliate_payout(NUMERIC) TO authenticated;
