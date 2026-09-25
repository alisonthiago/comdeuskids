const configuredAppUrl = import.meta.env.VITE_APP_URL?.replace(/\/$/, '')
const configuredPlayUrl = (import.meta.env.VITE_PLAY_URL || import.meta.env.VITE_APP_URL)?.replace(/\/$/, '')
const configuredMembrosUrl = import.meta.env.VITE_MEMBROS_URL?.replace(/\/$/, '')

export const playUrl = configuredPlayUrl || 'http://localhost:3003'
export const appUrl = configuredAppUrl || playUrl
export const membrosUrl = configuredMembrosUrl || 'http://localhost:3005'

