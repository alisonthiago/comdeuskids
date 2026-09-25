# COM DEUS KIDS — Monorepo Oficial

> **IMPORTANTE — ANTES DE TRABALHAR NESTE PROJETO, LEIA:**
> 📄 [**AGENTS.md**](./AGENTS.md) — Regra global protegida da marca, válida para todas as IAs e agentes.
> 📄 [**docs/CONCEITO-OFICIAL-DA-MARCA.md**](./docs/CONCEITO-OFICIAL-DA-MARCA.md) — Ordem global: negócio, ofertas, públicos, áreas, afiliados, posicionamento, comunicação e SEO oficiais.
> 📄 [**docs/00-LEIA-PRIMEIRO.md**](./docs/00-LEIA-PRIMEIRO.md)
> 
> A documentação técnica oficial e viva do projeto reside na pasta [`/docs`](./docs/).

---

## 1. As Três Aplicações do Ecossistema

1. **SITE (`apps/site` — Porta 3000)**:
   - **Papel**: Vender e Apresentar.
   - Vitrine de materiais pedagógicos em PDF, histórias bíblicas e planos de assinatura.
   - Referência de Design: [comdeuskids.com.br](https://comdeuskids.com.br/) *(preservar estritamente)*.

2. **ADM (`apps/adm` — Porta 3001)**:
   - **Papel**: Administrar e Publicar (CMS do Site e Painel Master).
   - Central de gerenciamento de conteúdos, produtos, pedidos, clientes e configurações gerais.
   - Referência de Design: **HUB TEKNIX** *(estilo corporativo limpo)*.

3. **APP (`apps/app` — Porta 3002)**:
   - **Papel**: Consumir e Assistir (Área de Membros & Streaming).
   - Experiência pós-venda para famílias, escolas e igrejas. Múltiplos perfis infantis, streaming de vídeo, player musical, leitor de PDF e modo Smart TV (10-Foot UI).
   - Referência de Design: **Stitch CDK** *(streaming cinematográfico infantil dark/purple)*.

---

## 2. Início Rápido (Desenvolvimento)

### Pré-requisitos
- Node.js 18+
- npm 9+

### Instalação de Dependências
```bash
npm install
```

### Rodar Todas as Aplicações Simultaneamente
```bash
npm run dev
```
Isso iniciará:
- **ADM**: `http://localhost:3001`
- **SITE**: `http://localhost:3000`
- **APP**: `http://localhost:3002`

### Comandos Individuais
```bash
# Rodar apenas o ADM
npm run dev:adm

# Rodar apenas o SITE
npm run dev:site

# Rodar apenas o APP de Streaming
npm run dev:app

# Build de produção de todos os pacotes
npm run build
```

---

## 3. Documentação Técnica Oficial

Consulte os guias detalhados na pasta [`/docs`](./docs/):

- [**00-LEIA-PRIMEIRO.md**](./docs/00-LEIA-PRIMEIRO.md) — Regra de ouro e diretrizes para IAs e desenvolvedores.
- [**CONCEITO-OFICIAL-DA-MARCA.md**](./docs/CONCEITO-OFICIAL-DA-MARCA.md) — Conceito global protegido, arquitetura verbal e SEO Com Deus Kids.
- [**01-ARQUITETURA.md**](./docs/01-ARQUITETURA.md) — Monorepo, pacotes compartilhados e fluxo de dados.
- [**02-REGRAS-DE-DESIGN.md**](./docs/02-REGRAS-DE-DESIGN.md) — As 3 identidades visuais e a proibição de misturar Design Systems.
- [**03-SITE-CMS.md**](./docs/03-SITE-CMS.md) — Como o ADM alimenta dinamicamente o site público.
- [**04-CATEGORIAS-TEMAS-COLECOES.md**](./docs/04-CATEGORIAS-TEMAS-COLECOES.md) — Formato vs. Assunto vs. Agrupamento editorial.
- [**05-PRODUTOS.md**](./docs/05-PRODUTOS.md) — Modelo de infoprodutos digitais e arquivos múltiplos.
- [**06-COMPRA-E-ACESSO.md**](./docs/06-COMPRA-E-ACESSO.md) — Fluxo de checkout, webhook, idempotência e entitlements.
- [**07-AREA-DE-MEMBROS.md**](./docs/07-AREA-DE-MEMBROS.md) — Biblioteca do cliente e permissões de download.
- [**08-STREAMING.md**](./docs/08-STREAMING.md) — Séries, episódios, player imersivo e Smart TV.
- [**09-MUSICAS.md**](./docs/09-MUSICAS.md) — Hub de louvores e player global de áudio persistente.
- [**10-MATERIAIS-PDF.md**](./docs/10-MATERIAIS-PDF.md) — Previews públicos vs. PDFs integrais protegidos.
- [**11-ASSINATURAS.md**](./docs/11-ASSINATURAS.md) — Planos para Famílias, Igrejas e Escolas.
- [**12-PERFIS-E-PERMISSOES.md**](./docs/12-PERFIS-E-PERMISSOES.md) — Conta titular (Account) vs. Perfis infantis (Profile).
- [**13-ADM-CMS.md**](./docs/13-ADM-CMS.md) — Estrutura completa de navegação do painel ADM.
- [**14-BANCO-E-SUPABASE.md**](./docs/14-BANCO-E-SUPABASE.md) — Dicionário de tabelas, RLS e Storage.
- [**15-ROTAS.md**](./docs/15-ROTAS.md) — Mapa completo de rotas do Site, ADM, App e Smart TV.
- [**16-REGRAS-NAO-DUPLICAR.md**](./docs/16-REGRAS-NAO-DUPLICAR.md) — Os 10 mandamentos de integridade técnica.
- [**STATUS-DO-SISTEMA.md**](./docs/STATUS-DO-SISTEMA.md) — Matriz de auditoria real das funcionalidades.
