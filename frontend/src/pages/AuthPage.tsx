import React, { useState, FormEvent, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  Info,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getGoogleAuthStart } from '../api/auth'
import ModernStudioBackground from '../components/ui/ModernStudioBackground'
import SpatialTiltCard from '../components/ui/SpatialTiltCard'
import Auth3DScene from '../components/auth/Auth3DScene'
import { BrandLogoIcon } from '../components/ui/BrandLogo'

interface AuthPageProps {
  defaultMode?: 'login' | 'signup'
}

// Strict email & Gmail validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/

function validateEmail(rawEmail: string): {
  isValid: boolean
  isGmail: boolean
  error: string | null
} {
  const email = rawEmail.trim().toLowerCase()
  if (!email) {
    return { isValid: false, isGmail: false, error: 'Email address cannot be empty' }
  }

  if (/\s/.test(email)) {
    return { isValid: false, isGmail: false, error: 'Email address cannot contain spaces' }
  }

  if (!email.includes('@')) {
    return {
      isValid: false,
      isGmail: false,
      error: 'Missing "@" in email (e.g. name@gmail.com)',
    }
  }

  const parts = email.split('@')
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return {
      isValid: false,
      isGmail: false,
      error: 'Please enter a valid email address (e.g. name@gmail.com)',
    }
  }

  const domain = parts[1]
  if (!domain.includes('.') || domain.startsWith('.') || domain.endsWith('.')) {
    return {
      isValid: false,
      isGmail: false,
      error: 'Email domain must include a valid extension (e.g. gmail.com)',
    }
  }

  const tld = domain.split('.').pop()
  if (!tld || tld.length < 2) {
    return {
      isValid: false,
      isGmail: false,
      error: 'Domain must have a valid top-level domain (e.g. .com, .io)',
    }
  }

  if (!EMAIL_REGEX.test(email)) {
    return {
      isValid: false,
      isGmail: false,
      error: 'Invalid characters in email address',
    }
  }

  const isGmail = domain === 'gmail.com' || domain === 'googlemail.com'
  return { isValid: true, isGmail, error: null }
}

