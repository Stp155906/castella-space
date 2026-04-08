import { Canvas } from "@react-three/fiber"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import VenusScene from "./VenusScene"
import "./App.css"

const TIMELINE_ITEMS = [
  {
    id: "about",
    label: "About",
    title: "About",
    body: "Mercury is not currently in retrograde.",
    accent: "#9fe7ff",
  },
  {
    id: "meaning",
    label: "Meaning",
    title: "Meaning",
    body: "Mercury Direct supports clear thinking, smooth communication, and efficient plans.",
    accent: "#cbb7ff",
  },
  {
    id: "navigating",
    label: "Navigating",
    title: "Navigating",
    body: "Mercury Direct helps with mental clarity, clear communication, and moving forward with travel or writing plans.",
    accent: "#f0c4ff",
  },
  {
    id: "do",
    label: "Do",
    title: "Do",
    body: "Pitch ideas, launch things, hit send, update your tools, and speak clearly with confidence.",
    accent: "#8fffb0",
  },
  {
    id: "dont",
    label: "Don't",
    title: "Don't",
    body: "Avoid over-explaining, mental chaos, rushed edits, or assuming people understood your point.",
    accent: "#ff9090",
  },
  {
    id: "upcoming",
    label: "Upcoming",
    title: "Upcoming",
    body: "Other retrogrades this week: Mars. Replace this with your live API response later.",
    accent: "#ffdca0",
  },
  {
    id: "culture",
    label: "Culture",
    title: "Culture",
    body: "Messengers, merchants, and scribes reflect Mercury’s archetype across communication and exchange.",
    accent: "#bfa8ff",
  },
  {
    id: "premium",
    label: "Personalized",
    title: "Personalized Insight",
    body: "Unlock with Castella Premium.",
    accent: "#ffffff",
    locked: true,
  },
]

function InfoCard({ item, visible }) {
  if (!item) return null

  return (
    <div className={`info-card ${visible ? "visible" : ""} ${item.locked ? "locked" : ""}`}>
      <div
        className="info-card-glow"
        style={{ "--card-accent": item.accent }}
      />
      <div className="info-card-inner">
        <div className="info-card-kicker">{item.label}</div>
        <h2>{item.title}</h2>
        <p>{item.body}</p>
        {item.locked ? <button className="unlock-btn">Unlock with Castella Premium</button> : null}
      </div>
    </div>
  )
}

export default function App() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const lockRef = useRef(false)

  const focusedIndex = hoveredIndex ?? activeIndex
  const focusedItem = useMemo(() => TIMELINE_ITEMS[focusedIndex], [focusedIndex])

  const clampIndex = useCallback((value) => {
    return Math.max(0, Math.min(TIMELINE_ITEMS.length - 1, value))
  }, [])

  const moveTo = useCallback(
    (index) => {
      setActiveIndex(clampIndex(index))
    },
    [clampIndex]
  )

  useEffect(() => {
    const onWheel = (event) => {
      if (lockRef.current) return
      if (Math.abs(event.deltaY) < 8) return

      lockRef.current = true
      setActiveIndex((prev) => clampIndex(prev + (event.deltaY > 0 ? 1 : -1)))

      window.setTimeout(() => {
        lockRef.current = false
      }, 520)
    }

    const onKeyDown = (event) => {
      if (event.key === "ArrowDown") moveTo(activeIndex + 1)
      if (event.key === "ArrowUp") moveTo(activeIndex - 1)
    }

    window.addEventListener("wheel", onWheel, { passive: true })
    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("wheel", onWheel)
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [activeIndex, clampIndex, moveTo])

  return (
    <div className="app-shell">
      <Canvas camera={{ position: [0, 0.4, 8], fov: 62 }}>
        <VenusScene
          items={TIMELINE_ITEMS}
          activeIndex={activeIndex}
          hoveredIndex={hoveredIndex}
          onFocusIndex={setHoveredIndex}
          onSelectIndex={moveTo}
        />
      </Canvas>

      <div className="overlay">
        <div className="planet-pill">Mercury</div>

        <div className="right-rail">
          {TIMELINE_ITEMS.map((item, index) => (
            <button
              key={item.id}
              className={`rail-item ${focusedIndex === index ? "active" : ""}`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => moveTo(index)}
            >
              <span className="rail-tick" />
              <span className="rail-label">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="card-layer">
          <InfoCard item={focusedItem} visible />
        </div>

        <div className="hint">
          Scroll, swipe, or tap points to move through the journey
        </div>
      </div>
    </div>
  )
}