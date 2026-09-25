import React from 'react'
import { LessonBuilder } from '../professor/LessonBuilder'
import { useSchool } from '../../hooks/useSchool'

export function AulasEscola() {
  const { currentSchool } = useSchool()

  return (
    <div className="s-page">
      <div className="s-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span className="s-badge s-badge--primary">
              PLANEJAMENTO PEDAGÓGICO
            </span>
            <span style={{ fontSize: 13, color: 'var(--s-neutral-variant)' }}>• Motor Pedagógico Compartilhado</span>
          </div>
          <h1 className="s-title">
            Planos de Aula & Conteúdos da Escola
          </h1>
          <p className="s-subtitle">
            Elabore e publique lições interativas para as turmas da escola utilizando histórias bíblicas e curriculares, quizzes, tarefas de pintura e materiais em PDF.
          </p>
        </div>
      </div>

      {/* Lesson Builder da Fase 3 100% reutilizado com organizationId da Escola */}
      <LessonBuilder organizationId={currentSchool?.id} />
    </div>
  )
}
