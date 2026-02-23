import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useIdentityContext } from '@/components/IdentityContext'

type Mode = 'signup' | 'signin'

export function WelcomeScreen() {
  const { signUp, signIn } = useIdentityContext()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      if (mode === 'signup') {
        await signUp(email.trim(), firstName.trim(), lastName.trim())
      } else {
        await signIn(email.trim())
      }
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const canSubmit =
    email.trim() &&
    (mode === 'signin' || (firstName.trim() && lastName.trim()))

  return (
    <div className="flex items-center justify-center min-h-dvh bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardContent className="p-6 space-y-8">
          <div className="text-center space-y-3">
            <h1 className="text-2xl font-bold">Dan's Giant Crossword Party</h1>
            <p className="text-lg text-muted-foreground">
              {mode === 'signin' ? 'Sign in to get started' : 'Create your account'}
            </p>
            <p className="text-xs text-muted-foreground">
              Email sign-in lets us track your solves and show you on the leaderboard.
            </p>
          </div>

          {sent ? (
            <div className="text-center space-y-3">
              <p className="text-sm font-medium">Check your email for a magic link!</p>
              <p className="text-xs text-muted-foreground">
                We sent a sign-in link to <span className="font-medium">{email}</span>
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setSent(false); setEmail('') }}
              >
                Use a different email
              </Button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      autoFocus
                    />
                    <Input
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                )}
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus={mode === 'signin'}
                />
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
                <Button
                  type="submit"
                  disabled={!canSubmit || submitting}
                  className="w-full"
                >
                  {submitting ? 'Sending...' : 'Send Magic Link'}
                </Button>
              </form>

              <p className="text-xs text-center text-muted-foreground">
                {mode === 'signin' ? (
                  <>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      className="underline hover:text-foreground transition-colors"
                      onClick={() => setMode('signup')}
                    >
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button
                      type="button"
                      className="underline hover:text-foreground transition-colors"
                      onClick={() => setMode('signin')}
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
