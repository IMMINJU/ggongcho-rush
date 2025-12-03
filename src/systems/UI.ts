import { EndingType } from '../types'

export class UI {
  private overlay: HTMLDivElement
  private nicotineBar: HTMLDivElement | null = null
  private nicotineFill: HTMLDivElement | null = null
  private nicotineLabel: HTMLDivElement | null = null
  
  constructor(overlay: HTMLDivElement) {
    this.overlay = overlay
  }
  
  showStartScreen(onStart: () => void): void {
    const screen = document.createElement('div')
    screen.className = 'start-screen'
    screen.innerHTML = '<h1>꽁초러시</h1><p class="subtitle">니코틴이 떨어지기 전에 꽁초를 찾아라.<br>시야가 완전히 밝아지면... 해방이다.</p><button>시작</button>'
    
    const button = screen.querySelector('button')!
    button.addEventListener('click', () => {
      screen.remove()
      this.createHUD()
      onStart()
    })
    
    this.overlay.appendChild(screen)
  }
  
  private createHUD(): void {
    this.nicotineLabel = document.createElement('div')
    this.nicotineLabel.className = 'nicotine-bar-label'
    this.nicotineLabel.textContent = 'NICOTINE'
    
    this.nicotineBar = document.createElement('div')
    this.nicotineBar.className = 'nicotine-bar'
    
    this.nicotineFill = document.createElement('div')
    this.nicotineFill.className = 'nicotine-bar-fill'
    this.nicotineFill.style.width = '50%'
    
    this.nicotineBar.appendChild(this.nicotineFill)
    this.overlay.appendChild(this.nicotineLabel)
    this.overlay.appendChild(this.nicotineBar)
    
    const hint = document.createElement('div')
    hint.className = 'hint-text'
    hint.textContent = 'WASD or Arrow Keys to move / Space to interact'
    this.overlay.appendChild(hint)
    
    setTimeout(() => hint.style.opacity = '0', 5000)
  }
  
  updateNicotine(value: number): void {
    if (this.nicotineFill) {
      const clampedValue = Math.max(0, Math.min(100, value))
      this.nicotineFill.style.width = clampedValue + '%'
      
      if (clampedValue < 20) {
        this.nicotineFill.style.background = 'linear-gradient(90deg, #8b0000, #ff4444)'
        this.nicotineFill.style.animation = 'pulse 0.5s infinite'
      } else if (clampedValue > 80) {
        this.nicotineFill.style.background = 'linear-gradient(90deg, #f7c59f, #ffffff)'
      } else {
        this.nicotineFill.style.background = 'linear-gradient(90deg, #ff6b35, #f7c59f)'
        this.nicotineFill.style.animation = 'none'
      }
    }
  }
  
  showEnding(type: EndingType, onRestart: () => void): void {
    const screen = document.createElement('div')
    screen.className = 'ending-screen ending-' + type
    
    let title = ''
    let message = ''
    
    switch (type) {
      case 'withdrawal':
        title = 'GAME OVER'
        message = '금단 현상을 이기지 못했다...'
        break
      case 'arrested':
        title = 'ARRESTED'
        message = '경찰에게 붙잡혔다. 이제 어디로 가는 걸까...'
        break
      case 'liberation':
        title = 'LIBERATION'
        message = '드디어, 볼 수 있게 되었다.<br>그리고 더 이상, 볼 필요가 없어졌다.'
        break
    }
    
    screen.innerHTML = '<h1>' + title + '</h1><p>' + message + '</p><button>다시 시작</button>'
    
    const button = screen.querySelector('button')!
    button.addEventListener('click', onRestart)
    
    this.overlay.appendChild(screen)
    
    setTimeout(() => screen.classList.add('visible'), 100)
  }
  
  showMessage(text: string, duration: number = 2000): void {
    const msg = document.createElement('div')
    msg.className = 'game-message'
    msg.textContent = text
    this.overlay.appendChild(msg)
    
    setTimeout(() => msg.classList.add('visible'), 10)
    setTimeout(() => {
      msg.classList.remove('visible')
      setTimeout(() => msg.remove(), 500)
    }, duration)
  }
}
