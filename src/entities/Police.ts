import { Player } from './Player'
import { PixelRenderer, SPRITES, PALETTES } from '../utils/PixelRenderer'

export class Police {
  x: number
  y: number
  width: number = 16
  height: number = 22

  private patrolPoints: Array<{x: number, y: number}> = []
  private currentPatrolIndex: number = 0
  private speed: number = 60
  private detectRange: number = 120
  private chaseRange: number = 200
  private chaseSpeed: number = 100

  private isChasing: boolean = false
  private animFrame: number = 0
  private animTimer: number = 0
  private facingLeft: boolean = false
  private alertPulse: number = 0

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
      this.alertPulse += dt * 10

      if (distance < 30) {
        return true
      }

      if (distance > this.chaseRange) {
        this.isChasing = false
      } else {
        const speed = this.chaseSpeed * dt
        this.x += (dx / distance) * speed
        this.y += (dy / distance) * speed
        this.facingLeft = dx < 0
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
        this.facingLeft = pdx < 0
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

    // 그림자
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.beginPath()
    ctx.ellipse(this.x + this.width / 2, this.y + this.height + 2, this.width / 2 + 2, 3, 0, 0, Math.PI * 2)
    ctx.fill()

    // 좌우 반전 처리
    if (this.facingLeft) {
      ctx.translate(this.x + this.width, this.y)
      ctx.scale(-1, 1)
      PixelRenderer.drawSprite(ctx, 0, 0, SPRITES.police, PALETTES.police)
    } else {
      PixelRenderer.drawSprite(ctx, this.x, this.y, SPRITES.police, PALETTES.police)
    }

    ctx.restore()

    // 추격 중일 때 경고 표시
    if (this.isChasing) {
      const pulseSize = 4 + Math.sin(this.alertPulse) * 2
      ctx.fillStyle = '#ff0000'
      ctx.beginPath()
      ctx.arc(this.x + this.width / 2, this.y - 8, pulseSize, 0, Math.PI * 2)
      ctx.fill()

      // 느낌표
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 10px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('!', this.x + this.width / 2, this.y - 5)
    }
  }
}
