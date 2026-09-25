# 15 — MAPEAMENTO COMPLETO DE ROTAS DO ECOSSISTEMA

Todas as rotas ativas nas três aplicações do projeto estão mapeadas abaixo, incluindo o componente associado, nível de proteção e finalidade.

---

## 1. Aplicação SITE (`apps/site`) — Porta 3000

| Rota | Componente / Arquivo | Autenticação | Finalidade |
| :--- | :--- | :--- | :--- |
| `/` | `Home.tsx` / `landing-reference.html` | Pública | Página inicial oficial de apresentação, hero, categorias em destaque e planos. |
| `/categorias` | `Categorias.tsx` | Pública | Grade com todos os formatos de materiais (colorir, labirintos, quiz, etc.). |
| `/categoria/:slug` | `Categorias.tsx` | Pública | Vitrine dinâmica alimentada pelo CMS com os produtos da categoria. |
| `/temas` | `Temas.tsx` | Pública | Listagem de todos os assuntos bíblicos (Jesus, Oração, Páscoa, Criação). |
| `/tema/:slug` | `Temas.tsx` | Pública | Vitrine dinâmica dos produtos associados ao tema bíblico. |
| `/colecoes` | `Colecoes.tsx` | Pública | Agrupamentos editoriais de materiais (Heróis da Fé, etc.). |
| `/jesus` | `Jesus.tsx` | Pública | Curadoria especial dedicada à pessoa e ensinamentos de Jesus. |
| `/planos` | `Planos.tsx` | Pública | Comparativo de planos (Família, Igreja, Escola) com preços dinâmicos do CMS. |
| `/produto/:slug` | `ProdutoDetalhe.tsx` | Pública | Página de vendas do produto com preview, benefícios e botão de compra. |
| `/carrinho` | `Carrinho.tsx` | Pública | Resumo dos produtos adicionados para compra. |
| `/checkout` | `Checkout.tsx` | Pública | Formulário de pagamento (PIX / Cartão) e identificação do cliente. |

---

## 2. Aplicação ADM (`apps/adm`) — Porta 3001

| Rota | Componente / Arquivo | Autenticação | Finalidade |
| :--- | :--- | :--- | :--- |
| `/login` | `Login.tsx` | Pública | Acesso com credenciais de administrador. |
| `/admin` | `Dashboard.tsx` | Protegida (Admin) | Painel operacional com métricas de conteúdos, assinaturas e atalhos rápidos. |
| `/admin/conteudos` | `CentralConteudos.tsx` | Protegida (Admin) | Listagem geral do acervo de streaming e mídias. |
| `/admin/conteudos/filmes` | `CentralConteudos.tsx` | Protegida (Admin) | Filtro específico de filmes e animações completas. |
| `/admin/conteudos/series` | `CentralConteudos.tsx` | Protegida (Admin) | Gestão de produções seriadas e episódios. |
| `/admin/conteudos/historias` | `CentralConteudos.tsx` | Protegida (Admin) | Gestão de historinhas bíblicas narradas e animadas. |
| `/admin/conteudos/clipes` | `CentralConteudos.tsx` | Protegida (Admin) | Gestão de clipes musicais e reels curtos. |
| `/admin/conteudos/musicas` | `CentralConteudos.tsx` | Protegida (Admin) | Gestão de faixas de louvor, álbuns e letras de música. |
| `/admin/conteudos/licoes` | `CentralConteudos.tsx` | Protegida (Admin) | Gestão de lições pedagógicas e devocionais bíblicos. |
| `/admin/conteudos/novo` | `NovoConteudo.tsx` | Protegida (Admin) | Formulário completo de cadastro e upload de metadados. |
| `/admin/conteudos/:id` | `NovoConteudo.tsx` | Protegida (Admin) | Edição de conteúdo existente no CMS. |
| `/admin/quizzes` | `QuizzesManager.tsx` | Protegida (Admin) | Gestão e criação de quizzes bíblicos interativos. |
| `/admin/produtos` | `Produtos.tsx` | Protegida (Admin) | Cadastro e gestão de materiais pedagógicos em PDF. |
| `/admin/app/home` | `HomeManager.tsx` | Protegida (Admin) | Configuração do Hero e dos Carrosséis dinâmicos do APP. |
| `/admin/biblioteca` | `Biblioteca.tsx` | Protegida (Admin) | Organização de coleções e catálogo geral. |
| `/admin/planos` | `PlanosManager.tsx` | Protegida (Admin) | Configuração de planos de assinatura, preços e limites. |
| `/admin/pedidos` | `Pedidos.tsx` | Protegida (Admin) | Monitoramento de transações, pedidos e liberações de acesso. |
| `/admin/contas` | `ContasManager.tsx` | Protegida (Admin) | Gestão de contas master (Famílias, Igrejas, Escolas). |
| `/admin/clientes` | `Clientes.tsx` | Protegida (Admin) | Gestão de membros individuais e histórico de compras. |
| `/admin/financeiro` | `Financeiro.tsx` | Protegida (Admin) | Relatórios consolidados de faturamento e ticket médio. |
| `/admin/estatisticas` | `Estatisticas.tsx` | Protegida (Admin) | Métricas de audiência de vídeos e downloads de PDFs. |
| `/admin/logs` | `LogsManager.tsx` | Protegida (Admin) | Auditoria de segurança de ações de administradores. |
| `/admin/configuracoes` | `Configuracoes.tsx` | Protegida (Admin) | Configurações gerais 1:1 com referência corporativa. |

