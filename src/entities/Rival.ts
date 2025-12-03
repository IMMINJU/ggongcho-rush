import { CigaretteButt } from './CigaretteButt'
import { PixelRenderer, SPRITES, PALETTES } from '../utils/PixelRenderer'

export class Rival {
  x: number
  y: number
  width: number = 16
  height: number = 22

  private targetButt: CigaretteButt | null = null
  private speed: number = 70
  private detectRange: number = 150
  private wanderTimer: number = 0
  private wanderDirection: { x: number, y: number } = { x: 0, y: 0 }

  private animFrame: number = 0
  private animTimer: number = 0
  private facingLeft: boolean = false

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
        this.facingLeft = dx < 0
      }
    } else {
      this.wanderTimer -= dt
      if (this.wanderTimer <= 0) {
        this.randomWanderDirection()
      }

      this.x += this.wanderDirection.x * this.speed * 0.5 * dt
      this.y += this.wanderDirection.y * this.speed * 0.5 * dt
      this.facingLeft = this.wanderDirection.x < 0

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

    // 그림자
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.beginPath()
    ctx.ellipse(this.x + this.width / 2, this.y + this.height + 2, this.width / 2 + 2, 3, 0, 0, Math.PI * 2)
    ctx.fill()

    // 좌우 반전 처리
    if (this.facingLeft) {
      ctx.translate(this.x + this.width, this.y)
      ctx.scale(-1, 1)
      PixelRenderer.drawSprite(ctx, 0, 0, SPRITES.rival, PALETTES.rival)
    } else {
      PixelRenderer.drawSprite(ctx, this.x, this.y, SPRITES.rival, PALETTES.rival)
    }

    ctx.restore()

    // 타겟 꽁초가 있을 때 점선 표시
    if (this.targetButt) {
      ctx.strokeStyle = 'rgba(255, 100, 100, 0.3)'
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.moveTo(this.x + this.width / 2, this.y + this.height / 2)
      ctx.lineTo(this.targetButt.x, this.targetButt.y)
      ctx.stroke()
      ctx.setLineDash([])
    }
  }
}
