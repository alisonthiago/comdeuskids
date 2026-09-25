---
name: check-fix-accessibility
description: Audit and fix accessibility issues (WCAG, D-pad TV navigation, ARIA roles, focus management, keyboard accessibility).
---

# Check & Fix Accessibility Skill — Com Deus Kids

## Core Principles
1. **D-Pad & Remote Control First (10-Foot UI)**:
   - All interactive elements must have `tabindex="0"` or native button/link semantics.
   - Visible high-contrast focus rings with no layout reflow (use `outline` or `box-shadow` + GPU `transform: scale(1.05)`).
   - Ensure spatial navigation (`UP`, `DOWN`, `LEFT`, `RIGHT`, `ENTER`, `BACK`) traverses geometric neighbors predictably.
2. **Screen Reader & Semantic HTML**:
   - Provide `aria-label` for icon-only buttons (Search, Play, Settings, Close, Remote actions).
   - Ensure proper heading hierarchy (`h1` for hero title, `h2` for rails/sections).
   - Modal dialogs must use `role="dialog"` and `aria-modal="true"`.
3. **Motion & Vestibular Safety**:
   - Respect `@media (prefers-reduced-motion: reduce)` by disabling scaling, spring transforms, and rapid transitions.
4. **Color Contrast**:
   - Minimum 4.5:1 for normal text against dark backgrounds.
   - Text over hero banners must have dark gradient protection overlays (`linear-gradient(to top, ...)`).
