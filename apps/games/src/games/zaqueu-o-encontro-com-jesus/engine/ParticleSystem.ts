import * as THREE from 'three'

interface Particle {
  mesh: THREE.Mesh
  velocity: THREE.Vector3
  life: number
  maxLife: number
  scaleRate: number
}

export class ParticleSystem {
  public group = new THREE.Group()
  private particles: Particle[] = []
  private dustGeo = new THREE.SphereGeometry(0.12, 6, 6)
  private dustMat = new THREE.MeshBasicMaterial({
    color: 0xdeb887,
    transparent: true,
    opacity: 0.6
  })

  constructor(scene: THREE.Scene) {
    scene.add(this.group)
  }

  // Emite nuvem de poeira nos pés ao correr ou aterrissar
  public emitDust(position: THREE.Vector3, count = 4, spread = 0.25) {
    for (let i = 0; i < count; i++) {
      const pMesh = new THREE.Mesh(this.dustGeo, this.dustMat.clone())
      pMesh.position.copy(position)
      pMesh.position.x += (Math.random() - 0.5) * spread
      pMesh.position.y += Math.random() * 0.1
      pMesh.position.z += (Math.random() - 0.5) * spread

      const scale = 0.5 + Math.random() * 0.7
      pMesh.scale.set(scale, scale, scale)

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 0.8,
        0.5 + Math.random() * 0.8,
        (Math.random() - 0.5) * 0.8
      )

      this.group.add(pMesh)
      this.particles.push({
        mesh: pMesh,
        velocity: vel,
        life: 0,
        maxLife: 0.35 + Math.random() * 0.25,
        scaleRate: 1.5
      })
    }
  }

  public update(delta: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]
      p.life += delta
      if (p.life >= p.maxLife) {
        this.group.remove(p.mesh)
        p.mesh.geometry.dispose()
        ;(p.mesh.material as THREE.Material).dispose()
        this.particles.splice(i, 1)
        continue
      }

      const progress = p.life / p.maxLife
      p.mesh.position.addScaledVector(p.velocity, delta)
      const scale = (1 + progress * p.scaleRate)
      p.mesh.scale.set(scale, scale, scale)
      ;(p.mesh.material as THREE.MeshBasicMaterial).opacity = 0.6 * (1 - progress)
    }
  }

  public destroy() {
    this.particles.forEach(p => {
      this.group.remove(p.mesh)
      p.mesh.geometry.dispose()
      ;(p.mesh.material as THREE.Material).dispose()
    })
    this.particles = []
  }
}
