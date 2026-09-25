import React from 'react'
import { FileText, Edit2, ExternalLink, CheckCircle } from 'lucide-react'
import { useToast } from '../../hooks/useToast'

export default function SitePaginas() {
  const { toast } = useToast()
  const pages = [
    { title: 'Página Inicial (Home)', slug: '/', desc: 'Hero, categorias em destaque, benefícios e FAQ.', status: 'Ativa' },
    { title: 'Especial Jesus', slug: '/jesus', desc: 'Curadoria temática dos materiais dedicados a Cristo.', status: 'Ativa' },
    { title: 'Planos & Assinatura', slug: '/planos', desc: 'Comparativo de planos para Famílias, Igrejas e Escolas.', status: 'Ativa' },
    { title: 'Termos de Uso de Materiais', slug: '/termos', desc: 'Regras de licença de impressão e distribuição de materiais.', status: 'Ativa' },
    { title: 'Políticas de Privacidade', slug: '/privacidade', desc: 'Proteção de dados de acordo com a LGPD para famílias e crianças.', status: 'Ativa' }
  ]

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 48 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
          Páginas Institucionais do Site
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
          Gerencie o conteúdo textual e as seções das páginas oficiais sem quebrar o layout aprovado.
        </p>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '14px 16px' }}>Página</th>
              <th style={{ padding: '14px 16px' }}>Rota / Link</th>
              <th style={{ padding: '14px 16px' }}>Descrição</th>
              <th style={{ padding: '14px 16px' }}>Status</th>
              <th style={{ padding: '14px 16px', textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {pages.map(p => (
              <tr key={p.slug} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileText size={16} color="#6d28d9" />
                    <span>{p.title}</span>
                  </div>
                </td>
                <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: 12, color: '#334155' }}>
                  {p.slug}
                </td>
                <td style={{ padding: '14px 16px', color: '#64748b' }}>
                  {p.desc}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#15803d', background: '#dcfce7', padding: '3px 8px', borderRadius: 999 }}>
                    {p.status}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: 6 }}>
                    <a
                      href={`http://localhost:3000${p.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ width: 30, height: 30, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569' }}
                    >
                      <ExternalLink size={13} />
                    </a>
                    <button
                      onClick={() => toast.info(`Editar conteúdo de ${p.title}`)}
                      style={{ width: 30, height: 30, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', cursor: 'pointer' }}
                    >
                      <Edit2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
