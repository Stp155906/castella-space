import { Stars } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { EffectComposer, Bloom } from "@react-three/postprocessing"
import Venus from "./Venus"
import { useRef, useState, useEffect } from "react"

function FloatingParticles({ entered }) {
  const pointsRef = useRef()

  const [positions] = useState(() => {
    const count = 1400
    const array = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      array[i3] = (Math.random() - 0.5) * 22
      array[i3 + 1] = (Math.random() - 0.5) * 14
      array[i3 + 2] = (Math.random() - 0.5) * 24
    }

    return array
  })

  useFrame((state) => {
    if (!pointsRef.current) return
    const t = state.clock.elapsedTime
    pointsRef.current.rotation.y = t * 0.01
    pointsRef.current.rotation.x = Math.sin(t * 0.08) * 0.04
    pointsRef.current.position.z += entered ? 0.003 : 0.001

    if (pointsRef.current.position.z > 8) {
      pointsRef.current.position.z = -2
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={entered ? 0.08 : 0.045}
        color={entered ? "#ffe2bf" : "#ffd7a1"}
        transparent
        opacity={entered ? 0.98 : 0.86}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}

function InnerParticles({ entered }) {
  const pointsRef = useRef()

  const [positions] = useState(() => {
    const count = 1000
    const array = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      array[i3] = (Math.random() - 0.5) * 8
      array[i3 + 1] = (Math.random() - 0.5) * 8
      array[i3 + 2] = (Math.random() - 0.5) * 8
    }

    return array
  })

  useFrame((state) => {
    if (!pointsRef.current) return
    const t = state.clock.elapsedTime
    pointsRef.current.rotation.y = t * 0.03
    pointsRef.current.rotation.z = Math.sin(t * 0.2) * 0.08
  })

  if (!entered) return null

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#fff0d6"
        transparent
        opacity={0.9}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}

function InnerOrbs({ entered }) {
  const groupRef = useRef()

  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y += 0.001
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.05
  })

  if (!entered) return null

  return (
    <group ref={groupRef}>
      <mesh position={[1.8, 0.8, -0.5]}>
        <sphereGeometry args={[0.38, 32, 32]} />
        <meshBasicMaterial color="#ffe1bf" transparent opacity={0.12} />
      </mesh>

      <mesh position={[-1.5, -0.6, 0.4]}>
        <sphereGeometry args={[0.28, 32, 32]} />
        <meshBasicMaterial color="#ffd2a0" transparent opacity={0.1} />
      </mesh>

      <mesh position={[0.4, -1.4, -1]}>
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshBasicMaterial color="#fff1dc" transparent opacity={0.09} />
      </mesh>
    </group>
  )
}

function VenusGlow({ entered }) {
  const glowRef = useRef()

  useFrame((state) => {
    if (!glowRef.current) return
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.2) * 0.02
    const base = entered ? 1.46 : 1.24
    glowRef.current.scale.setScalar(base * pulse)
  })

  return (
    <mesh ref={glowRef}>
      <sphereGeometry args={[1.5, 96, 96]} />
      <meshBasicMaterial
        color={entered ? "#ffd09a" : "#ffc27a"}
        transparent
        opacity={entered ? 0.2 : 0.12}
      />
    </mesh>
  )
}

function VenusCloudShell({ entered }) {
  const shellRef = useRef()

  useFrame((state, delta) => {
    if (!shellRef.current) return
    shellRef.current.rotation.y += delta * (entered ? 0.045 : 0.02)
    shellRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.03
  })

  return (
    <mesh ref={shellRef} scale={entered ? 1.5 : 1.28}>
      <sphereGeometry args={[1.5, 96, 96]} />
      <meshBasicMaterial
        color={entered ? "#ffe0bd" : "#f4c98d"}
        transparent
        opacity={entered ? 0.18 : 0.08}
      />
    </mesh>
  )
}

function VenusVeil({ entered }) {
  const veilRef = useRef()

  useFrame((state) => {
    if (!veilRef.current) return
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 0.9) * 0.015
    veilRef.current.scale.setScalar((entered ? 2.0 : 1.72) * pulse)
    veilRef.current.rotation.z += entered ? 0.0015 : 0.0004
  })

  return (
    <mesh ref={veilRef}>
      <sphereGeometry args={[1.5, 64, 64]} />
      <meshBasicMaterial
        color={entered ? "#ffe3c2" : "#f6d2a4"}
        transparent
        opacity={entered ? 0.09 : 0.035}
      />
    </mesh>
  )
}

