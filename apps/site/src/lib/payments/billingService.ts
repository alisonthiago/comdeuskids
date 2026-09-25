// ==============================================================================
// COM DEUS KIDS — BILLING SERVICE (Fase 6)
// Camada de serviço de checkout, cálculo canônico e orquestração de pedidos
// ==============================================================================

import { supabase } from '@comdeuskids/supabase'
import { getPaymentProvider, BuyerInfo, PaymentMethodType } from './PaymentProvider'

export interface OfferPlan {
  id: string
  name: string
  slug: string
  description: string
  targetRole: string
  prices: {
    id: string
    name: string
    billingCycle: 'monthly' | 'yearly' | 'one_time'
    amountCents: number
    currency: string
  }[]
}

export interface CheckoutCalculation {
  priceId: string
  subtotalCents: number
  discountCents: number
  totalCents: number
  currency: string
  billingCycle: string
}

export interface CreateOrderParams {
  priceId: string
  buyer: BuyerInfo
  paymentMethod: PaymentMethodType
  couponCode?: string
  affiliateCode?: string
  cardData?: {
    cardBrand: string
    cardLast4: string
    installments: number
  }
}

export interface OrderCreationResult {
  success: boolean
  orderId: string
  paymentId: string
  status: 'pending' | 'paid'
  totalCents: number
  pixQrCode?: string
  pixQrCodeUrl?: string
  pixExpiresAt?: string
  errorMessage?: string
}

