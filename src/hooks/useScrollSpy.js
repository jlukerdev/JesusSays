import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

export function useScrollSpy() {
  const [activeId, setActiveId] = useState(null)
  const location = useLocation()
  const visibleRef = useRef(new Set())

  useEffect(() => {
    visibleRef.current = new Set()
    setActiveId(null)

    const tid = setTimeout(() => {
      const elements = Array.from(
        document.querySelectorAll('.subcategory-section[id]')
      )
      if (!elements.length) return

      function updateActive() {
        const first = elements.find((el) => visibleRef.current.has(el.id))
        setActiveId(first?.id ?? null)
      }

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

export function useBookScrollSpy() {
  const [activeId, setActiveId] = useState(null)
  const location = useLocation()
  const visibleRef = useRef(new Set())

  useEffect(() => {
    visibleRef.current = new Set()
    setActiveId(null)

    const tid = setTimeout(() => {
      const elements = Array.from(
        document.querySelectorAll('.book-chapter[id]')
      )
      if (!elements.length) return

      function updateActive() {
        const first = elements.find((el) => visibleRef.current.has(el.id))
        setActiveId(first?.id ?? null)
      }

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
