import { useMemo, useCallback } from 'react'
import type { FilterValues } from '@/components/ClueFilters'
import type { ClueDirection, ClueStatus } from '@/lib/types'

const VALID_DIRECTIONS = new Set<string>(['Across', 'Down'])
const VALID_STATUSES = new Set<string>(['unsolved', 'solved', 'flagged', 'verified'])

function parseParams(search: string) {
  const params = new URLSearchParams(search)

  const query = params.get('q') ?? ''

  const dir = params.get('dir')
  const direction: ClueDirection | null =
    dir && VALID_DIRECTIONS.has(dir) ? (dir as ClueDirection) : null

  const stRaw = params.get('st')
  const statuses: ClueStatus[] | undefined = stRaw
    ? (stRaw.split(',').filter((s) => VALID_STATUSES.has(s)) as ClueStatus[])
    : undefined

  const pmin = params.get('pmin')
  const pmax = params.get('pmax')
  const nmin = params.get('nmin')
  const nmax = params.get('nmax')

  const filters: FilterValues = {
    direction,
    acrossChecked: direction === null ? true : direction === 'Across',
    downChecked: direction === null ? true : direction === 'Down',
    statuses,
    pageMin: pmin ? Number(pmin) : null,
    pageMax: pmax ? Number(pmax) : null,
    numberMin: nmin ? Number(nmin) : null,
    numberMax: nmax ? Number(nmax) : null,
  }

  return { query, filters }
}

function buildSearch(query: string, filters: FilterValues): string {
  const params = new URLSearchParams()

  if (query) params.set('q', query)
  if (filters.direction) params.set('dir', filters.direction)
  if (filters.statuses?.length) params.set('st', filters.statuses.join(','))
  if (filters.pageMin != null) params.set('pmin', String(filters.pageMin))
  if (filters.pageMax != null) params.set('pmax', String(filters.pageMax))
  if (filters.numberMin != null) params.set('nmin', String(filters.numberMin))
  if (filters.numberMax != null) params.set('nmax', String(filters.numberMax))

  const str = params.toString()
  return str ? `?${str}` : ''
}

export function useSearchState() {
  const { query: initialQuery, filters: initialFilters } = useMemo(
    () => parseParams(window.location.search),
    []
  )

  const syncToUrl = useCallback((query: string, filters: FilterValues) => {
    const search = buildSearch(query, filters)
    const url = window.location.pathname + search + window.location.hash
    history.replaceState(null, '', url)
  }, [])

  return { initialQuery, initialFilters, syncToUrl }
}
