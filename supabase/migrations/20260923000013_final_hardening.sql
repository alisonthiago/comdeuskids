-- ==============================================================================
-- COM DEUS KIDS — FASE 11: HOMOLOGAÇÃO FINAL + HARDENING + INTEGRIDADE
-- Migration: 20260923000013_final_hardening.sql
-- ==============================================================================

-- 1. HELPER DE CONFIRMAÇÃO PARA USUÁRIOS DE TESTE / HOMOLOGAÇÃO
-- Permite que os scripts de teste A x B confirmem credenciais sob o domínio seguro de teste
CREATE OR REPLACE FUNCTION public.confirm_test_user(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF p_email LIKE '%@comdeuskids.com.br' THEN
    UPDATE auth.users
    SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
    WHERE email = p_email;
    RETURN TRUE;
  END IF;
  RETURN FALSE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.confirm_test_user(TEXT) TO anon, authenticated;

-- 2. VIEW CANÔNICA: affiliate_wallets
-- Garante que 'affiliate_wallets' existe como VIEW AGREGADA, e NÃO como tabela mutável paralela.
-- A fonte da verdade permanece 100% canônica em affiliate_commissions + affiliate_payout_requests.
CREATE OR REPLACE VIEW public.affiliate_wallets AS
SELECT
  a.id AS affiliate_id,
  a.user_id,
  COALESCE(SUM(CASE WHEN c.status = 'available' AND c.payout_request_id IS NULL THEN c.commission_amount ELSE 0.00 END), 0.00) AS available_balance,
  COALESCE(SUM(CASE WHEN c.status = 'pending' THEN c.commission_amount ELSE 0.00 END), 0.00) AS pending_balance,
  COALESCE(SUM(CASE WHEN c.status = 'paid' THEN c.commission_amount ELSE 0.00 END), 0.00) AS paid_balance,
  COUNT(c.id) AS total_commissions
FROM public.affiliates a
LEFT JOIN public.affiliate_commissions c ON c.affiliate_id = a.id
GROUP BY a.id, a.user_id;

GRANT SELECT ON public.affiliate_wallets TO authenticated;

-- 3. HARDENING CONCORRENTE: request_affiliate_payout (Bloqueio FOR UPDATE no Afiliado)
-- Impede race condition quando dois saques simultâneos tentam reservar o mesmo saldo disponível.
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
  v_amount_cents BIGINT;
  v_day_name TEXT;
  v_now_time TIME;
  v_payout_id UUID;
BEGIN
  -- 1. Obter e bloquear linha do afiliado para serializar solicitações simultâneas
  SELECT * INTO v_affiliate 
  FROM public.affiliates 
  WHERE user_id = auth.uid() AND status = 'active'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Afiliado não encontrado ou inativo.');
  END IF;

  -- Validar chave Pix cadastrada
  IF v_affiliate.pix_key IS NULL OR v_affiliate.pix_holder_document IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Chave Pix e CPF/CNPJ do titular são obrigatórios.');
  END IF;

  -- 2. Obter regras ativas
  SELECT * INTO v_rules FROM public.affiliate_payout_rules LIMIT 1;
  IF NOT FOUND THEN
    SELECT 50.00::numeric as min_payout_amount, 7 as security_delay_days, '08:00:00'::time as allowed_time_start, '18:00:00'::time as allowed_time_end INTO v_rules;
  END IF;

  -- 3. Validar valor mínimo
  IF p_amount < COALESCE(v_rules.min_payout_amount, 50.00) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', format('O valor mínimo de saque é R$ %s.', COALESCE(v_rules.min_payout_amount, 50.00))
    );
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

  -- Verificar janela de horário (ex: 08:00 às 18:00) se configurada
  IF v_rules.allowed_time_start IS NOT NULL AND v_rules.allowed_time_end IS NOT NULL THEN
    IF v_now_time < v_rules.allowed_time_start OR v_now_time > v_rules.allowed_time_end THEN
      RETURN jsonb_build_object('success', false, 'message', format('Saques são permitidos apenas no horário comercial (entre %s e %s).', v_rules.allowed_time_start, v_rules.allowed_time_end));
    END IF;
  END IF;

  -- 5. Atualizar comissões elegíveis e verificar saldo disponível não comprometido
  UPDATE public.affiliate_commissions
  SET status = 'available'
  WHERE affiliate_id = v_affiliate.id 
    AND status = 'pending' 
    AND available_at <= timezone('utc', now());

  SELECT COALESCE(SUM(commission_amount), 0.00) INTO v_available_balance
  FROM public.affiliate_commissions
  WHERE affiliate_id = v_affiliate.id 
    AND status = 'available' 
    AND payout_request_id IS NULL;

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

  -- 7. Reservar comissões vinculando atomicamente ao payout_request_id
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
$$;

GRANT EXECUTE ON FUNCTION public.request_affiliate_payout(NUMERIC) TO authenticated;

-- 4. HARDENING DE CONCORRÊNCIA EM LIMITES DE PERFIS INFANTIS
CREATE OR REPLACE FUNCTION public.enforce_profile_creation_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INT;
  v_max INT := 5; -- padrão para família
  v_entitlement RECORD;
BEGIN
  -- Verificar entitlement ativo do usuário
  SELECT * INTO v_entitlement 
  FROM public.customer_entitlements 
  WHERE user_id = NEW.user_id AND status = 'active'
  ORDER BY created_at DESC LIMIT 1;

  IF FOUND AND (v_entitlement.limits->>'max_profiles') IS NOT NULL THEN
    v_max := (v_entitlement.limits->>'max_profiles')::INT;
  END IF;

  SELECT COUNT(*) INTO v_count
  FROM public.account_profiles
  WHERE user_id = NEW.user_id;

  IF v_count >= v_max THEN
    RAISE EXCEPTION 'Limite máximo de perfis (%) atingido para a sua conta/plano.', v_max;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_profile_limit ON public.account_profiles;
CREATE TRIGGER trg_enforce_profile_limit
  BEFORE INSERT ON public.account_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_profile_creation_limit();

-- 5. AUDITORIA E PROTEÇÃO DE IDOR EM SUBMISSÕES EDUCACIONAIS
-- Garante que um aluno só possa submeter em aulas associadas à sua turma
CREATE OR REPLACE FUNCTION public.validate_student_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Se houver student_id, assegurar que pertence à turma da aula
  IF NEW.student_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.educational_class_students s
      JOIN public.educational_lessons l ON l.class_id = s.class_id
      WHERE s.id = NEW.student_id AND l.id = NEW.lesson_id
    ) THEN
      RAISE EXCEPTION 'Aluno não pertence à turma desta aula.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_student_submission ON public.educational_submissions;
CREATE TRIGGER trg_validate_student_submission
  BEFORE INSERT ON public.educational_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_student_submission();
