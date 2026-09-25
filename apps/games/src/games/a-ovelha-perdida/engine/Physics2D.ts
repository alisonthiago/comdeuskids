import { Platform, Collectible, Checkpoint } from '../types'

export interface Entity2D {
  x: number
  y: number
  vx: number
  vy: number
  w: number
  h: number
  isGrounded: boolean
  facingRight: boolean
}

const GRAVITY = 1100
const MAX_FALL_SPEED = 700

export class Physics2D {
  public static updatePlayer(
    player: Entity2D,
    inputX: number,
    isRunning: boolean,
    jumpRequested: boolean,
    platforms: Platform[],
    delta: number
  ): { jumped: boolean; landed: boolean } {
    let jumped = false
    let landed = false

    // 1. Movimentação Horizontal
    const baseSpeed = isRunning ? 280 : 180
    const targetVx = inputX * baseSpeed
    const accel = player.isGrounded ? 12 : 6
    player.vx += (targetVx - player.vx) * Math.min(1, delta * accel)

    if (Math.abs(inputX) > 0.05) {
      player.facingRight = inputX > 0
    }

    // 2. Pulo
    if (jumpRequested && player.isGrounded) {
      player.vy = -540
      player.isGrounded = false
      jumped = true
    }

    // 3. Gravidade
    player.vy = Math.min(MAX_FALL_SPEED, player.vy + GRAVITY * delta)

    // 4. Integração de Posição
    const nextX = player.x + player.vx * delta
    const nextY = player.y + player.vy * delta

    // 5. Colisão Horizontal (Limites do Mundo)
    player.x = Math.max(20, Math.min(4580, nextX))

    // 6. Colisão Vertical com Plataformas
    const wasGrounded = player.isGrounded
    player.isGrounded = false
    player.y = nextY

    for (const p of platforms) {
      // Checar se os pés do jogador cruzaram o topo da plataforma descendo
      const feetY = player.y + player.h
      const prevFeetY = feetY - player.vy * delta

      const overlapsX = player.x + player.w > p.x + 8 && player.x < p.x + p.w - 8

      if (overlapsX && player.vy >= 0 && prevFeetY <= p.y + 12 && feetY >= p.y) {
        player.y = p.y - player.h
        player.vy = 0
        player.isGrounded = true
        if (!wasGrounded) landed = true
        break
      }
    }

    // Limite inferior do mundo (queda no abismo)
    if (player.y > 750) {
      player.y = 520
      player.vy = 0
      player.isGrounded = true
    }

    return { jumped, landed }
  }

  public static updateSheepFollower(
    sheep: Entity2D,
    target: Entity2D,
    platforms: Platform[],
    delta: number
  ) {
    // Seguir o pastor mantendo uma distância segura de 50px
    const targetDist = 55
    const targetX = target.facingRight ? target.x - targetDist : target.x + targetDist
    const dx = targetX - sheep.x

    sheep.facingRight = target.x > sheep.x

    if (Math.abs(dx) > 15) {
      const followSpeed = Math.min(260, Math.abs(dx) * 4)
      sheep.vx += ((dx > 0 ? followSpeed : -followSpeed) - sheep.vx) * Math.min(1, delta * 8)
    } else {
      sheep.vx += (0 - sheep.vx) * Math.min(1, delta * 10)
    }

    // Pular se o alvo estiver bem mais alto ou se encontrar obstáculo
    if (sheep.isGrounded && target.y < sheep.y - 40 && Math.abs(dx) < 120) {
      sheep.vy = -480
      sheep.isGrounded = false
    }

    // Gravidade
    sheep.vy = Math.min(MAX_FALL_SPEED, sheep.vy + GRAVITY * delta)

    sheep.x += sheep.vx * delta
    sheep.y += sheep.vy * delta

    // Colisão vertical com plataformas
    sheep.isGrounded = false
    for (const p of platforms) {
      const feetY = sheep.y + sheep.h
      const prevFeetY = feetY - sheep.vy * delta
      const overlapsX = sheep.x + sheep.w > p.x + 6 && sheep.x < p.x + p.w - 6

      if (overlapsX && sheep.vy >= 0 && prevFeetY <= p.y + 12 && feetY >= p.y) {
        sheep.y = p.y - sheep.h
        sheep.vy = 0
        sheep.isGrounded = true
        break
      }
    }
  }

  public static checkCollectibleOverlap(player: Entity2D, item: Collectible): boolean {
    if (item.collected) return false
    return (
      player.x < item.x + 32 &&
      player.x + player.w > item.x &&
      player.y < item.y + 32 &&
      player.y + player.h > item.y
    )
  }

  public static checkCheckpointOverlap(player: Entity2D, cp: Checkpoint): boolean {
    return Math.abs(player.x - cp.x) < 50 && Math.abs(player.y - cp.y) < 80
  }
}
