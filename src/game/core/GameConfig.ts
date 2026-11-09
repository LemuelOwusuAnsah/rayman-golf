import Phaser from 'phaser'
import GolfScene from '../scenes/GolfScene'

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-root',
  backgroundColor: '#87ceeb',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: '100%',
    height: '100%'
  },
  physics: {
    default: 'matter',
    matter: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scene: [GolfScene],
  render: {
    pixelArt: false,
    antialias: true
  }
}

export default config
