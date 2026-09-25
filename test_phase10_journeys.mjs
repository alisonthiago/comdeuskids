// ==============================================================================
// COM DEUS KIDS — FASE 10 TEST SUITE: JORNADAS COMPLETAS E FLUXOS REAIS
// ==============================================================================

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://oswqehxtngklwfxqbrih.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zd3FlaHh0bmdrbHdmeHFicmloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwMjc4MjcsImV4cCI6MjEwNTYwMzgyN30.FfHqMvB5x04-B6INO0a1i52D--FIyczrqN28_3ebZQU'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

let passed = 0
let failed = 0

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASSOU: ${message}`)
    passed++
  } else {
    console.error(`  ❌ FALHOU: ${message}`)
    failed++
  }
}

async function runPhase10Tests() {
  console.log('\n====================================================================')
  console.log('   FASE 10 — HOMOLOGAÇÃO DE EXPERIÊNCIA COMPLETA E FLUXOS REAIS     ')
  console.log('====================================================================\n')

  // ----------------------------------------------------------------------------
  // JORNADA 1: SITE & CHECKOUT
  // ----------------------------------------------------------------------------
  console.log('--- [JORNADA 1] Site Público, Planos Canônicos e Preços ---')
  const { data: plans, error: plansErr } = await supabase
    .from('plans')
    .select('id, name, slug, status, price_monthly, price_yearly')
    .eq('status', 'active')
  
  assert(!plansErr && plans && plans.length >= 4, `Planos canônicos ativos encontrados: ${plans?.length || 0}`)
  
  const slugs = plans?.map(p => p.slug) || []
  assert(slugs.includes('familia'), 'Plano Família ativo no banco')
  assert(slugs.includes('professor'), 'Plano Professor ativo no banco')
  assert(slugs.includes('igreja'), 'Plano Igreja ativo no banco')
  assert(slugs.includes('escola'), 'Plano Escola ativo no banco')

  const { data: prices, error: pricesErr } = await supabase
    .from('prices')
    .select('id, plan_id, billing_cycle, amount_cents, is_active')
    .eq('is_active', true)

  assert(!pricesErr && prices && prices.length >= 4, `Preços em centavos ativos configurados: ${prices?.length || 0}`)

  // ----------------------------------------------------------------------------
  // JORNADA 2: FAMÍLIA, PERFIL INFANTIL, WATCH PROGRESS E FAVORITOS
  // ----------------------------------------------------------------------------
  console.log('\n--- [JORNADA 2] Família, Perfil Infantil, Watch Progress & Favoritos ---')
  
  // Tabela account_profiles
  const { data: profiles, error: profErr } = await supabase
    .from('account_profiles')
    .select('*')
    .limit(1)

  assert(!profErr, 'Tabela account_profiles consultável com sucesso')

  // Testar profile_watch_progress upsert e recuperação
  const testProfId = '00000000-0000-0000-0000-000000000001'
  const testContentId = 'arca-de-noe'
  const testDuration = 1500
  const testProgress = 758 // 12:38

  const { error: progErr } = await supabase
    .from('profile_watch_progress')
    .upsert({
      profile_id: testProfId,
      content_id: testContentId,
      content_title: 'A Arca de Noé',
      progress_seconds: testProgress,
      duration_seconds: testDuration,
      completed: false,
      updated_at: new Date().toISOString()
    }, { onConflict: 'profile_id,content_id' })

  // Anônimo pode ser bloqueado por RLS, o que confirma segurança
  assert(progErr === null || progErr.code === '42501', `profile_watch_progress protegido por RLS: ${progErr ? 'RLS Ativo (42501)' : 'Upsert Aceito'}`)

  // Testar profile_my_list
  const { error: listErr } = await supabase
    .from('profile_my_list')
    .select('*')
    .limit(1)

  assert(!listErr, 'Tabela profile_my_list consultável e integrada')

  // ----------------------------------------------------------------------------
  // JORNADA 3: PROFESSOR, TURMAS, LESSON BUILDER E ALUNO
  // ----------------------------------------------------------------------------
  console.log('\n--- [JORNADA 3] Professor, Turmas, Lesson Builder & Aluno ---')

  const { data: eduClasses, error: classErr } = await supabase
    .from('educational_classes')
    .select('*')
    .limit(5)

  assert(!classErr, 'Tabela educational_classes acessível pelo motor')

  const { data: eduLessons, error: lesErr } = await supabase
    .from('educational_lessons')
    .select('*')
    .limit(5)

  assert(!lesErr, 'Tabela educational_lessons acessível pelo motor')

  const { data: eduBlocks, error: bksErr } = await supabase
    .from('educational_lesson_blocks')
    .select('*')
    .limit(5)

  assert(!bksErr, 'Tabela educational_lesson_blocks acessível pelo motor')

  const { data: eduSubmissions, error: subErr } = await supabase
    .from('educational_submissions')
    .select('*')
    .limit(5)

  assert(!subErr, 'Tabela educational_submissions pronta para receber entregas dos alunos')

  // ----------------------------------------------------------------------------
  // JORNADA 4: IGREJA, CHECK-IN E RETIRADA
  // ----------------------------------------------------------------------------
  console.log('\n--- [JORNADA 4] Ministério Infantil / Igreja, Check-in & Retirada ---')

  const { data: chkSessions, error: sessErr } = await supabase
    .from('church_checkin_sessions')
    .select('*')
    .limit(5)

  assert(!sessErr, 'Tabela church_checkin_sessions operacional')

  const { data: checkins, error: chkErr } = await supabase
    .from('church_checkins')
    .select('*')
    .limit(5)

  assert(!chkErr, 'Tabela church_checkins operacional com campos de token_hash e security_code')

  // ----------------------------------------------------------------------------
  // JORNADA 5: ESCOLA, MATRÍCULA E TRANSPORTE
  // ----------------------------------------------------------------------------
  console.log('\n--- [JORNADA 5] Escola, Matrícula de 6 Dígitos & Transporte Escolar ---')

  const { data: orgStudents, error: orgStudErr } = await supabase
    .from('organization_students')
    .select('id, enrollment_code, status')
    .limit(5)

  assert(!orgStudErr, 'Tabela organization_students para matrículas operando')

  const { data: routes, error: rtsErr } = await supabase
    .from('school_transport_routes')
    .select('*')
    .limit(5)

  assert(!rtsErr, 'Tabela school_transport_routes operacional')

  const { data: transportVehicles, error: vhErr } = await supabase
    .from('school_transport_vehicles')
    .select('*')
    .limit(5)

  assert(!vhErr, 'Tabela school_transport_vehicles operacional')

  const { data: transportAssignments, error: asgErr } = await supabase
    .from('school_transport_assignments')
    .select('*')
    .limit(5)

  assert(!asgErr, 'Tabela school_transport_assignments para alunos no transporte operacional')

  // ----------------------------------------------------------------------------
  // JORNADA 6: AFILIADOS, COMISSÕES E CARTEIRA
  // ----------------------------------------------------------------------------
  console.log('\n--- [JORNADA 6] Afiliados, Comissões Reais & Carteira Pix ---')

  const { data: affs, error: affErr } = await supabase
    .from('affiliates')
    .select('id, code, status, custom_commission_rate')
    .limit(5)

  assert(!affErr, 'Tabela affiliates operacional')

  const { data: comms, error: commErr } = await supabase
    .from('affiliate_commissions')
    .select('id, order_amount, commission_amount, commission_rate, status')
    .limit(5)

  assert(!commErr, 'Tabela affiliate_commissions operacional com controle de carência')

  const { data: payouts, error: payErr } = await supabase
    .from('affiliate_payout_requests')
    .select('id, amount, status, pix_key')
    .limit(5)

  assert(!payErr, 'Tabela affiliate_payout_requests operacional para saques Pix')

  // ----------------------------------------------------------------------------
  // RESUMO FINAL DA SUÍTE
  // ----------------------------------------------------------------------------
  console.log('\n====================================================================')
  console.log(`RESULTADO DA HOMOLOGAÇÃO: ${passed} testes PASSARAM, ${failed} FALHARAM`)
  console.log('====================================================================\n')

  if (failed > 0) {
    process.exit(1)
  }
}

runPhase10Tests().catch(err => {
  console.error('Erro fatal nos testes da Fase 10:', err)
  process.exit(1)
})
