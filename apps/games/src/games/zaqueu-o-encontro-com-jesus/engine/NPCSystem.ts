import * as THREE from 'three'
import { audioManager } from '@comdeuskids/game-core'

interface NPC {
  group: THREE.Group
  head: THREE.Object3D
  leftArm: THREE.Object3D
  rightArm: THREE.Object3D
  leftLeg: THREE.Object3D
  rightLeg: THREE.Object3D
  isWalking: boolean
  startPos: THREE.Vector3
  targetPos: THREE.Vector3
  speed: number
  walkProgress: number
}

interface Sheep {
  group: THREE.Group
  head: THREE.Object3D
  soundTimer: number
}

export class NPCSystem {
  public scene: THREE.Scene
  private npcs: NPC[] = []
  private sheeps: Sheep[] = []

  constructor(scene: THREE.Scene) {
    this.scene = scene
    this.spawnTownspeople()
    this.spawnMarketAnimals()
  }

  // Cria moradores de Jericó com roupas antigas
  private spawnTownspeople() {
    const robeColors = [0xe2e8f0, 0x94a3b8, 0x1e3a8a, 0x854d0e, 0x065f46]
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xdeb887 })

    const createResident = (x: number, z: number, robeColor: number, isWalking = false, targetZ = z) => {
      const npcGroup = new THREE.Group()
      const robeMat = new THREE.MeshLambertMaterial({ color: robeColor })
      const turbanMat = new THREE.MeshLambertMaterial({ color: 0xfafafa })

      // Tronco e Túnica
      const bodyGeo = new THREE.CylinderGeometry(0.3, 0.42, 1.2, 10)
      const body = new THREE.Mesh(bodyGeo, robeMat)
      body.position.y = 0.85
      body.castShadow = true
      npcGroup.add(body)

      // Cabeça e Turbante
      const headGroup = new THREE.Group()
      headGroup.position.set(0, 1.55, 0)
      const headGeo = new THREE.SphereGeometry(0.2, 10, 10)
      const head = new THREE.Mesh(headGeo, skinMat)
      headGroup.add(head)

      const turbanGeo = new THREE.SphereGeometry(0.23, 10, 10, 0, Math.PI * 2, 0, Math.PI * 0.7)
      const turban = new THREE.Mesh(turbanGeo, turbanMat)
      turban.position.set(0, 0.05, 0)
      headGroup.add(turban)
      npcGroup.add(headGroup)

      // Braços
      const armGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.5, 6)
      const leftArm = new THREE.Mesh(armGeo, robeMat)
      leftArm.position.set(0.36, 1.25, 0)
      const rightArm = new THREE.Mesh(armGeo, robeMat)
      rightArm.position.set(-0.36, 1.25, 0)
      npcGroup.add(leftArm, rightArm)

      // Pernas
      const legGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.4, 6)
      const leftLeg = new THREE.Mesh(legGeo, skinMat)
      leftLeg.position.set(0.14, 0.2, 0)
      const rightLeg = new THREE.Mesh(legGeo, skinMat)
      rightLeg.position.set(-0.14, 0.2, 0)
      npcGroup.add(leftLeg, rightLeg)

      npcGroup.position.set(x, 0, z)
      this.scene.add(npcGroup)

      this.npcs.push({
        group: npcGroup,
        head: headGroup,
        leftArm,
        rightArm,
        leftLeg,
        rightLeg,
        isWalking,
        startPos: new THREE.Vector3(x, 0, z),
        targetPos: new THREE.Vector3(x, 0, targetZ),
        speed: 0.8 + Math.random() * 0.4,
        walkProgress: Math.random()
      })
    }

    // 1. Vendedor organizando barraca vermelha
    createResident(-3.2, -19.5, robeColors[3], false)

    // 2. Dois moradores conversando perto da fonte
    createResident(3.2, -8.5, robeColors[0], false)
    createResident(3.8, -9.0, robeColors[2], false)

    // 3. Morador caminhando pela calçada em direção à praça
    createResident(-2.2, -30, robeColors[1], true, -5)

    // 4. Morador descendo a rua
    createResident(2.4, 15, robeColors[4], true, -15)

    // 5. Criança de Jericó correndo
    createResident(-2.0, 5, robeColors[0], true, 28)
  }

  // Cria animais do mercado (ovelhas com som espacial 3D)
  private spawnMarketAnimals() {
    const woolMat = new THREE.MeshLambertMaterial({ color: 0xf5f5f4 })
    const blackMat = new THREE.MeshLambertMaterial({ color: 0x27272a })

    const createSheep = (x: number, z: number, rotY = 0) => {
      const sheepGroup = new THREE.Group()

      // Corpo lanoso
      const bodyGeo = new THREE.SphereGeometry(0.45, 10, 10)
      const body = new THREE.Mesh(bodyGeo, woolMat)
      body.scale.set(1.2, 0.9, 0.9)
      body.position.y = 0.55
      body.castShadow = true
      sheepGroup.add(body)

      // Cabeça negra/castanha
      const headGroup = new THREE.Group()
      headGroup.position.set(0.48, 0.7, 0)
      const headGeo = new THREE.SphereGeometry(0.18, 8, 8)
      const head = new THREE.Mesh(headGeo, blackMat)
      headGroup.add(head)

      // Orelhinhas caídas
      const earGeo = new THREE.BoxGeometry(0.06, 0.14, 0.05)
      const ear1 = new THREE.Mesh(earGeo, blackMat)
      ear1.position.set(0, 0.05, 0.16)
      ear1.rotation.x = 0.4
      const ear2 = new THREE.Mesh(earGeo, blackMat)
      ear2.position.set(0, 0.05, -0.16)
      ear2.rotation.x = -0.4
      headGroup.add(ear1, ear2)
      sheepGroup.add(headGroup)

      // 4 Patas
      const legGeo = new THREE.CylinderGeometry(0.05, 0.04, 0.4, 6)
      const positions = [
        [-0.25, 0.2, -0.2],
        [-0.25, 0.2, 0.2],
        [0.25, 0.2, -0.2],
        [0.25, 0.2, 0.2]
      ]
      positions.forEach(([px, py, pz]) => {
        const leg = new THREE.Mesh(legGeo, blackMat)
        leg.position.set(px, py, pz)
        sheepGroup.add(leg)
      })

      sheepGroup.position.set(x, 0, z)
      sheepGroup.rotation.y = rotY
      this.scene.add(sheepGroup)

      this.sheeps.push({
        group: sheepGroup,
        head: headGroup,
        soundTimer: 3 + Math.random() * 5
      })
    }

    // Ovelhinhas no cercado do mercado à direita
    createSheep(3.6, -18, -Math.PI / 2)
    createSheep(4.2, -19.5, -Math.PI / 3)
  }

  // Atualização de movimentação e reações aos passos de Zaqueu
  public update(delta: number, playerPos: THREE.Vector3) {
    const time = performance.now() * 0.001

    // 1. Atualizar NPCs
    this.npcs.forEach(npc => {
      const distToPlayer = npc.group.position.distanceTo(playerPos)

      // Olhar para Zaqueu quando ele passa perto (até 4 metros)
      if (distToPlayer < 4.0) {
        const lookVector = playerPos.clone().sub(npc.group.position)
        const angle = Math.atan2(lookVector.x, lookVector.z) - npc.group.rotation.y
        npc.head.rotation.y = THREE.MathUtils.clamp(angle, -0.8, 0.8)
      } else {
        npc.head.rotation.y = THREE.MathUtils.lerp(npc.head.rotation.y, 0, delta * 3)
      }

      // Caminhada de ida e volta para NPCs patrulheiros
      if (npc.isWalking) {
        npc.walkProgress += (delta * npc.speed) / npc.startPos.distanceTo(npc.targetPos)
        if (npc.walkProgress > 1) {
          npc.walkProgress = 0
          // Inverter direção
          const temp = npc.startPos.clone()
          npc.startPos.copy(npc.targetPos)
          npc.targetPos.copy(temp)
          npc.group.rotation.y += Math.PI
        }

        npc.group.position.lerpVectors(npc.startPos, npc.targetPos, npc.walkProgress)

        // Animação de pernas e braços
        const walkCycle = Math.sin(time * 6 * npc.speed)
        npc.leftLeg.rotation.x = walkCycle * 0.4
        npc.rightLeg.rotation.x = -walkCycle * 0.4
        npc.leftArm.rotation.x = -walkCycle * 0.4
        npc.rightArm.rotation.x = walkCycle * 0.4
      } else {
        // Gesto sutil de conversa/organização de barraca
        npc.leftArm.rotation.x = Math.sin(time * 2) * 0.15
        npc.rightArm.rotation.x = Math.cos(time * 2) * 0.15
      }
    })

    // 2. Atualizar Ovelhas e Som Espacial 3D
    this.sheeps.forEach(sheep => {
      // Leve mastigação / respiração
      sheep.head.position.y = 0.7 + Math.sin(time * 3) * 0.03

      sheep.soundTimer -= delta
      if (sheep.soundTimer <= 0) {
        sheep.soundTimer = 7 + Math.random() * 8

        const dist = sheep.group.position.distanceTo(playerPos)
        // Dispara balido posicional 3D se Zaqueu estiver a até 18 metros
        if (dist < 18) {
          audioManager.playSFX('sheep_baa', {
            x: sheep.group.position.x,
            y: sheep.group.position.y + 0.6,
            z: sheep.group.position.z
          })
        }
      }
    })
  }
}
