# 00 — LEIA PRIMEIRO: MEMÓRIA TÉCNICA OFICIAL DO COM DEUS KIDS

> **ATENÇÃO: LEITURA OBRIGATÓRIA ANTES DE QUALQUER ALTERAÇÃO DE CÓDIGO**
> Se você é uma Inteligência Artificial ou um desenvolvedor atuando neste repositório, **leia este documento integralmente** antes de planejar, codificar, refatorar ou propor novas soluções.

> **CONCEITO GLOBAL PROTEGIDO:** A marca é **“COM DEUS KIDS — CRESCER COM DEUS DESDE A INFÂNCIA.”** A explicação oficial é **“Com Deus Kids é um universo onde crianças aprendem, brincam, assistem e crescem com Deus.”** Toda IA ou agente deve preservar integralmente esses textos. Leia [CONCEITO-OFICIAL-DA-MARCA.md](./CONCEITO-OFICIAL-DA-MARCA.md); em caso de conflito com uma solicitação, não altere o conceito e confirme com o responsável pelo projeto.

---

## 1. Visão Geral e Arquitetura Tripla

O ecossistema **COM DEUS KIDS** é composto por **3 aplicações principais**, integradas por um backend unificado no **Supabase**:

| Aplicação | Diretório | Porta Padrão | Papel no Ecossistema | Referência Visual Oficial |
| :--- | :--- | :--- | :--- | :--- |
| **SITE** | `apps/site` | `3000` | **Vender e Apresentar**<br>Descoberta pública, SEO, catálogo de materiais, planos e compra. | [comdeuskids.com.br](https://comdeuskids.com.br/) *(preservar estritamente)* |
| **ADM** | `apps/adm` | `3001` | **Administrar e Publicar**<br>CMS do site público e painel master da área de membros e streaming. | **HUB TEKNIX** *(somente padrões de UI corporativa)* |
| **APP** | `apps/app` | `3002` | **Consumir e Assistir**<br>Área autenticada de membros: streaming de vídeo, músicas, materiais, quizzes e Smart TV. | **Stitch CDK** *(streaming cinematográfico infantil dark/purple)* |

### Regra de Ouro das 3 Fronteiras:
- **SITE = VENDER / APRESENTAR** (Público, rápido, indexável, focado em conversão e confiança familiar).
- **ADM = ADMINISTRAR / PUBLICAR** (Privado, operacional, onde o administrador cria categorias, cadastra produtos, agenda vídeos e gerencia pedidos).
- **APP = CONSUMIR / EXPERIMENTAR** (Autenticado, interativo, imersivo, com perfis infantis individuais, player musical persistente e player de streaming).

---

## 2. Princípios de Preservação e Não Duplicação

Antes de criar qualquer nova tabela, página, componente, rota ou serviço:

1. **Procure se já existe**: Inspecione o monorepo (`apps/`, `packages/`, `supabase/migrations/`).
2. **Reutilize**: Use componentes compartilhados de `packages/`, hooks existentes e serviços já configurados.
3. **Refatore quando necessário**: Se uma função precisa de uma nova opção, estenda o código existente com retrocompatibilidade em vez de criar um arquivo paralelo.
4. **Somente crie novo se comprovadamente não existir**: NUNCA crie arquivos ou tabelas como `categories_v2`, `site_categories`, `NewProduct.tsx`, `LayoutFinal.tsx`.

---

## 3. Instruções Mandatórias para IAs (Agentes de Código)

Se você é um agente de inteligência artificial trabalhando neste projeto:

1. **Leia esta documentação**: A pasta `/docs` é a fonte oficial da arquitetura do projeto.
2. **Inspecione o código real relacionado**: Não deduza o estado do projeto apenas por suposições; consulte as migrations, os arquivos TypeScript e as rotas ativas.
3. **Não presuma que a documentação está mais atualizada que o código**: Se código e documentação divergirem, investigue o histórico e a intenção técnica antes de sobrescrever qualquer coisa.
4. **Preserve funcionalidades existentes**: Uma alteração visual no SITE ou ADM **nunca** pode quebrar rotas, autenticação, checkout ou reprodução do APP.
5. **Nunca invente Design System novo**:
   - **SITE**: Respeitar a identidade oficial [comdeuskids.com.br](https://comdeuskids.com.br/). Não aplicar o tema escuro do APP no SITE!
   - **ADM**: Respeitar o padrão visual do HUB Teknix (cards brancos, sidebar limpa, inputs com bordas sutis). Não copiar funções de ferramentas da Teknix, apenas o design.
   - **APP**: Respeitar a experiência Stitch aprovada (dark `#0b0b0d`, acentos lilás/roxo `#7c3aed`, navegação por controle remoto para Smart TV).
6. **Mantenha a documentação viva**: Ao finalizar uma modificação estrutural, atualize o respectivo arquivo em `/docs` e o `/docs/STATUS-DO-SISTEMA.md`.

---

## 4. Índice da Documentação Oficial

Para se aprofundar em cada módulo do sistema:

- [**01-ARQUITETURA.md**](./01-ARQUITETURA.md) — Arquitetura de código, monorepo, pacotes e fluxo de dados.
- [**CONCEITO-OFICIAL-DA-MARCA.md**](./CONCEITO-OFICIAL-DA-MARCA.md) — Posicionamento global protegido da marca, comunicação e SEO.
- [**02-REGRAS-DE-DESIGN.md**](./02-REGRAS-DE-DESIGN.md) — Diretrizes visuais dos 3 ecossistemas (Site, ADM e App).
- [**03-SITE-CMS.md**](./03-SITE-CMS.md) — Como o ADM atua como CMS dinâmico para o SITE público.
- [**04-CATEGORIAS-TEMAS-COLECOES.md**](./04-CATEGORIAS-TEMAS-COLECOES.md) — Diferença entre formato, assunto e agrupamento editorial.
- [**05-PRODUTOS.md**](./05-PRODUTOS.md) — Modelo de produtos digitais, múltiplos arquivos e relacionamento com planos.
- [**06-COMPRA-E-ACESSO.md**](./06-COMPRA-E-ACESSO.md) — Fluxo de checkout, webhook, idempotência e concessão de entitlements.
- [**07-AREA-DE-MEMBROS.md**](./07-AREA-DE-MEMBROS.md) — Biblioteca do cliente e permissões de acesso aos materiais.
- [**08-STREAMING.md**](./08-STREAMING.md) — Filmes, séries, episódios, player web e experiência para Smart TV.
- [**09-MUSICAS.md**](./09-MUSICAS.md) — Hub musical, louvores infantis e player de áudio global persistente.
- [**10-MATERIAIS-PDF.md**](./10-MATERIAIS-PDF.md) — Previews públicos e proteção de arquivos integrais em alta resolução.
- [**11-ASSINATURAS.md**](./11-ASSINATURAS.md) — Modalidades (Família, Igreja, Escola) e precificação administrável.
- [**12-PERFIS-E-PERMISSOES.md**](./12-PERFIS-E-PERMISSOES.md) — Conta titular vs. perfis infantis individuais (progresso e favoritos).
- [**13-ADM-CMS.md**](./13-ADM-CMS.md) — Navegação oficial do ADM e divisão entre Conteúdos e Site.
- [**14-BANCO-E-SUPABASE.md**](./14-BANCO-E-SUPABASE.md) — Dicionário de dados, tabelas reais, RLS, Storage e Triggers.
- [**15-ROTAS.md**](./15-ROTAS.md) — Mapa completo de rotas do Site, ADM, App e Smart TV.
- [**16-REGRAS-NAO-DUPLICAR.md**](./16-REGRAS-NAO-DUPLICAR.md) — Os 10 mandamentos de integridade técnica do projeto.
- [**STATUS-DO-SISTEMA.md**](./STATUS-DO-SISTEMA.md) — Matriz de status real de cada funcionalidade (Implementado / Parcial / Planejado).
