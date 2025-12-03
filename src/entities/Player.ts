import { InputState } from '../types'
import { GameMap } from '../systems/Map'
import { PixelRenderer, SPRITES, PALETTES } from '../utils/PixelRenderer'

export class Player {
  x: number
  y: number
  width: number = 16 // 8 chars * 2 scale
  height: number = 22 // 11 rows * 2 scale

  private vx: number = 0
  private vy: number = 0
  private speed: number = 150
  private animFrame: number = 0
  private animTimer: number = 0
  private direction: 'down' | 'up' | 'left' | 'right' = 'down'
  private isMoving: boolean = false
  private facingLeft: boolean = false

  nicotine: number = 50
  isArrested: boolean = false
  private isSmoking: boolean = false
  private smokeTimer: number = 0
  private smokeParticles: Array<{x: number, y: number, age: number, size: number, vx: number}> = []

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }

  update(dt: number, input: InputState, map: GameMap): void {
    this.updateSmokeParticles(dt)

    if (this.isSmoking) {
      this.smokeTimer -= dt
      if (this.smokeTimer <= 0) {
        this.isSmoking = false
      } else {
        if (Math.random() < 0.3) {
          this.smokeParticles.push({
            x: this.facingLeft ? this.x - 2 : this.x + this.width + 2,
            y: this.y + 6,
            age: 0,
            size: 1 + Math.random() * 2,
            vx: (this.facingLeft ? -1 : 1) * (0.5 + Math.random() * 0.5)
          })
        }
      }
      this.isMoving = false
      return
    }

    this.vx = 0
    this.vy = 0

    if (input.up) {
      this.vy = -this.speed
      this.direction = 'up'
    }
    if (input.down) {
      this.vy = this.speed
      this.direction = 'down'
    }
    if (input.left) {
      this.vx = -this.speed
      this.direction = 'left'
      this.facingLeft = true
    }
    if (input.right) {
      this.vx = this.speed
      this.direction = 'right'
      this.facingLeft = false
    }

    if (this.vx !== 0 && this.vy !== 0) {
      const factor = 1 / Math.sqrt(2)
      this.vx *= factor
      this.vy *= factor
    }

    this.isMoving = this.vx !== 0 || this.vy !== 0

    const newX = this.x + this.vx * dt
    const newY = this.y + this.vy * dt

    if (!map.isColliding(newX, this.y, this.width, this.height)) {
      this.x = newX
    }

    if (!map.isColliding(this.x, newY, this.width, this.height)) {
      this.y = newY
    }

    if (this.isMoving) {
      this.animTimer += dt
      if (this.animTimer > 0.15) {
        this.animTimer = 0
        this.animFrame = (this.animFrame + 1) % 4
      }
    } else {
      this.animFrame = 0
    }
  }

  private updateSmokeParticles(dt: number): void {
    for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
      const p = this.smokeParticles[i]
      p.age += dt
      p.x += p.vx * 20 * dt
      p.y -= 30 * dt
      p.size += dt * 2

      if (p.age > 1.5) {
        this.smokeParticles.splice(i, 1)
      }
    }
  }

  smoke(): void {
    this.isSmoking = true
    this.smokeTimer = 1.5
  }

  get centerX(): number {
    return this.x + this.width / 2
  }

  get centerY(): number {
    return this.y + this.height / 2
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.save()

    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.beginPath()
    ctx.ellipse(this.x + this.width / 2, this.y + this.height + 2, this.width / 2 + 2, 3, 0, 0, Math.PI * 2)
    ctx.fill()

    let sprite: string[]
    if (this.isSmoking) {
      sprite = SPRITES.player.smoking
    } else if (this.isMoving) {
      sprite = this.animFrame % 2 === 0 ? SPRITES.player.walk1 : SPRITES.player.walk2
    } else {
      sprite = SPRITES.player.idle
    }

    if (this.facingLeft) {
      ctx.translate(this.x + this.width, this.y)
      ctx.scale(-1, 1)
      PixelRenderer.drawSprite(ctx, 0, 0, sprite, PALETTES.player)
    } else {
      PixelRenderer.drawSprite(ctx, this.x, this.y, sprite, PALETTES.player)
    }

    ctx.restore()

    this.renderSmokeParticles(ctx)
  }

  private renderSmokeParticles(ctx: CanvasRenderingContext2D): void {
    for (const p of this.smokeParticles) {
      const alpha = Math.max(0, 1 - p.age / 1.5) * 0.6
      ctx.fillStyle = `rgba(180, 180, 180, ${alpha})`
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}