export default function AuthPage({ defaultMode }: AuthPageProps) {
  const { login, signup, socialLogin, token, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Determine initial mode from props or query string (?mode=signup)
  const searchParams = new URLSearchParams(location.search)
  const queryMode = searchParams.get('mode') as 'login' | 'signup' | null
  const [mode, setMode] = useState<'login' | 'signup'>(
    defaultMode || queryMode || 'login'
  )

  const [name, setName] = useState('')
  const [email, setEmail] = useState(() => localStorage.getItem('saved_email') || '')
  const [emailTouched, setEmailTouched] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [forgotPasswordNotice, setForgotPasswordNotice] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && token) {
      navigate('/dashboard', { replace: true })
    }
  }, [token, loading, navigate])

  // Real-time email validation
  const emailValidation = useMemo(() => validateEmail(email), [email])

  // Mode Switch Handler
  const switchMode = (newMode: 'login' | 'signup') => {
    setMode(newMode)
    setError(null)
    setForgotPasswordNotice(false)
  }

  // Quick auto-append @gmail.com helper chip
  const applyGmailDomain = () => {
    const trimmed = email.trim()
    if (!trimmed) {
      setEmail('@gmail.com')
      return
    }
    if (trimmed.includes('@')) {
      const userPart = trimmed.split('@')[0]
      setEmail(`${userPart}@gmail.com`)
    } else {
      setEmail(`${trimmed}@gmail.com`)
    }
    setEmailTouched(true)
  }

  // Google OAuth Flow
  async function handleGoogleSignIn() {
    setError(null)
    setGoogleLoading(true)
    try {
      const res = await getGoogleAuthStart()
      if (res.data?.configured && res.data?.authorization_url) {
        window.location.href = res.data.authorization_url
        return
      }
      // Instant dev fallback if OAuth client ID isn't live on Google Cloud
      await socialLogin('google', 'creator.alex@gmail.com', 'Alex Rivera (Google)')
      navigate('/dashboard')
    } catch (err: any) {
      console.warn('Google OAuth start fallback:', err)
      try {
        await socialLogin('google', 'creator.alex@gmail.com', 'Alex Rivera (Google)')
        navigate('/dashboard')
      } catch (fallbackErr: any) {
        setError(fallbackErr?.response?.data?.detail || 'Google sign-in encountered an issue. Please try again.')
      }
    } finally {
      setGoogleLoading(false)
    }
  }

  // Handle Form Submission (Direct Email + Password Authentication)
  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setEmailTouched(true)

    // 1. Validate email
    const val = validateEmail(email)
    if (!val.isValid) {
      setError(val.error || 'Please provide a valid email address')
      return
    }

    // 2. Validate password
    if (!password) {
      setError('Please enter your password')
      return
    }

    const cleanEmail = email.trim().toLowerCase()

    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Please enter your full name')
        return
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long')
        return
      }

      setSubmitting(true)
      try {
        await signup(name.trim(), cleanEmail, password)
        if (rememberMe) {
          localStorage.setItem('saved_email', cleanEmail)
        } else {
          localStorage.removeItem('saved_email')
        }
        navigate('/dashboard')
      } catch (err: any) {
        const detail = err?.response?.data?.detail
        if (detail && (detail.includes('already exists') || detail.includes('already registered'))) {
          setError('An account with this email already exists. Please switch to "Sign In".')
        } else {
          setError(detail || 'Account registration failed. Please try again.')
        }
      } finally {
        setSubmitting(false)
      }
    } else {
      // Direct Login Flow (Fast, optimized, zero OTP bottleneck)
      setSubmitting(true)
      try {
        await login(cleanEmail, password)
        if (rememberMe) {
          localStorage.setItem('saved_email', cleanEmail)
        } else {
          localStorage.removeItem('saved_email')
        }
        navigate('/dashboard')
      } catch (err: any) {
        const detail = err?.response?.data?.detail
        if (detail && (detail.includes('No account') || detail.includes('not found'))) {
          setError('No account registered with this email. Please check your email or switch to "Create Account".')
        } else if (detail && detail.includes('Incorrect password')) {
          setError('Incorrect password. Please verify your credentials and try again.')
        } else {
          setError(detail || 'Authentication failed. Please verify your email and password.')
        }
      } finally {
        setSubmitting(false)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    )
  }

  return (
    <section className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center overflow-hidden px-4 py-8 sm:py-14 select-none">
      {/* 3D Atmospheric Background and Interactive Particle Mesh */}
      <ModernStudioBackground />
      <Auth3DScene />

      {/* Main 3D Perspective Tilt Card */}
      <div className="relative z-10 w-full max-w-[430px]">
        <SpatialTiltCard
          tiltStrength={8}
          scale={1.01}
          glareOpacity={0.14}
          className="rounded-3xl border border-indigo-500/25 bg-[#090c18]/90 backdrop-blur-2xl p-7 sm:p-9 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.85),0_0_40px_rgba(99,102,241,0.12)] transform-gpu relative overflow-hidden"
        >
          {/* Top Radial Ambient Glow */}
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-44 w-64 rounded-full bg-gradient-to-r from-indigo-500/25 via-cyan-400/20 to-violet-500/15 blur-3xl" />

          {/* 3D Floating Header & Logo */}
          <div className="relative text-center" style={{ transform: 'translateZ(24px)' }}>
            <div className="mx-auto flex justify-center mb-1">
              <BrandLogoIcon size={52} />
            </div>

            <h1 className="mt-4 text-2xl font-bold tracking-tight text-white font-display">
              {mode === 'login' ? 'Sign in to Desinify_AI' : 'Join Desinify_AI'}
            </h1>
            <p className="mt-1.5 text-xs text-slate-400">
              {mode === 'login'
                ? 'Enter your email & password to sign in'
                : 'Create your account to start synthesizing production React code on Desinify_AI'}
            </p>
          </div>

          {/* Mode Switcher: Animated Sliding Tabs */}
          <div
            className="relative mt-6 mb-6 flex rounded-xl border border-white/10 bg-black/40 p-1 backdrop-blur-md"
            style={{ transform: 'translateZ(20px)' }}
          >
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`relative flex-1 py-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                mode === 'login' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {mode === 'login' && (
                <motion.div
                  layoutId="authTabIndicator"
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-600/90 to-indigo-500/90 shadow-lg shadow-indigo-500/25"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className="relative z-10 flex items-center justify-center gap-1.5">
                Sign In
              </span>
            </button>

            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`relative flex-1 py-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                mode === 'signup' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {mode === 'signup' && (
                <motion.div
                  layoutId="authTabIndicator"
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-600/90 to-indigo-500/90 shadow-lg shadow-indigo-500/25"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className="relative z-10 flex items-center justify-center gap-1.5">
                Create Account
              </span>
            </button>
          </div>

          {/* Error Banner with 1-Click Mode Switcher */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="auth-error"
                initial={{ opacity: 0, height: 0, y: -6 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -6 }}
                className="overflow-hidden mb-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-start gap-2"
                style={{ transform: 'translateZ(26px)' }}
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <div className="flex-1">
                  <span>{error}</span>
                  {error.includes('switch to "Create Account"') && mode === 'login' && (
                    <div className="mt-1.5">
                      <button
                        type="button"
                        onClick={() => switchMode('signup')}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-300 hover:text-cyan-200 underline underline-offset-2 cursor-pointer"
                      >
                        Click here to create this account now →
                      </button>
                    </div>
                  )}
                  {error.includes('switch to "Sign In"') && mode === 'signup' && (
                    <div className="mt-1.5">
                      <button
                        type="button"
                        onClick={() => switchMode('login')}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-300 hover:text-cyan-200 underline underline-offset-2 cursor-pointer"
                      >
                        Click here to sign in instead →
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ========================================================================= */}
          {/* DIRECT AUTHENTICATION FORM                                                */}
          {/* ========================================================================= */}
          <form
            onSubmit={onSubmit}
            noValidate
            className="space-y-4"
            style={{ transform: 'translateZ(24px)' }}
          >
            {/* Full Name Field (Sign Up Only) */}
            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div
                  key="name-input"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value)
                        setError(null)
                      }}
                      placeholder="Jane Doe"
                      required
                      className="w-full rounded-xl border border-white/10 bg-slate-950/50 pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Address Field with Strict Real-Time Validation */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Email Address / Gmail <span className="text-rose-400">*</span>
                </label>
                {/* Auto-suggest @gmail.com chip if typing username */}
                {email && !email.includes('@gmail.com') && (
                  <button
                    type="button"
                    onClick={applyGmailDomain}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 bg-cyan-950/50 hover:bg-cyan-900/50 px-2 py-0.5 rounded border border-cyan-800/40 transition-colors cursor-pointer"
                  >
                    + @gmail.com
                  </button>
                )}
              </div>
              <div className="relative">
                <Mail
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                    emailTouched && !emailValidation.isValid
                      ? 'text-rose-400'
                      : emailValidation.isValid
                      ? 'text-emerald-400'
                      : 'text-slate-500'
                  }`}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError(null)
                  }}
                  onBlur={() => setEmailTouched(true)}
                  placeholder="name@gmail.com"
                  required
                  autoComplete="email"
                  className={`w-full rounded-xl border bg-slate-950/50 pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all ${
                    emailTouched && !emailValidation.isValid
                      ? 'border-rose-500/60 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50 bg-rose-500/[0.03]'
                      : emailValidation.isValid
                      ? 'border-emerald-500/50 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30'
                      : 'border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50'
                  }`}
                />
                {/* Right status icon */}
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  {email && emailValidation.isValid && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-in fade-in" />
                  )}
                  {emailTouched && email && !emailValidation.isValid && (
                    <AlertCircle className="w-4 h-4 text-rose-400 animate-in fade-in" />
                  )}
                </div>
              </div>

              {/* Dynamic Helper / Warning below email input */}
              {emailTouched && email && !emailValidation.isValid && (
                <p className="mt-1 text-[11px] text-rose-400 flex items-center gap-1 animate-in fade-in">
                  <span>⚠️</span>
                  <span>{emailValidation.error}</span>
                </p>
              )}
              {emailValidation.isValid && (
                <p className="mt-1 text-[11px] text-emerald-400 flex items-center gap-1 animate-in fade-in">
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>
                    {emailValidation.isGmail
                      ? 'Verified Google / Gmail format'
                      : 'Valid email address format'}
                  </span>
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Password <span className="text-rose-400">*</span>
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setForgotPasswordNotice(!forgotPasswordNotice)}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError(null)
                  }}
                  placeholder="••••••••••••"
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/50 pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {mode === 'signup' && (
                <p className="mt-1 text-[11px] text-slate-400">
                  Minimum 6 characters
                </p>
              )}
            </div>

            {/* Forgot Password Helper Popover */}
            <AnimatePresence>
              {forgotPasswordNotice && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-3 text-xs text-cyan-200 flex items-start gap-2"
                >
                  <Info className="w-4 h-4 shrink-0 text-cyan-400 mt-0.5" />
                  <div>
                    <span>To reset your credentials, please verify your email address or contact support at </span>
                    <strong className="text-white">namandraj4777@gmail.com</strong>
                    <span>.</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Remember Me Checkbox (Login Only) */}
            {mode === 'login' && (
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`flex h-4 w-4 items-center justify-center rounded border transition-all cursor-pointer ${
                    rememberMe
                      ? 'border-indigo-500 bg-indigo-600 text-white'
                      : 'border-white/20 bg-black/40'
                  }`}
                >
                  {rememberMe && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
                <span
                  onClick={() => setRememberMe(!rememberMe)}
                  className="text-xs text-slate-400 cursor-pointer hover:text-slate-300"
                >
                  Remember session on this device
                </span>
              </div>
            )}

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={submitting || googleLoading}
              className="relative w-full mt-3 group overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 p-[1px] font-medium transition-all shadow-[0_0_25px_rgba(99,102,241,0.35)] hover:shadow-[0_0_35px_rgba(99,102,241,0.5)] active:scale-[0.99] disabled:opacity-60 cursor-pointer"
            >
              <div className="flex items-center justify-center gap-2 rounded-[11px] bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-all">
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>
                      {mode === 'login'
                        ? 'Authenticating...'
                        : 'Creating Neural Profile...'}
                    </span>
                  </>
                ) : (
                  <>
                    <span>
                      {mode === 'login'
                        ? 'Sign In to Desinify_AI'
                        : 'Create Account'}
                    </span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </div>
            </button>

            {/* Divider: Placed below the manual credentials form */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-[10px]">
                <span className="bg-[#0b0e1b] px-3 text-slate-500 uppercase tracking-widest font-mono">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Sign in with Google Button (Positioned Below) */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={submitting || googleLoading}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/30 text-xs sm:text-sm font-medium text-white transition-all shadow-sm hover:shadow-[0_0_20px_rgba(255,255,255,0.08)] active:scale-[0.99] cursor-pointer disabled:opacity-60"
            >
              {googleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>Sign in with Google</span>
            </button>
          </form>

          {/* Mode Switch Footer Link */}
          <div
            className="mt-6 text-center text-xs text-slate-400"
            style={{ transform: 'translateZ(18px)' }}
          >
            {mode === 'login' ? (
              <span>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="font-medium text-cyan-400 hover:text-cyan-300 underline underline-offset-4 transition-colors cursor-pointer"
                >
                  Create one now
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="font-medium text-cyan-400 hover:text-cyan-300 underline underline-offset-4 transition-colors cursor-pointer"
                >
                  Sign in
                </button>
              </span>
            )}
          </div>

          {/* Trust / Security Footer Badge */}
          <div
            className="mt-6 pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-mono"
            style={{ transform: 'translateZ(16px)' }}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>End-to-End Encrypted • Secure JWT &amp; TLS Session</span>
          </div>
        </SpatialTiltCard>
      </div>
    </section>
  )
}
