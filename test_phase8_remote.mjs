import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://oswqehxtngklwfxqbrih.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zd3FlaHh0bmdrbHdmeHFicmloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwMjc4MjcsImV4cCI6MjEwNTYwMzgyN30.FfHqMvB5x04-B6INO0a1i52D--FIyczrqN28_3ebZQU'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function runPhase8Suite() {
  console.log('=====================================================')
  console.log('🚀 INICIANDO BATERIA DE TESTES REMOTOS — FASE 8')
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

  // 1. Verificação de tabelas no Supabase (Estrutura)
  const tables = [
    'notification_templates',
    'notification_preferences',
    'notification_providers',
    'notification_deliveries',
    'notifications_in_app',
    'notification_automations',
    'notification_audit_logs'
  ]

  for (const tbl of tables) {
    const { error } = await supabase.from(tbl).select('*', { count: 'exact', head: true })
    assert(!error || error.code === 'PGRST116' || error.message?.includes('permission'), `Tabela ${tbl} ativa no Supabase`, error?.message)
  }

  // 2. Verificação de Políticas RLS (Acesso anônimo restrito a dados protegidos)
  const { data: anonDeliveries } = await supabase.from('notification_deliveries').select('*')
  assert(anonDeliveries?.length === 0, 'RLS bloqueia visualização anônima direta em notification_deliveries')

  const { data: anonPreferences } = await supabase.from('notification_preferences').select('*')
  assert(anonPreferences?.length === 0, 'RLS bloqueia visualização anônima direta em notification_preferences')

  const { data: anonAutomations } = await supabase.from('notification_automations').select('*')
  assert(anonAutomations?.length === 0, 'RLS bloqueia visualização anônima direta em notification_automations')

  // 3. Teste de RPC: render_template_variables (Whitelist de Variáveis)
  const { data: renderedAllowed, error: rpcErr1 } = await supabase.rpc('render_template_variables', {
    p_template: 'Olá {{first_name}}, seu pedido {{product_name}} custou {{amount}}!',
    p_variables: { first_name: 'Alison', product_name: 'Kit Bíblico', amount: 'R$ 49,90', hacker_key: 'DROP TABLE' },
    p_allowed_vars: ['first_name', 'product_name', 'amount']
  })
  assert(!rpcErr1 && renderedAllowed === 'Olá Alison, seu pedido Kit Bíblico custou R$ 49,90!', 'RPC render_template_variables renderiza variáveis permitidas com sucesso', rpcErr1?.message)

  const { data: renderedBlocked, error: rpcErr2 } = await supabase.rpc('render_template_variables', {
    p_template: 'Segredo: {{hacker_key}}',
    p_variables: { hacker_key: 'VALOR_PROIBIDO' },
    p_allowed_vars: ['first_name']
  })
  assert(!rpcErr2 && renderedBlocked === 'Segredo: {{hacker_key}}', 'RPC render_template_variables bloqueia variáveis fora da whitelist', rpcErr2?.message)

  // 4. Teste de RPC: emit_notification_event e processamento no motor
  const dummyEntityId = '00000000-0000-0000-0000-000000000001'
  const { data: eventId, error: emitErr } = await supabase.rpc('emit_notification_event', {
    p_event_name: 'order.paid',
    p_entity_type: 'order',
    p_entity_id: dummyEntityId,
    p_user_id: null,
    p_org_id: null,
    p_payload: {
      recipient_email: 'teste@exemplo.com',
      recipient_name: 'Cliente Teste',
      product_name: 'Plano Família Anual',
      amount: 'R$ 199,00',
      action_url: 'https://comdeuskids.com.br/play'
    }
  })
  assert(!emitErr && eventId, 'RPC emit_notification_event executa e integra com Event Bus (billing_events)', emitErr?.message)

  // 5. Teste de Idempotência: reprocessar o mesmo evento não cria delivery duplicado
  const { data: secondCallRes, error: secondCallErr } = await supabase.rpc('process_notification_event', {
    p_event_name: 'order.paid',
    p_entity_type: 'order',
    p_entity_id: dummyEntityId,
    p_user_id: null,
    p_org_id: null,
    p_payload: {
      recipient_email: 'teste@exemplo.com',
      recipient_name: 'Cliente Teste',
      product_name: 'Plano Família Anual',
      amount: 'R$ 199,00',
      action_url: 'https://comdeuskids.com.br/play'
    }
  })
  assert(!secondCallErr && secondCallRes?.success && secondCallRes?.deliveries_created === 0, 'Idempotência rigorosa: segundo disparo do mesmo evento não gera delivery duplicado (deliveries_created = 0)')

  // 6. Teste de Notificação In-App
  const { data: inAppRes, error: inAppErr } = await supabase.rpc('process_notification_event', {
    p_event_name: 'church.child.checked_in',
    p_entity_type: 'child',
    p_entity_id: dummyEntityId,
    p_user_id: null,
    p_org_id: dummyEntityId,
    p_payload: {
      recipient_name: 'Responsável',
      organization_name: 'Igreja Central'
    }
  })
  assert(!inAppErr && inAppRes?.success && inAppRes?.deliveries_created >= 0, 'Notification Engine processa eventos de canal in-app')

  // 7. Teste de Pontes Institucionais (Igreja e Escola)
  const { data: churchBridge, error: churchErr } = await supabase.rpc('trigger_church_communication', {
    p_comm_id: dummyEntityId
  })
  assert(!churchErr && churchBridge && churchBridge.success === false, 'RPC trigger_church_communication ativa e validando comunicados da Igreja')

  const { data: schoolBridge, error: schoolErr } = await supabase.rpc('trigger_school_communication', {
    p_comm_id: dummyEntityId
  })
  assert(!schoolErr && schoolBridge && schoolBridge.success === false, 'RPC trigger_school_communication ativa e validando comunicados da Escola')

  // 8. Teste de Retry com Backoff
  const { data: retryRes, error: retryErr } = await supabase.rpc('retry_notification_delivery', {
    p_delivery_id: dummyEntityId
  })
  assert(!retryErr && retryRes && retryRes.success === false, 'RPC retry_notification_delivery ativa com validação de entrega e tentativas')

  // 9. Teste de Webhook de Provedores
  const { data: hookRes, error: hookErr } = await supabase.rpc('handle_provider_delivery_webhook', {
    p_provider: 'brevo',
    p_provider_msg_id: 'unknown-id',
    p_status: 'delivered'
  })
  assert(!hookErr && hookRes && hookRes.success === false, 'RPC handle_provider_delivery_webhook ativa e resiliente a mensagens desconhecidas')

  console.log('-----------------------------------------------------')
  console.log(`TOTAL DE TESTES FASE 8: ${passed + failed}`)
  console.log(`✅ APROVADOS: ${passed}`)
  console.log(`❌ FALHAS: ${failed}`)
  console.log('=====================================================')

  if (failed > 0) {
    process.exit(1)
  }
}

runPhase8Suite().catch(err => {
  console.error('Erro fatal ao rodar suite da Fase 8:', err)
  process.exit(1)
})
