import { useEffect, useState, useCallback, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { tvInputController, TVCanonicalAction } from '../services/TVInputController'

let tvAudioContext: AudioContext | null = null
let lastFocusSoundAt = 0

/** Retorno sonoro suave para mudança de foco pelo D-pad do controle remoto */
function playTVFocusSound() {
  if (typeof window === 'undefined') return

  const now = performance.now()
  if (now - lastFocusSoundAt < 45) return
  lastFocusSoundAt = now

  try {
    tvAudioContext ||= new AudioContext()
    const context = tvAudioContext
    if (context.state === 'suspended') void context.resume()

    const oscillator = context.createOscillator()
    const gain = context.createGain()
    const start = context.currentTime

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(520, start)
    oscillator.frequency.exponentialRampToValueAtTime(620, start + 0.045)
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.055, start + 0.008)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.07)

    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start(start)
    oscillator.stop(start + 0.075)
  } catch {
    // Em TVs que bloqueiam Web Audio, a navegação visual continua funcionando perfeitamente.
  }
}

export function isSmartTVBrowser(): boolean {
  return tvInputController.detectPlatform().isTV
}

export function useTVNavigation() {
  const location = useLocation()
  const [isTV, setIsTV] = useState(false)
  const focusedIndexRef = useRef(0)

  useEffect(() => {
    setIsTV(isSmartTVBrowser() || location.pathname.startsWith('/tv'))
  }, [location.pathname])

  const getActiveScope = useCallback((): HTMLElement | Document => {
    const modal = document.querySelector<HTMLElement>(
      '[role="dialog"], .cdk-tv-modal, .cdk-tv-game-modal, [data-tv-modal-active="true"]'
    )
    return modal || document
  }, [])

  const getFocusableElements = useCallback((): HTMLElement[] => {
    const scope = getActiveScope()
    return Array.from(
      scope.querySelectorAll<HTMLElement>(
        '[data-tv-focus], button:not([disabled]), a:not([disabled]), input:not([disabled])'
      )
    ).filter(el => {
      const rect = el.getBoundingClientRect()
      const style = window.getComputedStyle(el)
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        style.opacity !== '0'
      )
    })
  }, [getActiveScope])

  const focusElement = useCallback((element: HTMLElement) => {
    if (!element) return
    element.focus()
    element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
    playTVFocusSound()
  }, [])

  const handleCanonicalAction = useCallback(
    (action: TVCanonicalAction) => {
      // No MODO JOGO ('GAME'), a navegação pelo DOM é completamente suspensa
      if (tvInputController.getMode() === 'GAME') {
        return
      }

      const focusable = getFocusableElements()
      if (focusable.length === 0) return

      const activeEl = document.activeElement as HTMLElement | null
      const currentIndex = focusable.findIndex(el => el === activeEl)
      const currentRect = activeEl ? activeEl.getBoundingClientRect() : null

      if (action === 'RIGHT') {
        if (!currentRect || currentIndex === -1) {
          focusElement(focusable[0])
          return
        }

        // Tentar encontrar geometricamente à direita
        let bestCandidate: HTMLElement | null = null
        let minScore = Infinity

        for (const el of focusable) {
          if (el === activeEl) continue
          const r = el.getBoundingClientRect()
          if (r.left >= currentRect.left + 5) {
            const dx = r.left - currentRect.left
            const dy = Math.abs(r.top - currentRect.top)
            const score = dx + dy * 2.5
            if (score < minScore) {
              minScore = score
              bestCandidate = el
            }
          }
        }

        if (bestCandidate) {
          focusElement(bestCandidate)
        } else {
          // Wrap ou próximo sequencial
          const nextIdx = (currentIndex + 1) % focusable.length
          focusElement(focusable[nextIdx])
        }
      } else if (action === 'LEFT') {
        if (!currentRect || currentIndex === -1) {
          focusElement(focusable[0])
          return
        }

        // Tentar encontrar geometricamente à esquerda
        let bestCandidate: HTMLElement | null = null
        let minScore = Infinity

        for (const el of focusable) {
          if (el === activeEl) continue
          const r = el.getBoundingClientRect()
          if (r.right <= currentRect.right - 5) {
            const dx = currentRect.right - r.right
            const dy = Math.abs(r.top - currentRect.top)
            const score = dx + dy * 2.5
            if (score < minScore) {
              minScore = score
              bestCandidate = el
            }
          }
        }

        if (bestCandidate) {
          focusElement(bestCandidate)
        } else {
          const prevIdx = (currentIndex - 1 + focusable.length) % focusable.length
          focusElement(focusable[prevIdx])
        }
      } else if (action === 'DOWN') {
        if (!currentRect || currentIndex === -1) {
          focusElement(focusable[0])
          return
        }

        // Tentar encontrar geometricamente abaixo
        let bestCandidate: HTMLElement | null = null
        let minScore = Infinity

        for (const el of focusable) {
          if (el === activeEl) continue
          const r = el.getBoundingClientRect()
          if (r.top >= currentRect.top + 5) {
            const dy = r.top - currentRect.top
            const dx = Math.abs(r.left - currentRect.left)
            const score = dy * 2 + dx
            if (score < minScore) {
              minScore = score
              bestCandidate = el
            }
          }
        }

        if (bestCandidate) {
          focusElement(bestCandidate)
        } else {
          const nextIdx = Math.min(focusable.length - 1, currentIndex + 1)
          focusElement(focusable[nextIdx])
        }
      } else if (action === 'UP') {
        if (!currentRect || currentIndex === -1) {
          focusElement(focusable[0])
          return
        }

        // Tentar encontrar geometricamente acima
        let bestCandidate: HTMLElement | null = null
        let minScore = Infinity

        for (const el of focusable) {
          if (el === activeEl) continue
          const r = el.getBoundingClientRect()
          if (r.bottom <= currentRect.bottom - 5) {
            const dy = currentRect.bottom - r.bottom
            const dx = Math.abs(r.left - currentRect.left)
            const score = dy * 2 + dx
            if (score < minScore) {
              minScore = score
              bestCandidate = el
            }
          }
        }

        if (bestCandidate) {
          focusElement(bestCandidate)
        } else {
          const prevIdx = Math.max(0, currentIndex - 1)
          focusElement(focusable[prevIdx])
        }
      } else if (action === 'SELECT') {
        if (activeEl) {
          activeEl.click()
        } else if (focusable.length > 0) {
          focusElement(focusable[0])
        }
      } else if (action === 'BACK') {
        // Se houver modal com botão fechar/voltar, priorizar
        const closeBtn = document.querySelector<HTMLElement>('[data-tv-back-btn]')
        if (closeBtn) {
          closeBtn.click()
        } else {
          window.history.back()
        }
      } else if (action === 'PLAY_PAUSE') {
        const video = document.querySelector<HTMLVideoElement>('video')
        if (video) {
          if (video.paused) {
            video.play()
          } else {
            video.pause()
          }
        }
      }
    },
    [getFocusableElements, focusElement]
  )

  useEffect(() => {
    if (!isTV) return
    const unsubscribe = tvInputController.subscribe(handleCanonicalAction)
    return () => {
      unsubscribe()
    }
  }, [isTV, handleCanonicalAction])

  // Foco inicial automático após carregamento da tela
  useEffect(() => {
    if (!isTV) return

    const focusTimer = window.setTimeout(() => {
      if (tvInputController.getMode() === 'GAME') return
      const focusable = getFocusableElements()
      if (focusable.length > 0 && (!document.activeElement || document.activeElement === document.body)) {
        focusable[0].focus()
        playTVFocusSound()
      }
    }, 120)

    return () => window.clearTimeout(focusTimer)
  }, [isTV, location.pathname, getFocusableElements])

  return { isTV, setIsTV }
}
