import { useState, useCallback, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ClueCard } from '@/components/ClueCard'
import { ClueFilters, type FilterValues } from '@/components/ClueFilters'
import { SolveDialog } from '@/components/SolveDialog'
import { FlagDialog } from '@/components/FlagDialog'
import { DisputeActions } from '@/components/DisputeActions'
import { searchClues, fetchNearbyClues } from '@/lib/queries'
import { useClueChanges } from '@/components/ClueContext'
import { useSearchState } from '@/hooks/useSearchParams'
import { Search, SlidersHorizontal } from 'lucide-react'
import type { Clue, ClueDirection } from '@/lib/types'

const PAGE_SIZE = 20
const CACHE_KEY = 'crossword-search-cache'
const MAX_CACHED_RESULTS = 40

interface SearchCache {
  query: string
  filters: FilterValues
  results: Clue[]
}

function loadCache(): SearchCache | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveCache(query: string, filters: FilterValues, results: Clue[]) {
  try {
    const data: SearchCache = { query, filters, results: results.slice(0, MAX_CACHED_RESULTS) }
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data))
  } catch {
    // storage full — ignore
  }
}

function cacheMatches(cache: SearchCache, query: string, filters: FilterValues): boolean {
  return (
    cache.query === query &&
    JSON.stringify(cache.filters) === JSON.stringify(filters)
  )
}

export function SearchBrowse() {
  const { initialQuery, initialFilters, syncToUrl } = useSearchState()
  const [query, setQuery] = useState(initialQuery)
  const [filters, setFilters] = useState<FilterValues>(initialFilters)
  const cached = useRef(loadCache())
  const hasInitialParams = initialQuery || Object.values(initialFilters).some((v) => v != null)
  const cacheHit = cached.current && hasInitialParams && cacheMatches(cached.current, initialQuery, initialFilters)
  const [results, setResults] = useState<Clue[]>(cacheHit ? cached.current!.results : [])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [searched, setSearched] = useState(!!cacheHit)
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
        const trimmed = query.trim()
        const isNumeric = /^\d+$/.test(trimmed)
        const data = await searchClues({
          query: isNumeric ? undefined : trimmed || undefined,
          number: isNumeric ? Number(trimmed) : undefined,
          direction: filters.direction,
          statuses: filters.statuses,
          pageMin: filters.pageMin,
          pageMax: filters.pageMax,
          numberMin: filters.numberMin,
          numberMax: filters.numberMax,
          limit: PAGE_SIZE,
          offset,
        })
        if (offset === 0) {
          setResults(data)
          saveCache(query, filters, data)
        } else {
          setResults((prev) => {
            const combined = [...prev, ...data]
            saveCache(query, filters, combined)
            return combined
          })
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
      syncToUrl(query, filters)
      doSearch(0)
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [doSearch, query, filters, syncToUrl])

  function updateClue(updated: Clue) {
    setResults((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
  }

  async function browseNearby(clue: Clue) {
    setLoading(true)
    try {
      const data = await fetchNearbyClues(clue.number, clue.direction as ClueDirection)
      const newFilters: FilterValues = {
        ...filters,
        direction: clue.direction as ClueDirection,
        acrossChecked: clue.direction === 'Across',
        downChecked: clue.direction === 'Down',
      }
      setQuery('')
      setFilters(newFilters)
      setResults(data)
      setHasMore(false)
      setSearched(true)
      syncToUrl('', newFilters)
      saveCache('', newFilters, data)
    } catch (err) {
      console.error('Browse nearby failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search clues or enter a number..."
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
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => browseNearby(clue)}
                  className="w-full"
                >
                  Browse Nearby Clues
                </Button>
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
