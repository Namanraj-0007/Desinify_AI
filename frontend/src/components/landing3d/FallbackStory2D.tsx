import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../ui/Button'
import { PostStorySections } from './PostStorySections'

const STORY_STEPS = [
  {
    step: '01',
    stage: 'Hero Input',
    title: 'Design in. Code out.',
    desc: 'Transform static Figma frames and UI designs into clean, production-ready React components with Gemini 2.5 and FastAPI.',
    badge: 'Figma Frame 1',
    badgeColor: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10',
    visual: (
      <div className="w-full p-5 rounded-2xl bg-[#0f1424] border border-indigo-500/30 shadow-2xl">
        <div className="flex items-center gap-2 mb-4">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span className="text-[10px] font-mono text-slate-400 ml-2">Artboard / HeroSection.tsx</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-white/5 space-y-2">
          <div className="h-4 w-28 bg-indigo-500/30 rounded" />
          <div className="h-8 w-44 bg-white/20 rounded" />
          <div className="h-10 w-full bg-gradient-to-r from-indigo-600 to-cyan-400 rounded-lg mt-3" />
        </div>
      </div>
    ),
  },
  {
    step: '02',
    stage: 'Deconstruction',
    title: 'Deconstructing visual hierarchy',
    desc: 'The Figma frame splits into separate layers along the Z-axis. Headers, metrics, and buttons are isolated into distinct AST branches.',
    badge: '6 Isolated Layers',
    badgeColor: 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10',
    visual: (
      <div className="w-full space-y-2">
        {['Navigation Bar', 'Stats Metric Card', 'Sparkline Vector', 'CTA Button'].map((l, i) => (
          <div
            key={l}
            style={{ transform: `translateX(${i * 6}px)` }}
            className="p-3 rounded-xl bg-slate-900/90 border border-indigo-500/30 text-xs font-mono text-cyan-300 flex items-center justify-between shadow-lg"
          >
            <span>Layer 0{i + 1} • {l}</span>
            <span className="text-[10px] text-slate-500 font-sans">Z-Offset +{(i + 1) * 20}px</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    step: '03',
    stage: 'Vision AST',
    title: 'Gemini reads the layout.',
    desc: 'Google Gemini 2.5 analyzes geometric coordinates, flex row alignments, padding units, color tokens, and interactive bounds.',
    badge: 'Gemini 2.5 Vision',
    badgeColor: 'border-violet-500/30 text-violet-400 bg-violet-500/10',
    visual: (
      <div className="w-full p-4 rounded-2xl bg-[#0e1322] border border-violet-500/30 shadow-2xl space-y-2.5">
        <span className="text-[10px] font-mono text-violet-300 block">Extracted Layout Tokens:</span>
        <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
          <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
            flex-row • space-between
          </span>
          <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            grid-cols-2 • gap-4
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            button • hover:scale-105
          </span>
          <span className="px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20">
            rounded-3xl • backdrop-blur
          </span>
        </div>
      </div>
    ),
  },
  {
    step: '04',
    stage: 'FastAPI Stream',
    title: 'FastAPI turns it into components.',
    desc: 'Layers flow into our async compiler, streaming typed React 19 JSX and Tailwind CSS classes in real time via Server-Sent Events.',
    badge: 'SSE Stream Active',
    badgeColor: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10',
    visual: (
      <div className="w-full p-4 rounded-2xl bg-slate-950 border border-cyan-500/30 font-mono text-[11px] text-slate-300 shadow-2xl overflow-hidden">
        <div className="text-[10px] text-slate-500 pb-2 mb-2 border-b border-white/10 flex justify-between">
          <span>Streaming: HeroMetricCard.tsx</span>
          <span className="text-cyan-400 animate-pulse">● Live AST</span>
        </div>
        <p className="text-indigo-400">export function HeroMetricCard() {'{'}</p>
        <p className="text-slate-400 pl-3">return (</p>
        <p className="text-cyan-300 pl-6">&lt;div className="p-6 rounded-3xl bg-slate-900"&gt;</p>
        <p className="text-slate-400 pl-3">);</p>
        <p className="text-indigo-400">{'}'}</p>
      </div>
    ),
  },
  {
    step: '05',
    stage: 'Compiled TSX',
    title: 'Clean React, ready to ship.',
    desc: 'The code compiles and the layers snap back together into an interactive, accessible React component with zero third-party lock-in.',
    badge: '100% Type-Safe',
    badgeColor: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
    visual: (
      <div className="w-full p-5 rounded-2xl bg-[#0d162d] border border-emerald-500/40 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[10px] font-mono text-cyan-400">NEURAL SYNTHESIS</span>
            <h4 className="text-lg font-bold text-white">1,420 Components</h4>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
            99.4% TSX
          </span>
        </div>
        <div className="h-10 w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-400 rounded-lg flex items-center justify-center text-xs font-semibold text-white">
          Interactive Live Sandbox
        </div>
      </div>
    ),
  },
  {
    step: '06',
    stage: 'Production CTA',
    title: 'From Figma to React in seconds.',
    desc: 'Paste any public Figma file or frame link to watch Gemini synthesize production-ready TSX.',
    badge: 'Ready to Try',
    badgeColor: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
    visual: (
      <div className="w-full p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-center space-y-3">
        <p className="text-xs text-slate-300">Ready to transform your UI designs?</p>
        <div className="flex justify-center gap-3">
          <Button variant="gradient" size="sm" className="rounded-xl font-semibold">
            Launch Studio &rarr;
          </Button>
        </div>
      </div>
    ),
  },
]

export const FallbackStory2D: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState(0)
  const navigate = useNavigate()
  const { token } = useAuth()
  const current = STORY_STEPS[activeIdx]

  return (
    <div className="relative min-h-screen bg-[#070912] text-white">
      {/* Hero Header */}
      <section className="pt-24 pb-12 px-4 max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs font-mono text-cyan-300 mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>Figma-to-React Generator</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold font-display leading-tight">
          Design in.{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-sky-200 to-cyan-400">
            Code out.
          </span>
        </h1>

        <p className="mt-3 text-sm text-slate-300 leading-relaxed">
          Step through the 6-phase neural compilation pipeline:
        </p>

        {/* Step Navigation Tabs */}
        <div className="mt-6 flex items-center justify-center gap-1.5 overflow-x-auto pb-2">
          {STORY_STEPS.map((s, idx) => (
            <button
              key={s.step}
              onClick={() => setActiveIdx(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
                activeIdx === idx
                  ? 'bg-indigo-600 text-white font-semibold shadow-md'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {s.step} {s.stage}
            </button>
          ))}
        </div>
      </section>

      {/* Active Stage Card */}
      <section className="px-4 max-w-xl mx-auto pb-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.step}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="p-6 rounded-3xl bg-[#0d1222] border border-indigo-500/30 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${current.badgeColor}`}>
                {current.badge}
              </span>
              <span className="text-xs font-mono text-slate-500">Step {current.step} / 06</span>
            </div>

            <h2 className="text-xl font-bold font-display text-white mb-2">{current.title}</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">{current.desc}</p>

            {/* Visual Preview */}
            <div className="mt-4">{current.visual}</div>

            {/* Controls */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
              <button
                disabled={activeIdx === 0}
                onClick={() => setActiveIdx((prev) => Math.max(0, prev - 1))}
                className="text-xs font-mono text-slate-400 disabled:opacity-30 hover:text-white transition-colors"
              >
                &larr; Previous Phase
              </button>
              <button
                disabled={activeIdx === STORY_STEPS.length - 1}
                onClick={() => setActiveIdx((prev) => Math.min(STORY_STEPS.length - 1, prev + 1))}
                className="text-xs font-mono text-cyan-400 disabled:opacity-30 hover:text-cyan-300 transition-colors"
              >
                Next Phase &rarr;
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Post-story interactive sections */}
      <PostStorySections />
    </div>
  )
}

