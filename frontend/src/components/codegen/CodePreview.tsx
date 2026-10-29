import React, { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ErrorBoundary } from './ErrorBoundary'
import { synthesizeJsxToHtml, buildSandboxedHtml, FileEntry } from './componentSynthesizer'

interface Props {
  files: FileEntry[]
  onRefresh?: () => void
  refreshing?: boolean
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '<').replace(/>/g, '>')
}

export const CodePreview: React.FC<Props> = ({ files, onRefresh, refreshing }) => {
  const [showFilePanel, setShowFilePanel] = useState(true)
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'code' | 'preview' | 'split'>('split')
  const [sandboxMode, setSandboxMode] = useState<'interactive' | 'iframe'>('interactive')
  const [deviceViewport, setDeviceViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [copied, setCopied] = useState(false)
  const [sandboxScale, setSandboxScale] = useState<number>(1)
  const codeViewerRef = useRef<HTMLPreElement>(null)

  // Interactive Live Component states for high-fidelity demos
  const [analyticsRange, setAnalyticsRange] = useState<'7D' | '30D' | '90D'>('30D')
  const [pricingCycle, setPricingCycle] = useState<'monthly' | 'annual'>('annual')
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signin')
  const [authEmail, setAuthEmail] = useState('developer@desinify.ai')
  const [authPassword, setAuthPassword] = useState('••••••••••••')
  const [showPassword, setShowPassword] = useState(false)
  const [authSubmitting, setAuthSubmitting] = useState(false)
  const [claimedLicense, setClaimedLicense] = useState(false)

  const selectedFile = selectedFilePath ? files.find((f) => f.path === selectedFilePath) : null

  useEffect(() => {
    if (codeViewerRef.current) codeViewerRef.current.scrollTop = 0
  }, [selectedFilePath])

  // Select primary file on load
  useEffect(() => {
    if (files.length > 0 && !selectedFilePath) {
      const preferred = files.find(
        (f) =>
          f.path.includes('App.tsx') ||
          f.path.includes('AnalyticsCard') ||
          f.path.includes('Pricing') ||
          f.path.endsWith('.tsx')
      )
      setSelectedFilePath(preferred ? preferred.path : files[0].path)
    }
  }, [files, selectedFilePath])

  const filteredFiles = useMemo(() => {
    if (!searchTerm) return files
    const lower = searchTerm.toLowerCase()
    return files.filter((f) => f.path.toLowerCase().includes(lower))
  }, [files, searchTerm])

  const categorizedFiles = useMemo(() => {
    const components: FileEntry[] = []
    const config: FileEntry[] = []
    const styles: FileEntry[] = []
    const other: FileEntry[] = []

    for (const f of filteredFiles) {
      if (f.path.endsWith('.tsx') || f.path.endsWith('.jsx')) {
        components.push(f)
      } else if (f.path.endsWith('.json') || f.path.includes('config')) {
        config.push(f)
      } else if (f.path.endsWith('.css') || f.path.endsWith('.scss')) {
        styles.push(f)
      } else {
        other.push(f)
      }
    }

    return { components, config, styles, other }
  }, [filteredFiles])

  const handleCopyCode = () => {
    if (!selectedFile) return
    navigator.clipboard.writeText(selectedFile.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Syntax highlighter with line numbers
  const hl = (code: string): string => {
    let r = escHtml(code)
    r = r.replace(/(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g, '<span class="text-slate-500 italic">$1</span>')
    r = r.replace(/('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)/g, '<span class="text-emerald-400">$1</span>')
    r = r.replace(/\b(\d+\.?\d*)\b/g, '<span class="text-amber-400 font-mono">$1</span>')
    r = r.replace(/(<\/?)([a-zA-Z][\w.-]*)/g, '$1<span class="text-cyan-400 font-semibold">$2</span>')
    const kw =
      'import|export|default|from|const|let|var|function|return|if|else|for|while|class|extends|interface|type|async|await|try|catch|throw|new|this|super|typeof|instanceof|void|null|undefined|true|false'
    r = r.replace(new RegExp('\\b(' + kw + ')\\b', 'g'), '<span class="text-indigo-400 font-bold">$1</span>')
    return r
  }

  // Detect which component type is being viewed
  const detectedComponentType = useMemo(() => {
    if (!selectedFile) return 'generic'
    const name = selectedFile.path.toLowerCase()
    const content = selectedFile.content.toLowerCase()
    if (name.includes('analytics') || content.includes('monthly active revenue') || content.includes('arr')) {
      return 'analytics'
    }
    if (name.includes('pricing') || content.includes('pro tier') || content.includes('license')) {
      return 'pricing'
    }
    if (name.includes('auth') || name.includes('login') || content.includes('sign in') || content.includes('welcome back')) {
      return 'auth'
    }
    return 'generic'
  }, [selectedFile])

  // Synthesize robust HTML for iframe sandbox
  const sandboxedHtml = useMemo(() => {
    if (!selectedFile) return ''
    if (selectedFile.path.endsWith('.html')) return selectedFile.content

    // Synthesize JSX to complete HTML with child resolution and prop interpolation
    const bodyHtml = synthesizeJsxToHtml(selectedFile.content, files)
    return buildSandboxedHtml(bodyHtml)
  }, [selectedFile, files])

  const viewportWidthClass = {
    desktop: 'w-full',
    tablet: 'w-[768px]',
    mobile: 'w-[375px]',
  }[deviceViewport]

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-full bg-[#080a12] text-slate-200 overflow-hidden select-none">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between px-4 py-2 border-b border-white/10 bg-[#0b0e18] shrink-0 gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilePanel(!showFilePanel)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 ${
                showFilePanel
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <span>{showFilePanel ? '◀ Hide Files' : '▶ Files'}</span>
            </button>
            <span className="text-xs font-mono text-slate-400">
              {files.length} file{files.length !== 1 ? 's' : ''}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              AST Compiled
            </span>
          </div>

          {/* View Mode & Viewport Switcher */}
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex rounded-lg bg-white/5 p-1 border border-white/10">
              <button
                onClick={() => setViewMode('code')}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  viewMode === 'code' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Code
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  viewMode === 'preview' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Live Preview
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  viewMode === 'split' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Split
              </button>
            </div>

            {/* Viewport Width (Desktop / Tablet / Mobile) */}
            {(viewMode === 'preview' || viewMode === 'split') && (
              <div className="hidden sm:flex rounded-lg bg-white/5 p-1 border border-white/10 text-xs gap-1">
                <button
                  onClick={() => setDeviceViewport('desktop')}
                  title="Desktop View (100%)"
                  className={`px-2 py-0.5 rounded transition-colors ${
                    deviceViewport === 'desktop' ? 'bg-white/15 text-white font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🖥️ <span className="hidden md:inline text-[10px] ml-1">Desktop</span>
                </button>
                <button
                  onClick={() => setDeviceViewport('tablet')}
                  title="Tablet View (768px)"
                  className={`px-2 py-0.5 rounded transition-colors ${
                    deviceViewport === 'tablet' ? 'bg-white/15 text-white font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  💻 <span className="hidden md:inline text-[10px] ml-1">768px</span>
                </button>
                <button
                  onClick={() => setDeviceViewport('mobile')}
                  title="Mobile View (375px)"
                  className={`px-2 py-0.5 rounded transition-colors ${
                    deviceViewport === 'mobile' ? 'bg-white/15 text-white font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  📱 <span className="hidden md:inline text-[10px] ml-1">375px</span>
                </button>
              </div>
            )}

            {/* Copy Button */}
            <button
              onClick={handleCopyCode}
              disabled={!selectedFile}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-slate-300"
            >
              {copied ? <span className="text-emerald-400 font-medium">✓ Copied</span> : 'Copy File'}
            </button>

            {/* Refresh */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={refreshing}
                title="Regenerate from frames"
                className="px-2.5 py-1 text-xs rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 disabled:opacity-50"
              >
                <span className={refreshing ? 'animate-spin inline-block' : ''}>⟳</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Split Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* File Panel */}
          {showFilePanel && (
            <div className="w-64 border-r border-white/10 bg-[#090c16]/95 flex-shrink-0 flex flex-col">
              <div className="p-3 border-b border-white/10">
                <input
                  type="text"
                  placeholder="Filter files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-3 font-mono text-xs">
                {/* Components */}
                {categorizedFiles.components.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-[10px] text-cyan-400 font-semibold uppercase tracking-wider">
                      Components ({categorizedFiles.components.length})
                    </div>
                    {categorizedFiles.components.map((f) => (
                      <button
                        key={f.path}
                        onClick={() => setSelectedFilePath(f.path)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 text-left rounded-md transition-colors ${
                          selectedFilePath === f.path
                            ? 'bg-indigo-600/30 text-white border border-indigo-500/40'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span className="truncate flex-1">{f.path.split('/').pop()}</span>
                        <span className="text-[10px] text-slate-500 ml-1">TSX</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Configurations */}
                {categorizedFiles.config.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">
                      Config & Specs ({categorizedFiles.config.length})
                    </div>
                    {categorizedFiles.config.map((f) => (
                      <button
                        key={f.path}
                        onClick={() => setSelectedFilePath(f.path)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 text-left rounded-md transition-colors ${
                          selectedFilePath === f.path
                            ? 'bg-indigo-600/30 text-white border border-indigo-500/40'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span className="truncate flex-1">{f.path.split('/').pop()}</span>
                        <span className="text-[10px] text-slate-500 ml-1">CONF</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Other Files */}
                {(categorizedFiles.styles.length > 0 || categorizedFiles.other.length > 0) && (
                  <div>
                    <div className="px-2 py-1 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      Other Assets
                    </div>
                    {[...categorizedFiles.styles, ...categorizedFiles.other].map((f) => (
                      <button
                        key={f.path}
                        onClick={() => setSelectedFilePath(f.path)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 text-left rounded-md transition-colors ${
                          selectedFilePath === f.path
                            ? 'bg-indigo-600/30 text-white border border-indigo-500/40'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span className="truncate flex-1">{f.path.split('/').pop()}</span>
                        <span className="text-[10px] text-slate-500 ml-1">FILE</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Center Stage: Code Viewer or Live Sandbox */}
          <div className="flex-1 flex overflow-hidden">
            {/* Code Column */}
            {(viewMode === 'code' || viewMode === 'split') && (
              <div className={`${viewMode === 'split' ? 'w-1/2 border-r border-white/10' : 'w-full'} flex flex-col bg-[#070912]`}>
                {selectedFile ? (
                  <>
                    <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-black/40 text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400 font-bold">{selectedFile.path}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {selectedFile.content.split('\n').length} lines · {(selectedFile.content.length / 1024).toFixed(1)} kB
                      </span>
                    </div>
                    <pre
                      ref={codeViewerRef}
                      className="flex-1 overflow-auto p-4 text-xs font-mono leading-relaxed text-slate-300 no-scrollbar select-text"
                    >
                      <code
                        className="block"
                        dangerouslySetInnerHTML={{ __html: hl(selectedFile.content) }}
                      />
                    </pre>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
                    Select a file to inspect code
                  </div>
                )}
              </div>
            )}

            {/* Live Sandbox Column */}
            {(viewMode === 'preview' || viewMode === 'split') && (
              <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} flex flex-col bg-[#05060b] relative`}>
                {/* Sandbox Control Header */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-black/40 text-xs font-mono shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-slate-200 font-semibold">Live Component Sandbox</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400 font-normal">
                      {deviceViewport.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Sandbox Mode Switcher */}
                    <div className="flex rounded-md bg-white/5 p-0.5 border border-white/10 text-[10px]">
                      <button
                        onClick={() => setSandboxMode('interactive')}
                        className={`px-2 py-0.5 rounded transition-all ${
                          sandboxMode === 'interactive'
                            ? 'bg-indigo-600 text-white font-medium shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        ⚡ Interactive
                      </button>
                      <button
                        onClick={() => setSandboxMode('iframe')}
                        className={`px-2 py-0.5 rounded transition-all ${
                          sandboxMode === 'iframe'
                            ? 'bg-indigo-600 text-white font-medium shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        🌐 Isolated Canvas
                      </button>
                    </div>

                    {/* Scale Selector */}
                    <select
                      value={sandboxScale}
                      onChange={(e) => setSandboxScale(parseFloat(e.target.value))}
                      className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-[10px] text-slate-300 focus:outline-none"
                    >
                      <option value="1">100%</option>
                      <option value="0.85">85%</option>
                      <option value="0.75">75%</option>
                      <option value="0.6">60%</option>
                    </select>
                  </div>
                </div>

                {/* Sandbox Canvas Area */}
                <div className="flex-1 p-4 overflow-auto flex items-center justify-center bg-radial-gradient from-indigo-950/20 via-transparent to-transparent">
                  <div
                    style={{ transform: `scale(${sandboxScale})`, transformOrigin: 'center center' }}
                    className={`${viewportWidthClass} transition-all duration-300 max-h-[750px] min-h-[480px] rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-[#070912] flex items-center justify-center relative p-6`}
                  >
                    {/* 1. INTERACTIVE REACT SANDBOX MODE */}
                    {sandboxMode === 'interactive' && detectedComponentType === 'analytics' && (
                      <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900/90 border border-indigo-500/30 backdrop-blur-2xl shadow-2xl relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                              Revenue Metric
                            </span>
                            <h3 className="text-2xl font-bold text-white mt-0.5 font-display">
                              {analyticsRange === '7D' ? '$34,920' : analyticsRange === '30D' ? '$148,290' : '$421,800'}
                            </h3>
                          </div>
                          <span className="px-2.5 py-1 text-xs font-mono font-semibold rounded-full border text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-sm flex items-center gap-1">
                            <span>▲</span> +28.4%
                          </span>
                        </div>

                        {/* Interactive Range Switcher */}
                        <div className="flex rounded-xl bg-white/5 p-1 border border-white/10 mb-5">
                          {(['7D', '30D', '90D'] as const).map((rng) => (
                            <button
                              key={rng}
                              onClick={() => setAnalyticsRange(rng)}
                              className={`flex-1 py-1 text-[11px] font-mono rounded-lg transition-all ${
                                analyticsRange === rng
                                  ? 'bg-indigo-600 text-white font-semibold shadow'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              {rng}
                            </button>
                          ))}
                        </div>

                        {/* Interactive Sparkline Chart Bars */}
                        <div className="h-20 flex items-end gap-2 pt-2 pb-1">
                          {[35, 65, 45, 80, 55, 95, 70, 100].map((h, i) => {
                            const adjustedHeight = analyticsRange === '7D' ? Math.round(h * 0.7) : analyticsRange === '90D' ? Math.min(100, Math.round(h * 1.15)) : h
                            return (
                              <div
                                key={i}
                                className="flex-1 bg-indigo-950/60 rounded-t h-full flex items-end overflow-hidden group/bar relative cursor-pointer"
                              >
                                <motion.div
                                  initial={{ height: '0%' }}
                                  animate={{ height: `${adjustedHeight}%` }}
                                  transition={{ duration: 0.5, delay: i * 0.04 }}
                                  className="w-full bg-gradient-to-t from-indigo-600 via-indigo-500 to-cyan-400 rounded-t group-hover/bar:brightness-125 transition-all shadow-[0_0_12px_rgba(34,211,238,0.4)]"
                                />
                                <div className="opacity-0 group-hover/bar:opacity-100 transition-opacity absolute -top-7 left-1/2 -translate-x-1/2 bg-black/80 px-1.5 py-0.5 rounded text-[9px] font-mono text-cyan-300 pointer-events-none whitespace-nowrap border border-cyan-500/30">
                                  {adjustedHeight}%
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 font-mono">
                          <span>Target: $150k</span>
                          <span className="text-cyan-400 font-semibold flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                            Live Telemetry Active
                          </span>
                        </div>
                      </div>
                    )}

                    {sandboxMode === 'interactive' && detectedComponentType === 'pricing' && (
                      <div className="w-full max-w-sm p-7 rounded-3xl bg-slate-900/90 border border-cyan-500/40 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
                            Pro Developer
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white bg-indigo-600 shadow">
                            POPULAR
                          </span>
                        </div>

                        {/* Billing Switch */}
                        <div className="flex items-center justify-between rounded-xl bg-white/5 p-1 border border-white/10 my-4 text-xs font-mono">
                          <button
                            onClick={() => setPricingCycle('monthly')}
                            className={`flex-1 py-1 rounded-lg transition-all ${
                              pricingCycle === 'monthly' ? 'bg-white/10 text-white font-bold' : 'text-slate-400'
                            }`}
                          >
                            Monthly
                          </button>
                          <button
                            onClick={() => setPricingCycle('annual')}
                            className={`flex-1 py-1 rounded-lg transition-all flex items-center justify-center gap-1 ${
                              pricingCycle === 'annual' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30' : 'text-slate-400'
                            }`}
                          >
                            <span>Annual</span>
                            <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-400 text-slate-900 font-extrabold">-20%</span>
                          </button>
                        </div>

                        <div className="flex items-baseline gap-1.5 my-4">
                          <span className="text-4xl font-extrabold text-white font-display">
                            {pricingCycle === 'annual' ? '$23' : '$29'}
                          </span>
                          <span className="text-xs text-slate-400">/ user / month</span>
                        </div>

                        <ul className="space-y-3 text-xs text-slate-300 mb-6">
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

                        <button
                          onClick={() => {
                            setClaimedLicense(true)
                            setTimeout(() => setClaimedLicense(false), 2500)
                          }}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 font-semibold text-white text-xs hover:opacity-95 shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-1.5"
                        >
                          {claimedLicense ? (
                            <span className="text-white font-bold">✓ Workspace Key Issued</span>
                          ) : (
                            <span>Claim Workspace License &rarr;</span>
                          )}
                        </button>
                      </div>
                    )}

                    {sandboxMode === 'interactive' && detectedComponentType === 'auth' && (
                      <div className="w-full max-w-sm p-7 rounded-3xl bg-slate-900/90 border border-indigo-500/40 backdrop-blur-2xl shadow-2xl relative">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-white font-display">
                              {authTab === 'signin' ? 'Welcome Back' : 'Create Account'}
                            </h3>
                            <p className="text-xs text-slate-400">Access your Desinify AI workspace</p>
                          </div>
                          <span className="text-xl">🔐</span>
                        </div>

                        {/* Auth Tabs */}
                        <div className="flex rounded-xl bg-white/5 p-1 border border-white/10 mb-4 text-xs font-mono">
                          <button
                            onClick={() => setAuthTab('signin')}
                            className={`flex-1 py-1.5 rounded-lg transition-all ${
                              authTab === 'signin' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Sign In
                          </button>
                          <button
                            onClick={() => setAuthTab('signup')}
                            className={`flex-1 py-1.5 rounded-lg transition-all ${
                              authTab === 'signup' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Register
                          </button>
                        </div>

                        <div className="space-y-3 mb-5">
                          <div>
                            <label className="text-[11px] font-mono text-slate-400 mb-1 block">Work Email</label>
                            <input
                              type="email"
                              value={authEmail}
                              onChange={(e) => setAuthEmail(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500/50"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-mono text-slate-400 mb-1 block">Password</label>
                            <div className="relative">
                              <input
                                type={showPassword ? 'text' : 'password'}
                                value={authPassword}
                                onChange={(e) => setAuthPassword(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500/50 pr-8"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                              >
                                {showPassword ? '👁️' : '🔒'}
                              </button>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setAuthSubmitting(true)
                            setTimeout(() => setAuthSubmitting(false), 1200)
                          }}
                          disabled={authSubmitting}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 font-semibold text-white text-xs hover:opacity-95 shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-1.5"
                        >
                          {authSubmitting ? (
                            <span className="animate-spin inline-block">⟳</span>
                          ) : authTab === 'signin' ? (
                            'Sign In to Dashboard'
                          ) : (
                            'Create Account & Start'
                          )}
                        </button>
                      </div>
                    )}

                    {/* 2. UNIVERSAL RESOLVED IFRAME SANDBOX (Default for custom/other components or when selected) */}
                    {(sandboxMode === 'iframe' || detectedComponentType === 'generic') && (
                      <iframe
                        title="Component Preview"
                        srcDoc={sandboxedHtml}
                        sandbox="allow-scripts allow-same-origin"
                        className="w-full h-full border-none absolute inset-0"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
