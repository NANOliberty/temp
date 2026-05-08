import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function AuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const accessToken = searchParams.get('accessToken')
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken)
      navigate('/my', { replace: true })
    } else {
      navigate('/', { replace: true })
    }
  }, [navigate, searchParams])

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', fontFamily: "'Noto Sans KR', sans-serif",
      color: '#9898b2', fontSize: 14,
    }}>
      로그인 처리 중...
    </div>
  )
}