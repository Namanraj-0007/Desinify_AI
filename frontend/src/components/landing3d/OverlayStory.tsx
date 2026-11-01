import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../ui/Button'

interface OverlayStoryProps {
  onFigmaSubmit?: (url: string) => void
}

/**
 * OverlayStory
 * Renders the HTML story captions, headlines, stage indicators,
 * and final CTA overlay along the Drei ScrollControls virtual scroll path.
 */
export const OverlayStory: React.FC<OverlayStoryProps> = ({ onFigmaSubmit }) => {
  const navigate = useNavigate()
  const { token } = useAuth()
  const [figmaUrl, setFigmaUrl] = useState('')

  const handleLaunch = () => {
    if (figmaUrl.trim()) {
      sessionStorage.setItem('figmaUrl', figmaUrl.trim())
    }
    navigate(token ? '/dashboard' : '/auth')
  }

  const handleSampleClick = () => {
    const sample = 'https://www.figma.com/design/sample-hero-dashboard'
    setFigmaUrl(sample)
  }

  return (
    <div className="relative w-full text-white pointer-events-none select-none">
      {/* Stage 1: Hero headline (0% - 15%) */}
      <section className="h-screen w-full flex flex-col justify-between p-6 sm:p-12 max-w-7xl mx-auto">
        <div className="pt-16 sm:pt-20 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs font-mono text-cyan-300 mb-6 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
            <span>Designify AI • Figma-to-React Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight font-display text-white leading-[1.1]">
            Design in.{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-sky-200 to-cyan-400">
              Code out.
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl font-normal">
            Turn static Figma frames and UI designs into clean, production-ready React components with Gemini 2.5 and FastAPI.
          </p>

          <div className="mt-8 flex items-center gap-4 pointer-events-auto">
            <Button
              variant="gradient"
              onClick={() => navigate(token ? '/dashboard' : '/auth')}
              className="h-11 px-6 text-sm font-semibold rounded-xl shadow-[0_0_25px_rgba(99,102,241,0.4)]"
            >
              Start Generating Free &rarr;
            </Button>
            <button
              onClick={() => {
                const el = document.getElementById('preview')
                el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              className="text-xs font-mono text-slate-400 hover:text-white transition-colors underline underline-offset-4 cursor-pointer"
            >
              Jump to Live Demo
            </button>
          </div>
        </div>

        {/* Scroll prompt indicator */}
        <div className="pb-8 flex items-center gap-3 text-xs font-mono text-slate-500">
          <span className="h-4 w-4 rounded-full border border-slate-600 flex items-center justify-center animate-bounce">
            ↓
          </span>
          <span>Scroll to decompose the visual AST</span>
        </div>
      </section>

      {/* Stage 2: Layer explosion (15% - 35%) */}
      <section className="h-screen w-full flex items-center p-6 sm:p-12 max-w-7xl mx-auto">
        <div className="max-w-md p-6 rounded-2xl bg-slate-950/70 border border-white/10 backdrop-blur-xl shadow-2xl">
          <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest block mb-1">
            01 / Spatial Deconstruction
          </span>
          <h2 className="text-2xl font-bold font-display text-white">
            Deconstructing visual hierarchy
          </h2>
          <p className="mt-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
            The Figma frame splits into separate layers along the Z-axis. Headers, metric cards, sparklines, and button primitives are isolated into distinct AST branches.
          </p>
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>6 Isolated Layers</span>
            <span className="text-cyan-400">Z-Exploded View</span>
          </div>
        </div>
      </section>

      {/* Stage 3: Gemini layout analysis (35% - 55%) */}
      <section className="h-screen w-full flex items-center justify-end p-6 sm:p-12 max-w-7xl mx-auto">
        <div className="max-w-md p-6 rounded-2xl bg-slate-950/70 border border-cyan-500/30 backdrop-blur-xl shadow-2xl">
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block mb-1">
            02 / Multimodal Vision
          </span>
          <h2 className="text-2xl font-bold font-display text-white">
            Gemini reads the layout.
          </h2>
          <p className="mt-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Google Gemini 2.5 analyzes geometric coordinates, flex row alignments, padding units, color tokens, and interactive bounds with zero manual marking.
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5 font-mono text-[10px]">
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              flex-row
            </span>
            <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              grid-cols-2
            </span>
            <span className="px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20">
              button:hover
            </span>
          </div>
        </div>
      </section>

      {/* Stage 4: Component synthesis stream (55% - 75%) */}
      <section className="h-screen w-full flex items-center p-6 sm:p-12 max-w-7xl mx-auto">
        <div className="max-w-md p-6 rounded-2xl bg-slate-950/70 border border-indigo-500/30 backdrop-blur-xl shadow-2xl">
          <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest block mb-1">
            03 / Component Synthesis
          </span>
          <h2 className="text-2xl font-bold font-display text-white">
            FastAPI turns it into components.
          </h2>
          <p className="mt-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Layers flow along the neural conduit into our async compiler, streaming typed React 19 JSX and Tailwind CSS utility classes in real time via Server-Sent Events.
          </p>
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
              SSE Stream Active
            </span>
            <span className="text-emerald-400 font-semibold">AST ~340ms</span>
          </div>
        </div>
      </section>

      {/* Stage 5: Assembled clean UI (75% - 90%) */}
      <section className="h-screen w-full flex items-center justify-end p-6 sm:p-12 max-w-7xl mx-auto">
        <div className="max-w-md p-6 rounded-2xl bg-slate-950/70 border border-emerald-500/30 backdrop-blur-xl shadow-2xl">
          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block mb-1">
            04 / Production Compilation
          </span>
          <h2 className="text-2xl font-bold font-display text-white">
            Clean React, ready to ship.
          </h2>
          <p className="mt-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
            The code compiles and the layers snap back together into an interactive, accessible React component with zero third-party lock-in.
          </p>
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>TypeScript 5.5 • Tailwind v3</span>
            <span className="text-emerald-400 font-bold">100% Type-Safe</span>
          </div>
        </div>
      </section>

      {/* Stage 6: Camera pullback & hero CTA (90% - 100%) */}
      <section className="h-screen w-full flex flex-col justify-center items-center p-6 max-w-4xl mx-auto text-center">
        <div className="pointer-events-auto w-full max-w-2xl p-7 sm:p-10 rounded-3xl bg-slate-950/90 border border-indigo-500/40 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative overflow-hidden">
          {/* Subtle Glows */}
          <div className="pointer-events-none absolute -top-24 -left-24 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-cyan-500/20 blur-3xl" />

          <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono font-semibold text-emerald-400 mb-4">
            Pipeline Completed • Ready to Try
          </span>

          <h2 className="text-2xl sm:text-4xl font-extrabold font-display text-white tracking-tight">
            Generate your first component
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
            Paste any public Figma file or frame link to watch Gemini synthesize production TSX.
          </p>

          {/* Figma Input & Launch Button */}
          <div className="mt-6 flex flex-col sm:flex-row gap-2 max-w-lg mx-auto">
            <input
              type="url"
              value={figmaUrl}
              onChange={(e) => setFigmaUrl(e.target.value)}
              placeholder="https://www.figma.com/design/..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
            <Button
              variant="gradient"
              onClick={handleLaunch}
              className="h-10 px-5 text-xs font-semibold rounded-xl whitespace-nowrap shadow-[0_0_20px_rgba(99,102,241,0.5)]"
            >
              Generate Code &rarr;
            </Button>
          </div>

          {/* Preset Sample Button */}
          <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-mono">
            <span>No link handy?</span>
            <button
              onClick={handleSampleClick}
              className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors cursor-pointer"
            >
              Load Sample Figma Frame
            </button>
          </div>

          {/* Social & Portfolio Links */}
          <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <a
              href="https://github.com/NamandipRaj"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1.5 font-mono"
            >
              <span>GitHub</span> &nearr;
            </a>
            <span className="text-white/20">•</span>
            <a
              href="https://portfolio-namandip.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="hover:text-cyan-400 transition-colors flex items-center gap-1.5 font-mono"
            >
              <span>Portfolio</span> &nearr;
            </a>
            <span className="text-white/20">•</span>
            <button
              onClick={() => navigate('/docs')}
              className="hover:text-white transition-colors font-mono"
            >
              Documentation
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

