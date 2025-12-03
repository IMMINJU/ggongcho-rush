import { Player } from './Player'

export class Police {
  x: number
  y: number
  width: number = 28
  height: number = 36
  
  private patrolPoints: Array<{x: number, y: number}> = []
  private currentPatrolIndex: number = 0
  private speed: number = 60
  private detectRange: number = 120
  private chaseRange: number = 200
  private chaseSpeed: number = 100
  
  private isChasing: boolean = false
  private animFrame: number = 0
  private animTimer: number = 0
  
  constructor(x: number, y: number, patrolPoints?: Array<{x: number, y: number}>) {
    this.x = x
    this.y = y
    this.patrolPoints = patrolPoints || [
      { x, y },
      { x: x + 150, y },
      { x: x + 150, y: y + 100 },
      { x, y: y + 100 }
    ]
  }
  
  update(dt: number, player: Player, playerIsStealing: boolean): boolean {
    const dx = player.x - this.x
    const dy = player.y - this.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    if (playerIsStealing && distance < this.detectRange) {
      this.isChasing = true
    }
    
    if (this.isChasing) {
      if (distance < 30) {
        return true
      }
      
      if (distance > this.chaseRange) {
        this.isChasing = false
      } else {
        const speed = this.chaseSpeed * dt
        this.x += (dx / distance) * speed
        this.y += (dy / distance) * speed
      }
    } else {
      const target = this.patrolPoints[this.currentPatrolIndex]
      const pdx = target.x - this.x
      const pdy = target.y - this.y
      const pDist = Math.sqrt(pdx * pdx + pdy * pdy)
      
      if (pDist < 5) {
        this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPoints.length
      } else {
        const speed = this.speed * dt
        this.x += (pdx / pDist) * speed
        this.y += (pdy / pDist) * speed
      }
    }
    
    this.animTimer += dt
    if (this.animTimer > 0.2) {
      this.animTimer = 0
      this.animFrame = (this.animFrame + 1) % 4
    }
    
    return false
  }
  
  isPlayerInSight(player: Player): boolean {
    const dx = player.x - this.x
    const dy = player.y - this.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    return distance < this.detectRange
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    ctx.save()
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.beginPath()
    ctx.ellipse(this.x + this.width / 2, this.y + this.height, this.width / 2, 4, 0, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.fillStyle = '#1a3a6a'
    ctx.fillRect(this.x + 4, this.y + 14, 20, 20)
    
    ctx.fillStyle = '#d4a574'
    ctx.fillRect(this.x + 7, this.y + 2, 14, 14)
    
    ctx.fillStyle = '#1a2a4a'
    ctx.fillRect(this.x + 5, this.y, 18, 6)
    
    ctx.fillStyle = '#ffd700'
    ctx.fillRect(this.x + 2, this.y + 16, 4, 4)
    
    ctx.fillStyle = '#1a2a3a'
    const legOffset = Math.sin(this.animFrame * Math.PI / 2) * 3
    ctx.fillRect(this.x + 7, this.y + 32, 5, 6 + legOffset)
    ctx.fillRect(this.x + 16, this.y + 32, 5, 6 - legOffset)
    
    if (this.isChasing) {
      ctx.fillStyle = '#ff0000'
      ctx.beginPath()
      ctx.arc(this.x + this.width / 2, this.y - 10, 5 + Math.sin(Date.now() / 100) * 2, 0, Math.PI * 2)
      ctx.fill()
    }
    
    ctx.restore()
  }
}
