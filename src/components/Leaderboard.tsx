import { useState, useEffect } from 'react'
import { Progress } from '@/components/ui/progress'
import { ActivityFeed } from '@/components/ActivityFeed'
import { useProgress } from '@/hooks/useProgress'
import { useClueChanges } from '@/components/ClueContext'
import { useIdentityContext } from '@/components/IdentityContext'
import { fetchLeaderboard } from '@/lib/queries'
import { cn } from '@/lib/utils'

interface LeaderboardEntry {
  solved_by: string
  solve_count: number
  rank: number
}

export function Leaderboard() {
  const { stats, loading: statsLoading, refresh } = useProgress()
  const { changeCount } = useClueChanges()
  const { displayName } = useIdentityContext()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  async function loadLeaderboard() {
    try {
      const data = await fetchLeaderboard()
      setEntries(data)
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLeaderboard()
  }, [])

  useEffect(() => {
    if (changeCount > 0) {
      refresh()
      loadLeaderboard()
    }
  }, [changeCount, refresh])

  const completed = stats ? stats.solved + stats.verified : 0
  const pct = stats && stats.total > 0 ? Math.round((completed / stats.total) * 100) : 0

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      {!statsLoading && stats && (
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl font-bold">{pct}% Complete</h2>
            <span className="text-sm text-muted-foreground">
              {completed.toLocaleString()} / {stats.total.toLocaleString()}
            </span>
          </div>
          <Progress value={pct} className="h-3" />
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading leaderboard...</p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">No solves yet</p>
      ) : (
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-3 py-2 font-medium">Rank</th>
                <th className="text-left px-3 py-2 font-medium">Name</th>
                <th className="text-right px-3 py-2 font-medium">Solved</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                const isMe = displayName?.toLowerCase() === entry.solved_by.toLowerCase()
                return (
                  <tr
                    key={entry.solved_by}
                    className={cn(
                      'border-b last:border-0',
                      isMe && 'bg-primary/5 font-semibold'
                    )}
                  >
                    <td className="px-3 py-2 tabular-nums">{entry.rank}</td>
                    <td className="px-3 py-2">{entry.solved_by}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{entry.solve_count}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <ActivityFeed />
    </div>
  )
}
