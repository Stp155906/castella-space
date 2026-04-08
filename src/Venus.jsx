import { useFrame, useLoader } from "@react-three/fiber"
import { useRef } from "react"
import * as THREE from "three"

export default function Venus() {
  const meshRef = useRef()

  const texture = useLoader(
    THREE.TextureLoader,
    "/textures/venus-texture.png"
  )

  useFrame((_, delta) => {
    if (!meshRef.current) return
    meshRef.current.rotation.y += delta * 0.05
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.5, 96, 96]} />
      <meshStandardMaterial
        map={texture}
        color="#f3d3a2"
        emissive="#9c5a28"
        emissiveIntensity={0.28}
        roughness={0.95}
        metalness={0.01}
      />
    </mesh>
  )
}