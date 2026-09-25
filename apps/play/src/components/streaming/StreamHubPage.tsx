import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { StreamContent } from '@comdeuskids/types'
import { useProfile } from '../../context/ProfileContext'
import StreamHero from './StreamHero'
import ContinueWatchingRow, { ContinueWatchingItem } from './ContinueWatchingRow'
import Top10Row, { Top10Item } from './Top10Row'
import NetflixSpotlightRow from './NetflixSpotlightRow'
import ContentRow from './ContentRow'
import ScrollRevealSection from './ScrollRevealSection'
import ContentDetailModal from '../ContentDetailModal'

export interface HubRailSpotlight {
  type: 'spotlight'
  id: string
  title: string
  icon?: React.ReactNode
  spotlightItem: StreamContent
  spotlightBadge?: string
  spotlightSecondaryBadge?: string
  items: StreamContent[]
  seeAllLink?: string
  seeAllText?: string
}

export interface HubRailTop10 {
  type: 'top10'
  id: string
  title?: string
  items: Top10Item[]
}

export interface HubRailStandard {
  type: 'standard'
  id: string
  title: string
  icon?: React.ReactNode
  items: StreamContent[]
  aspect?: 'poster' | 'landscape'
  seeAllLink?: string
  seeAllText?: string
  getBadgeText?: (item: StreamContent) => string | undefined
  getBadgeColor?: (item: StreamContent) => string | undefined
  getSubtitle?: (item: StreamContent) => string | undefined
}

export type HubRail = HubRailSpotlight | HubRailTop10 | HubRailStandard

export interface StreamHubPageProps {
  hero: {
    content: StreamContent
    badgeText: string
    badgeColor?: string
    badgeTextColor?: string
    title?: string
    description?: string
    metaTags?: string[]
    bannerImg?: string
    isUpcoming?: boolean
    upcomingDateText?: string
    onPlay?: (content: StreamContent) => void
    onMoreInfo?: (content: StreamContent) => void
  }
  continueWatching?: {
    title?: string
    items: ContinueWatchingItem[]
    seeAllLink?: string
  }
  rails: HubRail[]
  extraBottom?: React.ReactNode
}

/**
 * StreamHubPage — Com Deus Kids
 * Componente compartilhado e oficial que padroniza as 4 rotas de streaming:
 * /inicio, /series, /filmes, /videos
 * 
 * Garante rigorosamente:
 * - Mesmo layout, largura máxima e paddings
 * - Hero integrado ao primeiro carrossel sem grande espaço preto (primeira dobra visível)
 * - Scroll Reveal vertical em todas as seções (efeito cinematográfico)
 * - Carrosséis horizontais contínuos
 * - Hover expansível flutuante nos cards com preview e ações
 * - Gerenciamento compartilhado de Minha Lista, Curtidas e Modal de Detalhes
 */
