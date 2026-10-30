import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../ui/Button'
import Footer from '../layout/Footer'
import InteractiveStudioDeck from '../ui/InteractiveStudioDeck'
import { TECH_STACK } from './constants'

// ============================================================================
// PRESET ARTBOARDS
// ============================================================================
const SAMPLE_PRESETS = [
  {
    id: 'telemetry',
    name: 'SaaS Telemetry Dashboard',
    url: 'https://www.figma.com/design/sample-saas-telemetry-dashboard',
    tags: ['React 19', 'Tailwind v4', 'Sparklines'],
    badge: 'Trending',
  },
  {
    id: 'crypto',
    name: 'Web3 Wallet Cockpit',
    url: 'https://www.figma.com/design/sample-web3-wallet-cockpit',
    tags: ['Lucide Icons', 'Gradients', 'Dark Mode'],
    badge: 'Popular',
  },
  {
    id: 'checkout',
    name: 'E-Commerce Drawer Modal',
    url: 'https://www.figma.com/design/sample-mobile-checkout-sheet',
    tags: ['Form Controls', 'Responsive', 'Validation'],
    badge: 'Mobile First',
  },
]

// ============================================================================
// REAL INDUSTRY & CAMPUS ENDORSEMENTS
// ============================================================================
const INDUSTRY_TESTIMONIALS = [
  {
    name: 'Dr. Sri Ram',
    initials: 'SR',
    avatarGradient: 'from-amber-500 to-orange-600',
    role: 'Head of Training & Placement (T&P)',
    company: 'Vellore Institute of Technology (VIT)',
    badge: 'Campus Placements & Academics',
    verified: 'Verified Placement HOD',
    metric: '120+ Student Portfolios Accelerated',
    text: 'During campus placement drives and national hackathons, our engineering students always had great Figma UI designs but struggled to convert them into production-ready web applications before technical evaluations. We introduced Designify AI in our campus innovation lab, and the results were exceptional: students turned complex Figma prototypes into clean React 19 codebases with strict TypeScript in under an hour. Tech interviewers from top product companies specifically noted the code quality and semantic architecture during portfolio reviews.',
  },
  {
    name: 'Kartik Mehta',
    initials: 'KM',
    avatarGradient: 'from-cyan-500 to-blue-600',
    role: 'Senior AI Engineer & GenAI Architect',
    company: 'NeuralMesh AI Labs',
    badge: 'Multimodal Vision & GenAI',
    verified: 'Verified AI Specialist',
    metric: 'Sub-340ms AST Decomposition',
    text: 'Most generative AI code tools produce hallucinated CSS and horrific absolute-positioned "div soup" because standard LLMs lack spatial geometric reasoning. What Namandip engineered with Gemini 2.5 Flash multimodal AST parsing is genuinely impressive: it cross-references visual bounding boxes with Figma\'s vector tree to resolve true flexbox layouts, CSS grids, and design tokens without prompt drift. It is one of the few generative AI tools that actually understands design intent.',
  },
  {
    name: 'Siddharth Menon',
    initials: 'SM',
    avatarGradient: 'from-indigo-500 to-purple-600',
    role: 'Staff Frontend & Full-Stack Engineer',
    company: 'FinTech Cloud Infrastructure',
    badge: 'Production Engineering',
    verified: 'Verified Staff Engineer',
    metric: '60% Sprint Slicing Time Saved',
    text: 'Historically, our frontend sprints were bottlenecked by 2 to 3 days of tedious Figma-to-code slicing, extracting tokens, and writing boilerplate interfaces. Designify AI produces JSX that looks like an experienced senior engineer wrote it—clean typed prop interfaces, semantic HTML5, zero CSS collisions, and pure Tailwind classes. We dropped the synthesized components straight into our Vite repository with zero refactoring needed.',
  },
]

