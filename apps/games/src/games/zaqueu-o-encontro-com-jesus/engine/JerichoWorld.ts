import * as THREE from 'three'
import { audioManager } from '@comdeuskids/game-core'

export interface CollectibleStar {
  mesh: THREE.Group
  position: THREE.Vector3
  collected: boolean
}

export class JerichoWorld {
  public scene: THREE.Scene
  public colliders: THREE.Box3[] = []
  public stars: CollectibleStar[] = []
  private animatedStars: THREE.Group[] = []
  private palmLeaves: THREE.Group[] = []

  constructor(scene: THREE.Scene) {
    this.scene = scene
    this.buildLightingAndSky()
    this.buildTerrain()
    this.buildCityWallsAndHouses()
    this.buildMarketplace()
    this.buildVegetation()
    this.spawnCollectibleStars()
  }

  // 1. Iluminação Mediterrânea Dourada e Céu de Jericó
  private buildLightingAndSky() {
    this.scene.background = new THREE.Color(0x90c2e7) // Céu azul ensolarado com degradê quente
    this.scene.fog = new THREE.FogExp2(0xe2be8a, 0.015) // Névoa quente dourada

    // Luz Solar Direcional (Sombra quente)
    const sunLight = new THREE.DirectionalLight(0xfff3d1, 1.8)
    sunLight.position.set(30, 45, 25)
    sunLight.castShadow = true
    sunLight.shadow.mapSize.width = 2048
    sunLight.shadow.mapSize.height = 2048
    sunLight.shadow.camera.near = 0.5
    sunLight.shadow.camera.far = 120
    sunLight.shadow.camera.left = -40
    sunLight.shadow.camera.right = 40
    sunLight.shadow.camera.top = 40
    sunLight.shadow.camera.bottom = -40
    sunLight.shadow.bias = -0.0005
    this.scene.add(sunLight)

    // Luz Ambiente de rebatimento da areia
    const ambientLight = new THREE.AmbientLight(0xfcd34d, 0.75)
    this.scene.add(ambientLight)

    // Hemisphere light (Céu azul suave acima, solo ocre abaixo)
    const hemiLight = new THREE.HemisphereLight(0xbbe1fa, 0xd4a373, 0.6)
    this.scene.add(hemiLight)
  }

