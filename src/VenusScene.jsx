import { Stars } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import Venus from "./Venus"
import { useRef, useState, useEffect } from "react"

function FloatingParticles() {
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
        size={0.04}
        color="#ffd7a1"
        transparent
        opacity={0.85}
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

function CameraRig() {
  const targetYaw = useRef(0)
  const targetPitch = useRef(0)
  const targetDistance = useRef(7)

  const currentYaw = useRef(0)
  const currentPitch = useRef(0)
  const currentDistance = useRef(7)

  const isDragging = useRef(false)
  const lastPointer = useRef({ x: 0, y: 0 })

  const pinchDistance = useRef(null)

  useEffect(() => {
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

    const getTouchDistance = (touches) => {
      const dx = touches[0].clientX - touches[1].clientX
      const dy = touches[0].clientY - touches[1].clientY
      return Math.sqrt(dx * dx + dy * dy)
    }

    const handlePointerDown = (e) => {
      isDragging.current = true
      lastPointer.current = { x: e.clientX, y: e.clientY }
    }

    const handlePointerMove = (e) => {
      if (!isDragging.current) return

      const deltaX = e.clientX - lastPointer.current.x
      const deltaY = e.clientY - lastPointer.current.y

      targetYaw.current -= deltaX * 0.005
      targetPitch.current += deltaY * 0.005
      targetPitch.current = clamp(targetPitch.current, -1.0, 1.0)

      lastPointer.current = { x: e.clientX, y: e.clientY }
    }

    const handlePointerUp = () => {
      isDragging.current = false
    }

    const handleWheel = (e) => {
      targetDistance.current += e.deltaY * 0.01
      targetDistance.current = clamp(targetDistance.current, 3, 12)
    }

    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        isDragging.current = true
        lastPointer.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        }
      }

      if (e.touches.length === 2) {
        pinchDistance.current = getTouchDistance(e.touches)
      }
    }

    const handleTouchMove = (e) => {
      if (e.touches.length === 1 && isDragging.current) {
        const touch = e.touches[0]
        const deltaX = touch.clientX - lastPointer.current.x
        const deltaY = touch.clientY - lastPointer.current.y

        targetYaw.current -= deltaX * 0.005
        targetPitch.current += deltaY * 0.005
        targetPitch.current = clamp(targetPitch.current, -1.0, 1.0)

        lastPointer.current = { x: touch.clientX, y: touch.clientY }
      }

      if (e.touches.length === 2) {
        const newDistance = getTouchDistance(e.touches)

        if (pinchDistance.current !== null) {
          const delta = pinchDistance.current - newDistance
          targetDistance.current += delta * 0.01
          targetDistance.current = clamp(targetDistance.current, 3, 12)
        }

        pinchDistance.current = newDistance
      }
    }

    const handleTouchEnd = (e) => {
      if (e.touches.length === 0) {
        isDragging.current = false
        pinchDistance.current = null
      }

      if (e.touches.length === 1) {
        lastPointer.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        }
        pinchDistance.current = null
      }
    }

    window.addEventListener("pointerdown", handlePointerDown)
    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", handlePointerUp)
    window.addEventListener("pointercancel", handlePointerUp)
    window.addEventListener("wheel", handleWheel, { passive: true })

    window.addEventListener("touchstart", handleTouchStart, { passive: true })
    window.addEventListener("touchmove", handleTouchMove, { passive: true })
    window.addEventListener("touchend", handleTouchEnd, { passive: true })
    window.addEventListener("touchcancel", handleTouchEnd, { passive: true })

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
  }, [])

  useFrame((state) => {
    currentYaw.current += (targetYaw.current - currentYaw.current) * 0.08
    currentPitch.current += (targetPitch.current - currentPitch.current) * 0.08
    currentDistance.current +=
      (targetDistance.current - currentDistance.current) * 0.08

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

function VenusGroup() {
  const groupRef = useRef()

  useFrame((state) => {
    if (!groupRef.current) return

    const t = state.clock.elapsedTime
    groupRef.current.rotation.y += 0.0015
    groupRef.current.position.x = Math.sin(t * 0.4) * 0.15
    groupRef.current.position.y = Math.cos(t * 0.35) * 0.12
  })

  return (
    <group ref={groupRef}>
      <VenusGlow />
      <Venus />
    </group>
  )
}

export default function VenusScene() {
  return (
    <>
      <color attach="background" args={["#04010a"]} />

      <ambientLight intensity={0.35} />
      <pointLight position={[3, 2, 4]} intensity={20} color="#ffd19a" />
      <pointLight position={[-4, -2, -4]} intensity={4} color="#ff9e6d" />

      <Stars radius={90} depth={45} count={5000} factor={3.2} saturation={0} fade />

      <FloatingParticles />
      <CameraRig />
      <VenusGroup />
    </>
  )
}