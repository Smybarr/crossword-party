import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ClueCard } from '@/components/ClueCard'
import { DisputeActions } from '@/components/DisputeActions'
import { FlagDialog } from '@/components/FlagDialog'
import { SolveDialog } from '@/components/SolveDialog'
import { fetchRandomClue } from '@/lib/queries'
import { useClueChanges } from '@/components/ClueContext'
import type { Clue } from '@/lib/types'

const statusColors: Record<string, string> = {
  unsolved: 'bg-secondary text-secondary-foreground',
  solved: 'bg-primary/10 text-primary',
  flagged: 'bg-destructive/10 text-destructive',
  verified: 'bg-green-500/10 text-green-700',
}

export function RandomClue() {
  const [loading, setLoading] = useState(false)
  const [recordClue, setRecordClue] = useState<Clue | null>(null)
  const [flagClue, setFlagClue] = useState<Clue | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const { lastChange } = useClueChanges()

  // Browser-style history: a list of clues and a cursor index
  const historyRef = useRef<Clue[]>([])
  const [index, setIndex] = useState(-1)

  const clue = index >= 0 ? historyRef.current[index] : null
  const canGoBack = index > 0
  const canGoForward = index < historyRef.current.length - 1

  // Update displayed clue and history if it changes via realtime
  useEffect(() => {
    if (!lastChange) return
    historyRef.current = historyRef.current.map((c) =>
      c.id === lastChange.id ? lastChange : c
    )
    // Force re-render if current clue was updated
    if (clue && lastChange.id === clue.id) {
      setIndex((i) => i)
    }
  }, [lastChange, clue])

  async function getNewClue() {
    setLoading(true)
    try {
      const data = await fetchRandomClue()
      if (data) {
        historyRef.current.push(data)
        setIndex(historyRef.current.length - 1)
      }
    } catch (err) {
      console.error('Failed to fetch random clue:', err)
    } finally {
      setLoading(false)
    }
  }

  function updateCurrentClue(updated: Clue) {
    historyRef.current[index] = updated
    setIndex((i) => i)
  }

  // Load a random clue on mount
  useEffect(() => {
    getNewClue()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={`p-4 max-w-lg mx-auto flex flex-col ${clue ? '' : 'justify-center h-full'}`}>
      {clue && (
        <div className="mb-4 space-y-2">
          <ClueCard
            clue={clue}
            inlineSolve={{
              onSolved: updateCurrentClue,
            }}
            actions={
              <>
                {clue.status === 'unsolved' && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setRecordClue(clue)}
                  >
                    Record Existing Answer
                  </Button>
                )}
                {(clue.status === 'solved' || clue.status === 'verified') && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setFlagClue(clue)}
                  >
                    Flag
                  </Button>
                )}
                {clue.status === 'flagged' && (
                  <DisputeActions clue={clue} onUpdated={updateCurrentClue} />
                )}
              </>
            }
          />
        </div>
      )}

      <Button
        onClick={getNewClue}
        disabled={loading}
        className="w-full h-14 text-lg font-bold"
        size="lg"
      >
        {loading ? 'Finding a clue...' : 'Give Me Another Clue!'}
      </Button>

      {historyRef.current.length > 0 && (
        <>
          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!canGoBack}
              onClick={() => setIndex((i) => i - 1)}
              className="gap-1"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setHistoryOpen(true)}
            >
              View History
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!canGoForward}
              onClick={() => setIndex((i) => i + 1)}
              className="gap-1"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
            <DialogContent className="max-h-[80vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Clue History</DialogTitle>
              </DialogHeader>
              <div className="overflow-y-auto divide-y border rounded-md -mx-1">
                {[...historyRef.current].reverse().map((entry, revIdx) => {
                  const realIdx = historyRef.current.length - 1 - revIdx
                  const isActive = realIdx === index
                  return (
                    <button
                      key={`${entry.id}-${realIdx}`}
                      className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-accent transition-colors ${
                        isActive ? 'bg-accent/60 font-medium' : ''
                      }`}
                      onClick={() => {
                        setIndex(realIdx)
                        setHistoryOpen(false)
                      }}
                    >
                      <span className="font-mono text-xs shrink-0">
                        {entry.number} {entry.direction}
                      </span>
                      <Badge className={`${statusColors[entry.status]} text-[10px] shrink-0`}>
                        {entry.status}
                      </Badge>
                      <span className="truncate text-muted-foreground text-xs">
                        {entry.text}
                      </span>
                    </button>
                  )
                })}
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}

      <SolveDialog
        clue={recordClue}
        open={!!recordClue}
        onOpenChange={(open) => !open && setRecordClue(null)}
        onSolved={(updated) => {
          updateCurrentClue(updated)
          setRecordClue(null)
        }}
        mode="record"
      />

      <FlagDialog
        clue={flagClue}
        open={!!flagClue}
        onOpenChange={(open) => !open && setFlagClue(null)}
        onFlagged={(updated) => {
          updateCurrentClue(updated)
          setFlagClue(null)
        }}
      />
    </div>
  )
}
