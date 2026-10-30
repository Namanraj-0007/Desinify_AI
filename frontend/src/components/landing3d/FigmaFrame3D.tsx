import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { FRAME_CONFIG, FRAME_LAYERS, STAGE_TIMINGS, PALETTE } from './constants'

/**
 * Creates a reusable rounded rectangular THREE.Shape for UI cards and planes.
 */
function createRoundedRectShape(w: number, h: number, r: number): THREE.Shape {
  const shape = new THREE.Shape()
  const x = -w / 2
  const y = -h / 2
  const radius = Math.min(r, w / 2, h / 2)

  shape.moveTo(x + radius, y)
  shape.lineTo(x + w - radius, y)
  shape.quadraticCurveTo(x + w, y, x + w, y + radius)
  shape.lineTo(x + w, y + h - radius)
  shape.quadraticCurveTo(x + w, y + h, x + w - radius, y + h)
  shape.lineTo(x + radius, y + h)
  shape.quadraticCurveTo(x, y + h, x, y + h - radius)
  shape.lineTo(x, y + radius)
  shape.quadraticCurveTo(x, y, x + radius, y)
  return shape
}

interface FigmaFrame3DProps {
  progress: number
  mode?: 'hero' | 'exploded' | 'assembled' | 'side-by-side'
  position?: [number, number, number]
  scale?: number
}

/**
 * FigmaFrame3D
 * Renders the multi-layered Figma artboard that decomposes, explodes,
 * reveals layout AST metadata labels, and snaps back together.
 */
