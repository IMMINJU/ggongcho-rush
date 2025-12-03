import { SmokerType } from '../types'
import { CigaretteButt } from './CigaretteButt'
import { PixelRenderer, SPRITES, PALETTES } from '../utils/PixelRenderer'

export class Smoker {
  x: number
  y: number
  width: number = 16
  height: number = 22

  type: SmokerType
  private isSmoking: boolean = true
  private smokeProgress: number = 0
  private smokeDuration: number
  private droppedButt: CigaretteButt | null = null

  private animFrame: number = 0
  private animTimer: number = 0
  private smokeParticles: Array<{ x: number; y: number; life: number; size: number }> = []

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

      if (Math.random() < 0.15) {
        this.smokeParticles.push({
          x: this.x + this.width + 2,
          y: this.y + 6,
          life: 1.2,
          size: 1 + Math.random()
        })
      }
    }

    if (this.type === 'vaper' && Math.random() < 0.08) {
      for (let i = 0; i < 5; i++) {
        this.smokeParticles.push({
          x: this.x + this.width + Math.random() * 8,
          y: this.y + 6 + Math.random() * 4,
          life: 2,
          size: 2 + Math.random() * 2
        })
      }
    }

    for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
      const p = this.smokeParticles[i]
      p.y -= dt * 25
      p.x += (Math.random() - 0.5) * dt * 15
      p.life -= dt
      p.size += dt * 1.5
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

    // 그림자
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.beginPath()
    ctx.ellipse(this.x + this.width / 2, this.y + this.height + 2, this.width / 2 + 2, 3, 0, 0, Math.PI * 2)
    ctx.fill()

    // 타입별 스프라이트 선택
    let sprite: string[]
    switch (this.type) {
      case 'worker':
        sprite = SPRITES.smoker.worker
        break
      case 'drunk':
        sprite = SPRITES.smoker.drunk
        break
      case 'student':
        sprite = SPRITES.smoker.student
        break
      case 'vaper':
        sprite = SPRITES.smoker.vaper
        break
      default:
        sprite = SPRITES.smoker.worker
    }

    PixelRenderer.drawSprite(ctx, this.x, this.y, sprite, PALETTES.smoker)

    // 담배/베이프 그리기 (흡연 중일 때)
    if (this.isSmoking) {
      if (this.type === 'vaper') {
        // 베이프 기기
        ctx.fillStyle = '#2a2a2a'
        ctx.fillRect(this.x + this.width, this.y + 5, 8, 4)
        ctx.fillStyle = '#4a9aff'
        ctx.fillRect(this.x + this.width + 6, this.y + 6, 2, 2)
      } else {
        // 담배
        ctx.fillStyle = '#f5f5dc'
        ctx.fillRect(this.x + this.width, this.y + 6, 6, 2)
        ctx.fillStyle = '#ff4500'
        ctx.fillRect(this.x + this.width + 5, this.y + 5, 2, 3)
      }
    }

    // 연기 파티클
    for (const p of this.smokeParticles) {
      const alpha = p.life * 0.4
      if (this.type === 'vaper') {
        ctx.fillStyle = `rgba(200, 220, 255, ${alpha})`
      } else {
        ctx.fillStyle = `rgba(180, 180, 180, ${alpha})`
      }
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.restore()
  }
}
