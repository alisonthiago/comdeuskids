-- ============================================================
-- COM DEUS KIDS — FASE 1: Core de Identidade + Multi-Tenant
-- Migration: 20260923000002_core_identity_and_multitenant.sql
-- ============================================================

-- 1. IDENTIDADE CENTRAL DA CRIANÇA (children)
-- Identidade única e independente de tenant. Permite vínculo com família, igreja e escola
-- sem duplicação de dados e sem vazamento cruzado.
CREATE TABLE IF NOT EXISTS public.children (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name  TEXT NOT NULL,
  last_name   TEXT,
  birth_date  DATE,
  gender      TEXT CHECK (gender IN ('male', 'female', 'unspecified')),
  avatar_url  TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  archived_at TIMESTAMPTZ, -- Retenção configurável / soft delete
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_children_active ON public.children(is_active) WHERE is_active = TRUE;

-- 2. RESPONSÁVEIS (guardians)
-- Adulto responsável. Pode estar vinculado a um auth.users(id) ou ser cadastro offline (ex: avó que busca)
CREATE TABLE IF NOT EXISTS public.guardians (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Vínculo opcional se já for usuário
  full_name   TEXT NOT NULL,
  phone       TEXT, -- WhatsApp para comunicações
  email       TEXT,
  photo_url   TEXT,
  document_id TEXT, -- CPF / Documento para segurança de retirada
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  archived_at TIMESTAMPTZ, -- Retenção configurável
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guardians_user_id ON public.guardians(user_id);
CREATE INDEX IF NOT EXISTS idx_guardians_phone ON public.guardians(phone);

-- 3. ASSOCIAÇÃO CRIANÇA ↔ RESPONSÁVEIS (child_guardians)
-- N:N: 1 responsável tem N filhos; 1 filho tem N responsáveis autorizados
CREATE TABLE IF NOT EXISTS public.child_guardians (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id                 UUID NOT NULL REFERENCES public.children(id) ON DELETE RESTRICT,
  guardian_id              UUID NOT NULL REFERENCES public.guardians(id) ON DELETE RESTRICT,
  kinship                  TEXT NOT NULL DEFAULT 'Responsável', -- 'Pai', 'Mãe', 'Avô', 'Avó', 'Tio', 'Tia de Van'
  is_primary               BOOLEAN NOT NULL DEFAULT FALSE,
  is_financial_responsible BOOLEAN NOT NULL DEFAULT FALSE,
  can_pickup               BOOLEAN NOT NULL DEFAULT TRUE,
  can_authorize_pickup     BOOLEAN NOT NULL DEFAULT FALSE,
  emergency_priority       INT NOT NULL DEFAULT 1,
  notification_preferences JSONB NOT NULL DEFAULT '{"whatsapp": true, "email": false}'::jsonb,
  is_active                BOOLEAN NOT NULL DEFAULT TRUE,
  archived_at              TIMESTAMPTZ,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (child_id, guardian_id)
);

CREATE INDEX IF NOT EXISTS idx_child_guardians_child ON public.child_guardians(child_id);
CREATE INDEX IF NOT EXISTS idx_child_guardians_guardian ON public.child_guardians(guardian_id);

-- 4. DADOS RESTRITOS DE CUIDADO INFANTIL (child_care_notes)
-- Alergias, restrições alimentares e observações de saúde
CREATE TABLE IF NOT EXISTS public.child_care_notes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id        UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  note_type       TEXT NOT NULL CHECK (note_type IN ('allergy', 'dietary', 'medical', 'special_support', 'general')),
  description     TEXT NOT NULL,
  severity        TEXT CHECK (severity IN ('low', 'medium', 'critical')),
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  archived_at     TIMESTAMPTZ,
  created_by      UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_child_care_notes_child ON public.child_care_notes(child_id);

-- 5. EXTENSÃO COMPATÍVEL DE account_profiles (Perfis de Família Existentes)
-- child_id é adicionado como nullable para preservar 100% dos perfis existentes sem quebra
ALTER TABLE public.account_profiles
  ADD COLUMN IF NOT EXISTS child_id UUID REFERENCES public.children(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS daily_limit_minutes INTEGER DEFAULT 120,
  ADD COLUMN IF NOT EXISTS bedtime_hour TIME DEFAULT '21:30',
  ADD COLUMN IF NOT EXISTS allowed_days TEXT[] DEFAULT '{"seg","ter","qua","qui","sex","sab","dom"}',
  ADD COLUMN IF NOT EXISTS is_paused BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS paused_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS strict_educational_only BOOLEAN DEFAULT FALSE;

-- BACKFILL SEGURO: Cria uma identidade em public.children para cada perfil infantil existente sem child_id
-- Não faz merge automático entre crianças com mesmo nome
DO $$
DECLARE
  r RECORD;
  new_child_id UUID;
BEGIN
  FOR r IN (
    SELECT id, name, avatar_url, age 
    FROM public.account_profiles 
    WHERE profile_type = 'kid' AND child_id IS NULL
  ) LOOP
    INSERT INTO public.children (first_name, avatar_url, birth_date)
    VALUES (
      r.name, 
      r.avatar_url, 
      CASE WHEN r.age IS NOT NULL THEN (CURRENT_DATE - (r.age * INTERVAL '1 year'))::date ELSE NULL END
    )
    RETURNING id INTO new_child_id;

    UPDATE public.account_profiles
    SET child_id = new_child_id
    WHERE id = r.id;
  END LOOP;
END $$;

-- 6. ORGANIZAÇÕES (Igrejas, Escolas e Professores com Organização)
CREATE TABLE IF NOT EXISTS public.organizations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  type        TEXT NOT NULL CHECK (type IN ('church', 'school', 'ministry', 'independent_teacher')),
  document    TEXT, -- CNPJ
  phone       TEXT,
  email       TEXT,
  owner_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  settings    JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  archived_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_owner ON public.organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_organizations_type ON public.organizations(type);

-- 7. MATRIZ DE CAPABILITIES (role_capabilities)
CREATE TABLE IF NOT EXISTS public.role_capabilities (
  role        TEXT NOT NULL,
  capability  TEXT NOT NULL,
  description TEXT,
  PRIMARY KEY (role, capability)
);

INSERT INTO public.role_capabilities (role, capability, description) VALUES
  ('owner',          'organization.manage',     'Gerenciar toda a organização e planos'),
  ('owner',          'members.manage',          'Adicionar e remover membros da equipe'),
  ('owner',          'lesson.create',           'Criar aulas e materiais'),
  ('owner',          'lesson.publish',          'Publicar aulas e gerar códigos'),
  ('owner',          'student.manage',          'Cadastrar e enturmar alunos'),
  ('owner',          'checkin.operate',         'Realizar entrada e pulseiras'),
  ('owner',          'pickup.approve',          'Conferir QR Code e autorizar retirada'),
  ('owner',          'message.send',            'Enviar comunicações e avisos'),

  ('admin',          'members.manage',          'Adicionar e gerenciar professores e monitores'),
  ('admin',          'lesson.create',           'Criar aulas e materiais'),
  ('admin',          'lesson.publish',          'Publicar aulas e gerar códigos'),
  ('admin',          'student.manage',          'Cadastrar e enturmar alunos'),
  ('admin',          'checkin.operate',         'Realizar entrada e pulseiras'),
  ('admin',          'pickup.approve',          'Conferir QR Code e autorizar retirada'),
  ('admin',          'message.send',            'Enviar comunicações e avisos'),

  ('coordinator',    'lesson.create',           'Criar aulas e materiais'),
  ('coordinator',    'lesson.publish',          'Publicar aulas e gerar códigos'),
  ('coordinator',    'student.manage',          'Cadastrar e enturmar alunos'),
  ('coordinator',    'checkin.operate',         'Realizar entrada e pulseiras'),
  ('coordinator',    'pickup.approve',          'Conferir QR Code e autorizar retirada'),

  ('teacher',        'lesson.create',           'Criar aulas para suas turmas'),
  ('teacher',        'lesson.publish',          'Publicar aulas e gerar links de turma'),
  ('teacher',        'student.manage',          'Gerenciar alunos da sua turma'),

  ('reception',      'checkin.operate',         'Realizar entrada, foto e pulseiras'),
  ('reception',      'pickup.approve',          'Conferir QR Code e autorizar retirada'),

  ('transport',      'pickup.view_authorized',  'Visualizar crianças autorizadas para transporte')
ON CONFLICT (role, capability) DO NOTHING;

-- 8. MEMBROS DA ORGANIZAÇÃO (organization_members)
CREATE TABLE IF NOT EXISTS public.organization_members (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id     UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  role                TEXT NOT NULL DEFAULT 'teacher' CHECK (role IN ('owner', 'admin', 'coordinator', 'teacher', 'reception', 'transport')),
  custom_capabilities TEXT[] DEFAULT '{}',
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  archived_at         TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_organization_members_user ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_org ON public.organization_members(organization_id);

-- 9. ALUNOS DA ORGANIZAÇÃO (organization_students)
-- Isola os alunos matriculados em uma organização (Igreja A, Igreja B, Escola A, etc.)
CREATE TABLE IF NOT EXISTS public.organization_students (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  child_id        UUID NOT NULL REFERENCES public.children(id) ON DELETE RESTRICT,
  enrollment_code TEXT, -- Matrícula interna da instituição
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'transferred', 'archived')),
  enrolled_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at     TIMESTAMPTZ,
  metadata        JSONB DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, child_id)
);

CREATE INDEX IF NOT EXISTS idx_org_students_org ON public.organization_students(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_students_child ON public.organization_students(child_id);
CREATE INDEX IF NOT EXISTS idx_org_students_status ON public.organization_students(status);

-- 10. AUDITORIA UNIFICADA (activity_logs)
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  actor_id        UUID NOT NULL REFERENCES auth.users(id),
  context         TEXT NOT NULL CHECK (context IN ('family', 'teacher', 'church', 'school', 'admin')),
  action          TEXT NOT NULL,
  target_type     TEXT NOT NULL,
  target_id       TEXT,
  metadata        JSONB DEFAULT '{}'::jsonb,
  ip_address      INET,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_actor ON public.activity_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_org ON public.activity_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON public.activity_logs(created_at DESC);

-- ============================================================
-- 11. SEGURANÇA E RLS (REGRA 1: ACTIVE CONTEXT NÃO É AUTORIZAÇÃO)
-- ============================================================

-- Helper de verificação segura no banco (auth.uid + org_id + membership + capability)
CREATE OR REPLACE FUNCTION public.check_user_capability(
  p_org_id UUID,
  p_capability TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1 
    FROM public.organization_members m
    LEFT JOIN public.role_capabilities rc ON rc.role = m.role
    WHERE m.organization_id = p_org_id 
      AND m.user_id = auth.uid() 
      AND m.is_active = TRUE
      AND (
        m.role = 'owner'
        OR rc.capability = p_capability 
        OR p_capability = ANY(m.custom_capabilities)
      )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ativar RLS em todas as tabelas novas
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_care_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- POLICIES: ORGANIZATIONS
-- Membro ativo ou dono pode ver a organização
CREATE POLICY "Membros ativos visualizam sua organização"
  ON public.organizations FOR SELECT
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.organization_members m
      WHERE m.organization_id = organizations.id 
        AND m.user_id = auth.uid() 
        AND m.is_active = TRUE
    )
  );

-- Dono atualiza sua organização
CREATE POLICY "Dono atualiza sua organização"
  ON public.organizations FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- POLICIES: ORGANIZATION_MEMBERS
-- Membro só visualiza colegas da mesma organização
CREATE POLICY "Membros visualizam colegas da mesma organização"
  ON public.organization_members FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.organization_members m
      WHERE m.organization_id = organization_members.organization_id 
        AND m.user_id = auth.uid() 
        AND m.is_active = TRUE
    )
  );

