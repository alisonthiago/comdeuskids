import { useEffect, useCallback, useRef } from 'react'
import { CanonicalAction } from '../types'

interface UseGameInputProps {
  onAction?: (action: CanonicalAction) => void
  disabled?: boolean
}

export function useGameInput({ onAction, disabled = false }: UseGameInputProps) {
  const onActionRef = useRef(onAction)
  useEffect(() => {
    onActionRef.current = onAction
  }, [onAction])

  const triggerAction = useCallback((action: CanonicalAction) => {
    if (disabled) return
    onActionRef.current?.(action)
  }, [disabled])

  useEffect(() => {
    if (disabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return
      }

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault()
          triggerAction('LEFT')
          break

        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault()
          triggerAction('RIGHT')
          break

        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault()
          triggerAction('UP')
          break

        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault()
          triggerAction('DOWN')
          break

        case ' ': // Barra de espaço
          e.preventDefault()
          triggerAction('JUMP')
          break

        case 'Enter':
        case 'Select':
        case 'Ok':
          e.preventDefault()
          triggerAction('ACTION')
          break

        case 'Shift':
        case 'Control':
        case 'e':
        case 'E':
          e.preventDefault()
          triggerAction('SECONDARY_ACTION')
          break

        case 'Escape':
        case 'p':
        case 'P':
          e.preventDefault()
          triggerAction('PAUSE')
          break

        case 'Backspace':
        case 'BrowserBack':
        case 'GoBack':
          e.preventDefault()
          triggerAction('BACK')
          break

        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [disabled, triggerAction])

  return { triggerAction }
}
