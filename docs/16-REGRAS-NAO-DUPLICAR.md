# 16 — OS 10 MANDAMENTOS DE INTEGRIDADE TÉCNICA (NÃO DUPLICAR)

Qualquer desenvolvimento futuro no repositório **COM DEUS KIDS** deve obedecer estritamente aos 10 princípios abaixo.

---

### 1. Procurar Antes de Criar Tabela
Antes de cogitar qualquer migration SQL, inspecione as migrations existentes em `supabase/migrations/`. Se você precisa de "categorias", a tabela `public.categories` já existe com índices e RLS configurados. Nunca crie `site_categories`, `categories_v2` ou tabelas paralelas.

### 2. Procurar Antes de Criar Componente
Antes de construir um card de produto, botão, input ou modal, verifique se um componente idêntico ou adaptável já existe em `packages/ui` ou dentro de `components/` da respectiva aplicação.

### 3. Procurar Antes de Criar Rota ou Página
Consulte o arquivo [15-ROTAS.md](./15-ROTAS.md). Se a intenção é criar a vitrine de uma nova categoria (ex: "Labirintos"), utilize a rota dinâmica existente `/categoria/:slug`. Jamais crie manualmente arquivos individuais como `LabirintosPage.tsx` ou `ColorirPage.tsx`.

### 4. Reutilizar e Estender Services
Antes de criar um novo arquivo de integração com o Supabase, utilize os serviços existentes (`packages/supabase`, `cmsService.ts`, etc.). Adicione métodos às classes/módulos existentes em vez de dispersar chamadas soltas pela aplicação.

### 5. Proibição de Sufixos Arbitrários
É estritamente proibido commitar arquivos, funções ou tabelas com nomes como:
- `_v2`, `_new`, `_final`, `_refactored`, `_old`
- `NovoComponente2.tsx`, `LayoutOficialFinal.tsx`
Se uma refatoração for necessária, ela deve substituir o arquivo original com segurança após testes.

### 6. Refatorar com Retrocompatibilidade
Ao alterar uma função ou componente compartilhado, torne os novos parâmetros opcionais (`prop?: string`) para não quebrar outras partes do sistema que ainda utilizam a assinatura anterior.

### 7. Supabase é a Única Fonte da Verdade
Nenhum estado crítico de negócio (preços, status de publicação, direitos de download, permissões de usuários) deve ser mantido em memória, `localStorage` ou arquivos JSON estáticos. O banco de dados do Supabase é a fonte definitiva.

### 8. Fim do Conteúdo Hardcoded
Categorias, menus, títulos de banners, opções de planos e FAQs não podem ser mantidos como arrays fixos no frontend. O CMS no ADM é o responsável por fornecer esses dados em tempo de execução.

### 9. As Três Fronteiras São Sagradas
- **SITE** = Vender e Apresentar (Sem área de reprodução pesada ou administração).
- **ADM** = Administrar e Publicar (Sem catálogo de venda direta).
- **APP** = Consumir e Assistir (Área autenticada com isolamento de perfis infantis).

### 10. Respeito Inegociável aos 3 Design Systems
- **SITE**: Visual oficial [comdeuskids.com.br](https://comdeuskids.com.br/) (Light, acolhedor, familiar). **Não aplique o tema escuro do APP no SITE**.
- **ADM**: Visual corporativo HUB TEKNIX (Clean, cards brancos, inputs sutis). **Não copie o catálogo industrial da Teknix, apenas o padrão de UI**.
- **APP**: Visual cinematográfico Stitch (Dark `#0b0b0d`, lilás `#7c3aed`, navegação por controle remoto para Smart TV).
