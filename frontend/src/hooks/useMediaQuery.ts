import { useEffect, useState } from 'react'

/**
 * Predefined breakpoints matching the Tailwind CSS default breakpoints.
 * - sm: 640px
 * - md: 768px
 * - lg: 1024px
 * - xl: 1280px
 * - 2xl: 1536px
 */
export const BREAKPOINTS = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
} as const

export type Breakpoint = keyof typeof BREAKPOINTS

/**
 * Reactively tracks whether a CSS media query matches the current viewport.
 *
 * @param query - A CSS media query string (e.g. `'(min-width: 768px)'`).
 * @returns `true` if the media query currently matches, `false` otherwise.
 *
 * @example
 * ```tsx
 * const isDesktop = useMediaQuery('(min-width: 1024px)')
 * const isMobile = useMediaQuery('(max-width: 767px)')
 * ```
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mql = window.matchMedia(query)

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Modern browsers
    mql.addEventListener('change', handleChange)
    // Fallback for older browsers / iOS Safari < 14
    setMatches(mql.matches)

    return () => {
      mql.removeEventListener('change', handleChange)
    }
  }, [query])

  return matches
}

/**
 * Reactively tracks a named Tailwind breakpoint.
 *
 * @param breakpoint - One of `'sm' | 'md' | 'lg' | 'xl' | '2xl'`.
 * @returns `true` if the viewport is at least that breakpoint width.
 *
 * @example
 * ```tsx
 * const isLg = useBreakpoint('lg')
 * ```
 */
export function useBreakpoint(breakpoint: Breakpoint): boolean {
  const query = BREAKPOINTS[breakpoint]
  return useMediaQuery(query)
}

/**
 * Returns an object with boolean values for every Tailwind breakpoint.
 * Useful when you need to check multiple breakpoints simultaneously.
 *
 * @example
 * ```tsx
 * const bp = useBreakpoints()
 * const isTabletLandscape = bp.lg && !bp.xl
 * ```
 */
export function useBreakpoints(): Record<Breakpoint, boolean> {
  const sm = useMediaQuery(BREAKPOINTS.sm)
  const md = useMediaQuery(BREAKPOINTS.md)
  const lg = useMediaQuery(BREAKPOINTS.lg)
  const xl = useMediaQuery(BREAKPOINTS.xl)
  const xl2 = useMediaQuery(BREAKPOINTS['2xl'])

  return { sm, md, lg, xl, '2xl': xl2 }
}

/**
 * Reactively detects if the current device is a touch-capable device.
 * Uses the (hover: none) and (pointer: coarse) media query.
 *
 * @returns true if the device is likely a touch screen.
 */
export function useIsTouchDevice(): boolean {
  return useMediaQuery('(hover: none) and (pointer: coarse)')
}

/**
 * Reactively detects if the user prefers reduced motion.
 * Uses the prefers-reduced-motion: reduce media query.
 *
 * @returns true if reduced motion is preferred.
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

/**
 * Reactively detects if the user prefers a dark color scheme.
 * Uses the prefers-color-scheme: dark media query.
 *
 * @returns true if dark mode is preferred by the OS.
 */
export function usePrefersDarkMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)')
}

