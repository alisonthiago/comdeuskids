import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { supabase } from '@comdeuskids/supabase'
import { useNavigate } from 'react-router-dom'

export type EnvironmentType = 'play' | 'family' | 'teacher' | 'church' | 'school'

export interface EnvironmentOption {
  id: string
  type: EnvironmentType
  title: string
  roleLabel?: string
  organizationId?: string | null
  route: string
  icon: 'Play' | 'Home' | 'GraduationCap' | 'Church' | 'School'
}

interface EnvironmentContextType {
  userDisplayName: string
  environments: EnvironmentOption[]
  currentEnvironment: EnvironmentOption | null
  loading: boolean
  switchEnvironment: (envId: string) => void
  hasAccessToContext: (type: EnvironmentType, targetOrgId?: string | null) => boolean
  refreshEnvironments: () => Promise<void>
}

const EnvironmentContext = createContext<EnvironmentContextType | undefined>(undefined)

const STORAGE_KEY = 'cdk_selected_environment_id'

export const EnvironmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [environments, setEnvironments] = useState<EnvironmentOption[]>([])
  const [currentEnvId, setCurrentEnvId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY) || 'play'
  })
  const [userDisplayName, setUserDisplayName] = useState<string>('Minha Conta')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const loadEnvironments = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setEnvironments([])
        setUserDisplayName('Minha Conta')
        setLoading(false)
        return
      }

      // 1. Obter nome do usuário (profiles ou metadados de autenticação)
      let displayName = user.user_metadata?.full_name || user.user_metadata?.name || ''
      if (!displayName) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, name')
          .eq('id', user.id)
          .maybeSingle()
        if (profileData) {
          displayName = profileData.full_name || profileData.name || ''
        }
      }
      if (!displayName && user.email) {
        displayName = user.email.split('@')[0]
      }
      setUserDisplayName(displayName || 'Alison Thiago')

      const envList: EnvironmentOption[] = []

      // 2. Play (sempre acessível para assinante/usuário autenticado com perfil)
      envList.push({
        id: 'play',
        type: 'play',
        title: 'Com Deus Kids Play',
        route: '/inicio',
        icon: 'Play'
      })

      // 3. Família (acessível se o usuário tem conta/perfis)
      envList.push({
        id: 'family',
        type: 'family',
        title: 'Minha Família',
        route: '/minha-familia',
        icon: 'Home'
      })

      // 4. Buscar organizações REAIS em que o usuário é membro ativo
      // REGRA 1: Não confiar em estado do cliente — consultar banco de dados
      const { data: memberships, error: memErr } = await supabase
        .from('organization_members')
        .select(`
          id,
          role,
          organization_id,
          custom_capabilities,
          is_active,
          organizations:organization_id (
            id,
            name,
            slug,
            type,
            is_active
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)

      if (!memErr && memberships) {
        for (const m of memberships) {
          const org = Array.isArray(m.organizations) ? m.organizations[0] : m.organizations
          if (!org || !org.is_active) continue

          const roleMap: Record<string, string> = {
            owner: 'Dono',
            admin: 'Administrador',
            coordinator: 'Coordenador',
            teacher: 'Professor',
            reception: 'Recepção',
            transport: 'Transporte'
          }

          if (org.type === 'church') {
            envList.push({
              id: org.id,
              type: 'church',
              title: org.name,
              roleLabel: roleMap[m.role] || m.role,
              organizationId: org.id,
              route: `/minha-igreja?org=${org.id}`,
              icon: 'Church'
            })
          } else if (org.type === 'school') {
            envList.push({
              id: org.id,
              type: 'school',
              title: org.name,
              roleLabel: roleMap[m.role] || m.role,
              organizationId: org.id,
              route: `/minha-escola?org=${org.id}`,
              icon: 'School'
            })
          } else if (org.type === 'independent_teacher') {
            envList.push({
              id: org.id,
              type: 'teacher',
              title: org.name || 'Professor',
              roleLabel: roleMap[m.role] || m.role,
              organizationId: org.id,
              route: `/meu-espaco?org=${org.id}`,
              icon: 'GraduationCap'
            })
          }
        }
      }

      // 5. Verificar se possui perfil do tipo professor em account_profiles
      const { data: teacherProfile } = await supabase
        .from('account_profiles')
        .select('id, name')
        .eq('user_id', user.id)
        .eq('profile_type', 'teacher')
        .maybeSingle()

      if (teacherProfile && !envList.some(e => e.type === 'teacher')) {
        envList.push({
          id: 'teacher-individual',
          type: 'teacher',
          title: 'Professor',
          route: '/meu-espaco',
          icon: 'GraduationCap'
        })
      }

      setEnvironments(envList)

      // Se o currentEnvId salvo não estiver nos ambientes autorizados, fallback para 'play'
      setCurrentEnvId(prevId => {
        if (!envList.some(e => e.id === prevId)) {
          localStorage.setItem(STORAGE_KEY, 'play')
          return 'play'
        }
        return prevId
      })
    } catch (err) {
      console.error('Erro ao carregar ambientes autorizados:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadEnvironments()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadEnvironments()
    })

    return () => subscription.unsubscribe()
  }, [loadEnvironments])

  // Trocar de ambiente de forma segura
  const switchEnvironment = useCallback((envId: string) => {
    const target = environments.find(e => e.id === envId)
    if (!target) {
      console.warn(`Tentativa de alternar para ambiente não autorizado: ${envId}`)
      return
    }

    setCurrentEnvId(target.id)
    localStorage.setItem(STORAGE_KEY, target.id)
    navigate(target.route)
  }, [environments, navigate])

  // Verificação de autorização (NUNCA confia em active_context enviado pelo cliente)
  const hasAccessToContext = useCallback((type: EnvironmentType, targetOrgId?: string | null): boolean => {
    if (type === 'play' || type === 'family') return true

    if (targetOrgId) {
      return environments.some(e => e.organizationId === targetOrgId && e.type === type)
    }

    return environments.some(e => e.type === type)
  }, [environments])

  const currentEnvironment = useMemo(() => {
    return environments.find(e => e.id === currentEnvId) || environments[0] || null
  }, [environments, currentEnvId])

  return (
    <EnvironmentContext.Provider
      value={{
        userDisplayName,
        environments,
        currentEnvironment,
        loading,
        switchEnvironment,
        hasAccessToContext,
        refreshEnvironments: loadEnvironments
      }}
    >
      {children}
    </EnvironmentContext.Provider>
  )
}

export function useEnvironment() {
  const context = useContext(EnvironmentContext)
  if (!context) {
    throw new Error('useEnvironment deve ser usado dentro de um EnvironmentProvider')
  }
  return context
}
