import React, { useEffect } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

/**
 * Auth3DScene
 * High-performance, hardware-accelerated 3D spatial background layer.
 * Includes interactive cursor-responsive perspective tilt, glowing holographic
 * geometric nodes, and floating spatial telemetry badges.
 */
export default function Auth3DScene() {
  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)

  const springConfig = { damping: 30, stiffness: 120 }
  const smoothX = useSpring(mouseX, springConfig)
  const smoothY = useSpring(mouseY, springConfig)

  const prismRotateX = useTransform(smoothY, [0, 1], [25, -25])
  const prismRotateY = useTransform(smoothX, [0, 1], [-30, 30])
  const parallaxX = useTransform(smoothX, [0, 1], [-25, 25])
  const parallaxY = useTransform(smoothY, [0, 1], [-25, 25])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth)
      mouseY.set(e.clientY / window.innerHeight)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* 3D Atmospheric Light Pools */}
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[400px] rounded-full blur-[140px] opacity-25"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.4), rgba(236, 72, 153, 0.15), transparent 70%)',
        }}
      />
      <div
        className="absolute bottom-10 -right-20 w-[500px] h-[500px] rounded-full blur-[150px] opacity-15"
        style={{
          background: 'radial-gradient(circle, rgba(34, 211, 238, 0.35), transparent 70%)',
        }}
      />

      {/* Floating 3D Geometric Cube / Prism Node (Top Right) */}
      <motion.div
        style={{
          x: parallaxX,
          y: parallaxY,
          rotateX: prismRotateX,
          rotateY: prismRotateY,
          perspective: 1200,
          transformStyle: 'preserve-3d',
        }}
        className="absolute -top-6 right-8 sm:right-24 hidden md:block w-36 h-36"
      >
        <motion.div
          animate={{
            rotateZ: [0, 360],
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="relative w-full h-full transform-gpu"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Wireframe Facets */}
          <div className="absolute inset-0 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 backdrop-blur-[2px] shadow-[0_0_30px_rgba(99,102,241,0.2)]" />
          <div
            className="absolute inset-2 rounded-xl border border-cyan-400/20 bg-cyan-500/5 rotate-45 transform-gpu"
            style={{ transform: 'translateZ(20px)' }}
          />
          <div
            className="absolute inset-4 rounded-lg border border-pink-500/20 bg-pink-500/5 -rotate-12 transform-gpu"
            style={{ transform: 'translateZ(-15px)' }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-cyan-400 blur-sm animate-pulse"
            style={{ transform: 'translateZ(30px)' }}
          />
        </motion.div>
      </motion.div>

      {/* Floating 3D Spatial Badge (Bottom Left) */}
      <motion.div
        style={{
          x: useTransform(smoothX, [0, 1], [20, -20]),
          y: useTransform(smoothY, [0, 1], [15, -15]),
        }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="absolute bottom-16 left-8 sm:left-24 hidden lg:flex items-center gap-3 px-4 py-2.5 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/30 to-cyan-500/20 border border-indigo-500/40">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
        </div>
        <div>
          <div className="text-xs font-semibold text-white tracking-wide flex items-center gap-1.5">
            Neural Core v3.4
            <span className="text-[10px] text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">Active</span>
          </div>
          <div className="text-[11px] text-slate-400">Zero-latency spatial authentication</div>
        </div>
      </motion.div>

      {/* Subtle Floating 3D Geometric Ring (Bottom Center) */}
      <motion.div
        animate={{
          rotate: [0, 360],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full border border-dashed border-indigo-500/10 pointer-events-none"
      />
    </div>
  )
}

