import React from 'react'
import { EntregasCorrecoes } from '../professor/EntregasCorrecoes'
import { useSchool } from '../../hooks/useSchool'

export function AtividadesEscola() {
  const { currentSchool } = useSchool()

  return (
    <div className="s-page">
      <div className="s-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span className="s-badge s-badge--emerald">
              CORREÇÕES & ACOMPANHAMENTO
            </span>
            <span style={{ fontSize: 13, color: 'var(--s-neutral-variant)' }}>• Motor Pedagógico Compartilhado</span>
          </div>
          <h1 className="s-title">
            Entregas, Tarefas & Correções da Escola
          </h1>
          <p className="s-subtitle">
            Acompanhe as respostas dos alunos, tarefas de pintura digital, quizzes autocorrigidos e devolva feedbacks pedagógicos individuais.
          </p>
        </div>
      </div>

      {/* Componente de Correções Stitch 100% reutilizado */}
      <EntregasCorrecoes />
    </div>
  )
}
