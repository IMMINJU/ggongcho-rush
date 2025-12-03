import { Player } from '../entities/Player'
import { GameMap } from './Map'
import { Camera } from './Camera'

export class Minimap {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private width: number = 120
  private height: number = 80
  private scale: number
  
  constructor(container: HTMLElement, map: GameMap) {
    this.canvas = document.createElement('canvas')
    this.canvas.className = 'minimap'
    this.canvas.width = this.width
    this.canvas.height = this.height
    this.ctx = this.canvas.getContext('2d')!
    
    this.scale = Math.min(this.width / map.width, this.height / map.height)
    
    container.appendChild(this.canvas)
  }
  
  render(
    player: Player,
    map: GameMap,
    entities: {
      smokers: Array<{x: number, y: number}>,
      police: Array<{x: number, y: number}>,
      butts: Array<{x: number, y: number}>,
      rivals: Array<{x: number, y: number}>
    }
  ): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    this.ctx.fillRect(0, 0, this.width, this.height)
    
    this.ctx.strokeStyle = '#333'
    this.ctx.strokeRect(0, 0, this.width, this.height)
    
    for (const butt of entities.butts) {
      this.ctx.fillStyle = '#ff6b35'
      this.ctx.fillRect(
        butt.x * this.scale - 1,
        butt.y * this.scale - 1,
        2, 2
      )
    }
    
    for (const smoker of entities.smokers) {
      this.ctx.fillStyle = '#888888'
      this.ctx.fillRect(
        smoker.x * this.scale - 1,
        smoker.y * this.scale - 1,
        3, 3
      )
    }
    
    for (const rival of entities.rivals) {
      this.ctx.fillStyle = '#aa8844'
      this.ctx.fillRect(
        rival.x * this.scale - 1,
        rival.y * this.scale - 1,
        3, 3
      )
    }
    
    for (const p of entities.police) {
      this.ctx.fillStyle = '#4169e1'
      this.ctx.fillRect(
        p.x * this.scale - 2,
        p.y * this.scale - 2,
        4, 4
      )
    }
    
    this.ctx.fillStyle = '#00ff00'
    this.ctx.beginPath()
    this.ctx.arc(
      player.x * this.scale,
      player.y * this.scale,
      3, 0, Math.PI * 2
    )
    this.ctx.fill()
  }
  
  show(): void {
    this.canvas.style.display = 'block'
  }
  
  hide(): void {
    this.canvas.style.display = 'none'
  }
}
