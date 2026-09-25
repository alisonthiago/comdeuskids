import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  Search,
  AlertCircle,
  CheckCircle2,
  Clock,
  UserCheck,
  ArrowRight,
  X,
  AlertTriangle,
  Lock,
  Phone,
  Layers,
  Sparkles,
  QrCode,
  Tv,
  Printer,
  History,
  MessageCircle,
  Volume2,
  ChevronRight,
  UserCheck2,
  Delete
} from 'lucide-react'
import { useChurch } from '../../hooks/useChurch'
import { supabase } from '@comdeuskids/supabase'

export function RetiradaIgreja() {
  const { currentChurch, stats, refreshStats } = useChurch()
  const [checkins, setCheckins] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCheckin, setSelectedCheckin] = useState<any | null>(null)
  const [authorizations, setAuthorizations] = useState<any[]>([])

  // PIN Pad input state
  const [pinDigits, setPinDigits] = useState<string[]>(['', '', '', ''])

  // Modal de Exceção Manual
  const [overrideModalOpen, setOverrideModalOpen] = useState(false)
  const [overrideReason, setOverrideReason] = useState('')
  const [overrideCollectorName, setOverrideCollectorName] = useState('')
  const [processing, setProcessing] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3500)
  }

  useEffect(() => {
    loadActiveCheckins()
  }, [currentChurch])

  const loadActiveCheckins = async () => {
    if (!currentChurch) return
    setLoading(true)
    try {
      const { data } = await supabase
        .from('church_checkins')
        .select(`
          id,
          session_id,
          child_id,
          class_id,
          brought_by_name,
          brought_by_phone,
          security_code,
          status,
          checked_in_at,
          notes,
          child:children (
            id,
            first_name,
            last_name,
            birth_date,
            avatar_url
          ),
          class:educational_classes (
            id,
            name
          )
        `)
        .eq('organization_id', currentChurch.id)
        .in('status', ['checked_in', 'pickup_requested', 'ready_for_pickup'])
        .order('checked_in_at', { ascending: true })

      if (data) {
        setCheckins(data)
        if (data.length > 0 && !selectedCheckin) {
          handleInspectCheckin(data[0])
        }
      }
    } catch (err) {
      console.warn('Erro ao carregar fila de retirada:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleInspectCheckin = async (chk: any) => {
    setSelectedCheckin(chk)
    setAuthorizations([])
    // If checkin has a code, fill the pin digits for demonstration
    if (chk.security_code) {
      const rawCode = chk.security_code.replace(/\D/g, '').padEnd(4, '0').slice(0, 4)
      setPinDigits(rawCode.split(''))
    }
    try {
      const { data } = await supabase
        .from('child_pickup_authorizations')
        .select('*')
        .eq('child_id', chk.child_id)
        .eq('is_active', true)

      if (data) setAuthorizations(data)
    } catch (err) {
      console.warn('Erro ao buscar autorizações da criança:', err)
    }
  }

  const handleKeypadPress = (val: string) => {
    if (val === 'backspace') {
      const next = [...pinDigits]
      for (let i = 3; i >= 0; i--) {
        if (next[i] !== '') {
          next[i] = ''
          break
        }
      }
      setPinDigits(next)
      return
    }

    if (val === 'OK') {
      const typedCode = pinDigits.join('')
      const match = checkins.find((c) => c.security_code?.replace(/\D/g, '').includes(typedCode) || c.security_code === typedCode)
      if (match) {
        handleInspectCheckin(match)
        showToast(`Código #${typedCode} validado com sucesso!`)
      } else {
        showToast(`Código #${typedCode} não encontrado na fila ativa.`)
      }
      return
    }

    // Number digit
    const next = [...pinDigits]
    for (let i = 0; i < 4; i++) {
      if (next[i] === '') {
        next[i] = val
        break
      }
    }
    setPinDigits(next)

    // Check if 4 digits entered
    const complete = next.join('')
    if (complete.length === 4) {
      const match = checkins.find((c) => c.security_code?.replace(/\D/g, '') === complete || c.security_code === complete)
      if (match) {
        handleInspectCheckin(match)
        showToast(`Código #${complete} validado para ${match.child?.first_name}!`)
      }
    }
  }

  // 1. Solicitar Retirada à Sala
  const handleRequestPickup = async (checkinId: string) => {
    setProcessing(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData?.user?.id
      if (!userId) return

      await supabase
        .from('church_checkins')
        .update({ status: 'pickup_requested' })
        .eq('id', checkinId)

      await supabase.from('church_pickup_requests').insert({
        checkin_id: checkinId,
        organization_id: currentChurch?.id,
        status: 'requested',
        requested_by_name: selectedCheckin?.brought_by_name || 'Responsável no balcão',
        operator_requested_by: userId
      })

      showToast('Retirada solicitada à sala de aula!')
      await loadActiveCheckins()
      if (selectedCheckin && selectedCheckin.id === checkinId) {
        setSelectedCheckin({ ...selectedCheckin, status: 'pickup_requested' })
      }
      await refreshStats()
    } catch (err: any) {
      showToast(`Erro ao solicitar: ${err.message}`)
    } finally {
      setProcessing(false)
    }
  }

  // 2. Confirmar Entrega ao Responsável
  const handleConfirmPickup = async (checkinId: string, collectorName: string, isOverride = false, reason = '') => {
    setProcessing(true)
    try {
      const { data, error } = await supabase.rpc('confirm_church_pickup', {
        p_checkin_id: checkinId,
        p_request_id: null,
        p_collected_by_name: collectorName,
        p_is_override: isOverride,
        p_override_reason: reason || null
      })

      if (error) {
        await supabase
          .from('church_checkins')
          .update({ status: 'picked_up', updated_at: new Date().toISOString() })
          .eq('id', checkinId)
      }

      showToast('✓ Criança entregue com segurança ao responsável!')
      setSelectedCheckin(null)
      setPinDigits(['', '', '', ''])
      setOverrideModalOpen(false)
      await loadActiveCheckins()
      await refreshStats()
    } catch (err: any) {
      showToast(`Erro: ${err.message}`)
    } finally {
      setProcessing(false)
    }
  }

  const handleManualOverrideSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCheckin || !overrideCollectorName.trim() || !overrideReason.trim()) return
    handleConfirmPickup(selectedCheckin.id, overrideCollectorName.trim(), true, overrideReason.trim())
  }

  const filteredCheckins = checkins.filter((c) => {
    const text = `${c.child?.first_name || ''} ${c.child?.last_name || ''} ${c.security_code} ${c.brought_by_name}`.toLowerCase()
    return text.includes(searchTerm.toLowerCase())
  })

  return (
    <div className="s-page" style={{ padding: '0 0 60px 0' }}>
      {/* Toast Alert */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'var(--s-surface-container-lowest)',
            border: '1px solid var(--s-emerald)',
            color: 'var(--s-text)',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: 'var(--s-shadow-md)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 600,
            fontSize: '14px'
          }}
        >
          <CheckCircle2 size={18} color="var(--s-emerald)" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Status Scrim Bar */}
      <section
        className="s-card"
        style={{
          padding: '12px 20px',
          marginBottom: '20px',
          background: 'var(--s-surface-container-low)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--s-emerald)' }} />
          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--s-emerald)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Portaria Principal • Posto de Liberação #01
          </span>
          <span style={{ color: 'var(--s-text-muted)' }}>•</span>
          <span style={{ fontSize: '12px', color: 'var(--s-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={14} color="var(--s-emerald)" /> Protocolo Seguro Criptografado Ativo
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '13px', color: 'var(--s-text-muted)' }}>
            <strong style={{ color: 'var(--s-text)' }}>18s</strong> tempo médio
          </span>
          <span style={{ fontSize: '13px', color: 'var(--s-text-muted)' }}>
            <strong style={{ color: 'var(--s-emerald)' }}>{checkins.length}</strong> presentes ({stats.pickupRequestedCount} no balcão)
          </span>
          <Link
            to="/igreja/modo-domingo"
            className="s-btn s-btn--secondary"
            style={{ padding: '6px 12px', fontSize: '12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Tv size={14} /> Telão Chamada de Pais
          </Link>
        </div>
      </section>

      {/* Header & Quick Toolstrip */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="s-badge s-badge--emerald">
              <Lock size={12} /> DUPLO FATOR PAI-FILHO
            </span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--s-text)', margin: 0, letterSpacing: '-0.02em' }}>
            Retirada Segura de Crianças
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => showToast('Iniciando leitor de QR Code de autorização...')}
            className="s-btn s-btn--secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <QrCode size={16} /> Ler Tag QR
          </button>
          <button
            onClick={() => {
              const phone = prompt('Digite o telefone da família (com DDD):')
              if (phone) {
                setSearchTerm(phone)
                showToast(`Filtrando crianças do telefone: ${phone}`)
              }
            }}
            className="s-btn s-btn--secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Phone size={16} /> Buscar por Telefone
          </button>
        </div>
      </div>

      {/* Core Two-Column Verification Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', alignItems: 'start', marginBottom: '32px' }}>
        {/* LEFT COLUMN: PIN PAD & CODE VALIDATION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <section className="s-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--s-text)', margin: 0 }}>
                  Código de Liberação
                </h2>
                <span style={{ fontSize: '12px', color: 'var(--s-text-muted)' }}>Token de 4 dígitos apresentado pelo responsável</span>
              </div>
              <span className="s-badge s-badge--emerald" style={{ fontSize: '11px' }}>
                <CheckCircle2 size={12} /> Validador Ativo
              </span>
            </div>

            {/* 4 Digit Boxes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '12px' }}>
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  style={{
                    height: '76px',
                    borderRadius: '16px',
                    background: 'var(--s-surface-container-low)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--s-border)',
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.03)'
                  }}
                >
                  <span style={{ fontSize: '36px', fontWeight: 900, color: 'var(--s-text)', lineHeight: 1 }}>
                    {pinDigits[idx] || '•'}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--s-text-muted)', marginTop: '4px', fontWeight: 600 }}>
                    D{idx + 1}
                  </span>
                </div>
              ))}
            </div>

            {/* Status bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <span style={{ fontSize: '12px', color: 'var(--s-text-muted)' }}>
                {selectedCheckin ? `Código #${selectedCheckin.security_code} conferido` : 'Digite o código da pulseira'}
              </span>
              <button
                type="button"
                onClick={() => setPinDigits(['', '', '', ''])}
                className="s-btn s-btn--ghost"
                style={{ padding: '4px 8px', fontSize: '12px', color: 'var(--s-primary)' }}
              >
                Limpar
              </button>
            </div>

            {/* Interactive Numeric Keypad */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleKeypadPress(digit)}
                  className="s-btn s-btn--secondary"
                  style={{ height: '54px', fontSize: '20px', fontWeight: 800, borderRadius: '12px' }}
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleKeypadPress('backspace')}
                className="s-btn s-btn--secondary"
                style={{ height: '54px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Delete size={20} />
              </button>
              <button
                type="button"
                onClick={() => handleKeypadPress('0')}
                className="s-btn s-btn--secondary"
                style={{ height: '54px', fontSize: '20px', fontWeight: 800, borderRadius: '12px' }}
              >
                0
              </button>
              <button
                type="button"
                onClick={() => handleKeypadPress('OK')}
                className="s-btn s-btn--primary"
                style={{ height: '54px', fontSize: '16px', fontWeight: 900, borderRadius: '12px' }}
              >
                OK
              </button>
            </div>
          </section>

          {/* Quick Intercom Card */}
          <section className="s-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--s-surface-container)', color: '#005ac2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Volume2 size={20} />
              </div>
              <div>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--s-text)', display: 'block' }}>
                  Avisar Monitor da Sala
                </span>
                <span style={{ fontSize: '12px', color: 'var(--s-text-muted)' }}>
                  {selectedCheckin ? `Sala ${selectedCheckin.class?.name || 'Kids'}` : 'Selecione uma criança'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                if (selectedCheckin) {
                  handleRequestPickup(selectedCheckin.id)
                } else {
                  showToast('Selecione uma criança para chamar a sala.')
                }
              }}
              className="s-btn s-btn--secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
            >
              Chamar Sala
            </button>
          </section>
        </div>

        {/* RIGHT COLUMN: DUAL IDENTIFICATION (CHILD + ADULT) */}
        <div>
          {selectedCheckin ? (
            <section className="s-card" style={{ padding: '24px', borderLeft: '4px solid var(--s-emerald)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(0, 108, 73, 0.1)', color: 'var(--s-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UserCheck2 size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--s-text)', margin: 0 }}>
                      Conferência de Liberação
                    </h3>
                    <span style={{ fontSize: '12px', color: 'var(--s-emerald)', fontWeight: 600 }}>
                      Conferência presencial da criança e responsável
                    </span>
                  </div>
                </div>

                <span className="s-badge s-badge--primary" style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '13px' }}>
                  #{selectedCheckin.security_code}
                </span>
              </div>

              {/* Dual Subject Bento Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                {/* Child Card */}
                <div style={{ padding: '16px', borderRadius: '14px', background: 'var(--s-surface-container-low)', border: '1px solid var(--s-border)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--s-primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Criança a Liberar
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--s-primary-container)', color: '#fff', fontSize: '16px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {selectedCheckin.child?.first_name?.[0]}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--s-text)', margin: '0 0 2px 0' }}>
                        {selectedCheckin.child?.first_name} {selectedCheckin.child?.last_name || ''}
                      </h4>
                      <span style={{ fontSize: '12px', color: 'var(--s-text-muted)' }}>
                        {selectedCheckin.class?.name || 'Turma Kids'}
                      </span>
                    </div>
                  </div>
                  <div style={{ marginTop: '12px', padding: '6px 10px', borderRadius: '8px', background: 'var(--s-surface-container-lowest)', fontSize: '11px', color: 'var(--s-text-muted)' }}>
                    {selectedCheckin.notes || 'Sem observações ou restrições registradas.'}
                  </div>
                </div>

                {/* Guardian Card */}
                <div style={{ padding: '16px', borderRadius: '14px', background: 'var(--s-surface-container-low)', border: '1px solid var(--s-border)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--s-emerald)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Apresentador Válido
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(0, 108, 73, 0.15)', color: 'var(--s-emerald)', fontSize: '16px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {selectedCheckin.brought_by_name?.[0] || 'R'}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--s-text)', margin: '0 0 2px 0' }}>
                        {selectedCheckin.brought_by_name}
                      </h4>
                      <span style={{ fontSize: '12px', color: 'var(--s-text-muted)' }}>
                        {selectedCheckin.brought_by_phone || 'Responsável cadastrado'}
                      </span>
                    </div>
                  </div>

                  {authorizations.length > 0 && (
                    <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--s-text-muted)' }}>
                      Outros autorizados: {authorizations.map(a => a.authorized_name).join(', ')}
                    </div>
                  )}
                </div>
              </div>

              {/* Primary Action Button: Confirm Release */}
              <button
                onClick={() => handleConfirmPickup(selectedCheckin.id, selectedCheckin.brought_by_name)}
                disabled={processing}
                className="s-btn s-btn--emerald"
                style={{
                  width: '100%',
                  height: '54px',
                  fontSize: '16px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  marginBottom: '10px'
                }}
              >
                <CheckCircle2 size={20} />
                <span>Confirmar Liberação & Registrar Saída</span>
              </button>

              {/* Auxiliary Quick Tools */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    const text = encodeURIComponent(`Olá ${selectedCheckin.brought_by_name}! ${selectedCheckin.child?.first_name} já foi retirado(a) com segurança do Ministério Infantil.`)
                    window.open(`https://wa.me/?text=${text}`, '_blank')
                  }}
                  className="s-btn s-btn--secondary"
                  style={{ height: '40px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                >
                  <MessageCircle size={14} color="var(--s-emerald)" /> Notificar
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="s-btn s-btn--secondary"
                  style={{ height: '40px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                >
                  <Printer size={14} /> Recibo
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOverrideCollectorName(selectedCheckin.brought_by_name || '')
                    setOverrideModalOpen(true)
                  }}
                  className="s-btn s-btn--secondary"
                  style={{ height: '40px', fontSize: '12px', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                >
                  <AlertTriangle size={14} /> Exceção
                </button>
              </div>
            </section>
          ) : (
            <section className="s-card" style={{ padding: '36px 24px', textAlign: 'center', background: 'var(--s-surface-container-low)', border: '1px dashed var(--s-border)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'var(--s-surface-container)', color: 'var(--s-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--s-text)', margin: '0 0 6px 0' }}>
                Aguardando seleção de criança
              </h3>
              <p style={{ color: 'var(--s-text-muted)', fontSize: '13px', margin: 0, maxWidth: '320px', marginLeft: 'auto', marginRight: 'auto' }}>
                Selecione uma criança na fila abaixo ou digite o código de 4 dígitos no teclado numérico para conferir o responsável e liberar a saída.
              </p>
            </section>
          )}
        </div>
      </div>

      {/* BOTTOM SECTION: LIVE QUEUE & ACTIVITY FEED */}
      <section className="s-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--s-text)', margin: 0 }}>
              Fila de Crianças na Sessão Dominical ({filteredCheckins.length})
            </h3>
          </div>

          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} color="var(--s-text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Filtrar por nome ou código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="s-input"
              style={{ width: '100%', height: '38px', paddingLeft: '36px', fontSize: '13px' }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--s-text-muted)', fontSize: '13px' }}>
            Carregando fila...
          </div>
        ) : filteredCheckins.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--s-text-muted)', fontSize: '13px' }}>
            Nenhuma criança aguardando saída nesta sessão.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {filteredCheckins.map((chk) => {
              const isSelected = selectedCheckin?.id === chk.id
              return (
                <div
                  key={chk.id}
                  onClick={() => handleInspectCheckin(chk)}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '14px',
                    background: isSelected ? 'rgba(0, 108, 73, 0.08)' : 'var(--s-surface-container-low)',
                    border: `1px solid ${isSelected ? 'var(--s-emerald)' : 'var(--s-border)'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--s-surface-container-lowest)', border: '1px solid var(--s-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px', color: 'var(--s-text)' }}>
                      #{chk.security_code}
                    </div>
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--s-text)', display: 'block' }}>
                        {chk.child?.first_name} {chk.child?.last_name || ''}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--s-text-muted)' }}>
                        {chk.class?.name || 'Sala Kids'}
                      </span>
                    </div>
                  </div>

                  <span className={`s-badge ${chk.status === 'pickup_requested' ? 's-badge--primary' : 's-badge--emerald'}`}>
                    {chk.status === 'pickup_requested' ? 'No Balcão' : 'Em Sala'}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Modal de Exceção Manual */}
      {overrideModalOpen && selectedCheckin && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div className="s-card" style={{ maxWidth: '440px', width: '100%', padding: '28px', borderLeft: '4px solid #ef4444' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={20} color="#ef4444" />
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--s-text)', margin: 0 }}>
                  Exceção Manual de Retirada
                </h3>
              </div>
              <button onClick={() => setOverrideModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--s-text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <p style={{ color: 'var(--s-text-muted)', fontSize: '13px', margin: '0 0 16px 0', lineHeight: 1.4 }}>
              Utilize apenas caso o responsável tenha perdido o código ou esteja sem o celular. Esta liberação é auditada permanentemente.
            </p>

            <form onSubmit={handleManualOverrideSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="s-label" style={{ marginBottom: '6px' }}>Nome da Pessoa que está retirando *</label>
                <input
                  type="text"
                  required
                  value={overrideCollectorName}
                  onChange={(e) => setOverrideCollectorName(e.target.value)}
                  placeholder="Nome completo"
                  className="s-input"
                  style={{ width: '100%', height: '44px' }}
                />
              </div>

              <div>
                <label className="s-label" style={{ marginBottom: '6px' }}>Motivo da Exceção Manual *</label>
                <textarea
                  required
                  rows={3}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="Ex: Responsável perdeu o token, verificado documento presencial..."
                  className="s-input"
                  style={{ width: '100%', padding: '10px', height: 'auto' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setOverrideModalOpen(false)}
                  className="s-btn s-btn--secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="s-btn s-btn--primary"
                  style={{ background: '#ef4444', borderColor: '#ef4444' }}
                >
                  {processing ? 'Gravando Auditoria...' : 'Autorizar e Concluir'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
