import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

function Shapes() {
  const groupRef = useRef<THREE.Group>(null!)

  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.08
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.1
  })

  return (
    <group ref={groupRef}>
      {/* Central torus */}
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.4}>
        <mesh position={[0, 0, 0]}>
          <torusKnotGeometry args={[1.2, 0.35, 128, 16]} />
          <MeshDistortMaterial
            color="#6366f1"
            emissive="#6366f1"
            emissiveIntensity={0.15}
            roughness={0.3}
            metalness={0.2}
            distort={0.15}
            speed={2}
          />
        </mesh>
      </Float>

      {/* Orbiting small spheres */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const radius = 2.6
        return (
          <Float key={i} speed={1.2} floatIntensity={0.3}>
            <mesh position={[Math.cos(angle) * radius, Math.sin(angle) * radius * 0.6, Math.sin(angle) * 0.5]}>
              <sphereGeometry args={[0.12, 12, 12]} />
              <meshStandardMaterial
                color={`hsl(${230 + i * 15}, 70%, 65%)`}
                emissive={`hsl(${230 + i * 15}, 70%, 50%)`}
                emissiveIntensity={0.3}
              />
            </mesh>
          </Float>
        )
      })}

      {/* Floating rings */}
      <Float speed={0.8} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh position={[1.8, 1.2, -1]} rotation={[0.5, 0.3, 0]}>
          <ringGeometry args={[0.5, 0.7, 32]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.2} side={THREE.DoubleSide} />
        </mesh>
      </Float>

      <Float speed={0.6} rotationIntensity={0.3} floatIntensity={0.4}>
        <mesh position={[-1.6, -1.4, 1.2]} rotation={[0.8, -0.2, 0.3]}>
          <ringGeometry args={[0.4, 0.6, 32]} />
          <meshBasicMaterial color="#f472b6" transparent opacity={0.15} side={THREE.DoubleSide} />
        </mesh>
      </Float>

      {/* Small decorative cubes */}
      <Float speed={1} floatIntensity={0.2}>
        <mesh position={[-2.2, 0.8, 0.5]}>
          <boxGeometry args={[0.15, 0.15, 0.15]} />
          <meshStandardMaterial color="#a78bfa" emissive="#a78bfa" emissiveIntensity={0.2} />
        </mesh>
      </Float>

      <Float speed={1.1} floatIntensity={0.25}>
        <mesh position={[2.4, -0.6, -0.8]}>
          <octahedronGeometry args={[0.13]} />
          <meshStandardMaterial color="#67e8f9" emissive="#67e8f9" emissiveIntensity={0.2} />
        </mesh>
      </Float>
    </group>
  )
}

export default function FloatingShapes() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 3, 3]} intensity={0.6} />
        <directionalLight position={[-3, -1, 2]} intensity={0.3} />
        <Shapes />
      </Canvas>
    </div>
  )
}