// ============================================================================
// AST TOKEN DEFINITIONS FOR CARD 1 BENTO
// ============================================================================
const AST_TOKENS = [
  {
    token: 'flex-row justify-between',
    type: 'Layout Flexbox',
    css: 'display: flex; flex-direction: row; justify-content: space-between; align-items: center;',
    ast: 'Node(type="FRAME", layoutMode="HORIZONTAL", primaryAlign="SPACE_BETWEEN")',
  },
  {
    token: 'grid-cols-2 md:grid-cols-4',
    type: 'Responsive Grid',
    css: 'display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); @media (min-width: 768px) { repeat(4, 1fr); }',
    ast: 'Node(type="FRAME", layoutGrids=[Grid(pattern="COLUMNS", count=4)])',
  },
  {
    token: 'backdrop-blur-2xl',
    type: 'Surface Glassmorphism',
    css: 'backdrop-filter: blur(40px); background: rgba(13, 18, 34, 0.85);',
    ast: 'Node(type="RECTANGLE", effect=[Blur(type="BACKGROUND", radius=40)])',
  },
  {
    token: 'rounded-3xl border-indigo-500/30',
    type: 'Border Geometry',
    css: 'border-radius: 24px; border: 1px solid rgba(99, 102, 241, 0.3);',
    ast: 'Node(cornerRadius=24, strokes=[Paint(color="#6366f1", opacity=0.3)])',
  },
  {
    token: 'hover:scale-[1.02] active:scale-[0.98]',
    type: 'Spring Interaction',
    css: 'transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1); &:hover { transform: scale(1.02); }',
    ast: 'Interaction(trigger="ON_HOVER", action=NODE_HOVER_VARIANT)',
  },
]

// ============================================================================
// HOW IT WORKS PIPELINE STAGES
// ============================================================================
const PIPELINE_STAGES = [
  {
    step: '01',
    engine: 'Figma REST API v1',
    title: 'Vector & Node Tree Ingestion',
    headline: 'Native Document Traversal & Asset Resolution',
    subtext:
      'Connects securely via Figma REST API, traverses the document scene graph, extracts auto-layout constraints, resolves color variables, and pulls vector assets directly as optimized SVGs.',
    latency: '~120ms',
    inputDesc: 'Public Figma URL or Personal Access Token',
    processDesc: 'Scene Graph Parsing & Token Resolution',
    outputDesc: 'FigmaNodeTree + design-tokens.json',
    codeSnippet: `{
  "document": {
    "id": "0:1",
    "name": "HeroMetricCard",
    "type": "FRAME",
    "layoutMode": "HORIZONTAL",
    "itemSpacing": 16,
    "paddingLeft": 24,
    "paddingRight": 24,
    "fills": [{ "type": "SOLID", "color": { "r": 0.05, "g": 0.07, "b": 0.13 } }]
  }
}`,
  },
  {
    step: '02',
    engine: 'Google Gemini 2.5 Flash Vision',
    title: 'Multimodal Spatial Reasoning',
    headline: 'Visual & Structural Cross-Referencing',
    subtext:
      'Gemini 2.5 Flash simultaneously examines high-resolution raster artboards and structural node coordinates. It infers semantic HTML elements (<nav>, <article>, <button>) and resolves complex nested flexbox rules.',
    latency: '~340ms',
    inputDesc: 'Figma Node Tree + High-Res Canvas Rendering',
    processDesc: 'Spatial Layout Analysis & Semantic Disambiguation',
    outputDesc: 'Normalized Component AST (Abstract Syntax Tree)',
    codeSnippet: `{
  "ast_version": "2.5",
  "component": "HeroMetricCard",
  "semantic_tag": "article",
  "layout": { "display": "flex", "direction": "row", "align": "center" },
  "children": [
    { "type": "Text", "semantic": "h3", "content": "1,420 Components" },
    { "type": "Badge", "semantic": "span", "variant": "emerald" },
    { "type": "Sparkline", "semantic": "svg", "points": [40, 65, 80, 100] }
  ]
}`,
  },
  {
    step: '03',
    engine: 'FastAPI Async Pipeline (SSE)',
    title: 'Streaming Component Synthesis',
    headline: 'Type-Safe React 19 & Tailwind CSS Compilation',
    subtext:
      'Our high-throughput Python backend compiles the AST into clean TypeScript code. Tokens stream in real time via Server-Sent Events, formatting clean JSX, strictly typed props, and zero bloated div soups.',
    latency: '~410ms',
    inputDesc: 'Component AST + Token Mappings',
    processDesc: 'Tailwind Class Optimization & TypeScript Verification',
    outputDesc: 'Production HeroMetricCard.tsx Module',
    codeSnippet: `import React from 'react';

export interface HeroMetricCardProps {
  title?: string;
  count?: number;
}

export function HeroMetricCard({ title = "Telemetry", count = 1420 }: HeroMetricCardProps) {
  return (
    <article className="p-6 rounded-3xl bg-slate-900/90 border border-indigo-500/30">
      <h3 className="text-2xl font-bold text-white">{count} Components</h3>
      <span className="text-xs font-mono text-cyan-400">{title}</span>
    </article>
  );
}`,
  },
  {
    step: '04',
    engine: 'In-Browser Hot Reload & Bundler',
    title: 'Live Sandbox & Developer Delivery',
    headline: 'Interactive Sandbox & One-Click Git Export',
    subtext:
      'The generated component mounts immediately in an isolated client sandbox with hot reload. Verify hover states, toggle dark/light themes, adjust props, and export a full Vite project ZIP or GitHub pull request.',
    latency: 'Instant (<50ms)',
    inputDesc: 'Compiled React 19 TSX + Tailwind Config',
    processDesc: 'Client Sandbox Hot-Mount & Prop Binding',
    outputDesc: 'Full Vite Project ZIP or Direct Git Commit',
    codeSnippet: `// Terminal: Instant Ready-to-Run Project
$ npx vite dev
  VITE v6.0.0  ready in 142 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ✓  HeroMetricCard.tsx mounted with 0 warnings
  ✓  Tailwind v4 styles compiled (4.2kb)`,
  },
]

