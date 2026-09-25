-- ==============================================================================
-- FASE 3: MOTOR EDUCACIONAL COMPARTILHADO COM DEUS KIDS
-- Suporta: Professor Individual, Igreja (EBD) e Escola
-- Compartilha: Turmas, Aulas (Lesson Builder), Blocos Interativos, Pintura,
-- Submissões, Correções, Notas e Progresso
-- ==============================================================================

-- 1. Turmas Educacionais (Professor individual, Igreja ou Escola)
CREATE TABLE IF NOT EXISTS public.educational_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    age_group TEXT, -- ex: '3-5 anos', '6-8 anos', '9-12 anos'
    color_tag TEXT DEFAULT '#7c3aed',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 2. Alunos da Turma
CREATE TABLE IF NOT EXISTS public.educational_class_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.educational_classes(id) ON DELETE CASCADE,
    child_id UUID REFERENCES public.children(id) ON DELETE SET NULL,
    student_name TEXT NOT NULL,
    avatar_url TEXT DEFAULT 'star',
    student_code TEXT, -- código de acesso amigável individual
    guardian_name TEXT,
    guardian_phone TEXT,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 3. Aulas Educacionais
CREATE TABLE IF NOT EXISTS public.educational_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.educational_classes(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    biblical_reference TEXT, -- ex: 'Gênesis 1:1-31'
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    share_code TEXT NOT NULL UNIQUE DEFAULT upper(substring(md5(random()::text) from 1 for 6)),
    due_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 4. Blocos Interativos da Aula (Lesson Builder)
-- Tipos:
--   'story': História / Reflexão / Texto bíblico
--   'video': Vídeo / Animação Com Deus Kids
--   'quiz': Perguntas de múltipla escolha com correção instantânea
--   'coloring': Tarefa de pintura bíblica digital
--   'homework': Pergunta reflexiva / Lição de casa
--   'material': Material de apoio / PDF para impressão
CREATE TABLE IF NOT EXISTS public.educational_lesson_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES public.educational_lessons(id) ON DELETE CASCADE,
    block_type TEXT NOT NULL CHECK (block_type IN ('story', 'video', 'quiz', 'coloring', 'homework', 'material')),
    title TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    points INTEGER NOT NULL DEFAULT 10,
    content_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 5. Submissões de Aulas / Respostas dos Alunos
CREATE TABLE IF NOT EXISTS public.educational_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES public.educational_lessons(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.educational_class_students(id) ON DELETE SET NULL,
    student_name TEXT NOT NULL,
    score NUMERIC(5,2) DEFAULT 0,
    max_score NUMERIC(5,2) DEFAULT 10,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('started', 'submitted', 'reviewed')),
    feedback TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 6. Respostas Detalhadas por Bloco
CREATE TABLE IF NOT EXISTS public.educational_submission_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES public.educational_submissions(id) ON DELETE CASCADE,
    block_id UUID NOT NULL REFERENCES public.educational_lesson_blocks(id) ON DELETE CASCADE,
    block_type TEXT NOT NULL,
    answer_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_correct BOOLEAN,
    points_awarded NUMERIC(5,2) DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ÍNDICES DE PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_edu_classes_created_by ON public.educational_classes(created_by);
CREATE INDEX IF NOT EXISTS idx_edu_classes_org ON public.educational_classes(organization_id);
CREATE INDEX IF NOT EXISTS idx_edu_students_class ON public.educational_class_students(class_id);
CREATE INDEX IF NOT EXISTS idx_edu_lessons_creator ON public.educational_lessons(created_by);
CREATE INDEX IF NOT EXISTS idx_edu_lessons_share_code ON public.educational_lessons(share_code);
CREATE INDEX IF NOT EXISTS idx_edu_blocks_lesson ON public.educational_lesson_blocks(lesson_id, order_index);
CREATE INDEX IF NOT EXISTS idx_edu_submissions_lesson ON public.educational_submissions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_edu_answers_submission ON public.educational_submission_answers(submission_id);

-- HABILITAR RLS EM TODAS AS TABELAS EDUCACIONAIS
ALTER TABLE public.educational_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educational_class_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educational_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educational_lesson_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educational_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educational_submission_answers ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS RLS

-- 1. educational_classes
CREATE POLICY "Professores gerenciam suas proprias turmas"
ON public.educational_classes
FOR ALL
TO authenticated
USING (
    created_by = auth.uid()
    OR (
        organization_id IS NOT NULL 
        AND organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid() AND is_active = true)
    )
)
WITH CHECK (
    created_by = auth.uid()
    OR (
        organization_id IS NOT NULL 
        AND organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid() AND is_active = true)
    )
);

