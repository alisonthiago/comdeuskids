# 14 — BANCO DE DADOS, SUPABASE E POLÍTICAS RLS

O backend do **COM DEUS KIDS** é hospedado no **Supabase (PostgreSQL 15+)**, utilizando extensões nativas (`pgcrypto`), Row Level Security (RLS) e Supabase Storage.

---

## 1. Dicionário de Tabelas Reais Existentes

### Grupo A: Catálogo Comercial & E-commerce (`20260922000001_schema_completo.sql`)

| Tabela | Finalidade | Leitura | Escrita | Relacionamentos Principais | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`profiles`** | Extensão dos usuários do `auth.users`. Guarda dados cadastrais e o perfil de acesso (`role`). | Admin e o próprio usuário. | Usuário edita dados básicos; Admin edita `role`. | `id -> auth.users.id` | **IMPLEMENTADO** |
| **`categories`** | Formatos das atividades do site (Colorir, Labirintos, etc.). | Pública (`active = true`) ou Admin. | Estritamente Admin. | 1:N com `products`. | **IMPLEMENTADO** |
| **`themes`** | Temas bíblicos (Jesus, Páscoa, Oração, Família). | Pública (`active = true`) ou Admin. | Estritamente Admin. | N:N com `products`. | **IMPLEMENTADO** |
| **`products`** | Produtos digitais e kits educativos vendidos no site. | Pública (`status = 'active'`) ou Admin. | Estritamente Admin. | FK `category_id -> categories.id`. | **IMPLEMENTADO** |
| **`product_themes`** | Tabela associativa entre Produtos e Temas. | Pública. | Estritamente Admin. | `(product_id, theme_id)`. | **IMPLEMENTADO** |
| **`product_files`** | Arquivos digitais para download do produto. | Usuário com `entitlement` ativo ou material gratuito. | Estritamente Admin. | FK `product_id -> products.id`. | **IMPLEMENTADO** |
| **`plans`** | Configuração dos planos de assinatura. | Pública (`status = 'active'`). | Estritamente Admin. | 1:N com `orders` e `entitlements`. | **IMPLEMENTADO** |
| **`orders`** | Pedidos de compra realizados no site. | O próprio comprador e Admin. | Backend / Edge Functions. | FK `user_id -> auth.users.id`. | **IMPLEMENTADO** |
| **`order_items`** | Linhas de itens de cada pedido (snapshot). | O próprio comprador e Admin. | Backend / Edge Functions. | `order_id`, `product_id`, `plan_id`. | **IMPLEMENTADO** |
| **`payments`** | Registro e idempotência de transações do gateway. | O próprio comprador e Admin. | Webhook do gateway / Backend. | FK `order_id -> orders.id`. | **IMPLEMENTADO** |
| **`entitlements`** | Acessos e licenças concedidos aos clientes. | O próprio usuário e Admin. | Webhook / Funções de sistema. | `user_id`, `product_id`, `plan_id`. | **IMPLEMENTADO** |
| **`download_logs`** | Auditoria de downloads de arquivos protegidos. | Próprio usuário e Admin. | Backend na geração de link assinado. | `user_id`, `product_file_id`. | **IMPLEMENTADO** |

---

### Grupo B: Perfis & Streaming (`20260922000002_streaming_profiles.sql` & `000003`)

| Tabela | Finalidade | Leitura / Escrita | Relacionamentos | Status |
| :--- | :--- | :--- | :--- | :--- |
| **`account_profiles`** | Perfis infantis e dos pais criados na conta. | Titular da conta (`auth.uid() = user_id`). | FK `user_id -> auth.users.id`. | **IMPLEMENTADO** |
| **`profile_watch_progress`**| Progresso de vídeo (segundos assistidos) por perfil. | Titular da conta. | FK `profile_id -> account_profiles.id`. | **IMPLEMENTADO** |
| **`profile_my_list`** | Conteúdos salvos como favoritos pelo perfil. | Titular da conta. | FK `profile_id -> account_profiles.id`. | **IMPLEMENTADO** |
| **`stream_contents`** | Acervo de vídeos, filmes, séries, louvores e lições. | Leitura pública se `published`; Escrita Admin. | FK `category_id -> categories.id`. | **IMPLEMENTADO** |
| **`stream_series_seasons`**| Temporadas de séries de animação bíblica. | Leitura pública; Escrita Admin. | FK `series_id -> stream_contents.id`. | **IMPLEMENTADO** |
| **`stream_episodes`** | Episódios individuais de séries. | Leitura pública; Escrita Admin. | `series_id`, `season_id`. | **IMPLEMENTADO** |
| **`stream_quizzes`** | Quizzes interativos associados a conteúdos. | Leitura pública; Escrita Admin. | FK `content_id -> stream_contents.id`. | **IMPLEMENTADO** |
| **`stream_quiz_questions`**| Questões de múltipla escolha com gabarito. | Leitura pública; Escrita Admin. | FK `quiz_id -> stream_quizzes.id`. | **IMPLEMENTADO** |
| **`app_home_config`** | Configuração do destaque Hero da Home do APP. | Leitura pública; Escrita Admin. | FK `hero_content_id -> stream_contents.id`. | **IMPLEMENTADO** |
| **`app_home_carousels`** | Carrosséis dinâmicos da Home do APP. | Leitura pública; Escrita Admin. | Campo `content_ids UUID[]`. | **IMPLEMENTADO** |
| **`account_members`** | Professores e líderes vinculados a Igrejas/Escolas. | Titular da conta e Admin. | FK `organization_id -> auth.users.id`. | **IMPLEMENTADO** |
| **`admin_activity_logs`** | Registro de auditoria de alterações do CMS. | Estritamente Admin. | Registra email, ação, entidade e data. | **IMPLEMENTADO** |

---

### Grupo C: CMS Expandido do SITE (Em Planejamento de Persistência Direta)

| Tabela | Finalidade | Leitura | Escrita | Status |
| :--- | :--- | :--- | :--- | :--- |
| **`site_menus`** | Configuração dinâmica dos menus Header e Footer. | Pública. | Admin. | **PLANEJADO** *(utiliza mock/context enquanto não migrado)* |
| **`site_banners`** | Banners promocionais com data de vigência do site. | Pública. | Admin. | **PLANEJADO** |
| **`site_pages`** | Páginas institucionais administráveis (Termos, Políticas). | Pública. | Admin. | **PLANEJADO** |

---

## 2. Storage Buckets do Supabase

1. **`product-covers`** (`public = true`):
   - Capas de produtos comerciais.
   - Miniaturas de categorias e ícones bíblicos.
   - Banners e posters widescreen (16:9) do streaming.
   - Avatares dos perfis infantis.

2. **`product-files`** (`public = false`):
   - Arquivos PDF completos em 300 DPI prontos para impressão.
   - Arquivos ZIP com kits multimídia.
   - Acesso estritamente concedido através de `createSignedUrl()`.

---

## 3. Funções Auxiliares Críticas de Segurança

* **`public.is_admin()`**:
  Retorna `true` se o usuário logado tiver a role `'admin'` na tabela `profiles`. Utilizada em todas as políticas RLS para conceder acesso irrestrito de gestão.
* **`public.has_entitlement(p_product_id UUID)`**:
  Retorna `true` se o usuário tiver compra ativa do produto ou plano com `includes_all = true`. Garante que nenhum usuário consiga baixar PDFs sem ter pago.
