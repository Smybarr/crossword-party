import { useState, useEffect, useCallback } from 'react'
import type { ClueStats } from '@/lib/types'
import { fetchClueStats } from '@/lib/queries'

export function useProgress() {
  const [stats, setStats] = useState<ClueStats | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const data = await fetchClueStats()
      setStats(data)
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { stats, loading, refresh }
}
