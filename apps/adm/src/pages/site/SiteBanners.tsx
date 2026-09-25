import React, { useState } from 'react'
import { Film, Plus, Edit2, Trash2, Calendar, ExternalLink } from 'lucide-react'
import { useToast } from '../../hooks/useToast'

export default function SiteBanners() {
  const { toast } = useToast()
  const [banners, setBanners] = useState([
    {
      id: '1',
      title: 'Kit Heróis da Fé — 50 Atividades',
      subtitle: 'Ensine a Bíblia com histórias bíblicas ilustradas',
      cta: 'Ver Materiais',
      target: '/categoria/historias',
      location: 'Home Topo (Hero)',
      status: 'active',
      desktopUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1200&q=80',
      validUntil: '31/12/2026'
    },
    {
      id: '2',
      title: 'Especial Páscoa com Jesus',
      subtitle: 'Cadernos de colorir e devocionais de Páscoa',
      cta: 'Acessar Especial',
      target: '/tema/pascoa',
      location: 'Faixa Promocional Intermediária',
      status: 'active',
      desktopUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&q=80',
      validUntil: '15/04/2026'
    }
  ])

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 48 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            Banners Promocionais do Site
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
            Controle os banners e faixas promocionais nos espaços oficiais previstos no design do site.
          </p>
        </div>

        <button
          onClick={() => toast.info('Formulário de cadastro de novo banner')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, background: '#2563eb',
            color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px',
            fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,0.25)'
          }}
        >
          <Plus size={16} /> Novo Banner
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
        {banners.map(b => (
          <div key={b.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ height: 160, background: `url(${b.desktopUrl}) center/cover`, position: 'relative' }}>
              <span style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999 }}>
                {b.location}
              </span>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{b.title}</div>
              <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>{b.subtitle}</div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
                <span style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={13} /> Até {b.validUntil}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => toast.info('Editar banner')} style={{ width: 30, height: 30, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', cursor: 'pointer' }}>
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => toast.info('Excluir banner')} style={{ width: 30, height: 30, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', cursor: 'pointer' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