function InnerVeilRings({ entered }) {
  const ringA = useRef()
  const ringB = useRef()

  useFrame((state) => {
    if (!entered) return

    if (ringA.current) {
      ringA.current.rotation.z += 0.002
      ringA.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2
    }

    if (ringB.current) {
      ringB.current.rotation.z -= 0.0015
      ringB.current.rotation.y = Math.cos(state.clock.elapsedTime * 0.25) * 0.25
    }
  })

  if (!entered) return null

  return (
    <group>
      <mesh ref={ringA} rotation={[1.2, 0.2, 0]}>
        <torusGeometry args={[2.35, 0.08, 24, 120]} />
        <meshBasicMaterial color="#ffe2bf" transparent opacity={0.1} />
      </mesh>

      <mesh ref={ringB} rotation={[0.8, -0.4, 0.4]}>
        <torusGeometry args={[2.9, 0.05, 24, 120]} />
        <meshBasicMaterial color="#ffd0a0" transparent opacity={0.07} />
      </mesh>
    </group>
  )
}

function CorePulse({ entered }) {
  const pulseRef = useRef()

  useFrame((state) => {
    if (!pulseRef.current) return
    const s = 1 + Math.sin(state.clock.elapsedTime * 1.8) * 0.06
    pulseRef.current.scale.setScalar(s)
  })

  if (!entered) return null

  return (
    <mesh ref={pulseRef}>
      <sphereGeometry args={[1.1, 64, 64]} />
      <meshBasicMaterial color="#ffe1b3" transparent opacity={0.08} />
    </mesh>
  )
}

function ThresholdFog({ entered }) {
  const fogRef = useRef()

  useFrame((state) => {
    if (!fogRef.current) return
    fogRef.current.rotation.y += 0.0008
    fogRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.12) * 0.08
  })

  if (!entered) return null

  return (
    <mesh ref={fogRef} scale={[12, 12, 12]}>
      <sphereGeometry args={[1, 48, 48]} />
      <meshBasicMaterial
        color="#b86a32"
        transparent
        opacity={0.035}
        side={2}
      />
    </mesh>
  )
}