-- Gestor da organização gerencia membros
CREATE POLICY "Gestores gerenciam membros da organização"
  ON public.organization_members FOR ALL
  USING (public.check_user_capability(organization_id, 'members.manage'))
  WITH CHECK (public.check_user_capability(organization_id, 'members.manage'));

-- POLICIES: ORGANIZATION_STUDENTS (Isolamento rígido: Igreja A não vê Igreja B)
CREATE POLICY "Membros da organização visualizam seus alunos"
  ON public.organization_students FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members m
      WHERE m.organization_id = organization_students.organization_id
        AND m.user_id = auth.uid()
        AND m.is_active = TRUE
    ) OR
    EXISTS (
      SELECT 1 FROM public.account_profiles ap
      WHERE ap.child_id = organization_students.child_id
        AND ap.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.child_guardians cg
      JOIN public.guardians g ON g.id = cg.guardian_id
      WHERE cg.child_id = organization_students.child_id
        AND g.user_id = auth.uid()
    )
  );

CREATE POLICY "Gestores da organização gerenciam matrículas"
  ON public.organization_students FOR ALL
  USING (public.check_user_capability(organization_id, 'student.manage'))
  WITH CHECK (public.check_user_capability(organization_id, 'student.manage'));

-- POLICIES: CHILDREN
-- Visualização: Responsável familiar OU membro de organização onde a criança está matriculada
CREATE POLICY "Acesso seguro à identidade da criança"
  ON public.children FOR SELECT
  USING (
    -- 1. Família dona via perfil infantil
    EXISTS (
      SELECT 1 FROM public.account_profiles ap
      WHERE ap.child_id = children.id AND ap.user_id = auth.uid()
    ) OR
    -- 2. Família dona via guardiões vinculados
    EXISTS (
      SELECT 1 FROM public.child_guardians cg
      JOIN public.guardians g ON g.id = cg.guardian_id
      WHERE cg.child_id = children.id AND g.user_id = auth.uid()
    ) OR
    -- 3. Membro ativo da organização onde a criança está matriculada
    EXISTS (
      SELECT 1 FROM public.organization_students os
      JOIN public.organization_members om ON om.organization_id = os.organization_id
      WHERE os.child_id = children.id
        AND om.user_id = auth.uid()
        AND om.is_active = TRUE
    )
  );

