import React, { useEffect, useState } from 'react'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CircleHelp,
  Clock3,
  FilePlus2,
  GraduationCap,
  Heart,
  LayoutDashboard,
  Users,
  DollarSign,
  TrendingUp,
  CreditCard,
  Building,
  School,
  Church,
  AlertTriangle,
  RefreshCw
} from 'lucide-react'
import { supabase } from '../lib/supabase'

interface DashboardMetrics {
  financial: {
    gross_revenue_cents: number
    discounts_cents: number
    refunds_cents: number
    net_revenue_cents: number
    mrr_cents: number
    orders_count: number
  }
  subscriptions: {
    active: number
    past_due: number
  }
  customers: {
    total_users: number
    families: number
    teachers: number
    churches: number
    schools: number
  }
  affiliates: {
    active_affiliates: number
    pending_commissions_cents: number
    pending_payouts_count: number
    pending_payouts_cents: number
  }
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  const loadMetrics = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.rpc('get_admin_dashboard_metrics')
      if (data && !error) {
        setMetrics(data as DashboardMetrics)
      }
    } catch (err) {
      console.error('Erro ao carregar métricas executivas:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMetrics()
  }, [])

  const formatCents = (cents: number = 0) => {
    return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1240, margin: '0 auto', fontFamily: 'inherit' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e1b4b', margin: 0 }}>
            Visão Geral Executiva <span>👋</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: '4px 0 0' }}>
            Dados consolidados em tempo real dos motores de Billing, Assinaturas, Afiliados e Organizações.
          </p>
        </div>
        <button
          onClick={loadMetrics}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 8,
            border: '1px solid #cbd5e1',
            background: '#fff',
            color: '#334155',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Atualizar
        </button>
      </div>

      {/* CARDS FINANCEIROS (Minor units sem float) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: 13, fontWeight: 600 }}>
            <span>Receita Bruta Paga</span>
            <DollarSign size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: '8px 0 4px' }}>
            {formatCents(metrics?.financial?.gross_revenue_cents)}
          </div>
          <div style={{ fontSize: 12, color: '#64748b' }}>
            {metrics?.financial?.orders_count || 0} pedidos pagos
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: 13, fontWeight: 600 }}>
            <span>MRR Recorrente</span>
            <TrendingUp size={18} color="#7c3aed" />
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#7c3aed', margin: '8px 0 4px' }}>
            {formatCents(metrics?.financial?.mrr_cents)}
          </div>
          <div style={{ fontSize: 12, color: '#64748b' }}>
            Apenas assinaturas mensais/anuais ativas
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: 13, fontWeight: 600 }}>
            <span>Assinaturas Ativas</span>
            <CreditCard size={18} color="#3b82f6" />
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: '8px 0 4px' }}>
            {metrics?.subscriptions?.active || 0}
          </div>
          <div style={{ fontSize: 12, color: metrics?.subscriptions?.past_due ? '#b91c1c' : '#64748b' }}>
            {metrics?.subscriptions?.past_due || 0} inadimplentes (past_due)
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: 13, fontWeight: 600 }}>
            <span>Saques de Afiliados</span>
            <AlertTriangle size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: '8px 0 4px' }}>
            {metrics?.affiliates?.pending_payouts_count || 0} pendentes
          </div>
          <div style={{ fontSize: 12, color: '#64748b' }}>
            {formatCents(metrics?.affiliates?.pending_payouts_cents)} a liberar
          </div>
        </div>
      </div>

      {/* CARDS DE PÚBLICO & CLIENTES POR CONTEXTO */}
      <h2 style={{ fontSize: 16, fontWeight: 700, color: '#334155', margin: '0 0 12px' }}>
        Clientes por Tipo & Contexto Operacional
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#7c3aed', fontWeight: 700, fontSize: 13 }}>
            <Users size={16} /> Famílias
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '8px 0 2px' }}>
            {metrics?.customers?.families || 0}
          </div>
          <span style={{ fontSize: 12, color: '#64748b' }}>Responsáveis com crianças</span>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#2563eb', fontWeight: 700, fontSize: 13 }}>
            <GraduationCap size={16} /> Professores
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '8px 0 2px' }}>
            {metrics?.customers?.teachers || 0}
          </div>
          <span style={{ fontSize: 12, color: '#64748b' }}>Educadores individuais</span>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#16a34a', fontWeight: 700, fontSize: 13 }}>
            <Church size={16} /> Igrejas
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '8px 0 2px' }}>
            {metrics?.customers?.churches || 0}
          </div>
          <span style={{ fontSize: 12, color: '#64748b' }}>Ministérios Infantis & EBD</span>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#d97706', fontWeight: 700, fontSize: 13 }}>
            <School size={16} /> Escolas
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '8px 0 2px' }}>
            {metrics?.customers?.schools || 0}
          </div>
          <span style={{ fontSize: 12, color: '#64748b' }}>Instituições de ensino</span>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#9333ea', fontWeight: 700, fontSize: 13 }}>
            <Users size={16} /> Afiliados
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '8px 0 2px' }}>
            {metrics?.affiliates?.active_affiliates || 0}
          </div>
          <span style={{ fontSize: 12, color: '#64748b' }}>Divulgadores ativos</span>
        </div>
      </div>

      {/* ATALHOS OPERACIONAIS */}
      <h2 style={{ fontSize: 16, fontWeight: 700, color: '#334155', margin: '0 0 12px' }}>
        Acesso Rápido aos Módulos Administrativos
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        <a href="/admin/pedidos" style={{ textDecoration: 'none', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#1e293b' }}>
          <div>
            <strong style={{ display: 'block', fontSize: 15 }}>Gestão de Pedidos</strong>
            <span style={{ fontSize: 12, color: '#64748b' }}>Faturas, estornos e checkout</span>
          </div>
          <ArrowRight size={18} color="#94a3b8" />
        </a>

        <a href="/admin/planos" style={{ textDecoration: 'none', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#1e293b' }}>
          <div>
            <strong style={{ display: 'block', fontSize: 15 }}>Planos & Preços</strong>
            <span style={{ fontSize: 12, color: '#64748b' }}>Configuração de ciclos e limites</span>
          </div>
          <ArrowRight size={18} color="#94a3b8" />
        </a>

        <a href="/admin/notificacoes" style={{ textDecoration: 'none', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#1e293b' }}>
          <div>
            <strong style={{ display: 'block', fontSize: 15 }}>Central de Notificações</strong>
            <span style={{ fontSize: 12, color: '#64748b' }}>Brevo, WhatsApp e automações</span>
          </div>
          <ArrowRight size={18} color="#94a3b8" />
        </a>

        <a href="/admin/clientes" style={{ textDecoration: 'none', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#1e293b' }}>
          <div>
            <strong style={{ display: 'block', fontSize: 15 }}>Central de Clientes 360</strong>
            <span style={{ fontSize: 12, color: '#64748b' }}>Usuários, entidades e suporte</span>
          </div>
          <ArrowRight size={18} color="#94a3b8" />
        </a>
      </div>
    </div>
  )
}
