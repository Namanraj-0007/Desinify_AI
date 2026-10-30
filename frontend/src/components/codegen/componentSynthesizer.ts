/**
 * Component Synthesizer for Desinify AI Live Sandbox
 * Converts multi-file React/TypeScript/Tailwind components into standalone renderable HTML.
 */

export type FileEntry = { path: string; content: string }

/**
 * Robust parenthesis-balancing JSX extractor.
 * Handles nested .map((item, i) => (...)), callbacks, and multi-line returns.
 */
export function extractJsxFromFunction(code: string): string {
  if (!code) return ''

  // 1. Look for 'return (' or 'return\n  ('
  const returnParenIdx = code.search(/return\s*\(/)
  if (returnParenIdx !== -1) {
    const startIdx = code.indexOf('(', returnParenIdx) + 1
    let depth = 1
    let inString = false
    let stringChar = ''
    let endIdx = startIdx

    for (let i = startIdx; i < code.length; i++) {
      const ch = code[i]
      const prev = code[i - 1]

      if (inString) {
        if (ch === stringChar && prev !== '\\') {
          inString = false
        }
      } else {
        if (ch === '"' || ch === "'" || ch === '`') {
          inString = true
          stringChar = ch
        } else if (ch === '(') {
          depth++
        } else if (ch === ')') {
          depth--
          if (depth === 0) {
            endIdx = i
            break
          }
        }
      }
    }
    return code.slice(startIdx, endIdx).trim()
  }

  // 2. Look for 'return <Tag ...>...</Tag>'
  const returnTagMatch = code.match(/return\s*(<[\s\S]*?>[\s\S]*<\/[a-zA-Z0-9_.-]+>)/)
  if (returnTagMatch) return returnTagMatch[1].trim()

  return code
}

/**
 * Extracts default prop values from component signature:
 * e.g. function Component({ title = "Revenue", amount = "$100", isPositive = true }: Props)
 */
function extractPropDefaults(code: string): Record<string, any> {
  const defaults: Record<string, any> = {
    title: 'Components Synthesized',
    amount: '1,420 TSX',
    synthesizedCount: '1,420 TSX',
    fidelity: '99.4% Fidelity',
    astLatency: '~340ms',
    tokensExtracted: 142,
    change: '+28.4%',
    isPositive: true,
  }

  const propMatch = code.match(/function\s+[A-Za-z0-9_]+\s*\(\s*\{([^}]+)\}/)
  if (propMatch) {
    const rawProps = propMatch[1].split(',')
    for (const p of rawProps) {
      const parts = p.split('=')
      if (parts.length === 2) {
        const key = parts[0].trim().replace(/^[:\s]+/, '')
        let val = parts[1].trim().replace(/^["']|["']$/g, '')
        if (val === 'true') defaults[key] = true
        else if (val === 'false') defaults[key] = false
        else defaults[key] = val
      }
    }
  }

  return defaults
}

/**
 * Transforms JSX code into standard, valid HTML elements with resolved Tailwind classes.
 */
export function synthesizeJsxToHtml(code: string, allFiles: FileEntry[] = []): string {
  if (!code) return '<div class="text-slate-400 p-4">No content to preview</div>'

  const propsMap = extractPropDefaults(code)
  let jsx = extractJsxFromFunction(code)

  // 1. Resolve child subcomponents (e.g. <AnalyticsCard />, <PricingTier />)
  const childCompMatches = jsx.match(/<([A-Z][a-zA-Z0-9]*)\s*\/?>/g) || []
  for (const tag of childCompMatches) {
    const compName = tag.replace(/<|\/?>/g, '').trim()
    if (compName !== 'Fragment' && compName !== 'React.Fragment') {
      const targetFile = allFiles.find((f) => f.path.includes(compName) && f.path !== compName)
      if (targetFile) {
        const childJsx = extractJsxFromFunction(targetFile.content)
        if (childJsx && childJsx.startsWith('<')) {
          jsx = jsx.replace(new RegExp(`<${compName}\\s*\\/?>`, 'g'), childJsx)
        }
      }
    }
  }

  // 2. Evaluate array .map(...) loops:
  // e.g. {[35, 60, 40, ...].map((h, i) => ( <div style={{ height: `${h}%` }} ... /> ))}
  jsx = jsx.replace(
    /\{(\[[^\]]+\])\.map\s*\(\s*\(([^,)]+)(?:,\s*([^)]+))?\)\s*=>\s*\(?([\s\S]*?)\)?\s*\)\s*\}/g,
    (_match, rawArr, itemVar, idxVar, template) => {
      try {
        const arr = JSON.parse(rawArr)
        const iv = itemVar.trim()
        const idxv = idxVar ? idxVar.trim() : 'i'

        return arr
          .map((item: any, idx: number) => {
            let rendered = template
            rendered = rendered.replace(new RegExp(`\\$\\{\\s*${iv}\\s*\\}`, 'g'), String(item))
            rendered = rendered.replace(new RegExp(`\\{${iv}\\}`, 'g'), String(item))
            rendered = rendered.replace(new RegExp(`\\{${idxv}\\}`, 'g'), String(idx))
            return rendered
          })
          .join('\n')
      } catch {
        return ''
      }
    }
  )

  // 3. Resolve conditional template strings in className:
  // e.g. className={`px-2.5 ... ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}
  jsx = jsx.replace(/className=\{`([^`]*)`\}/g, (_m, content) => {
    const resolved = content.replace(/\$\{([^}]+)\}/g, (_exprMatch: string, expr: string) => {
      const ternaryMatch = expr.match(/([a-zA-Z0-9_]+)\s*\?\s*['"]([^'"]*)['"]\s*:\s*['"]([^'"]*)['"]/)
      if (ternaryMatch) {
        const varName = ternaryMatch[1]
        const truthyVal = ternaryMatch[2]
        const falsyVal = ternaryMatch[3]
        const isTrue = propsMap[varName] !== false && Boolean(propsMap[varName])
        return isTrue ? truthyVal : falsyVal
      }
      return ''
    })
    return `class="${resolved.trim().replace(/\s+/g, ' ')}"`
  })

  // 4. Standardize className to class
  jsx = jsx.replace(/className=(["'])/g, 'class=$1')

  // 5. Convert style objects: style={{ height: '50%' }} or style={{ height: `${h}%` }}
  jsx = jsx.replace(
    /style=\{\{\s*([a-zA-Z0-9_-]+)\s*:\s*['"`]([^'"`]+)['"`]\s*\}\}/g,
    'style="$1: $2;"'
  )

  // 6. Substitute known component props: {title}, {amount}, {change}
  for (const [key, val] of Object.entries(propsMap)) {
    jsx = jsx.replace(new RegExp(`\\{${key}\\}`, 'g'), String(val))
  }

  // 7. Strip JSX comments {/* ... */}
  jsx = jsx.replace(/\{\/\*[\s\S]*?\*\/\}/g, '')

  // 8. Remove React events and unhandled JS props
  jsx = jsx.replace(/\s*on[A-Z][a-zA-Z]+=\{[^}]*\}/g, '')
  jsx = jsx.replace(/<React\.Fragment>|<\/React\.Fragment>|<>|<\/>/g, '')

  // 9. Replace Lucide icon tags with SVG icons
  jsx = jsx.replace(
    /<Check\s*\/?>/g,
    '<svg class="w-4 h-4 text-cyan-400 inline-block mr-1 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>'
  )
  jsx = jsx.replace(
    /<Zap\s*\/?>/g,
    '<svg class="w-4 h-4 text-amber-400 inline-block mr-1 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>'
  )
  jsx = jsx.replace(
    /<ArrowRight\s*\/?>/g,
    '<svg class="w-4 h-4 inline-block ml-1 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>'
  )
  jsx = jsx.replace(
    /<Sparkles\s*\/?>/g,
    '<svg class="w-4 h-4 text-indigo-400 inline-block mr-1 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" /></svg>'
  )

  // 10. Replace custom capital tags with styled wrapper divs
  jsx = jsx.replace(/<([A-Z][a-zA-Z0-9]*)\s*/g, '<div data-component="$1" ')
  jsx = jsx.replace(/<\/([A-Z][a-zA-Z0-9]*)>/g, '</div>')

  return jsx
}

