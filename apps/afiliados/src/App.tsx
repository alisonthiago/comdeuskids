import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { LinksDivulgacao } from './pages/LinksDivulgacao'
import { CarteiraSaque } from './pages/CarteiraSaque'
import { ExtratoComissoes } from './pages/ExtratoComissoes'
import { MateriaisApoio } from './pages/MateriaisApoio'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/links" element={<LinksDivulgacao />} />
          <Route path="/carteira" element={<CarteiraSaque />} />
          <Route path="/comissoes" element={<ExtratoComissoes />} />
          <Route path="/materiais" element={<MateriaisApoio />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
