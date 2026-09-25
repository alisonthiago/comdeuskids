---
name: review-animations
description: Audit animations for performance, 60fps smoothness, frame drops, reflow hazards, and accessibility.
---

# Review Animations — Emil Design Engineering

## Audit Checklist
1. **Layout & Reflow Triggers (Prohibited)**:
   - NEVER animate `width`, `height`, `top`, `left`, `margin`, or `padding` during frequent interactions.
   - Use ONLY `transform` (translate, scale, rotate) and `opacity`.
2. **GPU Acceleration**:
   - Verify composited layers (`will-change: transform, opacity` or `transform: translateZ(0)` where appropriate).
   - Avoid creating too many compositing layers on memory-constrained devices like Smart TVs.
3. **Reduced Motion**:
   - Check `@media (prefers-reduced-motion: reduce)`.
   - Ensure animation durations drop to `0.01ms` or transitions fall back to instant opacity changes.
4. **Duration & Easing**:
   - Micro-interactions (hover, click, focus): 150ms – 220ms with cubic-bezier (`cubic-bezier(0.16, 1, 0.3, 1)` or `ease-out`).
   - Modal entrances/exits: 200ms – 280ms.
   - Avoid bouncy spring simulations on Smart TV browsers with low CPU.