/**
 * Builds a standalone, self-contained HTML document for the iframe sandbox.
 * Includes both Tailwind CDN and embedded offline utility styles.
 */
export function buildSandboxedHtml(bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
  <style>
    /* Standalone Offline Fallback Utility Classes */
    *, ::before, ::after { box-sizing: border-box; border-width: 0; border-style: solid; border-color: rgba(255, 255, 255, 0.1); }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      min-height: 100vh;
      background-color: #070912;
      color: #f8fafc;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    .font-display { font-family: 'Space Grotesk', system-ui, sans-serif; }
    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .items-center { align-items: center; }
    .items-end { align-items: flex-end; }
    .justify-center { justify-content: center; }
    .justify-between { justify-content: space-between; }
    .flex-1 { flex: 1 1 0%; }
    .w-full { width: 100%; }
    .h-full { height: 100%; }
    .min-h-screen { min-height: 100vh; }
    .relative { position: relative; }
    .overflow-hidden { overflow: hidden; }
    .rounded-xl { border-radius: 0.75rem; }
    .rounded-2xl { border-radius: 1rem; }
    .rounded-3xl { border-radius: 1.5rem; }
    .rounded-full { border-radius: 9999px; }
    .rounded-t { border-top-left-radius: 0.25rem; border-top-right-radius: 0.25rem; }
    .border { border-width: 1px; }
    .border-indigo-500\\/30 { border-color: rgba(99, 102, 241, 0.3); }
    .border-cyan-500\\/30 { border-color: rgba(6, 182, 212, 0.3); }
    .border-cyan-500\\/40 { border-color: rgba(6, 182, 212, 0.4); }
    .border-white\\/10 { border-color: rgba(255, 255, 255, 0.1); }
    .bg-slate-900\\/90 { background-color: rgba(15, 23, 42, 0.9); }
    .bg-indigo-950\\/60 { background-color: rgba(30, 27, 75, 0.6); }
    .bg-indigo-500\\/20 { background-color: rgba(99, 102, 241, 0.2); }
    .bg-indigo-600 { background-color: rgb(79, 70, 229); }
    .bg-cyan-500\\/10 { background-color: rgba(6, 182, 212, 0.1); }
    .bg-emerald-500\\/10 { background-color: rgba(16, 185, 129, 0.1); }
    .bg-rose-500\\/10 { background-color: rgba(244, 63, 94, 0.1); }
    .text-white { color: #ffffff; }
    .text-slate-400 { color: #94a3b8; }
    .text-slate-300 { color: #cbd5e1; }
    .text-indigo-400 { color: #818cf8; }
    .text-cyan-400 { color: #22d3ee; }
    .text-emerald-400 { color: #34d399; }
    .text-rose-400 { color: #fb7185; }
    .backdrop-blur-xl { backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }
    .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6); }
    .bg-gradient-to-t { background-image: linear-gradient(to top, var(--tw-gradient-stops, #4f46e5, #22d3ee)); }
    .bg-gradient-to-r { background-image: linear-gradient(to right, var(--tw-gradient-stops, #06b6d4, #4f46e5)); }
    
    /* Interactive Preview Container */
    #sandbox-root {
      width: 100%;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
  </style>
</head>
<body>
  <div id="sandbox-root">
    ${bodyContent}
  </div>
</body>
</html>`
}

