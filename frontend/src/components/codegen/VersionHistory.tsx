import React, { useState } from 'react'
import type { GenerationVersion, FileOutput } from '../../api/codeGeneration'

interface Props {
  versions: GenerationVersion[]
  currentVersionId?: string
  onSelectVersion: (version: GenerationVersion) => void
  onRestoreVersion: (version: GenerationVersion) => void
}

export const VersionHistory: React.FC<Props> = ({
  versions,
  currentVersionId,
  onSelectVersion,
  onRestoreVersion,
}) => {
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null)

  if (versions.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No generation history yet.
      </div>
    )
  }

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString()
    } catch {
      return iso
    }
  }

  const getOptimizationBadge = (level: string) => {
    if (level.startsWith('optimized-')) {
      const type = level.replace('optimized-', '')
      return (
        <span className="px-1.5 py-0.5 text-[10px] rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          {type}
        </span>
      )
    }
    return (
      <span className="px-1.5 py-0.5 text-[10px] rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
        {level}
      </span>
    )
  }

  return (
    <div className="space-y-2 p-3">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Version History ({versions.length})
      </h3>
      {versions.map((v) => {
        const isCurrent = v.id === currentVersionId
        return (
          <div
            key={v.id}
            className={`rounded-lg border transition-colors ${
              isCurrent
                ? 'border-indigo-500/30 bg-indigo-500/10'
                : 'border-white/5 hover:border-white/20 bg-white/[0.02]'
            }`}
          >
            <button
              onClick={() => {
                setExpandedVersion(expandedVersion === v.id ? null : v.id)
                onSelectVersion(v)
              }}
              className="w-full flex items-center justify-between p-3 text-left"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-mono text-muted-foreground shrink-0">
                  v{v.version_number}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10">
                    {v.framework}
                  </span>
                  {v.typescript && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                      TS
                    </span>
                  )}
                  {getOptimizationBadge(v.optimization_level)}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-muted-foreground">
                  {formatDate(v.created_at)}
                </span>
                <span className="text-muted-foreground text-xs">
                  {expandedVersion === v.id ? '▾' : '▸'}
                </span>
              </div>
            </button>

            {expandedVersion === v.id && (
              <div className="px-3 pb-3 space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onRestoreVersion(v)
                    }}
                    className="px-2 py-1 text-[10px] rounded bg-indigo-500/20 text-indigo-200 hover:bg-indigo-500/30 transition-colors"
                  >
                    Restore this version
                  </button>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  <p>Files: {v.files.length}</p>
                  <p>Components: {v.stats?.total_components || 0}</p>
                  {v.frame_ids && v.frame_ids.length > 0 && (
                    <p>Frames: {v.frame_ids.join(', ')}</p>
                  )}
                  {v.stats?.component_breakdown && typeof v.stats.component_breakdown === 'object' && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {Object.entries(v.stats.component_breakdown as Record<string, number>).map(([type, count]) => (
                        <span key={type} className="px-1 py-0.5 rounded bg-white/5">
                          {String(type)}: {Number(count)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="max-h-32 overflow-y-auto space-y-0.5">
                  {v.files.slice(0, 10).map((f, i) => (
                    <div key={i} className="text-[10px] text-muted-foreground truncate">
                      📄 {f.path}
                    </div>
                  ))}
                  {v.files.length > 10 && (
                    <div className="text-[10px] text-muted-foreground">
                      ...and {v.files.length - 10} more files
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
