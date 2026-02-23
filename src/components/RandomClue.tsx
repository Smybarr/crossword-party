import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ClueCard } from '@/components/ClueCard'
import { SolveDialog } from '@/components/SolveDialog'
import { fetchRandomClue } from '@/lib/queries'
import { useClueChanges } from '@/components/ClueContext'
import type { Clue } from '@/lib/types'

export function RandomClue() {
  const [clue, setClue] = useState<Clue | null>(null)
  const [loading, setLoading] = useState(false)
  const [recordClue, setRecordClue] = useState<Clue | null>(null)
  const { lastChange } = useClueChanges()

  // Update displayed clue if it changes via realtime
  useEffect(() => {
    if (lastChange && clue && lastChange.id === clue.id) {
      setClue(lastChange)
    }
  }, [lastChange, clue])

  const getClue = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchRandomClue()
      setClue(data)
    } catch (err) {
      console.error('Failed to fetch random clue:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Load a random clue on mount
  useEffect(() => {
    getClue()
  }, [getClue])

  return (
    <div className={`p-4 max-w-lg mx-auto flex flex-col ${clue ? '' : 'justify-center h-full'}`}>
      {clue && (
        <div className="mb-4 space-y-2">
          <ClueCard
            clue={clue}
            inlineSolve={{
              onSolved: (updated) => setClue(updated),
            }}
            actions={
              clue.status === 'unsolved' ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setRecordClue(clue)}
                >
                  Record Existing Answer
                </Button>
              ) : undefined
            }
          />
        </div>
      )}

      <Button
        onClick={getClue}
        disabled={loading}
        className="w-full h-14 text-lg font-bold"
        size="lg"
      >
        {loading ? 'Finding a clue...' : 'Give Me Another Clue!'}
      </Button>

      <SolveDialog
        clue={recordClue}
        open={!!recordClue}
        onOpenChange={(open) => !open && setRecordClue(null)}
        onSolved={(updated) => {
          setClue(updated)
          setRecordClue(null)
        }}
        mode="record"
      />
    </div>
  )
}
