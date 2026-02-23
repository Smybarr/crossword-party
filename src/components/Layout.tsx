import type { ReactNode } from 'react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useIdentityContext } from '@/components/IdentityContext'
import { Button } from '@/components/ui/button'

export function Layout({ children }: { children: ReactNode }) {
  const { displayName, signOut } = useIdentityContext()

  return (
    <div className="flex flex-col h-dvh bg-background">
      <header className="shrink-0 border-b bg-card px-4 py-3">
        <div className="flex items-center">
          <div className="flex items-center gap-2">
            <span
              className="text-xs text-muted-foreground truncate max-w-[100px]"
              title={displayName ?? undefined}
            >
              {displayName}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => signOut()}
            >
              Sign out
            </Button>
          </div>
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
