import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

interface PresetItem {
  id: string
  name: string
  icon: string
  tokens: { color: string; font: string; radius: string }
  visual: React.ReactNode
  code: string
}

const PRESETS: PresetItem[] = [
  {
    id: 'analytics',
    name: 'Synthesis Telemetry',
    icon: '⚡',
    tokens: { color: '#6366f1', font: 'Inter 600', radius: '16px' },
    visual: (
      <div className="p-5 rounded-2xl bg-[#0f1424] border border-indigo-500/30 shadow-2xl relative overflow-hidden group">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-cyan-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Components Synthesized</p>
              <h4 className="text-lg font-bold text-white flex items-center gap-1.5">
                1,420 <span className="text-[11px] font-mono font-normal text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">TSX</span>
              </h4>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
            99.4% Fidelity
          </span>
        </div>
        {/* Mock Sparkline Graph */}
        <div className="h-14 w-full flex items-end gap-1.5 pt-2">
          {[40, 65, 45, 80, 55, 90, 75, 100].map((val, idx) => (
            <div key={idx} className="flex-1 bg-indigo-500/20 rounded-t hover:bg-cyan-400 transition-colors h-full flex items-end">
              <div 
                style={{ height: `${val}%` }} 
                className="w-full bg-gradient-to-t from-indigo-600 to-cyan-400 rounded-t"
              />
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-white/5 pt-2">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            AST Latency: ~340ms
          </span>
          <span className="text-cyan-400 font-mono">142 Tokens Parsed</span>
        </div>
      </div>
    ),
    code: `// Generated: SynthesisTelemetryCard.tsx
import React from 'react';

export function SynthesisTelemetryCard() {
  return (
    <div className="p-5 rounded-2xl bg-slate-900/80 border border-indigo-500/30 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-slate-400 font-medium">Components Synthesized</p>
          <h4 className="text-lg font-bold text-white">1,420 TSX</h4>
        </div>
        <span className="px-2 py-0.5 text-xs text-emerald-400 bg-emerald-500/10 rounded-full border border-emerald-500/20">
          99.4% Fidelity
        </span>
      </div>
      <div className="h-14 flex items-end gap-1.5">
        {/* Dynamic Throughput Bars */}
        <div className="flex-1 bg-gradient-to-t from-indigo-600 to-cyan-400 rounded-t h-full" />
      </div>
      <div className="mt-3 flex justify-between text-[11px] text-slate-400 font-mono">
        <span>AST Latency: ~340ms</span>
        <span className="text-cyan-400">142 Tokens</span>
      </div>
    </div>
  );
}`,
  },
  {
    id: 'pricing',
    name: 'Pricing Tier',
    icon: '💳',
    tokens: { color: '#06b6d4', font: 'Space Grotesk', radius: '20px' },
    visual: (
      <div className="p-5 rounded-2xl bg-[#0f1424] border border-cyan-500/30 shadow-2xl relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">Pro Developer</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-indigo-600">POPULAR</span>
        </div>
        <div className="flex items-baseline gap-1 my-3">
          <span className="text-3xl font-extrabold text-white font-display">$29</span>
          <span className="text-xs text-slate-400">/ month</span>
        </div>
        <ul className="space-y-1.5 text-xs text-slate-300 mb-4">
          <li className="flex items-center gap-2">
            <span className="text-cyan-400">✓</span> Unlimited React Code Export
          </li>
          <li className="flex items-center gap-2">
            <span className="text-cyan-400">✓</span> Direct Figma REST Sync
          </li>
          <li className="flex items-center gap-2">
            <span className="text-cyan-400">✓</span> Gemini 2.5 Multi-modal Parser
          </li>
        </ul>
        <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-xs font-semibold hover:opacity-90 shadow-lg transition-all">
          Upgrade to Pro
        </button>
      </div>
    ),
    code: `// Generated: PricingCard.tsx
import React from 'react';

export function PricingCard() {
  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-cyan-500/30 shadow-2xl">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-mono text-cyan-400 text-xs uppercase tracking-wider">Pro Developer</h3>
        <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">POPULAR</span>
      </div>
      <div className="my-3 flex items-baseline gap-1">
        <span className="text-3xl font-bold text-white">$29</span>
        <span className="text-xs text-slate-400">/mo</span>
      </div>
      <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 font-semibold text-white text-xs">
        Upgrade to Pro
      </button>
    </div>
  );
}`,
  },
  {
    id: 'auth',
    name: 'Auth Modal',
    icon: '🔐',
    tokens: { color: '#a855f7', font: 'Inter 500', radius: '16px' },
    visual: (
      <div className="p-5 rounded-2xl bg-[#0f1424] border border-purple-500/30 shadow-2xl">
        <div className="text-center mb-4">
          <h4 className="text-sm font-bold text-white">Welcome back</h4>
          <p className="text-[11px] text-slate-400">Enter your credentials to access workspace</p>
        </div>
        <div className="space-y-2.5">
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Email address</label>
            <div className="h-8 rounded-lg bg-white/5 border border-white/10 px-2.5 flex items-center text-xs text-slate-300">
              developer@designify.ai
            </div>
          </div>
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Password</label>
            <div className="h-8 rounded-lg bg-white/5 border border-white/10 px-2.5 flex items-center text-xs text-slate-500">
              •••••••••••••••
            </div>
          </div>
          <button className="w-full mt-2 py-2 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-500 transition-colors">
            Sign in
          </button>
        </div>
      </div>
    ),
    code: `// Generated: AuthModal.tsx
import React, { useState } from 'react';

export function AuthModal() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-purple-500/30 shadow-2xl">
      <h4 className="text-sm font-bold text-white text-center">Welcome back</h4>
      <form className="mt-4 space-y-3">
        <input 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white" 
        />
        <button type="submit" className="w-full py-2 rounded-lg bg-indigo-600 text-white text-xs font-medium">
          Sign In
        </button>
      </form>
    </div>
  );
}`,
  },
]

export default function InteractiveStudioDeck() {
  const navigate = useNavigate()
  const { token } = useAuth()
  const [activePreset, setActivePreset] = useState<PresetItem>(PRESETS[0])
  const [viewMode, setViewMode] = useState<'split' | 'code' | 'preview'>('split')
  const [copied, setCopied] = useState(false)
  const [figmaInput, setFigmaInput] = useState('')

  const handleCopy = () => {
    navigator.clipboard.writeText(activePreset.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (figmaInput.trim()) {
      sessionStorage.setItem('figmaUrl', figmaInput.trim())
      navigate(token ? '/dashboard' : '/auth')
    }
  }

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-[#0b0e18]/90 backdrop-blur-2xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden">
      {/* Studio Top Chrome Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 border-b border-white/10 bg-[#080b14]/95 gap-3">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-500/80" />
            <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
            <span className="h-3 w-3 rounded-full bg-green-500/80" />
          </div>
          <span className="text-xs font-mono text-slate-400 ml-2 hidden sm:inline">
            Designify AI Studio
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/20">
            AST v1.2
          </span>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center rounded-lg bg-white/5 p-1 border border-white/10">
          <button
            onClick={() => setViewMode('split')}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              viewMode === 'split' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Split View
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              viewMode === 'preview' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Visual UI
          </button>
          <button
            onClick={() => setViewMode('code')}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              viewMode === 'code' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            JSX Code
          </button>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            {copied ? (
              <>
                <span className="text-emerald-400">✓</span> Copied
              </>
            ) : (
              <>
                <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy TSX
              </>
            )}
          </button>
          <button
            onClick={() => navigate(token ? '/dashboard' : '/auth')}
            className="px-3 py-1 rounded-lg text-xs font-medium bg-gradient-to-r from-indigo-500 to-cyan-500 text-white hover:opacity-90 transition-opacity"
          >
            Open in Studio &rarr;
          </button>
        </div>
      </div>

      {/* Preset Selector Bar */}
      <div className="px-4 py-2.5 bg-white/[0.02] border-b border-white/5 flex items-center justify-between overflow-x-auto gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Preset Demos:</span>
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setActivePreset(preset)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activePreset.id === preset.id
                  ? 'bg-indigo-500/20 border border-indigo-500/40 text-cyan-300'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <span>{preset.icon}</span>
              <span>{preset.name}</span>
            </button>
          ))}
        </div>

        {/* Token Chips */}
        <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
            Accent: <strong style={{ color: activePreset.tokens.color }}>{activePreset.tokens.color}</strong>
          </span>
          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
            Font: {activePreset.tokens.font}
          </span>
          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
            Radius: {activePreset.tokens.radius}
          </span>
        </div>
      </div>

      {/* Main Studio Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px]">
        {/* Left Side: Visual Design Canvas */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div className={`${viewMode === 'split' ? 'lg:col-span-5' : 'lg:col-span-12'} p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 bg-[#080b15]/60 relative`}>
            {/* Figma-style Coordinate HUD */}
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-4">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                Figma Frame Selection
              </span>
              <span className="text-slate-400">w: 380px · h: 240px</span>
            </div>

            {/* Rendered Visual Card */}
            <div className="my-auto py-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePreset.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="max-w-md mx-auto"
                >
                  {activePreset.visual}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Design Token Inspector Pill */}
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 font-mono text-indigo-300">
                <svg className="h-3.5 w-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Auto-layout Detected
              </span>
              <span className="font-mono text-cyan-400">AST Hierarchy Valid</span>
            </div>
          </div>
        )}

        {/* Right Side: Generated Code Editor */}
        {(viewMode === 'split' || viewMode === 'code') && (
          <div className={`${viewMode === 'split' ? 'lg:col-span-7' : 'lg:col-span-12'} bg-[#070912] flex flex-col`}>
            {/* Editor File Tabs */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-black/40 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 bg-white/5 px-2.5 py-1 rounded border border-white/10 flex items-center gap-1.5">
                  <span className="text-blue-400 font-bold">TSX</span> Component.tsx
                </span>
                <span className="text-slate-400 hover:text-slate-300 px-2 py-1 cursor-pointer">
                  tailwind.config.js
                </span>
              </div>
              <span className="text-[10px] text-slate-400">React 18 + Tailwind CSS</span>
            </div>

            {/* Syntax Code Display */}
            <div className="p-4 sm:p-6 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed flex-1 flex flex-col justify-between">
              <pre className="no-scrollbar">
                <code>{activePreset.code}</code>
              </pre>

              <div className="mt-6 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                <span>Production Ready • Clean Component Architecture</span>
                <span className="text-cyan-400 font-mono">Zero Dependencies Required</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Quick Test URL Input */}
      <div className="px-6 py-4 border-t border-white/10 bg-[#090c16] flex flex-col sm:flex-row items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-300 shrink-0">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium">Try your own design:</span>
        </div>
        <form onSubmit={handleQuickSubmit} className="flex-1 w-full flex items-center gap-2">
          <input
            type="url"
            value={figmaInput}
            onChange={(e) => setFigmaInput(e.target.value)}
            placeholder="Paste public Figma frame URL (e.g., https://figma.com/file/...)"
            className="flex-1 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors shrink-0 shadow-md"
          >
            Extract Code
          </button>
        </form>
      </div>
    </div>
  )
}

