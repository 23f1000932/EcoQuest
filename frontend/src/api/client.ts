import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
})

// Token storage (in-memory only for security)
let authToken: string | null = null

export function setAuthToken(token: string | null) {
  authToken = token
}

export function getAuthToken() {
  return authToken
}

// Request interceptor — attach JWT
apiClient.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`
  }
  return config
})

// Response interceptor — handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url: string = error.config?.url ?? ''
      // Don't redirect on /auth/verify 401 — that would cause an infinite loop
      // where the failed verify triggers a page reload which re-runs verify again
      if (!url.includes('/auth/verify')) {
        setAuthToken(null)
        window.location.href = '/'
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
