import { useState, useRef, useEffect, useMemo } from 'react'
import { ErrorBoundary } from './ErrorBoundary'

type FileEntry = { path: string; content: string }
type DeviceMode = 'mobile' | 'tablet' | 'desktop'

const DEVICE_DIMS = {
  mobile: { w: 375, h: 812 },
  tablet: { w: 768, h: 1024 },
  desktop: { w: 1280, h: 800 },
} as const

interface Props {
  files: FileEntry[]
  onRefresh?: () => void
  refreshing?: boolean
}

function esc(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$')
    .replace(/<\/script>/gi, '<\\/script>')
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '<').replace(/>/g, '>')
}

export const CodePreview = ({ files, onRefresh, refreshing }: Props) => {
  const [device, setDevice] = useState<DeviceMode>('desktop')
  const [err, setErr] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [previewKey, setPreviewKey] = useState(0)
  const [showFilePanel, setShowFilePanel] = useState(true)
  const [showCodeViewer, setShowCodeViewer] = useState(false)
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null)
  const codeViewerRef = useRef<HTMLPreElement>(null)

  const html = useMemo(() => {
    if (files.length === 0) return buildEmptyHtml()
    return buildPreviewHtml(files)
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
  const hasApp = files.some((f) => f.path === 'src/App.tsx' || f.path === 'App.tsx')
  const selectedFile = selectedFilePath ? files.find((f) => f.path === selectedFilePath) : null

  useEffect(() => {
    if (codeViewerRef.current && showCodeViewer) codeViewerRef.current.scrollTop = 0
  }, [selectedFilePath, showCodeViewer])

  const folderTree = useMemo(() => {
    const tree: Record<string, { name: string; files: typeof files }> = {}
    for (const f of files) {
      const parts = f.path.split('/')
      if (parts.length === 1) {
        if (!tree.__root__) tree.__root__ = { name: '/', files: [] }
        tree.__root__.files.push(f)
      } else {
        const dir = parts.slice(0, -1).join('/')
        if (!tree[dir]) tree[dir] = { name: parts[parts.length - 2], files: [] }
        tree[dir].files.push(f)
      }
    }
    return tree
  }, [files])

  const hl = (code: string): string => {
    let r = escHtml(code)
    r = r.replace(/(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g, '<span class="cc">$1</span>')
    r = r.replace(/('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)/g, '<span class="cs">$1</span>')
    r = r.replace(/\b(\d+\.?\d*)\b/g, '<span class="cn">$1</span>')
    r = r.replace(/(<\/?)([a-zA-Z][\w.-]*)/g, '$1<span class="ct">$2</span>')
    const kw =
      'import|export|default|from|const|let|var|function|return|if|else|for|while|class|extends|interface|type|async|await|try|catch|throw|new|this|super|typeof|instanceof|void|null|undefined|true|false|case|switch|break|continue|yield|enum|implements|private|protected|public|readonly|static|abstract|declare|namespace|module|require|as|any|boolean|number|string|object|symbol|never|unknown|bigint'
    r = r.replace(new RegExp('\\b(' + kw + ')\\b', 'g'), '<span class="ck">$1</span>')
    return r
  }

  const handleRefresh = () => {
    setPreviewKey((k) => k + 1)
    onRefresh?.()
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-full">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-gray-950/80 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              {hasApp ? 'Live Preview' : 'Code Browser'}
            </span>
            <span
              className={
                'text-[10px] px-1.5 py-0.5 rounded ' +
                (hasApp ? 'bg-emerald-500/20 text-emerald-300' : 'bg-yellow-500/20 text-yellow-300')
              }
            >
              {hasApp ? 'App.tsx' : files.length + ' files'}
            </span>
            <button
              onClick={() => setShowFilePanel(!showFilePanel)}
              className={
                'text-[10px] px-2 py-1 rounded transition-colors ' +
                (showFilePanel
                  ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/30'
                  : 'text-muted-foreground hover:text-white hover:bg-white/5')
              }
            >
              {showFilePanel ? 'Hide Files' : 'Files'}
            </button>
            {hasApp && (
              <div className="flex items-center gap-1 ml-2">
                {(Object.keys(DEVICE_DIMS) as DeviceMode[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDevice(d)}
                    className={
                      'px-2 py-1 text-xs rounded-md transition-colors ' +
                      (device === d
                        ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/30'
                        : 'text-muted-foreground hover:text-white hover:bg-white/5')
                    }
                    title={d.toUpperCase() + ' ' + DEVICE_DIMS[d].w + 'x' + DEVICE_DIMS[d].h}
                  >
                    {d === 'mobile' ? 'Phone' : d === 'tablet' ? 'Tablet' : 'Desktop'}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 transition-colors"
          >
            <span className={refreshing ? 'animate-spin' : ''}>Refresh</span>
          </button>
        </div>

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          {/* File panel */}
          {showFilePanel && files.length > 0 && (
            <div className="w-64 border-r border-white/10 bg-gray-950/50 overflow-y-auto flex-shrink-0">
              <div className="p-3 border-b border-white/10">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Files</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">{files.length} files</p>
              </div>
              <div className="p-2 space-y-0.5">
                {Object.entries(folderTree).map(([dirPath, dirData]) => (
                  <div key={dirPath}>
                    {dirPath !== '__root__' && (
                      <div className="px-2 py-1.5 text-[10px] text-muted-foreground font-medium uppercase">
                        {dirPath} ({dirData.files.length})
                      </div>
                    )}
                    {dirData.files.map((f) => (
                      <button
                        key={f.path}
                        onClick={() => { setSelectedFilePath(f.path); setShowCodeViewer(true) }}
                        className={
                          'w-full flex items-center gap-2 px-3 py-1.5 text-left rounded-md transition-colors ' +
                          (selectedFilePath === f.path
                            ? 'bg-indigo-500/15 text-indigo-200 border border-indigo-500/30'
                            : 'text-muted-foreground hover:text-white hover:bg-white/5')
                        }
                      >
                        <span className="text-[11px] truncate flex-1">{f.path.split('/').pop()}</span>
                        <span className="text-[9px] text-muted-foreground shrink-0">
                          {(f.content.length / 1024).toFixed(1)}k
                        </span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview + Code viewer */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 flex items-center justify-center bg-black/60 p-4 overflow-auto">
              <div
                className="bg-[#030712] rounded-lg shadow-2xl overflow-hidden transition-all duration-300 border border-white/10"
                style={{
                  width: hasApp ? cur.w : '100%',
                  height: hasApp ? cur.h : '100%',
                  maxWidth: '100%',
                  maxHeight: '100%',
                }}
              >
                <iframe
                  key={previewKey}
                  ref={iframeRef}
                  title="Code Preview"
                  className="w-full h-full"
                  sandbox="allow-scripts allow-same-origin allow-modals allow-popups"
                />
              </div>
            </div>

            {/* Code viewer */}
            {showCodeViewer && selectedFile && (
              <div
                className="border-t border-white/10 bg-gray-950/90 flex flex-col"
                style={{ maxHeight: '40%', minHeight: '120px' }}
              >
                <div className="flex items-center justify-between px-4 py-1.5 border-b border-white/10 bg-gray-950/80 shrink-0">
                  <span className="text-[10px] font-medium text-amber-300">Code</span>
                  <span className="text-[10px] text-muted-foreground">{selectedFile.path}</span>
                  <span className="text-[9px] text-muted-foreground">
                    {selectedFile.content.split('\n').length} lines
                  </span>
                  <button
                    onClick={() => setShowCodeViewer(false)}
                    className="text-[10px] text-muted-foreground hover:text-white ml-2"
                  >
                    X
                  </button>
                </div>
                <pre
                  ref={codeViewerRef}
                  className="flex-1 overflow-auto p-4 text-xs leading-relaxed font-mono"
                >
                  <code
                    className="block"
                    dangerouslySetInnerHTML={{ __html: hl(selectedFile.content) }}
                  />
                </pre>
              </div>
            )}

            {/* Error */}
            {err && (
              <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20 shrink-0">
                <p className="text-xs text-red-300">{err}</p>
              </div>
            )}
          </div>

        {/* Footer */}
        {files.length > 0 && (
          <div className="px-4 py-1.5 border-t border-white/5 bg-gray-950/50 shrink-0">
            <p className="text-[10px] text-muted-foreground">{files.length} files</p>
          </div>
        )}
        </div>
      </div>

      {/* Syntax highlight styles */}
      <style>{`.ck{color:#c084fc;font-weight:500}.cs{color:#34d399}.cc{color:#6b7280;font-style:italic}.cn{color:#f59e0b}.ct{color:#60a5fa}`}</style>
    </ErrorBoundary>
  )
}

function buildPreviewHtml(files: FileEntry[]): string {
  const css = files
    .filter((f) => f.path.endsWith('.css'))
    .map((f) => f.content)
    .join('\n')
  const app = files.find((f) => f.path === 'src/App.tsx' || f.path === 'App.tsx')
  const others = files.filter(
    (f) =>
      !f.path.endsWith('.css') &&
      f.path !== 'src/App.tsx' &&
      f.path !== 'App.tsx' &&
      f.path !== 'src/main.tsx'
  )

  if (!app) {
    const items = files.map((f) => '<li>' + esc(f.path) + '</li>').join('')
    return (
      '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Files</title></head>' +
      '<body style="background:#030712;color:#f9fafb;font-family:system-ui;padding:2rem">' +
      '<h1>Generated Files</h1><ul>' +
      items +
      '</ul></body></html>'
    )
  }

  let decls = ''
  for (const f of others) {
    const safeContent = JSON.stringify(f.content)
    decls += '// ' + f.path + '\n'
    decls += 'try{var s=' + safeContent + ';'
    decls += 'var r=Babel.transform(s,{presets:["react","typescript"]}).code;'
    decls += 'r=r.replace(/import\\s+[\\s\\S]*?from\\s+["\'][\\s\\S]*?["\']\\s*;?/g,"");'
    decls += 'r=r.replace(/export\\s+default\\s+/g,"return ");'
    decls += 'r=r.replace(/export\\s+/g,"");'
    decls += 'var C=new Function("React","ReactDOM",r);'
    decls += 'C(window.React,window.ReactDOM);'
    decls += '}catch(e){console.error("' + f.path + '",e)}'
  }

  const appContent = JSON.stringify(app.content)

  return (
    '<!DOCTYPE html><html lang="en"><head>' +
    '<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">' +
    '<title>Preview</title>' +
    '<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>' +
    '<script src="https://unpkg.com/@babel/preset-typescript@7.24.1/lib/index.js"></script>' +
    '<script src="https://unpkg.com/react@18/umd/react.production.min.js" crossOrigin="anonymous"></script>' +
    '<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossOrigin="anonymous"></script>' +
    '<script src="https://cdn.tailwindcss.com"></script>' +
    '<style>*{margin:0;padding:0;box-sizing:border-box}' +
    css +
    '</style>' +
    '</head><body>' +
    '<div id="root"></div>' +
    '<script>window.React=React;window.ReactDOM=ReactDOM;' +
    'window.cn=function(){return Array.from(arguments).filter(Boolean).join(" ")};' +
    'window.__ui=window.__ui||{};' +
    '["button","card","input"].forEach(function(m){window.__ui[m]=window.__ui[m]||{Button:function(){return null}}});' +
    decls +
    'try{' +
    'var a=' +
    appContent +
    ';' +
    'var t=Babel.transform(a,{presets:["react","typescript"]}).code;' +
    't=t.replace(/import\\s+[\\s\\S]*?from\\s+["\'][\\s\\S]*?["\']\\s*;?/g,"");' +
    't=t.replace(/export\\s+default\\s+/g,"return ");' +
    't=t.replace(/export\\s+/g,"");' +
    'var C=new Function("React","ReactDOM",t)(window.React,window.ReactDOM);' +
    'ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(C));' +
    '}catch(e){' +
    'document.getElementById("root").innerHTML="<div style=\\"padding:2rem;color:#ef4444;\\"><h3>Error</h3><pre>"+JSON.stringify(e.message||e)+"</pre></div>"}' +
    '</script></body></html>'
  )
}

function buildEmptyHtml(): string {
  return (
    '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Preview</title>' +
    '<style>*{margin:0;padding:0;box-sizing:border-box}' +
    'body{font-family:system-ui,sans-serif;background:#030712;display:flex;align-items:center;justify-content:center;min-height:100vh}</style>' +
    '</head><body>' +
    '<div style="text-align:center;color:#6b7280;">' +
    '<div style="font-size:3rem;margin-bottom:1rem;">&#127912;</div>' +
    '<h2 style="font-size:1.25rem;font-weight:600;color:#d1d5db;margin-bottom:0.5rem;">No files to preview</h2>' +
    '<p style="font-size:0.875rem;">Generate code from your designs.</p>' +
    '</div></body></html>'
  )
}
