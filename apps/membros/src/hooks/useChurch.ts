import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@comdeuskids/supabase'
import { useAuth } from './useAuth'

export interface ChurchOrg {
  id: string
  name: string
  slug: string
  type: string
  role?: string
}

export interface TodayStats {
  activeSession: any | null
  checkedInCount: number
  pickupRequestedCount: number
  readyForPickupCount: number
  pickedUpCount: number
  totalClasses: number
  totalKids: number
  totalTeam: number
}

export function useChurch() {
  const { user } = useAuth()
  const [currentChurch, setCurrentChurch] = useState<ChurchOrg | null>(null)
  const [churchList, setChurchList] = useState<ChurchOrg[]>([])
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<string>('coordinator')
  const [capabilities, setCapabilities] = useState<string[]>([])
  const [stats, setStats] = useState<TodayStats>({
    activeSession: null,
    checkedInCount: 0,
    pickupRequestedCount: 0,
    readyForPickupCount: 0,
    pickedUpCount: 0,
    totalClasses: 0,
    totalKids: 0,
    totalTeam: 0
  })

  // Carregar igrejas do usuário
  const loadChurches = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      // 1. Buscar organizações do tipo church onde usuário é owner ou membro
      const { data: memberOrgs } = await supabase
        .from('organization_members')
        .select(`
          role,
          custom_capabilities,
          organization:organizations (
            id,
            name,
            slug,
            type,
            owner_id
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)

      let orgs: ChurchOrg[] = []

      if (memberOrgs && memberOrgs.length > 0) {
        memberOrgs.forEach((m: any) => {
          if (m.organization && (m.organization.type === 'church' || m.organization.type === 'ministry')) {
            orgs.push({
              id: m.organization.id,
              name: m.organization.name,
              slug: m.organization.slug,
              type: m.organization.type,
              role: m.role || 'teacher'
            })
          }
        })
      }

      // 2. Se for owner direto na tabela organizations
      const { data: ownedOrgs } = await supabase
        .from('organizations')
        .select('id, name, slug, type')
        .eq('owner_id', user.id)
        .in('type', ['church', 'ministry'])

      if (ownedOrgs && ownedOrgs.length > 0) {
        ownedOrgs.forEach((o: any) => {
          if (!orgs.some(item => item.id === o.id)) {
            orgs.push({
              id: o.id,
              name: o.name,
              slug: o.slug,
              type: o.type,
              role: 'owner'
            })
          }
        })
      }

      // Fallback seguro se não houver organização cadastrada ainda:
      // Cria uma referência institucional padrão com id previsível
      if (orgs.length === 0) {
        const defaultOrg: ChurchOrg = {
          id: '00000000-0000-0000-0000-000000000001',
          name: 'Igreja Kids - Sede',
          slug: 'igreja-kids-sede',
          type: 'church',
          role: 'coordinator'
        }
        orgs = [defaultOrg]
      }

      setChurchList(orgs)
      const selected = orgs[0]
      setCurrentChurch(selected)
      setRole(selected.role || 'coordinator')

      // Carregar capabilities do papel
      const { data: rc } = await supabase
        .from('role_capabilities')
        .select('capability')
        .eq('role', selected.role || 'coordinator')

      if (rc) {
        setCapabilities(rc.map((r: any) => r.capability))
      }
    } catch (err) {
      console.warn('Erro ao carregar contexto de igreja:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  // Carregar estatísticas do dia / Hoje no Kids
  const refreshStats = useCallback(async () => {
    if (!currentChurch) return

    try {
      const today = new Date().toISOString().split('T')[0]

      // Sessão de check-in ativa
      const { data: session } = await supabase
        .from('church_checkin_sessions')
        .select('*')
        .eq('organization_id', currentChurch.id)
        .eq('session_date', today)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      // Contagem de check-ins
      const { count: checkedIn } = await supabase
        .from('church_checkins')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', currentChurch.id)
        .eq('status', 'checked_in')

      const { count: pickupReq } = await supabase
        .from('church_checkins')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', currentChurch.id)
        .eq('status', 'pickup_requested')

      const { count: readyPickup } = await supabase
        .from('church_checkins')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', currentChurch.id)
        .eq('status', 'ready_for_pickup')

      const { count: pickedUp } = await supabase
        .from('church_checkins')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', currentChurch.id)
        .eq('status', 'picked_up')

      // Turmas
      const { count: classesCount } = await supabase
        .from('educational_classes')
        .select('*', { count: 'exact', head: true })
        .or(`organization_id.eq.${currentChurch.id},created_by.eq.${user?.id}`)

      // Crianças da organização
      const { count: kidsCount } = await supabase
        .from('organization_students')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', currentChurch.id)

      // Equipe
      const { count: teamCount } = await supabase
        .from('organization_members')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', currentChurch.id)

      setStats({
        activeSession: session || null,
        checkedInCount: checkedIn || 0,
        pickupRequestedCount: pickupReq || 0,
        readyForPickupCount: readyPickup || 0,
        pickedUpCount: pickedUp || 0,
        totalClasses: classesCount || 0,
        totalKids: kidsCount || 0,
        totalTeam: (teamCount || 0) + 1 // + owner
      })
    } catch (err) {
      console.warn('Erro ao atualizar estatísticas do dia:', err)
    }
  }, [currentChurch, user])

  useEffect(() => {
    loadChurches()
  }, [loadChurches])

  useEffect(() => {
    if (currentChurch) {
      refreshStats()
    }
  }, [currentChurch, refreshStats])

  const hasCapability = (cap: string) => {
    if (role === 'owner' || role === 'admin') return true
    return capabilities.includes(cap)
  }

  return {
    currentChurch,
    setCurrentChurch,
    churchList,
    role,
    capabilities,
    hasCapability,
    stats,
    refreshStats,
    loading
  }
}
