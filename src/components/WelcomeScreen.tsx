import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useIdentityContext } from '@/components/IdentityContext'

type Step = 'email' | 'name' | 'sent'

export function WelcomeScreen() {
  const { quickSignIn, sendMagicLink } = useIdentityContext()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const { exists } = await quickSignIn(email.trim())
      if (!exists) {
        setStep('name')
      }
      // If exists, verifyOtp already ran — onAuthStateChange will pick up the session
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleNameSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await sendMagicLink(email.trim(), firstName.trim(), lastName.trim())
      setStep('sent')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-dvh bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardContent className="p-6 space-y-8">
          <div className="text-center space-y-3">
            <h1 className="text-2xl font-bold">Dan's Giant Crossword Party</h1>
            <p className="text-lg text-muted-foreground">
              {step === 'name' ? 'One more thing...' : 'Sign in to get started'}
            </p>
            <p className="text-xs text-muted-foreground">
              Email sign-in lets us track your solves and show you on the leaderboard.
            </p>
          </div>

          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button
                type="submit"
                disabled={!email.trim() || submitting}
                className="w-full"
              >
                {submitting ? 'Signing in...' : 'Continue'}
              </Button>
            </form>
          )}

          {step === 'name' && (
            <form onSubmit={handleNameSubmit} className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Looks like you're new! Enter your name so we know who you are.
              </p>
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
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button
                type="submit"
                disabled={!firstName.trim() || !lastName.trim() || submitting}
                className="w-full"
              >
                {submitting ? 'Sending...' : 'Send Magic Link'}
              </Button>
              <button
                type="button"
                className="block w-full text-xs text-center text-muted-foreground underline hover:text-foreground transition-colors"
                onClick={() => { setStep('email'); setError(null) }}
              >
                Use a different email
              </button>
            </form>
          )}

          {step === 'sent' && (
            <div className="text-center space-y-3">
              <p className="text-sm font-medium">Check your email for a magic link!</p>
              <p className="text-xs text-muted-foreground">
                We sent a sign-in link to <span className="font-medium">{email}</span>
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setStep('email'); setEmail(''); setError(null) }}
              >
                Use a different email
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
