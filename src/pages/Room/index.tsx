import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { postEntry, getRoom, getMyEntry, getMyRooms, guestSignup, guestLogin, claimTicket } from '../../api'
import { MOCK_ROOM, MOCK_RANKINGS, MOCK_MY_ENTRY, USE_MOCK } from '../../api/mock'
import type { Room, RankingItem, Entry } from '../../types'
import { UNLIMITED_PARTICIPANTS } from '../../types'
import { formatServerDate } from '../../utils/datetime'

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

function NavBar({ isLoggedIn, onLogoClick, onNavClick, showSettings, onSettingsClick }: {
  isLoggedIn: boolean
  onLogoClick: () => void
  onNavClick: () => void
  showSettings?: boolean
  onSettingsClick?: () => void
}) {
  return (
    <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 52px', background: 'rgba(255,255,255,.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #eaeaee' }}>
      <div onClick={onLogoClick} style={{ cursor: 'pointer' }}><LogoMark /></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {showSettings && (
          <button onClick={onSettingsClick} style={{ background: '#f7f7f9', border: '1.5px solid #eaeaee', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Noto Sans KR', sans-serif", color: '#54546e' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#d2d2dc'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#eaeaee'}
          >설정</button>
        )}
        <button onClick={onNavClick} style={{ background: '#f55a2b', color: '#fff', border: 'none', cursor: 'pointer', padding: '9px 18px', borderRadius: 8, fontSize: 13.5, fontWeight: 700, fontFamily: "'Noto Sans KR', sans-serif" }}
          onMouseEnter={e => e.currentTarget.style.background = '#e04d22'}
          onMouseLeave={e => e.currentTarget.style.background = '#f55a2b'}
        >{isLoggedIn ? '내 방' : '로그인'}</button>
      </div>
    </nav>
  )
}

export default function Room() {
  const { roomCode } = useParams<{ roomCode: string }>()
  const navigate = useNavigate()
  const isLoggedIn = !!localStorage.getItem('accessToken')

  // host 판단: API 기반 (비로그인이면 체크 불필요하므로 초기값 true)
  const [isHost, setIsHost] = useState(false)
  const [hostChecked, setHostChecked] = useState(!isLoggedIn || USE_MOCK)

  const [room, setRoom] = useState<Room | null>(USE_MOCK ? MOCK_ROOM : null)
  const [rankings] = useState<RankingItem[]>(USE_MOCK ? MOCK_RANKINGS : [])
  const [myEntry, setMyEntry] = useState<Entry | null>(USE_MOCK && isLoggedIn ? MOCK_MY_ENTRY : null)
  const [loading, setLoading] = useState(!USE_MOCK)
  const [applying, setApplying] = useState(false)
  const [showNicknameModal, setShowNicknameModal] = useState(false)
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  // 게스트 가입 직후엔 로그인 상태이지만 isLoggedIn(초기 렌더값)은 갱신되지 않으므로 별도 추적
  const [justAuthed, setJustAuthed] = useState(false)

  // Step 1: 로그인 상태면 GET /host/rooms 로 host 여부 확인
  useEffect(() => {
    if (!isLoggedIn || !roomCode || USE_MOCK) return
    getMyRooms()
      .then(data => {
        const found = (data.rooms ?? []).some(r => r.roomId === roomCode)
        setIsHost(found)
      })
      .catch(() => {})
      .finally(() => setHostChecked(true))
  }, [roomCode, isLoggedIn])

  // Step 2: host 여부 확인 후 방 데이터 로드
  // 공개 룸 정보는 host/참여자 모두 getRoom(공개 엔드포인트)으로 조회.
  // 참여자(비host) + 로그인 상태면 내 응모 상태도 함께 조회.
  useEffect(() => {
    if (!roomCode || USE_MOCK || !hostChecked) return

    Promise.all([
      getRoom(roomCode),
      !isHost && isLoggedIn ? getMyEntry(roomCode) : Promise.resolve(null),
    ])
      .then(([d, entry]) => {
        setRoom({
          roomCode,
          title: d.eventName,
          status: d.roomStatus,
          openAt: d.openAt,
          isRankingPublic: d.rankingExposed,
          entryCount: d.participantCount ?? d.summary?.participantCount ?? 0,
          maxEntries: d.participantLimit && d.participantLimit < UNLIMITED_PARTICIPANTS ? d.participantLimit : null,
        })
        if (entry && entry.hasApplied) {
          setMyEntry({
            rank: entry.myRank ?? null,
            confirmedAt: null,
            status: entry.entryStatus === 'CONFIRMED' ? 'CONFIRMED' : 'PENDING',
            ticketToken: entry.ticketToken ?? undefined,
            waitingNumber: entry.waitingNumber ?? null,
          })
        }
      })
      .catch(() => setError('방을 찾을 수 없습니다.'))
      .finally(() => setLoading(false))
  }, [roomCode, isLoggedIn, isHost, hostChecked])

  const reportError = (e: unknown, fallback: string) => {
    const code = (e as { response?: { data?: { error?: { code?: string } } } })?.response?.data?.error?.code
    if (code === 'ENTRY_ALREADY_CONFIRMED') setError('이미 응모했습니다.')
    else if (code === 'ROOM_FULL') setError('선착순이 마감됐습니다.')
    else if (code === 'ROOM_CLOSED' || code === 'ROOM_NOT_OPEN') setError('지금은 응모할 수 없는 이벤트입니다.')
    else if (code === 'ENTRY_TICKET_EXPIRED') setError('대기 시간이 만료됐어요. 다시 응모해주세요.')
    else if (code === 'ROOM_MEMBER_NICKNAME_DUPLICATED') setError('이미 사용 중인 닉네임이에요.')
    else if (code === 'ROOM_MEMBER_PASSWORD_MISMATCH') setError('비밀번호가 일치하지 않아요.')
    else if (code === 'REQUIRED_PROFILE_MISSING') setError('응모에 필요한 정보가 부족해요.')
    else setError(fallback)
  }

  // 응모 확정: 비로그인 선응모로 받은 티켓이 있으면 claim, 없으면 신규 응모.
  const confirmEntry = async () => {
    if (!roomCode) return
    const ticketToken = localStorage.getItem('ticketToken')
    if (ticketToken) {
      const res = await claimTicket(ticketToken)
      if (res.entryStatus === 'CONFIRMED') {
        localStorage.removeItem('ticketToken')
        setMyEntry({ rank: res.rank ?? null, confirmedAt: res.appliedAt ?? null, status: 'CONFIRMED' })
      } else {
        // 정원 초과 → 대기열(WAITING) 유지
        setMyEntry({ rank: res.rank ?? null, confirmedAt: null, status: 'PENDING', ticketToken, waitingNumber: res.waitingNumber ?? null })
      }
      return
    }
    const res = await postEntry(roomCode)
    if (res.entryMode === 'DIRECT_CONFIRMED') {
      localStorage.removeItem('ticketToken')
      setMyEntry({ rank: res.rank ?? null, confirmedAt: res.appliedAt ?? null, status: 'CONFIRMED' })
    } else if (res.ticketToken) {
      // 비로그인 임시점유/대기열 → 티켓 발급 (이후 인증 후 claim 필요)
      localStorage.setItem('ticketToken', res.ticketToken)
      setMyEntry({ rank: res.reservedRank ?? null, confirmedAt: null, status: 'PENDING', ticketToken: res.ticketToken, waitingNumber: res.waitingNumber ?? null })
    }
  }

  // 내 응모 상태 새로고침 (lazy promotion 트리거 → 대기열 승격 반영)
  const refreshEntry = async () => {
    if (!roomCode) return
    setApplying(true)
    setError(null)
    try {
      const entry = await getMyEntry(roomCode)
      if (entry.hasApplied) {
        const confirmed = entry.entryStatus === 'CONFIRMED'
        if (confirmed) localStorage.removeItem('ticketToken')
        setMyEntry({
          rank: entry.myRank ?? null,
          confirmedAt: null,
          status: confirmed ? 'CONFIRMED' : 'PENDING',
          ticketToken: entry.ticketToken ?? undefined,
          waitingNumber: entry.waitingNumber ?? null,
        })
      }
    } catch (e) {
      reportError(e, '상태를 불러오지 못했어요.')
    } finally {
      setApplying(false)
    }
  }

  // 응모 버튼: 인증된 사용자면 바로 확정, 아니면 게스트 가입 모달
  const handleApply = async () => {
    if (!isLoggedIn && !justAuthed) { setShowNicknameModal(true); return }
    setError(null)
    setApplying(true)
    try {
      if (USE_MOCK) {
        await new Promise(r => setTimeout(r, 600))
        setMyEntry({ rank: 13, confirmedAt: new Date().toISOString(), status: 'CONFIRMED' })
        return
      }
      await confirmEntry()
    } catch (e) {
      reportError(e, '응모 중 오류가 발생했습니다.')
    } finally {
      setApplying(false)
    }
  }

  // 게스트 가입 후 응모 확정 (모달)
  const submitGuest = async () => {
    if (!roomCode || !nickname.trim() || !password.trim()) return
    setError(null)
    setApplying(true)
    try {
      if (USE_MOCK) {
        await new Promise(r => setTimeout(r, 600))
        setMyEntry({ rank: 13, confirmedAt: new Date().toISOString(), status: 'CONFIRMED' })
        setShowNicknameModal(false)
        return
      }
      const ticketToken = localStorage.getItem('ticketToken') || undefined
      const creds = { roomNickname: nickname.trim(), roomPassword: password.trim(), ticketToken }
      let auth
      try {
        auth = await guestSignup(roomCode, creds)
      } catch (e) {
        // 이미 있는 닉네임이면 같은 정보로 재로그인 시도 (재참여)
        const code = (e as { response?: { data?: { error?: { code?: string } } } })?.response?.data?.error?.code
        if (code === 'ROOM_MEMBER_NICKNAME_DUPLICATED' || code === 'ROOM_MEMBER_ALREADY_EXISTS') {
          auth = await guestLogin(roomCode, creds)
        } else {
          throw e
        }
      }
      localStorage.setItem('accessToken', auth.accessToken)
      setJustAuthed(true)
      await confirmEntry()
      setShowNicknameModal(false)
    } catch (e) {
      reportError(e, '가입 중 오류가 발생했습니다.')
    } finally {
      setApplying(false)
    }
  }

  const formatDate = (d: string | null) => formatServerDate(d)

  if (loading || !hostChecked) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Noto Sans KR', sans-serif", color: '#9898b2', fontSize: 14 }}>
      불러오는 중...
    </div>
  )
  if (error && !room) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Noto Sans KR', sans-serif", gap: 16 }}>
      <p style={{ color: '#9898b2', fontSize: 15 }}>{error}</p>
      <button onClick={() => navigate('/')} style={{ color: '#f55a2b', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontFamily: "'Noto Sans KR', sans-serif" }}>홈으로 →</button>
    </div>
  )
  if (!room) return null

  // ── HOST 뷰 ──
  if (isHost) {
    const shareUrl = `${window.location.origin}/r/${roomCode}`
    const statusMap: Record<string, { label: string; color: string; bg: string }> = {
      READY:  { label: '대기 중', color: '#3b82f6', bg: '#eff6ff' },
      OPEN:   { label: '진행 중', color: '#16a34a', bg: '#dcfce7' },
      CLOSED: { label: '마감',    color: '#6b7280', bg: '#f3f4f6' },
    }
    const status = statusMap[room.status] ?? statusMap.CLOSED

    return (
      <div style={{ minHeight: '100vh', background: '#f7f7f9', fontFamily: "'Noto Sans KR', sans-serif" }}>
        <NavBar isLoggedIn={isLoggedIn} onLogoClick={() => navigate('/')} onNavClick={() => navigate('/my')}
          showSettings onSettingsClick={() => navigate(`/host/${roomCode}/settings`)} />
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '100px 24px 60px' }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: status.bg, borderRadius: 100, padding: '3px 10px', marginBottom: 14 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: status.color }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: status.color, fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>{status.label}</span>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: -1, color: '#0d0d17', marginBottom: 6 }}>{room.title}</h1>
            <p style={{ fontSize: 13, color: '#9898b2', fontFamily: "'DM Mono', monospace", marginBottom: 20 }}>선착순 시작: {formatDate(room.openAt)}</p>
            <div style={{ background: '#fff', border: '1.5px solid #eaeaee', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ flex: 1, fontSize: 12, color: '#54546e', fontFamily: "'DM Mono', monospace", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shareUrl}</span>
              <button onClick={() => navigator.clipboard.writeText(shareUrl).then(() => alert('복사됐어요!'))} style={{ background: '#0d0d17', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Noto Sans KR', sans-serif", flexShrink: 0 }}>복사</button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
            {[
              { label: '총 참여자', value: `${room.entryCount}명`, color: '#f55a2b' },
              { label: '인원 제한', value: room.maxEntries ? `${room.maxEntries}명` : '무제한', color: '#0d0d17' },
              { label: '랭킹 노출', value: room.isRankingPublic ? '공개' : '비공개', color: room.isRankingPublic ? '#16a34a' : '#9898b2' },
            ].map((stat, i) => (
              <div key={i} style={{ background: '#fff', border: '1.5px solid #eaeaee', borderRadius: 14, padding: '20px 22px' }}>
                <div style={{ fontSize: 11, color: '#9898b2', marginBottom: 8, fontFamily: "'DM Mono', monospace", letterSpacing: 1, textTransform: 'uppercase' as const }}>{stat.label}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: stat.color, letterSpacing: -1 }}>{stat.value}</div>
              </div>
            ))}
          </div>

          <div style={{ background: '#fff', border: '1.5px solid #eaeaee', borderRadius: 16, padding: '28px 32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0d0d17', letterSpacing: -.3 }}>랭킹</h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#9898b2', fontFamily: "'Noto Sans KR', sans-serif", textDecoration: 'underline' }}>전체 참가자 보기 →</button>
            </div>
            <RankingList rankings={rankings} />
          </div>
        </div>
      </div>
    )
  }

  // ── 참여자 뷰 ──
  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'Noto Sans KR', sans-serif" }}>
      <NavBar isLoggedIn={isLoggedIn} onLogoClick={() => navigate('/')} onNavClick={() => navigate(isLoggedIn ? '/my' : '/login')} />
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '100px 24px 60px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-block', fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: 2, color: '#f55a2b', textTransform: 'uppercase' as const, background: 'rgba(245,90,43,.09)', border: '1px solid rgba(245,90,43,.2)', borderRadius: 100, padding: '4px 14px', marginBottom: 16 }}>
            {room.status === 'OPEN' ? '● 진행 중' : room.status === 'READY' ? '대기 중' : '마감'}
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: -1.2, color: '#0d0d17', marginBottom: 8, lineHeight: 1.2 }}>{room.title}</h1>
          <p style={{ fontSize: 13, color: '#9898b2', fontFamily: "'DM Mono', monospace" }}>선착순 시작: {formatDate(room.openAt)}</p>
        </div>

        {myEntry?.status === 'CONFIRMED' ? (
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ display: 'inline-block', background: '#f0fdf4', borderRadius: 16, padding: '24px 48px', marginBottom: 8 }}>
              <div style={{ fontSize: 52, fontWeight: 900, color: '#16a34a', letterSpacing: -2 }}>{myEntry.rank}등</div>
            </div>
            <p style={{ fontSize: 14, color: '#9898b2' }}>나의 응모 순위</p>
            {!isLoggedIn && !justAuthed && (
              <p style={{ fontSize: 13, color: '#54546e', marginTop: 12 }}>
                로그인하면 이 등수를 이어받을 수 있어요.{' '}
                <button onClick={() => navigate('/login')} style={{ color: '#f55a2b', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontFamily: "'Noto Sans KR', sans-serif" }}>로그인 →</button>
              </p>
            )}
          </div>
        ) : myEntry?.status === 'PENDING' ? (
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ display: 'inline-block', background: '#fff7ed', borderRadius: 16, padding: '24px 48px', marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: '#9898b2', marginBottom: 6, fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>대기열 예비번호</div>
              <div style={{ fontSize: 52, fontWeight: 900, color: '#f55a2b', letterSpacing: -2 }}>
                {myEntry.waitingNumber != null ? `${myEntry.waitingNumber}번` : '대기 중'}
              </div>
            </div>
            <p style={{ fontSize: 13, color: '#54546e', lineHeight: 1.6 }}>
              정원이 가득 차 대기 중이에요.<br />앞 순번이 빠지면 자동으로 승격돼요.
            </p>
            <button onClick={refreshEntry} disabled={applying}
              style={{ marginTop: 14, background: '#0d0d17', color: '#fff', border: 'none', cursor: applying ? 'not-allowed' : 'pointer', padding: '10px 24px', borderRadius: 10, fontSize: 14, fontWeight: 700, fontFamily: "'Noto Sans KR', sans-serif", opacity: applying ? 0.6 : 1 }}
            >{applying ? '확인 중...' : '내 순번 새로고침'}</button>
            {error && <p style={{ color: '#f55a2b', fontSize: 13, marginTop: 10 }}>{error}</p>}
          </div>
        ) : (
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <button onClick={handleApply} disabled={applying || room.status !== 'OPEN'}
              style={{ background: room.status === 'OPEN' ? '#f55a2b' : '#eaeaee', color: room.status === 'OPEN' ? '#fff' : '#9898b2', border: 'none', cursor: room.status === 'OPEN' && !applying ? 'pointer' : 'not-allowed', padding: '16px 52px', borderRadius: 12, fontSize: 17, fontWeight: 700, fontFamily: "'Noto Sans KR', sans-serif", opacity: applying ? 0.6 : 1, boxShadow: room.status === 'OPEN' ? '0 8px 24px rgba(245,90,43,.28)' : 'none', marginBottom: 14 }}
            >{applying ? '응모 중...' : room.status === 'OPEN' ? '응모하기' : '마감됨'}</button>
            {!isLoggedIn && room.status === 'OPEN' && (
              <div><button onClick={() => navigate('/login')} style={{ color: '#9898b2', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontFamily: "'Noto Sans KR', sans-serif", textDecoration: 'underline' }}>회원 로그인/가입</button></div>
            )}
            {error && <p style={{ color: '#f55a2b', fontSize: 13, marginTop: 10 }}>{error}</p>}
          </div>
        )}

        {room.isRankingPublic && rankings.length > 0 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0d0d17', marginBottom: 16 }}>랭킹보기</h2>
            <RankingList rankings={rankings} myRank={myEntry?.rank ?? undefined} />
          </div>
        )}
      </div>

      {showNicknameModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '36px 32px', width: '100%', maxWidth: 360, boxShadow: '0 24px 64px rgba(0,0,0,.18)' }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#f55a2b', letterSpacing: 2, marginBottom: 10 }}>GUEST</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6, letterSpacing: -.5 }}>게스트로 응모</h3>
            <p style={{ fontSize: 13, color: '#9898b2', marginBottom: 20, lineHeight: 1.6 }}>닉네임과 비밀번호로 이 방에 참여해요. 나중에 같은 정보로 다시 들어올 수 있어요.</p>
            <input value={nickname} onChange={e => setNickname(e.target.value)}
              placeholder="닉네임" autoFocus
              style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #eaeaee', borderRadius: 8, fontSize: 15, fontFamily: "'Noto Sans KR', sans-serif", outline: 'none', marginBottom: 10, boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#f55a2b'}
              onBlur={e => e.target.style.borderColor = '#eaeaee'}
            />
            <input value={password} onChange={e => setPassword(e.target.value)} type="password"
              onKeyDown={e => { if (e.key === 'Enter' && nickname.trim() && password.trim()) submitGuest() }}
              placeholder="비밀번호 (4자 이상)"
              style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #eaeaee', borderRadius: 8, fontSize: 15, fontFamily: "'Noto Sans KR', sans-serif", outline: 'none', marginBottom: 16, boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#f55a2b'}
              onBlur={e => e.target.style.borderColor = '#eaeaee'}
            />
            {error && <p style={{ color: '#f55a2b', fontSize: 13, marginTop: -6, marginBottom: 14 }}>{error}</p>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { setShowNicknameModal(false); setError(null) }} style={{ flex: 1, padding: '12px', background: '#fff', border: '1.5px solid #eaeaee', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'Noto Sans KR', sans-serif", color: '#54546e' }}>취소</button>
              <button onClick={() => submitGuest()} disabled={!nickname.trim() || password.trim().length < 4 || applying} style={{ flex: 1, padding: '12px', background: '#f55a2b', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'Noto Sans KR', sans-serif", color: '#fff', opacity: !nickname.trim() || password.trim().length < 4 || applying ? 0.5 : 1 }}>{applying ? '처리 중...' : '응모하기'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function RankingList({ rankings, myRank }: { rankings: RankingItem[], myRank?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {rankings.map(r => (
        <div key={r.rank} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 18px', background: r.rank === myRank ? 'rgba(245,90,43,.06)' : '#f7f7f9', border: `1.5px solid ${r.rank === myRank ? 'rgba(245,90,43,.2)' : 'transparent'}`, borderRadius: 10 }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: 14, width: 22, textAlign: 'right', flexShrink: 0, color: r.rank <= 3 ? '#f55a2b' : '#9898b2' }}>{r.rank}</span>
          <span style={{ flex: 1, fontSize: 14, fontWeight: r.rank === myRank ? 700 : 500, color: '#0d0d17' }}>{r.name}</span>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#9898b2' }}>{r.confirmedAt}</span>
        </div>
      ))}
    </div>
  )
}