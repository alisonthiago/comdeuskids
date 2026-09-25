import React from 'react'
import { LessonBuilder } from '../professor/LessonBuilder'
import { useChurch } from '../../hooks/useChurch'

export function AulasIgreja() {
  const { currentChurch } = useChurch()

  return (
    <div className="s-page">
      <div className="s-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span className="s-badge s-badge--emerald">
              EBD & MINISTÉRIO INFANTIL
            </span>
            <span style={{ fontSize: 13, color: 'var(--s-neutral-variant)' }}>• Motor Pedagógico Compartilhado</span>
          </div>
          <h1 className="s-title">
            Lições Bíblicas da Igreja
          </h1>
          <p className="s-subtitle">
            Planeje e publique lições interativas para as classes bíblicas da igreja utilizando histórias, quizzes, tarefas de pintura e materiais em PDF.
          </p>
        </div>
      </div>

      {/* Lesson Builder da Fase 3 100% reutilizado com organizationId da Igreja */}
      <LessonBuilder organizationId={currentChurch?.id} />
    </div>
  )
}
