export class Shop {
  x: number
  y: number
  width: number = 64
  height: number = 48
  
  cigarettePrice: number = 500
  
  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }
  
  isPlayerNear(playerX: number, playerY: number): boolean {
    const dx = (this.x + this.width / 2) - playerX
    const dy = (this.y + this.height / 2) - playerY
    return Math.sqrt(dx * dx + dy * dy) < 60
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    ctx.save()
    
    ctx.fillStyle = '#2a4a2a'
    ctx.fillRect(this.x, this.y, this.width, this.height)
    
    ctx.fillStyle = '#3a5a3a'
    ctx.fillRect(this.x + 4, this.y + 4, this.width - 8, 12)
    
    ctx.fillStyle = '#1a3a1a'
    ctx.font = '8px monospace'
    ctx.fillText('SHOP', this.x + 20, this.y + 12)
    
    ctx.fillStyle = 'rgba(255, 255, 150, 0.4)'
    ctx.fillRect(this.x + 10, this.y + 20, 18, 22)
    ctx.fillRect(this.x + 36, this.y + 20, 18, 22)
    
    ctx.restore()
  }
}
