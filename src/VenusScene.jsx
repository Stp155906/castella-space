import { Html, Stars } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { Bloom, EffectComposer } from "@react-three/postprocessing"
import { useMemo, useRef } from "react"
import * as THREE from "three"
import Venus from "./Venus"

const NODE_SPACING_Y = -3.35
const NODE_SPACING_Z = -4.2

function createSeededRandom(seed = 123456789) {
  let value = seed >>> 0
  return () => {
    value = (1664525 * value + 1013904223) >>> 0
    return value / 4294967296
  }
}



function DustField({ activeProgressRef }) {
  const pointsRef = useRef()

  const positions = useMemo(() => {
    const rand = createSeededRandom(1001)
    const count = 2200
    const arr = new Float32Array(count * 3)

    for (let i = 0; i < count; i += 1) {
      const i3 = i * 3
      arr[i3] = (rand() - 0.5) * 24
      arr[i3 + 1] = (rand() - 0.5) * 42
      arr[i3 + 2] = -rand() * 80
    }

    return arr
  }, [])

  useFrame((state) => {
    if (!pointsRef.current) return
    const p = activeProgressRef.current
    const t = state.clock.elapsedTime

    pointsRef.current.position.y = p * 3.35
    pointsRef.current.position.z = p * 4.2
    pointsRef.current.rotation.z = Math.sin(t * 0.1) * 0.03
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={positions.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#f3edff"
        transparent
        opacity={0.65}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  )
}

function SpeedLines({ activeProgressRef }) {
  const groupRef = useRef()

  const streaks = useMemo(() => {
    const rand = createSeededRandom(2027)

    return Array.from({ length: 34 }, (_, index) => ({
      id: index,
      x: (rand() - 0.5) * 16,
      y: (rand() - 0.5) * 24,
      z: -rand() * 70,
      len: 0.18 + rand() * 0.5,
      tilt: (rand() - 0.5) * 0.7,
    }))
  }, [])

  useFrame((state) => {
    if (!groupRef.current) return
    const p = activeProgressRef.current
    const t = state.clock.elapsedTime

    groupRef.current.position.y = p * 3.35
    groupRef.current.position.z = p * 4.2
    groupRef.current.rotation.z = Math.sin(t * 0.12) * 0.02
  })

  return (
    <group ref={groupRef}>
      {streaks.map((streak) => (
        <mesh
          key={streak.id}
          position={[
            streak.x,
            streak.y + Math.sin(streak.id * 1.7) * 0.3,
            streak.z,
          ]}
          rotation={[0, 0, streak.tilt]}
        >
          <planeGeometry args={[0.02, streak.len]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.82} />
        </mesh>
      ))}
    </group>
  )
}

function TimelinePath({ items }) {
  const points = useMemo(() => {
    return items.map((_, index) => {
      const x = Math.sin(index * 0.55) * 0.85
      const y = index * NODE_SPACING_Y
      const z = index * NODE_SPACING_Z
      return new THREE.Vector3(x, y, z)
    })
  }, [items])

  const lineGeometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points)
    const sampled = curve.getPoints(200)
    return new THREE.BufferGeometry().setFromPoints(sampled)
  }, [points])

  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial color="#8ddcff" transparent opacity={0.22} />
    </line>
  )
}

function Hotspot({
  index,
  item,
  activeIndex,
  hoveredIndex,
  onFocusIndex,
  onSelectIndex,
}) {
  const groupRef = useRef()
  const isFocused = hoveredIndex === index || activeIndex === index

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime
    const pulse = isFocused ? 1.15 + Math.sin(t * 2.2) * 0.06 : 1 + Math.sin(t * 1.6) * 0.03
    groupRef.current.scale.setScalar(pulse)
  })

  return (
    <group ref={groupRef}>
      <mesh
        onPointerEnter={(e) => {
          e.stopPropagation()
          onFocusIndex(index)
        }}
        onPointerLeave={(e) => {
          e.stopPropagation()
          onFocusIndex(null)
        }}
        onClick={(e) => {
          e.stopPropagation()
          onSelectIndex(index)
        }}
      >
        <sphereGeometry args={[0.16, 32, 32]} />
        <meshBasicMaterial color={item.accent} transparent opacity={0.95} />
      </mesh>

      <mesh scale={2.7}>
        <sphereGeometry args={[0.12, 24, 24]} />
        <meshBasicMaterial color={item.accent} transparent opacity={isFocused ? 0.22 : 0.08} />
      </mesh>

      <Html
        center
        position={[0.7, 0.08, 0]}
        distanceFactor={10}
        style={{ pointerEvents: "none" }}
      >
        <div className={`point-label ${isFocused ? "active" : ""}`}>{item.label}</div>
      </Html>
    </group>
  )
}

