-- ==============================================================================
-- COM DEUS KIDS — FASE 4: MINISTÉRIO INFANTIL & IGREJA (EBD)
-- Migration: 20260923000007_church_ministry_operations.sql
-- ==============================================================================

-- 1. CAPABILITIES DO MÓDULO DE IGREJA (role_capabilities)
INSERT INTO public.role_capabilities (role, capability, description) VALUES
  ('owner',          'church.dashboard.view',     'Visualizar dashboard operacional da igreja'),
  ('owner',          'church.children.view',      'Visualizar cadastro de crianças da igreja'),
  ('owner',          'church.children.create',    'Cadastrar crianças na igreja'),
  ('owner',          'church.children.edit',      'Editar crianças e observações de cuidado'),
  ('owner',          'church.guardians.view',     'Visualizar responsáveis e pessoas autorizadas'),
  ('owner',          'church.guardians.manage',   'Gerenciar responsáveis e pessoas autorizadas'),
  ('owner',          'church.team.view',          'Visualizar equipe do ministério infantil'),
  ('owner',          'church.team.manage',        'Gerenciar equipe e atribuições'),
  ('owner',          'church.classes.view',       'Visualizar turmas e classes bíblicas'),
  ('owner',          'church.classes.manage',     'Gerenciar turmas e classes bíblicas'),
  ('owner',          'church.lessons.view',       'Visualizar aulas bíblicas'),
  ('owner',          'church.lessons.manage',     'Criar e gerenciar aulas bíblicas'),
  ('owner',          'church.agenda.view',        'Visualizar agenda, cultos e EBD'),
  ('owner',          'church.agenda.manage',      'Criar e gerenciar eventos na agenda'),
  ('owner',          'church.checkin.view',       'Visualizar sessões de check-in'),
  ('owner',          'church.checkin.execute',    'Realizar check-in de crianças'),
  ('owner',          'church.pickup.view',        'Visualizar fila de retirada'),
  ('owner',          'church.pickup.request',     'Solicitar retirada de criança na recepção'),
  ('owner',          'church.pickup.authorize',   'Aprovar autorizações e exceções manuais'),
  ('owner',          'church.pickup.confirm',     'Confirmar entrega da criança ao responsável'),
  ('owner',          'church.communication.view', 'Visualizar central de comunicação'),
  ('owner',          'church.communication.send', 'Disparar mensagens aos responsáveis'),
  ('owner',          'church.settings.manage',    'Gerenciar configurações institucionais da igreja'),

  ('admin',          'church.dashboard.view',     'Visualizar dashboard operacional da igreja'),
  ('admin',          'church.children.view',      'Visualizar cadastro de crianças da igreja'),
  ('admin',          'church.children.create',    'Cadastrar crianças na igreja'),
  ('admin',          'church.children.edit',      'Editar crianças e observações de cuidado'),
  ('admin',          'church.guardians.view',     'Visualizar responsáveis e pessoas autorizadas'),
  ('admin',          'church.guardians.manage',   'Gerenciar responsáveis e pessoas autorizadas'),
  ('admin',          'church.team.view',          'Visualizar equipe do ministério infantil'),
  ('admin',          'church.team.manage',        'Gerenciar equipe e atribuições'),
  ('admin',          'church.classes.view',       'Visualizar turmas e classes bíblicas'),
  ('admin',          'church.classes.manage',     'Gerenciar turmas e classes bíblicas'),
  ('admin',          'church.lessons.view',       'Visualizar aulas bíblicas'),
  ('admin',          'church.lessons.manage',     'Criar e gerenciar aulas bíblicas'),
  ('admin',          'church.agenda.view',        'Visualizar agenda, cultos e EBD'),
  ('admin',          'church.agenda.manage',      'Criar e gerenciar eventos na agenda'),
  ('admin',          'church.checkin.view',       'Visualizar sessões de check-in'),
  ('admin',          'church.checkin.execute',    'Realizar check-in de crianças'),
  ('admin',          'church.pickup.view',        'Visualizar fila de retirada'),
  ('admin',          'church.pickup.request',     'Solicitar retirada de criança na recepção'),
  ('admin',          'church.pickup.authorize',   'Aprovar autorizações e exceções manuais'),
  ('admin',          'church.pickup.confirm',     'Confirmar entrega da criança ao responsável'),
  ('admin',          'church.communication.view', 'Visualizar central de comunicação'),
  ('admin',          'church.communication.send', 'Disparar mensagens aos responsáveis'),

  ('coordinator',    'church.dashboard.view',     'Visualizar dashboard operacional da igreja'),
  ('coordinator',    'church.children.view',      'Visualizar cadastro de crianças da igreja'),
  ('coordinator',    'church.children.create',    'Cadastrar crianças na igreja'),
  ('coordinator',    'church.children.edit',      'Editar crianças e observações de cuidado'),
  ('coordinator',    'church.guardians.view',     'Visualizar responsáveis e pessoas autorizadas'),
  ('coordinator',    'church.guardians.manage',   'Gerenciar responsáveis e pessoas autorizadas'),
  ('coordinator',    'church.team.view',          'Visualizar equipe do ministério infantil'),
  ('coordinator',    'church.classes.view',       'Visualizar turmas e classes bíblicas'),
  ('coordinator',    'church.classes.manage',     'Gerenciar turmas e classes bíblicas'),
  ('coordinator',    'church.lessons.view',       'Visualizar aulas bíblicas'),
  ('coordinator',    'church.lessons.manage',     'Criar e gerenciar aulas bíblicas'),
  ('coordinator',    'church.agenda.view',        'Visualizar agenda, cultos e EBD'),
  ('coordinator',    'church.agenda.manage',      'Criar e gerenciar eventos na agenda'),
  ('coordinator',    'church.checkin.view',       'Visualizar sessões de check-in'),
  ('coordinator',    'church.checkin.execute',    'Realizar check-in de crianças'),
  ('coordinator',    'church.pickup.view',        'Visualizar fila de retirada'),
  ('coordinator',    'church.pickup.request',     'Solicitar retirada de criança na recepção'),
  ('coordinator',    'church.pickup.authorize',   'Aprovar autorizações e exceções manuais'),
  ('coordinator',    'church.pickup.confirm',     'Confirmar entrega da criança ao responsável'),
  ('coordinator',    'church.communication.view', 'Visualizar central de comunicação'),
  ('coordinator',    'church.communication.send', 'Disparar mensagens aos responsáveis'),

  ('teacher',        'church.dashboard.view',     'Visualizar dashboard operacional da igreja'),
  ('teacher',        'church.children.view',      'Visualizar cadastro de crianças da sua turma'),
  ('teacher',        'church.classes.view',       'Visualizar turmas'),
  ('teacher',        'church.lessons.view',       'Visualizar aulas bíblicas'),
  ('teacher',        'church.lessons.manage',     'Criar aulas para sua turma'),
  ('teacher',        'church.agenda.view',        'Visualizar agenda de cultos e EBD'),
  ('teacher',        'church.pickup.view',        'Visualizar fila de retirada na sala e preparar criança'),

  ('reception',      'church.dashboard.view',     'Visualizar dashboard de recepção'),
  ('reception',      'church.children.view',      'Buscar crianças na recepção'),
  ('reception',      'church.children.create',    'Cadastrar visitante ou nova criança no check-in'),
  ('reception',      'church.guardians.view',     'Consultar responsáveis'),
  ('reception',      'church.checkin.view',       'Visualizar sessões de check-in'),
  ('reception',      'church.checkin.execute',    'Realizar check-in e emitir credencial'),
  ('reception',      'church.pickup.view',        'Visualizar fila de retirada'),
  ('reception',      'church.pickup.request',     'Localizar check-in e solicitar retirada'),
  ('reception',      'church.pickup.confirm',     'Confirmar entrega da criança ao responsável')
