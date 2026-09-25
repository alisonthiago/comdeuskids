const meta = import.meta as any
const env = meta.env || {}

const configuredAppUrl = env.VITE_APP_URL?.replace(/\/$/, '')
const configuredPlayUrl = (env.VITE_PLAY_URL || env.VITE_APP_URL)?.replace(/\/$/, '')
const configuredMembrosUrl = env.VITE_MEMBROS_URL?.replace(/\/$/, '')
const configuredAdminUrl = env.VITE_ADMIN_URL?.replace(/\/$/, '')

const configuredSiteUrl = env.VITE_SITE_URL?.replace(/\/$/, '')

export const playUrl = configuredPlayUrl || 'http://localhost:3003'
export const appUrl = configuredAppUrl || playUrl
export const membrosUrl = configuredMembrosUrl || 'http://localhost:3005'
export const adminUrl = configuredAdminUrl || 'http://localhost:3001'
export const siteUrl = configuredSiteUrl || 'http://localhost:3000'
