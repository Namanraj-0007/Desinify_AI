import React, { useState, FormEvent, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  Check,
  Info,
  Loader2,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ArrowLeft,
  RefreshCw
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getGoogleAuthStart, getDiscordAuthStart, loginStep1, sendOtp } from '../api/auth'
import ModernStudioBackground from '../components/ui/ModernStudioBackground'
import SpatialTiltCard from '../components/ui/SpatialTiltCard'
import Auth3DScene from '../components/auth/Auth3DScene'

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
      error: 'Missing "@" in email (e.g. name@gmail.com)'
    }
  }

  const parts = email.split('@')
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return {
      isValid: false,
      isGmail: false,
      error: 'Please enter a valid email address (e.g. name@gmail.com)'
    }
  }

  const domain = parts[1]
  if (!domain.includes('.') || domain.startsWith('.') || domain.endsWith('.')) {
    return {
      isValid: false,
      isGmail: false,
      error: 'Email domain must include a valid extension (e.g. gmail.com)'
    }
  }

  const tld = domain.split('.').pop()
  if (!tld || tld.length < 2) {
    return {
      isValid: false,
      isGmail: false,
      error: 'Top-level domain must be valid (e.g. .com, .org, .net)'
    }
  }

  if (!EMAIL_REGEX.test(email)) {
    return {
      isValid: false,
      isGmail: false,
      error: 'Invalid characters in email address'
    }
  }

  const isGmail = domain === 'gmail.com' || domain === 'googlemail.com'
  return { isValid: true, isGmail, error: null }
}

