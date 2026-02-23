import { useState, useEffect } from 'react'
import { fetchRecentActivity } from '@/lib/queries'
import { useClueChanges } from '@/components/ClueContext'
import type { Clue } from '@/lib/types'
import { Badge } from '@/components/ui/badge'

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function getActivityBadge(clue: Clue) {
  if (clue.status === 'verified') {
    return { label: 'Verified', className: 'text-green-700 border-green-500/30' }
  }
  if (clue.status === 'flagged') {
    return { label: 'Flagged', className: 'text-destructive border-destructive/30' }
  }
  if (clue.status === 'solved' && clue.is_recorded) {
    return { label: 'Recorded', className: 'text-primary border-primary/30' }
  }
  return { label: 'Solved', className: 'text-primary border-primary/30' }
}

export function ActivityFeed() {
  const [activity, setActivity] = useState<Clue[]>([])
  const [loading, setLoading] = useState(true)
  const { lastChange, changeCount } = useClueChanges()

  useEffect(() => {
    fetchRecentActivity(30)
      .then(setActivity)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Prepend realtime changes
  useEffect(() => {
    if (!lastChange || !['solved', 'flagged', 'verified'].includes(lastChange.status)) return
    setActivity((prev) => {
      const filtered = prev.filter((c) => c.id !== lastChange.id)
      return [lastChange, ...filtered].slice(0, 30)
    })
  }, [lastChange, changeCount])

  if (loading) return <p className="text-sm text-muted-foreground">Loading activity...</p>
  if (activity.length === 0) return <p className="text-sm text-muted-foreground">No activity yet</p>

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-sm">Recent Activity</h3>
      <div className="space-y-1">
        {activity.map((clue) => {
          const badge = getActivityBadge(clue)
          return (
            <div
              key={clue.id}
              className="flex items-center justify-between text-sm py-1.5 px-2 rounded hover:bg-accent/50"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Badge variant="outline" className={badge.className}>
                  {badge.label}
                </Badge>
                <span className="font-mono text-xs">
                  {clue.number} {clue.direction}
                </span>
                {(clue.status === 'solved' || clue.status === 'verified') && clue.answer && (
                  <span className="font-mono text-xs text-muted-foreground truncate">
                    {clue.answer}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0 text-xs text-muted-foreground">
                <span>{clue.solved_by || clue.flagged_by}</span>
                <span>{timeAgo(clue.updated_at)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
