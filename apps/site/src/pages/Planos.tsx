import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Check, Sparkles, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react'
import { supabase } from '@comdeuskids/supabase'
import { membrosUrl } from '../lib/appUrl'

interface PlanWithPrices {
  id: string
  name: string
  slug: string
  description?: string
  price_monthly: number
  price_yearly: number
  target_audience?: string
  cta_text?: string
  is_featured?: boolean
  max_users?: number
}

const DEFAULT_PLANS: PlanWithPrices[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Com Deus Kids Família',
    slug: 'familia',
    description: 'Streaming bíblico infantil, controle de tempo de tela e até 5 perfis infantis',
    price_monthly: 29.9,
    price_yearly: 299,
    target_audience: 'family',
    cta_text: 'Começar com a Família',
    is_featured: false,
    max_users: 5
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Com Deus Kids Professor Individual',
    slug: 'professor',
    description: 'Motor educacional completo, Lesson Builder, diário de bordo e até 50 alunos',
    price_monthly: 39.9,
    price_yearly: 399,
    target_audience: 'teacher',
    cta_text: 'Assinar Plano Professor',
    is_featured: false,
    max_users: 50
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Com Deus Kids Igreja / EBD',
    slug: 'igreja',
    description: 'Ministério Infantil completo, check-in com crachá e QR Code com PIN e até 200 crianças',
    price_monthly: 99.0,
    price_yearly: 990,
    target_audience: 'church',
    cta_text: 'Assinar Plano Igreja',
    is_featured: true,
    max_users: 200
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    name: 'Com Deus Kids Escola Cristã',
    slug: 'escola',
    description: 'Gestão escolar institucional, matrícula de 6 dígitos, transporte escolar e até 500 alunos',
    price_monthly: 199.0,
    price_yearly: 1990,
    target_audience: 'school',
    cta_text: 'Contratar Licença Escola',
    is_featured: false,
    max_users: 500
  }
]