export const billingService = {
  /**
   * Busca planos e preços oficiais configurados no banco
   */
  async getPlansWithPrices(): Promise<OfferPlan[]> {
    const { data: plans, error: plansErr } = await supabase
      .from('plans')
      .select('id, name, slug, description, target_role, status')
      .eq('status', 'active')
      .order('name')

    if (plansErr || !plans) {
      console.error('Erro ao buscar planos:', plansErr)
      return []
    }

    const { data: prices, error: pricesErr } = await supabase
      .from('prices')
      .select('id, plan_id, name, billing_cycle, amount_cents, currency, is_active')
      .eq('is_active', true)

    if (pricesErr || !prices) {
      console.error('Erro ao buscar preços:', pricesErr)
      return []
    }

    return plans.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      targetRole: p.target_role,
      prices: prices
        .filter(pr => pr.plan_id === p.id)
        .map(pr => ({
          id: pr.id,
          name: pr.name,
          billingCycle: pr.billing_cycle,
          amountCents: Number(pr.amount_cents),
          currency: pr.currency
        }))
    }))
  },

  /**
   * Cálculo canônico no backend (o frontend nunca dita preço)
   */
  async calculateTotal(priceId: string, couponCode?: string): Promise<CheckoutCalculation | null> {
    const { data, error } = await supabase.rpc('calculate_checkout_total', {
      p_price_id: priceId,
      p_coupon_code: couponCode?.trim() || null
    })

    if (error || !data) {
      console.error('Erro no cálculo canônico:', error)
      return null
    }

    return {
      priceId: data.price_id,
      subtotalCents: Number(data.subtotal_cents),
      discountCents: Number(data.discount_cents),
      totalCents: Number(data.total_cents),
      currency: data.currency,
      billingCycle: data.billing_cycle
    }
  },

  /**
   * Cria pedido, itens, transação de pagamento e integra com Provider agnóstico
   */
  async submitOrder(params: CreateOrderParams): Promise<OrderCreationResult> {
    try {
      // 1. Obter usuário autenticado atual se houver
      const { data: { user } } = await supabase.auth.getUser()
      const userId = user?.id || '00000000-0000-0000-0000-000000000000'

      // 2. Cálculo canônico seguro no PostgreSQL
      const calc = await this.calculateTotal(params.priceId, params.couponCode)
      if (!calc) {
        throw new Error('Falha ao calcular valor oficial do pedido')
      }

      // 3. Buscar preço e plano no banco para snapshot
      const { data: priceData } = await supabase
        .from('prices')
        .select('*, plans(*)')
        .eq('id', params.priceId)
        .single()

      if (!priceData) {
        throw new Error('Oferta não encontrada')
      }

      const orderId = crypto.randomUUID()
      const paymentId = crypto.randomUUID()

      // 4. Criar Pedido (Orders) com valores em centavos e snapshot
      const { error: orderErr } = await supabase
        .from('orders')
        .insert([{
          id: orderId,
          user_id: userId,
          organization_id: params.buyer.organizationId || null,
          status: 'pending',
          subtotal: calc.subtotalCents / 100,
          discount: calc.discountCents / 100,
          total: calc.totalCents / 100,
          subtotal_amount_cents: calc.subtotalCents,
          discount_amount_cents: calc.discountCents,
          total_amount_cents: calc.totalCents,
          currency: 'BRL',
          coupon_code: params.couponCode?.trim().toUpperCase() || null,
          customer_email: params.buyer.email,
          customer_name: params.buyer.name
        }])

      if (orderErr) {
        console.error('Erro ao criar pedido:', orderErr)
        throw new Error('Não foi possível registrar o pedido no banco')
      }

      // 5. Criar Item do Pedido (Order Items)
      await supabase
        .from('order_items')
        .insert([{
          order_id: orderId,
          plan_id: priceData.plan_id,
          product_id: priceData.product_id,
          price_id: priceData.id,
          unit_price: calc.subtotalCents / 100,
          subtotal: calc.subtotalCents / 100,
          unit_price_cents: calc.subtotalCents,
          subtotal_cents: calc.subtotalCents,
          title_snapshot: priceData.name,
          quantity: 1
        }])

      // 6. Chamar Payment Provider Abstraction
      const provider = getPaymentProvider('mercadopago')
      const paymentResult = await provider.createPayment({
        orderId,
        amountCents: calc.totalCents,
        currency: 'BRL',
        method: params.paymentMethod,
        buyer: params.buyer,
        cardData: params.cardData ? {
          cardBrand: params.cardData.cardBrand,
          cardLast4: params.cardData.cardLast4,
          installments: params.cardData.installments
        } : undefined
      })

      // 7. Registrar Pagamento (Payments)
      await supabase
        .from('payments')
        .insert([{
          id: paymentId,
          order_id: orderId,
          organization_id: params.buyer.organizationId || null,
          gateway: paymentResult.gateway,
          gateway_payment_id: paymentResult.gatewayPaymentId,
          amount: calc.totalCents / 100,
          amount_cents: calc.totalCents,
          currency: 'BRL',
          status: paymentResult.status,
          method: params.paymentMethod,
          paid_at: paymentResult.paidAt,
          card_brand: params.cardData?.cardBrand,
          card_last4: params.cardData?.cardLast4,
          installments: params.cardData?.installments || 1,
          pix_qr_code: paymentResult.pixQrCode,
          pix_qr_code_url: paymentResult.pixQrCodeUrl,
          pix_expires_at: paymentResult.pixExpiresAt
        }])

      // 8. Se aprovado imediatamente (ex: cartão), conceder entitlement via RPC atômica
      if (paymentResult.status === 'approved') {
        await supabase.rpc('process_billing_order_paid', {
          p_order_id: orderId,
          p_payment_id: paymentId,
          p_gateway_event_id: paymentResult.gatewayPaymentId
        })
      }

      return {
        success: true,
        orderId,
        paymentId,
        status: paymentResult.status === 'approved' ? 'paid' : 'pending',
        totalCents: calc.totalCents,
        pixQrCode: paymentResult.pixQrCode,
        pixQrCodeUrl: paymentResult.pixQrCodeUrl,
        pixExpiresAt: paymentResult.pixExpiresAt
      }
    } catch (err: any) {
      console.error('Falha no checkout:', err)
      return {
        success: false,
        orderId: '',
        paymentId: '',
        status: 'pending',
        totalCents: 0,
        errorMessage: err.message || 'Erro inesperado no checkout'
      }
    }
  },

  /**
   * Simula ou processa confirmação de pagamento Pix via webhook
   */
  async simulatePixPaymentApproval(orderId: string, paymentId: string) {
    const { data, error } = await supabase.rpc('process_billing_order_paid', {
      p_order_id: orderId,
      p_payment_id: paymentId,
      p_gateway_event_id: `evt_sim_${Date.now()}`
    })

    return { data, error }
  }
}
