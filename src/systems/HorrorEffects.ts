// 이토 준지 스타일 기괴한 연출 시스템 - 강화 버전
export class HorrorEffects {
  private ctx: CanvasRenderingContext2D
  private width: number
  private height: number

  private activeEffect: HorrorEffect | null = null
  private effectTimer: number = 0
  private effectDuration: number = 0

  private randomTimer: number = 0
  private nextRandomTime: number = 45 + Math.random() * 60

  private obsessionLevel: number = 0
  private lastButtDistance: number = Infinity

  // 고정 시드 (효과 내 일관성을 위해)
  private seed: number = 0

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx
    this.width = width
    this.height = height
  }

  update(dt: number, nicotine: number, nearestButtDistance: number | null): void {
    this.randomTimer += dt
    if (this.randomTimer >= this.nextRandomTime && !this.activeEffect) {
      this.triggerRandom()
      this.randomTimer = 0
      this.nextRandomTime = 45 + Math.random() * 60
    }

    if (nearestButtDistance !== null) {
      if (nearestButtDistance < this.lastButtDistance && nearestButtDistance < 100) {
        this.obsessionLevel += dt * 2.5
      }
      this.lastButtDistance = nearestButtDistance
    } else {
      this.obsessionLevel = Math.max(0, this.obsessionLevel - dt)
      this.lastButtDistance = Infinity
    }

    if (nicotine < 10 && !this.activeEffect && Math.random() < 0.015) {
      this.triggerWithdrawalHallucination()
    }

    if (this.obsessionLevel > 2.5 && !this.activeEffect) {
      this.triggerObsession()
      this.obsessionLevel = 0
    }

    if (this.activeEffect) {
      this.effectTimer += dt
      if (this.effectTimer >= this.effectDuration) {
        this.activeEffect = null
        this.effectTimer = 0
      }
    }
  }

  onButtCollected(quality: 'short' | 'normal' | 'long'): void {
    if (quality === 'long' && Math.random() < 0.6) {
      this.triggerEcstasy()
    } else if (Math.random() < 0.25) {
      this.triggerCollectionGrin()
    }
  }

  private triggerWithdrawalHallucination(): void {
    const effects: HorrorEffect[] = ['spiral_eyes', 'reaching_hands']
    this.activeEffect = effects[Math.floor(Math.random() * effects.length)]
    this.effectDuration = 2 + Math.random() * 1.5
    this.effectTimer = 0
    this.seed = Math.random() * 1000
  }

  private triggerObsession(): void {
    const effects: HorrorEffect[] = ['hungry_stare', 'too_wide_smile']
    this.activeEffect = effects[Math.floor(Math.random() * effects.length)]
    this.effectDuration = 1.2 + Math.random() * 0.8
    this.effectTimer = 0
    this.seed = Math.random() * 1000
  }

  private triggerCollectionGrin(): void {
    // 수집 시 효과 비활성화
  }

  private triggerEcstasy(): void {
    // 황홀경 효과 비활성화
  }

  private triggerRandom(): void {
    const effects: HorrorEffect[] = ['peripheral_figure', 'blink_face', 'wrong_reflection']
    this.activeEffect = effects[Math.floor(Math.random() * effects.length)]
    this.effectDuration = 0.4 + Math.random() * 0.3
    this.effectTimer = 0
    this.seed = Math.random() * 1000
  }

  render(): void {
    if (!this.activeEffect) return

    const progress = this.effectTimer / this.effectDuration
    const alpha = Math.sin(progress * Math.PI)

    this.ctx.save()

    switch (this.activeEffect) {
      case 'spiral_eyes':
        this.renderSpiralEyes(alpha, progress)
        break
      case 'reaching_hands':
        this.renderReachingHands(alpha, progress)
        break
      case 'hungry_stare':
        this.renderHungryStare(alpha, progress)
        break
      case 'too_wide_smile':
        this.renderTooWideSmile(alpha, progress)
        break
      case 'peripheral_figure':
        this.renderPeripheralFigure(alpha, progress)
        break
      case 'blink_face':
        this.renderBlinkFace(alpha, progress)
        break
      case 'wrong_reflection':
        this.renderWrongReflection(alpha, progress)
        break
    }

    this.ctx.restore()
  }

  // === 금단 증상 효과들 ===

  // 소용돌이 눈 - 금단으로 인한 어지러움
  private renderSpiralEyes(alpha: number, progress: number): void {
    this.ctx.fillStyle = `rgba(5, 0, 0, ${alpha * 0.9})`
    this.ctx.fillRect(0, 0, this.width, this.height)

    const cx = this.width / 2
    const cy = this.height / 2

    // 두 눈
    this.drawSpiralEye(cx - 120, cy, alpha, progress, 80)
    this.drawSpiralEye(cx + 120, cy, alpha, progress, 80)

    // 얼굴 윤곽 주름
    this.ctx.strokeStyle = `rgba(140, 120, 100, ${alpha * 0.6})`
    this.ctx.lineWidth = 1
    for (let i = 0; i < 30; i++) {
      const y = cy - 150 + i * 10
      const wobble = Math.sin(i * 0.5 + this.effectTimer * 2) * 10
      this.ctx.beginPath()
      this.ctx.moveTo(cx - 180 + wobble, y)
      this.ctx.lineTo(cx - 160 + wobble * 0.5, y + 3)
      this.ctx.stroke()
      this.ctx.beginPath()
      this.ctx.moveTo(cx + 180 - wobble, y)
      this.ctx.lineTo(cx + 160 - wobble * 0.5, y + 3)
      this.ctx.stroke()
    }
  }

  private drawSpiralEye(x: number, y: number, alpha: number, progress: number, size: number): void {
    // 눈 흰자 (약간 누렇게)
    this.ctx.fillStyle = `rgba(245, 235, 200, ${alpha})`
    this.ctx.beginPath()
    this.ctx.ellipse(x, y, size, size * 0.7, 0, 0, Math.PI * 2)
    this.ctx.fill()

    // 소용돌이 동공
    this.ctx.strokeStyle = `rgba(20, 10, 10, ${alpha})`
    this.ctx.lineWidth = 2
    const spiralTurns = 5
    const rotation = this.effectTimer * 3

    this.ctx.beginPath()
    for (let i = 0; i < spiralTurns * 50; i++) {
      const angle = (i / 50) * Math.PI * 2 + rotation
      const radius = (i / (spiralTurns * 50)) * size * 0.5
      const px = x + Math.cos(angle) * radius
      const py = y + Math.sin(angle) * radius * 0.7
      if (i === 0) this.ctx.moveTo(px, py)
      else this.ctx.lineTo(px, py)
    }
    this.ctx.stroke()

    // 충혈 - 불규칙한 혈관
    this.ctx.strokeStyle = `rgba(180, 40, 40, ${alpha * 0.8})`
    this.ctx.lineWidth = 1
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 + this.seed
      this.ctx.beginPath()
      let px = x + Math.cos(angle) * size * 0.3
      let py = y + Math.sin(angle) * size * 0.2
      this.ctx.moveTo(px, py)
      for (let j = 0; j < 4; j++) {
        px += Math.cos(angle + (Math.random() - 0.5)) * 15
        py += Math.sin(angle) * 10
        this.ctx.lineTo(px, py)
      }
      this.ctx.stroke()
    }

    // 눈꺼풀 주름
    this.ctx.strokeStyle = `rgba(100, 80, 70, ${alpha})`
    this.ctx.lineWidth = 1.5
    for (let i = 0; i < 5; i++) {
      const offset = -size - 10 - i * 8
      this.ctx.beginPath()
      this.ctx.ellipse(x, y + offset + size, size + 10, 15, 0, 0.2, Math.PI - 0.2)
      this.ctx.stroke()
    }
  }

  // 뻗어오는 손들
  private renderReachingHands(alpha: number, progress: number): void {
    this.ctx.fillStyle = `rgba(10, 5, 5, ${alpha * 0.7})`
    this.ctx.fillRect(0, 0, this.width, this.height)

    // 화면 하단에서 올라오는 여러 손
    const handCount = 7

    for (let i = 0; i < handCount; i++) {
      const x = (this.width / (handCount + 1)) * (i + 1)
      const baseY = this.height + 100 - progress * 250
      this.drawReachingHand(x, baseY, alpha, i)
    }
  }

  private drawReachingHand(x: number, y: number, alpha: number, seed: number): void {
    this.ctx.strokeStyle = `rgba(120, 100, 90, ${alpha})`
    this.ctx.lineWidth = 3

    const sway = Math.sin(this.effectTimer * 3 + seed) * 15

    // 팔
    this.ctx.beginPath()
    this.ctx.moveTo(x + sway, y + 200)
    this.ctx.quadraticCurveTo(x + sway * 0.5, y + 100, x, y)
    this.ctx.stroke()

    // 손가락들 (길고 뒤틀린)
    this.ctx.strokeStyle = `rgba(140, 120, 100, ${alpha})`
    this.ctx.lineWidth = 2
    for (let i = 0; i < 5; i++) {
      const fingerAngle = -0.5 + i * 0.25
      const fingerLength = 40 + (seed + i) % 3 * 15
      const fingerSway = Math.sin(this.effectTimer * 5 + i + seed) * 5
      this.ctx.beginPath()
      this.ctx.moveTo(x, y)
      this.ctx.quadraticCurveTo(
        x + Math.sin(fingerAngle) * fingerLength * 0.5 + fingerSway,
        y - fingerLength * 0.5,
        x + Math.sin(fingerAngle + 0.2) * fingerLength,
        y - fingerLength
      )
      this.ctx.stroke()
    }
  }

  // 피부 밑에서 뭔가 기어다니는 느낌
  private renderSkinCrawl(alpha: number, progress: number): void {
    this.ctx.fillStyle = `rgba(20, 15, 10, ${alpha * 0.85})`
    this.ctx.fillRect(0, 0, this.width, this.height)

    const cx = this.width / 2
    const cy = this.height / 2

    // 피부 표면
    this.ctx.fillStyle = `rgba(200, 170, 140, ${alpha})`
    this.ctx.fillRect(cx - 200, cy - 150, 400, 300)

    // 피부 밑에서 움직이는 것들
    this.ctx.fillStyle = `rgba(80, 60, 80, ${alpha * 0.7})`
    for (let i = 0; i < 8; i++) {
      const bx = cx - 150 + ((this.seed * (i + 1) * 100) % 300)
      const by = cy - 100 + Math.sin(this.effectTimer * 2 + i) * 50 + ((this.seed * i * 50) % 200)
      const bsize = 20 + Math.sin(this.effectTimer * 3 + i) * 10

      // 돌기
      this.ctx.beginPath()
      this.ctx.ellipse(bx, by, bsize, bsize * 0.6, 0, 0, Math.PI * 2)
      this.ctx.fill()
    }

    // 피부 균열/주름
    this.ctx.strokeStyle = `rgba(120, 90, 70, ${alpha})`
    this.ctx.lineWidth = 1
    for (let i = 0; i < 40; i++) {
      const lx = cx - 190 + (i % 20) * 20
      const ly = cy - 140 + Math.floor(i / 20) * 150
      this.ctx.beginPath()
      this.ctx.moveTo(lx, ly)
      this.ctx.lineTo(lx + Math.random() * 30 - 15, ly + Math.random() * 40)
      this.ctx.stroke()
    }

    // 긁힌 자국
    this.ctx.strokeStyle = `rgba(150, 50, 50, ${alpha * 0.8})`
    this.ctx.lineWidth = 2
    for (let i = 0; i < 5; i++) {
      const sx = cx - 100 + i * 50
      this.ctx.beginPath()
      this.ctx.moveTo(sx, cy - 80)
      this.ctx.lineTo(sx + 10, cy + 80)
      this.ctx.stroke()
    }
  }

  // 거울에 비친 자신이 다르게 보임
  private renderMirrorFace(alpha: number, progress: number): void {
    this.ctx.fillStyle = `rgba(10, 10, 15, ${alpha * 0.95})`
    this.ctx.fillRect(0, 0, this.width, this.height)

    const cx = this.width / 2
    const cy = this.height / 2

    // 거울 프레임
    this.ctx.strokeStyle = `rgba(80, 70, 60, ${alpha})`
    this.ctx.lineWidth = 8
    this.ctx.strokeRect(cx - 180, cy - 220, 360, 440)

    // 거울 표면
    this.ctx.fillStyle = `rgba(30, 35, 40, ${alpha})`
    this.ctx.fillRect(cx - 170, cy - 210, 340, 420)

    // 비틀린 얼굴
    const distort = Math.sin(this.effectTimer * 2) * 20

    // 얼굴 윤곽 (비대칭)
    this.ctx.strokeStyle = `rgba(180, 160, 140, ${alpha})`
    this.ctx.lineWidth = 2
    this.ctx.beginPath()
    this.ctx.moveTo(cx - 80 + distort, cy - 120)
    this.ctx.quadraticCurveTo(cx - 100, cy, cx - 70 - distort, cy + 100)
    this.ctx.quadraticCurveTo(cx, cy + 130, cx + 70 + distort, cy + 100)
    this.ctx.quadraticCurveTo(cx + 100, cy, cx + 80 - distort, cy - 120)
    this.ctx.quadraticCurveTo(cx, cy - 140, cx - 80 + distort, cy - 120)
    this.ctx.stroke()

    // 눈 - 하나는 크고 하나는 작게
    this.drawDistortedEye(cx - 50 + distort * 0.5, cy - 40, 35, alpha, true)
    this.drawDistortedEye(cx + 50 - distort * 0.5, cy - 30, 25, alpha, false)

    // 입 - 비틀린
    this.ctx.strokeStyle = `rgba(150, 100, 100, ${alpha})`
    this.ctx.lineWidth = 3
    this.ctx.beginPath()
    this.ctx.moveTo(cx - 50, cy + 50 + distort * 0.5)
    this.ctx.quadraticCurveTo(cx - 20, cy + 70, cx, cy + 40)
    this.ctx.quadraticCurveTo(cx + 30, cy + 80, cx + 50, cy + 50 - distort * 0.5)
    this.ctx.stroke()

    // 균열
    this.ctx.strokeStyle = `rgba(200, 200, 210, ${alpha * 0.5})`
    this.ctx.lineWidth = 1
    this.ctx.beginPath()
    this.ctx.moveTo(cx + 50, cy - 200)
    this.ctx.lineTo(cx + 30, cy - 100)
    this.ctx.lineTo(cx + 60, cy)
    this.ctx.lineTo(cx + 20, cy + 150)
    this.ctx.stroke()
  }

  private drawDistortedEye(x: number, y: number, size: number, alpha: number, lookingAtYou: boolean): void {
    // 눈 흰자
    this.ctx.fillStyle = `rgba(240, 235, 220, ${alpha})`
    this.ctx.beginPath()
    this.ctx.ellipse(x, y, size, size * 0.6, 0, 0, Math.PI * 2)
    this.ctx.fill()

    // 홍채
    this.ctx.fillStyle = `rgba(60, 40, 30, ${alpha})`
    const irisSize = size * 0.5
    const pupilOffset = lookingAtYou ? 0 : size * 0.2
    this.ctx.beginPath()
    this.ctx.arc(x + pupilOffset, y, irisSize, 0, Math.PI * 2)
    this.ctx.fill()

    // 동공 - 수직으로 긴 (고양이 눈처럼)
    this.ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`
    this.ctx.beginPath()
    this.ctx.ellipse(x + pupilOffset, y, irisSize * 0.2, irisSize * 0.8, 0, 0, Math.PI * 2)
    this.ctx.fill()

    // 하이라이트 (없으면 더 무섭지만 하나만)
    if (lookingAtYou) {
      this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.3})`
      this.ctx.beginPath()
      this.ctx.arc(x + pupilOffset - irisSize * 0.3, y - irisSize * 0.3, 3, 0, Math.PI * 2)
      this.ctx.fill()
    }
  }

  // 긁고 싶은 충동
  private renderTheItch(alpha: number, progress: number): void {
    this.ctx.fillStyle = `rgba(15, 10, 10, ${alpha * 0.9})`
    this.ctx.fillRect(0, 0, this.width, this.height)

    const cx = this.width / 2
    const cy = this.height / 2

    // 팔 (긁히고 있는)
    this.ctx.fillStyle = `rgba(190, 160, 130, ${alpha})`
    this.ctx.beginPath()
    this.ctx.ellipse(cx, cy, 180, 80, 0.3, 0, Math.PI * 2)
    this.ctx.fill()

    // 긁는 손
    const scratchX = cx + 50 + Math.sin(this.effectTimer * 15) * 30
    const scratchY = cy - 30

    // 손가락들 (갈고리처럼)
    this.ctx.strokeStyle = `rgba(180, 150, 120, ${alpha})`
    this.ctx.lineWidth = 4
    for (let i = 0; i < 5; i++) {
      this.ctx.beginPath()
      this.ctx.moveTo(scratchX + i * 15, scratchY - 40)
      this.ctx.quadraticCurveTo(
        scratchX + i * 15 + 5, scratchY - 10,
        scratchX + i * 15 - 5, scratchY + 20
      )
      this.ctx.stroke()

      // 손톱
      this.ctx.fillStyle = `rgba(220, 200, 150, ${alpha})`
      this.ctx.beginPath()
      this.ctx.ellipse(scratchX + i * 15 - 5, scratchY + 25, 6, 10, 0.2, 0, Math.PI * 2)
      this.ctx.fill()
    }

    // 긁힌 자국들 (빨갛게)
    this.ctx.strokeStyle = `rgba(180, 50, 50, ${alpha})`
    this.ctx.lineWidth = 3
    const scratchProgress = progress * 5
    for (let i = 0; i < 8; i++) {
      if (i > scratchProgress) continue
      const sx = cx - 120 + i * 30
      this.ctx.beginPath()
      this.ctx.moveTo(sx, cy - 60)
      for (let j = 0; j < 5; j++) {
        this.ctx.lineTo(sx + (Math.random() - 0.5) * 10, cy - 60 + j * 30)
      }
      this.ctx.stroke()
    }

    // 피부 조각들
    this.ctx.fillStyle = `rgba(200, 170, 140, ${alpha * 0.6})`
    for (let i = 0; i < 10; i++) {
      const fx = cx - 100 + Math.random() * 200
      const fy = cy + 50 + Math.random() * 30
      this.ctx.fillRect(fx, fy, 5 + Math.random() * 10, 2 + Math.random() * 5)
    }
  }

  // === 집착 효과들 ===

  // 굶주린 응시
  private renderHungryStare(alpha: number, progress: number): void {
    this.ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.7})`
    this.ctx.fillRect(0, 0, this.width, this.height)

    const cx = this.width / 2
    const cy = this.height / 2 - 50

    // 거대한 눈 하나
    const eyeSize = 150 + progress * 50

    // 눈 흰자 (충혈)
    const gradient = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, eyeSize)
    gradient.addColorStop(0, `rgba(255, 250, 240, ${alpha})`)
    gradient.addColorStop(0.7, `rgba(255, 220, 200, ${alpha})`)
    gradient.addColorStop(1, `rgba(200, 150, 150, ${alpha})`)
    this.ctx.fillStyle = gradient
    this.ctx.beginPath()
    this.ctx.ellipse(cx, cy, eyeSize, eyeSize * 0.6, 0, 0, Math.PI * 2)
    this.ctx.fill()

    // 홍채 (갈색, 크게)
    this.ctx.fillStyle = `rgba(80, 50, 30, ${alpha})`
    this.ctx.beginPath()
    this.ctx.arc(cx, cy, eyeSize * 0.45, 0, Math.PI * 2)
    this.ctx.fill()

    // 동공 (작고 집중된)
    this.ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`
    const pupilSize = 15 - progress * 8 // 점점 작아짐
    this.ctx.beginPath()
    this.ctx.arc(cx, cy, Math.max(5, pupilSize), 0, Math.PI * 2)
    this.ctx.fill()

    // 촘촘한 혈관
    this.ctx.strokeStyle = `rgba(180, 60, 60, ${alpha})`
    this.ctx.lineWidth = 1
    for (let i = 0; i < 25; i++) {
      const angle = (i / 25) * Math.PI * 2
      this.ctx.beginPath()
      let px = cx + Math.cos(angle) * eyeSize * 0.5
      let py = cy + Math.sin(angle) * eyeSize * 0.3
      this.ctx.moveTo(px, py)
      for (let j = 0; j < 6; j++) {
        const spread = (Math.random() - 0.5) * 0.5
        px += Math.cos(angle + spread) * 15
        py += Math.sin(angle + spread) * 9
        this.ctx.lineTo(px, py)
      }
      this.ctx.stroke()
    }

    // 눈꺼풀 (위아래에서 조여오는)
    this.ctx.fillStyle = `rgba(120, 90, 70, ${alpha})`
    // 위 눈꺼풀
    this.ctx.beginPath()
    this.ctx.moveTo(cx - eyeSize - 30, cy - eyeSize * 0.4)
    this.ctx.quadraticCurveTo(cx, cy - eyeSize * 0.8, cx + eyeSize + 30, cy - eyeSize * 0.4)
    this.ctx.lineTo(cx + eyeSize + 50, cy - eyeSize - 50)
    this.ctx.lineTo(cx - eyeSize - 50, cy - eyeSize - 50)
    this.ctx.fill()
    // 아래 눈꺼풀
    this.ctx.beginPath()
    this.ctx.moveTo(cx - eyeSize - 30, cy + eyeSize * 0.4)
    this.ctx.quadraticCurveTo(cx, cy + eyeSize * 0.6, cx + eyeSize + 30, cy + eyeSize * 0.4)
    this.ctx.lineTo(cx + eyeSize + 50, cy + eyeSize + 50)
    this.ctx.lineTo(cx - eyeSize - 50, cy + eyeSize + 50)
    this.ctx.fill()

    // 주름
    this.ctx.strokeStyle = `rgba(80, 60, 50, ${alpha})`
    this.ctx.lineWidth = 1
    for (let i = 0; i < 8; i++) {
      this.ctx.beginPath()
      this.ctx.moveTo(cx - eyeSize + i * 40, cy - eyeSize * 0.5 - i * 3)
      this.ctx.lineTo(cx - eyeSize + i * 40 + 30, cy - eyeSize * 0.7 - i * 5)
      this.ctx.stroke()
    }
  }

  // 너무 넓은 미소
  private renderTooWideSmile(alpha: number, progress: number): void {
    this.ctx.fillStyle = `rgba(5, 5, 5, ${alpha * 0.95})`
    this.ctx.fillRect(0, 0, this.width, this.height)

    const cx = this.width / 2
    const cy = this.height / 2 + 50

    const smileWidth = 300 + progress * 200 // 점점 넓어짐

    // 입술 상단
    this.ctx.strokeStyle = `rgba(180, 120, 120, ${alpha})`
    this.ctx.lineWidth = 4
    this.ctx.beginPath()
    this.ctx.moveTo(cx - smileWidth / 2, cy)
    this.ctx.quadraticCurveTo(cx, cy - 30, cx + smileWidth / 2, cy)
    this.ctx.stroke()

    // 입술 하단
    this.ctx.beginPath()
    this.ctx.moveTo(cx - smileWidth / 2, cy)
    this.ctx.quadraticCurveTo(cx, cy + 60, cx + smileWidth / 2, cy)
    this.ctx.stroke()

    // 입 안 (검은)
    this.ctx.fillStyle = `rgba(20, 10, 10, ${alpha})`
    this.ctx.beginPath()
    this.ctx.moveTo(cx - smileWidth / 2 + 10, cy)
    this.ctx.quadraticCurveTo(cx, cy - 25, cx + smileWidth / 2 - 10, cy)
    this.ctx.quadraticCurveTo(cx, cy + 55, cx - smileWidth / 2 + 10, cy)
    this.ctx.fill()

    // 이빨들 (불규칙하고 날카로운)
    this.ctx.fillStyle = `rgba(250, 245, 220, ${alpha})`
    const teethCount = Math.floor(smileWidth / 25)
    for (let i = 0; i < teethCount; i++) {
      const tx = cx - smileWidth / 2 + 20 + i * 25
      const toothHeight = 25 + Math.sin(this.seed + i) * 15
      const toothWidth = 12 + Math.sin(this.seed + i * 2) * 5

      // 위 이빨
      this.ctx.beginPath()
      this.ctx.moveTo(tx, cy - 5)
      this.ctx.lineTo(tx + toothWidth / 2, cy + toothHeight)
      this.ctx.lineTo(tx + toothWidth, cy - 5)
      this.ctx.fill()

      // 아래 이빨 (더 짧게)
      this.ctx.beginPath()
      this.ctx.moveTo(tx + 5, cy + 35)
      this.ctx.lineTo(tx + toothWidth / 2 + 5, cy + 35 - toothHeight * 0.6)
      this.ctx.lineTo(tx + toothWidth + 5, cy + 35)
      this.ctx.fill()
    }

    // 찢어진 입꼬리
    this.ctx.strokeStyle = `rgba(150, 60, 60, ${alpha})`
    this.ctx.lineWidth = 2
    // 왼쪽
    this.ctx.beginPath()
    this.ctx.moveTo(cx - smileWidth / 2, cy)
    this.ctx.lineTo(cx - smileWidth / 2 - 30, cy - 20)
    this.ctx.stroke()
    // 오른쪽
    this.ctx.beginPath()
    this.ctx.moveTo(cx + smileWidth / 2, cy)
    this.ctx.lineTo(cx + smileWidth / 2 + 30, cy - 20)
    this.ctx.stroke()

    // 얼굴 주름 (미소로 인한)
    this.ctx.strokeStyle = `rgba(140, 120, 100, ${alpha * 0.7})`
    this.ctx.lineWidth = 1
    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < 6; i++) {
        this.ctx.beginPath()
        this.ctx.moveTo(cx + side * (smileWidth / 2 - 20), cy - 10 - i * 15)
        this.ctx.lineTo(cx + side * (smileWidth / 2 + 20 + i * 5), cy - 30 - i * 20)
        this.ctx.stroke()
      }
    }
  }

  // 목이 비틀린
  private renderNeckTwist(alpha: number, progress: number): void {
    this.ctx.fillStyle = `rgba(10, 8, 8, ${alpha * 0.9})`
    this.ctx.fillRect(0, 0, this.width, this.height)

    const cx = this.width / 2
    const cy = this.height / 2

    const twistAngle = progress * 0.8 // 점점 비틀림

    this.ctx.save()
    this.ctx.translate(cx, cy)
    this.ctx.rotate(twistAngle)

    // 목 (늘어난)
    this.ctx.fillStyle = `rgba(180, 150, 120, ${alpha})`
    this.ctx.beginPath()
    this.ctx.moveTo(-40, 100)
    this.ctx.quadraticCurveTo(-60, 0, -30, -80)
    this.ctx.lineTo(30, -80)
    this.ctx.quadraticCurveTo(60, 0, 40, 100)
    this.ctx.fill()

    // 목 주름 (비틀림으로 인한)
    this.ctx.strokeStyle = `rgba(120, 90, 70, ${alpha})`
    this.ctx.lineWidth = 1.5
    for (let i = 0; i < 10; i++) {
      const y = -70 + i * 18
      const wobble = Math.sin(i + twistAngle * 3) * 10
      this.ctx.beginPath()
      this.ctx.moveTo(-50 + wobble, y)
      this.ctx.quadraticCurveTo(0, y + 5, 50 - wobble, y)
      this.ctx.stroke()
    }

    // 얼굴 (옆모습, 비틀린)
    this.ctx.fillStyle = `rgba(190, 160, 130, ${alpha})`
    this.ctx.beginPath()
    this.ctx.ellipse(0, -130, 70, 90, twistAngle * 0.5, 0, Math.PI * 2)
    this.ctx.fill()

    // 눈 (하나만 보임, 뒤를 봄)
    this.ctx.fillStyle = `rgba(255, 250, 240, ${alpha})`
    this.ctx.beginPath()
    this.ctx.ellipse(30, -140, 20, 15, 0.3, 0, Math.PI * 2)
    this.ctx.fill()

    this.ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`
    this.ctx.beginPath()
    this.ctx.arc(35, -140, 8, 0, Math.PI * 2)
    this.ctx.fill()

    // 기괴하게 웃는 입
    this.ctx.strokeStyle = `rgba(150, 100, 100, ${alpha})`
    this.ctx.lineWidth = 3
    this.ctx.beginPath()
    this.ctx.moveTo(20, -100)
    this.ctx.quadraticCurveTo(50, -90, 60, -110)
    this.ctx.stroke()

    this.ctx.restore()

    // 어깨 (아래에)
    this.ctx.fillStyle = `rgba(100, 80, 70, ${alpha})`
    this.ctx.fillRect(cx - 150, cy + 100, 300, 200)
  }

  // === 수집 시 효과들 ===

  // 만족한 얼굴 (불쾌한 골짜기)
  private renderSatisfactionFace(alpha: number, progress: number): void {
    this.ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.8})`
    this.ctx.fillRect(0, 0, this.width, this.height)

    const cx = this.width / 2
    const cy = this.height / 2

    // 얼굴 윤곽
    this.ctx.fillStyle = `rgba(200, 170, 140, ${alpha})`
    this.ctx.beginPath()
    this.ctx.ellipse(cx, cy, 120, 160, 0, 0, Math.PI * 2)
    this.ctx.fill()

    // 찡그린 눈 (만족스러운)
    this.ctx.strokeStyle = `rgba(60, 40, 30, ${alpha})`
    this.ctx.lineWidth = 4

    // 왼쪽 눈
    this.ctx.beginPath()
    this.ctx.moveTo(cx - 70, cy - 40)
    this.ctx.quadraticCurveTo(cx - 45, cy - 60, cx - 20, cy - 40)
    this.ctx.stroke()
    // 아래 선
    this.ctx.beginPath()
    this.ctx.moveTo(cx - 65, cy - 35)
    this.ctx.quadraticCurveTo(cx - 45, cy - 25, cx - 25, cy - 35)
    this.ctx.stroke()

    // 오른쪽 눈
    this.ctx.beginPath()
    this.ctx.moveTo(cx + 20, cy - 40)
    this.ctx.quadraticCurveTo(cx + 45, cy - 60, cx + 70, cy - 40)
    this.ctx.stroke()
    this.ctx.beginPath()
    this.ctx.moveTo(cx + 25, cy - 35)
    this.ctx.quadraticCurveTo(cx + 45, cy - 25, cx + 65, cy - 35)
    this.ctx.stroke()

    // 주름 (눈가)
    this.ctx.strokeStyle = `rgba(150, 120, 100, ${alpha})`
    this.ctx.lineWidth = 1
    for (let i = 0; i < 4; i++) {
      // 왼쪽
      this.ctx.beginPath()
      this.ctx.moveTo(cx - 75 - i * 5, cy - 50 + i * 3)
      this.ctx.lineTo(cx - 85 - i * 8, cy - 55 + i * 5)
      this.ctx.stroke()
      // 오른쪽
      this.ctx.beginPath()
      this.ctx.moveTo(cx + 75 + i * 5, cy - 50 + i * 3)
      this.ctx.lineTo(cx + 85 + i * 8, cy - 55 + i * 5)
      this.ctx.stroke()
    }

    // 코 (그림자만)
    this.ctx.fillStyle = `rgba(170, 140, 110, ${alpha})`
    this.ctx.beginPath()
    this.ctx.moveTo(cx, cy - 20)
    this.ctx.lineTo(cx - 15, cy + 30)
    this.ctx.lineTo(cx + 5, cy + 30)
    this.ctx.fill()

    // 입 (너무 만족스러운 미소)
    this.ctx.fillStyle = `rgba(40, 20, 20, ${alpha})`
    this.ctx.beginPath()
    this.ctx.moveTo(cx - 60, cy + 50)
    this.ctx.quadraticCurveTo(cx, cy + 100, cx + 60, cy + 50)
    this.ctx.quadraticCurveTo(cx, cy + 70, cx - 60, cy + 50)
    this.ctx.fill()

    // 이빨
    this.ctx.fillStyle = `rgba(250, 245, 230, ${alpha})`
    for (let i = 0; i < 6; i++) {
      const tx = cx - 40 + i * 16
      this.ctx.fillRect(tx, cy + 55, 12, 18)
    }

    // 침
    const dripY = cy + 100 + (this.effectTimer * 40) % 60
    this.ctx.fillStyle = `rgba(200, 200, 210, ${alpha * 0.5})`
    this.ctx.beginPath()
    this.ctx.ellipse(cx + 10, dripY, 4, 8, 0, 0, Math.PI * 2)
    this.ctx.fill()

    // 볼 홍조 (병적인)
    this.ctx.fillStyle = `rgba(200, 120, 120, ${alpha * 0.4})`
    this.ctx.beginPath()
    this.ctx.ellipse(cx - 80, cy + 20, 30, 20, -0.2, 0, Math.PI * 2)
    this.ctx.fill()
    this.ctx.beginPath()
    this.ctx.ellipse(cx + 80, cy + 20, 30, 20, 0.2, 0, Math.PI * 2)
    this.ctx.fill()
  }

  // 황홀경 왜곡
  private renderBlissDistortion(alpha: number, progress: number): void {
    this.ctx.fillStyle = `rgba(20, 15, 10, ${alpha * 0.9})`
    this.ctx.fillRect(0, 0, this.width, this.height)

    const cx = this.width / 2
    const cy = this.height / 2

    // 뒤로 젖힌 모습 (전신)
    this.ctx.save()
    this.ctx.translate(cx, cy + 100)
    this.ctx.rotate(-0.3)

    // 몸통
    this.ctx.fillStyle = `rgba(80, 70, 60, ${alpha})`
    this.ctx.fillRect(-40, 0, 80, 150)

    // 목 (길게 늘어진)
    this.ctx.fillStyle = `rgba(180, 150, 120, ${alpha})`
    this.ctx.beginPath()
    this.ctx.moveTo(-25, 0)
    this.ctx.quadraticCurveTo(-40, -60, -20, -120)
    this.ctx.lineTo(20, -120)
    this.ctx.quadraticCurveTo(40, -60, 25, 0)
    this.ctx.fill()

    // 머리 (뒤로 젖힘)
    this.ctx.beginPath()
    this.ctx.ellipse(0, -160, 60, 70, -0.5, 0, Math.PI * 2)
    this.ctx.fill()

    // 감은 눈 (황홀)
    this.ctx.strokeStyle = `rgba(80, 60, 50, ${alpha})`
    this.ctx.lineWidth = 3
    this.ctx.beginPath()
    this.ctx.moveTo(-40, -170)
    this.ctx.quadraticCurveTo(-25, -185, -10, -170)
    this.ctx.stroke()
    this.ctx.beginPath()
    this.ctx.moveTo(10, -165)
    this.ctx.quadraticCurveTo(25, -180, 40, -165)
    this.ctx.stroke()

    // 벌어진 입 (연기가 나옴)
    this.ctx.fillStyle = `rgba(40, 30, 30, ${alpha})`
    this.ctx.beginPath()
    this.ctx.ellipse(10, -130, 20, 30, -0.3, 0, Math.PI * 2)
    this.ctx.fill()

    this.ctx.restore()

    // 올라가는 연기 (영혼/쾌락)
    this.ctx.strokeStyle = `rgba(200, 190, 180, ${alpha * 0.6})`
    this.ctx.lineWidth = 3
    for (let i = 0; i < 5; i++) {
      const baseX = cx - 30 + i * 15
      this.ctx.beginPath()
      this.ctx.moveTo(baseX, cy - 50)
      for (let j = 0; j < 8; j++) {
        const y = cy - 50 - j * 40
        const x = baseX + Math.sin(this.effectTimer * 2 + j * 0.5 + i) * 30
        this.ctx.lineTo(x, y)
      }
      this.ctx.stroke()
    }

    // 화면 가장자리 왜곡 (황홀경 표현)
    this.ctx.strokeStyle = `rgba(255, 200, 100, ${alpha * 0.3})`
    this.ctx.lineWidth = 20
    this.ctx.beginPath()
    this.ctx.rect(10, 10, this.width - 20, this.height - 20)
    this.ctx.stroke()
  }

  // === 랜덤 효과들 ===

  // 시야 가장자리의 인물
  private renderPeripheralFigure(alpha: number, progress: number): void {
    if (alpha < 0.3) return

    const side = this.seed > 500 ? 1 : -1
    const x = side > 0 ? this.width - 80 : 80
    const y = this.height / 2

    // 어둠 속 실루엣
    this.ctx.fillStyle = `rgba(5, 5, 10, ${alpha})`
    this.ctx.beginPath()
    this.ctx.ellipse(x, y - 40, 50, 80, 0, 0, Math.PI * 2)
    this.ctx.fill()

    // 긴 몸
    this.ctx.fillRect(x - 30, y + 40, 60, 200)

    // 축 늘어진 팔
    this.ctx.beginPath()
    this.ctx.moveTo(x - 30, y + 50)
    this.ctx.quadraticCurveTo(x - 80, y + 150, x - 60, y + 250)
    this.ctx.lineTo(x - 40, y + 250)
    this.ctx.quadraticCurveTo(x - 50, y + 150, x - 20, y + 60)
    this.ctx.fill()

    // 눈만 하얗게
    this.ctx.fillStyle = `rgba(240, 240, 230, ${alpha})`
    this.ctx.beginPath()
    this.ctx.ellipse(x - 15, y - 50, 8, 12, 0, 0, Math.PI * 2)
    this.ctx.fill()
    this.ctx.beginPath()
    this.ctx.ellipse(x + 15, y - 50, 8, 12, 0, 0, Math.PI * 2)
    this.ctx.fill()

    // 동공 (당신을 봄)
    this.ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`
    this.ctx.beginPath()
    this.ctx.arc(x - 15 - side * 3, y - 50, 5, 0, Math.PI * 2)
    this.ctx.fill()
    this.ctx.beginPath()
    this.ctx.arc(x + 15 - side * 3, y - 50, 5, 0, Math.PI * 2)
    this.ctx.fill()
  }

  // 눈 깜빡임 사이에 보이는 얼굴
  private renderBlinkFace(alpha: number, progress: number): void {
    // 눈꺼풀 효과
    const blinkProgress = Math.sin(progress * Math.PI)
    const lidHeight = this.height * 0.5 * (1 - blinkProgress)

    // 위 눈꺼풀
    this.ctx.fillStyle = `rgba(20, 15, 15, 1)`
    this.ctx.fillRect(0, 0, this.width, lidHeight)

    // 아래 눈꺼풀
    this.ctx.fillRect(0, this.height - lidHeight, this.width, lidHeight)

    // 틈 사이로 보이는 얼굴
    if (blinkProgress > 0.3 && blinkProgress < 0.7) {
      const faceAlpha = (blinkProgress - 0.3) * 2.5

      const cx = this.width / 2
      const cy = this.height / 2

      // 얼굴 (너무 가까이)
      this.ctx.fillStyle = `rgba(190, 160, 130, ${faceAlpha})`
      this.ctx.beginPath()
      this.ctx.ellipse(cx, cy, 200, 250, 0, 0, Math.PI * 2)
      this.ctx.fill()

      // 거대한 눈
      this.ctx.fillStyle = `rgba(255, 250, 240, ${faceAlpha})`
      this.ctx.beginPath()
      this.ctx.ellipse(cx - 70, cy - 30, 50, 35, 0, 0, Math.PI * 2)
      this.ctx.fill()
      this.ctx.beginPath()
      this.ctx.ellipse(cx + 70, cy - 30, 50, 35, 0, 0, Math.PI * 2)
      this.ctx.fill()

      // 작은 동공 (집중)
      this.ctx.fillStyle = `rgba(0, 0, 0, ${faceAlpha})`
      this.ctx.beginPath()
      this.ctx.arc(cx - 70, cy - 30, 10, 0, Math.PI * 2)
      this.ctx.fill()
      this.ctx.beginPath()
      this.ctx.arc(cx + 70, cy - 30, 10, 0, Math.PI * 2)
      this.ctx.fill()

      // 미소
      this.ctx.strokeStyle = `rgba(100, 60, 60, ${faceAlpha})`
      this.ctx.lineWidth = 5
      this.ctx.beginPath()
      this.ctx.moveTo(cx - 80, cy + 80)
      this.ctx.quadraticCurveTo(cx, cy + 130, cx + 80, cy + 80)
      this.ctx.stroke()
    }
  }

  // 잘못된 반사
  private renderWrongReflection(alpha: number, progress: number): void {
    if (alpha < 0.4) return

    // 화면 일부에 반사처럼
    const reflectAlpha = (alpha - 0.4) * 1.6

    this.ctx.fillStyle = `rgba(30, 40, 50, ${reflectAlpha * 0.3})`
    this.ctx.fillRect(0, 0, this.width, this.height)

    const cx = this.width / 2
    const cy = this.height / 2

    // 반사된 모습 (하지만 다름)
    this.ctx.strokeStyle = `rgba(150, 160, 170, ${reflectAlpha * 0.5})`
    this.ctx.lineWidth = 2

    // 윤곽
    this.ctx.beginPath()
    this.ctx.ellipse(cx, cy, 80, 110, 0, 0, Math.PI * 2)
    this.ctx.stroke()

    // 눈 (당신을 봄 - 반사인데 시선이 맞음)
    this.ctx.fillStyle = `rgba(200, 200, 200, ${reflectAlpha * 0.6})`
    this.ctx.beginPath()
    this.ctx.ellipse(cx - 30, cy - 20, 15, 10, 0, 0, Math.PI * 2)
    this.ctx.fill()
    this.ctx.beginPath()
    this.ctx.ellipse(cx + 30, cy - 20, 15, 10, 0, 0, Math.PI * 2)
    this.ctx.fill()

    this.ctx.fillStyle = `rgba(20, 20, 20, ${reflectAlpha * 0.8})`
    this.ctx.beginPath()
    this.ctx.arc(cx - 30, cy - 20, 6, 0, Math.PI * 2)
    this.ctx.fill()
    this.ctx.beginPath()
    this.ctx.arc(cx + 30, cy - 20, 6, 0, Math.PI * 2)
    this.ctx.fill()

    // 입 (움직이는데 당신은 움직이지 않음)
    const mouthOpen = Math.sin(this.effectTimer * 5) * 10 + 10
    this.ctx.fillStyle = `rgba(50, 40, 40, ${reflectAlpha * 0.6})`
    this.ctx.beginPath()
    this.ctx.ellipse(cx, cy + 40, 25, mouthOpen, 0, 0, Math.PI * 2)
    this.ctx.fill()
  }

  isActive(): boolean {
    return this.activeEffect !== null
  }
}

type HorrorEffect =
  | 'spiral_eyes'
  | 'reaching_hands'
  | 'hungry_stare'
  | 'too_wide_smile'
  | 'peripheral_figure'
  | 'blink_face'
  | 'wrong_reflection'
