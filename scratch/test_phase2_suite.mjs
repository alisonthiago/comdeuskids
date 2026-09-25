import { evaluateParentalPolicy, getLocalTimeInTimezone, formatRemainingTime } from '../apps/play/src/lib/parentalPolicy.ts'

console.log('====================================================')
console.log('TEST SUITE — FASE 2: CONTROLE PARENTAL & MOTOR CENTRAL')
console.log('====================================================\n')

let passedCount = 0
let failedCount = 0

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`)
    passedCount++
  } else {
    console.error(`❌ FAIL: ${message}`)
    failedCount++
  }
}

// 1. Adult Profile (Parent / Teacher / Leader) should NEVER be blocked
const parentProfile = {
  id: 'parent-1',
  user_id: 'user-1',
  name: 'Alison',
  avatar_url: 'alison',
  profile_type: 'parent',
  is_paused: true,
  daily_limit_minutes: 10,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

const parentRes = evaluateParentalPolicy(parentProfile, {
  activeSecondsToday: 999999,
  currentDate: new Date('2026-09-23T23:59:00Z') // late night
})
assert(parentRes.allowed === true, 'Perfil de pai/responsável NUNCA é bloqueado')

// 2. Sem Limite Diário (daily_limit_minutes = null)
const kidUnlimited = {
  id: 'kid-unlimited',
  user_id: 'user-1',
  name: 'Davi',
  avatar_url: 'davi',
  profile_type: 'kid',
  daily_limit_minutes: null, // SEM LIMITE
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

const resUnlimited = evaluateParentalPolicy(kidUnlimited, {
  activeSecondsToday: 20000, // 5.5 horas de uso
  currentDate: new Date('2026-09-23T14:00:00') // 14:00 (dia normal)
})
assert(resUnlimited.allowed === true && resUnlimited.remainingSeconds === null, 'daily_limit_minutes = NULL realmente NÃO bloqueia por tempo')

// 3. Limite Real (daily_limit_minutes = 120)
const kid120 = {
  id: 'kid-120',
  user_id: 'user-1',
  name: 'Sara',
  avatar_url: 'sara',
  profile_type: 'kid',
  daily_limit_minutes: 120, // 2 horas exatas
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

const resUnder120 = evaluateParentalPolicy(kid120, {
  activeSecondsToday: 119 * 60, // 119 minutos
  currentDate: new Date('2026-09-23T14:00:00')
})
assert(resUnder120.allowed === true && resUnder120.remainingSeconds === 60, 'daily_limit_minutes = 120 NÃO bloqueia com 119 minutos')

const resOver120 = evaluateParentalPolicy(kid120, {
  activeSecondsToday: 120 * 60, // 120 minutos
  currentDate: new Date('2026-09-23T14:00:00')
})
assert(resOver120.allowed === false && resOver120.reason === 'DAILY_LIMIT_REACHED', 'daily_limit_minutes = 120 BLOQUEIA ao atingir 120 minutos')

// 4. Pausa Temporária com Expiração Automática
const nowTime = new Date('2026-09-23T15:00:00Z')
const kidTempPauseActive = {
  id: 'kid-temp',
  user_id: 'user-1',
  name: 'Pedro',
  avatar_url: 'pedro',
  profile_type: 'kid',
  is_paused: true,
  paused_until: new Date('2026-09-23T15:30:00Z').toISOString(), // expira em 30 min
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

const resTempPauseActive = evaluateParentalPolicy(kidTempPauseActive, { currentDate: nowTime })
assert(resTempPauseActive.allowed === false && resTempPauseActive.reason === 'TEMPORARY_PAUSED', 'Pausa temporária ativa bloqueia o perfil')

const resTempPauseExpired = evaluateParentalPolicy(kidTempPauseActive, {
  currentDate: new Date('2026-09-23T15:31:00Z') // 1 minuto após expirar
})
assert(resTempPauseExpired.allowed === true && resTempPauseExpired.effectivePaused === false, 'Pausa temporária expirada DESBLOQUEIA o perfil automaticamente')

// 5. Horário de Dormir (Bedtime Window)
const kidBedtime = {
  id: 'kid-bed',
  user_id: 'user-1',
  name: 'Davi',
  avatar_url: 'davi',
  profile_type: 'kid',
  allowed_start_time: '07:00',
  allowed_end_time: '21:00',
  timezone: 'America/Sao_Paulo',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

// 21:30 em São Paulo
const nightDate = new Date('2026-09-23T21:30:00-03:00')
const resBedtimeNight = evaluateParentalPolicy(kidBedtime, { currentDate: nightDate })
assert(resBedtimeNight.allowed === false && resBedtimeNight.reason === 'BEDTIME_WINDOW', 'Bedtime bloqueia após o horário de dormir')

// 10:00 em São Paulo
const dayDate = new Date('2026-09-23T10:00:00-03:00')
const resBedtimeDay = evaluateParentalPolicy(kidBedtime, { currentDate: dayDate })
assert(resBedtimeDay.allowed === true && resBedtimeDay.isBedtime === false, 'Bedtime permite acesso dentro da janela permitida')

// 6. Dias Permitidos da Semana
const kidDays = {
  id: 'kid-days',
  user_id: 'user-1',
  name: 'Sara',
  avatar_url: 'sara',
  profile_type: 'kid',
  allowed_days: ['seg', 'qua', 'sex'], // Apenas Seg, Qua, Sex
  timezone: 'America/Sao_Paulo',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

// 2026-09-23 é Quarta-feira ('qua')
const wednesdayDate = new Date('2026-09-23T12:00:00-03:00')
const resWed = evaluateParentalPolicy(kidDays, { currentDate: wednesdayDate })
assert(resWed.allowed === true, 'Dia permitido (Quarta) é aceito')

// 2026-09-24 é Quinta-feira ('qui')
const thursdayDate = new Date('2026-09-24T12:00:00-03:00')
const resThu = evaluateParentalPolicy(kidDays, { currentDate: thursdayDate })
assert(resThu.allowed === false && resThu.reason === 'DAY_NOT_ALLOWED', 'Dia não permitido (Quinta) é bloqueado')

// 7. Modo Educativo Estrito (strict_educational_only)
const kidEducational = {
  id: 'kid-edu',
  user_id: 'user-1',
  name: 'Lucas',
  avatar_url: 'davi',
  profile_type: 'kid',
  strict_educational_only: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

const resEduContent = evaluateParentalPolicy(kidEducational, {
  contentAccessClass: 'educational',
  currentDate: dayDate
})
assert(resEduContent.allowed === true, 'Modo Educativo permite conteúdo classificado como educational')

const resGeneralContent = evaluateParentalPolicy(kidEducational, {
  contentAccessClass: 'general',
  currentDate: dayDate
})
assert(resGeneralContent.allowed === false && resGeneralContent.reason === 'EDUCATIONAL_ONLY_RESTRICTION', 'Modo Educativo bloqueia conteúdo general')

// 8. Timezone customizado
const { timeString: tzSP } = getLocalTimeInTimezone(new Date('2026-09-23T18:00:00Z'), 'America/Sao_Paulo')
const { timeString: tzNY } = getLocalTimeInTimezone(new Date('2026-09-23T18:00:00Z'), 'America/New_York')
const { timeString: tzUTC } = getLocalTimeInTimezone(new Date('2026-09-23T18:00:00Z'), 'UTC')
assert(tzSP === '15:00', `Timezone America/Sao_Paulo converte 18:00Z para 15:00 (obtido: ${tzSP})`)
assert(tzNY === '14:00', `Timezone America/New_York converte 18:00Z para 14:00 (obtido: ${tzNY})`)
assert(tzUTC === '18:00', `Timezone UTC mantém 18:00 (obtido: ${tzUTC})`)

console.log(`\n====================================================`)
console.log(`RESULTADO DO TESTE: ${passedCount} PASSARAM, ${failedCount} FALHARAM`)
console.log('====================================================')

if (failedCount > 0) process.exit(1)
