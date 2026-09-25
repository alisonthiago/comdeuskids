import React, { useEffect, useState } from 'react'
import { TrendingUp, DollarSign, ArrowUpRight } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface FinData {
  totalRevenue: number
  byChannel: { channel: string; revenue: number; orders: number }[]
  recentTransactions: { id:string; description:string; amount:number; type:string; date:string }[]
}

const CHANNEL_META: Record<string,{label:string;color:string}> = {
  mercado_livre:{label:'Mercado Livre',color:'#FFE600'},
  shopee:{label:'Shopee',color:'#EE4D2D'},
  magalu:{label:'Magalu',color:'#0086FF'},
  site:{label:'Site',color:'#7c3aed'},
}

export default function Financeiro() {
  const [data, setData] = useState<FinData>({ totalRevenue:0, byChannel:[], recentTransactions:[] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFinanceiro()
    const ch = supabase.channel('fin-realtime')
      .on('postgres_changes', { event:'*', schema:'public', table:'orders' }, () => loadFinanceiro())
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  async function loadFinanceiro() {
    setLoading(true)
    try {
      const { data: orders } = await supabase
        .from('orders')
        .select('id, channel, total, status, created_at, customer_name')
        .in('status', ['paid','pago','entregue','completed'])
        .order('created_at', { ascending: false })

      if (orders) {
        const total = orders.reduce((s,o) => s+(o.total||0), 0)
        const byChannel = Object.entries(
          orders.reduce((acc:Record<string,{revenue:number;orders:number}>, o) => {
            const ch = o.channel || 'site'
            if (!acc[ch]) acc[ch] = { revenue:0, orders:0 }
            acc[ch].revenue += o.total || 0
            acc[ch].orders++
            return acc
          }, {})
        ).map(([channel, v]) => ({ channel, ...v }))
          .sort((a,b) => b.revenue - a.revenue)

        setData({
          totalRevenue: total,
          byChannel,
          recentTransactions: orders.slice(0,10).map(o => ({
            id: o.id,
            description: `Venda - ${o.customer_name || 'Cliente'}`,
            amount: o.total || 0,
            type: 'credit',
            date: o.created_at
          }))
        })
      }
    } catch {}
    setLoading(false)
  }

  const fmtR = (v:number) => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v)
  const fmtDate = (d:string) => {
    try { return new Date(d).toLocaleDateString('pt-BR') } catch { return d }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 style={{ fontSize:22, fontWeight:700, color:'#111', margin:0 }}>Financeiro</h1>
          <p style={{ margin:'4px 0 0', fontSize:13, color:'#888' }}>Receita consolidada de todos os canais</p>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px,1fr))', gap:16, marginBottom:24 }}>
        <div className="stat-card">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div className="stat-card-label">Receita Total</div>
            <div className="stat-card-icon" style={{ background:'#ecfdf5' }}>
              <TrendingUp size={20} color="#00a650" />
            </div>
          </div>
          <div className="stat-card-value">{loading ? '—' : fmtR(data.totalRevenue)}</div>
          <div className="stat-card-sub">Pedidos pagos</div>
        </div>
        {data.byChannel.map(ch => {
          const meta = CHANNEL_META[ch.channel]
          return (
            <div key={ch.channel} className="stat-card">
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div className="stat-card-label">{meta?.label || ch.channel}</div>
                <div className="stat-card-icon" style={{ background: meta?.color ? `${meta.color}22` : '#f4f4f4' }}>
                  <DollarSign size={18} color={meta?.color || '#888'} />
                </div>
              </div>
              <div className="stat-card-value">{fmtR(ch.revenue)}</div>
              <div className="stat-card-sub">{ch.orders} pedidos</div>
            </div>
          )
        })}
      </div>

      <h2 style={{ fontSize:16, fontWeight:700, color:'#111', marginBottom:12 }}>Transações Recentes</h2>
      <div className="cdk-card-flush">
        {loading ? (
          <div style={{ padding:40, display:'flex', justifyContent:'center' }}><div className="spinner" /></div>
        ) : data.recentTransactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><DollarSign size={22} /></div>
            <h3>Nenhuma transação ainda</h3>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Valor</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {data.recentTransactions.map(tx => (
                <tr key={tx.id}>
                  <td style={{ fontWeight:500 }}>{tx.description}</td>
                  <td style={{ fontWeight:700, color:'#00a650' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                      <ArrowUpRight size={14} />
                      {fmtR(tx.amount)}
                    </div>
                  </td>
                  <td style={{ fontSize:13, color:'#888' }}>{fmtDate(tx.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
