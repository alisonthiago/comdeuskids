import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { ParticleSystem } from './ParticleSystem'
import { audioManager } from '@comdeuskids/game-core'

export type ZaqueuAnimationState =
  | 'idle'
  | 'walk'
  | 'run'
  | 'jump'
  | 'fall'
  | 'land'
  | 'climb'
  | 'interact'
  | 'victory'

export class ZaqueuCharacter {
  public mesh: THREE.Group
  private particleSystem: ParticleSystem

  // Motor GLTF e Animações Rigged
  private gltfModel: THREE.Group | null = null
  private mixer: THREE.AnimationMixer | null = null
  private animationActions: Map<ZaqueuAnimationState, THREE.AnimationAction> = new Map()
  private currentAction: THREE.AnimationAction | null = null
  public currentState: ZaqueuAnimationState = 'idle'

  // Malha fallback estilizada enquanto o GLB é carregado
  private fallbackGroup: THREE.Group
  private headGroup: THREE.Group
  private leftArmGroup: THREE.Group
  private rightArmGroup: THREE.Group
  private leftLegGroup: THREE.Group
  private rightLegGroup: THREE.Group
  private tunicSkirt: THREE.Mesh

  // Física e movimento
  public velocity = new THREE.Vector3()
  public isGrounded = true
  public isRunning = false
  public isMoving = false
  public currentSpeed = 0
  private walkSpeed = 3.6
  private runSpeed = 6.2
  private jumpForce = 6.8
  private gravity = 18.0

  // Animação procedural / contadores
  private animTimer = 0
  private footstepTimer = 0

  constructor(particleSystem: ParticleSystem) {
    this.particleSystem = particleSystem
    this.mesh = new THREE.Group()

    // 1. Grupo do modelo fallback esculpido conforme o Character Sheet
    this.fallbackGroup = new THREE.Group()
    this.mesh.add(this.fallbackGroup)

    this.headGroup = new THREE.Group()
    this.leftArmGroup = new THREE.Group()
    this.rightArmGroup = new THREE.Group()
    this.leftLegGroup = new THREE.Group()
    this.rightLegGroup = new THREE.Group()
    this.tunicSkirt = new THREE.Mesh()

    this.buildSculptedFallback()

    // 2. Tentar carregar o modelo GLB profissional se existir na pasta de assets
    this.loadGLTFModel('/assets/zaqueu/zaqueu.glb')
  }

  // Tenta carregar o GLB rigged com animações
  public loadGLTFModel(url: string) {
    const loader = new GLTFLoader()
    loader.load(
      url,
      (gltf) => {
        console.log('✅ Modelo 3D GLB de Zaqueu carregado com sucesso!', gltf)
        // Oculta o fallback e adiciona o modelo GLB
        this.fallbackGroup.visible = false

        if (this.gltfModel) {
          this.mesh.remove(this.gltfModel)
        }

        this.gltfModel = gltf.scene
        this.gltfModel.scale.set(1.0, 1.0, 1.0)
        this.gltfModel.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true
            child.receiveShadow = true
          }
        })
        this.mesh.add(this.gltfModel)

