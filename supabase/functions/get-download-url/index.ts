// ============================================================
// Edge Function: get-download-url
// Gera URL assinada para download de arquivo protegido
// SEGURANÇA:
//   1. Verifica se o usuário está autenticado
//   2. Verifica se tem entitlement para o produto
//   3. Gera URL assinada com expiração de 15 minutos
//   4. Registra o download em download_logs
// ============================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SIGNED_URL_EXPIRY = 900 // 15 minutos em segundos

Deno.serve(async (req) => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }

  try {
    // 1. Autenticação: extrair JWT do header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return json({ error: 'Não autenticado' }, 401)
    }

    const userJwt = authHeader.replace('Bearer ', '')

    // Client com service_role para operações privilegiadas (NUNCA expor ao browser)
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    )

    // Verificar o JWT do usuário
    const { data: { user }, error: authError } = await adminClient.auth.getUser(userJwt)
    if (authError || !user) {
      return json({ error: 'Token inválido' }, 401)
    }

    // 2. Parâmetros da requisição
    const { file_id } = await req.json()
    if (!file_id) {
      return json({ error: 'file_id é obrigatório' }, 400)
    }

    // 3. Buscar informações do arquivo
    const { data: file, error: fileError } = await adminClient
      .from('product_files')
      .select('id, product_id, name, display_name, storage_path, mime_type')
      .eq('id', file_id)
      .single()

    if (fileError || !file) {
      return json({ error: 'Arquivo não encontrado' }, 404)
    }

    // 4. Verificar entitlement — o usuário tem acesso a este produto?
    const { data: entitlement, error: entError } = await adminClient
      .from('entitlements')
      .select('id, expires_at')
      .eq('user_id', user.id)
      .eq('product_id', file.product_id)
      .eq('revoked', false)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .maybeSingle()

    // Verificar também se é produto gratuito
    const { data: product } = await adminClient
      .from('products')
      .select('is_free, status')
      .eq('id', file.product_id)
      .single()

    const hasAccess = entitlement !== null || (product?.is_free === true && product?.status === 'active')

    if (!hasAccess) {
      return json({ error: 'Acesso não autorizado a este arquivo' }, 403)
    }

    // 5. Gerar URL assinada (expira em 15 min)
    const { data: signedUrlData, error: urlError } = await adminClient
      .storage
      .from('product-files')
      .createSignedUrl(file.storage_path, SIGNED_URL_EXPIRY, {
        download: file.name,
      })

    if (urlError || !signedUrlData?.signedUrl) {
      console.error('Erro ao gerar URL assinada:', urlError)
      return json({ error: 'Erro ao gerar link de download' }, 500)
    }

    // 6. Registrar download em download_logs
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null
    const userAgent = req.headers.get('user-agent') || null

    await adminClient.from('download_logs').insert({
      user_id: user.id,
      product_file_id: file.id,
      entitlement_id: entitlement?.id || null,
      signed_url_path: file.storage_path,
      ip_address: ip,
      user_agent: userAgent,
    })

    // 7. Retornar a URL assinada
    return json({
      url: signedUrlData.signedUrl,
      expires_in: SIGNED_URL_EXPIRY,
      file_name: file.name,
      display_name: file.display_name,
    })

  } catch (err) {
    console.error('Erro inesperado:', err)
    return json({ error: 'Erro interno' }, 500)
  }
})

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    }
  })
}
