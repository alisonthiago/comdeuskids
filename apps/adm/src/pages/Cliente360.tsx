import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  User,
  CreditCard,
  Package,
  Shield,
  Church,
  School,
  FileText,
  Clock,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Send,
  Plus
} from 'lucide-react'

interface CustomerProfile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: string
  organization_name: string | null
  created_at: string
}

interface SupportNote {
  id: string
  note: string
  category: string
  created_at: string
  author_admin_id: string
}

export default function Cliente360() {
  const { id } = useParams<{ id: string }>()
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [entitlements, setEntitlements] = useState<any[]>([])
  const [supportNotes, setSupportNotes] = useState<SupportNote[]>([])
  const [newNote, setNewNote] = useState('')
  const [newNoteCategory, setNewNoteCategory] = useState('general')
  const [loading, setLoading] = useState(true)
  const [savingNote, setSavingNote] = useState(false)

  const loadCustomerData = async () => {
    if (!id) return
    setLoading(true)
    try {
      // 1. Perfil
      const { data: profData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()
      if (profData) setProfile(profData)

      // 2. Pedidos
      const { data: ordData } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', id)
        .order('created_at', { ascending: false })
      if (ordData) setOrders(ordData)

      // 3. Assinaturas
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*, plans(name)')
        .eq('user_id', id)
      if (subData) setSubscriptions(subData)

      // 4. Entitlements
      const { data: entData } = await supabase
        .from('entitlements')
        .select('*')
        .eq('user_id', id)
      if (entData) setEntitlements(entData)

      // 5. Notas de Suporte
      const { data: notesData } = await supabase
        .from('customer_support_notes')
        .select('*')
        .eq('customer_user_id', id)
        .order('created_at', { ascending: false })
      if (notesData) setSupportNotes(notesData)
    } catch (err) {
      console.error('Erro ao carregar visão 360 do cliente:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCustomerData()
  }, [id])

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNote.trim() || !id) return
    setSavingNote(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      const adminId = userData.user?.id
      if (!adminId) throw new Error('Não autenticado')

      const { error } = await supabase.from('customer_support_notes').insert({
        customer_user_id: id,
        author_admin_id: adminId,
        note: newNote.trim(),
        category: newNoteCategory,
        is_private: true
      })

      if (!error) {
        setNewNote('')
        await loadCustomerData()
      }
    } catch (err: any) {
      alert(`Erro ao adicionar nota: ${err.message}`)
    } finally {
      setSavingNote(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
        <div className="spinner" style={{ margin: '0 auto 12px' }} />
        Carregando Visão 360 do Cliente...
      </div>
    )
  }

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1200, margin: '0 auto', fontFamily: 'inherit' }}>
      <div style={{ marginBottom: 20 }}>
        <Link to="/admin/clientes" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#64748b', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
          <ArrowLeft size={14} /> Voltar para Clientes
        </Link>
      </div>

      {/* HEADER DO CLIENTE 360 */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 24, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 22, fontWeight: 800
          }}>
            {(profile?.full_name || profile?.email || 'C').charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {profile?.full_name || 'Usuário Sem Nome'}
            </h1>
            <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>
              {profile?.email} • ID: <code style={{ fontSize: 11 }}>{id}</code>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <span style={{
            padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
            background: '#ede9fe', color: '#7c3aed', textTransform: 'uppercase'
          }}>
            {profile?.role || 'parent'}
          </span>
        </div>
      </div>

      {/* GRID COMERCIAL, ACESSOS E SUPORTE */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        {/* COLUNA ESQUERDA: ASSINATURAS, PEDIDOS E ENTITLEMENTS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* ASSINATURAS */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <CreditCard size={18} color="#7c3aed" /> Assinaturas Recorrentes
            </h3>
            {subscriptions.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>Nenhuma assinatura ativa encontrada.</p>
            ) : (
              subscriptions.map(s => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div>
                    <strong style={{ fontSize: 14, color: '#1e293b' }}>{s.plans?.name || 'Plano Padrão'}</strong>
                    <div style={{ fontSize: 12, color: '#64748b' }}>Período até {new Date(s.current_period_end).toLocaleDateString('pt-BR')}</div>
                  </div>
                  <span style={{
                    padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                    background: s.status === 'active' ? '#dcfce7' : '#fee2e2',
                    color: s.status === 'active' ? '#15803d' : '#b91c1c'
                  }}>
                    {s.status.toUpperCase()}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* ENTITLEMENTS / ACESSOS */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Shield size={18} color="#2563eb" /> Direitos de Acesso (Entitlements)
            </h3>
            {entitlements.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>Nenhum direito de acesso concedido.</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {entitlements.map(e => (
                  <span key={e.id} style={{
                    padding: '6px 12px', borderRadius: 8, background: '#f8fafc',
                    border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 600, color: '#334155'
                  }}>
                    ✓ {e.feature_key} ({e.status})
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* HISTÓRICO DE PEDIDOS */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Package size={18} color="#16a34a" /> Histórico de Pedidos
            </h3>
            {orders.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>Nenhum pedido registrado no Billing.</p>
            ) : (
              orders.map(o => (
                <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13 }}>
                  <div>
                    <strong>Pedido #{o.id.substring(0, 8)}</strong>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{new Date(o.created_at).toLocaleDateString('pt-BR')}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong>{((o.paid_amount_cents || o.total_amount_cents || 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                    <div style={{ fontSize: 11, color: o.status === 'paid' ? '#16a34a' : '#64748b' }}>{o.status}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUNA DIREITA: NOTAS DE SUPORTE INTERNAS (PRIVATIVAS) */}
        <div>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={18} color="#d97706" /> Notas de Atendimento
            </h3>
            <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 16px' }}>
              Notas confidenciais visíveis apenas para operadores do ADM.
            </p>

            <form onSubmit={handleAddNote} style={{ marginBottom: 20 }}>
              <textarea
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                placeholder="Registrar anotação de atendimento, solicitação ou nota técnica..."
                rows={3}
                style={{
                  width: '100%', boxSizing: 'border-box', padding: '10px 12px',
                  borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13,
                  fontFamily: 'inherit', resize: 'vertical', marginBottom: 8
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <select
                  value={newNoteCategory}
                  onChange={e => setNewNoteCategory(e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12 }}
                >
                  <option value="general">Geral</option>
                  <option value="billing">Financeiro / Cobrança</option>
                  <option value="technical">Suporte Técnico</option>
                  <option value="vip">Cliente VIP</option>
                  <option value="complaint">Reclamação</option>
                </select>

                <button
                  type="submit"
                  disabled={savingNote || !newNote.trim()}
                  style={{
                    padding: '6px 14px', borderRadius: 6, background: '#7c3aed',
                    color: '#fff', border: 'none', fontSize: 12, fontWeight: 700,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
                  }}
                >
                  <Plus size={14} /> Salvar
                </button>
              </div>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {supportNotes.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: 12, margin: 0, textAlign: 'center' }}>
                  Nenhuma anotação de suporte registrada.
                </p>
              ) : (
                supportNotes.map(n => (
                  <div key={n.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
                        {n.category}
                      </span>
                      <span style={{ fontSize: 10, color: '#94a3b8' }}>
                        {new Date(n.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: '#1e293b' }}>{n.note}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
