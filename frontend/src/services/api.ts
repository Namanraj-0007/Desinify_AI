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

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

API.interceptors.response.use(
  (res) => res,
  (err: AxiosError<ApiErrorShape>) => {
    const detail = err.response?.data?.detail
    return Promise.reject(new Error(detail ?? err.message))
  }
)