ON CONFLICT (role, capability) DO NOTHING;

-- 2. TABELA DE EVENTOS / AGENDA DA IGREJA (church_events)
CREATE TABLE IF NOT EXISTS public.church_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  event_type      TEXT NOT NULL CHECK (event_type IN ('service', 'ebd', 'kids_service', 'class', 'rehearsal', 'event', 'congress', 'other')),
  event_date      DATE NOT NULL,
  start_time      TIME NOT NULL,
  end_time        TIME,
  location        TEXT,
  description     TEXT,
  status          TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('draft', 'scheduled', 'active', 'completed', 'canceled')),
  created_by      UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_church_events_org ON public.church_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_church_events_date ON public.church_events(event_date);
CREATE INDEX IF NOT EXISTS idx_church_events_status ON public.church_events(status);

-- 3. SESSÕES OPERACIONAIS DE CHECK-IN (church_checkin_sessions)
CREATE TABLE IF NOT EXISTS public.church_checkin_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  event_id        UUID REFERENCES public.church_events(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  session_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  status          TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('scheduled', 'open', 'closed', 'canceled')),
  opened_at       TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  closed_at       TIMESTAMPTZ,
  created_by      UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_checkin_sessions_org ON public.church_checkin_sessions(organization_id);
CREATE INDEX IF NOT EXISTS idx_checkin_sessions_status ON public.church_checkin_sessions(status);
CREATE INDEX IF NOT EXISTS idx_checkin_sessions_date ON public.church_checkin_sessions(session_date);

