import { useState, useCallback } from 'react'

const STORAGE_KEY = 'crossword-recent-names'
const MAX_NAMES = 5

function loadNames(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function useRecentNames() {
  const [names, setNames] = useState<string[]>(loadNames)

  const addName = useCallback((name: string) => {
    setNames((prev) => {
      const filtered = prev.filter((n) => n.toLowerCase() !== name.toLowerCase())
      const next = [name, ...filtered].slice(0, MAX_NAMES)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  return { names, addName }
}
