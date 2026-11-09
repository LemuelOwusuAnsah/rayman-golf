import Phaser from 'phaser'

const WORLD_W = 2400
const WORLD_H = 1400
const BALL_RADIUS = 14
const HOLE_RADIUS = 34
const MAX_POWER = 32
const FRICTION = 0.006
const MIN_SPEED = 0.15
const BALL_RESTITUTION = 0.55

export default class GolfScene extends Phaser.Scene {
  private ball!: Phaser.Physics.Matter.Image
  private hole!: Phaser.GameObjects.Arc
  private holeSensor!: Phaser.Physics.Matter.Image
  private character!: Phaser.GameObjects.Container
  private aimLine!: Phaser.GameObjects.Graphics
  private powerBar!: Phaser.GameObjects.Graphics
  private hud!: Phaser.GameObjects.Text

  private aimAngle = 0
  private power = 0
  private charging = false
  private strokes = 0
  private par = 3
  private rolling = false
  private inHole = false
  private start = { x: 400, y: 900 }
  private holePos = { x: 1900, y: 500 }

  constructor() {
    super({ key: 'GolfScene' })
  }

  create(): void {
    this.strokes = 0
    this.power = 0
    this.charging = false
    this.rolling = false
    this.inHole = false
    this.aimAngle = 0

    const world = (this as any).matter?.world ?? (this as any).physics?.world
    if (!world) {
      console.error('Physics system not available on scene')
      return
    }
    this.cameras.main.setBackgroundColor('#8fd45a')
    this.matter.world.setBounds(0, 0, WORLD_W, WORLD_H, 60, true, true, false, true)

    this.drawCourse()
    this.createHole()
    this.createBall()
    this.createCharacter()
    this.createUI()
    this.setupInput()

    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H)
    this.cameras.main.startFollow(this.ball, true, 0.08, 0.08)
    this.cameras.main.setZoom(1.1)

