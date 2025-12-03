export class Camera {
  x: number = 0
  y: number = 0
  
  private screenWidth: number
  private screenHeight: number
  private mapWidth: number
  private mapHeight: number
  
  private targetX: number = 0
  private targetY: number = 0
  private smoothing: number = 0.1
  
  constructor(screenWidth: number, screenHeight: number, mapWidth: number, mapHeight: number) {
    this.screenWidth = screenWidth
    this.screenHeight = screenHeight
    this.mapWidth = mapWidth
    this.mapHeight = mapHeight
  }
  
  follow(playerX: number, playerY: number): void {
    // 플레이어를 화면 중앙에 배치
    this.targetX = playerX - this.screenWidth / 2
    this.targetY = playerY - this.screenHeight / 2
    
    // 부드러운 카메라 이동
    this.x += (this.targetX - this.x) * this.smoothing
    this.y += (this.targetY - this.y) * this.smoothing
    
    // 맵 경계 제한
    this.x = Math.max(0, Math.min(this.x, this.mapWidth - this.screenWidth))
    this.y = Math.max(0, Math.min(this.y, this.mapHeight - this.screenHeight))
  }
  
  // 화면 좌표를 월드 좌표로 변환
  screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    return {
      x: screenX + this.x,
      y: screenY + this.y
    }
  }
  
  // 월드 좌표를 화면 좌표로 변환
  worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
    return {
      x: worldX - this.x,
      y: worldY - this.y
    }
  }
  
  // 객체가 화면 내에 있는지 체크
  isVisible(x: number, y: number, width: number, height: number): boolean {
    return (
      x + width > this.x &&
      x < this.x + this.screenWidth &&
      y + height > this.y &&
      y < this.y + this.screenHeight
    )
  }
}
