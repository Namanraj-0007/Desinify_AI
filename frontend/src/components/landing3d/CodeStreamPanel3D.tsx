import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { PALETTE, STAGE_TIMINGS, STREAMING_CODE_LINES } from './constants'

/**
 * Creates rounded rectangle shape for the Code Window plane.
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

interface CodeStreamPanel3DProps {
  progress: number
  position?: [number, number, number]
  scale?: number
}

/**
 * CodeStreamPanel3D
 * 3D Obsidian Code Editor that streams lines of typed TypeScript React code
 * as Figma AST tokens flow into the FastAPI compiler pipeline.
 */
export const CodeStreamPanel3D: React.FC<CodeStreamPanel3DProps> = ({
  progress,
  position = [2.6, 0, 0],
  scale = 1,
}) => {
  const groupRef = useRef<THREE.Group>(null!)

  const panelGeo = useMemo(() => new THREE.ShapeGeometry(createRoundedRectShape(3.8, 4.8, 0.2)), [])

  // Calculate code streaming progress (0.0 to 1.0) during Stage 4
  const streamProgress = useMemo(() => {
    const start = STAGE_TIMINGS.STAGE_4_STREAM.start
    const end = STAGE_TIMINGS.STAGE_4_STREAM.end
    if (progress < start) return 0
    if (progress >= end) return 1
    return (progress - start) / (end - start)
  }, [progress])

  // Visibility and opacity based on stage
  const panelOpacity = useMemo(() => {
    if (progress < STAGE_TIMINGS.STAGE_3_LABELS.end) return 0
    if (progress < STAGE_TIMINGS.STAGE_4_STREAM.start) {
      return (progress - STAGE_TIMINGS.STAGE_3_LABELS.end) / 0.05
    }
    return 1
  }, [progress])

  // Count of lines to reveal based on streaming progress
  const visibleLineCount = Math.min(
    STREAMING_CODE_LINES.length,
    Math.max(4, Math.floor(streamProgress * STREAMING_CODE_LINES.length))
  )

  // Gentle floating and compile pulse in Stage 5
  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.getElapsedTime()
    // Subtle breathing rotation
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      -0.08 + Math.cos(t * 0.5) * 0.03,
      0.05
    )
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      Math.sin(t * 0.6) * 0.02,
      0.05
    )
  })

  if (panelOpacity <= 0.01) return null

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* 3D Glass Surface */}
      <mesh geometry={panelGeo}>
        <meshStandardMaterial
          color="#070a14"
          roughness={0.2}
          metalness={0.3}
          transparent
          opacity={0.94 * panelOpacity}
        />
      </mesh>

      {/* Radiant Glowing Border */}
      <lineSegments>
        <edgesGeometry args={[panelGeo]} />
        <lineBasicMaterial
          color={progress >= STAGE_TIMINGS.STAGE_5_ASSEMBLE.start ? PALETTE.glowEmerald : PALETTE.glowCyan}
          transparent
          opacity={0.75 * panelOpacity}
        />
      </lineSegments>

      {/* Editor Window Header Bar (Traffic Lights & Tab Pill) */}
      <group position={[0, 2.15, 0.02]}>
        <mesh position={[-1.55, 0, 0]}>
          <circleGeometry args={[0.045, 16]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
        <mesh position={[-1.41, 0, 0]}>
          <circleGeometry args={[0.045, 16]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>
        <mesh position={[-1.27, 0, 0]}>
          <circleGeometry args={[0.045, 16]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>
      </group>

      {/* Render HTML Code Body inside 3D coordinate space */}
      <Html position={[0, -0.1, 0.05]} transform distanceFactor={7.5} center>
        <div
          style={{ opacity: panelOpacity }}
          className="w-[380px] h-[480px] bg-slate-950/85 backdrop-blur-xl rounded-2xl p-4 font-mono text-[11px] leading-relaxed text-slate-300 border border-white/5 shadow-2xl flex flex-col justify-between select-none overflow-hidden"
        >
          {/* Top Tab Bar */}
          <div>
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-white/10 text-[10px]">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-cyan-300 border border-indigo-500/30 font-semibold flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  HeroMetricCard.tsx
                </span>
                <span className="text-slate-500">tokens.json</span>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px]">
                {progress >= STAGE_TIMINGS.STAGE_5_ASSEMBLE.start ? '✓ Compiled (340ms)' : 'Compiling AST...'}
              </span>
            </div>

            {/* Code Lines with Syntax Coloring */}
            <div className="space-y-1 overflow-hidden h-[380px] text-[10.5px]">
              {STREAMING_CODE_LINES.slice(0, visibleLineCount).map((line, idx) => {
                // Syntax coloring heuristics
                const isComment = line.startsWith('//')
                const isImport = line.startsWith('import ') || line.startsWith('export ')
                const hasString = line.includes('"') || line.includes("'")

                return (
                  <div key={idx} className="flex items-start gap-2.5">
                    <span className="text-slate-600 w-5 text-right select-none text-[9px]">
                      {idx + 1}
                    </span>
                    <span
                      className={`truncate ${
                        isComment
                          ? 'text-slate-500 italic'
                          : isImport
                          ? 'text-indigo-400 font-semibold'
                          : hasString
                          ? 'text-cyan-300'
                          : 'text-slate-200'
                      }`}
                    >
                      {line || '\u00A0'}
                    </span>
                  </div>
                )
              })}

              {/* Pulsing Code Cursor */}
              {visibleLineCount < STREAMING_CODE_LINES.length && (
                <div className="flex items-center gap-2.5">
                  <span className="text-slate-600 w-5 text-right select-none text-[9px]">
                    {visibleLineCount + 1}
                  </span>
                  <span className="h-3.5 w-2 bg-cyan-400 animate-pulse inline-block shadow-[0_0_8px_#22d3ee]" />
                </div>
              )}
            </div>
          </div>

          {/* Bottom Telemetry Bar */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[9px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              FastAPI SSE Stream Active
            </span>
            <span className="text-cyan-300 font-mono">React 19 • TSX</span>
          </div>
        </div>
      </Html>
    </group>
  )
}

/**
 * FlowingPathParticles
 * Renders glowing energy particles traveling along a curve from
 * the Figma frame into the Code Compiler during Stage 4.
 */
export const FlowingPathParticles: React.FC<{ progress: number }> = ({ progress }) => {
  const pointsRef = useRef<THREE.Points>(null!)

  const isFlowing =
    progress >= STAGE_TIMINGS.STAGE_4_STREAM.start - 0.05 &&
    progress <= STAGE_TIMINGS.STAGE_5_ASSEMBLE.end

  // Curve connecting Figma Frame (-1.5, 0, 0) to Code Panel (+1.5, 0, 0)
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.4, 0.4, 0.5),
      new THREE.Vector3(-0.5, 1.2, 0.8),
      new THREE.Vector3(0.5, -0.6, 0.6),
      new THREE.Vector3(1.4, 0.2, 0.3),
    ])
  }, [])

  // Curve geometry for the glowing conduit line
  const tubeGeometry = useMemo(() => {
    return new THREE.TubeGeometry(curve, 32, 0.015, 8, false)
  }, [curve])

  // Particles traveling along the curve
  const particleCount = 28
  const { positions, progressOffsets } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3)
    const offsets = new Float32Array(particleCount)
    for (let i = 0; i < particleCount; i++) {
      offsets[i] = i / particleCount
      const p = curve.getPoint(offsets[i])
      pos[i * 3] = p.x
      pos[i * 3 + 1] = p.y
      pos[i * 3 + 2] = p.z
    }
    return { positions: pos, progressOffsets: offsets }
  }, [curve])

  useFrame((state) => {
    if (!pointsRef.current || !isFlowing) return
    const t = state.clock.getElapsedTime()
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute

    for (let i = 0; i < particleCount; i++) {
      const u = (progressOffsets[i] + t * 0.4) % 1
      const p = curve.getPoint(u)
      posAttr.setXYZ(i, p.x, p.y, p.z)
    }
    posAttr.needsUpdate = true
  })

  if (!isFlowing) return null

  return (
    <group>
      {/* Glowing Conduit Tube */}
      <mesh geometry={tubeGeometry}>
        <meshBasicMaterial color={PALETTE.glowCyan} transparent opacity={0.35} />
      </mesh>

      {/* Traveling Energy Packets */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          color={PALETTE.glowViolet}
          transparent
          opacity={0.9}
        />
      </points>
    </group>
  )
}

