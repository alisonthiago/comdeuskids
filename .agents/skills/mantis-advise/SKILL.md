---
name: mantis-advise
description: Static security advisory and vulnerability review based on Google Mantis methodology. Analyzes RLS, auth scopes, parental controls, PIN safety, and data isolation without executing exploits or breaking changes.
---

# Google Mantis — Static Security Advisory for Com Deus Kids

## Security Review Scope
- **Child & Parental Safety**: Ensure PIN verification occurs securely on the server/Supabase, preventing bypass via local storage tampering.
- **Tenant & Context Isolation**: Verify family, church, and school scopes do not leak data across tenants.
- **TV Session Pairing**: Ensure short-lived codes and token verification cannot be guessed or replayed.
- **Read-Only / Non-Destructive**: Never execute exploits, destructive tests, or arbitrary database drops. Always report findings with severity (Critical, High, Medium, Low) and await user approval.
