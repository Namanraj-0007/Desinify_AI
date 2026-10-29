import { useEffect, useRef } from 'react'

/**
 * AuroraBackground
 * High-performance ambient lighting canvas with decent cosmic gradients
 * (royal indigo, deep sapphire, celestial cyan) and soft procedural drift.
 */
export default function AuroraBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null!)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let time = 0

    function resize() {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener('resize', resize)
    resize()

    // Decent, elegant palette: Royal Indigo, Electric Cyan, Deep Sapphire, Soft Violet
    const gradients = [
      { x: 0.25, y: 0.2, r: 99, g: 102, b: 241, a: 0.09 },  // Indigo
      { x: 0.75, y: 0.25, r: 6, g: 182, b: 212, a: 0.07 },   // Cyan
      { x: 0.85, y: 0.75, r: 139, g: 92, b: 246, a: 0.06 }, // Soft Violet
      { x: 0.2, y: 0.7, r: 59, g: 130, b: 246, a: 0.08 },   // Royal Blue
    ]

    function draw() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      gradients.forEach((g, i) => {
        const x = canvas.width * g.x + Math.sin(time * 0.4 + i * 1.6) * canvas.width * 0.08
        const y = canvas.height * g.y + Math.cos(time * 0.3 + i * 1.2) * canvas.height * 0.08
        const radius = Math.min(canvas.width, canvas.height) * (0.45 + Math.sin(time * 0.2 + i) * 0.08)

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
        gradient.addColorStop(0, `rgba(${g.r}, ${g.g}, ${g.b}, ${g.a + Math.sin(time * 0.5 + i) * 0.015})`)
        gradient.addColorStop(0.5, `rgba(${g.r}, ${g.g}, ${g.b}, ${g.a * 0.45})`)
        gradient.addColorStop(1, `rgba(${g.r}, ${g.g}, ${g.b}, 0)`)

        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      })

      time += 0.006
      animationId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
      {/* Top subtle light flare beam */}
      <div className="hero-spotlight" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
    </div>
  )
}
