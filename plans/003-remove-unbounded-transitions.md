# 003 — Substituir transições ilimitadas nos controles principais

- **Status**: TODO
- **Commit**: indisponível — esta cópia de trabalho não contém `.git`
- **Severity**: MEDIUM
- **Category**: Performance e coesão
- **Estimated scope**: 4 arquivos, pequeno

## Problem

Existem `transition: all` em controles frequentes. Elas podem animar propriedades não planejadas e provocar repinturas. Locais já confirmados:

```css
/* apps/play/src/styles/streaming.css:336 */
transition: all 0.2s;

/* apps/play/src/styles/streaming.css:523 */
transition: all 0.2s ease;
```

```tsx
// apps/play/src/pages/SelectProfile.tsx:622
transition: all 0.2s ease;
```

```tsx
// apps/play/src/components/MediaCastingControls.tsx:214
transition: 'all 0.2s ease',
```

## Target

Substituir cada ocorrência pelo conjunto mínimo de propriedades efetivamente alteradas. Usar `160ms` e a curva `cubic-bezier(0.23, 1, 0.32, 1)` em movimentos de entrada; para cor, `160ms ease`.

Exemplo para botão de transmissão:

```tsx
transition: 'background-color 160ms ease, border-color 160ms ease, color 160ms ease, box-shadow 160ms ease',
```

Exemplo para avatar/botão de perfil:

```css
transition: background-color 160ms ease, color 160ms ease;
```

## Steps

1. Inspecionar as regras em `apps/play/src/styles/streaming.css` antes de editar e listar as propriedades que realmente mudam no seletor e hover correspondente.
2. Em `apps/play/src/pages/SelectProfile.tsx`, fazer o mesmo para `.cdk-add-avatar-box` e `.cdk-manage-pill-btn`, sem introduzir sombra ou glow.
3. Em `apps/play/src/components/MediaCastingControls.tsx`, limitar a transição do botão Cast/AirPlay às propriedades visuais usadas no próprio objeto `style`.
4. Nunca usar `transition: all` nos arquivos revisados.

## Boundaries

- Não mudar o visual aprovado do seletor de perfis.
- Cast e AirPlay continuam opcionais, apenas no player.
- Não alterar comportamento de clique, estado ou acessibilidade.

## Verification

- Executar `rg -n "transition:\s*all" apps/play/src/styles/streaming.css apps/play/src/pages/SelectProfile.tsx apps/play/src/components/MediaCastingControls.tsx`; não deve haver ocorrência nesses alvos.
- Executar `npm run build --workspace=@comdeuskids/play`.
- Testar `/selecionar-perfil` com mouse e teclado; borda e rótulos devem continuar respondendo sem sombra verde.
- Abrir um player compatível e conferir que Cast/AirPlay ainda recebem foco e mudam de estado sem salto.

