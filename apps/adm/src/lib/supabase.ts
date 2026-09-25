import { createClient } from '@supabase/supabase-js'

// ⚠️  SOMENTE a chave anon (pública) vai para o frontend.
// A service_role key NUNCA deve ser usada no browser —
// ela bypass o RLS e dá acesso irrestrito ao banco.
// Operações privilegiadas devem acontecer em Edge Functions
// autenticadas no servidor.

const supabaseUrl  = 'https://oswqehxtngklwfxqbrih.supabase.co'
const supabaseAnon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zd3FlaHh0bmdrbHdmeHFicmloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwMjc4MjcsImV4cCI6MjEwNTYwMzgyN30.FfHqMvB5x04-B6INO0a1i52D--FIyczrqN28_3ebZQU'

export const supabase = createClient(supabaseUrl, supabaseAnon)
export default supabase
