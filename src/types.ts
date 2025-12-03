export interface Position {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface Rectangle extends Position, Size {}

export type GameState = 'start' | 'playing' | 'gameover' | 'clear'

export type EndingType = 'withdrawal' | 'arrested' | 'liberation'

export interface InputState {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
  interact: boolean
}

export type SmokerType = 'worker' | 'drunk' | 'student' | 'vaper'

export interface ButtQuality {
  type: 'short' | 'normal' | 'long'
  nicotineAmount: number
}

export type ZoneType = 'alley' | 'convenience' | 'park' | 'busStop' | 'office'

export interface Zone {
  type: ZoneType
  bounds: Rectangle
  smokerDensity: number
  policeFrequency: number
  buttQuality: number
}
