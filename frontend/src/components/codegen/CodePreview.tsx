import { useState, useRef, useEffect, useMemo } from 'react'
import { ErrorBoundary } from './ErrorBoundary'

type FileEntry = { path: string; content: string }

interface Props {
  files: FileEntry[]
  onRefresh?: () => void
  refreshing?: boolean
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '<').replace(/>/g, '>')
}

export const CodePreview = ({ files, onRefresh, refreshing }: Props) => {
  const [showFilePanel, setShowFilePanel] = useState(true)
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const codeViewerRef = useRef<HTMLPreElement>(null)

  const selectedFile = selectedFilePath ? files.find((f) => f.path === selectedFilePath) : null

  useEffect(() => {
    if (codeViewerRef.current) codeViewerRef.current.scrollTop = 0
  }, [selectedFilePath])

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

  const filteredFiles = useMemo(() => {
    if (!searchTerm) return files
    const lower = searchTerm.toLowerCase()
    return files.filter(f => f.path.toLowerCase().includes(lower))
  }, [files, searchTerm])

  const filteredTree = useMemo(() => {
    const tree: Record<string, { name: string; files: typeof filteredFiles }> = {}
    for (const f of filteredFiles) {
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
  }, [filteredFiles])

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

  // Pre-select first file when files change
  useEffect(() => {
    if (files.length > 0 && !selectedFilePath) {
      const appFile = files.find(f => f.path === 'src/App.tsx' || f.path === 'App.tsx')
      if (appFile) {
        setSelectedFilePath(appFile.path)
      } else {
        setSelectedFilePath(files[0].path)
      }
    }
  }, [files])

  if (files.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-950/20">
        <div className="text-center max-w-md px-4">
          <div className="text-3xl mb-4">&#128194;</div>
          <h2 className="font-display text-lg font-semibold mb-2 text-muted-foreground">No Files</h2>
          <p className="text-sm text-muted-foreground">
            Generated code files will appear here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-full">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-gray-950/80 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Generated Code
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
              {files.length} file{files.length !== 1 ? 's' : ''}
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
          </div>
          <button
            onClick={() => onRefresh?.()}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 transition-colors"
          >
            <span className={refreshing ? 'animate-spin inline-block' : ''}>&#8635;</span>
            Refresh
          </button>
        </div>

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          {/* File panel */}
          {showFilePanel && (
            <div className="w-64 border-r border-white/10 bg-gray-950/50 flex-shrink-0 flex flex-col">
              <div className="p-3 border-b border-white/10">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Files</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">{files.length} files</p>
              </div>
              <div className="p-2">
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-2 py-1 text-[10px] rounded bg-white/5 border border-white/10 text-white placeholder-muted-foreground focus:outline-none focus:border-indigo-500/50"
                />
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                {Object.entries(filteredTree).map(([dirPath, dirData]) => (
                  <div key={dirPath}>
                    {dirPath !== '__root__' && (
                      <div className="px-2 py-1.5 text-[10px] text-muted-foreground font-medium uppercase truncate">
                        {dirPath} ({dirData.files.length})
                      </div>
                    )}
                    {dirData.files.map((f) => (
                      <button
                        key={f.path}
                        onClick={() => { setSelectedFilePath(f.path) }}
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

          {/* Code viewer */}
          <div className="flex-1 flex flex-col min-w-0 bg-gray-950/30">
            {selectedFile ? (
              <>
                <div className="flex items-center justify-between px-4 py-1.5 border-b border-white/10 bg-gray-950/80 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-amber-300">Code</span>
                    <span className="text-[10px] text-muted-foreground">{selectedFile.path}</span>
                  </div>
                  <span className="text-[9px] text-muted-foreground">
                    {selectedFile.content.split('\n').length} lines &middot; {selectedFile.content.length} chars
                  </span>
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
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl mb-2">&#128196;</div>
                  <p className="text-xs text-muted-foreground">Select a file to view its code</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Syntax highlight styles */}
      <style>{`.ck{color:#c084fc;font-weight:500}.cs{color:#34d399}.cc{color:#6b7280;font-style:italic}.cn{color:#f59e0b}.ct{color:#60a5fa}`}</style>
    </ErrorBoundary>
  )
}

