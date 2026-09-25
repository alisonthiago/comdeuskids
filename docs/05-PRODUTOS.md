# 05 — PRODUTOS DIGITAIS E ARQUIVOS

No **COM DEUS KIDS**, a modelagem de produtos atende às necessidades do mercado de infoprodutos educativos e cristãos.

---

## 1. Produto Comercial ≠ Arquivo Individual

Um erro comum em plataformas básicas é tratar o arquivo PDF como o produto em si. No Com Deus Kids:

* **O Produto Comercial (`products`)**: É o pacote ofertado na loja pública com preço, título, capa, descrição persuasiva, faixa etária e SEO.
* **Os Arquivos do Produto (`product_files`)**: São os ativos digitais entregues após a compra. Um único produto pode conter:
  1. O caderno de atividades principal em PDF de alta resolução (ex: 40 páginas para colorir).
  2. O guia do professor ou devocional dos pais (`is_teacher = true`).
  3. Gabarito dos labirintos ou caça-palavras.
  4. Faixa de áudio com a narração da historinha bíblica (quando disponível).

---

## 2. Estrutura do Registro de Produto (`products`)

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `UUID` | Identificador único primário. |
| `title` | `TEXT` | Título comercial (ex: *"Kit Heróis da Fé — 50 Atividades Bíblicas"*). |
| `slug` | `TEXT` | Identificador para URL amigável (`/produto/:slug`). |
| `description` | `TEXT` | Descrição rica detalhando o conteúdo e benefícios pedagógicos. |
| `short_description` | `TEXT` | Resumo de 2 linhas exibido nos cards da loja. |
| `cover_url` | `TEXT` | URL pública da imagem de capa (hospedada no bucket `product-covers`). |
| `category_id` | `UUID` | Chave estrangeira para a Categoria (formato principal). |
| `price` | `NUMERIC(10,2)` | Preço regular de venda (ex: `29.90`). |
| `is_free` | `BOOLEAN` | `true` se for material gratuito para captação de leads. |
| `age_range` | `TEXT` | Faixa etária recomendada (ex: `'4-6 anos'`, `'7-10 anos'`, `'Todas'`). |
| `status` | `TEXT` | `'draft'` (rascunho), `'active'` (publicado na loja) ou `'archived'`. |
| `featured` | `BOOLEAN` | Define se o produto ganha destaque nas vitrines da Home. |
| `published_at` | `TIMESTAMPTZ` | Timestamp exato de quando o item foi ao ar. |
| `meta_title` | `TEXT` | Título otimizado para o Google (SEO). |
| `meta_description` | `TEXT` | Descrição para snippets do Google e redes sociais. |
| `deleted_at` | `TIMESTAMPTZ` | Campo de *soft delete*. Nunca exclua fisicamente um produto que já tenha pedidos associados. |

---

## 3. Gestão de Arquivos Digitais (`product_files`)

Todos os arquivos entregues ao cliente ficam armazenados no bucket privado do Supabase Storage: **`product-files`**.

```sql
CREATE TABLE public.product_files (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,         -- Nome técnico (ex: 'kit-herois-colorir-v1.pdf')
  display_name TEXT NOT NULL,         -- Nome amigável (ex: 'Caderno de Atividades para Imprimir')
  storage_path TEXT NOT NULL,         -- Caminho seguro no bucket 'product-files'
  file_size    BIGINT,                -- Tamanho em bytes
  mime_type    TEXT NOT NULL DEFAULT 'application/pdf',
  sort_order   INT NOT NULL DEFAULT 0,
  is_teacher   BOOLEAN NOT NULL DEFAULT FALSE, -- Destaque para material de apoio
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Regra de Segurança do Storage:
* O bucket `product-files` é **estritamente privado** (`public = false`).
* Nenhum link direto do Supabase Storage para arquivos integrais deve ser exposto no HTML do site público.
* Para baixar ou visualizar o PDF na área de membros, a aplicação gera uma **URL assinada temporária (`createSignedUrl`)** com tempo de expiração curto (ex: 60 minutos), após validar que o usuário tem um `entitlement` ativo.

---

## 4. Relação com Assinaturas e Planos

Um produto pode ser acessado pelo cliente por duas vias:
1. **Compra Avulsa**: O cliente compra especificamente aquele produto no site via checkout individual e recebe acesso permanente àqueles arquivos.
2. **Assinatura Ativa (Membro do Clube CDK)**: Usuários que assinam um plano com `includes_all = true` (ex: Plano Família Anual ou Plano Igreja) têm acesso instantâneo a todos os produtos digitais da plataforma sem custo adicional, enquanto a assinatura estiver vigente.
