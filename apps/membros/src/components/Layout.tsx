import React, { useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { APP_URLS } from '../lib/env'

export function Layout() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || 'Alison Thiago'
  const userEmail = user?.email || 'alison@comdeuskids.com'

  const handleSignOut = async () => {
    await signOut()
    window.location.href = APP_URLS.play
  }

  const isFamilia = location.pathname.startsWith('/familia') || location.pathname === '/'
  const isProfessor = location.pathname.startsWith('/professor')
  const isIgreja = location.pathname.startsWith('/igreja')
  const isEscola = location.pathname.startsWith('/escola')

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased" style={{ backgroundColor: isFamilia ? '#F7F7F3' : 'rgb(244, 244, 244)' }}>
      {isFamilia && (
        <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[270px] flex-col justify-between border-r border-outline-variant/40 bg-surface-container-lowest px-5 py-6 lg:flex">
          <div className="flex flex-col gap-8">
            <Link to="/familia" className="flex items-center gap-2 px-2" aria-label="Com Deus Kids — início da família">
              <span className="material-symbols-outlined text-[30px] text-primary">auto_stories</span>
              <span className="font-headline-md text-xl font-bold tracking-tight text-on-surface">Com Deus <span className="text-primary">Kids</span></span>
            </Link>
            <nav className="flex flex-col gap-1" aria-label="Navegação da família">
              <NavLink to="/familia" end className={({ isActive }) => `flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm font-semibold transition-colors ${isActive ? 'bg-primary-fixed/60 text-on-surface' : 'text-on-surface-variant hover:bg-surface-container-low'}`}>
                <span className="material-symbols-outlined text-[20px]">home</span>Início
              </NavLink>
              <a href={APP_URLS.play} target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-low">
                <span className="material-symbols-outlined text-[20px]">search</span>Explorar no Play
              </a>
              <a href="#perfis" className="flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-low">
                <span className="material-symbols-outlined text-[20px]">group</span>Meus filhos
              </a>
              <NavLink to="/familia/controles" className={({ isActive }) => `flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm font-medium transition-colors ${isActive ? 'bg-primary-fixed/60 text-on-surface' : 'text-on-surface-variant hover:bg-surface-container-low'}`}>
                <span className="material-symbols-outlined text-[20px]">schedule</span>Tempo de tela
              </NavLink>
              <NavLink to="/familia/dispositivos" className={({ isActive }) => `flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm font-medium transition-colors ${isActive ? 'bg-primary-fixed/60 text-on-surface' : 'text-on-surface-variant hover:bg-surface-container-low'}`}>
                <span className="material-symbols-outlined text-[20px]">download</span>Dispositivos
              </NavLink>
            </nav>
          </div>
          <div className="flex flex-col gap-1 border-t border-outline-variant/40 pt-4">
            <NavLink to="/familia/assinatura" className={({ isActive }) => `flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm font-medium transition-colors ${isActive ? 'bg-primary-fixed/60 text-on-surface' : 'text-on-surface-variant hover:bg-surface-container-low'}`}>
              <span className="material-symbols-outlined text-[20px]">workspace_premium</span>Minha assinatura
            </NavLink>
            <NavLink to="/familia/dispositivos" className={({ isActive }) => `flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm font-medium transition-colors ${isActive ? 'bg-primary-fixed/60 text-on-surface' : 'text-on-surface-variant hover:bg-surface-container-low'}`}>
              <span className="material-symbols-outlined text-[20px]">settings</span>Configurações
            </NavLink>
            <div className="mt-3 flex items-center gap-3 px-3 py-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-fixed text-primary"><span className="material-symbols-outlined">person</span></div>
              <div className="min-w-0"><p className="truncate text-sm font-semibold text-on-surface">{userName}</p><p className="truncate text-xs text-outline">Responsável</p></div>
            </div>
          </div>
        </aside>
      )}
      {/* Sidebar Compacta Fixa Desktop */}
      <aside className={`fixed left-0 top-0 h-screen w-20 bg-surface-container-lowest flex-col justify-between items-center z-40 shadow-[1px_0_12px_rgba(0,0,0,0.02)] py-4 hidden lg:flex ${isFamilia ? 'lg:hidden' : ''}`}>
        <div className="flex flex-col items-center w-full overflow-y-auto gap-4">
          {/* Logo Compacto */}
          <Link
            to="/familia"
            className="h-12 w-12 rounded-xl bg-primary-fixed flex items-center justify-center shrink-0 cursor-pointer shadow-sm hover:scale-105 transition-transform"
            title="Com Deus Kids"
          >
            <span className="material-symbols-outlined text-primary text-[24px]">auto_stories</span>
          </Link>
          <div className="w-10 h-px bg-surface-container-high my-1"></div>

          {/* Navegação Principal */}
          <nav className="flex flex-col items-center gap-2 w-full px-2">
            {/* Minha Família */}
            <NavLink
              to="/familia"
              className={({ isActive }) =>
                `w-12 h-12 flex items-center justify-center rounded-xl transition-all ${
                  isActive || isFamilia
                    ? 'bg-primary-container text-on-primary-container shadow-[0_2px_8px_rgba(255,107,53,0.2)]'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`
              }
              title="Minha Família"
            >
              <span className="material-symbols-outlined text-[22px]">family_restroom</span>
            </NavLink>

            {/* Painel do Professor */}
            <NavLink
              to="/professor"
              className={({ isActive }) =>
                `w-12 h-12 flex items-center justify-center rounded-xl transition-all ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container shadow-[0_2px_8px_rgba(255,107,53,0.2)]'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`
              }
              title="Painel do Professor"
            >
              <span className="material-symbols-outlined text-[22px]">school</span>
            </NavLink>

            {/* Painel da Igreja */}
            <NavLink
              to="/igreja"
              className={({ isActive }) =>
                `w-12 h-12 flex items-center justify-center rounded-xl transition-all ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container shadow-[0_2px_8px_rgba(255,107,53,0.2)]'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`
              }
              title="Painel da Igreja"
            >
              <span className="material-symbols-outlined text-[22px]">church</span>
            </NavLink>

            {/* Painel da Escola */}
            <NavLink
              to="/escola"
              className={({ isActive }) =>
                `w-12 h-12 flex items-center justify-center rounded-xl transition-all ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container shadow-[0_2px_8px_rgba(255,107,53,0.2)]'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`
              }
              title="Painel da Escola"
            >
              <span className="material-symbols-outlined text-[22px]">apartment</span>
            </NavLink>

            {/* Aulas & Conteúdos */}
            <NavLink
              to="/professor/aulas"
              className={({ isActive }) =>
                `w-12 h-12 flex items-center justify-center rounded-xl transition-all ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container shadow-[0_2px_8px_rgba(255,107,53,0.2)]'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`
              }
              title="Aulas & Conteúdos"
            >
              <span className="material-symbols-outlined text-[22px]">menu_book</span>
            </NavLink>

            {/* Turmas & Alunos */}
            <NavLink
              to="/professor/turmas"
              className={({ isActive }) =>
                `w-12 h-12 flex items-center justify-center rounded-xl transition-all ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container shadow-[0_2px_8px_rgba(255,107,53,0.2)]'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`
              }
              title="Turmas & Alunos"
            >
              <span className="material-symbols-outlined text-[22px]">groups</span>
            </NavLink>

            {/* Check-in & Retirada */}
            <NavLink
              to="/igreja/checkin"
              className={({ isActive }) =>
                `w-12 h-12 flex items-center justify-center rounded-xl transition-all ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container shadow-[0_2px_8px_rgba(255,107,53,0.2)]'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`
              }
              title="Check-in & Retirada"
            >
              <span className="material-symbols-outlined text-[22px]">how_to_reg</span>
            </NavLink>

            {/* Controles Parentais */}
            <NavLink
              to="/familia/controles"
              className={({ isActive }) =>
                `w-12 h-12 flex items-center justify-center rounded-xl transition-all ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container shadow-[0_2px_8px_rgba(255,107,53,0.2)]'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`
              }
              title="Controles Parentais"
            >
              <span className="material-symbols-outlined text-[22px]">security</span>
            </NavLink>

            {/* Configurações */}
            <NavLink
              to="/familia/dispositivos"
              className={({ isActive }) =>
                `w-12 h-12 flex items-center justify-center rounded-xl transition-all ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container shadow-[0_2px_8px_rgba(255,107,53,0.2)]'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`
              }
              title="Configurações e Dispositivos"
            >
              <span className="material-symbols-outlined text-[22px]">settings</span>
            </NavLink>
          </nav>
        </div>

        {/* Avatar Compacto Rodapé da Sidebar */}
        <div className="flex flex-col items-center pt-2">
          <button
            onClick={() => setProfileDropdownOpen(v => !v)}
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary hover:opacity-90 shadow-sm transition-all"
            title={`${userName} (${userEmail})`}
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">person</span>
          </button>
        </div>
      </aside>

      {/* Menu Mobile Dropdown (Desce do topo ao clicar no menu) */}
      <div className={`lg:hidden ${mobileMenuOpen ? '' : 'hidden'}`}>
        <div
          className="fixed inset-0 top-20 bg-on-background/40 backdrop-blur-sm z-30 transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
        <div className="fixed top-20 left-0 right-0 z-40 max-h-[calc(100vh-5rem)] bg-surface-container-lowest/98 backdrop-blur-2xl shadow-2xl border-b border-surface-container-high rounded-b-3xl overflow-y-auto">
          <div className="p-4 sm:p-6 flex flex-col gap-4 max-w-2xl mx-auto">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">auto_stories</span>
                </div>
                <span className="font-caption text-xs font-semibold text-outline uppercase tracking-wider">
                  Navegação da Família
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-fixed/50 text-on-primary-fixed-variant font-label-sm text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                Área Ativa
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-surface-container-low/70 p-2.5 rounded-2xl border border-surface-container/60">
              <Link
                to="/familia"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl bg-surface-container-lowest shadow-sm border border-primary-container/30 min-h-[48px] transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(255,107,53,0.2)]">
                    <span className="material-symbols-outlined text-[20px]">family_restroom</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-label-md text-sm font-bold text-on-surface truncate">Minha Família</span>
                      <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-caption text-[11px] font-semibold">Principal</span>
                    </div>
                    <span className="font-caption text-xs text-outline truncate">Acompanhamento e perfis</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-primary text-[18px] shrink-0">chevron_right</span>
              </Link>

              <Link
                to="/familia/controles"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-container-lowest bg-surface-container-lowest/40 text-on-surface-variant hover:text-on-surface min-h-[48px] transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary-fixed/50 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">hourglass_top</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-md text-sm font-semibold text-on-surface truncate">Tempo de Tela</span>
                    <span className="font-caption text-xs text-outline truncate">Hoje: 42 min de 1h</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline group-hover:text-on-surface text-[18px] shrink-0 transition-colors">chevron_right</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo com Header Fixo */}
      <div className={`flex flex-col min-h-screen ${isFamilia ? 'lg:pl-[270px]' : 'lg:pl-20'}`}>
        {/* Header Fixo */}
        <header className={`fixed top-0 right-0 h-20 bg-surface-container-lowest/95 backdrop-blur-xl z-50 shadow-[0_1px_8px_rgba(0,0,0,0.03)] px-4 sm:px-6 md:px-gutter-lg flex items-center justify-between gap-3 left-0 ${isFamilia ? 'lg:left-[270px]' : 'lg:left-20'}`}>
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            {/* Botão Hambúrguer Mobile */}
            <button
              aria-label="Abrir menu de navegação"
              className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-surface-container-low text-on-surface hover:bg-surface-container transition-colors shrink-0"
              onClick={() => setMobileMenuOpen(v => !v)}
              type="button"
            >
              <span className="material-symbols-outlined text-[24px]">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>

            {/* Logo Mobile */}
            <div className="flex items-center gap-2 shrink-0 sm:hidden">
              <div className="h-8 w-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary shadow-sm">
                <span className="material-symbols-outlined text-[18px]">auto_stories</span>
              </div>
              <span className="font-headline-md text-sm font-bold text-on-surface tracking-tight">Com Deus Kids</span>
            </div>

            {/* Barra de Busca Central */}
            <div className="flex-1 max-w-xs sm:max-w-md hidden sm:block">
              <div
                className="flex items-center gap-2 bg-surface-container-low px-3.5 py-2 rounded-full min-h-[44px] transition-all hover:bg-surface-container"
                style={{ backgroundColor: isFamilia ? '#F7F7F3' : 'rgb(244, 244, 244)' }}
              >
                <span className="material-symbols-outlined text-outline text-[20px] shrink-0">search</span>
                <input
                  className="bg-transparent border-0 outline-none w-full text-on-surface font-body-md text-sm placeholder:text-outline truncate"
                  placeholder="Buscar lições ou atividades..."
                  type="text"
                />
              </div>
            </div>
          </div>

          {/* Ações da Direita */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Botão Ir para o Play */}
            <a
              className="flex items-center justify-center gap-2 bg-primary-fixed hover:bg-primary-fixed-dim text-on-primary-fixed px-3 sm:px-4 py-2 rounded-full transition-all min-h-[44px]"
              href={APP_URLS.play}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="material-symbols-outlined text-[20px]">play_circle</span>
              <span className="hidden sm:inline font-label-md text-sm font-semibold">Ir para o Play</span>
            </a>

            {/* Notificações */}
            <button
              aria-label="Notificações"
              className="relative min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary-container ring-2 ring-surface-container-lowest"></span>
            </button>

            {/* Avatar do Usuário com Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(v => !v)}
                type="button"
                className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-primary flex items-center justify-center shrink-0 cursor-pointer shadow-sm hover:scale-105 active:scale-95 ring-2 ring-transparent hover:ring-primary-container/40 transition-all focus:outline-none"
                title="Abrir menu do perfil"
              >
                <span className="material-symbols-outlined text-on-primary text-[20px]">person</span>
              </button>

              {profileDropdownOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-80 sm:w-88 max-w-[90vw] bg-surface-container-lowest/98 backdrop-blur-2xl border border-surface-container-high shadow-2xl rounded-2xl p-3 z-50 transition-all duration-200"
                >
                  <div className="flex items-center gap-3 p-2 bg-surface-container-low/70 rounded-xl mb-3">
                    <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold shrink-0 shadow-sm">
                      <span className="material-symbols-outlined text-[20px]">person</span>
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-label-md text-sm font-bold text-on-surface truncate">{userName}</span>
                        <span className="px-1.5 py-0.5 rounded-full bg-secondary-container/30 text-on-secondary-container font-caption text-[11px] font-semibold shrink-0">
                          Responsável
                        </span>
                      </div>
                      <span className="font-caption text-xs text-outline truncate">{userEmail}</span>
                    </div>
                  </div>

                  {/* Alternar Módulo */}
                  <div className="mb-3">
                    <div className="px-2 mb-1.5 flex items-center justify-between">
                      <span className="font-caption text-[11px] font-semibold text-outline uppercase tracking-wider">
                        Alternar Módulo
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => { navigate('/familia'); setProfileDropdownOpen(false) }}
                        className="flex items-center gap-2 p-2 rounded-xl bg-primary-fixed/50 text-on-primary-fixed-variant hover:bg-primary-fixed transition-colors text-left"
                      >
                        <span className="material-symbols-outlined text-primary text-[18px]">family_restroom</span>
                        <span className="font-label-sm text-xs font-semibold truncate">Família</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { navigate('/professor'); setProfileDropdownOpen(false) }}
                        className="flex items-center gap-2 p-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors text-left"
                      >
                        <span className="material-symbols-outlined text-[18px]">school</span>
                        <span className="font-label-sm text-xs font-semibold truncate">Professor</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { navigate('/igreja'); setProfileDropdownOpen(false) }}
                        className="flex items-center gap-2 p-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors text-left"
                      >
                        <span className="material-symbols-outlined text-[18px]">church</span>
                        <span className="font-label-sm text-xs font-semibold truncate">Ministério</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { navigate('/escola'); setProfileDropdownOpen(false) }}
                        className="flex items-center gap-2 p-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors text-left"
                      >
                        <span className="material-symbols-outlined text-[18px]">apartment</span>
                        <span className="font-label-sm text-xs font-semibold truncate">Escola</span>
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-surface-container/60 my-1"></div>

                  {/* Links de Configuração */}
                  <div className="flex flex-col py-1">
                    <Link
                      to="/familia/controles"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-on-surface hover:bg-surface-container-low transition-colors"
                    >
                      <span className="material-symbols-outlined text-outline text-[20px]">security</span>
                      <span className="font-label-md text-xs sm:text-sm font-medium">Controles Parentais &amp; Limites</span>
                    </Link>
                    <Link
                      to="/familia/dispositivos"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-on-surface hover:bg-surface-container-low transition-colors"
                    >
                      <span className="material-symbols-outlined text-outline text-[20px]">devices</span>
                      <span className="font-label-md text-xs sm:text-sm font-medium">Dispositivos Conectados</span>
                    </Link>
                    <Link
                      to="/familia/assinatura"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-on-surface hover:bg-surface-container-low transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-[20px]">stars</span>
                        <span className="font-label-md text-xs sm:text-sm font-medium">Minha Assinatura CDK</span>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-secondary"></span>
                    </Link>
                  </div>

                  <div className="border-t border-surface-container/60 my-1"></div>

                  <div className="flex flex-col pt-1">
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-error hover:bg-error-container/40 transition-colors w-full text-left"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      <span className="font-label-md text-xs sm:text-sm font-semibold">Sair da Conta</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Conteúdo da Rota */}
        <main className="relative min-h-screen bg-background overflow-hidden px-4 sm:px-6 md:px-gutter-lg py-8 pt-24" style={{ backgroundColor: isFamilia ? '#F7F7F3' : 'rgb(244, 244, 244)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
