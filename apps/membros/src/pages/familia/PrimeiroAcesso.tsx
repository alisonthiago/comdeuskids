import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@comdeuskids/supabase'
import { useAuth } from '../../hooks/useAuth'

// URLs oficiais do design Stitch com fallbacks locais
const ASSETS = {
  step1: {
    alison: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5TIyRxhR6ddxKYODAOZ9-7zknDLTGog8hp3EutLzAuaJNAJ5KvW16Ly_C3RqQPB_l1kY37wjZF3pCvFp7tdzIbWgC_FpFpfw424nXu3M8hUP1ilW1T8qYOh5iT84QXmz4vkClFguqmqJ8nbzTuWsFpD8RaiMxuH2lnaWi8AM1lJAWEeg3SVTc_wIHDGnCg80AYPVuKXrOTCvQR2qtUs9KsSDmqLjBtChF20RHE4N2m3tZuqSpu-pEmw',
    children: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAC2cbMD3weswbch6S2nSz4HY4I8Z7YzElpigBIhA746FPv3D2jQRuFcLZvpKFTKEXCqz5w7pUdwdrDojmmWeWLmXzJsv2dK2H-GTEERBqp25ROijRTV1iLs5ZJpRKbVEfHYErriR7LVwuOhzUH6KKDAsEYUr4vZdEmoSUAmiGVHgfBf9zR6edgRnS4my05tZaRNKES1S0_IyIZAbNOX3JUQD61xaGcuOoZxBoYyi-hz8e1rOUi0NJO5Q',
    nadia: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCOUxNx9W_SrGpFTxPdlcAqHdwNDOJ3jz4OKZTk0nGmae1XRxTen5jm3oHebEmRJIoRTOT1vecR9kIdhZevg_0-6mWDNMg8QmIIw2xZZPUPiuOFrGJl1KOKFjOHexiJxPTG9nQaSyoMXgMMTPsjyaTlbdEE73e2LbN3FiEUF5XUJRUMRijflmubcltRquULX6qFPAkWpX32vPytgcPN-oDdVBo2zcEU4U1PeKQPDDY1z1yjAWLbAIiRbg'
  },
  adultAvatars: [
    {
      id: 'alison',
      label: 'Alison',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhEn8FOMiUINcUwGWr7n9lyZ4gle5ERDyA3p44ohuXkHfpQ35e0c4gcbP19N1So3QVsTkU-eve59Ksffz2CmHg5RW2TjOvwiVeo5LX9zGLe8wFSClYbV0dSiTzM6ie1R03rEQF9AdOPGsrfPBWfdB2yKT43U-39KxdvBLjfLmZMY5B3a3sjloaCd78DhJAZ-JelilfdxiGliZHMFjfJSqM1sa3wEY3zaqsj89E6TlKhtQ_782m_quSkg'
    },
    {
      id: 'carismatico',
      label: 'Carismático',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCcWlqWUBHcXoKjHOMVVspc6VltvGnT5c7SWKh8HS3KNeEFbT5wViPemRtmfxPwFSOFmFwSmt0sgerllmjEHSKwuOG1vxeYK9V8D_yd7Vi-_l-ousMpR9L-jdOYuaT4VF31U-KogTf-yQDpwr6_47Z0MVQM_SK9A_SsTuUR8CYxPbtyFCKRBtB_qk08gHFiaCOjHg8n-N9FerniaSSF7ckbfGlmrgi0s8R3KYRRzxnju-KZaqMBbN7ziQ'
    },
    {
      id: 'acolhedora',
      label: 'Acolhedora',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2Be2DDSYa4aQATelxXvHaVPqzPtWgQVv2rkAUpxZr7xN3X6pRWUzREO6JpcofJsH_HF_ZcADkJYxtaXwl5q0v0AC8yX9MYoUnWpySF-aLEKBA_hjEPeoXdffqrL9b-q02eCbjg5WPW_yybxJHtaxy0QBN1eQyACpw_j8t6zN5YaYBNQ-vw5afUeocYOloMI6ZGslFBYJ0qjuH-4TIcps-HW7clI5xqTQZCZi3zMMv_kYYjc4Y09XMMA'
    },
    {
      id: 'sereno',
      label: 'Sereno',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCqp_knDyjgBEOAah2IXcMizjJM40R7k42ZL9ePms2S9G9l-4bvqVZwhsang4iIdNGpXckNQHCXKwaby3I4HV9fjLh8xfILw3c1awgyIc_1yKEnREc-VNvbs0lpMGaM4fqfXtXv8-FXN011hx9Tx4uUiSa5de6PPOw35zcIBRi_7CQ_UH2q4wNIh_Etmk8EJ_PY6NXGMonj2zvctQCHfd-Wv1YG9c4TeR-pQhhLgjPKgpvaWQXjzuCRaw'
    }
  ],
  biblicalAvatars: [
    {
      id: 'ester',
      label: 'Ester',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-0pIneDokJS6E_GCD_Lzwmws2ypLSygiRYaorUkkI_dPzPWrLN0MWmXKb3yxeV7gxCyDo5dH_S4GP6PHQapT6aBOUSADkU-0CBhSVa3IMSFAv9b_HNOVGgyhhCGrCqbPkavQwvAdGn_3bPEG6xvEhoW_hoUQ9OX1peYxgNrB8cuQZD0Tp6OQbUXdvhSICIWR5gskRuxCjUJggT6ZTRS7WOvKZHvxBH49qwnrKxZ-HYQ3kFSxi49RF2Q'
    },
    {
      id: 'maria',
      label: 'Maria',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHXyMajzD0H4-FZaBKxnd-ZUWSfACQ6_eO60-CPb7tZ7U-k2NZ1tqjU8gNM6jzr38EdRZV5BmThjCuf0YiHeXhS0W4qts5h33me-HHijFE4CYJNFGf1ipF071SQ_9TzWmKUtaMajvTVF58N9RH6DvpH-T6FYahtiw56jwUn-0oho0qycTwr2PLiAWe0DO9yBstzlKPgu8E6yvUU_FrjbiFNmfrdmd5pIQm7Z_WLtaGCnzBQ3d5SF8VHg'
    },
    {
      id: 'ovelha',
      label: 'Ovelha',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBcWMtm1_6lS--oCbtaeK3ubUdHtUQ5Kh0v6sQEQQ9eREnwTXk7m5QHnNuBfnbW48BAOc7AVwtbO2vw6EWZKsPxNlSmn54GChcDGtMioeSpMPXOcJlXgYoJAQ_SybsP5nifXBfHyAcMwGmg0RNwd2xo_N9GWjWDaPQ3c5ROkfY0v06gHbFsE3fEwNBGf_dEWjTgnnITUPkiO3k-0HReZgo6R90Ll30wn1gGLESOTpMs9R82bo4JVdMZww'
    },
    {
      id: 'davi',
      label: 'Davi',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_OQVVZlzGNrYyzCaQZDblwLGl1xxocMbtIwOIF-dFMLGY7c30Tl6tc1nvWQIanYJdEADV1ynnCmHEdEiBnxx02yWXMIbFAoLmPhWGvTH2JGJjxeQqup9kHRd9QMZX6icMg59NGoKr9DopZzFP2JxVJpBkEWhfWvLdSm6CWZSv_FImexdcfsyR89NDLu7LYszrRK8WL74TDcf6xs994l-480pYLZgG8wQNzYSbmqj8L_5wJfvO9IUl2Q'
    },
    {
      id: 'leao',
      label: 'Leão',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCovTm1WGg0z2dh1bxk-LqmPaQWLsqN654wB5HVxXbOwG64MBYh_8Ro93Bk6RIdSwC3dNNny5wCHRafE8LRV7SU1I-utaiDCMxTtnVVNzy8JVX3Ktoh2vvOmZ07zYaNwltlIeC-Zvm6L2eNHEKffH5AVUF2Lev5gPmFS5xcmSpgRD_z1gqdJ56BsN9Q3PNVQL2ktT7-RlY7H4X5WQXOma64pmmgsxSnzhBMcitAoW4j-TATXZViswz8JQ'
    }
  ],
  defaultKids: [
    {
      id: 'kid-joao',
      name: 'João',
      age: 8,
      birthDate: '2018-05-14',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwYT1yol3oeYzZovSyf71YGVUaHr8x_vlEicpE-KmMVh0jDwxYGS5T5djF0KZsZJjftr-4LwZYlews86W5pdZhZkqbIn5cmHCmVmc0U2hqp-bE_aaq155OomGZWHGTUxOIEkGvN-SliIjIVtZ0t6ou5faWgUJqxTq6GgX6bde4rbW8nhYgD2scTdKwO7bG8TmF3HrgkByzczUIlNSbNnAdFlF0WTmLzAjJyC4hDJhbbI2ScHeqjyYiOA'
    },
    {
      id: 'kid-miguel',
      name: 'Miguel',
      age: 4,
      birthDate: '2022-02-10',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwC6BvWYS53QLwu1XTAq10o2MS84NCbTI7CoKVCIcTB_6RcS061HFEiWxG3kJS1nmwRzpsy2iWeizfwvyjnqMVKPWHXW0aA8VcrojVWbRgl3sOOUBYVRUcHkATO7WQudU0IcwAI85iQBaw-ICnGFcTqBzosex06H86Qp9M1FB0V0FP30csGHc5ojdWra8kiRAxPu49eFI7Qz2nVEBmZ1HO8VQMwJ4Kdhm0iO7_18V1Ao0XTlj5U3UDgQ'
    }
  ],
  nadiaPhoto: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnOvN6wSszASIh5KEuQwIbpTynj-w38y212dlspJS9hP1vXaq-glu033ZnKKtve3W10qS-Z69Cak8LNjBRlgAxFd_QEFerQv-RyjiY28T3JcCQ6swZLbEigOlvuKkY-XnZY4qXj3e7HamCbB4NRQvGg5RAcE7ArOZtcttQHxryocDSXCnJCzSYCSPwudRg5RdDHh4B2xysx_CUlbgb969BL6vXrOI0OB_xFtxkEdjksKV01o3QNkxmkg',
  celebrationAvatars: {
    alison: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfWPD-IceP4UhjZAAfFRMvrMDrk30AWOMc8QD_oBORS9-BRP90pPrd7jPEN5YozLq8Rm35iwhTxMUdtKpG00rvwtKKVo_tWajzT2gykItg-0-qJkL9xz_msRVfeV9FvdLo3wulnZws_iDcJrS7K9qeoHuPa5L8LdC57UBupr39DLd3J3AQmMUt2Ynxi3WUjdcqEyl3uVxENPyPAVAxj67qF8EHysyUimmkzb3zi9npcxhLHJLdtB2ohA',
    nadia: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAF8hSpU5lyq3gBtYwb2semsw65jhgROw7EsObeQVpVakjsqTJKe5d2aoPTph1OLrPMHn0CLpq3-Ac4Rj4V-ALh0wZEHJ4d1mFY7K7fZkPPWvHm3LU1q2VUk03ooMa3Arix4B0YEU_WzTW46FdvV7Jx_3JaLA0W-LUx6JHG_rfscw9Ry2dCIxKbNpTyVa8TiQHtJqZGM__mhbsJj4U69nDE1a3RfDeTfEoU9fl2LyaouMv7UhcQWeSr9Q',
    joao: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3TyZBzpJtVB4Hp-q7lKHsXNJ3YZmUiIZJ1mYdEgGN_HLw8v-JfcMCZQVjroDHvE74QiFpCzEdZAyl99jwC2QKFS1sInvg011pkYnUK59-TDnOxZ1S-t1KCzyVqyNfaSEiAcuvNTBL5gT0XhPwBffacKzFBGB5mczEKbs-TrBMC5MV2WYZHAbLGclaUEh6MxSjS6GRBJ276iVEd60hl7ptXejdD8TBPrUJBwvQDnKrocA0qWhwfT8ytQ',
    maria: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCS0UoJ8JiPAiYKOThNO4WNejDyUQmxL0hOJPtxPAEcQezulpm2a1gT8SdDieClxViXc-Nou_vgRzid6c8CDOTGi4uQi3H5sgB7Axf_yPJ0zavfkf9YsiF5g-WZLZuYkeCVMRWwBjdXsG7fb97y-UwgCxFNoEWsk_ABW-Mafx4rT3UmWcmRmnBI_fN7MPFg9_xSe-GBi7BATU4YvGDJmXPVl4mT7eR7vRCNpR281JhiN0DJ_lqRBEIAdA',
    miguel: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCU5jpLxhI5UNjlAfAG0UNn73ouHiFEq_5HcXSLuh_nOyUq_0Ir0ee1LufAG4Ex9MD7b4KEg_TCsifcq3Ty5GSylKdDMCyFtY44wyKKCUIElDrT-oTRe_ZW0G4cbaKlb14cl-k1taK9P9NMcJ2dhIqDG69BHIN9-uoNTiF44LLr89xLlvH9yfNn_V-Sdr4NQ5lJ4iv6Ur8CADCKtB14JYbU00Te4-cnlrRKbBYMSMSiQiQGc0-5QEmOWw'
  }
}

