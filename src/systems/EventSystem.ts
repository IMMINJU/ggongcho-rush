export type GameEvent = 'none' | 'rain' | 'crackdown' | 'rushHour' | 'luckyDay'

export class EventSystem {
  currentEvent: GameEvent = 'none'
  private eventTimer: number = 0
  private eventDuration: number = 0
  private timeSinceLastEvent: number = 0
  private eventInterval: number = 30
  
  update(dt: number): GameEvent | null {
    if (this.currentEvent !== 'none') {
      this.eventTimer += dt
      if (this.eventTimer >= this.eventDuration) {
        const endedEvent = this.currentEvent
        this.currentEvent = 'none'
        this.eventTimer = 0
        this.timeSinceLastEvent = 0
        return endedEvent
      }
    } else {
      this.timeSinceLastEvent += dt
      if (this.timeSinceLastEvent >= this.eventInterval) {
        this.triggerRandomEvent()
      }
    }
    return null
  }
  
  private triggerRandomEvent(): void {
    const events: GameEvent[] = ['rain', 'crackdown', 'rushHour', 'luckyDay']
    const weights = [0.3, 0.25, 0.3, 0.15]
    
    let roll = Math.random()
    for (let i = 0; i < events.length; i++) {
      roll -= weights[i]
      if (roll <= 0) {
        this.currentEvent = events[i]
        break
      }
    }
    
    switch (this.currentEvent) {
      case 'rain':
        this.eventDuration = 20
        break
      case 'crackdown':
        this.eventDuration = 25
        break
      case 'rushHour':
        this.eventDuration = 15
        break
      case 'luckyDay':
        this.eventDuration = 10
        break
      default:
        this.eventDuration = 15
    }
    
    this.eventTimer = 0
  }
  
  getEventEffects(): {
    buttSpawnMultiplier: number
    buttQualityMultiplier: number
    smokerSpawnMultiplier: number
    policeSpawnMultiplier: number
    wetButts: boolean
  } {
    switch (this.currentEvent) {
      case 'rain':
        return {
          buttSpawnMultiplier: 0.5,
          buttQualityMultiplier: 0.3,
          smokerSpawnMultiplier: 0.3,
          policeSpawnMultiplier: 0.5,
          wetButts: true
        }
      case 'crackdown':
        return {
          buttSpawnMultiplier: 0.7,
          buttQualityMultiplier: 1,
          smokerSpawnMultiplier: 0.5,
          policeSpawnMultiplier: 2.5,
          wetButts: false
        }
      case 'rushHour':
        return {
          buttSpawnMultiplier: 2,
          buttQualityMultiplier: 1.2,
          smokerSpawnMultiplier: 2.5,
          policeSpawnMultiplier: 0.8,
          wetButts: false
        }
      case 'luckyDay':
        return {
          buttSpawnMultiplier: 1.5,
          buttQualityMultiplier: 2,
          smokerSpawnMultiplier: 1.2,
          policeSpawnMultiplier: 0.5,
          wetButts: false
        }
      default:
        return {
          buttSpawnMultiplier: 1,
          buttQualityMultiplier: 1,
          smokerSpawnMultiplier: 1,
          policeSpawnMultiplier: 1,
          wetButts: false
        }
    }
  }
  
  getEventMessage(): string {
    switch (this.currentEvent) {
      case 'rain': return '비가 온다... 꽁초가 젖는다'
      case 'crackdown': return '단속의 날! 경찰 조심!'
      case 'rushHour': return '퇴근 시간! 흡연자가 많다'
      case 'luckyDay': return '오늘은 운이 좋은 날!'
      default: return ''
    }
  }
}
