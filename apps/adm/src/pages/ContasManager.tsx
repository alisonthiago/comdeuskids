import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { cmsService } from '../lib/cmsService'
import {
  Users, Shield, CheckCircle, XCircle, Search,
  Lock, Unlock, RefreshCw, Eye, ExternalLink, ArrowRight
} from 'lucide-react'

interface AccountItem {
  id: string
  name: string
  email: string
  type: 'family' | 'church' | 'school'
  plan_name: string
  status: 'active' | 'suspended' | 'pending'
  profiles_count: number
  members_count: number
  created_at: string
}

const SEED_ACCOUNTS: AccountItem[] = [
  {
    id: 'acc-1',
    name: 'Alison Thiago (Conta Teste Master)',
    email: 'teste@teste.com.br',
    type: 'family',
    plan_name: 'Plano Família CDK',
    status: 'active',
    profiles_count: 3,
    members_count: 1,
    created_at: new Date(Date.now() - 86400000 * 10).toISOString()
  },
  {
    id: 'acc-2',
    name: 'Igreja Batista Boas Novas (Kids)',
    email: 'infantil@ibbn.org.br',
    type: 'church',
    plan_name: 'Plano Igreja & Ministério Infantil',
    status: 'active',
    profiles_count: 8,
    members_count: 5,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: 'acc-3',
    name: 'Colégio Cristão Esperança',
    email: 'ebd@colegioesperanca.com.br',
    type: 'school',
    plan_name: 'Plano Escola Cristã & EBD',
    status: 'active',
    profiles_count: 24,
    members_count: 18,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  }
]

