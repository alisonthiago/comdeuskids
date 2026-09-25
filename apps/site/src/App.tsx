import React from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import SiteHeader from './components/SiteHeader'
import SiteFooter from './components/SiteFooter'
import Home from './pages/Home'
import Categorias from './pages/Categorias'
import Temas from './pages/Temas'
import Colecoes from './pages/Colecoes'
import Jesus from './pages/Jesus'
import Planos from './pages/Planos'
import ParaFamilias from './pages/ParaFamilias'
import ParaProfessores from './pages/ParaProfessores'
import ParaIgrejas from './pages/ParaIgrejas'
import ParaEscolas from './pages/ParaEscolas'
import ProdutoDetalhe from './pages/ProdutoDetalhe'
import Carrinho from './pages/Carrinho'
import Checkout from './pages/Checkout'
import NotFound from './pages/NotFound'
import './styles/site.css'

function SiteRoutes() {
  const location = useLocation()

  // A página inicial foi preservada a partir da referência fornecida, que inclui
  // os estilos e as artes originais. As demais rotas continuam no storefront React.
  if (location.pathname === '/') {
    return (
      <iframe
        title="Com Deus Kids"
        src="/landing-reference.html"
        className="site-reference-frame"
      />
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <SiteHeader />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/familias" element={<ParaFamilias />} />
          <Route path="/professores" element={<ParaProfessores />} />
          <Route path="/igrejas" element={<ParaIgrejas />} />
          <Route path="/escolas" element={<ParaEscolas />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/categoria/:slug" element={<Categorias />} />
          <Route path="/temas" element={<Temas />} />
          <Route path="/tema/:slug" element={<Temas />} />
          <Route path="/colecoes" element={<Colecoes />} />
          <Route path="/jesus" element={<Jesus />} />
          <Route path="/planos" element={<Planos />} />
          <Route path="/produto/:slug" element={<ProdutoDetalhe />} />
          <Route path="/carrinho" element={<Carrinho />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <SiteFooter />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <SiteRoutes />
    </BrowserRouter>
  )
}
