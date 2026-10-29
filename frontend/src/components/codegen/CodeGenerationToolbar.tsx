import React, { useState } from 'react'
import { ExportButton } from './ExportButton'
import { OptimizationPanel } from './OptimizationPanel'
import { VersionHistory } from './VersionHistory'
import type { GenerationVersion } from '../../api/codeGeneration'

interface Props {
  versions: GenerationVersion[]
  currentVersionId?: string
  onSelectVersion: (version: GenerationVersion) => void
  onRestoreVersion: (version: GenerationVersion) => void
  onOptimize: (type: string) => void
  onPromptRefine?: (prompt: string) => void
  onExport: (format: 'zip' | 'tar') => void
  onDownloadZip: () => void
  onRegenerate: () => void
  isGenerating: boolean
  isOptimizing: boolean
  isExporting: boolean
  activeTab: string
  onTabChange: (tab: string) => void
  disabled?: boolean
}

export const CodeGenerationToolbar: React.FC<Props> = ({
  versions,
  currentVersionId,
  onSelectVersion,
  onRestoreVersion,
  onOptimize,
  onPromptRefine,
  onExport,
  onDownloadZip,
  onRegenerate,
  isGenerating,
  isOptimizing,
  isExporting,
  activeTab,
  onTabChange,
  disabled,
}) => {
  const [customPrompt, setCustomPrompt] = useState('')

  const tabs = [
    { id: 'ai-prompt', label: 'AI Refine', icon: '⚡' },
    { id: 'optimize', label: 'Optimize', icon: '🛠️' },
    { id: 'history', label: `Versions (${versions.length})`, icon: '🕒' },
  ]

  const quickPrompts = [
    { label: '📱 Make Responsive', prompt: 'Add responsive flex/grid layouts and mobile-first Tailwind breakpoints' },
    { label: '🎨 Dark Glow Theme', prompt: 'Apply dark obsidian theme with glowing cyan borders and soft shadows' },
    { label: '♿ WCAG Accessible', prompt: 'Add proper ARIA labels, roles, and keyboard navigation to all interactive elements' },
    { label: '✨ Add Spring Motion', prompt: 'Integrate Framer Motion spring animations on hover and mount' },
    { label: '🛡️ Strict TS Props', prompt: 'Define strict TypeScript interfaces for all component props with documentation' },
  ]

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (customPrompt.trim() && onPromptRefine) {
      onPromptRefine(customPrompt.trim())
      setCustomPrompt('')
    }
  }

  return (
    <div className="hidden lg:flex border-r border-white/10 bg-[#090c16]/95 w-80 flex-col overflow-hidden shrink-0">
      {/* Top Header Actions */}
      <div className="p-4 border-b border-white/10 space-y-3 bg-[#0c101d]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-200">
              AI Workspace
            </h2>
          </div>
          <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
            Gemini 2.5
          </span>
        </div>

        <button
          onClick={onRegenerate}
          disabled={isGenerating || disabled}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 text-xs font-medium text-white shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50"
        >
          <span className={isGenerating ? 'animate-spin' : ''}>
            {isGenerating ? '⟳' : '⚡'}
          </span>
          {isGenerating ? 'Synthesizing AST...' : 'Regenerate Full Stack'}
        </button>

        <div className="flex items-center gap-2 pt-1">
          <ExportButton
            onExport={onExport}
            onDownloadZip={onDownloadZip}
            isExporting={isExporting}
            disabled={disabled || isGenerating}
            currentVersionId={currentVersionId}
          />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-white/10 bg-[#070912]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 py-2.5 px-2 text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
              activeTab === tab.id
                ? 'text-cyan-300 bg-white/5 border-b-2 border-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto">
        {/* AI Prompt / Refinement Console */}
        {activeTab === 'ai-prompt' && (
          <div className="p-4 space-y-4">
            <div>
              <h3 className="text-xs font-semibold text-slate-300 mb-1">Prompt Refinement</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Describe component changes in natural language to re-synthesize code.
              </p>
            </div>

            {/* Quick Prompt Chips */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                Quick Actions
              </span>
              <div className="space-y-1.5">
                {quickPrompts.map((qp) => (
                  <button
                    key={qp.label}
                    onClick={() => onPromptRefine ? onPromptRefine(qp.prompt) : onOptimize('responsiveness')}
                    disabled={isGenerating || isOptimizing}
                    className="w-full text-left p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-indigo-500/30 text-xs text-slate-300 transition-all flex items-center justify-between group"
                  >
                    <span>{qp.label}</span>
                    <span className="text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">&rarr;</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Prompt Form */}
            <form onSubmit={handlePromptSubmit} className="pt-2">
              <label className="text-[10px] font-mono text-slate-400 block mb-1.5">
                Custom Instruction
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g. Add dark mode toggle, replace buttons with rounded pills..."
                rows={3}
                className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/20 resize-none"
              />
              <button
                type="submit"
                disabled={!customPrompt.trim() || isGenerating || isOptimizing}
                className="w-full mt-2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-medium transition-colors shadow"
              >
                Apply Prompt Update
              </button>
            </form>
          </div>
        )}

        {/* Optimization Panel */}
        {activeTab === 'optimize' && (
          <OptimizationPanel
            onOptimize={onOptimize}
            isOptimizing={isOptimizing}
            disabled={disabled || isGenerating}
          />
        )}

        {/* History Panel */}
        {activeTab === 'history' && (
          <VersionHistory
            versions={versions}
            currentVersionId={currentVersionId}
            onSelectVersion={onSelectVersion}
            onRestoreVersion={onRestoreVersion}
          />
        )}
      </div>
    </div>
  )
}
