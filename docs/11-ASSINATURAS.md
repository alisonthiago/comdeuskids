# 11 — ASSINATURAS, PLANOS E PÚBLICOS-ALVO

O **COM DEUS KIDS** atende a três perfis institucionais distintos com necessidades e permissões customizadas.

---

## 1. Os Três Públicos da Plataforma

### A. Famílias (`parent`)
* **Contexto**: Uso doméstico por pais e filhos.
* **Recursos Inclusos**:
  - Criação de até 4 perfis infantis personalizados (com avatares bíblicos).
  - Controle parental com PIN para restringir compras e configurações.
  - Streaming de filmes, desenhos e louvores em celulares, tablets e Smart TV.
  - Acesso aos cadernos de atividades para imprimir em casa.

### B. Igrejas & Ministério Infantil (`church`)
* **Contexto**: Departamentos infantis e Escolas Bíblicas Dominicais (EBD).
* **Recursos Especiais**:
  - Cadastro de múltiplos líderes e professores (`account_members`) com logins independentes vinculados à conta da igreja.
  - Divisão de turmas por faixa etária (ex: *Maternal*, *Primários*, *Juniores*).
  - Licença de impressão ilimitada para utilização em salas de aula dominicais.
  - Roteiros completos de aulas com versículos para memorização.

### C. Escolas Cristãs (`school`)
* **Contexto**: Colégios e instituições de ensino fundamental/infantil.
* **Recursos Especiais**:
  - Gestão de professores e salas de aula.
  - Acompanhamento do aprendizado através dos Quizzes Bíblicos.
  - Materiais estruturados alinhados com o calendário escolar cristão.

---

## 2. A Tabela de Planos (`plans`)

A estrutura do banco armazena as opções comerciais de forma flexível:

```sql
CREATE TABLE public.plans (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL UNIQUE,          -- ex: 'Plano Família Anual'
  slug           TEXT NOT NULL UNIQUE,          -- ex: 'familia-anual'
  description    TEXT,
  target_role    TEXT CHECK (target_role IN ('parent', 'church', 'school', 'all')),
  price_monthly  NUMERIC(10,2),                -- Preço de referência mensal
  price_yearly   NUMERIC(10,2),                -- Preço com desconto anual
  max_users      INT,                          -- Limite de membros/professores
  max_downloads  INT,                          -- NULL = ilimitado
  includes_all   BOOLEAN NOT NULL DEFAULT FALSE,-- Libera todo o acervo do app
  benefits       JSONB,                        -- Lista de strings para os cards
  status         TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  sort_order     INT NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 3. Regra de Precificação Dinâmica no SITE

Os preços exibidos na página `/planos` do site público são obrigatoriamente lidos do banco:

```text
❌ INCORRETO (Hardcoded no JSX):
<div className="price">R$ 197/ano</div>

✅ CORRETO (Alimentado pelo Supabase):
<div className="price">R$ {plan.price_yearly}/ano</div>
```

Se o administrador alterar o preço de um plano de `R$ 197` para `R$ 247` através do **ADM (`/admin/planos`)**, a alteração:
1. Atualiza imediatamente a vitrine de planos do site.
2. É enviada para a Edge Function de checkout sem risco de divergência de valores.
