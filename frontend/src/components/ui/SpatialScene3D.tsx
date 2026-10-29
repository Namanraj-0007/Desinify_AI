import { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

/**
 * SpatialSceneCore
 * Refined 3D holographic artifact with responsive pointer tracking,
 * decent sapphire-cyan palette, glowing gyro rings, and floating design nodes.
 */
function SpatialSceneCore() {
  const groupRef = useRef<THREE.Group>(null!)
  const innerMeshRef = useRef<THREE.Mesh>(null!)
  const wireframeRef = useRef<THREE.Mesh>(null!)
  const ringRef = useRef<THREE.Group>(null!)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    const px = state.pointer.x
    const py = state.pointer.y

    if (groupRef.current) {
      // Smooth responsive mouse parallax with gentle damping
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, px * 0.4 + t * 0.04, 0.04)
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -py * 0.3 + Math.sin(t * 0.25) * 0.06, 0.04)
    }

    if (innerMeshRef.current) {
      innerMeshRef.current.rotation.y = t * 0.12
      innerMeshRef.current.rotation.z = Math.sin(t * 0.2) * 0.08
    }

    if (wireframeRef.current) {
      // Counter-rotation for the futuristic cage
      wireframeRef.current.rotation.y = -t * 0.06
      wireframeRef.current.rotation.x = t * 0.03
    }

    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.09
    }
  })

  // Decent, cohesive palette for orbiting design tokens
  const tokenColors = [
    { bg: '#6366f1', emissive: '#818cf8', label: 'JSX' },
    { bg: '#06b6d4', emissive: '#22d3ee', label: 'CSS' },
    { bg: '#3b82f6', emissive: '#60a5fa', label: 'AST' },
    { bg: '#8b5cf6', emissive: '#a78bfa', label: 'FIG' },
    { bg: '#10b981', emissive: '#34d399', label: 'TS' },
    { bg: '#0284c7', emissive: '#38bdf8', label: 'AI' },
  ]

  return (
    <group ref={groupRef}>
      {/* Central Holographic Core */}
      <Float speed={1.8} rotationIntensity={0.35} floatIntensity={0.5}>
        {/* Inner Organic Distorted Solid */}
        <mesh ref={innerMeshRef} position={[0, 0, 0]}>
          <icosahedronGeometry args={[1.3, 3]} />
          <MeshDistortMaterial
            color="#3730a3"
            emissive="#1e1b4b"
            emissiveIntensity={0.5}
            roughness={0.12}
            metalness={0.85}
            distort={0.25}
            speed={2.0}
          />
        </mesh>

        {/* Outer Faceted Geometric Wireframe Cage */}
        <mesh ref={wireframeRef} position={[0, 0, 0]}>
          <icosahedronGeometry args={[1.75, 1]} />
          <meshBasicMaterial
            color="#38bdf8"
            wireframe
            transparent
            opacity={0.32}
          />
        </mesh>

        {/* Inner Luminous Core Sphere */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.45, 16, 16]} />
          <meshBasicMaterial color="#60a5fa" transparent opacity={0.65} />
        </mesh>
      </Float>

      {/* Primary Equator Gyro Ring */}
      <group ref={ringRef} rotation={[1.1, 0.4, 0]}>
        <mesh>
          <torusGeometry args={[2.5, 0.02, 16, 100]} />
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.35} />
        </mesh>

        {/* Orbiting Design Tokens along ring */}
        {tokenColors.map((token, i) => {
          const angle = (i / tokenColors.length) * Math.PI * 2
          const radius = 2.5
          return (
            <mesh
              key={token.label}
              position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]}
            >
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshStandardMaterial
                color={token.bg}
                emissive={token.emissive}
                emissiveIntensity={0.9}
                roughness={0.2}
                metalness={0.9}
              />
            </mesh>
          )
        })}
      </group>

      {/* Secondary Tilted Polar Ring */}
      <Float speed={1.1} rotationIntensity={0.2} floatIntensity={0.3}>
        <mesh rotation={[-0.7, 0.8, 0.5]}>
          <torusGeometry args={[3.1, 0.015, 16, 100]} />
          <meshBasicMaterial color="#818cf8" transparent opacity={0.25} />
        </mesh>
      </Float>

      {/* Spatial Floating Design Layers (Frosted Glass Chips) */}
      <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.45}>
        <group position={[-2.4, 1.4, -0.5]} rotation={[0.2, 0.3, -0.1]}>
          <mesh>
            <boxGeometry args={[0.9, 0.6, 0.04]} />
            <meshStandardMaterial
              color="#0f172a"
              emissive="#312e81"
              emissiveIntensity={0.25}
              roughness={0.2}
              metalness={0.8}
              transparent
              opacity={0.8}
            />
          </mesh>
          <mesh position={[0, 0, 0.03]}>
            <boxGeometry args={[0.92, 0.62, 0.01]} />
            <meshBasicMaterial color="#818cf8" wireframe transparent opacity={0.5} />
          </mesh>
        </group>
      </Float>

      <Float speed={1.6} rotationIntensity={0.3} floatIntensity={0.5}>
        <group position={[2.6, -1.2, 0.6]} rotation={[-0.3, -0.4, 0.2]}>
          <mesh>
            <boxGeometry args={[0.8, 0.5, 0.04]} />
            <meshStandardMaterial
              color="#082f49"
              emissive="#0369a1"
              emissiveIntensity={0.25}
              roughness={0.2}
              metalness={0.8}
              transparent
              opacity={0.8}
            />
          </mesh>
          <mesh position={[0, 0, 0.03]}>
            <boxGeometry args={[0.82, 0.52, 0.01]} />
            <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.5} />
          </mesh>
        </group>
      </Float>

      {/* Subtle Floating Octahedrons */}
      <Float speed={2.0} floatIntensity={0.35}>
        <mesh position={[-2.8, -1.5, 0.8]} rotation={[0.4, 0.5, 0]}>
          <octahedronGeometry args={[0.2]} />
          <meshStandardMaterial
            color="#818cf8"
            emissive="#6366f1"
            emissiveIntensity={0.6}
            roughness={0.2}
            metalness={0.9}
          />
        </mesh>
      </Float>

      <Float speed={1.5} floatIntensity={0.4}>
        <mesh position={[2.3, 1.8, -0.8]} rotation={[-0.5, 0.3, 0.2]}>
          <octahedronGeometry args={[0.18]} />
          <meshStandardMaterial
            color="#06b6d4"
            emissive="#06b6d4"
            emissiveIntensity={0.6}
            roughness={0.2}
            metalness={0.9}
          />
        </mesh>
      </Float>
    </group>
  )
}

