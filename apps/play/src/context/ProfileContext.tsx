import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '@comdeuskids/supabase'
import { AccountProfile, ProfileRoleType, WatchProgress } from '@comdeuskids/types'

interface ProfileContextType {
  profiles: AccountProfile[]
  activeProfile: AccountProfile | null
  loading: boolean
  selectProfile: (profile: AccountProfile) => void
  clearActiveProfile: () => void
  createProfile: (data: {
    name: string
    avatar_url: string
    profile_type: ProfileRoleType
    age?: number | null
    pin?: string | null
  }) => Promise<AccountProfile | null>
  updateProfile: (id: string, data: Partial<AccountProfile>) => Promise<boolean>
  deleteProfile: (id: string) => Promise<boolean>
  myList: string[]
  toggleMyList: (contentId: string) => Promise<void>
  isInMyList: (contentId: string) => boolean
  watchProgress: Record<string, WatchProgress>
  saveProgress: (
    contentId: string,
    progressSeconds: number,
    durationSeconds: number,
    contentTitle?: string,
    contentThumbnail?: string,
    meta?: {
      seriesId?: string
      seriesTitle?: string
      seasonNumber?: number
      episodeId?: string
      episodeNumber?: number
      episodeTitle?: string
      contentType?: string
    }
  ) => Promise<void>
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

const DEFAULT_SEED_PROFILES: Omit<AccountProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] = [
  {
    name: 'Davi',
    avatar_url: 'biblioteca_meninos_1',
    profile_type: 'kid',
    age: 7,
    pin: null
  },
  {
    name: 'Sara',
    avatar_url: 'biblioteca_meninas_1',
    profile_type: 'kid',
    age: 9,
    pin: null
  },
  {
    name: 'Profª Ana',
    avatar_url: 'biblioteca_mulheres_1',
    profile_type: 'teacher',
    age: null,
    pin: null
  }
]

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<AccountProfile[]>([])
  const [activeProfile, setActiveProfile] = useState<AccountProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [myList, setMyList] = useState<string[]>([])
  const [watchProgress, setWatchProgress] = useState<Record<string, WatchProgress>>({})

  // Carregar perfis do Supabase com fallback local resiliente
  const loadProfiles = useCallback(async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('account_profiles')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: true })

      if (!error && data && data.length > 0) {
        const unique = Array.from(new Map((data as AccountProfile[]).map(p => [p.name, p])).values())
        setProfiles(unique)
        return unique
      }

      // Se não houver perfis cadastrados no Supabase ainda, cria os perfis iniciais
      const seeded: AccountProfile[] = []
      for (const p of DEFAULT_SEED_PROFILES) {
        const { data: inserted, error: insertErr } = await supabase
          .from('account_profiles')
          .insert({
            user_id: uid,
            name: p.name,
            avatar_url: p.avatar_url,
            profile_type: p.profile_type,
            age: p.age,
            pin: p.pin
          })
          .select()
          .single()

        if (!insertErr && inserted) {
          seeded.push(inserted as AccountProfile)
        }
      }

      if (seeded.length > 0) {
        setProfiles(seeded)
        return seeded
      }

      // Fallback local se RLS ou rede impedir escrita direta
      const localKey = `cdk_profiles_${uid}`
      const localStored = localStorage.getItem(localKey)
      if (localStored) {
        const parsed = JSON.parse(localStored) as AccountProfile[]
        const unique = Array.from(new Map(parsed.map(p => [p.name, p])).values())
        setProfiles(unique)
        return unique
      }

      // Cria perfis em memória/local
      const initialLocal: AccountProfile[] = DEFAULT_SEED_PROFILES.map((p, index) => ({
        id: `local-prof-${index + 1}`,
        user_id: uid,
        name: p.name,
        avatar_url: p.avatar_url,
        profile_type: p.profile_type,
        age: p.age,
        pin: p.pin,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))
      localStorage.setItem(localKey, JSON.stringify(initialLocal))
      setProfiles(initialLocal)
      return initialLocal
    } catch (err) {
      console.error('Erro ao carregar perfis:', err)
      return []
    }
  }, [])

  // Carregar dados específicos do perfil ativo (Minha Lista & Continuar Assistindo)
  const loadProfileData = useCallback(async (profileId: string) => {
    try {
      // 1. Minha Lista
      const { data: listData } = await supabase
        .from('profile_my_list')
        .select('content_id')
        .eq('profile_id', profileId)

      if (listData) {
        setMyList(listData.map((item: { content_id: string }) => item.content_id))
      } else {
        const localList = localStorage.getItem(`cdk_mylist_${profileId}`)
        setMyList(localList ? JSON.parse(localList) : ['davi-golias', 'arca-de-noe'])
      }

      // 2. Progresso de Vídeo
      const { data: progressData } = await supabase
        .from('profile_watch_progress')
        .select('*')
        .eq('profile_id', profileId)

      if (progressData && progressData.length > 0) {
        const map: Record<string, WatchProgress> = {}
        progressData.forEach((item: WatchProgress) => {
          map[item.content_id] = item
        })
        setWatchProgress(map)
      } else {
        const localProg = localStorage.getItem(`cdk_progress_${profileId}`)
        if (localProg) {
          setWatchProgress(JSON.parse(localProg))
        } else {
          // Progressos isolados por perfil conforme diretriz do sistema
          const currentProf = profiles.find(p => p.id === profileId)
          const profName = currentProf?.name?.toLowerCase() || ''

          if (profName.includes('sara')) {
            const saraMap: Record<string, WatchProgress> = {
              'arca-de-noe': {
                profile_id: profileId,
                content_id: 'arca-de-noe',
                content_title: 'A Arca de Noé',
                content_thumbnail: '/thumbnails/noe.jpg',
                series_id: 'arca-de-noe',
                series_title: 'A Arca de Noé',
                season_number: 1,
                episode_id: 'ep-noe-1',
                episode_number: 1,
                episode_title: 'O Chamado',
                progress_seconds: 320, // 05:20
                duration_seconds: 1320, // 22:00 (24%)
                completed: false,
                updated_at: new Date().toISOString()
              },
              'jesus-tempestade': {
                profile_id: profileId,
                content_id: 'jesus-tempestade',
                content_title: 'Jesus e a Tempestade',
                content_thumbnail: '/thumbnails/jesus_tempestade.jpg',
                progress_seconds: 1020,
                duration_seconds: 1200,
                completed: false,
                updated_at: new Date().toISOString()
              }
            }
            setWatchProgress(saraMap)
            localStorage.setItem(`cdk_progress_${profileId}`, JSON.stringify(saraMap))
          } else {
            // Padrão Davi: A Arca de Noé no Episódio 3 • Promessas de Deus (12:38 de 25m, 65%)
            const daviMap: Record<string, WatchProgress> = {
              'arca-de-noe': {
                profile_id: profileId,
                content_id: 'arca-de-noe',
                content_title: 'A Arca de Noé',
                content_thumbnail: '/thumbnails/noe.jpg',
                series_id: 'arca-de-noe',
                series_title: 'A Arca de Noé',
                season_number: 1,
                episode_id: 'ep-noe-3',
                episode_number: 3,
                episode_title: 'Promessas de Deus',
                progress_seconds: 758, // 12:38
                duration_seconds: 1500, // 25:00 (65%)
                completed: false,
                updated_at: new Date().toISOString()
              },
              'daniel-covas': {
                profile_id: profileId,
                content_id: 'daniel-covas',
                content_title: 'Daniel na Cova dos Leões',
                content_thumbnail: '/thumbnails/daniel.jpg',
                episode_number: 1,
                episode_title: 'Fé Inabalável',
                progress_seconds: 480,
                duration_seconds: 1200,
                completed: false,
                updated_at: new Date().toISOString()
              }
            }
            setWatchProgress(daviMap)
            localStorage.setItem(`cdk_progress_${profileId}`, JSON.stringify(daviMap))
          }
        }
      }
    } catch (err) {
      console.error('Erro ao carregar dados do perfil:', err)
    }
  }, [])

  // Inicialização estrita com sessão Supabase (sem fallback de usuário fictício)
  useEffect(() => {
    let isMounted = true

    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!isMounted) return

      if (!session?.user?.id) {
        setUserId(null)
        setProfiles([])
        setActiveProfile(null)
        setMyList([])
        setWatchProgress({})
        setLoading(false)
        return
      }

      const uid = session.user.id
      setUserId(uid)
      const loaded = await loadProfiles(uid)

      // Verificar se havia perfil ativo salvo
      const savedProfileId = localStorage.getItem(`cdk_active_profile_${uid}`) || localStorage.getItem('cdk_active_profile')
      if (loaded && loaded.length > 0) {
        const found = loaded.find(p => p.id === savedProfileId) || loaded[0]
        setActiveProfile(found)
        await loadProfileData(found.id)
      }
      setLoading(false)
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user?.id) {
        setUserId(null)
        setProfiles([])
        setActiveProfile(null)
        setMyList([])
        setWatchProgress({})
        setLoading(false)
        return
      }

      const uid = session.user.id
      setUserId(uid)
      const loaded = await loadProfiles(uid)
      const savedProfileId = localStorage.getItem(`cdk_active_profile_${uid}`) || localStorage.getItem('cdk_active_profile')
      if (loaded && loaded.length > 0) {
        const found = loaded.find(p => p.id === savedProfileId) || loaded[0]
        setActiveProfile(found)
        await loadProfileData(found.id)
      }
      setLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [loadProfiles, loadProfileData])

  const selectProfile = (profile: AccountProfile) => {
    setActiveProfile(profile)
    localStorage.setItem('cdk_active_profile', profile.id)
    if (userId) {
      localStorage.setItem(`cdk_active_profile_${userId}`, profile.id)
    }
    loadProfileData(profile.id)
  }

  const clearActiveProfile = () => {
    setActiveProfile(null)
    if (userId) {
      localStorage.removeItem(`cdk_active_profile_${userId}`)
    }
  }

  const createProfile = async (data: {
    name: string
    avatar_url: string
    profile_type: ProfileRoleType
    age?: number | null
    pin?: string | null
  }): Promise<AccountProfile | null> => {
    if (!userId) return null

    try {
      const { data: inserted, error } = await supabase
        .from('account_profiles')
        .insert({
          user_id: userId,
          name: data.name,
          avatar_url: data.avatar_url,
          profile_type: data.profile_type,
          age: data.age || null,
          pin: data.pin || null
        })
        .select()
        .single()

      if (!error && inserted) {
        const newProf = inserted as AccountProfile
        setProfiles(prev => [...prev, newProf])
        return newProf
      }

      // Fallback local se RLS ou conexão falhar
      const fallbackProf: AccountProfile = {
        id: `prof_${Date.now()}`,
        user_id: userId,
        name: data.name,
        avatar_url: data.avatar_url,
        profile_type: data.profile_type,
        age: data.age || null,
        pin: data.pin || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      const updated = [...profiles, fallbackProf]
      setProfiles(updated)
      localStorage.setItem(`cdk_profiles_${userId}`, JSON.stringify(updated))
      return fallbackProf
    } catch (err) {
      console.error('Erro ao criar perfil:', err)
      return null
    }
  }

  const updateProfile = async (id: string, data: Partial<AccountProfile>): Promise<boolean> => {
    try {
      await supabase
        .from('account_profiles')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      setProfiles(prev => prev.map(p => (p.id === id ? { ...p, ...data } : p)))
      if (activeProfile?.id === id) {
        setActiveProfile(prev => (prev ? { ...prev, ...data } : null))
      }
      if (userId) {
        const updated = profiles.map(p => (p.id === id ? { ...p, ...data } : p))
        localStorage.setItem(`cdk_profiles_${userId}`, JSON.stringify(updated))
      }
      return true
    } catch {
      return false
    }
  }

  const deleteProfile = async (id: string): Promise<boolean> => {
    try {
      await supabase.from('account_profiles').delete().eq('id', id)

      const remaining = profiles.filter(p => p.id !== id)
      setProfiles(remaining)
      if (activeProfile?.id === id) {
        clearActiveProfile()
      }
      if (userId) {
        localStorage.setItem(`cdk_profiles_${userId}`, JSON.stringify(remaining))
      }
      return true
    } catch {
      return false
    }
  }

  const toggleMyList = async (contentId: string) => {
    if (!activeProfile) return
    const inList = myList.includes(contentId)
    const next = inList ? myList.filter(id => id !== contentId) : [...myList, contentId]
    setMyList(next)
    localStorage.setItem(`cdk_mylist_${activeProfile.id}`, JSON.stringify(next))

    try {
      if (inList) {
        await supabase
          .from('profile_my_list')
          .delete()
          .eq('profile_id', activeProfile.id)
          .eq('content_id', contentId)
      } else {
        await supabase
          .from('profile_my_list')
          .insert({ profile_id: activeProfile.id, content_id: contentId })
      }
    } catch (err) {
      console.warn('Erro ao sincronizar Minha Lista com banco:', err)
    }
  }

  const isInMyList = (contentId: string) => myList.includes(contentId)

  const saveProgress = async (
    contentId: string,
    progressSeconds: number,
    durationSeconds: number,
    contentTitle?: string,
    contentThumbnail?: string,
    meta?: {
      seriesId?: string
      seriesTitle?: string
      seasonNumber?: number
      episodeId?: string
      episodeNumber?: number
      episodeTitle?: string
      contentType?: string
    }
  ) => {
    if (!activeProfile) return

    const record: WatchProgress = {
      profile_id: activeProfile.id,
      content_id: contentId,
      content_title: contentTitle || null,
      content_thumbnail: contentThumbnail || null,
      content_type: meta?.contentType,
      progress_seconds: progressSeconds,
      duration_seconds: durationSeconds,
      completed: durationSeconds > 0 && progressSeconds >= durationSeconds * 0.9,
      updated_at: new Date().toISOString(),
      series_id: meta?.seriesId,
      series_title: meta?.seriesTitle,
      season_number: meta?.seasonNumber,
      episode_id: meta?.episodeId,
      episode_number: meta?.episodeNumber,
      episode_title: meta?.episodeTitle
    }

    setWatchProgress(prev => {
      const next = { ...prev, [contentId]: record }
      localStorage.setItem(`cdk_progress_${activeProfile.id}`, JSON.stringify(next))
      return next
    })

    try {
      await supabase
        .from('profile_watch_progress')
        .upsert(
          {
            profile_id: activeProfile.id,
            content_id: contentId,
            content_title: contentTitle,
            content_thumbnail: contentThumbnail,
            progress_seconds: progressSeconds,
            duration_seconds: durationSeconds,
            completed: record.completed,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'profile_id,content_id' }
        )
    } catch (err) {
      console.warn('Erro ao salvar progresso de vídeo no banco:', err)
    }
  }

  return (
    <ProfileContext.Provider
      value={{
        profiles,
        activeProfile,
        loading,
        selectProfile,
        clearActiveProfile,
        createProfile,
        updateProfile,
        deleteProfile,
        myList,
        toggleMyList,
        isInMyList,
        watchProgress,
        saveProgress
      }}
    >
      {children}
    </ProfileContext.Provider>
  )
}

export const useProfile = () => {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error('useProfile deve ser utilizado dentro de um ProfileProvider')
  }
  return context
}

export const useProfiles = useProfile
