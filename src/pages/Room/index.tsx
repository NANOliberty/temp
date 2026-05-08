import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getRoom, postEntry, getRoomRankings } from '../../api'
import type { Room, RankingItem } from '../../types'

export default function Room() {
  const { roomCode } = useParams<{ roomCode: string }>()
  const [room, setRoom] = useState<Room | null>(null)
  const [rankings, setRankings] = useState<RankingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [error, setError] = useState<string | null>(null)


  useEffect(() => {
    if (!roomCode) return
    getRoom(roomCode)
      .then((res) => {
        setRoom(res.data)
        if (res.data.isRankingPublic) {
          return getRoomRankings(roomCode)
        }
      })
      .then((res) => {
        if (res) setRankings(res.data.content)
      })
      .catch(() => setError('방을 찾을 수 없습니다.'))
      .finally(() => setLoading(false))
  }, [roomCode])

  const handleApply = async () => {
    if (!roomCode) return
    setApplying(true)
    try {
      const res = await postEntry(roomCode)
      if (res.data.ticketToken) {
        // 비로그인 응모 → ticketToken 저장
        localStorage.setItem('ticketToken', res.data.ticketToken)
        alert('응모 완료! 로그인하면 등수가 이어집니다.')
      } else {
        alert(`응모 완료! ${res.data.rank}등`)
      }
} catch (e: unknown) {
  const code = (e as { response?: { data?: { code?: string } } })?.response?.data?.code
      if (code === 'ENTRY_ALREADY_CONFIRMED') alert('이미 응모했습니다.')
      else if (code === 'ROOM_FULL') alert('선착순이 마감됐습니다.')
      else if (code === 'ROOM_CLOSED') alert('이미 종료된 이벤트입니다.')
      else alert('응모 중 오류가 발생했습니다.')
    } finally {
      setApplying(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-screen">로딩 중...</div>
  if (error) return <div className="flex items-center justify-center h-screen">{error}</div>
  if (!room) return null

  return (
    <div className="max-w-md mx-auto p-6 pt-12">
      <h1 className="text-xl font-bold mb-1">{room.title}</h1>
      <p className="text-sm text-gray-400 mb-6">wadak.io/r/{roomCode}</p>

      {/* 랭킹 */}
      {room.isRankingPublic && rankings.length > 0 && (
        <div className="flex flex-col gap-2 mb-6">
          {rankings.map((r) => (
            <div key={r.rank} className="flex items-center gap-3 p-3 border rounded-lg text-sm">
              <span className={r.rank === 1 ? 'text-orange-500 font-bold' : 'text-gray-400'}>
                {r.rank}
              </span>
              <span className="flex-1 font-medium">{r.name}</span>
              <span className="text-gray-400 font-mono text-xs">{r.confirmedAt}</span>
            </div>
          ))}
        </div>
      )}

      {/* 응모 버튼 */}
      <button
        onClick={handleApply}
        disabled={applying || room.status !== 'OPEN'}
        className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl disabled:opacity-50"
      >
        {applying ? '응모 중...' : room.status === 'OPEN' ? '⚡ 지금 응모하기' : '마감됨'}
      </button>
    </div>
  )
}