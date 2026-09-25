import { AssetResolver } from './AssetResolver'
import { GameAssetPlannerInput, GameAssetPlan } from './types'

export class GameAssetPlanner {
  private resolver: AssetResolver

  constructor(resolver: AssetResolver) {
    this.resolver = resolver
  }

  /**
   * Planeja o conjunto de assets necessários para um novo jogo bíblico,
   * cruzando com o catálogo e indicando o que foi ENCONTRADO e o que está FALTANDO.
   */
  public planGameAssets(input: GameAssetPlannerInput): GameAssetPlan {
    const found: GameAssetPlan['found'] = []
    const missing: GameAssetPlan['missing'] = []
    const licensesSet = new Set<string>()

    input.requirements.forEach(req => {
      const match = this.resolver.resolveAsset({
        type: req.type,
        tags: req.tags,
        visualStyle: input.preferredStyle
      })

      if (match && match.score >= 40) {
        found.push({
          key: req.key,
          asset: match.asset,
          quality: match.quality,
          score: match.score
        })
        if (match.asset.license) {
          licensesSet.add(match.asset.license)
        }
      } else {
        missing.push({
          key: req.key,
          type: req.type,
          tags: req.tags,
          reason: match ? `Baixa pontuação de compatibilidade (${match.score} pts)` : 'Nenhum asset encontrado no acervo com esses critérios'
        })
      }
    })

    const totalReqs = input.requirements.length
    const readinessPercentage = totalReqs > 0 ? Math.round((found.length / totalReqs) * 100) : 0

    return {
      gameId: input.gameId,
      title: input.title,
      genre: input.genre,
      preferredStyle: input.preferredStyle,
      found,
      missing,
      readinessPercentage,
      licensesRequired: Array.from(licensesSet)
    }
  }
}
