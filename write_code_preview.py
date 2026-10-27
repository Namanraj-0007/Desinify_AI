import os

path = r'c:\Users\harsh\OneDrive\Desktop\DesinifyAI\frontend\src\components\codegen\CodePreview.tsx'

content = """import { useState, useRef, useEffect, useMemo } from 'react'
import { ErrorBoundary } from './ErrorBoundary'

type FileEntry = {
  path: string
  content: string
}

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
  return s.replace(/\\\\/g, '\\\\\\\\').replace(/`/g, '\\\\`').replace(/\\$/g, '\\\\$').replace(/<\\/script>/gi, '<\\\\/script>')
}

function buildPreviewHtml(files: FileEntry[]): string {
  const allCss = files.filter(f => f.path.endsWith('.css')).map(f => f.content).join('\\n')
  const appFile = files.find(f => f.path === 'src/App.tsx' || f.path === 'App.tsx')
  const otherFiles = files.filter(f => !f.path.endsWith('.css') && f.path !== 'src/App.tsx' && f.path !== 'App.tsx' && f.path !== 'src/main.tsx' && !f.path.includes('node_modules'))

  if (appFile) {
    const eApp = esc(appFile.content)
    let compDecl = ''
    for (const f of otherFiles) {
      const n = 'c_' + f.path.replace(/^(src\\\\/)?/, '').replace(/\\.(tsx|ts|jsx|js)$/, '').replace(/[\\\\/]/g, '_').replace(/[^a-zA-Z0-9_]/g, '_')
      const eF = esc(f.content)
      compDecl += '// FILE: ' + f.path + '\\n'
      compDecl += '(function(){\\n'
      compDecl += 'var s = `' + eF + '`;\\n'
      compDecl += 'try {\\n'
      compDecl += 'var r = Babel.transform(s,{presets:["react","typescript"],filename:"' + f.path + '"}).code;\\n'
      compDecl += 'r = r.replace(/import\\\\s+[\\\\s\\\\S]*?from\\\\s+[\\"\\'][\\\\s\\\\S]*?[\\"\\']\\\\s*;?/g,"");\\n'
      compDecl += 'r = r.replace(/import\\\\s+[\\"\\'][\\\\s\\\\S]*?[\\"\\']\\\\s*;?/g,"");\\n'
      compDecl += 'r = r.replace(/export\\\\s+default\\\\s+/g,"window.' + n + '_default=");\\n'
      compDecl += 'r = r.replace(/export\\\\s+\\\\{\\\\s*([^}]+)\\\\s*\\\\}/g,"window.' + n + '_exports={$1}");\\n'
      compDecl += 'r = r.replace(/export\\\\s+(const|let|var|function|class|interface|type)\\\\s+/g,"window.' + n + '_$1 ");\\n'
      compDecl += 'r = r.replace(/interface\\\\s+\\\\w+[\\\\s\\\\S]*?\\\\{[\\\\s\\\\S]*?\\\\}/g,"");\\n'
      compDecl += 'r = r.replace(/type\\\\s+\\\\w+[\\\\s\\\\S]*?=\\\\s*[\\\\s\\\\S]*?;/g,"");\\n'
      compDecl += '(new Function("React","ReactDOM",r))(window.React,window.ReactDOM);\\n'
      compDecl += '} catch(e) { console.error("' + f.path + '",e); }\\n'
      compDecl += '})();\\n\\n'
    }

    let html = '<!DOCTYPE html>\\n<html lang="en">\\n<head>\\n'
    html += '<meta charset="UTF-8" />\\n'
    html += '<meta name="viewport" content="width=device-width,initial-scale=1.0" />\\n'
    html += '<title>Live Preview</title>\\n'
    html += '<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>\\n'
    html += '<script src="https://unpkg.com/@babel/preset-typescript@7.24.1/lib/index.js"></script>\\n'
    html += '<script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>\\n'
    html += '<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>\\n'
    html += '<script src="https://cdn.tailwindcss.com"></script>\\n'
    html += '<style>\\n'
    html += '*{margin:0;padding:0;box-sizing:border-box;}\\n'
    html += 'body{font-family:system-ui,sans-serif;background:#030712;color:#f9fafb;}\\n'
    html += '#root{min-height:100vh;}\\n'
    html += allCss + '\\n'
    html += '</style>\\n</head>\\n<body>\\n'
    html += '<div id="root"></div>\\n'
    html += '<script>\\n'
    html += 'window.React=React;window.ReactDOM=ReactDOM;\\n'
    html += 'window.cn=function(){return Array.from(arguments).filter(Boolean).join(" ")};\\n'
    html += 'window.__ui=window.__ui||{};\\n'
    html += '["button","card","input","badge","dialog","dropdown-menu","avatar","separator","sheet","toast","tooltip","skeleton","select","switch","label","textarea","form"].forEach(function(m){\\n'
    html += 'window.__ui[m]=window.__ui[m]||{Button:function(){return null},default:function(){return null}};\\n'
    html += '});\\n\\n'
    html += compDecl + '\\n'
    html += 'try{\\n'
    html += 'var a=`' + eApp + '`;\\n'
    html += 'var t=Babel.transform(a,{presets:["react","typescript"],filename:"App.tsx"}).code;\\n'
    html += 't=t.replace(/import\\\\s+[\\\\s\\\\S]*?from\\\\s+[\\"\\'][\\\\s\\\\S]*?[\\"\\']\\\\s*;?/g,"");\\n'
    html += 't=t.replace(/import\\\\s+[\\"\\'][\\\\s\\\\S]*?[\\"\\']\\\\s*;?/g,"");\\n'
    html += 't=t.replace(/export\\\\s+default\\\\s+/g,"return ");\\n'
    html += 't=t.replace(/export\\\\s+/g,"");\\n'
    html += 'var C=(new Function("React","ReactDOM",t))(window.React,window.ReactDOM);\\n'
    html += 'ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(C));\\n'
    html += '}catch(e){\\n'
    html += 'document.getElementById("root").innerHTML="<div style=\\\\'padding:2rem;text-align:center;color:#ef4444;\\\\'><h3>Compilation Error</h3><pre style=\\\\'margin-top:0.75rem;font-size:0.75rem;color:#fca5a5;background:rgba(239,68,68,0.1);padding:1rem;border-radius:0.5rem;overflow-x:auto;white-space:pre-wrap;\\\\'>" + esc(e.message||e) + "</pre></div>";\\n'
    html += '}\\n'
    html += '</script>\\n</body>\\n</html>'
    return html
  }

  const items = files.map(f =>
    '<li style="padding:0.5rem 0.75rem;border-bottom:1px solid rgba(255,255,255,0.1);color:#d1d5db;font-size:0.875rem;display:flex;align-items:center;gap:0.5rem;"><code style="font-family:monospace;">' + esc(f.path) + '</code><span style="margin-left:auto;color:#6b7280;font-size:0.75rem;">' + (f.content.length / 1024).toFixed(1) + ' KB</span></li>'
  ).join('\\n')

  return '<!DOCTYPE html>\\n<html lang="en">\\n<head>\\n<meta charset="UTF-8" />\\n<title>Code Browser</title>\\n<script src="https://cdn.tailwindcss.com"></script>\\n<style>\\n*{margin:0;padding:0;box-sizing:border-box}\\nbody{font-family:system-ui,sans-serif;background:#030712;color:#f9fafb}\\n</style>\\n</head>\\n<body>\\n<div class="p-6 max-w-3xl mx-auto">\\n<h1 class="text-2xl font-bold text-white">Generated Code</h1>\\n<p class="text-sm text-gray-400 mt-1">' + files.length + ' files</p>\\n<div class="rounded-xl border border-white/10 bg-white/5 overflow-hidden mt-4"><ul class="divide-y divide-white/5" style="list-style:none;">' + items + '</ul></div>\\n<p class="text-sm text-gray-500 mt-4 text-center">Generate an App.tsx to see a live preview.</p>\\n</div>\\n</body>\\n</html>'
}

function buildEmptyHtml(): string {
  return '<!DOCTYPE html>\\n<html lang="en">\\n<head>\\n<meta charset="UTF-8" />\\n<title>Preview</title>\\n<style>\\n*{margin:0;padding:0;box-sizing:border-box}\\nbody{font-family:system-ui,sans-serif;background:#030712;display:flex;align-items:center;justify-content:center;min-height:100vh}\\n</style>\\n</head>\\n<body>\\n<div style="text-align:center;color:#6b7280;">\\n<div style="font-size:3rem;margin-bottom:1rem;">&#127912;</div>\\n<h2 style="font-size:1.25rem;font-weight:600;color:#d1d5db;margin-bottom:0.5rem;">No files to preview</h2>\\n<p style="font-size:0.875rem;max-width:24rem;line-height:1.5;">Generate code from your Figma designs to see a live preview here.</p>\\n</div>\\n</body>\\n</html>'
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
  const isPreviewRenderable = files.some(f => f.path === 'src/App.tsx' || f.path === 'App.tsx')
  const selectedFile = selectedFilePath ? files.find(f => f.path === selectedFilePath) : null

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

  const hl = (code: string, ext: string): string => {
    const e = code.replace(/&/g, '&amp;').replace(/</g, '<').replace(/>/g, '>')
    let r = e.replace(/(\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)/g, '<span class="code-comment">$1</span>')
    r = r.replace(/('(?:[^'\\\\]|\\\\.)*'|"(?:[^"\\\\]|\\\\.)*"|`(?:[^`\\\\]|\\\\.)*`)/g, '<span class="code-string">$1</span>')
    r = r.replace(/\\b(\\d+\\.?\\d*)\\b/g, '<span class="code-number">$1</span>')
    if (ext === 'tsx' || ext === 'jsx') r = r.replace(/(<\\/?)([a-zA-Z][\\w.-]*)/g, '$1<span class="code-tag">$2</span>')
    r = r.replace(/\\b(import|export|default|from|const|let|var|function|return|if|else|for|while|class|extends|interface|type|async|await|try|catch|throw|new|this|super|typeof|instanceof|void|null|undefined|true|false|case|switch|break|continue|yield|enum|implements|private|protected|public|readonly|static|abstract|declare|namespace|module|require|as|any|boolean|number|string|object|symbol|never|unknown|bigint)\\b/g, '<span class="code-keyword">$1</span>')
    return r
  }

  const getExt = (p: string): string => { const parts = p.split('.'); return parts.length > 1 ? parts[parts.length-1].toLowerCase() : '' }

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-gray-950/80 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">{isPreviewRenderable ? 'Live Preview' : 'Code Browser'}</span>
            <span className={'text-[10px] px-1.5 py-0.5 rounded ' + (isPreviewRenderable ? 'bg-emerald-500/20 text-emerald-300' : 'bg-yellow-500/20 text-yellow-300')}>{isPreviewRenderable ? 'App.tsx' : files.length + ' files'}</span>
            <button onClick={() => setShowFilePanel(!showFilePanel)} className={'text-[10px] px-2 py-1 rounded transition-colors ' + (showFilePanel ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/30' : 'text-muted-foreground hover:text-white hover:bg-white/5')}>{showFilePanel ? 'Hide Files' : 'Files'}</button>
            {isPreviewRenderable && (
              <div className="flex items-center gap-1 ml-2">
                {(Object.keys(DEVICE_DIMS) as DeviceMode[]).map(d => (
                  <button key={d} onClick={() => setDevice(d)}
                    className={'px-2 py-1 text-xs rounded-md transition-colors ' + (device === d ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/30' : 'text-muted-foreground hover:text-white hover:bg-white/5')}
                    title={d.toUpperCase() + ' ' + DEVICE_DIMS[d].w + 'x' + DEVICE_DIMS[d].h}>
                    {d === 'mobile' ? 'Phone' : d === 'tablet' ? 'Tablet' : 'Desktop'}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => { setPreviewKey(k=>k+1); onRefresh?.() }} disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 transition-colors">
            <span className={refreshing ? 'animate-spin' : ''}>Refresh</span>
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {showFilePanel && files.length > 0 && (
            <div className="w-64 border-r border-white/10 bg-gray-950/50 overflow-y-auto flex-shrink-0">
              <div className="p-3 border-b border-white/10">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Project Files</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">{files.length} files</p>
              </div>
              <div className="p-2 space-y-0.5">
                {Object.entries(folderTree).map(([dirPath, dirData]) => (
                  <div key={dirPath}>
                    {dirPath !== '__root__' && (
                      <div className="flex items-center gap-1.5 px-2 py-1.5 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">dir {dirPath} ({dirData.files.length})</div>
                    )}
                    {dirData.files.map(f => (
                      <button key={f.path} onClick={() => { setSelectedFilePath(f.path); setShowCodeViewer(true) }}
                        className={'w-full flex items-center gap-2 px-3 py-1.5 text-left rounded-md transition-colors ' + (selectedFilePath === f.path ? 'bg-indigo-500/15 text-indigo-200 border border-indigo-500/30' : 'text-muted-foreground hover:text-white hover:bg-white/5')}>
                        <span className="text-xs shrink-0">{f.path.endsWith('.tsx') || f.path.endsWith('.jsx') ? 'tsx' : f.path.endsWith('.ts') ? 'ts' : f.path.endsWith('.css') ? 'css' : f.path.endsWith('.json') ? 'json' : f.path.endsWith('.html') ? 'html' : 'file'}</span>
                        <span className="text-[11px] truncate flex-1">{f.path.split('/').pop()}</span>
                        <span className="text-[9px] text-muted-foreground shrink-0">{(f.content.length / 1024).toFixed(1)}k</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
          )}

          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 flex items-center justify-center bg-black/60 p-4 overflow-auto">
              <div className="bg-[#030712] rounded-lg shadow-2xl overflow-hidden transition-all duration-300 border border-white/10"
                style={{
                  width: isPreviewRenderable ? Math.min(cur.w, window.innerWidth - 48) : '100%',
                  height: isPreviewRenderable ? Math.min(cur.h, window.innerHeight - 200) : '100%',
                  maxWidth: '100%',
                  maxHeight: '100%',
                }}>
                <iframe key={previewKey} ref={iframeRef} title="Code Preview" className="w-full h-full" sandbox="allow-scripts allow-same-origin allow-modals allow-popups" />
              </div>

            {showCodeViewer && selectedFile && (
              <div className="border-t border-white/10 bg-gray-950/90 flex flex-col" style={{ maxHeight: '40%', minHeight: '120px' }}>
                <div className="flex items-center justify-between px-4 py-1.5 border-b border-white/10 bg-gray-950/80 shrink-0">
                  <span className="text-[10px] font-medium text-amber-300">Code</span>
                  <span className="text-[10px] text-muted-foreground">{selectedFile.path}</span>
                  <span className="text-[9px] text-muted-foreground bg-white/5 px-1.5 py-0.5 rounded">{getExt(selectedFile.path).toUpperCase()}</span>
                  <span className="text-[9px] text-muted-foreground">{selectedFile.content.split('\\n').length} lines</span>
                  <button onClick={() => setShowCodeViewer(false)} className="text-[10px] text-muted-foreground hover:text-white">X</button>
                </div>
                <pre ref={codeViewerRef} className="flex-1 overflow-auto p-4 text-xs leading-relaxed font-mono">
                  <code className="block" dangerouslySetInnerHTML={{ __html: hl(selectedFile.content, getExt(selectedFile.path)) }} />
                </pre>
              </div>
            )}

            {err && (
              <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20 shrink-0">
                <p className="text-xs text-red-300">{err}</p>
              </div>
            )}
          </div>

        {files.length > 0 && (
          <div className="px-4 py-1.5 border-t border-white/5 bg-gray-950/50 shrink-0">
            <p className="text-[10px] text-muted-foreground">{files.length} files</p>
          </div>
        )}
      </div>

      <style>{'\\n.code-keyword{color:#c084fc;font-weight:500}' + '\\n.code-string{color:#34d399}' + '\\n.code-comment{color:#6b7280;font-style:italic}' + '\\n.code-number{color:#f59e0b}' + '\\n.code-tag{color:#60a5fa}' + '\\n'}</style>
    </ErrorBoundary>
  )
}
"""

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Written successfully')
print(f'File size: {os.path.getsize(path)} bytes')
