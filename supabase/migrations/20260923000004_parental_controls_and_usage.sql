-- ============================================================
-- COM DEUS KIDS — Migration 20260923000004
-- Fase 2: Central da Família & Controle Parental Robusto
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- 1. EXTENSÃO SEGURA DE account_profiles
ALTER TABLE public.account_profiles
  ADD COLUMN IF NOT EXISTS pin_hash TEXT,
  ADD COLUMN IF NOT EXISTS pin_failed_attempts INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pin_locked_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS allowed_start_time TIME DEFAULT '07:00',
  ADD COLUMN IF NOT EXISTS allowed_end_time TIME DEFAULT '21:30';

-- Garantir que daily_limit_minutes aceite NULL (NULL = sem limite, número = limite real em minutos)
ALTER TABLE public.account_profiles 
  ALTER COLUMN daily_limit_minutes DROP DEFAULT;

-- 2. CLASSIFICAÇÃO EXPLÍCITA DE CONTEÚDO (stream_contents)
-- access_class: 'general' (padrão) | 'educational' (conteúdo educativo formal)
ALTER TABLE public.stream_contents
  ADD COLUMN IF NOT EXISTS access_class TEXT DEFAULT 'general';

-- Adicionar check constraint idempotente para access_class
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_stream_contents_access_class'
  ) THEN
    ALTER TABLE public.stream_contents
      ADD CONSTRAINT chk_stream_contents_access_class
      CHECK (access_class IN ('general', 'educational'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_stream_contents_access_class 
  ON public.stream_contents(access_class);

-- 3. SESSÕES DE USO INFANTIL REAL (profile_usage_sessions)
CREATE TABLE IF NOT EXISTS public.profile_usage_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.account_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_session_id TEXT NOT NULL,
  usage_date DATE NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_heartbeat_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  active_seconds INTEGER NOT NULL DEFAULT 0 CHECK (active_seconds >= 0),
  usage_type TEXT NOT NULL DEFAULT 'video' CHECK (usage_type IN ('video', 'game', 'quiz', 'general')),
  content_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_profile_date 
  ON public.profile_usage_sessions(profile_id, usage_date);

CREATE INDEX IF NOT EXISTS idx_usage_user 
  ON public.profile_usage_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_usage_device_session 
  ON public.profile_usage_sessions(device_session_id);

-- 4. RLS PARA profile_usage_sessions
ALTER TABLE public.profile_usage_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profile_usage_select_own" ON public.profile_usage_sessions;
CREATE POLICY "profile_usage_select_own"
  ON public.profile_usage_sessions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "profile_usage_insert_own" ON public.profile_usage_sessions;
CREATE POLICY "profile_usage_insert_own"
  ON public.profile_usage_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.account_profiles ap
      WHERE ap.id = profile_id AND ap.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "profile_usage_update_own" ON public.profile_usage_sessions;
CREATE POLICY "profile_usage_update_own"
  ON public.profile_usage_sessions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "profile_usage_delete_own" ON public.profile_usage_sessions;
CREATE POLICY "profile_usage_delete_own"
  ON public.profile_usage_sessions
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- 5. RPC: VERIFICAÇÃO SEGURA DE PIN COM MIGRAÇÃO GRADUAL E RATE LIMIT
-- NUNCA retorna hash para o cliente
-- NUNCA aceita fallback universal 1234
CREATE OR REPLACE FUNCTION public.verify_parent_pin(
  p_profile_id UUID,
  p_pin TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_user_id UUID;
  v_pin_hash TEXT;
  v_legacy_pin TEXT;
  v_failed_attempts INTEGER;
  v_locked_until TIMESTAMPTZ;
  v_new_hash TEXT;
  v_is_valid BOOLEAN := FALSE;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'UNAUTHORIZED');
  END IF;

  -- Buscar dados do perfil garantindo ownership do usuário autenticado
  SELECT 
    pin_hash, pin, COALESCE(pin_failed_attempts, 0), pin_locked_until
  INTO 
    v_pin_hash, v_legacy_pin, v_failed_attempts, v_locked_until
  FROM public.account_profiles
  WHERE id = p_profile_id AND user_id = v_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'PROFILE_NOT_FOUND');
  END IF;

  -- Checar se está bloqueado por excesso de tentativas
  IF v_locked_until IS NOT NULL AND v_locked_until > NOW() THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'LOCKED', 
      'locked_until', v_locked_until
    );
  END IF;

  -- Se possui hash moderno
  IF v_pin_hash IS NOT NULL AND length(v_pin_hash) > 0 THEN
    v_is_valid := (extensions.crypt(p_pin, v_pin_hash) = v_pin_hash);

    IF v_is_valid THEN
      UPDATE public.account_profiles
      SET pin_failed_attempts = 0, pin_locked_until = NULL
      WHERE id = p_profile_id;
      RETURN jsonb_build_object('success', true);
    ELSE
      v_failed_attempts := v_failed_attempts + 1;
      IF v_failed_attempts >= 5 THEN
        v_locked_until := NOW() + INTERVAL '15 minutes';
        UPDATE public.account_profiles
        SET pin_failed_attempts = v_failed_attempts, pin_locked_until = v_locked_until
        WHERE id = p_profile_id;
        RETURN jsonb_build_object('success', false, 'error', 'LOCKED', 'locked_until', v_locked_until);
      ELSE
        UPDATE public.account_profiles
        SET pin_failed_attempts = v_failed_attempts
        WHERE id = p_profile_id;
        RETURN jsonb_build_object('success', false, 'error', 'INVALID_PIN', 'attempts_remaining', 5 - v_failed_attempts);
      END IF;
    END IF;

  -- Migração gradual de PIN legado em texto puro
  ELSIF v_legacy_pin IS NOT NULL AND length(v_legacy_pin) > 0 THEN
    IF v_legacy_pin = p_pin THEN
      -- Gera hash seguro moderno e limpa o texto puro
      v_new_hash := extensions.crypt(p_pin, extensions.gen_salt('bf', 10));
      UPDATE public.account_profiles
      SET pin_hash = v_new_hash, pin = NULL, pin_failed_attempts = 0, pin_locked_until = NULL
      WHERE id = p_profile_id;
      RETURN jsonb_build_object('success', true, 'migrated', true);
    ELSE
      v_failed_attempts := v_failed_attempts + 1;
      IF v_failed_attempts >= 5 THEN
        v_locked_until := NOW() + INTERVAL '15 minutes';
        UPDATE public.account_profiles
        SET pin_failed_attempts = v_failed_attempts, pin_locked_until = v_locked_until
        WHERE id = p_profile_id;
        RETURN jsonb_build_object('success', false, 'error', 'LOCKED', 'locked_until', v_locked_until);
      ELSE
        UPDATE public.account_profiles
        SET pin_failed_attempts = v_failed_attempts
        WHERE id = p_profile_id;
        RETURN jsonb_build_object('success', false, 'error', 'INVALID_PIN', 'attempts_remaining', 5 - v_failed_attempts);
      END IF;
    END IF;

  ELSE
    -- Sem PIN configurado
    RETURN jsonb_build_object('success', false, 'error', 'NO_PIN_CONFIGURED');
  END IF;
