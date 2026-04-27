import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

export function useScrollSpy() {
  const [activeId, setActiveId] = useState(null)
  const location = useLocation()
  const visibleRef = useRef(new Set())

  useEffect(() => {
    visibleRef.current = new Set()
    setActiveId(null)

    // Wait a tick for the DOM to settle after route change
    const tid = setTimeout(() => {
      const elements = Array.from(
        document.querySelectorAll('.subcategory-section[id]')
      )
      if (!elements.length) return

      function updateActive() {
        const first = elements.find((el) => visibleRef.current.has(el.id))
        setActiveId(first?.id ?? null)
      }

      // rootMargin: top offset keeps the header region out of the trigger zone;
      // bottom offset means only sections in the upper portion of the viewport
      // are considered "active" — avoids premature activation of next section.
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              visibleRef.current.add(entry.target.id)
            } else {
              visibleRef.current.delete(entry.target.id)
            }
          }
          updateActive()
        },
        { rootMargin: '-10% 0px -75% 0px', threshold: 0 }
      )

      elements.forEach((el) => observer.observe(el))

      return () => {
        observer.disconnect()
        visibleRef.current = new Set()
      }
    }, 50)

    return () => clearTimeout(tid)
  }, [location.pathname])

  return activeId
}
