import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('accessToken')) {
      navigate('/create', { replace: true })
    }
  }, [navigate])

  const handleGoogleLogin = () => {
    setLoading(true)
    window.location.href = 'https://dev-api.wadadakk.xyz/api/v1/auth/oauth/google/authorize'
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f7f7f9',
      fontFamily: "'Noto Sans KR', sans-serif",
      display: 'flex',
      flexDirection: 'column',
    }}>
      
      {/* 메인 */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px 80px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* 헤더 — 로고 + 타이틀 나란히 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 36 }}>
            <LogoMark size={64} />
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: -1.2, color: '#0d0d17', marginBottom: 6, lineHeight: 1.2 }}>
                선착순 이벤트를<br />시작해보세요
              </h1>
              <p style={{ fontSize: 13, color: '#9898b2', lineHeight: 1.6 }}>
                임시방을 만들려면 로그인이 필요해요.
              </p>
            </div>
          </div>

          {/* 로그인 카드 */}
          <div style={{
            background: '#fff',
            border: '1.5px solid #eaeaee',
            borderRadius: 16,
            padding: '28px 24px',
            boxShadow: '0 4px 24px rgba(0,0,0,.06)',
            marginBottom: 14,
          }}>
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                padding: '14px 20px',
                background: '#fff', border: '1.5px solid #d2d2dc',
                borderRadius: 10, cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: 15, fontWeight: 600, color: '#0d0d17',
                fontFamily: "'Noto Sans KR', sans-serif",
                transition: 'all .15s',
                opacity: loading ? 0.6 : 1,
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.borderColor = '#0d0d17'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,.08)' } }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#d2d2dc'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <GoogleIcon />
              {loading ? '이동 중...' : 'Google로 계속하기'}
            </button>
          </div>

          {/* 기능 안내 */}
          <div style={{
            background: '#fff',
            border: '1.5px solid #eaeaee',
            borderRadius: 16,
            padding: '24px',
            boxShadow: '0 4px 24px rgba(0,0,0,.06)',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#9898b2', marginBottom: 16, letterSpacing: 1, textTransform: 'uppercase' }}>로그인하면 가능한 것들</div>
            {[
              '임시방 생성 및 링크 공유',
              '참여자 명단 및 등수 조회',
              '임시방 설정 관리',
            ].map((text, i, arr) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 0',
                borderBottom: i < arr.length - 1 ? '1px solid #f7f7f9' : 'none',
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f55a2b', flexShrink: 0 }} />
                <span style={{ fontSize: 14, color: '#54546e', fontWeight: 500 }}>{text}</span>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 12, color: '#c8c8d8', marginTop: 20, textAlign: 'center', lineHeight: 1.6 }}>
            응모 참여자는 로그인 없이 링크로 바로 참여할 수 있어요.
          </p>
        </div>
      </div>
    </div>
  )
}

function LogoMark({ size }: { size: number }) {
  const sw = size * 0.135
  const handH = size * 0.35
  const handW = size * 0.115
  const stemH = size * 0.27
  const stemW = sw
  const crownW = size * 0.42
  const crownH = size * 0.155
  return (
    <div style={{ width: size, height: size, border: `${sw}px solid #0d0d17`, borderRadius: '50%', position: 'relative', flexShrink: 0 }}>
      {/* 시침 */}
      <div style={{
        position: 'absolute', width: handW, height: handH,
        background: '#f55a2b', borderRadius: handW,
        bottom: '50%', left: '50%',
        transformOrigin: 'bottom center',
        transform: `translateX(-50%) rotate(-28deg)`,
      }} />
      {/* 스템 */}
      <div style={{
        position: 'absolute', width: stemW, height: stemH,
        background: '#0d0d17', borderRadius: stemW,
        top: -stemH + sw * 0.5, left: '50%', transform: 'translateX(-50%)',
      }} />
      {/* 크라운 버튼 */}
      <div style={{
        position: 'absolute', width: crownW, height: crownH,
        background: '#f55a2b', borderRadius: crownH,
        top: -stemH - crownH + sw * 0.5, left: '50%', transform: 'translateX(-50%)',
      }} />
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
      <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
      <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18z"/>
      <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
    </svg>
  )
}