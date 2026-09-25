import React from 'react'

export default function Colecoes() {
  return (
    <div style={{ maxWidth: 1200, margin: '48px auto', padding: '0 24px' }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Coleções Especiais</h1>
      <p style={{ fontSize: 16, color: '#64748b', marginBottom: 40 }}>
        Pacotes completos com desconto para o ano letivo, férias ou datas comemorativas.
      </p>

      <div style={{ background: '#f8fafc', padding: 40, borderRadius: 16, textAlign: 'center', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Coleções em Preparação</h3>
        <p style={{ fontSize: 14, color: '#64748b', marginTop: 8 }}>
          Os combos temáticos e kits anuais de atividades estão sendo reunidos pela nossa equipe pedagógica.
        </p>
      </div>
    </div>
  )
}
