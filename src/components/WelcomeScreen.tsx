import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useIdentityContext } from '@/components/IdentityContext'

export function WelcomeScreen() {
  const { setDisplayName } = useIdentityContext()
  const [name, setName] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setDisplayName(name.trim())
  }

  return (
    <div className="flex items-center justify-center min-h-dvh bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardContent className="p-6 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Dan's Giant Crossword Party</h1>
            <p className="text-muted-foreground">Pick a display name to get started</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            <Button
              type="submit"
              disabled={!name.trim()}
              className="w-full"
            >
              Start Solving
            </Button>
          </form>
          <p className="text-xs text-center text-muted-foreground">
            You can change this later in settings
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
