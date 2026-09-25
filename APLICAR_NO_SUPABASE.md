# Como Aplicar o Schema no Supabase

## Passo a passo

1. Acesse: https://supabase.com/dashboard/project/oswqehxtngklwfxqbrih/sql/new
2. Copie o conteúdo de `supabase/migrations/20260922000001_schema_completo.sql`
3. Cole no editor SQL do Dashboard
4. Clique em **RUN**
5. Aguarde "Success" (pode levar 10-20 segundos)

## Resultado esperado
- 12 tabelas criadas
- 2 storage buckets criados
- RLS ativado em todas as tabelas
- 15 categorias pré-carregadas
- 19 temas pré-carregados

## Se houver erro no bloco de Storage
Execute separadamente apenas este trecho:
```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('product-covers', 'product-covers', TRUE, 5242880,
   ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('product-files', 'product-files', FALSE, 52428800,
   ARRAY['application/pdf','application/zip','image/jpeg','image/png'])
ON CONFLICT (id) DO NOTHING;
```

## Depois de aplicar
Me informe e continuarei com as Edge Functions e o frontend.

## Correção de RLS e Multi-Tenant (Fase 1.1) — 23/09/2026

Execute `supabase/migrations/20260923000003_fix_rls_recursion.sql` no editor SQL:
1. Acesse: https://supabase.com/dashboard/project/oswqehxtngklwfxqbrih/sql/new
2. Cole o conteúdo de `supabase/migrations/20260923000003_fix_rls_recursion.sql`
3. Clique em **RUN**
4. Aguarde "Success"

Essa migration remove a recursão infinita (erro 42P17) nas políticas RLS através de
funções com `SECURITY DEFINER` e `search_path` seguro, habilitando as consultas a
`children`, `guardians`, `organizations`, `organization_members` e `organization_students`.

## Central da Família e Controle Parental (Fase 2) — 23/09/2026

Execute `supabase/migrations/20260923000004_parental_controls_and_usage.sql` no editor SQL:
1. Acesse: https://supabase.com/dashboard/project/oswqehxtngklwfxqbrih/sql/new
2. Cole o conteúdo de `supabase/migrations/20260923000004_parental_controls_and_usage.sql`
3. Clique em **RUN**
4. Aguarde "Success"

Essa migration implementa:
- Hash seguro de PIN (`pin_hash`, `pin_failed_attempts`, `pin_locked_until`)
- RPCs de segurança `verify_parent_pin` e `set_parent_pin` (migração gradual de legados, sem fallback 1234)
- Classificação de conteúdo `access_class` ('general' | 'educational')
- Tabela `profile_usage_sessions` e RPC `record_usage_heartbeat` para rastreamento de uso infantil real com RLS
- Configuração de timezone e janelas de horário permitidas (`allowed_start_time`, `allowed_end_time`)

## Homologação Final, Hardening e View Canônica de Afiliados (Fase 11) — 23/09/2026

Execute `supabase/migrations/20260923000013_final_hardening.sql` no editor SQL:
1. Acesse: https://supabase.com/dashboard/project/oswqehxtngklwfxqbrih/sql/new
2. Cole o conteúdo de `supabase/migrations/20260923000013_final_hardening.sql`
3. Clique em **RUN**
4. Aguarde "Success"

Essa migration implementa:
- Helper `confirm_test_user` para homologação remota das contas reais A x B sob `@comdeuskids.com.br`
- View canônica `affiliate_wallets` agregada diretamente de `affiliate_commissions`, impedindo tabelas duplicadas ou divergência de saldo
- Concorrência `FOR UPDATE` em `request_affiliate_payout` contra saques simultâneos no mesmo saldo
- Trigger `trg_enforce_profile_limit` para resguardar concorrência do limite de perfis por plano
- Trigger `trg_validate_student_submission` contra IDOR de submissões educacionais de turmas alheias

## Sessão Segura para Smart TV e Pareamento Celular-TV (Fase 1 TV) — 24/09/2026

Execute `supabase/migrations/20260924000015_secure_tv_streaming.sql` no editor SQL:
1. Acesse: https://supabase.com/dashboard/project/oswqehxtngklwfxqbrih/sql/new
2. Cole o conteúdo de `supabase/migrations/20260924000015_secure_tv_streaming.sql`
3. Clique em **RUN**
4. Aguarde "Success"

Essa migration implementa:
- Tabela `tv_pairing_sessions` para códigos temporários (CDK-XXXX) e tokens de dispositivo revogáveis
- RPC `create_tv_pairing_session` (gera código e token com expiração)
- RPC `approve_tv_pairing_session` (autoriza a TV a partir da conta do responsável autenticada no celular)
- RPC `get_tv_pairing_status` (verificação periódica de autorização da TV)
- RPC `get_tv_profiles` (reutilização apenas de perfis infantis da conta autorizada)
- RPC `verify_tv_profile_pin` (verificação segura do PIN com bcrypt e proteção anti-força bruta de 5 tentativas)
- RPCs `get_tv_profile_state`, `save_tv_watch_progress` e `toggle_tv_my_list` (sincronização de progresso e Minha Lista com RLS)
- RPCs `check_tv_parental_access` e `record_tv_usage_heartbeat` (tempo de tela e janela de horário no modo TV)



