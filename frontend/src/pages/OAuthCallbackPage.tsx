import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Loader2, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { handleGoogleCallback, handleDiscordCallback } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import ModernStudioBackground from '../components/ui/ModernStudioBackground'

interface OAuthCallbackProps {
  provider?: 'google' | 'discord'
}

export default function OAuthCallbackPage({ provider }: OAuthCallbackProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { setSessionToken } = useAuth()

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Auto-detect provider from route path if not passed as prop
  const activeProvider = provider || (location.pathname.includes('discord') ? 'discord' : 'google')
  const providerLabel = activeProvider === 'discord' ? 'Discord' : 'Google'

  useEffect(() => {
    let isMounted = true

    async function executeCallback() {
      try {
        const searchParams = new URLSearchParams(location.search)
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')

        if (error) {
          throw new Error(errorDescription || `Sign-in was cancelled or rejected by ${providerLabel}`)
        }

        if (!code) {
          throw new Error(`Missing ${providerLabel} authorization code in callback URL`)
        }

        let response: any
        if (activeProvider === 'discord') {
          response = await handleDiscordCallback(code, state)
        } else {
          response = await handleGoogleCallback(code, state)
        }

        const accessToken = response.data?.access_token
        if (!accessToken) {
          throw new Error(`${providerLabel} authentication succeeded but no session token was issued`)
        }

        if (!isMounted) return

        setSessionToken(accessToken)
        setStatus('success')

        // Smooth transition to dashboard
        setTimeout(() => {
          navigate('/dashboard', { replace: true })
        }, 800)
      } catch (err: any) {
        if (!isMounted) return
        console.error('OAuth Callback Error:', err)
        setStatus('error')
        setErrorMessage(
          err?.response?.data?.detail ||
          err?.message ||
          `Failed to complete ${providerLabel} sign-in`
        )
      }
    }

    executeCallback()

    return () => {
      isMounted = false
    }
  }, [location.search, activeProvider, providerLabel, navigate, setSessionToken])

  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12">
      <ModernStudioBackground />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-[#0c0d14]/80 p-8 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] text-center"
      >
        {status === 'verifying' && (
          <div className="py-4 space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white tracking-tight">
                Authenticating with {providerLabel}
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                Verifying cryptographic credentials and establishing secure session...
              </p>
            </div>
            <div className="pt-2">
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-500 rounded-full"
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.4,
                    ease: 'easeInOut',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="py-4 space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white tracking-tight">
                Access Authorized!
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                Session established. Redirecting into your neural workspace...
              </p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="py-4 space-y-5">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <AlertCircle className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white tracking-tight">
                Authentication Notice
              </h3>
              <p className="mt-2 text-sm text-rose-300/90 bg-rose-950/40 p-3 rounded-xl border border-rose-800/40">
                {errorMessage}
              </p>
            </div>
            <button
              onClick={() => navigate('/auth', { replace: true })}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-950 font-medium text-sm hover:bg-white/90 transition-all shadow-lg shadow-white/5"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to Login
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

