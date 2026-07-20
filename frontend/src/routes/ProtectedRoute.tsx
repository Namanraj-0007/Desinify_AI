import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AILoadingState from '../components/ui/AILoadingState'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-full max-w-md">
          <AILoadingState lines={4} />
        </div>
      </div>
    )
  }

  if (!token) return <Navigate to="/auth" replace />

  return <>{children}</>
}

