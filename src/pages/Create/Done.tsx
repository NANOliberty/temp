import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

export default function CreateDone() {
  const location = useLocation()
  const navigate = useNavigate()
  const roomCode = location.state?.roomCode as string | undefined

useEffect(() => {
  if (!roomCode) navigate('/create')
}, [roomCode, navigate])

if (!roomCode) return null

  const shareUrl = `${window.location.origin}/r/${roomCode}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      alert('링크가 복사됐어요!')
    } catch {
      alert(shareUrl)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f7f7f9',
      fontFamily: "'Noto Sans KR', sans-serif",
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        background: '#fff',
        border: '1.5px solid #eaeaee',
        borderRadius: 16,
        padding: '48px 40px',
        maxWidth: 460, width: '100%',
        textAlign: 'center',
        boxShadow: '0 4px 24px rgba(0,0,0,.06)',
      }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🎉</div>
        <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: -1, marginBottom: 8 }}>
          임시방이 만들어졌어요
        </h1>
        <p style={{ fontSize: 14, color: '#9898b2', marginBottom: 32 }}>
          아래 링크를 공유해서 응모를 받아보세요.
        </p>

        {/* 링크 박스 */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: '#f7f7f9', border: '1.5px solid #eaeaee',
          borderRadius: 9, padding: '12px 14px', marginBottom: 12,
        }}>
          <span style={{
            flex: 1, fontSize: 13, color: '#54546e',
            fontFamily: "'DM Mono', monospace",
            wordBreak: 'break-all', textAlign: 'left',
          }}>
            {shareUrl}
          </span>
          <button
            onClick={handleCopy}
            style={{
              background: '#0d0d17', color: '#fff', border: 'none',
              padding: '7px 14px', borderRadius: 6,
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              fontFamily: "'Noto Sans KR', sans-serif",
              flexShrink: 0,
            }}
          >
            복사
          </button>
        </div>

        <div style={{ fontSize: 12, color: '#9898b2', marginBottom: 32 }}>
          방 코드: <span style={{ fontFamily: "'DM Mono', monospace", color: '#f55a2b', fontWeight: 600 }}>{roomCode}</span>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => navigate('/create')}
            style={{
              flex: 1, padding: '12px', background: '#fff',
              border: '1.5px solid #d2d2dc', borderRadius: 9,
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              fontFamily: "'Noto Sans KR', sans-serif", color: '#54546e',
            }}
          >
            새 임시방 만들기
          </button>
          <button
            onClick={() => navigate(`/r/${roomCode}`)}
            style={{
              flex: 1, padding: '12px', background: '#f55a2b',
              border: 'none', borderRadius: 9,
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              fontFamily: "'Noto Sans KR', sans-serif", color: '#fff',
            }}
          >
            방 확인하기 →
          </button>
        </div>
      </div>
    </div>
  )
}