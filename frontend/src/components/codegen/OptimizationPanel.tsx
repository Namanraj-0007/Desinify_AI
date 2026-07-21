import React from 'react'

interface Props {
  onOptimize: (type: string) => void
  isOptimizing: boolean
  disabled?: boolean
}

const IMPROVEMENT_TYPES = [
  { id: 'structure', label: 'Improve Structure', icon: '🏗️', description: 'Break large components into smaller, focused ones' },
  { id: 'accessibility', label: 'Improve Accessibility', icon: '♿', description: 'Add aria-labels, roles, keyboard navigation' },
  { id: 'responsiveness', label: 'Improve Responsiveness', icon: '📱', description: 'Add responsive Tailwind breakpoints' },
  { id: 'tailwind', label: 'Optimize Tailwind', icon: '🎨', description: 'Merge duplicate classes, remove inline styles' },
  { id: 'naming', label: 'Improve Naming', icon: '📝', description: 'Improve component and variable naming' },
]

export const OptimizationPanel: React.FC<Props> = ({ onOptimize, isOptimizing, disabled }) => {
  return (
    <div className="p-3 space-y-2">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        AI Optimization
      </h3>
      {IMPROVEMENT_TYPES.map((imp) => (
        <button
          key={imp.id}
          onClick={() => onOptimize(imp.id)}
          disabled={isOptimizing || disabled}
          className="w-full flex items-start gap-2 p-2 rounded-lg border border-white/5 hover:border-white/20 bg-white/[0.02] hover:bg-white/5 transition-colors disabled:opacity-40 text-left"
        >
          <span className="text-base mt-0.5">{imp.icon}</span>
          <div className="min-w-0">
            <div className="text-xs font-medium text-white/80">{imp.label}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{imp.description}</div>
          </div>
          <span className="text-xs text-indigo-400 ml-auto shrink-0 mt-1">
            {isOptimizing ? '...' : '→'}
          </span>
        </button>
      ))}
    </div>
  )
}
