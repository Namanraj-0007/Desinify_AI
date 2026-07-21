import { motion } from 'framer-motion'
import { FigmaProjectSummary } from '../../api/figma'
import { Badge } from '../ui/badge'

type Props = {
  project: FigmaProjectSummary
  onClick?: () => void
  onDelete?: () => void
}

export function FigmaProjectCard({ project, onClick, onDelete }: Props) {
  const s = project.stats || {}
  const totalElements =
    (s.total_frames || 0) +
    (s.total_components || 0) +
    (s.total_images || 0)

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="text-left w-full rounded-2xl border border-white/10 bg-white/5 p-4 hover:border-indigo-500/40 hover:-translate-y-0.5 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 flex items-center justify-center shrink-0">
              <span className="text-sm">🎨</span>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate group-hover:text-indigo-300 transition-colors">
                {project.project_name}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {new Date(project.created_at).toLocaleDateString()} · {project.figma_file_key.slice(0, 12)}...
              </div>
            </div>
          </div>
        </div>
        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="text-muted-foreground hover:text-red-400 transition-colors shrink-0"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {s.total_frames > 0 && (
          <Badge variant="outline" className="text-[10px]">
            🖼️ {s.total_frames} frame{s.total_frames !== 1 ? 's' : ''}
          </Badge>
        )}
        {s.total_components > 0 && (
          <Badge variant="outline" className="text-[10px]">
            🧩 {s.total_components} component{s.total_components !== 1 ? 's' : ''}
          </Badge>
        )}
        {s.total_images > 0 && (
          <Badge variant="outline" className="text-[10px]">
            🖼️ {s.total_images} image{s.total_images !== 1 ? 's' : ''}
          </Badge>
        )}
        {s.total_colors > 0 && (
          <Badge variant="outline" className="text-[10px]">
            🎨 {s.total_colors} color{s.total_colors !== 1 ? 's' : ''}
          </Badge>
        )}
        {totalElements === 0 && (
          <Badge variant="outline" className="text-[10px]">
            Parsing...
          </Badge>
        )}
      </div>
    </motion.button>
  )
}

