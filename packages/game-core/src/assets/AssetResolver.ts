import { GameAsset, AssetQuery, ResolveResult, ResolveMatchQuality } from './types'

export class AssetResolver {
  private assets: GameAsset[] = []
  private tagIndex: Map<string, GameAsset[]> = new Map()
  private typeIndex: Map<string, GameAsset[]> = new Map()

  constructor(assets: GameAsset[] = []) {
    this.setAssets(assets)
  }

  public setAssets(assets: GameAsset[]) {
    this.assets = assets
    this.tagIndex.clear()
    this.typeIndex.clear()

    assets.forEach(asset => {
      // Indexar por Tipo
      const typeList = this.typeIndex.get(asset.type) || []
      typeList.push(asset)
      this.typeIndex.set(asset.type, typeList)

      // Indexar por Tags
      asset.tags.forEach(tag => {
        const tagList = this.tagIndex.get(tag) || []
        tagList.push(asset)
        this.tagIndex.set(tag, tagList)
      })
    })
  }

  /**
   * Avalia a pontuação de compatibilidade entre um asset e os critérios buscados.
   * Pontuação de 0 a 100.
   */
  public scoreCompatibility(asset: GameAsset, query: AssetQuery): { score: number; reasons: string[] } {
    let score = 0
    const reasons: string[] = []

    // 1. Tipo (Peso: 35 pts)
    if (query.type) {
      if (asset.type === query.type) {
        score += 35
        reasons.push(`Tipo idêntico (${asset.type})`)
      } else if (
        (query.type === 'building' && asset.type === 'prop') ||
        (query.type === 'platform' && asset.type === 'tile') ||
        (query.type === 'ui' && asset.type === 'hud')
      ) {
        score += 20
        reasons.push(`Tipo compatível (${asset.type} para ${query.type})`)
      } else {
        return { score: 0, reasons: ['Tipo incompatível'] }
      }
    }

    // 2. Tags Semânticas (Peso: 40 pts)
    if (query.tags && query.tags.length > 0) {
      let matchedTags = 0
      query.tags.forEach(t => {
        if (asset.tags.includes(t)) {
          matchedTags++
          reasons.push(`Tag correspondente: '${t}'`)
        }
      })
      const tagRatio = matchedTags / query.tags.length
      score += Math.round(tagRatio * 40)
    } else {
      score += 20
    }

    // 3. Estilo Visual (Peso: 25 pts)
    if (query.visualStyle) {
      if (asset.visualStyle === query.visualStyle) {
        score += 25
        reasons.push(`Estilo visual consistente (${asset.visualStyle})`)
      } else {
        // Penalidade severa para misturar 3D com Pixel Art sem intenção
        const isTarget3D = query.visualStyle.startsWith('3d')
        const isAsset3D = asset.visualStyle.startsWith('3d')
        if (isTarget3D !== isAsset3D) {
          score -= 30
          reasons.push(`Penalidade: Incompatibilidade de dimensão (2D vs 3D)`)
        } else {
          score += 8
          reasons.push(`Estilo aproximado (${asset.visualStyle} para ${query.visualStyle})`)
        }
      }
    } else {
      score += 15
    }

    return { score: Math.max(0, Math.min(100, score)), reasons }
  }

  /**
   * Resolve e retorna o melhor asset para uma query
   */
  public resolveAsset(query: AssetQuery): ResolveResult | null {
    const results = this.findAssets(query)
    return results.length > 0 ? results[0] : null
  }

  /**
   * Busca e ranqueia todos os assets compatíveis para uma query
   */
  public findAssets(query: AssetQuery): ResolveResult[] {
    const candidatePool = query.type ? this.typeIndex.get(query.type) || [] : this.assets
    const scoredList: ResolveResult[] = []

    for (const asset of candidatePool) {
      const { score, reasons } = this.scoreCompatibility(asset, query)
      if (score >= 35) {
        let quality: ResolveMatchQuality = 'ADAPTABLE'
        if (score >= 85) quality = 'EXACT_MATCH'
        else if (score >= 65) quality = 'GOOD_MATCH'
        else if (score < 45) quality = 'NOT_RECOMMENDED'

        scoredList.push({
          asset,
          score,
          quality,
          matchReasons: reasons
        })
      }
    }

    // Ordenar decrescente pela pontuação de compatibilidade
    scoredList.sort((a, b) => b.score - a.score)

    if (query.limit && query.limit > 0) {
      return scoredList.slice(0, query.limit)
    }

    return scoredList
  }
}
