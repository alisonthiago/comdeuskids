# 13 — O PAINEL ADM COMO CMS COMPLETO DA PLATAFORMA

O **ADM (`apps/adm`)** é a central de inteligência e publicação do ecossistema. Ele desempenha duas funções primordiais complementares:

1. **Gestor do APP**: Administra o que as crianças e membros consomem (streaming, músicas, quizzes e PDFs protegidos).
2. **CMS do SITE**: Administra o que os visitantes e famílias visualizam antes de comprar (vitrines, categorias, banners, menus, SEO e preços).

---

## 1. Menu Oficial de Navegação da Sidebar

A sidebar do ADM segue rigorosamente a estrutura abaixo:

```text
Dashboard (Início)

CONTEÚDOS >
├── Todos os Conteúdos (/admin/conteudos)
├── Filmes (/admin/conteudos/filmes)
├── Séries & Episódios (/admin/conteudos/series)
├── Histórias Bíblicas (/admin/conteudos/historias)
├── Clipes & Reels (/admin/conteudos/clipes)
├── Músicas Infantis (/admin/conteudos/musicas)
├── Lições Bíblicas (/admin/conteudos/licoes)
├── Quizzes Interativos (/admin/quizzes)
└── Materiais / PDFs (/admin/produtos)

EXPERIÊNCIA DO APP >
├── Home do APP & Hero (/admin/app/home)
├── Carrosséis Dinâmicos (/admin/app/home)
└── Coleções & Biblioteca (/admin/biblioteca)

SITE (CMS PÚBLICO) >
├── Visão Geral do Site
├── Categorias (Formatos de atividades públicas)
├── Temas (Assuntos bíblicos da loja)
├── Coleções (Séries editoriais públicas)
├── Menus (Navegação Header & Rodapé)
├── Páginas (Home, Especial Jesus, Planos, Termos)
├── Banners Promocionais (Desktop & Mobile)
└── SEO & Indexação

ASSINATURAS >
├── Planos & Limites (/admin/planos)
└── Assinaturas & Pedidos (/admin/pedidos)

PÚBLICO & ACESSO >
├── Todas as Contas (/admin/contas)
├── Famílias (/admin/contas?type=family)
├── Igrejas (/admin/contas?type=church)
├── Escolas (/admin/contas?type=school)
└── Membros & Clientes (/admin/clientes)

FINANCEIRO (/admin/financeiro)

RELATÓRIOS >
├── Estatísticas (/admin/estatisticas)
└── Logs Administrativos (/admin/logs)

CONFIGURAÇÕES (/admin/configuracoes)
└── Submenu 1:1 com referência corporativa:
    ├── Pagamentos e Envios
    ├── Documentos Fiscais (NF-e, DC-e)
    ├── Comunicação (Informação de Contato, WhatsApp, E-mails)
    ├── Checkout
    ├── Equipe e Permissões
    └── Outros (Domínios, Códigos Externos, Moedas, Redirecionamentos)
```

---

## 2. A Separação Estratégica: CONTEÚDOS vs. SITE

* **CONTEÚDOS**: Focado na **experiência pedagógica e de entretenimento da criança**. Trata de vídeos, temporadas, arquivos de áudio e lições da EBD.
* **SITE**: Focado na **conversão e organização comercial pública**. Trata de como as categorias são agrupadas na vitrine, quais banners aparecem no topo do site e quais links compõem o rodapé da loja.

Essa divisão impede que configurações comerciais poluam o catálogo de streaming e vice-versa.
