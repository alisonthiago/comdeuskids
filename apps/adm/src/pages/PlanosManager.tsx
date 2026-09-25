import React, { useState, useEffect } from 'react'
import { cmsService } from '../lib/cmsService'
import { Users, Shield, Save, Check, Sparkles, Edit2, Tag } from 'lucide-react'

export interface PlanItem {
  id: string
  name: string
  slug: string
  description?: string
  target_role?: string
  target_audience?: string
  price_monthly: number
  price_yearly: number
  max_users?: number
  max_downloads?: number
  includes_all?: boolean
  status: 'active' | 'inactive' | 'archived'
  cta_text?: string
  is_featured?: boolean
  sort_order?: number
  prices?: Array<{
    id: string
    billing_cycle: 'monthly' | 'yearly'
    amount_cents: number
  }>
}

export default function PlanosManager() {
  const [plans, setPlans] = useState<PlanItem[]>([])
  const [editingPlan, setEditingPlan] = useState<PlanItem | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [savedSuccess, setSavedSuccess] = useState(false)

  const loadData = async () => {
    setLoading(true)
    const list = await cmsService.getPlansConfig()
    setPlans(list)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleEdit = (plan: PlanItem) => {
    setEditingPlan({ ...plan })
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPlan) return

    await cmsService.savePlanConfig(editingPlan)
    setModalOpen(false)
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
    await loadData()
  }

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e1b4b', margin: 0 }}>
            Planos Comerciais Oficiais & Preços
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: '4px 0 0' }}>
            Gerencie os 4 planos canônicos (Família, Professor, Igreja, Escola) conectados diretamente ao banco e preços oficiais.
          </p>
        </div>

        {savedSuccess && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#dcfce7', color: '#15803d', padding: '8px 16px',
            borderRadius: 8, fontSize: 13, fontWeight: 700
          }}>
            <Check size={16} /> Preços e parâmetros atualizados!
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>Carregando planos canônicos...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {plans.map(plan => {
            const audienceLabel =
              plan.slug === 'familia' || plan.target_audience === 'family'
                ? 'Famílias & Pais'
                : plan.slug === 'professor' || plan.target_audience === 'teacher'
                ? 'Professores & EBD'
                : plan.slug === 'igreja' || plan.target_audience === 'church'
                ? 'Igrejas & Ministérios'
                : 'Escolas Cristãs'

            const badgeBg =
              plan.slug === 'familia' ? '#ede9fe' : plan.slug === 'professor' ? '#fef3c7' : plan.slug === 'igreja' ? '#dcfce7' : '#e0f2fe'
            const badgeColor =
              plan.slug === 'familia' ? '#7c3aed' : plan.slug === 'professor' ? '#b45309' : plan.slug === 'igreja' ? '#15803d' : '#0369a1'

            return (
              <div
                key={plan.id}
                style={{
                  background: '#fff',
                  border: plan.is_featured ? '2px solid #7c3aed' : '1px solid #e2e8f0',
                  borderRadius: 16,
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  boxShadow: plan.is_featured ? '0 8px 24px rgba(124, 58, 237, 0.12)' : '0 4px 16px rgba(0,0,0,0.03)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 999,
                    background: badgeBg, color: badgeColor
                  }}>
                    {audienceLabel.toUpperCase()}
                  </span>

                  <span style={{
                    fontSize: 12, fontWeight: 700,
                    color: plan.status === 'active' ? '#16a34a' : '#94a3b8'
                  }}>
                    ● {plan.status === 'active' ? 'Ativo no Site' : 'Inativo / Teste'}
                  </span>
                </div>

                <div>
                  <h3 style={{ margin: 0, fontSize: 18, color: '#1e293b' }}>{plan.name}</h3>
                  <p style={{ margin: '6px 0 0', fontSize: 13, color: '#64748b', minHeight: 38 }}>
                    {plan.description || 'Plano oficial Com Deus Kids'}
                  </p>
                </div>

                {/* Preços Mensal e Anual */}
                <div style={{ background: '#f8fafc', borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 12, color: '#64748b' }}>Mensal:</span>
                    <strong style={{ fontSize: 18, color: '#0f172a' }}>
                      R$ {Number(plan.price_monthly || 0).toFixed(2).replace('.', ',')}
                      <small style={{ fontSize: 11, fontWeight: 500, color: '#64748b' }}>/mês</small>
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 12, color: '#64748b' }}>Anual:</span>
                    <strong style={{ fontSize: 14, color: '#7c3aed' }}>
                      R$ {Number(plan.price_yearly || 0).toFixed(2).replace('.', ',')}
                      <small style={{ fontSize: 11, fontWeight: 500, color: '#64748b' }}>/ano</small>
                    </strong>
                  </div>
                </div>

                {/* Limites e CTA */}
                <div style={{ fontSize: 13, color: '#475569', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Limite de Usuários/Alunos:</span>
                    <strong>{plan.max_users || 5}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Botão CTA:</span>
                    <span style={{ fontWeight: 600, color: '#7c3aed' }}>{plan.cta_text || 'Assinar Agora'}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleEdit(plan)}
                  style={{
                    marginTop: 'auto',
                    padding: '10px 14px',
                    background: '#f1f5f9',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  <Edit2 size={14} /> Editar Valores & Regras
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal de Edição */}
      {modalOpen && editingPlan && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            style={{ background: '#fff', borderRadius: 16, maxWidth: 540, width: '100%', padding: 28 }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ margin: '0 0 16px', fontSize: 18, color: '#1e293b' }}>
              Editar Plano: {editingPlan.name}
            </h2>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                  Nome Comercial
                </label>
                <input
                  type="text"
                  required
                  value={editingPlan.name}
                  onChange={e => setEditingPlan({ ...editingPlan, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                  Descrição Curta
                </label>
                <input
                  type="text"
                  value={editingPlan.description || ''}
                  onChange={e => setEditingPlan({ ...editingPlan, description: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
              </div>

              {/* Preço Mensal e Preço Anual */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                    Preço Mensal (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingPlan.price_monthly}
                    onChange={e => setEditingPlan({ ...editingPlan, price_monthly: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                    Preço Anual (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingPlan.price_yearly}
                    onChange={e => setEditingPlan({ ...editingPlan, price_yearly: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </div>
              </div>

              {/* Limite de Usuários e CTA */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                    Limite Usuários / Alunos
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editingPlan.max_users || 5}
                    onChange={e => setEditingPlan({ ...editingPlan, max_users: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                    Texto do Botão CTA
                  </label>
                  <input
                    type="text"
                    value={editingPlan.cta_text || 'Assinar Agora'}
                    onChange={e => setEditingPlan({ ...editingPlan, cta_text: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </div>
              </div>

              {/* Status e Destaque */}
              <div style={{ display: 'flex', gap: 24, marginTop: 4 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={editingPlan.status === 'active'}
                    onChange={e => setEditingPlan({ ...editingPlan, status: e.target.checked ? 'active' : 'inactive' })}
                  />
                  <span>Plano Ativo no Site</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={editingPlan.is_featured || false}
                    onChange={e => setEditingPlan({ ...editingPlan, is_featured: e.target.checked })}
                  />
                  <span>Destaque Comercial ("Mais Escolhido")</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff', fontSize: 13, cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: 6, border: 'none', background: '#7c3aed', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                >
                  Salvar Plano Oficial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
