import React from 'react'
import { NavLink } from 'react-router-dom'
import { useProfile } from '../context/ProfileContext'
import { useTVNavigation } from '../hooks/useTVNavigation'
import { getAvatarImageUrl } from '../data/avatars'
import { Home, Tv, Gamepad2, Music, BookOpen, FolderHeart, Download, Clock } from 'lucide-react'

export default function StreamMobileNav() {
  const { activeProfile } = useProfile()
  const { isTV } = useTVNavigation()
  const avatarUrl = getAvatarImageUrl(activeProfile?.avatar_url)

  // Em MODO TV, a barra inferior móvel NUNCA deve ser exibida
  if (isTV) return null

  // DEMAIS DISPOSITIVOS (Celular / Tablet): Acesso a todas as funções complementares
  return (
    <nav
      className="cdk-mobile-bottom-nav"
      style={{
        overflowX: 'auto',
        scrollbarWidth: 'none',
        gap: 8,
        padding: '6px 12px calc(8px + env(safe-area-inset-bottom, 0px))',
        justifyContent: 'flex-start'
      }}
      aria-label="Navegação Móvel"
    >
      <NavLink
        to="/inicio"
        className={({ isActive }) => `cdk-mobile-nav-link ${isActive ? 'active' : ''}`}
      >
        <Home size={18} />
        <span>Início</span>
      </NavLink>

      <NavLink
        to="/series"
        className={({ isActive }) => `cdk-mobile-nav-link ${isActive ? 'active' : ''}`}
      >
        <Tv size={18} />
        <span>Séries</span>
      </NavLink>

      <NavLink
        to="/musicas"
        className={({ isActive }) => `cdk-mobile-nav-link ${isActive ? 'active' : ''}`}
      >
        <Music size={18} />
        <span>Músicas</span>
      </NavLink>

      <NavLink
        to="/jogos"
        className={({ isActive }) => `cdk-mobile-nav-link ${isActive ? 'active' : ''}`}
      >
        <Gamepad2 size={18} />
        <span>Jogos</span>
      </NavLink>

      <NavLink
        to="/aprender"
        className={({ isActive }) => `cdk-mobile-nav-link ${isActive ? 'active' : ''}`}
      >
        <BookOpen size={18} />
        <span>Aprender</span>
      </NavLink>

      <NavLink
        to="/biblioteca"
        className={({ isActive }) => `cdk-mobile-nav-link ${isActive ? 'active' : ''}`}
      >
        <FolderHeart size={18} />
        <span>Biblioteca</span>
      </NavLink>

      <NavLink
        to="/downloads"
        className={({ isActive }) => `cdk-mobile-nav-link ${isActive ? 'active' : ''}`}
      >
        <Download size={18} />
        <span>Downloads</span>
      </NavLink>

      <NavLink
        to="/historico"
        className={({ isActive }) => `cdk-mobile-nav-link ${isActive ? 'active' : ''}`}
      >
        <Clock size={18} />
        <span>Histórico</span>
      </NavLink>

      {/* Perfil Dinâmico no Mobile */}
      <NavLink
        to="/perfil"
        className={({ isActive }) => `cdk-mobile-nav-link ${isActive ? 'active' : ''}`}
      >
        <div style={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          overflow: 'hidden',
          border: '1.5px solid #22c55e'
        }}>
          <img
            src={avatarUrl}
            alt="Perfil"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/avatars/davi.png'
            }}
          />
        </div>
        <span>Perfil</span>
      </NavLink>
    </nav>
  )
}

