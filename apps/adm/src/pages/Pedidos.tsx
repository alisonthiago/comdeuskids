import React, { useEffect, useState } from 'react'
import { ShoppingCart, Search, ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface Order {
  id: string
  order_number: string
  customer_name: string
  channel: string
  marketplace_id: string
  total: number
  status: string
  created_at: string
}

const CHANNEL_META: Record<string, { label:string; color:string; textColor:string }> = {
  mercado_livre: { label:'Mercado Livre', color:'#FFE600', textColor:'#111' },
  shopee:        { label:'Shopee',        color:'#EE4D2D', textColor:'#fff' },
  magalu:        { label:'Magalu',        color:'#0086FF', textColor:'#fff' },
  site:          { label:'Site',          color:'#7c3aed', textColor:'#fff' },
}

function fmtDate(d: string) {
  try {
    return new Date(d).toLocaleDateString('pt-BR', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })
  } catch { return d }
}
function fmtCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL' }).format(v)
}

export default function Pedidos() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    loadOrders()
    const ch = supabase
      .channel('orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => loadOrders())
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  async function loadOrders() {
    setLoading(true)
    const { data } = await supabase
      .from('orders')
      .select('id, order_number, customer_name, channel, marketplace_id, total, status, created_at')
      .order('created_at', { ascending: false })
      .limit(100)
    if (data) setOrders(data as Order[])
    setLoading(false)
  }

  const filtered = orders.filter(o => {
    const matchSearch = !search ||
      o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.order_number?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || o.status === statusFilter
    return matchSearch && matchStatus
  })

  const statuses = Array.from(new Set(orders.map(o => o.status).filter(Boolean)))

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 style={{ fontSize:22, fontWeight:700, color:'#111', margin:0 }}>Pedidos</h1>
          <p style={{ margin:'4px 0 0', fontSize:13, color:'#888' }}>
            {orders.length} pedidos — atualizados automaticamente via webhook
          </p>
        </div>
      </div>

      <div className="cdk-card" style={{ marginBottom:16, padding:'12px 16px' }}>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          <div style={{ position:'relative', flex:1, minWidth:200 }}>
            <Search size={15} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#aaa' }} />
            <input
              className="cdk-input"
              placeholder="Buscar cliente ou nº pedido…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft:36 }}
            />
          </div>
          <select
            className="cdk-select"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ width:'auto', minWidth:160 }}
          >
            <option value="">Todos os status</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="cdk-card-flush">
        {loading ? (
          <div style={{ padding:40, display:'flex', justifyContent:'center' }}><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><ShoppingCart size={22} /></div>
            <h3>{search || statusFilter ? 'Nenhum pedido encontrado' : 'Nenhum pedido ainda'}</h3>
            <p>Quando uma venda acontecer em qualquer canal, o pedido aparece aqui automaticamente.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Canal</th>
                <th>Total</th>
                <th>Status</th>
                <th>Data</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => {
                const meta = CHANNEL_META[order.channel || order.marketplace_id] || { label: order.channel || 'Desconhecido', color:'#e5e5e5', textColor:'#111' }
                return (
                  <tr key={order.id}>
                    <td style={{ fontWeight:600, fontFamily:'monospace', fontSize:13 }}>
                      #{order.order_number || order.id.slice(0,8)}
                    </td>
                    <td style={{ fontWeight:500 }}>{order.customer_name || '—'}</td>
                    <td>
                      <span style={{
                        display:'inline-block', fontSize:11.5, fontWeight:600,
                        background:meta.color, color:meta.textColor,
                        padding:'2px 8px', borderRadius:6
                      }}>
                        {meta.label}
                      </span>
                    </td>
                    <td style={{ fontWeight:600 }}>{fmtCurrency(order.total || 0)}</td>
                    <td>
                      <span className={`badge ${
                        ['paid','pago','entregue'].includes(order.status) ? 'badge-success' :
                        ['pending','aguardando','processando'].includes(order.status) ? 'badge-warning' :
                        ['cancelled','cancelado'].includes(order.status) ? 'badge-danger' : 'badge-neutral'
                      }`}>{order.status}</span>
                    </td>
                    <td style={{ fontSize:12.5, color:'#888' }}>{fmtDate(order.created_at)}</td>
                    <td>
                      <a href={`/admin/pedidos/${order.id}`} style={{ display:'flex', alignItems:'center', color:'#aaa' }}>
                        <ChevronRight size={16} />
                      </a>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