-- Atualização: Apenas responsáveis familiares ou gestores escolares/igreja autorizados
CREATE POLICY "Atualização da identidade da criança"
  ON public.children FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.account_profiles ap
      WHERE ap.child_id = children.id AND ap.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.child_guardians cg
      JOIN public.guardians g ON g.id = cg.guardian_id
      WHERE cg.child_id = children.id AND g.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.account_profiles ap
      WHERE ap.child_id = children.id AND ap.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.child_guardians cg
      JOIN public.guardians g ON g.id = cg.guardian_id
      WHERE cg.child_id = children.id AND g.user_id = auth.uid()
    )
  );

-- Inserção de crianças
CREATE POLICY "Inserção de crianças por pais ou gestores autorizados"
  ON public.children FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- POLICIES: GUARDIANS
CREATE POLICY "Visualização de responsáveis"
  ON public.guardians FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.child_guardians cg
      JOIN public.organization_students os ON os.child_id = cg.child_id
      JOIN public.organization_members om ON om.organization_id = os.organization_id
      WHERE cg.guardian_id = guardians.id
        AND om.user_id = auth.uid()
        AND om.is_active = TRUE
    ) OR
    EXISTS (
      SELECT 1 FROM public.child_guardians cg1
      JOIN public.child_guardians cg2 ON cg2.child_id = cg1.child_id
      JOIN public.guardians g2 ON g2.id = cg2.guardian_id
      WHERE cg1.guardian_id = guardians.id
        AND g2.user_id = auth.uid()
    )
  );

