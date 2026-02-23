import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useIdentityContext } from '@/components/IdentityContext'
import type { Clue } from '@/lib/types'
import { markSolved } from '@/lib/queries'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'

interface SolveDialogProps {
  clue: Clue | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSolved: (clue: Clue) => void
}

export function SolveDialog({
  clue,
  open,
  onOpenChange,
  onSolved,
}: SolveDialogProps) {
  const { displayName } = useIdentityContext()
  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!clue || !answer.trim() || !displayName) return

    setSubmitting(true)
    try {
      const updated = await markSolved(clue.id, answer.trim(), displayName)
      onSolved(updated)
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } })
      toast.success(`Solved! ${answer.trim().toUpperCase()}`)
      setAnswer('')
      onOpenChange(false)
    } catch (err) {
      toast.error('Failed to submit answer')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Solve {clue?.number} {clue?.direction}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Answer</label>
            <Input
              placeholder="Enter answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value.toUpperCase())}
              className="font-mono tracking-wider uppercase"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting || !answer.trim()}>
              {submitting ? 'Submitting...' : 'Submit Answer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
