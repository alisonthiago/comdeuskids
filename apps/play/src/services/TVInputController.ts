/**
 * ==============================================================================
 * COM DEUS KIDS — TV INPUT CONTROLLER CENTRALIZADO
 * ==============================================================================
 * Camada unificada de normalização de input para Smart TVs (Samsung Tizen, LG webOS,
 * Android TV, Fire TV, Apple TV/AirPlay), Teclado/PC e Gamepads Bluetooth.
 *
 * Suporta dois modos estritos:
 * 1. 'NAV' (TV NAVIGATION MODE): D-Pad navega pelo catálogo e menus com foco visual.
 * 2. 'GAME' (GAME INPUT MODE): D-Pad e botões controlam diretamente os jogos bíblicos,
 *    suprimindo o scroll/foco do DOM e restaurando o elemento focado ao sair do jogo.
 * ==============================================================================
 */

export type TVInputMode = 'NAV' | 'GAME'

export type TVCanonicalAction =
  | 'UP'
  | 'DOWN'
  | 'LEFT'
  | 'RIGHT'
  | 'SELECT'
  | 'BACK'
  | 'PLAY_PAUSE'
  | 'GAME_ACTION'
  | 'SECONDARY_ACTION'

export type TVActionListener = (action: TVCanonicalAction, originalEvent?: Event) => void

export interface TVPlatformInfo {
  isTV: boolean
  platform: 'tizen' | 'webos' | 'android_tv' | 'apple_tv' | 'generic_tv' | 'desktop'
}

class TVInputControllerService {
  private mode: TVInputMode = 'NAV'
  private lastFocusedElement: HTMLElement | null = null
  private listeners: Set<TVActionListener> = new Set()
  private initialized = false
  private gamepadLoopActive = false
  private lastGamepadPress: Record<string, number> = {}

  constructor() {
    if (typeof window !== 'undefined') {
      this.init()
    }
  }

  /**
   * Detecta se o ambiente atual é Smart TV e qual a plataforma específica
   */
  public detectPlatform(): TVPlatformInfo {
    if (typeof window === 'undefined') {
      return { isTV: false, platform: 'desktop' }
    }

    const ua = navigator.userAgent.toLowerCase()

    if (ua.includes('tizen') || typeof (window as any).tizen !== 'undefined') {
      return { isTV: true, platform: 'tizen' }
    }
    if (ua.includes('web0s') || ua.includes('webos') || typeof (window as any).webOS !== 'undefined') {
      return { isTV: true, platform: 'webos' }
    }
    if (ua.includes('googletv') || ua.includes('android tv') || ua.includes('crkey') || ua.includes('aft')) {
      return { isTV: true, platform: 'android_tv' }
    }
    if (ua.includes('appletv')) {
      return { isTV: true, platform: 'apple_tv' }
    }

    const tvKeywords = ['smarttv', 'smart-tv', 'hbbtv', 'vidaa', 'netcast', 'viera', 'bravia', 'roku', 'firetv']
    const search = window.location.search
    const isExplicitTV =
      search.includes('tv=1') ||
      search.includes('tv_demo=1') ||
      localStorage.getItem('cdk_tv_mode') === 'true'

    if (tvKeywords.some(k => ua.includes(k)) || window.location.pathname.startsWith('/tv') || isExplicitTV) {
      return { isTV: true, platform: 'generic_tv' }
    }

    return { isTV: false, platform: 'desktop' }
  }

  /**
   * Registra teclas especiais no Samsung Tizen caso a API esteja disponível
   */
  private registerTizenKeys() {
    try {
      const tizen = (window as any).tizen
      if (tizen?.tvinputdevice?.registerKey) {
        const keys = [
          'MediaPlay',
          'MediaPause',
          'MediaPlayPause',
          'MediaStop',
          'MediaFastForward',
          'MediaRewind',
          '10009', // Return
          'XF86Back'
        ]
        keys.forEach(key => {
          try {
            tizen.tvinputdevice.registerKey(key)
          } catch {
            // Tecla já registrada ou não suportada pelo modelo
          }
        })
      }
    } catch {
      // Ignora erro em ambientes não-Tizen
    }
  }

  public init() {
    if (this.initialized || typeof window === 'undefined') return
    this.initialized = true

    // Registrar teclas no Tizen
    this.registerTizenKeys()

    // Listener global de Teclado / Controle Remoto
    window.addEventListener('keydown', this.handleKeyDown, { capture: true })

    // Listeners de Gamepad
    window.addEventListener('gamepadconnected', this.handleGamepadConnected)
    window.addEventListener('gamepaddisconnected', this.handleGamepadDisconnected)

    // Iniciar loop de Gamepad se já houver gamepads conectados
    this.checkGamepads()
  }

