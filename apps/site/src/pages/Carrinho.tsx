import React from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, ArrowRight } from 'lucide-react'

export default function Carrinho() {
  return (
    <div style={{ maxWidth: 800, margin: '60px auto', padding: '0 24px', textAlign: 'center' }}>
      <div style={{
        width: 64, height: 64, borderRadius: 20, background: '#f5f3ff', color: '#7c3aed',
        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
      }}>
        <ShoppingBag size={32} />
      </div>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Seu Carrinho</h1>
      <p style={{ fontSize: 15, color: '#64748b', marginBottom: 32 }}>
        Navegue pelas nossas categorias para adicionar cadernos e atividades bíblicas ao seu carrinho.
      </p>
      <Link
        to="/categorias"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px',
          background: '#7c3aed', color: '#fff', borderRadius: 10, fontWeight: 700, fontSize: 15
        }}
      >
        Explorar Materiais <ArrowRight size={16} />
      </Link>
    </div>
  )
}
