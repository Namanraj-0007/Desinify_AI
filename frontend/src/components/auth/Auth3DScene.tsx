import React, { useEffect, useMemo } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

/**
 * Auth3DScene
 * High-performance, hardware-accelerated 3D spatial neural model and background.
 * Features an interactive cursor-reactive holographic gyroscope, revolving
 * orbital rings, glowing core node, and floating telemetry indicators.
 */
export default function Auth3DScene() {
  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)

  const springConfig = { damping: 28, stiffness: 140, mass: 0.6 }
  const smoothX = useSpring(mouseX, springConfig)
  const smoothY = useSpring(mouseY, springConfig)

  // Interactive 3D perspective rotation
  const modelRotateX = useTransform(smoothY, [0, 1], [22, -22])
  const modelRotateY = useTransform(smoothX, [0, 1], [-28, 28])
  const parallaxX = useTransform(smoothX, [0, 1], [-20, 20])
  const parallaxY = useTransform(smoothY, [0, 1], [-20, 20])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth)
      mouseY.set(e.clientY / window.innerHeight)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  // Memoized background starfield particles
  const particles = useMemo(() => {
    return Array.from({ length: 32 }, (_, i) => ({
      id: i,
      left: `${(i * 19) % 100}%`,
      top: `${(i * 23) % 100}%`,
      size: (i % 3) + 2,
      delay: (i * 0.2) % 3,
      duration: 3 + (i % 4),
    }))
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden select-none" aria-hidden="true">
      {/* 3D Atmospheric Depth Glows */}
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[450px] rounded-full blur-[140px] opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.5), rgba(6, 182, 212, 0.2), transparent 70%)',
        }}
      />
      <div
        className="absolute -bottom-20 right-10 w-[550px] h-[550px] rounded-full blur-[160px] opacity-15 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(34, 211, 238, 0.4), transparent 70%)',
        }}
      />

      {/* Floating Ambient Stardust */}
      <div className="absolute inset-0">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0.1, scale: 0.8 }}
            animate={{
              opacity: [0.15, 0.6, 0.15],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: 'easeInOut',
            }}
            style={{
              left: p.left,
              top: p.top,
              width: `${p.size}px`,
              height: `${p.size}px`,
            }}
            className="absolute rounded-full bg-cyan-400/40 shadow-[0_0_8px_rgba(34,211,238,0.5)]"
          />
        ))}
      </div>

      {/* 3D HOLOGRAPHIC NEURAL MODEL (Top Right on desktop) */}
      <motion.div
        style={{
          x: parallaxX,
          y: parallaxY,
          rotateX: modelRotateX,
          rotateY: modelRotateY,
          perspective: 1200,
          transformStyle: 'preserve-3d',
        }}
        className="absolute top-12 right-10 sm:right-28 hidden lg:block w-48 h-48"
      >
        <div className="relative w-full h-full transform-gpu" style={{ transformStyle: 'preserve-3d' }}>
          {/* Outer Gyroscope Ring 1 */}
          <motion.div
            animate={{ rotateZ: [0, 360], rotateX: [0, 45, 0] }}
            transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border border-indigo-500/40 border-t-cyan-400/80 shadow-[0_0_25px_rgba(99,102,241,0.25)]"
            style={{ transformStyle: 'preserve-3d' }}
          />

          {/* Outer Gyroscope Ring 2 (Perpendicular) */}
          <motion.div
            animate={{ rotateY: [360, 0], rotateZ: [0, -30, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-3 rounded-full border border-cyan-400/30 border-b-violet-400/80 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
            style={{ transformStyle: 'preserve-3d', transform: 'rotateY(60deg)' }}
          />

          {/* Inner Prismatic Crystal */}
          <motion.div
            animate={{ rotateZ: [-180, 180] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-8 rounded-2xl border border-white/15 bg-gradient-to-tr from-indigo-600/10 via-cyan-500/10 to-transparent backdrop-blur-[3px] shadow-[inset_0_0_15px_rgba(99,102,241,0.2)]"
            style={{ transform: 'translateZ(18px) rotate(45deg)' }}
          />

          {/* Glowing Neural Core */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 via-cyan-400 to-emerald-400 shadow-[0_0_30px_#22d3ee] animate-pulse"
            style={{ transform: 'translateZ(26px)' }}
          />

          {/* Orbiting Design Token Satellites */}
          <motion.div
            animate={{ rotateZ: [0, 360] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div
              className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-indigo-950/90 border border-indigo-400/50 text-[9px] font-mono font-semibold text-cyan-300 shadow-[0_0_12px_rgba(99,102,241,0.4)]"
              style={{ transform: 'translateZ(34px)' }}
            >
              TSX
            </div>
            <div
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-cyan-950/90 border border-cyan-400/50 text-[9px] font-mono font-semibold text-emerald-300 shadow-[0_0_12px_rgba(34,211,238,0.4)]"
              style={{ transform: 'translateZ(34px)' }}
            >
              AST
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Floating Spatial Telemetry Indicator (Bottom Left) */}
      <motion.div
        style={{
          x: useTransform(smoothX, [0, 1], [18, -18]),
          y: useTransform(smoothY, [0, 1], [14, -14]),
        }}
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15 }}
        className="absolute bottom-16 left-8 sm:left-24 hidden lg:flex items-center gap-3 px-4 py-2.5 rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur-xl shadow-[0_15px_35px_rgba(0,0,0,0.6)]"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/30 to-cyan-500/20 border border-indigo-500/40">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
          </span>
        </div>
        <div>
          <div className="text-xs font-semibold text-white tracking-wide flex items-center gap-1.5 font-display">
            Designify AI Engine
            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
              AES-256
            </span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">2-Step Cryptographic Verification</div>
        </div>
      </motion.div>
    </div>
  )
}
