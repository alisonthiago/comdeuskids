import React, { lazy, Suspense, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { supabase } from '@comdeuskids/supabase'
import { ProfileProvider } from './context/ProfileContext'
import { EnvironmentProvider } from './context/EnvironmentContext'
import ContextGuard from './components/ContextGuard'
import ChildModeGuard from './components/ChildModeGuard'
import StreamLayout from './components/StreamLayout'

// Páginas de Streaming, Histórias & Perfis (Design Oficial Stitch)
import SelectProfile from './pages/SelectProfile'

// Páginas de Materiais Digitais & Configurações da Conta
import Login from './pages/Login'

// Experiências de Gestão, Institucional & Perfis (Design Aprovado Stitch)

// Páginas da Experiência Web para Smart TV (10-Foot UI)
import { isSmartTVBrowser } from './hooks/useTVNavigation'
import { TVSessionProvider, useTVSession } from './context/TVSessionContext'

import './styles/app.css'

// Cada tela abaixo é carregada só quando sua rota é acessada. Isso mantém o
// primeiro carregamento leve em celular intermediário e em Smart TVs.
const PrimeiroAcesso = lazy(() => import('./pages/PrimeiroAcesso'))
const StreamHome = lazy(() => import('./pages/StreamHome'))
const StreamSeries = lazy(() => import('./pages/StreamSeries'))
const StreamMusicas = lazy(() => import('./pages/StreamMusicas'))
const StreamJogos = lazy(() => import('./pages/StreamJogos'))
const StreamMinhaLista = lazy(() => import('./pages/StreamMinhaLista'))
const Movies = lazy(() => import('./pages/Movies'))
const Videos = lazy(() => import('./pages/Videos'))
const Clips = lazy(() => import('./pages/Clips'))
const MusicasLouvores = lazy(() => import('./pages/MusicasLouvores'))
const PlayerMusical = lazy(() => import('./pages/PlayerMusical'))
const MinhaLista = lazy(() => import('./pages/MinhaLista'))
const Biblioteca = lazy(() => import('./pages/Biblioteca'))
const Downloads = lazy(() => import('./pages/Downloads'))
const MaterialDetail = lazy(() => import('./pages/MaterialDetail'))
const Assinatura = lazy(() => import('./pages/Assinatura'))
const Perfil = lazy(() => import('./pages/Perfil'))
const MeuEspaco = lazy(() => import('./pages/MeuEspaco'))
const MinhaIgreja = lazy(() => import('./pages/MinhaIgreja'))
const MinhaEscola = lazy(() => import('./pages/MinhaEscola'))
const TurmaDetail = lazy(() => import('./pages/TurmaDetail'))
const Membros = lazy(() => import('./pages/Membros'))
const MembroNovo = lazy(() => import('./pages/MembroNovo'))
const MinhaFamilia = lazy(() => import('./pages/MinhaFamilia'))
const EditProfile = lazy(() => import('./pages/EditProfile'))
const GerenciarPerfis = lazy(() => import('./pages/GerenciarPerfis'))
const ContaSeguranca = lazy(() => import('./pages/ContaSeguranca'))
const Dispositivos = lazy(() => import('./pages/Dispositivos'))
const ContentDetail = lazy(() => import('./pages/ContentDetail'))
const SeriesDetail = lazy(() => import('./pages/SeriesDetail'))
const SeriesHub = lazy(() => import('./pages/SeriesHub'))
const Aprender = lazy(() => import('./pages/Aprender'))
const QuizDetail = lazy(() => import('./pages/QuizDetail'))
const Notificacoes = lazy(() => import('./pages/Notificacoes'))
const Historico = lazy(() => import('./pages/Historico'))
const WatchPlayer = lazy(() => import('./pages/WatchPlayer'))
const MeuComDeusKids = lazy(() => import('./pages/MeuComDeusKids'))
const GamesHub = lazy(() => import('./pages/GamesHub'))
const GamePlayer = lazy(() => import('./pages/GamePlayer'))
const TVLogin = lazy(() => import('./pages/tv/TVLogin'))
const TVAuthApprove = lazy(() => import('./pages/tv/TVAuthApprove'))
const TVSelectProfile = lazy(() => import('./pages/tv/TVSelectProfile'))
const TVHome = lazy(() => import('./pages/tv/TVHome'))
const TVSearch = lazy(() => import('./pages/tv/TVSearch'))
const TVContentDetail = lazy(() => import('./pages/tv/TVContentDetail'))
const TVWatchPlayer = lazy(() => import('./pages/tv/TVWatchPlayer'))
const TVSeriesDetail = lazy(() => import('./pages/tv/TVSeriesDetail'))
const TVMinhaLista = lazy(() => import('./pages/tv/TVMinhaLista'))

function RouteLoadingFallback() {
  return (
    <div className="cdk-loading-screen" aria-busy="true" role="status">
      Carregando Com Deus Kids...
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const location = useLocation()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthenticated(!!session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(!!session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="cdk-loading-screen" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e', background: '#0b0b0d' }}>
        Carregando Com Deus Kids...
      </div>
    )
  }

  if (!authenticated) {
    const returnPath = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?returnTo=${returnPath}`} replace />
  }

  return <>{children}</>
}

function TVAuthorizedRoute({ children }: { children: React.ReactNode }) {
  const { loading, authorized } = useTVSession()
  if (loading) return <div className="cdk-loading-screen" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e', background: '#0b0b0d' }}>Conectando a TV...</div>
  if (!authorized) return <Navigate to="/tv/login" replace />
  return <>{children}</>
}

function TVProtectedRoute({ children }: { children: React.ReactNode }) {
  const { loading, authorized, activeProfile } = useTVSession()
  if (loading) return <div className="cdk-loading-screen" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e', background: '#0b0b0d' }}>Conectando a TV...</div>
  if (!authorized) return <Navigate to="/tv/login" replace />
  if (!activeProfile) return <Navigate to="/tv/perfis" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <EnvironmentProvider>
        <ProfileProvider>
          <TVSessionProvider>
          <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            {/* Rota Pública de Autenticação & Primeiro Acesso Onboarding */}
            <Route path="/login" element={<Login />} />
            <Route path="/primeiro-acesso" element={<PrimeiroAcesso />} />
            <Route path="/onboarding" element={<PrimeiroAcesso />} />
            <Route path="/novo-layout/onboarding-primeiro-acesso" element={<PrimeiroAcesso />} />

            {/* Seleção e Gestão de Perfis */}
            <Route path="/selecionar-perfil" element={<SelectProfile />} />
            <Route path="/quem-vai-acessar" element={<SelectProfile />} />
            <Route
              path="/perfis"
              element={
                <ProtectedRoute>
                  <ChildModeGuard title="Gerenciamento de Perfis">
                    <GerenciarPerfis />
                  </ChildModeGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/gerenciar-perfis"
              element={
                <ProtectedRoute>
                  <ChildModeGuard title="Gerenciamento de Perfis">
                    <GerenciarPerfis />
                  </ChildModeGuard>
                </ProtectedRoute>
              }
            />

            {/* Player Imersivo Web Fullscreen (Protegido) */}
            <Route
              path="/assistir/:id"
              element={
                <ProtectedRoute>
                  <WatchPlayer />
                </ProtectedRoute>
              }
            />

            {/* SHELL GLOBAL ÚNICO — StreamLayout Cinematográfico (Zero Sidebars Antigas) */}
            <Route element={<StreamLayout />}>
              {/* Home & Streaming com o Novo Design Unificado */}
              <Route path="/inicio" element={<StreamHome />} />
              <Route path="/series" element={<StreamSeries />} />
              <Route path="/serie" element={<StreamSeries />} />
              <Route path="/musicas" element={<StreamMusicas />} />
              <Route path="/louvores" element={<StreamMusicas />} />
              <Route path="/jogos" element={<StreamJogos />} />
              <Route path="/minha-lista" element={<StreamMinhaLista />} />
              <Route path="/filmes" element={<Movies />} />
              <Route path="/videos" element={<Videos />} />
              <Route path="/explorar" element={<Videos />} />
              <Route path="/busca" element={<Videos />} />
              <Route path="/conteudo/:slug" element={<ContentDetail />} />
              <Route path="/serie/:slug" element={<SeriesDetail />} />
              <Route path="/series/:slug" element={<SeriesDetail />} />
              <Route path="/continuar-assistindo" element={<SeriesDetail />} />
              <Route path="/detalhes-da-serie" element={<SeriesDetail />} />

              {/* Stories / Clipes & Músicas / Louvores (1:1 Stitch Oficial) */}
              <Route path="/stories" element={<Clips />} />
              <Route path="/clipes" element={<Clips />} />
              <Route path="/player-musical" element={<PlayerMusical />} />
              <Route path="/musicas/player" element={<PlayerMusical />} />

              {/* Aprender & Quizzes Bíblicos Interativos */}
              <Route path="/aprender" element={<Aprender />} />
              <Route path="/aprender/:slug" element={<QuizDetail />} />
              <Route path="/quiz/:id" element={<QuizDetail />} />

              {/* Jogos Bíblicos Interativos no Navegador (Multiplataforma) */}
              <Route path="/jogos" element={<GamesHub />} />
              <Route path="/jogos/:slug" element={<GamePlayer />} />

              {/* Minha Lista, Central de Materiais & Detalhes do Material em PDF (1:1 Stitch) */}
              <Route path="/minha-lista" element={<MinhaLista />} />
              <Route path="/downloads" element={<Downloads />} />
              <Route path="/materiais" element={<Downloads />} />
              <Route path="/materiais/:id" element={<MaterialDetail />} />
              <Route path="/material/:id" element={<MaterialDetail />} />
              <Route path="/materiais-em-pdf" element={<MaterialDetail />} />
              <Route path="/detalhes-do-material" element={<MaterialDetail />} />
              <Route path="/biblioteca" element={<Biblioteca />} />
              <Route path="/favoritos" element={<Biblioteca />} />

              {/* Gestão Institucional: Escola, Igreja, Turmas & Membros (Protegidos por ChildModeGuard & ContextGuard) */}
              <Route
                path="/minha-escola"
                element={
                  <ChildModeGuard title="Ambiente Escolar Protegido">
                    <ContextGuard requiredContext="school">
                      <MinhaEscola />
                    </ContextGuard>
                  </ChildModeGuard>
                }
              />
              <Route
                path="/minha-igreja"
                element={
                  <ChildModeGuard title="Ambiente de Igreja Protegido">
                    <ContextGuard requiredContext="church">
                      <MinhaIgreja />
                    </ContextGuard>
                  </ChildModeGuard>
                }
              />
              <Route path="/turmas/:id" element={<TurmaDetail />} />
              <Route path="/turma/:id" element={<TurmaDetail />} />
              <Route
                path="/membros"
                element={
                  <ChildModeGuard title="Gestão de Membros Protegida">
                    <ContextGuard requiredContext="church">
                      <Membros />
                    </ContextGuard>
                  </ChildModeGuard>
                }
              />
              <Route
                path="/membros/novo"
                element={
                  <ChildModeGuard title="Cadastro de Membro Protegido">
                    <ContextGuard requiredContext="church">
                      <MembroNovo />
                    </ContextGuard>
                  </ChildModeGuard>
                }
              />

              {/* Central Pessoal e Gestão Familiar */}
              <Route path="/meu-com-deus-kids" element={<MeuComDeusKids />} />
              <Route path="/meu-kids" element={<MeuComDeusKids />} />
              <Route
                path="/meu-espaco"
                element={
                  <ChildModeGuard title="Espaço do Professor Protegido">
                    <ContextGuard requiredContext="teacher">
                      <MeuEspaco />
                    </ContextGuard>
                  </ChildModeGuard>
                }
              />
              <Route
                path="/minha-familia"
                element={
                  <ChildModeGuard title="Central da Família Protegida">
                    <MinhaFamilia />
                  </ChildModeGuard>
                }
              />
              <Route path="/meu-perfil" element={<EditProfile />} />
              <Route path="/perfil" element={<Perfil />} />
              <Route path="/editar-perfil" element={<EditProfile />} />
              <Route path="/editar-perfil/avatar" element={<EditProfile />} />
              <Route path="/historico" element={<Historico />} />
              <Route path="/notificacoes" element={<Notificacoes />} />

              {/* Conta Master, Dispositivos Conectados & Assinatura */}
              <Route
                path="/conta"
                element={
                  <ChildModeGuard title="Configurações da Conta Protegida">
                    <ContaSeguranca />
                  </ChildModeGuard>
                }
              />
              <Route
                path="/conta/dispositivos"
                element={
                  <ChildModeGuard title="Dispositivos Protegidos">
                    <Dispositivos />
                  </ChildModeGuard>
                }
              />
              <Route
                path="/dispositivos"
                element={
                  <ChildModeGuard title="Dispositivos Protegidos">
                    <Dispositivos />
                  </ChildModeGuard>
                }
              />
              <Route
                path="/assinatura"
                element={
                  <ChildModeGuard title="Assinatura & Planos">
                    <Assinatura />
                  </ChildModeGuard>
                }
              />
              <Route path="/configuracoes" element={<Perfil />} />
            </Route>

          {/* Experiência Web para Smart TV (10-Foot UI) — Rotas devidamente protegidas */}
          <Route path="/tv/login" element={<TVLogin />} />
          <Route path="/tv/conectar" element={<ProtectedRoute><TVAuthApprove /></ProtectedRoute>} />
          <Route path="/tv-auth" element={<ProtectedRoute><TVAuthApprove /></ProtectedRoute>} />
          <Route path="/tv/perfis" element={<TVAuthorizedRoute><TVSelectProfile /></TVAuthorizedRoute>} />
          <Route path="/tv" element={<TVProtectedRoute><TVHome /></TVProtectedRoute>} />
          <Route path="/tv/inicio" element={<TVProtectedRoute><TVHome /></TVProtectedRoute>} />
          <Route path="/tv/buscar" element={<TVProtectedRoute><TVSearch /></TVProtectedRoute>} />
          <Route path="/tv/conteudo/:slug" element={<TVProtectedRoute><TVContentDetail /></TVProtectedRoute>} />
          <Route path="/tv/assistir/:id" element={<TVProtectedRoute><TVWatchPlayer /></TVProtectedRoute>} />
          <Route path="/tv/serie/:slug" element={<TVProtectedRoute><TVSeriesDetail /></TVProtectedRoute>} />
          <Route path="/tv/minha-lista" element={<TVProtectedRoute><TVMinhaLista /></TVProtectedRoute>} />

          {/* Rota Raiz & Fallback */}
          <Route
            path="/"
            element={
              isSmartTVBrowser() ? (
                <Navigate to="/tv/login" replace />
              ) : (
                <Navigate to="/inicio" replace />
              )
            }
          />
          <Route
            path="*"
            element={
              isSmartTVBrowser() ? (
                <Navigate to="/tv" replace />
              ) : (
                <Navigate to="/inicio" replace />
              )
            }
          />
        </Routes>
          </Suspense>
          </TVSessionProvider>
      </ProfileProvider>
    </EnvironmentProvider>
  </BrowserRouter>
  )
}
