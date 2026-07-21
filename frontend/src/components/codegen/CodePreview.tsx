import { useState, useRef, useEffect, useMemo } from 'react'
import { ErrorBoundary } from './ErrorBoundary'

type FileEntry = {
  path: string
  content: string
}

type DeviceMode = 'mobile' | 'tablet' | 'laptop' | 'desktop'

const DEVICE_DIMS = {
  mobile: { w: 375, h: 667 },
  tablet: { w: 768, h: 1024 },
  laptop: { w: 1280, h: 800 },
  desktop: { w: 1440, h: 900 },
} as const

interface Props {
  files: FileEntry[]
  onRefresh?: () => void
  refreshing?: boolean
}

export const CodePreview = ({ files, onRefresh, refreshing }: Props) => {
  const [device, setDevice] = useState<DeviceMode>('desktop')
  const [err, setErr] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const html = useMemo(() => {
    const css = files.filter(f => f.path.endsWith('.css')).map(f => f.content).join('\n')
    const tsx = files.filter(f => f.path.endsWith('.tsx') && !f.path.includes('index'))
    const list = tsx.map(f => '<li>' + f.path + '</li>').join('\n')
    const dims = DEVICE_DIMS[device]
    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Preview</title><script src="https://cdn.tailwindcss.com"></script><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,-apple-system,sans-serif}${css}</style></head><body><div class="min-h-screen bg-gray-950 text-white p-8"><p class="text-sm text-gray-400 mb-4">Generated Preview - ${files.length} files</p><div class="max-w-lg"><p class="text-gray-300 text-base mb-4">Generated Components:</p><ul class="space-y-1 text-gray-400 text-sm">${list}</ul></div></body></html>`
  }, [files])

  useEffect(() => {
    if (iframeRef.current) {
      try {
        iframeRef.current.srcdoc = html
        setErr(null)
      } catch (e: any) {
        setErr(e?.message || 'Preview render failed')
      }
    }
  }, [html])

  const cur = DEVICE_DIMS[device]

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Preview</span>
            <div className="flex items-center gap-1 ml-2">
              {(Object.keys(DEVICE_DIMS) as DeviceMode[]).map(d => (
                <button key={d} onClick={() => setDevice(d)}
                  className={'px-2 py-1 text-xs rounded-md transition-colors ' + (device === d ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/30' : 'text-muted-foreground hover:text-white hover:bg-white/5')}>
                  {d === 'mobile' && '📱'}
                  {d === 'tablet' && '📟'}
                  {d === 'laptop' && '💻'}
                  {d === 'desktop' && '🖥️'}
                </button>
              ))}
            </div>
          </div>
          <button onClick={onRefresh} disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50">
            <span className={refreshing ? 'animate-spin' : ''}>↻</span>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center bg-black/40 p-4 overflow-auto">
          <div className="bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300"
            style={{
              width: Math.min(cur.w, window.innerWidth - 40),
              height: Math.min(cur.h, window.innerHeight - 200),
              maxWidth: '100%',
              maxHeight: '100%'
            }}>
            <iframe ref={iframeRef} title="Code Preview" className="w-full h-full bg-white"
              sandbox="allow-scripts allow-same-origin" />
          </div>
        </div>
        {err && (
          <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20">
            <p className="text-xs text-red-300">{err}</p>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}
