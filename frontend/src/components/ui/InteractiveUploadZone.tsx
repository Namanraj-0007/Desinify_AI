import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/utils'

interface InteractiveUploadZoneProps {
  onFileSelect: (file: File) => void
  className?: string
}

export default function InteractiveUploadZone({ onFileSelect, className }: InteractiveUploadZoneProps) {
  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
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

  return (
    <div
      onDragEnter={() => setDragging(true)}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn(
        'relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300',
        dragging
          ? 'border-indigo-400 bg-indigo-500/10 scale-[1.02]'
          : 'border-border hover:border-indigo-500/50 hover:bg-white/[0.02]',
        className
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.png,.jpg,.jpeg,.webp"
        className="hidden"
        onChange={handleChange}
      />

      <div
        className="p-8 flex flex-col items-center justify-center text-center"
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
              <div className="mt-1 text-xs text-muted-foreground">PNG, JPG, WebP — up to 10MB</div>
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
  )
}

