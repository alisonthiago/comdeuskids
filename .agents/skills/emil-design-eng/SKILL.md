---
name: emil-design-eng
description: Design engineering principles by Emil Kowalski. Audit and polish UI hierarchy, typography, spacing, layout, micro-interactions, responsive states, and 60fps animations.
---

# Emil Design Engineering — Com Deus Kids

## Core Principles
1. **Refined Hierarchy & Typography**:
   - Strictly adhere to official typography: **Baloo 2** (400, 500, 600, 700, 800).
   - Establish crystal-clear visual hierarchy: Display > Title > Subtitle > Body > Label.
   - Snappy line-heights: Headings (1.05–1.15), Body (1.4–1.6).

2. **Spacing & Breathing Room**:
   - Strict 4px/8px grid system.
   - Generous breathing space around hero items and cards without horizontal viewport spill.
   - Avoid cramped elements or overwhelming visual density.

3. **Micro-Interactions & Transitions**:
   - Interactions should feel fast, snappy, and natural (150ms–220ms).
   - Use cubic-bezier curves: `cubic-bezier(0.16, 1, 0.3, 1)`.
   - Never use `transition: all`. Target specific properties: `transform`, `opacity`, `background-color`, `border-color`.

4. **Zero Reflow Motion**:
   - Animate ONLY `transform` and `opacity`.
   - Never animate `width`, `height`, `top`, `left`, `margin`, or `padding`.

5. **Accessibility & TV Readiness**:
   - Snappy focus rings on D-Pad navigation (Smart TV remote).
   - Respect `@media (prefers-reduced-motion: reduce)`.
