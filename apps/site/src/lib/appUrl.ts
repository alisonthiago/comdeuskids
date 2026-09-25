const configuredAppUrl = import.meta.env.VITE_APP_URL?.replace(/\/$/, '')
const configuredPlayUrl = (import.meta.env.VITE_PLAY_URL || import.meta.env.VITE_APP_URL)?.replace(/\/$/, '')
const configuredMembrosUrl = import.meta.env.VITE_MEMBROS_URL?.replace(/\/$/, '')
const configuredAdminUrl = import.meta.env.VITE_ADMIN_URL?.replace(/\/$/, '')
const configuredAfiliadosUrl = import.meta.env.VITE_AFILIADOS_URL?.replace(/\/$/, '')

export const playUrl = configuredPlayUrl || 'http://localhost:3003'
export const appUrl = configuredAppUrl || playUrl
export const membrosUrl = configuredMembrosUrl || 'http://localhost:3005'
export const adminUrl = configuredAdminUrl || 'http://localhost:3001'
export const afiliadosUrl = configuredAfiliadosUrl || 'http://localhost:3002'

