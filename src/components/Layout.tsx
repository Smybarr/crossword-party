import type { ReactNode } from 'react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useIdentityContext } from '@/components/IdentityContext'

interface LayoutProps {
  children: ReactNode
  onProfileTap: () => void
}

export function Layout({ children, onProfileTap }: LayoutProps) {
  const { displayName, profile } = useIdentityContext()

  const initials = profile
    ? `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`.toUpperCase()
    : ''

  return (
    <div className="flex flex-col h-dvh bg-background">
      <header className="shrink-0 border-b bg-card px-4 py-3">
        <div className="flex items-center">
          <button
            onClick={onProfileTap}
            className="flex items-center justify-center h-7 w-7 rounded-full bg-primary text-primary-foreground text-xs font-medium shrink-0"
            title={displayName ?? undefined}
          >
            {initials}
          </button>
          <h1 className="text-lg font-bold text-center flex-1">
            Dan's Giant Crossword Party
          </h1>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
