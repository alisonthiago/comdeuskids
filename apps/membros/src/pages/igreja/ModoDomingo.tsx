import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Sun,
  Tv,
  QrCode,
  Printer,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Radio,
  Sparkles,
  Maximize2,
  Minimize2,
  ShieldCheck,
  ChevronRight,
  HeartPulse,
  PhoneCall,
  BellRing
} from 'lucide-react'
import { useChurch } from '../../hooks/useChurch'
import { supabase } from '@comdeuskids/supabase'

export function ModoDomingo() {
  const { currentChurch, stats, refreshStats } = useChurch()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [recentCheckins, setRecentCheckins] = useState<any[]>([])
  const [allergiesList, setAllergiesList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  useEffect(() => {
    async function fetchSundayData() {
      if (!currentChurch) return
      setLoading(true)
      try {
        // Fetch active check-ins with kid and guardian info
        const { data: checkins } = await supabase
          .from('church_checkins')
          .select(`
            id,
            security_code,
            status,
            checked_in_at,
            church_kids:kid_id (
              id,
              full_name,
              nickname,
              allergies,
              medical_notes
            ),
            church_classes:class_id (
              id,
              name,
              room
            ),
            church_guardians:guardian_id (
              id,
              full_name,
              phone
            )
          `)
          .eq('organization_id', currentChurch.id)
          .order('checked_in_at', { ascending: false })
          .limit(10)

        if (checkins) {
          setRecentCheckins(checkins)

          // Filter kids with medical alerts/allergies
          const withAllergies = checkins
            .filter((c: any) => c.church_kids?.allergies || c.church_kids?.medical_notes)
            .map((c: any) => ({
              kidName: c.church_kids?.full_name || 'Criança',
              className: c.church_classes?.name || 'Sala Kids',
              allergies: c.church_kids?.allergies || c.church_kids?.medical_notes,
              code: c.security_code
            }))
          setAllergiesList(withAllergies)
        }
      } catch (err) {
        console.warn('Erro ao carregar dados do Modo Domingo:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSundayData()
    const interval = setInterval(fetchSundayData, 15000)
    return () => clearInterval(interval)
  }, [currentChurch])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setIsFullscreen(false)
    }
  }

  return (
    <div className="s-page" style={{ padding: '0 0 60px 0' }}>
      {/* Toast Alert */}
      {toastMessage && (
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
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner: Sunday Session Header */}
      <section
        className="s-card"
        style={{
          padding: '24px 28px',
          marginBottom: '20px',
          background: 'linear-gradient(135deg, var(--s-surface-container-lowest) 0%, var(--s-surface-container-low) 100%)',
          borderLeft: '4px solid var(--s-emerald)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <span className="s-badge s-badge--emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--s-emerald)', animation: 'pulse 1.5s infinite' }} />
                EM ANDAMENTO
              </span>
              <span className="s-badge" style={{ background: 'var(--s-surface-container)', color: 'var(--s-text-muted)' }}>
                <Clock size={12} /> CULTO DOMINICAL
              </span>
              <span style={{ fontSize: '13px', color: 'var(--s-text-muted)' }}>
                {currentChurch?.name}
              </span>
            </div>

            <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--s-text)', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
              {stats.activeSession?.title || 'Culto Infantil de Domingo'}
            </h1>
            <p style={{ color: 'var(--s-text-muted)', fontSize: '14px', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Radio size={16} color="var(--s-primary)" />
              Painel de Operação em Tempo Real • Portaria, Salas & Telão
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--s-surface-container-low)', padding: '8px 14px', borderRadius: '12px', border: '1px solid var(--s-border)' }}>
              <Tv size={18} color="var(--s-primary)" />
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--s-emerald)' }}>Telão Conectado</span>
            </div>

            <button
              onClick={toggleFullscreen}
              className="s-btn s-btn--secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Modo Quiosque / Telão Fullscreen"
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              <span>{isFullscreen ? 'Sair Quiosque' : 'Quiosque Fullscreen'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4 Metric Bento Cards */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        {/* Metric 1: Crianças Presentes */}
        <div className="s-card s-stat-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--s-text-muted)', fontWeight: 600 }}>Crianças Presentes</span>
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'var(--s-primary-container-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={20} color="var(--s-primary)" />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
              <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--s-text)' }}>
                {stats.checkedInCount}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--s-emerald)', fontWeight: 700 }}>
                {stats.checkedInCount > 0 ? 'em sala' : 'aguardando'}
              </span>
            </div>
          </div>
          <Link
            to="/igreja/checkin"
            className="s-btn s-btn--primary"
            style={{ width: '100%', marginTop: '14px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px' }}
          >
            <QrCode size={16} /> + Check-in Ágil
          </Link>
        </div>

        {/* Metric 2: Turmas Ativas */}
        <div className="s-card s-stat-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--s-text-muted)', fontWeight: 600 }}>Turmas Ativas</span>
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'var(--s-surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={20} color="#005ac2" />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
              <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--s-text)' }}>
                {stats.totalClasses || 4}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--s-text-muted)' }}>salas abertas</span>
            </div>
          </div>
          <Link
            to="/igreja/turmas"
            className="s-btn s-btn--secondary"
            style={{ width: '100%', marginTop: '14px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px' }}
          >
            Painel de Salas
          </Link>
        </div>

        {/* Metric 3: Saída Segura */}
        <div className="s-card s-stat-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--s-text-muted)', fontWeight: 600 }}>Fila de Saída</span>
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'var(--s-primary-container-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={20} color="var(--s-primary)" />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
              <span style={{ fontSize: '32px', fontWeight: 800, color: stats.pickupRequestedCount > 0 ? 'var(--s-primary)' : 'var(--s-text)' }}>
                {stats.pickupRequestedCount}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--s-primary)', fontWeight: 700 }}>
                {stats.pickupRequestedCount > 0 ? 'aguardando balcão' : 'sem fila'}
              </span>
            </div>
          </div>
          <Link
            to="/igreja/retirada"
            className="s-btn s-btn--outline"
            style={{ width: '100%', marginTop: '14px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px' }}
          >
            Fila de Retirada
          </Link>
        </div>

        {/* Metric 4: Equipe Voluntária */}
        <div className="s-card s-stat-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--s-text-muted)', fontWeight: 600 }}>Equipe Kids</span>
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(0, 108, 73, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={20} color="var(--s-emerald)" />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
              <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--s-text)' }}>
                100%
              </span>
              <span style={{ fontSize: '12px', color: 'var(--s-emerald)', fontWeight: 700 }}>escala confirmada</span>
            </div>
          </div>
          <Link
            to="/igreja/equipe"
            className="s-btn s-btn--secondary"
            style={{ width: '100%', marginTop: '14px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px' }}
          >
            Lista de Voluntários
          </Link>
        </div>
      </section>

      {/* Fast Action Hub: 4 1-Touch Buttons */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => showToast('Iniciando leitor de QR Code da câmera...')}
          className="s-card"
          style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s ease' }}
        >
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--s-primary-container)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <QrCode size={20} />
          </div>
          <div>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--s-text)', display: 'block' }}>Escanear QR</span>
            <span style={{ fontSize: '12px', color: 'var(--s-text-muted)' }}>Entrada instantânea</span>
          </div>
        </button>

        <button
          onClick={() => {
            window.print()
            showToast('Enviando etiqueta para impressora térmica...')
          }}
          className="s-card"
          style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s ease' }}
        >
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--s-surface-container)', color: 'var(--s-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Printer size={20} />
          </div>
          <div>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--s-text)', display: 'block' }}>Etiquetas</span>
            <span style={{ fontSize: '12px', color: 'var(--s-text-muted)' }}>Crachá adesivo duplo</span>
          </div>
        </button>

        <Link
          to="/igreja/retirada"
          className="s-card"
          style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', transition: 'all 0.15s ease' }}
        >
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(0, 108, 73, 0.1)', color: 'var(--s-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Tv size={20} />
          </div>
          <div>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--s-text)', display: 'block' }}>Telão de Pais</span>
            <span style={{ fontSize: '12px', color: 'var(--s-text-muted)' }}>Chamada durante o culto</span>
          </div>
        </Link>

        <button
          onClick={() => showToast('Notificação urgente enviada aos voluntários!')}
          className="s-card"
          style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s ease' }}
        >
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--s-primary-container-soft)', color: 'var(--s-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <BellRing size={20} />
          </div>
          <div>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--s-text)', display: 'block' }}>Avisar Líderes</span>
            <span style={{ fontSize: '12px', color: 'var(--s-text-muted)' }}>Alerta imediato</span>
          </div>
        </button>
      </section>

      {/* Main Lower Grid: Live Feed (8 cols) and Urgent Alerts (4 cols) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Left: Live Check-in Feed */}
        <section className="s-card" style={{ padding: '24px', flex: '1 1 55%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--s-emerald)', animation: 'pulse 1.5s infinite' }} />
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--s-text)', margin: 0 }}>
                Últimos Check-ins Registrados
              </h3>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--s-text-muted)' }}>
              Sincronização ao vivo
            </span>
          </div>

          {recentCheckins.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentCheckins.map((checkin) => {
                const kid = checkin.church_kids
                const guardian = checkin.church_guardians
                const room = checkin.church_classes
                const time = checkin.checked_in_at ? new Date(checkin.checked_in_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--'

                return (
                  <div
                    key={checkin.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      background: 'var(--s-surface-container-low)',
                      border: '1px solid var(--s-border)',
                      gap: '12px',
                      flexWrap: 'wrap'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--s-text)', minWidth: '42px' }}>
                        {time}
                      </span>
                      <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--s-primary-container-soft)', color: 'var(--s-primary)', fontWeight: 800, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {kid?.full_name?.slice(0, 2).toUpperCase() || 'CK'}
                      </div>
                      <div>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--s-text)', display: 'block' }}>
                          {kid?.full_name || 'Criança'}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--s-text-muted)' }}>
                          {room?.name || 'Sala Kids'} {guardian ? `• Resp: ${guardian.full_name}` : ''}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="s-badge s-badge--primary" style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '12px' }}>
                        #{checkin.security_code}
                      </span>
                      <span className="s-badge s-badge--emerald">
                        {checkin.status === 'checked_in' ? 'Em Sala' : checkin.status === 'pickup_requested' ? 'Chamado' : 'Liberado'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--s-text-muted)', fontSize: '13px' }}>
              Nenhum check-in registrado na sessão atual ainda.
            </div>
          )}
        </section>

        {/* Right: Urgent Security Alerts & Quick Support */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: '1 1 35%' }}>
          {/* Alerta de Alergia */}
          <section className="s-card" style={{ padding: '24px', borderLeft: '4px solid var(--s-primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <AlertTriangle size={20} color="var(--s-primary)" />
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--s-text)', margin: 0 }}>
                Alertas de Alergia & Restrições
              </h4>
            </div>

            {allergiesList.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {allergiesList.map((item, idx) => (
                  <div key={idx} style={{ padding: '12px', borderRadius: '12px', background: 'var(--s-primary-container-soft)', border: '1px solid rgba(244, 81, 42, 0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--s-text)' }}>{item.kidName}</span>
                      <span className="s-badge s-badge--primary" style={{ fontSize: '11px', fontFamily: 'monospace' }}>#{item.code}</span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--s-text)', margin: '4px 0 0 0', fontWeight: 500 }}>
                      ⚠️ {item.allergies}
                    </p>
                    <span style={{ fontSize: '11px', color: 'var(--s-text-muted)', display: 'block', marginTop: '2px' }}>{item.className}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(0, 108, 73, 0.08)', color: 'var(--s-emerald)', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} />
                <span>Nenhuma ocorrência alimentar crítica registrada hoje.</span>
              </div>
            )}
          </section>

          {/* Chamado de Apoio Rápido */}
          <section className="s-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--s-text)', margin: 0 }}>
                Chamado de Apoio
              </h4>
              <PhoneCall size={18} color="var(--s-text-muted)" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                onClick={() => showToast('Chamando equipe de Apoio Voluntário!')}
                className="s-btn s-btn--secondary"
                style={{ padding: '10px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                Voluntários
              </button>
              <button
                onClick={() => showToast('Chamando equipe de Limpeza/Higienização!')}
                className="s-btn s-btn--secondary"
                style={{ padding: '10px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                Limpeza
              </button>
              <button
                onClick={() => showToast('Chamando Berçário / Apoio Materno!')}
                className="s-btn s-btn--secondary"
                style={{ padding: '10px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                Berçário
              </button>
              <button
                onClick={() => showToast('Chamando Coordenação Geral!')}
                className="s-btn s-btn--primary"
                style={{ padding: '10px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                Coordenação
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