-- 4. PESSOAS AUTORIZADAS PARA RETIRADA (child_pickup_authorizations)
CREATE TABLE IF NOT EXISTS public.child_pickup_authorizations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id        UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  authorized_name TEXT NOT NULL,
  relationship    TEXT NOT NULL,
  phone           TEXT,
  document_id     TEXT,
  photo_url       TEXT,
  auth_type       TEXT NOT NULL DEFAULT 'permanent' CHECK (auth_type IN ('permanent', 'temporary')),
  valid_until     DATE,
  session_id      UUID REFERENCES public.church_checkin_sessions(id) ON DELETE SET NULL,
  notes           TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_by      UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_pickup_auth_child ON public.child_pickup_authorizations(child_id);
CREATE INDEX IF NOT EXISTS idx_pickup_auth_org ON public.child_pickup_authorizations(organization_id);

-- 5. CHECK-INS DA CRIANÇA NA SESSÃO (church_checkins)
CREATE TABLE IF NOT EXISTS public.church_checkins (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id         UUID NOT NULL REFERENCES public.church_checkin_sessions(id) ON DELETE CASCADE,
  organization_id    UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  child_id           UUID NOT NULL REFERENCES public.children(id) ON DELETE RESTRICT,
  class_id           UUID REFERENCES public.educational_classes(id) ON DELETE SET NULL,
  brought_by_name    TEXT NOT NULL,
  brought_by_phone   TEXT,
  guardian_id        UUID REFERENCES public.guardians(id) ON DELETE SET NULL,
  pickup_token_hash  TEXT NOT NULL,
  security_code      TEXT NOT NULL,
  status             TEXT NOT NULL DEFAULT 'checked_in' CHECK (status IN ('checked_in', 'pickup_requested', 'ready_for_pickup', 'picked_up', 'canceled')),
  checked_in_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  checked_in_by      UUID NOT NULL REFERENCES auth.users(id),
  notes              TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  -- PROTEÇÃO ANTI-DUPLO CHECKIN: Uma criança só pode ter 1 check-in ativo por sessão
  CONSTRAINT uq_session_child UNIQUE (session_id, child_id)
);

CREATE INDEX IF NOT EXISTS idx_church_checkins_session ON public.church_checkins(session_id);
CREATE INDEX IF NOT EXISTS idx_church_checkins_org ON public.church_checkins(organization_id);
CREATE INDEX IF NOT EXISTS idx_church_checkins_child ON public.church_checkins(child_id);
CREATE INDEX IF NOT EXISTS idx_church_checkins_status ON public.church_checkins(status);
CREATE INDEX IF NOT EXISTS idx_church_checkins_token_hash ON public.church_checkins(pickup_token_hash);

-- 6. FILA E AUDITORIA DE RETIRADA (church_pickup_requests)
CREATE TABLE IF NOT EXISTS public.church_pickup_requests (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkin_id                UUID NOT NULL REFERENCES public.church_checkins(id) ON DELETE CASCADE,
  organization_id           UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  status                    TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'preparing', 'ready', 'completed', 'canceled')),
  requested_by_name         TEXT NOT NULL,
  requested_by_relationship TEXT,
  requested_by_document     TEXT,
  authorization_id          UUID REFERENCES public.child_pickup_authorizations(id) ON DELETE SET NULL,
  requested_at              TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  operator_requested_by     UUID NOT NULL REFERENCES auth.users(id),
  ready_at                  TIMESTAMPTZ,
  operator_ready_by         UUID REFERENCES auth.users(id),
  completed_at              TIMESTAMPTZ,
  operator_completed_by     UUID REFERENCES auth.users(id),
  is_manual_override        BOOLEAN NOT NULL DEFAULT false,
  override_reason           TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_pickup_req_checkin ON public.church_pickup_requests(checkin_id);
