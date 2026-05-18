import { useNavigate } from 'react-router-dom'

type ErrorType = 'not_found' | 'closed' | 'deleted' | 'generic'

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

const ERROR_INFO: Record<ErrorType, { icon: string; title: string; desc: string; code: string }> = {
  not_found: {
    icon: '🔍',
    title: '방을 찾을 수 없어요',
    desc: '링크가 잘못됐거나 방이 존재하지 않아요.',
    code: '404',
  },
  closed: {
    icon: '🏁',
    title: '선착순이 마감됐어요',
    desc: '이미 응모가 종료된 임시방이에요.',
    code: 'CLOSED',
  },
  deleted: {
    icon: '🗑',
    title: '삭제된 방이에요',
    desc: '호스트가 이 임시방을 삭제했어요.',
    code: 'DELETED',
  },
  generic: {
    icon: '⚠️',
    title: '오류가 발생했어요',
    desc: '잠시 후 다시 시도해주세요.',
    code: 'ERROR',
  },
}

interface ErrorPageProps {
  type?: ErrorType
}

export default function ErrorPage({ type = 'not_found' }: ErrorPageProps) {
  const navigate = useNavigate()
  const info = ERROR_INFO[type]

  return (
    <div style={{ minHeight: '100vh', background: '#f7f7f9', fontFamily: "'Noto Sans KR', sans-serif" }}>
      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 52px', background: 'rgba(255,255,255,.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #eaeaee' }}>
        <div onClick={() => navigate('/')} style={{ cursor: 'pointer' }}><LogoMark /></div>
        <button onClick={() => navigate('/')} style={{ background: '#f55a2b', color: '#fff', border: 'none', cursor: 'pointer', padding: '9px 18px', borderRadius: 8, fontSize: 13.5, fontWeight: 700, fontFamily: "'Noto Sans KR', sans-serif" }}
          onMouseEnter={e => e.currentTarget.style.background = '#e04d22'}
          onMouseLeave={e => e.currentTarget.style.background = '#f55a2b'}
        >홈으로</button>
      </nav>

      {/* 본문 */}
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          {/* 아이콘 */}
          <div style={{ fontSize: 56, marginBottom: 24 }}>{info.icon}</div>

          {/* 코드 뱃지 */}
          <div style={{ display: 'inline-block', fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: 2, color: '#9898b2', background: '#eaeaee', borderRadius: 100, padding: '4px 14px', marginBottom: 16 }}>
            {info.code}
          </div>

          <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: -1, color: '#0d0d17', marginBottom: 10 }}>
            {info.title}
          </h1>
          <p style={{ fontSize: 14, color: '#9898b2', lineHeight: 1.7, marginBottom: 36 }}>
            {info.desc}
          </p>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button
              onClick={() => navigate(-1)}
              style={{ padding: '12px 22px', background: '#fff', border: '1.5px solid #eaeaee', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'Noto Sans KR', sans-serif", color: '#54546e', transition: 'border-color .15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#d2d2dc'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#eaeaee'}
            >
              뒤로가기
            </button>
            <button
              onClick={() => navigate('/')}
              style={{ padding: '12px 22px', background: '#f55a2b', color: '#fff', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'Noto Sans KR', sans-serif", transition: 'background .15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#e04d22'}
              onMouseLeave={e => e.currentTarget.style.background = '#f55a2b'}
            >
              홈으로 →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// 404 전용 export
export function NotFoundPage() { return <ErrorPage type="not_found" /> }
export function ClosedPage() { return <ErrorPage type="closed" /> }
export function DeletedPage() { return <ErrorPage type="deleted" /> }