/**
 * Com Deus Kids — Sistema de Áudio Profissional Multi-Camada e Espacial 3D
 * Suporta Web Audio API, Canais Independentes (Master, Music, Ambience, SFX, Voice),
 * Síntese Procedural de Efeitos Bíblicos, Posicionamento 3D (PannerNode) e Ducking de Narração.
 */

export interface AudioVolumes {
  master: number // 0 a 100
  music: number
  ambience: number
  sfx: number
  voice: number
  muted: boolean
}

export type SFXType =
  | 'ui_click'
  | 'ui_confirm'
  | 'ui_back'
  | 'pause'
  | 'resume'
  | 'countdown'
  | 'jump'
  | 'land'
  | 'footstep_dirt'
  | 'footstep_stone'
  | 'run_dirt'
  | 'run_stone'
  | 'collect'
  | 'objective_new'
  | 'objective_complete'
  | 'checkpoint'
  | 'blocked_path'
  | 'climb'
  | 'branch'
  | 'leaves'
  | 'heart_lost'
  | 'game_over'
  | 'victory'
  | 'achievement'
  | 'sheep_baa'

class ProfessionalAudioManager {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private musicGain: GainNode | null = null
  private ambienceGain: GainNode | null = null
  private sfxGain: GainNode | null = null
  private voiceGain: GainNode | null = null

  // Volumes
  private volumes: AudioVolumes = {
    master: 90,
    music: 70,
    ambience: 60,
    sfx: 80,
    voice: 95,
    muted: false
  }

  // Active looping nodes
  private isAmbienceRunning = false
  private ambienceWindNode: AudioNode | null = null
  private ambienceTimer: any = null
  private musicTimer: any = null
  private isMusicPlaying = false
  private currentMusicMood: 'exploration' | 'crowd' | 'tree' | 'jesus' = 'exploration'

  // Debounce para evitar sons iguais disparando no mesmo frame
  private lastSoundTimes: Map<string, number> = new Map()

  // Listener 3D cache
  private listenerPos = { x: 0, y: 0, z: 0 }

  constructor() {
    this.loadSettings()
  }

  private loadSettings() {
    if (typeof window === 'undefined') return
    try {
      const saved = localStorage.getItem('comdeuskids_audio_config')
      if (saved) {
        this.volumes = { ...this.volumes, ...JSON.parse(saved) }
      }
    } catch (e) {
      // Fallback para padrões
    }
  }

