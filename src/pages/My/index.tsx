import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyRooms } from '../../api'
import type { HostRoomListItem } from '../../types'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    READY:  { label: '대기 중', bg: '#eff6ff', color: '#3b82f6' },
    OPEN:   { label: '진행 중', bg: '#dcfce7', color: '#16a34a' },
    CLOSED: { label: '마감',   bg: '#f3f4f6', color: '#6b7280' },
  }
  const s = map[status] ?? { label: status, bg: '#f3f4f6', color: '#6b7280' }
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4, background: s.bg, color: s.color, fontFamily: "'DM Mono', monospace" }}>
      {s.label}
    </span>
  )
}

function LogoMark() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{ width: 26, height: 26, border: '3.5px solid #0d0d17', borderRadius: '50%', position: 'relative' }}>
        <div style={{ position: 'absolute', width: 3, height: 9, background: '#f55a2b', borderRadius: 2, bottom: '50%', left: '50%', transformOrigin: 'bottom center', transform: 'translateX(-50%) rotate(-28deg)' }} />
        <div style={{ position: 'absolute', width: 3.5, height: 7, background: '#0d0d17', borderRadius: 2, top: -8, left: '50%', transform: 'translateX(-50%)' }} />
        <div style={{ position: 'absolute', width: 11, height: 4, background: '#f55a2b', borderRadius: 2, top: -12, left: '50%', transform: 'translateX(-50%)' }} />
      </div>
      <div style={{ position: 'relative', width: 21, height: 26, flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3.5, background: '#0d0d17', borderRadius: 2 }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3.5, background: '#0d0d17', borderRadius: 2 }} />
        <div style={{ position: 'absolute', top: 0, left: 0, width: 3.5, bottom: 0, background: '#0d0d17', borderRadius: 2 }} />
      </div>
      <div style={{ position: 'relative', width: 21, height: 26, flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3.5, background: '#f55a2b', borderRadius: 2 }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3.5, background: '#f55a2b', borderRadius: 2 }} />
        <div style={{ position: 'absolute', top: 0, left: 0, width: 3.5, bottom: 0, background: '#f55a2b', borderRadius: 2 }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3.5, paddingLeft: 2 }}>
        <div style={{ width: 12, height: 3.5, borderRadius: 2, background: '#f55a2b' }} />
        <div style={{ width: 7, height: 3.5, borderRadius: 2, background: '#f55a2b', opacity: 0.5 }} />
        <div style={{ width: 4, height: 3.5, borderRadius: 2, background: '#f55a2b', opacity: 0.22 }} />
      </div>
    </div>
  )
}

export default function My() {
  const navigate = useNavigate()
  const [rooms, setRooms] = useState<HostRoomListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('accessToken')) {
      navigate('/login', { replace: true })
      return
    }
    getMyRooms()
      .then(data => setRooms((data.rooms ?? []).filter(r => r.roomStatus !== 'DELETED')))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('myRoomIds')
    navigate('/', { replace: true })
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '즉시 시작'
    return new Date(dateStr).toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7f7f9', fontFamily: "'Noto Sans KR', sans-serif" }}>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 52px', background: 'rgba(255,255,255,.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #eaeaee' }}>
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/')}><LogoMark /></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13.5, fontWeight: 500, color: '#9898b2', fontFamily: "'Noto Sans KR', sans-serif" }}
            onMouseEnter={e => e.currentTarget.style.color = '#0d0d17'}
            onMouseLeave={e => e.currentTarget.style.color = '#9898b2'}
          >로그아웃</button>
          <button onClick={() => navigate('/create')} style={{ background: '#f55a2b', color: '#fff', border: 'none', cursor: 'pointer', padding: '9px 18px', borderRadius: 8, fontSize: 13.5, fontWeight: 700, fontFamily: "'Noto Sans KR', sans-serif" }}
            onMouseEnter={e => e.currentTarget.style.background = '#e04d22'}
            onMouseLeave={e => e.currentTarget.style.background = '#f55a2b'}
          >+ 방 만들기</button>
        </div>
      </nav>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '100px 24px 60px' }}>
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: -1, color: '#0d0d17', marginBottom: 6 }}>내 임시방</h1>
          <p style={{ fontSize: 14, color: '#9898b2' }}>내가 만든 선착순 임시방 목록이에요.</p>
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '60px 0', color: '#9898b2', fontSize: 14 }}>불러오는 중...</div>}
        {error && <div style={{ textAlign: 'center', padding: '60px 0', color: '#9898b2', fontSize: 14 }}>목록을 불러오지 못했어요.</div>}

        {!loading && !error && rooms.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: '#fff', border: '1.5px solid #eaeaee', borderRadius: 16 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🏠</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0d0d17', marginBottom: 8 }}>아직 만든 임시방이 없어요</div>
            <div style={{ fontSize: 14, color: '#9898b2', marginBottom: 24 }}>선착순 이벤트를 시작해보세요.</div>
            <button onClick={() => navigate('/create')} style={{ background: '#f55a2b', color: '#fff', border: 'none', cursor: 'pointer', padding: '12px 24px', borderRadius: 9, fontSize: 14, fontWeight: 700, fontFamily: "'Noto Sans KR', sans-serif" }}>
              첫 임시방 만들기 →
            </button>
          </div>
        )}

        {!loading && !error && rooms.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {rooms.map(room => (
              <div key={room.roomId}
                onClick={() => navigate(`/r/${room.roomId}`)}
                style={{ background: '#fff', border: '1.5px solid #eaeaee', borderRadius: 12, padding: '24px 28px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', transition: 'border-color .15s, box-shadow .15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#d2d2dc'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,.06)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#eaeaee'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                    <span style={{ fontSize: 17, fontWeight: 700, color: '#0d0d17' }}>{room.eventName}</span>
                    <StatusBadge status={room.roomStatus} />
                  </div>
                  <div style={{ fontSize: 13, color: '#9898b2', fontFamily: "'DM Mono', monospace" }}>
                    선착순 시작: {formatDate(room.openAt)}
                    {room.participantLimit && room.participantLimit < 2000000000 ? ` · 최대 ${room.participantLimit}명` : ''}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#f55a2b', letterSpacing: -1 }}>{room.appliedCount ?? 0}</div>
                  <div style={{ fontSize: 12, color: '#9898b2' }}>참여자</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}