import { useState, useEffect } from 'react'

const BREAKPOINTS = {
  xs: 0,
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280
}

function getBreakpoint(width) {
  if (width >= BREAKPOINTS.xl) return 'xl'
  if (width >= BREAKPOINTS.lg) return 'lg'
  if (width >= BREAKPOINTS.md) return 'md'
  if (width >= BREAKPOINTS.sm) return 'sm'
  return 'xs'
}

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState(() =>
    getBreakpoint(typeof window !== 'undefined' ? window.innerWidth : 1280)
  )

  useEffect(() => {
    let rafId
    const handleResize = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        setBreakpoint(getBreakpoint(window.innerWidth))
      })
    }

    window.addEventListener('resize', handleResize, { passive: true })
    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return breakpoint
}

export function useIsMobile() {
  const bp = useBreakpoint()
  const [isPortrait, setIsPortrait] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(orientation: portrait)').matches : false
  )

  useEffect(() => {
    const mq = window.matchMedia('(orientation: portrait)')
    const handler = (e) => setIsPortrait(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return bp === 'xs' || bp === 'sm' || ((bp === 'md' || bp === 'lg') && isPortrait)
}
