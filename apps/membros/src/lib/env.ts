export const getEnv = (key: string, fallback: string): string => {
  return (import.meta as any).env?.[key] || fallback
}

export const APP_URLS = {
  play: getEnv('VITE_PLAY_URL', 'http://localhost:3003'),
  site: getEnv('VITE_SITE_URL', 'http://localhost:3000'),
  adm: getEnv('VITE_ADM_URL', 'http://localhost:3001'),
  membros: getEnv('VITE_MEMBROS_URL', 'http://localhost:3005'),
  games: getEnv('VITE_GAMES_URL', 'http://localhost:3004')
}
