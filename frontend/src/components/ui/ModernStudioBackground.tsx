import React from 'react'

/**
 * ModernStudioBackground
 * Clean, modern dark studio atmosphere:
 * - Subtle technical coordinate grid with radial mask
 * - Soft ambient top spotlight beam
 * - Delicate cyan & indigo gradient light pools
 * - Zero WebGL canvas overhead, 100% lightweight & crisp
 */
export default function ModernStudioBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* Base Deep Obsidian Canvas */}
      <div className="absolute inset-0 bg-[#07080e]" />

      {/* Top Ambient Studio Spotlight */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[650px] opacity-40"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% -15%, rgba(99, 102, 241, 0.35), rgba(6, 182, 212, 0.15), transparent 70%)',
        }}
      />

      {/* Subtle Right & Left Atmospheric Glow Accents */}
      <div 
        className="absolute top-1/4 -right-48 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'rgba(6, 182, 212, 0.4)' }}
      />
      <div 
        className="absolute top-1/3 -left-48 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'rgba(99, 102, 241, 0.35)' }}
      />

      {/* Technical Coordinate Micro-Grid */}
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse 80% 65% at 50% 20%, #000 40%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 65% at 50% 20%, #000 40%, transparent 85%)',
        }}
      />

      {/* Horizon Ambient Divider Line */}
      <div className="absolute top-[85px] left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
    </div>
  )
}

