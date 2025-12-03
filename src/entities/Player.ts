import { InputState, Position } from '../types'
import { GameMap } from '../systems/Map'

export class Player {
  x: number
  y: number
  width: number = 24
  height: number = 32
  
  private vx: number = 0
  private vy: number = 0
  private speed: number = 150
  private animFrame: number = 0
  private animTimer: number = 0
  private direction: 'down' | 'up' | 'left' | 'right' = 'down'
  private isMoving: boolean = false
  
  nicotine: number = 50
  isArrested: boolean = false
  private isSmoking: boolean = false
  private smokeTimer: number = 0
  
  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }
  
  update(dt: number, input: InputState, map: GameMap): void {
    // 흡연 중이면 이동 불가
    if (this.isSmoking) {
      this.smokeTimer -= dt
      if (this.smokeTimer <= 0) {
        this.isSmoking = false
      }
      this.isMoving = false
      return
    }
    
    // 입력 처리
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
    }
    if (input.right) {
      this.vx = this.speed
      this.direction = 'right'
    }
    
    // 대각선 이동 정규화
    if (this.vx !== 0 && this.vy !== 0) {
      const factor = 1 / Math.sqrt(2)
      this.vx *= factor
      this.vy *= factor
    }
    
    this.isMoving = this.vx !== 0 || this.vy !== 0
    
    // 이동 및 충돌 처리
    const newX = this.x + this.vx * dt
    const newY = this.y + this.vy * dt
    
    // X축 충돌 체크
    if (!map.isColliding(newX, this.y, this.width, this.height)) {
      this.x = newX
    }
    
    // Y축 충돌 체크
    if (!map.isColliding(this.x, newY, this.width, this.height)) {
      this.y = newY
    }
    
    // 애니메이션
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
  
  smoke(): void {
    this.isSmoking = true
    this.smokeTimer = 1.5 // 1.5초 동안 흡연 애니메이션
  }
  
  get centerX(): number {
    return this.x + this.width / 2
  }
  
  get centerY(): number {
    return this.y + this.height / 2
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    ctx.save()
    
    // 플레이어 몸체 (간단한 픽셀 스타일)
    const bodyColor = this.isSmoking ? '#8b7355' : '#5c4033'
    
    // 그림자
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.beginPath()
    ctx.ellipse(this.x + this.width / 2, this.y + this.height, this.width / 2, 4, 0, 0, Math.PI * 2)
    ctx.fill()
    
    // 몸통
    ctx.fillStyle = bodyColor
    ctx.fillRect(this.x + 4, this.y + 12, 16, 18)
    
    // 머리
    ctx.fillStyle = '#d4a574'
    ctx.fillRect(this.x + 6, this.y, 12, 14)
    
    // 머리카락
    ctx.fillStyle = '#2a2a2a'
    ctx.fillRect(this.x + 6, this.y, 12, 4)
    
    // 다리 애니메이션
    ctx.fillStyle = '#3a3a3a'
    const legOffset = this.isMoving ? Math.sin(this.animFrame * Math.PI / 2) * 3 : 0
    ctx.fillRect(this.x + 6, this.y + 28, 4, 6 + legOffset)
    ctx.fillRect(this.x + 14, this.y + 28, 4, 6 - legOffset)
    
    // 흡연 중일 때 담배 그리기
    if (this.isSmoking) {
      ctx.fillStyle = '#fff'
      ctx.fillRect(this.x + 20, this.y + 8, 8, 2)
      ctx.fillStyle = '#ff6b35'
      ctx.fillRect(this.x + 27, this.y + 7, 2, 3)
      
      // 연기 파티클
      ctx.fillStyle = 'rgba(200, 200, 200, 0.5)'
      for (let i = 0; i < 3; i++) {
        const smokeY = this.y + 5 - i * 6 - this.smokeTimer * 10
        const smokeX = this.x + 28 + Math.sin(smokeY * 0.1) * 3
        ctx.beginPath()
        ctx.arc(smokeX, smokeY, 2 + i, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    
    ctx.restore()
  }
}
