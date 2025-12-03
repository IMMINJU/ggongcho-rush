import { InputState } from '../types'

export class InputManager {
  private keys: Set<string> = new Set()
  
  constructor() {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code)
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault()
      }
    })
    
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code)
    })
    
    window.addEventListener('blur', () => {
      this.keys.clear()
    })
  }
  
  getState(): InputState {
    return {
      up: this.keys.has('KeyW') || this.keys.has('ArrowUp'),
      down: this.keys.has('KeyS') || this.keys.has('ArrowDown'),
      left: this.keys.has('KeyA') || this.keys.has('ArrowLeft'),
      right: this.keys.has('KeyD') || this.keys.has('ArrowRight'),
      interact: this.keys.has('Space') || this.keys.has('KeyE')
    }
  }
  
  isPressed(code: string): boolean {
    return this.keys.has(code)
  }
}
