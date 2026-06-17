import { useCallback, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getHostRoom, updateRoom, deleteRoom } from '../../api'
import type { RoomInfo, UpdateRoomRequest } from '../../types'
import { UNLIMITED_PARTICIPANTS } from '../../types'

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

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!on)} style={{ width: 40, height: 22, borderRadius: 11, background: on ? '#f55a2b' : '#eaeaee', position: 'relative', cursor: 'pointer', transition: 'background .2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', width: 16, height: 16, borderRadius: '50%', background: '#fff', top: 3, left: on ? 21 : 3, transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.15)' }} />
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px',
  border: '1.5px solid #eaeaee', borderRadius: 8,
  fontSize: 14, color: '#0d0d17',
  fontFamily: "'Noto Sans KR', sans-serif",
  outline: 'none', boxSizing: 'border-box',
  transition: 'border-color .15s',
}

export default function RoomSettings() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()

  const [room, setRoom] = useState<RoomInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 폼 상태
  const [form, setForm] = useState({
    eventName: '',
    openAt: '',
    participantLimit: '',
    rankingExposed: true,
    isPublic: true,
  })

  // UTC ISO → datetime-local 입력값(로컬 벽시계 시간)
  const toDatetimeLocal = (iso: string) => {
    const d = new Date(iso)
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  }

  const loadRoom = useCallback(() => {
    if (!roomId) return
    return getHostRoom(roomId)
      .then(data => {
        setRoom(data)
        setForm({
          eventName: data.eventName,
          openAt: data.openAt ? toDatetimeLocal(data.openAt) : '',
          participantLimit: data.participantLimit && data.participantLimit < UNLIMITED_PARTICIPANTS ? String(data.participantLimit) : '',
          rankingExposed: data.rankingExposed,
          isPublic: data.isPublic,
        })
      })
      .catch(() => setError('방 정보를 불러오지 못했어요.'))
      .finally(() => setLoading(false))
  }, [roomId])

  useEffect(() => {
    loadRoom()
  }, [loadRoom])

  // 방 호스트 토큰 (방 생성 시 isHost로 발급받아 저장한 토큰).
  // PATCH/DELETE /host/rooms/{roomId} 는 잠금 엔드포인트라 이 토큰을 사용한다.
  // (GET /host/rooms/{roomId} 는 공개라 accessToken 으로도 동작했던 것)
  const hostToken = localStorage.getItem(`hostToken_${roomId}`)

  const handleSave = async () => {
    if (!roomId) return
    setSaving(true)
    setError(null)
    try {
      const body: UpdateRoomRequest = {
        eventName: form.eventName.trim(),
        rankingExposed: form.rankingExposed,
        isPublic: form.isPublic,
      }
      if (form.openAt) body.openAt = new Date(form.openAt).toISOString()
      // 무제한이어도 participantLimit 를 항상 전송 (누락 시 백엔드 500 회피).
      // 무제한은 백엔드가 저장해 둔 sentinel 값(Integer.MAX_VALUE)으로 보낸다.
      body.participantLimit = form.participantLimit ? Number(form.participantLimit) : UNLIMITED_PARTICIPANTS

      const result = await updateRoom(roomId, body, hostToken ?? undefined)
      // 서버가 실제 반영한 필드 확인 (디버깅/검증용)
      console.log('updatedFields:', result?.updatedFields)
      // 저장 후 서버 상태로 폼 재동기화 (실제 반영 여부 확인)
      await loadRoom()
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
    } catch (e) {
      const code = (e as { response?: { data?: { error?: { code?: string } } } })?.response?.data?.error?.code
      setError(code ? `저장 실패: ${code}` : '저장 중 오류가 발생했어요.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!roomId || deleteInput !== form.eventName) return
    setDeleting(true)
    try {
      await deleteRoom(roomId, hostToken ?? undefined)

      // localStorage에서 roomId 제거
      const ids = JSON.parse(localStorage.getItem('myRoomIds') || '[]') as string[]
      localStorage.setItem('myRoomIds', JSON.stringify(ids.filter(id => id !== roomId)))
      navigate('/my', { replace: true })
    } catch {
      setError('삭제 중 오류가 발생했어요.')
      setDeleting(false)
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Noto Sans KR', sans-serif", color: '#9898b2', fontSize: 14 }}>
      불러오는 중...
    </div>
  )

  if (error && !room) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Noto Sans KR', sans-serif", gap: 16 }}>
      <p style={{ color: '#9898b2' }}>{error}</p>
      <button onClick={() => navigate('/my')} style={{ color: '#f55a2b', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontFamily: "'Noto Sans KR', sans-serif" }}>내 방 목록으로 →</button>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f7f7f9', fontFamily: "'Noto Sans KR', sans-serif" }}>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 52px', background: 'rgba(255,255,255,.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #eaeaee' }}>
        <div onClick={() => navigate('/')} style={{ cursor: 'pointer' }}><LogoMark /></div>
        <button onClick={() => navigate('/my')} style={{ background: '#f55a2b', color: '#fff', border: 'none', cursor: 'pointer', padding: '9px 18px', borderRadius: 8, fontSize: 13.5, fontWeight: 700, fontFamily: "'Noto Sans KR', sans-serif" }}
          onMouseEnter={e => e.currentTarget.style.background = '#e04d22'}
          onMouseLeave={e => e.currentTarget.style.background = '#f55a2b'}
        >내 방</button>
      </nav>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '100px 24px 60px' }}>

        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#9898b2', fontFamily: "'Noto Sans KR', sans-serif", marginBottom: 28, padding: 0 }}>
          ← 돌아가기
        </button>

        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: -1, color: '#0d0d17', marginBottom: 4 }}>임시방 설정</h1>
          {room && <p style={{ fontSize: 13, color: '#9898b2', fontFamily: "'DM Mono', monospace" }}>{room.roomCode}</p>}
        </div>

        {/* 기본 정보 */}
        <div style={{ background: '#fff', border: '1.5px solid #eaeaee', borderRadius: 14, padding: '28px', marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#9898b2', letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 20, fontFamily: "'DM Mono', monospace" }}>기본 정보</div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#54546e', marginBottom: 6 }}>이벤트명</label>
            <input style={inputStyle} value={form.eventName}
              onChange={e => setForm(f => ({ ...f, eventName: e.target.value }))}
              onFocus={e => e.target.style.borderColor = '#f55a2b'}
              onBlur={e => e.target.style.borderColor = '#eaeaee'}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#54546e', marginBottom: 6 }}>시작 시간</label>
              <input type="datetime-local" style={inputStyle} value={form.openAt}
                onChange={e => setForm(f => ({ ...f, openAt: e.target.value }))}
                onFocus={e => e.target.style.borderColor = '#f55a2b'}
                onBlur={e => e.target.style.borderColor = '#eaeaee'}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#54546e', marginBottom: 6 }}>인원 제한</label>
              <input type="number" style={inputStyle} placeholder="무제한" value={form.participantLimit}
                onChange={e => setForm(f => ({ ...f, participantLimit: e.target.value }))}
                onFocus={e => e.target.style.borderColor = '#f55a2b'}
                onBlur={e => e.target.style.borderColor = '#eaeaee'}
              />
            </div>
          </div>
        </div>

        {/* 공개 설정 */}
        <div style={{ background: '#fff', border: '1.5px solid #eaeaee', borderRadius: 14, padding: '28px', marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#9898b2', letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 20, fontFamily: "'DM Mono', monospace" }}>공개 설정</div>
          {[
            { key: 'rankingExposed', label: '랭킹 공개', desc: '참여자들이 실시간 등수를 볼 수 있어요' },
            { key: 'isPublic', label: '방 공개', desc: '누구나 링크로 접근할 수 있어요' },
          ].map((item, i, arr) => (
            <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < arr.length - 1 ? '1px solid #f7f7f9' : 'none' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#0d0d17', marginBottom: 2 }}>{item.label}</div>
                <div style={{ fontSize: 12, color: '#9898b2' }}>{item.desc}</div>
              </div>
              <Toggle on={form[item.key as keyof typeof form] as boolean} onChange={v => setForm(f => ({ ...f, [item.key]: v }))} />
            </div>
          ))}
        </div>

        {error && <p style={{ color: '#f55a2b', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>{error}</p>}

        {/* 저장 버튼 */}
        <button onClick={handleSave} disabled={saving}
          style={{ width: '100%', padding: '14px', background: saveSuccess ? '#16a34a' : '#f55a2b', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: "'Noto Sans KR', sans-serif", opacity: saving ? 0.7 : 1, marginBottom: 40, transition: 'background .3s' }}
        >
          {saving ? '저장 중...' : saveSuccess ? '✓ 저장됐어요' : '변경사항 저장'}
        </button>

        {/* 위험 구역 */}
        <div style={{ background: '#fff', border: '1.5px solid #fee2e2', borderRadius: 14, padding: '28px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#ef4444', letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 16, fontFamily: "'DM Mono', monospace" }}>위험 구역</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0d0d17', marginBottom: 2 }}>임시방 삭제</div>
              <div style={{ fontSize: 12, color: '#9898b2' }}>삭제하면 복구할 수 없어요.</div>
            </div>
            <button onClick={() => setShowDeleteConfirm(true)}
              style={{ background: '#fff', color: '#ef4444', border: '1.5px solid #ef4444', cursor: 'pointer', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700, fontFamily: "'Noto Sans KR', sans-serif" }}
            >삭제</button>
          </div>
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '36px 32px', width: '100%', maxWidth: 380, boxShadow: '0 24px 64px rgba(0,0,0,.18)' }}>
            <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: '#ef4444', letterSpacing: 2, marginBottom: 10 }}>DANGER</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, letterSpacing: -.5 }}>정말 삭제할까요?</h3>
            <p style={{ fontSize: 13, color: '#9898b2', lineHeight: 1.6, marginBottom: 20 }}>
              아래에 이벤트명을 입력하면 삭제가 진행됩니다.<br />
              <strong style={{ color: '#0d0d17' }}>{form.eventName}</strong>
            </p>
            <input value={deleteInput} onChange={e => setDeleteInput(e.target.value)}
              placeholder="이벤트명 입력" style={{ ...inputStyle, marginBottom: 16 }}
              onFocus={e => e.target.style.borderColor = '#ef4444'}
              onBlur={e => e.target.style.borderColor = '#eaeaee'}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { setShowDeleteConfirm(false); setDeleteInput('') }}
                style={{ flex: 1, padding: '12px', background: '#fff', border: '1.5px solid #eaeaee', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'Noto Sans KR', sans-serif", color: '#54546e' }}>
                취소
              </button>
              <button onClick={handleDelete} disabled={deleteInput !== form.eventName || deleting}
                style={{ flex: 1, padding: '12px', background: '#ef4444', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: deleteInput === form.eventName ? 'pointer' : 'not-allowed', fontFamily: "'Noto Sans KR', sans-serif", color: '#fff', opacity: deleteInput !== form.eventName || deleting ? 0.4 : 1 }}>
                {deleting ? '삭제 중...' : '삭제하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}