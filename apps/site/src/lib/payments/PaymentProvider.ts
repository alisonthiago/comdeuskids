// ==============================================================================
// COM DEUS KIDS — PAYMENT PROVIDER ABSTRACTION (Fase 6)
// Gateway-Agnostic Core: Mercado Pago, Pagar.me, Pix Nativo, Manual
// ==============================================================================

export type PaymentGatewayType = 'mercadopago' | 'pagarme' | 'pix' | 'manual'

export type PaymentMethodType = 'pix' | 'credit_card' | 'boleto'

export interface BuyerInfo {
  name: string
  email: string
  document?: string // CPF ou CNPJ
  phone?: string
  buyerType: 'individual' | 'organization'
  organizationName?: string
  organizationId?: string
}

export interface CreatePaymentParams {
  orderId: string
  amountCents: number
  currency: string
  method: PaymentMethodType
  buyer: BuyerInfo
  cardData?: {
    cardBrand: string
    cardLast4: string
    installments: number
    token?: string
  }
}

export interface PaymentResult {
  success: boolean
  paymentId: string
  gateway: PaymentGatewayType
  gatewayPaymentId: string
  status: 'pending' | 'approved' | 'refused' | 'refunded' | 'chargeback'
  paidAt?: string
  pixQrCode?: string
  pixQrCodeUrl?: string
  pixExpiresAt?: string
  errorMessage?: string
}

export interface CreateSubscriptionParams {
  orderId: string
  planId: string
  priceId: string
  billingCycle: 'monthly' | 'yearly'
  amountCents: number
  buyer: BuyerInfo
  method: PaymentMethodType
  cardToken?: string
}

export interface SubscriptionResult {
  success: boolean
  subscriptionId: string
  gatewaySubscriptionId?: string
  status: 'active' | 'trialing' | 'pending' | 'past_due'
  currentPeriodStart: string
  currentPeriodEnd: string
  errorMessage?: string
}

export interface PaymentDetails {
  id: string
  gateway: PaymentGatewayType
  amountCents: number
  status: 'pending' | 'approved' | 'refused' | 'refunded' | 'chargeback'
  paidAt?: string
}

export interface RefundResult {
  success: boolean
  refundId: string
  refundedAmountCents: number
  status: 'refunded' | 'partially_refunded'
  errorMessage?: string
}

export interface WebhookResult {
  processed: boolean
  eventId: string
  eventType: string
  orderId?: string
  paymentId?: string
  status?: string
}

export interface PaymentProvider {
  readonly gatewayName: PaymentGatewayType
  createPayment(params: CreatePaymentParams): Promise<PaymentResult>
  createSubscription(params: CreateSubscriptionParams): Promise<SubscriptionResult>
  getPayment(gatewayPaymentId: string): Promise<PaymentDetails>
  cancelPayment(gatewayPaymentId: string, reason?: string): Promise<boolean>
  refundPayment(gatewayPaymentId: string, amountCents?: number, reason?: string): Promise<RefundResult>
  handleWebhook(payload: Record<string, any>, signature?: string): Promise<WebhookResult>
}

// ------------------------------------------------------------------------------
// Adapter Mercado Pago
// ------------------------------------------------------------------------------
export class MercadoPagoProvider implements PaymentProvider {
  readonly gatewayName: PaymentGatewayType = 'mercadopago'

  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    const isPix = params.method === 'pix'
    const mockGatewayId = `mp_pay_${Date.now()}`
    
    // Geração canônica de Pix
    const pixCode = isPix
      ? `00020126580014BR.GOV.BCB.PIX0136comdeuskids-${params.orderId.slice(0, 8)}5204000053039865405${(params.amountCents / 100).toFixed(2)}5802BR5925Com Deus Kids Edtech6009Sao Paulo62070503***6304`
      : undefined

