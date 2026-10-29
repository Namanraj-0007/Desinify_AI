import React, { useRef, useState, useCallback } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'framer-motion'
import { cn } from '../../lib/utils'

interface SpatialTiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  glareOpacity?: number
  tiltStrength?: number
  scale?: number
}

/**
 * SpatialTiltCard
 * High-performance 3D perspective tilt card with hardware-accelerated transforms
 * and dynamic continuous specular glare reflection following cursor physics.
 */
export default function SpatialTiltCard({
  children,
  className,
  glareOpacity = 0.18,
  tiltStrength = 14,
  scale = 1.02,
  ...props
}: SpatialTiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  // Motion values for smooth hardware-accelerated 3D rotations without React re-renders
  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)

  // Spring physics for fluid damping and zero jitter
  const springConfig = { damping: 22, stiffness: 220, mass: 0.5 }
  const smoothMouseX = useSpring(mouseX, springConfig)
  const smoothMouseY = useSpring(mouseY, springConfig)

  // Transform coordinates to 3D angles
  const rotateX = useTransform(smoothMouseY, [0, 1], [tiltStrength, -tiltStrength])
  const rotateY = useTransform(smoothMouseX, [0, 1], [-tiltStrength, tiltStrength])
  const cardScale = useSpring(isHovered ? scale : 1, springConfig)

  // Specular sheen coordinates (0% to 100%)
  const glareX = useTransform(smoothMouseX, [0, 1], ['0%', '100%'])
  const glareY = useTransform(smoothMouseY, [0, 1], ['0%', '100%'])

  // Continuous reactive glare without re-rendering
  const glareBackground = useMotionTemplate`radial-gradient(circle 380px at ${glareX} ${glareY}, rgba(255,255,255,0.22), transparent 70%)`
  const borderHighlight = useMotionTemplate`radial-gradient(circle 260px at ${glareX} ${glareY}, rgba(129,140,248,0.7), rgba(34,211,238,0.5), transparent 70%)`

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    mouseX.set(x)
    mouseY.set(y)
  }, [mouseX, mouseY])

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    mouseX.set(0.5)
    mouseY.set(0.5)
  }, [mouseX, mouseY])

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="perspective-1000 transform-gpu"
      {...props}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          scale: cardScale,
          transformStyle: 'preserve-3d',
        }}
        className={cn(
          'relative rounded-2xl transition-all duration-300',
          isHovered
            ? 'shadow-[0_20px_50px_-10px_rgba(99,102,241,0.3),0_0_25px_rgba(34,211,238,0.15)]'
            : 'shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]',
          className
        )}
      >
        {/* Continuous Dynamic Border Glow Trail */}
        <motion.div
          aria-hidden="true"
          style={{
            background: borderHighlight,
            opacity: isHovered ? 1 : 0,
          }}
          className="pointer-events-none absolute -inset-[1.5px] rounded-2xl z-0 transition-opacity duration-300"
        />

        {/* Child content with 3D preservation */}
        <div style={{ transform: 'translateZ(12px)' }} className="relative z-10 w-full h-full">
          {children}
        </div>

        {/* Dynamic Specular Glare / Sheen Overlay */}
        <motion.div
          aria-hidden="true"
          style={{
            opacity: isHovered ? glareOpacity : 0,
            background: glareBackground,
          }}
          className="pointer-events-none absolute inset-0 z-20 rounded-2xl transition-opacity duration-300"
        />

        {/* Base 3D Border */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-px rounded-2xl border border-white/10 z-10"
        />
      </motion.div>
    </div>
  )
}
