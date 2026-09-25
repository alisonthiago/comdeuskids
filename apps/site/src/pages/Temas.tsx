import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@comdeuskids/supabase'

export default function Temas() {
  const [themes, setThemes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('themes').select('*').order('name', { ascending: true })
      .then(({ data }) => {
        if (data) setThemes(data)
        setLoading(false)
      })
  }, [])

  return (
    <div style={{ maxWidth: 1200, margin: '48px auto', padding: '0 24px' }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Histórias & Temas Bíblicos</h1>
      <p style={{ fontSize: 16, color: '#64748b', marginBottom: 40 }}>
        Encontre materiais específicos para aulas da EBD, cultos infantis ou devocionais em família por personagem ou história da Bíblia.
      </p>

      {loading ? (
        <div>Carregando temas...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {themes.map(t => (
            <Link
              key={t.id}
              to={`/tema/${t.slug}`}
              style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: 14,
                padding: '20px',
                display: 'block'
              }}
            >
              <span style={{ fontSize: 20 }}>📜</span>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginTop: 8 }}>{t.name}</h3>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
