-- ==============================================================================
-- COM DEUS KIDS — FASE 5: ESCOLA / GESTÃO EDUCACIONAL INSTITUCIONAL
-- Migration: 20260923000008_school_operations.sql
-- ==============================================================================

-- 1. CAPABILITIES DO MÓDULO DE ESCOLA (role_capabilities)
INSERT INTO public.role_capabilities (role, capability, description) VALUES
  ('owner',          'school.dashboard.view',      'Visualizar dashboard operacional da escola'),
  ('owner',          'school.students.view',       'Visualizar cadastro central de alunos'),
  ('owner',          'school.students.create',     'Cadastrar alunos e gerar matrícula de 6 dígitos'),
  ('owner',          'school.students.edit',       'Editar alunos e informações cadastrais'),
  ('owner',          'school.guardians.view',      'Visualizar responsáveis de alunos'),
  ('owner',          'school.guardians.manage',    'Gerenciar responsáveis de alunos'),
  ('owner',          'school.team.view',           'Visualizar equipe e corpo docente'),
  ('owner',          'school.team.manage',         'Gerenciar equipe e professores da escola'),
  ('owner',          'school.classes.view',        'Visualizar turmas e séries escolares'),
  ('owner',          'school.classes.manage',      'Gerenciar turmas e séries escolares'),
  ('owner',          'school.lessons.view',        'Visualizar aulas e planejamentos pedagógicos'),
  ('owner',          'school.lessons.manage',      'Criar e gerenciar aulas e planos pedagógicos'),
  ('owner',          'school.assignments.manage',  'Atribuir tarefas e atividades às turmas e alunos'),
  ('owner',          'school.results.view',        'Visualizar notas, entregas e relatórios pedagógicos'),
  ('owner',          'school.agenda.view',         'Visualizar calendário e agenda escolar'),
  ('owner',          'school.agenda.manage',       'Criar e gerenciar eventos na agenda escolar'),
  ('owner',          'school.transport.view',      'Visualizar rotas e alunos no transporte escolar'),
  ('owner',          'school.transport.manage',    'Gerenciar empresas, motoristas, veículos e rotas'),
  ('owner',          'school.transport.operate',   'Operar lista diária de embarque/desembarque'),
  ('owner',          'school.communication.view',  'Visualizar central de comunicação da escola'),
  ('owner',          'school.communication.send',  'Disparar comunicados aos responsáveis'),
  ('owner',          'school.settings.manage',     'Gerenciar configurações institucionais da escola'),

  ('admin',          'school.dashboard.view',      'Visualizar dashboard operacional da escola'),
  ('admin',          'school.students.view',       'Visualizar cadastro central de alunos'),
  ('admin',          'school.students.create',     'Cadastrar alunos e gerar matrícula de 6 dígitos'),
  ('admin',          'school.students.edit',       'Editar alunos e informações cadastrais'),
  ('admin',          'school.guardians.view',      'Visualizar responsáveis de alunos'),
  ('admin',          'school.guardians.manage',    'Gerenciar responsáveis de alunos'),
  ('admin',          'school.team.view',           'Visualizar equipe e corpo docente'),
  ('admin',          'school.team.manage',         'Gerenciar equipe e professores da escola'),
  ('admin',          'school.classes.view',        'Visualizar turmas e séries escolares'),
  ('admin',          'school.classes.manage',      'Gerenciar turmas e séries escolares'),
  ('admin',          'school.lessons.view',        'Visualizar aulas e planejamentos pedagógicos'),
  ('admin',          'school.lessons.manage',      'Criar e gerenciar aulas e planos pedagógicos'),
  ('admin',          'school.assignments.manage',  'Atribuir tarefas e atividades às turmas e alunos'),
  ('admin',          'school.results.view',        'Visualizar notas, entregas e relatórios pedagógicos'),
  ('admin',          'school.agenda.view',         'Visualizar calendário e agenda escolar'),
  ('admin',          'school.agenda.manage',       'Criar e gerenciar eventos na agenda escolar'),
  ('admin',          'school.transport.view',      'Visualizar rotas e alunos no transporte escolar'),
  ('admin',          'school.transport.manage',    'Gerenciar empresas, motoristas, veículos e rotas'),
  ('admin',          'school.communication.view',  'Visualizar central de comunicação da escola'),
  ('admin',          'school.communication.send',  'Disparar comunicados aos responsáveis'),

  ('coordinator',    'school.dashboard.view',      'Visualizar dashboard operacional da escola'),
  ('coordinator',    'school.students.view',       'Visualizar cadastro central de alunos'),
  ('coordinator',    'school.students.create',     'Cadastrar alunos e gerar matrícula de 6 dígitos'),
  ('coordinator',    'school.students.edit',       'Editar alunos e informações cadastrais'),
  ('coordinator',    'school.guardians.view',      'Visualizar responsáveis de alunos'),
  ('coordinator',    'school.classes.view',        'Visualizar turmas e séries escolares'),
  ('coordinator',    'school.classes.manage',      'Gerenciar turmas e séries escolares'),
  ('coordinator',    'school.lessons.view',        'Visualizar aulas e planejamentos pedagógicos'),
  ('coordinator',    'school.lessons.manage',      'Criar e gerenciar aulas e planos pedagógicos'),
  ('coordinator',    'school.assignments.manage',  'Atribuir tarefas e atividades às turmas e alunos'),
  ('coordinator',    'school.results.view',        'Visualizar notas, entregas e relatórios pedagógicos'),
  ('coordinator',    'school.agenda.view',         'Visualizar calendário e agenda escolar'),
  ('coordinator',    'school.agenda.manage',       'Criar e gerenciar eventos na agenda escolar'),
  ('coordinator',    'school.transport.view',      'Visualizar rotas e alunos no transporte escolar'),
  ('coordinator',    'school.communication.view',  'Visualizar central de comunicação da escola'),
  ('coordinator',    'school.communication.send',  'Disparar comunicados aos responsáveis'),

  ('teacher',        'school.dashboard.view',      'Visualizar dashboard do professor'),
  ('teacher',        'school.students.view',       'Consultar alunos matriculados na escola'),
  ('teacher',        'school.classes.view',        'Visualizar suas turmas'),
  ('teacher',        'school.lessons.view',        'Visualizar suas aulas e conteúdos'),
  ('teacher',        'school.lessons.manage',      'Criar e editar aulas no Lesson Builder'),
  ('teacher',        'school.assignments.manage',  'Atribuir tarefas para sua turma'),
  ('teacher',        'school.results.view',        'Corrigir entregas e atribuir notas e feedbacks'),
  ('teacher',        'school.agenda.view',         'Visualizar calendário escolar'),
  ('teacher',        'school.transport.view',      'Consultar alunos que utilizam transporte'),

  ('transport',      'school.transport.view',      'Visualizar rotas e alunos autorizados'),
  ('transport',      'school.transport.operate',   'Registrar embarque e conferência no veículo')
