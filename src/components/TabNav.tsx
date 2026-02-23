import type { TabId } from '@/lib/types'
import type { LucideIcon } from 'lucide-react'
import { CircleUserRound, Dices, Search, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: 'random', label: 'Random', icon: Dices },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
  { id: 'profile', label: 'Profile', icon: CircleUserRound },
]

interface TabNavProps {
  active: TabId
  onChange: (tab: TabId) => void
}

export function TabNav({ active, onChange }: TabNavProps) {
  return (
    <nav className="shrink-0 border-t bg-card">
      <div className="flex">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                'flex-1 flex flex-col items-center gap-0.5 py-2 text-xs transition-colors',
                active === tab.id
                  ? 'text-primary font-semibold'
                  : 'text-muted-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {tab.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
