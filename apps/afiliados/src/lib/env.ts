const meta = import.meta as any
const env = meta.env || {}

export const APP_URLS = {
  site: env.VITE_SITE_URL || 'http://localhost:3000',
  adm: env.VITE_ADM_URL || 'http://localhost:3001',
  play: env.VITE_PLAY_URL || 'http://localhost:3003',
  games: env.VITE_GAMES_URL || 'http://localhost:3004',
  membros: env.VITE_MEMBROS_URL || 'http://localhost:3005',
  afiliados: env.VITE_AFILIADOS_URL || 'http://localhost:3006'
}
