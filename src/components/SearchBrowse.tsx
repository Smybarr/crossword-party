import { useState, useCallback, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ClueCard } from '@/components/ClueCard'
import { ClueFilters, type FilterValues } from '@/components/ClueFilters'
import { SolveDialog } from '@/components/SolveDialog'
import { FlagDialog } from '@/components/FlagDialog'
import { DisputeActions } from '@/components/DisputeActions'
import { searchClues } from '@/lib/queries'
import { useClueChanges } from '@/components/ClueContext'
import { Search, SlidersHorizontal } from 'lucide-react'
import type { Clue } from '@/lib/types'

const PAGE_SIZE = 20

export function SearchBrowse() {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<FilterValues>({})
  const [results, setResults] = useState<Clue[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [searched, setSearched] = useState(false)
  const { lastChange } = useClueChanges()
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const [filtersOpen, setFiltersOpen] = useState(false)
  const [solveClue, setSolveClue] = useState<Clue | null>(null)
  const [recordClue, setRecordClue] = useState<Clue | null>(null)
  const [flagClue, setFlagClue] = useState<Clue | null>(null)

  // Update results when a clue changes via realtime
  useEffect(() => {
    if (!lastChange) return
    setResults((prev) =>
      prev.map((c) => (c.id === lastChange.id ? lastChange : c))
    )
  }, [lastChange])

  const doSearch = useCallback(
    async (offset = 0) => {
      setLoading(true)
      try {
        const data = await searchClues({
          query: query.trim() || undefined,
          direction: filters.direction,
          statuses: filters.statuses,
          pageMin: filters.pageMin,
          pageMax: filters.pageMax,
          limit: PAGE_SIZE,
          offset,
        })
        if (offset === 0) {
          setResults(data)
        } else {
          setResults((prev) => [...prev, ...data])
        }
        setHasMore(data.length === PAGE_SIZE)
        setSearched(true)
      } catch (err) {
        console.error('Search failed:', err)
      } finally {
        setLoading(false)
      }
    },
    [query, filters]
  )

  // Debounced search on query/filter change
  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      doSearch(0)
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [doSearch])

  function updateClue(updated: Clue) {
    setResults((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
  }

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search clue text..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setFiltersOpen((o) => !o)}
          aria-label="Toggle filters"
          aria-expanded={filtersOpen}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {filtersOpen && <ClueFilters values={filters} onChange={setFilters} />}

      {loading && results.length === 0 && (
        <p className="text-center text-muted-foreground py-8">Searching...</p>
      )}

      {searched && !loading && results.length === 0 && (
        <p className="text-center text-muted-foreground py-8">No clues found</p>
      )}

      <div className="space-y-3">
        {results.map((clue) => (
          <ClueCard
            key={clue.id}
            clue={clue}
            actions={
              <div className="flex flex-col gap-2 w-full">
                {clue.status === 'unsolved' && (
                  <div className="flex gap-2 w-full">
                    <Button
                      size="sm"
                      onClick={() => setSolveClue(clue)}
                      className="flex-1"
                    >
                      Solve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRecordClue(clue)}
                      className="flex-1"
                    >
                      Record Existing
                    </Button>
                  </div>
                )}
                {clue.status === 'solved' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setFlagClue(clue)}
                    className="flex-1"
                  >
                    Flag
                  </Button>
                )}
                {clue.status === 'flagged' && (
                  <DisputeActions clue={clue} onUpdated={updateClue} />
                )}
                {clue.status === 'verified' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setFlagClue(clue)}
                    className="flex-1"
                  >
                    Flag
                  </Button>
                )}
              </div>
            }
          />
        ))}
      </div>

      {hasMore && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => doSearch(results.length)}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Load More'}
        </Button>
      )}

      <SolveDialog
        clue={solveClue}
        open={!!solveClue}
        onOpenChange={(open) => !open && setSolveClue(null)}
        onSolved={(updated) => {
          updateClue(updated)
          setSolveClue(null)
        }}
      />

      <SolveDialog
        clue={recordClue}
        open={!!recordClue}
        onOpenChange={(open) => !open && setRecordClue(null)}
        onSolved={(updated) => {
          updateClue(updated)
          setRecordClue(null)
        }}
        mode="record"
      />

      <FlagDialog
        clue={flagClue}
        open={!!flagClue}
        onOpenChange={(open) => !open && setFlagClue(null)}
        onFlagged={(updated) => {
          updateClue(updated)
          setFlagClue(null)
        }}
      />
    </div>
  )
}
