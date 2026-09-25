# 12 — CONTAS, PERFIS E PERMISSÕES (ACCOUNT vs. PROFILE)

A arquitetura do **COM DEUS KIDS** estabelece uma separação rígida entre **quem paga/administra a conta** e **quem consome os conteúdos**.

---

## 1. A Diferença: ACCOUNT vs. PROFILE

```text
CONTA MASTER (ACCOUNT)
└── auth.users + public.profiles
    ├── Email: pai@familia.com.br
    ├── Assinatura Ativa: Plano Família Anual
    ├── Cartão de Crédito / Histórico de Pedidos
    │
    └── PERFIS INFANTIS (account_profiles)
        ├── Perfil 1: "Pedro" (4 anos)
        │     ├── Avatar: Leãozinho de Judá
        │     ├── Progresso: Historinhas da Criação (100%)
        │     └── Minha Lista: 4 vídeos favoritos
        │
        ├── Perfil 2: "Rebeca" (8 anos)
        │     ├── Avatar: Ester Princesa Bíblica
        │     ├── Progresso: Série Vida de Jesus (Episódio 4 em 45%)
        │     └── Quizzes Bíblicos: 15 medalhas conquistadas
        │
        └── Perfil 3: "Espaço dos Pais" (parent)
              └── Protegido por PIN de 4 dígitos (Controle Parental)
```

### A. A Conta (`public.profiles`)
* Criada no momento do cadastro ou compra.
* Representa o titular financeiro e legal.
* Campos: `id` (chave de `auth.users`), `email`, `role` (`'parent'`, `'church'`, `'school'`, `'admin'`), `organization_name`, `organization_doc` (CNPJ para igrejas/escolas).

### B. O Perfil de Experiência (`public.account_profiles`)
* Criado dentro da aplicação para cada membro da família ou aluno.
* Campos: `name`, `avatar_url`, `profile_type` (`'kid'`, `'parent'`, `'teacher'`, `'leader'`), `age`, `pin` de segurança.
* **Isolamento Absoluto**:
  - `profile_watch_progress` (tempo assistido de cada vídeo).
  - `profile_my_list` (conteúdos guardados para assistir depois).
  - Histórico de quizzes e pontuações.
* **Proibição Técnica**: Nunca salve `progress_seconds` ou `my_list` na tabela `profiles` ou no registro do usuário. O progresso pertence obrigatoriamente a um `profile_id`.

---

## 2. Membros da Organização para Igrejas e Escolas (`account_members`)

Para planos institucionais, a conta master da Igreja ou Colégio pode convidar educadores sem compartilhar a senha mestre de pagamento:

```sql
CREATE TABLE public.account_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email           TEXT NOT NULL,
  full_name       TEXT NOT NULL,
  role            TEXT NOT NULL DEFAULT 'teacher' 
                    CHECK (role IN ('teacher', 'leader', 'admin', 'member')),
  status          TEXT NOT NULL DEFAULT 'active' 
                    CHECK (status IN ('active', 'invited', 'suspended')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### Regras de Acesso:
* **Professor / Líder (`teacher` / `leader`)**:
  - Tem acesso imediato para visualizar e baixar todos os PDFs pedagógicos e exibir vídeos para sua classe.
  - **Não tem acesso** a dados de faturamento, faturas, configurações do domínio ou cancelamento de plano.
* **Administrador Master (`organization_id`)**:
  - Dono legal da conta com plenos poderes para adicionar ou remover colaboradores.
