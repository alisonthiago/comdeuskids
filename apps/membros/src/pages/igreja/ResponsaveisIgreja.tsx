import React, { useState, useEffect } from 'react'
import {
  Users,
  ShieldCheck,
  Plus,
  Search,
  Phone,
  Clock,
  Calendar,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { useChurch } from '../../hooks/useChurch'
import { supabase } from '@comdeuskids/supabase'

export function ResponsaveisIgreja() {
  const { currentChurch, hasCapability } = useChurch()
  const [authorizations, setAuthorizations] = useState<any[]>([])
  const [childrenList, setChildrenList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Form states
  const [selectedChildId, setSelectedChildId] = useState('')
  const [authorizedName, setAuthorizedName] = useState('')
  const [relationship, setRelationship] = useState('Parente')
  const [phone, setPhone] = useState('')
  const [documentId, setDocumentId] = useState('')
  const [authType, setAuthType] = useState<'permanent' | 'temporary'>('permanent')
  const [validUntil, setValidUntil] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [currentChurch])

  const loadData = async () => {
    if (!currentChurch) return
    setLoading(true)
    try {
      // 1. Carregar crianças para o select
      const { data: kids } = await supabase
        .from('organization_students')
        .select(`
          child_id,
          child:children (id, first_name, last_name)
        `)
        .eq('organization_id', currentChurch.id)

      if (kids) setChildrenList(kids)

      // 2. Carregar autorizações de retirada
      const { data: auths } = await supabase
        .from('child_pickup_authorizations')
        .select(`
          id,
          authorized_name,
          relationship,
          phone,
          document_id,
          auth_type,
          valid_until,
          notes,
          is_active,
          child:children (first_name, last_name)
        `)
        .eq('organization_id', currentChurch.id)
        .order('created_at', { ascending: false })

      if (auths) setAuthorizations(auths)
    } catch (err) {
      console.warn('Erro ao carregar responsáveis:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentChurch || !selectedChildId || !authorizedName.trim()) return

    setSaving(true)
    setFeedback(null)

    try {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData?.user?.id

      if (!userId) throw new Error('Usuário não autenticado')

      const { error } = await supabase.from('child_pickup_authorizations').insert({
        child_id: selectedChildId,
        organization_id: currentChurch.id,
        authorized_name: authorizedName.trim(),
        relationship,
        phone: phone.trim() || null,
        document_id: documentId.trim() || null,
        auth_type: authType,
        valid_until: authType === 'temporary' ? validUntil || null : null,
        notes: notes.trim() || null,
        created_by: userId
      })

      if (error) throw error

      setFeedback('Autorização de retirada cadastrada com sucesso!')
      setModalOpen(false)
      resetForm()
      await loadData()
    } catch (err: any) {
      setFeedback(`Erro ao salvar autorização: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setSelectedChildId('')
    setAuthorizedName('')
    setRelationship('Parente')
    setPhone('')
    setDocumentId('')
    setAuthType('permanent')
    setValidUntil('')
    setNotes('')
  }

  const filteredAuths = authorizations.filter((a) => {
    const text = `${a.authorized_name} ${a.child?.first_name || ''} ${a.child?.last_name || ''}`.toLowerCase()
    return text.includes(searchTerm.toLowerCase())
  })

  return (
    <div className="s-page">
      {/* Header */}
      <div className="s-header">
        <div>
          <span className="s-badge s-badge--primary" style={{ marginBottom: 6 }}>Segurança e Família</span>
          <h1 className="s-title">Responsáveis & Autorizações de Retirada</h1>
          <p className="s-subtitle">
            Controle seguro de quem está autorizado a buscar a criança após o culto ou classe bíblica.
          </p>
        </div>

        {hasCapability('church.guardians.manage') && (
          <button
            onClick={() => setModalOpen(true)}
            className="s-btn s-btn--primary"
          >
            <Plus size={18} /> Nova Autorização
          </button>
        )}
      </div>

      {feedback && (
        <div style={{
          padding: '12px 18px',
          borderRadius: 12,
          background: 'rgba(0, 108, 73, 0.08)',
          border: '1px solid rgba(0, 108, 73, 0.2)',
          color: 'var(--s-emerald, #006c49)',
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 20
        }}>
          {feedback}
        </div>
      )}

      {/* Busca */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <Search size={18} color="var(--s-neutral-variant, #535961)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text"
          placeholder="Buscar por nome da pessoa autorizada ou criança..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="s-input"
          style={{ paddingLeft: 46 }}
        />
      </div>

      {/* Lista de Autorizações */}
      <div className="s-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--s-neutral-variant)', fontSize: 14 }}>
            Carregando autorizações...
          </div>
        ) : filteredAuths.length === 0 ? (
          <div style={{ padding: 56, textAlign: 'center' }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--s-surface-variant)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12
            }}>
              <ShieldCheck size={28} color="var(--s-primary)" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--s-neutral)', margin: '0 0 6px 0' }}>
              Nenhuma autorização cadastrada
            </h3>
            <p style={{ color: 'var(--s-neutral-variant)', fontSize: 13, margin: '0 auto 16px auto', maxWidth: 420 }}>
              Cadastre avós, tios ou pessoas com autorização permanente ou temporária para retirada de crianças com segurança auditada.
            </p>
          </div>
        ) : (
          <div className="s-table-container" style={{ margin: 0 }}>
            <table className="s-table">
              <thead>
                <tr>
                  <th>Pessoa Autorizada</th>
                  <th>Parentesco</th>
                  <th>Criança Vinculada</th>
                  <th>Tipo</th>
                  <th>Validade</th>
                </tr>
              </thead>
              <tbody>
                {filteredAuths.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--s-neutral)', display: 'block' }}>
                        {a.authorized_name}
                      </span>
                      {a.phone && <span style={{ fontSize: 12, color: 'var(--s-neutral-variant)' }}>{a.phone}</span>}
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--s-neutral)' }}>
                      {a.relationship}
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--s-primary)', fontWeight: 700 }}>
                      {a.child?.first_name} {a.child?.last_name || ''}
                    </td>
                    <td>
                      <span className={`s-badge ${a.auth_type === 'permanent' ? 's-badge--emerald' : 's-badge--amber'}`}>
                        {a.auth_type === 'permanent' ? 'PERMANENTE' : 'TEMPORÁRIA'}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--s-neutral-variant)' }}>
                      {a.auth_type === 'permanent' ? 'Sem expiração' : a.valid_until ? new Date(a.valid_until).toLocaleDateString('pt-BR') : 'Hoje'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Nova Autorização */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
          <div className="s-card" style={{ maxWidth: 500, width: '100%', padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--s-neutral)', margin: 0 }}>
                  Cadastrar Pessoa Autorizada
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: 12, color: 'var(--s-neutral-variant)' }}>
                  A liberação só será aceita perante checagem deste registro no momento da retirada.
                </p>
              </div>
              <button onClick={() => setModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--s-neutral-variant)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveAuth} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="s-label">Criança *</label>
                <select
                  required
                  value={selectedChildId}
                  onChange={(e) => setSelectedChildId(e.target.value)}
                  className="s-select"
                >
                  <option value="">Selecione a criança</option>
                  {childrenList.map((k) => (
                    <option key={k.child_id} value={k.child_id}>
                      {k.child?.first_name} {k.child?.last_name || ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="s-label">Nome da Pessoa Autorizada *</label>
                <input
                  type="text"
                  required
                  value={authorizedName}
                  onChange={(e) => setAuthorizedName(e.target.value)}
                  placeholder="Ex: Tio Roberto"
                  className="s-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="s-label">Parentesco</label>
                  <input
                    type="text"
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    placeholder="Ex: Avó, Tio, Vizinho"
                    className="s-input"
                  />
                </div>
                <div>
                  <label className="s-label">Telefone / WhatsApp</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="s-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="s-label">Tipo de Autorização</label>
                  <select
                    value={authType}
                    onChange={(e: any) => setAuthType(e.target.value)}
                    className="s-select"
                  >
                    <option value="permanent">Permanente</option>
                    <option value="temporary">Temporária (Data limite)</option>
                  </select>
                </div>
                {authType === 'temporary' && (
                  <div>
                    <label className="s-label">Válido até</label>
                    <input
                      type="date"
                      required
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                      className="s-input"
                    />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="s-btn s-btn--secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="s-btn s-btn--primary"
                >
                  {saving ? 'Salvando...' : 'Salvar Autorização'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
