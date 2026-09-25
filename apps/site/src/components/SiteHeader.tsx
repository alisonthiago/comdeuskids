import React, { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ShoppingBag, Play, User, Menu, X, ArrowRight } from 'lucide-react'
import { playUrl, membrosUrl } from '../lib/appUrl'

export default function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="site-header" style={{ position: 'sticky', top: 0, zIndex: 100, background: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: 1280, margin: '0 auto', padding: '0 16px' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 40, height: 40, background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
            borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 17, boxShadow: '0 4px 14px rgba(124,58,237,0.3)'
          }}>CDK</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.1 }}>Com Deus Kids</div>
            <div style={{ fontSize: 11, color: '#7c3aed', fontWeight: 700 }}>Educação Bíblica Infantil</div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="site-nav" style={{ display: 'flex', gap: 6 }}>
          <NavLink to="/" end className={({ isActive }) => `site-nav-link ${isActive ? 'active' : ''}`}>Início</NavLink>
          <NavLink to="/familias" className={({ isActive }) => `site-nav-link ${isActive ? 'active' : ''}`}>Para Famílias</NavLink>
          <NavLink to="/professores" className={({ isActive }) => `site-nav-link ${isActive ? 'active' : ''}`}>Para Professores</NavLink>
          <NavLink to="/igrejas" className={({ isActive }) => `site-nav-link ${isActive ? 'active' : ''}`}>Para Igrejas</NavLink>
          <NavLink to="/escolas" className={({ isActive }) => `site-nav-link ${isActive ? 'active' : ''}`}>Para Escolas</NavLink>
          <NavLink to="/planos" className={({ isActive }) => `site-nav-link ${isActive ? 'active' : ''}`}>Planos</NavLink>
          <NavLink to="/categorias" className={({ isActive }) => `site-nav-link ${isActive ? 'active' : ''}`}>Conteúdos</NavLink>
        </nav>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <a
            href={playUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13,
              fontWeight: 700, color: '#7c3aed', padding: '8px 14px', borderRadius: 8,
              background: 'rgba(124, 58, 237, 0.08)', textDecoration: 'none'
            }}
          >
            <Play size={13} fill="#7c3aed" />
            <span>Play</span>
          </a>

          <a
            href={membrosUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13,
              fontWeight: 700, color: '#475569', padding: '8px 14px', borderRadius: 8,
              background: '#f8fafc', border: '1px solid #e2e8f0', textDecoration: 'none'
            }}
          >
            <User size={13} />
            <span>Entrar</span>
          </a>

          <Link
            to="/planos"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, background: '#7c3aed',
              color: '#fff', padding: '9px 18px', borderRadius: 10, fontWeight: 800,
              fontSize: 13, boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)', textDecoration: 'none'
            }}
          >
            <span>Começar</span>
            <ArrowRight size={14} />
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none', background: 'transparent', border: 'none',
              padding: 6, cursor: 'pointer', color: '#1e293b'
            }}
            className="site-mobile-toggle"
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed', top: 60, left: 0, right: 0, bottom: 0,
          background: '#fff', padding: 24, display: 'flex', flexDirection: 'column', gap: 16, zIndex: 99
        }}>
          <NavLink to="/" end onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', textDecoration: 'none' }}>Início</NavLink>
          <NavLink to="/familias" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', textDecoration: 'none' }}>Para Famílias</NavLink>
          <NavLink to="/professores" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', textDecoration: 'none' }}>Para Professores</NavLink>
          <NavLink to="/igrejas" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', textDecoration: 'none' }}>Para Igrejas</NavLink>
          <NavLink to="/escolas" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', textDecoration: 'none' }}>Para Escolas</NavLink>
          <NavLink to="/planos" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', textDecoration: 'none' }}>Planos Oficiais</NavLink>
          <NavLink to="/categorias" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', textDecoration: 'none' }}>Catálogo de Conteúdos</NavLink>
        </div>
      )}
    </header>
  )
}
