import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FrameDetail,
  ComponentDetail,
  ImageDetail,
  ColorDetail,
  TypographyDetail,
} from '../../api/figma'
import { FigmaFrameViewer } from './FigmaFrameViewer'
import { FigmaComponentPanel } from './FigmaComponentPanel'
import { FigmaImageGallery } from './FigmaImageGallery'
import { FigmaColorPalette } from './FigmaColorPalette'
import { FigmaTypographyList } from './FigmaTypographyList'
import { Badge } from '../ui/badge'

type Tab = 'frames' | 'components' | 'images' | 'colors' | 'typography'

type Props = {
  pages: any[]
  frames?: FrameDetail[]
  components?: ComponentDetail[]
  images?: ImageDetail[]
  colors?: ColorDetail[]
  typography?: TypographyDetail[]
  stats?: {
    total_frames: number
    total_components: number
    total_images: number
    total_colors: number
    total_typography_styles: number
  }
  onSelectFrame?: (frame: FrameDetail) => void
  selectedFrameId?: string | null
  onRenderImage?: (image: ImageDetail) => void
  renderedUrls?: Record<string, string>
  onBack?: () => void
}

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'frames', label: 'Frames', icon: '🖼️' },
  { id: 'components', label: 'Components', icon: '🧩' },
  { id: 'images', label: 'Images', icon: '🖼️' },
  { id: 'colors', label: 'Colors', icon: '🎨' },
  { id: 'typography', label: 'Typography', icon: '🔤' },
]

export function FigmaParserPanels({
  pages,
  frames = [],
  components = [],
  images = [],
  colors = [],
  typography = [],
  stats,
  onSelectFrame,
  selectedFrameId,
  onRenderImage,
  renderedUrls,
  onBack,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('frames')

  const countMap: Record<Tab, number> = {
    frames: frames.length,
    components: components.length,
    images: images.length,
    colors: colors.length,
    typography: typography.length,
  }

  return (
    <div className="space-y-4">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="text-xs text-muted-foreground hover:text-white transition-colors"
            >
              ← Back
            </button>
          )}
          <span className="font-semibold">Parsed Design Data</span>
          {stats && (
            <Badge variant="gradient" className="text-[10px]">
              {stats.total_frames}F · {stats.total_components}C · {stats.total_colors}CL · {stats.total_typography_styles}T
            </Badge>
          )}
        </div>
        <div className="text-[10px] text-muted-foreground">
          {pages.length} page{pages.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/30'
                : 'text-muted-foreground hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {countMap[tab.id] > 0 && (
              <Badge variant="outline" className="text-[9px] px-1 py-0">
                {countMap[tab.id]}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === 'frames' && (
            <FigmaFrameViewer
              frames={frames}
              onSelectFrame={onSelectFrame}
              selectedFrameId={selectedFrameId}
            />
          )}
          {activeTab === 'components' && (
            <FigmaComponentPanel components={components} />
          )}
          {activeTab === 'images' && (
            <FigmaImageGallery
              images={images}
              onRenderClick={onRenderImage}
              renderedUrls={renderedUrls}
            />
          )}
          {activeTab === 'colors' && (
            <FigmaColorPalette colors={colors} />
          )}
          {activeTab === 'typography' && (
            <FigmaTypographyList typography={typography} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

