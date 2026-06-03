import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createRoom, guestSignup } from '../../api'
import type { CreateRoomRequest } from '../../types'

const inputStyle = {
  width: '100%', padding: '11px 14px',
  border: '1.5px solid #eaeaee', borderRadius: 8,
  fontSize: 14, color: '#0d0d17',
  fontFamily: "'Noto Sans KR', sans-serif",
  outline: 'none', transition: 'border-color .15s',
  background: '#fff', boxSizing: 'border-box' as const,
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!on)} style={{ width: 40, height: 22, borderRadius: 11, background: on ? '#f55a2b' : '#eaeaee', position: 'relative', cursor: 'pointer', transition: 'background .2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', width: 16, height: 16, borderRadius: '50%', background: '#fff', top: 3, left: on ? 21 : 3, transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.15)' }} />
    </div>
  )
}

function saveRoomId(roomId: string) {
  const existing = JSON.parse(localStorage.getItem('myRoomIds') || '[]') as string[]
  if (!existing.includes(roomId)) {
    localStorage.setItem('myRoomIds', JSON.stringify([roomId, ...existing]))
  }
}

export default function Create() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    eventName: '',
    openAt: '',
    participantLimit: '',
    rankingExposed: true,
    isPublic: true,
    hostNickname: '',
    hostPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!form.eventName.trim()) { setError('이벤트명을 입력해주세요.'); return }
    if (!form.hostNickname.trim()) { setError('호스트 닉네임을 입력해주세요.'); return }
    if (!form.hostPassword.trim()) { setError('비밀번호를 입력해주세요.'); return }
    setError(null)
    setLoading(true)

    try {
      // 1. 방 생성
      const body: CreateRoomRequest = {
        eventName: form.eventName.trim(),
        rankingExposed: form.rankingExposed,
        isPublic: form.isPublic,
      }
      if (form.openAt) body.openAt = new Date(form.openAt).toISOString()
      if (form.participantLimit) body.participantLimit = Number(form.participantLimit)

      const { eventId } = await createRoom(body)

      // 2. 호스트 guest 등록
      const auth = await guestSignup(eventId, {
        roomNickname: form.hostNickname.trim(),
        roomPassword: form.hostPassword.trim(),
        isHost: true,
      })

      // host accessToken 저장 (방별로 저장)
      if (auth.accessToken) {
        localStorage.setItem(`hostToken_${eventId}`, auth.accessToken)
      }

      saveRoomId(eventId)
      
      navigate('/create/done', { state: { roomCode: eventId, eventName: form.eventName.trim() } })
    } catch (e: unknown) {
      const code = (e as { response?: { data?: { error?: { code?: string } } } })?.response?.data?.error?.code
      if (code === 'INVALID_OPEN_AT') setError('시작 시간이 올바르지 않습니다.')
      else if (code === 'INVALID_ROOM_POLICY') setError('잘못된 설정입니다.')
      else setError('오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  const cardStyle = { background: '#fff', border: '1.5px solid #eaeaee', borderRadius: 14, padding: '28px', marginBottom: 14 }
  const sectionTitle = { fontSize: 12, fontWeight: 700, color: '#9898b2', marginBottom: 20, letterSpacing: 1, textTransform: 'uppercase' as const, fontFamily: "'DM Mono', monospace" }
  const label = { display: 'block', fontSize: 12, fontWeight: 600, color: '#54546e', marginBottom: 6 } as React.CSSProperties
  const fieldGroup = { marginBottom: 18 }
  const hint = { fontSize: 12, color: '#9898b2', marginTop: 5 }

  return (
    <div style={{ minHeight: '100vh', background: '#f7f7f9', fontFamily: "'Noto Sans KR', sans-serif", padding: '80px 24px 40px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>

        <div style={{ marginBottom: 32 }}>
          <div onClick={() => navigate('/')} style={{ cursor: 'pointer', marginBottom: 20, display: 'inline-block', fontSize: 13, color: '#9898b2' }}>← 홈으로</div>
          <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: -1, color: '#0d0d17', marginBottom: 4 }}>임시방 만들기</h1>
          <p style={{ fontSize: 13, color: '#9898b2' }}>30초면 충분해요.</p>
        </div>

        {/* 기본 정보 */}
        <div style={cardStyle}>
          <div style={sectionTitle}>기본 정보</div>
          <div style={fieldGroup}>
            <label style={label}>이벤트명 *</label>
            <input style={inputStyle} placeholder="예: 여름 한정 굿즈 선착순 100명" value={form.eventName}
              onChange={e => setForm(f => ({ ...f, eventName: e.target.value }))}
              onFocus={e => e.target.style.borderColor = '#f55a2b'}
              onBlur={e => e.target.style.borderColor = '#eaeaee'}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
            <div>
              <label style={label}>시작 시간</label>
              <input type="datetime-local" style={inputStyle} value={form.openAt}
                onChange={e => setForm(f => ({ ...f, openAt: e.target.value }))}
                onFocus={e => e.target.style.borderColor = '#f55a2b'}
                onBlur={e => e.target.style.borderColor = '#eaeaee'}
              />
              <div style={hint}>비워두면 즉시 시작</div>
            </div>
            <div>
              <label style={label}>인원 제한</label>
              <input type="number" style={inputStyle} placeholder="제한 없음" min={1} value={form.participantLimit}
                onChange={e => setForm(f => ({ ...f, participantLimit: e.target.value }))}
                onFocus={e => e.target.style.borderColor = '#f55a2b'}
                onBlur={e => e.target.style.borderColor = '#eaeaee'}
              />
              <div style={hint}>비워두면 무제한</div>
            </div>
          </div>
        </div>

        {/* 호스트 정보 */}
        <div style={cardStyle}>
          <div style={sectionTitle}>호스트 정보</div>
          <p style={{ fontSize: 12, color: '#9898b2', marginBottom: 16, lineHeight: 1.6 }}>
            방 관리에 사용할 닉네임과 비밀번호를 설정해주세요.
          </p>
          <div style={fieldGroup}>
            <label style={label}>닉네임 *</label>
            <input style={inputStyle} placeholder="방에서 사용할 닉네임" value={form.hostNickname}
              onChange={e => setForm(f => ({ ...f, hostNickname: e.target.value }))}
              onFocus={e => e.target.style.borderColor = '#f55a2b'}
              onBlur={e => e.target.style.borderColor = '#eaeaee'}
            />
          </div>
          <div style={fieldGroup}>
            <label style={label}>비밀번호 *</label>
            <input type="password" style={inputStyle} placeholder="방 관리용 비밀번호" value={form.hostPassword}
              onChange={e => setForm(f => ({ ...f, hostPassword: e.target.value }))}
              onFocus={e => e.target.style.borderColor = '#f55a2b'}
              onBlur={e => e.target.style.borderColor = '#eaeaee'}
            />
          </div>
        </div>

        {/* 공개 설정 */}
        <div style={cardStyle}>
          <div style={sectionTitle}>공개 설정</div>
          {[
            { key: 'rankingExposed', label: '랭킹 공개', desc: '참여자들이 실시간 등수를 볼 수 있어요' },
            { key: 'isPublic', label: '방 공개', desc: '누구나 링크로 접근할 수 있어요' },
          ].map((item, i, arr) => (
            <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i === arr.length - 1 ? 'none' : '1px solid #eaeaee' }}>
              <div>
                <div style={{ fontSize: 14, color: '#0d0d17', fontWeight: 500 }}>{item.label}</div>
                <div style={{ fontSize: 12, color: '#9898b2', marginTop: 2 }}>{item.desc}</div>
              </div>
              <Toggle on={form[item.key as keyof typeof form] as boolean} onChange={v => setForm(f => ({ ...f, [item.key]: v }))} />
            </div>
          ))}
        </div>

        {error && <div style={{ color: '#f55a2b', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>{error}</div>}

        <button
          style={{ width: '100%', padding: '14px', background: '#f55a2b', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, fontFamily: "'Noto Sans KR', sans-serif", cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, marginTop: 8 }}
          onClick={handleSubmit} disabled={loading}
        >
          {loading ? '생성 중...' : '임시방 만들기 →'}
        </button>
      </div>
    </div>
  )
}