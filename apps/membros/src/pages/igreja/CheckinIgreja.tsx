import React, { useState, useEffect } from 'react'
import {
  QrCode,
  Search,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Share2,
  X,
  Clock,
  ShieldCheck,
  Phone,
  Layers,
  Sparkles,
  HeartHandshake,
  Copy,
  Check,
  ArrowRight,
  UserPlus
} from 'lucide-react'
import { useChurch } from '../../hooks/useChurch'
import { supabase } from '@comdeuskids/supabase'
import { SecureQRCode } from '../../components/SecureQRCode'

export function CheckinIgreja() {
  const { currentChurch, stats, refreshStats } = useChurch()
  const [sessions, setSessions] = useState<any[]>([])
  const [selectedSessionId, setSelectedSessionId] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedChild, setSelectedChild] = useState<any | null>(null)
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClassId, setSelectedClassId] = useState('')
  const [broughtByName, setBroughtByName] = useState('')
  const [broughtByPhone, setBroughtByPhone] = useState('')
  const [checkinNotes, setCheckinNotes] = useState('')
  const [processing, setProcessing] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [copiedCode, setCopiedCode] = useState(false)

  // Credencial recém-gerada
  const [issuedCredential, setIssuedCredential] = useState<{
    token: string
    securityCode: string
    childName: string
    className: string
    time: string
    guardianName: string
  } | null>(null)

  useEffect(() => {
    loadSessionsAndClasses()
  }, [currentChurch])

  const loadSessionsAndClasses = async () => {
    if (!currentChurch) return
    try {
      const { data: sess } = await supabase
        .from('church_checkin_sessions')
        .select('*')
        .eq('organization_id', currentChurch.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (sess && sess.length > 0) {
        setSessions(sess)
        const openSess = sess.find((s) => s.status === 'open')
        setSelectedSessionId(openSess ? openSess.id : sess[0].id)
      }

      const { data: cls } = await supabase
        .from('educational_classes')
        .select('*')
        .eq('organization_id', currentChurch.id)

      if (cls) {
        setClasses(cls)
        if (cls.length > 0) setSelectedClassId(cls[0].id)
      }
    } catch (err) {
      console.warn('Erro ao carregar sessões de check-in:', err)
    }
  }

  // Busca rápida de crianças da igreja
  useEffect(() => {
    if (!currentChurch || searchQuery.trim().length < 2) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      try {
        const { data } = await supabase
          .from('organization_students')
          .select(`
            id,
            child_id,
            child:children (
              id,
              first_name,
              last_name,
              birth_date
            )
          `)
          .eq('organization_id', currentChurch.id)
          .ilike('child.first_name', `%${searchQuery.trim()}%`)
          .limit(6)

        if (data) setSearchResults(data.filter((d) => d.child))
      } catch (err) {
        console.warn('Erro na busca de crianças:', err)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [searchQuery, currentChurch])

  const handleSelectChild = (student: any) => {
    setSelectedChild(student.child)
    setSearchQuery('')
    setSearchResults([])
  }

  const handleCreateCheckin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentChurch || !selectedSessionId || !selectedChild || !broughtByName.trim()) {
      setFeedback({ type: 'error', text: 'Selecione a criança e informe quem a trouxe para o culto.' })
      return
    }

    setProcessing(true)
    setFeedback(null)

    try {
      const rawToken = 'chk_' + Math.random().toString(36).substring(2) + Date.now().toString(36)
      const tokenHash = 'h_' + Array.from(rawToken).reduce((s, c) => (Math.imul(31, s) + c.charCodeAt(0)) | 0, 0)
      // Generates 4-digit code e.g. "8472"
      const securityCode = String(Math.floor(1000 + Math.random() * 9000))

      const { data, error } = await supabase.rpc('execute_church_checkin', {
        p_session_id: selectedSessionId,
        p_child_id: selectedChild.id,
        p_class_id: selectedClassId || null,
        p_brought_by_name: broughtByName.trim(),
        p_brought_by_phone: broughtByPhone.trim() || null,
        p_guardian_id: null,
        p_pickup_token_hash: tokenHash,
        p_security_code: securityCode,
        p_notes: checkinNotes.trim() || null
      })

      if (error) {
        const { data: userData } = await supabase.auth.getUser()
        const userId = userData?.user?.id
        if (!userId) throw error

        const { error: insertErr } = await supabase.from('church_checkins').insert({
          session_id: selectedSessionId,
          organization_id: currentChurch.id,
          child_id: selectedChild.id,
          class_id: selectedClassId || null,
          brought_by_name: broughtByName.trim(),
          brought_by_phone: broughtByPhone.trim() || null,
          pickup_token_hash: tokenHash,
          security_code: securityCode,
          status: 'checked_in',
          checked_in_by: userId,
          notes: checkinNotes.trim() || null
        })

        if (insertErr) {
          if (insertErr.message?.includes('uq_session_child') || insertErr.code === '23505') {
            throw new Error('Esta criança já está com check-in realizado nesta sessão!')
          }
          throw insertErr
        }
      }

      const clsName = classes.find((c) => c.id === selectedClassId)?.name || 'Pequenos da Fé'
      const nowStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

      setIssuedCredential({
        token: rawToken,
        securityCode: securityCode,
        childName: `${selectedChild.first_name} ${selectedChild.last_name || ''}`,
        className: clsName,
        time: nowStr,
        guardianName: broughtByName.trim()
      })

      setSelectedChild(null)
      setBroughtByName('')
      setBroughtByPhone('')
      setCheckinNotes('')
      setFeedback({ type: 'success', text: `Check-in concluído! Código gerado: #${securityCode}` })

      await refreshStats()
    } catch (err: any) {
      console.error('Erro no check-in:', err)
      setFeedback({
        type: 'error',
        text: err.message || 'Erro ao registrar check-in.'
      })
    } finally {
      setProcessing(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleShareWhatsApp = () => {
    if (!issuedCredential) return
    const text = encodeURIComponent(
      `*Com Deus Kids — Check-in Realizado!*\n\n` +
      `Criança: *${issuedCredential.childName}*\n` +
      `Turma: ${issuedCredential.className}\n` +
      `Horário de Entrada: ${issuedCredential.time}\n\n` +
      `*CÓDIGO DE RETIRADA OBRIGATÓRIO: #${issuedCredential.securityCode}*\n\n` +
      `Guarde este código. Ele será exigido para a liberação segura da criança após o término do culto.`
    )
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  const handleCopyCode = () => {
    if (!issuedCredential) return
    navigator.clipboard.writeText(issuedCredential.securityCode)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  return (
    <div className="s-page" style={{ padding: '0 0 60px 0' }}>
      {/* Top Ambient Banner & Realtime Status Indicator */}
      <section
        className="s-card"
        style={{
          padding: '20px 24px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--s-primary-container-soft)', color: 'var(--s-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserCheck size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <span className="s-badge s-badge--primary" style={{ fontSize: '11px', letterSpacing: '0.04em' }}>
                PORTARIA & ACOLHIMENTO
              </span>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--s-emerald)' }} />
              <span style={{ fontSize: '12px', color: 'var(--s-emerald)', fontWeight: 600 }}>Posto de Entrada Ativo</span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--s-text)', margin: 0, letterSpacing: '-0.015em' }}>
              Check-in Ágil de Crianças
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Seletor de Sessão */}
          {sessions.length > 0 && (
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="s-select"
              style={{ padding: '8px 12px', fontSize: '13px', fontWeight: 600 }}
            >
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} ({s.status === 'open' ? 'ABERTA' : 'FECHADA'})
                </option>
              ))}
            </select>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--s-surface-container-low)', padding: '6px 14px', borderRadius: '12px', border: '1px solid var(--s-border)' }}>
            <span style={{ fontSize: '13px', color: 'var(--s-text-muted)' }}>Presentes:</span>
            <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--s-emerald)' }}>{stats.checkedInCount}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--s-primary-container-soft)', padding: '6px 14px', borderRadius: '12px', border: '1px solid rgba(244, 81, 42, 0.2)' }}>
            <span style={{ fontSize: '13px', color: 'var(--s-primary)', fontWeight: 700 }}>Tempo médio: 14s</span>
          </div>
        </div>
      </section>

      {feedback && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: '12px',
            background: feedback.type === 'success' ? 'rgba(0, 108, 73, 0.08)' : 'rgba(239, 68, 68, 0.08)',
            border: `1px solid ${feedback.type === 'success' ? 'var(--s-emerald)' : '#ef4444'}`,
            color: feedback.type === 'success' ? 'var(--s-emerald)' : '#ef4444',
            fontSize: '14px',
            fontWeight: 600,
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Main Split Architecture: Discovery & Action vs Security Credential Proof */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', alignItems: 'start' }}>
        {/* LEFT PANEL: Fast Reception & Child Identification */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Search & Input Card */}
          <section className="s-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--s-text)', margin: 0 }}>
                Quem chegou hoje? 👋
              </h2>
              <span className="s-badge s-badge--emerald" style={{ fontSize: '11px' }}>
                {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p style={{ color: 'var(--s-text-muted)', fontSize: '13px', margin: '0 0 16px 0' }}>
              Identifique a criança pelo nome para emitir o código de liberação e crachá de segurança.
            </p>

            {/* Big Search Input */}
            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <Search size={20} color="var(--s-primary)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar pelo nome da criança..."
                className="s-input"
                style={{
                  width: '100%',
                  height: '52px',
                  paddingLeft: '48px',
                  paddingRight: '40px',
                  fontSize: '15px',
                  fontWeight: 600,
                  boxSizing: 'border-box'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--s-text-muted)', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              )}

              {/* Autocomplete Dropdown */}
              {searchResults.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '6px',
                    background: 'var(--s-surface-container-lowest)',
                    border: '1px solid var(--s-border)',
                    borderRadius: '14px',
                    boxShadow: 'var(--s-shadow-md)',
                    zIndex: 30,
                    overflow: 'hidden'
                  }}
                >
                  {searchResults.map((res) => (
                    <div
                      key={res.id}
                      onClick={() => handleSelectChild(res)}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--s-border)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--s-surface-container-low)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--s-primary-container-soft)', color: 'var(--s-primary)', fontWeight: 800, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {res.child?.first_name?.[0]}
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--s-text)' }}>
                          {res.child?.first_name} {res.child?.last_name || ''}
                        </span>
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--s-primary)', fontWeight: 700 }}>Selecionar →</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Child Active Selection & Registration Form */}
          {selectedChild ? (
            <section className="s-card" style={{ padding: '24px', borderLeft: '4px solid var(--s-emerald)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--s-primary-container)', color: '#fff', fontSize: '18px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {selectedChild.first_name[0]}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--s-text)', margin: '0 0 2px 0' }}>
                      {selectedChild.first_name} {selectedChild.last_name || ''}
                    </h3>
                    <span className="s-badge s-badge--emerald" style={{ fontSize: '11px' }}>
                      Membro Cadastrado
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedChild(null)}
                  className="s-btn s-btn--secondary"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                >
                  Trocar
                </button>
              </div>

              <form onSubmit={handleCreateCheckin}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label className="s-label" style={{ marginBottom: '6px' }}>Turma / Sala Designada *</label>
                    <select
                      value={selectedClassId}
                      onChange={(e) => setSelectedClassId(e.target.value)}
                      className="s-select"
                      style={{ width: '100%', height: '46px' }}
                      required
                    >
                      <option value="">Selecione a turma da criança</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.age_group ? `(${c.age_group})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="s-label" style={{ marginBottom: '6px' }}>Quem trouxe a criança? *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Mariana Castro (Mãe), Carlos (Pai)..."
                      value={broughtByName}
                      onChange={(e) => setBroughtByName(e.target.value)}
                      className="s-input"
                      style={{ width: '100%', height: '46px' }}
                    />
                  </div>

                  <div>
                    <label className="s-label" style={{ marginBottom: '6px' }}>WhatsApp do Responsável</label>
                    <input
                      type="tel"
                      placeholder="(11) 98821-4190"
                      value={broughtByPhone}
                      onChange={(e) => setBroughtByPhone(e.target.value)}
                      className="s-input"
                      style={{ width: '100%', height: '46px' }}
                    />
                  </div>

                  <div>
                    <label className="s-label" style={{ marginBottom: '6px' }}>Observações (Alergias, mochila, etc.)</label>
                    <input
                      type="text"
                      placeholder="Ex: sem alergias conhecidas, está com mochila azul..."
                      value={checkinNotes}
                      onChange={(e) => setCheckinNotes(e.target.value)}
                      className="s-input"
                      style={{ width: '100%', height: '46px' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={processing}
                    className="s-btn s-btn--primary"
                    style={{
                      height: '52px',
                      fontSize: '15px',
                      fontWeight: 800,
                      marginTop: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <CheckCircle2 size={18} />
                    <span>{processing ? 'Confirmando...' : 'Confirmar Entrada & Gerar Código'}</span>
                  </button>
                </div>
              </form>
            </section>
          ) : (
            <section className="s-card" style={{ padding: '32px 24px', textAlign: 'center', background: 'var(--s-surface-container-low)', border: '1px dashed var(--s-border)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'var(--s-surface-container)', color: 'var(--s-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                <Search size={22} />
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--s-text)', margin: '0 0 6px 0' }}>
                Nenhuma criança selecionada
              </h3>
              <p style={{ color: 'var(--s-text-muted)', fontSize: '13px', margin: 0, maxWidth: '300px', marginLeft: 'auto', marginRight: 'auto' }}>
                Digite o nome da criança no campo acima para carregar os dados cadastrais e emitir o código.
              </p>
            </section>
          )}
        </div>

        {/* RIGHT PANEL: Master Confirmation Card or Waiting Guide */}
        <div>
          {issuedCredential ? (
            <section
              className="s-card"
              style={{
                padding: '28px',
                position: 'relative',
                overflow: 'hidden',
                border: '2px solid var(--s-emerald)',
                background: 'linear-gradient(180deg, var(--s-surface-container-lowest) 0%, rgba(0, 108, 73, 0.03) 100%)'
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--s-emerald)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--s-text)', margin: 0 }}>
                      Tudo certo! ✓
                    </h3>
                    <span style={{ fontSize: '12px', color: 'var(--s-emerald)', fontWeight: 700 }}>
                      Entrada Registrada com Sucesso
                    </span>
                  </div>
                </div>

                <span className="s-badge" style={{ background: 'var(--s-surface-container)', fontSize: '12px' }}>
                  <Clock size={12} /> {issuedCredential.time}
                </span>
              </div>

              {/* Narrative Recap */}
              <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(0, 108, 73, 0.08)', color: 'var(--s-text)', fontSize: '13px', marginBottom: '20px', lineHeight: 1.5 }}>
                <strong>{issuedCredential.childName}</strong> entrou hoje às <strong>{issuedCredential.time}</strong> no Culto Infantil (<span style={{ color: 'var(--s-emerald)', fontWeight: 700 }}>{issuedCredential.className}</span>).
              </div>

              {/* GIANT 4-DIGIT CODE SPOTLIGHT */}
              <div style={{ padding: '24px 16px', borderRadius: '18px', background: 'var(--s-surface-container-low)', textAlign: 'center', marginBottom: '20px', border: '1px solid var(--s-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--s-primary)', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                  <ShieldCheck size={16} />
                  <span>Código de Retirada Obrigatório</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', margin: '8px 0' }}>
                  {issuedCredential.securityCode.split('').map((digit, idx) => (
                    <div
                      key={idx}
                      style={{
                        width: '56px',
                        height: '70px',
                        borderRadius: '14px',
                        background: 'var(--s-surface-container-lowest)',
                        boxShadow: 'var(--s-shadow-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '38px',
                        fontWeight: 900,
                        color: 'var(--s-text)',
                        border: '1px solid var(--s-border)'
                      }}
                    >
                      {digit}
                    </div>
                  ))}
                </div>

                <p style={{ color: 'var(--s-text-muted)', fontSize: '12px', margin: '12px 0 0 0' }}>
                  Entregue este código para <strong>{issuedCredential.guardianName}</strong>. A saída só será liberada com ele.
                </p>
              </div>

              {/* Mini QR Code & Quick Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ padding: '10px', background: 'var(--s-surface-container-lowest)', borderRadius: '14px', border: '1px solid var(--s-border)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <SecureQRCode token={issuedCredential.token} securityCode={issuedCredential.securityCode} size={90} />
                  <span style={{ fontSize: '10px', color: 'var(--s-text-muted)', fontWeight: 600, marginTop: '6px' }}>TAG SEGURA</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="s-btn s-btn--emerald"
                    style={{ height: '42px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Share2 size={16} />
                    <span>Enviar no WhatsApp da Família</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="s-btn s-btn--secondary"
                    style={{ height: '42px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Printer size={16} />
                    <span>Imprimir Etiqueta Dupla</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="s-btn s-btn--ghost"
                    style={{ height: '36px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    {copiedCode ? <Check size={14} color="var(--s-emerald)" /> : <Copy size={14} />}
                    <span>{copiedCode ? 'Código Copiado!' : 'Copiar Código de Retirada'}</span>
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIssuedCredential(null)}
                className="s-btn s-btn--secondary"
                style={{ width: '100%', height: '44px', fontSize: '13px', fontWeight: 700 }}
              >
                Próxima Criança da Fila →
              </button>
            </section>
          ) : (
            <section className="s-card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--s-surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--s-primary)' }}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--s-text)', margin: 0 }}>
                    Protocolo de Segurança Ativo
                  </h3>
                  <span style={{ fontSize: '12px', color: 'var(--s-text-muted)' }}>
                    Conferência dupla por código e QR Code
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: 'var(--s-text-muted)', lineHeight: 1.5 }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ color: 'var(--s-emerald)', fontWeight: 800 }}>1.</span>
                  <span>A criança recebe a etiqueta adesiva ou pulseira numerada com PIN de 4 dígitos.</span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ color: 'var(--s-emerald)', fontWeight: 800 }}>2.</span>
                  <span>O responsável recebe o mesmo código instantaneamente via WhatsApp.</span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ color: 'var(--s-emerald)', fontWeight: 800 }}>3.</span>
                  <span>No final do culto, o balcão de saída só libera a criança após conferir o código no sistema.</span>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
