import { GameMap } from './Map'
import { Camera } from './Camera'
import { Player } from '../entities/Player'
import { CigaretteButt } from '../entities/CigaretteButt'
import { Smoker } from '../entities/Smoker'
import { Police } from '../entities/Police'
import { Rival } from '../entities/Rival'
import { Coin } from '../entities/Coin'
import { Shop } from '../entities/Shop'
import { SmokerType, ButtQuality } from '../types'
import { EventSystem } from './EventSystem'

export class EntityManager {
  private map: GameMap
  private butts: CigaretteButt[] = []
  private smokers: Smoker[] = []
  private police: Police[] = []
  private rivals: Rival[] = []
  private coins: Coin[] = []
  private shops: Shop[] = []
  private eventSystem: EventSystem
  private smokerSpawnTimer: number = 0
  private smokerSpawnInterval: number = 5

  constructor(map: GameMap) {
    this.map = map
    this.eventSystem = new EventSystem()
  }

  init(): void {
    for (let i = 0; i < 10; i++) this.spawnRandomButt()
    for (let i = 0; i < 5; i++) this.spawnRandomSmoker()
    this.police.push(new Police(200, 600, [
      { x: 200, y: 600 }, { x: 400, y: 600 }, { x: 400, y: 700 }, { x: 200, y: 700 }
    ]))
    this.rivals.push(new Rival(800, 400))
    this.rivals.push(new Rival(1200, 800))
    this.shops.push(new Shop(100, 650))
    for (let i = 0; i < 5; i++) this.spawnRandomCoin()
  }

  private spawnRandomButt(): void {
    const effects = this.eventSystem.getEventEffects()
    if (Math.random() > effects.buttSpawnMultiplier) return
    const x = 100 + Math.random() * (this.map.width - 200)
    const y = 100 + Math.random() * (this.map.height - 200)
    if (!this.map.isColliding(x, y, 12, 4)) {
      const roll = Math.random() / effects.buttQualityMultiplier
      const quality: 'short' | 'normal' | 'long' = roll < 0.5 ? 'short' : roll < 0.85 ? 'normal' : 'long'
      this.butts.push(new CigaretteButt(x, y, quality))
    }
  }

  private spawnRandomSmoker(): void {
    const effects = this.eventSystem.getEventEffects()
    if (Math.random() > effects.smokerSpawnMultiplier * 0.5) return
    const x = 100 + Math.random() * (this.map.width - 200)
    const y = 100 + Math.random() * (this.map.height - 200)
    if (!this.map.isColliding(x, y, 24, 32)) {
      const types: SmokerType[] = ['worker', 'drunk', 'student', 'vaper']
      const weights = [0.35, 0.25, 0.25, 0.15]
      let roll = Math.random()
      let type: SmokerType = 'worker'
      for (let i = 0; i < types.length; i++) {
        roll -= weights[i]
        if (roll <= 0) { type = types[i]; break }
      }
      this.smokers.push(new Smoker(x, y, type))
    }
  }

  private spawnRandomCoin(): void {
    const x = 100 + Math.random() * (this.map.width - 200)
    const y = 100 + Math.random() * (this.map.height - 200)
    if (!this.map.isColliding(x, y, 10, 10)) {
      this.coins.push(new Coin(x, y, 100))
    }
  }

  update(dt: number, player: Player, camera: Camera): { arrested: boolean, eventMessage: string | null } {
    let arrested = false
    let eventMessage: string | null = null
    this.eventSystem.update(dt)
    if (this.eventSystem.currentEvent !== 'none') {
      eventMessage = this.eventSystem.getEventMessage()
    }
    for (const butt of this.butts) butt.update(dt)
    for (let i = this.smokers.length - 1; i >= 0; i--) {
      const smoker = this.smokers[i]
      smoker.update(dt)
      if (smoker.hasDroppedButt()) {
        const droppedButt = smoker.getDroppedButt()
        if (droppedButt) this.butts.push(droppedButt)
        this.smokers.splice(i, 1)
      }
    }
    for (const p of this.police) {
      if (p.update(dt, player, false)) arrested = true
    }
    for (const rival of this.rivals) {
      const stolenButt = rival.update(dt, this.butts, this.map.width, this.map.height)
      if (stolenButt) {
        const idx = this.butts.indexOf(stolenButt)
        if (idx > -1) this.butts.splice(idx, 1)
      }
    }
    for (const coin of this.coins) coin.update(dt)
    this.smokerSpawnTimer += dt
    const effects = this.eventSystem.getEventEffects()
    if (this.smokerSpawnTimer >= this.smokerSpawnInterval / effects.smokerSpawnMultiplier) {
      this.smokerSpawnTimer = 0
      if (this.smokers.length < 8) this.spawnRandomSmoker()
    }
    if (this.butts.length < 5 && Math.random() < 0.01 * effects.buttSpawnMultiplier) this.spawnRandomButt()
    if (this.coins.length < 3 && Math.random() < 0.005) this.spawnRandomCoin()
    return { arrested, eventMessage }
  }

  checkButtCollection(player: Player): ButtQuality | null {
    const pb = { x: player.x, y: player.y, width: player.width, height: player.height }
    for (let i = this.butts.length - 1; i >= 0; i--) {
      const butt = this.butts[i]
      if (butt.isCollected) continue
      if (this.intersects(pb, butt.getBounds())) {
        butt.isCollected = true
        this.butts.splice(i, 1)
        return butt.quality
      }
    }
    return null
  }

  checkCoinCollection(player: Player): number {
    const pb = { x: player.x, y: player.y, width: player.width, height: player.height }
    let collected = 0
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const coin = this.coins[i]
      if (coin.isCollected) continue
      if (this.intersects(pb, coin.getBounds())) {
        coin.isCollected = true
        collected += coin.value
        this.coins.splice(i, 1)
      }
    }
    return collected
  }

  checkShopInteraction(player: Player, playerMoney: number): { success: boolean, cost: number } {
    for (const shop of this.shops) {
      if (shop.isPlayerNear(player.x, player.y) && playerMoney >= shop.cigarettePrice) {
        return { success: true, cost: shop.cigarettePrice }
      }
    }
    return { success: false, cost: 0 }
  }

  getEntitiesForMinimap() {
    return {
      smokers: this.smokers.map(s => ({ x: s.x, y: s.y })),
      police: this.police.map(p => ({ x: p.x, y: p.y })),
      butts: this.butts.map(b => ({ x: b.x, y: b.y })),
      rivals: this.rivals.map(r => ({ x: r.x, y: r.y }))
    }
  }

  getCurrentEvent(): string { return this.eventSystem.currentEvent }

  private intersects(a: {x:number,y:number,width:number,height:number}, b: {x:number,y:number,width:number,height:number}): boolean {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
  }

  render(ctx: CanvasRenderingContext2D, camera: Camera): void {
    for (const shop of this.shops) shop.render(ctx)
    for (const coin of this.coins) if (camera.isVisible(coin.x, coin.y, 20, 20)) coin.render(ctx)
    for (const butt of this.butts) if (camera.isVisible(butt.x, butt.y, butt.width, butt.height)) butt.render(ctx)
    for (const smoker of this.smokers) if (camera.isVisible(smoker.x, smoker.y, smoker.width, smoker.height)) smoker.render(ctx)
    for (const rival of this.rivals) if (camera.isVisible(rival.x, rival.y, rival.width, rival.height)) rival.render(ctx)
    for (const p of this.police) if (camera.isVisible(p.x, p.y, p.width, p.height)) p.render(ctx)
  }
}
