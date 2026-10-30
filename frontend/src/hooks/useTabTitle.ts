import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const ROUTE_TITLES: Record<string, string> = {
  '/': 'Designify AI ⚡ Figma to React 19 Engine',
  '/about': 'About & Architecture • Designify AI ⚡',
  '/dashboard': 'Studio Cockpit • Designify AI ⚡',
  '/auth': 'Sign In • Neural Auth • Designify AI ⚡',
  '/login': 'Sign In • Designify AI ⚡',
  '/signup': 'Create Account • Designify AI ⚡',
  '/docs': 'Documentation & API • Designify AI ⚡',
  '/blog': 'Blog & Insights • Designify AI ⚡',
  '/changelog': 'Changelog • Designify AI ⚡',
  '/status': 'System Status 99.9% • Designify AI ⚡',
  '/careers': 'Careers • Designify AI ⚡',
  '/contact': 'Contact Team • Designify AI ⚡',
}

export function useTabExperience() {
  const location = useLocation()

  useEffect(() => {
    // Determine base title for current route
    const baseTitle =
      ROUTE_TITLES[location.pathname] ||
      (location.pathname.startsWith('/dashboard/figma')
        ? 'Code Synthesis Studio • Designify AI ⚡'
        : 'Designify AI ⚡ Figma to React 19 Engine')

    document.title = baseTitle

    // Crazy Tab View Attention Trigger on Visibility Change
    let returnTimeout: any = null

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is inactive / user looked away
        document.title = '⚡ Synthesize your designs! | Designify AI'
      } else {
        // Tab restored / user clicked back
        document.title = '✨ Ready to ship code! | Designify AI'
        clearTimeout(returnTimeout)
        returnTimeout = setTimeout(() => {
          document.title = baseTitle
        }, 1600)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearTimeout(returnTimeout)
    }
  }, [location.pathname])
}

