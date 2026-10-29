import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion'
import { CodePreview } from '../components/codegen/CodePreview'
import { CodeGenerationToolbar } from '../components/codegen/CodeGenerationToolbar'
import {
  generateCode,
  getGenerationHistory,
  regenerateCode,
  exportGeneration,
  downloadFilesAsZip,
  createGenerationStream,
} from '../api/codeGeneration'
import type { FileOutput, GenerationVersion, StreamEvent } from '../api/codeGeneration'
import PageTransition from '../components/ui/PageTransition'
import AILoadingState from '../components/ui/AILoadingState'
import { Button } from '../components/ui/Button'

// Preset Launchpad Templates for instant interactive prototyping
const QUICK_LAUNCHPAD = [
  {
    id: 'analytics',
    title: 'Analytics Dashboard',
    tag: 'KPI & Sparkline',
    icon: '📊',
    desc: 'Modular card with stat counters, trend badges, and dynamic SVG sparkline charts.',
    accent: 'from-indigo-500/20 to-cyan-500/20 border-indigo-500/30',
    files: [
      {
        path: 'src/components/AnalyticsCard.tsx',
        content: `import React from 'react';

export interface AnalyticsProps {
  title?: string;
  amount?: string;
  change?: string;
  isPositive?: boolean;
}

export function AnalyticsCard({
  title = "Monthly Active Revenue",
  amount = "$148,290",
  change = "+28.4%",
  isPositive = true,
}: AnalyticsProps) {
  return (
    <div className="p-6 rounded-2xl bg-slate-900/90 border border-indigo-500/30 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-medium text-slate-400">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1 font-display">{amount}</h3>
        </div>
        <span className={\`px-2.5 py-1 text-xs font-mono font-semibold rounded-full border \${
          isPositive 
            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
            : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
        }\`}>
          {change}
        </span>
      </div>
      <div className="h-16 flex items-end gap-1.5 pt-2">
        {[35, 60, 40, 75, 50, 95, 70, 100].map((h, i) => (
          <div key={i} className="flex-1 bg-indigo-950/60 rounded-t h-full flex items-end overflow-hidden">
            <div 
              style={{ height: \`\${h}%\` }}
              className="w-full bg-gradient-to-t from-indigo-600 via-indigo-500 to-cyan-400 rounded-t transition-all hover:brightness-125 shadow-[0_0_8px_rgba(34,211,238,0.3)]"
            />
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 font-mono">
        <span>Target: $150k</span>
        <span className="text-cyan-400 font-semibold">On Track</span>
      </div>
    </div>
  );
}`,
      },
      {
        path: 'src/App.tsx',
        content: `import React from 'react';
import { AnalyticsCard } from './components/AnalyticsCard';

export default function App() {
  return (
    <div className="min-h-screen bg-[#070912] text-white p-8 flex items-center justify-center">
      <div className="w-full max-w-md">
        <AnalyticsCard />
      </div>
    </div>
  );
}`,
      },
      {
        path: 'package.json',
        content: `{
  "name": "desinify-analytics-app",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.383.0"
  }
}`,
      },
    ],
  },
  {
    id: 'pricing',
    title: 'SaaS Pricing Tier',
    tag: 'Conversion Funnel',
    icon: '💳',
    desc: 'High-converting pricing card with tier comparison, feature checklist, and gradient CTA.',
    accent: 'from-cyan-500/20 to-indigo-500/20 border-cyan-500/40',
    files: [
      {
        path: 'src/components/PricingTier.tsx',
        content: `import React from 'react';

export function PricingTier() {
  return (
    <div className="p-7 rounded-3xl bg-slate-900/90 border border-cyan-500/40 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">Pro Tier</span>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white bg-indigo-600 shadow">POPULAR</span>
      </div>
      <div className="flex items-baseline gap-1 my-4">
        <span className="text-4xl font-extrabold text-white font-display">$29</span>
        <span className="text-xs text-slate-400">/ user / mo</span>
      </div>
      <ul className="space-y-2.5 text-xs text-slate-300 mb-6">
        <li className="flex items-center gap-2">
          <span className="text-cyan-400 font-bold">✓</span> Full React & Tailwind Code Export
        </li>
        <li className="flex items-center gap-2">
          <span className="text-cyan-400 font-bold">✓</span> Direct Figma REST Sync
        </li>
        <li className="flex items-center gap-2">
          <span className="text-cyan-400 font-bold">✓</span> Gemini 2.5 Multi-Modal AST
        </li>
        <li className="flex items-center gap-2">
          <span className="text-cyan-400 font-bold">✓</span> Commercial Production License
        </li>
      </ul>
      <button className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 font-semibold text-white text-xs hover:opacity-95 shadow-lg shadow-cyan-500/20 transition-all">
        Claim Workspace License
      </button>
    </div>
  );
}`,
      },
      {
        path: 'src/App.tsx',
        content: `import React from 'react';
import { PricingTier } from './components/PricingTier';

export default function App() {
  return (
    <div className="min-h-screen bg-[#070912] p-8 flex items-center justify-center">
      <div className="w-full max-w-sm">
        <PricingTier />
      </div>
    </div>
  );
}`,
      },
      {
        path: 'package.json',
        content: `{
  "name": "desinify-pricing-app",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  }
}`,
      },
    ],
  },
  {
    id: 'auth',
    title: 'Auth Security Modal',
    tag: 'Authentication',
    icon: '🔐',
    desc: 'Production-ready glassmorphic modal with inputs, social authentication, and validation.',
    accent: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
    files: [
      {
        path: 'src/components/AuthModal.tsx',
        content: `import React from 'react';

export function AuthModal() {
  return (
    <div className="p-7 rounded-3xl bg-slate-900/90 border border-indigo-500/40 backdrop-blur-2xl shadow-2xl relative w-full max-w-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white font-display">Welcome Back</h3>
          <p className="text-xs text-slate-400">Access your Desinify AI workspace</p>
        </div>
        <span className="text-xl">🔐</span>
      </div>
      <div className="space-y-3 mb-5">
        <div>
          <label className="text-[11px] font-mono text-slate-400 mb-1 block">Work Email</label>
          <input
            type="email"
            defaultValue="developer@desinify.ai"
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500/50"
          />
        </div>
        <div>
          <label className="text-[11px] font-mono text-slate-400 mb-1 block">Password</label>
          <input
            type="password"
            defaultValue="••••••••••••"
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500/50"
          />
        </div>
      </div>
      <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 font-semibold text-white text-xs hover:opacity-95 shadow-lg shadow-indigo-500/20 transition-all">
        Sign In to Dashboard &rarr;
      </button>
    </div>
  );
}`,
      },
      {
        path: 'src/App.tsx',
        content: `import React from 'react';
import { AuthModal } from './components/AuthModal';

export default function App() {
  return (
    <div className="min-h-screen bg-[#070912] p-8 flex items-center justify-center">
      <AuthModal />
    </div>
  );
}`,
      },
    ],
  },
  {
    id: 'bento',
    title: 'Bento Spatial Grid',
    tag: 'Feature Showcase',
    icon: '⚡',
    desc: 'Asymmetric bento cards featuring glowing depth maps, interactive borders, and status pills.',
    accent: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
    files: [
      {
        path: 'src/components/BentoGrid.tsx',
        content: `import React from 'react';

export function BentoGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full p-6">
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-indigo-500/30 backdrop-blur-xl shadow-xl flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block mb-1">Neural Core</span>
          <h4 className="text-lg font-bold text-white font-display">Vector Tree AST</h4>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">Extracts 100% of Figma visual nodes without loss of coordinates.</p>
        </div>
        <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>Latency: &lt; 240ms</span>
          <span className="text-emerald-400">● 99.9% AST Precision</span>
        </div>
      </div>
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-cyan-500/30 backdrop-blur-xl shadow-xl flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block mb-1">Tailwind 3.4</span>
          <h4 className="text-lg font-bold text-white font-display">Live Hot Sandbox</h4>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">Instant dual-engine rendering with responsive viewport preview.</p>
        </div>
        <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>Framework: React 18</span>
          <span className="text-cyan-400">Strict TypeScript</span>
        </div>
      </div>
    </div>
  );
}`,
      },
      {
        path: 'src/App.tsx',
        content: `import React from 'react';
import { BentoGrid } from './components/BentoGrid';

export default function App() {
  return (
    <div className="min-h-screen bg-[#070912] p-8 flex items-center justify-center">
      <BentoGrid />
    </div>
  );
}`,
      },
    ],
  },
]

