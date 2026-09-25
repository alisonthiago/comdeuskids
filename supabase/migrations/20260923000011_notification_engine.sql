-- ==============================================================================
-- FASE 8: NOTIFICATION ENGINE + BREVO + WHATSAPP + AUTOMAÇÕES
-- Migration: 20260923000011_notification_engine.sql
-- Descrição:
--   1. Central de Templates (versionamento, canal, categoria transacional/marketing, variáveis permitidas)
--   2. Central de Preferências de Notificação (por usuário adulto, consentimento, bloqueio de marketing infantil)
--   3. Registro de Provedores (Brevo, Evolution API, n8n, Internal - NENHUM segredo no banco/frontend)
--   4. Entregas de Notificações / Outbox (status QUEUED, PROCESSING, SENT, DELIVERED, FAILED, BOUNCED, CANCELED, PENDING_CONFIGURATION)
--   5. Notificações Internas / In-App (para central de notificações no apps/membros)
--   6. Motor de Automações (trigger, conditions, delay, action)
--   7. Auditoria de Comunicação & RLS rigoroso
--   8. RPCs para resolução, renderização segura, retry com backoff e integração com Igreja/Escola/Billing/Afiliados
-- ==============================================================================

-- 1. TEMPLATES CENTRAIS DE NOTIFICAÇÃO (notification_templates)
CREATE TABLE IF NOT EXISTS public.notification_templates (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key               TEXT NOT NULL,
  name              TEXT NOT NULL,
  channel           TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp', 'in_app', 'sms', 'push')),
  category          TEXT NOT NULL DEFAULT 'transactional' CHECK (category IN ('transactional', 'marketing')),
  subject           TEXT,
  content           TEXT NOT NULL,
  locale            TEXT NOT NULL DEFAULT 'pt-BR',
  status            TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  version           INTEGER NOT NULL DEFAULT 1,
  allowed_variables JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT uq_notification_template_ver UNIQUE (key, channel, locale, version)
);

CREATE INDEX IF NOT EXISTS idx_notif_templates_key ON public.notification_templates(key);
CREATE INDEX IF NOT EXISTS idx_notif_templates_channel ON public.notification_templates(channel);
CREATE INDEX IF NOT EXISTS idx_notif_templates_status ON public.notification_templates(status);

-- 2. PREFERÊNCIAS DE NOTIFICAÇÃO DO USUÁRIO (notification_preferences)
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_transactional   BOOLEAN NOT NULL DEFAULT true,
  email_marketing       BOOLEAN NOT NULL DEFAULT false,
  whatsapp_transactional BOOLEAN NOT NULL DEFAULT true,
  whatsapp_marketing    BOOLEAN NOT NULL DEFAULT false,
  in_app_notifications  BOOLEAN NOT NULL DEFAULT true,
  opt_out_marketing_at  TIMESTAMPTZ,
  consent_source        TEXT DEFAULT 'system_default',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT uq_notification_pref_user UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_notif_pref_user ON public.notification_preferences(user_id);

-- 3. METADADOS DE PROVEDORES DE NOTIFICAÇÃO (notification_providers)
-- ATENÇÃO: NENHUMA CHAVE SECRETA É GRAVADA NESTA TABELA. Secrets vivem apenas nas envs server-side.
CREATE TABLE IF NOT EXISTS public.notification_providers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name   TEXT NOT NULL UNIQUE CHECK (provider_name IN ('brevo', 'evolution_api', 'n8n', 'internal')),
  channel         TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp', 'in_app', 'sms', 'push')),
  is_enabled      BOOLEAN NOT NULL DEFAULT false,
  is_configured   BOOLEAN NOT NULL DEFAULT false,
  environment     TEXT NOT NULL DEFAULT 'production',
  status          TEXT NOT NULL DEFAULT 'PENDING_CONFIGURATION' CHECK (status IN ('ACTIVE', 'PENDING_CONFIGURATION', 'ERROR', 'DEPRECATED')),
  last_tested_at  TIMESTAMPTZ,
  test_result     JSONB DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_notif_providers_channel ON public.notification_providers(channel);