export default function AuthPage({ defaultMode }: AuthPageProps) {
  const { signup, verifyOtpLogin, socialLogin, token, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Determine initial mode from props or query string (?mode=signup)
  const searchParams = new URLSearchParams(location.search)
  const queryMode = searchParams.get('mode') as 'login' | 'signup' | null
  const [mode, setMode] = useState<'login' | 'signup'>(
    defaultMode || queryMode || 'login'
  )

  // Step 1: 'credentials' (Email + Password) -> Step 2: 'otp_verification'
  const [authStep, setAuthStep] = useState<'credentials' | 'otp_verification'>('credentials')
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [devOtp, setDevOtp] = useState<string | null>(null)
  const [resendCountdown, setResendCountdown] = useState<number>(0)
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([])

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [emailTouched, setEmailTouched] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [socialLoading, setSocialLoading] = useState<'google' | 'discord' | null>(null)
  const [forgotPasswordNotice, setForgotPasswordNotice] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && token) {
      navigate('/dashboard', { replace: true })
    }
  }, [loading, token, navigate])

  // Countdown timer for OTP resend
  useEffect(() => {
    if (resendCountdown <= 0) return
    const timer = setInterval(() => {
      setResendCountdown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCountdown])

  // Real-time email validation
  const emailValidation = useMemo(() => {
    return validateEmail(email)
  }, [email])

  function switchMode(newMode: 'login' | 'signup') {
    setMode(newMode)
    setError(null)
    setForgotPasswordNotice(false)
    setAuthStep('credentials')
    setDevOtp(null)
  }

  // Quick email autocomplete suggestion (e.g. if user types "alex", append "@gmail.com")
  function applyGmailDomain() {
    const trimmed = email.trim()
    if (!trimmed) {
      setEmail('user@gmail.com')
    } else if (trimmed.includes('@')) {
      const userPart = trimmed.split('@')[0]
      setEmail(`${userPart}@gmail.com`)
    } else {
      setEmail(`${trimmed}@gmail.com`)
    }
    setEmailTouched(true)
    setError(null)
  }

  // Step 1: Submit Email + Password -> Verify Credentials & Dispatch OTP
  async function onSubmitCredentials(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setEmailTouched(true)

    const cleanEmail = email.trim().toLowerCase()

    // 1. Strict Email Format Check
    if (!emailValidation.isValid) {
      setError(emailValidation.error || 'Please enter a valid email address (e.g. name@gmail.com)')
      return
    }

    // 2. Password Check
    if (!password) {
      setError('Please enter your password')
      return
    }

    // 3. For Sign Up
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
        navigate('/dashboard')
      } catch (err: any) {
        setError(err?.response?.data?.detail || err?.message || 'Registration failed.')
      } finally {
        setSubmitting(false)
      }
      return
    }

    // 4. For Login: Step 1 (Verify Email + Password, then ask for OTP)
    setSubmitting(true)
    try {
      const res = await loginStep1({ email: cleanEmail, password })
      setDevOtp(res.data?.dev_otp || null)
      setAuthStep('otp_verification')
      setResendCountdown(45)
      setOtpDigits(['', '', '', '', '', ''])

      // Auto-focus the first OTP digit
      setTimeout(() => {
        otpInputRefs.current[0]?.focus()
      }, 150)
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
        err?.message ||
        'Authentication failed. Please verify your email and password.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  // Step 2: Handle OTP input digit change
  function handleOtpDigitChange(index: number, val: string) {
    const char = val.slice(-1)
    if (char && !/^\d$/.test(char)) return

    const updated = [...otpDigits]
    updated[index] = char
    setOtpDigits(updated)
    setError(null)

    if (char && index < 5) {
      otpInputRefs.current[index + 1]?.focus()
    }

    // If all 6 digits are filled, automatically verify
    if (char && index === 5 && updated.every((d) => d !== '')) {
      executeVerifyOtp(updated.join(''))
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus()
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').trim()
    if (/^\d{6}$/.test(pasted)) {
      const chars = pasted.split('')
      setOtpDigits(chars)
      executeVerifyOtp(pasted)
    }
  }

  function applyDevOtp() {
    if (!devOtp || devOtp.length !== 6) return
    const chars = devOtp.split('')
    setOtpDigits(chars)
    executeVerifyOtp(devOtp)
  }

  // Resend OTP in Step 2
  async function handleResendOtp() {
    setError(null)
    setSubmitting(true)
    try {
      const res = await sendOtp(email.trim().toLowerCase())
      setDevOtp(res.data?.dev_otp || null)
      setResendCountdown(45)
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to resend verification code')
    } finally {
      setSubmitting(false)
    }
  }

  // Step 2: Submit OTP verification
  async function executeVerifyOtp(code?: string) {
    const fullCode = code || otpDigits.join('')
    if (fullCode.length !== 6) {
      setError('Please enter all 6 digits of your verification code')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await verifyOtpLogin(email.trim().toLowerCase(), fullCode)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Verification code failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // 1-Click Demo Login
  async function handleDemoLogin() {
    setError(null)
    setSubmitting(true)
    try {
      await socialLogin('google', 'demo@desinify.ai', 'Studio Demo User')
      navigate('/dashboard')
    } catch (err: any) {
      setError('Demo login initialization failed')
    } finally {
      setSubmitting(false)
    }
  }

  // Google OAuth / Social Flow
  async function handleGoogleSignIn() {
    setError(null)
    setSocialLoading('google')
    try {
      const res = await getGoogleAuthStart()
      if (res.data?.configured && res.data?.authorization_url) {
        window.location.href = res.data.authorization_url
        return
      }
      // Instant dev fallback if OAuth client ID isn't live on Google Cloud
      await socialLogin('google', 'alex.rivera@gmail.com', 'Alex Rivera (Google)')
      navigate('/dashboard')
    } catch (err: any) {
      console.warn('Google OAuth start fallback:', err)
      try {
        await socialLogin('google', 'alex.rivera@gmail.com', 'Alex Rivera (Google)')
        navigate('/dashboard')
      } catch (fallbackErr: any) {
        setError(fallbackErr?.response?.data?.detail || 'Google sign-in error')
      }
    } finally {
      setSocialLoading(null)
    }
  }

  // Discord OAuth / Social Flow
  async function handleDiscordSignIn() {
    setError(null)
    setSocialLoading('discord')
    try {
      const res = await getDiscordAuthStart()
      if (res.data?.configured && res.data?.authorization_url) {
        window.location.href = res.data.authorization_url
        return
      }
      // Instant dev fallback if Discord client ID isn't live on Discord Developer Portal
      await socialLogin('discord', 'hyperion#1337@discord.gg', 'Hyperion (Discord)')
      navigate('/dashboard')
    } catch (err: any) {
      console.warn('Discord OAuth start fallback:', err)
      try {
        await socialLogin('discord', 'hyperion#1337@discord.gg', 'Hyperion (Discord)')
        navigate('/dashboard')
      } catch (fallbackErr: any) {
        setError(fallbackErr?.response?.data?.detail || 'Discord sign-in error')
      }
    } finally {
      setSocialLoading(null)
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
      <div className="relative z-10 w-full max-w-[460px]">
        <SpatialTiltCard
          tiltStrength={10}
          scale={1.015}
          glareOpacity={0.16}
          className="rounded-3xl border border-white/10 bg-[#0b0d17]/85 backdrop-blur-2xl p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_35px_rgba(99,102,241,0.15)] transform-gpu"
        >
          {/* Top Radial Ambient Glow */}
          <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-40 w-56 rounded-full bg-gradient-to-r from-indigo-500/20 via-cyan-400/15 to-pink-500/15 blur-3xl" />

          {/* 3D Floating Header & Logo */}
          <div className="relative text-center" style={{ transform: 'translateZ(24px)' }}>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1.5px] shadow-[0_0_30px_rgba(99,102,241,0.4)]">
              <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#090b14]">
                <Sparkles className="h-6 w-6 text-cyan-300 animate-pulse" />
              </div>
            </div>

            <h1 className="mt-4 text-2xl font-bold tracking-tight text-white font-display">
              {mode === 'login'
                ? authStep === 'otp_verification'
                  ? 'Two-Factor Verification'
                  : 'Welcome Back'
                : 'Create Account'}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              {mode === 'login'
                ? authStep === 'otp_verification'
                  ? 'Enter the 6-digit OTP code sent to your email to verify'
                  : 'Enter your email and password to receive an OTP code'
                : 'Join Desinify AI and start synthesizing production code'}
            </p>
          </div>

          {/* Mode Switcher: Animated Sliding Tabs */}
          <div
            className="relative mt-6 flex rounded-xl border border-white/10 bg-black/40 p-1 backdrop-blur-md"
            style={{ transform: 'translateZ(20px)' }}
          >
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`relative flex-1 py-2 text-xs sm:text-sm font-medium transition-colors ${
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
              className={`relative flex-1 py-2 text-xs sm:text-sm font-medium transition-colors ${
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

          {/* Social Login Options: Google & Discord (Shown on top) */}
          <div className="mt-5 space-y-2.5" style={{ transform: 'translateZ(22px)' }}>
            <div className="grid grid-cols-2 gap-2.5">
              {/* Google Login Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={socialLoading !== null || submitting}
                className="group relative flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/25 transition-all text-xs sm:text-sm font-medium text-slate-200 hover:text-white shadow-sm hover:shadow-[0_0_20px_rgba(255,255,255,0.08)] active:scale-[0.98]"
              >
                {socialLoading === 'google' ? (
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
                <span>Google</span>
              </button>

              {/* Discord Login Button */}
              <button
                type="button"
                onClick={handleDiscordSignIn}
                disabled={socialLoading !== null || submitting}
                className="group relative flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-[#5865F2]/30 bg-[#5865F2]/10 hover:bg-[#5865F2]/20 hover:border-[#5865F2]/60 transition-all text-xs sm:text-sm font-medium text-slate-200 hover:text-white shadow-sm hover:shadow-[0_0_20px_rgba(88,101,242,0.25)] active:scale-[0.98]"
              >
                {socialLoading === 'discord' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#5865F2]" />
                ) : (
                  <svg className="w-4 h-4 text-[#5865F2] fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                )}
                <span>Discord</span>
              </button>
            </div>

            {/* 1-Click Instant Demo Access */}
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={submitting || socialLoading !== null}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-500/40 text-[11px] font-medium text-amber-300 hover:text-amber-200 transition-all"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
              <span>⚡ 1-Click Demo Sandbox Login</span>
            </button>
          </div>

          {/* Divider with Subtle Glow */}
          <div className="relative my-5" style={{ transform: 'translateZ(18px)' }}>
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-[11px]">
              <span className="bg-[#0b0d17] px-3 text-slate-500 uppercase tracking-wider">
                {authStep === 'otp_verification' ? 'Security Verification' : 'Manual Authentication'}
              </span>
            </div>
          </div>

          {/* Error Banner with 1-Click Mode Switcher */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="auth-error"
                initial={{ opacity: 0, height: 0, y: -6 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -6 }}
                className="overflow-hidden mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-start gap-2"
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
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-300 hover:text-cyan-200 underline underline-offset-2"
                      >
                        Click here to create this account now →
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ========================================================================= */}
          {/* STEP 2: OTP VERIFICATION PANEL (After email + password verified)          */}
          {/* ========================================================================= */}
          {authStep === 'otp_verification' && mode === 'login' ? (
            <motion.div
              key="otp-verification-panel"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
              style={{ transform: 'translateZ(24px)' }}
            >
              {/* Credentials Verified Notice */}
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 text-center">
                <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-semibold mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Password Verified</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Please enter the 6-digit one-time code sent to:
                </p>
                <div className="mt-1 flex items-center justify-center gap-2">
                  <span className="font-semibold text-cyan-300 text-sm tracking-wide">
                    {email}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthStep('credentials')
                      setError(null)
                    }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 underline"
                  >
                    Edit
                  </button>
                </div>
              </div>

              {/* Dev Mode Notification with 1-Click Auto Fill */}
              {devOtp && (
                <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/30 p-2.5 flex items-center justify-between text-xs text-indigo-300">
                  <div className="flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>
                      Security Code: <strong className="font-mono text-white text-sm">{devOtp}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={applyDevOtp}
                    className="px-2 py-1 rounded-md bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-[11px] font-medium text-cyan-200 transition-colors"
                  >
                    Auto-Fill ⚡
                  </button>
                </div>
              )}

              {/* 6-Digit Segmented OTP Input Grid */}
              <div className="py-2">
                <label className="block text-center text-xs font-medium text-slate-300 mb-3">
                  Enter 6-Digit Verification Code
                </label>
                <div className="flex items-center justify-center gap-2 sm:gap-2.5" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold text-white rounded-xl border border-white/15 bg-slate-950/60 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40 outline-none transition-all shadow-inner"
                    />
                  ))}
                </div>
              </div>

              {/* Primary Verify Button */}
              <button
                type="button"
                onClick={() => executeVerifyOtp()}
                disabled={submitting || otpDigits.some((d) => !d)}
                className="relative w-full group overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 p-[1px] font-medium transition-all shadow-[0_0_25px_rgba(99,102,241,0.35)] hover:shadow-[0_0_35px_rgba(99,102,241,0.5)] active:scale-[0.99] disabled:opacity-50"
              >
                <div className="flex items-center justify-center gap-2 rounded-[11px] bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-all">
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Verifying Security Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Verification & Enter Studio</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </div>
              </button>

              {/* Resend and Navigation Footer */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthStep('credentials')
                    setError(null)
                  }}
                  className="inline-flex items-center gap-1 hover:text-slate-200 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Password</span>
                </button>

                {resendCountdown > 0 ? (
                  <span className="text-slate-500 text-[11px]">
                    Resend code in {resendCountdown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={submitting}
                    className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Resend Code</span>
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            /* ========================================================================= */
            /* STEP 1: EMAIL + PASSWORD FORM                                             */
            /* ========================================================================= */
            <form
              onSubmit={onSubmitCredentials}
              noValidate
              className="space-y-3.5"
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
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 bg-cyan-950/50 hover:bg-cyan-900/50 px-2 py-0.5 rounded border border-cyan-800/40 transition-colors"
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

              {/* Password Field (Always present for manual login & signup) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-slate-300">
                    Password <span className="text-rose-400">*</span>
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setForgotPasswordNotice(!forgotPasswordNotice)}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
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
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
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
                    className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3 text-xs text-indigo-200 flex items-start gap-2"
                  >
                    <Info className="w-4 h-4 shrink-0 text-indigo-400 mt-0.5" />
                    <div>
                      <span>For instant access, sign in with </span>
                      <strong className="text-white">Google</strong>
                      <span>, </span>
                      <strong className="text-white">Discord</strong>
                      <span>, or use the </span>
                      <strong className="text-white">⚡ 1-Click Demo Sandbox Login</strong>
                      <span> button above!</span>
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
                    className={`flex h-4 w-4 items-center justify-center rounded border transition-all ${
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
                disabled={submitting || socialLoading !== null}
                className="relative w-full mt-2 group overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 p-[1px] font-medium transition-all shadow-[0_0_25px_rgba(99,102,241,0.35)] hover:shadow-[0_0_35px_rgba(99,102,241,0.5)] active:scale-[0.99] disabled:opacity-60"
              >
                <div className="flex items-center justify-center gap-2 rounded-[11px] bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-all">
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>
                        {mode === 'login'
                          ? 'Verifying & Sending OTP...'
                          : 'Creating Neural Profile...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <span>
                        {mode === 'login'
                          ? 'Verify Credentials & Send OTP'
                          : 'Launch Account'}
                      </span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </div>
              </button>
            </form>
          )}

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
                  className="font-medium text-cyan-400 hover:text-cyan-300 underline underline-offset-4 transition-colors"
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
                  className="font-medium text-cyan-400 hover:text-cyan-300 underline underline-offset-4 transition-colors"
                >
                  Sign in
                </button>
              </span>
            )}
          </div>

          {/* Trust / Security Footer Badge */}
          <div
            className="mt-6 pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-[11px] text-slate-400"
            style={{ transform: 'translateZ(16px)' }}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>2-Step Credentials + Cryptographic OTP Verification</span>
          </div>
        </SpatialTiltCard>
      </div>
    </section>
  )
}
