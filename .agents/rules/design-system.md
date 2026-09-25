# Design System Global — Com Deus Kids

## Conceito global protegido da marca

O conceito verbal institucional é **“COM DEUS KIDS — CRESCER COM DEUS DESDE A INFÂNCIA.”** A explicação oficial é **“Com Deus Kids é um universo onde crianças aprendem, brincam, assistem e crescem com Deus.”** Esses textos não podem ser removidos, reescritos, substituídos ou disputados por outro slogan principal por nenhuma IA ou agente. A diretriz também documenta o negócio, ofertas, públicos, todas as áreas e afiliados; leia [docs/CONCEITO-OFICIAL-DA-MARCA.md](../../docs/CONCEITO-OFICIAL-DA-MARCA.md) antes de qualquer tarefa neste repositório, não apenas trabalhos de comunicação ou SEO. Se uma solicitação conflitar com o conceito protegido, mantenha-o e peça confirmação ao responsável pelo projeto.

> **REGRA OBRIGATÓRIA**: Todo código criado ou modificado neste projeto DEVE seguir este design system.
> A única exceção é o `apps/play`, que possui identidade visual própria (dark mode de streaming) e **NÃO deve ser alterado**.

---

## Escopo de aplicação

Aplica-se a:
- `apps/adm` — Painel administrativo
- `apps/membros` — Área de membros (Família, Professor, Igreja, Escola)
- `apps/site` — Site público / loja
- Qualquer nova app ou página criada no projeto

**NÃO se aplica a:**
- `apps/play` — Streaming infantil (identidade escura própria, não mexer)

---

## Paleta de cores

```css
--cdk-orange:        #F4512A;   /* Ação / destaque / ícones */
--cdk-bg:            #F7F9FC;   /* fundo geral da página */
--cdk-card-bg:       #FFFFFF;   /* fundo de cards */
--cdk-field-bg:      #F8FAFD;   /* fundo de campos e filtros */
--cdk-text-title:    #16181D;   /* títulos principais */
--cdk-text-body:     #3A3F4B;   /* texto de corpo */
--cdk-text-muted:    #788294;   /* texto secundário / descrições */
--cdk-text-caption:  #8C96A6;   /* legendas e placeholders */
--cdk-text-link:     #5E6978;   /* links (ex: ← Voltar) */
--cdk-border:        #D9E0EA;   /* borda padrão */
--cdk-btn-dark:      #171A20;   /* botão primário escuro */
--cdk-btn-dark-hover:#2A2E36;
--cdk-alert-bg:      #FFF9E7;
--cdk-alert-border:  #F3CF69;
--cdk-alert-text:    #A36A00;
```

