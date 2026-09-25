import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import {
  Download, FileText, Lock, Sparkles, BookOpen, Search,
  ExternalLink, CheckCircle2, Clock
} from 'lucide-react'

interface LibraryItem {
  id: string
  product_id: string
  valid_until: string | null
  created_at: string
  product: {
    id: string
    title: string
    description: string
    cover_image_url: string | null
    slug: string
    category?: { name: string }
  }
}

export default function Biblioteca() {
  const [items, setItems] = useState<LibraryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    fetchLibrary()
  }, [user])

  const fetchLibrary = async () => {
    if (!user) return
    setLoading(true)
    try {
      // Query entitlements with products
      const { data, error } = await supabase
        .from('entitlements')
        .select(`
          id,
          product_id,
          valid_until,
          created_at,
          product:products (
            id,
            title,
            description,
            cover_image_url,
            slug,
            category:categories(name)
          )
        `)
        .eq('user_id', user.id)

      if (error) throw error
      setItems((data as unknown as LibraryItem[]) || [])
    } catch (err: any) {
      console.error('Erro ao buscar biblioteca:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (productId: string, title: string) => {
    setDownloadingId(productId)
    try {
      // Fetch the file reference from product_files
      const { data: files, error: filesErr } = await supabase
        .from('product_files')
        .select('id, file_path, file_name')
        .eq('product_id', productId)
        .limit(1)

      if (filesErr || !files || files.length === 0) {
        toast.warning('Arquivo ainda não disponível para este produto.')
        return
      }

      const file = files[0]

      // Generate signed URL (valid for 15 minutes) from private product-files bucket
      const { data: signedData, error: signErr } = await supabase.storage
        .from('product-files')
        .createSignedUrl(file.file_path, 900)

      if (signErr || !signedData?.signedUrl) {
        toast.error('Não foi possível gerar o link de download seguro.')
        return
      }

      // Trigger download
      const link = document.createElement('a')
      link.href = signedData.signedUrl
      link.download = file.file_name || `${title}.pdf`
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success(`Download iniciado: ${title}`)
    } catch (err: any) {
      toast.error('Erro ao processar download.')
    } finally {
      setDownloadingId(null)
    }
  }

  const filteredItems = items.filter(item =>
    item.product?.title?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 60 }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
        gap: 16,
        flexWrap: 'wrap'
      }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111', margin: 0, letterSpacing: '-0.02em' }}>
            Minha Biblioteca
          </h1>
          <p style={{ fontSize: 14, color: '#666', margin: '4px 0 0' }}>
            Acesso aos materiais educativos bíblicos adquiridos para impressão e estudo.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative', width: 260 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
            <input
              type="text"
              placeholder="Buscar materiais..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="cdk-input"
              style={{ paddingLeft: 36, height: 38 }}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div className="spinner" style={{ width: 32, height: 32, borderColor: '#ddd6fe', borderTopColor: '#7c3aed' }} />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="cdk-card" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20,
            background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', color: '#7c3aed'
          }}>
            <BookOpen size={32} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#111', marginBottom: 8 }}>
            Nenhum material encontrado
          </h3>
          <p style={{ fontSize: 14, color: '#666', maxWidth: 460, margin: '0 auto 24px', lineHeight: 1.5 }}>
            Os materiais educativos adquiridos através da loja ou planos de assinatura aparecerão aqui para download imediato.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 20
        }}>
          {filteredItems.map(item => (
            <div key={item.id} className="cdk-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {/* Cover */}
              <div style={{
                height: 160,
                background: item.product?.cover_image_url
                  ? `url(${item.product.cover_image_url}) center/cover no-repeat`
                  : 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                {!item.product?.cover_image_url && (
                  <FileText size={48} color="#7c3aed" style={{ opacity: 0.6 }} />
                )}
                <span className="badge badge-success" style={{ position: 'absolute', top: 12, right: 12 }}>
                  <CheckCircle2 size={12} style={{ marginRight: 4 }} /> Liberado
                </span>
              </div>

              {/* Info */}
              <div style={{ padding: 18, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {item.product?.category?.name || 'Material Bíblico'}
                </span>
                <h4 style={{ fontSize: 16, fontWeight: 600, color: '#111', margin: '4px 0 8px' }}>
                  {item.product?.title}
                </h4>
                <p style={{
                  fontSize: 13, color: '#666', margin: '0 0 16px',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  lineHeight: 1.4, flex: 1
                }}>
                  {item.product?.description || 'Conteúdo educativo infantil cristão.'}
                </p>

                <button
                  onClick={() => handleDownload(item.product_id, item.product?.title)}
                  disabled={downloadingId === item.product_id}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', gap: 8 }}
                >
                  <Download size={16} />
                  {downloadingId === item.product_id ? 'Baixando...' : 'Baixar Material (PDF)'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
