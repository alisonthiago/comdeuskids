import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '@comdeuskids/supabase'
import { WatchProgress } from '@comdeuskids/types'

export interface TVProfile {
  id: string
  name: string
  avatar_url: string
  age: number | null
  has_pin: boolean
}

interface TVSessionValue {
  loading: boolean
  authorized: boolean
  deviceToken: string | null
  profiles: TVProfile[]
  activeProfile: TVProfile | null
  myList: string[]
  watchProgress: Record<string, WatchProgress>
  refreshAuthorization: () => Promise<'pending' | 'authorized' | 'expired' | 'invalid'>
  selectProfile: (profile: TVProfile) => Promise<boolean>
  verifyProfilePin: (profileId: string, pin: string) => Promise<{ success: boolean; error?: string }>
  toggleMyList: (contentId: string) => Promise<void>
  isInMyList: (contentId: string) => boolean
  saveProgress: (contentId: string, seconds: number, duration: number, title?: string, thumbnail?: string) => Promise<void>
  checkParentalAccess: () => Promise<{ allowed: boolean; reason?: string }>
  recordPlayback: (contentId: string, seconds: number) => Promise<{ limitReached: boolean }>
  disconnect: () => void
}

const TV_TOKEN_KEY = 'cdk_tv_device_token'
const TV_PROFILE_KEY = 'cdk_tv_active_profile'
const TV_DEMO_KEY = 'cdk_tv_demo_mode'
const TVSessionContext = createContext<TVSessionValue | undefined>(undefined)

const DEMO_PROFILES: TVProfile[] = [
  { id: 'demo-sara', name: 'Sara', avatar_url: 'sara', age: 7, has_pin: false },
  { id: 'demo-davi', name: 'Davi', avatar_url: 'davi', age: 5, has_pin: false }
]

