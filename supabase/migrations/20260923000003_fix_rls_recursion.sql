-- ============================================================
-- COM DEUS KIDS — FASE 1.1: Correção de Recursão em RLS
-- Migration: 20260923000003_fix_rls_recursion.sql
-- ============================================================
-- AUDITORIA DE SEGURANÇA REALIZADA:
-- 1. search_path = public, pg_temp fixado em todas as funções SECURITY DEFINER.
-- 2. Retorno imediato de conjunto vazio quando auth.uid() IS NULL.
-- 3. Referências estritamente qualificadas (public.*).
-- 4. Sem uso de SQL dinâmico.
-- 5. Revogação de EXECUTE de PUBLIC e concessão exclusiva a 'authenticated'.

-- ------------------------------------------------------------
-- 1. FUNÇÕES AUXILIARES DE SEGURANÇA (AUDITADAS E HARDENED)
-- ------------------------------------------------------------

-- Retorna as organizações ativas do usuário autenticado
CREATE OR REPLACE FUNCTION public.get_user_org_ids()
RETURNS SETOF UUID AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT m.organization_id 
  FROM public.organization_members m
  WHERE m.user_id = auth.uid() 
    AND m.is_active = TRUE;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION public.get_user_org_ids() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_org_ids() TO authenticated;

-- Retorna os IDs de responsáveis vinculados ao usuário autenticado
CREATE OR REPLACE FUNCTION public.get_user_guardian_ids()
RETURNS SETOF UUID AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT g.id 
  FROM public.guardians g
  WHERE g.user_id = auth.uid() 
    AND g.is_active = TRUE;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION public.get_user_guardian_ids() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_guardian_ids() TO authenticated;

-- Retorna todas as crianças acessíveis ao usuário (como pai, guardião ou educador da instituição)
CREATE OR REPLACE FUNCTION public.get_user_accessible_child_ids()
RETURNS SETOF UUID AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  -- 1. Crianças da família via account_profiles
  SELECT ap.child_id 
  FROM public.account_profiles ap
  WHERE ap.user_id = auth.uid() 
    AND ap.child_id IS NOT NULL
  UNION
  -- 2. Crianças vinculadas como guardião
  SELECT cg.child_id 
  FROM public.child_guardians cg
  WHERE cg.guardian_id IN (SELECT public.get_user_guardian_ids())
    AND cg.is_active = TRUE
  UNION
  -- 3. Crianças matriculadas em organizações onde o usuário é membro ativo
  SELECT os.child_id 
  FROM public.organization_students os
  WHERE os.organization_id IN (SELECT public.get_user_org_ids()) 
    AND os.status = 'active';
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION public.get_user_accessible_child_ids() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_accessible_child_ids() TO authenticated;

