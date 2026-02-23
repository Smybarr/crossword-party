import { useState } from 'react'
import type { ReactNode } from 'react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useIdentityContext } from '@/components/IdentityContext'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function Layout({ children }: { children: ReactNode }) {
  const { displayName, setDisplayName } = useIdentityContext()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(displayName ?? '')

  function handleSave() {
    if (draft.trim()) {
      setDisplayName(draft.trim())
      setEditing(false)
    }
  }

  return (
    <div className="flex flex-col h-dvh bg-background">
      <header className="shrink-0 border-b bg-card px-4 py-3">
        <div className="flex items-center">
          {editing ? (
            <form
              onSubmit={(e) => { e.preventDefault(); handleSave() }}
              className="flex items-center gap-1"
            >
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="h-7 w-28 text-xs"
                autoFocus
              />
              <Button type="submit" size="sm" variant="ghost" className="h-7 px-2 text-xs">
                Save
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs"
                onClick={() => { setDraft(displayName ?? ''); setEditing(false) }}
              >
                Cancel
              </Button>
            </form>
          ) : (
            <button
              onClick={() => { setDraft(displayName ?? ''); setEditing(true) }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors truncate max-w-[100px]"
              title="Click to change name"
            >
              {displayName}
            </button>
          )}
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
