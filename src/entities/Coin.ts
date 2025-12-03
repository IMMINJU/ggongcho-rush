import { PixelRenderer, SPRITES, PALETTES } from '../utils/PixelRenderer'

export class Coin {
  x: number
  y: number
  value: number
  isCollected: boolean = false

  private bobPhase: number = Math.random() * Math.PI * 2
  private glowPhase: number = Math.random() * Math.PI * 2
  private rotationFrame: number = 0
  private rotationTimer: number = 0

  constructor(x: number, y: number, value: number = 100) {
    this.x = x
    this.y = y
    this.value = value
  }

  update(dt: number): void {
    this.bobPhase += dt * 3
    this.glowPhase += dt * 5
    this.rotationTimer += dt
    if (this.rotationTimer > 0.1) {
      this.rotationTimer = 0
      this.rotationFrame = (this.rotationFrame + 1) % 4
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (this.isCollected) return

    const bobY = Math.sin(this.bobPhase) * 2
    const glow = 0.3 + Math.sin(this.glowPhase) * 0.2

    ctx.save()

    // 발광 효과
    ctx.shadowColor = '#ffd700'
    ctx.shadowBlur = 10
    ctx.fillStyle = `rgba(255, 215, 0, ${glow})`
    ctx.beginPath()
    ctx.arc(this.x, this.y + bobY, 10, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0

    // 회전에 따른 스케일 변경 (간단한 3D 효과)
    const scaleX = Math.abs(Math.cos(this.rotationFrame * Math.PI / 2))
    ctx.translate(this.x, this.y + bobY)
    ctx.scale(Math.max(0.3, scaleX), 1)

    // 코인 스프라이트
    PixelRenderer.drawSprite(ctx, -5, -5, SPRITES.coin, PALETTES.coin)

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
