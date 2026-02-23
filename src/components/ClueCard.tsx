import { useState } from 'react'
import type { Clue } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useIdentityContext } from '@/components/IdentityContext'
import { cn } from '@/lib/utils'
import { markSolved } from '@/lib/queries'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'

interface ClueCardProps {
  clue: Clue
  actions?: React.ReactNode
  inlineSolve?: {
    onSolved: (clue: Clue) => void
  }
}

const statusColors: Record<string, string> = {
  unsolved: 'bg-secondary text-secondary-foreground',
  solved: 'bg-primary/10 text-primary',
  flagged: 'bg-destructive/10 text-destructive',
}

function InlineSolveForm({ clue, onSolved }: {
  clue: Clue
  onSolved: (clue: Clue) => void
}) {
  const { displayName } = useIdentityContext()
  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!answer.trim() || !displayName) return

    setSubmitting(true)
    try {
      const updated = await markSolved(clue.id, answer.trim(), displayName)
      onSolved(updated)
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } })
      toast.success(`Solved! ${answer.trim().toUpperCase()}`)
      setAnswer('')
    } catch (err) {
      toast.error('Failed to submit answer')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 pt-1">
      <Input
        placeholder="Enter answer"
        value={answer}
        onChange={(e) => setAnswer(e.target.value.toUpperCase())}
        className="font-mono tracking-wider uppercase"
      />
      <Button
        type="submit"
        disabled={submitting || !answer.trim()}
        className="w-full"
      >
        {submitting ? 'Submitting...' : 'Submit Answer'}
      </Button>
    </form>
  )
}

export function ClueCard({ clue, actions, inlineSolve }: ClueCardProps) {
  return (
    <Card className={cn(
      'transition-colors',
      clue.status === 'solved' && 'border-primary/30',
      clue.status === 'flagged' && 'border-destructive/30',
    )}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-bold text-lg">
              {clue.number}
            </span>
            <Badge variant="outline">{clue.direction}</Badge>
            <Badge variant="outline" className="text-xs">
              p.{clue.page}
            </Badge>
          </div>
          <Badge className={statusColors[clue.status]}>
            {clue.status}
          </Badge>
        </div>

        <p className="text-base leading-relaxed">{clue.text}</p>

        {clue.status === 'solved' && clue.answer && (
          <div className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground font-mono tracking-wider">
              {clue.answer}
            </span>
            {clue.solved_by && (
              <span> — solved by {clue.solved_by}</span>
            )}
          </div>
        )}

        {clue.status === 'flagged' && (
          <div className="text-sm text-destructive">
            Flagged{clue.flagged_by ? ` by ${clue.flagged_by}` : ''}
            {clue.flagged_reason ? `: ${clue.flagged_reason}` : ''}
          </div>
        )}

        {clue.status === 'unsolved' && inlineSolve && (
          <InlineSolveForm clue={clue} {...inlineSolve} />
        )}

        {actions && <div className="flex gap-2 pt-1">{actions}</div>}
      </CardContent>
    </Card>
  )
}
