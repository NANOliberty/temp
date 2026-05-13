import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createRoom } from '../../api'

const STYLES = {
  page: {
    minHeight: '100vh',
    background: '#f7f7f9',
    fontFamily: "'Noto Sans KR', sans-serif",
    padding: '80px 24px 40px',
  } as React.CSSProperties,
  inner: {
    maxWidth: 560,
    margin: '0 auto',
  } as React.CSSProperties,
  header: {
    marginBottom: 32,
  } as React.CSSProperties,
  title: {
    fontSize: 24,
    fontWeight: 900,
    letterSpacing: -1,
    color: '#0d0d17',
    marginBottom: 6,
  } as React.CSSProperties,
  subtitle: {
    fontSize: 14,
    color: '#9898b2',
  } as React.CSSProperties,
  card: {
    background: '#fff',
    border: '1.5px solid #eaeaee',
    borderRadius: 14,
    padding: '28px 28px',
    marginBottom: 14,
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: '#0d0d17',
    marginBottom: 16,
    letterSpacing: 0,
  } as React.CSSProperties,
  label: {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: '#54546e',
    marginBottom: 6,
    letterSpacing: 0.3,
  } as React.CSSProperties,
  input: {
    width: '100%',
    padding: '11px 14px',
    border: '1.5px solid #eaeaee',
    borderRadius: 8,
    fontSize: 14,
    color: '#0d0d17',
    fontFamily: "'Noto Sans KR', sans-serif",
    outline: 'none',
    transition: 'border-color .15s',
    background: '#fff',
  } as React.CSSProperties,
  fieldGroup: {
    marginBottom: 18,
  } as React.CSSProperties,
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
  } as React.CSSProperties,
  toggleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid #eaeaee',
  } as React.CSSProperties,
  toggleLabel: {
    fontSize: 14,
    color: '#0d0d17',
    fontWeight: 500,
  } as React.CSSProperties,
  toggleDesc: {
    fontSize: 12,
    color: '#9898b2',
    marginTop: 2,
  } as React.CSSProperties,
  hint: {
    fontSize: 12,
    color: '#9898b2',
    marginTop: 5,
  } as React.CSSProperties,
  submitBtn: {
    width: '100%',
    padding: '14px',
    background: '#f55a2b',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 700,
    fontFamily: "'Noto Sans KR', sans-serif",
    cursor: 'pointer',
    transition: 'opacity .15s, transform .15s',
    marginTop: 8,
  } as React.CSSProperties,
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={() => onChange(!on)}
      style={{
        width: 40, height: 22, borderRadius: 11,
        background: on ? '#f55a2b' : '#eaeaee',
        position: 'relative', cursor: 'pointer',
        transition: 'background .2s', flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute',
        width: 16, height: 16,
        borderRadius: '50%', background: '#fff',
        top: 3, left: on ? 21 : 3,
        transition: 'left .2s',
        boxShadow: '0 1px 3px rgba(0,0,0,.15)',
      }} />
    </div>
  )
}

