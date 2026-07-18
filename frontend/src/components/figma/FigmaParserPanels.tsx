import React from 'react'

export function FigmaParserPanels({
  pages,
  typography,
  colors,
}: {
  pages: any[]
  typography: any[]
  colors: any[]
}) {
  return (
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-1 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="font-semibold">Pages</div>
        <div className="mt-2 text-xs text-slate-400">Best-effort hierarchy summary</div>
        <pre className="mt-3 text-[11px] text-slate-300 overflow-auto max-h-80 bg-slate-950/20 rounded-xl p-3">
          {JSON.stringify(pages, null, 2)}
        </pre>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="font-semibold">Typography</div>
        <div className="mt-2 text-xs text-slate-400">Extracted styles</div>
        <pre className="mt-3 text-[11px] text-slate-300 overflow-auto max-h-80 bg-slate-950/20 rounded-xl p-3">
          {JSON.stringify(typography, null, 2)}
        </pre>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="font-semibold">Colors</div>
        <div className="mt-2 text-xs text-slate-400">Solid fill colors</div>
        <pre className="mt-3 text-[11px] text-slate-300 overflow-auto max-h-80 bg-slate-950/20 rounded-xl p-3">
          {JSON.stringify(colors, null, 2)}
        </pre>
      </div>
    </div>
  )
}

