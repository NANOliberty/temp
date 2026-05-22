import axios from 'axios'

const client = axios.create({
  baseURL: 'https://dev-api.wadadakk.xyz/api/v1',
  withCredentials: true,
})

// 요청마다 JWT 자동으로 붙이기
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  // 이미 Authorization 헤더가 있으면 덮어쓰지 않음
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 401 오면 토큰 재발급
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await axios.post('https://dev-api.wadadakk.xyz/api/v1/auth/reissue', {}, { withCredentials: true })
        return client(error.config)
      } catch {
        localStorage.removeItem('accessToken')
        window.location.href = '/'
      }
    }
    return Promise.reject(error)
  }
)

export default client