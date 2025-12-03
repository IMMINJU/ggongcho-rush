import { Zone, ZoneType, Position } from '../types'
import { Camera } from './Camera'

interface Tile {
  type: 'ground' | 'road' | 'building' | 'wall' | 'bench' | 'trash'
  walkable: boolean
  color: string
}

export class GameMap {
  readonly width: number = 2400
  readonly height: number = 1600
  readonly tileSize: number = 32
  
  private tiles: Tile[][] = []
  private zones: Zone[] = []
  
  playerSpawn: Position = { x: 400, y: 800 }
  
  constructor() {
    this.generateMap()
    this.defineZones()
  }
  
  private generateMap(): void {
    const cols = Math.ceil(this.width / this.tileSize)
    const rows = Math.ceil(this.height / this.tileSize)
    
    for (let y = 0; y < rows; y++) {
      this.tiles[y] = []
      for (let x = 0; x < cols; x++) {
        this.tiles[y][x] = { type: 'ground', walkable: true, color: '#2a2a3a' }
      }
    }
    
    for (let x = 0; x < cols; x++) {
      for (const roadY of [15, 35]) {
        for (let offset = 0; offset < 3; offset++) {
          if (roadY + offset < rows) {
            this.tiles[roadY + offset][x] = { type: 'road', walkable: true, color: '#1a1a1a' }
          }
        }
      }
    }
    
    for (let y = 0; y < rows; y++) {
      for (const roadX of [20, 50]) {
        for (let offset = 0; offset < 3; offset++) {
          if (roadX + offset < cols) {
            this.tiles[y][roadX + offset] = { type: 'road', walkable: true, color: '#1a1a1a' }
          }
        }
      }
    }
    
    this.placeBuilding(2, 2, 8, 6, '#3a3a5a')
    this.placeBuilding(12, 2, 6, 5, '#4a3a3a')
    this.placeBuilding(2, 20, 5, 4, '#3a4a3a')
    this.placeBuilding(55, 2, 10, 8, '#4a4a5a')
    this.placeBuilding(55, 20, 8, 6, '#3a3a4a')
    this.placeBuilding(30, 2, 6, 5, '#5a4a4a')
    
    this.createPark(25, 40, 15, 8)
    this.createBusStop(8, 15)
    this.createBusStop(45, 35)
    
    for (let x = 0; x < cols; x++) {
      this.tiles[0][x] = { type: 'wall', walkable: false, color: '#1a1a2a' }
      this.tiles[rows - 1][x] = { type: 'wall', walkable: false, color: '#1a1a2a' }
    }
    for (let y = 0; y < rows; y++) {
      this.tiles[y][0] = { type: 'wall', walkable: false, color: '#1a1a2a' }
      this.tiles[y][cols - 1] = { type: 'wall', walkable: false, color: '#1a1a2a' }
    }
  }
  
  private placeBuilding(startX: number, startY: number, w: number, h: number, color: string): void {
    for (let y = startY; y < startY + h && y < this.tiles.length; y++) {
      for (let x = startX; x < startX + w && x < this.tiles[0].length; x++) {
        this.tiles[y][x] = { type: 'building', walkable: false, color }
      }
    }
  }
  
  private createPark(startX: number, startY: number, w: number, h: number): void {
    for (let y = startY; y < startY + h && y < this.tiles.length; y++) {
      for (let x = startX; x < startX + w && x < this.tiles[0].length; x++) {
        this.tiles[y][x] = { type: 'ground', walkable: true, color: '#1a3a1a' }
      }
    }
    if (startY + 2 < this.tiles.length && startX + 3 < this.tiles[0].length) {
      this.tiles[startY + 2][startX + 3] = { type: 'bench', walkable: false, color: '#5a3a1a' }
    }
    if (startY + 5 < this.tiles.length && startX + 8 < this.tiles[0].length) {
      this.tiles[startY + 5][startX + 8] = { type: 'bench', walkable: false, color: '#5a3a1a' }
    }
    if (startY + 1 < this.tiles.length && startX + 1 < this.tiles[0].length) {
      this.tiles[startY + 1][startX + 1] = { type: 'trash', walkable: false, color: '#4a4a4a' }
    }
  }
  
