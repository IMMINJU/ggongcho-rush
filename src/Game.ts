import { GameState, EndingType, InputState } from './types'
import { Player } from './entities/Player'
import { GameMap } from './systems/Map'
import { Camera } from './systems/Camera'
import { Lighting } from './systems/Lighting'
import { UI } from './systems/UI'
import { EntityManager } from './systems/EntityManager'
import { InputManager } from './systems/InputManager'
import { TouchController } from './systems/TouchController'

export class Game {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private uiOverlay: HTMLDivElement

  private state: GameState = 'start'
  private lastTime: number = 0

  private player!: Player
  private map!: GameMap
  private camera!: Camera
  private lighting!: Lighting
  private ui!: UI
  private entityManager!: EntityManager
  private inputManager!: InputManager
  private touchController!: TouchController
  private isMobile: boolean = false

  private canvasWidth = 960
  private canvasHeight = 640
  readonly NICOTINE_DECAY_RATE = 0.8

  constructor(canvas: HTMLCanvasElement, uiOverlay: HTMLDivElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.uiOverlay = uiOverlay

    this.setupResponsiveCanvas()
    window.addEventListener('resize', () => this.setupResponsiveCanvas())
  }

  private setupResponsiveCanvas(): void {
    const maxWidth = window.innerWidth
    const maxHeight = window.visualViewport?.height || window.innerHeight
    const aspectRatio = 960 / 640

    let width = maxWidth
    let height = maxWidth / aspectRatio

    if (height > maxHeight) {
      height = maxHeight
      width = maxHeight * aspectRatio
    }

    this.canvas.style.width = width + 'px'
    this.canvas.style.height = height + 'px'
    this.canvas.width = 960
    this.canvas.height = 640
    this.canvasWidth = 960
    this.canvasHeight = 640
  }

  init(): void {
    this.inputManager = new InputManager()
    this.touchController = new TouchController(this.uiOverlay)
    this.isMobile = this.touchController.isTouchDevice()

    this.map = new GameMap()
    this.player = new Player(this.map.playerSpawn.x, this.map.playerSpawn.y)
    this.camera = new Camera(this.canvasWidth, this.canvasHeight, this.map.width, this.map.height)
    this.lighting = new Lighting(this.ctx, this.canvasWidth, this.canvasHeight)
    this.ui = new UI(this.uiOverlay)
    this.entityManager = new EntityManager(this.map)

    this.ui.showStartScreen(() => this.startGame())
  }

  private startGame(): void {
    this.state = 'playing'
    this.player.nicotine = 50
    this.entityManager.init()
    this.lastTime = performance.now()

    if (this.isMobile) {
      this.touchController.show()
    }

    this.gameLoop()
  }

  private gameLoop = (): void => {
    if (this.state !== 'playing') return

    const currentTime = performance.now()
    const deltaTime = (currentTime - this.lastTime) / 1000
    this.lastTime = currentTime

    this.update(deltaTime)
    this.render()

    requestAnimationFrame(this.gameLoop)
  }

  private update(dt: number): void {
    let input: InputState

    if (this.isMobile) {
      input = this.touchController.getState()
    } else {
      input = this.inputManager.getState()
    }

    this.player.update(dt, input, this.map)
    this.player.nicotine -= this.NICOTINE_DECAY_RATE * dt
    this.camera.follow(this.player.x, this.player.y)
    this.entityManager.update(dt, this.player, this.camera)

    const collectedButt = this.entityManager.checkButtCollection(this.player)
    if (collectedButt) {
      this.player.nicotine += collectedButt.nicotineAmount
      this.player.smoke()
    }

    this.checkGameState()
    this.ui.updateNicotine(this.player.nicotine)
  }

  private checkGameState(): void {
    if (this.player.nicotine <= 0) {
      this.endGame('withdrawal')
    } else if (this.player.isArrested) {
      this.endGame('arrested')
    } else if (this.player.nicotine >= 100) {
      this.endGame('liberation')
    }
  }

  private endGame(ending: EndingType): void {
    this.state = ending === 'liberation' ? 'clear' : 'gameover'
    if (this.isMobile) {
      this.touchController.hide()
    }
    this.ui.showEnding(ending, () => {
      location.reload()
    })
  }

  private render(): void {
    this.ctx.fillStyle = '#0a0a0a'
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight)

    this.ctx.save()
    this.ctx.translate(-this.camera.x, -this.camera.y)

    this.map.render(this.ctx, this.camera)
    this.entityManager.render(this.ctx, this.camera)
    this.player.render(this.ctx)

    this.ctx.restore()

    const screenX = this.player.x - this.camera.x
    const screenY = this.player.y - this.camera.y
    this.lighting.render(screenX, screenY, this.player.nicotine)
  }
}