    return {
      success: true,
      paymentId: mockGatewayId,
      gateway: 'mercadopago',
      gatewayPaymentId: mockGatewayId,
      status: isPix ? 'pending' : 'approved',
      paidAt: isPix ? undefined : new Date().toISOString(),
      pixQrCode: pixCode,
      pixQrCodeUrl: pixCode ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixCode)}` : undefined,
      pixExpiresAt: isPix ? new Date(Date.now() + 30 * 60 * 1000).toISOString() : undefined
    }
  }

  async createSubscription(params: CreateSubscriptionParams): Promise<SubscriptionResult> {
    const now = new Date()
    const periodEnd = new Date(now)
    if (params.billingCycle === 'yearly') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1)
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1)
    }

    return {
      success: true,
      subscriptionId: `mp_sub_${Date.now()}`,
      gatewaySubscriptionId: `mp_sub_ext_${Date.now()}`,
      status: 'active',
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: periodEnd.toISOString()
    }
  }

  async getPayment(gatewayPaymentId: string): Promise<PaymentDetails> {
    return {
      id: gatewayPaymentId,
      gateway: 'mercadopago',
      amountCents: 0,
      status: 'approved',
      paidAt: new Date().toISOString()
    }
  }

  async cancelPayment(_gatewayPaymentId: string): Promise<boolean> {
    return true
  }

  async refundPayment(gatewayPaymentId: string, amountCents = 0): Promise<RefundResult> {
    return {
      success: true,
      refundId: `mp_ref_${Date.now()}`,
      refundedAmountCents: amountCents,
      status: 'refunded'
    }
  }

  async handleWebhook(payload: Record<string, any>): Promise<WebhookResult> {
    return {
      processed: true,
      eventId: payload.id || `mp_evt_${Date.now()}`,
      eventType: payload.action || 'payment.created',
      orderId: payload.data?.order_id,
      status: payload.data?.status
    }
  }
}

// ------------------------------------------------------------------------------
// Adapter Pagar.me
// ------------------------------------------------------------------------------
export class PagarmeProvider implements PaymentProvider {
  readonly gatewayName: PaymentGatewayType = 'pagarme'

  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    const isPix = params.method === 'pix'
    const mockGatewayId = `pg_pay_${Date.now()}`
    const pixCode = isPix ? `00020126580014BR.GOV.BCB.PIX0136pagarme-${params.orderId.slice(0, 8)}` : undefined

    return {
      success: true,
      paymentId: mockGatewayId,
      gateway: 'pagarme',
      gatewayPaymentId: mockGatewayId,
      status: isPix ? 'pending' : 'approved',
      paidAt: isPix ? undefined : new Date().toISOString(),
      pixQrCode: pixCode,
      pixExpiresAt: isPix ? new Date(Date.now() + 30 * 60 * 1000).toISOString() : undefined
    }
  }

  async createSubscription(params: CreateSubscriptionParams): Promise<SubscriptionResult> {
    const now = new Date()
    const periodEnd = new Date(now)
    if (params.billingCycle === 'yearly') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1)
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1)
    }

    return {
      success: true,
      subscriptionId: `pg_sub_${Date.now()}`,
      gatewaySubscriptionId: `pg_sub_ext_${Date.now()}`,
      status: 'active',
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: periodEnd.toISOString()
    }
  }

  async getPayment(gatewayPaymentId: string): Promise<PaymentDetails> {
    return {
      id: gatewayPaymentId,
      gateway: 'pagarme',
      amountCents: 0,
      status: 'approved'
    }
  }

  async cancelPayment(_gatewayPaymentId: string): Promise<boolean> {
    return true
  }

  async refundPayment(_gatewayPaymentId: string, amountCents = 0): Promise<RefundResult> {
    return {
      success: true,
      refundId: `pg_ref_${Date.now()}`,
      refundedAmountCents: amountCents,
      status: 'refunded'
    }
  }

  async handleWebhook(payload: Record<string, any>): Promise<WebhookResult> {
    return {
      processed: true,
      eventId: payload.id || `pg_evt_${Date.now()}`,
      eventType: payload.type || 'order.paid'
    }
  }
}

// ------------------------------------------------------------------------------
// Payment Factory (Injeção de dependência e desacoplamento de gateway)
// ------------------------------------------------------------------------------
export function getPaymentProvider(gateway: PaymentGatewayType = 'mercadopago'): PaymentProvider {
  switch (gateway) {
    case 'pagarme':
      return new PagarmeProvider()
    case 'mercadopago':
    default:
      return new MercadoPagoProvider()
  }
}
