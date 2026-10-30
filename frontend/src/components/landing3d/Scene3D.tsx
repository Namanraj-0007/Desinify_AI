import React, { useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import * as THREE from 'three'
import { FigmaFrame3D } from './FigmaFrame3D'
import { CodeStreamPanel3D, FlowingPathParticles } from './CodeStreamPanel3D'
import { FRAME_CONFIG, STAGE_TIMINGS, PALETTE, SCROLL_CONFIG } from './constants'

/**
 * BackgroundParticleStars
 * Lightweight static background starfield for spatial parallax depth.
 */
function BackgroundParticleStars({ count = 120 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null!)

  const [positions] = useState(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20
      pos[i * 3 + 1] = (Math.random() - 0.5) * 16
      pos[i * 3 + 2] = -3 - Math.random() * 8
    }
    return pos
  })

  useFrame((state) => {
    if (!pointsRef.current) return
    const t = state.clock.getElapsedTime()
    pointsRef.current.rotation.y = t * 0.015
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
        size={0.035}
        color={PALETTE.accentIndigo}
        transparent
        opacity={0.4}
      />
    </points>
  )
}

/**
 * SceneContent
 * Coordinates camera movement, stage shifts, and object positions
 * driven directly by ScrollControls' useScroll hook.
 */
export const SceneContent: React.FC = () => {
  const scroll = useScroll()
  const { camera } = useThree()

  // Track smoothed scroll progress across frames
  const [currentProgress, setCurrentProgress] = useState(0)

  // Positions of Figma frame and Code Panel
  const figmaGroupRef = useRef<THREE.Group>(null!)
  const assembledUiGroupRef = useRef<THREE.Group>(null!)

  useFrame((state) => {
    // Normalize scroll offset so that the 3D storyboard runs 0.0 -> 1.0 across storyPages
    const rawOffset = scroll.offset
    const p = THREE.MathUtils.clamp(
      rawOffset * (SCROLL_CONFIG.totalPages / SCROLL_CONFIG.storyPages),
      0,
      1
    )
    setCurrentProgress(p)
    const t = state.clock.getElapsedTime()

    // ------------------------------------------------------------------------
    // 1. CAMERA INTERPOLATION (0.0 to 1.0)
    // ------------------------------------------------------------------------
    // In Stage 1-4: camera at Z ~ 6.8
    // In Stage 6 (pullback): camera pulls back to Z ~ 8.6 to view before/after side by side
    let targetCameraZ = FRAME_CONFIG.cameraInitialZ
    let targetCameraX = 0
    let targetCameraY = 0

    if (p >= STAGE_TIMINGS.STAGE_6_PULLBACK.start) {
      const pullProgress = (p - STAGE_TIMINGS.STAGE_6_PULLBACK.start) / 0.1
      targetCameraZ = THREE.MathUtils.lerp(FRAME_CONFIG.cameraInitialZ, FRAME_CONFIG.cameraPulledBackZ, pullProgress)
    } else if (p >= STAGE_TIMINGS.STAGE_4_STREAM.start && p < STAGE_TIMINGS.STAGE_5_ASSEMBLE.start) {
      // Slight shift to the right to balance code panel
      targetCameraX = 0.4
    }

    // Smooth camera damping
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCameraZ, 0.08)
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCameraX, 0.08)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCameraY, 0.08)
    camera.lookAt(targetCameraX * 0.4, 0, 0)

    // ------------------------------------------------------------------------
    // 2. FIGMA FRAME STAGE POSITIONS
    // ------------------------------------------------------------------------
    if (figmaGroupRef.current) {
      let targetFigmaX = 0
      let targetFigmaY = 0
      let targetFigmaScale = 1

      if (p < STAGE_TIMINGS.STAGE_4_STREAM.start) {
        // Stages 1, 2, 3: Centered
        targetFigmaX = 0
      } else if (p < STAGE_TIMINGS.STAGE_6_PULLBACK.start) {
        // Stage 4 & 5: Slide to the left as code panel streams on the right
        const shiftFactor = (p - STAGE_TIMINGS.STAGE_4_STREAM.start) / 0.15
        targetFigmaX = THREE.MathUtils.lerp(0, -2.1, Math.min(1, shiftFactor))
        targetFigmaScale = THREE.MathUtils.lerp(1, 0.9, Math.min(1, shiftFactor))
      } else {
        // Stage 6: Side by side (Figma on left, React UI on right)
        targetFigmaX = -2.6
        targetFigmaScale = 0.88
      }

      figmaGroupRef.current.position.x = THREE.MathUtils.lerp(figmaGroupRef.current.position.x, targetFigmaX, 0.08)
      figmaGroupRef.current.position.y = THREE.MathUtils.lerp(figmaGroupRef.current.position.y, targetFigmaY, 0.08)
      figmaGroupRef.current.scale.setScalar(
        THREE.MathUtils.lerp(figmaGroupRef.current.scale.x, targetFigmaScale, 0.08)
      )
    }

    // ------------------------------------------------------------------------
    // 3. ASSEMBLED UI (STAGE 5 & 6)
    // ------------------------------------------------------------------------
    if (assembledUiGroupRef.current) {
      let targetAssembledX = 2.6
      let targetAssembledScale = 0.88
      let targetOpacity = 0

      if (p >= STAGE_TIMINGS.STAGE_5_ASSEMBLE.start) {
        targetOpacity = 1
        if (p >= STAGE_TIMINGS.STAGE_6_PULLBACK.start) {
          targetAssembledX = 2.6
          targetAssembledScale = 0.88
        } else {
          targetAssembledX = 2.1
          targetAssembledScale = 0.9
        }
      }

      assembledUiGroupRef.current.position.x = THREE.MathUtils.lerp(
        assembledUiGroupRef.current.position.x,
        targetAssembledX,
        0.08
      )
    }
  })

  // Determine which mode the Figma Frame is in
  const isSideBySide = currentProgress >= STAGE_TIMINGS.STAGE_6_PULLBACK.start
  const isAssembledStage = currentProgress >= STAGE_TIMINGS.STAGE_5_ASSEMBLE.start

  return (
    <>
      {/* Lights - Low overhead, cheap, zero real-time shadows */}
      <ambientLight intensity={0.9} />
      <directionalLight position={[4, 6, 5]} intensity={1.1} />
      <pointLight position={[-4, 2, 4]} intensity={0.8} color={PALETTE.glowViolet} />
      <pointLight position={[4, -2, 4]} intensity={0.8} color={PALETTE.glowCyan} />

      {/* Subtle Background Starfield */}
      <BackgroundParticleStars count={120} />

      {/* Primary Figma Frame */}
      <group ref={figmaGroupRef}>
        <FigmaFrame3D
          progress={currentProgress}
          mode={isSideBySide ? 'side-by-side' : 'hero'}
        />
      </group>

      {/* Glowing Conduit & Flowing Particles (Stage 4) */}
      <FlowingPathParticles progress={currentProgress} />

      {/* Code Stream Panel (Stage 4 & 5) */}
      {currentProgress >= STAGE_TIMINGS.STAGE_3_LABELS.end && (
        <CodeStreamPanel3D
          progress={currentProgress}
          position={[2.1, 0, 0]}
          scale={0.9}
        />
      )}

      {/* Final Assembled Live React UI Component (Stage 5 & 6) */}
      {isAssembledStage && (
        <group ref={assembledUiGroupRef} position={[2.6, 0, 0]}>
          <FigmaFrame3D
            progress={currentProgress}
            mode="assembled"
            scale={0.88}
          />
        </group>
      )}
    </>
  )
}
