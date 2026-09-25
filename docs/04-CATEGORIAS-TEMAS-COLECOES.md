# 04 — CATEGORIAS, TEMAS E COLEÇÕES: MODELAGEM EDITORIAL

Para garantir que o catálogo do **COM DEUS KIDS** cresça de forma escalável e sem redundâncias, o sistema adota uma distinção clara entre **Categoria**, **Tema** e **Coleção**.

---

## 1. Definições Conceituais

### A. CATEGORIA = O Formato / Tipo do Material
Define a natureza prática da atividade pedagógica ou do arquivo digital.
* **Pergunta que responde**: *"O que a criança vai fazer com este material?"*
* **Exemplos Reais Cadastrados**:
  - `Adesivos`
  - `Caça-palavras`
  - `Caligrafia`
  - `Colorir`
  - `Desenhar`
  - `Histórias`
  - `Jogos dos 7 Erros`
  - `Jogos da Memória`
  - `Jogos Interativos`
  - `Labirintos`
  - `Lições Bíblicas`
  - `Mapas Bíblicos`
  - `Marcadores de Páginas`
  - `Português`
  - `Quebra-Cabeças`
  - `Quiz`
* **Rota Pública**: `/categoria/:slug` (ex: `/categoria/colorir`, `/categoria/labirintos`).

---

### B. TEMA = O Assunto Bíblico / Conteúdo Espiritual
Define o personagem, evento bíblico ou virtude cristã abordada no material.
* **Pergunta que responde**: *"Sobre quem ou o que este material ensina?"*
* **Exemplos Reais Cadastrados**:
  - `Jesus`
  - `Criação`
  - `Noé`
  - `Abraão`
  - `Moisés`
  - `Davi`
  - `Daniel`
  - `Jonas`
  - `Fé`
  - `Oração`
  - `Amor`
  - `Perdão`
  - `Obediência`
  - `Gratidão`
  - `Família`
  - `Natal`
  - `Páscoa`
* **Rota Pública**: `/tema/:slug` (ex: `/tema/jesus`, `/tema/pascoa`, `/tema/oracao`).

---

### C. COLEÇÃO = O Agrupamento Editorial / Série
Define uma linha temática ou pacote pedagógico montado estrategicamente pela curadoria da plataforma.
* **Pergunta que responde**: *"A qual conjunto editorial completo este item pertence?"*
* **Exemplos Reais**:
  - `Histórias de Jesus`
  - `Heróis da Fé`
  - `Grandes Milagres`
  - `Antigo Testamento para Crianças`
  - `Novo Testamento Ilustrado`
  - `Mulheres da Bíblia`
* **Rota Pública**: `/colecao/:slug` (ex: `/colecao/herois-da-fe`).

---

## 2. Relacionamento Multidimensional: O Princípio da Não-Duplicação

Um único produto cadastrado no ADM pode (e deve) estar associado simultaneamente a sua Categoria, a um ou mais Temas e a uma Coleção opcional.

### Exemplo Prático:

```text
PRODUTO:
"Encontre o Caminho — Jesus Acalma a Tempestade"

CATEGORIA (1:N):
└── Labirintos

TEMAS (N:N via product_themes):
├── Jesus
├── Fé
└── Obediência

COLEÇÃO (Opcional):
└── Histórias de Jesus

FAIXA ETÁRIA:
└── 6 a 8 anos
```

### Onde este produto aparece automaticamente no SITE?
1. Na vitrine de formatos: `/categoria/labirintos`
2. Na vitrine de assuntos: `/tema/jesus`
3. Na vitrine de temas: `/tema/fe`
4. Na vitrine da coleção: `/colecao/historias-de-jesus`
5. Na página especial: `/jesus`
6. Nos resultados de busca pública ao pesquisar por "Labirinto", "Jesus" ou "Tempestade".

> **REGRA FUNDAMENTAL**: O produto não é duplicado no banco de dados. Ele existe em **uma única linha** na tabela `products`, conectado pelas chaves estrangeiras apropriadas.

---

## 3. Contagem Automática de Produtos no ADM

Ao listar as categorias no ADM, a coluna **"Produtos"** (ex: `Colorir — 32 produtos`, `Labirintos — 18 produtos`) **nunca deve ser um campo manual ou estático**.

A quantidade deve ser computada dinamicamente:
```sql
SELECT 
  c.id, 
  c.name, 
  c.slug, 
  c.active, 
  c.sort_order,
  COUNT(p.id) AS products_count
FROM public.categories c
LEFT JOIN public.products p 
  ON p.category_id = c.id 
  AND p.status = 'active' 
  AND p.deleted_at IS NULL
GROUP BY c.id
ORDER BY c.sort_order ASC;
```

---

## 4. A Experiência "Especial Jesus" (`/jesus`)

O site público possui uma rota consagrada a apresentar os materiais e histórias dedicados a Jesus.
* **Implementação Correta**: A página `/jesus` consulta os produtos e conteúdos associados ao tema `Jesus` (`slug = 'jesus'`) e os renderiza no design oficial e vibrante do site.
* **Proibido**: Jamais criar um produto duplicado com o prefixo "Jesus -" apenas para alimentá-lo nessa página. O relacionamento pelo CMS é quem faz o roteamento automático.
