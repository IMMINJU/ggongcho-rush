import { InputState } from '../types'

export class TouchController {
  private container: HTMLElement
  private joystickOuter: HTMLDivElement
  private joystickInner: HTMLDivElement
  
  private isActive: boolean = false
  private centerX: number = 0
  private centerY: number = 0
  private currentX: number = 0
  private currentY: number = 0
  private maxRadius: number = 50
  
  private inputState: InputState = {
    up: false,
    down: false,
    left: false,
    right: false,
    interact: false
  }
  
  constructor(container: HTMLElement) {
    this.container = container
    
    this.joystickOuter = document.createElement('div')
    this.joystickOuter.className = 'joystick-outer'
    
    this.joystickInner = document.createElement('div')
    this.joystickInner.className = 'joystick-inner'
    
    this.joystickOuter.appendChild(this.joystickInner)
    this.container.appendChild(this.joystickOuter)
    
    this.setupEventListeners()
  }
  
  private setupEventListeners(): void {
    this.joystickOuter.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false })
    document.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false })
    document.addEventListener('touchend', this.onTouchEnd.bind(this))
    document.addEventListener('touchcancel', this.onTouchEnd.bind(this))
  }
  
  private onTouchStart(e: TouchEvent): void {
    e.preventDefault()
    const touch = e.touches[0]
    const rect = this.joystickOuter.getBoundingClientRect()
    
    this.isActive = true
    this.centerX = rect.left + rect.width / 2
    this.centerY = rect.top + rect.height / 2
    
    this.updateJoystick(touch.clientX, touch.clientY)
  }
  
  private onTouchMove(e: TouchEvent): void {
    if (!this.isActive) return
    e.preventDefault()
    
    const touch = e.touches[0]
    this.updateJoystick(touch.clientX, touch.clientY)
  }
  
  private onTouchEnd(): void {
    this.isActive = false
    this.currentX = 0
    this.currentY = 0
    this.joystickInner.style.transform = 'translate(-50%, -50%)'
    
    this.inputState.up = false
    this.inputState.down = false
    this.inputState.left = false
    this.inputState.right = false
  }
  
  private updateJoystick(touchX: number, touchY: number): void {
    let dx = touchX - this.centerX
    let dy = touchY - this.centerY
    
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    if (distance > this.maxRadius) {
      dx = (dx / distance) * this.maxRadius
      dy = (dy / distance) * this.maxRadius
    }
    
    this.currentX = dx / this.maxRadius
    this.currentY = dy / this.maxRadius
    
    this.joystickInner.style.transform = 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px))'
    
    const threshold = 0.3
    this.inputState.up = this.currentY < -threshold
    this.inputState.down = this.currentY > threshold
    this.inputState.left = this.currentX < -threshold
    this.inputState.right = this.currentX > threshold
  }
  
  getState(): InputState {
    return this.inputState
  }
  
  isTouchDevice(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  }
  
  show(): void {
    this.joystickOuter.style.display = 'block'
  }
  
  hide(): void {
    this.joystickOuter.style.display = 'none'
  }
}