ON CONFLICT (role, capability) DO NOTHING;

-- 2. GARANTIR UNICIDADE E FORMATAÇÃO DA MATRÍCULA DE 6 DÍGITOS EM organization_students
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'uq_org_student_enrollment_code'
  ) THEN
    ALTER TABLE public.organization_students
      ADD CONSTRAINT uq_org_student_enrollment_code UNIQUE (organization_id, enrollment_code);
  END IF;
END $$;

-- 3. AGENDA E EVENTOS ESCOLARES (school_calendar_events)
CREATE TABLE IF NOT EXISTS public.school_calendar_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  class_id        UUID REFERENCES public.educational_classes(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  event_type      TEXT NOT NULL CHECK (event_type IN ('lesson', 'assignment', 'exam', 'meeting', 'event', 'presentation', 'field_trip', 'holiday', 'other')),
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

CREATE INDEX IF NOT EXISTS idx_school_events_org ON public.school_calendar_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_school_events_date ON public.school_calendar_events(event_date);
CREATE INDEX IF NOT EXISTS idx_school_events_class ON public.school_calendar_events(class_id);

-- 4. PRESTADORES / EMPRESAS DE TRANSPORTE ESCOLAR (school_transport_providers)
CREATE TABLE IF NOT EXISTS public.school_transport_providers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  company_name    TEXT NOT NULL,
  responsible_name TEXT,
  phone           TEXT,
  document_cnpj   TEXT,
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_transport_providers_org ON public.school_transport_providers(organization_id);

-- 5. MOTORISTAS E MONITORES (school_transport_people)
CREATE TABLE IF NOT EXISTS public.school_transport_people (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  provider_id     UUID REFERENCES public.school_transport_providers(id) ON DELETE SET NULL,
  person_type     TEXT NOT NULL CHECK (person_type IN ('driver', 'monitor')),
  full_name       TEXT NOT NULL,
  phone           TEXT,
  license_number  TEXT, -- CNH (acesso restrito)
  license_validity DATE,
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_transport_people_org ON public.school_transport_people(organization_id);
CREATE INDEX IF NOT EXISTS idx_transport_people_provider ON public.school_transport_people(provider_id);

-- 6. VEÍCULOS ESCOLARES (school_transport_vehicles)
CREATE TABLE IF NOT EXISTS public.school_transport_vehicles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  provider_id     UUID REFERENCES public.school_transport_providers(id) ON DELETE SET NULL,
  driver_id       UUID REFERENCES public.school_transport_people(id) ON DELETE SET NULL,
  identification  TEXT NOT NULL, -- ex: "Van Escolar 04"
  vehicle_type    TEXT NOT NULL DEFAULT 'van' CHECK (vehicle_type IN ('van', 'bus', 'minibus', 'other')),
  plate           TEXT NOT NULL,
  capacity        INTEGER NOT NULL DEFAULT 16,
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_transport_vehicles_org ON public.school_transport_vehicles(organization_id);

-- 7. ROTAS E PERÍODOS DE TRANSPORTE (school_transport_routes)
CREATE TABLE IF NOT EXISTS public.school_transport_routes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL, -- ex: "Rota Bairro Central - Manhã"
  shift           TEXT NOT NULL CHECK (shift IN ('morning', 'afternoon', 'night', 'full_time')),
  vehicle_id      UUID REFERENCES public.school_transport_vehicles(id) ON DELETE SET NULL,
  driver_id       UUID REFERENCES public.school_transport_people(id) ON DELETE SET NULL,
  monitor_id      UUID REFERENCES public.school_transport_people(id) ON DELETE SET NULL,
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_transport_routes_org ON public.school_transport_routes(organization_id);

-- 8. ALUNOS AUTORIZADOS NO TRANSPORTE (school_transport_assignments)
CREATE TABLE IF NOT EXISTS public.school_transport_assignments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  route_id        UUID NOT NULL REFERENCES public.school_transport_routes(id) ON DELETE CASCADE,
  child_id        UUID NOT NULL REFERENCES public.children(id) ON DELETE RESTRICT,
  provider_id     UUID REFERENCES public.school_transport_providers(id) ON DELETE SET NULL,
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'canceled')),
  start_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date        DATE,
  notes           TEXT,
  created_by      UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT uq_route_child UNIQUE (route_id, child_id)
);

