import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { useIdentity } from '@/hooks/useIdentity'

interface IdentityContextValue {
  displayName: string | null
  setDisplayName: (name: string) => void
}

const IdentityContext = createContext<IdentityContextValue | null>(null)

export function IdentityProvider({ children }: { children: ReactNode }) {
  const identity = useIdentity()
  return (
    <IdentityContext.Provider value={identity}>
      {children}
    </IdentityContext.Provider>
  )
}

export function useIdentityContext(): IdentityContextValue {
  const ctx = useContext(IdentityContext)
  if (!ctx) throw new Error('useIdentityContext must be used within IdentityProvider')
  return ctx
}
