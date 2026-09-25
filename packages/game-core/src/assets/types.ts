/**
 * Com Deus Kids — Tipos Oficiais da Biblioteca e Catálogo Inteligente de Assets
 */

export type AssetType =
  | 'character'
  | 'animal'
  | 'building'
  | 'environment'
  | 'vegetation'
  | 'platform'
  | 'tile'
  | 'background'
  | 'prop'
  | 'collectible'
  | 'weapon'
  | 'vehicle'
  | 'ui'
  | 'hud'
  | 'effect'
  | 'audio'
  | '3d-model'

export type VisualStyle =
  | 'cartoon-2d'
  | 'pixel-art'
  | 'vector-flat'
  | 'hand-drawn'
  | '3d-lowpoly'
  | '3d-stylized'
  | 'painted'

export type ResolveMatchQuality =
  | 'EXACT_MATCH'
  | 'GOOD_MATCH'
  | 'ADAPTABLE'
  | 'NOT_RECOMMENDED'

export interface GameAsset {
  id: string
  name: string
  sourcePack: string
  sourcePath: string
  isInZip: boolean
  zipArchive?: string | null
  format: string
  type: AssetType
  subtype: string
  visualStyle: VisualStyle
  tags: string[]
  license: string
  attributionRequired: boolean
  sizeBytes?: number
}

export interface AssetQuery {
  type?: AssetType
  tags?: string[]
  visualStyle?: VisualStyle
  format?: string
  is3D?: boolean
  limit?: number
}

export interface ResolveResult {
  asset: GameAsset
  score: number // 0 a 100
  quality: ResolveMatchQuality
  matchReasons: string[]
}

export interface GameRequirementItem {
  key: string
  type: AssetType
  tags: string[]
  isMandatory?: boolean
}

export interface GameAssetPlannerInput {
  gameId: string
  title: string
  genre:
    | 'platformer'
    | 'adventure'
    | 'runner'
    | 'puzzle'
    | 'memory'
    | 'maze'
    | '3d-adventure'
  preferredStyle: VisualStyle
  requirements: GameRequirementItem[]
}

export interface GameAssetPlan {
  gameId: string
  title: string
  genre: string
  preferredStyle: VisualStyle
  found: {
    key: string
    asset: GameAsset
    quality: ResolveMatchQuality
    score: number
  }[]
  missing: {
    key: string
    type: AssetType
    tags: string[]
    reason: string
  }[]
  readinessPercentage: number
  licensesRequired: string[]
}