  public destroy() {
    if (!this.initialized || typeof window === 'undefined') return
    this.initialized = false
    window.removeEventListener('keydown', this.handleKeyDown, { capture: true })
    window.removeEventListener('gamepadconnected', this.handleGamepadConnected)
    window.removeEventListener('gamepaddisconnected', this.handleGamepadDisconnected)
    this.gamepadLoopActive = false
  }

  public getMode(): TVInputMode {
    return this.mode
  }

  /**
   * Alterna entre modo de navegação no catálogo e modo de jogo.
   * Guarda o elemento focado para restauração limpa ao sair do jogo.
   */
  public setMode(mode: TVInputMode, triggerElement?: HTMLElement | null) {
    if (this.mode === mode) return

    if (mode === 'GAME') {
      this.lastFocusedElement = triggerElement || (document.activeElement as HTMLElement) || null
      this.mode = 'GAME'
      // Remover foco visível de elementos do DOM ao entrar no jogo
      if (document.activeElement && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
      }
    } else {
      this.mode = 'NAV'
      this.restoreFocus()
    }
  }

  /**
   * Restaura o foco para o elemento anterior que abriu o jogo ou modal
   */
  public restoreFocus() {
    setTimeout(() => {
      if (this.lastFocusedElement && document.contains(this.lastFocusedElement)) {
        this.lastFocusedElement.focus()
      } else {
        const first = document.querySelector<HTMLElement>(
          '[data-tv-focus], button:not([disabled]), a:not([disabled])'
        )
        first?.focus()
      }
    }, 60)
  }

  public subscribe(listener: TVActionListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  public dispatchAction(action: TVCanonicalAction, originalEvent?: Event) {
    this.listeners.forEach(fn => {
      try {
        fn(action, originalEvent)
      } catch (err) {
        console.error('[TVInputController] Erro no listener:', err)
      }
    })
  }

  /**
   * Normalizador de teclas de Smart TV para Ações Canônicas
   */
  private mapKeyToCanonical(e: KeyboardEvent): TVCanonicalAction | null {
    const code = e.keyCode
    const key = e.key

    // 1. BACK / RETURN
    // Tizen: 10009; LG webOS: 461; Android TV: 4; Teclado: Escape, Backspace, BrowserBack
    if (
      code === 10009 ||
      code === 461 ||
      code === 4 ||
      key === 'Escape' ||
      key === 'Backspace' ||
      key === 'BrowserBack' ||
      key === 'GoBack' ||
      key === 'XF86Back'
    ) {
      return 'BACK'
    }

    // 2. PLAY / PAUSE
    // Tizen: 415 (Play), 19 (Pause), 10252 (PlayPause); webOS: 415, 19; Android: 85, 126, 127
    if (
      code === 415 ||
      code === 19 ||
      code === 10252 ||
      code === 85 ||
      code === 126 ||
      code === 127 ||
      key === 'MediaPlayPause' ||
      key === 'MediaPlay' ||
      key === 'MediaPause' ||
      key === 'MediaStop' ||
      (this.mode === 'NAV' && key === ' ') // Espaço em modo catálogo pode pausar player
    ) {
      return 'PLAY_PAUSE'
    }

    // 3. DIRECIONAIS: UP, DOWN, LEFT, RIGHT
    // Android TV DPAD: 19 (UP), 20 (DOWN), 21 (LEFT), 22 (RIGHT)
    // Standard Arrows: 38 (UP), 40 (DOWN), 37 (LEFT), 39 (RIGHT)
    if (code === 37 || code === 21 || key === 'ArrowLeft' || (this.mode === 'GAME' && (key === 'a' || key === 'A'))) {
      return 'LEFT'
    }
    if (code === 39 || code === 22 || key === 'ArrowRight' || (this.mode === 'GAME' && (key === 'd' || key === 'D'))) {
      return 'RIGHT'
    }
    if (code === 38 || code === 19 || key === 'ArrowUp' || (this.mode === 'GAME' && (key === 'w' || key === 'W'))) {
      return 'UP'
    }
    if (code === 40 || code === 20 || key === 'ArrowDown' || (this.mode === 'GAME' && (key === 's' || key === 'S'))) {
      return 'DOWN'
    }

    // 4. SELECT / OK / ENTER
    // Android TV DPAD_CENTER: 23; Enter: 13, 66
    if (code === 13 || code === 66 || code === 23 || key === 'Enter' || key === 'Select' || key === 'Ok') {
      return 'SELECT'
    }

    // 5. GAME ACTIONS ESPECÍFICAS
    if (this.mode === 'GAME') {
      if (key === ' ' || key === 'f' || key === 'F') {
        return 'GAME_ACTION'
      }
      if (key === 'Shift' || key === 'Control') {
        return 'SECONDARY_ACTION'
      }
      if (key === 'p' || key === 'P') {
        return 'PLAY_PAUSE'
      }
    }

    return null
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    // Não interceptar se o usuário estiver digitando em campo de texto
    const target = e.target as HTMLElement | null
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') && !target.dataset.tvPinInput) {
      if (e.key !== 'Escape' && e.key !== 'ArrowDown' && e.key !== 'ArrowUp') {
        return
      }
    }

    const action = this.mapKeyToCanonical(e)
    if (!action) return

    // Sempre prevenir comportamentos nativos indesejados da TV (como sair do browser ao apertar Voltar)
    e.preventDefault()
    e.stopPropagation()

    this.dispatchAction(action, e)
  }

