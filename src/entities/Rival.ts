import { CigaretteButt } from './CigaretteButt'

export class Rival {
  x: number
  y: number
  width: number = 24
  height: number = 32
  
  private targetButt: CigaretteButt | null = null
  private speed: number = 70
  private detectRange: number = 150
  private wanderTimer: number = 0
  private wanderDirection: { x: number, y: number } = { x: 0, y: 0 }
  
  private animFrame: number = 0
  private animTimer: number = 0
  
  constructor(x: number, y: number) {
    this.x = x
    this.y = y
    this.randomWanderDirection()
  }
  
  private randomWanderDirection(): void {
    const angle = Math.random() * Math.PI * 2
    this.wanderDirection = {
      x: Math.cos(angle),
      y: Math.sin(angle)
    }
    this.wanderTimer = 2 + Math.random() * 3
  }
  
  update(dt: number, butts: CigaretteButt[], mapWidth: number, mapHeight: number): CigaretteButt | null {
    let collectedButt: CigaretteButt | null = null
    
    if (!this.targetButt || this.targetButt.isCollected) {
      this.targetButt = null
      let closestDist = this.detectRange
      
      for (const butt of butts) {
        if (butt.isCollected) continue
        const dx = butt.x - this.x
        const dy = butt.y - this.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < closestDist) {
          closestDist = dist
          this.targetButt = butt
        }
      }
    }
    
    if (this.targetButt) {
      const dx = this.targetButt.x - this.x
      const dy = this.targetButt.y - this.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      
      if (dist < 15) {
        this.targetButt.isCollected = true
        collectedButt = this.targetButt
        this.targetButt = null
      } else {
        this.x += (dx / dist) * this.speed * dt
        this.y += (dy / dist) * this.speed * dt
      }
    } else {
      this.wanderTimer -= dt
      if (this.wanderTimer <= 0) {
        this.randomWanderDirection()
      }
      
      this.x += this.wanderDirection.x * this.speed * 0.5 * dt
      this.y += this.wanderDirection.y * this.speed * 0.5 * dt
      
      this.x = Math.max(50, Math.min(mapWidth - 50, this.x))
      this.y = Math.max(50, Math.min(mapHeight - 50, this.y))
    }
    
    this.animTimer += dt
    if (this.animTimer > 0.2) {
      this.animTimer = 0
      this.animFrame = (this.animFrame + 1) % 4
    }
    
    return collectedButt
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    ctx.save()
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.beginPath()
    ctx.ellipse(this.x + this.width / 2, this.y + this.height, this.width / 2, 4, 0, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.fillStyle = '#4a4a3a'
    ctx.fillRect(this.x + 4, this.y + 12, 16, 18)
    
    ctx.fillStyle = '#c4a484'
    ctx.fillRect(this.x + 6, this.y, 12, 14)
    
    ctx.fillStyle = '#5a5a5a'
    ctx.fillRect(this.x + 5, this.y - 2, 14, 6)
    
    ctx.fillStyle = '#3a3a2a'
    const legOffset = Math.sin(this.animFrame * Math.PI / 2) * 3
    ctx.fillRect(this.x + 6, this.y + 28, 4, 6 + legOffset)
    ctx.fillRect(this.x + 14, this.y + 28, 4, 6 - legOffset)
    
    if (this.targetButt) {
      ctx.strokeStyle = 'rgba(255, 100, 100, 0.3)'
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.moveTo(this.x + this.width / 2, this.y + this.height / 2)
      ctx.lineTo(this.targetButt.x, this.targetButt.y)
      ctx.stroke()
      ctx.setLineDash([])
    }
    
    ctx.restore()
  }
}
