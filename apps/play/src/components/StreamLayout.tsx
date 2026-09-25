import React, { useEffect } from 'react'
import { Outlet, Navigate, useLocation, NavLink } from 'react-router-dom'
import { useProfile } from '../context/ProfileContext'
import { useTVNavigation } from '../hooks/useTVNavigation'
import StreamNavbar from './StreamNavbar'
import StreamMobileNav from './StreamMobileNav'
import {
  Home, Tv, Music, Gamepad2, Heart, Clock, Settings, BookOpen, FolderHeart, Download
} from 'lucide-react'

export default function StreamLayout() {
  const { activeProfile, loading } = useProfile()
  const location = useLocation()
  const { isTV } = useTVNavigation()
  const isClips = location.pathname === '/clipes' || location.pathname === '/stories'
  const isGames = location.pathname.startsWith('/jogar/')

  // Sincroniza estado de MODO TV no body para ativar estilo 10-foot de foco apenas na TV
  useEffect(() => {
    if (isTV) {
      document.body.classList.add('cdk-tv-body')
    } else {
      document.body.classList.remove('cdk-tv-body')
    }
    return () => {
      document.body.classList.remove('cdk-tv-body')
    }
  }, [isTV])

  if (loading) {
    return (
      <div className="cdk-loading-screen">
        <div className="cdk-spinner" />
        <span>Carregando Com Deus Kids...</span>
      </div>
    )
  }

  // Se nenhum perfil foi selecionado ainda, define perfil infantil padrão (Davi) sem forçar redirecionamento
  const effectiveProfile = activeProfile || {
    id: 'prof-davi',
    name: 'Davi',
    avatar_url: '/avatars/davi.png',
    profile_type: 'kid' as const
  }

  // Modo imersivo em tela cheia para jogos interativos e stories (sem sidebars)
  if (isClips || isGames) {
    return (
      <div className="cdk-stream-shell" style={{ overflow: 'hidden', minHeight: '100vh', background: '#08090b' }}>
        <main style={{ width: '100%', height: '100vh', margin: 0, padding: 0 }}>
          <Outlet />
        </main>
      </div>
    )
  }

  const isHomeActive = location.pathname === '/inicio' || location.pathname === '/'
  const isSeriesActive = location.pathname.startsWith('/series') || location.pathname === '/serie' || location.pathname.startsWith('/serie/')
  const isMusicActive = location.pathname.startsWith('/musicas') || location.pathname.startsWith('/louvores')
  const isGamesActive = location.pathname.startsWith('/jogos')
  const isLearnActive = location.pathname.startsWith('/aprender')
  const isLibraryActive = location.pathname.startsWith('/biblioteca') || location.pathname.startsWith('/favoritos')
  const isDownloadsActive = location.pathname.startsWith('/downloads') || location.pathname.startsWith('/materiais')
  const isHistoryActive = location.pathname.startsWith('/historico')
  const isSettingsActive = location.pathname.startsWith('/configuracoes') || location.pathname.startsWith('/perfil')

  return (
    <div className="cdk-stitch-shell">
      {/* 1. SIDEBAR LATERAL FLUTUANTE — SOMENTE WEB DESKTOP/NOTEBOOK (NUNCA NA TV) */}
      {!isTV && (
        <aside className="cdk-stitch-sidebar" aria-label="Navegação Lateral">
          <div className="cdk-sidebar-top-group">
            {/* Início */}
            <NavLink
              to="/inicio"
              tabIndex={0}
              className={`cdk-sidebar-btn ${isHomeActive ? 'active' : ''}`}
              title="Início"
              aria-label="Início"
            >
              <Home size={22} />
            </NavLink>

            {/* Assistir (Séries & Filmes) */}
            <NavLink
              to="/series"
              tabIndex={0}
              className={`cdk-sidebar-btn ${isSeriesActive ? 'active' : ''}`}
              title="Assistir Séries e Filmes"
              aria-label="Assistir Séries e Filmes"
            >
              <Tv size={21} />
            </NavLink>

            {/* Músicas & Louvores */}
            <NavLink
              to="/musicas"
              tabIndex={0}
              className={`cdk-sidebar-btn ${isMusicActive ? 'active' : ''}`}
              title="Músicas e Louvores"
              aria-label="Músicas e Louvores"
            >
              <Music size={21} />
            </NavLink>

            {/* Jogos Bíblicos */}
            <NavLink
              to="/jogos"
              tabIndex={0}
              className={`cdk-sidebar-btn ${isGamesActive ? 'active' : ''}`}
              title="Jogos Bíblicos"
              aria-label="Jogos Bíblicos"
            >
              <Gamepad2 size={21} />
            </NavLink>

            {/* Aprender & Quizzes */}
            <NavLink
              to="/aprender"
              tabIndex={0}
              className={`cdk-sidebar-btn ${isLearnActive ? 'active' : ''}`}
              title="Aprender & Atividades"
              aria-label="Aprender & Atividades"
            >
              <BookOpen size={21} />
            </NavLink>

            {/* Biblioteca & Atividades */}
            <NavLink
              to="/biblioteca"
              tabIndex={0}
              className={`cdk-sidebar-btn ${isLibraryActive ? 'active' : ''}`}
              title="Biblioteca"
              aria-label="Biblioteca"
            >
              <FolderHeart size={21} />
            </NavLink>

            {/* Downloads & Materiais */}
            <NavLink
              to="/downloads"
              tabIndex={0}
              className={`cdk-sidebar-btn ${isDownloadsActive ? 'active' : ''}`}
              title="Downloads"
              aria-label="Downloads"
            >
              <Download size={21} />
            </NavLink>

            {/* Histórico */}
            <NavLink
              to="/historico"
              tabIndex={0}
              className={`cdk-sidebar-btn ${isHistoryActive ? 'active' : ''}`}
              title="Histórico"
              aria-label="Histórico"
            >
              <Clock size={20} />
            </NavLink>
          </div>

          {/* Perfil & Configurações na base da sidebar */}
          <div className="cdk-sidebar-bottom-group">
            <NavLink
              to="/perfil"
              tabIndex={0}
              className={`cdk-sidebar-btn ${isSettingsActive ? 'active' : ''}`}
              title="Perfil & Configurações"
              aria-label="Perfil & Configurações"
            >
              <Settings size={20} />
            </NavLink>
          </div>
        </aside>
      )}

      {/* 2. ÁREA DE CONTEÚDO PRINCIPAL COM TOP BAR E PÁGINAS */}
      <div className={`cdk-stitch-main ${isTV ? 'cdk-main-tv-mode' : ''}`}>
        <StreamNavbar />
        <main style={{ flex: 1, width: '100%' }}>
          <Outlet />
        </main>
      </div>

      {/* 3. NAVEGAÇÃO MOBILE INFERIOR */}
      <StreamMobileNav />
    </div>
  )
}
