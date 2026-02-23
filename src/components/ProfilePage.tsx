import { useEffect, useState } from 'react'
import { useIdentityContext } from '@/components/IdentityContext'
import { fetchLeaderboard } from '@/lib/queries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function ProfilePage() {
  const { displayName, profile, signOut } = useIdentityContext()
  const [stats, setStats] = useState<{ rank: number; solveCount: number } | null>(null)

  const initials = profile
    ? `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`.toUpperCase()
    : ''

  const memberSince = profile
    ? new Date(profile.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  useEffect(() => {
    if (!displayName) return
    fetchLeaderboard(100).then((entries) => {
      const entry = entries.find((e) => e.solved_by === displayName)
      if (entry) {
        setStats({ rank: entry.rank, solveCount: entry.solve_count })
      } else {
        setStats({ rank: 0, solveCount: 0 })
      }
    })
  }, [displayName])

  return (
    <div className="p-4 space-y-6 max-w-md mx-auto">
      <div className="flex flex-col items-center gap-2 pt-4">
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold">
          {initials}
        </div>
        <h2 className="text-xl font-semibold">{displayName}</h2>
        {memberSince && (
          <p className="text-sm text-muted-foreground">Member since {memberSince}</p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Stats</CardTitle>
        </CardHeader>
        <CardContent>
          {stats === null ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{stats.solveCount}</div>
                <div className="text-sm text-muted-foreground">Clues Solved</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {stats.rank > 0 ? `#${stats.rank}` : '--'}
                </div>
                <div className="text-sm text-muted-foreground">Leaderboard Rank</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => signOut()}
      >
        Sign out
      </Button>
    </div>
  )
}
