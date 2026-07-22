import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import AuroraBackground from '../components/ui/AuroraBackground'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'

type Mode = 'login' | 'signup'

export default function AuthPage() {
  const { login, signup, token, loading } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function toggleMode() {
    setMode((m) => (m === 'login' ? 'signup' : 'login'))
    setError(null)
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await signup(name, email, password)
      }
      navigate('/dashboard')
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? err?.message ?? (mode === 'login' ? 'Login failed' : 'Signup failed'))
    } finally {
      setSubmitting(false)
    }
  }

  if (!loading && token) {
    navigate('/dashboard', { replace: true })
    return null
  }

  return (
    <section className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center overflow-hidden px-4 py-10">
      <AuroraBackground />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md"
      >
        {/* Glass card */}
        <div className="relative rounded-3xl border border-border/50 bg-card/60 backdrop-blur-2xl p-8 sm:p-10 shadow-[0_0_100px_hsl(252_87%_65%/0.08)]">
          {/* Glow top */}
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full bg-indigo-500/15 blur-3xl" />

          {/* Header */}
          <div className="relative text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-[0_0_30px_hsl(252_87%_65%/0.3)]">
              <span className="text-xl font-bold text-white">D</span>
            </div>
            <h2 className="mt-5 font-display text-2xl font-semibold">
              {mode === 'login' ? 'Welcome back' : 'Get started'}
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {mode === 'login'
                ? 'Sign in to your account to continue.'
                : 'Create an account and start generating.'}
            </p>
          </div>

          {/* Error */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="relative mt-6 overflow-hidden rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form className="relative mt-8 space-y-4" onSubmit={onSubmit}>
            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="text-sm text-muted-foreground mb-1.5 block">Full name</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Email address</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full mt-2"
              disabled={submitting}
            >
              {submitting
                ? mode === 'login'
                  ? 'Signing in...'
                  : 'Creating...'
                : mode === 'login'
                  ? 'Sign in'
                  : 'Create account'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          {/* Toggle mode */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === 'login' ? (
              <>
                Don&apos;t have an account?{' '}
                <button
                  onClick={toggleMode}
                  className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Create one
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={toggleMode}
                  className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Sign in
                </button>
              </>
            )}
          </div>

          {/* Trust badge */}
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="text-[10px] px-2 py-0.5">Secure</Badge>
            <span>Protected by end-to-end encryption</span>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

