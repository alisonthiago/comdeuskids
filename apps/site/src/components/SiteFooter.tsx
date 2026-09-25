import React from 'react'
import { Link } from 'react-router-dom'
import { appUrl, playUrl, membrosUrl, afiliadosUrl } from '../lib/appUrl'

export default function SiteFooter() {
  return (
    <footer className="site-footer" style={{ background: '#0b0f19', color: '#94a3b8', padding: '64px 24px 32px', marginTop: 'auto' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 48 }}>
        {/* Marca & Missão */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{
              width: 36, height: 36, background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 800, fontSize: 16
            }}>CDK</div>
            <div style={{ fontWeight: 800, fontSize: 18, color: '#fff' }}>Com Deus Kids</div>
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: '#94a3b8', margin: 0 }}>
            Plataforma cristã infantil dedicada a fortalecer lares, igrejas e escolas com a Palavra de Deus de forma pura, alegre e segura.
          </p>
        </div>

        {/* 1. Produto */}
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 14 }}>Produto</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
            <a href={playUrl} target="_blank" rel="noreferrer" style={{ color: '#94a3b8', textDecoration: 'none' }}>Com Deus Kids Play</a>
            <Link to="/categorias" style={{ color: '#94a3b8', textDecoration: 'none' }}>Filmes & Animações</Link>
            <Link to="/temas" style={{ color: '#94a3b8', textDecoration: 'none' }}>Histórias da Bíblia</Link>
            <Link to="/colecoes" style={{ color: '#94a3b8', textDecoration: 'none' }}>Cadernos de Colorir (PDF)</Link>
            <Link to="/planos" style={{ color: '#94a3b8', textDecoration: 'none' }}>Tabela de Planos</Link>
          </div>
        </div>

        {/* 2. Soluções */}
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 14 }}>Soluções</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
            <Link to="/familias" style={{ color: '#94a3b8', textDecoration: 'none' }}>Para Famílias & Pais</Link>
            <Link to="/professores" style={{ color: '#94a3b8', textDecoration: 'none' }}>Para Professores & EBD</Link>
            <Link to="/igrejas" style={{ color: '#94a3b8', textDecoration: 'none' }}>Para Igrejas & Ministérios</Link>
            <Link to="/escolas" style={{ color: '#94a3b8', textDecoration: 'none' }}>Para Escolas Cristãs</Link>
            <a href={afiliadosUrl} target="_blank" rel="noreferrer" style={{ color: '#94a3b8', textDecoration: 'none' }}>Programa de Afiliados</a>
          </div>
        </div>

        {/* 3. Ajuda & Suporte */}
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 14 }}>Ajuda</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
            <a href={membrosUrl} target="_blank" rel="noreferrer" style={{ color: '#94a3b8', textDecoration: 'none' }}>Acessar Minha Conta</a>
            <a href={`${playUrl}/tv/conectar`} target="_blank" rel="noreferrer" style={{ color: '#94a3b8', textDecoration: 'none' }}>Conectar TV da Sala</a>
            <span style={{ color: '#64748b' }}>Central de Dúvidas</span>
            <span style={{ color: '#64748b' }}>Contato de Atendimento</span>
          </div>
        </div>

        {/* 4. Institucional & Legal */}
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 14 }}>Institucional & Legal</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
            <Link to="/termos" style={{ color: '#94a3b8', textDecoration: 'none' }}>Termos de Uso</Link>
            <Link to="/privacidade" style={{ color: '#94a3b8', textDecoration: 'none' }}>Política de Privacidade</Link>
            <Link to="/seguranca" style={{ color: '#94a3b8', textDecoration: 'none' }}>Proteção Infantil & Dados</Link>
            <span style={{ color: '#64748b' }}>Sobre o Com Deus Kids</span>
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: 1200, margin: '0 auto', paddingTop: 24,
        borderTop: '1px solid #1e293b', textAlign: 'center', fontSize: 12, color: '#64748b'
      }}>
        © {new Date().getFullYear()} Com Deus Kids — Todos os direitos reservados. Feito com amor para a glória de Deus.
      </div>
    </footer>
  )
}