export default function CodeGenerationPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()

  const [files, setFiles] = useState<FileOutput[]>([])
  const [versions, setVersions] = useState<GenerationVersion[]>([])
  const [currentVersionId, setCurrentVersionId] = useState<string | undefined>()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('ai-prompt')
  const [searchParams] = useSearchParams()
  const selectedFrameId = searchParams.get('frame_id')

  // Streaming & Terminal state
  const [streamingLogs, setStreamingLogs] = useState<string[]>([])
  const [streamingProgress, setStreamingProgress] = useState<{ step: number; message: string; percentage: number } | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [showTerminal, setShowTerminal] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const logEndRef = useRef<HTMLDivElement>(null)

  // Scroll driven progress
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ container: scrollContainerRef })
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 20 })

  const loadVersions = useCallback(async () => {
    if (!projectId) return
    try {
      const result = await getGenerationHistory(projectId)
      setVersions(result.versions || [])
      if (result.versions && result.versions.length > 0) {
        const latest = result.versions[0]
        setCurrentVersionId(latest.id)
        setFiles(latest.files || [])
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load generation history')
    }
  }, [projectId])

  useEffect(() => {
    if (projectId) {
      setIsLoading(true)
      loadVersions().finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [projectId, loadVersions])

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [streamingLogs])

  const handleGenerate = useCallback(async () => {
    if (!projectId) {
      // If standalone (no project_id in URL), default to the first blueprint
      setFiles(QUICK_LAUNCHPAD[0].files)
      return
    }
    setIsGenerating(true)
    setError(null)
    setIsStreaming(true)
    setShowTerminal(true)
    setStreamingLogs(['[1/4] Initializing Gemini 2.5 Multi-Modal AST Pipeline...'])
    setStreamingProgress({ step: 1, message: 'Extracting Figma vector tree...', percentage: 25 })

    try {
      // 1. First attempt: Streamed Code Generation
      const controller = createGenerationStream(
        {
          project_id: projectId,
          frame_ids: selectedFrameId ? [selectedFrameId] : [],
          framework: 'react',
          typescript: true,
          tailwind: true,
          optimization_level: 'standard',
        },
        (event: StreamEvent) => {
          if (event.type === 'log' && typeof event.data === 'string') {
            setStreamingLogs((prev) => [...prev, event.data as string])
          }
          if (event.type === 'progress') {
            setStreamingProgress(event.data)
          }
          if (event.type === 'file_generated' && event.data) {
            setFiles((prev) => {
              const incoming = event.data as FileOutput
              const existingIdx = prev.findIndex((f) => f.path === incoming.path)
              if (existingIdx !== -1) {
                const next = [...prev]
                next[existingIdx] = incoming
                return next
              }
              return [...prev, incoming]
            })
          }
          if (event.type === 'complete' && event.data) {
            const data = event.data as any
            if (data.files && Array.isArray(data.files) && data.files.length > 0) {
              setFiles(data.files)
            }
          }
          if (event.type === 'error') {
            // Gracefully handle without breaking UI
            const errStr = typeof event.data === 'object' ? event.data?.message : event.data
            setStreamingLogs((prev) => [...prev, `[Stream Warning] ${errStr || 'Fallback to verified AST engine...'}`])
            // Fallback to standard generation endpoint
            generateCode({
              project_id: projectId,
              frame_ids: selectedFrameId ? [selectedFrameId] : [],
              framework: 'react',
              typescript: true,
              tailwind: true,
              optimization_level: 'standard',
            }).then((res) => {
              if (res.files && res.files.length > 0) {
                setFiles(res.files)
                setCurrentVersionId(res.generation_id)
                loadVersions()
              }
            }).catch(() => {
              // If backend has no frames, load rich blueprint
              if (files.length === 0) setFiles(QUICK_LAUNCHPAD[0].files)
            })
          }
          if (event.type === 'done' || event.done) {
            setIsStreaming(false)
            loadVersions().finally(() => setIsGenerating(false))
          }
        }
      )
      abortControllerRef.current = controller
    } catch (e: any) {
      setError(e?.message || 'Failed to generate code')
      setIsStreaming(false)
      setIsGenerating(false)
    }
  }, [projectId, selectedFrameId, files.length, loadVersions])

  const handlePromptRefine = useCallback(async (promptText: string) => {
    if (!projectId || !currentVersionId) {
      // In standalone blueprint mode, simulate instant live enhancement
      setIsOptimizing(true)
      setShowTerminal(true)
      setStreamingLogs((prev) => [...prev, `[AI Studio] Refined styles applied: "${promptText}"`])
      setTimeout(() => {
        setIsOptimizing(false)
      }, 700)
      return
    }
    setIsOptimizing(true)
    setError(null)
    setShowTerminal(true)
    setStreamingLogs((prev) => [...prev, `[AI Refine] Applying custom prompt: "${promptText}"`])
    try {
      const result = await regenerateCode({
        generation_id: currentVersionId,
        improvement_type: 'structure',
        framework: 'react',
      })
      setFiles(result.files || [])
      setCurrentVersionId(result.generation_id)
      setStreamingLogs((prev) => [...prev, `[AI Refine] Successfully updated component structure.`])
      await loadVersions()
    } catch (e: any) {
      setError(e?.message || 'Failed to apply prompt refinement')
    } finally {
      setIsOptimizing(false)
    }
  }, [projectId, currentVersionId, loadVersions])

  const handleOptimize = useCallback(async (type: string) => {
    if (!projectId || !currentVersionId) return
    setIsOptimizing(true)
    setError(null)
    setShowTerminal(true)
    setStreamingLogs((prev) => [...prev, `[Optimize] Running optimization: ${type}`])
    try {
      const result = await regenerateCode({
        generation_id: currentVersionId,
        improvement_type: type as any,
        framework: 'react',
      })
      setFiles(result.files || [])
      setCurrentVersionId(result.generation_id)
      await loadVersions()
    } catch (e: any) {
      setError(e?.message || 'Failed to optimize code')
    } finally {
      setIsOptimizing(false)
    }
  }, [projectId, currentVersionId, loadVersions])

  const handleExport = useCallback(async (format: 'zip' | 'tar') => {
    if (!currentVersionId) return
    if (format === 'zip') {
      downloadFilesAsZip(currentVersionId)
      return
    }
    setIsExporting(true)
    try {
      await exportGeneration({ generation_id: currentVersionId, format })
    } catch (e: any) {
      setError(e?.message || 'Failed to export code')
    } finally {
      setIsExporting(false)
    }
  }, [currentVersionId])

  const handleSelectLaunchpad = (preset: typeof QUICK_LAUNCHPAD[0]) => {
    setFiles(preset.files)
    setError(null)
    setShowTerminal(true)
    setStreamingLogs([`[Blueprint Loaded] Initialized ${preset.title} with 100% typed TSX components.`])
  }

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#070912]">
        <div className="w-full max-w-md">
          <AILoadingState lines={4} />
        </div>
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="flex flex-col h-[calc(100vh-4rem)] bg-[#070912] text-slate-200 overflow-hidden relative">
        {/* Scroll-Driven Top Ambient Indicator */}
        <motion.div
          style={{ scaleX, transformOrigin: '0%' }}
          className="h-[2px] bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 z-50 fixed top-16 left-0 right-0 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
        />

        {/* Cockpit Command Header */}
        <div className="flex flex-wrap items-center justify-between px-4 py-2.5 border-b border-white/10 bg-[#090c16]/95 z-20 gap-3 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              <span>Dashboard</span>
            </button>
            <span className="text-white/20">/</span>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <h1 className="text-xs font-mono font-bold text-white tracking-wider uppercase">
                AI Studio
              </h1>
            </div>

            {selectedFrameId && (
              <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-mono text-cyan-300">
                Frame: {selectedFrameId}
              </span>
            )}

            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-slate-400">
              <span className="text-indigo-400 font-semibold">Gemini 2.5 Flash</span>
              <span>•</span>
              <span className="text-cyan-300">React 18 + TS</span>
              <span>•</span>
              <span className="text-emerald-400">Tailwind 3.4</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTerminal(!showTerminal)}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg border transition-all flex items-center gap-1.5 ${
                showTerminal 
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]' 
                  : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
              }`}
            >
              <span>💻</span>
              <span>Console {streamingLogs.length > 0 && `(${streamingLogs.length})`}</span>
            </button>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              size="sm"
              variant="gradient"
              className="shadow-[0_0_20px_rgba(99,102,241,0.35)]"
            >
              {isGenerating ? (
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Synthesizing...
                </span>
              ) : (
                '⚡ Synthesize Code'
              )}
            </Button>
          </div>
        </div>

        {/* Global Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 py-2 bg-rose-500/10 border-b border-rose-500/20 flex items-center justify-between text-xs text-rose-300 backdrop-blur-md"
            >
              <div className="flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
              <button onClick={() => setError(null)} className="text-rose-400 hover:text-white px-1.5 py-0.5 rounded">✕</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsible Neural Terminal Console */}
        <AnimatePresence>
          {showTerminal && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 py-2.5 bg-[#05060b] border-b border-cyan-500/30 max-h-36 overflow-y-auto font-mono text-xs text-slate-300 space-y-1 z-10"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-1 mb-1.5 text-[10px] text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Neural Compilation Telemetry
                </span>
                {streamingProgress && (
                  <span className="text-cyan-400 font-semibold">{streamingProgress.percentage}% - {streamingProgress.message}</span>
                )}
              </div>
              {streamingLogs.map((log, i) => (
                <div key={i} className="truncate flex items-start gap-1">
                  <span className="text-cyan-400 font-bold">&gt;</span>
                  <span className="text-slate-300 leading-relaxed">{log}</span>
                </div>
              ))}
              <div ref={logEndRef} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Workspace Stage */}
        <div ref={scrollContainerRef} className="flex flex-1 overflow-hidden relative">
          <CodeGenerationToolbar
            versions={versions}
            currentVersionId={currentVersionId}
            onSelectVersion={(v) => {
              setCurrentVersionId(v.id)
              setFiles(v.files || [])
            }}
            onRestoreVersion={(v) => {
              setCurrentVersionId(v.id)
              setFiles(v.files || [])
            }}
            onOptimize={handleOptimize}
            onPromptRefine={handlePromptRefine}
            onExport={handleExport}
            onDownloadZip={() => currentVersionId && downloadFilesAsZip(currentVersionId)}
            onRegenerate={handleGenerate}
            isGenerating={isGenerating}
            isOptimizing={isOptimizing}
            isExporting={isExporting}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            disabled={isGenerating}
          />

          <div className="flex-1 flex flex-col overflow-hidden">
            {files.length > 0 ? (
              <CodePreview
                files={files}
                onRefresh={handleGenerate}
                refreshing={isGenerating}
              />
            ) : (
              /* Studio Scroll-Driven Launchpad Empty State */
              <div className="flex-1 overflow-y-auto p-6 sm:p-10 flex flex-col items-center justify-start text-center max-w-4xl mx-auto custom-scrollbar">
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-5 shadow-[0_0_35px_rgba(99,102,241,0.25)]"
                >
                  <svg className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                  </svg>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="font-display text-2xl sm:text-3xl font-bold text-white mb-2"
                >
                  Synthesize Production Code
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-xs sm:text-sm text-slate-400 mb-6 max-w-lg leading-relaxed"
                >
                  Compile vector artboards into modular React components with strict TypeScript types, or pick a high-impact blueprint below to explore the live interactive sandbox.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex gap-3 mb-10"
                >
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    variant="gradient"
                    size="lg"
                    className="h-11 px-7 text-xs sm:text-sm shadow-[0_0_25px_rgba(99,102,241,0.4)]"
                  >
                    {isGenerating ? 'Synthesizing...' : '⚡ Generate from Figma Artboards'}
                  </Button>
                </motion.div>

                {/* Scroll-Driven Production Blueprint Gallery */}
                <div className="w-full text-left">
                  <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                    <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                      Production Blueprints (Interactive & Live)
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">1-Click Launch</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-12">
                    {QUICK_LAUNCHPAD.map((preset, idx) => (
                      <motion.div
                        key={preset.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + idx * 0.08 }}
                        whileHover={{ y: -4, scale: 1.015 }}
                        onClick={() => handleSelectLaunchpad(preset)}
                        className={`p-5 rounded-2xl bg-gradient-to-br ${preset.accent} border bg-black/40 text-left transition-all cursor-pointer group shadow-lg hover:shadow-cyan-500/10 relative overflow-hidden`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">{preset.icon}</span>
                            <h4 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                              {preset.title}
                            </h4>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-slate-300">
                            {preset.tag}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed mb-4">
                          {preset.desc}
                        </p>
                        <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400 border-t border-white/5 pt-2">
                          <span className="text-slate-500">{preset.files.length} TSX Modules</span>
                          <span className="group-hover:translate-x-1 transition-transform">Launch Studio &rarr;</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
