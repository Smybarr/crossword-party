import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { ClueCard } from '@/components/ClueCard'
import { SolveDialog } from '@/components/SolveDialog'
import { fetchRandomClue } from '@/lib/queries'
import { useClueChanges } from '@/components/ClueContext'
import type { Clue } from '@/lib/types'

export function RandomClue() {
  const [loading, setLoading] = useState(false)
  const [recordClue, setRecordClue] = useState<Clue | null>(null)
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
        // Truncate any forward history and append
        const newHistory = historyRef.current.slice(0, index + 1)
        newHistory.push(data)
        historyRef.current = newHistory
        setIndex(newHistory.length - 1)
      }
    } catch (err) {
      console.error('Failed to fetch random clue:', err)
    } finally {
      setLoading(false)
    }
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
              onSolved: (updated) => {
                historyRef.current[index] = updated
                setIndex((i) => i)
              },
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

      <div className="flex gap-2">
        {canGoBack && (
          <Button
            variant="outline"
            onClick={() => setIndex((i) => i - 1)}
            className="h-14 text-lg font-bold"
            size="lg"
          >
            Previous
          </Button>
        )}
        {canGoForward ? (
          <Button
            variant="outline"
            onClick={() => setIndex((i) => i + 1)}
            className="flex-1 h-14 text-lg font-bold"
            size="lg"
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={getNewClue}
            disabled={loading}
            className="flex-1 h-14 text-lg font-bold"
            size="lg"
          >
            {loading ? 'Finding a clue...' : 'Give Me Another Clue!'}
          </Button>
        )}
      </div>

      <SolveDialog
        clue={recordClue}
        open={!!recordClue}
        onOpenChange={(open) => !open && setRecordClue(null)}
        onSolved={(updated) => {
          historyRef.current[index] = updated
          setIndex((i) => i)
          setRecordClue(null)
        }}
        mode="record"
      />
    </div>
  )
}