END;
$$;

-- 6. RPC: DEFINIR OU ALTERAR PIN COM HASH SEGURO
CREATE OR REPLACE FUNCTION public.set_parent_pin(
  p_profile_id UUID,
  p_current_pin TEXT,
  p_new_pin TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_user_id UUID;
  v_pin_hash TEXT;
  v_legacy_pin TEXT;
  v_locked_until TIMESTAMPTZ;
  v_new_hash TEXT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'UNAUTHORIZED');
  END IF;

  -- Validação de formato (4 a 6 dígitos numéricos)
  IF p_new_pin IS NULL OR NOT (p_new_pin ~ '^[0-9]{4,6}$') THEN
    RETURN jsonb_build_object('success', false, 'error', 'INVALID_PIN_FORMAT');
  END IF;

  -- Buscar dados do perfil
  SELECT pin_hash, pin, pin_locked_until
  INTO v_pin_hash, v_legacy_pin, v_locked_until
  FROM public.account_profiles
  WHERE id = p_profile_id AND user_id = v_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'PROFILE_NOT_FOUND');
  END IF;

  -- Se já houver PIN configurado, validar PIN atual antes da troca
  IF (v_pin_hash IS NOT NULL AND length(v_pin_hash) > 0) OR (v_legacy_pin IS NOT NULL AND length(v_legacy_pin) > 0) THEN
    IF p_current_pin IS NULL OR length(p_current_pin) = 0 THEN
      RETURN jsonb_build_object('success', false, 'error', 'CURRENT_PIN_REQUIRED');
    END IF;

    IF v_pin_hash IS NOT NULL AND length(v_pin_hash) > 0 THEN
      IF extensions.crypt(p_current_pin, v_pin_hash) != v_pin_hash THEN
        RETURN jsonb_build_object('success', false, 'error', 'INVALID_CURRENT_PIN');
      END IF;
    ELSIF v_legacy_pin IS NOT NULL AND length(v_legacy_pin) > 0 THEN
      IF v_legacy_pin != p_current_pin THEN
        RETURN jsonb_build_object('success', false, 'error', 'INVALID_CURRENT_PIN');
      END IF;
    END IF;
  END IF;

  -- Gerar hash bcrypt moderno com salt
  v_new_hash := extensions.crypt(p_new_pin, extensions.gen_salt('bf', 10));

  UPDATE public.account_profiles
  SET pin_hash = v_new_hash, pin = NULL, pin_failed_attempts = 0, pin_locked_until = NULL, updated_at = NOW()
  WHERE id = p_profile_id AND user_id = v_user_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- 7. RPC: REGISTRAR HEARTBEAT DE USO ATIVO (PROTEÇÃO CONTRA ADULTERAÇÃO)
