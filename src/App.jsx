import { Canvas } from "@react-three/fiber"
import VenusScene from "./VenusScene"

export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh", background: "black" }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 85 }}>
        <VenusScene />
      </Canvas>
    </div>
  )
}