export default function ContasManager() {
  const [accounts, setAccounts] = useState<AccountItem[]>(SEED_ACCOUNTS)
  const [selectedAccount, setSelectedAccount] = useState<AccountItem | null>(null)
  const [filterType, setFilterType] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

  const filtered = accounts.filter(acc => {
    if (filterType !== 'all' && acc.type !== filterType) return false
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase()
      return acc.name.toLowerCase().includes(q) || acc.email.toLowerCase().includes(q)
    }
    return true
  })

  const handleToggleStatus = (acc: AccountItem) => {
    const nextStatus = acc.status === 'active' ? 'suspended' : 'active'
    const updated = accounts.map(a => (a.id === acc.id ? { ...a, status: nextStatus as any } : a))
    setAccounts(updated)
    if (selectedAccount?.id === acc.id) {
      setSelectedAccount({ ...selectedAccount, status: nextStatus as any })
    }
    cmsService.logAdminAction(
      nextStatus === 'active' ? 'Reativar Conta' : 'Suspender Conta',
      'account',
      acc.id,
      { email: acc.email }
    )
  }

  const handleChangePlan = (acc: AccountItem, newPlan: string) => {
    const updated = accounts.map(a => (a.id === acc.id ? { ...a, plan_name: newPlan } : a))
    setAccounts(updated)
    if (selectedAccount?.id === acc.id) {
      setSelectedAccount({ ...selectedAccount, plan_name: newPlan })
    }
    cmsService.logAdminAction('Troca Manual de Plano', 'account', acc.id, { newPlan })
  }

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1300, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e1b4b', margin: 0 }}>
            Gerenciamento de Contas & Organizações
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: '4px 0 0' }}>
            Controle de famílias, igrejas, escolas, membros com login próprio e perfis de streaming.
          </p>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div style={{
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 260 }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 360 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Buscar por nome ou e-mail..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%', padding: '9px 12px 9px 36px', borderRadius: 8,
                border: '1px solid #cbd5e1', fontSize: 13, outline: 'none'
              }}
            />
          </div>

          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, color: '#475569', background: '#fff' }}
          >
            <option value="all">Todos os Tipos de Conta</option>
            <option value="family">Famílias</option>
            <option value="church">Igrejas</option>
            <option value="school">Escolas</option>
          </select>
        </div>

        <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>
          {filtered.length} contas cadastradas
        </div>
      </div>

      {/* Tabela de Contas */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
              <th style={{ padding: '12px 16px' }}>Titular / Organização</th>
              <th style={{ padding: '12px 16px' }}>Tipo</th>
              <th style={{ padding: '12px 16px' }}>Plano Atual</th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}>Perfis</th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}>Membros</th>
              <th style={{ padding: '12px 16px' }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Ações Master</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(acc => {
              const isActive = acc.status === 'active'
              return (
                <tr key={acc.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <strong style={{ color: '#1e293b', display: 'block' }}>{acc.name}</strong>
                    <span style={{ color: '#64748b', fontSize: 12 }}>{acc.email}</span>
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                      background: acc.type === 'family' ? '#f0fdf4' : acc.type === 'church' ? '#ede9fe' : '#eff6ff',
                      color: acc.type === 'family' ? '#15803d' : acc.type === 'church' ? '#7c3aed' : '#2563eb'
                    }}>
                      {acc.type === 'family' ? 'Família' : acc.type === 'church' ? 'Igreja' : 'Escola'}
                    </span>
                  </td>

                  <td style={{ padding: '12px 16px', color: '#334155', fontWeight: 600 }}>
                    {acc.plan_name}
                  </td>

                  <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: '#7c3aed' }}>
                    {acc.profiles_count}
                  </td>

                  <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: '#2563eb' }}>
                    {acc.members_count}
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                      background: isActive ? '#dcfce7' : '#fee2e2',
                      color: isActive ? '#15803d' : '#b91c1c'
                    }}>
                      {isActive ? '● Ativa' : '○ Suspensa'}
                    </span>
                  </td>

                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <button
                        onClick={() => {
                          setSelectedAccount(acc)
                          setModalOpen(true)
                        }}
                        style={{ padding: '6px 12px', background: '#ede9fe', color: '#7c3aed', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                      >
                        Gerenciar
                      </button>

                      <button
                        onClick={() => handleToggleStatus(acc)}
                        title={isActive ? 'Suspender Acesso' : 'Reativar Acesso'}
                        style={{
                          padding: 6, background: 'none', border: 'none', cursor: 'pointer',
                          color: isActive ? '#ef4444' : '#10b981'
                        }}
                      >
                        {isActive ? <Lock size={15} /> : <Unlock size={15} />}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Modal de Detalhes da Conta */}
      {modalOpen && selectedAccount && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20
        }} onClick={() => setModalOpen(false)}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 560, width: '100%', padding: 28 }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 6px', fontSize: 20, color: '#1e293b' }}>
              Painel Master: {selectedAccount.name}
            </h2>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: '#64748b' }}>
              E-mail: {selectedAccount.email} • Tipo: {selectedAccount.type.toUpperCase()}
            </p>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 18, marginBottom: 20 }}>
              <h4 style={{ margin: '0 0 10px', fontSize: 14, color: '#1e293b' }}>Trocar Plano de Assinatura:</h4>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['Plano Família CDK', 'Plano Igreja & Ministério Infantil', 'Plano Escola Cristã & EBD'].map(pName => (
                  <button
                    key={pName}
                    onClick={() => handleChangePlan(selectedAccount, pName)}
                    style={{
                      padding: '8px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      border: selectedAccount.plan_name === pName ? '1px solid #7c3aed' : '1px solid #cbd5e1',
                      background: selectedAccount.plan_name === pName ? '#ede9fe' : '#fff',
                      color: selectedAccount.plan_name === pName ? '#7c3aed' : '#475569'
                    }}
                  >
                    {pName}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 18, marginBottom: 20 }}>
              <h4 style={{ margin: '0 0 8px', fontSize: 14, color: '#1e293b' }}>Status de Acesso Master:</h4>
              <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 12px' }}>
                Status atual: <strong>{selectedAccount.status === 'active' ? 'Liberado' : 'Bloqueado'}</strong>
              </p>
              <button
                onClick={() => handleToggleStatus(selectedAccount)}
                style={{
                  padding: '8px 16px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  background: selectedAccount.status === 'active' ? '#fee2e2' : '#dcfce7',
                  color: selectedAccount.status === 'active' ? '#b91c1c' : '#15803d'
                }}
              >
                {selectedAccount.status === 'active' ? 'Suspender Conta Manualmente' : 'Reativar Conta Manualmente'}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setModalOpen(false)}
                style={{ padding: '8px 20px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >
                Concluído
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
