import { useState, useCallback } from 'react'

const STORAGE_KEY = 'crossword-identity'

function loadIdentity(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function useIdentity() {
  const [displayName, setDisplayNameState] = useState<string | null>(loadIdentity)

  const setDisplayName = useCallback((name: string) => {
    localStorage.setItem(STORAGE_KEY, name)
    setDisplayNameState(name)
  }, [])

  return { displayName, setDisplayName }
}
