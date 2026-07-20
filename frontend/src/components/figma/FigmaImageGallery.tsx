import { useState } from 'react'
import { ImageDetail } from '../../api/figma'
import { Badge } from '../ui/badge'

type Props = {
  images: ImageDetail[]
  onRenderClick?: (image: ImageDetail) => void
  renderedUrls?: Record<string, string>
}

export function FigmaImageGallery({ images, onRenderClick, renderedUrls }: Props) {
  const [selected, setSelected] = useState<string | null>(null)

  if (images.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
        <div className="text-2xl mb-2">🖼️</div>
        <p className="text-sm text-muted-foreground">No images found in this design.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="font-semibold mb-3 flex items-center gap-2">
        Images
        <Badge variant="gradient" className="text-[10px]">{images.length}</Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[400px] overflow-y-auto">
        {images.map((img) => {
          const isSelected = selected === img.id
          const renderedUrl = renderedUrls?.[img.id]

          return (
            <button
              key={img.id}
              onClick={() => {
                setSelected(isSelected ? null : img.id)
                onRenderClick?.(img)
              }}
              className={`relative aspect-video rounded-xl border overflow-hidden transition-all duration-200 ${
                isSelected
                  ? 'border-indigo-500 ring-1 ring-indigo-500'
                  : 'border-white/10 hover:border-white/30'
              }`}
            >
              {renderedUrl ? (
                <img
                  src={renderedUrl}
                  alt={img.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-white/5 flex items-center justify-center">
                  <span className="text-2xl opacity-30">🖼️</span>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <div className="text-[10px] font-medium truncate text-white">
                  {img.name}
                </div>
                <div className="text-[9px] text-white/60">
                  {img.width && img.height
                    ? `${Math.round(img.width)}×${Math.round(img.height)}`
                    : 'Unknown size'}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

