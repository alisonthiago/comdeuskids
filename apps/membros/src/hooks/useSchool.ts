import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@comdeuskids/supabase'
import { useAuth } from './useAuth'

export interface SchoolOrg {
  id: string
  name: string
  slug: string
  type: string
  role?: string
}

export interface SchoolStats {
  totalStudents: number
  totalTeachers: number
  totalClasses: number
  totalLessons: number
  totalTransportRoutes: number
  totalTransportStudents: number
  pendingAssignments: number
}

export function useSchool() {
  const { user } = useAuth()
  const [currentSchool, setCurrentSchool] = useState<SchoolOrg | null>(null)
  const [schoolList, setSchoolList] = useState<SchoolOrg[]>([])
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<string>('coordinator')
  const [capabilities, setCapabilities] = useState<string[]>([])
  const [stats, setStats] = useState<SchoolStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalLessons: 0,
    totalTransportRoutes: 0,
    totalTransportStudents: 0,
    pendingAssignments: 0
  })

  const loadSchools = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      // 1. Organizações do tipo school onde usuário é membro
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

      let orgs: SchoolOrg[] = []

      if (memberOrgs && memberOrgs.length > 0) {
        memberOrgs.forEach((m: any) => {
          if (m.organization && m.organization.type === 'school') {
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
        .eq('type', 'school')

      if (ownedOrgs && ownedOrgs.length > 0) {
        ownedOrgs.forEach((o: any) => {
          if (!orgs.some((item) => item.id === o.id)) {
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

      // Fallback seguro se não houver organização cadastrada ainda
      if (orgs.length === 0) {
        const defaultOrg: SchoolOrg = {
          id: '00000000-0000-0000-0000-000000000002',
          name: 'Colégio Cristão Esperança',
          slug: 'colegio-esperanca',
          type: 'school',
          role: 'coordinator'
        }
        orgs = [defaultOrg]
      }

      setSchoolList(orgs)
      const selected = orgs[0]
      setCurrentSchool(selected)
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
      console.warn('Erro ao carregar contexto de escola:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  const refreshStats = useCallback(async () => {
    if (!currentSchool) return

    try {
      // 1. Alunos matriculados
      const { count: studentsCount } = await supabase
        .from('organization_students')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', currentSchool.id)
        .eq('status', 'active')

      // 2. Turmas
      const { count: classesCount } = await supabase
        .from('educational_classes')
        .select('*', { count: 'exact', head: true })
        .or(`organization_id.eq.${currentSchool.id},created_by.eq.${user?.id}`)

      // 3. Aulas
      const { count: lessonsCount } = await supabase
        .from('educational_lessons')
        .select('*', { count: 'exact', head: true })
        .or(`organization_id.eq.${currentSchool.id},created_by.eq.${user?.id}`)

      // 4. Rotas de transporte
      const { count: routesCount } = await supabase
        .from('school_transport_routes')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', currentSchool.id)

      // 5. Alunos no transporte
      const { count: transportStudentsCount } = await supabase
        .from('school_transport_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', currentSchool.id)
        .eq('status', 'active')

      // 6. Equipe docente
      const { count: teamCount } = await supabase
        .from('organization_members')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', currentSchool.id)

      setStats({
        totalStudents: studentsCount || 0,
        totalTeachers: (teamCount || 0) + 1,
        totalClasses: classesCount || 0,
        totalLessons: lessonsCount || 0,
        totalTransportRoutes: routesCount || 0,
        totalTransportStudents: transportStudentsCount || 0,
        pendingAssignments: 3
      })
    } catch (err) {
      console.warn('Erro ao atualizar estatísticas da escola:', err)
    }
  }, [currentSchool, user])

  useEffect(() => {
    loadSchools()
  }, [loadSchools])

  useEffect(() => {
    if (currentSchool) {
      refreshStats()
    }
  }, [currentSchool, refreshStats])

  const hasCapability = (cap: string) => {
    if (role === 'owner' || role === 'admin') return true
    return capabilities.includes(cap)
  }

  return {
    currentSchool,
    setCurrentSchool,
    schoolList,
    role,
    capabilities,
    hasCapability,
    stats,
    refreshStats,
    loading
  }
}
