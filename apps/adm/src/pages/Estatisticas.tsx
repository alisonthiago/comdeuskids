import React from 'react'
import { BarChart3 } from 'lucide-react'

export default function Estatisticas() {
  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 style={{ fontSize:22, fontWeight:700, color:'#111', margin:0 }}>Estatísticas</h1>
          <p style={{ margin:'4px 0 0', fontSize:13, color:'#888' }}>Análise de vendas e desempenho</p>
        </div>
      </div>
      <div className="cdk-card-flush">
        <div className="empty-state">
          <div className="empty-state-icon"><BarChart3 size={22} /></div>
          <h3>Estatísticas em breve</h3>
          <p>Gráficos e análises detalhadas de vendas por canal, produto e período.</p>
        </div>
      </div>
    </div>
  )
}
