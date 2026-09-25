import React, { useEffect, useState, useCallback, useRef } from 'react'
import { Cast } from 'lucide-react'

declare global {
  interface Window {
    cast?: any
    chrome?: any
    __onGCastApiAvailable?: (available: boolean) => void
  }
}

interface MediaCastingControlsProps {
  video: HTMLVideoElement | null
  title?: string
  poster?: string
  src?: string
}

// Ícone Oficial Apple AirPlay (Tela com triângulo de transmissão)
function AirPlayIcon({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'block' }}
    >
      <path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1" />
      <polygon points="12 15 17 21 7 21 12 15" fill={color} />
    </svg>
  )
}

export default function MediaCastingControls({
  video,
  title = 'Com Deus Kids',
  poster,
  src
}: MediaCastingControlsProps) {
  const [castAvailable, setCastAvailable] = useState(false)
  const [castConnected, setCastConnected] = useState(false)
  const [airPlayAvailable, setAirPlayAvailable] = useState(false)
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)
  const castInitializedRef = useRef(false)

  // 1. Google Cast Web Sender SDK
  const initCastSdk = useCallback(() => {
    if (castInitializedRef.current || !window.cast?.framework || !window.chrome?.cast) return
    castInitializedRef.current = true

    try {
      const context = window.cast.framework.CastContext.getInstance()
      const appId =
        import.meta.env.VITE_GOOGLE_CAST_RECEIVER_APP_ID ||
        window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID

      context.setOptions({
        receiverApplicationId: appId,
        autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
      })

      // Ouvir mudanças de disponibilidade e conexão
      context.addEventListener(
        window.cast.framework.CastContextEventType.CAST_STATE_CHANGED,
        (event: any) => {
          const castState = event.castState
          const hasDevices = castState !== window.cast.framework.CastState.NO_DEVICES_AVAILABLE
          setCastAvailable(hasDevices)
          setCastConnected(castState === window.cast.framework.CastState.CONNECTED)
        }
      )

      // Ouvir sessão conectada para carregar a mídia no Chromecast
      context.addEventListener(
        window.cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
        async (event: any) => {
          if (event.sessionState === window.cast.framework.SessionState.SESSION_STARTED) {
            setCastConnected(true)
            const session = context.getCurrentSession()
            const mediaSrc = src || video?.currentSrc || video?.src
            if (session && mediaSrc) {
              try {
                const mediaInfo = new window.chrome.cast.media.MediaInfo(mediaSrc, 'video/mp4')
                mediaInfo.metadata = new window.chrome.cast.media.GenericMediaMetadata()
                mediaInfo.metadata.title = title
                mediaInfo.metadata.subtitle = 'Com Deus Kids'
                if (poster) {
                  mediaInfo.metadata.images = [{ url: poster }]
                }
                const request = new window.chrome.cast.media.LoadRequest(mediaInfo)
                if (video && video.currentTime > 0) {
                  request.currentTime = video.currentTime
                }
                await session.loadMedia(request)
                video?.pause()
              } catch (err) {
                console.warn('Erro ao enviar mídia para Google Cast:', err)
              }
            }
          } else if (event.sessionState === window.cast.framework.SessionState.SESSION_ENDED) {
            setCastConnected(false)
          }
        }
      )

      const currentState = context.getCastState()
      setCastAvailable(currentState !== window.cast.framework.CastState.NO_DEVICES_AVAILABLE)
      setCastConnected(currentState === window.cast.framework.CastState.CONNECTED)
    } catch (e) {
      console.warn('Google Cast Context Init:', e)
    }
  }, [src, video, title, poster])

  useEffect(() => {
    // Se o SDK já estiver disponível
    if (window.cast?.framework) {
      initCastSdk()
      return
    }

    // Injeta callback global esperado pelo cast_sender.js
    window.__onGCastApiAvailable = (isAvailable: boolean) => {
      if (isAvailable) {
        initCastSdk()
      }
    }

    // Injeta script se ainda não estiver presente no DOM
    const SCRIPT_ID = 'google-cast-sender-sdk'
    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null
    if (!script) {
      script = document.createElement('script')
      script.id = SCRIPT_ID
      script.src = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1'
      script.async = true
      document.head.appendChild(script)
    }
  }, [initCastSdk])

  // 2. Apple AirPlay (WebKit API)
  useEffect(() => {
    if (!video) return

    // Especificação oficial WebKit: 'webkitplaybacktargetavailabilitychanged'
    const handleAirPlayAvailability = (event: any) => {
      // event.availability pode ser 'available' ou 'not-available'
      const isAvail = event.availability === 'available'
      setAirPlayAvailable(isAvail)
    }

    // Se o elemento de vídeo suportar a API WebKit
    if ('WebKitPlaybackTargetAvailabilityEvent' in window || (video as any).webkitShowPlaybackTargetPicker) {
      video.addEventListener('webkitplaybacktargetavailabilitychanged', handleAirPlayAvailability)
    }

    return () => {
      video.removeEventListener('webkitplaybacktargetavailabilitychanged', handleAirPlayAvailability)
    }
  }, [video])

  const handleCastClick = () => {
    try {
      const context = window.cast?.framework?.CastContext?.getInstance()
      if (context) {
        context.requestSession()
      }
    } catch (err) {
      console.warn('Erro ao solicitar sessão Google Cast:', err)
    }
  }

  const handleAirPlayClick = () => {
    try {
      if (video && typeof (video as any).webkitShowPlaybackTargetPicker === 'function') {
        ;(video as any).webkitShowPlaybackTargetPicker()
      }
    } catch (err) {
      console.warn('Erro ao acionar AirPlay Picker:', err)
    }
  }

  // Se nenhum protocolo estiver disponível nem pronto no dispositivo do usuário
  if (!castAvailable && !airPlayAvailable) {
    return null
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, position: 'relative' }}>
      {/* Botão Google Cast (Chromecast / Android TV / Google TV) */}
      {castAvailable && (
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            aria-label="Transmitir para Smart TV ou Chromecast"
            onClick={handleCastClick}
            onMouseEnter={() => setActiveTooltip('cast')}
            onMouseLeave={() => setActiveTooltip(null)}
            style={{
              background: castConnected ? 'rgba(34, 197, 94, 0.25)' : 'rgba(255, 255, 255, 0.12)',
              border: castConnected ? '1px solid #22c55e' : '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 12,
              width: 42,
              height: 42,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: castConnected ? '#22c55e' : '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(8px)',
              boxShadow: castConnected ? '0 0 16px rgba(34, 197, 94, 0.5)' : 'none'
            }}
          >
            <Cast size={20} />
          </button>
          {activeTooltip === 'cast' && (
            <div style={{
              position: 'absolute',
              bottom: '125%',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#1b1b22',
              border: '1px solid #3b3b47',
              color: '#fff',
              padding: '6px 10px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              zIndex: 10000,
              fontFamily: 'var(--cdk-font-family, "Baloo 2", sans-serif)'
            }}>
              {castConnected ? 'Conectado ao Chromecast' : 'Transmitir para Chromecast / TV'}
            </div>
          )}
        </div>
      )}

      {/* Botão Apple AirPlay (Safari / iOS / macOS / Apple TV) */}
      {airPlayAvailable && (
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            aria-label="Transmitir via AirPlay para Apple TV ou Smart TV"
            onClick={handleAirPlayClick}
            onMouseEnter={() => setActiveTooltip('airplay')}
            onMouseLeave={() => setActiveTooltip(null)}
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 12,
              width: 42,
              height: 42,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(8px)'
            }}
          >
            <AirPlayIcon size={20} color="#ffffff" />
          </button>
          {activeTooltip === 'airplay' && (
            <div style={{
              position: 'absolute',
              bottom: '125%',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#1b1b22',
              border: '1px solid #3b3b47',
              color: '#fff',
              padding: '6px 10px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              zIndex: 10000,
              fontFamily: 'var(--cdk-font-family, "Baloo 2", sans-serif)'
            }}>
              Transmitir via AirPlay
            </div>
          )}
        </div>
      )}
    </div>
  )
}
