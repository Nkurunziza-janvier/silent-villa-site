import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export type VillaHotspot = 'courtyard' | 'suites' | 'pool' | 'garden'
export type VillaMood = 'sunset' | 'starlight'

type VillaScene3DProps = {
  activeHotspot?: VillaHotspot
  mood?: VillaMood
  interactive?: boolean
  autoRotate?: boolean
  className?: string
}

const CAMERA_TARGETS: Record<
  VillaHotspot,
  { pos: [number, number, number]; look: [number, number, number] }
> = {
  courtyard: { pos: [7.8, 3.8, 8.6], look: [-1.2, 0.9, 0] },
  suites: { pos: [3.6, 3.0, 5.8], look: [-0.8, 1.5, -0.6] },
  pool: { pos: [-5.4, 2.8, 6.6], look: [0.4, 0.2, 1.8] },
  garden: { pos: [6.8, 5.6, -5.8], look: [0, 0.6, 0] },
}

export default function VillaScene3D({
  activeHotspot = 'courtyard',
  mood = 'sunset',
  interactive = true,
  autoRotate = true,
  className = '',
}: VillaScene3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const hotspotRef = useRef<VillaHotspot>(activeHotspot)
  const moodRef = useRef<VillaMood>(mood)

  useEffect(() => {
    hotspotRef.current = activeHotspot
  }, [activeHotspot])

  useEffect(() => {
    moodRef.current = mood
  }, [mood])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      })
    } catch {
      return
    }

    const width = container.clientWidth || window.innerWidth
    const height = container.clientHeight || window.innerHeight
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    container.innerHTML = ''
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x132019, 0.032)

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 120)
    camera.position.set(7.5, 4.3, 8.8)

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xd8c28f, 0.55)
    scene.add(ambientLight)

    const hemiLight = new THREE.HemisphereLight(0xf3dfb8, 0x18251d, 0.65)
    scene.add(hemiLight)

    const sunLight = new THREE.DirectionalLight(0xffdfa8, 1.8)
    sunLight.position.set(12, 16, 10)
    sunLight.castShadow = true
    sunLight.shadow.mapSize.width = 1024
    sunLight.shadow.mapSize.height = 1024
    sunLight.shadow.camera.near = 0.5
    sunLight.shadow.camera.far = 40
    const d = 10
    sunLight.shadow.camera.left = -d
    sunLight.shadow.camera.right = d
    sunLight.shadow.camera.top = d
    sunLight.shadow.camera.bottom = -d
    scene.add(sunLight)

    const villaGlow1 = new THREE.PointLight(0xffb85c, 2.6, 9, 1.6)
    villaGlow1.position.set(-0.6, 1.3, 0.6)
    scene.add(villaGlow1)

    const villaGlow2 = new THREE.PointLight(0xffc978, 2.2, 8, 1.6)
    villaGlow2.position.set(1.8, 2.2, -0.8)
    scene.add(villaGlow2)

    const poolGlow = new THREE.PointLight(0x4fc3c7, 1.6, 8, 1.8)
    poolGlow.position.set(0.4, 0.35, 2.5)
    scene.add(poolGlow)

    // --- Root architectural group ---
    const estateGroup = new THREE.Group()
    scene.add(estateGroup)

    // Materials
    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0xeae2d3,
      roughness: 0.72,
      metalness: 0.08,
    })
    const darkSlateMat = new THREE.MeshStandardMaterial({
      color: 0x1e2c23,
      roughness: 0.55,
      metalness: 0.18,
    })
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xc9a86c,
      roughness: 0.25,
      metalness: 0.85,
    })
    const teakWoodMat = new THREE.MeshStandardMaterial({
      color: 0x6e4f35,
      roughness: 0.62,
      metalness: 0.1,
    })
    const warmWindowMat = new THREE.MeshStandardMaterial({
      color: 0xffdfa0,
      emissive: 0xffae42,
      emissiveIntensity: 1.35,
      roughness: 0.15,
      metalness: 0.1,
    })
    const poolWaterMat = new THREE.MeshStandardMaterial({
      color: 0x267578,
      emissive: 0x0f3b3e,
      emissiveIntensity: 0.45,
      roughness: 0.12,
      metalness: 0.65,
    })
    const foliageMat = new THREE.MeshStandardMaterial({
      color: 0x2d4a38,
      roughness: 0.8,
      metalness: 0.05,
    })

    // 1. Terraced Plinth / Base Island
    const lowerPlinth = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.45, 8.8), darkSlateMat)
    lowerPlinth.position.set(0, -0.25, 0.2)
    lowerPlinth.receiveShadow = true
    estateGroup.add(lowerPlinth)

    const upperDeck = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.28, 7.6), stoneMat)
    upperDeck.position.set(0, 0.1, 0)
    upperDeck.receiveShadow = true
    estateGroup.add(upperDeck)

    // Brass rim accent around plinth
    const brassRim = new THREE.Mesh(new THREE.BoxGeometry(10.62, 0.06, 8.92), brassMat)
    brassRim.position.set(0, -0.02, 0.2)
    estateGroup.add(brassRim)

    // 2. Infinity Pool in foreground
    const poolBasin = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.22, 2.3), darkSlateMat)
    poolBasin.position.set(0.6, 0.16, 2.35)
    estateGroup.add(poolBasin)

    const poolWater = new THREE.Mesh(new THREE.BoxGeometry(4.55, 0.18, 2.05), poolWaterMat)
    poolWater.position.set(0.6, 0.22, 2.35)
    estateGroup.add(poolWater)

    // Stepping stones across water
    for (let i = 0; i < 3; i++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.08, 0.42), stoneMat)
      step.position.set(-1.1 + i * 0.7, 0.3, 2.35)
      step.castShadow = true
      estateGroup.add(step)
    }

    // 3. Ground Floor Sanctuary Pavilion
    const mainWing = new THREE.Mesh(new THREE.BoxGeometry(5.6, 1.55, 3.2), stoneMat)
    mainWing.position.set(-0.6, 1.0, -0.9)
    mainWing.castShadow = true
    mainWing.receiveShadow = true
    estateGroup.add(mainWing)

    // Glowing panoramic glass windows on Ground Floor
    const glassFront = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.15, 0.08), warmWindowMat)
    glassFront.position.set(-0.5, 0.96, 0.72)
    estateGroup.add(glassFront)

    // Architectural brass mullions
    for (let i = -2; i <= 2; i++) {
      const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.18, 0.12), brassMat)
      mullion.position.set(-0.5 + i * 0.85, 0.96, 0.74)
      estateGroup.add(mullion)
    }

    // Overhanging wooden louver roof over ground floor
    const midRoof = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.18, 4.0), teakWoodMat)
    midRoof.position.set(-0.5, 1.85, -0.7)
    midRoof.castShadow = true
    estateGroup.add(midRoof)

    // 4. Upper Floor Master Suite Cantilever
    const upperSuite = new THREE.Mesh(new THREE.BoxGeometry(4.0, 1.35, 2.7), stoneMat)
    upperSuite.position.set(0.9, 2.6, -1.1)
    upperSuite.castShadow = true
    upperSuite.receiveShadow = true
    estateGroup.add(upperSuite)

    const upperWindow = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.95, 0.08), warmWindowMat)
    upperWindow.position.set(0.9, 2.58, 0.26)
    estateGroup.add(upperWindow)

    const topRoof = new THREE.Mesh(new THREE.BoxGeometry(4.7, 0.16, 3.4), darkSlateMat)
    topRoof.position.set(0.9, 3.35, -1.0)
    topRoof.castShadow = true
    estateGroup.add(topRoof)

    const topRoofBrassTrim = new THREE.Mesh(new THREE.BoxGeometry(4.76, 0.05, 3.46), brassMat)
    topRoofBrassTrim.position.set(0.9, 3.42, -1.0)
    estateGroup.add(topRoofBrassTrim)

    // 5. Signature Golden Sanctuary Arch (Echoing the Brand Logo)
    const archCurve = new THREE.TorusGeometry(1.45, 0.06, 16, 48, Math.PI)
    const goldenArch = new THREE.Mesh(archCurve, brassMat)
    goldenArch.position.set(-2.3, 0.95, 1.15)
    estateGroup.add(goldenArch)

    const haloOrb = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 24), warmWindowMat)
    haloOrb.position.set(-2.3, 1.85, 1.15)
    estateGroup.add(haloOrb)

    // 6. Stylized Kigali Cypress & Tropical Trees
    const treePositions: [number, number, number, number][] = [
      [-3.8, 0.25, -2.2, 1.2],
      [-4.1, 0.25, 0.6, 0.95],
      [3.6, 0.25, -2.1, 1.3],
      [3.9, 0.25, 0.8, 0.85],
      [-2.8, 0.25, -2.9, 1.0],
      [2.5, 0.25, 2.4, 0.75],
    ]

    treePositions.forEach(([tx, ty, tz, scale]) => {
      const tree = new THREE.Group()
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.7, 8), teakWoodMat)
      trunk.position.y = 0.35
      tree.add(trunk)

      const canopy1 = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.5, 9), foliageMat)
      canopy1.position.y = 1.2
      canopy1.castShadow = true
      tree.add(canopy1)

      const canopy2 = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.2, 9), foliageMat)
      canopy2.position.y = 1.85
      canopy2.castShadow = true
      tree.add(canopy2)

      tree.position.set(tx, ty, tz)
      tree.scale.setScalar(scale)
      estateGroup.add(tree)
    })

    // 7. Warm Courtyard Lanterns
    const lanternCoords: [number, number, number][] = [
      [-1.8, 0.42, 2.9],
      [-0.4, 0.42, 3.1],
      [2.9, 0.42, 1.6],
      [-3.2, 0.42, 1.8],
    ]
    const lanterns: THREE.Mesh[] = []
    lanternCoords.forEach(([lx, ly, lz]) => {
      const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.28, 12), warmWindowMat)
      lantern.position.set(lx, ly, lz)
      estateGroup.add(lantern)
      lanterns.push(lantern)
    })

    // 8. Orbiting Golden Fireflies / Dust Particles
    const particleCount = 180
    const particleGeo = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const phases = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
      const radius = 3.5 + Math.random() * 8.5
      const angle = Math.random() * Math.PI * 2
      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = 0.3 + Math.random() * 5.5
      positions[i * 3 + 2] = Math.sin(angle) * radius
      phases[i] = Math.random() * Math.PI * 2
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const particleMat = new THREE.PointsMaterial({
      color: 0xe8cf9c,
      size: 0.09,
      transparent: true,
      opacity: 0.78,
      blending: THREE.AdditiveBlending,
    })
    const fireflies = new THREE.Points(particleGeo, particleMat)
    scene.add(fireflies)

    // 9. Subtle Orbital Architectural Rings around the estate
    const orbitRingGeo = new THREE.RingGeometry(6.8, 6.84, 96)
    const orbitRingMat = new THREE.MeshBasicMaterial({
      color: 0xc9a86c,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.22,
    })
    const orbitRing = new THREE.Mesh(orbitRingGeo, orbitRingMat)
    orbitRing.rotation.x = Math.PI / 2
    orbitRing.position.y = -0.1
    scene.add(orbitRing)

    // --- Pointer & Drag Interaction ---
    let pointerX = 0
    let pointerY = 0
    let isDragging = false
    let dragStartX = 0
    let userYawOffset = 0

    const onPointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect()
      const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1
      const ny = -((event.clientY - rect.top) / rect.height) * 2 + 1
      pointerX = nx
      pointerY = ny

      if (interactive && isDragging) {
        const deltaX = event.clientX - dragStartX
        dragStartX = event.clientX
        userYawOffset += deltaX * 0.0065
      }
    }

    const onPointerDown = (event: PointerEvent) => {
      if (!interactive) return
      isDragging = true
      dragStartX = event.clientX
    }

    const onPointerUp = () => {
      isDragging = false
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    container.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointerup', onPointerUp)

    const onResize = () => {
      if (!container) return
      const w = container.clientWidth || window.innerWidth
      const h = container.clientHeight || window.innerHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    // --- Animation Loop ---
    const currentLook = new THREE.Vector3(0, 0.8, 0)
    const targetLookVec = new THREE.Vector3()
    const targetPosVec = new THREE.Vector3()
    const clock = new THREE.Clock()
    let frameId = 0

    const animate = () => {
      frameId = window.requestAnimationFrame(animate)
      const elapsed = clock.getElapsedTime()

      // Smoothly transition lighting mood (Sunset vs Starlight)
      const isNight = moodRef.current === 'starlight'
      const targetSunIntensity = isNight ? 0.35 : 1.85
      const targetGlowIntensity = isNight ? 3.6 : 2.2
      sunLight.intensity += (targetSunIntensity - sunLight.intensity) * 0.05
      villaGlow1.intensity += (targetGlowIntensity - villaGlow1.intensity) * 0.05
      warmWindowMat.emissiveIntensity += ((isNight ? 2.1 : 1.25) - warmWindowMat.emissiveIntensity) * 0.05

      // Gentle architectural float & continuous 3D auto-rotation + user yaw rotation
      estateGroup.position.y = Math.sin(elapsed * 0.9) * 0.06
      const continuousSpin = autoRotate ? elapsed * 0.26 : Math.sin(elapsed * 0.22) * 0.14
      const targetYaw = userYawOffset + continuousSpin + pointerX * 0.25
      estateGroup.rotation.y += (targetYaw - estateGroup.rotation.y) * 0.05

      // Shimmering halo & lanterns
      haloOrb.position.y = 1.85 + Math.sin(elapsed * 2.2) * 0.06
      lanterns.forEach((l, idx) => {
        l.scale.y = 1 + Math.sin(elapsed * 3 + idx) * 0.08
      })

      // Animate fireflies
      const posAttr = particleGeo.getAttribute('position') as THREE.BufferAttribute
      for (let i = 0; i < particleCount; i++) {
        const y = posAttr.getY(i)
        posAttr.setY(i, y + Math.sin(elapsed * 1.4 + phases[i]) * 0.0035)
      }
      posAttr.needsUpdate = true
      fireflies.rotation.y = elapsed * 0.04
      orbitRing.rotation.z = elapsed * 0.08

      // Smooth camera interpolation toward active hotspot + mouse parallax
      const preset = CAMERA_TARGETS[hotspotRef.current] || CAMERA_TARGETS.courtyard
      targetPosVec.set(
        preset.pos[0] + pointerX * 0.65,
        preset.pos[1] + pointerY * 0.4,
        preset.pos[2],
      )
      targetLookVec.set(preset.look[0], preset.look[1], preset.look[2])

      camera.position.lerp(targetPosVec, 0.04)
      currentLook.lerp(targetLookVec, 0.05)
      camera.lookAt(currentLook)

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      window.cancelAnimationFrame(frameId)
      window.removeEventListener('pointermove', onPointerMove)
      container.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
    }
  }, [autoRotate, interactive])

  return (
    <div
      ref={containerRef}
      className={`select-none ${interactive ? 'cursor-grab active:cursor-grabbing' : ''} ${className}`}
      aria-hidden="true"
    />
  )
}
