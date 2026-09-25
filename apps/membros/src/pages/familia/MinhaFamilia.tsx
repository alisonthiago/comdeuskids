import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@comdeuskids/supabase'
import { useAuth } from '../../hooks/useAuth'
import { APP_URLS } from '../../lib/env'

interface ChildProfile {
  id: string
  name: string
  age: number
  avatar_url: string
  status: 'Ativo' | 'Pausa' | '18m rest.'
  today_minutes: string
  is_online?: boolean
}

const DEFAULT_CHILDREN: ChildProfile[] = [
  {
    id: 'joao',
    name: 'João',
    age: 8,
    avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkZTgfnvYGDNv82eEsHkkHd9_V5ryrnoDNFAlZ7oeCHKGIZQ-_zy9w3UP-HSoyz42djisVD22wjTtfUnd5JjS7ibn4QAq8zb95-RrptCNWNWny3qYB0WrLLEWYndZy_p3U7-uKrifRQcIYWtKWptWgRz7OMhw3ShJ9qp2-2c5IFKXtmUB5gJy7gtPdRXdLC-nZiVXOaTZrprd9Oj6I918QXlwhSr21CpDUGlucWdoFudnJZZQ83hyuhw',
    status: 'Ativo',
    today_minutes: '42 min',
    is_online: true
  },
  {
    id: 'maria',
    name: 'Maria',
    age: 6,
    avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtn2rV9d6H6Jc5fMVInuzozNhuOxbOpGoVcbSL_W0fxvXK-FzGsc50NsCz8Y9HTPnRkyzR_cs-A5aHwCGXwyFaYlJ5ReD8p8IRG80FJkRyi79ieim67Hye83qHSalCnxEjJayomT_U16Fvf3KjazIlqAduP460GODjOALTGtrrc6qLklNquY29OYifkFNywcdzMn0EorpJooINhaM95ifDvppkEUleytPHoWTV01w6MgaR2sKA1sHT3A',
    status: 'Pausa',
    today_minutes: '1h 12m',
    is_online: false
  },
  {
    id: 'pedro',
    name: 'Pedro',
    age: 7,
    avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2SN8UU-uTZTpjMM0ms5AfoP6rkLAjATtLv4y0lvPSXFjm5ZzAmT93fdmgqMHvi2BO6UKKLMPdtwvreoQqcVBNPQziixzfXP9E8IQ8_J9fOFaKlQXqV3SRLOQSdtrcnU5EoP0HN-UcudTnXnoZe0w0aGDS9ZSyjx1zC0ISUjO40J6IifMgV8RCQNZ4VKybNmpnFiisr-CnNXGR5J-0aYkoYUFrBEhbdpMu9VWP6KVj0uEVs0hepHBJhw',
    status: '18m rest.',
    today_minutes: '25 min',
    is_online: false
  }
]

interface AvatarOption {
  name: string
  title: string
  img: string
  previewImg?: string
}

const AVATARS: AvatarOption[] = [
  {
    name: 'João',
    title: 'Aventureiro Explorador da Bíblia',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqUv1KSToW0x3ODq2oLPTt_Bss1YooTOR2oY0eocgdx1haROtAP0t_OhlfHbR_2serGiBKEWxQkcdwkDsC62fJ9KuB2vNkz9Iu1pwFrlaVeXloomj9A_o4jDRmWx9XW3juuVyfmeziaVYD4oOTI7EF_mGz6y_lLXBvXnrDpaHyO8gWVSP-e952oQGtkZ30UoYGHGQKsKDqG1J4zGOLFfhLdPjxsXNqEpEwA9ZQwpy3dAKQaJdxbSCB8A',
    previewImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-D2uGlrV7Qp_g5D_AwF-UhT1hBhG2oNROKAhR2rulZR2LoYOhr5OQPzQ-zIwjWkjR30OuuGJqBTqus74YEE6avmY4yRxA2U4g-U8fmq72yPoXerGJrXQK--B6tfvZuF0y3dkFpDg4proiL3do0wjmp76sjDH7V78HSPJiCO4U_A-npGxxXV_EmoCEISWSwOZzdCThURHfzu1uBxlV9AP2O0adRcbBu3lh6l1LO68TUtsNDx9mChpy4Q'
  },
  {
    name: 'Valentina',
    title: 'Mensageira da Paz',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCmLXwjvUlSJLQlyQ2IUUwuzOnNYORY2xDHqsO784yu2E9AAqFEyZQvW8xM-08we-BN7z0hQdR9TzLsbnuEsiUm9ZclBV6UFZ6iCQtG2-Gnmmmscr2Hbtz-u2kQavojNeOFL1o8_meAHU7bqUy-mVDIg_FcQSpIHCgQtYS6XWGJbgw0PMzXnjReFdXr1YR3t5_C9ivNuoCv9cqz7OKYzAGLjtxi2oskrlB3ARLDyaHwUe7HOAzo-DZMMQ'
  },
  {
    name: 'Noé',
    title: 'Protetor da Criação',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAOFST_lpz0zHa2V1ocO-FtnJ0ZfBPi-OpdhOBY3Mr2NahyZOA2qXfzETH3L8R7sFP4YFZeplN3nane4WIY65-79E3gNPQ37Bid0mZiFTTqvljqw5DtP-whVHKE0O5G7QhvO1g7E0cjPaEff3barAHBbaQ1oYhvz7UbREU0M47iHnFoHCTaor3mF7ZQGcpRvVDe2n5hAqtGvJPdXpbGy0PYukw1Dn8qp3I3llMofoPP1HdbPbqQfz2U2A'
  },
  {
    name: 'Sara',
    title: 'Pequena Cantora dos Salmos',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDaQGMCDcw_UV5mydmjy1zotUPx3f_X75EdTc5Klb9Y9lfdKmk9PIBA7urabSRBiKBmkJ0vQ5xIEMZjyGkFgnu6HnfyvBP9SJfaaFiTf8_IGP-3ttugKs6Mc0TIkhU7bNlZKGIILtUa9TRNaf2j1kJJoRVkCZVtDDo5n3AmnsAZ2by97sKLUCipLhTUaJ6lgTFql7Q0ykjIs-1ftk4j5aUpygYq3Ej1oSbdC7-LA3s4_D3myC7lrTcSrA'
  },
  {
    name: 'Peixinho',
    title: 'Navegador da Esperança',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGMYKw9KrGpifuWTeeb-3mSXfq-kwpt1Loi_JfRJaUrKHKpWRh90Ky5ZK04M2svAHBnM0ZetCf-kJXtitjUS5ZWXWogz0zktERjBbPeOmy_SHb8Y2Qxdu05CBJbjYTv78QBdODsLIrf6MK0dIMXvYr20WqO6ZE5hufmhbYD-psohUeQHaJeUe3uYx9jCuR176Mbq17AI3LX6jiNSJHo1_Rd8gfbQmSmjcMNs8650csYNvajTq7NNwfEQ'
  },
  {
    name: 'Ovelha',
    title: 'Cordeirinho do Bom Pastor',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDdVtZ4jTgmH7CuFSCiyDZtgxCglieIXUwaZMUtzdoN60Y23hiJ-ZrdM8Fs_uRl66GlxMIuOYgex6025uyYei2993mmE3NjST6n6_sUqPMj9OwMShArB2V2wH1rl8bd2PF0S5hwQBgw0L4NIwQ14kgXNwGofHqdPpswPlxMi0fpDXdoldZRqZPW6ya9QG_FyfwgSKooivi6PoDvTTdnGRu6A9OTtLmSsVoYKrb1fvBit6XaxNEBBxBp3w'
  }
]