-- 2. educational_class_students
CREATE POLICY "Professores gerenciam alunos de suas turmas"
ON public.educational_class_students
FOR ALL
TO authenticated
USING (
    class_id IN (
        SELECT id FROM public.educational_classes 
        WHERE created_by = auth.uid()
        OR (
            organization_id IS NOT NULL 
            AND organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid() AND is_active = true)
        )
    )
)
WITH CHECK (
    class_id IN (
        SELECT id FROM public.educational_classes 
        WHERE created_by = auth.uid()
        OR (
            organization_id IS NOT NULL 
            AND organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid() AND is_active = true)
        )
    )
);

-- 3. educational_lessons
CREATE POLICY "Professores gerenciam suas aulas"
ON public.educational_lessons
FOR ALL
TO authenticated
USING (
    created_by = auth.uid()
    OR (
        organization_id IS NOT NULL 
        AND organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid() AND is_active = true)
    )
)
WITH CHECK (
    created_by = auth.uid()
    OR (
        organization_id IS NOT NULL 
        AND organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid() AND is_active = true)
    )
);

-- Leitura pública de aulas publicadas via share_code para alunos
CREATE POLICY "Alunos visualizam aulas publicadas por codigo"
ON public.educational_lessons
FOR SELECT
TO public
USING (status = 'published');

-- 4. educational_lesson_blocks
CREATE POLICY "Professores gerenciam blocos de suas aulas"
ON public.educational_lesson_blocks
FOR ALL
TO authenticated
USING (
    lesson_id IN (
        SELECT id FROM public.educational_lessons
        WHERE created_by = auth.uid()
        OR (
            organization_id IS NOT NULL 
            AND organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid() AND is_active = true)
        )
    )
)
WITH CHECK (
    lesson_id IN (
        SELECT id FROM public.educational_lessons
        WHERE created_by = auth.uid()
        OR (
            organization_id IS NOT NULL 
            AND organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid() AND is_active = true)
        )
    )
);

-- Alunos visualizam blocos de aulas publicadas
CREATE POLICY "Alunos visualizam blocos de aulas publicadas"
ON public.educational_lesson_blocks
FOR SELECT
TO public
USING (
    lesson_id IN (SELECT id FROM public.educational_lessons WHERE status = 'published')
);

-- 5. educational_submissions
-- Aluno pode submeter resposta (mesmo anonimamente via código da aula)
CREATE POLICY "Alunos podem criar submissoes de aulas publicadas"
ON public.educational_submissions
FOR INSERT
TO public
WITH CHECK (
    lesson_id IN (SELECT id FROM public.educational_lessons WHERE status = 'published')
);

-- Professores visualizam e corrigem submissoes de suas aulas
CREATE POLICY "Professores gerenciam submissoes de suas aulas"
ON public.educational_submissions
FOR ALL
TO authenticated
USING (
    lesson_id IN (
        SELECT id FROM public.educational_lessons
        WHERE created_by = auth.uid()
        OR (
            organization_id IS NOT NULL 
            AND organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid() AND is_active = true)
        )
    )
)
WITH CHECK (
    lesson_id IN (
        SELECT id FROM public.educational_lessons
        WHERE created_by = auth.uid()
        OR (
            organization_id IS NOT NULL 
            AND organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid() AND is_active = true)
        )
    )
);

-- 6. educational_submission_answers
CREATE POLICY "Alunos gravam respostas de suas submissoes"
ON public.educational_submission_answers
FOR INSERT
TO public
WITH CHECK (
    submission_id IN (SELECT id FROM public.educational_submissions)
);

CREATE POLICY "Professores visualizam e avaliam respostas de submissoes"
ON public.educational_submission_answers
FOR ALL
TO authenticated
USING (
    submission_id IN (
        SELECT s.id FROM public.educational_submissions s
        JOIN public.educational_lessons l ON l.id = s.lesson_id
        WHERE l.created_by = auth.uid()
        OR (
            l.organization_id IS NOT NULL 
            AND l.organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid() AND is_active = true)
        )
    )
)
WITH CHECK (
    submission_id IN (
        SELECT s.id FROM public.educational_submissions s
        JOIN public.educational_lessons l ON l.id = s.lesson_id
        WHERE l.created_by = auth.uid()
        OR (
            l.organization_id IS NOT NULL 
            AND l.organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid() AND is_active = true)
        )
    )
);