        // Configurar AnimationMixer se tiver animações
        if (gltf.animations && gltf.animations.length > 0) {
          this.mixer = new THREE.AnimationMixer(this.gltfModel)

          gltf.animations.forEach((clip) => {
            const name = clip.name.toLowerCase()
            const action = this.mixer!.clipAction(clip)

            if (name.includes('idle') || name.includes('parado')) {
              this.animationActions.set('idle', action)
            } else if (name.includes('run') || name.includes('corre')) {
              this.animationActions.set('run', action)
            } else if (name.includes('walk') || name.includes('anda')) {
              this.animationActions.set('walk', action)
            } else if (name.includes('jump') || name.includes('pula')) {
              this.animationActions.set('jump', action)
            } else if (name.includes('climb') || name.includes('sobe')) {
              this.animationActions.set('climb', action)
            } else if (name.includes('interact') || name.includes('acao')) {
              this.animationActions.set('interact', action)
            } else if (name.includes('victory') || name.includes('vence')) {
              this.animationActions.set('victory', action)
            }
          })

          this.playAnimation('idle')
        }
      },
      undefined,
      (err) => {
        // Se ainda não existir o arquivo zaqueu.glb na pasta, usa o fallback esculpido sem interromper o jogo
        console.info('Aguardando inserção de zaqueu.glb em public/assets/zaqueu/ (usando modelo esculpido temporário).', err)
      }
    )
  }

  // Transição suave entre animações do GLB
  public playAnimation(state: ZaqueuAnimationState) {
    if (this.currentState === state && this.currentAction) return
    this.currentState = state

    if (!this.mixer) return

    const targetAction = this.animationActions.get(state) || this.animationActions.get('idle')
    if (!targetAction) return

    if (this.currentAction) {
      this.currentAction.crossFadeTo(targetAction, 0.25, true)
    }
    targetAction.reset().play()
    this.currentAction = targetAction
  }

  // Constrói a anatomia esculpida do personagem conforme o Character Sheet
  private buildSculptedFallback() {
    // Paleta oficial: Amarelo claro, Verde folha, Couro marrom, Pele calorosa, Cabelo/Barba preta
    const robeLightYellowMat = new THREE.MeshLambertMaterial({ color: 0xfef08a }) // Túnica amarela clara
    const vestGreenMat = new THREE.MeshLambertMaterial({ color: 0x16a34a }) // Sobretúnica / Colete verde
    const headclothGreenMat = new THREE.MeshLambertMaterial({ color: 0x15803d }) // Tecido sobre a cabeça
    const headbandGoldMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b }) // Faixa dourada
    const skinToneMat = new THREE.MeshLambertMaterial({ color: 0xd4a373 }) // Pele morena
    const hairDarkMat = new THREE.MeshLambertMaterial({ color: 0x1c1917 }) // Cabelo e barba preta
    const leatherBrownMat = new THREE.MeshLambertMaterial({ color: 0x78350f }) // Cinto, bolsa e sandálias
    const whiteLiningMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc }) // Gola/forro

    // 1. Corpo Compacto e Túnica Amarela Clara
    const innerTunicGeo = new THREE.CylinderGeometry(0.32, 0.38, 0.7, 14)
    const innerTunic = new THREE.Mesh(innerTunicGeo, robeLightYellowMat)
    innerTunic.position.y = 0.95
    innerTunic.castShadow = true
    this.fallbackGroup.add(innerTunic)

    // Sobretúnica / Colete Verde
    const vestGeo = new THREE.CylinderGeometry(0.35, 0.39, 0.62, 14, 1, true, 0, Math.PI * 1.8)
    const vest = new THREE.Mesh(vestGeo, vestGreenMat)
    vest.position.set(0, 0.96, 0)
    vest.rotation.y = -Math.PI * 0.9
    vest.castShadow = true
    this.fallbackGroup.add(vest)

    // Detalhe de gola branca
    const collarGeo = new THREE.TorusGeometry(0.22, 0.04, 8, 16)
    const collar = new THREE.Mesh(collarGeo, whiteLiningMat)
    collar.rotation.x = Math.PI / 2
    collar.position.set(0, 1.28, 0)
    this.fallbackGroup.add(collar)

    // Cinto marrom com fivela
    const beltGeo = new THREE.TorusGeometry(0.37, 0.05, 8, 16)
    const belt = new THREE.Mesh(beltGeo, leatherBrownMat)
    belt.rotation.x = Math.PI / 2
    belt.position.set(0, 0.8, 0)
    this.fallbackGroup.add(belt)

    // Saia da túnica amarela clara com pregas
    const skirtGeo = new THREE.ConeGeometry(0.48, 0.58, 14, 1, true)
    this.tunicSkirt = new THREE.Mesh(skirtGeo, robeLightYellowMat)
    this.tunicSkirt.position.set(0, 0.6, 0)
    this.tunicSkirt.castShadow = true
    this.fallbackGroup.add(this.tunicSkirt)

    // Bolsa transversal marrom
    const bagGeo = new THREE.BoxGeometry(0.2, 0.18, 0.1)
    const bag = new THREE.Mesh(bagGeo, leatherBrownMat)
    bag.position.set(0.34, 0.74, 0.14)
    bag.rotation.z = -0.15
    this.fallbackGroup.add(bag)

    // Faixa diagonal da bolsa
    const strapGeo = new THREE.TorusGeometry(0.4, 0.03, 6, 16)
    const strap = new THREE.Mesh(strapGeo, leatherBrownMat)
    strap.rotation.y = Math.PI / 4
    strap.rotation.x = 0.4
    strap.position.set(0, 0.96, 0)
    this.fallbackGroup.add(strap)

    // 2. Cabeça Expressiva com Rosto Modelado (Character Sheet)
    this.headGroup = new THREE.Group()
    this.headGroup.position.set(0, 1.46, 0)
    this.fallbackGroup.add(this.headGroup)

    // Rosto esculpido
    const headGeo = new THREE.SphereGeometry(0.26, 18, 18)
    const head = new THREE.Mesh(headGeo, skinToneMat)
    head.castShadow = true
    this.headGroup.add(head)

    // Nariz arredondado
    const noseGeo = new THREE.SphereGeometry(0.05, 8, 8)
    const nose = new THREE.Mesh(noseGeo, skinToneMat)
    nose.position.set(0, 0.02, 0.26)
    this.headGroup.add(nose)

    // Olhos castanhos grandes e expressivos
    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x271c19 })
    const eyeWhiteGeo = new THREE.SphereGeometry(0.06, 10, 10)
    const pupilGeo = new THREE.SphereGeometry(0.035, 8, 8)

    // Olho Esquerdo
    const leftEyeWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat)
    leftEyeWhite.position.set(0.09, 0.06, 0.22)
    const leftPupil = new THREE.Mesh(pupilGeo, pupilMat)
    leftPupil.position.set(0.09, 0.06, 0.26)

    // Olho Direito
    const rightEyeWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat)
    rightEyeWhite.position.set(-0.09, 0.06, 0.22)
    const rightPupil = new THREE.Mesh(pupilGeo, pupilMat)
    rightPupil.position.set(-0.09, 0.06, 0.26)
    this.headGroup.add(leftEyeWhite, leftPupil, rightEyeWhite, rightPupil)

    // Sobrancelhas pretas amigáveis
    const browGeo = new THREE.BoxGeometry(0.09, 0.025, 0.02)
    const leftBrow = new THREE.Mesh(browGeo, hairDarkMat)
    leftBrow.position.set(0.09, 0.13, 0.24)
    leftBrow.rotation.z = -0.15
    const rightBrow = new THREE.Mesh(browGeo, hairDarkMat)
    rightBrow.position.set(-0.09, 0.13, 0.24)
    rightBrow.rotation.z = 0.15
    this.headGroup.add(leftBrow, rightBrow)

    // Sorriso alegre
    const smileGeo = new THREE.TorusGeometry(0.07, 0.02, 6, 12, Math.PI)
    const smile = new THREE.Mesh(smileGeo, hairDarkMat)
    smile.rotation.x = Math.PI
    smile.position.set(0, -0.06, 0.24)
    this.headGroup.add(smile)

    // Barba preta modelada de Zaqueu
    const beardGeo = new THREE.CylinderGeometry(0.18, 0.24, 0.24, 12)
    const beard = new THREE.Mesh(beardGeo, hairDarkMat)
    beard.position.set(0, -0.13, 0.08)
    beard.rotation.x = 0.2
    this.headGroup.add(beard)

    // Turbante / Tecido Verde sobre a cabeça
    const turbanGeo = new THREE.SphereGeometry(0.28, 18, 18, 0, Math.PI * 2, 0, Math.PI * 0.7)
    const turban = new THREE.Mesh(turbanGeo, headclothGreenMat)
    turban.position.set(0, 0.06, 0)
    this.headGroup.add(turban)

    // Caimento do véu verde atrás dos ombros
    const drapeGeo = new THREE.CylinderGeometry(0.26, 0.35, 0.45, 12, 1, true, 0, Math.PI)
    const drape = new THREE.Mesh(drapeGeo, headclothGreenMat)
    drape.rotation.y = -Math.PI / 2
    drape.position.set(0, -0.06, -0.08)
    this.headGroup.add(drape)

    // Faixa amarela/dourada na cabeça
    const headbandGeo = new THREE.TorusGeometry(0.27, 0.04, 8, 18)
    const headband = new THREE.Mesh(headbandGeo, headbandGoldMat)
    headband.rotation.x = Math.PI / 2
    headband.position.set(0, 0.08, 0)
    this.headGroup.add(headband)

    // 3. Braços com mangas verdes e punhos amarelos
    const armGeo = new THREE.CylinderGeometry(0.09, 0.07, 0.46, 8)
    const handGeo = new THREE.SphereGeometry(0.08, 8, 8)

    // Braço Esquerdo
    this.leftArmGroup = new THREE.Group()
    this.leftArmGroup.position.set(0.39, 1.2, 0)
    const leftArmMesh = new THREE.Mesh(armGeo, vestGreenMat)
    leftArmMesh.position.y = -0.22
    leftArmMesh.castShadow = true
    const leftHand = new THREE.Mesh(handGeo, skinToneMat)
    leftHand.position.y = -0.46
    this.leftArmGroup.add(leftArmMesh, leftHand)
    this.fallbackGroup.add(this.leftArmGroup)

    // Braço Direito
    this.rightArmGroup = new THREE.Group()
    this.rightArmGroup.position.set(-0.39, 1.2, 0)
    const rightArmMesh = new THREE.Mesh(armGeo, vestGreenMat)
    rightArmMesh.position.y = -0.22
    rightArmMesh.castShadow = true
    const rightHand = new THREE.Mesh(handGeo, skinToneMat)
    rightHand.position.y = -0.46
    this.rightArmGroup.add(rightArmMesh, rightHand)
    this.fallbackGroup.add(this.rightArmGroup)

    // 4. Pernas e Sandálias com tiras de couro
    const legGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.46, 8)
    const sandalSoleGeo = new THREE.BoxGeometry(0.14, 0.05, 0.24)
    const strapBandGeo = new THREE.TorusGeometry(0.08, 0.02, 6, 12)

    // Perna Esquerda
    this.leftLegGroup = new THREE.Group()
    this.leftLegGroup.position.set(0.17, 0.45, 0)
    const leftLegMesh = new THREE.Mesh(legGeo, skinToneMat)
    leftLegMesh.position.y = -0.22
    const leftSandal = new THREE.Mesh(sandalSoleGeo, leatherBrownMat)
    leftSandal.position.set(0, -0.44, 0.04)
    const leftStrap = new THREE.Mesh(strapBandGeo, leatherBrownMat)
    leftStrap.rotation.x = Math.PI / 2
    leftStrap.position.set(0, -0.38, 0.04)
    this.leftLegGroup.add(leftLegMesh, leftSandal, leftStrap)
    this.mesh.add(this.leftLegGroup)

    // Perna Direita
    this.rightLegGroup = new THREE.Group()
    this.rightLegGroup.position.set(-0.17, 0.45, 0)
    const rightLegMesh = new THREE.Mesh(legGeo, skinToneMat)
    rightLegMesh.position.y = -0.22
    const rightSandal = new THREE.Mesh(sandalSoleGeo, leatherBrownMat)
    rightSandal.position.set(0, -0.44, 0.04)
    const rightStrap = new THREE.Mesh(strapBandGeo, leatherBrownMat)
    rightStrap.rotation.x = Math.PI / 2
    rightStrap.position.set(0, -0.38, 0.04)
    this.rightLegGroup.add(rightLegMesh, rightSandal, rightStrap)
    this.mesh.add(this.rightLegGroup)

    // Sombra suave aos pés
    const shadowGeo = new THREE.CircleGeometry(0.44, 16)
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.35
    })
    const shadow = new THREE.Mesh(shadowGeo, shadowMat)
    shadow.rotation.x = -Math.PI / 2
    shadow.position.y = 0.02
    this.mesh.add(shadow)
  }

  public jump() {
    if (!this.isGrounded) return
    this.velocity.y = this.jumpForce
    this.isGrounded = false
    audioManager.playSFX('jump')
    this.particleSystem.emitDust(this.mesh.position, 6, 0.4)
    this.playAnimation('jump')
  }

  public move(dirX: number, dirZ: number, isRunning: boolean, cameraTheta: number, delta: number) {
    const hasInput = Math.abs(dirX) > 0.05 || Math.abs(dirZ) > 0.05
    this.isMoving = hasInput
    this.isRunning = isRunning && hasInput

    if (hasInput) {
      const angle = Math.atan2(dirX, dirZ) + cameraTheta
      const targetSpeed = this.isRunning ? this.runSpeed : this.walkSpeed
      this.currentSpeed = THREE.MathUtils.lerp(this.currentSpeed, targetSpeed, delta * 10)

      this.velocity.x = Math.sin(angle) * this.currentSpeed
      this.velocity.z = Math.cos(angle) * this.currentSpeed

      // Rotação suave do personagem na direção da caminhada
      const currentRotation = this.mesh.rotation.y
      const diff = Math.atan2(Math.sin(angle - currentRotation), Math.cos(angle - currentRotation))
      this.mesh.rotation.y += diff * Math.min(1, delta * 14)

      // Som e partículas
      this.footstepTimer += delta * (this.isRunning ? 2.4 : 1.5)
      if (this.footstepTimer >= 0.5) {
        this.footstepTimer = 0
        if (this.isGrounded) {
          const soundType = Math.random() > 0.4 ? 'footstep_dirt' : 'footstep_stone'
          audioManager.playSFX(soundType)

          if (this.isRunning) {
            this.particleSystem.emitDust(this.mesh.position, 2, 0.15)
          }
        }
      }

      if (this.isGrounded) {
        this.playAnimation(this.isRunning ? 'run' : 'walk')
      }
    } else {
      this.currentSpeed = THREE.MathUtils.lerp(this.currentSpeed, 0, delta * 12)
      this.velocity.x = 0
      this.velocity.z = 0

      if (this.isGrounded) {
        this.playAnimation('idle')
      }
    }
  }

  public update(delta: number, collisionCheck?: (nextPos: THREE.Vector3) => boolean) {
    // 1. Atualizar AnimationMixer do GLB se ativo
    if (this.mixer) {
      this.mixer.update(delta)
    }

    // 2. Gravidade
    if (!this.isGrounded) {
      this.velocity.y -= this.gravity * delta
      if (this.velocity.y < 0) {
        this.playAnimation('fall')
      }
    }

    // 3. Posição calculada com colisão
    const nextPos = this.mesh.position.clone()
    nextPos.x += this.velocity.x * delta
    nextPos.z += this.velocity.z * delta

    if (!collisionCheck || !collisionCheck(nextPos)) {
      this.mesh.position.x = nextPos.x
      this.mesh.position.z = nextPos.z
    } else {
      this.currentSpeed = 0
    }

    // 4. Movimento Vertical e contato com o solo
    this.mesh.position.y += this.velocity.y * delta

    if (this.mesh.position.y <= 0) {
      this.mesh.position.y = 0
      if (!this.isGrounded) {
        this.isGrounded = true
        audioManager.playSFX('land')
        this.particleSystem.emitDust(this.mesh.position, 5, 0.3)
        this.playAnimation(this.isMoving ? (this.isRunning ? 'run' : 'walk') : 'idle')
      }
      this.velocity.y = 0
    }

    // 5. Atualizar ouvinte de áudio 3D
    audioManager.updateListenerPosition(
      this.mesh.position.x,
      this.mesh.position.y + 1.4,
      this.mesh.position.z,
      Math.sin(this.mesh.rotation.y),
      0,
      Math.cos(this.mesh.rotation.y)
    )

    // 6. Animação Procedural (usada quando o modelo fallback está ativo)
    if (!this.gltfModel) {
      this.animTimer += delta * (this.isMoving ? (this.isRunning ? 14 : 9) : 3)

      if (!this.isGrounded) {
        this.leftLegGroup.rotation.x = 0.5
        this.rightLegGroup.rotation.x = 0.3
        this.leftArmGroup.rotation.x = -1.2
        this.rightArmGroup.rotation.x = -1.2
        this.fallbackGroup.position.y = 0.05
      } else if (this.isMoving) {
        const stride = Math.sin(this.animTimer)
        const armSwing = Math.cos(this.animTimer)

        this.leftLegGroup.rotation.x = stride * (this.isRunning ? 0.9 : 0.6)
        this.rightLegGroup.rotation.x = -stride * (this.isRunning ? 0.9 : 0.6)

        this.leftArmGroup.rotation.x = -armSwing * (this.isRunning ? 1.0 : 0.6)
        this.rightArmGroup.rotation.x = armSwing * (this.isRunning ? 1.0 : 0.6)

        this.fallbackGroup.rotation.z = Math.sin(this.animTimer) * 0.06
        this.fallbackGroup.rotation.x = this.isRunning ? 0.18 : 0.05
        this.fallbackGroup.position.y = Math.abs(Math.sin(this.animTimer * 2)) * 0.06

        this.tunicSkirt.rotation.x = Math.sin(this.animTimer) * 0.15 + (this.isRunning ? 0.2 : 0)
      } else {
        const breath = Math.sin(this.animTimer) * 0.03
        this.fallbackGroup.position.y = breath
        this.leftLegGroup.rotation.x = 0
        this.rightLegGroup.rotation.x = 0
        this.leftArmGroup.rotation.x = 0.1
        this.rightArmGroup.rotation.x = 0.1
        this.fallbackGroup.rotation.x = 0
        this.fallbackGroup.rotation.z = 0
        this.tunicSkirt.rotation.x = 0
      }
    }
  }
}