**Regra principal de cor:** O laranja (#F4512A) aparece SOMENTE em ícones de destaque, bordas de seleção, estado hover de cards e CTAs de ação. Todo o resto usa branco, cinza claro e texto escuro.

---

## Tipografia

- **Fonte:** Inter, Arial, sans-serif
- Título principal de página: 24px, peso 700, cor #16181D
- Subtítulo / descrição de página: 13px, peso 400, cor #788294
- Título de seção: 14px, peso 700, cor #16181D
- Título de card: 14–15px, peso 700, cor #3A3F4B
- Descrição de card: 12px, peso 400, line-height 18px, cor #788294
- Texto de botão: 13px, peso 600
- Legendas / placeholders: 12px, cor #8C96A6

---

## Espaçamentos

- Padding interno da página: 32px
- Entre título e subtítulo: 4px
- Entre cabeçalho e cards de resumo: 24px
- Entre cards: 12px
- Entre blocos da página: 28px
- Padding interno de card: 16px
- Padding de campo / filtro: 12px 16px
- Altura de botão padrão: 40px
- Altura de campo de busca: 42px

---

## Cards de resumo (stat cards)

```css
background: #FFFFFF;
border: 1px solid #D9E0EA;
border-radius: 6px;
padding: 16px;
/* Sem box-shadow forte — apenas borda suave */
```

- Ícone laranja #F4512A, 16px
- Quatro cards por linha em desktop

---

## Botão primário escuro

```css
background: #171A20;
color: #FFFFFF;
border-radius: 4px;
padding: 10px 16px;
font-size: 13px;
font-weight: 600;
height: 40px;
box-shadow: 0 2px 5px rgba(0,0,0,0.12);
border: none;
/* Hover: background #2A2E36 */
```

## Botão secundário

```css
background: #FFFFFF;
color: #3A3F4B;
border: 1px solid #D9E0EA;
border-radius: 4px;
padding: 10px 16px;
font-size: 13px;
font-weight: 600;
height: 40px;
```

---

## Campo de busca e filtros

```css
background: #F8FAFD;
border: 1px solid #D9E0EA;
border-radius: 6px;
padding: 12px 16px;
height: 42px;
/* Ícone de busca: #8C96A6 */
```

---

## Cards de seleção ("O que você vai vender?")

```css
/* Card container */
background: #FFFFFF;
border: 1px solid #D9E0EA;
border-radius: 6px;
min-height: 220px;
cursor: pointer;
transition: all 150ms ease;

/* Área superior (ícone) */
background: #F1F3F5;
height: 110px;
/* Ícone: #F4512A, 42–48px */

/* Área inferior (texto) */
padding: 16px;
/* Título: 15px 700 #16181D */
/* Descrição: 12px 400 #788294 */

/* Hover */
border-color: #F4512A;
box-shadow: 0 8px 20px rgba(30, 41, 59, 0.10);
transform: translateY(-2px);
```

---

## Estado vazio (empty state)

```css
border: 1px dashed #D9E0EA;
background: #FFFFFF;
border-radius: 6px;
padding: 48px 24px;
text-align: center;
color: #788294;
font-size: 14px;
/* Sem ilustrações grandes — manter clean */
```

---

## Alertas

```css
background: #FFF9E7;
border: 1px solid #F3CF69;
border-radius: 6px;
padding: 12px 16px;
color: #A36A00;
font-size: 13px;
```

---

## Modais

```css
/* Overlay */
background: rgba(15, 23, 42, 0.42);

/* Container */
background: #FFFFFF;
border-radius: 10px;
padding: 28px;
box-shadow: 0 18px 50px rgba(15, 23, 42, 0.25);
max-width: 480px;

/* Título: 20px 700 #16181D */
/* Inputs: border 1px solid #D9E0EA, radius 6px, padding 10px 14px */
```

---

## Tabelas e listas

```css
/* Container */
border: 1px solid #D9E0EA;
border-radius: 8px;
background: #FFFFFF;
overflow: hidden;

/* Header: background #F8FAFC, font 11px 700 #788294 uppercase */
/* Linha: padding 14px 20px, border-bottom 1px solid #F1F5F9 */
```

---

## Badges de status

```css
/* Ativo  */ background: #DCFCE7; color: #166534;
/* Rascunho */ background: #FEF3C7; color: #92400E;
/* Arquivado */ background: #F1F5F9; color: #64748B;
```

---

## Sidebar

Usar as classes CSS do adm (adm-shell, adm-rail, adm-topbar, adm-rail__link):
- Fundo da sidebar: #FFFFFF com borda #E1E4E8
- Link ativo: background #EDF1FF; color #2563EB
- Ícone de marca: #F4512A (laranja)

---

## Instruções para o agente

1. **Ao criar qualquer nova página**: usar #F7F9FC como fundo, cards brancos com borda #D9E0EA, tipografia Inter.
2. **Botão primário**: escuro #171A20. Botão secundário: branco com borda #D9E0EA.
3. **Cor de ação/destaque**: sempre #F4512A (laranja). Nunca azul genérico, roxo ou gradiente aleatório.
4. **Modais**: overlay sutil, container branco, inputs com borda #D9E0EA.
5. **Proibido**: fundos escuros, roxo, gradientes coloridos, sombras pesadas, cores fora deste sistema.
6. **apps/play é IMUNE**: não modificar sua identidade visual sob nenhuma circunstância.
