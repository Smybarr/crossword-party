import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useIdentityContext } from '@/components/IdentityContext'
import type { Clue } from '@/lib/types'
import { flagClue } from '@/lib/queries'
import { toast } from 'sonner'

interface FlagDialogProps {
  clue: Clue | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onFlagged: (clue: Clue) => void
}

export function FlagDialog({
  clue,
  open,
  onOpenChange,
  onFlagged,
}: FlagDialogProps) {
  const { displayName } = useIdentityContext()
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!clue || !reason.trim() || !displayName) return

    setSubmitting(true)
    try {
      const updated = await flagClue(clue.id, displayName, reason.trim(), clue)
      onFlagged(updated)
      toast.success('Clue flagged for review')
      setReason('')
      onOpenChange(false)
    } catch (err) {
      toast.error('Failed to flag clue')
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
            Flag {clue?.number} {clue?.direction}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Why is this answer wrong?</label>
            <Textarea
              placeholder="e.g. Answer doesn't fit, wrong number of letters..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              variant="destructive"
              disabled={submitting || !reason.trim()}
            >
              {submitting ? 'Flagging...' : 'Flag Clue'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
