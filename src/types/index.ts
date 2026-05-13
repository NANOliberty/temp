export interface Room {
  roomCode: string
  title: string
  isRankingPublic: boolean
  openAt: string | null
  maxEntries: number | null
  status: 'READY' | 'OPEN' | 'CLOSED' | 'DELETED'
  entryCount: number
}

export interface Entry {
  rank: number | null
  confirmedAt: string | null
  status: 'CONFIRMED' | 'PENDING'
  ticketToken?: string
  requiredFields?: string[]
}

export interface RankingItem {
  rank: number
  name: string
  confirmedAt: string
}

export interface RankingResponse {
  content: RankingItem[]
  totalElements: number
  totalPages: number
  number: number
}