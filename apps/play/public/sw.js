const CACHE_NAME = 'com-deus-kids-play-v2'
const STATIC_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/images/login-brand.svg',
  '/images/logo-kids-white.png'
]

// Instalação: pré-carrega casca da aplicação
self.addEventListener('install', event => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('PWA Pre-cache partial warning:', err)
      })
    })
  )
})

// Ativação: limpa caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    }).then(() => self.clients.claim())
  )
})

// Fetch: estratégia balanceada para app de streaming
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Ignorar requisições não-GET, requisições com range (vídeo streaming), ou APIs Supabase
  if (
    request.method !== 'GET' ||
    request.headers.get('range') ||
    request.destination === 'video' ||
    request.destination === 'audio' ||
    url.hostname.includes('supabase.co') ||
    url.pathname.includes('/rest/v1/') ||
    url.pathname.includes('/auth/v1/')
  ) {
    return
  }

  // Navegação HTML: Network-first com fallback para casca em cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match('/') || caches.match('/manifest.webmanifest'))
    )
    return
  }

  // Recursos estáticos (scripts, styles, imagens): Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      const fetchPromise = fetch(request)
        .then(networkResponse => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone()
            caches.open(CACHE_NAME).then(cache => cache.put(request, responseToCache))
          }
          return networkResponse
        })
        .catch(() => cachedResponse)

      return cachedResponse || fetchPromise
    })
  )
})