/**
 * AmbientParticles
 * 50 optimized cosmic particles with gentle twinkling
 */
function AmbientParticles() {
  const pointsRef = useRef<THREE.Points>(null!)
  const [positions] = useState(() => {
    const pos = new Float32Array(50 * 3)
    for (let i = 0; i < 50; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6
    }
    return pos
  })

  useFrame((state) => {
    if (!pointsRef.current) return
    pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.018
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.065}
        color="#93c5fd"
        transparent
        opacity={0.55}
        sizeAttenuation
      />
    </points>
  )
}

/**
 * SpatialScene3D
 * Hardware-accelerated Three.js canvas container with WebGL context recovery
 */
export default function SpatialScene3D() {
  const [hasWebGL, setHasWebGL] = useState(true)

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (!gl) setHasWebGL(false)
    } catch {
      setHasWebGL(false)
    }
  }, [])

  if (!hasWebGL) {
    return (
      <div className="pointer-events-none absolute inset-0 z-0 bg-radial-vignette opacity-70" />
    )
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 48 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', (event) => {
            event.preventDefault()
          })
        }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[4, 5, 4]} intensity={0.85} color="#ffffff" />
        <directionalLight position={[-4, -3, 3]} intensity={0.45} color="#38bdf8" />
        <pointLight position={[0, 0, 2]} intensity={0.6} color="#818cf8" distance={6} />
        
        <SpatialSceneCore />
        <AmbientParticles />
      </Canvas>
    </div>
  )
}