CREATE INDEX IF NOT EXISTS idx_transport_assign_org ON public.school_transport_assignments(organization_id);
CREATE INDEX IF NOT EXISTS idx_transport_assign_route ON public.school_transport_assignments(route_id);
CREATE INDEX IF NOT EXISTS idx_transport_assign_child ON public.school_transport_assignments(child_id);

-- 9. CENTRAL DE COMUNICAÇÃO ESCOLAR (school_communications)
CREATE TABLE IF NOT EXISTS public.school_communications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  message         TEXT NOT NULL,
  target_audience TEXT NOT NULL CHECK (target_audience IN ('all_guardians', 'class', 'route', 'team')),
  class_id        UUID REFERENCES public.educational_classes(id) ON DELETE SET NULL,
  route_id        UUID REFERENCES public.school_transport_routes(id) ON DELETE SET NULL,
  channel         TEXT NOT NULL DEFAULT 'whatsapp' CHECK (channel IN ('whatsapp', 'email', 'internal', 'push')),
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'queued', 'sent', 'failed')),
  scheduled_for   TIMESTAMPTZ,
  recipients_count INTEGER NOT NULL DEFAULT 0,
  created_by      UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_school_comms_org ON public.school_communications(organization_id);
CREATE INDEX IF NOT EXISTS idx_school_comms_status ON public.school_communications(status);

-- ==============================================================================
-- 10. ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.school_calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_transport_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_transport_people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_transport_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_transport_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_transport_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_communications ENABLE ROW LEVEL SECURITY;

-- POLICIES: school_calendar_events
CREATE POLICY "Membros da escola visualizam e gerenciam agenda escolar"
  ON public.school_calendar_events FOR ALL
  TO authenticated
  USING (public.is_org_member(organization_id))
  WITH CHECK (public.is_org_member(organization_id));

-- POLICIES: school_transport_providers
CREATE POLICY "Membros da escola visualizam e gerenciam prestadores de transporte"
  ON public.school_transport_providers FOR ALL
  TO authenticated
  USING (public.is_org_member(organization_id))
  WITH CHECK (public.is_org_member(organization_id));

-- POLICIES: school_transport_people
CREATE POLICY "Membros da escola visualizam e gerenciam motoristas e monitores"
  ON public.school_transport_people FOR ALL
  TO authenticated
  USING (public.is_org_member(organization_id))
  WITH CHECK (public.is_org_member(organization_id));

