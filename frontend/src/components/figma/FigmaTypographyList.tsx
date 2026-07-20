import { TypographyDetail } from '../../api/figma'
import { Badge } from '../ui/badge'

type Props = {
  typography: TypographyDetail[]
}

export function FigmaTypographyList({ typography }: Props) {
  if (typography.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
        <div className="text-2xl mb-2">🔤</div>
        <p className="text-sm text-muted-foreground">No typography styles found in this design.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="font-semibold mb-3 flex items-center gap-2">
        Typography
        <Badge variant="gradient" className="text-[10px]">{typography.length}</Badge>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {typography.map((t, index) => (
          <div
            key={index}
            className="rounded-xl border border-white/10 bg-white/5 p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-sm font-medium truncate" style={{ fontFamily: t.fontFamily || undefined }}>
                  {t.fontFamily || 'Unknown'}
                </div>
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {t.fontSize ? `${t.fontSize}px` : '?'}
                  </Badge>
                  {t.fontWeight && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {t.fontWeight}
                    </Badge>
                  )}
                  {t.letterSpacing && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {t.letterSpacing}
                    </Badge>
                  )}
                </div>
              </div>
              {t.usage_count > 0 && (
                <div className="text-[10px] text-muted-foreground shrink-0">
                  ×{t.usage_count}
                </div>
              )}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {t.textAlignHorizontal && `${t.textAlignHorizontal} · `}
              {t.lineHeightPx ? `Line height: ${t.lineHeightPx}px` : ''}
              {t.lineHeightPercent ? ` (${t.lineHeightPercent}%)` : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

