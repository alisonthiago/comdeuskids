import React, { useState } from 'react'
import { Puzzle, CheckSquare, Download, Clock, Users, BookOpen, Sparkles, Check } from 'lucide-react'

export default function BrincadeiraMemberView({
  productId,
  productTitle,
  activeTab
}: {
  productId: string
  productTitle: string
  activeTab: string
}) {
  const [checklist, setChecklist] = useState([
    { id: '1', item: '1 rolo de fita crepe para demarcar o chão', checked: true },
    { id: '2', item: '20 balões coloridos (bexigas)', checked: true },
    { id: '3', item: 'Fichas com versículos bíblicos impressas', checked: false },
    { id: '4', item: 'Caixa de som para música alegre de fundo', checked: false },
    { id: '5', item: 'Docinhos ou brindes para todos os participantes', checked: false }
  ])

  const toggleCheck = (id: string) => {
    setChecklist(prev =>
      prev.map(i => (i.id === id ? { ...i, checked: !i.checked } : i))
    )
  }

  if (activeTab === 'materiais') {
    return (
      <div style={{ marginTop: 20, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
          Checklist de Materiais para a Dinâmica
        </h3>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 18 }}>
          Marque os itens que você já providenciou para a realização no culto infantil ou em família:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {checklist.map(item => (
            <label
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                borderRadius: 8,
                background: item.checked ? '#f0fdf4' : '#f8fafc',
                border: item.checked ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  background: item.checked ? '#16a34a' : '#fff',
                  border: item.checked ? 'none' : '1px solid #cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff'
                }}
              >
                {item.checked && <Check size={14} />}
              </div>
              <span style={{ fontSize: 13, color: item.checked ? '#15803d' : '#334155', textDecoration: item.checked ? 'line-through' : 'none', fontWeight: item.checked ? 600 : 500 }}>
                {item.item}
              </span>
            </label>
          ))}
        </div>
      </div>
    )
  }

  if (activeTab === 'imprimiveis') {
    return (
      <div style={{ marginTop: 20, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
          Anexos Prontos para Imprimir
        </h3>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 18 }}>
          Cartelas, fichas de pistas e perguntas formatadas para corte rápido.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 6, background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 11 }}>PDF</div>
              <div>
                <b style={{ display: 'block', fontSize: 13, color: '#1e293b' }}>Fichas de Pistas Bíblicas.pdf</b>
                <small style={{ color: '#94a3b8' }}>4 páginas · Formato A4</small>
              </div>
            </div>
            <button
              onClick={() => alert('Baixando PDF de pistas para imprimir')}
              style={{ padding: '6px 12px', background: '#eff4fe', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: 5, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
            >
              Baixar
            </button>
          </div>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 6, background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 11 }}>PDF</div>
              <div>
                <b style={{ display: 'block', fontSize: 13, color: '#1e293b' }}>Cartelas do Bingo dos Discípulos.pdf</b>
                <small style={{ color: '#94a3b8' }}>15 cartelas diferentes</small>
              </div>
            </div>
            <button
              onClick={() => alert('Baixando Cartelas de Bingo')}
              style={{ padding: '6px 12px', background: '#eff4fe', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: 5, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
            >
              Baixar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ marginTop: 20 }}>
      {/* Versículo-Chave da Dinâmica */}
      <div
        style={{
          background: 'linear-gradient(135deg, #fef9c3 0%, #fef08a 100%)',
          border: '1px solid #fde047',
          borderRadius: 10,
          padding: '16px 20px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 14
        }}
      >
        <BookOpen size={24} color="#854d0e" />
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#854d0e' }}>
            Versículo Bíblico Base
          </span>
          <p style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 600, color: '#713f12' }}>
            "Revesti-vos de toda a armadura de Deus, para que possais estar firmes contra as astutas ciladas do diabo." — Efésios 6:11
          </p>
        </div>
      </div>

      {/* Cartões Rápidos de Informação */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '14px 16px' }}>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>DURAÇÃO ESTIMADA</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <Clock size={16} color="#2563eb" />
            <b style={{ fontSize: 15, color: '#1e293b' }}>30 a 45 minutos</b>
          </div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '14px 16px' }}>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>PARTICIPANTES</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <Users size={16} color="#10b981" />
            <b style={{ fontSize: 15, color: '#1e293b' }}>6 a 25 crianças</b>
          </div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '14px 16px' }}>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>FAIXA ETÁRIA</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <Sparkles size={16} color="#f59e0b" />
            <b style={{ fontSize: 15, color: '#1e293b' }}>5 a 12 anos</b>
          </div>
        </div>
      </div>

      {/* Roteiro Passo a Passo */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 16 }}>
          Roteiro Passo a Passo da Dinâmica
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 14 }}>
            <span style={{ width: 28, height: 28, borderRadius: '50%', background: '#eff4fe', color: '#2563eb', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              1
            </span>
            <div>
              <b style={{ display: 'block', fontSize: 14, color: '#1e293b', marginBottom: 3 }}>Acolhida e Formação dos Grupos</b>
              <p style={{ margin: 0, fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                Reúna as crianças em semicírculo no tapete. Apresente o tema do dia com entusiasmo e divida a turma em equipes equilibradas (ex: Equipe Fé e Equipe Esperança).
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 14 }}>
            <span style={{ width: 28, height: 28, borderRadius: '50%', background: '#eff4fe', color: '#2563eb', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              2
            </span>
            <div>
              <b style={{ display: 'block', fontSize: 14, color: '#1e293b', marginBottom: 3 }}>Como Funciona a Brincadeira</b>
              <p style={{ margin: 0, fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                Cada equipe deve cumprir os desafios das pistas bíblicas no menor tempo possível, cooperando uns com os outros sem empurrões.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 14 }}>
            <span style={{ width: 28, height: 28, borderRadius: '50%', background: '#eff4fe', color: '#2563eb', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              3
            </span>
            <div>
              <b style={{ display: 'block', fontSize: 14, color: '#1e293b', marginBottom: 3 }}>Conclusão e Aplicação Espiritual</b>
              <p style={{ margin: 0, fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                Reúna todos para a reflexão final: assim como na dinâmica precisamos trabalhar juntos e seguir as instruções, na vida precisamos obedecer à Palavra de Deus para vencer qualquer desafio.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
