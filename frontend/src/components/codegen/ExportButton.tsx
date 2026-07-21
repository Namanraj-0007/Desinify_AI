import React, { useState, useRef } from 'react'

interface Props {
  onExport: (format: 'zip' | 'tar') => void
  isExporting: boolean
  disabled?: boolean
}

export const ExportButton: React.FC<Props> = ({ onExport, isExporting, disabled }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        disabled={isExporting || disabled}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-indigo-500/20 text-indigo-200 hover:bg-indigo-500/30 transition-colors disabled:opacity-50"
      >
        <span>{isExporting ? '⏳' : '📦'}</span>
        {isExporting ? 'Exporting...' : 'Export'}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 w-36 rounded-lg border border-white/10 bg-gray-900 shadow-xl overflow-hidden">
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
