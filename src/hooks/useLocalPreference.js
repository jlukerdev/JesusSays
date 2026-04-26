import { useState, useEffect } from 'react'

export function useLocalPreference(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored !== null ? JSON.parse(stored) : defaultValue
    } catch {
      return defaultValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // localStorage unavailable (e.g. private browsing quota exceeded)
    }
  }, [key, value])

  return [value, setValue]
}