  // ============================================================================
  // GAMEPAD API: CONTROLES BLUETOOTH / GAMEPADS CONECTADOS À TV
  // ============================================================================
  private handleGamepadConnected = () => {
    this.checkGamepads()
  }

  private handleGamepadDisconnected = () => {
    this.checkGamepads()
  }

  private checkGamepads() {
    if (typeof navigator === 'undefined' || !navigator.getGamepads) return
    const pads = navigator.getGamepads()
    const hasAny = Array.from(pads).some(p => p !== null && p.connected)
    if (hasAny && !this.gamepadLoopActive) {
      this.gamepadLoopActive = true
      this.pollGamepads()
    } else if (!hasAny) {
      this.gamepadLoopActive = false
    }
  }

  private pollGamepads = () => {
    if (!this.gamepadLoopActive) return

    const pads = navigator.getGamepads ? navigator.getGamepads() : []
    const now = performance.now()

    for (const pad of pads) {
      if (!pad || !pad.connected) continue

      // Cooldown de repetição para navegação (200ms) vs Jogo (100ms)
      const repeatCooldown = this.mode === 'NAV' ? 220 : 100

      const checkButton = (key: string, isPressed: boolean, action: TVCanonicalAction) => {
        const last = this.lastGamepadPress[key] || 0
        if (isPressed) {
          if (now - last > repeatCooldown) {
            this.lastGamepadPress[key] = now
            this.dispatchAction(action)
          }
        } else {
          delete this.lastGamepadPress[key]
        }
      }

      // Mapeamento Standard Gamepad
      // Botão 0: A (Select / Action)
      checkButton('btn_0', pad.buttons[0]?.pressed, this.mode === 'NAV' ? 'SELECT' : 'GAME_ACTION')
      // Botão 1: B (Back)
      checkButton('btn_1', pad.buttons[1]?.pressed, 'BACK')
      // Botão 2: X (Secondary Action / Jump)
      checkButton('btn_2', pad.buttons[2]?.pressed, this.mode === 'NAV' ? 'SELECT' : 'UP')
      // Botão 3: Y (Action)
      checkButton('btn_3', pad.buttons[3]?.pressed, 'SECONDARY_ACTION')
      // Botão 9: Start / Options (Play/Pause)
      checkButton('btn_9', pad.buttons[9]?.pressed, 'PLAY_PAUSE')

      // D-Pad buttons: 12 (UP), 13 (DOWN), 14 (LEFT), 15 (RIGHT)
      checkButton('btn_12', pad.buttons[12]?.pressed, 'UP')
      checkButton('btn_13', pad.buttons[13]?.pressed, 'DOWN')
      checkButton('btn_14', pad.buttons[14]?.pressed, 'LEFT')
      checkButton('btn_15', pad.buttons[15]?.pressed, 'RIGHT')

      // Analógico Esquerdo (Axes 0 e 1 com deadzone de 0.5)
      const axisX = pad.axes[0] || 0
      const axisY = pad.axes[1] || 0
      checkButton('axis_left', axisX < -0.5, 'LEFT')
      checkButton('axis_right', axisX > 0.5, 'RIGHT')
      checkButton('axis_up', axisY < -0.5, 'UP')
      checkButton('axis_down', axisY > 0.5, 'DOWN')
    }

    if (this.gamepadLoopActive) {
      requestAnimationFrame(this.pollGamepads)
    }
  }
}

// Instância Singleton Exportada
export const tvInputController = new TVInputControllerService()
