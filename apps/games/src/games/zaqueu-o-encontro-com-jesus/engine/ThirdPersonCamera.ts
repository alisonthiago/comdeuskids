import * as THREE from 'three'

export class ThirdPersonCamera {
  public camera: THREE.PerspectiveCamera
  private target: THREE.Object3D
  private currentPosition = new THREE.Vector3()
  private currentLookAt = new THREE.Vector3()

  // Ângulos de rotação da câmera (órbita)
  public theta = 0 // Rotação horizontal (radianos)
  public phi = 0.35 // Rotação vertical (radianos)
  public distance = 5.2
  public heightOffset = 1.6

  constructor(camera: THREE.PerspectiveCamera, target: THREE.Object3D) {
    this.camera = camera
    this.target = target
    this.currentPosition.copy(camera.position)
    this.currentLookAt.copy(target.position)
  }

  // Permite girar a câmera com mouse ou touch
  public rotate(deltaX: number, deltaY: number) {
    const sensitivity = 0.003
    this.theta -= deltaX * sensitivity
    this.phi += deltaY * sensitivity

    // Limites verticais para a câmera não entrar no chão nem ficar de cabeça para baixo
    this.phi = Math.max(0.08, Math.min(1.2, this.phi))
  }

  public update(delta: number) {
    if (!this.target) return

    // Ponto onde Zaqueu está (com elevação na altura do peito)
    const targetLookAt = new THREE.Vector3(
      this.target.position.x,
      this.target.position.y + this.heightOffset,
      this.target.position.z
    )

    // Posição desejada da câmera usando coordenadas esféricas relativas ao alvo
    const horizontalDistance = this.distance * Math.cos(this.phi)
    const verticalDistance = this.distance * Math.sin(this.phi)

    const offsetX = horizontalDistance * Math.sin(this.theta)
    const offsetZ = horizontalDistance * Math.cos(this.theta)

    const idealPosition = new THREE.Vector3(
      this.target.position.x + offsetX,
      this.target.position.y + this.heightOffset + verticalDistance,
      this.target.position.z + offsetZ
    )

    // Suavização da câmera (damping)
    const smoothFactor = Math.min(1, delta * 8)
    this.currentPosition.lerp(idealPosition, smoothFactor)
    this.currentLookAt.lerp(targetLookAt, smoothFactor)

    // Garantir que a câmera não atravesse o chão
    if (this.currentPosition.y < 0.6) {
      this.currentPosition.y = 0.6
    }

    this.camera.position.copy(this.currentPosition)
    this.camera.lookAt(this.currentLookAt)
  }
}