interface ChildItem {
  id: string
  name: string
  age: number
  birthDate?: string
  avatar: string
}

interface GuardianItem {
  id: string
  name: string
  email: string
  roleLabel: string
  vinculo: 'mae' | 'pai' | 'responsavel' | 'avo' | 'outro'
  avatar: string
  isTitular?: boolean
}

export function PrimeiroAcesso() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Etapa atual: 1 a 6
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1)

  // Passo 2: Titular
  const [userName, setUserName] = useState('Alison')
  const [userRole, setUserRole] = useState<'pai' | 'mae' | 'responsavel' | 'outro'>('pai')
  const [selectedAdultAvatar, setSelectedAdultAvatar] = useState('alison')

  // Passo 3: Crianças
  const [childrenList, setChildrenList] = useState<ChildItem[]>(ASSETS.defaultKids)
  const [showAddChildModal, setShowAddChildModal] = useState(false)
  const [newChildName, setNewChildName] = useState('')
  const [newChildBirthDate, setNewChildBirthDate] = useState('2019-03-20')
  const [newChildAvatar, setNewChildAvatar] = useState('ester')

  // Passo 4: Responsáveis
  const [guardians, setGuardians] = useState<GuardianItem[]>([
    {
      id: 'g-alison',
      name: 'Alison',
      email: 'alison@exemplo.com.br',
      roleLabel: 'Pai • Titular',
      vinculo: 'pai',
      avatar: ASSETS.adultAvatars[0].url,
      isTitular: true
    },
    {
      id: 'g-nadia',
      name: 'Nádia',
      email: 'nadia.alencar@exemplo.com.br',
      roleLabel: 'Mãe • Convidada',
      vinculo: 'mae',
      avatar: ASSETS.nadiaPhoto,
      isTitular: false
    }
  ])
  const [showAddGuardianForm, setShowAddGuardianForm] = useState(false)
  const [newGuardianName, setNewGuardianName] = useState('')
  const [newGuardianEmail, setNewGuardianEmail] = useState('')
  const [newGuardianVinculo, setNewGuardianVinculo] = useState<'mae' | 'pai' | 'responsavel' | 'avo' | 'outro'>('responsavel')

  // Passo 5: PIN Parental
  const [pin1, setPin1] = useState(['', '', '', ''])
  const [pin2, setPin2] = useState(['', '', '', ''])
  const [pinError, setPinError] = useState<string | null>(null)
  const [isSavingPin, setIsSavingPin] = useState(false)

  const pin1Refs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)]
  const pin2Refs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)]

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentStep])

  const calcAge = (birthStr: string) => {
    if (!birthStr) return 0
    const today = new Date()
    const birth = new Date(birthStr)
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age > 0 ? age : 0
  }

  const handlePinInput = (group: 1 | 2, index: number, value: string) => {
    const digit = value.replace(/[^0-9]/g, '').slice(-1)
    if (group === 1) {
      const next = [...pin1]
      next[index] = digit
      setPin1(next)
      setPinError(null)
      if (digit && index < 3) {
        pin1Refs[index + 1].current?.focus()
      } else if (digit && index === 3) {
        pin2Refs[0].current?.focus()
      }
    } else {
      const next = [...pin2]
      next[index] = digit
      setPin2(next)
      setPinError(null)
      if (digit && index < 3) {
        pin2Refs[index + 1].current?.focus()
      }
    }
  }

  const handlePinKeyDown = (group: 1 | 2, index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (group === 1) {
        if (!pin1[index] && index > 0) {
          pin1Refs[index - 1].current?.focus()
        }
      } else {
        if (!pin2[index] && index > 0) {
          pin2Refs[index - 1].current?.focus()
        }
      }
    }
  }

  const isPinMatch = () => {
    const p1 = pin1.join('')
    const p2 = pin2.join('')
    return p1.length === 4 && p2.length === 4 && p1 === p2
  }

  const handleConfirmPin = () => {
    const p1 = pin1.join('')
    const p2 = pin2.join('')

    if (p1.length < 4 || p2.length < 4) {
      setPinError('Por favor, digite os 4 dígitos nos dois campos.')
      return
    }
    if (p1 !== p2) {
      setPinError('Os PINs inseridos não coincidem. Tente novamente.')
      return
    }

    setIsSavingPin(true)
    setTimeout(() => {
      setIsSavingPin(false)
      localStorage.setItem('cdk_family_pin', p1)
      setCurrentStep(6)
    }, 600)
  }

  const handleSaveChild = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newChildName.trim()) return

    const selectedAvatarObj = ASSETS.biblicalAvatars.find(a => a.id === newChildAvatar) || ASSETS.biblicalAvatars[0]
    const calculatedAge = calcAge(newChildBirthDate) || 5

    const newChild: ChildItem = {
      id: 'kid-' + Date.now(),
      name: newChildName.trim(),
      age: calculatedAge,
      birthDate: newChildBirthDate,
      avatar: selectedAvatarObj.url
    }

    setChildrenList([...childrenList, newChild])
    setNewChildName('')
    setShowAddChildModal(false)
  }

  const handleCompleteOnboarding = async () => {
    const savedPin = pin1.join('') || localStorage.getItem('cdk_family_pin') || '1234'
    localStorage.setItem('cdk_family_pin', savedPin)
    localStorage.setItem('cdk_family_onboarding_completed', 'true')

    // Tenta persistir no Supabase se houver usuário conectado
    if (user?.id) {
      for (const kid of childrenList) {
        try {
          await supabase.from('account_profiles').insert({
            user_id: user.id,
            name: kid.name,
            avatar_url: kid.avatar,
            profile_type: 'kid',
            age: kid.age,
            pin: null
          })
        } catch (e) {
          console.warn('Erro ao inserir perfil no Supabase:', e)
        }
      }
    }

    navigate('/familia')
  }

  return (
    <div className="bg-[#f8f9fc] font-sans text-on-surface antialiased min-h-screen w-full flex flex-col justify-between selection:bg-primary-container selection:text-white relative overflow-x-hidden">
      {/* ── GLOWS DE FUNDO SUTIS ────────────────────────────────────── */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-primary-fixed/25 via-secondary-fixed/15 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-secondary-fixed/20 blur-3xl pointer-events-none -z-10" />

      {/* ── HEADER ──────────────────────────────────────────────────── */}
      <header className="w-full px-6 sm:px-12 lg:px-20 pt-7 pb-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="font-extrabold text-2xl tracking-tight text-on-surface">
            comdeus <span className="text-primary-container font-black">kids</span>
          </span>
        </div>

        {currentStep < 6 && (
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setCurrentStep(6)}
              className="text-sm font-semibold text-outline hover:text-on-surface transition-colors cursor-pointer py-1.5 px-3 rounded-lg hover:bg-surface-container/60"
            >
              Pular introdução
            </button>
          </div>
        )}
      </header>

      {/* ── PROGRESSO: 5 TRAÇOS ─────────────────────────────────────── */}
      {currentStep <= 5 && (
        <div className="w-full max-w-xs sm:max-w-sm mx-auto px-6 pt-2 pb-6 flex items-center justify-center gap-2 shrink-0">
          <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${currentStep >= 1 ? 'bg-primary-container' : 'bg-surface-container-highest/60'}`} />
          <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${currentStep >= 2 ? 'bg-primary-container' : 'bg-surface-container-highest/60'}`} />
          <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${currentStep >= 3 ? 'bg-primary-container' : 'bg-surface-container-highest/60'}`} />
          <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${currentStep >= 4 ? 'bg-primary-container' : 'bg-surface-container-highest/60'}`} />
          <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${currentStep >= 5 ? 'bg-primary-container' : 'bg-surface-container-highest/60'}`} />
        </div>
      )}

      {/* ── PASSO 1: BOAS-VINDAS ─────────────────────────────────────── */}
      {currentStep === 1 && (
        <main className="w-full flex-1 max-w-5xl mx-auto px-6 sm:px-10 flex flex-col items-center justify-center text-center py-4 my-auto">
          <div className="max-w-2xl mx-auto mb-8 sm:mb-12">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-surface-container shadow-xs text-xs font-semibold text-secondary mb-5">
              <span className="w-2 h-2 rounded-full bg-[#006c49] animate-pulse" />
              Passo 1 de 5 • Boas-vindas
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-on-surface tracking-tight leading-[1.15]">
              Sua família começa aqui <span className="inline-block text-[#006c49]">💚</span>
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-on-surface-variant font-medium max-w-md mx-auto leading-relaxed">
              Vamos preparar o Com Deus Kids para vocês.
            </p>
          </div>

          <div className="relative w-full max-w-lg mx-auto mb-10 sm:mb-12 flex items-center justify-center">
            <div className="absolute inset-0 m-auto w-64 h-64 sm:w-80 sm:h-80 bg-gradient-to-tr from-primary-fixed/40 via-secondary-fixed/30 to-tertiary-fixed/30 rounded-full blur-2xl -z-10" />
            <div className="relative flex items-center justify-center py-6">
              <div className="animate-float-1 flex flex-col items-center -mr-5 z-20">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-white shadow-xl ring-4 ring-[#ffdbd0]/60">
                  <img alt="Alison" className="w-full h-full rounded-full object-cover" src={ASSETS.step1.alison} />
                </div>
                <span className="mt-2 text-xs font-bold text-on-surface bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full shadow-xs border border-surface-container">Alison</span>
              </div>
              <div className="flex flex-col items-center z-30 scale-110 sm:scale-120 mx-1">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1.5 bg-gradient-to-tr from-[#ff6b35] to-[#006c49] shadow-2xl">
                  <div className="w-full h-full rounded-full overflow-hidden bg-surface-container-lowest ring-2 ring-white">
                    <img alt="Crianças" className="w-full h-full object-cover" src={ASSETS.step1.children} />
                  </div>
                </div>
                <span className="mt-2.5 text-xs font-bold text-[#006c49] bg-[#6cf8bb]/25 border border-[#6cf8bb]/40 px-3 py-0.5 rounded-full shadow-xs">Crianças</span>
              </div>
              <div className="animate-float-2 flex flex-col items-center -ml-5 z-20">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-white shadow-xl ring-4 ring-[#6cf8bb]/50">
                  <img alt="Nádia" className="w-full h-full rounded-full object-cover" src={ASSETS.step1.nadia} />
                </div>
                <span className="mt-2 text-xs font-bold text-on-surface bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full shadow-xs border border-surface-container">Nádia</span>
              </div>
            </div>
          </div>

          <div className="w-full flex flex-col items-center gap-4 max-w-sm mx-auto">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="w-full sm:w-auto min-w-[260px] inline-flex items-center justify-center gap-3 px-10 py-4 rounded-2xl bg-[#ff6b35] hover:bg-[#ff5517] text-white font-bold text-lg shadow-lg shadow-[#ff6b35]/25 hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <span>Começar</span>
              <span className="material-symbols-outlined text-2xl">arrow_forward</span>
            </button>
            <div className="flex items-center gap-1.5 text-xs text-outline/80 font-medium">
              <span className="material-symbols-outlined text-sm text-secondary" style={{ fontVariationSettings: '"FILL" 1' }}>verified_user</span>
              <span>Leva menos de 2 minutos • Ambiente protegido para a família</span>
            </div>
          </div>
        </main>
      )}

      {/* ── PASSO 2: IDENTIFICAÇÃO ──────────────────────────────────── */}
      {currentStep === 2 && (
        <main className="w-full flex-1 flex flex-col justify-center px-6 lg:px-12 py-6 sm:py-8 pb-28 sm:pb-32 my-auto">
          <div className="max-w-2xl w-full mx-auto flex flex-col gap-6 sm:gap-7">
            <div className="flex flex-col gap-1.5 text-left">
              <div className="flex items-center justify-between text-xs font-semibold mb-0.5">
                <span className="text-primary uppercase tracking-wide">Passo 2 de 5</span>
                <span className="text-outline font-normal">Identificação</span>
              </div>
              <h1 className="text-3xl sm:text-4xl text-on-surface tracking-tight font-extrabold">
                Primeiro, quem é você?
              </h1>
              <p className="text-base sm:text-lg text-on-surface-variant font-normal">
                Esse será seu perfil de adulto no Com Deus Kids.
              </p>
            </div>

            <div className="flex flex-col gap-5 sm:gap-6">
              {/* 1. Escolha seu Avatar (Linha compacta e elegante) */}
              <div className="flex flex-col gap-2.5">
                <label className="text-xs sm:text-sm font-semibold text-on-surface tracking-wide">
                  Escolha seu avatar
                </label>
                <div className="grid grid-cols-4 gap-3 sm:gap-4">
                  {ASSETS.adultAvatars.map((avatar) => {
                    const isSelected = selectedAdultAvatar === avatar.id
                    return (
                      <button
                        key={avatar.id}
                        type="button"
                        onClick={() => setSelectedAdultAvatar(avatar.id)}
                        className={`group relative flex flex-col items-center p-2.5 sm:p-3 rounded-2xl bg-surface-container-lowest border-2 transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'border-primary-container shadow-md ring-2 ring-primary-container/20 scale-[1.02]'
                            : 'border-surface-container-high hover:border-outline-variant shadow-xs'
                        }`}
                      >
                        {isSelected && (
                          <div className="badge-indicator absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-primary-container text-white flex items-center justify-center shadow-md shadow-primary/30 z-10">
                            <span className="material-symbols-outlined text-sm font-bold">check</span>
                          </div>
                        )}
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-surface-container-low">
                          <img
                            alt={avatar.label}
                            src={avatar.url}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <span className={`mt-2 text-xs sm:text-sm truncate w-full text-center ${isSelected ? 'font-bold text-primary' : 'font-medium text-on-surface-variant'}`}>
                          {avatar.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 2. Campo Nome */}
              <div className="flex flex-col gap-2">
                <label className="text-xs sm:text-sm font-semibold text-on-surface tracking-wide" htmlFor="membros-user-name">
                  Seu nome
                </label>
                <div className="relative w-full">
                  <input
                    id="membros-user-name"
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Como você prefere ser chamado"
                    className="w-full h-14 px-4 sm:px-5 rounded-2xl bg-surface-container-lowest border-2 border-surface-container-high text-on-surface text-lg sm:text-xl font-semibold shadow-xs focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 focus:outline-none transition-all placeholder:text-outline/40"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center text-secondary">
                    <span className="material-symbols-outlined text-2xl">check_circle</span>
                  </div>
                </div>
              </div>

              {/* 3. Como as crianças chamam você? (Pills Objetivos) */}
              <div className="flex flex-col gap-2">
                <label className="text-xs sm:text-sm font-semibold text-on-surface tracking-wide">
                  Como as crianças chamam você?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                  {[
                    { id: 'pai', emoji: '👨', label: 'Pai' },
                    { id: 'mae', emoji: '👩', label: 'Mãe' },
                    { id: 'responsavel', emoji: '❤️', label: 'Responsável' },
                    { id: 'outro', emoji: '✨', label: 'Outro' }
                  ].map((role) => {
                    const isSelected = userRole === role.id
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => {
                          setUserRole(role.id as any)
                          if (!userName.trim()) {
                            setUserName(role.label)
                          }
                        }}
                        className={`flex items-center justify-center gap-2.5 h-12 px-3 rounded-xl bg-surface-container-lowest border-2 transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'border-primary-container shadow-xs ring-2 ring-primary-container/20 text-primary font-bold bg-primary-container/5'
                            : 'border-surface-container-high text-on-surface-variant hover:border-outline-variant hover:bg-surface-container-low font-medium'
                        }`}
                      >
                        <span className="text-xl select-none">{role.emoji}</span>
                        <span className="text-sm sm:text-base">{role.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ── PASSO 3: AS CRIANÇAS ────────────────────────────────────── */}
      {currentStep === 3 && (
        <main className="w-full flex-1 max-w-5xl mx-auto px-6 py-10 pb-28 sm:pb-32 flex flex-col justify-center gap-10 my-auto">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-on-surface">
              Agora, as crianças <span className="text-secondary inline-block">💚</span>
            </h1>
            <p className="text-lg sm:text-xl text-on-surface-variant font-medium">
              Quem vai aproveitar o Com Deus Kids?
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {childrenList.map((kid) => (
              <div
                key={kid.id}
                className="group bg-surface-container-lowest border-2 border-surface-container rounded-3xl p-6 flex flex-col items-center text-center shadow-sm hover:shadow-xl hover:border-primary-fixed transition-all duration-300 relative"
              >
                <div className="absolute top-4 right-4">
                  <button
                    type="button"
                    onClick={() => setChildrenList(childrenList.filter(c => c.id !== kid.id))}
                    className="w-8 h-8 rounded-full hover:bg-error-container/30 flex items-center justify-center text-outline hover:text-error"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden shadow-lg bg-surface-container-highest mb-4 group-hover:scale-105 transition-transform duration-300">
                  <img alt={kid.name} src={kid.avatar} className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-secondary ring-4 ring-surface-container-lowest" />
                </div>
                <h3 className="text-2xl font-bold text-on-surface">{kid.name}</h3>
                <p className="text-sm font-semibold text-outline mt-0.5">{kid.age} anos</p>
                <div className="mt-4 px-3.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  Perfil criado
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setShowAddChildModal(true)}
              className="group bg-surface-container-lowest/60 hover:bg-surface-container-lowest border-2 border-dashed border-outline-variant hover:border-primary-container rounded-3xl p-6 flex flex-col items-center justify-center text-center transition-all duration-300 min-h-[280px] cursor-pointer"
            >
              <div className="w-20 h-20 rounded-full bg-surface-container group-hover:bg-primary-fixed/50 flex items-center justify-center text-outline group-hover:text-primary transition-all duration-300 mb-4 group-hover:scale-110">
                <span className="material-symbols-outlined text-4xl">add</span>
              </div>
              <span className="text-lg font-bold text-on-surface group-hover:text-primary transition-colors">
                Adicionar outra criança
              </span>
              <span className="text-xs font-medium text-outline mt-1">Configuração rápida e personalizada</span>
            </button>
          </div>

          {showAddChildModal && (
            <div className="bg-surface-container-lowest border border-surface-container rounded-3xl p-6 sm:p-8 shadow-2xl transition-all max-w-2xl mx-auto w-full">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-on-surface">Nova Criança</h2>
                  <p className="text-xs text-outline font-medium">Basta o nome, a idade e um amiguinho bíblico.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddChildModal(false)}
                  className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-outline hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              <form onSubmit={handleSaveChild} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface" htmlFor="m-submodal-name">
                      Nome ou apelido
                    </label>
                    <input
                      id="m-submodal-name"
                      type="text"
                      required
                      value={newChildName}
                      onChange={(e) => setNewChildName(e.target.value)}
                      placeholder="Ex: Sara, Davi, Samuel..."
                      className="w-full bg-surface-container-low h-12 px-4 rounded-xl text-on-surface font-semibold focus:ring-2 focus:ring-primary-container border-none outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-on-surface" htmlFor="m-submodal-birth">
                        Nascimento
                      </label>
                      <span className="text-xs font-bold text-secondary bg-secondary-fixed/50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">cake</span> {calcAge(newChildBirthDate)} anos
                      </span>
                    </div>
                    <input
                      id="m-submodal-birth"
                      type="date"
                      required
                      value={newChildBirthDate}
                      onChange={(e) => setNewChildBirthDate(e.target.value)}
                      className="w-full bg-surface-container-low h-12 px-4 rounded-xl text-on-surface font-semibold focus:ring-2 focus:ring-primary-container border-none outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface">Escolha o Avatar Bíblico</label>
                  <div className="flex items-center gap-3 overflow-x-auto pb-2">
                    {ASSETS.biblicalAvatars.map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setNewChildAvatar(av.id)}
                        className={`w-16 h-16 rounded-2xl p-1 shrink-0 transition-all overflow-hidden flex items-center justify-center ${
                          newChildAvatar === av.id
                            ? 'ring-4 ring-primary-container bg-primary-fixed/40'
                            : 'bg-surface-container-low hover:bg-surface-container'
                        }`}
                      >
                        <img alt={av.label} src={av.url} className="w-full h-full object-cover rounded-xl" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddChildModal(false)}
                    className="px-5 h-11 rounded-xl text-outline hover:text-on-surface font-semibold text-sm cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 h-11 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-bold text-sm shadow-md cursor-pointer"
                  >
                    Salvar Criança
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      )}

      {/* ── PASSO 4: QUEM CUIDA COM VOCÊ? ───────────────────────────── */}
      {currentStep === 4 && (
        <main className="w-full flex-1 max-w-4xl mx-auto px-6 sm:px-10 py-10 sm:py-14 pb-28 sm:pb-32 flex flex-col justify-center my-auto">
          <div className="text-center sm:text-left mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed-variant text-xs font-bold tracking-wide uppercase mb-3">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>group</span>
              Rede de Cuidado
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-on-surface leading-tight">
              Quem cuida com você?
            </h1>
            <p className="text-lg sm:text-xl text-on-surface-variant mt-2 font-normal">
              Você pode adicionar outro responsável.
            </p>
          </div>

          <div className="flex flex-col gap-5 w-full">
            <div className="w-full bg-surface-container-lowest border border-surface-container rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:border-outline-variant/60 transition-all">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-surface-container-high text-primary flex items-center justify-center font-bold text-2xl sm:text-3xl ring-4 ring-surface-container-lowest shadow-sm">
                  <span className="text-3xl sm:text-4xl">👨</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xl sm:text-2xl font-bold text-on-surface">{userName}</span>
                    <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-bold bg-surface-container text-on-surface-variant">
                      Pai • Titular
                    </span>
                  </div>
                  <span className="text-sm sm:text-base text-outline mt-0.5 font-medium">alison@exemplo.com.br</span>
                </div>
              </div>
              <span className="px-3.5 py-1.5 rounded-xl bg-surface-container-low text-secondary text-xs sm:text-sm font-semibold flex items-center gap-1.5 self-end sm:self-center">
                <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: '"FILL" 1' }}>shield_person</span>
                Conta Principal
              </span>
            </div>

            {guardians.filter(g => !g.isTitular).map((guardian) => (
              <div
                key={guardian.id}
                className="w-full bg-surface-container-lowest border-2 border-primary-container/40 rounded-3xl p-6 sm:p-7 shadow-[0_8px_30px_-6px_rgba(255,107,53,0.12)] flex flex-col gap-6 relative transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
                  <div className="flex items-start sm:items-center gap-5">
                    <img alt={guardian.name} src={guardian.avatar} className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-primary-fixed/40 shadow-sm" />
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xl sm:text-2xl font-bold text-on-surface">{guardian.name}</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-fixed text-on-primary-fixed-variant">
                          👩 Convidada
                        </span>
                      </div>
                      <p className="text-sm sm:text-base text-on-surface-variant font-medium mt-0.5">{guardian.email}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGuardians(guardians.filter(g => g.id !== guardian.id))}
                    className="p-2.5 rounded-xl hover:bg-error-container/50 text-outline hover:text-error transition-colors self-end sm:self-center"
                  >
                    <span className="material-symbols-outlined text-xl">delete_outline</span>
                  </button>
                </div>

                <div className="border-t border-surface-container pt-5 flex flex-col gap-2.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-outline">Vínculo familiar com as crianças</label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {[
                      { id: 'mae', label: '👩 Mãe' },
                      { id: 'pai', label: '👨 Pai' },
                      { id: 'responsavel', label: '🤝 Responsável' },
                      { id: 'avo', label: '👵 Avó / Avô' },
                      { id: 'outro', label: '✨ Outro' }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setGuardians(guardians.map(g => g.id === guardian.id ? { ...g, vinculo: opt.id as any } : g))}
                        className={`flex items-center justify-center gap-2 p-3 rounded-2xl text-sm font-semibold cursor-pointer transition-all ${
                          guardian.vinculo === opt.id
                            ? 'border-2 border-primary bg-primary/5 text-primary font-bold shadow-xs'
                            : 'border border-surface-container bg-surface-container-low hover:bg-surface-container-lowest text-on-surface'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {showAddGuardianForm ? (
              <div className="w-full bg-surface-container-lowest border-2 border-surface-container rounded-3xl p-6 shadow-md flex flex-col gap-4">
                <h3 className="font-bold text-lg text-on-surface">Novo Responsável</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Nome completo"
                    value={newGuardianName}
                    onChange={(e) => setNewGuardianName(e.target.value)}
                    className="h-12 px-4 rounded-xl bg-surface-container-low text-on-surface font-semibold border-none outline-none focus:ring-2 focus:ring-primary-container"
                  />
                  <input
                    type="email"
                    placeholder="E-mail"
                    value={newGuardianEmail}
                    onChange={(e) => setNewGuardianEmail(e.target.value)}
                    className="h-12 px-4 rounded-xl bg-surface-container-low text-on-surface font-semibold border-none outline-none focus:ring-2 focus:ring-primary-container"
                  />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button type="button" onClick={() => setShowAddGuardianForm(false)} className="px-4 py-2 text-sm font-semibold text-outline hover:text-on-surface">Cancelar</button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newGuardianName.trim()) return
                      setGuardians([
                        ...guardians,
                        {
                          id: 'g-' + Date.now(),
                          name: newGuardianName.trim(),
                          email: newGuardianEmail.trim() || 'convidado@exemplo.com',
                          roleLabel: 'Responsável Convidado',
                          vinculo: newGuardianVinculo,
                          avatar: ASSETS.nadiaPhoto,
                          isTitular: false
                        }
                      ])
                      setNewGuardianName('')
                      setNewGuardianEmail('')
                      setShowAddGuardianForm(false)
                    }}
                    className="px-5 py-2.5 rounded-xl bg-primary-container text-white font-bold text-sm shadow-md"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddGuardianForm(true)}
                className="w-full py-4 px-6 rounded-2xl border-2 border-dashed border-outline-variant hover:border-primary-container bg-surface-container-lowest/50 hover:bg-surface-container-lowest text-on-surface-variant hover:text-primary font-semibold text-base flex items-center justify-center gap-2.5 transition-all cursor-pointer"
              >
                <span className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary text-lg font-bold">＋</span>
                <span>Adicionar outro responsável</span>
              </button>
            )}

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="inline-flex items-center text-sm font-semibold text-outline hover:text-on-surface hover:underline cursor-pointer"
              >
                Fazer isso depois ou pular esta etapa
              </button>
            </div>
          </div>
        </main>
      )}

      {/* ── PASSO 5: PIN PARENTAL ───────────────────────────────────── */}
      {currentStep === 5 && (
        <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 w-full max-w-3xl mx-auto my-auto pb-28 sm:pb-32">
          <div className="relative mb-6">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-primary-fixed/60 via-surface-container-low to-secondary-container/30 flex items-center justify-center border border-white shadow-lg shadow-primary/10">
              <span className="material-symbols-outlined text-5xl sm:text-6xl text-primary-container" style={{ fontVariationSettings: '"FILL" 1' }}>lock</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-2xl bg-secondary text-white flex items-center justify-center shadow-md ring-4 ring-background">
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: '"FILL" 1' }}>shield</span>
            </div>
          </div>

          <div className="text-center max-w-md mb-8 sm:mb-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-on-surface tracking-tight mb-2">
              Crie seu PIN parental 🔒
            </h1>
            <p className="text-base sm:text-lg text-on-surface-variant/90">
              Só os responsáveis poderão acessar as configurações.
            </p>
          </div>

          <div className="w-full max-w-lg flex flex-col items-center gap-7">
            <div className="flex flex-col items-center gap-2.5 w-full">
              <span className="text-xs font-bold uppercase tracking-widest text-outline">Digite o PIN (4 dígitos)</span>
              <div className="flex items-center justify-center gap-3 sm:gap-4">
                {[0, 1, 2, 3].map((idx) => (
                  <input
                    key={`m-pin1-${idx}`}
                    ref={pin1Refs[idx]}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={pin1[idx]}
                    onChange={(e) => handlePinInput(1, idx, e.target.value)}
                    onKeyDown={(e) => handlePinKeyDown(1, idx, e)}
                    className="w-14 h-16 sm:w-16 sm:h-20 text-center text-3xl font-extrabold bg-surface-container-lowest text-on-surface rounded-2xl border-2 border-surface-container hover:border-outline-variant focus:border-primary-container focus:ring-4 focus:ring-primary-container/15 focus:outline-none transition-all shadow-sm"
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center gap-2.5 w-full">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-widest text-outline">Confirme seu PIN</span>
                {isPinMatch() && (
                  <span className="material-symbols-outlined text-sm text-secondary">check_circle</span>
                )}
              </div>
              <div className="flex items-center justify-center gap-3 sm:gap-4">
                {[0, 1, 2, 3].map((idx) => (
                  <input
                    key={`m-pin2-${idx}`}
                    ref={pin2Refs[idx]}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={pin2[idx]}
                    onChange={(e) => handlePinInput(2, idx, e.target.value)}
                    onKeyDown={(e) => handlePinKeyDown(2, idx, e)}
                    className="w-14 h-16 sm:w-16 sm:h-20 text-center text-3xl font-extrabold bg-surface-container-lowest text-on-surface rounded-2xl border-2 border-surface-container hover:border-outline-variant focus:border-primary-container focus:ring-4 focus:ring-primary-container/15 focus:outline-none transition-all shadow-sm"
                  />
                ))}
              </div>
            </div>

            {pinError && (
              <div className="h-6 flex items-center justify-center text-xs font-semibold text-error gap-1.5">
                <span className="material-symbols-outlined text-sm">error</span>
                <span>{pinError}</span>
              </div>
            )}
          </div>
        </main>
      )}

      {/* ── PASSO 6: CONCLUÍDO (TUDO PRONTO!) ───────────────────────── */}
      {currentStep === 6 && (
        <main className="w-full flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-8 sm:py-12 max-w-6xl mx-auto z-10">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest shadow-xs text-xs font-semibold text-secondary mb-4 border border-surface-container">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              Tudo preparado com amor
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-on-surface tracking-tight mb-3 sm:mb-4">
              Tudo pronto! <span className="text-secondary inline-block">💚</span>
            </h1>
            <p className="text-base sm:text-xl text-on-surface-variant font-normal leading-relaxed">
              Sua família já pode aproveitar o <span className="font-semibold text-on-surface">Com Deus Kids</span>.
            </p>
          </div>

          <div className="w-full flex flex-wrap justify-center items-stretch gap-4 sm:gap-6 max-w-5xl mx-auto mb-12 sm:mb-16">
            <div className="group relative bg-surface-container-lowest/80 backdrop-blur-md rounded-3xl p-5 sm:p-6 flex flex-col items-center text-center border border-white/60 hover:border-primary-container/40 shadow-sm hover:shadow-xl transition-all w-[165px] sm:w-[185px] lg:w-[195px] shrink-0">
              <div className="relative mb-4">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shadow-md ring-4 ring-white">
                  <img alt={userName} src={ASSETS.celebrationAvatars.alison} className="w-full h-full object-cover" />
                </div>
                <span className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-xl bg-primary-container text-white flex items-center justify-center shadow-md ring-2 ring-white">
                  <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: '"FILL" 1' }}>shield_person</span>
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-on-surface">{userName}</h2>
              <p className="text-xs sm:text-sm text-on-surface-variant font-medium mt-0.5">Pai</p>
              <span className="mt-auto pt-3 px-3 py-1 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-bold tracking-wide uppercase">Admin</span>
            </div>

            <div className="group relative bg-surface-container-lowest/80 backdrop-blur-md rounded-3xl p-5 sm:p-6 flex flex-col items-center text-center border border-white/60 hover:border-secondary/40 shadow-sm hover:shadow-xl transition-all w-[165px] sm:w-[185px] lg:w-[195px] shrink-0">
              <div className="relative mb-4">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shadow-md ring-4 ring-white">
                  <img alt="Nádia" src={ASSETS.celebrationAvatars.nadia} className="w-full h-full object-cover" />
                </div>
                <span className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-xl bg-secondary text-white flex items-center justify-center shadow-md ring-2 ring-white">
                  <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: '"FILL" 1' }}>supervisor_account</span>
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-on-surface">Nádia</h2>
              <p className="text-xs sm:text-sm text-on-surface-variant font-medium mt-0.5">Mãe</p>
              <span className="mt-auto pt-3 px-3 py-1 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-bold tracking-wide uppercase">Admin</span>
            </div>

            {childrenList.map((kid, idx) => (
              <div
                key={kid.id}
                className="group relative bg-surface-container-lowest/80 backdrop-blur-md rounded-3xl p-5 sm:p-6 flex flex-col items-center text-center border border-white/60 hover:border-tertiary/40 shadow-sm hover:shadow-xl transition-all w-[165px] sm:w-[185px] lg:w-[195px] shrink-0"
              >
                <div className="relative mb-4">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shadow-md ring-4 ring-white">
                    <img alt={kid.name} src={kid.avatar} className="w-full h-full object-cover" />
                  </div>
                  <span className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-xl bg-tertiary text-white flex items-center justify-center shadow-md ring-2 ring-white">
                    <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: '"FILL" 1' }}>auto_awesome</span>
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-on-surface">{kid.name}</h2>
                <p className="text-xs sm:text-sm text-on-surface-variant font-medium mt-0.5">{kid.age} anos</p>
                <span className="mt-auto pt-3 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-tertiary-fixed text-on-tertiary-container">
                  {idx === 0 ? 'Kids Explorer' : 'Primeiros Passos'}
                </span>
              </div>
            ))}
          </div>

          <div className="w-full flex flex-col items-center justify-center gap-4 text-center">
            <button
              type="button"
              onClick={handleCompleteOnboarding}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-primary-container to-primary text-on-primary font-bold text-lg sm:text-xl shadow-lg shadow-primary-container/35 hover:shadow-xl hover:scale-[1.02] active:scale-[0.99] transition-all cursor-pointer"
            >
              <span>Entrar no Com Deus Kids</span>
              <span className="material-symbols-outlined text-2xl">arrow_forward</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-on-surface-variant hover:text-on-surface text-sm font-semibold transition-colors rounded-lg hover:bg-surface-container/50 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">tune</span>
              <span>Revisar perfis</span>
            </button>
          </div>
        </main>
      )}

      {/* ── BARRA INFERIOR / RODAPÉ DE NAVEGAÇÃO (SEMPRE FIXO) ─────── */}
      {currentStep >= 2 && currentStep <= 5 && (
        <footer className="fixed bottom-0 left-0 right-0 z-40 w-full border-t border-surface-container/70 bg-surface-container-lowest/90 backdrop-blur-md py-3.5 sm:py-4 px-4 sm:px-6 lg:px-12 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => setCurrentStep((currentStep - 1) as any)}
              className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-semibold text-sm sm:text-base inline-flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg sm:text-xl">arrow_back</span>
              <span>Voltar</span>
            </button>

            {currentStep === 5 ? (
              <button
                type="button"
                onClick={handleConfirmPin}
                disabled={isSavingPin}
                className="h-12 sm:h-14 px-6 sm:px-10 rounded-2xl bg-primary-container text-white font-bold text-base sm:text-lg inline-flex items-center justify-center gap-2 sm:gap-2.5 shadow-lg shadow-primary-container/30 hover:bg-primary transition-all active:scale-98 cursor-pointer disabled:opacity-80"
              >
                {isSavingPin ? (
                  <>
                    <span className="material-symbols-outlined text-lg sm:text-xl animate-spin">sync</span>
                    <span>Salvando PIN...</span>
                  </>
                ) : (
                  <>
                    <span>Criar PIN</span>
                    <span className="material-symbols-outlined text-xl sm:text-2xl">arrow_forward</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentStep((currentStep + 1) as any)}
                className="h-12 sm:h-14 px-6 sm:px-10 rounded-2xl bg-primary-container text-white font-bold text-base sm:text-lg inline-flex items-center justify-center gap-2 sm:gap-2.5 shadow-lg shadow-primary-container/30 hover:bg-primary transition-all active:scale-98 cursor-pointer"
              >
                <span>Continuar</span>
                <span className="material-symbols-outlined text-xl sm:text-2xl">arrow_forward</span>
              </button>
            )}
          </div>
        </footer>
      )}

      {currentStep === 1 && (
        <footer className="w-full py-5 px-8 text-center text-xs text-outline/60 shrink-0">
          <span>Com Deus Kids © Todos os direitos reservados.</span>
        </footer>
      )}
      {currentStep === 6 && (
        <footer className="w-full py-5 text-center text-xs text-outline/80 z-10 shrink-0">
          <span>Ambiente seguro e protegido para sua família • Com Deus Kids © 2025</span>
        </footer>
      )}
    </div>
  )
}
