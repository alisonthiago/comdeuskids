import React, { useState, useEffect } from 'react'
import { supabase } from '@comdeuskids/supabase'
import { useAuth } from '../../hooks/useAuth'

export function Assinatura() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [canceling, setCanceling] = useState(false)
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      if (!user) {
        setLoading(false)
        return
      }
      setLoading(true)
      const { data } = await supabase
        .from('subscriptions')
        .select('*, plans(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      setSubscription(data)
      setLoading(false)
    }
    load()
  }, [user])

  const handleCancelAtPeriodEnd = async () => {
    if (!subscription) return
    setCanceling(true)
    const { data, error } = await supabase.rpc('handle_subscription_cancellation', {
      p_subscription_id: subscription.id,
      p_cancel_at_period_end: true,
      p_reason: 'Cancelamento solicitado pelo usuário na Área de Membros'
    })
    setCanceling(false)

    if (!error && data?.success) {
      setSubscription({ ...subscription, cancel_at_period_end: true })
      setActionMessage('Cancelamento agendado.')
    }
  }

  if (loading) return <div>Carregando...</div>

  return (
    <div>
      <h1>Assinatura e Plano</h1>
      <p>Gerenciamento da assinatura familiar.</p>

      {actionMessage && <div>{actionMessage}</div>}

      <div>
        <p><strong>Plano:</strong> {subscription?.plans?.name || 'Plano Família'}</p>
        <p><strong>Status:</strong> {subscription?.status || 'Ativo'}</p>
        {subscription?.cancel_at_period_end && <p>Cancelamento agendado ao fim do período.</p>}
        {subscription && !subscription.cancel_at_period_end && (
          <button onClick={handleCancelAtPeriodEnd} disabled={canceling}>
            {canceling ? 'Processando...' : 'Cancelar Assinatura'}
          </button>
        )}
      </div>
    </div>
  )
}

export default Assinatura
