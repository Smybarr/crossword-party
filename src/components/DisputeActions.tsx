import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useIdentityContext } from '@/components/IdentityContext'
import { confirmClue, correctClue } from '@/lib/queries'
import { toast } from 'sonner'
import type { Clue } from '@/lib/types'

interface DisputeActionsProps {
  clue: Clue
  onUpdated: (clue: Clue) => void
}

export function DisputeActions({ clue, onUpdated }: DisputeActionsProps) {
  const { displayName } = useIdentityContext()
  const [showCorrection, setShowCorrection] = useState(false)
  const [newAnswer, setNewAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleConfirm() {
    if (!displayName) return
    setSubmitting(true)
    try {
      const { clue: updated, alreadyConfirmed } = await confirmClue(clue.id, displayName)
      onUpdated(updated)
      toast.success(alreadyConfirmed ? 'You already confirmed this answer' : 'Confirmation recorded')
    } catch (err) {
      toast.error('Failed to confirm')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCorrect(e: React.FormEvent) {
    e.preventDefault()
    if (!displayName || !newAnswer.trim()) return
    setSubmitting(true)
    try {
      const updated = await correctClue(clue.id, newAnswer.trim(), displayName)
      onUpdated(updated)
      toast.success('Correction submitted')
      setNewAnswer('')
      setShowCorrection(false)
    } catch (err) {
      toast.error('Failed to submit correction')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">{clue.confirmation_count}/2 confirmations</p>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleConfirm} disabled={submitting} className="flex-1">
          Confirm Answer
        </Button>
        <Button size="sm" variant="outline" onClick={() => setShowCorrection(!showCorrection)} className="flex-1">
          Submit Correction
        </Button>
      </div>
      {showCorrection && (
        <form onSubmit={handleCorrect} className="flex gap-2">
          <Input
            placeholder="Correct answer"
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value.toUpperCase())}
            className="font-mono tracking-wider uppercase"
          />
          <Button type="submit" size="sm" disabled={submitting || !newAnswer.trim()}>
            Submit
          </Button>
        </form>
      )}
    </div>
  )
}