  // 2. Terreno de Areia e Calçadas de Pedra
  private buildTerrain() {
    // Chão geral de terra batida/areia
    const groundGeo = new THREE.PlaneGeometry(160, 160)
    const groundMat = new THREE.MeshLambertMaterial({ color: 0xd9b382 }) // Areia calorosa
    const ground = new THREE.Mesh(groundGeo, groundMat)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    this.scene.add(ground)

    // Rua Principal pavimentada de pedras (calçada até a praça)
    const roadGeo = new THREE.PlaneGeometry(8, 90)
    const roadMat = new THREE.MeshLambertMaterial({ color: 0xbfa079 }) // Pedra talhada clara
    const road = new THREE.Mesh(roadGeo, roadMat)
    road.rotation.x = -Math.PI / 2
    road.position.set(0, 0.02, 0)
    road.receiveShadow = true
    this.scene.add(road)

    // Lajes de pedra decorativas espalhadas pelo caminho
    const stoneSlabGeo = new THREE.BoxGeometry(1.6, 0.04, 1.2)
    const stoneMat = new THREE.MeshLambertMaterial({ color: 0xa88a65 })

    for (let z = -40; z <= 40; z += 3.5) {
      const slab = new THREE.Mesh(stoneSlabGeo, stoneMat)
      slab.position.set((Math.random() - 0.5) * 3, 0.03, z + (Math.random() - 0.5) * 1.5)
      slab.rotation.y = (Math.random() - 0.5) * 0.2
      slab.receiveShadow = true
      this.scene.add(slab)
    }

    // Montanhas da Judeia ao longe no horizonte
    const mountainMat = new THREE.MeshLambertMaterial({ color: 0xb58e65 })
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2
      const radius = 70 + Math.random() * 10
      const mountainGeo = new THREE.ConeGeometry(18 + Math.random() * 8, 25 + Math.random() * 12, 6)
      const mountain = new THREE.Mesh(mountainGeo, mountainMat)
      mountain.position.set(Math.cos(angle) * radius, 10, Math.sin(angle) * radius)
      this.scene.add(mountain)
    }
  }

  // 3. Casas de Pedra e Muralhas de Jericó
  private buildCityWallsAndHouses() {
    const wallStoneMat = new THREE.MeshLambertMaterial({ color: 0xd6ad7b })
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x5c3a21 })
    const doorMat = new THREE.MeshLambertMaterial({ color: 0x422a18 })

    // Função auxiliar para construir uma casa bíblica de Jericó
    const createJerichoHouse = (x: number, z: number, width: number, height: number, depth: number) => {
      const houseGroup = new THREE.Group()

      // Corpo da casa
      const bodyGeo = new THREE.BoxGeometry(width, height, depth)
      const body = new THREE.Mesh(bodyGeo, wallStoneMat)
      body.position.y = height / 2
      body.castShadow = true
      body.receiveShadow = true
      houseGroup.add(body)

      // Parapeito do terraço plano
      const parapetGeo = new THREE.BoxGeometry(width + 0.2, 0.4, depth + 0.2)
      const parapet = new THREE.Mesh(parapetGeo, wallStoneMat)
      parapet.position.y = height + 0.2
      parapet.castShadow = true
      houseGroup.add(parapet)

      // Vigas de madeira aparentes nos tetos
      for (let i = -width / 2 + 0.6; i <= width / 2 - 0.6; i += 1.2) {
        const beamGeo = new THREE.CylinderGeometry(0.08, 0.08, depth + 0.6, 6)
        const beam = new THREE.Mesh(beamGeo, woodMat)
        beam.rotation.x = Math.PI / 2
        beam.position.set(i, height - 0.3, 0)
        houseGroup.add(beam)
      }

      // Porta de madeira
      const doorGeo = new THREE.BoxGeometry(1.2, 2.0, 0.1)
      const door = new THREE.Mesh(doorGeo, doorMat)
      door.position.set(0, 1.0, depth / 2 + 0.05)
      houseGroup.add(door)

      // Janelas pequenas típicas de Jericó (recuo da luz)
      const windowGeo = new THREE.BoxGeometry(0.8, 0.8, 0.1)
      const windowMesh = new THREE.Mesh(windowGeo, doorMat)
      windowMesh.position.set(width * 0.25, height * 0.7, depth / 2 + 0.05)
      houseGroup.add(windowMesh)

      houseGroup.position.set(x, 0, z)
      this.scene.add(houseGroup)

      // Adicionar colisor
      const box = new THREE.Box3().setFromObject(houseGroup)
      this.colliders.push(box)
    }

    // Linha de Casas à Esquerda da Rua
    createJerichoHouse(-8, -30, 6, 5, 8)
    createJerichoHouse(-9, -18, 7, 6, 8)
    createJerichoHouse(-8.5, -4, 6, 5.5, 9)
    createJerichoHouse(-9, 12, 7, 7, 8)
    createJerichoHouse(-8, 26, 6, 5, 8)

    // Linha de Casas à Direita da Rua
    createJerichoHouse(8, -28, 6, 5.5, 8)
    createJerichoHouse(9, -15, 7, 5, 8)
    createJerichoHouse(8.5, 0, 6, 6.5, 9)
    createJerichoHouse(9, 16, 7, 5.5, 8)
    createJerichoHouse(8, 30, 6, 6, 8)

    // Muralhas no fundo da cidade (Praça de Jericó)
    const wallGeo = new THREE.BoxGeometry(50, 8, 3)
    const northWall = new THREE.Mesh(wallGeo, wallStoneMat)
    northWall.position.set(0, 4, -48)
    northWall.castShadow = true
    this.scene.add(northWall)
    this.colliders.push(new THREE.Box3().setFromObject(northWall))

    // Torres de vigia nas extremidades
    const towerGeo = new THREE.CylinderGeometry(3.5, 4, 11, 10)
    const tower1 = new THREE.Mesh(towerGeo, wallStoneMat)
    tower1.position.set(-25, 5.5, -48)
    const tower2 = new THREE.Mesh(towerGeo, wallStoneMat)
    tower2.position.set(25, 5.5, -48)
    this.scene.add(tower1, tower2)
    this.colliders.push(new THREE.Box3().setFromObject(tower1))
    this.colliders.push(new THREE.Box3().setFromObject(tower2))
  }

  // 4. Mercado de Jericó (Barracas, Toldos Listrados, Vasos, Cestos e Caixas)
  private buildMarketplace() {
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x6d4c41 })
    const potClayMat = new THREE.MeshLambertMaterial({ color: 0xb8623b }) // Terracota cerâmica
    const fabricRedMat = new THREE.MeshLambertMaterial({ color: 0xbe123c })
    const fabricBlueMat = new THREE.MeshLambertMaterial({ color: 0x1d4ed8 })
    const fabricGoldMat = new THREE.MeshLambertMaterial({ color: 0xd97706 })

    const createStall = (x: number, z: number, canopyColor: THREE.Material, rotation = 0) => {
      const stall = new THREE.Group()

      // Mesa / Balcão de madeira
      const tableGeo = new THREE.BoxGeometry(3.2, 0.9, 1.4)
      const table = new THREE.Mesh(tableGeo, woodMat)
      table.position.y = 0.45
      table.castShadow = true
      stall.add(table)

      // Postes de sustentação do toldo
      const poleGeo = new THREE.CylinderGeometry(0.05, 0.05, 2.6, 6)
      const p1 = new THREE.Mesh(poleGeo, woodMat)
      p1.position.set(-1.4, 1.3, -0.6)
      const p2 = new THREE.Mesh(poleGeo, woodMat)
      p2.position.set(1.4, 1.3, -0.6)
      const p3 = new THREE.Mesh(poleGeo, woodMat)
      p3.position.set(-1.4, 1.3, 0.6)
      const p4 = new THREE.Mesh(poleGeo, woodMat)
      p4.position.set(1.4, 1.3, 0.6)
      stall.add(p1, p2, p3, p4)

      // Toldo de tecido inclinado
      const canopyGeo = new THREE.BoxGeometry(3.6, 0.08, 2.0)
      const canopy = new THREE.Mesh(canopyGeo, canopyColor)
      canopy.position.set(0, 2.5, 0)
      canopy.rotation.x = 0.12
      canopy.castShadow = true
      stall.add(canopy)

      // Vasos de barro no balcão e no chão
      const potGeo = new THREE.CylinderGeometry(0.18, 0.28, 0.5, 10)
      const pot1 = new THREE.Mesh(potGeo, potClayMat)
      pot1.position.set(-0.8, 1.15, 0)
      const pot2 = new THREE.Mesh(potGeo, potClayMat)
      pot2.position.set(0.6, 1.15, -0.2)
      stall.add(pot1, pot2)

      stall.position.set(x, 0, z)
      stall.rotation.y = rotation
      this.scene.add(stall)

      this.colliders.push(new THREE.Box3().setFromObject(stall))
    }

    // Barracas ao longo da rua
    createStall(-4.5, -20, fabricRedMat, 0.3)
    createStall(4.6, -10, fabricBlueMat, -0.25)
    createStall(-4.6, 2, fabricGoldMat, 0.2)
    createStall(4.5, 18, fabricRedMat, -0.15)

    // Grupo de Vasos e Ânforas no canto da calçada
    const jarGeo = new THREE.SphereGeometry(0.4, 10, 10)
    const jarMat = new THREE.MeshLambertMaterial({ color: 0x9a3412 })
    for (let i = 0; i < 6; i++) {
      const jar = new THREE.Mesh(jarGeo, jarMat)
      jar.position.set(
        -3.8 + (Math.random() - 0.5) * 0.8,
        0.35,
        -14 + (Math.random() - 0.5) * 1.5
      )
      jar.castShadow = true
      this.scene.add(jar)
    }

    // Caixas de madeira
    const crateGeo = new THREE.BoxGeometry(0.7, 0.7, 0.7)
    const c1 = new THREE.Mesh(crateGeo, woodMat)
    c1.position.set(3.8, 0.35, -2)
    c1.rotation.y = 0.3
    const c2 = new THREE.Mesh(crateGeo, woodMat)
    c2.position.set(3.8, 1.05, -2)
    c2.rotation.y = 0.45
    this.scene.add(c1, c2)
  }

  // 5. Vegetação: Palmeiras e a Grande Figueira Brava (Sicômoro de Zaqueu)
  private buildVegetation() {
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x785338 })
    const leafMat = new THREE.MeshLambertMaterial({ color: 0x2d6a4f })

    // Função de Palmeira
    const createPalmTree = (x: number, z: number, height = 7) => {
      const palm = new THREE.Group()

      // Tronco curvado
      const trunkGeo = new THREE.CylinderGeometry(0.25, 0.4, height, 8)
      const trunk = new THREE.Mesh(trunkGeo, trunkMat)
      trunk.position.y = height / 2
      trunk.rotation.z = (Math.random() - 0.5) * 0.1
      trunk.castShadow = true
      palm.add(trunk)

      // Copas e folhas de palmeira
      const leavesGroup = new THREE.Group()
      leavesGroup.position.y = height
      for (let i = 0; i < 8; i++) {
        const leafAngle = (i / 8) * Math.PI * 2
        const leafGeo = new THREE.BoxGeometry(0.4, 0.05, 3.0)
        const leaf = new THREE.Mesh(leafGeo, leafMat)
        leaf.position.set(
          Math.sin(leafAngle) * 1.3,
          -0.4,
          Math.cos(leafAngle) * 1.3
        )
        leaf.rotation.y = leafAngle
        leaf.rotation.x = 0.35
        leavesGroup.add(leaf)
      }
      palm.add(leavesGroup)
      this.palmLeaves.push(leavesGroup)

      palm.position.set(x, 0, z)
      this.scene.add(palm)

      // Colisor do tronco
      const box = new THREE.Box3().setFromCenterAndSize(
        new THREE.Vector3(x, height / 2, z),
        new THREE.Vector3(0.8, height, 0.8)
      )
      this.colliders.push(box)
    }

    // Palmeiras espalhadas pelas esquinas e praça
    createPalmTree(-6, -26, 7.5)
    createPalmTree(6.5, -22, 6.8)
    createPalmTree(-5.8, 10, 8.0)
    createPalmTree(6.2, 8, 7.2)
    createPalmTree(-7, 34, 7.5)
    createPalmTree(7, 36, 8.2)

    // A GRANDE FIGUEIRA BRAVA (Árvore de Zaqueu na praça de Jericó)
    const bigTree = new THREE.Group()
    const bigTrunkGeo = new THREE.CylinderGeometry(1.2, 1.8, 8, 10)
    const bigTrunk = new THREE.Mesh(bigTrunkGeo, trunkMat)
    bigTrunk.position.y = 4
    bigTrunk.castShadow = true
    bigTree.add(bigTrunk)

    // Grandes galhos resistentes
    const branchGeo = new THREE.CylinderGeometry(0.4, 0.6, 4.5, 8)
    const b1 = new THREE.Mesh(branchGeo, trunkMat)
    b1.position.set(1.5, 6, 0.8)
    b1.rotation.z = -0.7
    const b2 = new THREE.Mesh(branchGeo, trunkMat)
    b2.position.set(-1.6, 5.5, -0.6)
    b2.rotation.z = 0.8
    bigTree.add(b1, b2)

    // Copa densa e frondosa
    const foliageMat = new THREE.MeshLambertMaterial({ color: 0x386641 })
    const foliageGeo = new THREE.SphereGeometry(4.5, 12, 12)
    const foliage = new THREE.Mesh(foliageGeo, foliageMat)
    foliage.position.y = 8.5
    foliage.castShadow = true
    bigTree.add(foliage)

    bigTree.position.set(0, 0, 42) // Fim do trajeto na praça
    this.scene.add(bigTree)

    const bigTreeBox = new THREE.Box3().setFromCenterAndSize(
      new THREE.Vector3(0, 4, 42),
      new THREE.Vector3(3.5, 8, 3.5)
    )
    this.colliders.push(bigTreeBox)
  }

  // 6. Estrelas Colecionáveis de Exploração
  private spawnCollectibleStars() {
    const starGeo = new THREE.OctahedronGeometry(0.35)
    const starMat = new THREE.MeshBasicMaterial({ color: 0xffd700 })

    const starPositions = [
      new THREE.Vector3(0, 1.2, -35),
      new THREE.Vector3(-3.8, 1.2, -18),
      new THREE.Vector3(3.8, 1.2, -5),
      new THREE.Vector3(-3.5, 1.2, 12),
      new THREE.Vector3(0, 1.2, 28)
    ]

    starPositions.forEach(pos => {
      const starGroup = new THREE.Group()
      const mesh = new THREE.Mesh(starGeo, starMat)
      mesh.castShadow = true
      starGroup.add(mesh)

      // Brilho luminoso ao redor
      const glowGeo = new THREE.SphereGeometry(0.5, 8, 8)
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0xffea00,
        transparent: true,
        opacity: 0.35,
        wireframe: true
      })
      const glow = new THREE.Mesh(glowGeo, glowMat)
      starGroup.add(glow)

      starGroup.position.copy(pos)
      this.scene.add(starGroup)

      this.stars.push({
        mesh: starGroup,
        position: pos,
        collected: false
      })
      this.animatedStars.push(starGroup)
    })
  }

  // Verifica colisão com todas as paredes, casas e barracas
  public checkCollision(pos: THREE.Vector3, radius = 0.5): boolean {
    const playerBox = new THREE.Box3().setFromCenterAndSize(
      new THREE.Vector3(pos.x, 1, pos.z),
      new THREE.Vector3(radius * 2, 2, radius * 2)
    )

    for (let i = 0; i < this.colliders.length; i++) {
      if (this.colliders[i].intersectsBox(playerBox)) {
        return true
      }
    }

    // Limites externos do mapa
    if (Math.abs(pos.x) > 16 || pos.z < -45 || pos.z > 48) {
      return true
    }

    return false
  }

  // Atualiza animação das estrelas e do vento nas folhas
  public update(time: number, delta: number, playerPos: THREE.Vector3, onCollectStar?: () => void) {
    // Rotação suave e flutuação das estrelas
    this.animatedStars.forEach((star, idx) => {
      const starData = this.stars[idx]
      if (starData.collected) return

      star.rotation.y += delta * 2.5
      star.position.y = starData.position.y + Math.sin(time * 3 + idx) * 0.15

      // Verificação de coleta pelo Zaqueu
      const dist = playerPos.distanceTo(star.position)
      if (dist < 1.4) {
        starData.collected = true
        star.visible = false
        audioManager.playSFX('collect')
        if (onCollectStar) onCollectStar()
      }
    })

    // Balanço sutil do vento nas folhas das palmeiras
    this.palmLeaves.forEach((leaves, idx) => {
      leaves.rotation.z = Math.sin(time * 1.5 + idx) * 0.04
    })
  }
}
