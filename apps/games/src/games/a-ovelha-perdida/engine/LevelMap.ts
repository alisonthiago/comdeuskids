import { Platform, Collectible, Checkpoint } from '../types'

export const WORLD_WIDTH = 4600
export const WORLD_HEIGHT = 800
export const GROUND_Y = 620

export function createPlatforms(): Platform[] {
  return [
    // ---------------------------------------------
    // FASE 1: A VILA (X: 0 - 800)
    // ---------------------------------------------
    { x: 0, y: GROUND_Y, w: 900, h: 400, type: 'ground' },
    { x: 260, y: GROUND_Y - 50, w: 100, h: 50, type: 'rock' },
    { x: 520, y: GROUND_Y - 80, w: 120, h: 30, type: 'floating' },

    // ---------------------------------------------
    // FASE 2: O CAMINHO E A PONTE (X: 800 - 1800)
    // ---------------------------------------------
    // Vale do riacho com a grande ponte de madeira
    { x: 920, y: GROUND_Y - 40, w: 160, h: 400, type: 'ground' },
    { x: 1080, y: GROUND_Y - 40, w: 260, h: 25, type: 'bridge' }, // Ponte sobre o riacho
    { x: 1340, y: GROUND_Y, w: 480, h: 400, type: 'ground' },
    { x: 1500, y: GROUND_Y - 80, w: 100, h: 25, type: 'floating' },
    { x: 1660, y: GROUND_Y - 140, w: 110, h: 25, type: 'floating' },

    // ---------------------------------------------
    // FASE 3: AS PISTAS DE LÃ (X: 1800 - 2800)
    // ---------------------------------------------
    { x: 1820, y: GROUND_Y, w: 380, h: 400, type: 'ground' },
    { x: 2000, y: GROUND_Y - 70, w: 120, h: 70, type: 'rock' },
    { x: 2200, y: GROUND_Y - 120, w: 140, h: 25, type: 'floating' },
    { x: 2400, y: GROUND_Y - 60, w: 130, h: 60, type: 'rock' },
    { x: 2550, y: GROUND_Y, w: 340, h: 400, type: 'ground' },

    // ---------------------------------------------
    // FASE 4: A FLORESTA DAS ROCHAS (X: 2800 - 3800)
    // ---------------------------------------------
    { x: 2890, y: GROUND_Y - 60, w: 130, h: 25, type: 'floating' },
    { x: 3080, y: GROUND_Y - 130, w: 140, h: 25, type: 'floating' },
    { x: 3240, y: GROUND_Y - 180, w: 180, h: 400, type: 'ground' }, // Checkpoint Ledge
    { x: 3460, y: GROUND_Y - 120, w: 120, h: 25, type: 'floating' },
    { x: 3620, y: GROUND_Y - 70, w: 130, h: 25, type: 'floating' },
    { x: 3770, y: GROUND_Y, w: 270, h: 400, type: 'ground' },

    // ---------------------------------------------
    // FASE 5: O CUME DA OVELHINHA (X: 3800 - 4600)
    // ---------------------------------------------
    { x: 4040, y: GROUND_Y - 80, w: 120, h: 25, type: 'floating' },
    { x: 4180, y: GROUND_Y - 150, w: 140, h: 25, type: 'floating' },
    { x: 4340, y: GROUND_Y - 210, w: 260, h: 400, type: 'ground' } // O topo onde a ovelha está!
  ]
}

export function createCollectibles(): Collectible[] {
  return [
    // Fase 1: Estrelas de incentivo
    { id: 'c1', x: 280, y: GROUND_Y - 110, type: 'star', collected: false, bobOffset: 0 },
    { id: 'c2', x: 560, y: GROUND_Y - 140, type: 'star', collected: false, bobOffset: 1 },

    // Fase 2: Estrelas na ponte e no vale
    { id: 'c3', x: 1200, y: GROUND_Y - 90, type: 'star', collected: false, bobOffset: 2 },
    { id: 'c4', x: 1550, y: GROUND_Y - 140, type: 'star', collected: false, bobOffset: 3 },
    { id: 'c5', x: 1710, y: GROUND_Y - 200, type: 'star', collected: false, bobOffset: 4 },

    // Fase 3: As 3 Pistas de Lã da Ovelha Perdida
    { id: 'clue1', x: 2050, y: GROUND_Y - 130, type: 'wool_clue', collected: false, bobOffset: 0.5 },
    { id: 'clue2', x: 2260, y: GROUND_Y - 180, type: 'wool_clue', collected: false, bobOffset: 1.5 },
    { id: 'clue3', x: 2460, y: GROUND_Y - 120, type: 'wool_clue', collected: false, bobOffset: 2.5 },

    // Fase 4: Estrelas e Coração extra na Floresta
    { id: 'c6', x: 3140, y: GROUND_Y - 190, type: 'star', collected: false, bobOffset: 3.5 },
    { id: 'c7', x: 3320, y: GROUND_Y - 240, type: 'heart', collected: false, bobOffset: 0 },
    { id: 'c8', x: 3510, y: GROUND_Y - 180, type: 'star', collected: false, bobOffset: 1 },

    // Fase 5: Estrelas douradas do cume
    { id: 'c9', x: 4240, y: GROUND_Y - 210, type: 'star', collected: false, bobOffset: 2 },
    { id: 'c10', x: 4420, y: GROUND_Y - 270, type: 'star', collected: false, bobOffset: 3 }
  ]
}

export function createCheckpoints(): Checkpoint[] {
  return [
    { id: 'cp_village', x: 120, y: GROUND_Y - 80, reached: true },
    { id: 'cp_bridge', x: 1380, y: GROUND_Y - 80, reached: false },
    { id: 'cp_clues', x: 2580, y: GROUND_Y - 80, reached: false },
    { id: 'cp_forest', x: 3300, y: GROUND_Y - 260, reached: false }
  ]
}