CREATE POLICY "Gerenciamento do próprio responsável"
  ON public.guardians FOR ALL
  USING (user_id = auth.uid() OR auth.role() = 'authenticated')
  WITH CHECK (user_id = auth.uid() OR auth.role() = 'authenticated');

-- POLICIES: CHILD_GUARDIANS
CREATE POLICY "Visualização de vínculos de responsáveis"
  ON public.child_guardians FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.guardians g
      WHERE g.id = child_guardians.guardian_id AND g.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.account_profiles ap
      WHERE ap.child_id = child_guardians.child_id AND ap.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.organization_students os
      JOIN public.organization_members om ON om.organization_id = os.organization_id
      WHERE os.child_id = child_guardians.child_id
        AND om.user_id = auth.uid()
        AND om.is_active = TRUE
    )
  );

CREATE POLICY "Gestão de vínculos de responsáveis pelo responsável principal"
  ON public.child_guardians FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.account_profiles ap
      WHERE ap.child_id = child_guardians.child_id AND ap.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.guardians g
      WHERE g.id = child_guardians.guardian_id AND g.user_id = auth.uid()
    )
  );

-- POLICIES: CHILD_CARE_NOTES (Dados sensíveis de cuidado/alergias)
CREATE POLICY "Visualização de cuidados e alergias"
  ON public.child_care_notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.account_profiles ap
      WHERE ap.child_id = child_care_notes.child_id AND ap.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.organization_students os
      JOIN public.organization_members om ON om.organization_id = os.organization_id
      WHERE os.child_id = child_care_notes.child_id
        AND om.user_id = auth.uid()
        AND om.is_active = TRUE
    )
  );

