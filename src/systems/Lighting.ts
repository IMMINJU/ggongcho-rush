export class Lighting {
  private ctx: CanvasRenderingContext2D
  private width: number
  private height: number
  private maskCanvas: HTMLCanvasElement
  private maskCtx: CanvasRenderingContext2D
  
  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx
    this.width = width
    this.height = height
    
    this.maskCanvas = document.createElement('canvas')
    this.maskCanvas.width = width
    this.maskCanvas.height = height
    this.maskCtx = this.maskCanvas.getContext('2d')!
  }
  
  render(playerScreenX: number, playerScreenY: number, nicotine: number): void {
    const minRadius = 60
    const maxRadius = 400
    const radius = minRadius + (maxRadius - minRadius) * (nicotine / 100)
    
    this.maskCtx.fillStyle = 'rgba(0, 0, 0, 0.95)'
    this.maskCtx.fillRect(0, 0, this.width, this.height)
    
    this.maskCtx.globalCompositeOperation = 'destination-out'
    
    const gradient = this.maskCtx.createRadialGradient(
      playerScreenX, playerScreenY, 0,
      playerScreenX, playerScreenY, radius
    )
    
    gradient.addColorStop(0, 'rgba(0, 0, 0, 1)')
    gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.8)')
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
    
    this.maskCtx.fillStyle = gradient
    this.maskCtx.beginPath()
    this.maskCtx.arc(playerScreenX, playerScreenY, radius, 0, Math.PI * 2)
    this.maskCtx.fill()
    
    this.maskCtx.globalCompositeOperation = 'source-over'
    
    if (nicotine < 20) {
      const flickerIntensity = (20 - nicotine) / 20
      const flicker = Math.random() * flickerIntensity * 0.3
      this.maskCtx.fillStyle = 'rgba(0, 0, 0, ' + flicker + ')'
      this.maskCtx.fillRect(0, 0, this.width, this.height)
    }
    
    this.ctx.drawImage(this.maskCanvas, 0, 0)
    
    if (nicotine > 80) {
      const whiteIntensity = (nicotine - 80) / 20
      this.ctx.fillStyle = 'rgba(255, 255, 255, ' + (whiteIntensity * 0.3) + ')'
      this.ctx.fillRect(0, 0, this.width, this.height)
    }
  }
}
