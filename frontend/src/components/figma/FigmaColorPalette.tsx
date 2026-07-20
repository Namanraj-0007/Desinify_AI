import { ColorDetail } from '../../api/figma'
import { Badge } from '../ui/badge'

type Props = {
  colors: ColorDetail[]
}

export function FigmaColorPalette({ colors }: Props) {
  if (colors.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
        <div className="text-2xl mb-2">🎨</div>
        <p className="text-sm text-muted-foreground">No colors found in this design.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="font-semibold mb-3 flex items-center gap-2">
        Colors
        <Badge variant="gradient" className="text-[10px]">{colors.length}</Badge>
      </div>

      <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
        {colors.map((color, index) => (
          <div
            key={`${color.hex}-${index}`}
            className="flex items-center gap-3 rounded-lg p-2 hover:bg-white/5 transition-colors"
          >
            <div
              className="h-8 w-8 rounded-lg border border-white/20 shrink-0"
              style={{ backgroundColor: color.hex }}
              title={color.hex}
            />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium truncate">{color.name}</div>
              <div className="text-[10px] text-muted-foreground">
                {color.hex}
                {color.usage_count > 0 && ` · used ${color.usage_count}x`}
              </div>
            </div>
            <div className="text-[10px] text-muted-foreground shrink-0">
              {color.rgba.r.toFixed(2)}, {color.rgba.g.toFixed(2)}, {color.rgba.b.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

