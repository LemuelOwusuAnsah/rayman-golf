import Phaser from 'phaser'
import config from './GameConfig'

let gameInstance: Phaser.Game | null = null

export function mountGame(parentId: string): Phaser.Game {
  if (gameInstance) return gameInstance
  const cfg = { ...config, parent: parentId }
  gameInstance = new Phaser.Game(cfg)
  return gameInstance
}

export function unmountGame(): void {
  if (gameInstance) {
    gameInstance.destroy(true)
    gameInstance = null
  }
}
