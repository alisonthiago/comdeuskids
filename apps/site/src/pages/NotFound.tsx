import React from 'react'
import { Link } from 'react-router-dom'
import { Home, Search, Sparkles } from 'lucide-react'

export default function NotFound() {
  return (
    <div style={{
      maxWidth: 600,
      margin: '80px auto',
      padding: '0 24px',
      textAlign: 'center',
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 80,
        height: 80,
        borderRadius: 24,
        background: '#f5f3ff',
        color: '#7c3aed',
        marginBottom: 24,
        boxShadow: '0 10px 25px rgba(124, 58, 237, 0.15)'
      }}>
        <Sparkles size={40} />
      </div>

      <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>
        Página não encontrada (404)
      </h1>
      <p style={{ fontSize: 16, color: '#64748b', lineHeight: 1.6, marginBottom: 32 }}>
        O conteúdo que você procurava não existe ou mudou de endereço. Que tal voltar para a página inicial ou explorar nossas atividades?
      </p>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 24px',
            background: '#7c3aed',
            color: '#fff',
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 15,
            textDecoration: 'none',
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)'
          }}
        >
          <Home size={18} />
          Voltar ao Início
        </Link>
        <Link
          to="/categorias"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 24px',
            background: '#f1f5f9',
            color: '#334155',
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 15,
            textDecoration: 'none',
            border: '1px solid #e2e8f0'
          }}
        >
          <Search size={18} />
          Ver Categorias
        </Link>
      </div>
    </div>
  )
}