CREATE INDEX IF NOT EXISTS idx_pickup_req_org ON public.church_pickup_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_pickup_req_status ON public.church_pickup_requests(status);

-- 7. CENTRAL DE COMUNICAÇÃO INSTITUCIONAL (church_communications)
CREATE TABLE IF NOT EXISTS public.church_communications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  message         TEXT NOT NULL,
  target_audience TEXT NOT NULL CHECK (target_audience IN ('all_guardians', 'class', 'event', 'team')),
  class_id        UUID REFERENCES public.educational_classes(id) ON DELETE SET NULL,
  event_id        UUID REFERENCES public.church_events(id) ON DELETE SET NULL,
  channel         TEXT NOT NULL DEFAULT 'whatsapp' CHECK (channel IN ('whatsapp', 'email', 'internal', 'push')),
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'queued', 'sent', 'failed')),
  scheduled_for   TIMESTAMPTZ,
  recipients_count INTEGER NOT NULL DEFAULT 0,
  created_by      UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_church_comms_org ON public.church_communications(organization_id);
CREATE INDEX IF NOT EXISTS idx_church_comms_status ON public.church_communications(status);

-- ==============================================================================
-- 8. HABILITAR ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.church_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.church_checkin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_pickup_authorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.church_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.church_pickup_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.church_communications ENABLE ROW LEVEL SECURITY;

