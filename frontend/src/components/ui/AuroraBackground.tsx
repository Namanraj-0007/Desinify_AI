import { useEffect, useRef } from 'react'

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

    const gradients = [
      { x: 0.2, y: 0.3, r: 180, g: 100, b: 255, a: 0.08 },
      { x: 0.7, y: 0.2, r: 50, g: 200, b: 255, a: 0.06 },
      { x: 0.8, y: 0.7, r: 255, g: 80, b: 180, a: 0.05 },
      { x: 0.3, y: 0.6, r: 100, g: 100, b: 255, a: 0.07 },
    ]

    function draw() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      gradients.forEach((g, i) => {
        const x = canvas.width * g.x + Math.sin(time + i * 1.5) * canvas.width * 0.1
        const y = canvas.height * g.y + Math.cos(time * 0.7 + i * 1.2) * canvas.height * 0.1
        const radius = Math.min(canvas.width, canvas.height) * (0.4 + Math.sin(time * 0.3 + i) * 0.1)

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
        gradient.addColorStop(0, `rgba(${g.r}, ${g.g}, ${g.b}, ${g.a + Math.sin(time + i) * 0.02})`)
        gradient.addColorStop(0.5, `rgba(${g.r}, ${g.g}, ${g.b}, ${g.a * 0.5})`)
        gradient.addColorStop(1, `rgba(${g.r}, ${g.g}, ${g.b}, 0)`)

        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      })

      time += 0.008
      animationId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
    />
  )
}

