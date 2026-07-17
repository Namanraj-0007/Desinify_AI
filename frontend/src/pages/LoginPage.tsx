import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="max-w-md mx-auto px-4 py-14">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-2xl font-semibold">Login</h2>
        <p className="text-slate-400 mt-2">Access your projects dashboard.</p>

        {error ? (
          <div className="mt-4 p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 text-sm">
            {error}
          </div>
        ) : null}

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-sm text-slate-300">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/30 px-3 py-2 outline-none focus:border-indigo-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-sm text-slate-300">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/30 px-3 py-2 outline-none focus:border-indigo-500"
              placeholder="••••••••"
            />
          </div>

          <button
            disabled={submitting}
            className="w-full rounded-xl bg-white text-slate-950 font-semibold py-2.5 hover:bg-white/90 disabled:opacity-60"
          >
            {submitting ? 'Signing in...' : 'Login'}
          </button>

          <div className="text-sm text-slate-400">
            No account?{' '}
            <Link to="/signup" className="text-indigo-300 hover:underline">
              Create one
            </Link>
          </div>
        </form>
      </div>
    </section>
  )
}

