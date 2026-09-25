import React, { useState } from 'react'
import { Download, FileText, Plus, Search, Trash2, Eye, HardDrive, BarChart3, CheckCircle } from 'lucide-react'

export type DownloadItem = {
  id: string
  name: string
  description?: string
  format: 'PDF' | 'ZIP' | 'DOCX' | 'PNG'
  size: string
  downloadCount: number
  uploadedAt: string
}

export default function ArquivoMemberView({
  productId,
  productTitle,
  activeTab
}: {
  productId: string
  productTitle: string
  activeTab: string
}) {
  const storageKey = `cdk-files-${productId}`
  const initialFiles: DownloadItem[] = [
    {
      id: '1',
      name: 'Caderno de Atividades Bíblicas - Edição Completa.pdf',
      description: 'Mais de 45 páginas de ilustrações para colorir, cruzadinhas e caça-palavras bíblicos.',
      format: 'PDF',
      size: '12.4 MB',
      downloadCount: 142,
      uploadedAt: 'Hoje'
    },
    {
      id: '2',
      name: 'Gabarito e Guia do Professor para EBD.pdf',
      description: 'Respostas dos exercícios e plano de aula detalhado para professores do ministério infantil.',
      format: 'PDF',
      size: '3.1 MB',
      downloadCount: 88,
      uploadedAt: 'Ontem'
    },
    {
      id: '3',
      name: 'Cartões de Versículos Bíblicos para Recortar.zip',
      description: 'Arquivo ZIP contendo 30 cartões em alta resolução prontos para imprimir e plastificar.',
      format: 'ZIP',
      size: '24.8 MB',
      downloadCount: 65,
      uploadedAt: 'Há 3 dias'
    }
  ]

  const [files, setFiles] = useState<DownloadItem[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      return saved ? JSON.parse(saved) : initialFiles
    } catch {
      return initialFiles
    }
  })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [newFileDesc, setNewFileDesc] = useState('')
  const [newFileFormat, setNewFileFormat] = useState<'PDF' | 'ZIP' | 'DOCX'>('PDF')
  const [newFileSize, setNewFileSize] = useState('5.2 MB')
  const [searchTerm, setSearchTerm] = useState('')

  const handleSaveFile = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFileName.trim()) return

    const newItem: DownloadItem = {
      id: `file-${Date.now()}`,
      name: newFileName.endsWith(`.${newFileFormat.toLowerCase()}`)
        ? newFileName
        : `${newFileName}.${newFileFormat.toLowerCase()}`,
      description: newFileDesc.trim(),
      format: newFileFormat,
      size: newFileSize,
      downloadCount: 0,
      uploadedAt: 'Agora'
    }

    const updated = [newItem, ...files]
    setFiles(updated)
    localStorage.setItem(storageKey, JSON.stringify(updated))
    setNewFileName('')
    setNewFileDesc('')
    setIsModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (!window.confirm('Tem certeza que deseja remover este arquivo?')) return
    const updated = files.filter(f => f.id !== id)
    setFiles(updated)
    localStorage.setItem(storageKey, JSON.stringify(updated))
  }

  const filteredFiles = files.filter(f =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.description && f.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const totalDownloads = files.reduce((acc, f) => acc + f.downloadCount, 0)

  if (activeTab === 'estatisticas') {
    return (
      <div style={{ marginTop: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '16px 20px' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>TOTAL DE DOWNLOADS</span>
            <h3 style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', margin: '8px 0 4px' }}>{totalDownloads}</h3>
            <small style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle size={13} /> Downloads ativos
            </small>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '16px 20px' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>ARQUIVOS DISPONÍVEIS</span>
            <h3 style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', margin: '8px 0 4px' }}>{files.length}</h3>
            <small style={{ color: '#64748b' }}>Materiais digitais</small>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '16px 20px' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>ESPAÇO UTILIZADO</span>
            <h3 style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', margin: '8px 0 4px' }}>40.3 MB</h3>
            <small style={{ color: '#64748b' }}>Armazenamento seguro CDN</small>
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 20 }}>
          <h4 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 14 }}>
            Ranking dos Arquivos Mais Baixados
          </h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                <th style={{ padding: '8px 12px' }}>Arquivo</th>
                <th style={{ padding: '8px 12px' }}>Formato</th>
                <th style={{ padding: '8px 12px' }}>Tamanho</th>
                <th style={{ padding: '8px 12px' }}>Downloads</th>
              </tr>
            </thead>
            <tbody>
              {files.map(f => (
                <tr key={f.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: '#334155' }}>{f.name}</td>
                  <td style={{ padding: '10px 12px' }}><span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontSize: 11 }}>{f.format}</span></td>
                  <td style={{ padding: '10px 12px', color: '#64748b' }}>{f.size}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#2563eb' }}>{f.downloadCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #cbd5e1', borderRadius: 6, padding: '0 12px', width: '100%', maxWidth: 360 }}>
          <Search size={16} color="#94a3b8" />
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Pesquisar arquivos e materiais..."
            style={{ border: 'none', outline: 'none', padding: '9px 0', fontSize: 13, width: '100%' }}
          />
        </div>

        <button
          className="dark"
          onClick={() => setIsModalOpen(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 6, fontWeight: 600, cursor: 'pointer', background: '#1e293b', color: '#fff' }}
        >
          <Plus size={16} /> Adicionar Novo Arquivo
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredFiles.length === 0 ? (
          <div style={{ background: '#fff', border: '1px dashed #cbd5e1', borderRadius: 8, padding: '40px 20px', textAlign: 'center' }}>
            <HardDrive size={36} color="#94a3b8" style={{ margin: '0 auto 10px' }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#334155' }}>Nenhum arquivo encontrado</h3>
            <p style={{ fontSize: 13, color: '#64748b', maxWidth: 400, margin: '6px auto 16px' }}>
              Faça o upload do primeiro PDF, atividade ou material digital para seus membros baixarem.
            </p>
            <button
              className="dark"
              onClick={() => setIsModalOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 6, fontWeight: 600, cursor: 'pointer', background: '#2563eb', color: '#fff', border: 'none' }}
            >
              <Plus size={16} /> Enviar Arquivo Agora
            </button>
          </div>
        ) : (
          filteredFiles.map(file => (
            <div
              key={file.id}
              style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: '16px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                flexWrap: 'wrap'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 260, flex: 1 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 8,
                    background: file.format === 'PDF' ? '#fee2e2' : file.format === 'ZIP' ? '#fef3c7' : '#e0f2fe',
                    color: file.format === 'PDF' ? '#dc2626' : file.format === 'ZIP' ? '#d97706' : '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: 12
                  }}
                >
                  {file.format}
                </div>
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: 0 }}>{file.name}</h4>
                  {file.description && (
                    <p style={{ fontSize: 12, color: '#64748b', margin: '3px 0 6px' }}>{file.description}</p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: '#94a3b8' }}>
                    <span>Tamanho: <strong>{file.size}</strong></span>
                    <span>·</span>
                    <span>Downloads: <strong style={{ color: '#2563eb' }}>{file.downloadCount}</strong></span>
                    <span>·</span>
                    <span>Adicionado: {file.uploadedAt}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  title="Prévia do arquivo"
                  onClick={() => alert(`Visualizando prévia de: ${file.name}`)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 12px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 12, fontWeight: 600, color: '#475569', cursor: 'pointer' }}
                >
                  <Eye size={14} /> Prévia
                </button>
                <button
                  title="Baixar arquivo de teste"
                  onClick={() => {
                    alert(`Iniciando download seguro de: ${file.name}`)
                    const updated = files.map(f => f.id === file.id ? { ...f, downloadCount: f.downloadCount + 1 } : f)
                    setFiles(updated)
                    localStorage.setItem(storageKey, JSON.stringify(updated))
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 12px', background: '#eff4fe', border: '1px solid #bfdbfe', borderRadius: 6, fontSize: 12, fontWeight: 600, color: '#2563eb', cursor: 'pointer' }}
                >
                  <Download size={14} /> Baixar
                </button>
                <button
                  title="Excluir arquivo"
                  onClick={() => handleDelete(file.id)}
                  style={{ padding: '7px 10px', background: '#fff', border: '1px solid #fecaca', borderRadius: 6, color: '#ef4444', cursor: 'pointer' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 10, width: '100%', maxWidth: 500, padding: 24, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Adicionar Arquivo para Download</h3>
            <p style={{ fontSize: 12, color: '#64748b', marginBottom: 18 }}>Cadastre um PDF, atividade ou material para os alunos e pais baixarem.</p>

            <form onSubmit={handleSaveFile}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Nome do arquivo *
                <input
                  required
                  value={newFileName}
                  onChange={e => setNewFileName(e.target.value)}
                  placeholder="Ex.: Apostila da Escola Bíblica Infantil"
                  style={{ display: 'block', width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 6, marginTop: 4, fontSize: 13 }}
                />
              </label>

              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', margin: '14px 0 6px' }}>
                Descrição breve
                <textarea
                  value={newFileDesc}
                  onChange={e => setNewFileDesc(e.target.value)}
                  placeholder="Instruções para impressão, faixa etária recomendada, etc."
                  style={{ display: 'block', width: '100%', height: 70, padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 6, marginTop: 4, fontSize: 13 }}
                />
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>
                  Formato do arquivo
                  <select
                    value={newFileFormat}
                    onChange={e => setNewFileFormat(e.target.value as any)}
                    style={{ display: 'block', width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6, marginTop: 4, fontSize: 13 }}
                  >
                    <option value="PDF">PDF (Documento)</option>
                    <option value="ZIP">ZIP (Pacote com Vários)</option>
                    <option value="DOCX">DOCX (Word editável)</option>
                  </select>
                </label>

                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>
                  Tamanho estimado
                  <input
                    value={newFileSize}
                    onChange={e => setNewFileSize(e.target.value)}
                    placeholder="Ex.: 8.5 MB"
                    style={{ display: 'block', width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6, marginTop: 4, fontSize: 13 }}
                  />
                </label>
              </div>

              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff', fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', borderRadius: 6, background: '#2563eb', color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Adicionar Arquivo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
