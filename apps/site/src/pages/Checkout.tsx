import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  QrCode,
  CreditCard,
  Building2,
  User,
  Tag,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  ExternalLink,
  Sparkles
} from 'lucide-react'
import { billingService, OfferPlan, CheckoutCalculation } from '../lib/payments/billingService'
import { appUrl, membrosUrl, playUrl } from '../lib/appUrl'

export default function Checkout() {
  const [searchParams] = useSearchParams()

  // Parâmetros de URL
  const initialPlanSlug = searchParams.get('plano') || 'familia'
  const initialCycle = (searchParams.get('ciclo') as 'monthly' | 'yearly') || 'yearly'
  const initialCoupon = searchParams.get('cupom') || ''
  const affiliateRef = searchParams.get('ref') || ''

  // Estados de dados
  const [plans, setPlans] = useState<OfferPlan[]>([])
  const [selectedPlanSlug, setSelectedPlanSlug] = useState(initialPlanSlug)
  const [selectedCycle, setSelectedCycle] = useState<'monthly' | 'yearly'>(initialCycle)
  const [selectedPriceId, setSelectedPriceId] = useState<string>('')
  
  // Cupom e Cálculo
  const [couponCode, setCouponCode] = useState(initialCoupon)
  const [couponApplied, setCouponApplied] = useState(false)
  const [calculation, setCalculation] = useState<CheckoutCalculation | null>(null)
  const [calculating, setCalculating] = useState(false)

  // Dados do Comprador
  const [buyerType, setBuyerType] = useState<'individual' | 'organization'>(
    initialPlanSlug === 'igreja' || initialPlanSlug === 'escola' ? 'organization' : 'individual'
  )
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [document, setDocument] = useState('') // CPF ou CNPJ
  const [organizationName, setOrganizationName] = useState('')

  // Forma de pagamento e Cartão
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card'>('pix')
  const [cardBrand, setCardBrand] = useState('Visa')
  const [cardLast4, setCardLast4] = useState('4242')
  const [installments, setInstallments] = useState(1)

  // Status da operação
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [orderResult, setOrderResult] = useState<{
    orderId: string
    paymentId: string
    status: 'pending' | 'paid'
    pixQrCode?: string
    pixExpiresAt?: string
  } | null>(null)
  const [copiedPix, setCopiedPix] = useState(false)
  const [checkingPix, setCheckingPix] = useState(false)

  // Carregar planos disponíveis
  useEffect(() => {
    async function loadOffers() {
      const data = await billingService.getPlansWithPrices()
      setPlans(data)

      const activePlan = data.find(p => p.slug === selectedPlanSlug) || data[0]
      if (activePlan) {
        const targetPrice = activePlan.prices.find(pr => pr.billingCycle === selectedCycle) || activePlan.prices[0]
        if (targetPrice) {
          setSelectedPriceId(targetPrice.id)
        }
      }
    }
    loadOffers()
  }, [])

  // Atualizar Preço Selecionado quando o Plano ou Ciclo mudar
  useEffect(() => {
    const currentPlan = plans.find(p => p.slug === selectedPlanSlug)
    if (currentPlan) {
      const targetPrice = currentPlan.prices.find(pr => pr.billingCycle === selectedCycle) || currentPlan.prices[0]
      if (targetPrice) {
        setSelectedPriceId(targetPrice.id)
      }
      if (selectedPlanSlug === 'igreja' || selectedPlanSlug === 'escola') {
        setBuyerType('organization')
      }
    }
  }, [selectedPlanSlug, selectedCycle, plans])

  // Recalcular Total Canônico no Supabase
  useEffect(() => {
    if (!selectedPriceId) return

    let cancelled = false
    async function recalc() {
      setCalculating(true)
      const res = await billingService.calculateTotal(selectedPriceId, couponApplied ? couponCode : undefined)
      if (!cancelled && res) {
        setCalculation(res)
      }
      setCalculating(false)
    }
    recalc()

    return () => {
      cancelled = true
    }
  }, [selectedPriceId, couponApplied, couponCode])

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault()
    if (!couponCode.trim()) return
    setCouponApplied(true)
  }

  const handleCopyPix = () => {
    if (orderResult?.pixQrCode) {
      navigator.clipboard.writeText(orderResult.pixQrCode)
      setCopiedPix(true)
      setTimeout(() => setCopiedPix(false), 3000)
    }
  }

  const handleSimulatePixApproval = async () => {
    if (!orderResult) return
    setCheckingPix(true)
    const { error } = await billingService.simulatePixPaymentApproval(orderResult.orderId, orderResult.paymentId)
    setCheckingPix(false)
    if (!error) {
      setOrderResult({ ...orderResult, status: 'paid' })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setLoading(true)

    try {
      const result = await billingService.submitOrder({
        priceId: selectedPriceId,
        buyer: {
          name,
          email,
          document,
          buyerType,
          organizationName: buyerType === 'organization' ? organizationName : undefined
        },
        paymentMethod,
        couponCode: couponApplied ? couponCode : undefined,
        affiliateCode: affiliateRef || undefined,
        cardData: paymentMethod === 'credit_card' ? {
          cardBrand,
          cardLast4,
          installments
        } : undefined
      })

      if (!result.success) {
        setErrorMessage(result.errorMessage || 'Falha ao processar pagamento.')
      } else {
        setOrderResult({
          orderId: result.orderId,
          paymentId: result.paymentId,
          status: result.status,
          pixQrCode: result.pixQrCode,
          pixExpiresAt: result.pixExpiresAt
        })
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro inesperado.')
    } finally {
      setLoading(false)
    }
  }

  // ----------------------------------------------------------------------------
  // TELA DE SUCESSO / CONFIRMAÇÃO DE ACESSO
  // ----------------------------------------------------------------------------
  if (orderResult && orderResult.status === 'paid') {
    return (
      <div style={{ maxWidth: 640, margin: '60px auto', padding: '0 24px', textAlign: 'center' }}>
        <div style={{
          width: 72, height: 72, borderRadius: 24, background: '#f0fdf4', color: '#16a34a',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
          boxShadow: '0 10px 25px -5px rgba(22, 163, 74, 0.2)'
        }}>
          <CheckCircle2 size={42} />
        </div>

        <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: '#16a34a', letterSpacing: '0.05em' }}>
          Pagamento Aprovado • Entitlement Liberado
        </span>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', margin: '8px 0 12px' }}>
          Bem-vindo ao Com Deus Kids!
        </h1>
        <p style={{ fontSize: 16, color: '#64748b', lineHeight: 1.6, marginBottom: 24 }}>
          Sua assinatura foi ativada com sucesso. Os dados da compra e as credenciais foram enviadas para <strong>{email}</strong>.
        </p>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16, padding: 20, marginBottom: 28, textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
            <span style={{ color: '#64748b' }}>Plano Contratado:</span>
            <strong style={{ color: '#0f172a' }}>{plans.find(p => p.slug === selectedPlanSlug)?.name}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
            <span style={{ color: '#64748b' }}>Ciclo de Cobrança:</span>
            <span style={{ color: '#0f172a', fontWeight: 600 }}>{selectedCycle === 'yearly' ? 'Anual' : 'Mensal'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
            <span style={{ color: '#64748b' }}>Identificador do Pedido:</span>
            <span style={{ color: '#64748b', fontFamily: 'monospace', fontSize: 12 }}>{orderResult.orderId}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, borderTop: '1px solid #e2e8f0', paddingTop: 8 }}>
            <span style={{ color: '#64748b' }}>Status de Acesso:</span>
            <span style={{ color: '#16a34a', fontWeight: 700 }}>Canônico Ativo (Entitlement Concedido)</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <a
            href={selectedPlanSlug === 'igreja' || selectedPlanSlug === 'escola' || selectedPlanSlug === 'professor' ? membrosUrl : playUrl}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '16px 32px', background: '#7c3aed',
              color: '#fff', borderRadius: 14, fontWeight: 700, fontSize: 16, textDecoration: 'none',
              boxShadow: '0 10px 20px -5px rgba(124, 58, 237, 0.35)'
            }}
          >
            {selectedPlanSlug === 'familia' ? 'Acessar Com Deus Kids Play' : 'Acessar Área de Membros'} <ExternalLink size={18} />
          </a>
        </div>
      </div>
    )
  }

  // ----------------------------------------------------------------------------
  // TELA DE AGUARDANDO PIX
  // ----------------------------------------------------------------------------
  if (orderResult && orderResult.status === 'pending' && orderResult.pixQrCode) {
    return (
      <div style={{ maxWidth: 560, margin: '50px auto', padding: '0 24px', textAlign: 'center' }}>
        <div style={{
          width: 60, height: 60, borderRadius: 20, background: '#f5f3ff', color: '#7c3aed',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
        }}>
          <QrCode size={34} />
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
          Pague com PIX para Liberar seu Acesso
        </h1>
        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>
          Escaneie o QR Code abaixo com seu banco ou copie a chave Copia e Cola. O acesso é liberado automaticamente.
        </p>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, padding: 24, boxShadow: '0 4px 15px rgba(0,0,0,0.04)', marginBottom: 24 }}>
          <div style={{ display: 'inline-block', padding: 12, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, marginBottom: 16 }}>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(orderResult.pixQrCode)}`}
              alt="QR Code Pix"
              style={{ width: 190, height: 190, display: 'block' }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>Código Pix Copia e Cola:</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                readOnly
                value={orderResult.pixQrCode}
                style={{ flex: 1, padding: '10px 12px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 12, fontFamily: 'monospace' }}
              />
              <button
                type="button"
                onClick={handleCopyPix}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '0 16px', background: copiedPix ? '#16a34a' : '#7c3aed',
                  color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer'
                }}
              >
                {copiedPix ? <Check size={16} /> : <Copy size={16} />}
                {copiedPix ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13, color: '#f59e0b', fontWeight: 600 }}>
            <Loader2 size={16} className="spin-animate" /> Aguardando confirmação do banco...
          </div>
        </div>

        {/* Botão de Homologação / Simulação do Webhook */}
        <button
          type="button"
          onClick={handleSimulatePixApproval}
          disabled={checkingPix}
          style={{
            background: 'transparent', border: '1px dashed #cbd5e1', padding: '10px 18px',
            borderRadius: 10, fontSize: 13, color: '#64748b', cursor: 'pointer'
          }}
        >
          {checkingPix ? 'Verificando...' : '⚡ Simular Confirmação Bancária do Pix (Homologação)'}
        </button>
      </div>
    )
  }

  // ----------------------------------------------------------------------------
  // FORMULÁRIO PRINCIPAL DE CHECKOUT
  // ----------------------------------------------------------------------------
  const activePlan = plans.find(p => p.slug === selectedPlanSlug)

  return (
    <div style={{ maxWidth: 1000, margin: '48px auto', padding: '0 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#16a34a', fontWeight: 700, marginBottom: 8 }}>
          <Lock size={14} /> Checkout 100% Seguro e Criptografado
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0f172a' }}>Finalize sua Assinatura</h1>
        <p style={{ fontSize: 15, color: '#64748b', marginTop: 4 }}>
          Liberação imediata de acesso canônico na plataforma Com Deus Kids
        </p>
      </div>

      {errorMessage && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fef2f2', border: '1px solid #fecaca', padding: '14px 18px', borderRadius: 12, color: '#b91c1c', marginBottom: 24, fontSize: 14 }}>
          <AlertCircle size={20} />
          <span>{errorMessage}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 32 }}>
        {/* COLUNA ESQUERDA: FORMULÁRIO DO COMPRADOR E PAGAMENTO */}
        <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, padding: 28, boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          {/* SELETOR DE COMPRADOR: PESSOA FÍSICA OU ORGANIZAÇÃO */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 8 }}>
              Tipo de Conta / Comprador
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                type="button"
                onClick={() => setBuyerType('individual')}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px',
                  borderRadius: 10, border: buyerType === 'individual' ? '2px solid #7c3aed' : '1px solid #cbd5e1',
                  background: buyerType === 'individual' ? '#f5f3ff' : '#fff', color: buyerType === 'individual' ? '#7c3aed' : '#64748b',
                  fontWeight: 700, fontSize: 13, cursor: 'pointer'
                }}
              >
                <User size={16} /> Pessoa Física (Família / Prof.)
              </button>
              <button
                type="button"
                onClick={() => setBuyerType('organization')}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px',
                  borderRadius: 10, border: buyerType === 'organization' ? '2px solid #7c3aed' : '1px solid #cbd5e1',
                  background: buyerType === 'organization' ? '#f5f3ff' : '#fff', color: buyerType === 'organization' ? '#7c3aed' : '#64748b',
                  fontWeight: 700, fontSize: 13, cursor: 'pointer'
                }}
              >
                <Building2 size={16} /> Igreja ou Escola
              </button>
            </div>
          </div>

          {/* DADOS CADASTRAIS */}
          {buyerType === 'organization' && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Nome da Igreja ou Escola
              </label>
              <input
                type="text"
                required
                value={organizationName}
                onChange={e => setOrganizationName(e.target.value)}
                placeholder="Ex: Primeira Igreja Batista / Colégio Semear"
                style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14 }}
              />
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                {buyerType === 'organization' ? 'Nome do Responsável' : 'Seu Nome Completo'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: João Silva"
                style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                {buyerType === 'organization' ? 'CNPJ' : 'CPF'}
              </label>
              <input
                type="text"
                required
                value={document}
                onChange={e => setDocument(e.target.value)}
                placeholder={buyerType === 'organization' ? '00.000.000/0001-00' : '000.000.000-00'}
                style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14 }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
              E-mail para Acesso e Notificações
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seuemail@exemplo.com"
              style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14 }}
            />
          </div>

          {/* FORMA DE PAGAMENTO */}
          <div style={{ marginBottom: 24, borderTop: '1px solid #f1f5f9', paddingTop: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 12 }}>
              Forma de Pagamento
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div
                onClick={() => setPaymentMethod('pix')}
                style={{
                  border: paymentMethod === 'pix' ? '2px solid #7c3aed' : '1px solid #cbd5e1',
                  background: paymentMethod === 'pix' ? '#f5f3ff' : '#fff', padding: '14px', borderRadius: 10,
                  textAlign: 'center', cursor: 'pointer', fontWeight: 700, fontSize: 14, color: paymentMethod === 'pix' ? '#7c3aed' : '#475569'
                }}
              >
                ⚡ PIX (Imediato)
              </div>
              <div
                onClick={() => setPaymentMethod('credit_card')}
                style={{
                  border: paymentMethod === 'credit_card' ? '2px solid #7c3aed' : '1px solid #cbd5e1',
                  background: paymentMethod === 'credit_card' ? '#f5f3ff' : '#fff', padding: '14px', borderRadius: 10,
                  textAlign: 'center', cursor: 'pointer', fontWeight: 700, fontSize: 14, color: paymentMethod === 'credit_card' ? '#7c3aed' : '#475569'
                }}
              >
                💳 Cartão de Crédito
              </div>
            </div>

            {paymentMethod === 'credit_card' && (
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                  <ShieldCheck size={16} color="#16a34a" />
                  <span style={{ fontSize: 12, color: '#64748b' }}>Ambiente Seguro PCI — Zero armazenamento de CVV/número completo</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4 }}>Bandeira</label>
                    <select
                      value={cardBrand}
                      onChange={e => setCardBrand(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                    >
                      <option value="Visa">Visa</option>
                      <option value="Mastercard">Mastercard</option>
                      <option value="Elo">Elo</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4 }}>Parcelamento</label>
                    <select
                      value={installments}
                      onChange={e => setInstallments(Number(e.target.value))}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                    >
                      <option value={1}>1x sem juros</option>
                      <option value={3}>3x sem juros</option>
                      <option value={6}>6x sem juros</option>
                      <option value={12}>12x sem juros</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || calculating}
            style={{
              width: '100%', padding: '16px 0', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 16,
              cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 8px 20px -4px rgba(124, 58, 237, 0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
            }}
          >
            {loading ? <Loader2 size={20} className="spin-animate" /> : <Sparkles size={20} />}
            {loading ? 'Processando Pedido...' : `Confirmar Assinatura — R$ ${calculation ? (calculation.totalCents / 100).toFixed(2).replace('.', ',') : '...'}`}
          </button>
        </form>

        {/* COLUNA DIREITA: RESUMO DO PEDIDO E SELEÇÃO DE PLANO */}
        <div>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, padding: 24, boxShadow: '0 4px 15px rgba(0,0,0,0.03)', marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>Resumo da Assinatura</h2>

            {/* SELEÇÃO DO PLANO */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>
                Plano Selecionado
              </label>
              <select
                value={selectedPlanSlug}
                onChange={e => setSelectedPlanSlug(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14, fontWeight: 600, color: '#0f172a' }}
              >
                {plans.map(p => (
                  <option key={p.slug} value={p.slug}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* SELETOR DE CICLO: MENSAL OU ANUAL */}
            <div style={{ display: 'flex', gap: 8, background: '#f8fafc', padding: 4, borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 20 }}>
              <button
                type="button"
                onClick={() => setSelectedCycle('monthly')}
                style={{
                  flex: 1, padding: '8px 0', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', background: selectedCycle === 'monthly' ? '#fff' : 'transparent',
                  color: selectedCycle === 'monthly' ? '#7c3aed' : '#64748b',
                  boxShadow: selectedCycle === 'monthly' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                Mensal
              </button>
              <button
                type="button"
                onClick={() => setSelectedCycle('yearly')}
                style={{
                  flex: 1, padding: '8px 0', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', background: selectedCycle === 'yearly' ? '#fff' : 'transparent',
                  color: selectedCycle === 'yearly' ? '#7c3aed' : '#64748b',
                  boxShadow: selectedCycle === 'yearly' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                Anual (Até 2 meses grátis)
              </button>
            </div>

            {/* BENEFÍCIOS DO PLANO */}
            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, marginBottom: 16 }}>
              {activePlan?.description}
            </p>

            {/* CAMPO DE CUPOM */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16, marginBottom: 16 }}>
              <span style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Cupom de Desconto</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  value={couponCode}
                  onChange={e => {
                    setCouponCode(e.target.value.toUpperCase())
                    setCouponApplied(false)
                  }}
                  placeholder="Ex: COMDEUS10"
                  style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, textTransform: 'uppercase' }}
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  style={{ padding: '0 14px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}
                >
                  Aplicar
                </button>
              </div>
              {couponApplied && calculation && calculation.discountCents > 0 && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#16a34a', marginTop: 4, fontWeight: 600 }}>
                  <Tag size={12} /> Cupom {couponCode} aplicado com sucesso!
                </span>
              )}
            </div>

            {/* DISCRIMINAÇÃO DOS VALORES */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#64748b', marginBottom: 8 }}>
                <span>Subtotal</span>
                <span>R$ {calculation ? (calculation.subtotalCents / 100).toFixed(2).replace('.', ',') : '...'}</span>
              </div>
              {calculation && calculation.discountCents > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#16a34a', marginBottom: 8 }}>
                  <span>Desconto</span>
                  <span>- R$ {(calculation.discountCents / 100).toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 800, color: '#0f172a', borderTop: '1px solid #e2e8f0', paddingTop: 10 }}>
                <span>Total</span>
                <span>R$ {calculation ? (calculation.totalCents / 100).toFixed(2).replace('.', ',') : '...'}</span>
              </div>
            </div>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16, padding: 16, fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
            🔒 <strong>Garantia de 7 dias:</strong> Caso não se adapte, cancele a qualquer momento com reembolso integral.
          </div>
        </div>
      </div>
    </div>
  )
}