export default function StreamHubPage({
  hero,
  continueWatching,
  rails,
  extraBottom
}: StreamHubPageProps) {
  const navigate = useNavigate()
  const { isInMyList, toggleMyList, activeProfile } = useProfile()

  const [selectedContent, setSelectedContent] = useState<StreamContent | null>(null)
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({})
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2500)
  }

  const toggleLike = (id: string) => {
    setLikedMap(prev => {
      const next = !prev[id]
      showToast(next ? 'Adicionado aos seus favoritos!' : 'Removido dos favoritos')
      return { ...prev, [id]: next }
    })
  }

  const handleCardClick = (content: StreamContent) => {
    if (content.type === 'series') {
      navigate(`/serie/${content.slug}`)
    } else {
      navigate(`/conteudo/${content.slug}`)
    }
  }

  const handleDirectPlay = (content: StreamContent) => {
    navigate(`/assistir/${content.id}`)
  }

  return (
    <div
      style={{
        background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(139, 92, 246, 0.14) 0%, rgba(18, 18, 22, 0.98) 50%, #0c0d10 100%)',
        color: '#e5e1e4',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        paddingBottom: 90,
        width: '100%',
        overflowX: 'hidden',
        minHeight: '100vh'
      }}
    >
      {/* Toast Flutuante */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: 72,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 99999,
            backgroundColor: '#242327',
            color: '#ffffff',
            padding: '10px 22px',
            borderRadius: 9999,
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.7)',
            border: '1px solid rgba(208, 188, 255, 0.35)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 13,
            fontWeight: 700
          }}
        >
          <Sparkles size={16} color="#ffb95f" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. HERO BILLBOARD (INTEGRADO AO TOPO COM DEGRADE CONTÍNUO) */}
      <StreamHero
        content={hero.content}
        badgeText={hero.badgeText}
        badgeColor={hero.badgeColor}
        badgeTextColor={hero.badgeTextColor}
        title={hero.title}
        description={hero.description}
        metaTags={hero.metaTags}
        bannerImg={hero.bannerImg}
        isUpcoming={hero.isUpcoming}
        upcomingDateText={hero.upcomingDateText}
        onPlay={hero.onPlay ? () => hero.onPlay!(hero.content) : () => handleDirectPlay(hero.content)}
        onMoreInfo={hero.onMoreInfo ? () => hero.onMoreInfo!(hero.content) : () => handleCardClick(hero.content)}
        isInList={isInMyList(hero.content.id)}
        onToggleList={toggleMyList}
      />

      {/* 2. ÁREA DE TRILHOS / CARROSSÉIS (COMEÇA IMEDIATAMENTE APÓS O HERO COM MARGEM NEGATIVA) */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          marginTop: 'clamp(24px, 3vw, 48px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}
      >
        {/* Trilho: Continuar Assistindo (se existir) */}
        {continueWatching && continueWatching.items.length > 0 && (
          <ScrollRevealSection threshold={0.05}>
            <ContinueWatchingRow
              title={continueWatching.title || (activeProfile?.name ? `Continue assistindo, ${activeProfile.name}` : 'Continuar Assistindo')}
              seeAllLink={continueWatching.seeAllLink}
              items={continueWatching.items}
              onSelect={handleCardClick}
              onPlay={handleDirectPlay}
            />
          </ScrollRevealSection>
        )}

        {/* Trilhos Dinâmicos Compartilhados com Scroll Reveal */}
        {rails.map((rail, idx) => {
          if (rail.type === 'spotlight') {
            return (
              <ScrollRevealSection key={rail.id} threshold={0.06} delay={idx === 0 ? 0 : 40}>
                <NetflixSpotlightRow
                  title={rail.title}
                  icon={rail.icon}
                  spotlightItem={rail.spotlightItem}
                  spotlightBadge={rail.spotlightBadge}
                  spotlightSecondaryBadge={rail.spotlightSecondaryBadge}
                  items={rail.items}
                  seeAllLink={rail.seeAllLink}
                  seeAllText={rail.seeAllText}
                  onSelect={handleCardClick}
                  onPlay={handleDirectPlay}
                  isInList={isInMyList}
                  onToggleList={toggleMyList}
                  isLiked={id => !!likedMap[id]}
                  onToggleLike={toggleLike}
                />
              </ScrollRevealSection>
            )
          }

          if (rail.type === 'top10') {
            return (
              <ScrollRevealSection key={rail.id} threshold={0.06} delay={40}>
                <Top10Row
                  title={rail.title || 'Top 10 para você'}
                  items={rail.items}
                  onSelect={handleCardClick}
                />
              </ScrollRevealSection>
            )
          }

          if (rail.type === 'standard') {
            return (
              <ScrollRevealSection key={rail.id} threshold={0.06} delay={40}>
                <ContentRow
                  title={rail.title}
                  icon={rail.icon}
                  items={rail.items}
                  aspect={rail.aspect || 'poster'}
                  seeAllLink={rail.seeAllLink}
                  seeAllText={rail.seeAllText}
                  getBadgeText={rail.getBadgeText}
                  getBadgeColor={rail.getBadgeColor}
                  getSubtitle={rail.getSubtitle}
                  onSelect={handleCardClick}
                  onPlay={handleDirectPlay}
                  isInList={isInMyList}
                  onToggleList={toggleMyList}
                  isLiked={id => !!likedMap[id]}
                  onToggleLike={toggleLike}
                />
              </ScrollRevealSection>
            )
          }

          return null
        })}

        {/* Empty state gracioso se não houver conteúdos publicados */}
        {rails.every(r => !r.items || r.items.length === 0) && (!continueWatching?.items || continueWatching.items.length === 0) && (
          <div style={{
            margin: '40px auto',
            maxWidth: 600,
            textAlign: 'center',
            padding: '36px 24px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 24,
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✨</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>
              Catálogo em Preparação
            </h3>
            <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
              Novas historinhas bíblicas, lições animadas e músicas abençoadas estão a caminho! Conteúdos publicados no painel administrativo aparecerão aqui automaticamente.
            </p>
          </div>
        )}

        {/* Conteúdo Extra Inferior (ex: Desafio Interativo / Materiais para Imprimir) */}
        {extraBottom && (
          <ScrollRevealSection threshold={0.08}>
            {extraBottom}
          </ScrollRevealSection>
        )}
      </div>

      {/* MODAL DE DETALHES / PLAYER */}
      {selectedContent && (
        <ContentDetailModal
          content={selectedContent}
          onClose={() => setSelectedContent(null)}
        />
      )}
    </div>
  )
}
