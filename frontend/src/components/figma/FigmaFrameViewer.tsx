import { useState } from 'react'
import { motion } from 'framer-motion'
import { FrameDetail } from '../../api/figma'
import { Badge } from '../ui/badge'

type Props = {
  frames: FrameDetail[]
  onSelectFrame?: (frame: FrameDetail) => void
  selectedFrameId?: string | null
}

export function FigmaFrameViewer({ frames, onSelectFrame, selectedFrameId }: Props) {
  const [search, setSearch] = useState('')

  const filtered = frames.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  )

  if (frames.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
        <div className="text-2xl mb-2">🖼️</div>
        <p className="text-sm text-muted-foreground">No frames found in this design.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="font-semibold flex items-center gap-2 flex-wrap">
          Frames
          <Badge variant="gradient" className="text-[10px]">{frames.length}</Badge>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search frames..."
          className="text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500 w-full sm:w-40"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto">
        {filtered.map((frame) => (
          <motion.button
            key={frame.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => onSelectFrame?.(frame)}
            className={`text-left rounded-xl border p-3 transition-all duration-200 hover:border-indigo-500/50 ${
              selectedFrameId === frame.id
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-white/10 bg-white/5'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{frame.name}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {frame.width && frame.height
                    ? `${Math.round(frame.width)} × ${Math.round(frame.height)}`
                    : 'Unknown size'}
                </div>
              </div>
              <div className="text-[10px] text-muted-foreground shrink-0">
                {frame.children_count} child{frame.children_count !== 1 ? 'ren' : ''}
              </div>
            </div>
            {frame.backgroundColor && (
              <div className="mt-2 flex items-center gap-1.5">
                <div
                  className="h-3 w-3 rounded-full border border-white/20"
                  style={{ backgroundColor: frame.backgroundColor }}
                />
                <span className="text-[10px] text-muted-foreground">{frame.backgroundColor}</span>
              </div>
            )}
          </motion.button>
        ))}
      </div>

      {filtered.length === 0 && search && (
        <div className="py-6 text-center text-sm text-muted-foreground">
          No frames match "{search}"
        </div>
      )}
    </div>
  )
}