  public saveSettings() {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem('comdeuskids_audio_config', JSON.stringify(this.volumes))
    } catch (e) {
      // Ignore
    }
  }

  public init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume()
      }
      return
    }

    if (typeof window === 'undefined') return
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return

    this.ctx = new AudioCtx()

    // Master Bus
    this.masterGain = this.ctx.createGain()
    this.masterGain.connect(this.ctx.destination)

    // Sub-Buses
    this.musicGain = this.ctx.createGain()
    this.musicGain.connect(this.masterGain)

    this.ambienceGain = this.ctx.createGain()
    this.ambienceGain.connect(this.masterGain)

    this.sfxGain = this.ctx.createGain()
    this.sfxGain.connect(this.masterGain)

    this.voiceGain = this.ctx.createGain()
    this.voiceGain.connect(this.masterGain)

    this.updateGainLevels()
  }

  private updateGainLevels() {
    if (!this.ctx || !this.masterGain || !this.musicGain || !this.ambienceGain || !this.sfxGain || !this.voiceGain) return

    const now = this.ctx.currentTime
    const masterVal = this.volumes.muted ? 0 : this.volumes.master / 100

    this.masterGain.gain.setValueAtTime(masterVal, now)
    this.musicGain.gain.setValueAtTime(this.volumes.music / 100, now)
    this.ambienceGain.gain.setValueAtTime(this.volumes.ambience / 100, now)
    this.sfxGain.gain.setValueAtTime(this.volumes.sfx / 100, now)
    this.voiceGain.gain.setValueAtTime(this.volumes.voice / 100, now)
  }

  public setVolume(channel: keyof Omit<AudioVolumes, 'muted'>, value: number) {
    this.volumes[channel] = Math.max(0, Math.min(100, value))
    this.updateGainLevels()
    this.saveSettings()
  }

  public setMuted(muted: boolean) {
    this.volumes.muted = muted
    this.updateGainLevels()
    this.saveSettings()
  }

  public getVolumes(): AudioVolumes {
    return { ...this.volumes }
  }

  // Atualiza posição do ouvinte no espaço 3D (normalmente a cabeça ou câmera de Zaqueu)
  public updateListenerPosition(x: number, y: number, z: number, forwardX = 0, forwardY = 0, forwardZ = -1) {
    this.listenerPos = { x, y, z }
    if (!this.ctx) return
    const listener = this.ctx.listener
    if (!listener) return

    if (listener.positionX) {
      listener.positionX.setValueAtTime(x, this.ctx.currentTime)
      listener.positionY.setValueAtTime(y, this.ctx.currentTime)
      listener.positionZ.setValueAtTime(z, this.ctx.currentTime)
      listener.forwardX.setValueAtTime(forwardX, this.ctx.currentTime)
      listener.forwardY.setValueAtTime(forwardY, this.ctx.currentTime)
      listener.forwardZ.setValueAtTime(forwardZ, this.ctx.currentTime)
    } else {
      // Legado
      listener.setPosition(x, y, z)
      listener.setOrientation(forwardX, forwardY, forwardZ, 0, 1, 0)
    }
  }

  // Cria um nó espacial 3D para um emissor no mundo (ex: ovelha, mercado, vendedor)
  public createSpatialPanner(x: number, y: number, z: number, refDistance = 3, maxDistance = 25): PannerNode | null {
    if (!this.ctx || !this.sfxGain) return null
    const panner = this.ctx.createPanner()
    panner.panningModel = 'HRTF'
    panner.distanceModel = 'inverse'
    panner.refDistance = refDistance
    panner.maxDistance = maxDistance
    panner.rolloffFactor = 1.2
    panner.coneInnerAngle = 360

    if (panner.positionX) {
      panner.positionX.setValueAtTime(x, this.ctx.currentTime)
      panner.positionY.setValueAtTime(y, this.ctx.currentTime)
      panner.positionZ.setValueAtTime(z, this.ctx.currentTime)
    } else {
      panner.setPosition(x, y, z)
    }

    panner.connect(this.sfxGain)
    return panner
  }

  // Toca efeito sonoro com proteção de repetição rápida
  public playSFX(type: SFXType, position?: { x: number; y: number; z: number }) {
    this.init()
    if (!this.ctx || !this.sfxGain || this.volumes.muted) return

    // Debounce de 60ms por tipo de som para evitar sobreposição caótica
    const nowMs = performance.now()
    const lastTime = this.lastSoundTimes.get(type) || 0
    if (nowMs - lastTime < 60) return
    this.lastSoundTimes.set(type, nowMs)

    // Conectar à saída de SFX ou a um Panner 3D
    let destination: AudioNode = this.sfxGain
    if (position) {
      const panner = this.createSpatialPanner(position.x, position.y, position.z)
      if (panner) destination = panner
    }

    const t = this.ctx.currentTime

    switch (type) {
      case 'footstep_dirt': {
        // Passo em terra: ruído filtrado com grave suave
        const bufferSize = this.ctx.sampleRate * 0.08
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2))
        }
        const noise = this.ctx.createBufferSource()
        noise.buffer = buffer
        const filter = this.ctx.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(320, t)

        const gain = this.ctx.createGain()
        gain.gain.setValueAtTime(0.18, t)
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08)

        noise.connect(filter)
        filter.connect(gain)
        gain.connect(destination)
        noise.start(t)
        break
      }

      case 'footstep_stone': {
        // Passo em pedra: 'clack' com frequências mais altas e agudas
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(450, t)
        osc.frequency.exponentialRampToValueAtTime(140, t + 0.06)

        gain.gain.setValueAtTime(0.2, t)
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.06)

        osc.connect(gain)
        gain.connect(destination)
        osc.start(t)
        osc.stop(t + 0.06)
        break
      }

      case 'jump': {
        // Impulso de pulo Zaqueu
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(220, t)
        osc.frequency.exponentialRampToValueAtTime(580, t + 0.16)

        gain.gain.setValueAtTime(0.25, t)
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.16)

        osc.connect(gain)
        gain.connect(destination)
        osc.start(t)
        osc.stop(t + 0.16)
        break
      }

      case 'land': {
        // Aterrissagem com amortecimento
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(180, t)
        osc.frequency.exponentialRampToValueAtTime(60, t + 0.12)

        gain.gain.setValueAtTime(0.3, t)
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12)

        osc.connect(gain)
        gain.connect(destination)
        osc.start(t)
        osc.stop(t + 0.12)
        break
      }

      case 'collect': {
        // Estrela ou item de pontuação
        const notes = [659.25, 880, 1318.51] // E5, A5, E6
        notes.forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator()
          const gain = this.ctx!.createGain()
          osc.type = 'sine'
          osc.frequency.setValueAtTime(freq, t + idx * 0.04)

          gain.gain.setValueAtTime(0.22, t + idx * 0.04)
          gain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.04 + 0.15)

          osc.connect(gain)
          gain.connect(destination)
          osc.start(t + idx * 0.04)
          osc.stop(t + idx * 0.04 + 0.15)
        })
        break
      }

      case 'objective_new': {
        // Nova missão / Chamado
        const chord = [392, 493.88, 587.33, 783.99] // G4, B4, D5, G5
        chord.forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator()
          const gain = this.ctx!.createGain()
          osc.type = 'triangle'
          osc.frequency.setValueAtTime(freq, t + idx * 0.06)

          gain.gain.setValueAtTime(0.3, t + idx * 0.06)
          gain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.06 + 0.35)

          osc.connect(gain)
          gain.connect(destination)
          osc.start(t + idx * 0.06)
          osc.stop(t + idx * 0.06 + 0.35)
        })
        break
      }

      case 'checkpoint': {
        // Checkpoint salvo no topo da árvore
        const bellNotes = [523.25, 659.25, 783.99, 1046.5]
        bellNotes.forEach((f, i) => {
          const osc = this.ctx!.createOscillator()
          const gain = this.ctx!.createGain()
          osc.type = 'sine'
          osc.frequency.setValueAtTime(f, t + i * 0.08)

          gain.gain.setValueAtTime(0.25, t + i * 0.08)
          gain.gain.exponentialRampToValueAtTime(0.005, t + i * 0.08 + 0.4)

          osc.connect(gain)
          gain.connect(destination)
          osc.start(t + i * 0.08)
          osc.stop(t + i * 0.08 + 0.4)
        })
        break
      }

      case 'blocked_path': {
        // Zaqueu tentando atravessar a multidão e não conseguindo
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(160, t)
        osc.frequency.exponentialRampToValueAtTime(110, t + 0.2)

        gain.gain.setValueAtTime(0.2, t)
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2)

        osc.connect(gain)
        gain.connect(destination)
        osc.start(t)
        osc.stop(t + 0.2)
        break
      }

      case 'sheep_baa': {
        // Balido de ovelha (áudio 3D posicional no mercado)
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(260, t)
        osc.frequency.linearRampToValueAtTime(220, t + 0.25)
        osc.frequency.linearRampToValueAtTime(180, t + 0.5)

        const filter = this.ctx.createBiquadFilter()
        filter.type = 'bandpass'
        filter.frequency.setValueAtTime(650, t)
        filter.Q.setValueAtTime(3, t)

        gain.gain.setValueAtTime(0.25, t)
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5)

        osc.connect(filter)
        filter.connect(gain)
        gain.connect(destination)
        osc.start(t)
        osc.stop(t + 0.5)
        break
      }

      case 'ui_click': {
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(700, t)
        osc.frequency.exponentialRampToValueAtTime(400, t + 0.04)

        gain.gain.setValueAtTime(0.15, t)
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.04)

        osc.connect(gain)
        gain.connect(destination)
        osc.start(t)
        osc.stop(t + 0.04)
        break
      }

      case 'pause': {
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(440, t)
        osc.frequency.exponentialRampToValueAtTime(220, t + 0.1)

        gain.gain.setValueAtTime(0.2, t)
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1)

        osc.connect(gain)
        gain.connect(destination)
        osc.start(t)
        osc.stop(t + 0.1)
        break
      }

      case 'resume': {
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(220, t)
        osc.frequency.exponentialRampToValueAtTime(440, t + 0.1)

        gain.gain.setValueAtTime(0.2, t)
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1)

        osc.connect(gain)
        gain.connect(destination)
        osc.start(t)
        osc.stop(t + 0.1)
        break
      }

      default:
        break
    }
  }

  // Inicia o ambiente de Jericó (Vento do deserto + pássaros + burburinho suave)
  public startJerichoAmbience() {
    this.init()
    if (!this.ctx || !this.ambienceGain || this.isAmbienceRunning) return
    this.isAmbienceRunning = true

    // Ruído do vento suave com filtro passa-baixa modulado
    const bufferSize = this.ctx.sampleRate * 2
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }

    const windSource = this.ctx.createBufferSource()
    windSource.buffer = buffer
    windSource.loop = true

    const filter = this.ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(280, this.ctx.currentTime)

    const windGain = this.ctx.createGain()
    windGain.gain.setValueAtTime(0.12, this.ctx.currentTime)

    windSource.connect(filter)
    filter.connect(windGain)
    windGain.connect(this.ambienceGain)
    windSource.start()
    this.ambienceWindNode = windSource

    // Pássaros aleatórios de Jericó a cada 4–8 segundos
    this.ambienceTimer = setInterval(() => {
      if (!this.ctx || !this.ambienceGain || this.volumes.muted || !this.isAmbienceRunning) return
      const t = this.ctx.currentTime
      const birdOsc = this.ctx.createOscillator()
      const birdGain = this.ctx.createGain()

      birdOsc.type = 'sine'
      const baseFreq = 2400 + Math.random() * 800
      birdOsc.frequency.setValueAtTime(baseFreq, t)
      birdOsc.frequency.linearRampToValueAtTime(baseFreq + 400, t + 0.08)
      birdOsc.frequency.linearRampToValueAtTime(baseFreq, t + 0.16)

      birdGain.gain.setValueAtTime(0.04, t)
      birdGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22)

      birdOsc.connect(birdGain)
      birdGain.connect(this.ambienceGain)
      birdOsc.start(t)
      birdOsc.stop(t + 0.22)
    }, 5000)
  }

  public stopJerichoAmbience() {
    this.isAmbienceRunning = false
    if (this.ambienceWindNode) {
      try {
        ;(this.ambienceWindNode as AudioScheduledSourceNode).stop()
      } catch (e) {
        // Ignore
      }
      this.ambienceWindNode = null
    }
    if (this.ambienceTimer) {
      clearInterval(this.ambienceTimer)
      this.ambienceTimer = null
    }
  }

  // Música dinâmica instrumental estilo bíblico / deserto (alaúde/harpa suave)
  public startExplorationMusic() {
    this.init()
    if (!this.ctx || !this.musicGain || this.isMusicPlaying) return
    this.isMusicPlaying = true

    // Escala modal antiga de Jericó (Ré Dórico / Frígio Suave): D, E, F, G, A, Bb, C
    const scale = [293.66, 329.63, 349.23, 392.0, 440.0, 466.16, 523.25]
    let step = 0

    const playChordStep = () => {
      if (!this.isMusicPlaying || !this.ctx || !this.musicGain) return

      const t = this.ctx.currentTime
      const note = scale[step % scale.length]
      const bassNote = scale[0] / 2

      // Alaúde/Harpa
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(note, t)

      gain.gain.setValueAtTime(0.12, t)
      gain.gain.exponentialRampToValueAtTime(0.005, t + 0.8)

      osc.connect(gain)
      gain.connect(this.musicGain)
      osc.start(t)
      osc.stop(t + 0.8)

      // Nota de bordão a cada 4 passos
      if (step % 4 === 0) {
        const bassOsc = this.ctx.createOscillator()
        const bassGain = this.ctx.createGain()
        bassOsc.type = 'sine'
        bassOsc.frequency.setValueAtTime(bassNote, t)
        bassGain.gain.setValueAtTime(0.15, t)
        bassGain.gain.exponentialRampToValueAtTime(0.005, t + 1.2)

        bassOsc.connect(bassGain)
        bassGain.connect(this.musicGain)
        bassOsc.start(t)
        bassOsc.stop(t + 1.2)
      }

      step++
      this.musicTimer = setTimeout(playChordStep, 700)
    }

    playChordStep()
  }

  public stopExplorationMusic() {
    this.isMusicPlaying = false
    if (this.musicTimer) {
      clearTimeout(this.musicTimer)
      this.musicTimer = null
    }
  }

  // Ducking: atenua música e ambiente durante uma narração e restaura em seguida
  public triggerVoiceDucking(durationMs: number) {
    if (!this.ctx || !this.musicGain || !this.ambienceGain) return
    const now = this.ctx.currentTime
    const targetMusic = (this.volumes.music / 100) * 0.25
    const targetAmbience = (this.volumes.ambience / 100) * 0.3

    this.musicGain.gain.setTargetAtTime(targetMusic, now, 0.2)
    this.ambienceGain.gain.setTargetAtTime(targetAmbience, now, 0.2)

    setTimeout(() => {
      if (this.ctx && this.musicGain && this.ambienceGain) {
        const restoreTime = this.ctx.currentTime
        this.musicGain.gain.setTargetAtTime(this.volumes.music / 100, restoreTime, 0.5)
        this.ambienceGain.gain.setTargetAtTime(this.volumes.ambience / 100, restoreTime, 0.5)
      }
    }, durationMs)
  }

  // Pausar/retomar som do jogo ao abrir modal
  public pauseGameAudio() {
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(0.2, this.ctx.currentTime, 0.1)
    }
  }

  public resumeGameAudio() {
    if (this.ctx && this.masterGain) {
      const normal = this.volumes.muted ? 0 : this.volumes.master / 100
      this.masterGain.gain.setTargetAtTime(normal, this.ctx.currentTime, 0.1)
    }
  }
}

export const audioManager = new ProfessionalAudioManager()

// Adaptador de retrocompatibilidade para jogos 2D simples
export const soundEffects = {
  setMuted: (m: boolean) => audioManager.setMuted(m),
  isMuted: () => audioManager.getVolumes().muted,
  playCardFlip: () => audioManager.playSFX('ui_click'),
  playMatchSuccess: () => audioManager.playSFX('checkpoint'),
  playSnap: () => audioManager.playSFX('ui_confirm'),
  playVictory: () => audioManager.playSFX('victory'),
  playJump: () => audioManager.playSFX('jump'),
  playCollect: () => audioManager.playSFX('collect')
}
