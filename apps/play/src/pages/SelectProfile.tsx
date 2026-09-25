import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Sparkles, Play, Shield, Heart, Compass, Lock,
  Plus, Pencil, CheckCircle2, X, PartyPopper, Check, RotateCcw, Settings
} from 'lucide-react'
import { useProfile } from '../context/ProfileContext'
import { verifyParentPin } from '../lib/pinService'
import { AccountProfile } from '@comdeuskids/types'
import { membrosUrl } from '../lib/appUrl'
import PrimeiroAcessoModal, { OnboardingMember } from '../components/PrimeiroAcessoModal'
import { getAvatarImageUrl } from '../data/avatars'
import BrandIntro from '../components/BrandIntro'

// Mapeamento visual fiel aos avatares 3D do Com Deus Kids
const STITCH_AVATAR_MAP: Record<string, {
  image: string
  roleLabel: string
  borderGradient: string
  shadowColor: string
  badgeBg: string
  badgeIcon: any
}> = {
  menino_cachos_verdes: {
    image: '/avatar-library/meninos/menino-cachos-verdes.png',
    roleLabel: 'Aventureiro',
    borderGradient: 'linear-gradient(180deg, #b8ffd0 0%, #21c75a 50%, #0d2f26 100%)',
    shadowColor: 'rgba(33, 199, 90, 0.35)',
    badgeBg: '#21c75a',
    badgeIcon: Shield
  },
  menina_flor_coral: {
    image: '/avatar-library/meninas/menina-flor-coral.png',
    roleLabel: 'Criativa',
    borderGradient: 'linear-gradient(180deg, #ffd0d9 0%, #fb7185 50%, #3d1622 100%)',
    shadowColor: 'rgba(251, 113, 133, 0.35)',
    badgeBg: '#fb7185',
    badgeIcon: Heart
  },
  alison: {
    image: '/avatar-library/homens/homens-1.png',
    roleLabel: 'Pai & Titular',
    borderGradient: 'linear-gradient(180deg, #ffb95f 0%, #ff6b35 50%, #353437 100%)',
    shadowColor: 'rgba(255, 107, 53, 0.35)',
    badgeBg: '#ff6b35',
    badgeIcon: Shield
  },
  nadia: {
    image: '/avatars/profa_ana.png',
    roleLabel: 'Mãe & Responsável',
    borderGradient: 'linear-gradient(180deg, #ffddb8 0%, #ff6b35 50%, #353437 100%)',
    shadowColor: 'rgba(255, 107, 53, 0.35)',
    badgeBg: '#ff6b35',
    badgeIcon: Heart
  },
  carlos: {
    image: '/avatars/carlos.png',
    roleLabel: 'Pai & Responsável',
    borderGradient: 'linear-gradient(180deg, #ffb95f 0%, #ee9800 50%, #353437 100%)',
    shadowColor: 'rgba(255, 185, 95, 0.35)',
    badgeBg: '#ffb95f',
    badgeIcon: Shield
  },
  profa_ana: {
    image: '/avatars/profa_ana.png',
    roleLabel: 'Pais & Mestres',
    borderGradient: 'linear-gradient(180deg, #ffddb8 0%, #653e00 50%, #353437 100%)',
    shadowColor: 'rgba(255, 185, 95, 0.25)',
    badgeBg: '#353437',
    badgeIcon: Lock
  },
  ester: {
    image: '/avatars/ester.png',
    roleLabel: 'Mãe & Responsável',
    borderGradient: 'linear-gradient(180deg, #ffddb8 0%, #ff6b35 50%, #353437 100%)',
    shadowColor: 'rgba(255, 107, 53, 0.25)',
    badgeBg: '#ff6b35',
    badgeIcon: Heart
  },
  joao: {
    image: '/avatars/joao.png',
    roleLabel: 'Aventureiro',
    borderGradient: 'linear-gradient(180deg, #4ade80 0%, #22c55e 50%, #353437 100%)',
    shadowColor: 'rgba(34, 197, 94, 0.35)',
    badgeBg: '#22c55e',
    badgeIcon: Shield
  },
  davi: {
    image: '/avatars/davi.png',
    roleLabel: 'Aventureiro',
    borderGradient: 'linear-gradient(180deg, #4ade80 0%, #22c55e 50%, #353437 100%)',
    shadowColor: 'rgba(34, 197, 94, 0.35)',
    badgeBg: '#22c55e',
    badgeIcon: Shield
  },
  sara: {
    image: '/avatars/sara.png',
    roleLabel: 'Criativa',
    borderGradient: 'linear-gradient(180deg, #ffb95f 0%, #ee9800 50%, #353437 100%)',
    shadowColor: 'rgba(238, 152, 0, 0.35)',
    badgeBg: '#ee9800',
    badgeIcon: Heart
  },
  pedro: {
    image: '/avatars/pedro.png',
    roleLabel: 'Explorador',
    borderGradient: 'linear-gradient(180deg, #7bd0ff 0%, #009bd1 50%, #353437 100%)',
    shadowColor: 'rgba(0, 155, 209, 0.35)',
    badgeBg: '#009bd1',
    badgeIcon: Compass
  },
  maria: {
    image: '/avatars/maria.png',
    roleLabel: 'Pequena Cantora',
    borderGradient: 'linear-gradient(180deg, #ffb95f 0%, #ee9800 50%, #353437 100%)',
    shadowColor: 'rgba(238, 152, 0, 0.35)',
    badgeBg: '#ee9800',
    badgeIcon: Heart
  },
  miguel: {
    image: '/avatars/pedro.png',
    roleLabel: 'Explorador',
    borderGradient: 'linear-gradient(180deg, #7bd0ff 0%, #009bd1 50%, #353437 100%)',
    shadowColor: 'rgba(0, 155, 209, 0.35)',
    badgeBg: '#009bd1',
    badgeIcon: Compass
  },
  enzo: {
    image: '/avatars/davi.png',
    roleLabel: 'Aventureiro',
    borderGradient: 'linear-gradient(180deg, #4ade80 0%, #22c55e 50%, #353437 100%)',
    shadowColor: 'rgba(34, 197, 94, 0.35)',
    badgeBg: '#22c55e',
    badgeIcon: Shield
  }
}

