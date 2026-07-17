import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { token, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center font-bold">
            D
          </div>
          <Link to="/" className="font-semibold tracking-tight text-slate-100">
            Designify AI
          </Link>
        </div>

        <nav className="flex items-center gap-3">
          {token ? (
            <>
              <Link
                to="/dashboard"
                className="text-sm px-3 py-2 rounded-lg hover:bg-white/5 border border-white/10"
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  logout()
                  navigate('/login')
                }}
                className="text-sm px-3 py-2 rounded-lg bg-white text-slate-950 font-medium hover:bg-white/90"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm px-3 py-2 rounded-lg hover:bg-white/5 border border-white/10"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="text-sm px-3 py-2 rounded-lg bg-white text-slate-950 font-medium hover:bg-white/90"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

