import { Stars } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
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
    pointsRef.current.position.z += entered ? 0.002 : 0

    if (pointsRef.current.position.z > 8) {
      pointsRef.current.position.z = 0
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
        size={entered ? 0.06 : 0.04}
        color="#ffd7a1"
        transparent
        opacity={entered ? 0.95 : 0.85}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}

function VenusGlow() {
  return (
    <mesh scale={1.22}>
      <sphereGeometry args={[1.5, 64, 64]} />
      <meshBasicMaterial color="#f2b56b" transparent opacity={0.09} />
    </mesh>
  )
}

function VenusCloudShell({ entered }) {
  const shellRef = useRef()

  useFrame((state, delta) => {
    if (!shellRef.current) return
    shellRef.current.rotation.y += delta * 0.02
    shellRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.03
  })

  return (
    <mesh ref={shellRef} scale={entered ? 1.35 : 1.28}>
      <sphereGeometry args={[1.5, 64, 64]} />
      <meshBasicMaterial
        color={entered ? "#f8c98c" : "#efbb78"}
        transparent
        opacity={entered ? 0.14 : 0.08}
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
    const desiredDistance = entered ? 3.2 : targetDistance.current

    currentYaw.current += (targetYaw.current - currentYaw.current) * 0.08
    currentPitch.current += (targetPitch.current - currentPitch.current) * 0.08
    currentDistance.current += (desiredDistance - currentDistance.current) * 0.08

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
      <VenusGlow />
      <VenusCloudShell entered={entered} />
      <Venus />
    </group>
  )
}

export default function VenusScene({ entered, setEntered }) {
  return (
    <>
      <color attach="background" args={[entered ? "#12060a" : "#04010a"]} />

      <ambientLight intensity={entered ? 0.55 : 0.35} />
      <pointLight position={[3, 2, 4]} intensity={entered ? 28 : 20} color="#ffd19a" />
      <pointLight position={[-4, -2, -4]} intensity={entered ? 8 : 4} color="#ff9e6d" />

      <Stars
        radius={90}
        depth={45}
        count={entered ? 2500 : 5000}
        factor={3.2}
        saturation={0}
        fade
      />

      <FloatingParticles entered={entered} />
      <CameraRig entered={entered} />
      <VenusGroup entered={entered} setEntered={setEntered} />
    </>
  )
}