import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ModernStudioBackground from '../components/ui/ModernStudioBackground'
import AILoadingState from '../components/ui/AILoadingState'

/**
 * AuthCallbackPage
 * Handles browser redirects from OAuth providers (e.g., Google).
 * Reads `?token=<jwt>` from the query parameters, persists it to auth state and
 * localStorage, then redirects to the user dashboard.
 * If no token is provided or an error is present, redirects to `/login` with an error message.
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setSessionToken } = useAuth()

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const token = searchParams.get('token')
    const error = searchParams.get('error')

    if (token && token.trim()) {
      const cleanToken = token.trim()
      // Store in AuthContext and localStorage
      setSessionToken(cleanToken)
      localStorage.setItem('access_token', cleanToken)
      localStorage.setItem('token', cleanToken)

      // Navigate to dashboard
      navigate('/dashboard', { replace: true })
    } else {
      // Missing token or OAuth error: redirect to /login with error message
      const errorMessage = error
        ? decodeURIComponent(error)
        : 'Google sign-in was cancelled or failed to issue a session token.'

      navigate('/login', {
        replace: true,
        state: { error: errorMessage },
      })
    }
  }, [location.search, navigate, setSessionToken])

  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12">
      <ModernStudioBackground />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-[#0c0d14]/80 p-8 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] text-center">
        <h3 className="text-xl font-semibold text-white tracking-tight mb-2">
          Completing sign-in...
        </h3>
        <p className="text-xs text-slate-400 font-mono mb-4">
          Securing your session token
        </p>
        <AILoadingState lines={2} />
      </div>
    </div>
  )
}