CREATE OR REPLACE FUNCTION public.record_usage_heartbeat(
  p_session_id UUID,
  p_profile_id UUID,
  p_device_session_id TEXT,
  p_usage_type TEXT,
  p_content_id TEXT,
  p_active_increment_seconds INTEGER,
  p_client_timezone TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID;
  v_profile_tz TEXT;
  v_effective_tz TEXT;
  v_effective_date DATE;
  v_clamped_seconds INTEGER;
  v_existing_id UUID;
  v_total_today INTEGER;
  v_daily_limit INTEGER;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'UNAUTHORIZED');
  END IF;

  -- Validar ownership do perfil
  SELECT timezone, daily_limit_minutes
  INTO v_profile_tz, v_daily_limit
  FROM public.account_profiles
  WHERE id = p_profile_id AND user_id = v_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'PROFILE_NOT_FOUND');
  END IF;

  -- Timezone efetivo (perfil > cliente > UTC)
  v_effective_tz := COALESCE(NULLIF(v_profile_tz, ''), NULLIF(p_client_timezone, ''), 'America/Sao_Paulo');

  BEGIN
    v_effective_date := (NOW() AT TIME ZONE v_effective_tz)::date;
  EXCEPTION WHEN OTHERS THEN
    v_effective_date := CURRENT_DATE;
  END;

  -- Proteção contra adulteração de tempo no frontend: máx 90 segundos por batimento
  v_clamped_seconds := LEAST(GREATEST(COALESCE(p_active_increment_seconds, 0), 0), 90);

  -- Upsert da sessão de uso
  SELECT id INTO v_existing_id
  FROM public.profile_usage_sessions
  WHERE id = p_session_id AND user_id = v_user_id;

  IF v_existing_id IS NOT NULL THEN
    UPDATE public.profile_usage_sessions
    SET 
      active_seconds = active_seconds + v_clamped_seconds,
      last_heartbeat_at = NOW(),
      updated_at = NOW()
    WHERE id = v_existing_id;
  ELSE
    INSERT INTO public.profile_usage_sessions (
      id, profile_id, user_id, device_session_id, usage_date,
      started_at, last_heartbeat_at, active_seconds, usage_type, content_id
    ) VALUES (
      p_session_id, p_profile_id, v_user_id, p_device_session_id, v_effective_date,
      NOW(), NOW(), v_clamped_seconds, COALESCE(p_usage_type, 'video'), p_content_id
    );
  END IF;

  -- Total consumido hoje no timezone correto
  SELECT COALESCE(SUM(active_seconds), 0)
  INTO v_total_today
  FROM public.profile_usage_sessions
  WHERE profile_id = p_profile_id AND usage_date = v_effective_date;

  RETURN jsonb_build_object(
    'success', true,
    'usage_date', v_effective_date,
    'total_active_seconds_today', v_total_today,
    'daily_limit_minutes', v_daily_limit,
    'limit_reached', CASE 
      WHEN v_daily_limit IS NOT NULL AND v_total_today >= (v_daily_limit * 60) THEN true 
      ELSE false 
    END
  );
END;
$$;

-- 8. FUNÇÃO AUXILIAR PARA CONSULTA DE USO DIÁRIO
CREATE OR REPLACE FUNCTION public.get_profile_daily_usage(
  p_profile_id UUID,
  p_date DATE
)
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT COALESCE(SUM(active_seconds), 0)::INTEGER
  FROM public.profile_usage_sessions
  WHERE profile_id = p_profile_id 
    AND usage_date = p_date
    AND user_id = auth.uid();
$$;

-- Conceder permissões para usuários autenticados
GRANT EXECUTE ON FUNCTION public.verify_parent_pin(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_parent_pin(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_usage_heartbeat(UUID, UUID, TEXT, TEXT, TEXT, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_profile_daily_usage(UUID, DATE) TO authenticated;
