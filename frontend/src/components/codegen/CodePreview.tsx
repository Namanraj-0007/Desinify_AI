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

/**
 * Escape content for safe embedding in an inline <script> tag inside srcdoc.
 */
const escapeForScript = (content: string): string => {
  return content
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$')
    .replace(/<\/script>/gi, '<\\/script>')
}

/**
 * Build a complete HTML document that includes all component code
 * and renders it using Babel Standalone + React UMD (no ES modules needed).
 */
function buildPreviewHtml(files: FileEntry[]): string {
  const allCss = files
    .filter((f) => f.path.endsWith('.css'))
    .map((f) => f.content)
    .join('\n')

  // Find main App entry point
  const appFile = files.find(
    (f) => f.path === 'src/App.tsx' || f.path === 'App.tsx'
  )

  // All non-CSS, non-main files
  const otherFiles = files.filter(
    (f) =>
      !f.path.endsWith('.css') &&
      f.path !== 'src/App.tsx' &&
      f.path !== 'App.tsx' &&
      f.path !== 'src/main.tsx' &&
      !f.path.includes('node_modules')
  )

  // If we have an App.tsx, build a live preview
  if (appFile) {
    const escapedAppCode = escapeForScript(appFile.content)
    const escapedOtherFiles = otherFiles.map((f) => ({
      path: f.path,
      content: escapeForScript(f.content),
    }))

    let componentDeclarations = ''
    for (const f of escapedOtherFiles) {
      const varName = 'comp_' + f.path
        .replace(/^(src\/)?/, '')
        .replace(/\.(tsx|ts|jsx|js)$/, '')
        .replace(/[/\\]/g, '_')
        .replace(/[^a-zA-Z0-9_]/g, '_')
      componentDeclarations += `
// === ${f.path} ===
;(function() {
  var source = \`${f.content}\`;
  try {
    var result = Babel.transform(source, {
      presets: ['react', 'typescript'],
      filename: '${f.path}',
    }).code;
    // Strip import/export statements since React/ReactDOM are globals
    result = result.replace(/import\\s+[\\s\\S]*?from\\s+['"][\\s\\S]*?['"]\\s*;?/g, '');
    result = result.replace(/import\\s+['"][\\s\\S]*?['"]\\s*;?/g, '');
    result = result.replace(/export\\s+default\\s+/g, 'window.${varName}_default = ');
    result = result.replace(/export\\s+\\{\\s*([^}]+)\\s*\\}/g, 'window.${varName}_exports = { $1 }');
    result = result.replace(/export\\s+(const|let|var|function|class|interface|type)\\s+/g, 'window.${varName}_$1 ');
    result = result.replace(/interface\\s+\\w+[\\s\\S]*?\\{[\\s\\S]*?\\}/g, '');
    result = result.replace(/type\\s+\\w+[\\s\\S]*?=\\s*[\\s\\S]*?;/g, '');
    (new Function('React', 'ReactDOM', result))(window.React, window.ReactDOM);
  } catch(e) {
    console.error('Failed to compile ${f.path}:', e);
  }
})();
`
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Live Preview</title>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/framer-motion@11/dist/es/index.mjs" type="module"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #030712; color: #f9fafb; }
    #root { min-height: 100vh; }
    ${escapeForScript(allCss)}
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
    // Polyfill for framer-motion UMD access
    window.React = React;
    window.ReactDOM = ReactDOM;

    // Register naive cn utility if missing
    if (typeof window.cn === 'undefined') {
      window.cn = function() {
        return Array.from(arguments).filter(Boolean).join(' ');
      };
    }

    // Register shadcn/ui stubs so components don't crash on missing imports
    window.__ui = window.__ui || {};
    var uiModules = ['button', 'card', 'input', 'badge', 'dialog', 'dropdown-menu', 'avatar', 'separator', 'sheet', 'toast', 'tooltip', 'skeleton', 'select', 'switch', 'label', 'textarea', 'form'];
    uiModules.forEach(function(mod) {
      window.__ui[mod] = window.__ui[mod] || { Button: function() { return null; }, default: function() { return null; } };
    });

    // Compile and register all component files
    ${componentDeclarations}

    // Now compile and render App.tsx
    try {
      var appCode = \`${escapedAppCode}\`;
      var appTransformed = Babel.transform(appCode, {
        presets: ['react', 'typescript'],
        filename: 'App.tsx',
      }).code;
      appTransformed = appTransformed.replace(/import\\s+[\\s\\S]*?from\\s+['"][\\s\\S]*?['"]\\s*;?/g, '');
      appTransformed = appTransformed.replace(/import\\s+['"][\\s\\S]*?['"]\\s*;?/g, '');
      appTransformed = appTransformed.replace(/export\\s+default\\s+/g, 'return ');
      appTransformed = appTransformed.replace(/export\\s+/g, '');

      var AppComponent = (new Function('React', 'ReactDOM', appTransformed))(window.React, window.ReactDOM);
      var root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(React.createElement(AppComponent));
    } catch(e) {
      document.getElementById('root').innerHTML =
        '<div style="padding:2rem;text-align:center;color:#ef4444;max-width:48rem;margin:0 auto;">' +
        '<h3 style="font-size:1.25rem;font-weight:600;margin-bottom:0.5rem;">&#9888;&#65039; Compilation Error</h3>' +
        '<pre style="margin-top:0.75rem;font-size:0.75rem;color:#fca5a5;text-align:left;background:rgba(239,68,68,0.1);padding:1rem;border-radius:0.5rem;overflow-x:auto;white-space:pre-wrap;word-break:break-word;">' + escapeForScript(e.message || e) + '</pre>' +
        '</div>';
    }
  </script>
</body>
</html>`
  }

  // No App.tsx found - show file list as fallback
  const fileListItems = files
    .map((f) => `<li style="padding:0.5rem 0.75rem;border-bottom:1px solid rgba(255,255,255,0.1);color:#d1d5db;font-size:0.875rem;display:flex;align-items:center;gap:0.5rem;">
      <span>📄</span>
      <code style="font-family:monospace;">${escapeForScript(f.path)}</code>
      <span style="margin-left:auto;color:#6b7280;font-size:0.75rem;">${escapeForScript((f.content.length / 1024).toFixed(1))} KB</span>
    </li>`)
    .join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Preview - File List</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #030712; color: #f9fafb; }
  </style>
</head>
<body>
  <div class="p-6 max-w-3xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-white">Generated Code</h1>
        <p class="text-sm text-gray-400 mt-1">${files.length} files generated</p>
      </div>
      <div class="text-2xl">🎉</div>
    </div>
    <div class="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
      <div class="px-4 py-3 border-b border-white/10 flex items-center gap-2">
        <span class="text-xs font-medium text-gray-400">All Files</span>
        <span class="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">${files.length}</span>
      </div>
      <ul class="divide-y divide-white/5" style="list-style:none;">
        ${fileListItems}
      </ul>
    </div>
    <p class="text-sm text-gray-500 mt-4 text-center">
      Select or generate an App.tsx entry point to see a live preview.
    </p>
  </div>
</body>
</html>`
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
    if (files.length === 0) {
      return buildEmptyHtml()
    }
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

  const handleRefresh = () => {
    setPreviewKey((k) => k + 1)
    onRefresh?.()
  }

  const isPreviewRenderable = files.some(
    (f) => f.path === 'src/App.tsx' || f.path === 'App.tsx'
  )

  const selectedFile = selectedFilePath
    ? files.find((f) => f.path === selectedFilePath)
    : null

  // Auto-scroll code viewer when file changes
  useEffect(() => {
    if (codeViewerRef.current && showCodeViewer) {
      codeViewerRef.current.scrollTop = 0
    }
  }, [selectedFilePath, showCodeViewer])

  // Build a folder tree structure
  const folderTree = useMemo(() => {
    const tree: Record<string, { name: string; files: typeof files; subfolders: Record<string, any> }> = {}
    for (const f of files) {
      const parts = f.path.split('/')
      if (parts.length === 1) {
        const root = tree['__root__'] || { name: '/', files: [], subfolders: {} }
        root.files.push(f)
        tree['__root__'] = root
      } else {
        const dir = parts.slice(0, -1).join('/')
        if (!tree[dir]) {
          tree[dir] = { name: parts[parts.length - 2], files: [], subfolders: {} }
        }
        tree[dir].files.push(f)
      }
    }
    return tree
  }, [files])

  // Highlight code as basic HTML with syntax spans
  const highlightCode = (code: string, ext: string): string => {
    const escaped = escapeHtml(code)

    // Apply syntax highlighting spans on the escaped HTML
    // Comments: // single line or /* multi-line */
    let highlighted = escaped.replace(
      /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g,
      '<span class="code-comment">$1</span>'
    )
    // Strings: single/double quoted or template literals
    highlighted = highlighted.replace(
      /('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)/g,
      '<span class="code-string">$1</span>'
    )
    // Numbers
    highlighted = highlighted.replace(
      /\b(\d+\.?\d*)\b/g,
      '<span class="code-number">$1</span>'
    )
    // JSX tags: match <tag or </tag patterns (already escaped)
    if (ext === 'tsx' || ext === 'jsx') {
      highlighted = highlighted.replace(
      /(<\/?)([a-zA-Z][\w.-]*)/g,
      '$1<span class="code-tag">$2</span>'
      )
    }
    // Keywords
    highlighted = highlighted.replace(
      /\b(import|export|default|from|const|let|var|function|return|if|else|for|while|class|extends|interface|type|async|await|try|catch|throw|new|this|super|typeof|instanceof|void|null|undefined|true|false|case|switch|break|continue|yield|enum|implements|private|protected|public|readonly|static|abstract|declare|namespace|module|require|as|any|boolean|number|string|object|symbol|never|unknown|bigint)\b/g,
      '<span class="code-keyword">$1</span>'
    )

    return highlighted
  }

  const escapeHtml = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/'/g, '&#039;')
  }

  const getFileExt = (path: string): string => {
    const parts = path.split('.')
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-full">
        {/* Top toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-gray-950/80">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              {isPreviewRenderable ? 'Live Preview' : 'File Browser'}
            </span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded ${
                isPreviewRenderable
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-yellow-500/20 text-yellow-300'
              }`}
            >
              {isPreviewRenderable ? 'App.tsx ✓' : 'No entry point'}
            </span>
            <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 rounded bg-white/5">
              {files.length} files
            </span>
            <button
              onClick={() => setShowFilePanel(!showFilePanel)}
              className={`text-[10px] px-2 py-1 rounded transition-colors ${
                showFilePanel
                  ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/30'
                  : 'text-muted-foreground hover:text-white hover:bg-white/5'
              }`}
            >
              📁 Files
            </button>
            {selectedFile && (
              <button
                onClick={() => setShowCodeViewer(!showCodeViewer)}
                className={`text-[10px] px-2 py-1 rounded transition-colors ${
                  showCodeViewer
                    ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30'
                    : 'text-muted-foreground hover:text-white hover:bg-white/5'
                }`}
              >
                {showCodeViewer ? '📝 Hide Code' : '📝 View Code'}
              </button>
            )}
            {isPreviewRenderable && (
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
                    title={`${d.toUpperCase()} - ${DEVICE_DIMS[d].w}x${DEVICE_DIMS[d].h}`}
                  >
                    {d === 'mobile' && '📱'}
                    {d === 'tablet' && '📟'}
                    {d === 'laptop' && '💻'}
                    {d === 'desktop' && '🖥️'}
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
            <span className={refreshing ? 'animate-spin' : ''}>↻</span>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Folder Structure Panel */}
          {showFilePanel && files.length > 0 && (
            <div className="w-64 border-r border-white/10 bg-gray-950/50 overflow-y-auto flex-shrink-0">
              <div className="p-3 border-b border-white/10">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Project Files
                </h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {files.length} file{files.length !== 1 ? 's' : ''} ·{' '}
                  {files.reduce((acc, f) => acc + f.content.length, 0).toLocaleString()} chars
                </p>
              </div>
              <div className="p-2 space-y-0.5">
                {Object.entries(folderTree).map(([dirPath, dirData]) => (
                  <div key={dirPath}>
                    {dirPath !== '__root__' && (
                      <div className="flex items-center gap-1.5 px-2 py-1.5 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                        📁 <span>{dirPath}</span>
                        <span className="text-[9px] text-muted-foreground">({dirData.files.length})</span>
                      </div>
                    )}
                    {dirData.files.map((f) => (
                      <button
                        key={f.path}
                        onClick={() => {
                          setSelectedFilePath(f.path)
                          setShowCodeViewer(true)
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-1.5 text-left rounded-md transition-colors ${
                          selectedFilePath === f.path
                            ? 'bg-indigo-500/15 text-indigo-200 border border-indigo-500/30'
                            : 'text-muted-foreground hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span className="text-xs shrink-0">
                          {f.path.endsWith('.tsx') || f.path.endsWith('.jsx')
                            ? '⚛️'
                            : f.path.endsWith('.ts')
                              ? '🔷'
                              : f.path.endsWith('.css')
                                ? '🎨'
                                : f.path.endsWith('.json')
                                  ? '📋'
                                  : f.path.endsWith('.html')
                                    ? '🌐'
                                    : '📄'}
                        </span>
                        <span className="text-[11px] truncate flex-1">
                          {f.path.split('/').pop()}
                        </span>
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

          {/* Main content area: Preview + Code Viewer */}
          <div className="flex-1 flex flex-col">
            {/* Preview iframe */}
            <div className={`${showCodeViewer && selectedFile ? 'flex-1 min-h-0' : 'flex-1'} flex items-center justify-center bg-black/60 p-4 overflow-auto`}>
              <div
                className="bg-[#030712] rounded-lg shadow-2xl overflow-hidden transition-all duration-300 border border-white/10"
                style={{
                  width: isPreviewRenderable
                    ? Math.min(cur.w, typeof window !== 'undefined' ? window.innerWidth - 48 : 1400)
                    : '100%',
                  height: isPreviewRenderable
                    ? Math.min(cur.h, typeof window !== 'undefined' ? window.innerHeight - 200 : 900)
                    : '100%',
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

            {/* Code Viewer Panel */}
            {showCodeViewer && selectedFile && (
              <div className="border-t border-white/10 bg-gray-950/90 flex flex-col" style={{ maxHeight: '40%', minHeight: '120px' }}>
                <div className="flex items-center justify-between px-4 py-1.5 border-b border-white/10 bg-gray-950/80 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-amber-300">📝 Code</span>
                    <span className="text-[10px] text-muted-foreground">{selectedFile.path}</span>
                    <span className="text-[9px] text-muted-foreground bg-white/5 px-1.5 py-0.5 rounded">
                      {getFileExt(selectedFile.path).toUpperCase()}
                    </span>
                    <span className="text-[9px] text-muted-foreground">
                      {selectedFile.content.split('\n').length} lines · {selectedFile.content.length.toLocaleString()} chars
                    </span>
                  </div>
                  <button
                    onClick={() => setShowCodeViewer(false)}
                    className="text-[10px] text-muted-foreground hover:text-white transition-colors px-1.5 py-0.5"
                  >
                    ✕
                  </button>
                </div>
                <pre
                  ref={codeViewerRef}
                  className="flex-1 overflow-auto p-4 text-xs leading-relaxed font-mono"
                >
                  <code
                    className="block"
                    dangerouslySetInnerHTML={{
                      __html: highlightCode(selectedFile.content, getFileExt(selectedFile.path))
                    }}
                  />
                </pre>
              </div>
            )}

            {/* Error banner */}
            {err && (
              <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20 shrink-0">
                <p className="text-xs text-red-300">{err}</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        {files.length > 0 && (
          <div className="px-4 py-1.5 border-t border-white/5 bg-gray-950/50 shrink-0">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-muted-foreground">
                {files.length} files ·{' '}
                {files.reduce((acc, f) => acc + f.content.length, 0).toLocaleString()} chars
                {selectedFile && <> · Selected: <span className="text-indigo-300">{selectedFile.path}</span> ({selectedFile.content.length.toLocaleString()} chars)</>}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {isPreviewRenderable
                  ? 'Live rendering · Generated code'
                  : 'No App.tsx — showing file structure'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Inline styles for syntax highlighting */}
      <style>{`
        .code-keyword { color: #c084fc; font-weight: 500; }
        .code-string { color: #34d399; }
        .code-comment { color: #6b7280; font-style: italic; }
        .code-number { color: #f59e0b; }
        .code-tag { color: #60a5fa; }
      `}</style>
    </ErrorBoundary>
  )
}

function buildEmptyHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Preview</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #030712; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
  </style>
</head>
<body>
  <div style="text-align: center; color: #6b7280;">
    <div style="font-size: 3rem; margin-bottom: 1rem;">🎨</div>
    <h2 style="font-size: 1.25rem; font-weight: 600; color: #d1d5db; margin-bottom: 0.5rem;">No files to preview</h2>
    <p style="font-size: 0.875rem; max-width: 24rem; line-height: 1.5;">
      Generate code from your Figma designs to see a live preview here. Each file will be compiled and rendered in real-time.
    </p>
  </div>
</body>
</html>`
}

