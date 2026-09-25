import { useEffect, useCallback, useRef } from 'react'
import { CanonicalAction } from '../types'
import { tvInputController, TVCanonicalAction } from '../../services/TVInputController'

interface UseGameInputProps {
  onAction?: (action: CanonicalAction) => void
  disabled?: boolean
}

/**
 * useGameInput: Abstração de controle universal para Jogos do Com Deus Kids.
 * Converte Touch (Mobile), Teclado/Mouse (Desktop) e Controle Remoto de Smart TV (Tizen, webOS, Android TV)
 * em ações canônicas unificadas (MOVE_LEFT, MOVE_RIGHT, ACTION, PAUSE, BACK, etc.).
 *
 * Ao montar, ativa o GAME INPUT MODE no TVInputController, isolando os direcionais
 * da navegação DOM do catálogo e restaurando o foco ao fechar o jogo.
 */
export function useGameInput({ onAction, disabled = false }: UseGameInputProps) {
  const onActionRef = useRef(onAction)
  useEffect(() => {
    onActionRef.current = onAction
  }, [onAction])

  const triggerAction = useCallback(
    (action: CanonicalAction) => {
      if (disabled) return
      onActionRef.current?.(action)
    },
    [disabled]
  )

  // 1. Ativar GAME INPUT MODE no TVInputController centralizado
  useEffect(() => {
    if (disabled) return

    // Ativa o modo de jogo no controlador de TV
    tvInputController.setMode('GAME')

    // Conectar aos eventos normalizados do controle remoto e gamepads
    const unsubscribe = tvInputController.subscribe((tvAction: TVCanonicalAction) => {
      if (disabled) return

      switch (tvAction) {
        case 'LEFT':
          triggerAction('MOVE_LEFT')
          break
        case 'RIGHT':
          triggerAction('MOVE_RIGHT')
          break
        case 'UP':
          triggerAction('MOVE_UP')
          break
        case 'DOWN':
          triggerAction('MOVE_DOWN')
          break
        case 'SELECT':
        case 'GAME_ACTION':
          triggerAction('ACTION')
          break
        case 'SECONDARY_ACTION':
          triggerAction('SECONDARY_ACTION')
          break
        case 'PLAY_PAUSE':
          triggerAction('PAUSE')
          break
        case 'BACK':
          triggerAction('BACK')
          break
        default:
          break
      }
    })

    return () => {
      unsubscribe()
      // Ao sair do jogo, retorna automaticamente ao TV NAVIGATION MODE
      tvInputController.setMode('NAV')
    }
  }, [disabled, triggerAction])

  return {
    triggerAction
  }
}
