import React from 'react'
import {
  School,
  Shield,
  Layers,
  Users,
  Building,
  Sparkles,
  Bus
} from 'lucide-react'
import { useSchool } from '../../hooks/useSchool'

export function ConfiguracoesEscola() {
  const { currentSchool, stats, role } = useSchool()

  return (
    <div className="s-page" style={{ maxWidth: 900 }}>
      <div className="s-header">
        <div>
          <span className="s-badge s-badge--primary" style={{ marginBottom: 6 }}>Administração Institucional</span>
          <h1 className="s-title">
            Configurações da Escola
          </h1>
          <p className="s-subtitle">
            Informações da unidade escolar, turnos de funcionamento e limites do plano contratado.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Dados da Instituição */}
        <div className="s-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'var(--s-surface-variant)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Building size={20} color="var(--s-primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--s-neutral)', margin: 0 }}>
                Dados Institucionais
              </h3>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--s-neutral-variant)' }}>
                Identificação da unidade escolar e perfil cadastrado
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18 }}>
            <div>
              <span style={{ fontSize: 11, color: 'var(--s-neutral-variant)', fontWeight: 700, textTransform: 'uppercase' }}>Nome da Escola</span>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--s-neutral)', marginTop: 4 }}>
                {currentSchool?.name}
              </div>
            </div>
            <div>
              <span style={{ fontSize: 11, color: 'var(--s-neutral-variant)', fontWeight: 700, textTransform: 'uppercase' }}>Identificador / Slug</span>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--s-neutral-variant)', marginTop: 4 }}>
                {currentSchool?.slug}
              </div>
            </div>
            <div>
              <span style={{ fontSize: 11, color: 'var(--s-neutral-variant)', fontWeight: 700, textTransform: 'uppercase' }}>Tipo de Organização</span>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--s-primary)', marginTop: 4 }}>
                Escola / Instituição de Ensino
              </div>
            </div>
            <div>
              <span style={{ fontSize: 11, color: 'var(--s-neutral-variant)', fontWeight: 700, textTransform: 'uppercase' }}>Seu Nível de Acesso</span>
              <div style={{ marginTop: 4 }}>
                <span className="s-badge s-badge--emerald">
                  {role.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Resumo Operacional */}
        <div className="s-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'var(--s-surface-variant)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={20} color="var(--s-primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--s-neutral)', margin: 0 }}>
                Resumo Operacional
              </h3>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--s-neutral-variant)' }}>
                Estatísticas agregadas de alunos matriculados, turmas e transporte escolar
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14 }}>
            <div className="s-stat-card">
              <span className="s-stat-card__label">Alunos Matriculados</span>
              <span className="s-stat-card__value">{stats.totalStudents}</span>
            </div>
            <div className="s-stat-card">
              <span className="s-stat-card__label">Turmas Ativas</span>
              <span className="s-stat-card__value">{stats.totalClasses}</span>
            </div>
            <div className="s-stat-card">
              <span className="s-stat-card__label">Corpo Docente</span>
              <span className="s-stat-card__value">{stats.totalTeachers}</span>
            </div>
            <div className="s-stat-card">
              <span className="s-stat-card__label">Rotas de Van</span>
              <span className="s-stat-card__value">{stats.totalTransportRoutes}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
