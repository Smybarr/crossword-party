import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { Clue } from '@/lib/types'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

interface ClueContextValue {
  lastChange: Clue | null
  changeCount: number
}

const ClueCtx = createContext<ClueContextValue>({ lastChange: null, changeCount: 0 })

export function useClueChanges() {
  return useContext(ClueCtx)
}

export function ClueProvider({ children }: { children: ReactNode }) {
  const [lastChange, setLastChange] = useState<Clue | null>(null)
  const [changeCount, setChangeCount] = useState(0)

  const handleChange = useCallback(
    (payload: RealtimePostgresChangesPayload<{ [key: string]: unknown }>) => {
      if (payload.eventType === 'UPDATE') {
        setLastChange(payload.new as unknown as Clue)
        setChangeCount((c) => c + 1)
      }
    },
    []
  )

  useEffect(() => {
    const channel = supabase
      .channel('clue-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'clues' },
        handleChange
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [handleChange])

  return (
    <ClueCtx.Provider value={{ lastChange, changeCount }}>
      {children}
    </ClueCtx.Provider>
  )
}