// ============================================================================
// CODE SHOWCASE TABS
// ============================================================================
const CODE_SHOWCASE_TABS = [
  {
    id: 'component',
    filename: 'HeroMetricCard.tsx',
    badge: 'TSX • 340ms',
    code: `import React, { useState } from 'react';
import { motion } from 'framer-motion';

export interface HeroMetricCardProps {
  title?: string;
  count?: number;
  accuracy?: string;
}

export function HeroMetricCard({
  title = "Neural Synthesis",
  count = 1420,
  accuracy = "99.4% TSX",
}: HeroMetricCardProps) {
  const [range, setRange] = useState<'7D' | '30D' | '90D'>('30D');

  return (
    <div className="relative p-6 rounded-3xl bg-slate-900/90 border border-indigo-500/30 backdrop-blur-2xl shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">{title}</span>
          <h3 className="text-2xl font-bold text-white mt-1 font-display">{count} Components</h3>
        </div>
        <span className="px-2.5 py-1 text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 rounded-full border border-emerald-500/20">
          {accuracy}
        </span>
      </div>

      <div className="flex rounded-xl bg-white/5 p-1 border border-white/10 mb-4">
        {(['7D', '30D', '90D'] as const).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={\`flex-1 py-1 text-xs font-mono rounded-lg transition-all \${
              range === r ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }\`}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="h-16 flex items-end gap-1.5 pt-2">
        {[40, 65, 45, 80, 55, 95, 75, 100].map((h, i) => (
          <div key={i} className="flex-1 bg-gradient-to-t from-indigo-600 to-cyan-400 rounded-t" style={{ height: \`\${h}%\` }} />
        ))}
      </div>
    </div>
  );
}`,
  },
  {
    id: 'app',
    filename: 'App.tsx',
    badge: 'React 19 Root',
    code: `import React from 'react';
import { HeroMetricCard } from './components/HeroMetricCard';

export default function App() {
  return (
    <main className="min-h-screen bg-[#070912] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <HeroMetricCard />
      </div>
    </main>
  );
}`,
  },
  {
    id: 'tokens',
    filename: 'design-tokens.json',
    badge: 'Figma Tokens',
    code: `{
  "color": {
    "background": "#070912",
    "surface": "#0d1222",
    "primary": "#6366f1",
    "accent": "#06b6d4",
    "success": "#10b981"
  },
  "spacing": {
    "card-padding": "24px",
    "element-gap": "16px",
    "radius-outer": "24px",
    "radius-inner": "12px"
  },
  "typography": {
    "font-display": "Space Grotesk, sans-serif",
    "font-mono": "JetBrains Mono, monospace"
  }
}`,
  },
  {
    id: 'tailwind',
    filename: 'tailwind.config.ts',
    badge: 'Config',
    code: `import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#070912',
        sapphire: '#0d1222',
        cyanGlow: '#22d3ee',
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;`,
  },
]

