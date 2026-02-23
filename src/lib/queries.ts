import { supabase } from './supabase'
import type { Clue, ClueDirection, ClueStats } from './types'

interface RandomClueFilters {
  direction?: ClueDirection | null
  pageMin?: number | null
  pageMax?: number | null
}

export async function fetchRandomClue(filters?: RandomClueFilters): Promise<Clue | null> {
  const { data, error } = await supabase.rpc('get_random_clue', {
    filter_direction: filters?.direction ?? null,
    filter_page_min: filters?.pageMin ?? null,
    filter_page_max: filters?.pageMax ?? null,
  })
  if (error) throw error
  return (data as Clue[])?.[0] ?? null
}

interface SearchFilters {
  query?: string
  direction?: ClueDirection | null
  status?: string | null
  pageMin?: number | null
  pageMax?: number | null
  limit?: number
  offset?: number
}

export async function searchClues(filters: SearchFilters): Promise<Clue[]> {
  let q = supabase.from('clues').select('*')

  if (filters.query) {
    q = q.ilike('text', `%${filters.query}%`)
  }
  if (filters.direction) {
    q = q.eq('direction', filters.direction)
  }
  if (filters.status) {
    q = q.eq('status', filters.status)
  }
  if (filters.pageMin) {
    q = q.gte('page', filters.pageMin)
  }
  if (filters.pageMax) {
    q = q.lte('page', filters.pageMax)
  }

  q = q.order('number', { ascending: true })
    .range(filters.offset ?? 0, (filters.offset ?? 0) + (filters.limit ?? 20) - 1)

  const { data, error } = await q
  if (error) throw error
  return data as Clue[]
}

export async function markSolved(clueId: string, answer: string, solvedBy: string): Promise<Clue> {
  const { data, error } = await supabase
    .from('clues')
    .update({
      status: 'solved',
      answer: answer.toUpperCase(),
      solved_by: solvedBy,
      solved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', clueId)
    .select()
    .single()
  if (error) throw error
  return data as Clue
}

export async function flagClue(clueId: string, flaggedBy: string, reason: string): Promise<Clue> {
  const { data, error } = await supabase
    .from('clues')
    .update({
      status: 'flagged',
      flagged_by: flaggedBy,
      flagged_reason: reason,
      updated_at: new Date().toISOString(),
    })
    .eq('id', clueId)
    .select()
    .single()
  if (error) throw error
  return data as Clue
}

export async function unflagClue(clueId: string): Promise<Clue> {
  const { data, error } = await supabase
    .from('clues')
    .update({
      status: 'unsolved',
      flagged_by: null,
      flagged_reason: null,
      answer: null,
      solved_by: null,
      solved_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', clueId)
    .select()
    .single()
  if (error) throw error
  return data as Clue
}

export async function fetchClueStats(): Promise<ClueStats> {
  const { data, error } = await supabase.rpc('get_clue_stats')
  if (error) throw error

  const stats: ClueStats = { unsolved: 0, solved: 0, flagged: 0, total: 0 }
  for (const row of data as { status: string; count: number }[]) {
    if (row.status === 'unsolved') stats.unsolved = Number(row.count)
    else if (row.status === 'solved') stats.solved = Number(row.count)
    else if (row.status === 'flagged') stats.flagged = Number(row.count)
  }
  stats.total = stats.unsolved + stats.solved + stats.flagged
  return stats
}

export async function fetchLeaderboard(limit = 20): Promise<{ solved_by: string; solve_count: number; rank: number }[]> {
  const { data, error } = await supabase.rpc('get_leaderboard', { result_limit: limit })
  if (error) throw error
  return data as { solved_by: string; solve_count: number; rank: number }[]
}

export async function fetchRecentActivity(limit = 20): Promise<Clue[]> {
  const { data, error } = await supabase
    .from('clues')
    .select('*')
    .in('status', ['solved', 'flagged'])
    .order('updated_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data as Clue[]
}
