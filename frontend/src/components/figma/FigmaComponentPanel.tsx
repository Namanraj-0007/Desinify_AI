import { ComponentDetail } from '../../api/figma'
import { Badge } from '../ui/badge'

type Props = {
  components: ComponentDetail[]
}

export function FigmaComponentPanel({ components }: Props) {
  if (components.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
        <div className="text-2xl mb-2">🧩</div>
        <p className="text-sm text-muted-foreground">No components found in this design.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="font-semibold mb-3 flex items-center gap-2">
        Components
        <Badge variant="gradient" className="text-[10px]">{components.length}</Badge>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {components.map((comp) => (
          <div
            key={comp.id}
            className="rounded-xl border border-white/10 bg-white/5 p-3 transition-colors hover:border-white/20"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{comp.name}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 ${
                      comp.type === 'COMPONENT'
                        ? 'text-emerald-300 border-emerald-500/30'
                        : 'text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {comp.type === 'COMPONENT' ? 'Component' : 'Instance'}
                  </Badge>
                  {comp.width && comp.height && (
                    <span className="text-[10px] text-muted-foreground">
                      {Math.round(comp.width)}×{Math.round(comp.height)}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-[10px] text-muted-foreground shrink-0">
                {comp.children_count} child{comp.children_count !== 1 ? 'ren' : ''}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

