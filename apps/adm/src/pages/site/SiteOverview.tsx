import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Globe, Layers, Sparkles, BookOpen, Menu, FileText,
  Film, BarChart3, ExternalLink, ArrowRight, CheckCircle2
} from 'lucide-react'
import { supabase } from '@comdeuskids/supabase'

export default function SiteOverview() {
  const [stats, setStats] = useState({
    categoriesCount: 0,
    themesCount: 0,
    productsCount: 0,
    collectionsCount: 3
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const [catRes, themeRes, prodRes] = await Promise.all([
          supabase.from('categories').select('id', { count: 'exact', head: true }),
          supabase.from('themes').select('id', { count: 'exact', head: true }),
          supabase.from('products').select('id', { count: 'exact', head: true }).is('deleted_at', null)
        ])

        setStats({
          categoriesCount: catRes.count || 15,
          themesCount: themeRes.count || 19,
          productsCount: prodRes.count || 0,
          collectionsCount: 3
        })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  const modules = [
    {
      title: 'Categorias do Site',
      desc: 'Formatos de materiais públicos (Colorir, Labirintos, Caça-palavras, Quiz...)',
      count: `${stats.categoriesCount} formatos`,
      to: '/admin/site/categorias',
      icon: Layers,
      color: '#2563eb',
      bg: '#eff6ff'
    },
    {
      title: 'Temas Bíblicos',
      desc: 'Assuntos e histórias bíblicas (Jesus, Oração, Fé, Páscoa, Criação...)',
      count: `${stats.themesCount} temas`,
      to: '/admin/site/temas',
      icon: Sparkles,
      color: '#7c3aed',
      bg: '#f5f3ff'
    },
    {
      title: 'Coleções Editoriais',
      desc: 'Séries e pacotes de materiais (Histórias de Jesus, Heróis da Fé...)',
      count: `${stats.collectionsCount} coleções`,
      to: '/admin/site/colecoes',
      icon: BookOpen,
      color: '#059669',
      bg: '#ecfdf5'
    },
    {
      title: 'Menus do Site',
      desc: 'Itens de navegação do Cabeçalho e do Rodapé público',
      count: 'Header & Rodapé',
      to: '/admin/site/menus',
      icon: Menu,
      color: '#d97706',
      bg: '#fffbeb'
    },
    {
      title: 'Páginas Institucionais',
      desc: 'Home, Especial Jesus, Planos, Termos de Uso e Políticas de Privacidade',
      count: '6 páginas',
      to: '/admin/site/paginas',
      icon: FileText,
      color: '#4f46e5',
      bg: '#eef2ff'
    },
    {
      title: 'Banners Promocionais',
      desc: 'Banners desktop e mobile com agendamento de data de início e término',
      count: 'Vitrines ativas',
      to: '/admin/site/banners',
      icon: Film,
      color: '#db2777',
      bg: '#fdf2f8'
    },
    {
      title: 'SEO & Indexação',
      desc: 'Meta titles, meta descriptions, sitemap automático e Open Graph',
      count: 'Google Otimizado',
      to: '/admin/site/seo',
      icon: BarChart3,
      color: '#0891b2',
      bg: '#ecfeff'
    }
  ]

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 48 }}>
      {/* Banner de Boas-vindas ao CMS */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        borderRadius: 16, padding: '28px 32px', color: '#fff', marginBottom: 28,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20,
        boxShadow: '0 8px 24px rgba(30,27,75,0.2)'
      }}>
        <div style={{ maxWidth: 640 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: 999, marginBottom: 12 }}>
            <Globe size={13} /> CMS Oficial do Site Público
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            Controle de Conteúdo do Storefront
          </h1>
          <p style={{ margin: 0, fontSize: 13.5, color: '#c7d2fe', lineHeight: 1.5 }}>
            Tudo o que você publica aqui alimenta dinamicamente as páginas, rotas e menus de <strong style={{ color: '#fff' }}>comdeuskids.com.br</strong> em tempo real, sem necessidade de editar código ou fazer deploy.
          </p>
        </div>

        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff',
            color: '#1e1b4b', padding: '10px 18px', borderRadius: 10, fontSize: 13,
            fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          <span>Abrir Site Público</span>
          <ExternalLink size={15} />
        </a>
      </div>

      {/* Grade de Módulos do CMS */}
      <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>
        Seções Administráveis do Site
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 16 }}>
        {modules.map(mod => {
          const Icon = mod.icon
          return (
            <Link
              key={mod.title}
              to={mod.to}
              style={{
                background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14,
                padding: 22, textDecoration: 'none', display: 'flex', flexDirection: 'column',
                justifyContent: 'space-between', transition: 'all 0.18s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = mod.color
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#e2e8f0'
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, background: mod.bg,
                    color: mod.color, display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Icon size={20} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', background: '#f8fafc', padding: '3px 8px', borderRadius: 6 }}>
                    {mod.count}
                  </span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
                  {mod.title}
                </div>
                <div style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.5 }}>
                  {mod.desc}
                </div>
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5,
                fontWeight: 600, color: mod.color, marginTop: 18
              }}>
                <span>Gerenciar</span>
                <ArrowRight size={14} />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
