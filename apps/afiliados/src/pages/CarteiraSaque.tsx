import React, { useState, useEffect } from 'react'
import {
  Wallet,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Save,
  Send,
  ShieldCheck,
  KeyRound
} from 'lucide-react'
import { supabase } from '@comdeuskids/supabase'
import { useAuth } from '../hooks/useAuth'

export function CarteiraSaque() {
  const { user } = useAuth()
  const [affiliateId, setAffiliateId] = useState<string | null>(null)
  const [availableBalance, setAvailableBalance] = useState(0.00)
  const [pendingBalance, setPendingBalance] = useState(0.00)

  // Dados Pix
  const [pixType, setPixType] = useState('cpf')
  const [pixKey, setPixKey] = useState('')
  const [holderName, setHolderName] = useState('')
  const [holderDoc, setHolderDoc] = useState('')
  const [savingPix, setSavingPix] = useState(false)
  const [pixFeedback, setPixFeedback] = useState<string | null>(null)

  // Solicitação de Saque
  const [withdrawAmount, setWithdrawAmount] = useState<number>(100.00)
  const [requestingWithdraw, setRequestingWithdraw] = useState(false)
  const [withdrawFeedback, setWithdrawFeedback] = useState<string | null>(null)
  const [withdrawError, setWithdrawError] = useState<string | null>(null)

  // Histórico de Saques
  const [payouts, setPayouts] = useState<any[]>([])

  useEffect(() => {
    async function loadPixData() {
      if (!user) return
      const { data } = await supabase
        .from('affiliates')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (data) {
        setAffiliateId(data.id)
        if (data.pix_key) setPixKey(data.pix_key)
        if (data.pix_key_type) setPixType(data.pix_key_type)
        if (data.pix_holder_name) setHolderName(data.pix_holder_name)
        if (data.pix_holder_document) setHolderDoc(data.pix_holder_document)

        // Carregar saldos reais da fonte canônica (affiliate_commissions)
        const { data: comms } = await supabase
          .from('affiliate_commissions')
          .select('status, commission_amount')
          .eq('affiliate_id', data.id)

        if (comms && comms.length > 0) {
          let avail = 0
          let pend = 0
          comms.forEach(c => {
            const val = Number(c.commission_amount || 0)
            if (c.status === 'available') avail += val
            else if (c.status === 'pending') pend += val
          })
          setAvailableBalance(avail)
          setPendingBalance(pend)
        } else {
          setAvailableBalance(0)
          setPendingBalance(0)
        }

        // Carregar solicitações reais de saque
        const { data: reqs } = await supabase
          .from('affiliate_payout_requests')
          .select('*')
          .eq('affiliate_id', data.id)
          .order('created_at', { ascending: false })

        if (reqs) {
          setPayouts(reqs)
        }
      }
    }
    loadPixData()
  }, [user])

  const handleSavePix = async () => {
    if (!user) return
    setSavingPix(true)
    setPixFeedback(null)

    const { error } = await supabase
      .from('affiliates')
      .update({
        pix_key_type: pixType,
        pix_key: pixKey,
        pix_holder_name: holderName,
        pix_holder_document: holderDoc
      })
      .eq('user_id', user.id)

    setSavingPix(false)
    if (!error) {
      setPixFeedback('Chave Pix salva com sucesso para recebimento!')
      setTimeout(() => setPixFeedback(null), 4000)
    }
  }

  const handleRequestPayout = async () => {
    if (!pixKey || !holderDoc) {
      setWithdrawError('Por favor, cadastre sua Chave Pix antes de solicitar o saque.')
      return
    }

    if (withdrawAmount > availableBalance) {
      setWithdrawError('O valor informado é superior ao saldo disponível.')
      return
    }

    if (withdrawAmount < 100.00) {
      setWithdrawError('O valor mínimo de saque é R$ 100,00.')
      return
    }

    setRequestingWithdraw(true)
    setWithdrawError(null)
    setWithdrawFeedback(null)

    // Chamar RPC ou simulação segura
    const { data, error } = await supabase.rpc('request_affiliate_payout', {
      p_amount: withdrawAmount
    })

    setRequestingWithdraw(false)

    if (data?.success) {
      setAvailableBalance(prev => Math.max(0, prev - withdrawAmount))
      setPayouts(prev => [
        {
          id: data.payout_id,
          amount: withdrawAmount,
          status: 'requested',
          pix_key: pixKey,
          created_at: new Date().toISOString()
        },
        ...prev
      ])
      setWithdrawFeedback(data.message || 'Solicitação de saque via Pix enviada com sucesso!')
    } else {
      setWithdrawError(data?.message || error?.message || 'Falha ao processar solicitação de saque.')
    }
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', margin: '0 0 6px 0' }}>
          Carteira & Saques via Pix
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
          Gerencie sua chave Pix de recebimento e solicite a transferência dos seus ganhos com total segurança.
        </p>
      </div>

      {/* Visão de Saldos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: '#13141c', borderRadius: '14px', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '24px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#34d399', textTransform: 'uppercase' }}>
            Saldo Disponível para Saque
          </span>
          <div style={{ fontSize: '36px', fontWeight: 800, color: '#fff', margin: '6px 0 10px 0' }}>
            R$ {availableBalance.toFixed(2)}
          </div>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
            Valor livre de carência legal, pronto para transferência Pix imediata.
          </span>
        </div>

        <div style={{ background: '#13141c', borderRadius: '14px', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '24px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase' }}>
            Saldo em Carência (D+15)
          </span>
          <div style={{ fontSize: '36px', fontWeight: 800, color: '#fff', margin: '6px 0 10px 0' }}>
            R$ {pendingBalance.toFixed(2)}
          </div>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
            Proteção legal contra cancelamentos e reembolsos. Liberado automaticamente após 15 dias.
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* Formulário: Dados Pix */}
        <div style={{ background: '#13141c', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <KeyRound size={18} color="#10b981" /> Dados para Recebimento Pix
          </h3>

          {pixFeedback && (
            <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={14} /> {pixFeedback}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Tipo de Chave Pix</label>
              <select
                value={pixType}
                onChange={e => setPixType(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0b0c10', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
              >
                <option value="cpf">CPF</option>
                <option value="cnpj">CNPJ</option>
                <option value="email">E-mail</option>
                <option value="phone">Telefone Celular</option>
                <option value="random">Chave Aleatória (EVP)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Chave Pix</label>
              <input
                type="text"
                value={pixKey}
                onChange={e => setPixKey(e.target.value)}
                placeholder="Ex: 123.456.789-00 ou seu@email.com"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0b0c10', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Nome Completo do Titular</label>
              <input
                type="text"
                value={holderName}
                onChange={e => setHolderName(e.target.value)}
                placeholder="Ex: Marcos de Almeida Silva"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0b0c10', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>CPF/CNPJ do Titular</label>
              <input
                type="text"
                value={holderDoc}
                onChange={e => setHolderDoc(e.target.value)}
                placeholder="Ex: 123.456.789-00"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0b0c10', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
              />
            </div>

            <button
              onClick={handleSavePix}
              disabled={savingPix}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.12)',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              <Save size={15} /> {savingPix ? 'Salvando...' : 'Salvar Dados Pix'}
            </button>
          </div>
        </div>

        {/* Formulário: Solicitar Saque */}
        <div style={{ background: '#13141c', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wallet size={18} color="#3b82f6" /> Solicitar Saque
          </h3>

          {withdrawFeedback && (
            <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={14} /> {withdrawFeedback}
            </div>
          )}

          {withdrawError && (
            <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={14} /> {withdrawError}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                Valor do Saque (R$) — Mínimo R$ 100,00
              </label>
              <input
                type="number"
                min="100"
                step="10"
                value={withdrawAmount}
                onChange={e => setWithdrawAmount(Number(e.target.value))}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#0b0c10', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '16px', fontWeight: 700 }}
              />
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                <span>Dias permitidos:</span>
                <strong style={{ color: '#fff' }}>Segunda e Quinta-feira</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8' }}>
                <span>Horário de processamento:</span>
                <strong style={{ color: '#fff' }}>08:00 às 18:00</strong>
              </div>
            </div>

            <button
              onClick={handleRequestPayout}
              disabled={requestingWithdraw || availableBalance < 100}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '14px',
                borderRadius: '8px',
                background: availableBalance >= 100 ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.08)',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                fontSize: '14px',
                cursor: availableBalance >= 100 ? 'pointer' : 'not-allowed',
                opacity: availableBalance >= 100 ? 1 : 0.6
              }}
            >
              <Send size={16} /> {requestingWithdraw ? 'Processando...' : 'Confirmar Saque via Pix'}
            </button>
          </div>
        </div>
      </div>

      {/* Histórico de Saques */}
      <div style={{ background: '#13141c', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
          Histórico de Saques
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {payouts.map(p => (
            <div
              key={p.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)'
              }}
            >
              <div>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>
                  R$ {p.amount.toFixed(2)}
                </span>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0 0' }}>
                  Pix: {p.pix_key} • Solicitado em {new Date(p.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>

              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '20px',
                background: p.status === 'paid' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                color: p.status === 'paid' ? '#4ade80' : '#facc15'
              }}>
                {p.status === 'paid' ? 'Pago via Pix' : 'Em Análise'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
