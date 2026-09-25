import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfile } from '../context/ProfileContext'
import { CDK_PROFILE_AVATARS, CDKAvatar } from '../data/avatars'
import { cmsClient } from '../lib/cmsClient'
import {
  ArrowLeft, Camera, Check, Sparkles, User, BadgeAlert,
  CheckCircle, RefreshCw, Star
} from 'lucide-react'

export default function EditProfile() {
  const navigate = useNavigate()
  const { activeProfile, updateProfile } = useProfile()

  const [avatarList, setAvatarList] = useState<CDKAvatar[]>(CDK_PROFILE_AVATARS)

  // Form State inicializado com perfil ativo ou padrão Davi
  const [profileName, setProfileName] = useState(activeProfile?.name || 'Davi')
  const [profileType, setProfileType] = useState<'kid' | 'teacher' | 'parent'>(
    (activeProfile?.profile_type as any) || 'kid'
  )
  const [ageRange, setAgeRange] = useState<string>('4 a 6 anos')

  // Avatar Selecionado
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>(
    activeProfile?.avatar_url ? activeProfile.avatar_url.toLowerCase() : 'davi'
  )
  const [selectedAvatarName, setSelectedAvatarName] = useState<string>('Davi (Pastorzinho)')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Carregar avatares dinâmicos do banco
  useEffect(() => {
    cmsClient.getAvatars().then(dbAvatars => {
      if (dbAvatars && dbAvatars.length > 0) {
        setAvatarList(() => {
          // A lista antiga do CMS não faz mais parte da biblioteca visual.
          // Só aceita extensões que também pertençam ao catálogo oficial novo.
          const officialCmsAvatars = (dbAvatars as CDKAvatar[])
            .filter(avatar => avatar.id.startsWith('biblioteca_'))
          const merged = [...CDK_PROFILE_AVATARS, ...officialCmsAvatars]
          return Array.from(new Map(merged.map(avatar => [avatar.id, avatar])).values())
        })
      }
    })
  }, [])

  // Encontra o objeto do avatar ativo
  const currentAvatarObj = avatarList.find(a => a.id === selectedAvatarId) || avatarList[0]

  useEffect(() => {
    if (activeProfile) {
      setProfileName(activeProfile.name)
      if (activeProfile.profile_type === 'teacher') setProfileType('teacher')
      else if (activeProfile.profile_type === 'parent') setProfileType('parent')
      else setProfileType('kid')

      if (activeProfile.avatar_url) {
        const found = avatarList.find(a => a.id === activeProfile.avatar_url.toLowerCase())
        if (found) {
          setSelectedAvatarId(found.id)
          setSelectedAvatarName(`${found.name} (${found.subtitle})`)
        }
      }
    }
  }, [activeProfile, avatarList])

  const handleSelectAvatar = (avatar: CDKAvatar) => {
    setSelectedAvatarId(avatar.id)
    setSelectedAvatarName(`${avatar.name} (${avatar.subtitle})`)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (activeProfile) {
        let numericAge: number | undefined
        if (ageRange === '0 a 3 anos') numericAge = 3
        else if (ageRange === '4 a 6 anos') numericAge = 6
        else if (ageRange === '7 a 9 anos') numericAge = 8
        else if (ageRange === '10+ anos') numericAge = 11

        await updateProfile(activeProfile.id, {
          name: profileName.trim() || activeProfile.name,
          avatar_url: selectedAvatarId,
          profile_type: profileType,
          age: numericAge
        })
      }

      setToastMessage(`${profileName} atualizado com sucesso!`)
      setTimeout(() => {
        setToastMessage(null)
        // Redireciona de volta após salvar
        if (profileType === 'teacher') navigate('/meu-espaco')
        else if (profileType === 'parent') navigate('/minha-familia')
        else navigate('/meu-perfil')
      }, 1500)
    } catch (err) {
      console.error(err)
      setToastMessage('Perfil salvo localmente com sucesso!')
      setTimeout(() => setToastMessage(null), 2000)
    } finally {
      setSaving(false)
    }
  }

  // Agrupamento de Avatares por Categoria do Stitch
  const heroesList = avatarList.filter(a => a.category === 'heroes')
  const teachersList = avatarList.filter(a => a.category === 'teachers')
  const animalsList = avatarList.filter(a => a.category === 'animals')

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#131315',
      color: '#e5e1e4',
      paddingTop: 84,
      paddingBottom: 164,
      fontFamily: "'Baloo 2', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      {/* HEADER DE NAVEGAÇÃO & MODO EDIÇÃO */}
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '16px var(--page-padding-x, 32px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(28, 27, 29, 0.6)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '0 0 16px 16px'
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'none',
            border: 'none',
            color: '#22c55e',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={18} />
          <span>Voltar para Perfis</span>
        </button>

        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 12px',
          borderRadius: 9999,
          backgroundColor: 'rgba(238, 152, 0, 0.15)',
          color: '#ffb95f',
          fontSize: 11,
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          <Star size={13} fill="#ffb95f" />
          Modo Edição
        </span>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px var(--page-padding-x, 32px)' }}>

        {/* PREVIEW DO AVATAR COM GLOW PULSANTE */}
        <section style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '20px 0 52px'
        }}>
          <div style={{ position: 'relative' }}>
            {/* Glow Animado */}
            <div style={{
              position: 'absolute',
              inset: -6,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #22c55e 0%, #4ade80 50%, #16a34a 100%)',
              filter: 'blur(8px)',
              opacity: 0.75,
              animation: 'pulse 3s infinite'
            }} />

            {/* Círculo do Avatar */}
            <div style={{
              position: 'relative',
              width: 112,
              height: 112,
              borderRadius: '50%',
              overflow: 'hidden',
              backgroundColor: '#353437',
              padding: 4,
              boxShadow: '0 12px 32px rgba(0,0,0,0.5)'
            }}>
              <img
                src={currentAvatarObj.image_url}
                alt={selectedAvatarName}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/avatars/davi.png'
                }}
              />
            </div>

            {/* Ícone de Câmera */}
            <button
              type="button"
              style={{
                position: 'absolute',
                bottom: 2,
                right: 2,
                width: 34,
                height: 34,
                borderRadius: '50%',
                backgroundColor: '#22c55e',
                color: '#052e16',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                cursor: 'pointer'
              }}
              title="Trocar Avatar"
            >
              <Camera size={16} />
            </button>
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#e5e1e4', marginTop: 14, marginBottom: 2 }}>
            {selectedAvatarName}
          </h2>

          <span style={{
            fontSize: 12,
            color: '#cbc3d7',
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}>
            <CheckCircle size={14} color="#ffb95f" />
            Avatar ativo no momento
          </span>

          {/* FORMULÁRIO DE EDIÇÃO DO PERFIL */}
          <div style={{
            width: '100%',
            marginTop: 32,
            backgroundColor: '#1c1b1d',
            borderRadius: 16,
            padding: 18,
            boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}>
            {/* Nome do Perfil */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#cbc3d7', marginBottom: 6 }}>
                Nome do Perfil
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#958ea0'
                }}>
                  <User size={18} />
                </span>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Digite o nome do perfil..."
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 40px',
                    borderRadius: 10,
                    backgroundColor: '#353437',
                    border: '1px solid #494454',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 600,
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Tipo de Perfil */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#cbc3d7', marginBottom: 6 }}>
                Tipo de Perfil
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 6,
                padding: 4,
                backgroundColor: '#0e0e10',
                borderRadius: 10
              }}>
                {(['kid', 'teacher', 'parent'] as const).map((type) => {
                  const isSelected = profileType === type
                  const label = type === 'kid' ? 'Criança' : type === 'teacher' ? 'Professor' : 'Responsável'
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setProfileType(type)}
                      style={{
                        padding: '10px 4px',
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 700,
                        textAlign: 'center',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        backgroundColor: isSelected ? '#2a2a2c' : 'transparent',
                        color: isSelected ? '#22c55e' : '#cbc3d7',
                        boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.3)' : 'none'
                      }}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Faixa Etária Recomendada */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#cbc3d7', marginBottom: 6 }}>
                Faixa Etária Recomendada
              </label>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                {['0 a 3 anos', '4 a 6 anos', '7 a 9 anos', '10+ anos'].map((age) => {
                  const isSelected = ageRange === age
                  return (
                    <button
                      key={age}
                      type="button"
                      onClick={() => setAgeRange(age)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 9999,
                        fontSize: 11,
                        fontWeight: 800,
                        border: 'none',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s',
                        backgroundColor: isSelected ? '#22c55e' : '#353437',
                        color: isSelected ? '#052e16' : '#cbc3d7'
                      }}
                    >
                      {age}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* SEÇÃO DE SELEÇÃO: ESCOLHA SEU NOVO AVATAR */}
        <section style={{ marginTop: 12, paddingTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#e5e1e4', margin: 0 }}>
                Escolha Seu Novo Avatar
              </h3>
              <p style={{ fontSize: 12, color: '#cbc3d7', margin: '3px 0 0' }}>
                Toque para experimentar na sua moldura
              </p>
            </div>
            <Sparkles size={24} color="#ffb95f" />
          </div>

          {/* CATEGORIA 1: HERÓIS DA BÍBLIA & CRIANÇAS */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22c55e' }} />
                <h4 style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: '#e5e1e4',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  margin: 0
                }}>
                  Heróis da Bíblia &amp; Crianças
                </h4>
              </div>
              <span style={{ fontSize: 11, color: '#cbc3d7' }}>6 opções</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {heroesList.map((avatar) => {
                const isSelected = selectedAvatarId === avatar.id
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => handleSelectAvatar(avatar)}
                    style={{
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: 10,
                      borderRadius: 14,
                      backgroundColor: isSelected ? '#2a2a2c' : '#1c1b1d',
                      border: isSelected ? '1px solid #22c55e' : '1px solid rgba(255,255,255,0.04)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{
                      position: 'relative',
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      padding: 2,
                      backgroundColor: isSelected ? '#22c55e' : '#353437',
                      boxShadow: isSelected ? '0 4px 12px rgba(34, 197, 94, 0.4)' : 'none'
                    }}>
                      <img
                        src={avatar.image_url}
                        alt={avatar.name}
                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      {isSelected && (
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          backgroundColor: '#ffb95f',
                          color: '#472a00',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                        }}>
                          <Check size={13} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <span style={{
                      marginTop: 8,
                      fontSize: 13,
                      fontWeight: 800,
                      color: isSelected ? '#22c55e' : '#e5e1e4',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      width: '100%'
                    }}>
                      {avatar.name}
                    </span>
                    <span style={{
                      fontSize: 10,
                      color: '#cbc3d7',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      width: '100%',
                      marginTop: 1
                    }}>
                      {avatar.subtitle}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* CATEGORIA 2: PROFESSORES & EDUCADORES */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ffb95f' }} />
                <h4 style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: '#e5e1e4',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  margin: 0
                }}>
                  Professores &amp; Educadores
                </h4>
              </div>
              <span style={{ fontSize: 11, color: '#cbc3d7' }}>3 opções</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {teachersList.map((avatar) => {
                const isSelected = selectedAvatarId === avatar.id
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => handleSelectAvatar(avatar)}
                    style={{
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: 10,
                      borderRadius: 14,
                      backgroundColor: isSelected ? '#2a2a2c' : '#1c1b1d',
                      border: isSelected ? '1px solid #ffb95f' : '1px solid rgba(255,255,255,0.04)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{
                      position: 'relative',
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      padding: 2,
                      backgroundColor: isSelected ? '#ffb95f' : '#353437',
                      boxShadow: isSelected ? '0 4px 12px rgba(255, 185, 95, 0.4)' : 'none'
                    }}>
                      <img
                        src={avatar.image_url}
                        alt={avatar.name}
                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      {isSelected && (
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          backgroundColor: '#ffb95f',
                          color: '#472a00',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                        }}>
                          <Check size={13} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <span style={{
                      marginTop: 8,
                      fontSize: 13,
                      fontWeight: 800,
                      color: isSelected ? '#ffb95f' : '#e5e1e4',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      width: '100%'
                    }}>
                      {avatar.name}
                    </span>
                    <span style={{
                      fontSize: 10,
                      color: '#cbc3d7',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      width: '100%',
                      marginTop: 1
                    }}>
                      {avatar.subtitle}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* CATEGORIA 3: ANIMAIS DA ARCA & MASCOTES */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#7bd0ff' }} />
                <h4 style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: '#e5e1e4',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  margin: 0
                }}>
                  Animais da Arca &amp; Mascotes
                </h4>
              </div>
              <span style={{ fontSize: 11, color: '#cbc3d7' }}>4 opções</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {animalsList.map((avatar) => {
                const isSelected = selectedAvatarId === avatar.id
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => handleSelectAvatar(avatar)}
                    style={{
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: 8,
                      borderRadius: 12,
                      backgroundColor: isSelected ? '#2a2a2c' : '#1c1b1d',
                      border: isSelected ? '1px solid #7bd0ff' : '1px solid rgba(255,255,255,0.04)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{
                      position: 'relative',
                      width: 52,
                      height: 52,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      padding: 2,
                      backgroundColor: isSelected ? '#7bd0ff' : '#353437'
                    }}>
                      <img
                        src={avatar.image_url}
                        alt={avatar.name}
                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      {isSelected && (
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          backgroundColor: '#ffb95f',
                          color: '#472a00',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Check size={11} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <span style={{
                      marginTop: 6,
                      fontSize: 11,
                      fontWeight: 800,
                      color: isSelected ? '#7bd0ff' : '#e5e1e4',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      width: '100%'
                    }}>
                      {avatar.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </section>
      </div>

      {/* BARRA FIXA FLUTUANTE DE SALVAR */}
      <aside style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 90,
        padding: '12px 16px 24px',
        backgroundColor: 'rgba(19, 19, 21, 0.92)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.6)'
      }}>
        <div style={{ maxWidth: 440, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 14,
              background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)',
              color: '#052e16',
              fontSize: 15,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 24px rgba(34, 197, 94, 0.45)',
              transition: 'transform 0.15s, filter 0.15s'
            }}
          >
            <CheckCircle size={20} />
            <span>{saving ? 'Salvando...' : 'Salvar e Aplicar Novo Avatar'}</span>
          </button>

          <p style={{
            fontSize: 11,
            color: '#cbc3d7',
            textAlign: 'center',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6
          }}>
            <RefreshCw size={12} color="#7bd0ff" />
            <span>O novo avatar será atualizado instantaneamente em todos os seus dispositivos.</span>
          </p>
        </div>
      </aside>

      {/* TOAST DE FEEDBACK */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          backgroundColor: '#ffb95f',
          color: '#472a00',
          padding: '10px 18px',
          borderRadius: 9999,
          fontSize: 13,
          fontWeight: 800,
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <Sparkles size={16} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}
