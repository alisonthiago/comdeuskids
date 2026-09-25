import React, { useState } from 'react'
import { Menu, Plus, CheckCircle, ExternalLink, MoveVertical, Eye } from 'lucide-react'
import { useToast } from '../../hooks/useToast'

export default function SiteMenus() {
  const { toast } = useToast()
  const [headerLinks, setHeaderLinks] = useState([
    { id: '1', title: 'Início', target: '/', active: true },
    { id: '2', title: 'Categorias', target: '/categorias', active: true },
    { id: '3', title: 'Temas Bíblicos', target: '/temas', active: true },
    { id: '4', title: 'Coleções', target: '/colecoes', active: true },
    { id: '5', title: '✨ Especial Jesus', target: '/jesus', active: true },
    { id: '6', title: 'Planos & Assinatura', target: '/planos', active: true },
  ])

  const [footerLinks, setFooterLinks] = useState([
    { id: 'f1', group: 'Empresa', title: 'Sobre o Com Deus Kids', target: '/sobre', active: true },
    { id: 'f2', group: 'Empresa', title: 'Termos de Uso', target: '/termos', active: true },
    { id: 'f3', group: 'Empresa', title: 'Políticas de Privacidade', target: '/privacidade', active: true },
    { id: 'f4', group: 'Produtos', title: 'Cadernos para Colorir', target: '/categoria/colorir', active: true },
    { id: 'f5', group: 'Produtos', title: 'Labirintos Bíblicos', target: '/categoria/labirintos', active: true },
    { id: 'f6', group: 'Produtos', title: 'Histórias Bíblicas em PDF', target: '/categoria/historias', active: true },
    { id: 'f7', group: 'Comece Agora', title: 'Planos para Famílias', target: '/planos', active: true },
    { id: 'f8', group: 'Comece Agora', title: 'Planos para Igrejas & EBD', target: '/planos', active: true },
  ])

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 48 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
          Menus de Navegação do Site
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
          Gerencie os links exibidos no Cabeçalho (Header) e no Rodapé (Footer) oficial.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 24 }}>
        {/* Menu do Cabeçalho */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>Menu Principal (Header)</h2>
              <span style={{ fontSize: 12, color: '#64748b' }}>Links da barra de navegação superior</span>
            </div>
            <button
              onClick={() => toast.info('Adicionar link ao menu principal')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
            >
              <Plus size={14} /> Adicionar Item
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {headerLinks.map((item, index) => (
              <div
                key={item.id}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700 }}>#{index + 1}</span>
                  <strong style={{ color: '#1e293b' }}>{item.title}</strong>
                  <span style={{ fontSize: 11, color: '#64748b', background: '#fff', border: '1px solid #e2e8f0', padding: '2px 6px', borderRadius: 4 }}>{item.target}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#15803d', background: '#dcfce7', padding: '2px 6px', borderRadius: 4 }}>Ativo</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Menu do Rodapé */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>Menu do Rodapé (Footer)</h2>
              <span style={{ fontSize: 12, color: '#64748b' }}>Seções Empresa, Produtos e Comece Agora</span>
            </div>
            <button
              onClick={() => toast.info('Adicionar link ao rodapé')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
            >
              <Plus size={14} /> Adicionar Item
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {footerLinks.map((item, index) => (
              <div
                key={item.id}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#6d28d9', background: '#ede9fe', padding: '2px 6px', borderRadius: 4 }}>{item.group}</span>
                  <span style={{ color: '#1e293b', fontWeight: 600 }}>{item.title}</span>
                </div>
                <span style={{ fontSize: 11, color: '#64748b' }}>{item.target}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