export const PostStorySections: React.FC = () => {
  const navigate = useNavigate()
  const { token } = useAuth()

  // State for Code Showcase
  const [activeTabId, setActiveTabId] = useState('component')
  const [copiedShowcase, setCopiedShowcase] = useState(false)

  // State for Features Bento interactive items
  const [selectedTokenIndex, setSelectedTokenIndex] = useState(0)
  const [simViewport, setSimViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [exportFeedback, setExportFeedback] = useState<string | null>(null)

  // State for How It Works interactive tabs
  const [activePipelineStep, setActivePipelineStep] = useState(0)

  // State for Demo URL
  const [demoUrl, setDemoUrl] = useState('')

  const activeTab = CODE_SHOWCASE_TABS.find((t) => t.id === activeTabId) || CODE_SHOWCASE_TABS[0]
  const currentToken = AST_TOKENS[selectedTokenIndex]
  const currentPipelineStage = PIPELINE_STAGES[activePipelineStep]

  const handleLaunch = () => {
    if (demoUrl.trim()) {
      sessionStorage.setItem('figmaUrl', demoUrl.trim())
    }
    navigate(token ? '/dashboard' : '/auth')
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeTab.code)
    setCopiedShowcase(true)
    setTimeout(() => setCopiedShowcase(false), 2000)
  }

  const triggerExportDemo = (label: string) => {
    setExportFeedback(label)
    setTimeout(() => setExportFeedback(null), 2500)
  }

  return (
    <div className="relative w-full bg-[#070912] text-white select-auto z-20">
      {/* ===================================================================== */}
      {/* 1. SECTION: #preview (Interactive Live Studio Deck & Playground)       */}
      {/* ===================================================================== */}
      <section
        id="preview"
        className="scroll-mt-24 pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10"
      >
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-cyan-300 mb-3 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
            <span>Interactive Cockpit • Live Preview & Sandbox</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-display text-white tracking-tight leading-tight">
            Instant Design-to-Code Preview
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Interact with live generated UI components, toggle between visual and code modes, inspect extracted tokens, or test your custom Figma frame.
          </p>
        </div>

        {/* Embedded Interactive Studio Deck */}
        <div className="mb-12">
          <InteractiveStudioDeck />
        </div>

        {/* Quick Launchpad Presets Card */}
        <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl bg-[#0d1222]/90 border border-indigo-500/30 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <span>⚡</span> Synthesize Your Custom Artboard
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Paste any public Figma frame URL to trigger full AST parsing and TSX code generation.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Gemini 2.5 Flash Online
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="url"
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
              placeholder="https://www.figma.com/design/..."
              className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-white/15 text-white text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
            <Button
              variant="gradient"
              onClick={handleLaunch}
              className="h-11 px-6 text-sm font-semibold rounded-xl whitespace-nowrap shadow-[0_0_20px_rgba(99,102,241,0.5)] cursor-pointer"
            >
              Synthesize Code &rarr;
            </Button>
          </div>

          {/* Quick Design Presets */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <span className="text-xs font-mono text-slate-400 block mb-3">
              Or pick an instant design template to test:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SAMPLE_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setDemoUrl(p.url)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    demoUrl === p.url
                      ? 'bg-indigo-600/20 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold text-white">{p.name}</p>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-cyan-300 border border-indigo-500/30">
                      {p.badge}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {p.tags.map((t) => (
                      <span key={t} className="text-[9px] font-mono text-slate-400 bg-black/40 px-1.5 py-0.5 rounded">
                        {t}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Micro-Metrics Bar */}
          <div className="mt-6 pt-4 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-2 rounded-xl bg-white/[0.02]">
              <span className="text-xs font-mono font-bold text-cyan-300">~340ms</span>
              <p className="text-[10px] text-slate-400 mt-0.5">AST Parsing Latency</p>
            </div>
            <div className="p-2 rounded-xl bg-white/[0.02]">
              <span className="text-xs font-mono font-bold text-emerald-400">99.4%</span>
              <p className="text-[10px] text-slate-400 mt-0.5">JSX Semantic Fidelity</p>
            </div>
            <div className="p-2 rounded-xl bg-white/[0.02]">
              <span className="text-xs font-mono font-bold text-indigo-400">Zero Soup</span>
              <p className="text-[10px] text-slate-400 mt-0.5">Pure Tailwind & TSX</p>
            </div>
            <div className="p-2 rounded-xl bg-white/[0.02]">
              <span className="text-xs font-mono font-bold text-purple-400">React 19</span>
              <p className="text-[10px] text-slate-400 mt-0.5">Modern Standard</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 2. SECTION: #features (6-Card Cyber Bento Grid)                       */}
      {/* ===================================================================== */}
      <section
        id="features"
        className="scroll-mt-24 py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10"
      >
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-mono text-indigo-300 mb-3 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
            <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
            <span>Core Capabilities • Bento Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-display text-white tracking-tight leading-tight">
            Engineered for Production Precision
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            From raw Figma node trees to maintainable, strictly typed React 19 codebases with zero manual coordinate cleanup.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Multimodal Spatial Vision Engine (2 Columns) */}
          <div className="md:col-span-2 p-6 sm:p-8 rounded-3xl bg-[#0c1022] border border-indigo-500/30 hover:border-indigo-400/50 transition-all shadow-xl flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-medium text-cyan-300 bg-cyan-500/10 border border-cyan-500/20">
                  Gemini 2.5 Flash • 340ms Latency
                </span>
                <span className="text-xs font-mono text-slate-500">AST Engine</span>
              </div>
              <h3 className="text-2xl font-bold font-display text-white mb-2">
                Sub-Second Spatial Layout Decomposition
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                Google Gemini 2.5 Flash analyzes exact pixel bounds, typography hierarchies, flex rows, nested CSS grids, and interactive bounds without manual layer naming or coordinate drift.
              </p>
            </div>

            {/* Interactive AST Token Inspector */}
            <div className="mt-6 pt-5 border-t border-white/10">
              <span className="text-xs font-mono text-slate-400 block mb-2">
                Interactive Layout Token Inspector (click to inspect extracted CSS):
              </span>
              <div className="flex flex-wrap gap-2 mb-4">
                {AST_TOKENS.map((item, idx) => (
                  <button
                    key={item.token}
                    onClick={() => setSelectedTokenIndex(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                      selectedTokenIndex === idx
                        ? 'bg-indigo-600 text-white font-semibold shadow-[0_0_12px_rgba(99,102,241,0.5)] border border-cyan-400/40'
                        : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {item.token}
                  </button>
                ))}
              </div>

              {/* Token Detail View */}
              <div className="p-4 rounded-xl bg-black/60 border border-white/10 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-slate-400 text-[11px]">
                  <span>AST Classification: <strong className="text-cyan-300">{currentToken.type}</strong></span>
                  <span className="text-emerald-400">✓ Parsed in ~24ms</span>
                </div>
                <div className="space-y-1.5 text-slate-300">
                  <p><span className="text-indigo-400">Generated CSS:</span> {currentToken.css}</p>
                  <p><span className="text-violet-400">Resolved AST:</span> {currentToken.ast}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Zero-Plugin Figma REST Sync */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0c1022] border border-white/10 hover:border-cyan-500/40 transition-all shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/20">
                  Official Figma REST
                </span>
                <span className="text-xs font-mono text-slate-500">API v1</span>
              </div>
              <h3 className="text-xl font-bold font-display text-white mb-2">
                Native Vector & Token Ingestion
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Direct integration with official Figma REST APIs. Extracts SVGs, linear & radial gradients, color variables, spacing tokens, and typography definitions seamlessly.
              </p>
            </div>

            {/* Visual Node Tree */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-white/10 font-mono text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-indigo-400">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                <span>FRAME: HeroDashboard</span>
              </div>
              <div className="flex items-center gap-2 text-cyan-300 pl-3">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                <span>AUTOLAYOUT: StatMetrics</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 pl-6">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>VECTOR: Sparkline.svg</span>
              </div>
              <div className="flex items-center gap-2 text-purple-400 pl-6">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                <span>COMPONENT: CTAButton</span>
              </div>
            </div>
          </div>

          {/* Card 3: Idiomatic React 19 & TypeScript */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0c1022] border border-white/10 hover:border-indigo-500/40 transition-all shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-500/20">
                  Zero DIV Soup
                </span>
                <span className="text-xs font-mono text-slate-500">Strict Typing</span>
              </div>
              <h3 className="text-xl font-bold font-display text-white mb-2">
                Type-Safe, Semantic Components
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                No messy absolute positioned div soups. Emits clean TypeScript interfaces, semantic HTML5 (<code className="text-cyan-300">&lt;article&gt;</code>, <code className="text-cyan-300">&lt;nav&gt;</code>, <code className="text-cyan-300">&lt;button&gt;</code>), and responsive Tailwind CSS classes.
              </p>
            </div>

            {/* Code interface snippet */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-white/10 font-mono text-[11px] text-slate-300 space-y-1">
              <p className="text-indigo-400">export interface HeroCardProps {'{'}</p>
              <p className="pl-3 text-slate-400">title?: <span className="text-cyan-300">string</span>;</p>
              <p className="pl-3 text-slate-400">count?: <span className="text-cyan-300">number</span>;</p>
              <p className="pl-3 text-slate-400">onAction?: () =&gt; <span className="text-cyan-300">void</span>;</p>
              <p className="text-indigo-400">{'}'}</p>
            </div>
          </div>

          {/* Card 4: In-Browser Hot Reload Sandbox */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0c1022] border border-white/10 hover:border-emerald-500/40 transition-all shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                  Live Sandbox
                </span>
                <span className="text-xs font-mono text-slate-500">Responsive Test</span>
              </div>
              <h3 className="text-xl font-bold font-display text-white mb-2">
                Interactive Viewport Simulator
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Preview your generated components instantly with responsive device presets and live prop controls.
              </p>
            </div>

            {/* Interactive Viewport Switcher */}
            <div className="space-y-3">
              <div className="flex items-center rounded-lg bg-black/60 p-1 border border-white/10 text-xs">
                {(['desktop', 'tablet', 'mobile'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setSimViewport(mode)}
                    className={`flex-1 py-1.5 rounded text-[11px] font-mono capitalize transition-all cursor-pointer ${
                      simViewport === mode
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {/* Viewport Simulation Visual */}
              <div className="p-3 rounded-xl bg-slate-950 border border-white/10 text-center text-xs font-mono">
                <span className="text-slate-400 block text-[10px] mb-1">Simulated Breakpoint:</span>
                <span className="text-emerald-400 font-bold">
                  {simViewport === 'desktop' && '1440px • Full Desktop Canvas'}
                  {simViewport === 'tablet' && '768px • Tablet Split Layout'}
                  {simViewport === 'mobile' && '375px • Mobile Fluid Stack'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 5: Conversational AI Refinement */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0c1022] border border-white/10 hover:border-purple-500/40 transition-all shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-medium text-purple-300 bg-purple-500/10 border border-purple-500/20">
                  Multi-Turn Chat Studio
                </span>
                <span className="text-xs font-mono text-slate-500">Zero Prompt Loss</span>
              </div>
              <h3 className="text-xl font-bold font-display text-white mb-2">
                Conversational Code Iteration
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Refine components via natural conversation: "Add Framer Motion spring physics on hover", "Make background obsidian black", or "Extract props interface".
              </p>
            </div>

            {/* Chat Mock */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-white/10 text-xs space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded shrink-0">YOU</span>
                <p className="text-slate-300 text-[11px]">"Add cyan glow sparklines and rounded-3xl borders."</p>
              </div>
              <div className="flex items-start gap-2 pt-1 border-t border-white/5">
                <span className="text-[10px] font-mono text-purple-300 bg-purple-500/10 px-1.5 py-0.5 rounded shrink-0">AI</span>
                <p className="text-emerald-400 text-[11px] font-mono">+ Updated 3 classes • Diff applied</p>
              </div>
            </div>
          </div>

          {/* Card 6: 1-Click Multi-Format Export (2 Columns) */}
          <div className="md:col-span-2 p-6 sm:p-8 rounded-3xl bg-[#0c1022] border border-indigo-500/30 hover:border-cyan-500/40 transition-all shadow-xl flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-medium text-cyan-300 bg-cyan-500/10 border border-cyan-500/20">
                  Developer Ready
                </span>
                <h3 className="text-2xl font-bold font-display text-white mt-2">
                  Production Bundling & 1-Click Git Export
                </h3>
              </div>
              {exportFeedback && (
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 animate-fade-in">
                  ✓ {exportFeedback} Ready
                </span>
              )}
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-6 max-w-2xl">
              Export ready-to-run Vite projects with TSX, Tailwind configuration, SVG assets, and package.json, or copy individual modular component files directly to your clipboard.
            </p>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => triggerExportDemo('Vite + React 19 ZIP')}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/50 text-left transition-all cursor-pointer"
              >
                <span className="text-xs font-mono text-cyan-300 block mb-0.5">📦 Full ZIP</span>
                <span className="text-[11px] text-slate-400">Vite + React 19 Bundle</span>
              </button>
              <button
                onClick={() => triggerExportDemo('Single .TSX Module')}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/50 text-left transition-all cursor-pointer"
              >
                <span className="text-xs font-mono text-indigo-300 block mb-0.5">📄 Single TSX</span>
                <span className="text-[11px] text-slate-400">Standalone Component</span>
              </button>
              <button
                onClick={() => triggerExportDemo('design-tokens.json')}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/50 text-left transition-all cursor-pointer"
              >
                <span className="text-xs font-mono text-purple-300 block mb-0.5">🎨 Tokens</span>
                <span className="text-[11px] text-slate-400">JSON Design System</span>
              </button>
              <button
                onClick={() => triggerExportDemo('GitHub Direct Push')}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/50 text-left transition-all cursor-pointer"
              >
                <span className="text-xs font-mono text-emerald-300 block mb-0.5">🐙 Git Push</span>
                <span className="text-[11px] text-slate-400">Direct Commit to Branch</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 3. SECTION: #how-it-works (Interactive 4-Step Synthesis Pipeline)     */}
      {/* ===================================================================== */}
      <section
        id="how-it-works"
        className="scroll-mt-24 py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10"
      >
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-mono text-violet-300 mb-3 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
            <span className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
            <span>Four-Step Workflow • Sub-Second Synthesis</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-display text-white tracking-tight leading-tight">
            How Designify AI Synthesizes Code
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            A transparent, sub-second execution pipeline from raw canvas pixels to clean, deployable code.
          </p>
        </div>

        {/* Pipeline Step Selector Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {PIPELINE_STAGES.map((s, idx) => (
            <button
              key={s.step}
              onClick={() => setActivePipelineStep(idx)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                activePipelineStep === idx
                  ? 'bg-indigo-600/20 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.25)]'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div>
                <span className="text-xs font-mono text-cyan-400 block mb-1">
                  Step {s.step}
                </span>
                <h4 className="text-sm font-bold text-white font-display">
                  {s.title}
                </h4>
              </div>
              <span className="text-[10px] font-mono text-slate-400 mt-3 pt-2 border-t border-white/5 block">
                {s.latency}
              </span>
            </button>
          ))}
        </div>

        {/* Active Stage Detailed Breakdown Panel */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0c1022] border border-indigo-500/30 backdrop-blur-xl shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Stage Explanation & Specs */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-medium text-cyan-300 bg-cyan-500/10 border border-cyan-500/20">
                  {currentPipelineStage.engine}
                </span>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Latency: {currentPipelineStage.latency}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
                {currentPipelineStage.headline}
              </h3>

              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                {currentPipelineStage.subtext}
              </p>

              {/* Input / Processing / Output Metrics */}
              <div className="pt-4 space-y-2.5 border-t border-white/10 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 w-24 shrink-0">Input:</span>
                  <span className="text-cyan-300">{currentPipelineStage.inputDesc}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 w-24 shrink-0">Processing:</span>
                  <span className="text-indigo-300">{currentPipelineStage.processDesc}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 w-24 shrink-0">Output:</span>
                  <span className="text-emerald-300">{currentPipelineStage.outputDesc}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Stage Payload / Code Viewer */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl bg-slate-950 border border-white/10 overflow-hidden shadow-2xl">
                <div className="px-4 py-2.5 bg-slate-900/90 border-b border-white/10 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-cyan-400" />
                    Stage Output Payload
                  </span>
                  <span className="text-[10px] text-cyan-300">Phase {currentPipelineStage.step} of 04</span>
                </div>
                <div className="p-4 font-mono text-xs text-slate-300 overflow-x-auto max-h-[300px] leading-relaxed">
                  <pre>
                    <code>{currentPipelineStage.codeSnippet}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 4. TABBED CODE SHOWCASE                                               */}
      {/* ===================================================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-mono text-indigo-400 uppercase tracking-widest block mb-1">
              Zero Boilerplate
            </span>
            <h2 className="text-3xl font-extrabold font-display text-white">
              Generated Code Output Showcase
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Inspect the exact clean TypeScript components produced by Gemini 2.5 and FastAPI.
            </p>
          </div>
          <button
            onClick={handleCopyCode}
            className="mt-4 md:mt-0 self-start md:self-auto px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-mono text-cyan-300 transition-colors flex items-center gap-2 cursor-pointer"
          >
            {copiedShowcase ? '✓ Copied to Clipboard' : 'Copy File Content'}
          </button>
        </div>

        {/* Code Editor Frame */}
        <div className="rounded-2xl bg-slate-950 border border-white/10 shadow-2xl overflow-hidden">
          {/* Tabs header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-white/10 overflow-x-auto">
            <div className="flex items-center gap-2">
              {CODE_SHOWCASE_TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTabId(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                    activeTabId === t.id
                      ? 'bg-indigo-600 text-white font-semibold shadow'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {t.filename}
                </button>
              ))}
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 whitespace-nowrap">
              {activeTab.badge}
            </span>
          </div>

          {/* Syntax Highlighted Code Viewer */}
          <div className="p-5 font-mono text-xs sm:text-sm text-slate-300 leading-relaxed overflow-x-auto max-h-[460px]">
            <pre className="text-slate-200">
              <code>{activeTab.code}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 5. LOVED BY DEVELOPERS & DESIGNERS (Real Endorsements)                */}
      {/* ===================================================================== */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-cyan-300 mb-3 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
            <span>Real Industry &amp; Campus Endorsements</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-display text-white tracking-tight leading-tight">
            Loved by developers &amp; designers
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Real feedback from engineering placement mentors, AI practitioners, and full-stack software engineers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {INDUSTRY_TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="p-6 sm:p-7 rounded-3xl bg-[#0c1022] border border-white/10 hover:border-indigo-500/40 transition-all shadow-xl flex flex-col justify-between"
            >
              <div>
                {/* Header: Stars + Verified Badge */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 whitespace-nowrap">
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    {t.verified}
                  </span>
                </div>

                {/* Testimonial Quote */}
                <p className="text-sm text-slate-300 leading-relaxed italic mb-6">
                  &ldquo;{t.text}&rdquo;
                </p>
              </div>

              <div>
                {/* Author Info */}
                <div className="pt-4 border-t border-white/10 flex items-center gap-3">
                  <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${t.avatarGradient} flex items-center justify-center font-bold text-white text-sm shadow-md shrink-0`}>
                    {t.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate">{t.name}</p>
                    <p className="text-xs text-cyan-300 font-medium truncate">{t.role}</p>
                    <p className="text-[11px] text-slate-400 truncate">{t.company}</p>
                  </div>
                </div>

                {/* Metric / Category Chip */}
                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400 truncate">{t.badge}</span>
                  <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0 ml-2">
                    {t.metric}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 6. ARCHITECTURE ROW                                                  */}
      {/* ===================================================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest block mb-1">
            System Architecture
          </span>
          <h2 className="text-3xl font-extrabold font-display text-white">
            Engineered for high performance
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            A cohesive stack designed for low-latency code synthesis and production reliability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {TECH_STACK.map((tech) => (
            <div
              key={tech.name}
              className="p-6 rounded-2xl bg-[#0c1020] border border-white/10 hover:border-indigo-500/40 transition-colors shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="text-[10px] font-mono px-2 py-0.5 rounded-full border"
                    style={{
                      borderColor: `${tech.color}40`,
                      backgroundColor: `${tech.color}15`,
                      color: tech.color,
                    }}
                  >
                    {tech.badge}
                  </span>
                </div>
                <h3 className="font-display font-semibold text-base text-white mb-1">{tech.name}</h3>
                <p className="text-xs font-mono text-slate-400 mb-2">{tech.role}</p>
                <p className="text-xs text-slate-300 leading-relaxed">{tech.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 6. FOOTER (Shared across all pages)                                   */}
      {/* ===================================================================== */}
      <Footer />
    </div>
  )
}
