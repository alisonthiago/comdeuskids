import React, { useEffect, useState } from 'react'
import { Users, Search, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

interface Customer {
  id: string
  full_name: string | null
  email: string
  phone: string | null
  role: string
  organization_name: string | null
  created_at: string
}

export default function Clientes() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadCustomers()
  }, [])

  async function loadCustomers() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, role, organization_name, created_at')
        .order('created_at', { ascending: false })
        .limit(100)
      if (data && !error) setCustomers(data as Customer[])
    } catch (err) {
      console.error('Erro ao buscar clientes:', err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = customers.filter(c =>
    (c.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.organization_name || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1200, margin: '0 auto', fontFamily: 'inherit' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e1b4b', margin: 0 }}>Central de Clientes</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
            {customers.length} usuários cadastrados em todos os contextos (Famílias, Professores, Igrejas e Escolas).
          </p>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 16px', marginBottom: 20 }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            placeholder="Buscar por nome, e-mail ou organização…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '10px 14px 10px 38px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              fontSize: 14,
              fontFamily: 'inherit'
            }}
          />
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
            <div className="spinner" style={{ margin: '0 auto 12px' }} /> Carregando clientes...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
            <Users size={32} color="#94a3b8" style={{ marginBottom: 12 }} />
            <h3 style={{ margin: 0, fontSize: 16, color: '#1e293b' }}>Nenhum cliente encontrado</h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#94a3b8' }}>
              Os usuários cadastrados na plataforma aparecerão nesta lista.
            </p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                <th style={{ padding: '12px 16px' }}>Cliente</th>
                <th style={{ padding: '12px 16px' }}>E-mail</th>
                <th style={{ padding: '12px 16px' }}>Telefone</th>
                <th style={{ padding: '12px 16px' }}>Perfil / Contexto</th>
                <th style={{ padding: '12px 16px' }}>Cadastro</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 10,
                        background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0
                      }}>
                        {(c.full_name || c.email || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <strong style={{ display: 'block', color: '#0f172a' }}>{c.full_name || 'Usuário'}</strong>
                        {c.organization_name && (
                          <span style={{ fontSize: 11, color: '#64748b' }}>{c.organization_name}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#475569' }}>{c.email}</td>
                  <td style={{ padding: '12px 16px', color: '#64748b' }}>{c.phone || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
                      background: '#ede9fe', color: '#7c3aed', textTransform: 'uppercase'
                    }}>
                      {c.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#64748b', fontSize: 12 }}>
                    {new Date(c.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <Link
                      to={`/admin/clientes/${c.id}`}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '5px 12px', borderRadius: 6, background: '#f8fafc',
                        border: '1px solid #cbd5e1', color: '#334155',
                        textDecoration: 'none', fontSize: 12, fontWeight: 600
                      }}
                    >
                      Visão 360 <ChevronRight size={13} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
