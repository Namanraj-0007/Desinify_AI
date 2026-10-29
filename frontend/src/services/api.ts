import axios, { AxiosError } from 'axios'

const baseURL =
  (import.meta as any).env?.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? 'http://localhost:8000/api' : '/api')

export const API = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
})

type ApiErrorShape = {
  detail?: any
}

/* ─── Helper: read JWT from localStorage ─────────────────────────────── */
function getAccessToken(): string | null {
  // Support both key names for backward compatibility
  const token = localStorage.getItem('access_token') ?? localStorage.getItem('token')
  if (!token || token === 'undefined' || token === 'null') return null
  return token
}

/* ─── Helper: user-friendly error messages for auth failures ──────────── */
const AUTH_ERROR_MAP: Record<string, string> = {
  'Not authenticated': 'Session expired. Please login again.',
  'Invalid token': 'Session expired. Please login again.',
  'Token expired': 'Session expired. Please login again.',
  'Could not validate credentials': 'Session expired. Please login again.',
}

function buildErrorMessage(raw: any, status: number | undefined, axiosMessage?: string): string {
  if (status === 401 && typeof raw === 'string' && AUTH_ERROR_MAP[raw]) {
    return AUTH_ERROR_MAP[raw]
  }
  if (typeof raw === 'string' && raw.trim()) {
    return raw
  }
  if (Array.isArray(raw) && raw.length > 0) {
    const first = raw[0]
    return first?.msg || first?.message || 'Invalid input data'
  }
  if (raw && typeof raw === 'object' && raw.message) {
    return raw.message
  }
  if (axiosMessage && axiosMessage !== 'Error') {
    if (axiosMessage.toLowerCase().includes('network error')) {
      return 'Cannot connect to backend server. Is it running on port 8000?'
    }
    return axiosMessage
  }
  return 'An unexpected error occurred.'
}

/* ─── Request interceptor: attach JWT to every protected request ─────── */
API.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/* ─── Response interceptor: improve error messages ───────────────────── */
API.interceptors.response.use(
  (res) => res,
  (err: AxiosError<ApiErrorShape>) => {
    const status = err.response?.status
    const detail = err.response?.data?.detail
    const message = buildErrorMessage(detail, status, err.message)

    if (status === 401) {
      const isAuthAttempt =
        err.config?.url?.includes('/auth/login') ||
        err.config?.url?.includes('/auth/signup')

      if (!isAuthAttempt) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('token')
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('auth:logout'))
        }
      }
    }

    return Promise.reject(new Error(message))
  }
)
