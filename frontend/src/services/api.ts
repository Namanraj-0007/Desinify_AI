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

// NOTE (Phase 2): avoid Authorization header to prevent CORS preflight issues in this environment.
API.interceptors.request.use((config) => {
  return config
})


API.interceptors.response.use(
  (res) => res,
  (err: AxiosError<ApiErrorShape>) => {
    const detail = err.response?.data?.detail
    return Promise.reject(new Error(detail ?? err.message))
  }
)


