import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { API } from '../services/api'

type AuthContextValue = {
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function getToken() {
  return localStorage.getItem('token')
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setToken(getToken())
    setLoading(false)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      loading,
      async signup(name, email, password) {
        const res = await API.post('/auth/signup', { name, email, password })

        if (res.data?.access_token) {
          localStorage.setItem('token', res.data.access_token)
          setToken(res.data.access_token)
        }
      },
      async login(email, password) {
        const res = await API.post('/auth/login', { email, password })

        if (res.data?.access_token) {
          localStorage.setItem('token', res.data.access_token)
          setToken(res.data.access_token)
        }
      },
      logout() {
        localStorage.removeItem('token')
        setToken(null)
      }
    }),
    [token]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}


