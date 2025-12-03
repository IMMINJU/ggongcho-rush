import { ButtQuality } from '../types'
import { PixelRenderer, SPRITES, PALETTES } from '../utils/PixelRenderer'

export class CigaretteButt {
  x: number
  y: number
  width: number = 12
  height: number = 4

  quality: ButtQuality
  isCollected: boolean = false

  private glowPhase: number = Math.random() * Math.PI * 2
  private smokeParticles: Array<{x: number, y: number, life: number, size: number}> = []

  constructor(x: number, y: number, qualityType: 'short' | 'normal' | 'long' = 'normal') {
    this.x = x
    this.y = y

    switch (qualityType) {
      case 'short':
        this.quality = { type: 'short', nicotineAmount: 5 }
        this.width = 8
        break
      case 'long':
        this.quality = { type: 'long', nicotineAmount: 30 }
        this.width = 14
        break
      default:
        this.quality = { type: 'normal', nicotineAmount: 15 }
        this.width = 10
    }
  }

  update(dt: number): void {
    this.glowPhase += dt * 3

    // 연기 파티클 생성
    if (Math.random() < 0.1) {
      this.smokeParticles.push({
        x: this.x,
        y: this.y,
        life: 1,
        size: 1
      })
    }

    // 파티클 업데이트
    for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
      const p = this.smokeParticles[i]
      p.y -= dt * 15
      p.x += (Math.random() - 0.5) * dt * 5
      p.life -= dt
      p.size += dt * 0.5
      if (p.life <= 0) {
        this.smokeParticles.splice(i, 1)
      }
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (this.isCollected) return

    const glow = 0.4 + Math.sin(this.glowPhase) * 0.2

    ctx.save()

    // 발광 효과
    ctx.shadowColor = '#ff6b35'
    ctx.shadowBlur = 10
    ctx.fillStyle = `rgba(255, 107, 53, ${glow})`
    ctx.beginPath()
    ctx.arc(this.x, this.y, 8, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0

    // 꽁초 스프라이트
    let sprite: string[]
    switch (this.quality.type) {
      case 'short':
        sprite = SPRITES.butt.short
        break
      case 'long':
        sprite = SPRITES.butt.long
        break
      default:
        sprite = SPRITES.butt.normal
    }

    PixelRenderer.drawSprite(ctx, this.x - this.width / 2, this.y - 2, sprite, PALETTES.butt)

    // 연기 파티클
    for (const p of this.smokeParticles) {
      const alpha = p.life * 0.4
      ctx.fillStyle = `rgba(180, 180, 180, ${alpha})`
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.restore()
  }

  get nicotineAmount(): number {
    return this.quality.nicotineAmount
  }

  getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x - 10,
      y: this.y - 10,
      width: this.width + 20,
      height: 20
    }
  }
}
