/**
 * Sistema de Áudio Web Sintetizado & Efeitos Lúdicos Infantis
 * Respeita totalmente a política de autoplay dos navegadores web.
 */

class SoundEffectManager {
  private ctx: AudioContext | null = null
  private muted: boolean = false

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  public setMuted(muted: boolean) {
    this.muted = muted
  }

  public isMuted(): boolean {
    return this.muted
  }

  public playCardFlip() {
    if (this.muted) return
    this.initContext()
    if (!this.ctx) return

    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(320, this.ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(640, this.ctx.currentTime + 0.08)

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08)

    osc.connect(gain)
    gain.connect(this.ctx.destination)
    osc.start()
    osc.stop(this.ctx.currentTime + 0.08)
  }

  public playMatchSuccess() {
    if (this.muted) return
    this.initContext()
    if (!this.ctx) return

    const notes = [440, 554.37, 659.25, 880] // A Major chord arpeggio
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator()
      const gain = this.ctx!.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.07)

      gain.gain.setValueAtTime(0.25, this.ctx!.currentTime + idx * 0.07)
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + idx * 0.07 + 0.25)

      osc.connect(gain)
      gain.connect(this.ctx!.destination)
      osc.start(this.ctx!.currentTime + idx * 0.07)
      osc.stop(this.ctx!.currentTime + idx * 0.07 + 0.25)
    })
  }

  public playSnap() {
    if (this.muted) return
    this.initContext()
    if (!this.ctx) return

    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(520, this.ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.12)

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12)

    osc.connect(gain)
    gain.connect(this.ctx.destination)
    osc.start()
    osc.stop(this.ctx.currentTime + 0.12)
  }

  public playVictory() {
    if (this.muted) return
    this.initContext()
    if (!this.ctx) return

    const fanfare = [523.25, 659.25, 783.99, 1046.50] // C, E, G, C High
    fanfare.forEach((f, i) => {
      const osc = this.ctx!.createOscillator()
      const gain = this.ctx!.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(f, this.ctx!.currentTime + i * 0.12)

      gain.gain.setValueAtTime(0.35, this.ctx!.currentTime + i * 0.12)
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + i * 0.12 + 0.4)

      osc.connect(gain)
      gain.connect(this.ctx!.destination)
      osc.start(this.ctx!.currentTime + i * 0.12)
      osc.stop(this.ctx!.currentTime + i * 0.12 + 0.4)
    })
  }

  public playJump() {
    if (this.muted) return
    this.initContext()
    if (!this.ctx) return

    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(260, this.ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(620, this.ctx.currentTime + 0.15)

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15)

    osc.connect(gain)
    gain.connect(this.ctx.destination)
    osc.start()
    osc.stop(this.ctx.currentTime + 0.15)
  }

  public playCollect() {
    if (this.muted) return
    this.initContext()
    if (!this.ctx) return

    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(800, this.ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.1)

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1)

    osc.connect(gain)
    gain.connect(this.ctx.destination)
    osc.start()
    osc.stop(this.ctx.currentTime + 0.1)
  }
}

export const soundEffects = new SoundEffectManager()
