import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfile } from '../context/ProfileContext'
import { supabase } from '@comdeuskids/supabase'
import { AccountProfile } from '@comdeuskids/types'
import { verifyParentPin, setParentPin, hasParentPinConfigured } from '../lib/pinService'
import { getLocalTimeInTimezone, formatRemainingTime } from '../lib/parentalPolicy'
import { getAvatarImageUrl } from '../data/avatars'
import {
  Shield, Lock, Sparkles, Plus, Edit2, Clock, Moon,
  Sliders, Mail, Laptop, ChevronRight, Check, KeyRound, X,
  PauseCircle, PlayCircle, AlertCircle, Save, CheckCircle2
} from 'lucide-react'

const DAY_OPTIONS = [
  { key: 'seg', label: 'Seg' },
  { key: 'ter', label: 'Ter' },
  { key: 'qua', label: 'Qua' },
  { key: 'qui', label: 'Qui' },
  { key: 'sex', label: 'Sex' },
  { key: 'sab', label: 'Sáb' },
  { key: 'dom', label: 'Dom' }
]

export default function MinhaFamilia() {
  const navigate = useNavigate()
  const { profiles, activeProfile, selectProfile, updateProfile } = useProfile()

  // Perfil do responsável principal da família
  const parentProfile = profiles.find(p => p.profile_type === 'parent') || activeProfile

  // Estados de PIN
  const [showPinModal, setShowPinModal] = useState(false)
  const [currentPinInput, setCurrentPinInput] = useState('')
  const [newPinInput, setNewPinInput] = useState('')
  const [pinActionLoading, setPinActionLoading] = useState(false)
  const [pinActionMessage, setPinActionMessage] = useState<{ text: string; isError: boolean } | null>(null)

  // Status de salvamento dos controles parentais
  const [saveStatus, setSaveStatus] = useState<Record<string, 'idle' | 'saving' | 'saved' | 'error'>>({})

  // Consumo diário real de cada perfil infantil (em segundos)
  const [usageToday, setUsageToday] = useState<Record<string, number>>({})

  // Kid profiles reais da conta
  const kidProfiles = profiles.filter(p => p.profile_type === 'kid')

  // Carregar uso real de hoje do Supabase para todos os perfis infantis
  const loadDailyUsage = useCallback(async () => {
    if (kidProfiles.length === 0) return

    const clientTz = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'America/Sao_Paulo'
    const { dateString } = getLocalTimeInTimezone(new Date(), parentProfile?.timezone || clientTz)

    try {
      const { data, error } = await supabase
        .from('profile_usage_sessions')
        .select('profile_id, active_seconds')
        .eq('usage_date', dateString)

      if (!error && data) {
        const aggregated: Record<string, number> = {}
        data.forEach((row: { profile_id: string; active_seconds: number }) => {
          aggregated[row.profile_id] = (aggregated[row.profile_id] || 0) + (row.active_seconds || 0)
        })
        setUsageToday(aggregated)
      } else {
        // Fallback para cache local de cada criança
        const aggregated: Record<string, number> = {}
        kidProfiles.forEach(k => {
          const cached = localStorage.getItem(`cdk_usage_${k.id}_${dateString}`)
          if (cached) aggregated[k.id] = Number(cached) || 0
        })
        setUsageToday(aggregated)
      }
    } catch {
      // Falha de rede silenciosa
    }
  }, [kidProfiles, parentProfile?.timezone])

  useEffect(() => {
    loadDailyUsage()
  }, [loadDailyUsage])

  // Salvar alteração de controle parental diretamente no Supabase
  const handleUpdateKidControl = async (kidId: string, partial: Partial<AccountProfile>) => {
    setSaveStatus(prev => ({ ...prev, [kidId]: 'saving' }))
    const success = await updateProfile(kidId, partial)

    if (success) {
      setSaveStatus(prev => ({ ...prev, [kidId]: 'saved' }))
      setTimeout(() => {
        setSaveStatus(prev => ({ ...prev, [kidId]: 'idle' }))
      }, 2500)
    } else {
      setSaveStatus(prev => ({ ...prev, [kidId]: 'error' }))
      setTimeout(() => {
        setSaveStatus(prev => ({ ...prev, [kidId]: 'idle' }))
      }, 4000)
    }
  }

  // Alternar pausa manual ou definir pausa temporária
  const handleTogglePause = (kid: AccountProfile) => {
    const isCurrentlyPaused = kid.is_paused && (!kid.paused_until || new Date(kid.paused_until) > new Date())
    if (isCurrentlyPaused) {
      // Despausar imediatamente
      handleUpdateKidControl(kid.id, { is_paused: false, paused_until: null })
    } else {
      // Pausar
      handleUpdateKidControl(kid.id, { is_paused: true, paused_until: null })
    }
  }

  const handleSetTemporaryPause = (kid: AccountProfile, minutes: number) => {
    const until = new Date(Date.now() + minutes * 60 * 1000).toISOString()
    handleUpdateKidControl(kid.id, { is_paused: true, paused_until: until })
  }

  // Alternar dias permitidos
  const handleToggleDay = (kid: AccountProfile, dayKey: string) => {
    const currentDays = kid.allowed_days && kid.allowed_days.length > 0
      ? kid.allowed_days
      : ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom']

    let nextDays: string[]
    if (currentDays.includes(dayKey)) {
      if (currentDays.length === 1) {
        alert('É necessário manter pelo menos 1 dia liberado.')
        return
      }
      nextDays = currentDays.filter(d => d !== dayKey)
    } else {
      nextDays = [...currentDays, dayKey]
    }

    handleUpdateKidControl(kid.id, { allowed_days: nextDays })
  }

  // Gerenciar / Definir novo PIN
  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!parentProfile) return

    if (!newPinInput || !/^[0-9]{4,6}$/.test(newPinInput)) {
      setPinActionMessage({ text: 'O PIN deve conter de 4 a 6 números.', isError: true })
      return
    }

    setPinActionLoading(true)
    setPinActionMessage(null)

    try {
      const res = await setParentPin(parentProfile.id, newPinInput, currentPinInput)
      if (res.success) {
        setPinActionMessage({ text: 'PIN configurado com sucesso!', isError: false })
        setCurrentPinInput('')
        setNewPinInput('')
        setTimeout(() => {
          setShowPinModal(false)
          setPinActionMessage(null)
        }, 1500)
      } else {
        setPinActionMessage({ text: res.error || 'Falha ao atualizar PIN.', isError: true })
      }
    } catch {
      setPinActionMessage({ text: 'Erro ao conectar ao servidor.', isError: true })
    } finally {
      setPinActionLoading(false)
    }
  }

  const hasPin = hasParentPinConfigured(parentProfile)

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#131315',
      color: '#e5e1e4',
      paddingTop: 72,
      paddingBottom: 90,
      fontFamily: "'Baloo 2', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      <div className="cdk-content-container" style={{ maxWidth: 960, margin: '0 auto', padding: '0 16px' }}>

        {/* HEADER / STATUS CARD: ÁREA DA FAMÍLIA */}
        <div style={{
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#201f21',
          borderRadius: 20,
          padding: '24px 20px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          marginTop: 12,
          border: '1px solid #353437'
        }}>
          {/* Efeitos de luz ambiente */}
          <div style={{
            position: 'absolute',
            right: -32,
            top: -32,
            width: 140,
            height: 140,
            borderRadius: '50%',
            backgroundColor: 'rgba(208, 188, 255, 0.1)',
            filter: 'blur(30px)',
            pointerEvents: 'none'
          }} />

          {/* Topo do Card */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 24,
                height: 24,
                borderRadius: '50%',
                backgroundColor: '#ffb95f',
                color: '#472a00'
              }}>
                <Sparkles size={14} />
              </span>
              <span style={{
                fontSize: 12,
                fontWeight: 800,
                color: '#ffb95f',
                letterSpacing: '0.06em',
                textTransform: 'uppercase'
              }}>
                Central da Família &amp; Controle Parental
              </span>
            </div>

            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              backgroundColor: '#2a2a2c',
              color: '#7bd0ff',
              padding: '3px 10px',
              borderRadius: 9999,
              fontSize: 11,
              fontWeight: 800
            }}>
              <span style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: '#7bd0ff',
                display: 'inline-block'
              }} />
              Família Ativa
            </span>
          </div>

          {/* Perfil do Responsável */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  backgroundColor: '#353437',
                  border: '2px solid rgba(255, 185, 95, 0.4)'
                }}>
                  <img
                    src={getAvatarImageUrl(parentProfile?.avatar_url)}
                    alt={parentProfile?.name || 'Responsável'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/avatars/davi.png'
                    }}
                  />
                </div>
                <div style={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  color: '#052e16',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.4)'
                }}>
                  <Shield size={12} />
                </div>
              </div>

              <div>
                <h2 style={{ fontSize: 19, fontWeight: 800, color: '#e5e1e4', margin: 0 }}>
                  {parentProfile?.name || 'Responsável da Conta'}
                </h2>
                <span style={{
                  fontSize: 12,
                  color: '#cbc3d7',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  marginTop: 2
                }}>
                  Conta Master &bull; Fuso Horário: {parentProfile?.timezone || 'Automático'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setPinActionMessage(null)
                setShowPinModal(true)
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                backgroundColor: hasPin ? '#2a2a2c' : '#ffb95f',
                color: hasPin ? '#e5e1e4' : '#3c2000',
                padding: '9px 14px',
                borderRadius: 10,
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 800,
                transition: 'transform 0.15s'
              }}
            >
              <Lock size={15} color={hasPin ? '#22c55e' : '#3c2000'} />
              <span>{hasPin ? 'PIN Configurado (Alterar)' : 'Criar PIN de Segurança'}</span>
            </button>
          </div>
        </div>

        {/* SEÇÃO DE CADA CRIANÇA COM CONTROLE REAL DO SUPABASE */}
        <div style={{ marginTop: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={20} color="#ffb95f" />
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#e5e1e4', margin: 0 }}>
                Controles de Tempo &amp; Conteúdo por Perfil
              </h3>
            </div>
            <span style={{
              fontSize: 12,
              fontWeight: 800,
              color: '#cbc3d7',
              backgroundColor: '#201f21',
              padding: '3px 10px',
              borderRadius: 9999,
              border: '1px solid #353437'
            }}>
              {kidProfiles.length} Perfil(s) Infantil(is)
            </span>
          </div>

          {kidProfiles.length === 0 ? (
            <div style={{
              backgroundColor: '#201f21',
              borderRadius: 16,
              padding: 32,
              textAlign: 'center',
              border: '1px dashed #353437'
            }}>
              <p style={{ color: '#cbc3d7', fontSize: 14, marginBottom: 16 }}>
                Nenhum perfil infantil cadastrado nesta família ainda.
              </p>
              <button
                onClick={() => navigate('/perfis')}
                style={{
                  backgroundColor: '#22c55e',
                  color: '#052e16',
                  padding: '10px 18px',
                  borderRadius: 10,
                  border: 'none',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Cadastrar Perfil Infantil
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {kidProfiles.map(kid => {
                const consumedSec = usageToday[kid.id] || 0
                const hasDailyLimit = kid.daily_limit_minutes !== null && kid.daily_limit_minutes !== undefined
                const limitSec = hasDailyLimit ? (kid.daily_limit_minutes as number) * 60 : null
                const progressPct = limitSec ? Math.min(100, Math.round((consumedSec / limitSec) * 100)) : 0
                const isPausedEffective = !!(kid.is_paused && (!kid.paused_until || new Date(kid.paused_until) > new Date()))
                const status = saveStatus[kid.id] || 'idle'

                return (
                  <div
                    key={kid.id}
                    style={{
                      backgroundColor: '#201f21',
                      borderRadius: 18,
                      border: isPausedEffective ? '1px solid #ff8585' : '1px solid #353437',
                      padding: '20px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                      transition: 'border 0.2s'
                    }}
                  >
                    {/* Topo do Card da Criança */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{
                          width: 52,
                          height: 52,
                          borderRadius: '50%',
                          overflow: 'hidden',
                          backgroundColor: '#353437',
                          border: isPausedEffective ? '2px solid #ff8585' : '2px solid #22c55e'
                        }}>
                          <img
                            src={getAvatarImageUrl(kid.avatar_url)}
                            alt={kid.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/avatars/davi.png'
                            }}
                          />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <h4 style={{ fontSize: 17, fontWeight: 800, color: '#e5e1e4', margin: 0 }}>
                              {kid.name}
                            </h4>
                            {isPausedEffective && (
                              <span style={{
                                backgroundColor: 'rgba(255, 100, 100, 0.2)',
                                color: '#ff8585',
                                padding: '2px 8px',
                                borderRadius: 6,
                                fontSize: 10,
                                fontWeight: 800
                              }}>
                                PAUSADO
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: 12, color: '#cbc3d7' }}>
                            {kid.age ? `${kid.age} anos` : 'Perfil Infantil'} &bull; Uso Hoje: {Math.floor(consumedSec / 60)} min
                          </span>
                        </div>
                      </div>

                      {/* Status de Salvamento */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {status === 'saving' && (
                          <span style={{ fontSize: 12, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Save size={13} className="animate-spin" /> Salvando...
                          </span>
                        )}
                        {status === 'saved' && (
                          <span style={{ fontSize: 12, color: '#55e396', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <CheckCircle2 size={13} /> Salvo!
                          </span>
                        )}
                        {status === 'error' && (
                          <span style={{ fontSize: 12, color: '#ff8585', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <AlertCircle size={13} /> Erro ao salvar
                          </span>
                        )}

                        {/* Botão de Pausa Rápida */}
                        <button
                          onClick={() => handleTogglePause(kid)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            backgroundColor: isPausedEffective ? '#55e396' : 'rgba(255, 100, 100, 0.15)',
                            color: isPausedEffective ? '#043419' : '#ff8585',
                            padding: '7px 12px',
                            borderRadius: 8,
                            border: 'none',
                            fontSize: 12,
                            fontWeight: 800,
                            cursor: 'pointer'
                          }}
                        >
                          {isPausedEffective ? <PlayCircle size={15} /> : <PauseCircle size={15} />}
                          <span>{isPausedEffective ? 'Despausar' : 'Pausar Uso'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Barra de Progresso de Tempo de Tela Real */}
                    <div style={{
                      backgroundColor: '#171619',
                      borderRadius: 12,
                      padding: '12px 14px',
                      marginBottom: 16
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: '#cbc3d7', fontWeight: 600 }}>
                          Tempo de Tela Consumido Hoje:
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: hasDailyLimit ? '#ffb95f' : '#7bd0ff' }}>
                          {Math.floor(consumedSec / 60)} min / {hasDailyLimit ? `${kid.daily_limit_minutes} min` : 'Sem Limite'}
                        </span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: 8,
                        borderRadius: 9999,
                        backgroundColor: '#2e2e34',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          width: hasDailyLimit ? `${progressPct}%` : '10%',
                          borderRadius: 9999,
                          backgroundColor: progressPct >= 100 ? '#ff8585' : '#ffb95f',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>

                    {/* Grade de Controles Parentais Granulares */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                      gap: 12
                    }}>
                      {/* 1. Limite Diário */}
                      <div style={{ backgroundColor: '#19181b', borderRadius: 12, padding: 12 }}>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#22c55e', marginBottom: 6 }}>
                          LIMITE DIÁRIO
                        </label>
                        <select
                          value={kid.daily_limit_minutes === null || kid.daily_limit_minutes === undefined ? 'unlimited' : String(kid.daily_limit_minutes)}
                          onChange={e => {
                            const val = e.target.value === 'unlimited' ? null : Number(e.target.value)
                            handleUpdateKidControl(kid.id, { daily_limit_minutes: val })
                          }}
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            borderRadius: 8,
                            backgroundColor: '#252428',
                            border: '1px solid #3c3a42',
                            color: '#fff',
                            fontSize: 13,
                            fontWeight: 600,
                            outline: 'none'
                          }}
                        >
                          <option value="unlimited">Sem Limite Diário</option>
                          <option value="30">30 minutos</option>
                          <option value="45">45 minutos</option>
                          <option value="60">1 hora (60 min)</option>
                          <option value="90">1h30 (90 min)</option>
                          <option value="120">2 horas (120 min)</option>
                          <option value="180">3 horas (180 min)</option>
                        </select>
                      </div>

                      {/* 2. Horário de Dormir (Janela Permitida) */}
                      <div style={{ backgroundColor: '#19181b', borderRadius: 12, padding: 12 }}>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#7bd0ff', marginBottom: 6 }}>
                          HORÁRIO DE DORMIR
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 11, color: '#8e8a93' }}>Até:</span>
                          <input
                            type="time"
                            value={kid.allowed_end_time || kid.bedtime_hour || '21:30'}
                            onChange={e => handleUpdateKidControl(kid.id, { allowed_end_time: e.target.value, bedtime_hour: e.target.value })}
                            style={{
                              flex: 1,
                              padding: '7px 8px',
                              borderRadius: 8,
                              backgroundColor: '#252428',
                              border: '1px solid #3c3a42',
                              color: '#fff',
                              fontSize: 13,
                              outline: 'none'
                            }}
                          />
                        </div>
                      </div>

                      {/* 3. Modo Educativo Estrito */}
                      <div style={{ backgroundColor: '#19181b', borderRadius: 12, padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#ffb95f', marginBottom: 2 }}>
                            MODO EDUCATIVO
                          </label>
                          <span style={{ fontSize: 11, color: '#8e8a93' }}>
                            Apenas conteúdo educativo
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUpdateKidControl(kid.id, { strict_educational_only: !kid.strict_educational_only })}
                          style={{
                            width: 44,
                            height: 24,
                            borderRadius: 9999,
                            backgroundColor: kid.strict_educational_only ? '#ffb95f' : '#353437',
                            border: 'none',
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'background-color 0.2s',
                            padding: 2
                          }}
                        >
                          <span style={{
                            display: 'block',
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            backgroundColor: '#131315',
                            transform: kid.strict_educational_only ? 'translateX(20px)' : 'translateX(0px)',
                            transition: 'transform 0.2s'
                          }} />
                        </button>
                      </div>
                    </div>

                    {/* 4. Dias Permitidos da Semana */}
                    <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #2a2a2e' }}>
                      <span style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#cbc3d7', marginBottom: 8 }}>
                        DIAS DA SEMANA LIBERADOS:
                      </span>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {DAY_OPTIONS.map(d => {
                          const isAllowed = !kid.allowed_days || kid.allowed_days.length === 0 || kid.allowed_days.includes(d.key)
                          return (
                            <button
                              key={d.key}
                              type="button"
                              onClick={() => handleToggleDay(kid, d.key)}
                              style={{
                                padding: '6px 12px',
                                borderRadius: 8,
                                border: isAllowed ? '1px solid #22c55e' : '1px solid #353437',
                                backgroundColor: isAllowed ? 'rgba(34, 197, 94, 0.15)' : '#19181b',
                                color: isAllowed ? '#22c55e' : '#6b6672',
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              {d.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Pausa Rápida Programada */}
                    <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, color: '#8e8a93' }}>Pausa Temporária:</span>
                      <button
                        onClick={() => handleSetTemporaryPause(kid, 30)}
                        style={{ padding: '4px 8px', borderRadius: 6, backgroundColor: '#252428', border: '1px solid #3c3a42', color: '#cbc3d7', fontSize: 11, cursor: 'pointer' }}
                      >
                        +30 min
                      </button>
                      <button
                        onClick={() => handleSetTemporaryPause(kid, 60)}
                        style={{ padding: '4px 8px', borderRadius: 6, backgroundColor: '#252428', border: '1px solid #3c3a42', color: '#cbc3d7', fontSize: 11, cursor: 'pointer' }}
                      >
                        +1 hora
                      </button>
                      <button
                        onClick={() => handleSetTemporaryPause(kid, 120)}
                        style={{ padding: '4px 8px', borderRadius: 6, backgroundColor: '#252428', border: '1px solid #3c3a42', color: '#cbc3d7', fontSize: 11, cursor: 'pointer' }}
                      >
                        +2 horas
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* CTA ASSINATURA & DISPOSITIVOS */}
        <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            onClick={() => navigate('/assinatura')}
            style={{
              width: '100%',
              backgroundColor: '#201f21',
              borderRadius: 14,
              padding: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: '1px solid #353437',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                color: '#22c55e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Laptop size={20} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <span style={{ display: 'block', fontSize: 14, fontWeight: 800, color: '#e5e1e4' }}>
                  Assinatura &amp; Dispositivos Conectados
                </span>
                <span style={{ fontSize: 12, color: '#cbc3d7' }}>
                  Gerenciar planos, telas simultâneas e TVs pareadas
                </span>
              </div>
            </div>
            <ChevronRight size={18} color="#cbc3d7" />
          </button>
        </div>
      </div>

      {/* MODAL CONFIGURAR PIN SEGURO */}
      {showPinModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 16
        }}>
          <div style={{
            width: '100%',
            maxWidth: 380,
            backgroundColor: '#201f21',
            borderRadius: 20,
            border: '1px solid #353437',
            padding: 24,
            boxShadow: '0 20px 50px rgba(0,0,0,0.7)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Shield size={20} color="#22c55e" />
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#e5e1e4', margin: 0 }}>
                  {hasPin ? 'Alterar PIN Parental' : 'Criar PIN dos Pais'}
                </h3>
              </div>
              <button
                onClick={() => setShowPinModal(false)}
                style={{ background: 'none', border: 'none', color: '#958ea0', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: 12, color: '#cbc3d7', marginBottom: 20, lineHeight: 1.5 }}>
              O PIN dos pais protege configurações sensíveis, áreas administrativas e a troca de perfis infantis. NUNCA utilize senhas fáceis.
            </p>

            <form onSubmit={handleSavePin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {hasPin && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#cbc3d7', marginBottom: 6 }}>
                    PIN Atual:
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={currentPinInput}
                    onChange={e => setCurrentPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: 10,
                      backgroundColor: '#111116',
                      border: '1px solid #494454',
                      color: '#fff',
                      fontSize: 20,
                      textAlign: 'center',
                      letterSpacing: 8,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#cbc3d7', marginBottom: 6 }}>
                  {hasPin ? 'Novo PIN (4 a 6 dígitos):' : 'Cadastrar PIN (4 a 6 dígitos):'}
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={newPinInput}
                  onChange={e => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  autoFocus={!hasPin}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 10,
                    backgroundColor: '#111116',
                    border: '1px solid #494454',
                    color: '#fff',
                    fontSize: 20,
                    textAlign: 'center',
                    letterSpacing: 8,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {pinActionMessage && (
                <div style={{
                  fontSize: 12,
                  color: pinActionMessage.isError ? '#ff8585' : '#55e396',
                  textAlign: 'center'
                }}>
                  {pinActionMessage.text}
                </div>
              )}

              <button
                type="submit"
                disabled={pinActionLoading || newPinInput.length < 4}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 10,
                  backgroundColor: newPinInput.length >= 4 ? '#22c55e' : '#353437',
                  color: newPinInput.length >= 4 ? '#052e16' : '#fff',
                  fontWeight: 800,
                  fontSize: 13,
                  border: 'none',
                  cursor: newPinInput.length >= 4 ? 'pointer' : 'not-allowed',
                  marginTop: 6
                }}
              >
                {pinActionLoading ? 'Salvando...' : 'Salvar PIN'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
