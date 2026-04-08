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
      <div className="info-card-glow" style={{ "--card-accent": item.accent }} />
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

  const wheelLockRef = useRef(false)
  const touchStartYRef = useRef(null)
  const touchStartXRef = useRef(null)
  const touchLockedRef = useRef(false)

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

  const moveNext = useCallback(() => {
    setActiveIndex((prev) => clampIndex(prev + 1))
  }, [clampIndex])

  const movePrev = useCallback(() => {
    setActiveIndex((prev) => clampIndex(prev - 1))
  }, [clampIndex])

  useEffect(() => {
    const onWheel = (event) => {
      if (wheelLockRef.current) return
      if (Math.abs(event.deltaY) < 8) return

      wheelLockRef.current = true
      if (event.deltaY > 0) moveNext()
      else movePrev()

      window.setTimeout(() => {
        wheelLockRef.current = false
      }, 500)
    }

    const onKeyDown = (event) => {
      if (event.key === "ArrowDown") moveNext()
      if (event.key === "ArrowUp") movePrev()
    }

    const onTouchStart = (event) => {
      if (event.touches.length !== 1) return
      touchStartYRef.current = event.touches[0].clientY
      touchStartXRef.current = event.touches[0].clientX
    }

    const onTouchMove = (event) => {
      if (event.touches.length !== 1) return
      if (touchLockedRef.current) return
      if (touchStartYRef.current == null || touchStartXRef.current == null) return

      const currentY = event.touches[0].clientY
      const currentX = event.touches[0].clientX

      const deltaY = currentY - touchStartYRef.current
      const deltaX = currentX - touchStartXRef.current

      const verticalIntent = Math.abs(deltaY) > Math.abs(deltaX)
      const threshold = 42

      if (!verticalIntent) return

      if (Math.abs(deltaY) > threshold) {
        touchLockedRef.current = true

        if (deltaY < 0) moveNext()
        else movePrev()

        window.setTimeout(() => {
          touchLockedRef.current = false
        }, 420)

        touchStartYRef.current = currentY
        touchStartXRef.current = currentX
      }
    }

    const onTouchEnd = () => {
      touchStartYRef.current = null
      touchStartXRef.current = null
    }

    window.addEventListener("wheel", onWheel, { passive: true })
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("touchstart", onTouchStart, { passive: true })
    window.addEventListener("touchmove", onTouchMove, { passive: true })
    window.addEventListener("touchend", onTouchEnd, { passive: true })
    window.addEventListener("touchcancel", onTouchEnd, { passive: true })

    return () => {
      window.removeEventListener("wheel", onWheel)
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("touchstart", onTouchStart)
      window.removeEventListener("touchmove", onTouchMove)
      window.removeEventListener("touchend", onTouchEnd)
      window.removeEventListener("touchcancel", onTouchEnd)
    }
  }, [moveNext, movePrev])

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

        <div className="card-layer">
          <InfoCard item={focusedItem} visible />
        </div>

        <div className="right-rail">
          {TIMELINE_ITEMS.map((item, index) => (
            <button
              key={item.id}
              className={`rail-item ${focusedIndex === index ? "active" : ""}`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => moveTo(index)}
              aria-label={item.label}
            >
              <span className="rail-tick" />
              <span className="rail-label">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="hint">
          Swipe up/down, scroll, or tap points to move through the journey
        </div>
      </div>
    </div>
  )
}