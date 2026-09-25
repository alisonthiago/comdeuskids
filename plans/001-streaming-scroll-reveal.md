# 001 — Reduzir o custo das entradas do catálogo

- **Status**: TODO
- **Commit**: indisponível — esta cópia de trabalho não contém `.git`
- **Severity**: HIGH
- **Category**: Performance, frequência e acessibilidade
- **Estimated scope**: 1 arquivo, pequeno

## Problem

`apps/play/src/components/streaming/ScrollRevealSection.tsx:56-60` faz cada seção do catálogo entrar com `translateY(30px)`, `blur(5px)` e duração de `0.8s`. O catálogo possui várias seções e este movimento é repetido enquanto a pessoa navega. O filtro exige pintura extra em dispositivos de menor potência, especialmente TV.

```tsx
opacity: isVisible ? 1 : 0.18,
transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
filter: isVisible ? 'blur(0)' : 'blur(5px)',
transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, filter 0.65s ease ${delay}ms`,
willChange: 'opacity, transform, filter',
```

## Target

Manter a entrada útil, mas com somente propriedades compostas e duração de UI curta:

```tsx
opacity: isVisible ? 1 : 0,
transform: isVisible ? 'translateY(0)' : 'translateY(12px)',
transition: `opacity 220ms cubic-bezier(0.23, 1, 0.32, 1) ${delay}ms, transform 220ms cubic-bezier(0.23, 1, 0.32, 1) ${delay}ms`,
willChange: 'opacity, transform',
```

## Steps

1. Em `apps/play/src/components/streaming/ScrollRevealSection.tsx`, substituir o bloco acima pelo alvo, removendo `filter` inteiramente.
2. Não alterar `IntersectionObserver`, limiar, conteúdo ou ordem das seções.

## Boundaries

- Não adicionar biblioteca de animação.
- Não mudar catálogo, dados, player ou carregamento dos vídeos.

## Verification

- Executar `npm run build --workspace=@comdeuskids/play`.
- Em `/inicio`, rolar até três seções: a entrada deve ser discreta, sem desfoque e terminar em até 220 ms.
- Com `prefers-reduced-motion: reduce`, confirmar que a regra global reduz o deslocamento para praticamente instantâneo.

