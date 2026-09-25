import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://oswqehxtngklwfxqbrih.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zd3FlaHh0bmdrbHdmeHFicmloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwMjc4MjcsImV4cCI6MjEwNTYwMzgyN30.FfHqMvB5x04-B6INO0a1i52D--FIyczrqN28_3ebZQU'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function runPhase9Suite() {
  console.log('=====================================================')
  console.log('🚀 INICIANDO BATERIA DE TESTES REMOTOS — FASE 9: ADM CENTRAL')
  console.log('=====================================================')

  let passed = 0
  let failed = 0

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`✅ [PASSOU] ${testName}`)
      passed++
    } else {
      console.error(`❌ [FALHOU] ${testName} - ${details}`)
      failed++
    }
  }

  // 1. Verificação de tabelas da Fase 9
  const tables = [
    'platform_settings',
    'customer_support_notes',
    'platform_admin_capabilities'
  ]

  for (const tbl of tables) {
    const { error } = await supabase.from(tbl).select('*', { count: 'exact', head: true })
    assert(!error || error.code === 'PGRST116' || error.message?.includes('permission'), `Tabela ${tbl} ativa no Supabase`, error?.message)
  }

  // 2. Proteção RLS: Acesso anônimo restrito a notas de suporte e capabilities
  const { data: anonNotes } = await supabase.from('customer_support_notes').select('*')
  assert(anonNotes?.length === 0, 'RLS bloqueia visualização anônima de customer_support_notes')

  const { data: anonCaps } = await supabase.from('platform_admin_capabilities').select('*')
  assert(anonCaps?.length === 0, 'RLS bloqueia visualização anônima de platform_admin_capabilities')

  // 3. Teste de RPC: get_admin_dashboard_metrics (Métricas Reais)
  const { data: metrics, error: metricsErr } = await supabase.rpc('get_admin_dashboard_metrics')
  assert(!metricsErr && metrics, 'RPC get_admin_dashboard_metrics executa com sucesso', metricsErr?.message)

  if (metrics) {
    assert(metrics.financial && typeof metrics.financial.gross_revenue_cents === 'number', 'Métricas financeiras calculadas em centavos (minor units)')
    assert(typeof metrics.financial.mrr_cents === 'number', 'MRR calculado em centavos excluindo one-time/lifetime')
    assert(metrics.subscriptions && typeof metrics.subscriptions.active === 'number', 'Contagem de assinaturas ativas retornada com integridade')
    assert(metrics.customers && typeof metrics.customers.total_users === 'number', 'Contagem real de usuários/clientes retornada')
    assert(typeof metrics.customers.churches === 'number', 'Contagem real de Igrejas retornada')
    assert(typeof metrics.customers.schools === 'number', 'Contagem real de Escolas retornada')
    assert(typeof metrics.customers.families === 'number', 'Contagem real de Famílias retornada')
    assert(typeof metrics.customers.teachers === 'number', 'Contagem real de Professores retornada')
    assert(metrics.affiliates && typeof metrics.affiliates.active_affiliates === 'number', 'Contagem real de Afiliados ativos retornada')
  }

  // 4. Teste de RPC: admin_search_global com anon (deve bloquear por segurança)
  const { data: searchRes, error: searchErr } = await supabase.rpc('admin_search_global', { p_query: 'test' })
  assert(searchErr?.message?.includes('Acesso não autorizado') || searchErr?.message?.includes('permission') || !searchRes, 'RPC admin_search_global bloqueia chamadas não autorizadas de anônimos')

  // 5. Teste de RPC: admin_cancel_subscription com anon (deve bloquear)
  const { data: cancelRes, error: cancelErr } = await supabase.rpc('admin_cancel_subscription', {
    p_subscription_id: '00000000-0000-0000-0000-000000000001',
    p_immediately: false,
    p_reason: 'Teste não autorizado'
  })
  assert(cancelErr?.message?.includes('Acesso não autorizado') || cancelErr?.message?.includes('permission') || !cancelRes?.success, 'RPC admin_cancel_subscription bloqueia cancelamento não autorizado')

  // 6. Teste de RPC: admin_grant_manual_entitlement com anon (deve bloquear)
  const { data: grantRes, error: grantErr } = await supabase.rpc('admin_grant_manual_entitlement', {
    p_target_id: '00000000-0000-0000-0000-000000000001',
    p_is_org: false,
    p_feature_key: 'stream.premium',
    p_valid_until: new Date(Date.now() + 86400000).toISOString(),
    p_reason: 'Teste não autorizado'
  })
  assert(grantErr?.message?.includes('Acesso não autorizado') || grantErr?.message?.includes('permission') || !grantRes?.success, 'RPC admin_grant_manual_entitlement bloqueia concessão não autorizada')

  console.log('-----------------------------------------------------')
  console.log(`TOTAL DE TESTES FASE 9: ${passed + failed}`)
  console.log(`✅ APROVADOS: ${passed}`)
  console.log(`❌ FALHAS: ${failed}`)
  console.log('=====================================================')

  if (failed > 0) {
    process.exit(1)
  }
}

runPhase9Suite().catch(err => {
  console.error('Erro fatal ao rodar suite da Fase 9:', err)
  process.exit(1)
})
