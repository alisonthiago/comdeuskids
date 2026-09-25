import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useProfile } from '../context/ProfileContext'
import { STREAM_CATALOG } from '../data/streamCatalog'
import { StreamContent } from '@comdeuskids/types'
import StreamCard from '../components/StreamCard'
import ContentDetailModal from '../components/ContentDetailModal'
import { Heart, Plus } from 'lucide-react'

export default function MinhaLista() {
  const navigate = useNavigate()
  const { activeProfile, myList, watchProgress } = useProfile()
  const [selectedContent, setSelectedContent] = useState<StreamContent | null>(null)

  const savedItems = STREAM_CATALOG.filter(c => myList.includes(c.id))

  return (
    <div className="cdk-my-profile-page" style={{ maxWidth: 1200 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff' }}>
          Minha Lista de {activeProfile?.name}
        </h1>
        <p style={{ color: '#9496a1', fontSize: 14 }}>
          Histórias, clipes e lições salvos para assistir quando quiser.
        </p>
      </div>

      {savedItems.length === 0 ? (
        <div className="cdk-profile-empty-row" style={{ padding: 60 }}>
          <Heart size={44} color="#22c55e" />
          <h3 style={{ color: '#fff', fontSize: 18 }}>Sua lista está vazia</h3>
          <p>
            Explore o Com Deus Kids e clique no botão <strong>+ Minha Lista</strong> em qualquer história ou clipe para salvá-lo aqui.
          </p>
          <Link
            to="/inicio"
            className="cdk-btn-save"
            style={{ textDecoration: 'none', display: 'inline-block', marginTop: 12 }}
          >
            Explorar Histórias
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 20
          }}
        >
          {savedItems.map(item => (
            <StreamCard
              key={item.id}
              content={item}
              onSelect={c => {
                if (c.type === 'series') navigate(`/serie/${c.slug}`)
                else navigate(`/conteudo/${c.slug}`)
              }}
              showProgress={!!watchProgress[item.id]}
              progressData={watchProgress[item.id]}
            />
          ))}
        </div>
      )}

      {selectedContent && (
        <ContentDetailModal
          content={selectedContent}
          onClose={() => setSelectedContent(null)}
        />
      )}
    </div>
  )
}
