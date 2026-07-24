import React, { useState, useRef } from 'react'

interface Props {
  onExport: (format: 'zip' | 'tar') => void
  isExporting: boolean
  disabled?: boolean
  currentVersionId?: string
  onDownloadZip?: () => void
}

export const ExportButton: React.FC<Props> = ({ onExport, isExporting, disabled, currentVersionId, onDownloadZip }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const handleDownloadZip = () => {
    if (onDownloadZip) {
      onDownloadZip()
    } else {
      onExport('zip')
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleDownloadZip}
        disabled={isExporting || disabled || !currentVersionId}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-xs font-medium text-emerald-200 hover:from-emerald-500/30 hover:to-teal-500/30 transition-colors disabled:opacity-40"
      >
        {isExporting ? (
          <>
            <span className="animate-spin">⏳</span>
            Packaging...
          </>
        ) : (
          <>
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download Code
          </>
        )}
      </button>
      <button
        onClick={() => setOpen(!open)}
        className="ml-1 mt-1 px-1.5 py-1 text-xs rounded-md text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
        disabled={disabled || !currentVersionId}
      >
        ▾
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-20 w-40 rounded-lg border border-white/10 bg-gray-900 shadow-xl overflow-hidden">
            <button
              onClick={() => { onExport('zip'); setOpen(false) }}
              className="w-full px-3 py-2 text-xs text-left hover:bg-white/5 transition-colors flex items-center gap-2"
            >
              <span>📦</span>
              Export as .zip
            </button>
            <button
              onClick={() => { onExport('tar'); setOpen(false) }}
              className="w-full px-3 py-2 text-xs text-left hover:bg-white/5 transition-colors flex items-center gap-2"
            >
              <span>📦</span>
              Export as .tar.gz
            </button>
          </div>
        </>
      )}
    </div>
  )
}