export default function SelectProfile() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { profiles, selectProfile, createProfile } = useProfile()

  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [pinModalProfile, setPinModalProfile] = useState<AccountProfile | null>(null)
  const [pinTargetAction, setPinTargetAction] = useState<
    | { type: 'parent_entry'; profile: AccountProfile }
    | { type: 'kid_entry'; profile: AccountProfile }
    | { type: 'manage' }
    | { type: 'add_profile' }
    | null
  >(null)
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState(false)
  const [brandIntroMode, setBrandIntroMode] = useState<'arrival' | 'profile' | null>(() => {
    if (typeof window === 'undefined') return null
    return sessionStorage.getItem('cdk_brand_intro_seen') !== 'true' ? 'arrival' : null
  })
  const [pendingProfileEntry, setPendingProfileEntry] = useState<AccountProfile | null>(null)

  // Modo de gerenciamento de perfis (estilo Netflix)
  const [isManaging, setIsManaging] = useState(false)

  // Modal para criar novo perfil
  const [showAddModal, setShowAddModal] = useState(false)
  const [newProfileName, setNewProfileName] = useState('')
  const [newProfileType, setNewProfileType] = useState<'kid' | 'parent'>('kid')

  // Modal de Primeiro Acesso Onboarding (Passo 1 a 6)
  const [showOnboarding, setShowOnboarding] = useState(false)

  const now = new Date().toISOString()

  // Carrega perfis reais da conta a partir do ProfileContext
  const getInitialProfiles = (): AccountProfile[] => {
    return profiles && profiles.length > 0 ? profiles : []
  }

  const [familyProfiles, setFamilyProfiles] = useState<AccountProfile[]>(getInitialProfiles)

  // Sincroniza se context carregar
  useEffect(() => {
    const localCustom = localStorage.getItem('cdk_custom_profiles')
    if (localCustom) {
      try {
        const parsed = JSON.parse(localCustom)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFamilyProfiles(parsed)
          return
        }
      } catch (e) {}
    }
    if (profiles && profiles.length > 0) {
      setFamilyProfiles(profiles)
    }
  }, [profiles])

  // Se URL solicitar abertura direta do onboarding
  useEffect(() => {
    if (searchParams.get('onboarding') === 'true') {
      setShowOnboarding(true)
    }
  }, [searchParams])

  const handleSelect = (profile: AccountProfile) => {
    // Se estiver no modo de gerenciamento, redireciona para edição
    if (isManaging) {
      selectProfile(profile)
      navigate('/editar-perfil')
      return
    }

    // Se o perfil for RESPONSÁVEL / MASTER (parent ou teacher ou titular)
    if (profile.profile_type === 'parent' || profile.profile_type === 'teacher') {
      setPinModalProfile(profile)
      setPinTargetAction({ type: 'parent_entry', profile })
      setPinInput('')
      setPinError(false)
      return
    }

    // Se o perfil infantil tiver PIN configurado
    if (profile.pin_hash || profile.pin) {
      setPinModalProfile(profile)
      setPinTargetAction({ type: 'kid_entry', profile })
      setPinInput('')
      setPinError(false)
      return
    }

    triggerEntry(profile)
  }

  const triggerEntry = (profile: AccountProfile) => {
    // A mesma assinatura visual da marca acompanha a entrada de cada criança.
    setToastMessage(null)
    setPendingProfileEntry(profile)
    setBrandIntroMode('profile')
  }

  const handleVerifyPin = async () => {
    if (!pinModalProfile && !pinTargetAction) return

    let isValid = false
    if (pinModalProfile) {
      try {
        const res = await verifyParentPin(pinModalProfile.id, pinInput)
        if (res.success) {
          isValid = true
        }
      } catch (e) {
        console.warn('Erro ao validar PIN:', e)
      }
    }

    if (isValid) {
      const p = pinModalProfile
      const action = pinTargetAction

      setPinModalProfile(null)
      setPinTargetAction(null)

      if (action?.type === 'manage') {
        setIsManaging(true)
        return
      }

      if (action?.type === 'add_profile') {
        setShowAddModal(true)
        return
      }

      if (action?.type === 'parent_entry' || p?.profile_type === 'parent' || p?.profile_type === 'teacher') {
        setToastMessage(`Acessando Área Família dos Responsáveis...`)
        if (p) selectProfile(p)
        setTimeout(() => {
          window.location.href = `${membrosUrl}/familia`
        }, 800)
        return
      }

      if (p) {
        triggerEntry(p)
      }
    } else {
      setPinError(true)
      setTimeout(() => {
        setPinInput('')
        setPinError(false)
      }, 1000)
    }
  }

  const handleManageClick = () => {
    if (isManaging) {
      setIsManaging(false)
    } else {
      // Exige PIN para entrar no modo de gerenciamento
      const parentProfile = familyProfiles.find(p => p.profile_type === 'parent' || p.profile_type === 'teacher') || familyProfiles[0]
      setPinModalProfile(parentProfile)
      setPinTargetAction({ type: 'manage' })
      setPinInput('')
      setPinError(false)
    }
  }

  const handleAddClick = () => {
    // Exige PIN para adicionar novo perfil
    const parentProfile = familyProfiles.find(p => p.profile_type === 'parent' || p.profile_type === 'teacher') || familyProfiles[0]
    setPinModalProfile(parentProfile)
    setPinTargetAction({ type: 'add_profile' })
    setPinInput('')
    setPinError(false)
  }

  const handleCreateNewProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProfileName.trim()) return

    const avatarKey = newProfileType === 'kid' ? 'biblioteca_meninos_1' : 'biblioteca_homens_1'
    const newP: AccountProfile = {
      id: 'prof_' + Date.now(),
      user_id: 'family_lead',
      name: newProfileName.trim(),
      avatar_url: avatarKey,
      profile_type: newProfileType,
      age: newProfileType === 'kid' ? 8 : null,
      pin: null,
      created_at: now,
      updated_at: now
    }

    try {
      await createProfile({
        name: newProfileName.trim(),
        avatar_url: avatarKey,
        profile_type: newProfileType
      })
    } catch (err) {}

    const updated = [...familyProfiles, newP]
    setFamilyProfiles(updated)
    localStorage.setItem('cdk_custom_profiles', JSON.stringify(updated))

    setShowAddModal(false)
    setNewProfileName('')
    setToastMessage(`Perfil "${newProfileName}" criado com sucesso!`)
    setTimeout(() => setToastMessage(null), 2500)
  }

  const handleOnboardingComplete = (members: OnboardingMember[], newPin: string) => {
    localStorage.setItem('cdk_family_pin', newPin)
    localStorage.setItem('cdk_family_onboarding_completed', 'true')

    const createdList: AccountProfile[] = members.map((m, idx) => ({
      id: `onboard_${idx + 1}_${Date.now()}`,
      user_id: 'family_lead',
      name: m.name,
      avatar_url: m.avatar.replace('/avatars/', '').replace('.png', ''),
      profile_type: m.role === 'crianca' ? 'kid' : 'parent',
      age: m.age || null,
      pin: m.role !== 'crianca' ? newPin : null,
      created_at: now,
      updated_at: now
    }))

    localStorage.setItem('cdk_custom_profiles', JSON.stringify(createdList))
    setFamilyProfiles(createdList)
    setShowOnboarding(false)
    setToastMessage('Família configurada com sucesso!')
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleResetTest = () => {
    localStorage.removeItem('cdk_custom_profiles')
    localStorage.removeItem('cdk_family_pin')
    localStorage.removeItem('cdk_family_onboarding_completed')
    setFamilyProfiles(profiles && profiles.length > 0 ? profiles : [])
    setToastMessage('Lista de perfis sincronizada com o servidor!')
    setTimeout(() => setToastMessage(null), 2500)
  }

  const getProfileVisual = (p: AccountProfile) => {
    const rawKey = p.avatar_url?.toLowerCase() || p.name.toLowerCase()
    const cleanKey = rawKey.replace('/avatars/', '').replace('.png', '')
    if (cleanKey === 'alison' || p.name?.toLowerCase() === 'alison' || p.avatar_url?.includes('homens-1')) {
      return {
        ...STITCH_AVATAR_MAP.alison,
        image: '/avatar-library/homens/homens-1.png'
      }
    }
    const mapped = STITCH_AVATAR_MAP[cleanKey]
    if (mapped) return { ...mapped, image: mapped.image || getAvatarImageUrl(p.avatar_url) }

    const imgUrl = getAvatarImageUrl(p.avatar_url)

    return {
      image: imgUrl,
      roleLabel: p.profile_type === 'kid' ? 'Aventureiro' : 'Pais & Responsáveis',
      borderGradient: p.profile_type === 'kid'
        ? 'linear-gradient(180deg, #4ade80 0%, #22c55e 50%, #353437 100%)'
        : 'linear-gradient(180deg, #ffddb8 0%, #653e00 50%, #353437 100%)',
      shadowColor: 'rgba(34, 197, 94, 0.35)',
      badgeBg: p.profile_type === 'kid' ? '#22c55e' : '#ff6b35',
      badgeIcon: p.profile_type === 'kid' ? Shield : Lock
    }
  }

  const finishBrandIntro = () => {
    if (brandIntroMode === 'profile' && pendingProfileEntry) {
      selectProfile(pendingProfileEntry)
      setPendingProfileEntry(null)
      setBrandIntroMode(null)
      navigate('/inicio')
      return
    }

    sessionStorage.setItem('cdk_brand_intro_seen', 'true')
    setBrandIntroMode(null)
  }

  return (
    <div data-uia="profile-gate-screen" className="cdk-dark-background cdk-profile-page-wrapper">
      {brandIntroMode && <BrandIntro onComplete={finishBrandIntro} />}
      <style>{`
        :root {
          --cdk-profile-bg: #001838;
          --cdk-profile-blue: #0099ff;
          --cdk-profile-green: #28e857;
        }

        .cdk-dark-background {
          min-height: 100vh;
          width: 100%;
          background: #09090b;
        }

        .cdk-profile-page-wrapper {
          box-sizing: border-box;
          min-height: 100vh;
          padding: clamp(28px, 5vh, 64px) clamp(20px, 6vw, 96px);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          color: #ffffff;
          font-family: var(--cdk-font-body, 'Baloo 2', sans-serif);
        }

        .cdk-profile-main-container {
          width: 100%;
          max-width: 1060px;
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 10;
        }

        .cdk-profile-left-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          text-align: center;
        }

        .cdk-profile-heading-title {
          font-family: var(--cdk-font-display, 'Baloo 2', sans-serif) !important;
          font-size: var(--cdk-h1) !important;
          font-weight: var(--cdk-font-weight-extrabold, 800) !important;
          color: #ffffff !important;
          margin: 0 0 clamp(24px, 3.5vh, 40px) !important;
          letter-spacing: -0.045em;
          line-height: 1.05;
        }

        .cdk-profile-heading-sub {
          display: none;
        }

        .cdk-profiles-vertical-list {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          gap: clamp(14px, 1.8vw, 26px);
          width: fit-content;
          max-width: 100%;
          margin: 0 0 clamp(28px, 4vh, 44px);
        }

        .cdk-profile-row-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          width: clamp(112px, 12vw, 166px);
          padding: 0;
          background: transparent;
          border: 0;
          cursor: pointer;
          text-decoration: none;
          transition: transform .22s cubic-bezier(.2,.8,.2,1);
          box-sizing: border-box;
          outline: none;
        }

        .cdk-profile-row-item:hover,
        .cdk-profile-row-item:focus-visible {
          background: transparent;
          transform: translateY(-6px) scale(1.02);
        }

        .cdk-row-avatar-box {
          position: relative;
          width: clamp(112px, 12vw, 166px);
          height: clamp(112px, 12vw, 166px);
          border-radius: clamp(17px, 1.8vw, 25px);
          border: 0;
          overflow: hidden;
          background: #003a75;
          box-shadow: 0 14px 30px rgba(0, 7, 31, .4);
          transition: border-color .22s ease, box-shadow .22s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cdk-row-avatar-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .cdk-row-avatar-box::after {
          content: '';
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          border: 5px solid transparent;
          border-radius: inherit;
          background: linear-gradient(145deg, #8dff9a 0%, #39e76d 43%, #0b943f 100%) border-box;
          -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity .18s ease;
        }

        .cdk-profile-row-item.is-active .cdk-row-avatar-box,
        .cdk-profile-row-item:hover .cdk-row-avatar-box {
          box-shadow: 0 14px 30px rgba(0, 7, 31, .4);
        }

        .cdk-profile-row-item.is-active .cdk-row-avatar-box::after,
        .cdk-profile-row-item:hover .cdk-row-avatar-box::after {
          opacity: 1;
        }

        .cdk-row-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          min-width: 0;
        }

        .cdk-row-name {
          font-size: 16px;
          font-weight: var(--cdk-font-weight-semibold, 600);
          color: #ffffff;
          letter-spacing: -0.025em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: color 0.2s ease;
        }

        .cdk-profile-row-item:hover .cdk-row-name {
          color: #4ade80;
        }

        .cdk-row-edit-pencil-btn {
          display: none;
        }

        .cdk-row-edit-pencil-btn:hover {
          color: #4ade80;
          background: rgba(255, 255, 255, 0.08);
          transform: scale(1.12);
        }

        .cdk-add-profile-row {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          width: clamp(112px, 12vw, 166px);
          padding: 0;
          border-radius: 0;
          background: transparent;
          border: 0;
          cursor: pointer;
          transition: transform .22s cubic-bezier(.2,.8,.2,1);
          box-sizing: border-box;
        }

        .cdk-add-profile-row:hover {
          background: transparent;
          transform: translateY(-6px) scale(1.02);
        }

        .cdk-add-avatar-box {
          width: clamp(112px, 12vw, 166px);
          height: clamp(112px, 12vw, 166px);
          border-radius: clamp(17px, 1.8vw, 25px);
          border: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #17171b;
          color: #d4d4d8;
          transition: all 0.2s ease;
        }

        .cdk-add-profile-row:hover .cdk-add-avatar-box {
          border-color: transparent;
          color: #ffffff;
          background: #242429;
          box-shadow: none;
        }

        .cdk-add-label {
          font-size: clamp(14px, 1.25vw, 18px);
          line-height: 1.12;
          font-weight: 600;
          color: #d9e7ff;
          transition: color 0.2s ease;
          text-align: center;
          max-width: 110px;
        }

        .cdk-add-profile-row:hover .cdk-add-label {
          color: #ffffff;
        }

        .cdk-manage-pill-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #202025;
          border: 0;
          color: #ffffff;
          padding: 12px 26px;
          border-radius: 9999px;
          font-size: 16px;
          font-weight: var(--cdk-font-weight-semibold, 600);
          cursor: pointer;
          transition: all 0.2s ease;
          backdrop-filter: blur(8px);
        }

        .cdk-manage-pill-btn:hover {
          border-color: transparent;
          color: #ffffff;
          background: #2a2a30;
          box-shadow: none;
        }

        .cdk-manage-pill-btn.is-managing-active {
          background: #27dc69;
          color: #001c35;
          border-color: #27dc69;
          font-weight: 700;
        }

        @media (max-width: 720px) {
          .cdk-profile-page-wrapper {
            padding: 28px 20px;
            justify-content: center;
          }
          .cdk-profile-heading-title {
            font-size: var(--cdk-h1) !important;
            margin-bottom: 24px !important;
          }
          .cdk-row-name,
          .cdk-manage-pill-btn { font-size: 14px; }
          .cdk-profiles-vertical-list {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            width: min(100%, 330px);
            gap: 20px 26px;
          }
          .cdk-profile-row-item,
          .cdk-add-profile-row {
            width: 100%;
          }
          .cdk-row-avatar-box,
          .cdk-add-avatar-box {
            width: min(100%, 132px);
            height: auto;
            aspect-ratio: 1;
          }
          .cdk-profile-row-item,
          .cdk-add-profile-row {
            justify-self: center;
          }
        }
      `}</style>

      <div className="cdk-profile-main-container">
        {/* LADO ESQUERDO: LISTA VERTICAL DE PERFIS CONFORME MOCKUP PHOTOSHOP */}
        <section className="cdk-profile-left-col" aria-label="Selecione seu perfil">
          <h1 className="cdk-profile-heading-title">
            {isManaging ? 'Gerenciar perfis' : 'Quem está usando?'}
          </h1>
          <p className="cdk-profile-heading-sub">Cada criança tem uma jornada única com Deus.</p>

          <div data-uia="profile-selector" className="cdk-profiles-vertical-list">
            {familyProfiles.map((p, index) => {
              const visual = getProfileVisual(p)
              const isFirst = index === 0

              return (
                <div
                  key={p.id}
                  data-uia={`profile-selector+tile-${p.id}`}
                  className={`cdk-profile-row-item ${isFirst ? 'is-active' : ''}`}
                  onClick={() => handleSelect(p)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleSelect(p)
                    }
                  }}
                >
                  {/* Squircle Avatar com Borda Neon e Badge */}
                  <div className="cdk-row-avatar-box">
                    <img
                      alt={p.name}
                      src={visual.image}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/avatars/davi.png'
                      }}
                    />

                    {isManaging && (
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.55)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Pencil size={20} color="#fff" />
                      </div>
                    )}
                  </div>

                  {/* Nome do Perfil Grande e Limpo (conforme referência) */}
                  <div className="cdk-row-info">
                    <span className="cdk-row-name">{p.name}</span>
                  </div>

                  {/* Botão de Edição Lápis à Direita (estilo mockup Photoshop) */}
                  <button
                    type="button"
                    className="cdk-row-edit-pencil-btn"
                    title={`Editar perfil de ${p.name}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      selectProfile(p)
                      navigate('/editar-perfil')
                    }}
                  >
                    <Pencil size={19} strokeWidth={2.2} />
                  </button>
                </div>
              )
            })}

            {/* Linha: Adicionar perfil */}
            <div
              className="cdk-add-profile-row"
              onClick={handleAddClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleAddClick()
                }
              }}
            >
              <div className="cdk-add-avatar-box">
                <Plus size={36} strokeWidth={2.2} />
              </div>
              <span className="cdk-add-label">Adicionar perfil</span>
            </div>
          </div>

          {/* Botão Pill Gerenciar Perfis com Ícone de Engrenagem */}
          <div data-uia="profile-gate-screen+manage">
            <button
              type="button"
              className={`cdk-manage-pill-btn ${isManaging ? 'is-managing-active' : ''}`}
              onClick={handleManageClick}
            >
              {isManaging ? (
                <>
                  <Check size={18} strokeWidth={2.5} />
                  <span>Concluído</span>
                </>
              ) : (
                <>
                  <Settings size={18} strokeWidth={2.2} />
                  <span>Gerenciar perfis</span>
                </>
              )}
            </button>
          </div>
        </section>
      </div>

      {/* Selo de Segurança Familiar Discreto */}
      <div style={{
        position: 'absolute',
        bottom: 18,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        color: 'rgba(203, 195, 215, 0.5)',
        fontSize: 12,
        fontWeight: 500
      }}>
        <CheckCircle2 size={13} color="#10b981" />
        <span>Ambiente 100% Protegido para Família</span>
      </div>

      {/* 4. TOAST NOTIFICATION DO STITCH */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: 30,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#22c55e',
          color: '#052e16',
          padding: '12px 24px',
          borderRadius: 9999,
          fontSize: 14,
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.7)',
          zIndex: 100,
          animation: 'fadeIn 0.3s ease'
        }}>
          <PartyPopper size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 5. MODAL DE PIN (Para Responsáveis ou Ações Protegidas) */}
      {pinModalProfile && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(10, 10, 14, 0.88)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          zIndex: 200
        }}>
          <div style={{
            backgroundColor: '#1c1b1d',
            border: '1px solid #353437',
            borderRadius: 24,
            padding: '36px 32px',
            maxWidth: 380,
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.8)'
          }}>
            <div style={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 185, 95, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: '#ffb95f'
            }}>
              <Lock size={26} />
            </div>

            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#e5e1e4', margin: '0 0 6px' }}>
              {pinTargetAction?.type === 'manage'
                ? 'Controle dos Pais 🔒'
                : pinTargetAction?.type === 'add_profile'
                ? 'Controle dos Pais 🔒'
                : pinModalProfile?.profile_type === 'parent' || pinModalProfile?.profile_type === 'teacher'
                ? 'Área dos Responsáveis 🔒'
                : 'Controle dos Pais 🔒'}
            </h3>
            <p style={{ fontSize: 14, color: '#cbc3d7', margin: '0 0 24px', lineHeight: 1.5 }}>
              {pinTargetAction?.type === 'manage'
                ? 'Digite o PIN parental de 4 dígitos para gerenciar os perfis da família.'
                : pinTargetAction?.type === 'add_profile'
                ? 'Digite o PIN parental de 4 dígitos para adicionar um novo perfil.'
                : pinModalProfile?.profile_type === 'parent' || pinModalProfile?.profile_type === 'teacher'
                ? `Digite o PIN parental para acessar o perfil de ${pinModalProfile.name} e abrir a Área Família.`
                : `Digite o PIN parental de 4 dígitos para acessar o perfil de ${pinModalProfile?.name}.`}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginBottom: 20 }}>
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    border: `2px solid ${pinError ? '#ffb4ab' : '#958ea0'}`,
                    backgroundColor: pinInput.length > idx ? (pinError ? '#ffb4ab' : '#22c55e') : 'transparent',
                    boxShadow: pinInput.length > idx ? '0 0 12px #22c55e' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                />
              ))}
            </div>

            {pinError && (
              <p style={{ color: '#ffb4ab', fontSize: 13, fontWeight: 700, marginBottom: 16 }}>
                PIN incorreto! Tente novamente.
              </p>
            )}

            {/* Teclado Numérico */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 10,
              maxWidth: 240,
              margin: '0 auto 20px'
            }}>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'OK'].map((btn) => (
                <button
                  key={btn}
                  type="button"
                  onClick={() => {
                    if (btn === 'C') setPinInput('')
                    else if (btn === 'OK') handleVerifyPin()
                    else if (pinInput.length < 4) setPinInput((prev) => prev + btn)
                  }}
                  style={{
                    height: 48,
                    borderRadius: 12,
                    backgroundColor: '#2a2a2c',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: btn === 'OK' ? '#22c55e' : '#e5e1e4',
                    fontSize: 18,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {btn}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setPinModalProfile(null)
                setPinTargetAction(null)
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#958ea0',
                fontSize: 14,
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* 6. MODAL ADICIONAR NOVO PERFIL */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(10, 10, 14, 0.88)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          zIndex: 200
        }}>
          <form
            onSubmit={handleCreateNewProfile}
            style={{
              backgroundColor: '#1c1b1d',
              border: '1px solid #353437',
              borderRadius: 24,
              padding: '32px 28px',
              maxWidth: 380,
              width: '100%',
              boxShadow: '0 24px 64px rgba(0, 0, 0, 0.8)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#e5e1e4', margin: 0 }}>
                Novo Perfil
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', color: '#958ea0', cursor: 'pointer' }}
              >
                <X size={22} />
              </button>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#cbc3d7', marginBottom: 8 }}>
                Nome da Criança ou Responsável
              </label>
              <input
                type="text"
                placeholder="Ex: Samuel, Esther, Papai..."
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 12,
                  backgroundColor: '#0e0e10',
                  border: '1px solid #353437',
                  color: '#fff',
                  fontSize: 15,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#cbc3d7', marginBottom: 8 }}>
                Tipo de Acesso
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setNewProfileType('kid')}
                  style={{
                    padding: '10px',
                    borderRadius: 10,
                    border: newProfileType === 'kid' ? '2px solid #22c55e' : '1px solid #353437',
                    backgroundColor: newProfileType === 'kid' ? 'rgba(34, 197, 94, 0.15)' : '#2a2a2c',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer'
                  }}
                >
                  Infantil
                </button>
                <button
                  type="button"
                  onClick={() => setNewProfileType('parent')}
                  style={{
                    padding: '10px',
                    borderRadius: 10,
                    border: newProfileType === 'parent' ? '2px solid #ffb95f' : '1px solid #353437',
                    backgroundColor: newProfileType === 'parent' ? 'rgba(255, 185, 95, 0.15)' : '#2a2a2c',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer'
                  }}
                >
                  Adulto / Pais
                </button>
              </div>
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 14,
                backgroundColor: '#22c55e',
                color: '#052e16',
                border: 'none',
                fontWeight: 800,
                fontSize: 15,
                cursor: 'pointer'
              }}
            >
              Salvar e Entrar
            </button>
          </form>
        </div>
      )}

      {/* 7. MODAL DE PRIMEIRO ACESSO ONBOARDING EM ETAPAS */}
      <PrimeiroAcessoModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
      />
    </div>
  )
}
