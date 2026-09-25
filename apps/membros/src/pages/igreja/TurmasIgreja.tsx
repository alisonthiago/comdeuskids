import React, { useState, useEffect } from 'react'
import {
  Layers,
  Plus,
  Users,
  BookOpen,
  Edit,
  Trash2,
  X,
  CheckCircle2,
  Sparkles
} from 'lucide-react'
import { useChurch } from '../../hooks/useChurch'
import { supabase } from '@comdeuskids/supabase'

export function TurmasIgreja() {
  const { currentChurch, hasCapability } = useChurch()
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  // Form states
  const [className, setClassName] = useState('')
  const [ageGroup, setAgeGroup] = useState('4-5 anos')
  const [description, setDescription] = useState('')
  const [colorTag, setColorTag] = useState('#ab3500')
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    loadClasses()
  }, [currentChurch])

  const loadClasses = async () => {
    if (!currentChurch) return
    setLoading(true)
    try {
      const { data } = await supabase
        .from('educational_classes')
        .select('*')
        .eq('organization_id', currentChurch.id)
        .order('created_at', { ascending: true })

      if (data) setClasses(data)
    } catch (err) {
      console.warn('Erro ao carregar turmas:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentChurch || !className.trim()) return

    setSaving(true)
    setFeedback(null)

    try {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData?.user?.id
      if (!userId) throw new Error('Não autenticado')

      const { error } = await supabase.from('educational_classes').insert({
        organization_id: currentChurch.id,
        created_by: userId,
        name: className.trim(),
        age_group: ageGroup,
        description: description.trim() || null,
        color_tag: colorTag,
        is_active: true
      })

      if (error) throw error

      setFeedback('Turma / Classe criada com sucesso!')
      setModalOpen(false)
      resetForm()
      await loadClasses()
    } catch (err: any) {
      setFeedback(`Erro ao criar classe: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setClassName('')
    setAgeGroup('4-5 anos')
    setDescription('')
    setColorTag('#ab3500')
  }

  return (
    <div className="s-page" style={{ padding: '0 0 60px 0' }}>
      {/* Top Header */}
      <section className="s-card" style={{ padding: '24px 28px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="s-badge s-badge--emerald">
                <Layers size={12} /> EBD & MINISTÉRIO INFANTIL
              </span>
              <span style={{ fontSize: '13px', color: 'var(--s-text-muted)' }}>
                • {currentChurch?.name}
              </span>
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--s-text)', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
              Classes Bíblicas & Turmas EBD
            </h1>
            <p style={{ color: 'var(--s-text-muted)', fontSize: '14px', margin: 0 }}>
              Turmas por faixa etária da igreja conectadas diretamente ao Motor Educacional compartilhado.
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="s-btn s-btn--primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={16} /> Nova Classe
          </button>
        </div>
      </section>

      {feedback && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: '12px',
            background: 'rgba(0, 108, 73, 0.08)',
            border: '1px solid var(--s-emerald)',
            color: 'var(--s-emerald)',
            fontSize: '14px',
            fontWeight: 600,
            marginBottom: '20px'
          }}
        >
          {feedback}
        </div>
      )}

      {/* Grid de Turmas */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--s-text-muted)', fontSize: '14px' }}>
          Carregando turmas da igreja...
        </div>
      ) : classes.length === 0 ? (
        <section className="s-card" style={{ padding: '48px 20px', textAlign: 'center' }}>
          <Layers size={40} color="var(--s-text-muted)" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--s-text)', margin: '0 0 6px 0' }}>
            Nenhuma classe bíblica cadastrada
          </h3>
          <p style={{ color: 'var(--s-text-muted)', fontSize: '13px', margin: '0 auto 16px auto', maxWidth: '420px' }}>
            Crie as turmas da EBD (ex: Berçário, Maternal, Primários, Juniores) para atribuir lições e gerenciar presença.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="s-btn s-btn--primary"
          >
            Criar Primeira Classe
          </button>
        </section>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {classes.map((c) => (
            <div
              key={c.id}
              className="s-card"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderLeft: `4px solid ${c.color_tag || 'var(--s-primary)'}`
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span
                    className="s-badge"
                    style={{
                      background: 'var(--s-surface-container)',
                      color: 'var(--s-text)',
                      fontWeight: 700
                    }}
                  >
                    {c.age_group || 'Livre'}
                  </span>
                  <span className="s-badge s-badge--emerald">
                    EBD / CULTO
                  </span>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--s-text)', margin: '0 0 6px 0' }}>
                  {c.name}
                </h3>
                {c.description && (
                  <p style={{ fontSize: '13px', color: 'var(--s-text-muted)', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                    {c.description}
                  </p>
                )}
              </div>

              <div style={{ borderTop: '1px solid var(--s-border)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--s-text-muted)' }}>
                  Turma Ativa no Kids
                </span>
                <span style={{ fontSize: '12px', color: 'var(--s-emerald)', fontWeight: 700 }}>
                  Motor Educacional OK
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Nova Classe */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div className="s-card" style={{ maxWidth: '440px', width: '100%', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--s-text)', margin: 0 }}>
                Criar Nova Classe EBD
              </h2>
              <button onClick={() => setModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--s-text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveClass} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="s-label" style={{ marginBottom: '6px' }}>Nome da Classe *</label>
                <input
                  type="text"
                  required
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="Ex: Cordeirinhos de Jesus"
                  className="s-input"
                  style={{ width: '100%', height: '42px' }}
                />
              </div>

              <div>
                <label className="s-label" style={{ marginBottom: '6px' }}>Faixa Etária</label>
                <select
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  className="s-select"
                  style={{ width: '100%', height: '42px' }}
                >
                  <option value="Berçário (0-2 anos)">Berçário (0–2 anos)</option>
                  <option value="Maternal (2-3 anos)">Maternal (2–3 anos)</option>
                  <option value="Jardim (4-5 anos)">Jardim (4–5 anos)</option>
                  <option value="Primários (6-8 anos)">Primários (6–8 anos)</option>
                  <option value="Juniores (9-11 anos)">Juniores (9–11 anos)</option>
                  <option value="Pré-adolescentes (12+ anos)">Pré-adolescentes (12+ anos)</option>
                </select>
              </div>

              <div>
                <label className="s-label" style={{ marginBottom: '6px' }}>Descrição / Sala</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Sala 02 do anexo infantil"
                  className="s-input"
                  style={{ width: '100%', height: '42px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
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
                  {saving ? 'Criando...' : 'Criar Classe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
