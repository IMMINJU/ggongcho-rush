export class AudioManager {
  private audioContext: AudioContext | null = null
  private sounds: Map<string, AudioBuffer> = new Map()
  private bgmGain: GainNode | null = null
  private sfxGain: GainNode | null = null
  private currentBgm: AudioBufferSourceNode | null = null
  
  private bgmVolume: number = 0.3
  private sfxVolume: number = 0.5
  
  async init(): Promise<void> {
    this.audioContext = new AudioContext()
    
    this.bgmGain = this.audioContext.createGain()
    this.bgmGain.gain.value = this.bgmVolume
    this.bgmGain.connect(this.audioContext.destination)
    
    this.sfxGain = this.audioContext.createGain()
    this.sfxGain.gain.value = this.sfxVolume
    this.sfxGain.connect(this.audioContext.destination)
    
    this.generateSounds()
  }
  
  private generateSounds(): void {
    if (!this.audioContext) return
    
    this.sounds.set('collect', this.createTone(440, 0.1, 'sine'))
    this.sounds.set('smoke', this.createTone(220, 0.3, 'sawtooth'))
    this.sounds.set('warning', this.createTone(880, 0.2, 'square'))
    this.sounds.set('police', this.createTone(660, 0.15, 'square'))
    this.sounds.set('coin', this.createTone(880, 0.1, 'sine'))
    this.sounds.set('buy', this.createTone(550, 0.15, 'triangle'))
  }
  
  private createTone(frequency: number, duration: number, type: OscillatorType): AudioBuffer {
    const ctx = this.audioContext!
    const sampleRate = ctx.sampleRate
    const length = sampleRate * duration
    const buffer = ctx.createBuffer(1, length, sampleRate)
    const data = buffer.getChannelData(0)
    
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate
      let sample = 0
      
      switch (type) {
        case 'sine':
          sample = Math.sin(2 * Math.PI * frequency * t)
          break
        case 'square':
          sample = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1
          break
        case 'sawtooth':
          sample = 2 * (t * frequency - Math.floor(0.5 + t * frequency))
          break
        case 'triangle':
          sample = 2 * Math.abs(2 * (t * frequency - Math.floor(t * frequency + 0.5))) - 1
          break
      }
      
      const envelope = 1 - (i / length)
      data[i] = sample * envelope * 0.3
    }
    
    return buffer
  }
  
  play(soundName: string): void {
    if (!this.audioContext || !this.sfxGain) return
    
    const buffer = this.sounds.get(soundName)
    if (!buffer) return
    
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume()
    }
    
    const source = this.audioContext.createBufferSource()
    source.buffer = buffer
    source.connect(this.sfxGain)
    source.start()
  }
  
  startBgm(): void {
    if (!this.audioContext || !this.bgmGain) return
    
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume()
    }
    
    this.playAmbientBgm()
  }
  
  private playAmbientBgm(): void {
    if (!this.audioContext || !this.bgmGain) return
    
    const ctx = this.audioContext
    const now = ctx.currentTime
    
    const playNote = (freq: number, start: number, dur: number) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      
      osc.type = 'sine'
      osc.frequency.value = freq
      
      gain.gain.setValueAtTime(0, now + start)
      gain.gain.linearRampToValueAtTime(0.05, now + start + 0.1)
      gain.gain.linearRampToValueAtTime(0, now + start + dur)
      
      osc.connect(gain)
      gain.connect(this.bgmGain!)
      
      osc.start(now + start)
      osc.stop(now + start + dur)
    }
    
    const notes = [110, 130.81, 146.83, 164.81, 146.83, 130.81]
    notes.forEach((note, i) => {
      playNote(note, i * 2, 2.5)
    })
    
    setTimeout(() => {
      if (this.audioContext) {
        this.playAmbientBgm()
      }
    }, notes.length * 2000)
  }
  
  stopBgm(): void {
    if (this.currentBgm) {
      this.currentBgm.stop()
      this.currentBgm = null
    }
  }
}
