import React, { useState, useEffect } from 'react'
import { supabase } from '@comdeuskids/supabase'
import { Download, Search, Sparkles, BookOpen, FileText, CheckCircle2 } from 'lucide-react'

export default function Biblioteca() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  useEffect(() => {
    loadLibrary()
  }, [])

  const loadLibrary = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('entitlements')
      .select(`
        id,
        product_id,
        created_at,
        product:products (
          id,
          title,
          description,
          cover_image_url,
          category:categories (name)
        )
      `)
      .eq('user_id', user.id)

    if (!error && data) {
      setItems(data)
    }
    setLoading(false)
  }

  const handleDownload = async (productId: string, title: string) => {
    setDownloadingId(productId)
    try {
      const { data: files } = await supabase
        .from('product_files')
        .select('file_path, file_name')
        .eq('product_id', productId)
        .limit(1)

      if (!files || files.length === 0) {
        alert('Arquivo ainda não disponibilizado para este material.')
        return
      }

      const { data: signed } = await supabase.storage
        .from('product-files')
        .createSignedUrl(files[0].file_path, 900)

      if (signed?.signedUrl) {
        window.open(signed.signedUrl, '_blank')
      } else {
        alert('Erro ao gerar link de download seguro.')
      }
    } catch {
      alert('Erro ao processar download.')
    } finally {
      setDownloadingId(null)
    }
  }

  const filtered = items.filter(i =>
    i.product?.title?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{
      maxWidth: 1480,
      margin: '0 auto',
      padding: '24px 20px 80px',
      fontFamily: "'Baloo 2', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      {/* HEADER CINEMATOGRÁFICO */}
      <div style={{
        position: 'relative',
        borderRadius: 24,
        padding: '36px 32px',
        marginBottom: 36,
        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(28, 27, 29, 0.8) 100%)',
        border: '1px solid rgba(34, 197, 94, 0.25)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 14px',
          borderRadius: 9999,
          background: 'rgba(34, 197, 94, 0.15)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          color: '#22c55e',
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: '0.08em',
          marginBottom: 16
        }}>
          <Sparkles size={14} />
          <span>MEUS MATERIAIS SALVOS</span>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 20
        }}>
          <div>
            <h1 style={{
              fontSize: 'clamp(26px, 3.5vw, 36px)',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              marginBottom: 10
            }}>
              Minha Biblioteca Bíblica
            </h1>
            <p style={{
              fontSize: 15,
              color: '#cbc3d7',
              maxWidth: 600,
              lineHeight: 1.6
            }}>
              Acesse e baixe a qualquer momento todos os kits de atividades bíblicas, estudos e devocionais vinculados à sua conta.
            </p>
          </div>

          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: 320
          }}>
            <Search size={17} style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#958ea0'
            }} />
            <input
              type="text"
              placeholder="Buscar nos meus materiais..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#201f21',
                border: '1px solid #353437',
                borderRadius: 12,
                padding: '12px 16px 12px 42px',
                color: '#ffffff',
                fontSize: 14,
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />
          </div>
        </div>
      </div>

      {/* CONTEÚDO */}
      {loading ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          color: '#22c55e',
          fontSize: 16,
          fontWeight: 600
        }}>
          Carregando sua biblioteca bíblica...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          backgroundColor: '#1c1b1d',
          borderRadius: 24,
          padding: '60px 24px',
          textAlign: 'center',
          border: '1px dashed #353437',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
        }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 20,
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(22, 163, 74, 0.3) 100%)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            color: '#22c55e'
          }}>
            <BookOpen size={30} />
          </div>

          <h3 style={{ fontSize: 20, fontWeight: 800, color: '#ffffff', marginBottom: 10 }}>
            Sua biblioteca está pronta para receber materiais!
          </h3>

          <p style={{ fontSize: 15, color: '#cbc3d7', maxWidth: 480, margin: '0 auto 28px', lineHeight: 1.6 }}>
            Assim que você adquirir um kit de atividades ou assinar um plano, o material aparecerá aqui automaticamente para download imediato em alta resolução.
          </p>

          <a
            href="/downloads"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              color: '#052e16',
              borderRadius: 12,
              fontWeight: 800,
              fontSize: 14,
              textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(34, 197, 94, 0.35)'
            }}
          >
            <Sparkles size={16} /> Ver Central de Downloads
          </a>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 24
        }}>
          {filtered.map(item => (
            <div
              key={item.id}
              style={{
                backgroundColor: '#1c1b1d',
                borderRadius: 20,
                border: '1px solid #2a2a2c',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
                transition: 'transform 0.2s, border-color 0.2s'
              }}
            >
              <div style={{
                height: 170,
                background: item.product?.cover_image_url
                  ? `url(${item.product.cover_image_url}) center/cover no-repeat`
                  : 'linear-gradient(135deg, #2a2040 0%, #1c182d 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(28,27,29,0.9) 100%)'
                }} />
                {!item.product?.cover_image_url && (
                  <FileText size={48} color="#22c55e" style={{ position: 'relative', zIndex: 1 }} />
                )}
              </div>

              <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <span style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: '#22c55e',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: 6
                }}>
                  {item.product?.category?.name || 'Material Bíblico'}
                </span>

                <h4 style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: '#ffffff',
                  marginBottom: 8,
                  lineHeight: 1.4
                }}>
                  {item.product?.title}
                </h4>

                <p style={{
                  fontSize: 13,
                  color: '#cbc3d7',
                  flex: 1,
                  marginBottom: 20,
                  lineHeight: 1.5
                }}>
                  {item.product?.description}
                </p>

                <button
                  type="button"
                  onClick={() => handleDownload(item.product_id, item.product?.title)}
                  disabled={downloadingId === item.product_id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    width: '100%',
                    padding: '12px 0',
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    color: '#052e16',
                    border: 'none',
                    borderRadius: 12,
                    fontWeight: 800,
                    cursor: downloadingId === item.product_id ? 'not-allowed' : 'pointer',
                    fontSize: 14,
                    boxShadow: '0 4px 16px rgba(34, 197, 94, 0.35)'
                  }}
                >
                  <Download size={16} />
                  {downloadingId === item.product_id ? 'Gerando Link...' : 'Baixar PDF'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
