import { useFrame } from "@react-three/fiber"
import { useRef } from "react"

export default function Venus() {
  const meshRef = useRef()

  useFrame((_, delta) => {
    if (!meshRef.current) return
    meshRef.current.rotation.y += delta * 0.06
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.5, 96, 96]} />
      <meshStandardMaterial
        color="#d89b52"
        emissive="#b8642b"
        emissiveIntensity={0.95}
        roughness={0.92}
        metalness={0.02}
      />
    </mesh>
  )
}