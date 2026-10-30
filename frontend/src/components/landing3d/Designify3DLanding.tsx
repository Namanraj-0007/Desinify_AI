import React, { useState, useEffect, Suspense, lazy } from 'react'
import { Canvas } from '@react-three/fiber'
import { ScrollControls, Scroll } from '@react-three/drei'
import { SceneContent } from './Scene3D'
import { OverlayStory } from './OverlayStory'
import { PostStorySections } from './PostStorySections'
import { FallbackStory2D } from './FallbackStory2D'
import { FRAME_CONFIG, SCROLL_CONFIG } from './constants'

/**
 * CyberLuxeSkeleton
 * Shown while Three.js and WebGL initializes. Displays the hero typography immediately
 * so there is zero layout shift or wait time for user perception.
 */
function CyberLuxeSkeleton() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#070912] pointer-events-none z-0">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 rounded-full border-2 border-indigo-500/30 border-t-cyan-400 animate-spin" />
        <span className="text-xs font-mono text-slate-500 tracking-wider">
          Initializing 3D Spatial Canvas...
        </span>
      </div>
    </div>
  )
}

/**
 * Designify3DLanding
 * Main Entry Point for the Designify AI Scroll-Driven 3D Landing Page.
 * Automatically falls back to a responsive 2D pipeline on mobile (<768px)
 * or when prefers-reduced-motion is requested.
 */
export const Designify3DLanding: React.FC = () => {
  const [isMobileOrReducedMotion, setIsMobileOrReducedMotion] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    const checkCapabilities = () => {
      const isSmallScreen = window.innerWidth < 768
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      setIsMobileOrReducedMotion(isSmallScreen || prefersReduced)
    }

    checkCapabilities()
    window.addEventListener('resize', checkCapabilities)
    return () => window.removeEventListener('resize', checkCapabilities)
  }, [])

  // Avoid SSR / hydration issues
  if (!isMounted) {
    return <div className="min-h-screen bg-[#070912]" />
  }

  // 1. Mobile & Reduced Motion Fallback
  if (isMobileOrReducedMotion) {
    return <FallbackStory2D />
  }

  // 2. Full Pinned 3D Scroll Experience (Desktop >= 768px)
  return (
    <div className="relative w-full min-h-screen bg-[#070912] overflow-x-hidden">
      <Suspense fallback={<CyberLuxeSkeleton />}>
        {/* Fixed Pinned Canvas Container */}
        <div className="fixed inset-0 h-screen w-screen z-0">
          <Canvas
            dpr={[1, 2]}
            camera={{
              position: [0, 0, FRAME_CONFIG.cameraInitialZ],
              fov: FRAME_CONFIG.cameraFov,
            }}
            gl={{
              antialias: true,
              powerPreference: 'high-performance',
              alpha: false,
            }}
            onCreated={({ gl }) => {
              gl.setClearColor('#070912')
            }}
          >
            {/* ScrollControls configured with exact storyboard & post-story viewports */}
            <ScrollControls pages={SCROLL_CONFIG.totalPages} damping={SCROLL_CONFIG.damping}>
              {/* 3D Scene Layer */}
              <Scroll>
                <SceneContent />
              </Scroll>

              {/* Synchronized HTML Content Layer */}
              <Scroll html style={{ width: '100%' }}>
                {/* 6 Storyboard Stage Captions & CTA */}
                <OverlayStory />

                {/* Normal Scroll Sections: Demo Playground, Code Showcase, Architecture, Footer */}
                <PostStorySections />
              </Scroll>
            </ScrollControls>
          </Canvas>
        </div>
      </Suspense>
    </div>
  )
}

export default Designify3DLanding