function TimelineNodes({
  items,
  activeIndex,
  hoveredIndex,
  onFocusIndex,
  onSelectIndex,
  activeProgressRef,
}) {
  const groupRef = useRef()

  const nodes = useMemo(() => {
    return items.map((item, index) => ({
      ...item,
      x: Math.sin(index * 0.55) * 0.85,
      y: index * NODE_SPACING_Y,
      z: index * NODE_SPACING_Z,
    }))
  }, [items])

  useFrame(() => {
    if (!groupRef.current) return
    const p = activeProgressRef.current
    groupRef.current.position.y = p * -NODE_SPACING_Y
    groupRef.current.position.z = p * -NODE_SPACING_Z
  })

  return (
    <group ref={groupRef}>
      <TimelinePath items={items} />
      {nodes.map((node, index) => (
        <group key={node.id} position={[node.x, node.y, node.z]}>
          <Hotspot
            index={index}
            item={node}
            activeIndex={activeIndex}
            hoveredIndex={hoveredIndex}
            onFocusIndex={onFocusIndex}
            onSelectIndex={onSelectIndex}
          />
        </group>
      ))}
    </group>
  )
}

function PlanetAnchor({ activeProgressRef, activeIndex }) {
  const groupRef = useRef()

  useFrame((state) => {
    if (!groupRef.current) return

    const t = state.clock.elapsedTime
    const p = activeProgressRef.current

    const anchorX = 0.45 + Math.sin(p * 0.55 + t * 0.45) * 0.16
    const anchorY = p * NODE_SPACING_Y + Math.sin(t * 0.35) * 0.16
    const anchorZ = p * NODE_SPACING_Z - 2.1 + Math.cos(t * 0.3) * 0.16

    groupRef.current.position.x += (anchorX - groupRef.current.position.x) * 0.06
    groupRef.current.position.y += (anchorY - groupRef.current.position.y) * 0.06
    groupRef.current.position.z += (anchorZ - groupRef.current.position.z) * 0.06

    groupRef.current.rotation.y += 0.0035
    groupRef.current.rotation.z = Math.sin(t * 0.24) * 0.05

    const targetScale = activeIndex === 7 ? 0.92 : 1
    groupRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.05
    )
  })

  return (
    <group ref={groupRef}>
      <Venus />
    </group>
  )
}

function CameraRig({ activeIndex, activeProgressRef }) {
  const lookTargetRef = useRef(new THREE.Vector3())
  const positionTargetRef = useRef(new THREE.Vector3())

  useFrame((state) => {
    activeProgressRef.current += (activeIndex - activeProgressRef.current) * 0.05

    const p = activeProgressRef.current
    const t = state.clock.elapsedTime

    const camX = Math.sin(p * 0.4 + t * 0.16) * 0.28
    const camY = p * NODE_SPACING_Y + 0.12 + Math.cos(t * 0.2) * 0.08
    const camZ = 7.4 + p * NODE_SPACING_Z

    positionTargetRef.current.set(camX, camY, camZ)
    state.camera.position.lerp(positionTargetRef.current, 0.07)

    const lookX = Math.sin(p * 0.55) * 0.2
    const lookY = p * NODE_SPACING_Y
    const lookZ = p * NODE_SPACING_Z - 3.8

    lookTargetRef.current.set(lookX, lookY, lookZ)
    state.camera.lookAt(lookTargetRef.current)

    state.camera.fov += (62 - state.camera.fov) * 0.05
    state.camera.updateProjectionMatrix()
  })

  return null
}

export default function VenusScene({
  items,
  activeIndex,
  hoveredIndex,
  onFocusIndex,
  onSelectIndex,
}) {
  const activeProgressRef = useRef(0)

  return (
    <>
      <color attach="background" args={["#020206"]} />
      <fog attach="fog" args={["#020206", 10, 34]} />

      <ambientLight intensity={0.4} />
      <pointLight position={[2.5, 2, 3]} intensity={8} color="#e7dcff" />
      <pointLight position={[-4, -3, -3]} intensity={3} color="#7469b6" />

      <Stars radius={120} depth={100} count={5000} factor={2.7} saturation={0} fade />

      <DustField activeProgressRef={activeProgressRef} />
      <SpeedLines activeProgressRef={activeProgressRef} />

      <TimelineNodes
        items={items}
        activeIndex={activeIndex}
        hoveredIndex={hoveredIndex}
        onFocusIndex={onFocusIndex}
        onSelectIndex={onSelectIndex}
        activeProgressRef={activeProgressRef}
      />

      <PlanetAnchor activeProgressRef={activeProgressRef} activeIndex={activeIndex} />
      <CameraRig activeIndex={activeIndex} activeProgressRef={activeProgressRef} />

      <EffectComposer>
        <Bloom
          intensity={0.36}
          luminanceThreshold={0.22}
          luminanceSmoothing={0.95}
          mipmapBlur
        />
      </EffectComposer>
    </>
  )
}