import React, { useState, useEffect } from 'react'
import { cmsService } from '../lib/cmsService'
import { AdminActivityLog } from '@comdeuskids/types'
import { Clock, Shield, Search, Terminal } from 'lucide-react'

export default function LogsManager() {
  const [logs, setLogs] = useState<AdminActivityLog[]>([])

  useEffect(() => {
    cmsService.getAdminLogs().then(setLogs)
  }, [])

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e1b4b', margin: 0 }}>
          Logs de Auditoria & Ações Administrativas
        </h1>
        <p style={{ color: '#64748b', fontSize: 14, margin: '4px 0 0' }}>
          Registro de ações de publicação, edição de carrosséis, criação de conteúdo e trocas de plano.
        </p>
      </div>

      {logs.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 40, textAlign: 'center', color: '#64748b' }}>
          <Clock size={36} color="#94a3b8" style={{ marginBottom: 8 }} />
          <p>Nenhuma ação registrada nos logs recentemente.</p>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                <th style={{ padding: '12px 16px', width: 180 }}>Data / Hora</th>
                <th style={{ padding: '12px 16px' }}>Administrador</th>
                <th style={{ padding: '12px 16px' }}>Ação Realizada</th>
                <th style={{ padding: '12px 16px' }}>Entidade</th>
                <th style={{ padding: '12px 16px' }}>Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', color: '#64748b' }}>
                    {new Date(log.created_at).toLocaleString('pt-BR')}
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1e293b' }}>
                    {log.admin_email}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: '#ede9fe', color: '#7c3aed' }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#475569', textTransform: 'capitalize' }}>
                    {log.entity_type}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#64748b', fontSize: 12 }}>
                    {log.details ? JSON.stringify(log.details) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