-- Helper reutilizável para checagem de membro ativo da organização
CREATE OR REPLACE FUNCTION public.is_org_member(p_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = p_org_id AND user_id = auth.uid() AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- POLICIES: church_events
CREATE POLICY "Membros da igreja visualizam e gerenciam eventos da agenda"
  ON public.church_events FOR ALL
  TO authenticated
  USING (public.is_org_member(organization_id))
  WITH CHECK (public.is_org_member(organization_id));

-- POLICIES: church_checkin_sessions
CREATE POLICY "Membros da igreja visualizam e operam sessoes de checkin"
  ON public.church_checkin_sessions FOR ALL
  TO authenticated
  USING (public.is_org_member(organization_id))
  WITH CHECK (public.is_org_member(organization_id));

-- POLICIES: child_pickup_authorizations
CREATE POLICY "Membros da igreja visualizam e gerenciam autorizacoes de retirada"
  ON public.child_pickup_authorizations FOR ALL
  TO authenticated
  USING (public.is_org_member(organization_id))
  WITH CHECK (public.is_org_member(organization_id));

-- POLICIES: church_checkins
CREATE POLICY "Membros da igreja visualizam e gerenciam checkins"
  ON public.church_checkins FOR ALL
  TO authenticated
  USING (public.is_org_member(organization_id))
  WITH CHECK (public.is_org_member(organization_id));

-- POLICIES: church_pickup_requests
CREATE POLICY "Membros da igreja visualizam e gerenciam fila de retirada"
  ON public.church_pickup_requests FOR ALL
  TO authenticated
  USING (public.is_org_member(organization_id))
  WITH CHECK (public.is_org_member(organization_id));

-- POLICIES: church_communications
CREATE POLICY "Membros da igreja visualizam e gerenciam comunicacoes"
  ON public.church_communications FOR ALL
  TO authenticated
  USING (public.is_org_member(organization_id))
  WITH CHECK (public.is_org_member(organization_id));

-- ==============================================================================
-- 9. RPCs SEGURAS DE OPERAÇÃO
-- ==============================================================================

-- 9.1 CHECK-IN ATÔMICO COM PREVENÇÃO DE CONCORRÊNCIA E AUDITORIA
CREATE OR REPLACE FUNCTION public.execute_church_checkin(
  p_session_id UUID,
  p_child_id UUID,
  p_class_id UUID,
  p_brought_by_name TEXT,
  p_brought_by_phone TEXT,
  p_guardian_id UUID,
  p_pickup_token_hash TEXT,
  p_security_code TEXT,
  p_notes TEXT
) RETURNS JSONB AS $$
DECLARE
  v_org_id UUID;
  v_session_status TEXT;
  v_checkin_id UUID;
BEGIN
  -- 1. Validar sessão e obter organization_id
  SELECT organization_id, status INTO v_org_id, v_session_status
  FROM public.church_checkin_sessions
  WHERE id = p_session_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sessão de check-in não encontrada';
  END IF;

  IF v_session_status != 'open' THEN
    RAISE EXCEPTION 'Esta sessão não está aberta para novos check-ins (status: %)', v_session_status;
  END IF;

  -- 2. Validar se o usuário autenticado pertence à organização
  IF NOT public.is_org_member(v_org_id) THEN
    RAISE EXCEPTION 'Acesso não autorizado para esta organização';
  END IF;

  -- 3. Inserir check-in com constraint uq_session_child protegendo duplicidade
  INSERT INTO public.church_checkins (
    session_id,
    organization_id,
    child_id,
    class_id,
    brought_by_name,
    brought_by_phone,
    guardian_id,
    pickup_token_hash,
    security_code,
    status,
    checked_in_by,
    notes
  ) VALUES (
    p_session_id,
    v_org_id,
    p_child_id,
    p_class_id,
    p_brought_by_name,
    p_brought_by_phone,
    p_guardian_id,
    p_pickup_token_hash,
    p_security_code,
    'checked_in',
    auth.uid(),
    p_notes
  ) RETURNING id INTO v_checkin_id;

  -- 4. Registrar em activity_logs
  INSERT INTO public.activity_logs (
    organization_id,
    actor_id,
    context,
    action,
    target_type,
    target_id,
    metadata
  ) VALUES (
    v_org_id,
    auth.uid(),
    'church',
    'church.child.checked_in',
    'child',
    p_child_id::text,
    jsonb_build_object(
      'checkin_id', v_checkin_id,
      'session_id', p_session_id,
      'security_code', p_security_code
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'checkin_id', v_checkin_id,
    'security_code', p_security_code
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9.2 CONFIRMAÇÃO DE RETIRADA SEGURA (ANTI-DUPLA RETIRADA + AUDITORIA)
CREATE OR REPLACE FUNCTION public.confirm_church_pickup(
  p_checkin_id UUID,
  p_request_id UUID,
  p_collected_by_name TEXT,
  p_is_override BOOLEAN DEFAULT FALSE,
  p_override_reason TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_org_id UUID;
  v_child_id UUID;
  v_current_status TEXT;
BEGIN
  -- 1. Obter e bloquear a linha para evitar concorrência
  SELECT organization_id, child_id, status INTO v_org_id, v_child_id, v_current_status
  FROM public.church_checkins
  WHERE id = p_checkin_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registro de check-in não encontrado';
  END IF;

  -- 2. Validar membro
  IF NOT public.is_org_member(v_org_id) THEN
    RAISE EXCEPTION 'Acesso não autorizado para esta organização';
  END IF;

  -- 3. Proteção anti-dupla retirada
  IF v_current_status = 'picked_up' THEN
    RAISE EXCEPTION 'Esta criança já foi retirada anteriormente desta sessão';
  END IF;

  -- 4. Atualizar check-in para 'picked_up' (estado terminal)
  UPDATE public.church_checkins
  SET status = 'picked_up',
      updated_at = timezone('utc', now())
  WHERE id = p_checkin_id;

  -- 5. Atualizar pedido de retirada na fila
  IF p_request_id IS NOT NULL THEN
    UPDATE public.church_pickup_requests
    SET status = 'completed',
        completed_at = timezone('utc', now()),
        operator_completed_by = auth.uid(),
        is_manual_override = p_is_override,
        override_reason = p_override_reason,
        updated_at = timezone('utc', now())
    WHERE id = p_request_id;
  END IF;

  -- 6. Auditoria obrigatória
  INSERT INTO public.activity_logs (
    organization_id,
    actor_id,
    context,
    action,
    target_type,
    target_id,
    metadata
  ) VALUES (
    v_org_id,
    auth.uid(),
    'church',
    'church.child.picked_up',
    'child',
    v_child_id::text,
    jsonb_build_object(
      'checkin_id', p_checkin_id,
      'collected_by', p_collected_by_name,
      'is_override', p_is_override,
      'override_reason', p_override_reason
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'status', 'picked_up',
    'child_id', v_child_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
