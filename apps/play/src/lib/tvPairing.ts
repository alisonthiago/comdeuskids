import { supabase } from '@comdeuskids/supabase'

export interface TVPairingSession {
  code: string
  device_token: string
  expires_at: string
  status: 'pending' | 'authorized' | 'expired' | 'invalid'
}

export interface TVPairingResult {
  session: TVPairingSession | null
  error?: string
  needsMigration?: boolean
}

/** Pareamento persistente: celular e TV conversam exclusivamente pelo Supabase (tabela tv_pairing_sessions). */
export const tvPairingService = {
  async createSession(deviceName = 'Smart TV'): Promise<TVPairingResult> {
    try {
      const { data, error } = await supabase.rpc('create_tv_pairing_session', { p_device_name: deviceName })
      if (error) {
        if (error.code === 'PGRST202') {
          return { session: null, error: 'Migration pendente', needsMigration: true }
        }
        return { session: null, error: error.message }
      }
      return { session: data as TVPairingSession }
    } catch (err: any) {
      return { session: null, error: err?.message || 'Erro de rede' }
    }
  },

  async authorizeSession(code: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.rpc('approve_tv_pairing_session', { p_code: code })
      if (error) {
        return { success: false, error: error.message }
      }
      return data || { success: false, error: 'UNKNOWN_ERROR' }
    } catch (err: any) {
      return { success: false, error: err?.message || 'Falha de comunicação' }
    }
  }
}
