import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
  Truck,
  MapPin,
  FileText,
  FileCheck,
  MessageSquareText,
  MessageCircle,
  Mail,
  ShoppingCart,
  MessageSquare,
  ShieldCheck,
  Globe,
  Code2,
  Coins,
  ArrowRightLeft,
  Sliders,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  LucideIcon
} from 'lucide-react'
import { useToast } from '../hooks/useToast'

interface SettingItem {
  id: string
  label: string
  icon: LucideIcon
}

interface SettingCategory {
  title: string
  items: SettingItem[]
}

const SETTINGS_CATEGORIES: SettingCategory[] = [
  {
    title: 'PAGAMENTOS E ENVIOS',
    items: [
      { id: 'meios-envio', label: 'Meios de envio', icon: Truck },
      { id: 'centros-distribuicao', label: 'Centros de distribuição', icon: MapPin },
    ],
  },
  {
    title: 'DOCUMENTOS FISCAIS',
    items: [
      { id: 'nfe', label: 'NF-e (Nota Fiscal & SEFAZ)', icon: FileText },
      { id: 'dce', label: 'DC-e (Declaração)', icon: FileCheck },
    ],
  },
  {
    title: 'COMUNICAÇÃO',
    items: [
      { id: 'contato', label: 'Informação de contato', icon: MessageSquareText },
      { id: 'whatsapp', label: 'Botão de WhatsApp', icon: MessageCircle },
      { id: 'emails-automaticos', label: 'E-mails automáticos', icon: Mail },
    ],
  },
  {
    title: 'CHECKOUT',
    items: [
      { id: 'opcoes-checkout', label: 'Opções de checkout', icon: ShoppingCart },
      { id: 'mensagem-clientes', label: 'Mensagem para clientes', icon: MessageSquare },
    ],
  },
  {
    title: 'EQUIPE E PERMISSÕES',
    items: [
      { id: 'permissoes', label: 'Permissões dos colaboradores', icon: ShieldCheck },
    ],
  },
  {
    title: 'OUTROS',
    items: [
      { id: 'dominios', label: 'Domínios', icon: Globe },
      { id: 'codigos-externos', label: 'Códigos externos', icon: Code2 },
      { id: 'idiomas-moedas', label: 'Idiomas e moedas', icon: Coins },
      { id: 'redirecionamentos', label: 'Redirecionamentos 301', icon: ArrowRightLeft },
      { id: 'campos-personalizados', label: 'Campos personalizados', icon: Sliders },
    ],
  },
]

interface ContactFormData {
  nomeEmpresa: string
  cnpjCpf: string
  emailLoja: string
  enderecoLoja: string
  telefoneLoja: string
  textoInformativo: string
}

const DEFAULT_FORM_DATA: ContactFormData = {
  nomeEmpresa: 'TEKNIX Ferramentas & Iluminação',
  cnpjCpf: '12.345.678/0001-90',
  emailLoja: 'sac@teknix.com.br',
  enderecoLoja: 'Av. Paulista, 1000 - São Paulo/SP',
  telefoneLoja: '(11) 99888-7766',
  textoInformativo: 'Atendimento de Segunda a Sexta, das 08h às 18h.',
}

