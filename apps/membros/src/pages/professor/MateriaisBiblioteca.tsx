import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FolderOpen, Search, Palette, BookOpen,
  HelpCircle, Music, Download, ExternalLink,
  GraduationCap, Check, Sparkles, Filter, FileText
} from 'lucide-react'

interface MaterialItem {
  id: string
  title: string
  category: 'coloring' | 'guides' | 'quizzes' | 'music'
  ageGroup: '3-5' | '6-8' | '9-12' | 'all'
  categoryLabel: string
  ageLabel: string
  description: string
  biblicalRef: string
  downloadCount: number
  previewUrl: string
}

export function MateriaisBiblioteca() {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedAge, setSelectedAge] = useState<string>('all')
  const [downloadedId, setDownloadedId] = useState<string | null>(null)

  const materials: MaterialItem[] = [
    {
      id: 'm-1',
      title: 'A Arca de Noé — Prancheta de Pintura Digital',
      category: 'coloring',
      ageGroup: '3-5',
      categoryLabel: 'Coloring Studio',
      ageLabel: '3–5 anos',
      description: 'Prancheta digital e folhas para colorir com a Arca de Noé, animais e o arco-íris da promessa.',
      biblicalRef: 'Gênesis 6–9',
      downloadCount: 342,
      previewUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'm-2',
      title: 'Roteiro Completo: Davi e o Gigante Golias',
      category: 'guides',
      ageGroup: '6-8',
      categoryLabel: 'Roteiro de Aula',
      ageLabel: '6–8 anos',
      description: 'Plano passo a passo com dinâmicas, quebra-gelo, leitura bíblica teatralizada e perguntas de reflexão.',
      biblicalRef: '1 Samuel 17',
      downloadCount: 512,
      previewUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'm-3',
      title: 'Quiz Bíblico dos Milagres de Jesus',
      category: 'quizzes',
      ageGroup: '9-12',
      categoryLabel: 'Quiz Impresso',
      ageLabel: '9–12 anos',
      description: '15 perguntas com gabarito para gincana em sala de aula ou tarefas de casa para os alunos.',
      biblicalRef: 'Evangelhos',
      downloadCount: 220,
      previewUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'm-4',
      title: 'Cânticos da Fé: Cifras e Letras da Criação',
      category: 'music',
      ageGroup: 'all',
      categoryLabel: 'Cânticos & Músicas',
      ageLabel: 'Todas as idades',
      description: 'Letras ilustradas e cifras simplificadas para momentos de louvor no Ministério Infantil.',
      biblicalRef: 'Salmos 104',
      downloadCount: 189,
      previewUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'm-5',
      title: 'Jonas e o Grande Peixe — Atividade Prática',
      category: 'coloring',
      ageGroup: '6-8',
      categoryLabel: 'Coloring Studio',
      ageLabel: '6–8 anos',
      description: 'Pintura e dobradura pedagógica ensinando sobre obediência e o perdão do Senhor.',
      biblicalRef: 'Jonas 1–4',
      downloadCount: 405,
      previewUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'm-6',
      title: 'A Parábola do Bom Samaritano — Guia do Professor',
      category: 'guides',
      ageGroup: '9-12',
      categoryLabel: 'Roteiro de Aula',
      ageLabel: '9–12 anos',
      description: 'Estudo com encartes visuais sobre compaixão e amor ao próximo no dia a dia da escola.',
      biblicalRef: 'Lucas 10:25-37',
      downloadCount: 298,
      previewUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&auto=format&fit=crop&q=80'
    }
  ]

  const filteredMaterials = materials.filter(m => {
    const matchesSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.description.toLowerCase().includes(search.toLowerCase()) ||
      m.biblicalRef.toLowerCase().includes(search.toLowerCase())

    const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory
    const matchesAge = selectedAge === 'all' || m.ageGroup === selectedAge || m.ageGroup === 'all'

    return matchesSearch && matchesCategory && matchesAge
  })

  const handleDownload = (id: string, title: string) => {
    setDownloadedId(id)
    setTimeout(() => setDownloadedId(null), 3000)
    alert(`Download do material "${title}" iniciado em formato PDF de alta resolução!`)
  }

  return (
    <div className="s-page s-page--wide">
      {/* Page Header */}
      <div className="s-page-header">
        <div>
          <span className="s-page-header__eyebrow">
            <GraduationCap size={13} style={{ display: 'inline', marginRight: 4 }} />
            Acervo Docente Exclusivo • 48 Recursos Homologados
          </span>
          <h1>Materiais & Biblioteca de Apoio</h1>
          <p>
            Acesse roteiros em PDF, pranchetas para colorir, dinâmicas de fixação e encartes prontos para impressão com a qualidade pedagógica Com Deus Kids.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ background: 'var(--s-surface)', padding: '8px 16px', borderRadius: 14, border: '1px solid var(--s-border)', textAlign: 'right' }}>
            <span style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--s-text-caption)', fontWeight: 700 }}>Total no Mês</span>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--s-primary)' }}>1.240+ downloads</div>
          </div>
        </div>
      </div>

      {/* Discovery Controls (Search & Filters) */}
      <div className="s-card" style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Campo de Busca */}
          <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
            <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--s-text-caption)' }} />
            <input
              type="text"
              className="s-input"
              style={{ paddingLeft: 42 }}
              placeholder="Buscar por título, passagem bíblica, temática ou palavra-chave..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Filtro de Faixa Etária */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--s-text-caption)', marginRight: 4 }}>
              Idade:
            </span>
            {[
              { id: 'all', label: 'Todas' },
              { id: '3-5', label: '3–5 anos' },
              { id: '6-8', label: '6–8 anos' },
              { id: '9-12', label: '9–12 anos' },
            ].map(age => (
              <button
                key={age.id}
                type="button"
                onClick={() => setSelectedAge(age.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 999,
                  border: '1px solid',
                  borderColor: selectedAge === age.id ? 'var(--s-primary)' : 'var(--s-border)',
                  background: selectedAge === age.id ? 'var(--s-primary-light)' : 'var(--s-surface-low)',
                  color: selectedAge === age.id ? 'var(--s-primary)' : 'var(--s-text-body)',
                  fontSize: 12,
                  fontWeight: selectedAge === age.id ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {age.label}
              </button>
            ))}
          </div>
        </div>

        {/* Categorias */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
          {[
            { id: 'all', label: 'Todos os Recursos', icon: <FolderOpen size={15} />, count: materials.length },
            { id: 'coloring', label: 'Pranchetas para Colorir', icon: <Palette size={15} />, count: 2 },
            { id: 'guides', label: 'Roteiros de Aula', icon: <BookOpen size={15} />, count: 2 },
            { id: 'quizzes', label: 'Quizzes Impressos', icon: <HelpCircle size={15} />, count: 1 },
            { id: 'music', label: 'Cânticos & Músicas', icon: <Music size={15} />, count: 1 },
          ].map(cat => {
            const isSelected = selectedCategory === cat.id

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 14px',
                  borderRadius: 12,
                  border: '1px solid',
                  borderColor: isSelected ? 'var(--s-primary)' : 'var(--s-border)',
                  background: isSelected ? 'var(--s-primary)' : 'var(--s-surface-low)',
                  color: isSelected ? '#fff' : 'var(--s-text-body)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat.icon}
                <span>{cat.label}</span>
                <span
                  style={{
                    fontSize: 11,
                    padding: '1px 6px',
                    borderRadius: 999,
                    background: isSelected ? 'rgba(255,255,255,0.25)' : 'var(--s-surface-mid)',
                    color: isSelected ? '#fff' : 'var(--s-text-muted)'
                  }}
                >
                  {cat.count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Grid de Materiais */}
      <div className="s-grid-3">
        {filteredMaterials.map(mat => (
          <div key={mat.id} className="s-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 0, overflow: 'hidden' }}>
            <div>
              {/* Imagem / Header Visual */}
              <div style={{ position: 'relative', height: 160, background: 'var(--s-surface-low)', overflow: 'hidden' }}>
                <img
                  src={mat.previewUrl}
                  alt={mat.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
                  <span className="s-badge s-badge-primary">{mat.categoryLabel}</span>
                  <span className="s-badge s-badge-neutral">{mat.ageLabel}</span>
                </div>
              </div>

              {/* Corpo */}
              <div style={{ padding: 18 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--s-primary)', textTransform: 'uppercase' }}>
                  {mat.biblicalRef}
                </span>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--s-text-title)', margin: '4px 0 6px 0', lineHeight: 1.3 }}>
                  {mat.title}
                </h3>
                <p style={{ fontSize: 12.5, color: 'var(--s-text-muted)', margin: 0, lineHeight: 1.5 }}>
                  {mat.description}
                </p>
              </div>
            </div>

            {/* Rodapé com Download */}
            <div style={{ padding: '14px 18px', borderTop: '1px solid var(--s-border)', background: 'var(--s-surface-low)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: 'var(--s-text-muted)' }}>
                {mat.downloadCount} professores baixaram
              </span>

              <div style={{ display: 'flex', gap: 6 }}>
                {mat.category === 'coloring' && (
                  <Link to="/professor/aulas?tipo=coloring" className="s-btn s-btn-secondary s-btn-sm" title="Abrir no Coloring Studio">
                    <ExternalLink size={14} /> Studio
                  </Link>
                )}
                <button
                  className="s-btn s-btn-primary s-btn-sm"
                  onClick={() => handleDownload(mat.id, mat.title)}
                >
                  {downloadedId === mat.id ? <><Check size={14} /> Baixado</> : <><Download size={14} /> Baixar PDF</>}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
