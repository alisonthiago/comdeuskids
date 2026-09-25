# 02 — REGRAS DE DESIGN E DESIGN SYSTEMS

O ecossistema **COM DEUS KIDS** opera com **três identidades visuais deliberadamente distintas**. É estritamente proibido misturar os estilos ou aplicar o padrão de uma aplicação em outra.

---

## 1. O SITE Público (`apps/site`)

* **Referência Oficial**: [https://comdeuskids.com.br/](https://comdeuskids.com.br/)
* **Público-alvo**: Mães, pais, avós, professores e líderes ministeriais à procura de materiais bíblicos infantis de alta qualidade.
* **Tom Visual**: Solar, acolhedor, educativo, lúdico e confiável.
* **Características do Design System**:
  - **Fundo**: Branco (`#ffffff`) e tons de cinza muito suaves (`#f8fafc`).
  - **Cores Principais**: Roxo/Lilás institucional (`#7c3aed`, `#6d28d9`) com acentos em tons quentes ou dourados suaves para destacar selos de garantia e devocionais.
  - **Tipografia**: Moderna, geométrica, com alta legibilidade para títulos grandes e descrições claras de produtos.
  - **Cards de Produto**: Bordas sutis (`1px solid #e2e8f0`), cantos arredondados (`14px` a `16px`), sombras leves (`0 4px 12px rgba(0,0,0,0.04)`), capas bem iluminadas com proporção consistente e botão de chamada para ação evidente.
  - **NÃO FAZER NO SITE**: Nunca aplique o fundo escuro (Dark Mode) do aplicativo de streaming no site público. O site deve preservar exatamente a atmosfera da loja oficial.

---

## 2. O ADM Master & CMS (`apps/adm`)

* **Referência de Design**: **HUB TEKNIX** (Painel Corporativo Moderno).
* **Público-alvo**: Administradores e operadores do catálogo e da plataforma.
* **Tom Visual**: Limpo, organizado, produtivo, minimalista e denso em informações.
* **O que DEVE ser replicado do HUB TEKNIX**:
  - **Sidebar de Navegação**: Barra lateral colapsável com ícones de tamanho padronizado (16-18px), agrupamento por seções com títulos em caixa alta e fonte sutil, e efeito de hover discreto.
  - **Header Superior**: Barra limpa com indicador de sincronização manual, atalho para abrir o App de streaming, botão de notificações e card de perfil com menu flutuante.
  - **Cards & Formulários**: Contêineres brancos com bordas suaves (`#e5e7eb`), cantos arredondados (`12px` a `14px`), inputs com altura de 40-42px e foco em anel azul/índigo sutil, e áreas de botões de ação fixadas no canto inferior direito ("Cancelar" em contorno e "Salvar Alterações" preenchido).
  - **Tabelas de Dados**: Linhas limpas, tipografia em 13px, badges de status redondos (`Publicado`, `Rascunho`, `Inativo`), e menus de ações rápidas no final de cada linha.
* **O que NÃO DEVE ser copiado**:
  - **Nunca copie o escopo de negócio da Teknix**: Termos como ferragens, iluminação, ferramentas pesadas ou campos industriais eram apenas do template de origem. O ADM é 100% focado no conteúdo bíblico do Com Deus Kids.

---

## 3. O APP de Streaming e Área de Membros (`apps/app`)

* **Referência Oficial**: **Stitch CDK** (Streaming Cinematográfico Infantil).
* **Público-alvo**: Crianças de 2 a 12 anos e seus familiares em computadores, tablets, celulares e Smart TVs.
* **Tom Visual**: Imersivo, cinematográfico, escuro (Dark Experience), estimulante e acolhedor.
* **Características do Design System**:
  - **Fundo**: Quase preto profundo (`#0b0b0d`, `#121118`).
  - **Destaques & Acentos**: Lilás e Roxo elétrico (`#7c3aed`, `#a078ff`, `#c084fc`), conferindo a identidade "Com Deus Kids" à experiência de streaming.
  - **Carrosséis Horizontais**: Trilhos contínuos com navegação por scroll suave, miniaturas com efeito de elevação no hover e cartões especiais para séries, filmes, historinhas e materiais.
  - **Player de Streaming**: Controles simplificados, botão de próximo episódio, sem distrações externas, com suporte a legenda e versículo bíblico da aula.
  - **Player Musical**: Barra inferior dockada persistente com botão play/pause, progresso, controle de volume e botão de expandir para modal de karaokê/letra de louvor.
  - **Smart TV (10-Foot UI)**: Foco com contorno nítido (`outline: 3px solid #a078ff`), fontes aumentadas e suporte total a navegação pelas setas do controle remoto sem exigir ponteiro de mouse.

---

## 4. Tabela Comparativa dos Design Systems

| Parâmetro | SITE (`apps/site`) | ADM (`apps/adm`) | APP (`apps/app`) |
| :--- | :--- | :--- | :--- |
| **Tema** | Light / Comercial | Clean / Corporativo | Dark / Cinematográfico |
| **Fundo** | `#ffffff` / `#f8fafc` | `#f4f5f7` / `#ffffff` | `#0b0b0d` / `#121118` |
| **Cor Primária** | `#7c3aed` (Roxo Kids) | `#2563eb` / `#7c3aed` | `#a078ff` (Lilás Elétrico) |
| **Bordas** | `14px` a `18px` | `10px` a `14px` | `12px` a `20px` (Pills & Posters) |
| **Navegação** | Header + Mega Menu | Sidebar esquerda retrátil | Top Bar + Rail inferior / TV D-pad |
| **Meta Principal** | Vender & Informar | Operar & Publicar | Engajar & Consumir |
