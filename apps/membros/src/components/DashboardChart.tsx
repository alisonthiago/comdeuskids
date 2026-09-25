import React from 'react'
import { ChartNoAxesCombined } from 'lucide-react'

export interface DashboardChartPoint {
  label: string
  value: number
}

interface DashboardChartProps {
  title: string
  description: string
  points: DashboardChartPoint[]
  unit?: string
  kind?: 'line' | 'bar'
}

export function DashboardChart({ title, description, points, unit = '', kind = 'bar' }: DashboardChartProps) {
  const max = Math.max(...points.map(point => point.value), 1)
  const linePoints = points.map((point, index) => {
    const x = points.length <= 1 ? 50 : 4 + (index / (points.length - 1)) * 92
    const y = 86 - (point.value / max) * 72
    return `${x},${y}`
  }).join(' ')

  return (
    <section className="cdk-dashboard-chart" aria-label={title}>
      <header className="cdk-dashboard-chart__heading">
        <div className="cdk-dashboard-chart__title"><ChartNoAxesCombined size={17} aria-hidden="true" /><h2>{title}</h2></div>
        <span>{description}</span>
      </header>
      <div className="cdk-dashboard-chart__plot">
        <div className="cdk-dashboard-chart__legend"><span />{kind === 'line' ? 'Uso / atividade' : 'Total registrado'}</div>
        {points.length === 0 ? (
          <div className="cdk-dashboard-chart__empty">Ainda não há dados suficientes para exibir este gráfico.</div>
        ) : kind === 'line' ? (
          <div className="cdk-dashboard-chart__line-wrap">
            <div className="cdk-dashboard-chart__grid" aria-hidden="true"><i /><i /><i /><i /></div>
            <svg className="cdk-dashboard-chart__line" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label={`${title}: ${points.map(point => `${point.label}, ${point.value}${unit}`).join('; ')}`}>
              <polyline points={linePoints} fill="none" stroke="#F4512A" strokeWidth="1.7" vectorEffect="non-scaling-stroke" />
              {points.map((point, index) => {
                const x = points.length <= 1 ? 50 : 4 + (index / (points.length - 1)) * 92
                const y = 86 - (point.value / max) * 72
                return <circle key={`${point.label}-${index}`} cx={x} cy={y} r="1.5" fill="#F4512A" />
              })}
            </svg>
            <div className="cdk-dashboard-chart__xlabels">{points.map((point, index) => <span key={`${point.label}-${index}`} title={`${point.value}${unit}`}>{point.label}</span>)}</div>
          </div>
        ) : (
          <div className="cdk-dashboard-chart__bars">{points.map((point, index) => <div className="cdk-dashboard-chart__bar-item" key={`${point.label}-${index}`}><strong>{point.value}{unit}</strong><div className="cdk-dashboard-chart__bar-track"><i style={{ height: `${Math.max(5, point.value / max * 100)}%` }} /></div><span>{point.label}</span></div>)}</div>
        )}
      </div>
    </section>
  )
}
