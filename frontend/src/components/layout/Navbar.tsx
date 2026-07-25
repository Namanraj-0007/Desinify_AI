import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../ui/button'
import { cn } from '../../lib/utils'

const navItems = [
  { label: 'Features', href: '#features', external: true },
  { label: 'How it works', href: '#how-it-works', external: true },
  { label: 'Preview', href: '#preview', external: true },
  { label: 'About', href: '/about', external: false },
]

export default function Navbar() {
  const { token, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled
          ? 'bg-background/80 backdrop-blur-xl border-b border-border/50'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-[0_0_20px_hsl(252_87%_65%/0.3)] group-hover:shadow-[0_0_30px_hsl(252_87%_65%/0.4)] transition-shadow">
              <span className="text-sm font-bold text-white">D</span>
            </div>
            <span className="font-display font-semibold text-lg tracking-tight text-foreground hidden sm:block">
              Designify <span className="text-gradient">AI</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) =>
              item.external ? (
                <button
                  key={item.href}
                  onClick={() => {
                    if (location.pathname === '/') {
                      const el = document.querySelector(item.href)
                      el?.scrollIntoView({ behavior: 'smooth' })
                    } else {
                      navigate('/' + item.href)
                    }
                  }}
                  className={cn(
                    'px-4 py-2 text-sm transition-colors rounded-lg cursor-pointer',
                    location.pathname === '/'
                      ? 'text-foreground bg-white/[0.08]'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.05]'
                  )}
                >
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'px-4 py-2 text-sm transition-colors rounded-lg',
                    location.pathname === item.href
                      ? 'text-foreground bg-white/[0.08]'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.05]'
                  )}
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          {/* Auth buttons */}
          <div className="flex items-center gap-3">
            {token ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                  Dashboard
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    logout()
                    navigate('/')
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/auth')}
                  className="hidden sm:inline-flex"
                >
                  Sign in
                </Button>
                <Button variant="gradient" size="sm" onClick={() => navigate('/auth')}>
                  Get started
                </Button>
              </>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden relative h-9 w-9 rounded-lg border border-border flex items-center justify-center"
              aria-label="Toggle menu"
            >
              <div className="flex flex-col gap-1">
                <span className={cn('block h-0.5 w-4 bg-foreground transition-transform', mobileOpen && 'rotate-45 translate-y-1.5')} />
                <span className={cn('block h-0.5 w-4 bg-foreground transition-opacity', mobileOpen && 'opacity-0')} />
                <span className={cn('block h-0.5 w-4 bg-foreground transition-transform', mobileOpen && '-rotate-45 -translate-y-1.5')} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl"
          >
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) =>
                item.external ? (
                  <button
                    key={item.href}
                    onClick={() => {
                      setMobileOpen(false)
                      if (location.pathname === '/') {
                        const el = document.querySelector(item.href)
                        el?.scrollIntoView({ behavior: 'smooth' })
                      } else {
                        navigate('/' + item.href)
                      }
                    }}
                    className="block w-full text-left px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-white/[0.05] transition-colors"
                  >
                    {item.label}
                  </button>
                ) : (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-white/[0.05] transition-colors"
                  >
                    {item.label}
                  </Link>
                )
              )}
              <div className="pt-2 border-t border-border/50">
                {!token && (
                  <Button variant="ghost" className="w-full" onClick={() => { navigate('/auth'); setMobileOpen(false) }}>
                    Sign in
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

