import React from 'react'
import {
  Church,
  Shield,
  Layers,
  Users,
  CheckCircle2,
  Lock,
  Building,
  Sparkles
} from 'lucide-react'
import { useChurch } from '../../hooks/useChurch'

export function ConfiguracoesIgreja() {
  const { currentChurch, stats, role } = useChurch()

  return (
    <div className="s-page" style={{ maxWidth: 900 }}>
      <div className="s-header">
        <div>
          <span className="s-badge s-badge--primary" style={{ marginBottom: 6 }}>Administração Institucional</span>
          <h1 className="s-title">
            Configurações da Igreja
          </h1>
          <p className="s-subtitle">
            Informações da congregação, papéis e limites institucionais contratados.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Dados da Organização */}
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
                Identificação do ministério infantil e credenciais
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18 }}>
            <div>
              <span style={{ fontSize: 11, color: 'var(--s-neutral-variant)', fontWeight: 700, textTransform: 'uppercase' }}>Nome da Igreja / Ministério</span>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--s-neutral)', marginTop: 4 }}>
                {currentChurch?.name}
              </div>
            </div>
            <div>
              <span style={{ fontSize: 11, color: 'var(--s-neutral-variant)', fontWeight: 700, textTransform: 'uppercase' }}>Identificador / Slug</span>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--s-neutral-variant)', marginTop: 4 }}>
                {currentChurch?.slug}
              </div>
            </div>
            <div>
              <span style={{ fontSize: 11, color: 'var(--s-neutral-variant)', fontWeight: 700, textTransform: 'uppercase' }}>Tipo de Entidade</span>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--s-primary)', marginTop: 4 }}>
                Igreja / Ministério Infantil
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

        {/* Limites e Métricas do Plano */}
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
                Estatísticas agregadas de membros e classes ativas
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14 }}>
            <div className="s-stat-card">
              <span className="s-stat-card__label">Crianças Ativas</span>
              <span className="s-stat-card__value">{stats.totalKids}</span>
            </div>
            <div className="s-stat-card">
              <span className="s-stat-card__label">Classes Bíblicas</span>
              <span className="s-stat-card__value">{stats.totalClasses}</span>
            </div>
            <div className="s-stat-card">
              <span className="s-stat-card__label">Equipe Kids</span>
              <span className="s-stat-card__value">{stats.totalTeam}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
