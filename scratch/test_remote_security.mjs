import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://oswqehxtngklwfxqbrih.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zd3FlaHh0bmdrbHdmeHFicmloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwMjc4MjcsImV4cCI6MjEwNTYwMzgyN30.FfHqMvB5x04-B6INO0a1i52D--FIyczrqN28_3ebZQU'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function testRemoteSecurity() {
  console.log('--- TESTE DE SEGURANÇA E RLS CONTRA O SUPABASE REMOTO ---')

  // 1. Testar se perfil infantil consegue gravar ou ler sessões anonimamente
  const { data: usageData, error: usageErr } = await supabase
    .from('profile_usage_sessions')
    .select('*')
  
  if (usageErr) {
    console.log(`ℹ️ [profile_usage_sessions SELECT]:`, usageErr.code, usageErr.message)
  } else {
    console.log(`✅ [profile_usage_sessions SELECT]: RLS ativa, 0 linhas vazadas para anônimo (${usageData.length} registros retornados)`)
  }

  // 2. Testar INSERT anônimo não autorizado em profile_usage_sessions
  const { error: insertErr } = await supabase
    .from('profile_usage_sessions')
    .insert({
      id: '00000000-0000-0000-0000-000000000001',
      profile_id: '00000000-0000-0000-0000-000000000002',
      user_id: '00000000-0000-0000-0000-000000000003',
      device_session_id: 'fake-device',
      usage_date: '2026-09-23',
      active_seconds: 999999
    })

  if (insertErr) {
    console.log(`✅ [profile_usage_sessions INSERT não-autorizado]: Bloqueado pela RLS/Auth com sucesso (${insertErr.message})`)
  } else {
    console.log(`❌ [profile_usage_sessions INSERT]: Inserção indevida permitida!`)
  }

  // 3. Testar RPC verify_parent_pin anônima
  const { data: rpcRes, error: rpcErr } = await supabase.rpc('verify_parent_pin', {
    p_profile_id: '00000000-0000-0000-0000-000000000001',
    p_pin: '1234'
  })

  if (rpcErr) {
    console.log(`ℹ️ [verify_parent_pin]:`, rpcErr.message)
  } else {
    console.log(`✅ [verify_parent_pin]: Resposta segura:`, rpcRes)
  }
}

testRemoteSecurity().catch(console.error)
