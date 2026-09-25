---
name: improve-animations
description: Implement lightweight, fluid, and GPU-accelerated motion patterns for streaming cards, heroes, carousels, and TV navigation.
---

# Improve Animations — Emil Design Engineering

## High-Performance Streaming Motion Patterns

### 1. Card Hover & Focus
```css
.cdk-stream-card {
  transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s ease;
  will-change: transform;
}
.cdk-stream-card:hover {
  transform: translateY(-4px) scale(1.02);
}
.cdk-stream-card:focus-visible,
.cdk-tv-focus:focus {
  outline: none;
  transform: scale(1.06);
  box-shadow: 0 0 0 3px #22c55e, 0 12px 32px rgba(34, 197, 94, 0.35);
}
```

### 2. Tab Transitions
- Fade & subtle slide using `opacity` and `transform: translateY(6px)` to `translateY(0)` in 180ms.

### 3. Modal / Dialog Open
```css
@keyframes cdkModalIn {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
```

### 4. Smart TV & Low Power Rule
- On TV or reduced motion, suppress backdrop blurs (`backdrop-filter`) and intense multi-layered drop shadows, using clean solid rgba backgrounds (`rgba(10, 12, 16, 0.95)`).