    this.matter.world.on('collisionstart', (event: any) => {
      for (const pair of event.pairs) {
        if (pair.bodyA === this.holeSensor.body || pair.bodyB === this.holeSensor.body) {
          const other = pair.bodyA === this.holeSensor.body ? pair.bodyB : pair.bodyA
          if (other === this.ball.body) {
            const speed = this.ball.body ? Math.hypot(
              (this.ball.body as MatterJS.BodyType).velocity.x,
              (this.ball.body as MatterJS.BodyType).velocity.y
            ) : 999
            if (speed < 8 && !this.inHole) {
              this.completeHole()
            }
          }
        }
      }
    })
  }

  private drawCourse(): void {
    const g = this.add.graphics()
    g.fillStyle(0x63a63b, 1)
    g.fillRect(0, 0, WORLD_W, WORLD_H)

    g.fillStyle(0x7ec850, 1)
    for (let i = 0; i < 40; i++) {
      const x = Phaser.Math.Between(0, WORLD_W)
      const y = Phaser.Math.Between(0, WORLD_H)
      const r = Phaser.Math.Between(40, 120)
      g.fillCircle(x, y, r)
    }

    g.lineStyle(8, 0x3c6b1e, 1)
    g.strokeRect(4, 4, WORLD_W - 8, WORLD_H - 8)

    const tee = this.add.graphics()
    tee.fillStyle(0x529132, 1)
    tee.fillCircle(this.start.x, this.start.y, 60)
    tee.lineStyle(3, 0x3c6b1e, 0.6)
    tee.strokeCircle(this.start.x, this.start.y, 60)

    const green = this.add.graphics()
    green.fillStyle(0x8ee65b, 1)
    green.fillCircle(this.holePos.x, this.holePos.y, 130)
    green.lineStyle(4, 0x529132, 0.7)
    green.strokeCircle(this.holePos.x, this.holePos.y, 130)
  }

  private createHole(): void {
    this.hole = this.add.circle(this.holePos.x, this.holePos.y, HOLE_RADIUS, 0x1a1a1a)
    this.hole.setStrokeStyle(4, 0x0a0a0a)

    this.add.circle(
      this.holePos.x,
      this.holePos.y,
      HOLE_RADIUS + 6,
      0xffffff,
      0
    ).setStrokeStyle(3, 0xffd700, 0.8)

    const flag = this.add.graphics()
    flag.fillStyle(0xffffff, 1)
    flag.fillRect(this.holePos.x - 2, this.holePos.y - 140, 4, 120)
    flag.fillStyle(0xff3b3b, 1)
    flag.fillTriangle(
      this.holePos.x + 2, this.holePos.y - 140,
      this.holePos.x + 2, this.holePos.y - 100,
      this.holePos.x + 60, this.holePos.y - 120
    )

    this.holeSensor = this.matter.add.image(this.holePos.x, this.holePos.y, undefined, undefined, {
      isSensor: true,
      isStatic: true,
      circleRadius: HOLE_RADIUS
    } as Phaser.Types.Physics.Matter.MatterBodyConfig)
    this.holeSensor.setVisible(false)
  }

  private createBall(): void {
    const ballGfx = this.add.circle(0, 0, BALL_RADIUS, 0xffffff)
    ballGfx.setStrokeStyle(2, 0xaaaaaa)

    this.ball = this.matter.add.image(this.start.x, this.start.y, undefined, undefined, {
      shape: { type: 'circle', radius: BALL_RADIUS },
      restitution: BALL_RESTITUTION,
      friction: FRICTION,
      frictionAir: 0.01,
      density: 0.002
    } as Phaser.Types.Physics.Matter.MatterBodyConfig)

    this.ball.setVisible(false)
    this.ballGfx = ballGfx

    this.ball.setOnCollide(() => {
      if (!this.rolling) return
    })
  }

  private ballGfx!: Phaser.GameObjects.Arc

  private createCharacter(): void {
    const c = this.add.container(this.start.x - 60, this.start.y - 30)

    const body = this.add.circle(0, 0, 26, 0xf7d46b)
    body.setStrokeStyle(3, 0x4e2e0e)

    const hat = this.add.triangle(0, -28, -18, 0, 18, 0, 0, -18, 0xffffff)
    hat.setStrokeStyle(2, 0x4e2e0e)

    const eyeL = this.add.circle(-8, -4, 3, 0x000000)
    const eyeR = this.add.circle(8, -4, 3, 0x000000)

    const club = this.add.rectangle(28, 10, 4, 50, 0x8b4513)
    club.setOrigin(0.5, 1)
    club.setRotation(0.4)

    c.add([body, hat, eyeL, eyeR, club])
    this.character = c
  }

  private createUI(): void {
    this.hud = this.add.text(20, 20, '', {
      fontFamily: 'monospace',
      fontSize: '22px',
      color: '#ffffff',
      backgroundColor: '#1a1a1a',
      padding: { x: 16, y: 10 }
    })
    this.hud.setScrollFactor(0)
    this.hud.setDepth(1000)
    this.updateHUD()

    this.aimLine = this.add.graphics()
    this.aimLine.setDepth(100)

    this.powerBar = this.add.graphics()
    this.powerBar.setScrollFactor(0)
    this.powerBar.setDepth(1000)
  }

  private setupInput(): void {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.rolling || this.inHole) return
      this.charging = true
      this.power = 0
    })

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.rolling || this.inHole) return
      const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y)
      const dx = worldPoint.x - this.ball.x
      const dy = worldPoint.y - this.ball.y
      this.aimAngle = Math.atan2(dy, dx)
    })

    this.input.on('pointerup', () => {
      if (this.charging && !this.rolling && !this.inHole) {
        this.shoot()
      }
      this.charging = false
    })
  }

  private shoot(): void {
    if (this.power < 0.05) {
      this.power = 0
      return
    }
    this.strokes++
    this.updateHUD()

    const speed = this.power * MAX_POWER
    const vx = Math.cos(this.aimAngle) * speed
    const vy = Math.sin(this.aimAngle) * speed
    this.ball.setVelocity(vx, vy)
    this.rolling = true
    this.power = 0

    this.tweens.add({
      targets: this.character,
      scaleX: 1.1,
      scaleY: 0.9,
      yoyo: true,
      duration: 120
    })
  }

  private completeHole(): void {
    if (this.inHole) return
    this.inHole = true
    this.ball.setVelocity(0, 0)
    this.ball.setStatic(true)
    this.ball.setPosition(this.holePos.x, this.holePos.y)
    this.ballGfx.setPosition(this.holePos.x, this.holePos.y)
    this.ballGfx.setScale(0.4)
    this.ballGfx.setAlpha(0.3)

    const diff = this.strokes - this.par
    let label = 'PAR'
    if (this.strokes === 1) label = 'HOLE IN ONE!'
    else if (diff <= -2) label = 'EAGLE!'
    else if (diff === -1) label = 'BIRDIE!'
    else if (diff === 1) label = 'BOGEY'
    else if (diff >= 2) label = 'DOUBLE BOGEY+'

    const overlay = this.add.text(
      this.cameras.main.midPoint.x,
      this.cameras.main.midPoint.y,
      label,
      {
        fontFamily: 'monospace',
        fontSize: '64px',
        color: '#ffd700',
        stroke: '#1a1a1a',
        strokeThickness: 8
      }
    )
    overlay.setOrigin(0.5)
    overlay.setScrollFactor(0)
    overlay.setDepth(2000)

    this.tweens.add({
      targets: overlay,
      scale: { from: 0.5, to: 1.2 },
      duration: 400,
      ease: 'Back.easeOut'
    })

    this.time.delayedCall(2400, () => {
      this.scene.restart()
    })
  }

  private updateHUD(): void {
    this.hud.setText([
      `HOLE 1     PAR ${this.par}`,
      `STROKES ${this.strokes}`
    ].join('\n'))
  }

  update(): void {
    if (this.ballGfx && this.ball) {
      this.ballGfx.setPosition(this.ball.x, this.ball.y)
    }

    // character stays at start — only the ball moves

    if (this.charging) {
      this.power = Math.min(1, this.power + 0.02)
    }

    if (this.aimLine) {
      this.aimLine.clear()
      if (!this.rolling && !this.inHole) {
        this.aimLine.lineStyle(3, 0xffe066, 0.9)
        const len = 80 + this.power * 240
        const x2 = this.ball.x + Math.cos(this.aimAngle) * len
        const y2 = this.ball.y + Math.sin(this.aimAngle) * len
        this.aimLine.lineBetween(this.ball.x, this.ball.y, x2, y2)

        this.aimLine.fillStyle(0xffe066, 0.9)
        this.aimLine.fillCircle(x2, y2, 6)
      }
    }

    if (this.powerBar) {
      this.powerBar.clear()
      if (!this.rolling && !this.inHole) {
        const cam = this.cameras.main
        const barW = 240
        const barH = 20
        const barX = cam.width / 2 - barW / 2
        const barY = cam.height - 50

        this.powerBar.fillStyle(0x1a1a1a, 0.8)
        this.powerBar.fillRect(barX, barY, barW, barH)
        this.powerBar.lineStyle(2, 0xffffff, 0.6)
        this.powerBar.strokeRect(barX, barY, barW, barH)

        const fillColor = this.power > 0.75 ? 0xff3b3b : this.power > 0.4 ? 0xffa500 : 0x39ff14
        this.powerBar.fillStyle(fillColor, 1)
        this.powerBar.fillRect(barX + 2, barY + 2, (barW - 4) * this.power, barH - 4)
      }
    }

    if (this.rolling && this.ball.body) {
      const body = this.ball.body as MatterJS.BodyType
      const speed = Math.hypot(body.velocity.x, body.velocity.y)
      if (speed < MIN_SPEED) {
        this.ball.setVelocity(0, 0)
        this.rolling = false
      }
    }
  }
}
