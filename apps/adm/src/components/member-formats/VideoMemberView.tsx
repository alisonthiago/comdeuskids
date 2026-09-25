import React, { useState } from 'react'
import { Video, Play, BookOpen, Download, Clock, CheckCircle } from 'lucide-react'

export default function VideoMemberView({
  productId,
  productTitle,
  activeTab
}: {
  productId: string
  productTitle: string
  activeTab: string
}) {
  const [isPlaying, setIsPlaying] = useState(false)

  if (activeTab === 'materiais') {
    return (
      <div style={{ marginTop: 20, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
          Materiais de Apoio deste Vídeo
        </h3>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 18 }}>
          Arquivos complementares para download citados durante a aula/vídeo.
        </p>

        <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 450 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 6, background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 11 }}>PDF</div>
            <div>
              <b style={{ display: 'block', fontSize: 13, color: '#1e293b' }}>Molde de Atividade do Vídeo.pdf</b>
              <small style={{ color: '#94a3b8' }}>1.2 MB · Pronto para imprimir</small>
            </div>
          </div>
          <button
            onClick={() => alert('Iniciando download do material complementar')}
            style={{ padding: '6px 12px', background: '#eff4fe', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: 5, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            Baixar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ background: '#0f172a', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ position: 'relative', paddingTop: '48%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {!isPlaying ? (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <button
                onClick={() => setIsPlaying(true)}
                style={{ width: 64, height: 64, borderRadius: '50%', background: '#2563eb', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: 10 }}
              >
                <Play size={28} fill="#fff" color="#fff" style={{ marginLeft: 3 }} />
              </button>
              <span style={{ fontSize: 15, fontWeight: 600 }}>Reproduzir Vídeo</span>
            </div>
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', textAlign: 'center' }}>
              <div>
                <Video size={42} color="#38bdf8" style={{ margin: '0 auto 8px' }} />
                <p style={{ margin: 0, fontSize: 14 }}>Vídeo em reprodução contínua...</p>
                <button
                  onClick={() => setIsPlaying(false)}
                  style={{ marginTop: 10, padding: '5px 12px', borderRadius: 4, background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 11 }}
                >
                  Pausar
                </button>
              </div>
            </div>
          )}
        </div>
        <div style={{ padding: '14px 18px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{productTitle || 'Vídeo Bíblico'}</h4>
            <small style={{ color: '#94a3b8' }}>Duração aproximada: 08 min · Alta Resolução</small>
          </div>
          <span style={{ background: '#10b981', color: '#fff', fontSize: 11, padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>Pronto</span>
        </div>
      </div>
    </div>
  )
}
