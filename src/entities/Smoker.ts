import { SmokerType, Position } from '../types'
import { CigaretteButt } from './CigaretteButt'

export class Smoker {
  x: number
  y: number
  width: number = 24
  height: number = 32
  
  type: SmokerType
  private isSmoking: boolean = true
  private smokeProgress: number = 0
  private smokeDuration: number
  private droppedButt: CigaretteButt | null = null
  
  private animFrame: number = 0
  private animTimer: number = 0
  private smokeParticles: Array<{ x: number; y: number; life: number }> = []
  
  constructor(x: number, y: number, type: SmokerType) {
    this.x = x
    this.y = y
    this.type = type
    
    switch (type) {
      case 'worker':
        this.smokeDuration = 8
        break
      case 'drunk':
        this.smokeDuration = 15
        break
      case 'student':
        this.smokeDuration = 4
        break
      case 'vaper':
        this.smokeDuration = 999
        break
      default:
        this.smokeDuration = 10
    }
  }
  
  update(dt: number): void {
    if (this.isSmoking && this.type !== 'vaper') {
      this.smokeProgress += dt
      
      if (this.smokeProgress >= this.smokeDuration) {
        this.isSmoking = false
        this.dropButt()
      }
      
      if (Math.random() < 0.1) {
        this.smokeParticles.push({
          x: this.x + 20,
          y: this.y + 8,
          life: 1
        })
      }
    }
    
    if (this.type === 'vaper' && Math.random() < 0.05) {
      for (let i = 0; i < 3; i++) {
        this.smokeParticles.push({
          x: this.x + 20 + Math.random() * 10,
          y: this.y + 8,
          life: 1.5
        })
      }
    }
    
    for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
      const p = this.smokeParticles[i]
      p.y -= dt * 20
      p.x += (Math.random() - 0.5) * dt * 10
      p.life -= dt
      if (p.life <= 0) {
        this.smokeParticles.splice(i, 1)
      }
    }
    
    this.animTimer += dt
    if (this.animTimer > 0.5) {
      this.animTimer = 0
      this.animFrame = (this.animFrame + 1) % 2
    }
  }
  
  private dropButt(): void {
    if (this.type === 'vaper') return
    
    let quality: 'short' | 'normal' | 'long' = 'normal'
    const roll = Math.random()
    
    switch (this.type) {
      case 'drunk':
        quality = roll < 0.4 ? 'long' : roll < 0.7 ? 'normal' : 'short'
        break
      case 'student':
        quality = roll < 0.1 ? 'normal' : 'short'
        break
      case 'worker':
        quality = roll < 0.2 ? 'long' : roll < 0.6 ? 'normal' : 'short'
        break
    }
    
    this.droppedButt = new CigaretteButt(
      this.x + Math.random() * 20 - 10,
      this.y + this.height + 5,
      quality
    )
  }
  
  getDroppedButt(): CigaretteButt | null {
    const butt = this.droppedButt
    this.droppedButt = null
    return butt
  }
  
  hasDroppedButt(): boolean {
    return this.droppedButt !== null
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    ctx.save()
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.beginPath()
    ctx.ellipse(this.x + this.width / 2, this.y + this.height, this.width / 2, 4, 0, 0, Math.PI * 2)
    ctx.fill()
    
    let bodyColor = '#4a4a6a'
    switch (this.type) {
      case 'worker':
        bodyColor = '#2a2a4a'
        break
      case 'drunk':
        bodyColor = '#5a3a3a'
        break
      case 'student':
        bodyColor = '#3a4a5a'
        break
      case 'vaper':
        bodyColor = '#4a5a4a'
        break
    }
    
    ctx.fillStyle = bodyColor
    ctx.fillRect(this.x + 4, this.y + 12, 16, 18)
    
    ctx.fillStyle = '#d4a574'
    ctx.fillRect(this.x + 6, this.y, 12, 14)
    
    ctx.fillStyle = this.type === 'student' ? '#1a1a1a' : '#3a3a3a'
    ctx.fillRect(this.x + 6, this.y, 12, 5)
    
    ctx.fillStyle = '#3a3a3a'
    ctx.fillRect(this.x + 6, this.y + 28, 4, 6)
    ctx.fillRect(this.x + 14, this.y + 28, 4, 6)
    
    if (this.isSmoking) {
      if (this.type === 'vaper') {
        ctx.fillStyle = '#3a3a3a'
        ctx.fillRect(this.x + 18, this.y + 7, 10, 4)
        ctx.fillStyle = '#5a5aff'
        ctx.fillRect(this.x + 26, this.y + 8, 2, 2)
      } else {
        ctx.fillStyle = '#fff'
        ctx.fillRect(this.x + 18, this.y + 8, 8, 2)
        ctx.fillStyle = '#ff6b35'
        ctx.fillRect(this.x + 25, this.y + 7, 2, 3)
      }
    }
    
    for (const p of this.smokeParticles) {
      const alpha = p.life * 0.5
      ctx.fillStyle = this.type === 'vaper' 
        ? 'rgba(200, 200, 255, ' + alpha + ')' 
        : 'rgba(180, 180, 180, ' + alpha + ')'
      ctx.beginPath()
      ctx.arc(p.x, p.y, 2 + (1 - p.life) * 3, 0, Math.PI * 2)
      ctx.fill()
    }
    
    ctx.restore()
  }
}