export default function Planos() {
  const [plans, setPlans] = useState<PlanWithPrices[]>(DEFAULT_PLANS)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  useEffect(() => {
    async function loadPlans() {
      try {
        const { data, error } = await supabase
          .from('plans')
          .select('id, name, slug, description, price_monthly, price_yearly, target_audience, cta_text, is_featured, max_users')
          .eq('status', 'active')
          .order('sort_order', { ascending: true })

        if (!error && data && data.length > 0) {
          setPlans(data as PlanWithPrices[])
        }
      } catch {}
    }
    loadPlans()
  }, [])

  return (
    <div style={{ maxWidth: 1240, margin: '48px auto', padding: '0 24px', color: '#0f172a' }}>
      {/* HEADER */}
      <div style={{ textAlign: 'center', maxWidth: 740, margin: '0 auto 40px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(124, 58, 237, 0.08)', color: '#7c3aed',
          padding: '6px 16px', borderRadius: 999, fontSize: 13, fontWeight: 700,
          marginBottom: 16
        }}>
          <Sparkles size={16} /> Planos Comerciais Oficiais
        </div>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, color: '#0f172a', marginBottom: 12 }}>
          Escolha o plano ideal para a sua missão
        </h1>
        <p style={{ fontSize: 16, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
          Valores transparentes, sem fidelidade contratual e com ativação imediata na sua conta.
        </p>

        {/* Seletor Ciclo Mensal / Anual */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', background: '#f1f5f9',
          padding: 4, borderRadius: 12, marginTop: 28, border: '1px solid #e2e8f0'
        }}>
          <button
            onClick={() => setBillingCycle('monthly')}
            style={{
              padding: '8px 20px', borderRadius: 8, border: 'none',
              background: billingCycle === 'monthly' ? '#fff' : 'transparent',
              color: billingCycle === 'monthly' ? '#0f172a' : '#64748b',
              fontWeight: 700, fontSize: 13, cursor: 'pointer',
              boxShadow: billingCycle === 'monthly' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            Faturamento Mensal
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            style={{
              padding: '8px 20px', borderRadius: 8, border: 'none',
              background: billingCycle === 'yearly' ? '#fff' : 'transparent',
              color: billingCycle === 'yearly' ? '#7c3aed' : '#64748b',
              fontWeight: 700, fontSize: 13, cursor: 'pointer',
              boxShadow: billingCycle === 'yearly' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            Anual (2 meses grátis) ✨
          </button>
        </div>
      </div>

      {/* GRADE COMPARATIVA DOS 4 PLANOS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, marginBottom: 56 }}>
        {plans.map(p => {
          const price = billingCycle === 'monthly' ? p.price_monthly : p.price_yearly
          const perMonth = billingCycle === 'monthly' ? p.price_monthly : (p.price_yearly / 12)

          const audienceLabel =
            p.slug === 'familia' || p.target_audience === 'family'
              ? 'Família Cristã'
              : p.slug === 'professor' || p.target_audience === 'teacher'
              ? 'Professor Individual'
              : p.slug === 'igreja' || p.target_audience === 'church'
              ? 'Igreja / Ministério'
              : 'Escola Cristã'

          const specificLanding =
            p.slug === 'familia'
              ? '/familias'
              : p.slug === 'professor'
              ? '/professores'
              : p.slug === 'igreja'
              ? '/igrejas'
              : '/escolas'

          return (
            <div
              key={p.slug}
              style={{
                background: '#fff',
                border: p.is_featured ? '2px solid #7c3aed' : '1px solid #e2e8f0',
                borderRadius: 20,
                padding: 28,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: p.is_featured ? '0 12px 36px rgba(124, 58, 237, 0.12)' : '0 2px 8px rgba(0,0,0,0.04)'
              }}
            >
              {p.is_featured && (
                <span style={{
                  position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)',
                  background: '#7c3aed', color: '#fff', fontSize: 11, fontWeight: 800,
                  padding: '4px 14px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.04em'
                }}>
                  Mais Escolhido
                </span>
              )}

              <div style={{ marginBottom: 14 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed' }}>
                  {audienceLabel.toUpperCase()}
                </span>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '4px 0 0' }}>
                  {p.name}
                </h3>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#0f172a' }}>
                  R$ {Number(perMonth || 0).toFixed(2).replace('.', ',')}
                  <small style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}> /mês</small>
                </div>
                {billingCycle === 'yearly' && (
                  <div style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, marginTop: 2 }}>
                    Faturado anualmente R$ {Number(price || 0).toFixed(2).replace('.', ',')}
                  </div>
                )}
              </div>

              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, minHeight: 48, marginBottom: 20 }}>
                {p.description}
              </p>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: '#334155' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Check size={16} color="#16a34a" /> Streaming completo Com Deus Kids
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Check size={16} color="#16a34a" /> {p.max_users || 5} usuários / perfis incluídos
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Check size={16} color="#16a34a" /> Download ilimitado de cadernos e PDFs
                </li>
                {p.slug !== 'familia' && (
                  <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Check size={16} color="#16a34a" /> Lesson Builder & Diário de Alunos
                  </li>
                )}
                {(p.slug === 'igreja' || p.slug === 'escola') && (
                  <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Check size={16} color="#16a34a" /> Check-in seguro com crachá e QR Code
                  </li>
                )}
                {p.slug === 'escola' && (
                  <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Check size={16} color="#16a34a" /> Módulo de transporte escolar
                  </li>
                )}
              </ul>

              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a
                  href={`${membrosUrl}?plano=${p.slug}&ciclo=${billingCycle}`}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    background: p.is_featured ? '#7c3aed' : '#0f172a',
                    color: '#fff', padding: '12px', borderRadius: 10, fontWeight: 700,
                    fontSize: 14, textDecoration: 'none', textAlign: 'center'
                  }}
                >
                  <span>{p.cta_text || 'Assinar Agora'}</span>
                  <ArrowRight size={15} />
                </a>

                <Link
                  to={specificLanding}
                  style={{ fontSize: 12, color: '#7c3aed', textAlign: 'center', textDecoration: 'none', fontWeight: 600, padding: 4 }}
                >
                  Ver detalhes para {audienceLabel} →
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      {/* DÚVIDAS E SEGURANÇA */}
      <div style={{
        background: '#f8fafc', borderRadius: 20, padding: 32,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 20, border: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#ede9fe', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#0f172a' }}>Precisa de ajuda para escolher?</div>
            <div style={{ fontSize: 13, color: '#64748b' }}>Conheça nossas páginas dedicadas para Famílias, Professores, Igrejas e Escolas.</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link to="/familias" style={{ padding: '8px 14px', borderRadius: 8, background: '#fff', border: '1px solid #cbd5e1', fontSize: 12, fontWeight: 700, color: '#334155', textDecoration: 'none' }}>Famílias</Link>
          <Link to="/professores" style={{ padding: '8px 14px', borderRadius: 8, background: '#fff', border: '1px solid #cbd5e1', fontSize: 12, fontWeight: 700, color: '#334155', textDecoration: 'none' }}>Professores</Link>
          <Link to="/igrejas" style={{ padding: '8px 14px', borderRadius: 8, background: '#fff', border: '1px solid #cbd5e1', fontSize: 12, fontWeight: 700, color: '#334155', textDecoration: 'none' }}>Igrejas</Link>
          <Link to="/escolas" style={{ padding: '8px 14px', borderRadius: 8, background: '#fff', border: '1px solid #cbd5e1', fontSize: 12, fontWeight: 700, color: '#334155', textDecoration: 'none' }}>Escolas</Link>
        </div>
      </div>
    </div>
  )
}
