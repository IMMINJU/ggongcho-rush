export class Coin {
  x: number
  y: number
  value: number
  isCollected: boolean = false
  
  private bobPhase: number = Math.random() * Math.PI * 2
  private glowPhase: number = Math.random() * Math.PI * 2
  
  constructor(x: number, y: number, value: number = 100) {
    this.x = x
    this.y = y
    this.value = value
  }
  
  update(dt: number): void {
    this.bobPhase += dt * 3
    this.glowPhase += dt * 5
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    if (this.isCollected) return
    
    const bobY = Math.sin(this.bobPhase) * 2
    const glow = 0.3 + Math.sin(this.glowPhase) * 0.2
    
    ctx.save()
    
    ctx.shadowColor = '#ffd700'
    ctx.shadowBlur = 8
    ctx.fillStyle = 'rgba(255, 215, 0, ' + glow + ')'
    ctx.beginPath()
    ctx.arc(this.x, this.y + bobY, 10, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.shadowBlur = 0
    ctx.fillStyle = '#ffd700'
    ctx.beginPath()
    ctx.arc(this.x, this.y + bobY, 6, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.fillStyle = '#ffec8b'
    ctx.beginPath()
    ctx.arc(this.x - 2, this.y + bobY - 2, 2, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.restore()
  }
  
  getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x - 10,
      y: this.y - 10,
      width: 20,
      height: 20
    }
  }
}
