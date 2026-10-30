import React from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/utils'

interface BrandLogoIconProps {
  size?: number
  className?: string
}

export function BrandLogoIcon({ size = 36, className }: BrandLogoIconProps) {
  return (
    <div
      style={{ width: size, height: size }}
      className={cn(
        'relative rounded-xl flex items-center justify-center shrink-0 p-[1.5px] transition-all duration-300 group-hover:scale-105',
        'bg-gradient-to-br from-cyan-400 via-indigo-500 to-purple-600',
        'shadow-[0_0_20px_rgba(99,102,241,0.45)] group-hover:shadow-[0_0_30px_rgba(34,211,238,0.6)]',
        className
      )}
    >
      <div className="w-full h-full rounded-[10px] bg-[#080b16] flex items-center justify-center overflow-hidden relative">
        {/* Subtle internal neon back-glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/15 via-transparent to-purple-500/20 pointer-events-none" />

        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-[78%] h-[78%] relative z-10 transition-transform duration-300 group-hover:rotate-[-2deg]"
        >
          <defs>
            <linearGradient id="logoSpineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#22d3ee" />
              <stop offset="50%" stop-color="#6366f1" />
              <stop offset="100%" stop-color="#a855f7" />
            </linearGradient>

            <linearGradient id="logoCoreGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#06b6d4" />
              <stop offset="100%" stop-color="#38bdf8" />
            </linearGradient>
          </defs>

          {/* Stylized Cyber D Architectural Frame */}
          <path
            d="M12 9
               C12 7.89 12.89 7 14 7
               H23
               C32.94 7 40 14.06 40 24
               C40 33.94 32.94 41 23 41
               H14
               C12.89 41 12 40.11 12 39
               Z
               M17 12
               V36
               H22.5
               C29.62 36 34.5 30.63 34.5 24
               C34.5 17.37 29.62 12 22.5 12
               Z"
            fill="url(#logoSpineGrad)"
          />

          {/* Synthesis Chevron Code Symbol Inside Core */}
          <path
            d="M20.5 18.5
               L26 24
               L20.5 29.5"
            stroke="url(#logoCoreGrad)"
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Radiant Quantum Pulse Point */}
          <circle
            cx="30"
            cy="24"
            r="2"
            fill="#22d3ee"
            className="animate-pulse"
          />
        </svg>
      </div>
    </div>
  )
}

interface BrandLogoProps {
  size?: number
  showBadge?: boolean
  showText?: boolean
  className?: string
  to?: string
}

export default function BrandLogo({
  size = 36,
  showBadge = true,
  showText = true,
  className,
  to = '/',
}: BrandLogoProps) {
  const content = (
    <div className={cn('flex items-center gap-3 group cursor-pointer', className)}>
      <BrandLogoIcon size={size} />

      {showText && (
        <span className="font-display font-semibold text-lg tracking-tight text-foreground flex items-center gap-1.5">
          <span>Designify</span>
          <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-cyan-300 bg-clip-text text-transparent font-bold">
            AI
          </span>
        </span>
      )}

      {showBadge && (
        <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 group-hover:border-cyan-400/40 transition-colors">
          by Namandip Raj
        </span>
      )}
    </div>
  )

  if (to) {
    return <Link to={to}>{content}</Link>
  }

  return content
}

