import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { ToastProvider } from './hooks/useToast'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CentralConteudos from './pages/CentralConteudos'
import NovoConteudo from './pages/NovoConteudo'
import QuizzesManager from './pages/QuizzesManager'
import JogosManager from './pages/JogosManager'
import HomeManager from './pages/HomeManager'
import PlanosManager from './pages/PlanosManager'
import AvataresManager from './pages/AvataresManager'
import ContasManager from './pages/ContasManager'
import LogsManager from './pages/LogsManager'
import Pedidos from './pages/Pedidos'
import Produtos from './pages/Produtos'
import NovoProduto from './pages/NovoProduto'
import CourseWizard from './pages/CourseWizard'
import CourseDashboard from './pages/CourseDashboard'
import MemberManagement from './pages/MemberManagement'
import Clientes from './pages/Clientes'
import Cliente360 from './pages/Cliente360'
import Biblioteca from './pages/Biblioteca'
import Financeiro from './pages/Financeiro'
import Estatisticas from './pages/Estatisticas'
import Configuracoes from './pages/Configuracoes'
import NotificacoesManager from './pages/NotificacoesManager'
import SiteOverview from './pages/site/SiteOverview'
import SiteCategorias from './pages/site/SiteCategorias'
import SiteTemas from './pages/site/SiteTemas'
import SiteColecoes from './pages/site/SiteColecoes'
import SiteMenus from './pages/site/SiteMenus'
import SitePaginas from './pages/site/SitePaginas'
import SiteBanners from './pages/site/SiteBanners'
import SiteSeo from './pages/site/SiteSeo'

function LoadingScreen() {
  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'#f5f3ff', flexDirection:'column', gap:16
    }}>
      <div style={{
        width:52, height:52,
        background:'linear-gradient(135deg,#7c3aed,#5b21b6)',
        borderRadius:16,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:18, fontWeight:800, color:'#fff', letterSpacing:'-0.04em',
        boxShadow:'0 8px 24px rgba(124,58,237,0.35)'
      }}>CDK</div>
      <div className="spinner" style={{ width:24, height:24, borderColor:'#ddd6fe', borderTopColor:'#7c3aed' }} />
    </div>
  )
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/admin" replace />} />
            <Route element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }>
              {/* Dashboard Geral */}
              <Route path="/admin" element={<Dashboard />} />

              {/* CONTEÚDO */}
              <Route path="/admin/conteudos" element={<Navigate to="/admin/produtos" replace />} />
              <Route path="/admin/conteudos/filmes" element={<CentralConteudos fixedType="movie" />} />
              <Route path="/admin/conteudos/series" element={<CentralConteudos fixedType="series" />} />
              <Route path="/admin/conteudos/historias" element={<CentralConteudos fixedType="story" />} />
              <Route path="/admin/conteudos/clipes" element={<CentralConteudos fixedType="clip" />} />
              <Route path="/admin/conteudos/musicas" element={<CentralConteudos fixedType="song" />} />
              <Route path="/admin/conteudos/licoes" element={<CentralConteudos fixedType="lesson" />} />
              <Route path="/admin/conteudos/novo" element={<NovoConteudo />} />
              <Route path="/admin/conteudos/:id" element={<NovoConteudo />} />
              <Route path="/admin/quizzes" element={<QuizzesManager />} />
              <Route path="/admin/jogos" element={<JogosManager />} />
              <Route path="/admin/produtos" element={<Produtos />} />
              <Route path="/admin/produtos/novo" element={<NovoProduto />} />
              <Route path="/admin/produtos/add-01/curso" element={<Navigate to="/products/bw/add/2/info" replace />} />
              <Route path="/products/bw/add/1/info" element={<Navigate to="/products/bw/add/2/info" replace />} />
              <Route path="/products/bw/add/:step/info" element={<CourseWizard />} />
              <Route path="/admin/produtos/curso/:id" element={<CourseDashboard />} />
              <Route path="/membro" element={<MemberManagement />} />
              <Route path="/membro/geral/:section" element={<MemberManagement />} />
              <Route path="/membro/:type/:id" element={<MemberManagement />} />
              <Route path="/membro/:type/:id/:section" element={<MemberManagement />} />
              <Route path="/membro/:type" element={<MemberManagement />} />

              {/* ORGANIZAÇÃO & HOME DO APP */}
              <Route path="/admin/app/home" element={<HomeManager />} />
              <Route path="/admin/avatares" element={<AvataresManager />} />
              <Route path="/admin/biblioteca" element={<Biblioteca />} />

              {/* SITE CMS */}
              <Route path="/admin/site" element={<SiteOverview />} />
              <Route path="/admin/site/categorias" element={<SiteCategorias />} />
              <Route path="/admin/site/temas" element={<SiteTemas />} />
              <Route path="/admin/site/colecoes" element={<SiteColecoes />} />
              <Route path="/admin/site/menus" element={<SiteMenus />} />
              <Route path="/admin/site/paginas" element={<SitePaginas />} />
              <Route path="/admin/site/banners" element={<SiteBanners />} />
              <Route path="/admin/site/seo" element={<SiteSeo />} />

              {/* ASSINATURAS */}
              <Route path="/admin/planos" element={<PlanosManager />} />
              <Route path="/admin/pedidos" element={<Pedidos />} />

              {/* PÚBLICO & CONTAS */}
              <Route path="/admin/contas" element={<ContasManager />} />
              <Route path="/admin/clientes" element={<Clientes />} />
              <Route path="/admin/clientes/:id" element={<Cliente360 />} />

              {/* GESTÃO & AUDITORIA */}
              <Route path="/admin/financeiro" element={<Financeiro />} />
              <Route path="/admin/estatisticas" element={<Estatisticas />} />
              <Route path="/admin/logs" element={<LogsManager />} />
              <Route path="/admin/notificacoes" element={<NotificacoesManager />} />
              <Route path="/admin/configuracoes" element={<Configuracoes />} />
            </Route>
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