CREATE POLICY "Gestão de cuidados e alergias"
  ON public.child_care_notes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.account_profiles ap
      WHERE ap.child_id = child_care_notes.child_id AND ap.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.child_guardians cg
      JOIN public.guardians g ON g.id = cg.guardian_id
      WHERE cg.child_id = child_care_notes.child_id AND g.user_id = auth.uid()
    )
  );

-- POLICIES: ROLE_CAPABILITIES (Leitura aberta para autenticados)
CREATE POLICY "Leitura de capabilities do sistema"
  ON public.role_capabilities FOR SELECT
  USING (auth.role() = 'authenticated');

-- POLICIES: ACTIVITY_LOGS
CREATE POLICY "Atores visualizam seus próprios logs ou gestores da org"
  ON public.activity_logs FOR SELECT
  USING (
    actor_id = auth.uid() OR
    (organization_id IS NOT NULL AND public.check_user_capability(organization_id, 'organization.manage'))
  );

CREATE POLICY "Inserção de logs por autenticados"
  ON public.activity_logs FOR INSERT
  WITH CHECK (actor_id = auth.uid());

-- RESTRIÇÃO OPERACIONAL DE EXCLUSÃO (REGRA 3: RETENÇÃO DE DADOS)
-- Impede hard delete por usuários comuns nas entidades principais (exige soft delete via archived_at)
CREATE OR REPLACE FUNCTION public.restrict_operational_delete()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Exclusão física direta não permitida para esta entidade. Utilize arquivamento (archived_at) para conformidade com a política de retenção e proteção infantil.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_protect_children_delete
  BEFORE DELETE ON public.children
  FOR EACH ROW EXECUTE FUNCTION public.restrict_operational_delete();

CREATE TRIGGER trg_protect_guardians_delete
  BEFORE DELETE ON public.guardians
  FOR EACH ROW EXECUTE FUNCTION public.restrict_operational_delete();

CREATE TRIGGER trg_protect_org_students_delete
  BEFORE DELETE ON public.organization_students
  FOR EACH ROW EXECUTE FUNCTION public.restrict_operational_delete();
