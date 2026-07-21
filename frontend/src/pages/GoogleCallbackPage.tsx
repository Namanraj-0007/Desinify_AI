import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API } from '../services/api'

export default function GoogleCallbackPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function run() {
      try {
        const url = new URL(window.location.href)
        const code = url.searchParams.get('code')
        const state = url.searchParams.get('state')

        if (!code) throw new Error('Missing Google authorization code')

        // Callback exchanges code and returns user info + issues JWT.
        // Phase 1: backend sets auth token in query is avoided; instead backend returns token.
        // We expect backend to expose /auth/google/callback that returns access_token.
        const res = await API.get('/auth/google/callback', { params: { code, state } })

        const accessToken = (res.data as any).access_token as string | undefined
        if (!accessToken) throw new Error('Google sign-in did not return token')

        localStorage.setItem('access_token', accessToken)
        localStorage.setItem('token', accessToken)
        navigate('/dashboard', { replace: true })
      } catch (e: any) {
        setError(e?.message ?? 'Google sign-in failed')
      } finally {
        setLoading(false)
      }
    }

    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-400">
        Signing in with Google...
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 py-14">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-2xl font-semibold">Google Sign-In</h2>
        <p className="text-slate-400 mt-2">{error ?? 'Completed'}</p>
        {error ? <p className="mt-4 text-red-200">{error}</p> : null}
      </div>
    </div>
  )
}

