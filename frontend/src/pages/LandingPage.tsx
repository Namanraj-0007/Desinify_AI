import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import PageTransition from '../components/ui/PageTransition'
import { Designify3DLanding } from '../components/landing3d'

/**
 * LandingPage
 * Scroll-Driven 3D Storyboard Landing Page for Designify AI.
 * Tells the Figma-to-React product pipeline story through a pinned 3D scene:
 * 1. Hero floating Figma frame
 * 2. Z-axis exploded layer separation
 * 3. Gemini Multimodal Vision AST tokens & connectors
 * 4. FastAPI component synthesis with streaming code
 * 5. Production TSX compilation & live component snap
 * 6. Before/After side-by-side comparison & Launch CTA
 * Followed by the interactive demo playground, code showcase, architecture, and footer.
 */
export default function LandingPage() {
  const location = useLocation()

  useEffect(() => {
    if (location.hash) {
      const timer = setTimeout(() => {
        const el = document.querySelector(location.hash)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 450)
      return () => clearTimeout(timer)
    }
  }, [location.hash])

  return (
    <PageTransition>
      <Designify3DLanding />
    </PageTransition>
  )
}
