import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  DollarSign,
  TrendingUp,
  Wallet,
  Clock,
  ArrowRight,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { supabase } from '@comdeuskids/supabase'
import { useAuth } from '../hooks/useAuth'

export function Dashboard() {
  const { user } = useAuth()
  const [affiliate, setAffiliate] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    pendingBalance: 0.00,
    availableBalance: 0.00,
    paidBalance: 0.00,
    totalSales: 0
  })

  useEffect(() => {
    async function loadAffiliate() {
      if (!user) {
        setLoading(false)
        return
      }
      setLoading(true)

      const { data } = await supabase
        .from('affiliates')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (data) {
        setAffiliate(data)

        // Buscar comissões reais da fonte canônica (affiliate_commissions)
        const { data: comms } = await supabase
          .from('affiliate_commissions')
          .select('status, commission_amount')
          .eq('affiliate_id', data.id)

        if (comms && comms.length > 0) {
          let pend = 0
          let avail = 0
          let paid = 0
          comms.forEach(c => {
            const val = Number(c.commission_amount || 0)
            if (c.status === 'pending') pend += val
            else if (c.status === 'available') avail += val
            else if (c.status === 'paid') paid += val
          })
          setStats({
            pendingBalance: pend,
            availableBalance: avail,
            paidBalance: paid,
            totalSales: comms.length
          })
        } else {
          setStats({
            pendingBalance: 0,
            availableBalance: 0,
            paidBalance: 0,
            totalSales: 0
          })
        }
      } else {
        setAffiliate(null)
      }
      setLoading(false)
    }
    loadAffiliate()
  }, [user])

  const handleCreateAffiliate = async () => {
    if (!user) return
    const code = 'CDK-' + Math.random().toString(36).substring(2, 7).toUpperCase()
    const { data, error } = await supabase
      .from('affiliates')
      .insert({
        user_id: user.id,
        code,
        status: 'active',
        custom_commission_rate: 20
      })
      .select()
      .single()

    if (data) {
      setAffiliate(data)
    }
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', margin: '0 0 6px 0' }}>
            Portal do Afiliado Com Deus Kids
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
            Acompanhe suas vendas, comissões em carência e solicite saques via Pix com rapidez e transparência.
          </p>
        </div>

        <Link
          to="/carteira"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#fff',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: 700
          }}
        >
          <Wallet size={16} /> Solicitar Saque Pix
        </Link>
      </div>

      {/* Cards Financeiros Estilo Kiwify */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {/* Saldo Disponível */}
        <div style={{ background: '#13141c', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '14px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', color: '#34d399', fontWeight: 700 }}>Saldo Disponível</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wallet size={18} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#fff' }}>
            R$ {stats.availableBalance.toFixed(2)}
          </div>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Pronto para saque via Pix</span>
        </div>

        {/* Saldo Pendente (Carência) */}
        <div style={{ background: '#13141c', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '14px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', color: '#fbbf24', fontWeight: 700 }}>Saldo Pendente</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={18} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#fff' }}>
            R$ {stats.pendingBalance.toFixed(2)}
          </div>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Carência de segurança (D+15)</span>
        </div>

        {/* Total Já Pago */}
        <div style={{ background: '#13141c', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>Total Recebido</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.06)', color: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#fff' }}>
            R$ {stats.paidBalance.toFixed(2)}
          </div>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Saques pagos com sucesso</span>
        </div>

        {/* Total de Vendas */}
        <div style={{ background: '#13141c', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>Vendas Realizadas</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#fff' }}>
            {stats.totalSales} vendas
          </div>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Comissão média: 20%</span>
        </div>
      </div>

      {/* Caixa do Código de Afiliado Rápido ou Ativação */}
      {!affiliate ? (
        <div style={{
          background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(16, 185, 129, 0.15))',
          border: '1px solid rgba(124, 58, 237, 0.3)',
          borderRadius: '14px',
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Parceria Com Deus Kids
            </span>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', margin: '4px 0' }}>
              Ative sua conta de Afiliado Oficial
            </h3>
            <p style={{ fontSize: '13px', color: '#cbd5e1', margin: 0 }}>
              Gere seu link exclusivo agora e ganhe até 20% de comissão por cada família ou igreja que assinar.
            </p>
          </div>
          <button
            onClick={handleCreateAffiliate}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              background: '#10b981',
              color: '#fff',
              border: 'none',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Ativar Meu Código Agora
          </button>
        </div>
      ) : (
        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(59, 130, 246, 0.1))',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '14px',
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Seu Código Exclusivo
            </span>
            <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', margin: '4px 0' }}>
              {affiliate.code}
            </h3>
            <p style={{ fontSize: '13px', color: '#cbd5e1', margin: 0 }}>
              Utilize em cultos, redes sociais e grupos de WhatsApp para receber comissões automáticas.
            </p>
          </div>

          <Link
            to="/links"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '8px',
              background: '#10b981',
              color: '#fff',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 700
            }}
          >
            <QrCode size={16} /> Ver Meus Links & QR Code
          </Link>
        </div>
      )}

      {/* Como Funciona a Operação (Kiwify Model) */}
      <div style={{ background: '#13141c', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={18} color="#10b981" /> Regras Claras do Programa de Afiliados
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#fff', margin: '0 0 6px 0' }}>1. Atribuição de 60 Dias</h4>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
              Quando a família clica no seu link, o cookie fica ativo por 60 dias. Se comprar nesse período, a comissão é sua!
            </p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#fff', margin: '0 0 6px 0' }}>2. Carência Antifraude (D+15)</h4>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
              O saldo fica "Pendente" durante a janela de garantia legal (15 dias). Após esse prazo, é liberado como "Disponível".
            </p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#fff', margin: '0 0 6px 0' }}>3. Saque Direto no Pix</h4>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
              Solicite saque a partir de R$ 100,00 nos dias permitidos configurados no ADM (Segundas e Quintas).
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
