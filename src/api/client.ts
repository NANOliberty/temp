import axios, { type InternalAxiosRequestConfig } from 'axios'

const BASE_URL = 'https://dev-api.wadadakk.xyz/api/v1'

const client = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
})

// 요청마다 JWT 자동으로 붙이기
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  // 이미 Authorization 헤더가 있으면 덮어쓰지 않음 (host 토큰 등 명시 호출 보호)
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 한 요청당 1회만 재시도하기 위한 플래그
type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean }

// 401 → refresh 쿠키로 accessToken 재발급 후 원요청 1회 재시도
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as RetriableConfig | undefined

    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true
      try {
        // 응답 body 의 새 accessToken 을 반드시 저장하고 헤더도 갱신해야 재시도가 유효함
        const res = await axios.post(`${BASE_URL}/auth/reissue`, {}, { withCredentials: true })
        const newToken: string | undefined = res.data?.data?.accessToken
        if (newToken) {
          localStorage.setItem('accessToken', newToken)
          original.headers.Authorization = `Bearer ${newToken}`
        }
        return client(original)
      } catch {
        // 재발급 실패(=서비스 세션 만료)일 때만 로그아웃 처리
        localStorage.removeItem('accessToken')
        window.location.href = '/'
        return Promise.reject(error)
      }
    }
    return Promise.reject(error)
  },
)

export default client
