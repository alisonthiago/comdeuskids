import React, { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { GameShell, AchievementItem } from '@comdeuskids/game-core'
import { supabase } from '@comdeuskids/supabase'

// Carregamento Lazy Exclusivo por Jogo (Nenhum jogo carrega no bundle do outro)
const DaviGame = lazy(() => import('./games/davi-e-golias/DaviGame'))
const DanielGame = lazy(() => import('./games/daniel-na-cova-dos-leoes/DanielGame'))
const ZaqueuGame = lazy(() => import('./games/zaqueu-o-encontro-com-jesus/ZaqueuGame'))
const AOvelhaPerdidaGame = lazy(() => import('./games/a-ovelha-perdida/AOvelhaPerdidaGame'))

function GameRunner() {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  // Profile ID e Game ID recebidos do APP autenticado
  const profileId = searchParams.get('profile_id')
  const gameId = searchParams.get('game_id') || 'game-03'

  const handleSaveProgress = async (stats: { timeSeconds: number; score: number; stars: number }) => {
    if (!profileId) return
    try {
      await supabase.from('profile_game_progress').upsert({
        profile_id: profileId,
        game_id: gameId,
        completed: true,
        score: stats.score,
        best_score: stats.score,
        best_time_seconds: stats.timeSeconds,
        stars: stats.stars,
        attempts: 1,
        last_played_at: new Date().toISOString()
      }, { onConflict: 'profile_id,game_id' })
    } catch (err) {
      console.warn('Erro ao salvar progresso do jogo:', err)
    }
  }

  const playBaseUrl = (import.meta as any).env?.VITE_PLAY_URL || 'http://localhost:3003'

  const handleExit = () => {
    // Retorna para o APP principal
    if (window.opener) {
      window.close()
    } else {
      window.location.href = `${playBaseUrl.replace(/\/$/, '')}/jogos/${slug || ''}`
    }
  }

  if (slug === 'a-ovelha-perdida' || slug === 'ovelha-perdida') {
    return (
      <Suspense fallback={<div style={{ color: '#fff', textAlign: 'center', paddingTop: 100, fontFamily: 'sans-serif' }}>Carregando A Ovelha Perdida...</div>}>
        <AOvelhaPerdidaGame onExit={handleExit} />
      </Suspense>
    )
  }

  if (slug === 'zaqueu' || slug === 'zaqueu-o-encontro-com-jesus' || slug === 'zaqueu-encontro-com-jesus') {
    return (
      <Suspense fallback={<div style={{ color: '#fff', textAlign: 'center', paddingTop: 100, fontFamily: 'sans-serif' }}>Entrando em Jericó 3D...</div>}>
        <ZaqueuGame onExit={handleExit} />
      </Suspense>
    )
  }

  if (slug === 'davi-e-golias' || slug === 'davi-contra-golias' || slug === 'davi-o-pastor-corajoso' || slug === 'davi') {
    return (
      <Suspense fallback={<div style={{ color: '#fff', textAlign: 'center', paddingTop: 100, fontFamily: 'sans-serif' }}>Carregando Davi e Golias...</div>}>
        <DaviGame onExit={handleExit} profileId={profileId} />
      </Suspense>
    )
  }

  if (slug === 'daniel-na-cova-dos-leoes' || slug === 'daniel-cova-dos-leoes' || slug === 'daniel') {
    return (
      <Suspense fallback={<div style={{ color: '#fff', textAlign: 'center', paddingTop: 100, fontFamily: 'sans-serif' }}>Entrando na Babilônia com Daniel...</div>}>
        <DanielGame onExit={handleExit} profileId={profileId} />
      </Suspense>
    )
  }

  return (
    <div style={{ color: '#fff', textAlign: 'center', paddingTop: 120 }}>
      <h2>Jogo "{slug}" em preparação.</h2>
      <button onClick={handleExit} style={{ padding: '12px 24px', borderRadius: 12, marginTop: 20 }}>
        Voltar ao Com Deus Kids
      </button>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/play/:slug" element={<GameRunner />} />
        <Route path="/:slug" element={<GameRunner />} />
        <Route path="/" element={<div style={{ color: '#fff', padding: 40, textAlign: 'center' }}>Com Deus Kids — Runtime de Jogos</div>} />
      </Routes>
    </BrowserRouter>
  )
}
