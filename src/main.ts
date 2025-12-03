import './style.css'
import { Game } from './Game'

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement
const uiOverlay = document.getElementById('ui-overlay') as HTMLDivElement

const game = new Game(canvas, uiOverlay)
game.init()
