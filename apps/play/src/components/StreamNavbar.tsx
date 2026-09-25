import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useProfile } from '../context/ProfileContext'
import { useTVNavigation } from '../hooks/useTVNavigation'
import { useTVSession } from '../context/TVSessionContext'
import {
  Search,
  Bell,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Check,
  Pencil,
  ArrowLeftRight,
  User,
  ShieldCheck,
  Settings,
  HelpCircle,
  LogOut
} from 'lucide-react'
import { getAvatarImageUrl } from '../data/avatars'

export default function StreamNavbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { profiles, activeProfile, selectProfile, clearActiveProfile } = useProfile()
  const { isTV } = useTVNavigation()
  const { authorized: tvAuthorized } = useTVSession()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/videos?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
    }
  }

  const avatarUrl = getAvatarImageUrl(activeProfile?.avatar_url)

  interface DropdownProfileItem {
    id: string
    name: string
    role: string
    avatar: string
    isReal: boolean
    raw?: Parameters<typeof selectProfile>[0]
  }

  // Outros perfis: usa perfis reais cadastrados ou fallback de visualização da família Com Deus Kids
  const fallbackOtherProfiles: DropdownProfileItem[] = [
    { id: 'zezeu', name: 'Zezeu', role: 'Perfil Infantil', avatar: '/avatars/daniel.png', isReal: false },
    { id: 'gui', name: 'Gui', role: 'Perfil Infantil', avatar: '/avatars/pedro.png', isReal: false },
    { id: 'bela', name: 'Bela', role: 'Perfil Infantil', avatar: '/avatars/sara.png', isReal: false }
  ]

  const realOthers: DropdownProfileItem[] = (profiles || [])
    .filter(p => p.id !== activeProfile?.id)
    .map(p => ({
      id: p.id,
      name: p.name,
      role: p.profile_type === 'parent' ? 'Perfil Adulto' : 'Perfil Infantil',
      avatar: getAvatarImageUrl(p.avatar_url),
      isReal: true,
      raw: p
    }))

  const otherProfiles = realOthers.length > 0
    ? realOthers.slice(0, 3)
    : fallbackOtherProfiles

  const navTabs = [
    { to: '/inicio', label: 'Início', isActive: (path: string) => path === '/inicio' || path === '/' },
    { to: '/series', label: 'Séries', isActive: (path: string) => path.startsWith('/series') || path === '/serie' || path.startsWith('/serie/') },
    { to: '/musicas', label: 'Músicas', isActive: (path: string) => path.startsWith('/musicas') || path.startsWith('/louvores') },
    { to: '/jogos', label: 'Jogos', isActive: (path: string) => path.startsWith('/jogos') },
    { to: '/minha-lista', label: 'Minha Lista', isActive: (path: string) => path.startsWith('/minha-lista') }
  ]

  return (
    <header
      className={`cdk-stitch-header${isScrolled ? ' is-scrolled' : ''}${isTV ? ' cdk-stitch-header--tv' : ''}`}
    >
      <div className="cdk-stream-container cdk-header-inner">
        {/* 1. LADO ESQUERDO: LOGOTIPO OFICIAL COM DEUS KIDS */}
        <NavLink to="/inicio" className="cdk-header-brand" data-tv-focus tabIndex={0}>
          <span className="cdk-header-brand-title">Com Deus</span>
          <span className="cdk-header-brand-kids">Kids</span>
        </NavLink>

        {/* 2. CENTRO: TABS SUPERIORES (Início, Séries, Músicas, Jogos, Minha Lista) */}
        <nav className="cdk-header-tabs" aria-label="Navegação Principal">
          {navTabs.map(tab => {
            const active = tab.isActive(location.pathname)
            const isSpecialOutline = tab.to === '/series' || tab.to === '/musicas' || tab.to === '/jogos'
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                data-tv-focus
                tabIndex={0}
                className={`cdk-header-tab cdk-tv-focus ${active ? 'active' : ''} ${isSpecialOutline ? 'green-outline' : ''}`}
              >
                {tab.label}
              </NavLink>
            )
          })}
        </nav>

        {/* 3. LADO DIREITO: BUSCA, NOTIFICAÇÃO & NOVO AVATAR/POPUP DE PERFIL */}
        <div className="cdk-header-actions" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Campo de Busca Expansível */}
          {searchOpen ? (
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
              <input
                type="text"
                placeholder="Buscar histórias, músicas..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                autoFocus
                onBlur={() => { if (!searchQuery) setSearchOpen(false) }}
                style={{
                  width: 200,
                  padding: '7px 34px 7px 14px',
                  borderRadius: 9999,
                  backgroundColor: '#181920',
                  border: '1.5px solid #22c55e',
                  color: '#fff',
                  fontSize: 13,
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
              <button
                type="submit"
                style={{
                  position: 'absolute',
                  right: 8,
                  background: 'none',
                  border: 'none',
                  color: '#22c55e',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Search size={16} />
              </button>
            </form>
          ) : (
            <button
              type="button"
              data-tv-focus
              tabIndex={0}
              onClick={() => setSearchOpen(true)}
              className="cdk-header-icon-btn cdk-tv-focus"
              title="Buscar"
              aria-label="Buscar"
            >
              <Search size={20} />
            </button>
          )}

          {/* Sino de Notificações com Badge Numérico (Fiel à referência) */}
          <button
            type="button"
            data-tv-focus
            tabIndex={0}
            onClick={() => navigate('/notificacoes')}
            className="cdk-header-bell-btn cdk-tv-focus"
            title="Notificações"
            aria-label="Notificações (6 novas)"
          >
            <Bell size={19} />
            <span className="cdk-header-bell-badge">6</span>
          </button>

          {/* Trigger do Avatar com Anel Neon Verde e Seta */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              data-tv-focus
              tabIndex={0}
              onClick={() => setDropdownOpen(prev => !prev)}
              className="cdk-avatar-trigger cdk-tv-focus"
              title={activeProfile?.name || 'Perfil'}
              aria-label="Menu do Perfil"
              aria-expanded={dropdownOpen}
            >
              <div className="cdk-avatar-glow-ring">
                <img
                  src={avatarUrl}
                  alt={activeProfile?.name || 'Perfil'}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/avatars/davi.png'
                  }}
                />
              </div>
              {dropdownOpen ? (
                <ChevronUp size={18} color="#22c55e" strokeWidth={2.5} />
              ) : (
                <ChevronDown size={18} color="#22c55e" strokeWidth={2.5} />
              )}
            </button>

            {/* Overlay invisível para fechar ao clicar fora */}
            {dropdownOpen && (
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 140 }}
                onClick={() => setDropdownOpen(false)}
              />
            )}

            {/* NOVO POPUP DE PERFIL (1:1 COM A REFERÊNCIA VISUAL) */}
            {dropdownOpen && (
              <div className="cdk-profile-dropdown" role="menu">
                {/* 1. Topo: "Quem está assistindo?" + "Ver todos >" */}
                <div className="cdk-profile-dropdown-header">
                  <div className="cdk-profile-dropdown-title">
                    <span className="cdk-profile-dropdown-title-white">Quem está</span>
                    <span className="cdk-profile-dropdown-title-green">assistindo?</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false)
                      navigate(isTV ? '/tv/perfis' : '/selecionar-perfil')
                    }}
                    className="cdk-profile-view-all-btn"
                  >
                    Ver todos
                    <ChevronRight size={13} strokeWidth={2.5} />
                  </button>
                </div>

                {/* 2. Lista de Perfis com Destaque Neon no Ativo */}
                <div className="cdk-profile-dropdown-list">
                  {/* Perfil Ativo Selecionado */}
                  <button
                    type="button"
                    className="cdk-profile-item-active"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <div className="cdk-profile-item-left">
                      <img
                        src={avatarUrl}
                        alt={activeProfile?.name || 'adv.nadiaborges'}
                        className="cdk-profile-avatar-thumb"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/avatars/davi.png'
                        }}
                      />
                      <div className="cdk-profile-info">
                        <span className="cdk-profile-name">
                          {activeProfile?.name || 'adv.nadiaborges'}
                        </span>
                        <span className="cdk-profile-sub">
                          {activeProfile?.profile_type === 'parent' ? 'Perfil Adulto' : 'Perfil Infantil'}
                        </span>
                      </div>
                    </div>
                    <div className="cdk-profile-check-badge">
                      <Check size={14} strokeWidth={3} />
                    </div>
                  </button>

                  {/* Outros Perfis Cadastrados/Família */}
                  {otherProfiles.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      className="cdk-profile-item"
                      onClick={() => {
                        if (p.isReal && p.raw) {
                          selectProfile(p.raw)
                        }
                        setDropdownOpen(false)
                      }}
                    >
                      <div className="cdk-profile-item-left">
                        <img
                          src={p.avatar}
                          alt={p.name}
                          className="cdk-profile-avatar-thumb"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/avatars/davi.png'
                          }}
                        />
                        <div className="cdk-profile-info">
                          <span className="cdk-profile-name">{p.name}</span>
                          <span className="cdk-profile-sub">{p.role}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Divisor */}
                <div className="cdk-profile-divider" />

                {/* 3. Menus de Gestão & Configurações da Conta */}
                <div className="cdk-profile-menu-list">
                  <button
                    type="button"
                    className="cdk-profile-menu-item"
                    onClick={() => {
                      setDropdownOpen(false)
                      navigate(isTV ? '/tv/perfis' : '/gerenciar-perfis')
                    }}
                  >
                    <div className="cdk-profile-menu-left">
                      <span className="cdk-profile-menu-icon">
                        <Pencil size={18} />
                      </span>
                      <div className="cdk-profile-menu-text">
                        <span className="cdk-profile-menu-title">Gerenciar perfis</span>
                        <span className="cdk-profile-menu-desc">Editar, adicionar ou remover</span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="cdk-profile-menu-chevron" />
                  </button>

                  <button
                    type="button"
                    className="cdk-profile-menu-item"
                    onClick={() => {
                      setDropdownOpen(false)
                      navigate('/perfil')
                    }}
                  >
                    <div className="cdk-profile-menu-left">
                      <span className="cdk-profile-menu-icon">
                        <ArrowLeftRight size={18} />
                      </span>
                      <div className="cdk-profile-menu-text">
                        <span className="cdk-profile-menu-title">Transferir perfil</span>
                        <span className="cdk-profile-menu-desc">Mover para outra conta</span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="cdk-profile-menu-chevron" />
                  </button>

                  <button
                    type="button"
                    className="cdk-profile-menu-item"
                    onClick={() => {
                      setDropdownOpen(false)
                      navigate('/conta-seguranca')
                    }}
                  >
                    <div className="cdk-profile-menu-left">
                      <span className="cdk-profile-menu-icon">
                        <User size={18} />
                      </span>
                      <div className="cdk-profile-menu-text">
                        <span className="cdk-profile-menu-title">Conta</span>
                        <span className="cdk-profile-menu-desc">Dados, assinatura e segurança</span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="cdk-profile-menu-chevron" />
                  </button>

                  <button
                    type="button"
                    className="cdk-profile-menu-item"
                    onClick={() => {
                      setDropdownOpen(false)
                      navigate('/dispositivos')
                    }}
                  >
                    <div className="cdk-profile-menu-left">
                      <span className="cdk-profile-menu-icon">
                        <ShieldCheck size={18} />
                      </span>
                      <div className="cdk-profile-menu-text">
                        <span className="cdk-profile-menu-title">Controle Parental</span>
                        <span className="cdk-profile-menu-desc">Tempo de tela e restrições</span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="cdk-profile-menu-chevron" />
                  </button>

                  <button
                    type="button"
                    className="cdk-profile-menu-item"
                    onClick={() => {
                      setDropdownOpen(false)
                      navigate('/perfil')
                    }}
                  >
                    <div className="cdk-profile-menu-left">
                      <span className="cdk-profile-menu-icon">
                        <Settings size={18} />
                      </span>
                      <div className="cdk-profile-menu-text">
                        <span className="cdk-profile-menu-title">Configurações</span>
                        <span className="cdk-profile-menu-desc">Idioma, qualidade, acessibilidade</span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="cdk-profile-menu-chevron" />
                  </button>

                  <button
                    type="button"
                    className="cdk-profile-menu-item"
                    onClick={() => {
                      setDropdownOpen(false)
                      navigate('/notificacoes')
                    }}
                  >
                    <div className="cdk-profile-menu-left">
                      <span className="cdk-profile-menu-icon">
                        <HelpCircle size={18} />
                      </span>
                      <div className="cdk-profile-menu-text">
                        <span className="cdk-profile-menu-title">Central de Ajuda</span>
                        <span className="cdk-profile-menu-desc">Dúvidas e suporte</span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="cdk-profile-menu-chevron" />
                  </button>
                </div>

                {/* Divisor */}
                <div className="cdk-profile-divider" />

                {/* 4. Sair do Com Deus Kids */}
                <button
                  type="button"
                  className="cdk-profile-logout-item"
                  onClick={() => {
                    setDropdownOpen(false)
                    clearActiveProfile()
                    navigate('/selecionar-perfil')
                  }}
                >
                  <div className="cdk-profile-logout-left">
                    <span className="cdk-profile-logout-icon">
                      <LogOut size={18} />
                    </span>
                    <span className="cdk-profile-logout-title">Sair do Com Deus Kids</span>
                  </div>
                  <ChevronRight size={16} className="cdk-profile-menu-chevron" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
