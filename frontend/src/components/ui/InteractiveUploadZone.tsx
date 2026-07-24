import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/utils'

interface InteractiveUploadZoneProps {
  onFileSelect: (file: File) => void
  onFigmaUrl?: (url: string) => void
  className?: string
}

const SUPPORTED_FORMATS = [
  { ext: 'PNG', color: 'from-blue-500/20 to-blue-500/5 text-blue-300' },
  { ext: 'JPG', color: 'from-amber-500/20 to-amber-500/5 text-amber-300' },
  { ext: 'SVG', color: 'from-orange-500/20 to-orange-500/5 text-orange-300' },
  { ext: 'FIG', color: 'from-fuchsia-500/20 to-fuchsia-500/5 text-fuchsia-300' },
]

export default function InteractiveUploadZone({ onFileSelect, onFigmaUrl, className }: InteractiveUploadZoneProps) {
  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload')
  const [figmaUrl, setFigmaUrl] = useState('')
  const inputRef = useRef<HTMLInputElement>(null!)

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const file = e.dataTransfer.files?.[0]
      if (!file) return
      setFileName(file.name)
      onFileSelect(file)
    },
    [onFileSelect]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      setFileName(file.name)
      onFileSelect(file)
    },
    [onFileSelect]
  )

  const handleFigmaUrlSubmit = useCallback(() => {
    if (figmaUrl.trim() && onFigmaUrl) {
      onFigmaUrl(figmaUrl.trim())
    }
  }, [figmaUrl, onFigmaUrl])

  return (
    <div className={cn('space-y-4', className)}>
      {/* Tab switcher */}
      <div className="flex rounded-xl bg-white/5 border border-white/10 p-1">
        <button
          onClick={() => setActiveTab('upload')}
          className={cn(
            'flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all',
            activeTab === 'upload'
              ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/30'
              : 'text-muted-foreground hover:text-white'
          )}
        >
          Upload Image
        </button>
        <button
          onClick={() => setActiveTab('url')}
          className={cn(
            'flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all',
            activeTab === 'url'
              ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/30'
              : 'text-muted-foreground hover:text-white'
          )}
        >
          Figma URL
        </button>
      </div>

      {activeTab === 'upload' ? (
        <div
          onDragEnter={() => setDragging(true)}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={cn(
            'relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300',
            dragging
              ? 'border-indigo-400 bg-indigo-500/10 scale-[1.02]'
              : 'border-border hover:border-indigo-500/50 hover:bg-white/[0.02]'
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*,.png,.jpg,.jpeg,.webp,.svg"
            className="hidden"
            onChange={handleChange}
          />

          <div
            className="p-6 sm:p-8 flex flex-col items-center justify-center text-center"
            onClick={() => inputRef.current?.click()}
          >
            <AnimatePresence mode="wait">
              {fileName ? (
                <motion.div
                  key="file"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3"
                >
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 flex items-center justify-center">
                    <svg className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l3 3m0 0l3-3m-3 3v-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-foreground">{fileName}</div>
                    <div className="text-xs text-muted-foreground">Click to change</div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 flex items-center justify-center shadow-[0_0_30px_hsl(252_87%_65%/0.15)]">
                    <svg className="h-7 w-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                  </div>
                  <div className="mt-4 text-sm font-medium text-foreground">Drop your design here</div>
                  <div className="mt-1 text-xs text-muted-foreground">or click to browse</div>
                  <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-xs text-muted-foreground border border-border">
                    <svg className="h-3 w-3 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Browse files
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative">
            <input
              type="url"
              value={figmaUrl}
              onChange={(e) => setFigmaUrl(e.target.value)}
              placeholder="https://www.figma.com/file/..."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-muted-foreground focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all"
              onKeyDown={(e) => e.key === 'Enter' && handleFigmaUrlSubmit()}
            />
            <button
              onClick={handleFigmaUrlSubmit}
              disabled={!figmaUrl.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-200 text-xs font-medium hover:bg-indigo-500/30 transition-colors disabled:opacity-40"
            >
              Import
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center">
            Paste a Figma file URL to import designs directly
          </p>
        </div>
      )}

      {/* Supported formats */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <span className="text-[10px] text-muted-foreground">Supports:</span>
        {SUPPORTED_FORMATS.map((fmt) => (
          <span
            key={fmt.ext}
            className={cn(
              'text-[10px] px-1.5 py-0.5 rounded bg-gradient-to-r font-medium',
              fmt.color
            )}
          >
            {fmt.ext}
          </span>
        ))}
      </div>
    </div>
  )
}

