# 002 — Tornar o foco da barra lateral da TV imediato

- **Status**: TODO
- **Commit**: indisponível — esta cópia de trabalho não contém `.git`
- **Severity**: HIGH
- **Category**: Frequência, performance e TV
- **Estimated scope**: 1 arquivo, pequeno

## Problem

`apps/play/src/styles/tv.css:265` anima `width` por 250 ms na barra lateral. A expansão ocorre via `:focus-within`, portanto pode acompanhar a navegação repetida por controle remoto. Animar largura força layout e torna a resposta do D-pad mais lenta.

```css
.cdk-tv-sidebar {
  width: 72px;
  transition: width 0.25s ease;
}

.cdk-tv-sidebar:focus-within,
.cdk-tv-sidebar.expanded {
  width: 240px;
}
```

## Target

Trocar imediatamente de estado, preservando o foco visível e a navegação:

```css
.cdk-tv-sidebar {
  width: 72px;
  overflow: hidden;
}

.cdk-tv-sidebar:focus-within,
.cdk-tv-sidebar.expanded {
  width: 240px;
}
```

## Steps

1. Em `apps/play/src/styles/tv.css`, remover somente `transition: width 0.25s ease` da regra `.cdk-tv-sidebar`.
2. Não alterar a largura fechada, largura expandida, navegação ou atalhos do controle.

## Boundaries

- Não converter a TV em layout desktop.
- Não alterar sessão, perfis, PIN, rotas ou player.

## Verification

- Executar `npm run build --workspace=@comdeuskids/play`.
- Em `/tv`, navegar com setas entre a barra e o conteúdo: a barra deve abrir e fechar sem atraso e sem travar o foco.
- Testar em modo reduzido de movimento; o comportamento deve continuar compreensível.

