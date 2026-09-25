# Sistema Inteligente de Assets e Jogos — Com Deus Kids

Este documento define a arquitetura, o fluxo de descoberta automática de assets, o catálogo técnico indexado e o pipeline de planejamento e desenvolvimento dos jogos bíblicos para o **Com Deus Kids**.

---

## 1. Localização e Estrutura da Biblioteca

A biblioteca master/fonte de assets está localizada em:
📂 `design-reference/games-assets/`

Ela contém:
* **74 pacotes compactados em ZIP** (Kenney Packs, KayKit 3D Packs, Tiny Swords, Medieval Village MegaKit, etc.).
* **Modelos 3D soltos (.glb / .obj)**: `cute_jesus_model.glb`, `arabe.glb`, `leao.glb`, `leao-2.glb`, `leaozinho.glb`, `cachorro.glb`, `porco.glb`, `pato.glb`, etc.
* **Spritesheets, Tilesets e Texturas**: Centenas de ambientes, vegetações, plataformas e interfaces.

> [!IMPORTANT]
> **Regra de Ouro:** A pasta `design-reference/games-assets` é **somente leitura**. Nenhum jogo copia a biblioteca inteira para dentro do código de produção. Quando um novo jogo precisa de assets, ele utiliza o **extrator sob demanda** para carregar apenas os arquivos necessários.

---

## 2. Catálogo Técnico Indexado

O catálogo indexa **18.307 assets reais** sem precisar descompactar os 74 ZIPs no disco do projeto.

* **Arquivo do Catálogo:** `packages/game-core/src/assets/catalog.json`
* **Script de Varredura:** `scripts/catalog-assets.py`
* **Campos Indexados por Asset:**
  - `id`: Identificador único do asset
  - `name`: Nome do arquivo
  - `sourcePack`: Nome do pacote ou ZIP
  - `sourcePath`: Caminho interno dentro do arquivo compactado
  - `isInZip`: Booleano indicando se reside dentro de um ZIP
  - `zipArchive`: Nome do arquivo ZIP
  - `format`: Extensão (png, glb, obj, wav, etc.)
  - `type`: Categoria semântica (`character`, `animal`, `building`, `environment`, `vegetation`, `tile`, `collectible`, `ui`, `3d-model`, etc.)
  - `visualStyle`: Estilo visual (`cartoon-2d`, `pixel-art`, `vector-flat`, `3d-lowpoly`, `3d-stylized`)
  - `tags`: Etiquetas semânticas para busca contextual (`sheep`, `lion`, `jesus`, `desert`, `village`, `biblical-compatible`, etc.)
  - `license`: Licença identificada no pacote (CC0, Itch.io Free, etc.)

---

## 3. Asset Resolver (`AssetResolver.ts`)

Camada inteligente para resolução programática de assets sem depender de seleção manual:

```typescript
import { AssetResolver } from '@comdeuskids/game-core'

const resolver = new AssetResolver(catalog.assets)

// Exemplo: Resolver uma ovelha para um jogo 2D Cartoon
const sheepResult = resolver.resolveAsset({
  type: 'animal',
  tags: ['sheep'],
  visualStyle: 'cartoon-2d'
})

console.log(sheepResult.asset.name) // -> "HappySheep_Bouncing.png"
console.log(sheepResult.quality)     // -> "EXACT_MATCH"
console.log(sheepResult.score)       // -> 85
```

### Pontuação de Compatibilidade (0 a 100):
1. **Tipo (35 pts):** Verifica se a categoria do asset confere exatamente com o pedido.
2. **Tags Semânticas (40 pts):** Mede a sobreposição de tags contextuais.
3. **Consistência Visual (25 pts):** Garante coerência estilística e aplica penalidade se misturar 2D com 3D sem intenção explícita.

---

## 4. Game Asset Planner (`AssetPlanner.ts`)

Permite planejar um novo jogo bíblico antes de escrever código, cruzando as necessidades da história com o acervo existente:

```bash
# Execução via CLI:
python3 scripts/plan-game.py a-ovelha-perdida
python3 scripts/plan-game.py davi-e-golias
python3 scripts/plan-game.py daniel-na-cova-dos-leoes
```

Saída produzida:
* **FOUND:** Lista de assets encontrados com pacote de origem e nota de compatibilidade.
* **MISSING:** O que realmente falta produzir especificamente para a narrativa bíblica.
* **Prontidão do Jogo (%):** Porcentagem dos requisitos atendidos pelo acervo.

---

## 5. Extração Sob Demanda (`extract-asset.py`)

Para evitar bundle inchado ou commits gigantescos no repositório:

```bash
python3 scripts/extract-asset.py <ASSET_ID> apps/games/public/assets/<jogo>
```

O script abre diretamente o arquivo ZIP correspondente, extrai exclusivamente o arquivo solicitado e o deposita na pasta pública do jogo correspondente.

---

## 6. Como Adicionar Novos Pacotes à Biblioteca

1. Baixe o pacote e salve em `design-reference/games-assets/` (pode ser arquivo `.zip` ou pasta descompactada).
2. Execute a varredura do catálogo:
   ```bash
   python3 scripts/catalog-assets.py
   ```
3. O catálogo `packages/game-core/src/assets/catalog.json` será atualizado automaticamente, e todas as novas peças ficarão disponíveis imediatamente para o `AssetResolver` e o `AssetPlanner`.

---

## 7. Como Criar um Novo Jogo Usando a Biblioteca

1. **Definir o Jogo:** Crie a lista de requisitos em formato JSON/TypeScript (ex: personagem, animais, terreno, HUD, itens).
2. **Planejar:** Execute o `planGameAssets()` do `GameAssetPlanner`.
3. **Extrair:** Use o `extract-asset.py` para os itens encontrados.
4. **Montar:** Conecte os assets na engine correspondente (`Platformer`, `Adventure`, `Puzzle`, `Memory`, `3D`).
