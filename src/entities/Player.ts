import { InputState } from '../types'
import { GameMap } from '../systems/Map'
import { PixelRenderer, SPRITES, PALETTES } from '../utils/PixelRenderer'

export class Player {
  x: number
  y: number
  width: number = 16
  height: number = 22

  private vx: number = 0
  private vy: number = 0
  private baseSpeed: number = 150
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

  // 표현/행동 상태
  private shakeOffset: { x: number, y: number } = { x: 0, y: 0 }
  private headTilt: number = 0  // 고개 기울기 (-1: 숙임, 0: 정상, 1: 들기)
  private sweatDrops: Array<{x: number, y: number, vy: number, life: number}> = []
  private breathTimer: number = 0

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }

  get speed(): number {
    // 니코틴 낮으면 느려짐
    if (this.nicotine < 15) return this.baseSpeed * 0.6
    if (this.nicotine < 30) return this.baseSpeed * 0.8
    return this.baseSpeed
  }

  update(dt: number, input: InputState, map: GameMap): void {
    this.updateSmokeParticles(dt)
    this.updateExpressions(dt)

    if (this.isSmoking) {
      this.smokeTimer -= dt
      if (this.smokeTimer <= 0) {
        this.isSmoking = false
        this.headTilt = 1  // 피우고 나서 고개 들기
        setTimeout(() => { this.headTilt = 0 }, 500)
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

    const currentSpeed = this.speed

    if (input.up) {
      this.vy = -currentSpeed
      this.direction = 'up'
    }
    if (input.down) {
      this.vy = currentSpeed
      this.direction = 'down'
    }
    if (input.left) {
      this.vx = -currentSpeed
      this.direction = 'left'
      this.facingLeft = true
    }
    if (input.right) {
      this.vx = currentSpeed
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

    // 애니메이션 속도도 니코틴에 따라 변경
    const animSpeed = this.nicotine < 20 ? 0.25 : 0.15
    if (this.isMoving) {
      this.animTimer += dt
      if (this.animTimer > animSpeed) {
        this.animTimer = 0
        this.animFrame = (this.animFrame + 1) % 4
      }
    } else {
      this.animFrame = 0
    }
  }

  private updateExpressions(dt: number): void {
    this.breathTimer += dt

    // 니코틴 낮을 때 떨림
    if (this.nicotine < 20) {
      const intensity = (20 - this.nicotine) / 20
      this.shakeOffset.x = (Math.random() - 0.5) * 2 * intensity
      this.shakeOffset.y = (Math.random() - 0.5) * 1 * intensity

      // 고개 숙임
      if (!this.isSmoking) {
        this.headTilt = -0.5 - intensity * 0.5
      }

      // 땀방울 생성
      if (Math.random() < 0.05 * intensity) {
        this.sweatDrops.push({
          x: this.x + this.width / 2 + (Math.random() - 0.5) * 8,
          y: this.y + 4,
          vy: 0,
          life: 1
        })
      }
    } else {
      this.shakeOffset.x = 0
      this.shakeOffset.y = 0
      if (!this.isSmoking && this.headTilt < 0) {
        this.headTilt = 0
      }
    }

    // 땀방울 업데이트
    for (let i = this.sweatDrops.length - 1; i >= 0; i--) {
      const drop = this.sweatDrops[i]
      drop.vy += dt * 100  // 중력
      drop.y += drop.vy * dt
      drop.life -= dt

      if (drop.life <= 0 || drop.y > this.y + this.height) {
        this.sweatDrops.splice(i, 1)
      }
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
    this.headTilt = 0  // 피우는 동안 정상 자세
  }

  // 꽁초 방향으로 고개 돌리기
  lookAt(targetX: number, targetY: number): void {
    if (this.isSmoking) return
    this.facingLeft = targetX < this.x
  }

  get centerX(): number {
    return this.x + this.width / 2
  }

  get centerY(): number {
    return this.y + this.height / 2
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.save()

    // 떨림 적용
    const renderX = this.x + this.shakeOffset.x
    const renderY = this.y + this.shakeOffset.y

    // 그림자 (니코틴 낮으면 더 흐릿)
    const shadowAlpha = this.nicotine < 20 ? 0.15 : 0.3
    ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`
    ctx.beginPath()
    ctx.ellipse(renderX + this.width / 2, renderY + this.height + 2, this.width / 2 + 2, 3, 0, 0, Math.PI * 2)
    ctx.fill()

    // 스프라이트 선택
    let sprite: string[]
    if (this.isSmoking) {
      sprite = SPRITES.player.smoking
    } else if (this.isMoving) {
      sprite = this.animFrame % 2 === 0 ? SPRITES.player.walk1 : SPRITES.player.walk2
    } else {
      sprite = SPRITES.player.idle
    }

    // 고개 기울기에 따른 Y 오프셋
    const headOffset = this.headTilt * 2

    // 좌우 반전 처리
    if (this.facingLeft) {
      ctx.translate(renderX + this.width, renderY + headOffset)
      ctx.scale(-1, 1)
      PixelRenderer.drawSprite(ctx, 0, 0, sprite, PALETTES.player)
    } else {
      PixelRenderer.drawSprite(ctx, renderX, renderY + headOffset, sprite, PALETTES.player)
    }

    ctx.restore()

    // 땀방울 렌더링
    this.renderSweatDrops(ctx)

    // 연기 렌더링
    this.renderSmokeParticles(ctx)

    // 니코틴 낮을 때 숨소리 표현 (말풍선 형태)
    if (this.nicotine < 15 && !this.isSmoking) {
      const breathAlpha = 0.3 + Math.sin(this.breathTimer * 4) * 0.2
      ctx.fillStyle = `rgba(150, 150, 150, ${breathAlpha})`
      ctx.font = '10px Arial'
      ctx.fillText('...', renderX + this.width + 4, renderY + 8)
    }
  }

  private renderSweatDrops(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#6af'
    for (const drop of this.sweatDrops) {
      ctx.beginPath()
      ctx.arc(drop.x, drop.y, 2, 0, Math.PI * 2)
      ctx.fill()
    }
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
