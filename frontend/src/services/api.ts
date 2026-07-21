import axios, { AxiosError } from 'axios'

const baseURL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000/api'

export const API = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
})

type ApiErrorShape = {
  detail?: string
}

/* ─── Helper: read JWT from localStorage ─────────────────────────────── */
function getAccessToken(): string | null {
  // Support both key names for backward compatibility
  return localStorage.getItem('access_token') ?? localStorage.getItem('token')
}

/* ─── Helper: user-friendly error messages for auth failures ──────────── */
const AUTH_ERROR_MAP: Record<string, string> = {
  'Not authenticated': 'Session expired. Please login again.',
  'Invalid token': 'Invalid JWT. Please login again.',
  'Could not validate credentials': 'Session expired. Please login again.',
}

function buildErrorMessage(raw: string | undefined, status: number | undefined): string {
  if (status === 401 && raw && AUTH_ERROR_MAP[raw]) {
    return AUTH_ERROR_MAP[raw]
  }
  if (status === 400 && raw?.toLowerCase().includes('figma token')) {
    return 'Figma Personal Access Token is invalid.'
  }
  return raw ?? 'An unexpected error occurred.'
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
    const message = buildErrorMessage(detail, status)
    return Promise.reject(new Error(message))
  }
)


