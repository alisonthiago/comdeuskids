import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfile } from '../context/ProfileContext'
import { getAvatarImageUrl } from '../data/avatars'
import {
  Edit3, Plus, Shield, CheckCircle2, ChevronLeft,
  Sparkles, Lock, ArrowLeft
} from 'lucide-react'

export default function GerenciarPerfis() {
  const navigate = useNavigate()
  const { profiles, selectProfile } = useProfile()

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#131315',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      fontFamily: "'Baloo 2', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      <div style={{
        maxWidth: 800,
        width: '100%',
        textAlign: 'center'
      }}>
        {/* Voltar */}
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 20 }}>
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
            <ArrowLeft size={16} />
            Voltar
          </button>
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          backgroundColor: 'rgba(34, 197, 94, 0.15)',
          color: '#22c55e',
          padding: '6px 14px',
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: 16
        }}>
          <Edit3 size={15} />
          <span>Configurações de Perfis</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(28px, 4.5vw, 42px)',
          fontWeight: 800,
          color: '#ffffff',
          letterSpacing: '-0.02em',
          margin: '0 0 10px'
        }}>
          Gerenciar Perfis Infantis
        </h1>
        <p style={{
          fontSize: 15,
          color: '#cbc3d7',
          maxWidth: 520,
          margin: '0 auto 40px',
          lineHeight: 1.5
        }}>
          Selecione o perfil que deseja editar o nome, avatar 3D, faixa etária ou limites de tempo de tela.
        </p>

        {/* Grade de Perfis para Edição */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 28,
          marginBottom: 48
        }}>
          {profiles.map(profile => {
            const avatarUrl = getAvatarImageUrl(profile.avatar_url)

            return (
              <div
                key={profile.id}
                onClick={() => {
                  selectProfile(profile)
                  navigate('/editar-perfil')
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease'
                }}
              >
                <div style={{
                  position: 'relative',
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  padding: 4,
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
                  marginBottom: 14
                }}>
                  <img
                    src={avatarUrl}
                    alt={profile.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      filter: 'brightness(0.7)'
                    }}
                    onError={e => { (e.target as HTMLImageElement).src = '/avatars/davi.png' }}
                  />

                  {/* Ícone de Edição (Lápis) Sobreposto */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(19, 19, 21, 0.85)',
                    border: '2px solid #ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.6)'
                  }}>
                    <Edit3 size={20} />
                  </div>
                </div>

                <div style={{ fontSize: 16, fontWeight: 800, color: '#ffffff' }}>
                  {profile.name}
                </div>
                <div style={{ fontSize: 12, color: '#958ea0', marginTop: 3 }}>
                  {profile.profile_type === 'teacher' ? 'Professor' : profile.profile_type === 'parent' ? 'Pais' : 'Criança'}
                </div>
              </div>
            )
          })}

          {/* Botão Adicionar Novo Perfil */}
          {profiles.length < 6 && (
            <div
              onClick={() => navigate('/editar-perfil')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s ease'
              }}
            >
              <div style={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                backgroundColor: '#1c1b1d',
                border: '2px dashed #494454',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#cbc3d7',
                marginBottom: 14
              }}>
                <Plus size={40} />
              </div>

              <div style={{ fontSize: 15, fontWeight: 800, color: '#cbc3d7' }}>
                Novo Perfil
              </div>
              <div style={{ fontSize: 12, color: '#958ea0', marginTop: 3 }}>
                Até 6 perfis
              </div>
            </div>
          )}
        </div>

        {/* Botão Concluído */}
        <button
          type="button"
          onClick={() => navigate('/selecionar-perfil')}
          style={{
            backgroundColor: '#ffffff',
            color: '#131315',
            border: 'none',
            borderRadius: 14,
            padding: '14px 44px',
            fontSize: 15,
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(255, 255, 255, 0.25)',
            transition: 'all 0.2s ease'
          }}
        >
          Concluído
        </button>
      </div>
    </div>
  )
}