function CameraRig({ entered }) {
  const targetYaw = useRef(0)
  const targetPitch = useRef(0)
  const targetDistance = useRef(7)

  const currentYaw = useRef(0)
  const currentPitch = useRef(0)
  const currentDistance = useRef(7)

  const gestureMode = useRef("none")
  const lastPointer = useRef({ x: 0, y: 0 })
  const pinchDistance = useRef(0)

  useEffect(() => {
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

    const getTouchDistance = (touches) => {
      const dx = touches[0].clientX - touches[1].clientX
      const dy = touches[0].clientY - touches[1].clientY
      return Math.sqrt(dx * dx + dy * dy)
    }

    const deadZone = 2

    const handlePointerDown = (e) => {
      if (entered) return
      gestureMode.current = "orbit"
      lastPointer.current = { x: e.clientX, y: e.clientY }
    }

    const handlePointerMove = (e) => {
      if (entered || gestureMode.current !== "orbit") return

      const deltaX = e.clientX - lastPointer.current.x
      const deltaY = e.clientY - lastPointer.current.y

      if (Math.abs(deltaX) < deadZone && Math.abs(deltaY) < deadZone) return

      targetYaw.current -= deltaX * 0.004
      targetPitch.current += deltaY * 0.004
      targetPitch.current = clamp(targetPitch.current, -0.9, 0.9)

      lastPointer.current = { x: e.clientX, y: e.clientY }
    }

    const handlePointerUp = () => {
      gestureMode.current = "none"
    }

    const handleWheel = (e) => {
      if (entered) return
      targetDistance.current += e.deltaY * 0.01
      targetDistance.current = clamp(targetDistance.current, 3.2, 12)
    }

    const handleTouchStart = (e) => {
      if (entered) return

      if (e.touches.length === 1) {
        gestureMode.current = "orbit"
        lastPointer.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        }
      } else if (e.touches.length === 2) {
        gestureMode.current = "pinch"
        pinchDistance.current = getTouchDistance(e.touches)
      }
    }

    const handleTouchMove = (e) => {
      if (entered) return

      if (e.touches.length === 1 && gestureMode.current === "orbit") {
        e.preventDefault()

        const touch = e.touches[0]
        const deltaX = touch.clientX - lastPointer.current.x
        const deltaY = touch.clientY - lastPointer.current.y

        if (Math.abs(deltaX) < deadZone && Math.abs(deltaY) < deadZone) return

        targetYaw.current -= deltaX * 0.0045
        targetPitch.current += deltaY * 0.004
        targetPitch.current = clamp(targetPitch.current, -0.9, 0.9)

        lastPointer.current = { x: touch.clientX, y: touch.clientY }
      }

      if (e.touches.length === 2 && gestureMode.current === "pinch") {
        e.preventDefault()

        const newDistance = getTouchDistance(e.touches)
        const delta = pinchDistance.current - newDistance

        targetDistance.current += delta * 0.008
        targetDistance.current = clamp(targetDistance.current, 3.2, 12)

        pinchDistance.current = newDistance
      }
    }

    const handleTouchEnd = (e) => {
      if (entered) return

      if (e.touches.length === 0) {
        gestureMode.current = "none"
        pinchDistance.current = 0
      } else if (e.touches.length === 1) {
        gestureMode.current = "orbit"
        lastPointer.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        }
      }
    }

    window.addEventListener("pointerdown", handlePointerDown)
    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", handlePointerUp)
    window.addEventListener("pointercancel", handlePointerUp)
    window.addEventListener("wheel", handleWheel, { passive: true })

    window.addEventListener("touchstart", handleTouchStart, { passive: false })
    window.addEventListener("touchmove", handleTouchMove, { passive: false })
    window.addEventListener("touchend", handleTouchEnd, { passive: false })
    window.addEventListener("touchcancel", handleTouchEnd, { passive: false })

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown)
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
      window.removeEventListener("pointercancel", handlePointerUp)
      window.removeEventListener("wheel", handleWheel)

      window.removeEventListener("touchstart", handleTouchStart)
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("touchend", handleTouchEnd)
      window.removeEventListener("touchcancel", handleTouchEnd)
    }
  }, [entered])

  useFrame((state) => {
    const desiredDistance = entered ? 2.7 : targetDistance.current

    currentYaw.current += (targetYaw.current - currentYaw.current) * 0.08
    currentPitch.current += (targetPitch.current - currentPitch.current) * 0.08
    currentDistance.current += (desiredDistance - currentDistance.current) * 0.06

    const r = currentDistance.current
    const yaw = currentYaw.current
    const pitch = currentPitch.current

    const x = Math.sin(yaw) * Math.cos(pitch) * r
    const y = Math.sin(pitch) * r
    const z = Math.cos(yaw) * Math.cos(pitch) * r

    state.camera.position.x = x
    state.camera.position.y = y
    state.camera.position.z = z
    state.camera.lookAt(0, 0, 0)

    const targetFov = entered ? 98 : 85
    state.camera.fov += (targetFov - state.camera.fov) * 0.05
    state.camera.updateProjectionMatrix()
  })

  return null
}

function VenusGroup({ entered, setEntered }) {
  const groupRef = useRef()

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime
    groupRef.current.rotation.y += 0.0015
    groupRef.current.position.x = Math.sin(t * 0.4) * 0.15
    groupRef.current.position.y = Math.cos(t * 0.35) * 0.12
  })

  return (
    <group ref={groupRef} onClick={() => setEntered(true)}>
      <VenusVeil entered={entered} />
      <VenusGlow entered={entered} />
      <VenusCloudShell entered={entered} />
      <CorePulse entered={entered} />
      <Venus />
    </group>
  )
}

export default function VenusScene({ entered, setEntered }) {
  return (
    <>
      <color attach="background" args={[entered ? "#12070a" : "#04010a"]} />
      <fog attach="fog" args={[entered ? "#241008" : "#04010a", entered ? 6 : 14, entered ? 18 : 42]} />

      <ambientLight intensity={entered ? 0.72 : 0.35} />
      <pointLight position={[3, 2, 4]} intensity={entered ? 40 : 22} color="#ffdcb2" />
      <pointLight position={[-4, -2, -4]} intensity={entered ? 12 : 5} color="#ffb57d" />

      <Stars
        radius={90}
        depth={45}
        count={entered ? 1800 : 5000}
        factor={entered ? 2.2 : 3.2}
        saturation={0}
        fade
      />

      <ThresholdFog entered={entered} />
      <FloatingParticles entered={entered} />
      <InnerParticles entered={entered} />
      <InnerOrbs entered={entered} />
      <InnerVeilRings entered={entered} />
      <CameraRig entered={entered} />
      <VenusGroup entered={entered} setEntered={setEntered} />

      <EffectComposer>
        <Bloom
          intensity={entered ? 1.45 : 1.0}
          luminanceThreshold={0.15}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>
    </>
  )
}