export default function Create() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    eventName: '',
    openAt: '',
    participantLimit: '',
    rankingExposed: true,
    allowServiceMemberLogin: true,
    allowRoomMemberSignup: true,
    requirePhoneNumber: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!form.eventName.trim()) {
      setError('이벤트명을 입력해주세요.')
      return
    }
    setError(null)
    setLoading(true)

    try {
      const body: Record<string, unknown> = {
        eventName: form.eventName.trim(),
        rankingExposed: form.rankingExposed,
        isPublic: true,
      }
      if (form.openAt) {
        body.openAt = new Date(form.openAt).toISOString()
      }
      if (form.participantLimit) {
        body.participantLimit = Number(form.participantLimit)
      }

      const res = await createRoom(body)
      const { eventId } = res.data.data
      navigate(`/create/done`, { state: { roomCode: eventId } })
    } catch (e: unknown) {
      const code = (e as { response?: { data?: { error?: { code?: string } } } })?.response?.data?.error?.code
      if (code === 'INVALID_OPEN_AT') setError('시작 시간이 올바르지 않습니다.')
      else if (code === 'INVALID_ROOM_POLICY') setError('잘못된 설정입니다. 다시 확인해주세요.')
      else setError('오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={STYLES.page}>
      <div style={STYLES.inner}>

        {/* 헤더 */}
        <div style={STYLES.header}>
          <div
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer', marginBottom: 20, display: 'inline-block' }}
          >
            ← 홈으로
          </div>
          <h1 style={STYLES.title}>임시방 만들기</h1>
          <p style={STYLES.subtitle}>30초면 충분해요.</p>
        </div>

        {/* 기본 정보 */}
        <div style={STYLES.card}>
          <div style={STYLES.sectionTitle}>기본 정보</div>

          <div style={STYLES.fieldGroup}>
            <label style={STYLES.label}>이벤트명 *</label>
            <input
              style={STYLES.input}
              placeholder="예: 여름 한정 굿즈 선착순 100명"
              value={form.eventName}
              onChange={e => setForm(f => ({ ...f, eventName: e.target.value }))}
              onFocus={e => (e.target.style.borderColor = '#f55a2b')}
              onBlur={e => (e.target.style.borderColor = '#eaeaee')}
            />
          </div>

          <div style={STYLES.row}>
            <div style={STYLES.fieldGroup}>
              <label style={STYLES.label}>시작 시간</label>
              <input
                type="datetime-local"
                style={STYLES.input}
                value={form.openAt}
                onChange={e => setForm(f => ({ ...f, openAt: e.target.value }))}
                onFocus={e => (e.target.style.borderColor = '#f55a2b')}
                onBlur={e => (e.target.style.borderColor = '#eaeaee')}
              />
              <div style={STYLES.hint}>비워두면 즉시 시작</div>
            </div>
            <div style={STYLES.fieldGroup}>
              <label style={STYLES.label}>인원 제한</label>
              <input
                type="number"
                style={STYLES.input}
                placeholder="제한 없음"
                min={1}
                value={form.participantLimit}
                onChange={e => setForm(f => ({ ...f, participantLimit: e.target.value }))}
                onFocus={e => (e.target.style.borderColor = '#f55a2b')}
                onBlur={e => (e.target.style.borderColor = '#eaeaee')}
              />
              <div style={STYLES.hint}>비워두면 무제한</div>
            </div>
          </div>
        </div>

        {/* 공개 설정 */}
        <div style={STYLES.card}>
          <div style={STYLES.sectionTitle}>공개 설정</div>
          {[
            { key: 'rankingExposed', label: '랭킹 공개', desc: '참여자들이 실시간 등수를 볼 수 있어요' },
            { key: 'allowServiceMemberLogin', label: '서비스 회원 로그인 허용', desc: '와다닥 계정으로 응모할 수 있어요' },
            { key: 'allowRoomMemberSignup', label: '임시방 전용 가입 허용', desc: '닉네임만으로 응모할 수 있어요' },
          ].map((item, i, arr) => (
            <div key={item.key} style={{ ...STYLES.toggleRow, borderBottom: i === arr.length - 1 ? 'none' : '1px solid #eaeaee' }}>
              <div>
                <div style={STYLES.toggleLabel}>{item.label}</div>
                <div style={STYLES.toggleDesc}>{item.desc}</div>
              </div>
              <Toggle
                on={form[item.key as keyof typeof form] as boolean}
                onChange={v => setForm(f => ({ ...f, [item.key]: v }))}
              />
            </div>
          ))}
        </div>

        {/* 필수 입력 항목 */}
        <div style={STYLES.card}>
          <div style={STYLES.sectionTitle}>응모자 추가 정보</div>
          <div style={{ ...STYLES.toggleRow, borderBottom: 'none' }}>
            <div>
              <div style={STYLES.toggleLabel}>전화번호 수집</div>
              <div style={STYLES.toggleDesc}>응모자에게 전화번호 입력을 요청해요</div>
            </div>
            <Toggle
              on={form.requirePhoneNumber}
              onChange={v => setForm(f => ({ ...f, requirePhoneNumber: v }))}
            />
          </div>
        </div>

        {/* 에러 */}
        {error && (
          <div style={{ color: '#f55a2b', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>
            {error}
          </div>
        )}

        {/* 제출 */}
        <button
          style={{ ...STYLES.submitBtn, opacity: loading ? 0.6 : 1 }}
          onClick={handleSubmit}
          disabled={loading}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.88' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = loading ? '0.6' : '1' }}
        >
          {loading ? '생성 중...' : '임시방 만들기 →'}
        </button>

      </div>
    </div>
  )
}