  private createBusStop(x: number, y: number): void {
    if (y < this.tiles.length && x < this.tiles[0].length) {
      this.tiles[y][x] = { type: 'bench', walkable: false, color: '#2a4a6a' }
    }
  }
  
  private defineZones(): void {
    this.zones = [
      { type: 'alley', bounds: { x: 320, y: 32, width: 256, height: 192 }, smokerDensity: 0.8, policeFrequency: 0.1, buttQuality: 0.7 },
      { type: 'convenience', bounds: { x: 32, y: 640, width: 192, height: 160 }, smokerDensity: 0.5, policeFrequency: 0.6, buttQuality: 0.5 },
      { type: 'park', bounds: { x: 800, y: 1280, width: 512, height: 256 }, smokerDensity: 0.3, policeFrequency: 0.2, buttQuality: 0.3 },
      { type: 'busStop', bounds: { x: 224, y: 480, width: 96, height: 64 }, smokerDensity: 0.6, policeFrequency: 0.3, buttQuality: 0.4 },
      { type: 'office', bounds: { x: 32, y: 32, width: 288, height: 224 }, smokerDensity: 0.7, policeFrequency: 0.2, buttQuality: 0.5 }
    ]
  }
  
  getZoneAt(x: number, y: number): Zone | null {
    for (const zone of this.zones) {
      if (x >= zone.bounds.x && x < zone.bounds.x + zone.bounds.width && y >= zone.bounds.y && y < zone.bounds.y + zone.bounds.height) {
        return zone
      }
    }
    return null
  }
  
  isColliding(x: number, y: number, width: number, height: number): boolean {
    const corners = [{ x, y }, { x: x + width, y }, { x, y: y + height }, { x: x + width, y: y + height }]
    for (const corner of corners) {
      const tileX = Math.floor(corner.x / this.tileSize)
      const tileY = Math.floor(corner.y / this.tileSize)
      if (tileY < 0 || tileY >= this.tiles.length || tileX < 0 || tileX >= this.tiles[0].length) return true
      if (!this.tiles[tileY][tileX].walkable) return true
    }
    return false
  }
  
  render(ctx: CanvasRenderingContext2D, camera: Camera): void {
    const startTileX = Math.floor(camera.x / this.tileSize)
    const startTileY = Math.floor(camera.y / this.tileSize)
    const endTileX = Math.ceil((camera.x + 960) / this.tileSize)
    const endTileY = Math.ceil((camera.y + 640) / this.tileSize)
    
    for (let y = startTileY; y <= endTileY && y < this.tiles.length; y++) {
      for (let x = startTileX; x <= endTileX && x < this.tiles[0].length; x++) {
        if (y < 0 || x < 0) continue
        const tile = this.tiles[y][x]
        const screenX = x * this.tileSize
        const screenY = y * this.tileSize
        
        ctx.fillStyle = tile.color
        ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize)
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)'
        ctx.strokeRect(screenX, screenY, this.tileSize, this.tileSize)
        
        if (tile.type === 'road' && y % 2 === 0) {
          ctx.fillStyle = '#3a3a3a'
          ctx.fillRect(screenX + 14, screenY + 14, 4, 4)
        } else if (tile.type === 'bench') {
          ctx.fillStyle = '#8b4513'
          ctx.fillRect(screenX + 4, screenY + 10, 24, 6)
          ctx.fillRect(screenX + 6, screenY + 16, 4, 10)
          ctx.fillRect(screenX + 22, screenY + 16, 4, 10)
        } else if (tile.type === 'trash') {
          ctx.fillStyle = '#2a2a2a'
          ctx.fillRect(screenX + 8, screenY + 8, 16, 20)
          ctx.fillStyle = '#3a3a3a'
          ctx.fillRect(screenX + 6, screenY + 6, 20, 4)
        } else if (tile.type === 'building' && (x + y) % 3 === 0) {
          ctx.fillStyle = 'rgba(255, 255, 150, 0.3)'
          ctx.fillRect(screenX + 8, screenY + 8, 8, 8)
        }
      }
    }
  }
}