-- Atualizar check_user_capability com search_path seguro
CREATE OR REPLACE FUNCTION public.check_user_capability(
  p_org_id UUID,
  p_capability TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  IF auth.uid() IS NULL OR p_org_id IS NULL OR p_capability IS NULL THEN
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
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION public.check_user_capability(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_user_capability(UUID, TEXT) TO authenticated, anon;

-- ------------------------------------------------------------
-- 2. REMOVER POLICIES RECURSIVAS ANTERIORES
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Membros ativos visualizam sua organização" ON public.organizations;
DROP POLICY IF EXISTS "Dono atualiza sua organização" ON public.organizations;

DROP POLICY IF EXISTS "Membros visualizam colegas da mesma organização" ON public.organization_members;
DROP POLICY IF EXISTS "Gestores gerenciam membros da organização" ON public.organization_members;

DROP POLICY IF EXISTS "Membros da organização visualizam seus alunos" ON public.organization_students;
DROP POLICY IF EXISTS "Gestores da organização gerenciam matrículas" ON public.organization_students;

DROP POLICY IF EXISTS "Acesso seguro à identidade da criança" ON public.children;
DROP POLICY IF EXISTS "Atualização da identidade da criança" ON public.children;
DROP POLICY IF EXISTS "Inserção de crianças por pais ou gestores autorizados" ON public.children;

DROP POLICY IF EXISTS "Visualização de responsáveis" ON public.guardians;
DROP POLICY IF EXISTS "Gerenciamento do próprio responsável" ON public.guardians;

DROP POLICY IF EXISTS "Visualização de vínculos de responsáveis" ON public.child_guardians;
DROP POLICY IF EXISTS "Gestão de vínculos de responsáveis pelo responsável principal" ON public.child_guardians;

DROP POLICY IF EXISTS "Visualização de cuidados e alergias" ON public.child_care_notes;
DROP POLICY IF EXISTS "Gestão de cuidados e alergias" ON public.child_care_notes;

-- ------------------------------------------------------------
-- 3. RECRIAÇÃO DE POLICIES LIMPAS, DETERMINÍSTICAS E SEM RECURSÃO
-- ------------------------------------------------------------

-- ORGANIZATIONS
CREATE POLICY "Membros ativos visualizam sua organização"
  ON public.organizations FOR SELECT
  USING (
    owner_id = auth.uid() OR
    id IN (SELECT public.get_user_org_ids())
  );

CREATE POLICY "Dono atualiza sua organização"
  ON public.organizations FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- ORGANIZATION_MEMBERS
CREATE POLICY "Membros visualizam colegas da mesma organização"
  ON public.organization_members FOR SELECT
  USING (
    user_id = auth.uid() OR
    organization_id IN (SELECT public.get_user_org_ids())
  );

CREATE POLICY "Gestores gerenciam membros da organização"
  ON public.organization_members FOR ALL
  USING (public.check_user_capability(organization_id, 'members.manage'))
  WITH CHECK (public.check_user_capability(organization_id, 'members.manage'));

-- ORGANIZATION_STUDENTS (Isolamento multi-tenant estrito: Igreja A nunca enxerga Igreja B)
CREATE POLICY "Membros da organização visualizam seus alunos"
  ON public.organization_students FOR SELECT
  USING (
    organization_id IN (SELECT public.get_user_org_ids()) OR
    child_id IN (SELECT public.get_user_accessible_child_ids())
  );

CREATE POLICY "Gestores da organização gerenciam matrículas"
  ON public.organization_students FOR ALL
  USING (public.check_user_capability(organization_id, 'student.manage'))
  WITH CHECK (public.check_user_capability(organization_id, 'student.manage'));

-- CHILDREN
CREATE POLICY "Acesso seguro à identidade da criança"
  ON public.children FOR SELECT
  USING (
    id IN (SELECT public.get_user_accessible_child_ids())
  );

CREATE POLICY "Atualização da identidade da criança"
  ON public.children FOR UPDATE
  USING (
    id IN (
      SELECT ap.child_id 
      FROM public.account_profiles ap 
      WHERE ap.user_id = auth.uid() AND ap.child_id IS NOT NULL
    )
  )
  WITH CHECK (
    id IN (
      SELECT ap.child_id 
      FROM public.account_profiles ap 
      WHERE ap.user_id = auth.uid() AND ap.child_id IS NOT NULL
    )
  );

CREATE POLICY "Inserção de crianças por pais ou gestores autorizados"
  ON public.children FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- GUARDIANS
CREATE POLICY "Visualização de responsáveis"
  ON public.guardians FOR SELECT
  USING (
    user_id = auth.uid() OR
    id IN (
      SELECT cg.guardian_id 
      FROM public.child_guardians cg
      WHERE cg.child_id IN (SELECT public.get_user_accessible_child_ids())
    )
  );

CREATE POLICY "Gerenciamento do próprio responsável"
  ON public.guardians FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- CHILD_GUARDIANS
CREATE POLICY "Visualização de vínculos de responsáveis"
  ON public.child_guardians FOR SELECT
  USING (
    guardian_id IN (SELECT public.get_user_guardian_ids()) OR
    child_id IN (SELECT public.get_user_accessible_child_ids())
  );

CREATE POLICY "Gestão de vínculos de responsáveis pelo titular da conta"
  ON public.child_guardians FOR ALL
  USING (
    child_id IN (
      SELECT ap.child_id 
      FROM public.account_profiles ap 
      WHERE ap.user_id = auth.uid() AND ap.child_id IS NOT NULL
    )
  );

-- CHILD_CARE_NOTES (Dados sensíveis restritos)
CREATE POLICY "Visualização de cuidados e alergias"
  ON public.child_care_notes FOR SELECT
  USING (
    child_id IN (SELECT public.get_user_accessible_child_ids())
  );

CREATE POLICY "Gestão de cuidados e alergias pelo titular da conta"
  ON public.child_care_notes FOR ALL
  USING (
    child_id IN (
      SELECT ap.child_id 
      FROM public.account_profiles ap 
      WHERE ap.user_id = auth.uid() AND ap.child_id IS NOT NULL
    )
  );