---

## 3. Aplicação APP (`apps/app`) — Porta 3002

### Entrada & Gestão de Perfis
* `/login` (`Login.tsx`): Login com email e senha ou link de acesso.
* `/selecionar-perfil` ou `/quem-vai-acessar` (`SelectProfile.tsx`): Seleção do perfil da criança antes de entrar no streaming.
* `/perfis` ou `/gerenciar-perfis` (`GerenciarPerfis.tsx`): Criação, edição e exclusão de perfis infantis e PIN parental.

### Player Fullscreen
* `/assistir/:id` (`WatchPlayer.tsx`): Player de vídeo cinematográfico em tela cheia com proteção parental.

### Shell Principal de Streaming (`StreamLayout.tsx`)
* `/inicio` (`StreamHome.tsx`): Home do aplicativo com hero, carrosséis e "Continuar Assistindo".
* `/series` (`SeriesHub.tsx`): Central de séries de animação bíblica.
* `/serie/:slug` (`SeriesDetail.tsx`): Página da série com seletor de temporadas e lista de episódios.
* `/filmes` (`Movies.tsx`): Catálogo de longas-metragens cristãos infantis.
* `/videos` ou `/explorar` ou `/busca` (`Videos.tsx`): Mecanismo de busca e catálogo geral de vídeos.
* `/conteudo/:slug` (`ContentDetail.tsx`): Detalhe de vídeo individual com sinopse e materiais relacionados.
* `/clipes` (`Clips.tsx`): Trilhos verticais de louvores curtos e versículos cantados.
* `/musicas` (`MusicasLouvores.tsx`): Central de áudio, álbuns e playlists devocionais.
* `/player-musical` (`PlayerMusical.tsx`): Player de música expandido com letra e karaokê.
* `/aprender` (`Aprender.tsx`): Jogos pedagógicos e desafios bíblicos.
* `/aprender/:slug` ou `/quiz/:id` (`QuizDetail.tsx`): Execução interativa de quiz com pontuação por perfil.
* `/minha-lista` (`MinhaLista.tsx`): Favoritos salvos pelo perfil ativo.
* `/downloads` (`Downloads.tsx`): Central de download de PDFs para impressão.
* `/materiais/:id` (`MaterialDetail.tsx`): Visualizador de PDF e opções de download protegido.
* `/biblioteca` (`Biblioteca.tsx`): Acervo geral de compras e coleções do usuário.
* `/minha-escola` (`MinhaEscola.tsx`): Painel institucional para colégios cristãos.
* `/minha-igreja` (`MinhaIgreja.tsx`): Painel institucional para ministério infantil de igrejas.
* `/turmas/:id` (`TurmaDetail.tsx`): Gestão de alunos e aulas da classe bíblica.
* `/membros` / `/membros/novo` (`Membros.tsx`, `MembroNovo.tsx`): Gestão de professores da organização.
* `/meu-com-deus-kids` (`MeuComDeusKids.tsx`): Área de conquistas, medalhas e histórico da criança.
* `/minha-familia` (`MinhaFamilia.tsx`): Configuração familiar e perfis dependentes.
* `/conta` (`ContaSeguranca.tsx`): Dados da conta mestre, troca de senha e autenticação.
* `/dispositivos` (`Dispositivos.tsx`): Lista de navegadores e Smart TVs conectadas.
* `/assinatura` (`Assinatura.tsx`): Consulta e gestão da assinatura ativa.

### Modo 10-Foot UI para Smart TV (`apps/app`)
* `/tv/login` (`TVLogin.tsx`): Tela de login simplificada para televisores.
* `/tv/conectar` ou `/tv-auth` (`TVAuthApprove.tsx`): Pareamento via código de 6 dígitos.
* `/tv/perfis` (`TVSelectProfile.tsx`): Seleção de perfil adaptada para setas do controle.
* `/tv` ou `/tv/inicio` (`TVHome.tsx`): Interface principal de TV com foco em alto contraste.
* `/tv/buscar` (`TVSearch.tsx`): Teclado virtual na tela para busca com controle remoto.
* `/tv/conteudo/:slug` (`TVContentDetail.tsx`): Detalhe de vídeo para TV.
* `/tv/serie/:slug` (`TVSeriesDetail.tsx`): Navegação por episódios na tela grande.
* `/tv/assistir/:id` (`TVWatchPlayer.tsx`): Player otimizado para TV com suporte a pausa no botão central.
* `/tv/minha-lista` (`TVMinhaLista.tsx`): Minha Lista na Smart TV.
