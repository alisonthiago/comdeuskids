import { supabase } from '@comdeuskids/supabase'
import { AccountProfile } from '@comdeuskids/types'

export interface PinVerifyResult {
  success: boolean
  error?: string
  locked_until?: string
  attempts_remaining?: number
  migrated?: boolean
}

export interface PinSetResult {
  success: boolean
  error?: string
}

/**
 * Verifica o PIN parental com RPC segura no Supabase.
 * - NUNCA aceita fallback universal 1234
 * - NUNCA expõe hash no frontend
 * - Migra gradualmente perfis com PIN legado em texto puro para hash bcrypt
 */
export async function verifyParentPin(
  profileId: string,
  pin: string
): Promise<PinVerifyResult> {
  if (!profileId || !pin) {
    return { success: false, error: 'PIN_REQUIRED' }
  }

  try {
    const { data, error } = await supabase.rpc('verify_parent_pin', {
      p_profile_id: profileId,
      p_pin: pin
    })

    if (error) {
      // Se a RPC ainda não estiver instalada (ex: offline temporário), checagem defensiva de fallback
      console.warn('RPC verify_parent_pin error:', error.message)
      return { success: false, error: error.message }
    }

    return (data as PinVerifyResult) || { success: false, error: 'UNKNOWN_ERROR' }
  } catch (err: any) {
    return { success: false, error: err?.message || 'NETWORK_ERROR' }
  }
}

/**
 * Cria ou altera o PIN parental de forma segura.
 * Requer o PIN atual se já houver um cadastrado.
 */
export async function setParentPin(
  profileId: string,
  newPin: string,
  currentPin?: string
): Promise<PinSetResult> {
  if (!newPin || !/^[0-9]{4,6}$/.test(newPin)) {
    return { success: false, error: 'O PIN deve conter de 4 a 6 dígitos numéricos.' }
  }

  try {
    const { data, error } = await supabase.rpc('set_parent_pin', {
      p_profile_id: profileId,
      p_current_pin: currentPin || '',
      p_new_pin: newPin
    })

    if (error) {
      return { success: false, error: error.message }
    }

    const res = data as PinSetResult
    if (!res.success) {
      if (res.error === 'INVALID_CURRENT_PIN') {
        return { success: false, error: 'PIN atual incorreto.' }
      }
      if (res.error === 'CURRENT_PIN_REQUIRED') {
        return { success: false, error: 'Informe o PIN atual para realizar a troca.' }
      }
      return { success: false, error: res.error || 'Erro ao definir PIN.' }
    }

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Falha de comunicação com o servidor.' }
  }
}

/**
 * Verifica se o perfil ou a família já possui PIN configurado
 */
export function hasParentPinConfigured(profile: AccountProfile | null): boolean {
  if (!profile) return false
  return !!(profile.pin_hash || profile.pin)
}
