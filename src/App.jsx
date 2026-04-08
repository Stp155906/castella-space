import { Canvas } from "@react-three/fiber"
import { useState } from "react"
import VenusScene from "./VenusScene"
import "./App.css"

export default function App() {
  const [entered, setEntered] = useState(false)

  return (
    <div style={{ width: "100vw", height: "100vh", background: "black", position: "relative" }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 85 }}>
        <VenusScene entered={entered} setEntered={setEntered} />
      </Canvas>

      <div className="ui-overlay">
        {!entered ? (
          <button className="enter-button" onClick={() => setEntered(true)}>
            Enter Venus
          </button>
        ) : (
          <button className="enter-button" onClick={() => setEntered(false)}>
            Exit Venus
          </button>
        )}

        <div className="story-panel">
          {!entered ? (
            <>
              <h2>Venus</h2>
              <p>Orbit the field. Drag to move. Scroll or pinch to deepen.</p>
            </>
          ) : (
            <>
              <h2>Inside Venus</h2>
              <p>
                The atmosphere gathers light into veils. Attraction becomes environment.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}