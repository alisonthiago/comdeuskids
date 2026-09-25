export type GameStage = 1 | 2 | 3 | 4 | 5

export interface Platform {
  x: number
  y: number
  w: number
  h: number
  type: 'ground' | 'bridge' | 'rock' | 'floating'
}

export interface Collectible {
  id: string
  x: number
  y: number
  type: 'star' | 'wool_clue' | 'heart'
  collected: boolean
  bobOffset: number
}

export interface Checkpoint {
  id: string
  x: number
  y: number
  reached: boolean
}

export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
}