export default function Configuracoes() {
  const [activeTab, setActiveTab] = useState<string>('contato')
  const [formData, setFormData] = useState<ContactFormData>(() => {
    try {
      const saved = localStorage.getItem('cdk_config_contato')
      if (saved) return JSON.parse(saved)
    } catch {
      // ignore
    }
    return DEFAULT_FORM_DATA
  })
  const [initialData, setInitialData] = useState<ContactFormData>(() => {
    try {
      const saved = localStorage.getItem('cdk_config_contato')
      if (saved) return JSON.parse(saved)
    } catch {
      // ignore
    }
    return DEFAULT_FORM_DATA
  })
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    // Keep initial copy for cancel action
    setInitialData(formData)
  }, [])

  const handleChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      try {
        localStorage.setItem('cdk_config_contato', JSON.stringify(formData))
        setInitialData(formData)
        toast.success('Configurações salvas com sucesso!')
      } catch (err) {
        toast.error('Erro ao salvar as configurações.')
      } finally {
        setIsSaving(false)
      }
    }, 400)
  }

  const handleCancel = () => {
    setFormData(initialData)
    toast.info('Alterações descartadas.')
  }

  // Active item title
  const activeItem = SETTINGS_CATEGORIES.flatMap(c => c.items).find(i => i.id === activeTab)
  const activeTitle = activeItem ? activeItem.label : 'Informação de contato'

  return (
    <div className="settings-page-wrapper">
      <div className="settings-container">
        {/* Left Sub-Sidebar */}
        <aside className="settings-sidebar">
          <div className="settings-sidebar-header" onClick={() => navigate('/admin')}>
            <ChevronLeft size={16} className="settings-back-icon" />
            <span className="settings-header-title">Configurações</span>
          </div>

          <div className="settings-categories-list">
            {SETTINGS_CATEGORIES.map(category => (
              <div key={category.title} className="settings-category-group">
                <div className="settings-category-title">{category.title}</div>
                <div className="settings-items-list">
                  {category.items.map(item => {
                    const Icon = item.icon
                    const isActive = activeTab === item.id
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`settings-nav-item ${isActive ? 'active' : ''}`}
                        onClick={() => setActiveTab(item.id)}
                      >
                        <span className="settings-nav-icon">
                          <Icon size={16} />
                        </span>
                        <span className="settings-nav-label">{item.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Right Main Content */}
        <main className="settings-content-area">
          {/* Header above card */}
          <div className="settings-panel-header">
            <button
              type="button"
              className="settings-panel-back-btn"
              onClick={() => navigate('/admin')}
              title="Voltar"
            >
              <ChevronLeft size={18} />
            </button>
            <h1 className="settings-panel-title">{activeTitle}</h1>
          </div>

          {/* Card Body */}
          {activeTab === 'contato' ? (
            <div className="settings-card">
              <form onSubmit={e => { e.preventDefault(); handleSave() }}>
                {/* Nome da empresa / Nome do responsável */}
                <div className="settings-form-group">
                  <label htmlFor="nomeEmpresa" className="settings-label">
                    Nome da empresa / Nome do responsável
                  </label>
                  <input
                    id="nomeEmpresa"
                    type="text"
                    className="settings-input"
                    value={formData.nomeEmpresa}
                    onChange={e => handleChange('nomeEmpresa', e.target.value)}
                    placeholder="Nome da empresa ou responsável"
                  />
                </div>

                {/* CNPJ ou CPF */}
                <div className="settings-form-group">
                  <label htmlFor="cnpjCpf" className="settings-label">
                    CNPJ ou CPF
                  </label>
                  <input
                    id="cnpjCpf"
                    type="text"
                    className="settings-input"
                    value={formData.cnpjCpf}
                    onChange={e => handleChange('cnpjCpf', e.target.value)}
                    placeholder="00.000.000/0000-00"
                  />
                </div>

                {/* E-mail da loja */}
                <div className="settings-form-group">
                  <label htmlFor="emailLoja" className="settings-label">
                    E-mail da loja
                  </label>
                  <input
                    id="emailLoja"
                    type="email"
                    className="settings-input"
                    value={formData.emailLoja}
                    onChange={e => handleChange('emailLoja', e.target.value)}
                    placeholder="exemplo@sualoja.com.br"
                  />
                  <span className="settings-help-text">
                    Pode ser diferente do e-mail que você usa para acessar seu painel administrador.
                  </span>
                </div>

                {/* Endereço da loja */}
                <div className="settings-form-group">
                  <label htmlFor="enderecoLoja" className="settings-label">
                    Endereço da loja
                  </label>
                  <input
                    id="enderecoLoja"
                    type="text"
                    className="settings-input"
                    value={formData.enderecoLoja}
                    onChange={e => handleChange('enderecoLoja', e.target.value)}
                    placeholder="Rua, número, complemento - Bairro, Cidade/UF"
                  />
                </div>

                {/* Telefone da sua loja */}
                <div className="settings-form-group">
                  <label htmlFor="telefoneLoja" className="settings-label">
                    Telefone da sua loja
                  </label>
                  <input
                    id="telefoneLoja"
                    type="text"
                    className="settings-input"
                    value={formData.telefoneLoja}
                    onChange={e => handleChange('telefoneLoja', e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>

                {/* Texto informativo para contato */}
                <div className="settings-form-group">
                  <label htmlFor="textoInformativo" className="settings-label">
                    Texto informativo para contato
                  </label>
                  <textarea
                    id="textoInformativo"
                    rows={4}
                    className="settings-textarea"
                    value={formData.textoInformativo}
                    onChange={e => handleChange('textoInformativo', e.target.value)}
                    placeholder="Texto de instruções de atendimento..."
                  />
                  <span className="settings-help-text">
                    Informação adicional que você queira exibir no formulário de contato.
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="settings-actions">
                  <button
                    type="button"
                    className="settings-btn-cancel"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="settings-btn-submit"
                    disabled={isSaving}
                  >
                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="settings-card">
              <div className="settings-tab-placeholder">
                <div className="placeholder-icon-wrap">
                  {activeItem && <activeItem.icon size={28} />}
                </div>
                <h3>{activeTitle}</h3>
                <p>Configurações e parâmetros para {activeTitle.toLowerCase()}.</p>
                <div className="placeholder-content">
                  <div className="settings-form-group" style={{ maxWidth: 480, margin: '0 auto', textAlign: 'left' }}>
                    <label className="settings-label">Status da Funcionalidade</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                      <CheckCircle2 size={18} color="#16a34a" />
                      <span style={{ fontSize: 13, color: '#334155', fontWeight: 500 }}>Módulo ativo e integrado com a plataforma</span>
                    </div>
                  </div>
                </div>
                <div className="settings-actions" style={{ justifyContent: 'center', marginTop: 24 }}>
                  <button
                    type="button"
                    className="settings-btn-submit"
                    onClick={() => toast.success(`${activeTitle} sincronizado com sucesso!`)}
                  >
                    Salvar Alterações
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer Link */}
          <div className="settings-footer-link-wrap">
            <a
              href="#ajuda"
              onClick={e => {
                e.preventDefault()
                toast.info(`Central de Ajuda: Mais sobre ${activeTitle}`)
              }}
              className="settings-footer-link"
            >
              <span>Mais sobre {activeTitle}</span>
              <ExternalLink size={13} className="settings-external-icon" />
            </a>
          </div>
        </main>
      </div>

      <style>{`
        .settings-page-wrapper {
          width: 100%;
          min-height: calc(100vh - 120px);
          background: #f4f5f7;
          margin: -28px -32px -48px;
          padding: 32px 40px;
          box-sizing: border-box;
          font-family: inherit;
        }

        .settings-container {
          display: flex;
          align-items: flex-start;
          gap: 32px;
          max-width: 1360px;
          margin: 0 auto;
        }

        /* ── Left Sidebar ── */
        .settings-sidebar {
          width: 250px;
          flex-shrink: 0;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 16px 12px 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
        }

        .settings-sidebar-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 10px 14px;
          border-bottom: 1px solid #f1f5f9;
          cursor: pointer;
          color: #374151;
          font-size: 13.5px;
          font-weight: 600;
          user-select: none;
          transition: color 0.15s ease;
        }
        .settings-sidebar-header:hover {
          color: #111827;
        }
        .settings-back-icon {
          color: #6b7280;
        }
        .settings-header-title {
          letter-spacing: -0.01em;
        }

        .settings-categories-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 14px;
        }

        .settings-category-group {
          display: flex;
          flex-direction: column;
        }

        .settings-category-title {
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: #9ca3af;
          padding: 0 10px 6px;
          text-transform: uppercase;
        }

        .settings-items-list {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .settings-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 7px 10px;
          background: transparent;
          border: none;
          border-radius: 7px;
          font-family: inherit;
          font-size: 12.5px;
          font-weight: 500;
          color: #4b5563;
          text-align: left;
          cursor: pointer;
          transition: all 0.12s ease;
        }

        .settings-nav-item:hover {
          background: #f9fafb;
          color: #111827;
        }

        .settings-nav-item.active {
          background: #f1f3f5;
          color: #111827;
          font-weight: 600;
        }

        .settings-nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          flex-shrink: 0;
        }

        .settings-nav-item.active .settings-nav-icon {
          color: #111827;
        }

        .settings-nav-label {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* ── Right Content Area ── */
        .settings-content-area {
          flex: 1;
          min-width: 0;
          max-width: 860px;
        }

        .settings-panel-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 18px;
        }

        .settings-panel-back-btn {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          color: #4b5563;
          cursor: pointer;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
          transition: background 0.15s ease, color 0.15s ease;
        }
        .settings-panel-back-btn:hover {
          background: #f9fafb;
          color: #111827;
        }

        .settings-panel-title {
          font-size: 22px;
          font-weight: 700;
          color: #111827;
          margin: 0;
          letter-spacing: -0.02em;
        }

        /* ── Main Card ── */
        .settings-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 36px 40px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
        }

        .settings-form-group {
          display: flex;
          flex-direction: column;
          margin-bottom: 22px;
        }

        .settings-label {
          font-size: 13px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 7px;
        }

        .settings-input {
          width: 100%;
          height: 42px;
          padding: 0 14px;
          font-family: inherit;
          font-size: 13.5px;
          color: #1f2937;
          background: #ffffff;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .settings-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .settings-textarea {
          width: 100%;
          min-height: 96px;
          padding: 12px 14px;
          font-family: inherit;
          font-size: 13.5px;
          color: #1f2937;
          background: #ffffff;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          outline: none;
          resize: vertical;
          box-sizing: border-box;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .settings-textarea:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .settings-help-text {
          font-size: 11.5px;
          color: #9ca3af;
          margin-top: 6px;
          line-height: 1.4;
        }

        /* ── Action Buttons ── */
        .settings-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 28px;
          padding-top: 10px;
        }

        .settings-btn-cancel {
          height: 38px;
          padding: 0 20px;
          background: #ffffff;
          border: 1px solid #d1d5db;
          border-radius: 7px;
          font-family: inherit;
          font-size: 13px;
          font-weight: 500;
          color: #374151;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .settings-btn-cancel:hover:not(:disabled) {
          background: #f9fafb;
          border-color: #9ca3af;
        }

        .settings-btn-submit {
          height: 38px;
          padding: 0 22px;
          background: #2563eb;
          border: 1px solid #2563eb;
          border-radius: 7px;
          font-family: inherit;
          font-size: 13px;
          font-weight: 600;
          color: #ffffff;
          cursor: pointer;
          box-shadow: 0 1px 2px rgba(37, 99, 235, 0.18);
          transition: all 0.15s ease;
        }
        .settings-btn-submit:hover:not(:disabled) {
          background: #1d4ed8;
          border-color: #1d4ed8;
          box-shadow: 0 2px 4px rgba(37, 99, 235, 0.25);
        }

        .settings-btn-cancel:disabled,
        .settings-btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* ── Placeholder for other tabs ── */
        .settings-tab-placeholder {
          text-align: center;
          padding: 40px 20px;
        }

        .placeholder-icon-wrap {
          width: 56px;
          height: 56px;
          background: #eff6ff;
          color: #2563eb;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }

        .settings-tab-placeholder h3 {
          font-size: 18px;
          font-weight: 700;
          color: #111827;
          margin: 0 0 6px;
        }

        .settings-tab-placeholder p {
          font-size: 13.5px;
          color: #6b7280;
          margin: 0 0 24px;
        }

        /* ── Footer Link ── */
        .settings-footer-link-wrap {
          display: flex;
          justify-content: center;
          margin-top: 24px;
        }

        .settings-footer-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          text-decoration: none;
          transition: color 0.15s ease;
        }
        .settings-footer-link:hover {
          color: #111827;
          text-decoration: underline;
        }
        .settings-external-icon {
          color: #4b5563;
        }

        @media (max-width: 960px) {
          .settings-container {
            flex-direction: column;
          }
          .settings-sidebar {
            width: 100%;
          }
          .settings-card {
            padding: 24px 20px;
          }
          .settings-page-wrapper {
            padding: 20px 16px;
          }
        }
      `}</style>
    </div>
  )
}
