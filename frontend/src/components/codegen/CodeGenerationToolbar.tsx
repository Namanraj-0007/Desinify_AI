                                                                                                                                                                                                                                                                        import React from 'react'
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
  onExport: (format: 'zip' | 'tar') => void
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
  onExport,
  onRegenerate,
  isGenerating,
  isOptimizing,
  isExporting,
  activeTab,
  onTabChange,
  disabled,
}) => {
  const tabs = [
    { id: 'optimize', label: 'Optimize' },
    { id: 'history', label: 'History (' + versions.length + ')' },
  ]

  return (
    <div className="hidden lg:flex border-r border-white/10 bg-gray-950/50 w-72 flex-col overflow-hidden">
      <div className="p-3 border-b border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Code Generation
          </h2>
        </div>

        <button
          onClick={onRegenerate}
          disabled={isGenerating || disabled}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-indigo-500/20 to-fuchsia-500/20 border border-indigo-500/30 text-xs font-medium text-indigo-200 hover:from-indigo-500/30 hover:to-fuchsia-500/30 transition-colors disabled:opacity-40"
        >
          <span className={isGenerating ? 'animate-spin' : ''}>
            {isGenerating ? '⟳' : '⚡'}
          </span>
          {isGenerating ? 'Generating...' : 'Regenerate Code'}
        </button>

        <div className="flex items-center gap-2">
          <ExportButton onExport={onExport} isExporting={isExporting} disabled={disabled || isGenerating} />
        </div>
      </div>

      <div className="flex border-b border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={
              'flex-1 px-3 py-2 text-xs font-medium transition-colors ' +
              (activeTab === tab.id
                ? 'text-white bg-white/5 border-b-2 border-indigo-500'
                : 'text-muted-foreground hover:text-white hover:bg-white/[0.02]')
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'optimize' && (
          <OptimizationPanel
            onOptimize={onOptimize}
            isOptimizing={isOptimizing}
            disabled={disabled || isGenerating}
          />
        )}
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
