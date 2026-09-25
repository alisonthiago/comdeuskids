import React from 'react'
import { Sparkles, Heart, BookOpen } from 'lucide-react'

export default function Jesus() {
  return (
    <div style={{ maxWidth: 1200, margin: '48px auto', padding: '0 24px' }}>
      <div style={{
        background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
        borderRadius: 24,
        padding: '48px 36px',
        textAlign: 'center',
        marginBottom: 48,
        border: '1px solid #ddd6fe'
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: '#7c3aed', color: '#fff', padding: '6px 14px', borderRadius: 999,
          fontSize: 13, fontWeight: 700, marginBottom: 16
        }}>
          <Sparkles size={14} /> Coleção Especial
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: '#1e1b4b', marginBottom: 12 }}>
          Conhecendo a Jesus
        </h1>
        <p style={{ fontSize: 16, color: '#4b5563', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
          Materiais dedicados a apresentar o amor, a vida, os milagres e as parábolas de Jesus de forma profunda e acessível para o coração das crianças.
        </p>
      </div>
    </div>
  )
}