const AGES = [3, 4, 5, 6, 7, 8, 9, 10]

function formatMinutes(minVal: number) {
  const h = Math.floor(minVal / 60)
  const m = minVal % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function MinhaFamilia() {
  const { user } = useAuth()
  const [children, setChildren] = useState<ChildProfile[]>(DEFAULT_CHILDREN)
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [selectedKid, setSelectedKid] = useState<ChildProfile>(DEFAULT_CHILDREN[0])

  // Estados do Modal de Novo Perfil (Design Stitch)
  const [newKidName, setNewKidName] = useState('João')
  const [newKidAge, setNewKidAge] = useState(8)
  const [newKidLimit, setNewKidLimit] = useState(90)
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarOption>(AVATARS[0])
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success'>('idle')

  const userName = user?.user_metadata?.full_name?.split(' ')[0] || user?.user_metadata?.name?.split(' ')[0] || 'Alison'

  // Carregar perfis reais do Supabase sem quebrar layout
  useEffect(() => {
    async function loadRealProfiles() {
      if (!user) return
      const { data } = await supabase
        .from('account_profiles')
        .select('*')
        .eq('account_id', user.id)
        .eq('role', 'child')

      if (data && data.length > 0) {
        const merged: ChildProfile[] = data.map((p, idx) => ({
          id: p.id,
          name: p.name,
          age: p.birth_date ? new Date().getFullYear() - new Date(p.birth_date).getFullYear() : 7 + idx,
          avatar_url: p.avatar_url || DEFAULT_CHILDREN[idx % DEFAULT_CHILDREN.length].avatar_url,
          status: p.temp_pause_until && new Date(p.temp_pause_until) > new Date() ? 'Pausa' : 'Ativo',
          today_minutes: `${p.daily_limit_minutes ? Math.round(p.daily_limit_minutes * 0.7) : 40} min`,
          is_online: idx === 0
        }))
        setChildren(merged)
        setSelectedKid(merged[0])
      }
    }
    loadRealProfiles()
  }, [user])

  const handleSelectAvatar = (av: AvatarOption) => {
    setSelectedAvatar(av)
    // Se o nome atual for o padrão ou o nome de algum dos avatares, sincroniza automaticamente
    if (!newKidName.trim() || AVATARS.some(a => a.name.toLowerCase() === newKidName.trim().toLowerCase())) {
      setNewKidName(av.name)
    }
  }

  // Salvar novo perfil no Supabase
  const handleCreateProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (submitStatus !== 'idle') return

    setSubmitStatus('loading')
    const finalName = newKidName.trim() || selectedAvatar.name
    const finalAvatar = selectedAvatar.previewImg || selectedAvatar.img

    const payload = {
      account_id: user?.id,
      name: finalName,
      role: 'child',
      daily_limit_minutes: newKidLimit,
      educational_mode: true,
      avatar_url: finalAvatar
    }

    try {
      if (user) {
        await supabase.from('account_profiles').insert(payload)
      }
      const newChild: ChildProfile = {
        id: 'new-' + Date.now(),
        name: finalName,
        age: newKidAge,
        avatar_url: finalAvatar,
        status: 'Ativo',
        today_minutes: '0 min',
        is_online: false
      }
      setChildren(prev => [...prev, newChild])
      setSubmitStatus('success')
      setTimeout(() => {
        setSubmitStatus('idle')
        setActiveModal(null)
        setNewKidName('João')
        setSelectedAvatar(AVATARS[0])
        setNewKidAge(8)
        setNewKidLimit(90)
      }, 1500)
    } catch (err) {
      console.error('Erro ao cadastrar perfil:', err)
      setSubmitStatus('idle')
    }
  }

  return (
    <div className="flex flex-col w-full max-w-[1440px] mx-auto gap-8 sm:gap-10">
      {/* Destaque principal da experiência Família, inspirado na home do Play. */}
      <section className="relative min-h-[300px] overflow-hidden rounded-3xl border border-outline-variant/40 bg-on-surface shadow-sm sm:min-h-[360px] lg:min-h-[390px]" aria-label="Conteúdo em destaque">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8ZmXEkwojYeal_x-PgWjMMMAE7ui-j-io-UucdCn4uG1yEWmr6ETYELQrBnpEkxjPNWbB1Ep74Ds9qHlQsM_GSJ6MB1qFmpkqOUtHaqgduJfylmhzz34Ghf2BSeGVtbeK9pNLVWqg6MaNY8HuGay9V7subLoyuyyHQAXrK3YYmOl20WaSgo8NNRMLYC6oMe4HTr8N7MVOxrK_YgTHy4rWqqDa-ZtP0LYSa0uktbWOO-ZSAoqAsnD_3g"
          alt="A Arca de Noé"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="relative flex min-h-[300px] max-w-2xl flex-col items-start justify-end gap-4 p-6 text-white sm:min-h-[360px] sm:p-10 lg:min-h-[390px] lg:p-12">
          <p className="text-sm font-medium text-white/90">Boa noite, {userName} 👋</p>
          <span className="rounded-full border border-white/30 bg-black/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">Em destaque</span>
          <div>
            <h2 className="max-w-xl text-3xl font-bold tracking-tight sm:text-5xl">A Arca de Noé</h2>
            <p className="mt-2 max-w-lg text-sm text-white/90 sm:text-base">Uma história de coragem, obediência e confiança em Deus para assistir em família.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => setActiveModal('modal-conteudo')} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white transition hover:brightness-95">
              <span className="material-symbols-outlined text-[20px]">play_arrow</span>Assistir agora
            </button>
            <button type="button" onClick={() => setActiveModal('modal-conteudo')} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/50 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20">
              <span className="material-symbols-outlined text-[20px]">add</span>Ver detalhes
            </button>
          </div>
        </div>
      </section>

      {/* ── 2. Bento Grid dos Filhos ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12 xl:gap-5">
      <div id="perfis" className="scroll-mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 xl:col-span-8">
        {children.map((child, idx) => {
          const isAtivo = child.status === 'Ativo'
          const isPausa = child.status === 'Pausa'

          return (
            <div
              key={child.id}
              onClick={() => {
                setSelectedKid(child)
                setActiveModal('modal-acoes')
              }}
              title={`Clique para ver detalhes de ${child.name}`}
              className={`bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-surface-container-high/60 relative cursor-pointer transition-all hover:shadow-md group flex flex-col justify-between min-h-[150px] ${
                idx === 0 ? 'ring-2 ring-primary-container/40' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-primary-fixed flex items-center justify-center shadow-sm">
                    <img
                      className="w-full h-full object-cover"
                      alt={child.name}
                      src={child.avatar_url}
                    />
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full font-label-sm text-xs font-semibold ${
                    isAtivo
                      ? 'bg-primary-fixed/50 text-primary'
                      : isPausa
                      ? 'bg-surface-container-high text-on-surface-variant font-normal'
                      : 'bg-primary-fixed/50 text-on-primary-fixed-variant'
                  }`}
                >
                  {child.status}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="font-headline-md text-base sm:text-headline-md text-on-surface font-semibold tracking-tight">
                  {child.name}
                </span>
                <span className="font-caption text-caption text-outline mb-3">{child.age} anos</span>
                <div className="flex items-center justify-between pt-3 border-t border-surface-container/60">
                  <span className="font-label-sm text-xs text-on-surface-variant">Hoje</span>
                  <span className={`font-label-md text-sm ${idx === 0 ? 'font-bold text-primary' : 'font-medium text-on-surface'}`}>
                    {child.today_minutes}
                  </span>
                </div>
              </div>
            </div>
          )
        })}

        {/* Card: Novo Perfil */}
        <button
          type="button"
          onClick={() => setActiveModal('modal-novo-perfil')}
          className="bg-surface-container-lowest/60 hover:bg-surface-container-lowest p-4 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all group border border-dashed border-outline-variant/60 hover:border-primary min-h-[150px]"
        >
          <div
            className="w-16 h-16 rounded-full group-hover:bg-primary-fixed flex items-center justify-center text-outline group-hover:text-primary transition-all mb-2 shrink-0"
            style={{ backgroundColor: 'rgb(244, 244, 244)' }}
          >
            <span className="material-symbols-outlined text-[24px]">add</span>
          </div>
          <span className="font-label-md text-sm font-semibold text-on-surface">Novo Perfil</span>
          <span className="font-caption text-caption text-outline mt-0.5">Adicionar</span>
        </button>
      </div>

      <div className="flex flex-col justify-center gap-4 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm xl:col-span-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary-fixed/60 text-primary"><span className="material-symbols-outlined text-3xl">schedule</span></div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-on-surface-variant">Tempo de hoje</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-on-surface">42 min</p>
          </div>
          <button type="button" onClick={() => setActiveModal('modal-limites')} className="text-on-surface-variant" aria-label="Ver limites de tempo"><span className="material-symbols-outlined">chevron_right</span></button>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-surface-container-highest"><div className="h-full rounded-full bg-primary" style={{ width: '70%' }} /></div>
        <div className="flex items-center justify-between text-xs text-on-surface-variant"><span>18 min restantes</span><span>Limite diário: 1h</span></div>
      </div>
      </div>

      {/* ── 3. Split Grid (Em Reprodução + Histórico & Tempo + Juntos) ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Coluna Esquerda (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          {/* Card: Em Reprodução */}
          <div className="bg-surface-container-lowest p-6 sm:p-7 rounded-2xl shadow-sm border border-surface-container-high/60 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
                <span className="font-caption text-caption uppercase tracking-wider text-outline font-semibold">
                  Em reprodução
                </span>
              </div>
              <span className="font-caption text-caption text-outline">Pausado há 4 min</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div
                className="relative w-full sm:w-80 h-48 sm:h-44 rounded-2xl overflow-hidden shrink-0 shadow-md group cursor-pointer"
                onClick={() => setActiveModal('modal-conteudo')}
              >
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  alt="A Arca de Noé"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8ZmXEkwojYeal_x-PgWjMMMAE7ui-j-io-UucdCn4uG1yEWmr6ETYELQrBnpEkxjPNWbB1Ep74Ds9qHlQsM_GSJ6MB1qFmpkqOUtHaqgduJfylmhzz34Ghf2BSeGVtbeK9pNLVWqg6MaNY8HuGay9V7subLoyuyyHQAXrK3YYmOl20WaSgo8NNRMLYC6oMe4HTr8N7MVOxrK_YgTHy4rWqqDa-ZtP0LYSa0uktbWOO-ZSAoqAsnD_3g"
                />
                <div className="absolute inset-0 bg-on-background/20 flex items-center justify-center backdrop-blur-[1px]">
                  <div className="w-14 h-14 rounded-full bg-surface-container-lowest text-primary flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[32px]">play_arrow</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col flex-1 justify-between gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-headline-md text-base sm:text-headline-md text-on-surface font-semibold">
                      A Arca de Noé
                    </h3>
                    <p className="font-caption text-caption text-outline">Episódio 4 • Lição de Fé</p>
                  </div>
                  <span className="font-label-md text-sm font-bold text-primary">64%</span>
                </div>

                <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-primary-container rounded-full" style={{ width: '64%' }}></div>
                </div>

                <div className="flex items-center justify-between text-caption font-caption text-outline">
                  <span>18 min assistidos</span>
                  <button
                    type="button"
                    onClick={() => setActiveModal('modal-conteudo')}
                    className="font-label-sm text-xs font-semibold text-primary hover:underline min-h-[44px] inline-flex items-center cursor-pointer"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Histórico de Hoje */}
          <div className="bg-surface-container-lowest p-6 sm:p-7 rounded-2xl shadow-sm border border-surface-container-high/60 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <span className="font-headline-md text-base sm:text-headline-md text-on-surface font-semibold">
                Histórico de Hoje
              </span>
              <span className="font-caption text-caption text-outline">Sábado, 28 Out</span>
            </div>

            <div className="flex flex-col divide-y divide-surface-container/60">
              <div className="flex items-center justify-between py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary-fixed/50 text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]">movie</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-sm text-on-surface font-medium">A Arca de Noé</span>
                    <span className="font-caption text-xs text-outline">Vídeo bíblico</span>
                  </div>
                </div>
                <span className="font-label-sm text-xs font-semibold text-on-surface-variant">18 min</span>
              </div>

              <div className="flex items-center justify-between py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary-fixed/50 text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]">quiz</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-sm text-on-surface font-medium">Quiz de Noé</span>
                    <span className="font-caption text-xs text-outline">Compreensão</span>
                  </div>
                </div>
                <span className="font-label-sm text-xs font-semibold text-primary">8/10 acertos</span>
              </div>

              <div className="flex items-center justify-between py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary-fixed/50 text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]">extension</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-sm text-on-surface font-medium">Jogo da Memória</span>
                    <span className="font-caption text-xs text-outline">Animais da Arca</span>
                  </div>
                </div>
                <span className="font-label-sm text-xs font-semibold text-on-surface-variant">12 min</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Link
                to="/familia/controles"
                className="font-label-sm text-xs font-semibold text-primary hover:text-on-primary-fixed-variant flex items-center gap-1 transition-colors min-h-[44px]"
              >
                Ver histórico completo <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Coluna Direita (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          {/* Card: Para Fazer Juntos */}
          <div className="bg-surface-container-lowest p-6 sm:p-7 rounded-2xl shadow-sm border border-surface-container-high/60 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="font-headline-md text-base sm:text-headline-md text-on-surface font-semibold">
                  Para fazer juntos
                </span>
                <span className="text-primary-container">❤️</span>
              </div>
              <span className="font-caption text-xs text-outline">Recomendado</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 shadow-md">
                <img
                  className="w-full h-full object-cover"
                  alt="O Bom Samaritano"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBOP7GTxHd6FA5QVOH-ZN47b_GVvCme3GlGxquZ5It5dvUdOFo6RyGqI2Al3Db5Dzl6TFWrK13FQcr7Muvv3O0Ex5VfKDSgdWxK1ON6RE8MsxDTu75HegIr-vmvseff_2q787OyT3Q6n--Sd05zBUOfzbIcj9G08Q-4MhY_rCYmjISTHN4eB-fPpKxKJOiwe72bxh1JHnsA62A3h1q3_LBdYuJs0MHnrPpzz-rurAfoZmINPVaU89g61g"
                />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-label-md text-sm font-semibold text-on-surface truncate">
                  O Bom Samaritano
                </span>
                <span className="font-caption text-xs text-outline">Interativa • 8 min</span>
                <span className="font-caption text-xs text-primary font-medium mt-0.5">
                  Guia para pais incluso
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveModal('modal-conteudo')}
              className="w-full h-12 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-label-md text-sm font-semibold shadow-[0_2px_10px_rgba(255,107,53,0.2)] flex items-center justify-center gap-2 transition-all min-h-[48px] cursor-pointer"
            >
              Iniciar juntos <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 4. Continuar Assistindo ────────────────────────────────────────── */}
      <div className="flex flex-col gap-6 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <h2 className="font-headline-lg text-lg sm:text-headline-lg text-on-surface font-semibold tracking-tight">
              Continuar assistindo
            </h2>
            <span className="hidden sm:inline font-caption text-caption text-outline">Progresso semanal</span>
          </div>
          <Link
            to="/familia/controles"
            className="font-label-sm text-xs sm:text-label-sm font-semibold text-primary hover:text-on-primary-fixed-variant transition-colors flex items-center gap-1 min-h-[44px]"
          >
            Ver catálogo <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* Card 1: A Arca de Noé */}
          <div
            onClick={() => setActiveModal('modal-conteudo')}
            className="overflow-hidden rounded-2xl border border-outline-variant/50 bg-surface-container-lowest shadow-sm transition hover:shadow-md group cursor-pointer"
          >
            <div className="relative w-full h-44 overflow-hidden">
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                alt="A Arca de Noé"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMz_oqsafcyRAaMePr6HkRy1pfcHD2S0Y8xtxbacBlgjWm0cXxqP-o44XoBpHUP3RJbHliSREx5pLnL_fhzuHU-tF0-Hp3xA6uZyHH3xDWnkzoB_922-sgXyQRMepYvAXZoC65ZcFEgF6m6vvIpZNroXkhfSifubnmbDkZwiM2V0WoQpNZ2K4Zo0Relscw1_uzWaebiXmURuvEsg3-oFxuXGhaaXPH3vP5QqPvDhnwEEjQufj7vWsI7w"
              />
              <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-full bg-on-background/70 backdrop-blur-md text-surface font-caption text-xs font-semibold">
                64% concluído
              </div>
            </div>
            <div className="flex flex-col gap-1 px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="font-headline-md text-sm sm:text-headline-md font-semibold text-on-surface group-hover:text-primary transition-colors truncate">
                  A Arca de Noé
                </span>
                <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-[20px]">
                  play_circle
                </span>
              </div>
              <div className="flex items-center justify-between text-outline font-caption text-xs pt-1">
                <span>Episódio 4</span>
                <span>8 min rest.</span>
              </div>
            </div>
          </div>

          {/* Card 2: Jonas e o Peixe */}
          <div
            onClick={() => setActiveModal('modal-conteudo')}
            className="overflow-hidden rounded-2xl border border-outline-variant/50 bg-surface-container-lowest shadow-sm transition hover:shadow-md group cursor-pointer"
          >
            <div className="relative w-full h-44 overflow-hidden">
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                alt="Jonas e o Peixe"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXiFEMec6CCr-BYlikvXBKGUVlTHVt--dlD30crWdRxdsmwHMTwSaAMCQarVP7We_-FeDsaHvczN_u5Sp-g1amFzcr_VeuPfGCCc871jd9bR4Su1GUJTuYrUIJykj85jNO8rLxcyn8_HVq3gn-eX6Mox8Kmsixa-pEM4KgutRzMjXI2xm5t2Yx0QXvRy-sJ5Rkd9bWKkffyRCiinZDLR_qn8xx7ReNTgCS37iZQT-TlrQWOHLcY0ZINQ"
              />
              <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-full bg-on-background/70 backdrop-blur-md text-surface font-caption text-xs font-semibold">
                32% concluído
              </div>
            </div>
            <div className="flex flex-col gap-1 px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="font-headline-md text-sm sm:text-headline-md font-semibold text-on-surface group-hover:text-primary transition-colors truncate">
                  Jonas e o Peixe
                </span>
                <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-[20px]">
                  play_circle
                </span>
              </div>
              <div className="flex items-center justify-between text-outline font-caption text-xs pt-1">
                <span>Episódio 2</span>
                <span>14 min rest.</span>
              </div>
            </div>
          </div>

          {/* Card 3: O Bom Samaritano */}
          <div
            onClick={() => setActiveModal('modal-conteudo')}
            className="overflow-hidden rounded-2xl border border-outline-variant/50 bg-surface-container-lowest shadow-sm transition hover:shadow-md group cursor-pointer"
          >
            <div className="relative w-full h-44 overflow-hidden">
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                alt="O Bom Samaritano"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPc44x3RjnH9vVxBJbGMKCg4oRiPiw_C9oHjA7Kh47uFowHpK_n6uR0U6os5NCx5xu11IKQ00qpourXm1xD9zfECKvQfGr9fb6-b9vq8Gk-kbHlpoWEHCMsW-oNl53SSFtcvX52pEkELpmHHjmXO55RCOYcAU0An8C6mYuVPZ7hTUqCPLI9KjC28nFM2uohFbO6vO3Gh2NVeVRnlIUqMTfEBQhJHRB75NLHaoxeUMW3SITiJwLI86xYg"
              />
              <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-full bg-primary-container text-on-primary font-caption text-xs font-semibold">
                Novo
              </div>
            </div>
            <div className="flex flex-col gap-1 px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="font-headline-md text-sm sm:text-headline-md font-semibold text-on-surface group-hover:text-primary transition-colors truncate">
                  O Bom Samaritano
                </span>
                <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-[20px]">
                  play_circle
                </span>
              </div>
              <div className="flex items-center justify-between text-outline font-caption text-xs pt-1">
                <span>História Interativa</span>
                <span>Começar</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="flex flex-col gap-4" aria-labelledby="familia-categorias">
        <div className="flex items-center justify-between">
          <h2 id="familia-categorias" className="font-headline-lg text-lg font-semibold tracking-tight text-on-surface">Explorar por categoria</h2>
          <a href={APP_URLS.play} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-primary">Ver todas <span className="material-symbols-outlined text-base">chevron_right</span></a>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {[
            ['movie', 'Desenhos'], ['menu_book', 'Histórias Bíblicas'], ['music_note', 'Músicas'],
            ['extension', 'Atividades'], ['description', 'Para Imprimir'], ['star', 'Novidades']
          ].map(([icon, label]) => (
            <a key={label} href={APP_URLS.play} target="_blank" rel="noopener noreferrer" className="flex min-h-[76px] items-center gap-3 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest px-4 py-3 text-sm font-semibold text-on-surface transition hover:border-primary/40 hover:shadow-sm">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-fixed/50 text-primary"><span className="material-symbols-outlined">{icon}</span></span>
              {label}
            </a>
          ))}
        </div>
      </section>

      {/* ── MODAL NOVO PERFIL: TELA COMPLETA (DESIGN STITCH) ──────────────── */}
      {activeModal === 'modal-novo-perfil' && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-surface font-body-md text-on-surface antialiased animate-in fade-in duration-200">
          <main className="min-h-screen w-full flex items-center justify-center p-space-md py-6 sm:py-10">
            <div className="flex flex-col w-full max-w-6xl mx-auto px-space-md py-space-md sm:py-space-xl">
              {/* Progress Header Badge */}
              <div className="flex items-center justify-between w-full mb-space-lg">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="inline-flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors py-2 px-3 rounded-xl hover:bg-surface-container cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                  <span className="font-label-md text-label-md">Voltar ao início</span>
                </button>
                <div className="inline-flex items-center gap-2 bg-surface-container-high px-4 py-1.5 rounded-full shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Passo 2 de 4: Criando o perfil do seu filho</span>
                </div>
                <div className="w-24"></div>
              </div>

              {/* Hero Header Section */}
              <div className="text-center max-w-2xl mx-auto mb-space-xl">
                <h1 className="font-display text-2xl sm:text-3xl md:text-display text-on-surface tracking-tight mb-2 flex items-center justify-center gap-2 font-bold">
                  Bem-vindo ao Com Deus Kids!
                  <span className="inline-block hover:rotate-12 transition-transform duration-300">👋</span>
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                  Vamos preparar o cantinho digital seguro e abençoado para o seu filho em menos de 1 minuto.
                </p>
              </div>

              {/* Dual Column Interactive Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg items-start">
                {/* Left Column: Form & Personalization Controls */}
                <div className="lg:col-span-7 bg-surface-container-lowest rounded-[28px] p-space-xl shadow-sm flex flex-col gap-space-lg">
                  {/* Child Name Input Block */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-headline-md text-headline-md text-on-surface" htmlFor="child-name">Nome da Criança</label>
                      <span className="font-caption text-caption text-on-surface-variant">Como vamos chamá-lo?</span>
                    </div>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-4 text-on-surface-variant text-[22px]">face</span>
                      <input
                        id="child-name"
                        type="text"
                        value={newKidName}
                        onChange={e => setNewKidName(e.target.value)}
                        placeholder="Digite o nome da criança"
                        className="w-full h-12 pl-12 pr-4 bg-surface-container-low text-on-surface font-body-md text-body-md rounded-xl focus:outline-none focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_#ff6b35] transition-all"
                      />
                    </div>
                  </div>

                  {/* Age Picker Block */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label className="font-headline-md text-headline-md text-on-surface">Idade</label>
                      <span className="font-label-sm text-label-sm text-primary font-semibold bg-primary-fixed/40 px-2.5 py-0.5 rounded-full" id="age-adaptation-badge">
                        Conteúdo adaptado para {newKidAge === 10 ? '10+ anos' : `${newKidAge} anos`}
                      </span>
                    </div>
                    <div className="grid grid-cols-8 gap-2" id="age-selector">
                      {AGES.map(age => (
                        <button
                          key={age}
                          type="button"
                          onClick={() => setNewKidAge(age)}
                          className={`age-btn h-12 rounded-xl font-label-md text-label-md flex items-center justify-center transition-all cursor-pointer ${
                            newKidAge === age
                              ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                              : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                          }`}
                          data-age={age}
                        >
                          {age === 10 ? '10+' : age}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Avatar Picker Block */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label className="font-headline-md text-headline-md text-on-surface">Escolha o Avatar</label>
                      <span className="font-caption text-caption text-primary font-semibold bg-primary-fixed/50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                        6 personagens bíblicos &amp; amigos
                      </span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 pt-1" id="avatar-selector">
                      {AVATARS.map(av => {
                        const isSelected = selectedAvatar.name === av.name
                        return (
                          <button
                            key={av.name}
                            type="button"
                            onClick={() => handleSelectAvatar(av)}
                            data-avatar-name={av.name}
                            data-avatar-title={av.title}
                            className={`avatar-option flex flex-col items-center gap-1.5 p-2 rounded-2xl relative group transition-all transform hover:-translate-y-0.5 cursor-pointer ${
                              isSelected
                                ? 'bg-surface-container-low/60 shadow-sm'
                                : 'hover:bg-surface-container-low'
                            }`}
                          >
                            <div className="relative w-14 h-14 rounded-full overflow-hidden shadow-inner">
                              <img className="w-full h-full object-cover avatar-img" alt={av.name} src={av.img} />
                              {isSelected && (
                                <div className="avatar-badge absolute -top-1 -right-1 w-5 h-5 bg-primary-container text-on-primary rounded-full flex items-center justify-center shadow-sm">
                                  <span className="material-symbols-outlined text-[12px] font-bold">check</span>
                                </div>
                              )}
                            </div>
                            <span className={`font-label-sm text-label-sm text-center truncate w-full ${
                              isSelected ? 'text-on-surface font-semibold' : 'text-on-surface-variant font-medium'
                            }`}>
                              {av.name}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Healthy Daily Screen Limit Block */}
                  <div className="bg-surface-container-low/70 rounded-2xl p-space-md flex flex-col gap-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary-container text-[20px]">timelapse</span>
                        <span className="font-headline-md text-headline-md text-on-surface text-[17px]">Limite Diário Saudável</span>
                      </div>
                      <span className="font-label-sm text-label-sm font-semibold text-white bg-primary px-3 py-1 rounded-full" id="limit-badge-indicator">
                        Recomendado para {newKidAge === 10 ? '10+ anos' : `${newKidAge} anos`}: {formatMinutes(newKidLimit)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 pt-2">
                      <span className="font-caption text-caption text-on-surface-variant font-medium min-w-8">45m</span>
                      <div className="relative flex-1 flex items-center">
                        <input
                          id="time-range-slider"
                          type="range"
                          min="30"
                          max="180"
                          step="15"
                          value={newKidLimit}
                          onChange={e => setNewKidLimit(parseInt(e.target.value, 10))}
                          className="w-full h-2 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-[#ff6b35]"
                        />
                      </div>
                      <div className="flex items-baseline gap-1 text-right min-w-20 justify-end">
                        <span className="font-headline-lg text-headline-lg text-primary-container font-bold" id="time-display-val">
                          {formatMinutes(newKidLimit)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-on-surface-variant font-caption text-caption pt-1">
                      <span className="material-symbols-outlined text-[16px] text-primary">verified_user</span>
                      <span>Você poderá alterar esses limites ou pausar o acesso a qualquer momento nas configurações.</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Live Interactive Profile Preview */}
                <div className="lg:col-span-5 flex flex-col gap-space-md">
                  {/* Preview Card */}
                  <div className="bg-surface-container-lowest rounded-[32px] p-space-lg shadow-md flex flex-col relative overflow-hidden">
                    {/* Top Status Bar in Card */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="inline-flex items-center gap-1.5 bg-primary-fixed/50 px-3 py-1 rounded-full">
                        <span className="material-symbols-outlined text-primary text-[16px]">check_circle</span>
                        <span className="font-label-sm text-label-sm text-primary font-semibold">Pronto para brincar</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-primary-fixed/40 flex items-center justify-center text-primary-container">
                        <span className="material-symbols-outlined text-[18px]">verified</span>
                      </div>
                    </div>

                    {/* Child Large Avatar and Titles */}
                    <div className="flex flex-col items-center text-center mt-2 mb-space-md">
                      <div className="relative w-28 h-28 mb-3">
                        <div className="w-28 h-28 rounded-full overflow-hidden shadow-md ring-4 ring-primary-container/20">
                          <img
                            id="preview-avatar-img"
                            className="w-full h-full object-cover"
                            alt={selectedAvatar.name}
                            src={selectedAvatar.previewImg || selectedAvatar.img}
                          />
                        </div>
                        <div className="absolute -bottom-1 right-1 w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-md">
                          <span className="material-symbols-outlined text-[18px]">star</span>
                        </div>
                      </div>
                      <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold" id="preview-name">
                        {newKidName.trim() || 'Seu Filho'}
                      </h2>
                      <p className="font-body-md text-body-md text-on-surface-variant font-medium mt-0.5" id="preview-badge-role">
                        {selectedAvatar.title}
                      </p>
                    </div>

                    {/* Mini Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-space-md">
                      <div className="bg-surface-container-low/70 rounded-2xl p-3 flex flex-col gap-1">
                        <span className="font-caption text-caption text-on-surface-variant">Tempo Seguro</span>
                        <div className="flex items-baseline gap-1">
                          <span className="font-headline-md text-headline-md font-bold text-on-surface" id="preview-time-stat">
                            {formatMinutes(newKidLimit)}
                          </span>
                          <span className="font-caption text-caption text-on-surface-variant">/ dia</span>
                        </div>
                      </div>
                      <div className="bg-surface-container-low/70 rounded-2xl p-3 flex flex-col gap-1">
                        <span className="font-caption text-caption text-on-surface-variant">Filtro de Fé</span>
                        <div className="flex items-baseline gap-1">
                          <span className="font-headline-md text-headline-md font-bold text-primary">100%</span>
                          <span className="font-caption text-caption text-primary font-medium">Curado</span>
                        </div>
                      </div>
                    </div>

                    {/* Faith Safe Guarantee Note */}
                    <div className="bg-primary-fixed/20 rounded-2xl p-3.5 mb-space-lg flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-primary-container text-[20px] mt-0.5">volunteer_activism</span>
                      <p className="font-body-md text-body-md text-on-surface-variant leading-snug">
                        Perfil oficial pronto para brincar e aprender valores que duram para sempre.
                      </p>
                    </div>

                    {/* Main Action CTA */}
                    <button
                      id="submit-profile-btn"
                      type="button"
                      disabled={submitStatus !== 'idle'}
                      onClick={() => handleCreateProfile()}
                      className={`w-full h-14 text-on-primary font-headline-md text-headline-md font-bold rounded-2xl flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] cursor-pointer ${
                        submitStatus === 'success'
                          ? 'bg-primary'
                          : 'bg-primary-container hover:bg-[#ff8a3d] shadow-[0_4px_16px_rgba(255,107,53,0.28)]'
                      }`}
                    >
                      {submitStatus === 'loading' ? (
                        <>
                          <span className="inline-block animate-spin mr-2">
                            <span className="material-symbols-outlined text-[20px]">progress_activity</span>
                          </span>
                          <span>Configurando o cantinho...</span>
                        </>
                      ) : submitStatus === 'success' ? (
                        <>
                          <span className="material-symbols-outlined text-[22px] text-white">check_circle</span>
                          <span>Perfil Criado com Sucesso!</span>
                        </>
                      ) : (
                        <>
                          <span>Criar Perfil e Entrar no Com Deus Kids</span>
                          <span className="material-symbols-outlined text-[22px]">arrow_forward</span>
                        </>
                      )}
                    </button>

                    {/* Footnote text */}
                    <p className="text-center font-caption text-caption text-on-surface-variant mt-3">
                      Você poderá adicionar outros filhos após o primeiro acesso.
                    </p>
                  </div>

                  {/* Parental Control Badge Card */}
                  <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-fixed/50 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[22px]">shield</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-md text-label-md text-on-surface font-semibold">Controle Parental Ativo</span>
                        <span className="font-caption text-caption text-on-surface-variant">Sem anúncios, sem compras acidentais.</span>
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed">
                      <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      )}

      {/* ── MODAL 2: AÇÕES RÁPIDAS DA CRIANÇA (JOÃO / SELECIONADA) ─────────── */}
      {activeModal === 'modal-acoes' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-on-background/40 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
          <div className="relative bg-surface-container-lowest rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-surface-container-high z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-primary-fixed shadow-md shrink-0">
                <img className="w-full h-full object-cover" alt={selectedKid.name} src={selectedKid.avatar_url} />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-headline-md text-xl font-bold text-on-surface truncate">{selectedKid.name}</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed/50 text-primary font-label-sm text-xs font-semibold">
                    {selectedKid.status}
                  </span>
                </div>
                <span className="font-caption text-xs text-outline">{selectedKid.age} anos • {selectedKid.today_minutes} hoje</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 mb-6">
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null)
                  alert(`Pausa temporária de 1 hora aplicada para ${selectedKid.name}!`)
                }}
                className="w-full p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container flex items-center justify-between text-on-surface font-label-md text-sm font-semibold transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px] text-primary">pause_circle</span>
                  <span>Pausar por 1 hora</span>
                </div>
                <span className="material-symbols-outlined text-[18px] text-outline">chevron_right</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveModal(null)
                  alert(`+30 minutos de tempo liberados para ${selectedKid.name}!`)
                }}
                className="w-full p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container flex items-center justify-between text-on-surface font-label-md text-sm font-semibold transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px] text-primary">add_circle</span>
                  <span>Liberar +30 minutos extras</span>
                </div>
                <span className="material-symbols-outlined text-[18px] text-outline">chevron_right</span>
              </button>

              <Link
                to="/familia/controles"
                className="w-full p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container flex items-center justify-between text-on-surface font-label-md text-sm font-semibold transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px] text-outline">tune</span>
                  <span>Configurar Limites e Horários</span>
                </div>
                <span className="material-symbols-outlined text-[18px] text-outline">chevron_right</span>
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-full h-11 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-sm font-semibold transition-all"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL 3: DETALHE DO CONTEÚDO (ARCA DE NOÉ) ────────────────────── */}
      {activeModal === 'modal-conteudo' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-on-background/40 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
          <div className="relative bg-surface-container-lowest rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-surface-container-high z-10">
            <div className="relative w-full h-56 rounded-2xl overflow-hidden mb-6 shadow-md">
              <img
                className="w-full h-full object-cover"
                alt="A Arca de Noé"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8ZmXEkwojYeal_x-PgWjMMMAE7ui-j-io-UucdCn4uG1yEWmr6ETYELQrBnpEkxjPNWbB1Ep74Ds9qHlQsM_GSJ6MB1qFmpkqOUtHaqgduJfylmhzz34Ghf2BSeGVtbeK9pNLVWqg6MaNY8HuGay9V7subLoyuyyHQAXrK3YYmOl20WaSgo8NNRMLYC6oMe4HTr8N7MVOxrK_YgTHy4rWqqDa-ZtP0LYSa0uktbWOO-ZSAoqAsnD_3g"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <span className="text-white font-headline-md font-bold text-xl">A Arca de Noé • Ep. 4</span>
              </div>
            </div>

            <p className="font-body-md text-sm text-outline mb-6 leading-relaxed">
              Uma emocionante jornada bíblica sobre fé, obediência e a promessa do arco-íris de Deus para todas as gerações.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="flex-1 h-12 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-sm font-semibold transition-all"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null)
                  alert('Iniciando reprodução no ambiente kids!')
                }}
                className="flex-1 h-12 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-label-md text-sm font-semibold shadow-[0_2px_10px_rgba(255,107,53,0.2)] flex items-center justify-center gap-2 transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">play_circle</span>
                Assistir Agora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 4: LIMITES & TEMPO DE TELA ──────────────────────────────── */}
      {activeModal === 'modal-limites' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-on-background/40 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
          <div className="relative bg-surface-container-lowest rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-surface-container-high z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[22px]">tune</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-lg font-bold text-on-surface">Limites de Tela</h3>
                  <p className="font-caption text-xs text-outline">Ajuste rápido de tempo para a família</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-9 h-9 rounded-full bg-surface-container-low hover:bg-surface-container flex items-center justify-center text-outline"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-surface-container-low flex items-center justify-between">
                <span className="font-label-md text-sm font-semibold text-on-surface">Tempo Diário Total</span>
                <span className="font-headline-md text-lg font-bold text-primary">60 min</span>
              </div>
              <div className="p-4 rounded-2xl bg-surface-container-low flex items-center justify-between">
                <span className="font-label-md text-sm font-semibold text-on-surface">Horário de Dormir</span>
                <span className="font-label-md text-sm font-medium text-outline">20:30</span>
              </div>
            </div>

            <Link
              to="/familia/controles"
              className="w-full h-12 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-label-md text-sm font-semibold shadow-[0_2px_10px_rgba(255,107,53,0.2)] flex items-center justify-center gap-2 transition-all mb-2"
            >
              Abrir Controles Completos <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default MinhaFamilia
