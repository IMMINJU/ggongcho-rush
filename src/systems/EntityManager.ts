import { GameMap } from './Map'
import { Camera } from './Camera'
import { Player } from '../entities/Player'
import { CigaretteButt } from '../entities/CigaretteButt'
import { Smoker } from '../entities/Smoker'
import { SmokerType, ButtQuality } from '../types'

export class EntityManager {
  private map: GameMap
  private butts: CigaretteButt[] = []
  private smokers: Smoker[] = []
  
  private smokerSpawnTimer: number = 0
  private smokerSpawnInterval: number = 5
  
  constructor(map: GameMap) {
    this.map = map
  }
  
  init(): void {
    for (let i = 0; i < 10; i++) {
      this.spawnRandomButt()
    }
    
    for (let i = 0; i < 5; i++) {
      this.spawnRandomSmoker()
    }
  }
  
  private spawnRandomButt(): void {
    const x = 100 + Math.random() * (this.map.width - 200)
    const y = 100 + Math.random() * (this.map.height - 200)
    
    if (!this.map.isColliding(x, y, 12, 4)) {
      const roll = Math.random()
      const quality: 'short' | 'normal' | 'long' = 
        roll < 0.5 ? 'short' : roll < 0.85 ? 'normal' : 'long'
      this.butts.push(new CigaretteButt(x, y, quality))
    }
  }
  
  private spawnRandomSmoker(): void {
    const x = 100 + Math.random() * (this.map.width - 200)
    const y = 100 + Math.random() * (this.map.height - 200)
    
    if (!this.map.isColliding(x, y, 24, 32)) {
      const types: SmokerType[] = ['worker', 'drunk', 'student', 'vaper']
      const weights = [0.35, 0.25, 0.25, 0.15]
      
      let roll = Math.random()
      let type: SmokerType = 'worker'
      for (let i = 0; i < types.length; i++) {
        roll -= weights[i]
        if (roll <= 0) {
          type = types[i]
          break
        }
      }
      
      this.smokers.push(new Smoker(x, y, type))
    }
  }
  
  update(dt: number, player: Player, camera: Camera): void {
    for (const butt of this.butts) {
      butt.update(dt)
    }
    
    for (let i = this.smokers.length - 1; i >= 0; i--) {
      const smoker = this.smokers[i]
      smoker.update(dt)
      
      if (smoker.hasDroppedButt()) {
        const droppedButt = smoker.getDroppedButt()
        if (droppedButt) {
          this.butts.push(droppedButt)
        }
        this.smokers.splice(i, 1)
      }
    }
    
    this.smokerSpawnTimer += dt
    if (this.smokerSpawnTimer >= this.smokerSpawnInterval) {
      this.smokerSpawnTimer = 0
      if (this.smokers.length < 8) {
        this.spawnRandomSmoker()
      }
    }
    
    if (this.butts.length < 5 && Math.random() < 0.01) {
      this.spawnRandomButt()
    }
  }
  
  checkButtCollection(player: Player): ButtQuality | null {
    const playerBounds = {
      x: player.x,
      y: player.y,
      width: player.width,
      height: player.height
    }
    
    for (let i = this.butts.length - 1; i >= 0; i--) {
      const butt = this.butts[i]
      if (butt.isCollected) continue
      
      const buttBounds = butt.getBounds()
      
      if (this.intersects(playerBounds, buttBounds)) {
        butt.isCollected = true
        this.butts.splice(i, 1)
        return butt.quality
      }
    }
    
    return null
  }
  
  private intersects(
    a: { x: number; y: number; width: number; height: number },
    b: { x: number; y: number; width: number; height: number }
  ): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    )
  }
  
  render(ctx: CanvasRenderingContext2D, camera: Camera): void {
    for (const butt of this.butts) {
      if (camera.isVisible(butt.x, butt.y, butt.width, butt.height)) {
        butt.render(ctx)
      }
    }
    
    for (const smoker of this.smokers) {
      if (camera.isVisible(smoker.x, smoker.y, smoker.width, smoker.height)) {
        smoker.render(ctx)
      }
    }
  }
}