export function TVSessionProvider({ children }: { children: React.ReactNode }) {
  const isDemoMode = typeof window !== 'undefined' && (
    window.location.search.includes('tv_demo=1') ||
    localStorage.getItem(TV_DEMO_KEY) === 'true'
  )

  const [loading, setLoading] = useState(!isDemoMode)
  const [authorized, setAuthorized] = useState(isDemoMode)
  const [deviceToken, setDeviceToken] = useState<string | null>(() => localStorage.getItem(TV_TOKEN_KEY))
  const [profiles, setProfiles] = useState<TVProfile[]>(isDemoMode ? DEMO_PROFILES : [])
  const [activeProfile, setActiveProfile] = useState<TVProfile | null>(() => {
    if (isDemoMode) {
      const remId = localStorage.getItem(TV_PROFILE_KEY)
      return DEMO_PROFILES.find(p => p.id === remId) || DEMO_PROFILES[0]
    }
    return null
  })
  const [myList, setMyList] = useState<string[]>([])
  const [watchProgress, setWatchProgress] = useState<Record<string, WatchProgress>>({})

  const refreshAuthorization = useCallback(async () => {
    if (isDemoMode) {
      setAuthorized(true)
      setLoading(false)
      return 'authorized' as const
    }
    if (!deviceToken) {
      setAuthorized(false)
      setLoading(false)
      return 'invalid' as const
    }
    const { data } = await supabase.rpc('get_tv_pairing_status', { p_device_token: deviceToken })
    const status = (data?.status || 'invalid') as 'pending' | 'authorized' | 'expired' | 'invalid'
    setAuthorized(status === 'authorized')
    setLoading(false)
    return status
  }, [deviceToken, isDemoMode])

  const loadProfiles = useCallback(async () => {
    if (isDemoMode) {
      setProfiles(DEMO_PROFILES)
      return DEMO_PROFILES
    }
    if (!deviceToken) return []
    const { data, error } = await supabase.rpc('get_tv_profiles', { p_device_token: deviceToken })
    if (error || !data) return []
    const next = data as TVProfile[]
    setProfiles(next)
    const rememberedId = localStorage.getItem(TV_PROFILE_KEY)
    const remembered = next.find(profile => profile.id === rememberedId) || null
    if (remembered) setActiveProfile(remembered)
    return next
  }, [deviceToken, isDemoMode])

  const loadProfileState = useCallback(async (profile: TVProfile) => {
    if (isDemoMode || !deviceToken) return
    const { data } = await supabase.rpc('get_tv_profile_state', {
      p_device_token: deviceToken,
      p_profile_id: profile.id
    })
    if (data?.error) return
    setMyList(Array.isArray(data?.my_list) ? data.my_list : [])
    setWatchProgress((data?.watch_progress || {}) as Record<string, WatchProgress>)
  }, [deviceToken, isDemoMode])

  useEffect(() => {
    if (isDemoMode) {
      setAuthorized(true)
      setProfiles(DEMO_PROFILES)
      setLoading(false)
      const rememberedId = localStorage.getItem(TV_PROFILE_KEY)
      const remembered = DEMO_PROFILES.find(p => p.id === rememberedId) || DEMO_PROFILES[0]
      setActiveProfile(remembered)
      return
    }

    refreshAuthorization().then(status => {
      if (status === 'authorized') loadProfiles()
    })
  }, [refreshAuthorization, loadProfiles, isDemoMode])

  useEffect(() => {
    if (activeProfile && !isDemoMode) loadProfileState(activeProfile)
  }, [activeProfile, loadProfileState, isDemoMode])

  const selectProfile = useCallback(async (profile: TVProfile) => {
    if (isDemoMode) {
      setActiveProfile(profile)
      localStorage.setItem(TV_PROFILE_KEY, profile.id)
      return true
    }
    if (!profiles.some(item => item.id === profile.id)) return false
    setActiveProfile(profile)
    localStorage.setItem(TV_PROFILE_KEY, profile.id)
    await loadProfileState(profile)
    return true
  }, [loadProfileState, profiles, isDemoMode])

  const verifyProfilePin = useCallback(async (profileId: string, pin: string): Promise<{ success: boolean; error?: string }> => {
    if (!deviceToken) return { success: false, error: 'NO_DEVICE_TOKEN' }
    const { data, error } = await supabase.rpc('verify_tv_profile_pin', {
      p_device_token: deviceToken,
      p_profile_id: profileId,
      p_pin: pin
    })
    if (error) return { success: false, error: error.message }
    return data || { success: false, error: 'INVALID_PIN' }
  }, [deviceToken])

  const toggleMyList = useCallback(async (contentId: string) => {
    if (!deviceToken || !activeProfile) return
    const { data } = await supabase.rpc('toggle_tv_my_list', {
      p_device_token: deviceToken,
      p_profile_id: activeProfile.id,
      p_content_id: contentId
    })
    if (data?.success) setMyList(previous => data.in_list ? [...previous, contentId] : previous.filter(id => id !== contentId))
  }, [activeProfile, deviceToken])

  const saveProgress = useCallback(async (contentId: string, seconds: number, duration: number, title?: string, thumbnail?: string) => {
    if (!deviceToken || !activeProfile) return
    const record = {
      profile_id: activeProfile.id,
      content_id: contentId,
      content_title: title || null,
      content_thumbnail: thumbnail || null,
      progress_seconds: seconds,
      duration_seconds: duration,
      completed: duration > 0 && seconds >= duration * 0.9,
      updated_at: new Date().toISOString()
    } as WatchProgress
    setWatchProgress(previous => ({ ...previous, [contentId]: record }))
    await supabase.rpc('save_tv_watch_progress', {
      p_device_token: deviceToken,
      p_profile_id: activeProfile.id,
      p_content_id: contentId,
      p_progress_seconds: Math.floor(seconds),
      p_duration_seconds: Math.floor(duration),
      p_title: title || null,
      p_thumbnail: thumbnail || null
    })
  }, [activeProfile, deviceToken])

  const checkParentalAccess = useCallback(async () => {
    if (!deviceToken || !activeProfile) return { allowed: false, reason: 'PROFILE_REQUIRED' }
    const { data } = await supabase.rpc('check_tv_parental_access', {
      p_device_token: deviceToken,
      p_profile_id: activeProfile.id,
      p_content_access_class: 'general'
    })
    return { allowed: data?.allowed === true, reason: data?.reason }
  }, [activeProfile, deviceToken])

  const recordPlayback = useCallback(async (contentId: string, seconds: number) => {
    if (!deviceToken || !activeProfile || seconds <= 0) return { limitReached: false }
    const { data } = await supabase.rpc('record_tv_usage_heartbeat', {
      p_device_token: deviceToken,
      p_profile_id: activeProfile.id,
      p_content_id: contentId,
      p_increment_seconds: Math.min(Math.floor(seconds), 90)
    })
    return { limitReached: data?.limit_reached === true }
  }, [activeProfile, deviceToken])

  const disconnect = useCallback(() => {
    localStorage.removeItem(TV_TOKEN_KEY)
    localStorage.removeItem(TV_PROFILE_KEY)
    setDeviceToken(null); setAuthorized(false); setProfiles([]); setActiveProfile(null); setMyList([]); setWatchProgress({})
  }, [])

  const value = useMemo(() => ({
    loading, authorized, deviceToken, profiles, activeProfile, myList, watchProgress,
    refreshAuthorization, selectProfile, verifyProfilePin, toggleMyList,
    isInMyList: (contentId: string) => myList.includes(contentId), saveProgress,
    checkParentalAccess, recordPlayback, disconnect
  }), [loading, authorized, deviceToken, profiles, activeProfile, myList, watchProgress, refreshAuthorization, selectProfile, verifyProfilePin, toggleMyList, saveProgress, checkParentalAccess, recordPlayback, disconnect])

  return <TVSessionContext.Provider value={value}>{children}</TVSessionContext.Provider>
}

export function useTVSession() {
  const context = useContext(TVSessionContext)
  if (!context) throw new Error('useTVSession must be used within TVSessionProvider')
  return context
}

export const tvDeviceTokenStorage = {
  save(token: string) { localStorage.setItem(TV_TOKEN_KEY, token) },
  clear() { localStorage.removeItem(TV_TOKEN_KEY) }
}
