import { ButtQuality } from '../types'

export class CigaretteButt {
  x: number
  y: number
  width: number = 12
  height: number = 4
  
  quality: ButtQuality
  isCollected: boolean = false
  
  private glowPhase: number = Math.random() * Math.PI * 2
  
  constructor(x: number, y: number, qualityType: 'short' | 'normal' | 'long' = 'normal') {
    this.x = x
    this.y = y
    
    switch (qualityType) {
      case 'short':
        this.quality = { type: 'short', nicotineAmount: 5 }
        this.width = 6
        break
      case 'long':
        this.quality = { type: 'long', nicotineAmount: 30 }
        this.width = 16
        break
      default:
        this.quality = { type: 'normal', nicotineAmount: 15 }
        this.width = 10
    }
  }
  
  update(dt: number): void {
    this.glowPhase += dt * 3
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    if (this.isCollected) return
    
    const glow = 0.3 + Math.sin(this.glowPhase) * 0.2
    
    ctx.save()
    
    ctx.shadowColor = '#ff6b35'
    ctx.shadowBlur = 8
    ctx.fillStyle = 'rgba(255, 107, 53, ' + glow + ')'
    ctx.beginPath()
    ctx.arc(this.x + this.width / 2, this.y, 6, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.shadowBlur = 0
    ctx.fillStyle = '#f5f5dc'
    ctx.fillRect(this.x, this.y - 2, this.width, 4)
    
    ctx.fillStyle = '#8b4513'
    ctx.fillRect(this.x + this.width - 3, this.y - 2, 3, 4)
    
    ctx.fillStyle = '#ff4500'
    ctx.fillRect(this.x, this.y - 1, 2, 2)
    
    ctx.restore()
  }
  
  getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x - 8,
      y: this.y - 8,
      width: this.width + 16,
      height: 16
    }
  }
}
