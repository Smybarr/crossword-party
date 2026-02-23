export type ClueStatus = 'unsolved' | 'solved' | 'flagged'
export type ClueDirection = 'Across' | 'Down'

export interface Clue {
  id: string
  number: number
  direction: ClueDirection
  text: string
  page: number
  status: ClueStatus
  answer: string | null
  solved_by: string | null
  solved_at: string | null
  flagged_by: string | null
  flagged_reason: string | null
  created_at: string
  updated_at: string
}

export interface ClueStats {
  unsolved: number
  solved: number
  flagged: number
  total: number
}

export interface Profile {
  id: string
  first_name: string
  last_name: string
  display_name: string
  created_at: string
}

export type TabId = 'random' | 'search' | 'leaderboard'