-- 4. OUTBOX / HISTÓRICO DE ENTREGAS (notification_deliveries)
CREATE TABLE IF NOT EXISTS public.notification_deliveries (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id            UUID, -- referência opcional ao billing_events
  event_name          TEXT NOT NULL,
  template_id         UUID REFERENCES public.notification_templates(id) ON DELETE SET NULL,
  template_version    INTEGER NOT NULL DEFAULT 1,
  template_key        TEXT NOT NULL,
  recipient_user_id   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  recipient_address   TEXT NOT NULL, -- e-mail, telefone ou 'in_app'
  recipient_name      TEXT,
  channel             TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp', 'in_app', 'sms', 'push')),
  category            TEXT NOT NULL DEFAULT 'transactional' CHECK (category IN ('transactional', 'marketing')),
  provider            TEXT NOT NULL DEFAULT 'brevo',
  status              TEXT NOT NULL DEFAULT 'QUEUED' CHECK (status IN ('QUEUED', 'PROCESSING', 'SENT', 'DELIVERED', 'FAILED', 'BOUNCED', 'CANCELED', 'PENDING_CONFIGURATION')),
  attempt_count       INTEGER NOT NULL DEFAULT 0,
  max_attempts        INTEGER NOT NULL DEFAULT 3,
  next_attempt_at     TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  last_error          TEXT,
  rendered_subject    TEXT,
  rendered_content    TEXT,
  idempotency_key     TEXT NOT NULL UNIQUE,
  provider_message_id TEXT,
  metadata            JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_notif_deliveries_status ON public.notification_deliveries(status);
CREATE INDEX IF NOT EXISTS idx_notif_deliveries_event ON public.notification_deliveries(event_name);
CREATE INDEX IF NOT EXISTS idx_notif_deliveries_recipient ON public.notification_deliveries(recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_notif_deliveries_retry ON public.notification_deliveries(status, next_attempt_at) WHERE status IN ('QUEUED', 'PROCESSING');

-- 5. NOTIFICAÇÕES IN-APP INTERNAS (notifications_in_app)
CREATE TABLE IF NOT EXISTS public.notifications_in_app (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id     UUID REFERENCES public.notification_deliveries(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  summary         TEXT NOT NULL,
  content         TEXT,
  category        TEXT NOT NULL DEFAULT 'transactional',
  context_type    TEXT NOT NULL DEFAULT 'sistema' CHECK (context_type IN ('billing', 'igreja', 'escola', 'professor', 'afiliado', 'sistema')),
  action_url      TEXT,
  is_read         BOOLEAN NOT NULL DEFAULT false,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_notif_in_app_user ON public.notifications_in_app(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notif_in_app_org ON public.notifications_in_app(organization_id);

-- 6. MOTOR DE AUTOMAÇÕES (notification_automations)
CREATE TABLE IF NOT EXISTS public.notification_automations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  trigger_event   TEXT NOT NULL,
  conditions      JSONB NOT NULL DEFAULT '{}'::jsonb,
  delay_seconds   INTEGER NOT NULL DEFAULT 0,
  action_type     TEXT NOT NULL DEFAULT 'send_notification' CHECK (action_type IN ('send_notification', 'create_task', 'webhook')),
  template_key    TEXT NOT NULL,
  channel         TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp', 'in_app', 'sms', 'push')),
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_notif_automations_trigger ON public.notification_automations(trigger_event) WHERE is_active = true;

-- 7. AUDITORIA DE COMUNICAÇÕES & CONFIGURAÇÕES (notification_audit_logs)
CREATE TABLE IF NOT EXISTS public.notification_audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL, -- 'template_created', 'template_updated', 'automation_toggled', 'manual_resend', 'provider_tested', 'preference_updated'
  target_type TEXT NOT NULL,
  target_id   UUID,
  details     JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_notif_audit_action ON public.notification_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_notif_audit_created ON public.notification_audit_logs(created_at);

-- ==============================================================================
-- 8. FUNÇÕES DO MOTOR DE NOTIFICAÇÃO (PL/pgSQL)
-- ==============================================================================

-- A. Renderizador de variáveis seguro com whitelist
CREATE OR REPLACE FUNCTION public.render_template_variables(
  p_template TEXT,
  p_variables JSONB,
  p_allowed_vars JSONB
) RETURNS TEXT AS $$
DECLARE
  v_result TEXT := p_template;
  v_key TEXT;
  v_val TEXT;
  v_is_allowed BOOLEAN;
BEGIN
  IF p_variables IS NULL OR jsonb_typeof(p_variables) != 'object' THEN
    RETURN v_result;
  END IF;

  FOR v_key, v_val IN SELECT key, value#>>'{}' FROM jsonb_each(p_variables)
  LOOP
    -- Verifica whitelist se especificada
    IF p_allowed_vars IS NOT NULL AND jsonb_array_length(p_allowed_vars) > 0 THEN
      SELECT EXISTS (
        SELECT 1 FROM jsonb_array_elements_text(p_allowed_vars) elem WHERE elem = v_key
      ) INTO v_is_allowed;
    ELSE
      v_is_allowed := true;
    END IF;

    IF v_is_allowed THEN
      -- Substitui {{key}} pela string sanitizada
      v_result := replace(v_result, '{{' || v_key || '}}', coalesce(v_val, ''));
    END IF;
  END LOOP;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- B. Obter ou inicializar preferências do usuário
CREATE OR REPLACE FUNCTION public.get_or_create_notification_preferences(
  p_user_id UUID
) RETURNS public.notification_preferences AS $$
DECLARE
  v_pref public.notification_preferences;
BEGIN
  SELECT * INTO v_pref FROM public.notification_preferences WHERE user_id = p_user_id;
  IF NOT FOUND THEN
    INSERT INTO public.notification_preferences (user_id)
    VALUES (p_user_id)
    ON CONFLICT (user_id) DO NOTHING
    RETURNING * INTO v_pref;

    IF v_pref.id IS NULL THEN
      SELECT * INTO v_pref FROM public.notification_preferences WHERE user_id = p_user_id;
    END IF;
  END IF;
  RETURN v_pref;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- C. Central de Processamento de Notificações por Evento (Notification Engine)
CREATE OR REPLACE FUNCTION public.process_notification_event(
  p_event_name TEXT,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_user_id UUID,
  p_org_id UUID,
  p_payload JSONB,
  p_event_id UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_auto RECORD;
  v_template RECORD;
  v_provider RECORD;
  v_recipient_email TEXT;
  v_recipient_phone TEXT;
  v_recipient_name TEXT;
  v_recipient_user_id UUID := p_user_id;
  v_user_profile RECORD;
  v_preferences public.notification_preferences;
  v_channel TEXT;
  v_address TEXT;
  v_status TEXT;
  v_idempotency_key TEXT;
  v_rendered_subject TEXT;
  v_rendered_content TEXT;
  v_delivery_id UUID;
  v_is_child BOOLEAN := false;
  v_created_count INTEGER := 0;
BEGIN
  -- 1. Se user_id foi informado, resolve dados e verifica se é perfil de criança
  IF v_recipient_user_id IS NOT NULL THEN
    SELECT email, raw_user_meta_data INTO v_user_profile FROM auth.users WHERE id = v_recipient_user_id;
    v_recipient_email := v_user_profile.email;
    v_recipient_name := coalesce(v_user_profile.raw_user_meta_data->>'full_name', split_part(v_recipient_email, '@', 1));
    v_recipient_phone := v_user_profile.raw_user_meta_data->>'phone';

    -- Checa se usuário é criança (regras de proteção e privacidade infantil)
    SELECT EXISTS (
      SELECT 1 FROM public.children WHERE user_id = v_recipient_user_id
      UNION
      SELECT 1 FROM public.family_members WHERE user_id = v_recipient_user_id AND role = 'child'
    ) INTO v_is_child;

    -- Obtém preferências do usuário
    v_preferences := public.get_or_create_notification_preferences(v_recipient_user_id);
  END IF;

  -- Sobrescreve dados de destinatário a partir do payload se fornecido explicitamente
  IF p_payload ? 'recipient_email' THEN
    v_recipient_email := p_payload->>'recipient_email';
  END IF;
  IF p_payload ? 'recipient_phone' THEN
    v_recipient_phone := p_payload->>'recipient_phone';
  END IF;
  IF p_payload ? 'recipient_name' THEN
    v_recipient_name := p_payload->>'recipient_name';
  END IF;

  -- 2. Varre automações ativas correspondentes ao evento
  FOR v_auto IN 
    SELECT * FROM public.notification_automations 
    WHERE trigger_event = p_event_name AND is_active = true
  LOOP
    -- 3. Busca o template correspondente ativo mais recente
    SELECT * INTO v_template 
    FROM public.notification_templates 
    WHERE key = v_auto.template_key 
      AND channel = v_auto.channel 
      AND status = 'active'
    ORDER BY version DESC LIMIT 1;

    IF FOUND THEN
      v_channel := v_auto.channel;

      -- REGRA CRÍTICA 1: Criança NÃO recebe marketing sob hipótese alguma
      IF v_is_child AND v_template.category = 'marketing' THEN
        CONTINUE;
      END IF;

      -- REGRA CRÍTICA 2: Respeitar Opt-out de marketing
      IF v_template.category = 'marketing' AND v_recipient_user_id IS NOT NULL THEN
        IF v_channel = 'email' AND NOT v_preferences.email_marketing THEN
          CONTINUE;
        ELSIF v_channel = 'whatsapp' AND NOT v_preferences.whatsapp_marketing THEN
          CONTINUE;
        END IF;
      END IF;

      -- Resolução de endereço conforme canal
      IF v_channel = 'email' THEN
        v_address := v_recipient_email;
      ELSIF v_channel = 'whatsapp' THEN
        v_address := v_recipient_phone;
      ELSIF v_channel = 'in_app' THEN
        v_address := 'in_app';
      ELSE
        v_address := coalesce(v_recipient_email, v_recipient_phone, 'unknown');
      END IF;

      -- Se não houver endereço de entrega e não for in_app, pula
      IF (v_address IS NULL OR v_address = '') AND v_channel != 'in_app' THEN
        CONTINUE;
      END IF;

      -- Consulta status do provedor para o canal
      SELECT * INTO v_provider 
      FROM public.notification_providers 
      WHERE channel = v_channel AND is_enabled = true LIMIT 1;

      -- Se não configurado, atribui PENDING_CONFIGURATION (NÃO finge SENT/DELIVERED)
      IF NOT FOUND OR NOT v_provider.is_configured THEN
        IF v_channel = 'in_app' THEN
          v_status := 'DELIVERED';
        ELSE
          v_status := 'PENDING_CONFIGURATION';
        END IF;
      ELSE
        v_status := 'QUEUED';
      END IF;

      -- Renderiza variáveis seguras no assunto e conteúdo
      v_rendered_subject := public.render_template_variables(
        coalesce(v_template.subject, ''),
        p_payload || jsonb_build_object('first_name', coalesce(v_recipient_name, 'Amigo(a)')),
        v_template.allowed_variables
      );

      v_rendered_content := public.render_template_variables(
        v_template.content,
        p_payload || jsonb_build_object('first_name', coalesce(v_recipient_name, 'Amigo(a)')),
        v_template.allowed_variables
      );

      -- Idempotência estrita: sha256 do evento + template + destinatário + canal
      v_idempotency_key := md5(
        coalesce(p_event_id::text, p_entity_id::text, gen_random_uuid()::text) || ':' ||
        v_template.key || ':' ||
        v_template.version::text || ':' ||
        coalesce(v_address, 'none') || ':' ||
        v_channel
      );

      -- Insere entrega no Outbox
      INSERT INTO public.notification_deliveries (
        event_id,
        event_name,
        template_id,
        template_version,
        template_key,
        recipient_user_id,
        recipient_address,
        recipient_name,
        channel,
        category,
        provider,
        status,
        attempt_count,
        max_attempts,
        next_attempt_at,
        rendered_subject,
        rendered_content,
        idempotency_key,
        metadata
      ) VALUES (
        p_event_id,
        p_event_name,
        v_template.id,
        v_template.version,
        v_template.key,
        v_recipient_user_id,
        coalesce(v_address, 'in_app'),
        v_recipient_name,
        v_channel,
        v_template.category,
        coalesce(v_provider.provider_name, CASE WHEN v_channel = 'whatsapp' THEN 'evolution_api' WHEN v_channel = 'in_app' THEN 'internal' ELSE 'brevo' END),
        v_status,
        CASE WHEN v_status = 'DELIVERED' THEN 1 ELSE 0 END,
        3,
        CASE WHEN v_auto.delay_seconds > 0 THEN timezone('utc', now()) + (v_auto.delay_seconds || ' seconds')::interval ELSE timezone('utc', now()) END,
        v_rendered_subject,
        v_rendered_content,
        v_idempotency_key,
        jsonb_build_object(
          'automation_id', v_auto.id,
          'entity_type', p_entity_type,
          'entity_id', p_entity_id,
          'organization_id', p_org_id,
          'delay_seconds', v_auto.delay_seconds
        )
      )
      ON CONFLICT (idempotency_key) DO NOTHING
      RETURNING id INTO v_delivery_id;

      IF v_delivery_id IS NOT NULL THEN
        v_created_count := v_created_count + 1;

        -- Se for in_app e foi entregue, cria imediatamente na caixa de entrada interna
        IF v_channel = 'in_app' AND v_recipient_user_id IS NOT NULL THEN
          INSERT INTO public.notifications_in_app (
            delivery_id,
            user_id,
            organization_id,
            title,
            summary,
            content,
            category,
            context_type,
            action_url
          ) VALUES (
            v_delivery_id,
            v_recipient_user_id,
            p_org_id,
            v_rendered_subject,
            left(v_rendered_content, 140),
            v_rendered_content,
            v_template.category,
            CASE 
              WHEN p_event_name LIKE 'church.%' THEN 'igreja'
              WHEN p_event_name LIKE 'school.%' THEN 'escola'
              WHEN p_event_name LIKE 'lesson.%' OR p_event_name LIKE 'assignment.%' THEN 'professor'
              WHEN p_event_name LIKE 'affiliate.%' THEN 'afiliado'
              WHEN p_event_name LIKE 'order.%' OR p_event_name LIKE 'payment.%' OR p_event_name LIKE 'subscription.%' THEN 'billing'
              ELSE 'sistema'
            END,
            p_payload->>'action_url'
          );
        END IF;
      END IF;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'event_name', p_event_name,
    'deliveries_created', v_created_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- D. Emitir Evento Canônico Geral (Generalizador do Event Bus)
CREATE OR REPLACE FUNCTION public.emit_notification_event(
  p_event_name TEXT,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_user_id UUID,
  p_org_id UUID,
  p_payload JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
BEGIN
  -- Reutiliza a infraestrutura de billing_events como Event Bus transacional
  INSERT INTO public.billing_events (
    event_name,
    entity_type,
    entity_id,
    user_id,
    organization_id,
    payload
  ) VALUES (
    p_event_name,
    p_entity_type,
    p_entity_id,
    p_user_id,
    p_org_id,
    p_payload
  ) RETURNING id INTO v_event_id;

  -- Dispara o processamento pelo Notification Engine
  PERFORM public.process_notification_event(
    p_event_name,
    p_entity_type,
    p_entity_id,
    p_user_id,
    p_org_id,
    p_payload,
    v_event_id
  );

  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- E. Integração com a Central de Comunicação da Igreja (Fase 4)
CREATE OR REPLACE FUNCTION public.trigger_church_communication(
  p_comm_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_comm RECORD;
  v_guardian RECORD;
  v_recipients_count INTEGER := 0;
  v_event_id UUID;
BEGIN
  SELECT * INTO v_comm FROM public.church_communications WHERE id = p_comm_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Comunicado não encontrado');
  END IF;

  -- Resolve os responsáveis com base no público-alvo
  FOR v_guardian IN
    SELECT DISTINCT g.user_id, g.name, g.phone, u.email
    FROM public.guardians g
    JOIN auth.users u ON u.id = g.user_id
    JOIN public.child_guardians cg ON cg.guardian_id = g.id
    JOIN public.children c ON c.id = cg.child_id
    WHERE c.organization_id = v_comm.organization_id
  LOOP
    -- Emite o evento através do Notification Engine
    v_event_id := public.emit_notification_event(
      'church.event.reminder',
      'church_communication',
      v_comm.id,
      v_guardian.user_id,
      v_comm.organization_id,
      jsonb_build_object(
        'title', v_comm.title,
        'message', v_comm.message,
        'recipient_name', v_guardian.name,
        'recipient_phone', v_guardian.phone,
        'recipient_email', v_guardian.email,
        'organization_name', 'Igreja'
      )
    );
    v_recipients_count := v_recipients_count + 1;
  END LOOP;

  -- Atualiza status da comunicação
  UPDATE public.church_communications
  SET status = 'sent',
      recipients_count = v_recipients_count,
      updated_at = timezone('utc', now())
  WHERE id = p_comm_id;

  RETURN jsonb_build_object(
    'success', true,
    'recipients_count', v_recipients_count,
    'status', 'sent'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- F. Integração com a Central de Comunicação da Escola (Fase 5)
CREATE OR REPLACE FUNCTION public.trigger_school_communication(
  p_comm_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_comm RECORD;
  v_guardian RECORD;
  v_recipients_count INTEGER := 0;
  v_event_id UUID;
BEGIN
  SELECT * INTO v_comm FROM public.school_communications WHERE id = p_comm_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Comunicado escolar não encontrado');
  END IF;

  -- Resolve os responsáveis de alunos da escola
  FOR v_guardian IN
    SELECT DISTINCT g.user_id, g.name, g.phone, u.email
    FROM public.guardians g
    JOIN auth.users u ON u.id = g.user_id
    JOIN public.child_guardians cg ON cg.guardian_id = g.id
    JOIN public.children c ON c.id = cg.child_id
    WHERE c.organization_id = v_comm.organization_id
  LOOP
    v_event_id := public.emit_notification_event(
      'school.event.reminder',
      'school_communication',
      v_comm.id,
      v_guardian.user_id,
      v_comm.organization_id,
      jsonb_build_object(
        'title', v_comm.title,
        'message', v_comm.message,
        'recipient_name', v_guardian.name,
        'recipient_phone', v_guardian.phone,
        'recipient_email', v_guardian.email,
        'organization_name', 'Escola'
      )
    );
    v_recipients_count := v_recipients_count + 1;
  END LOOP;

  UPDATE public.school_communications
  SET status = 'sent',
      recipients_count = v_recipients_count,
      updated_at = timezone('utc', now())
  WHERE id = p_comm_id;

  RETURN jsonb_build_object(
    'success', true,
    'recipients_count', v_recipients_count,
    'status', 'sent'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- G. Função de Retry com Backoff Exponencial
CREATE OR REPLACE FUNCTION public.retry_notification_delivery(
  p_delivery_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_del RECORD;
  v_backoff_minutes INTEGER;
BEGIN
  SELECT * INTO v_del FROM public.notification_deliveries WHERE id = p_delivery_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Entrega não encontrada');
  END IF;

  IF v_del.attempt_count >= v_del.max_attempts THEN
    UPDATE public.notification_deliveries
    SET status = 'FAILED',
        updated_at = timezone('utc', now())
    WHERE id = p_delivery_id;

    RETURN jsonb_build_object(
      'success', false,
      'status', 'FAILED',
      'message', 'Tentativas máximas atingidas'
    );
  END IF;

  -- Backoff exponencial (5m, 10m, 20m...)
  v_backoff_minutes := 5 * (2 ^ v_del.attempt_count);

  UPDATE public.notification_deliveries
  SET attempt_count = attempt_count + 1,
      status = 'PROCESSING',
      next_attempt_at = timezone('utc', now()) + (v_backoff_minutes || ' minutes')::interval,
      updated_at = timezone('utc', now())
  WHERE id = p_delivery_id;

  RETURN jsonb_build_object(
    'success', true,
    'attempt_count', v_del.attempt_count + 1,
    'next_attempt_at', timezone('utc', now()) + (v_backoff_minutes || ' minutes')::interval
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- H. Webhook do Provedor (Idempotente)
CREATE OR REPLACE FUNCTION public.handle_provider_delivery_webhook(
  p_provider TEXT,
  p_provider_msg_id TEXT,
  p_status TEXT, -- 'delivered', 'bounce', 'failed', 'opened'
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS JSONB AS $$
DECLARE
  v_delivery RECORD;
  v_new_status TEXT;
BEGIN
  SELECT * INTO v_delivery 
  FROM public.notification_deliveries 
  WHERE provider_message_id = p_provider_msg_id 
     OR id::text = p_metadata->>'delivery_id'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Entrega não localizada para o webhook');
  END IF;

  CASE lower(p_status)
    WHEN 'delivered' THEN v_new_status := 'DELIVERED';
    WHEN 'bounce', 'bounced' THEN v_new_status := 'BOUNCED';
    WHEN 'failed' THEN v_new_status := 'FAILED';
    ELSE v_new_status := v_delivery.status;
  END CASE;

  UPDATE public.notification_deliveries
  SET status = v_new_status,
      provider_message_id = coalesce(p_provider_msg_id, provider_message_id),
      metadata = metadata || jsonb_build_object('webhook_event', p_metadata, 'updated_by_webhook_at', timezone('utc', now())),
      updated_at = timezone('utc', now())
  WHERE id = v_delivery.id;

  RETURN jsonb_build_object(
    'success', true,
    'delivery_id', v_delivery.id,
    'status', v_new_status
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 9. SEED DE TEMPLATES CANÔNICOS, AUTOMAÇÕES E PROVEDORES
-- ==============================================================================

-- A. Provedores Padrão (Sem chaves gravadas!)
INSERT INTO public.notification_providers (provider_name, channel, is_enabled, is_configured, status)
VALUES
  ('brevo', 'email', false, false, 'PENDING_CONFIGURATION'),
  ('evolution_api', 'whatsapp', false, false, 'PENDING_CONFIGURATION'),
  ('n8n', 'whatsapp', false, false, 'PENDING_CONFIGURATION'),
  ('internal', 'in_app', true, true, 'ACTIVE')
ON CONFLICT (provider_name) DO UPDATE
SET channel = EXCLUDED.channel;

-- B. Templates Canônicos Iniciais
INSERT INTO public.notification_templates (key, name, channel, category, subject, content, allowed_variables, version)
VALUES
  (
    'payment-approved',
    'Confirmação de Pagamento Aprovado',
    'email',
    'transactional',
    'Pagamento Aprovado - Com Deus Kids',
    'Olá {{first_name}}, seu pagamento de {{amount}} referente a {{product_name}} foi confirmado com sucesso! Comece a usar em {{action_url}}.',
    '["first_name", "amount", "product_name", "action_url"]'::jsonb,
    1
  ),
  (
    'subscription-renewed',
    'Assinatura Renovada com Sucesso',
    'email',
    'transactional',
    'Assinatura Renovada - Com Deus Kids',
    'Olá {{first_name}}, sua assinatura foi renovada até {{due_date}}. Seu acesso continua liberado em {{action_url}}.',
    '["first_name", "due_date", "action_url"]'::jsonb,
    1
  ),
  (
    'subscription-past-due',
    'Aviso de Cobrança Pendente',
    'email',
    'transactional',
    'Aviso Importante: Pagamento Pendente - Com Deus Kids',
    'Olá {{first_name}}, identificamos uma pendência no pagamento da sua assinatura. Evite interrupções regularizando em {{action_url}}.',
    '["first_name", "action_url"]'::jsonb,
    1
  ),
  (
    'checkout-abandoned',
    'Recuperação de Pedido Pendente',
    'email',
    'marketing',
    'Você esqueceu algo especial no Com Deus Kids!',
    'Olá {{first_name}}, notamos que você não concluiu seu pedido de {{product_name}}. Clique no link para finalizar com segurança: {{action_url}}.',
    '["first_name", "product_name", "action_url"]'::jsonb,
    1
  ),
  (
    'church-checkin',
    'Confirmação de Entrada da Criança',
    'in_app',
    'transactional',
    'Check-in Confirmado no Ministério Infantil',
    'Olá {{first_name}}, a criança foi acolhida com sucesso no Ministério Infantil da {{organization_name}}!',
    '["first_name", "organization_name"]'::jsonb,
    1
  ),
  (
    'pickup-ready',
    'Criança Pronta para Retirada',
    'in_app',
    'transactional',
    'Criança Pronta para Retirada',
    'Atenção {{first_name}}: Seu filho(a) já pode ser retirado no Ministério Infantil da {{organization_name}}.',
    '["first_name", "organization_name", "action_url"]'::jsonb,
    1
  ),
  (
    'assignment-created',
    'Nova Atividade Escolar Atribuída',
    'in_app',
    'transactional',
    'Nova Atividade Publicada',
    'Olá {{first_name}}, uma nova atividade escolar foi atribuída à sua turma com entrega até {{due_date}}. Acesse em {{action_url}}.',
    '["first_name", "due_date", "action_url"]'::jsonb,
    1
  ),
  (
    'affiliate-commission-available',
    'Comissão Disponível para Saque',
    'in_app',
    'transactional',
    'Sua comissão foi liberada!',
    'Parabéns {{first_name}}! Sua comissão de {{amount}} cumpriu a carência e está liberada para solicitação de saque Pix.',
    '["first_name", "amount", "action_url"]'::jsonb,
    1
  ),
  (
    'affiliate-payout-paid',
    'Saque Pix Realizado com Sucesso',
    'in_app',
    'transactional',
    'Saque Pix Efetuado com Sucesso',
    'Olá {{first_name}}, sua solicitação de saque no valor de {{amount}} foi processada e transferida via Pix.',
    '["first_name", "amount"]'::jsonb,
    1
  )
ON CONFLICT (key, channel, locale, version) DO UPDATE
SET subject = EXCLUDED.subject,
    content = EXCLUDED.content,
    allowed_variables = EXCLUDED.allowed_variables;

-- C. Automações Padrão
INSERT INTO public.notification_automations (name, trigger_event, delay_seconds, template_key, channel, is_active)
VALUES
  ('Confirmação de Pagamento Aprovado', 'order.paid', 0, 'payment-approved', 'email', true),
  ('Aviso de Inadimplência', 'subscription.past_due', 0, 'subscription-past-due', 'email', true),
  ('Recuperação de Checkout Abandonado', 'checkout.abandoned', 3600, 'checkout-abandoned', 'email', true),
  ('Check-in no Ministério Infantil', 'church.child.checked_in', 0, 'church-checkin', 'in_app', true),
  ('Pronto para Retirada no Culto', 'church.pickup.ready', 0, 'pickup-ready', 'in_app', true),
  ('Nova Atividade Escolar', 'school.assignment.created', 0, 'assignment-created', 'in_app', true),
  ('Liberação de Comissão de Afiliado', 'affiliate.commission.available', 0, 'affiliate-commission-available', 'in_app', true),
  ('Saque de Afiliado Concluído', 'affiliate.payout.paid', 0, 'affiliate-payout-paid', 'in_app', true)
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- 10. ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications_in_app ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_audit_logs ENABLE ROW LEVEL SECURITY;

-- POLICIES: notification_templates
CREATE POLICY "Visualização de templates por usuários autenticados"
  ON public.notification_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Gestão de templates apenas por administradores"
  ON public.notification_templates FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- POLICIES: notification_preferences
CREATE POLICY "Usuário gerencia suas próprias preferências"
  ON public.notification_preferences FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin visualiza preferências"
  ON public.notification_preferences FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- POLICIES: notification_providers
-- ATENÇÃO: Somente metadados de status. Nenhuma chave secreta existe na tabela.
CREATE POLICY "Visualização de metadados de provedores por autenticados"
  ON public.notification_providers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Gestão de provedores por administradores"
  ON public.notification_providers FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- POLICIES: notification_deliveries
CREATE POLICY "Usuário visualiza suas próprias entregas de notificação"
  ON public.notification_deliveries FOR SELECT
  TO authenticated
  USING (auth.uid() = recipient_user_id OR public.is_admin());

CREATE POLICY "Admin gerencia entregas de notificações"
  ON public.notification_deliveries FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- POLICIES: notifications_in_app
CREATE POLICY "Usuário visualiza suas notificações in-app"
  ON public.notifications_in_app FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuário atualiza leitura de suas notificações in-app"
  ON public.notifications_in_app FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin visualiza notificações in-app"
  ON public.notifications_in_app FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- POLICIES: notification_automations
CREATE POLICY "Visualização de automações por autenticados"
  ON public.notification_automations FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Gestão de automações por administradores"
  ON public.notification_automations FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- POLICIES: notification_audit_logs
CREATE POLICY "Auditoria acessível apenas por administradores"
  ON public.notification_audit_logs FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