-- POLICIES: school_transport_vehicles
CREATE POLICY "Membros da escola visualizam e gerenciam veiculos escolares"
  ON public.school_transport_vehicles FOR ALL
  TO authenticated
  USING (public.is_org_member(organization_id))
  WITH CHECK (public.is_org_member(organization_id));

-- POLICIES: school_transport_routes
CREATE POLICY "Membros da escola visualizam e gerenciam rotas escolares"
  ON public.school_transport_routes FOR ALL
  TO authenticated
  USING (public.is_org_member(organization_id))
  WITH CHECK (public.is_org_member(organization_id));

-- POLICIES: school_transport_assignments
CREATE POLICY "Membros da escola visualizam e gerenciam alunos no transporte"
  ON public.school_transport_assignments FOR ALL
  TO authenticated
  USING (public.is_org_member(organization_id))
  WITH CHECK (public.is_org_member(organization_id));

-- POLICIES: school_communications
CREATE POLICY "Membros da escola visualizam e gerenciam comunicados"
  ON public.school_communications FOR ALL
  TO authenticated
  USING (public.is_org_member(organization_id))
  WITH CHECK (public.is_org_member(organization_id));

-- ==============================================================================
-- 11. RPC SEGURA: CADASTRO CENTRAL DO ALUNO + MATRÍCULA ATÔMICA DE 6 DÍGITOS
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.register_school_student(
  p_org_id UUID,
  p_first_name TEXT,
  p_last_name TEXT,
  p_birth_date DATE,
  p_guardian_name TEXT,
  p_guardian_phone TEXT,
  p_class_id UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_child_id UUID;
  v_guardian_id UUID;
  v_registration TEXT;
  v_attempts INT := 0;
  v_exists BOOLEAN;
BEGIN
  -- 1. Validar membro da escola
  IF NOT public.is_org_member(p_org_id) THEN
    RAISE EXCEPTION 'Acesso não autorizado para esta organização';
  END IF;

  -- 2. Gerar matrícula de 6 dígitos numéricos com zero à esquerda preservado e retry anti-colisão
  LOOP
    v_attempts := v_attempts + 1;
    v_registration := LPAD((floor(random() * 900000) + 100000)::text, 6, '0');
    
    SELECT EXISTS (
      SELECT 1 FROM public.organization_students
      WHERE organization_id = p_org_id AND enrollment_code = v_registration
    ) INTO v_exists;

    IF NOT v_exists THEN
      EXIT;
    END IF;

    IF v_attempts > 10 THEN
      RAISE EXCEPTION 'Não foi possível gerar uma matrícula única no momento';
    END IF;
  END LOOP;

  -- 3. Criar identidade central da criança
  INSERT INTO public.children (
    first_name,
    last_name,
    birth_date
  ) VALUES (
    p_first_name,
    p_last_name,
    p_birth_date
  ) RETURNING id INTO v_child_id;

  -- 4. Criar vínculo institucional como aluno da escola
  INSERT INTO public.organization_students (
    organization_id,
    child_id,
    enrollment_code,
    status
  ) VALUES (
    p_org_id,
    v_child_id,
    v_registration,
    'active'
  );

  -- 5. Vincular responsável se fornecido
  IF p_guardian_name IS NOT NULL AND trim(p_guardian_name) != '' THEN
    INSERT INTO public.guardians (
      full_name,
      phone
    ) VALUES (
      trim(p_guardian_name),
      p_guardian_phone
    ) RETURNING id INTO v_guardian_id;

    INSERT INTO public.child_guardians (
      child_id,
      guardian_id,
      kinship,
      is_primary,
      can_pickup
    ) VALUES (
      v_child_id,
      v_guardian_id,
      'Responsável',
      true,
      true
    );
  END IF;

  -- 6. Vincular à turma se solicitada
  IF p_class_id IS NOT NULL THEN
    INSERT INTO public.educational_class_students (
      class_id,
      child_id,
      student_name,
      student_code,
      guardian_name,
      guardian_phone
    ) VALUES (
      p_class_id,
      v_child_id,
      trim(concat(p_first_name, ' ', p_last_name)),
      v_registration,
      p_guardian_name,
      p_guardian_phone
    );
  END IF;

  -- 7. Auditoria obrigatória
  INSERT INTO public.activity_logs (
    organization_id,
    actor_id,
    context,
    action,
    target_type,
    target_id,
    metadata
  ) VALUES (
    p_org_id,
    auth.uid(),
    'school',
    'school.student.registered',
    'student',
    v_child_id::text,
    jsonb_build_object(
      'registration', v_registration,
      'class_id', p_class_id
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'child_id', v_child_id,
    'registration', v_registration
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
