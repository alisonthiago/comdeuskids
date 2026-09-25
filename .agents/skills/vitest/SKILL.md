---
name: vitest
description: Unit and integration testing patterns for Vite, React 18, and Supabase integration in Com Deus Kids.
---

# Vitest Testing Skill — Com Deus Kids

## Context & Compatibility
- Com Deus Kids monorepo uses Vite 6 and React 18 with TypeScript.
- Vitest provides native ESM and fast zero-bundle test execution.

## Testing Guidelines
1. **Component Testing**:
   - Use `@testing-library/react` and `jsdom`.
   - Test user interaction flows (Profile selection, PIN entry, video play trigger, TV D-pad actions).
2. **Supabase Mocks**:
   - Mock `@comdeuskids/supabase` auth session, RPCs and realtime subscriptions in tests.
3. **Focus & Keyboard Navigation**:
   - Test spatial navigation hooks (`useTVNavigation`, `tvInputController`).
   - Validate Arrow key traversal and Enter action triggers.
