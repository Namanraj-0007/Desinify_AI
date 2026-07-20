import { useRef, useState } from 'react'
import { cn } from '../../lib/utils'

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  spotlightSize?: number
  spotlightOpacity?: number
}

export default function SpotlightCard({
  children,
  className,
  spotlightSize = 300,
  spotlightOpacity = 0.15,
  ...props
}: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null!)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return
    const rect = divRef.current.getBoundingClientRect()
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    setOpacity(1)
  }

  const handleMouseLeave = () => {
    setOpacity(0)
  }

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn('relative overflow-hidden', className)}
      {...props}
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(${spotlightSize}px circle at ${position.x}px ${position.y}px, hsl(252 87% 65% / ${spotlightOpacity}), transparent 80%)`,
        }}
      />
      {children}
    </div>
  )
}

