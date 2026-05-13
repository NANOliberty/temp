import type { Room, Entry, RankingItem } from '../types'

export const MOCK_ROOM: Room = {
  roomCode: 'MOCK1234',
  title: '새해 복 많이 받으세요 이벤트',
  isRankingPublic: true,
  openAt: '2026-01-01T00:00:00+09:00',
  maxEntries: 100,
  status: 'OPEN',
  entryCount: 156,
}

export const MOCK_RANKINGS: RankingItem[] = [
  { rank: 1, name: '행복한토끼', confirmedAt: '2026-01-01 00:00:01' },
  { rank: 2, name: '새해복', confirmedAt: '2026-01-01 00:00:02' },
  { rank: 3, name: '럭키2026', confirmedAt: '2026-01-01 00:00:03' },
  { rank: 4, name: '용띠최고', confirmedAt: '2026-01-01 00:00:04' },
  { rank: 5, name: '복많이', confirmedAt: '2026-01-01 00:00:05' },
]

export const MOCK_MY_ENTRY: Entry = {
  rank: 12,
  confirmedAt: '2026-01-01 00:00:12',
  status: 'CONFIRMED',
}

// API 완성되면 이 값을 false로 바꾸면 됨
export const USE_MOCK = true