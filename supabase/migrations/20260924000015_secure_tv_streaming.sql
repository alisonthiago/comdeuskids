-- ============================================================
-- COM DEUS KIDS — Sessão segura para TV (somente streaming)
-- A TV nunca recebe a sessão web da conta. Ela usa um token de
-- dispositivo curto, revogável e limitado aos RPCs deste arquivo.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.tv_pairing_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  device_token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  device_name TEXT NOT NULL DEFAULT 'Smart TV',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'authorized', 'expired', 'revoked')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
  authorized_at TIMESTAMPTZ,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tv_pairing_sessions_token_idx
  ON public.tv_pairing_sessions(device_token);
CREATE INDEX IF NOT EXISTS tv_pairing_sessions_user_idx
  ON public.tv_pairing_sessions(user_id);

ALTER TABLE public.tv_pairing_sessions ENABLE ROW LEVEL SECURITY;
-- Nenhuma tabela de sessão de TV é exposta diretamente ao cliente.

CREATE OR REPLACE FUNCTION public.create_tv_pairing_session(p_device_name TEXT DEFAULT 'Smart TV')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_code TEXT;
  v_session public.tv_pairing_sessions;
  v_chars TEXT := '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
BEGIN
  LOOP
    v_code := 'CDK-' || substr(v_chars, floor(random() * length(v_chars) + 1)::int, 1)
      || substr(v_chars, floor(random() * length(v_chars) + 1)::int, 1)
      || substr(v_chars, floor(random() * length(v_chars) + 1)::int, 1)
      || substr(v_chars, floor(random() * length(v_chars) + 1)::int, 1);
    BEGIN
      INSERT INTO public.tv_pairing_sessions (code, device_name)
      VALUES (v_code, left(coalesce(nullif(trim(p_device_name), ''), 'Smart TV'), 80))
      RETURNING * INTO v_session;
      EXIT;
    EXCEPTION WHEN unique_violation THEN
      -- código aleatório já utilizado: tenta novamente
    END;
  END LOOP;

  RETURN jsonb_build_object(
    'code', v_session.code,
    'device_token', v_session.device_token,
    'expires_at', v_session.expires_at,
    'status', v_session.status
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.approve_tv_pairing_session(p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_session public.tv_pairing_sessions;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'UNAUTHORIZED');
  END IF;

  UPDATE public.tv_pairing_sessions
  SET status = CASE WHEN expires_at <= NOW() THEN 'expired' ELSE 'authorized' END,
      user_id = CASE WHEN expires_at > NOW() THEN auth.uid() ELSE NULL END,
      authorized_at = CASE WHEN expires_at > NOW() THEN NOW() ELSE NULL END
  WHERE code = upper(trim(p_code))
    AND status = 'pending'
  RETURNING * INTO v_session;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'INVALID_OR_EXPIRED_CODE');
  END IF;
  IF v_session.status <> 'authorized' THEN
    RETURN jsonb_build_object('success', false, 'error', 'EXPIRED');
  END IF;

  RETURN jsonb_build_object('success', true, 'device_name', v_session.device_name);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_tv_pairing_status(p_device_token UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE v_session public.tv_pairing_sessions;
BEGIN
  UPDATE public.tv_pairing_sessions
  SET status = 'expired'
  WHERE device_token = p_device_token AND status = 'pending' AND expires_at <= NOW();

  SELECT * INTO v_session FROM public.tv_pairing_sessions WHERE device_token = p_device_token;
  IF NOT FOUND THEN RETURN jsonb_build_object('status', 'invalid'); END IF;
  IF v_session.status = 'authorized' THEN
    UPDATE public.tv_pairing_sessions SET last_seen_at = NOW() WHERE id = v_session.id;
  END IF;
  RETURN jsonb_build_object('status', v_session.status, 'expires_at', v_session.expires_at);
END;
$$;

CREATE OR REPLACE FUNCTION public.tv_authorized_account(p_device_token UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
DECLARE v_user_id UUID;
BEGIN
  SELECT user_id INTO v_user_id
  FROM public.tv_pairing_sessions
  WHERE device_token = p_device_token
    AND status = 'authorized'
    AND user_id IS NOT NULL;
  RETURN v_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_tv_profiles(p_device_token UUID)
RETURNS TABLE(id UUID, name TEXT, avatar_url TEXT, age INTEGER, has_pin BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE v_user_id UUID := public.tv_authorized_account(p_device_token);
BEGIN
  IF v_user_id IS NULL THEN RETURN; END IF;
  RETURN QUERY
    SELECT ap.id, ap.name, ap.avatar_url, ap.age,
      (coalesce(ap.pin_hash, '') <> '' OR coalesce(ap.pin, '') <> '')
    FROM public.account_profiles ap
    WHERE ap.user_id = v_user_id AND ap.profile_type = 'kid'
    ORDER BY ap.created_at;
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_tv_profile_pin(p_device_token UUID, p_profile_id UUID, p_pin TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_user_id UUID := public.tv_authorized_account(p_device_token);
  v_hash TEXT; v_legacy TEXT; v_attempts INTEGER; v_locked TIMESTAMPTZ; v_ok BOOLEAN := FALSE;
BEGIN
  IF v_user_id IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'TV_UNAUTHORIZED'); END IF;
  SELECT pin_hash, pin, coalesce(pin_failed_attempts, 0), pin_locked_until
  INTO v_hash, v_legacy, v_attempts, v_locked
  FROM public.account_profiles
  WHERE id = p_profile_id AND user_id = v_user_id AND profile_type = 'kid';
  IF NOT FOUND THEN RETURN jsonb_build_object('success', false, 'error', 'PROFILE_NOT_FOUND'); END IF;
  IF v_locked IS NOT NULL AND v_locked > NOW() THEN RETURN jsonb_build_object('success', false, 'error', 'LOCKED'); END IF;
  v_ok := (v_hash IS NOT NULL AND extensions.crypt(p_pin, v_hash) = v_hash) OR (v_hash IS NULL AND v_legacy IS NOT NULL AND v_legacy = p_pin);
  IF v_ok THEN
    UPDATE public.account_profiles SET pin_failed_attempts = 0, pin_locked_until = NULL WHERE id = p_profile_id;
    RETURN jsonb_build_object('success', true);
  END IF;
  v_attempts := v_attempts + 1;
  UPDATE public.account_profiles
  SET pin_failed_attempts = v_attempts,
      pin_locked_until = CASE WHEN v_attempts >= 5 THEN NOW() + interval '15 minutes' ELSE NULL END
  WHERE id = p_profile_id;
  RETURN jsonb_build_object('success', false, 'error', CASE WHEN v_attempts >= 5 THEN 'LOCKED' ELSE 'INVALID_PIN' END);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_tv_profile_state(p_device_token UUID, p_profile_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE v_user_id UUID := public.tv_authorized_account(p_device_token);
BEGIN
  IF v_user_id IS NULL OR NOT EXISTS (SELECT 1 FROM public.account_profiles WHERE id = p_profile_id AND user_id = v_user_id AND profile_type = 'kid') THEN
    RETURN jsonb_build_object('error', 'TV_UNAUTHORIZED');
  END IF;
  RETURN jsonb_build_object(
    'my_list', coalesce((SELECT jsonb_agg(content_id) FROM public.profile_my_list WHERE profile_id = p_profile_id), '[]'::jsonb),
    'watch_progress', coalesce((SELECT jsonb_object_agg(content_id, jsonb_build_object('profile_id', profile_id, 'content_id', content_id, 'content_title', content_title, 'content_thumbnail', content_thumbnail, 'progress_seconds', progress_seconds, 'duration_seconds', duration_seconds, 'completed', completed, 'updated_at', updated_at)) FROM public.profile_watch_progress WHERE profile_id = p_profile_id), '{}'::jsonb)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.save_tv_watch_progress(p_device_token UUID, p_profile_id UUID, p_content_id TEXT, p_progress_seconds INTEGER, p_duration_seconds INTEGER, p_title TEXT DEFAULT NULL, p_thumbnail TEXT DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE v_user_id UUID := public.tv_authorized_account(p_device_token);
BEGIN
  IF v_user_id IS NULL OR NOT EXISTS (SELECT 1 FROM public.account_profiles WHERE id = p_profile_id AND user_id = v_user_id AND profile_type = 'kid') THEN RETURN FALSE; END IF;
  INSERT INTO public.profile_watch_progress (profile_id, content_id, content_title, content_thumbnail, progress_seconds, duration_seconds, completed, updated_at)
  VALUES (p_profile_id, p_content_id, p_title, p_thumbnail, greatest(0, p_progress_seconds), greatest(0, p_duration_seconds), p_duration_seconds > 0 AND p_progress_seconds >= p_duration_seconds * .9, NOW())
  ON CONFLICT (profile_id, content_id) DO UPDATE SET progress_seconds = EXCLUDED.progress_seconds, duration_seconds = EXCLUDED.duration_seconds, completed = EXCLUDED.completed, updated_at = NOW();
  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.toggle_tv_my_list(p_device_token UUID, p_profile_id UUID, p_content_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE v_user_id UUID := public.tv_authorized_account(p_device_token);
BEGIN
  IF v_user_id IS NULL OR NOT EXISTS (SELECT 1 FROM public.account_profiles WHERE id = p_profile_id AND user_id = v_user_id AND profile_type = 'kid') THEN RETURN jsonb_build_object('success', false); END IF;
  IF EXISTS (SELECT 1 FROM public.profile_my_list WHERE profile_id = p_profile_id AND content_id = p_content_id) THEN
    DELETE FROM public.profile_my_list WHERE profile_id = p_profile_id AND content_id = p_content_id;
    RETURN jsonb_build_object('success', true, 'in_list', false);
  END IF;
  INSERT INTO public.profile_my_list (profile_id, content_id) VALUES (p_profile_id, p_content_id) ON CONFLICT DO NOTHING;
  RETURN jsonb_build_object('success', true, 'in_list', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.check_tv_parental_access(p_device_token UUID, p_profile_id UUID, p_content_access_class TEXT DEFAULT 'general')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID := public.tv_authorized_account(p_device_token);
  p public.account_profiles; v_tz TEXT; v_local TIME; v_day TEXT; v_used INTEGER;
BEGIN
  SELECT * INTO p FROM public.account_profiles WHERE id = p_profile_id AND user_id = v_user_id AND profile_type = 'kid';
  IF NOT FOUND THEN RETURN jsonb_build_object('allowed', false, 'reason', 'TV_UNAUTHORIZED'); END IF;
  v_tz := coalesce(nullif(p.timezone, ''), 'America/Sao_Paulo');
  v_local := (NOW() AT TIME ZONE v_tz)::time;
  v_day := (ARRAY['dom','seg','ter','qua','qui','sex','sab'])[(extract(dow FROM NOW() AT TIME ZONE v_tz)::int) + 1];
  IF p.is_paused AND (p.paused_until IS NULL OR p.paused_until > NOW()) THEN RETURN jsonb_build_object('allowed', false, 'reason', 'PAUSED'); END IF;
  IF coalesce(array_length(p.allowed_days, 1), 0) > 0 AND NOT (v_day = ANY(p.allowed_days)) THEN RETURN jsonb_build_object('allowed', false, 'reason', 'DAY_NOT_ALLOWED'); END IF;
  IF v_local < coalesce(p.allowed_start_time, '07:00'::time) OR v_local >= coalesce(p.allowed_end_time, '21:30'::time) THEN RETURN jsonb_build_object('allowed', false, 'reason', 'BEDTIME'); END IF;
  IF p.strict_educational_only AND p_content_access_class = 'general' THEN RETURN jsonb_build_object('allowed', false, 'reason', 'EDUCATIONAL_ONLY'); END IF;
  SELECT coalesce(sum(active_seconds), 0) INTO v_used FROM public.profile_usage_sessions WHERE profile_id = p_profile_id AND usage_date = (NOW() AT TIME ZONE v_tz)::date;
  IF p.daily_limit_minutes IS NOT NULL AND v_used >= p.daily_limit_minutes * 60 THEN RETURN jsonb_build_object('allowed', false, 'reason', 'DAILY_LIMIT'); END IF;
  RETURN jsonb_build_object('allowed', true, 'remaining_seconds', CASE WHEN p.daily_limit_minutes IS NULL THEN NULL ELSE greatest(0, p.daily_limit_minutes * 60 - v_used) END);
END;
$$;

CREATE OR REPLACE FUNCTION public.record_tv_usage_heartbeat(p_device_token UUID, p_profile_id UUID, p_content_id TEXT, p_increment_seconds INTEGER)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID := public.tv_authorized_account(p_device_token);
  p public.account_profiles; v_tz TEXT; v_date DATE; v_increment INTEGER; v_total INTEGER;
BEGIN
  SELECT * INTO p FROM public.account_profiles WHERE id = p_profile_id AND user_id = v_user_id AND profile_type = 'kid';
  IF NOT FOUND THEN RETURN jsonb_build_object('success', false, 'error', 'TV_UNAUTHORIZED'); END IF;
  v_tz := coalesce(nullif(p.timezone, ''), 'America/Sao_Paulo');
  v_date := (NOW() AT TIME ZONE v_tz)::date;
  v_increment := least(greatest(coalesce(p_increment_seconds, 0), 0), 90);
  INSERT INTO public.profile_usage_sessions (profile_id, user_id, device_session_id, usage_date, active_seconds, usage_type, content_id)
  VALUES (p_profile_id, v_user_id, 'tv:' || p_device_token::text, v_date, v_increment, 'video', p_content_id);
  SELECT coalesce(sum(active_seconds), 0) INTO v_total FROM public.profile_usage_sessions WHERE profile_id = p_profile_id AND usage_date = v_date;
  RETURN jsonb_build_object('success', true, 'total_active_seconds_today', v_total,
    'limit_reached', p.daily_limit_minutes IS NOT NULL AND v_total >= p.daily_limit_minutes * 60);
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_tv_pairing_session(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_tv_pairing_status(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_tv_profiles(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_tv_profile_pin(UUID, UUID, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_tv_profile_state(UUID, UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.save_tv_watch_progress(UUID, UUID, TEXT, INTEGER, INTEGER, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_tv_my_list(UUID, UUID, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_tv_parental_access(UUID, UUID, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_tv_usage_heartbeat(UUID, UUID, TEXT, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.approve_tv_pairing_session(TEXT) TO authenticated;
