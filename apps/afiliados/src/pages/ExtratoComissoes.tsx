import React, { useState, useEffect } from 'react'
import { DollarSign, Clock, CheckCircle2, AlertCircle, Search, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '@comdeuskids/supabase'
import { useAuth } from '../hooks/useAuth'

export function ExtratoComissoes() {
  const { user } = useAuth()
  const [commissions, setCommissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCommissions() {
      if (!user) {
        setLoading(false)
        return
      }
      setLoading(true)

      const { data: aff } = await supabase
        .from('affiliates')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (aff) {
        const { data: comms } = await supabase
          .from('affiliate_commissions')
          .select(`
            id,
            order_amount,
            commission_amount,
            commission_rate,
            status,
            available_at,
            created_at,
            order_id,
            plan:plans (name),
            product:products (title)
          `)
          .eq('affiliate_id', aff.id)
          .order('created_at', { ascending: false })

        if (comms) {
          setCommissions(comms)
        }
      }
      setLoading(false)
    }

    loadCommissions()
  }, [user])

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', margin: '0 0 6px 0' }}>
          Extrato Detalhado de Comissões
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
          Todas as vendas atribuídas ao seu código com data de liberação do saldo.
        </p>
      </div>

      <div style={{ background: '#13141c', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            Carregando extrato de comissões...
          </div>
        ) : commissions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16, background: 'rgba(16, 185, 129, 0.12)',
              color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <DollarSign size={28} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
              Nenhuma comissão registrada ainda
            </h3>
            <p style={{ fontSize: 14, color: '#94a3b8', maxWidth: 460, margin: '0 auto 20px', lineHeight: 1.5 }}>
              Assim que uma família, professor ou igreja assinar através do seu link exclusivo, o extrato detalhado aparecerá aqui.
            </p>
            <Link
              to="/links"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                borderRadius: 8,
                background: '#10b981',
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: 13
              }}
            >
              <Sparkles size={16} /> Pegar Meus Links de Divulgação
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {commissions.map(c => {
              const itemTitle = c.plan?.name || c.product?.title || 'Assinatura Com Deus Kids'
              const dateStr = new Date(c.created_at).toLocaleDateString('pt-BR')
              const availDateStr = c.available_at ? new Date(c.available_at).toLocaleDateString('pt-BR') : ''
              return (
                <div
                  key={c.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)'
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', margin: '0 0 2px 0' }}>{itemTitle}</h4>
                    <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 4px 0' }}>
                      Venda: {dateStr} • Valor Venda: R$ {Number(c.order_amount).toFixed(2)} • Taxa: {c.commission_rate}%
                    </p>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      {c.status === 'available' ? 'Liberado para Saque' : c.status === 'paid' ? 'Pago via Pix' : `Liberação prevista: ${availDateStr}`}
                    </span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#34d399' }}>
                      + R$ {Number(c.commission_amount).toFixed(2)}
                    </div>
                    <span style={{
                      display: 'inline-block',
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      marginTop: '4px',
                      background: c.status === 'available' ? 'rgba(34, 197, 94, 0.2)' : c.status === 'paid' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: c.status === 'available' ? '#4ade80' : c.status === 'paid' ? '#60a5fa' : '#fbbf24'
                    }}>
                      {c.status === 'available' ? 'Disponível' : c.status === 'paid' ? 'Pago' : 'Em Carência'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
