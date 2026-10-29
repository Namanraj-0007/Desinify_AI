import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { API } from '../services/api'

type AuthContextValue = {
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  verifyOtpLogin: (email: string, otp: string) => Promise<void>
  socialLogin: (provider: 'google' | 'discord', email?: string, name?: string) => Promise<void>
  setSessionToken: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function isTokenValid(token: string | null): boolean {
  if (!token || token === 'undefined' || token === 'null') return false
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return false
    const base64Url = parts[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    const payload = JSON.parse(jsonPayload)
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return false
    }
    return true
  } catch {
    return false
  }
}

function getStoredToken(): string | null {
  const token = localStorage.getItem('access_token') ?? localStorage.getItem('token')
  if (!isTokenValid(token)) {
    if (token) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('token')
    }
    return null
  }
  return token
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setToken(getStoredToken())
    setLoading(false)

    const handleAuthLogout = () => {
      localStorage.removeItem('access_token')
      localStorage.removeItem('token')
      setToken(null)
    }

    window.addEventListener('auth:logout', handleAuthLogout)
    return () => window.removeEventListener('auth:logout', handleAuthLogout)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      loading,
      setSessionToken(newToken: string) {
        localStorage.setItem('access_token', newToken)
        localStorage.setItem('token', newToken)
        setToken(newToken)
      },
      async signup(name, email, password) {
        const res = await API.post('/auth/signup', { name, email, password })

        if (res.data?.access_token) {
          const newToken = res.data.access_token
          localStorage.setItem('access_token', newToken)
          localStorage.setItem('token', newToken)
          setToken(newToken)
        }
      },
      async login(email, password) {
        const res = await API.post('/auth/login', { email, password })

        if (res.data?.access_token) {
          const newToken = res.data.access_token
          localStorage.setItem('access_token', newToken)
          localStorage.setItem('token', newToken)
          setToken(newToken)
        }
      },
      async verifyOtpLogin(email, otp) {
        const res = await API.post('/auth/otp/verify', { email, otp })

        if (res.data?.access_token) {
          const newToken = res.data.access_token
          localStorage.setItem('access_token', newToken)
          localStorage.setItem('token', newToken)
          setToken(newToken)
        }
      },
      async socialLogin(provider, email, name) {
        const fallbackEmail =
          email ||
          (provider === 'google'
            ? 'creator.google@desinify.ai'
            : 'creator.discord@desinify.ai')
        const fallbackName =
          name || (provider === 'google' ? 'Google Creator' : 'Discord Member')

        const res = await API.post('/auth/social-login', {
          provider,
          email: fallbackEmail,
          name: fallbackName,
        })

        if (res.data?.access_token) {
          const newToken = res.data.access_token
          localStorage.setItem('access_token', newToken)
          localStorage.setItem('token', newToken)
          setToken(newToken)
        }
      },
      logout() {
        localStorage.removeItem('access_token')
        localStorage.removeItem('token')
        setToken(null)
      },
    }),
    [token, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
