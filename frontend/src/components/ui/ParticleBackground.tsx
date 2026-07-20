import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function ParticleField({ count = 1200 }) {
  const meshRef = useRef<THREE.Points>(null!)

  const [positions, colors, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const siz = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const radius = 8 + Math.random() * 10
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      pos[i3] = radius * Math.sin(phi) * Math.cos(theta)
      pos[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      pos[i3 + 2] = radius * Math.cos(phi)

      const c = new THREE.Color()
      c.setHSL(0.6 + Math.random() * 0.3, 0.7, 0.4 + Math.random() * 0.3)
      col[i3] = c.r
      col[i3 + 1] = c.g
      col[i3 + 2] = c.b

      siz[i] = 0.008 + Math.random() * 0.02
    }

    return [pos, col, siz]
  }, [count])

  useFrame((state) => {
    const time = state.clock.elapsedTime
    if (!meshRef.current) return
    meshRef.current.rotation.x = Math.sin(time * 0.03) * 0.1
    meshRef.current.rotation.y = time * 0.02
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

export default function ParticleBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[-1] opacity-70">
      <Canvas
        camera={{ position: [0, 0, 14], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true }}
      >
        <ParticleField />
      </Canvas>
    </div>
  )
}

