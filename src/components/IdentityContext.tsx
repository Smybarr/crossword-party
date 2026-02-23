import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { useAuth } from '@/hooks/useAuth'
import type { Profile } from '@/lib/types'

interface IdentityContextValue {
  session: Session | null
  profile: Profile | null
  loading: boolean
  displayName: string | null
  quickSignIn: (email: string) => Promise<{ exists: boolean }>
  sendMagicLink: (email: string, firstName: string, lastName: string) => Promise<void>
  signOut: () => Promise<void>
}

const IdentityContext = createContext<IdentityContextValue | null>(null)

export function IdentityProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()
  return (
    <IdentityContext.Provider
      value={{
        ...auth,
        displayName: auth.profile?.display_name ?? null,
      }}
    >
      {children}
    </IdentityContext.Provider>
  )
}

export function useIdentityContext(): IdentityContextValue {
  const ctx = useContext(IdentityContext)
  if (!ctx) throw new Error('useIdentityContext must be used within IdentityProvider')
  return ctx
}
