-- ============================================================
-- COM DEUS KIDS — Suporte a Múltiplos Perfis de Streaming
-- ============================================================

CREATE TABLE IF NOT EXISTS public.account_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_url TEXT NOT NULL,
  profile_type TEXT NOT NULL DEFAULT 'kid' CHECK (profile_type IN ('kid', 'parent', 'teacher', 'leader')),
  age INTEGER,
  pin TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.account_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários gerenciam perfis da própria conta"
  ON public.account_profiles
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Progresso de Conteúdo por Perfil
CREATE TABLE IF NOT EXISTS public.profile_watch_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.account_profiles(id) ON DELETE CASCADE,
  content_id TEXT NOT NULL,
  content_title TEXT,
  content_thumbnail TEXT,
  content_type TEXT DEFAULT 'video',
  progress_seconds INTEGER DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (profile_id, content_id)
);

ALTER TABLE public.profile_watch_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso ao progresso pelo dono da conta"
  ON public.profile_watch_progress
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.account_profiles p
      WHERE p.id = profile_watch_progress.profile_id AND p.user_id = auth.uid()
    )
  );

-- Minha Lista por Perfil
CREATE TABLE IF NOT EXISTS public.profile_my_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.account_profiles(id) ON DELETE CASCADE,
  content_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (profile_id, content_id)
);

ALTER TABLE public.profile_my_list ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso à minha lista pelo dono da conta"
  ON public.profile_my_list
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.account_profiles p
      WHERE p.id = profile_my_list.profile_id AND p.user_id = auth.uid()
    )
  );
