import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useProfile } from '../context/ProfileContext'
import { setParentPin } from '../lib/pinService'
import {
  Shield, Key, Lock, Mail, CreditCard, Tv,
  Users, CheckCircle2, ChevronLeft, ChevronRight,
  Sparkles, Smartphone, Eye, EyeOff
} from 'lucide-react'

export default function ContaSeguranca() {
  const navigate = useNavigate()
  const { profiles, activeProfile } = useProfile()
  const parentProfile = profiles.find(p => p.profile_type === 'parent') || activeProfile

  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [pinEditing, setPinEditing] = useState(false)
  const [pinSuccess, setPinSuccess] = useState(false)
  const [pinError, setPinError] = useState<string | null>(null)
  const [pinLoading, setPinLoading] = useState(false)

  const [email] = useState('responsavel@familia.com.br')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!parentProfile) return

    if (!newPin || !/^[0-9]{4,6}$/.test(newPin)) {
      setPinError('O PIN deve conter de 4 a 6 dígitos numéricos.')
      return
    }
    if (newPin !== confirmPin) {
      setPinError('Os códigos digitados não coincidem.')
      return
    }

    setPinLoading(true)
    setPinError(null)

    try {
      const res = await setParentPin(parentProfile.id, newPin, currentPin)
      if (res.success) {
        setPinError(null)
        setPinSuccess(true)
        setPinEditing(false)
        setCurrentPin('')
        setNewPin('')
        setConfirmPin('')
        setTimeout(() => setPinSuccess(false), 3000)
      } else {
        setPinError(res.error || 'Erro ao salvar novo PIN.')
      }
    } catch {
      setPinError('Falha ao comunicar com o servidor.')
    } finally {
      setPinLoading(false)
    }
  }

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordSuccess(true)
    setCurrentPassword('')
    setNewPassword('')
    setTimeout(() => setPasswordSuccess(false), 3000)
  }

  return (
    <div style={{
      maxWidth: 1200,
      margin: '0 auto',
      padding: '144px 16px 112px',
      fontFamily: "'Baloo 2', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      {/* Voltar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid #2a2a2c',
            borderRadius: 12,
            padding: '8px 14px',
            color: '#cbc3d7',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <ChevronLeft size={16} />
          Voltar
        </button>
        <span style={{ fontSize: 13, color: '#958ea0' }}>•</span>
        <span style={{ fontSize: 13, color: '#22c55e', fontWeight: 700 }}>Conta & Segurança</span>
      </div>

      {/* Header da Conta */}
      <section style={{
        position: 'relative',
        backgroundColor: '#1c1b1d',
        borderRadius: 24,
        padding: '28px 24px',
        border: '1px solid #2a2a2c',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.45)',
        marginBottom: 28,
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 200,
          height: 200,
          borderRadius: '50%',
          backgroundColor: 'rgba(34, 197, 94, 0.12)',
          filter: 'blur(50px)',
          pointerEvents: 'none'
        }} />

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
          position: 'relative',
          zIndex: 2
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Shield size={18} color="#22c55e" />
              <span style={{ fontSize: 12, fontWeight: 800, color: '#22c55e', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Segurança do Responsável
              </span>
            </div>
            <h1 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 800, color: '#ffffff', margin: '0 0 6px' }}>
              Conta do Responsável
            </h1>
            <p style={{ fontSize: 14, color: '#cbc3d7', margin: 0 }}>
              Gerencie credenciais, código PIN para controle parental e dispositivos conectados.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Link
              to="/perfis"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                backgroundColor: '#201f21',
                color: '#cbc3d7',
                border: '1px solid #2a2a2c',
                borderRadius: 14,
                padding: '10px 18px',
                fontSize: 13,
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              <Users size={16} />
              Gerenciar Perfis
            </Link>
            <Link
              to="/conta/dispositivos"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                backgroundColor: '#22c55e',
                color: '#052e16',
                borderRadius: 14,
                padding: '10px 18px',
                fontSize: 13,
                fontWeight: 800,
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(160, 120, 255, 0.35)'
              }}
            >
              <Tv size={16} />
              Dispositivos
            </Link>
          </div>
        </div>
      </section>

      {/* Grid de Seções de Segurança */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
        {/* Controle Parental & PIN */}
        <div style={{
          backgroundColor: '#1c1b1d',
          borderRadius: 20,
          padding: 24,
          border: '1px solid #2a2a2c'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: 'rgba(255, 185, 95, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffb95f'
            }}>
              <Key size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#ffffff', margin: 0 }}>
                PIN dos Pais (Controle Parental)
              </h3>
              <p style={{ fontSize: 12, color: '#958ea0', margin: '2px 0 0' }}>
                Exigido para editar perfis ou trocar configurações.
              </p>
            </div>
          </div>

          {pinSuccess && (
            <div style={{
              backgroundColor: 'rgba(0, 155, 209, 0.15)',
              border: '1px solid #009bd1',
              borderRadius: 12,
              padding: '10px 14px',
              color: '#7bd0ff',
              fontSize: 13,
              fontWeight: 700,
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <CheckCircle2 size={16} />
              PIN atualizado com sucesso!
            </div>
          )}

          {!pinEditing ? (
            <div style={{
              backgroundColor: '#201f21',
              borderRadius: 14,
              padding: '16px 18px',
              border: '1px solid #2a2a2c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: 12, color: '#958ea0' }}>Status do PIN</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', letterSpacing: '0.25em', marginTop: 4 }}>
                  ••••
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPinEditing(true)}
                style={{
                  backgroundColor: '#22c55e',
                  color: '#052e16',
                  border: 'none',
                  borderRadius: 10,
                  padding: '8px 16px',
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Alterar PIN
              </button>
            </div>
          ) : (
            <form onSubmit={handleSavePin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {pinError && (
                <div style={{ fontSize: 12, color: '#ffb4ab', fontWeight: 700 }}>
                  {pinError}
                </div>
              )}
              {Boolean(parentProfile?.pin_hash || parentProfile?.pin) && (
                <div>
                  <label style={{ fontSize: 12, color: '#cbc3d7', display: 'block', marginBottom: 4 }}>
                    PIN Atual
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    placeholder="PIN atual"
                    value={currentPin}
                    onChange={e => setCurrentPin(e.target.value.replace(/\D/g, ''))}
                    style={{
                      width: '100%',
                      backgroundColor: '#201f21',
                      border: '1px solid #2a2a2c',
                      borderRadius: 10,
                      padding: '10px 14px',
                      color: '#ffffff',
                      fontSize: 14,
                      letterSpacing: '0.2em'
                    }}
                  />
                </div>
              )}

              <div>
                <label style={{ fontSize: 12, color: '#cbc3d7', display: 'block', marginBottom: 4 }}>
                  Novo PIN (4 a 6 dígitos)
                </label>
                <input
                  type="password"
                  maxLength={6}
                  required
                  placeholder="Ex: 4829"
                  value={newPin}
                  onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                  style={{
                    width: '100%',
                    backgroundColor: '#201f21',
                    border: '1px solid #2a2a2c',
                    borderRadius: 10,
                    padding: '10px 14px',
                    color: '#ffffff',
                    fontSize: 14,
                    letterSpacing: '0.2em'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, color: '#cbc3d7', display: 'block', marginBottom: 4 }}>
                  Confirmar Novo PIN
                </label>
                <input
                  type="password"
                  maxLength={6}
                  required
                  placeholder="Repita o PIN"
                  value={confirmPin}
                  onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  style={{
                    width: '100%',
                    backgroundColor: '#201f21',
                    border: '1px solid #2a2a2c',
                    borderRadius: 10,
                    padding: '10px 14px',
                    color: '#ffffff',
                    fontSize: 14,
                    letterSpacing: '0.2em'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setPinEditing(false)}
                  style={{
                    flex: 1,
                    backgroundColor: '#201f21',
                    border: '1px solid #2a2a2c',
                    color: '#cbc3d7',
                    borderRadius: 10,
                    padding: '8px 14px',
                    fontSize: 13,
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    backgroundColor: '#22c55e',
                    border: 'none',
                    color: '#052e16',
                    borderRadius: 10,
                    padding: '8px 14px',
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Salvar PIN
                </button>
              </div>
            </form>
          )}
        </div>

        {/* E-mail & Senha da Conta */}
        <div style={{
          backgroundColor: '#1c1b1d',
          borderRadius: 20,
          padding: 24,
          border: '1px solid #2a2a2c'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#22c55e'
            }}>
              <Mail size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#ffffff', margin: 0 }}>
                E-mail e Senha Principal
              </h3>
              <p style={{ fontSize: 12, color: '#958ea0', margin: '2px 0 0' }}>
                Credenciais de login na plataforma.
              </p>
            </div>
          </div>

          {passwordSuccess && (
            <div style={{
              backgroundColor: 'rgba(0, 155, 209, 0.15)',
              border: '1px solid #009bd1',
              borderRadius: 12,
              padding: '10px 14px',
              color: '#7bd0ff',
              fontSize: 13,
              fontWeight: 700,
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <CheckCircle2 size={16} />
              Senha atualizada com sucesso!
            </div>
          )}

          <div style={{
            backgroundColor: '#201f21',
            borderRadius: 12,
            padding: '12px 16px',
            marginBottom: 16,
            border: '1px solid #2a2a2c'
          }}>
            <div style={{ fontSize: 11, color: '#958ea0' }}>E-mail cadastrado</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', marginTop: 2 }}>{email}</div>
          </div>

          <form onSubmit={handleSavePassword} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: '#cbc3d7', display: 'block', marginBottom: 4 }}>
                Senha Atual
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#201f21',
                  border: '1px solid #2a2a2c',
                  borderRadius: 10,
                  padding: '10px 14px',
                  color: '#ffffff',
                  fontSize: 14
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, color: '#cbc3d7', display: 'block', marginBottom: 4 }}>
                Nova Senha
              </label>
              <input
                type="password"
                required
                placeholder="Mínimo de 8 caracteres"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#201f21',
                  border: '1px solid #2a2a2c',
                  borderRadius: 10,
                  padding: '10px 14px',
                  color: '#ffffff',
                  fontSize: 14
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                backgroundColor: '#201f21',
                border: '1px solid #22c55e',
                color: '#22c55e',
                borderRadius: 10,
                padding: '10px 16px',
                fontSize: 13,
                fontWeight: 800,
                cursor: 'pointer',
                marginTop: 4
              }}
            >
              Atualizar Senha
            </button>
          </form>
        </div>
      </div>

      {/* Acesso aos Dispositivos & Assinatura */}
      <div style={{
        backgroundColor: '#1c1b1d',
        borderRadius: 20,
        padding: 24,
        border: '1px solid #2a2a2c',
        marginTop: 24,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: 'rgba(123, 208, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#7bd0ff'
          }}>
            <CreditCard size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Plano Com Deus Kids Família
            </h4>
            <div style={{ fontSize: 13, color: '#958ea0', marginTop: 2 }}>
              Renovação em 18 de Outubro • 4 Telas Simultâneas liberadas
            </div>
          </div>
        </div>

        <Link
          to="/assinatura"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: '#22c55e',
            fontSize: 13,
            fontWeight: 800,
            textDecoration: 'none'
          }}
        >
          Gerenciar Assinatura
          <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  )
}
