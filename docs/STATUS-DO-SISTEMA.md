# STATUS DO SISTEMA — AUDITORIA TÉCNICA REAL

> **Critério de Auditoria**: Nenhuma funcionalidade é marcada como `IMPLEMENTADO` sem que haja código TypeScript, SQL ou componentes reais operacionais verificados no monorepo.
> 
> - **`IMPLEMENTADO`**: Funcionalidade existente, estruturada e operacional no código.
> - **`PARCIAL`**: Funcionalidade parcialmente construída, necessitando de ajustes de integração ou refinamento.
> - **`PLANEJADO`**: Especificado na arquitetura, mas com desenvolvimento ainda não iniciado.
> - **`NÃO ENCONTRADO`**: Sem registro no código nem nas migrações.

---

## Matriz Geral de Funcionalidades

| Módulo | Funcionalidade | Status Real | Implementado Em | Observação Técnica |
| :--- | :--- | :--- | :--- | :--- |
| **SITE** | Home Oficial (Storefront) | **IMPLEMENTADO** | `apps/site/public/landing-reference.html` & `apps/site/src/pages/Home.tsx` | Preserva fielmente a arte e identidade oficial de [comdeuskids.com.br](https://comdeuskids.com.br/). |
| **SITE** | Rota Dinâmica `/categoria/:slug` | **IMPLEMENTADO** | `apps/site/src/pages/Categorias.tsx` | Consulta a categoria pelo slug e lista todos os produtos associados em tempo real. |
| **SITE** | Rodapé Dinâmico com Categorias do CMS | **IMPLEMENTADO** | `apps/site/src/components/SiteFooter.tsx` | Alimenta a coluna de materiais dinamicamente com as categorias ativas do banco. |
| **SITE** | Temas Bíblicos (`/temas`, `/tema/:slug`) | **PARCIAL** | `apps/site/src/pages/Temas.tsx` | Consulta tabela `themes`; pronto para vincular produtos por tema. |
| **SITE** | Página "Especial Jesus" (`/jesus`) | **PARCIAL** | `apps/site/src/pages/Jesus.tsx` | Layout pronto com curadoria temática. |
| **SITE** | Vitrine de Planos (`/planos`) | **IMPLEMENTADO** | `apps/site/src/pages/Planos.tsx` | Vitrine de planos e benefícios conectada com o checkout. |
| **SITE** | Detalhe do Produto (`/produto/:slug`)| **IMPLEMENTADO** | `apps/site/src/pages/ProdutoDetalhe.tsx` | Carrega o produto do Supabase pelo slug e exibe capa, descrição e CTA de compra. |
| **SITE** | Carrinho & Checkout | **PARCIAL** | `apps/site/src/pages/Carrinho.tsx` & `Checkout.tsx` | Interface pronta; aguardando credenciais de gateway para webhook de produção. |
| **ADM** | Dashboard Geral | **IMPLEMENTADO** | `apps/adm/src/pages/Dashboard.tsx` | Painel master com métricas e atalhos operacionais (design Hub Teknix). |
| **ADM** | Seção "Site >" na Sidebar | **IMPLEMENTADO** | `apps/adm/src/components/Layout.tsx` | Seção independente de Conteúdos, com 8 submódulos dedicados ao CMS do site público. |
| **ADM** | Gestão de Categorias (`/admin/site/categorias`) | **IMPLEMENTADO** | `apps/adm/src/pages/site/SiteCategorias.tsx` | Tabela com contagem real de produtos, geração automática de slug, ordem, status e modal de edição. |
| **ADM** | Gestão de Temas (`/admin/site/temas`) | **IMPLEMENTADO** | `apps/adm/src/pages/site/SiteTemas.tsx` | Cadastro de temas bíblicos (Jesus, Páscoa, Oração, etc.). |
| **ADM** | Gestão de Coleções (`/admin/site/colecoes`) | **IMPLEMENTADO** | `apps/adm/src/pages/site/SiteColecoes.tsx` | Gestão de séries editoriais (Histórias de Jesus, Heróis da Fé...). |
| **ADM** | Visão Geral do Site (`/admin/site`) | **IMPLEMENTADO** | `apps/adm/src/pages/site/SiteOverview.tsx` | Dashboard com atalhos e contadores do CMS público. |
| **ADM** | Menus do Site (`/admin/site/menus`) | **IMPLEMENTADO** | `apps/adm/src/pages/site/SiteMenus.tsx` | Gestão visual de itens do Header e Footer. |
| **ADM** | Banners do Site (`/admin/site/banners`) | **IMPLEMENTADO** | `apps/adm/src/pages/site/SiteBanners.tsx` | Controle de banners promocionais com datas de vigência. |
| **ADM** | Páginas Institucionais (`/admin/site/paginas`) | **IMPLEMENTADO** | `apps/adm/src/pages/site/SitePaginas.tsx` | Gestão de Home, Especial Jesus, Planos, Termos e Políticas. |
| **ADM** | SEO Global do Site (`/admin/site/seo`) | **IMPLEMENTADO** | `apps/adm/src/pages/site/SiteSeo.tsx` | Controle de Meta Title, Meta Description, URL Canônica e Open Graph. |
| **ADM** | Central de Conteúdos de Streaming | **IMPLEMENTADO** | `apps/adm/src/pages/CentralConteudos.tsx` & `NovoConteudo.tsx` | Cadastro de filmes, séries, episódios, historinhas, louvores e lições. |
| **ADM** | Editor de Quizzes Bíblicos | **IMPLEMENTADO** | `apps/adm/src/pages/QuizzesManager.tsx` | Gestão de perguntas, gabarito e associação com conteúdos em vídeo. |
| **ADM** | Gestão de Materiais / PDFs | **IMPLEMENTADO** | `apps/adm/src/pages/Produtos.tsx` | Cadastro de materiais digitais e kits pedagógicos. |
| **ADM** | Home & Carrosséis do APP | **IMPLEMENTADO** | `apps/adm/src/pages/HomeManager.tsx` | Configuração do Hero e montagem de carrosséis dinâmicos por categoria/tipo. |
| **ADM** | Planos & Assinaturas | **IMPLEMENTADO** | `apps/adm/src/pages/PlanosManager.tsx` | Cadastro de planos, regras de acesso e preços. |
| **ADM** | Gestão de Pedidos & Faturamento | **IMPLEMENTADO** | `apps/adm/src/pages/Pedidos.tsx` & `Financeiro.tsx` | Acompanhamento de transações e concessão de acessos. |
| **ADM** | Gestão de Contas (Igrejas/Escolas)| **IMPLEMENTADO** | `apps/adm/src/pages/ContasManager.tsx` & `Clientes.tsx` | Gestão de clientes individuais e contas institucionais. |
| **ADM** | Configurações Gerais | **IMPLEMENTADO** | `apps/adm/src/pages/Configuracoes.tsx` | Tela 1:1 com referência corporativa, abas de contato, fiscal, canais e equipe. |
| **APP** | Streaming de Vídeo & Player | **IMPLEMENTADO** | `apps/app/src/pages/StreamHome.tsx` & `WatchPlayer.tsx` | Catálogo cinematográfico e player em tela cheia com proteção infantil. |
| **APP** | Múltiplos Perfis Infantis | **IMPLEMENTADO** | `apps/app/src/pages/SelectProfile.tsx` & `GerenciarPerfis.tsx` | Avatares bíblicos, controle de PIN para pais e isolamento total de dados. |
| **APP** | Progresso de Vídeo & Minha Lista | **IMPLEMENTADO** | `apps/app/src/pages/MinhaLista.tsx` & `SeriesDetail.tsx` | Sincronizado por perfil nas tabelas `profile_watch_progress` e `profile_my_list`. |
| **APP** | Hub de Músicas & Louvores | **IMPLEMENTADO** | `apps/app/src/pages/MusicasLouvores.tsx` | Listagem de álbuns e playlists devocionais infantis. |
| **APP** | Player Musical Persistente | **PARCIAL** | `apps/app/src/pages/PlayerMusical.tsx` | Player funcional; pendente desacoplar da rota para tocar continuamente pelo app. |
| **APP** | Biblioteca & Leitor de PDF | **IMPLEMENTADO** | `apps/app/src/pages/Biblioteca.tsx` & `MaterialDetail.tsx` | Visualização de atividades na tela e botão de download autorizado. |
| **APP** | Smart TV (10-Foot UI) | **IMPLEMENTADO** | `apps/app/src/pages/tv/*` & `hooks/useTVNavigation.ts` | Rotas `/tv/*`, navegação por setas do controle remoto e pareamento por código. |
| **GAMES** | Plataforma de Jogos Isolada (`apps/games`) | **IMPLEMENTADO** | `apps/games` & `packages/game-core` | Novo app no monorepo com carregamento lazy sob demanda, GameShell, InputManager (Mobile/TV/Desktop/Gamepad) e jogo piloto Davi. |
| **APP** | Hub de Jogos & Detalhes (`/jogos`) | **IMPLEMENTADO** | `apps/app/src/pages/GamesHub.tsx` & `GamePlayer.tsx` | Catálogo e showcase mantendo o bundle leve; lança o jogo com profile_id sincronizado. |
| **BACKEND** | Schema de Jogos & Progresso | **IMPLEMENTADO** | `supabase/migrations/20260922000006_interactive_games.sql` | Tabelas `games` e `profile_game_progress` com RLS ativo. |