export const FigmaFrame3D: React.FC<FigmaFrame3DProps> = ({
  progress,
  mode = 'hero',
  position = [0, 0, 0],
  scale = 1,
}) => {
  const rootGroupRef = useRef<THREE.Group>(null!)
  const layersGroupRef = useRef<THREE.Group>(null!)

  // Memoized rounded shapes for high performance (0 garbage collection)
  const baseCardGeo = useMemo(
    () => new THREE.ShapeGeometry(createRoundedRectShape(FRAME_CONFIG.width, FRAME_CONFIG.height, 0.2)),
    []
  )
  const headerGeo = useMemo(() => new THREE.ShapeGeometry(createRoundedRectShape(3.2, 0.55, 0.12)), [])
  const statCardGeo = useMemo(() => new THREE.ShapeGeometry(createRoundedRectShape(3.2, 1.45, 0.14)), [])
  const chartCardGeo = useMemo(() => new THREE.ShapeGeometry(createRoundedRectShape(3.2, 1.25, 0.14)), [])
  const buttonGeo = useMemo(() => new THREE.ShapeGeometry(createRoundedRectShape(3.2, 0.55, 0.12)), [])

  // Calculate current animation factors based on scroll progress (0.0 to 1.0)
  // Stage 1 (0.0 - 0.15): Flat floating frame
  // Stage 2 (0.15 - 0.35): Exploded layers along Z axis + rotation
  // Stage 3 (0.35 - 0.55): Connectors and Gemini labels
  // Stage 4 (0.55 - 0.75): Flow into code compiler
  // Stage 5 & 6 (0.75 - 1.0): Assembled or side-by-side
  const explodeFactor = useMemo(() => {
    if (mode === 'assembled') return 0
    if (progress < STAGE_TIMINGS.STAGE_1_HERO.end) return 0
    if (progress >= STAGE_TIMINGS.STAGE_2_EXPLODE.end) return 1
    const p =
      (progress - STAGE_TIMINGS.STAGE_1_HERO.end) /
      (STAGE_TIMINGS.STAGE_2_EXPLODE.end - STAGE_TIMINGS.STAGE_1_HERO.end)
    // Smooth cosine easing
    return 0.5 - 0.5 * Math.cos(p * Math.PI)
  }, [progress, mode])

  const labelsOpacity = useMemo(() => {
    if (mode === 'assembled' || mode === 'side-by-side') return 0
    const start = STAGE_TIMINGS.STAGE_3_LABELS.start
    const end = STAGE_TIMINGS.STAGE_3_LABELS.end
    if (progress < start) return 0
    if (progress > end + 0.05) return Math.max(0, 1 - (progress - end) * 10)
    if (progress < start + 0.05) return (progress - start) * 20
    return 1
  }, [progress, mode])

  // Continuous gentle floating animation and damped tilt lerping
  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (!rootGroupRef.current) return

    // Base target rotations
    let targetRotX = 0
    let targetRotY = 0
    let targetRotZ = 0

    if (mode === 'assembled') {
      targetRotY = 0.08
      targetRotX = -0.04
    } else if (progress < STAGE_TIMINGS.STAGE_1_HERO.end) {
      // Stage 1: Floating with subtle mouse parallax & breathing
      targetRotX = Math.sin(t * 0.8) * 0.04
      targetRotY = Math.cos(t * 0.6) * 0.05
    } else if (progress <= STAGE_TIMINGS.STAGE_4_STREAM.end) {
      // Stage 2 & 3: Tilted to showcase depth & exploded layers
      targetRotX = FRAME_CONFIG.explodeTiltX * explodeFactor + Math.sin(t * 0.7) * 0.03
      targetRotY = FRAME_CONFIG.explodeTiltY * explodeFactor + Math.cos(t * 0.5) * 0.04
      targetRotZ = FRAME_CONFIG.explodeTiltZ * explodeFactor
    } else {
      // Stage 5 & 6: Settling into clean upright alignment
      targetRotX = -0.05
      targetRotY = mode === 'side-by-side' ? 0.15 : 0
      targetRotZ = 0
    }

    // Damped smoothing
    rootGroupRef.current.rotation.x = THREE.MathUtils.lerp(rootGroupRef.current.rotation.x, targetRotX, 0.08)
    rootGroupRef.current.rotation.y = THREE.MathUtils.lerp(rootGroupRef.current.rotation.y, targetRotY, 0.08)
    rootGroupRef.current.rotation.z = THREE.MathUtils.lerp(rootGroupRef.current.rotation.z, targetRotZ, 0.08)
  })

  return (
    <group ref={rootGroupRef} position={position} scale={scale}>
      <group ref={layersGroupRef}>
        {/* ================================================================= */}
        {/* LAYER 0: Canvas Artboard Base Frame */}
        {/* ================================================================= */}
        <group position={[0, 0, FRAME_LAYERS[0].zBase]}>
          <mesh geometry={baseCardGeo}>
            <meshStandardMaterial
              color={mode === 'assembled' ? '#090d1a' : '#0d1326'}
              roughness={0.25}
              metalness={0.15}
            />
          </mesh>

          {/* Figma Glass Border */}
          <lineSegments>
            <edgesGeometry args={[baseCardGeo]} />
            <lineBasicMaterial color={mode === 'assembled' ? PALETTE.glowEmerald : PALETTE.accentIndigo} />
          </lineSegments>

          {/* Figma Window Header Bar (Traffic Lights) */}
          <group position={[0, 2.15, 0.01]}>
            {/* Red, Yellow, Green macOS / Figma dots */}
            <mesh position={[-1.5, 0, 0]}>
              <circleGeometry args={[0.045, 16]} />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
            <mesh position={[-1.36, 0, 0]}>
              <circleGeometry args={[0.045, 16]} />
              <meshBasicMaterial color="#f59e0b" />
            </mesh>
            <mesh position={[-1.22, 0, 0]}>
              <circleGeometry args={[0.045, 16]} />
              <meshBasicMaterial color="#10b981" />
            </mesh>
          </group>
        </group>

        {/* ================================================================= */}
        {/* LAYER 1: Navigation Bar */}
        {/* ================================================================= */}
        <group
          position={[
            0,
            1.7,
            FRAME_LAYERS[1].zBase + (FRAME_LAYERS[1].zExplode - FRAME_LAYERS[1].zBase) * explodeFactor,
          ]}
        >
          <mesh geometry={headerGeo}>
            <meshStandardMaterial
              color={PALETTE.bgCard}
              roughness={0.3}
              metalness={0.2}
              transparent
              opacity={0.92}
            />
          </mesh>
          <lineSegments>
            <edgesGeometry args={[headerGeo]} />
            <lineBasicMaterial color={PALETTE.glowCyan} transparent opacity={0.6 + explodeFactor * 0.4} />
          </lineSegments>

          {/* Inner Nav Visual Elements (Logo mark & user avatar) */}
          <mesh position={[-1.3, 0, 0.02]}>
            <circleGeometry args={[0.12, 16]} />
            <meshBasicMaterial color={PALETTE.glowCyan} />
          </mesh>
          <mesh position={[-0.8, 0, 0.02]}>
            <planeGeometry args={[0.5, 0.08]} />
            <meshBasicMaterial color="#475569" />
          </mesh>
          <mesh position={[-0.15, 0, 0.02]}>
            <planeGeometry args={[0.45, 0.08]} />
            <meshBasicMaterial color="#475569" />
          </mesh>
          <mesh position={[1.3, 0, 0.02]}>
            <circleGeometry args={[0.12, 16]} />
            <meshBasicMaterial color={PALETTE.accentIndigo} />
          </mesh>

          {/* Stage 3 Layout AST Label */}
          {labelsOpacity > 0.05 && (
            <Html position={[1.8, 0, 0]} transform distanceFactor={7} center>
              <div
                style={{ opacity: labelsOpacity }}
                className="pointer-events-none transition-opacity duration-300 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-400/50 text-[10px] font-mono font-medium text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.3)] whitespace-nowrap"
              >
                flex row • space-between
              </div>
            </Html>
          )}
        </group>

        {/* ================================================================= */}
        {/* LAYER 2: Primary Stats / Telemetry Card */}
        {/* ================================================================= */}
        <group
          position={[
            0,
            0.55,
            FRAME_LAYERS[2].zBase + (FRAME_LAYERS[2].zExplode - FRAME_LAYERS[2].zBase) * explodeFactor,
          ]}
        >
          <mesh geometry={statCardGeo}>
            <meshStandardMaterial
              color={mode === 'assembled' ? '#0d162d' : '#11172e'}
              roughness={0.2}
              metalness={0.25}
              transparent
              opacity={0.94}
            />
          </mesh>
          <lineSegments>
            <edgesGeometry args={[statCardGeo]} />
            <lineBasicMaterial
              color={mode === 'assembled' ? PALETTE.glowEmerald : PALETTE.accentIndigo}
              transparent
              opacity={0.7}
            />
          </lineSegments>

          {/* Metric Icon & Text lines */}
          <mesh position={[-1.15, 0.4, 0.02]}>
            <planeGeometry args={[0.32, 0.32]} />
            <meshBasicMaterial color={PALETTE.accentIndigo} />
          </mesh>
          <mesh position={[-0.3, 0.45, 0.02]}>
            <planeGeometry args={[1.1, 0.1]} />
            <meshBasicMaterial color="#64748b" />
          </mesh>
          <mesh position={[-0.2, 0.25, 0.02]}>
            <planeGeometry args={[1.3, 0.16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>

          {/* Sparkline Bar Chart Graphic */}
          <group position={[0, -0.3, 0.02]}>
            {[0.3, 0.55, 0.4, 0.8, 0.6, 0.95, 0.75, 1.0].map((h, i) => (
              <mesh key={i} position={[-1.1 + i * 0.31, (h * 0.4) / 2 - 0.2, 0]}>
                <planeGeometry args={[0.2, h * 0.4]} />
                <meshBasicMaterial color={mode === 'assembled' ? PALETTE.glowEmerald : PALETTE.glowCyan} />
              </mesh>
            ))}
          </group>

          {/* Stage 3 Layout AST Label */}
          {labelsOpacity > 0.05 && (
            <Html position={[1.8, 0, 0]} transform distanceFactor={7} center>
              <div
                style={{ opacity: labelsOpacity }}
                className="pointer-events-none transition-opacity duration-300 px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-400/50 text-[10px] font-mono font-medium text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.3)] whitespace-nowrap"
              >
                grid-cols-2 • p-4 • sparkline
              </div>
            </Html>
          )}
        </group>

        {/* ================================================================= */}
        {/* LAYER 3: Interactive Features / Grid Card */}
        {/* ================================================================= */}
        <group
          position={[
            0,
            -0.95,
            FRAME_LAYERS[3].zBase + (FRAME_LAYERS[3].zExplode - FRAME_LAYERS[3].zBase) * explodeFactor,
          ]}
        >
          <mesh geometry={chartCardGeo}>
            <meshStandardMaterial
              color="#0e1428"
              roughness={0.3}
              metalness={0.2}
              transparent
              opacity={0.92}
            />
          </mesh>
          <lineSegments>
            <edgesGeometry args={[chartCardGeo]} />
            <lineBasicMaterial color={PALETTE.glowViolet} transparent opacity={0.65} />
          </lineSegments>

          {/* Toggle and list items */}
          <mesh position={[-1.0, 0.3, 0.02]}>
            <planeGeometry args={[0.9, 0.09]} />
            <meshBasicMaterial color="#94a3b8" />
          </mesh>
          <mesh position={[1.1, 0.3, 0.02]}>
            <planeGeometry args={[0.45, 0.18]} />
            <meshBasicMaterial color={PALETTE.accentViolet} />
          </mesh>
          <mesh position={[-0.4, -0.05, 0.02]}>
            <planeGeometry args={[2.1, 0.08]} />
            <meshBasicMaterial color="#334155" />
          </mesh>
          <mesh position={[-0.6, -0.25, 0.02]}>
            <planeGeometry args={[1.7, 0.08]} />
            <meshBasicMaterial color="#334155" />
          </mesh>

          {/* Stage 3 Layout AST Label */}
          {labelsOpacity > 0.05 && (
            <Html position={[-1.8, 0, 0]} transform distanceFactor={7} center>
              <div
                style={{ opacity: labelsOpacity }}
                className="pointer-events-none transition-opacity duration-300 px-2 py-0.5 rounded bg-violet-950/80 border border-violet-400/50 text-[10px] font-mono font-medium text-violet-300 shadow-[0_0_12px_rgba(139,92,246,0.3)] whitespace-nowrap"
              >
                stateful toggle • flex col
              </div>
            </Html>
          )}
        </group>

        {/* ================================================================= */}
        {/* LAYER 4: Primary Action Button */}
        {/* ================================================================= */}
        <group
          position={[
            0,
            -2.0,
            FRAME_LAYERS[4].zBase + (FRAME_LAYERS[4].zExplode - FRAME_LAYERS[4].zBase) * explodeFactor,
          ]}
        >
          <mesh geometry={buttonGeo}>
            <meshStandardMaterial
              color={mode === 'assembled' ? PALETTE.accentEmerald : PALETTE.accentIndigo}
              emissive={mode === 'assembled' ? '#059669' : '#4338ca'}
              emissiveIntensity={0.35}
              roughness={0.2}
              metalness={0.3}
            />
          </mesh>
          <lineSegments>
            <edgesGeometry args={[buttonGeo]} />
            <lineBasicMaterial
              color={mode === 'assembled' ? PALETTE.glowEmerald : PALETTE.glowCyan}
              transparent
              opacity={0.8}
            />
          </lineSegments>

          {/* Button Text Representation */}
          <mesh position={[0, 0, 0.02]}>
            <planeGeometry args={[1.6, 0.12]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>

          {/* Stage 3 Layout AST Label */}
          {labelsOpacity > 0.05 && (
            <Html position={[1.8, 0, 0]} transform distanceFactor={7} center>
              <div
                style={{ opacity: labelsOpacity }}
                className="pointer-events-none transition-opacity duration-300 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-400/50 text-[10px] font-mono font-medium text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)] whitespace-nowrap"
              >
                button • hover:scale-105 • onClick
              </div>
            </Html>
          )}
        </group>

        {/* ================================================================= */}
        {/* GLOWING CONNECTOR LINES (Stage 3) */}
        {/* Shows the visual bridge from base canvas to exploded layers */}
        {/* ================================================================= */}
        {explodeFactor > 0.2 && (
          <group>
            {FRAME_LAYERS.slice(1).map((layer, idx) => {
              const currentZ = layer.zBase + (layer.zExplode - layer.zBase) * explodeFactor
              return (
                <group key={layer.id}>
                  {/* Left edge connector line */}
                  <line>
                    <bufferGeometry
                      attach="geometry"
                      {...new THREE.BufferGeometry().setFromPoints([
                        new THREE.Vector3(-1.6, 1.7 - idx * 0.9, 0),
                        new THREE.Vector3(-1.6, 1.7 - idx * 0.9, currentZ),
                      ])}
                    />
                    <lineBasicMaterial
                      color={layer.glowColor}
                      transparent
                      opacity={explodeFactor * 0.75}
                    />
                  </line>

                  {/* Right edge connector line */}
                  <line>
                    <bufferGeometry
                      attach="geometry"
                      {...new THREE.BufferGeometry().setFromPoints([
                        new THREE.Vector3(1.6, 1.7 - idx * 0.9, 0),
                        new THREE.Vector3(1.6, 1.7 - idx * 0.9, currentZ),
                      ])}
                    />
                    <lineBasicMaterial
                      color={layer.glowColor}
                      transparent
                      opacity={explodeFactor * 0.75}
                    />
                  </line>
                </group>
              )
            })}
          </group>
        )}
      </group>
    </group>
  )
}

