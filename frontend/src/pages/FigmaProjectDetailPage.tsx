import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageTransition from '../components/ui/PageTransition'
import SpotlightCard from '../components/ui/SpotlightCard'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import AILoadingState from '../components/ui/AILoadingState'
import { FigmaParserPanels } from '../components/figma/FigmaParserPanels'
import {
  getFigmaProjectDetail,
  renderFigmaImages,
  selectFigmaFrame,
  FrameDetail,
  ImageDetail,
  FigmaProjectDetail,
} from '../api/figma'

export default function FigmaProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const [detail, setDetail] = useState<FigmaProjectDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedFrameId, setSelectedFrameId] = useState<string | null>(null)
  const [renderedUrls, setRenderedUrls] = useState<Record<string, string>>({})
  const [rendering, setRendering] = useState(false)

  useEffect(() => {
    if (!projectId) return
    setLoading(true)
    getFigmaProjectDetail(projectId)
      .then(setDetail)
      .catch((e) => setError(e?.message || 'Failed to load project'))
      .finally(() => setLoading(false))
  }, [projectId])

  async function handleSelectFrame(frame: FrameDetail) {
    if (!projectId) return
    setSelectedFrameId(frame.id)
    try {
      await selectFigmaFrame(projectId, frame.id)
    } catch (e) {
    }
  }

  async function handleRenderImage(image: ImageDetail) {
    if (!detail || !image.imageRef) return
    setRendering(true)
    try {
      const result = await renderFigmaImages(
        detail.figma_file_key,
        [image.id],
        1.0,
        'png'
      )
      setRenderedUrls((prev) => ({ ...prev, ...result.images }))
    } catch (e: any) {
      setError(e?.message || 'Failed to render image')
    } finally {
      setRendering(false)
    }
  }

  if (loading) {
    return (
      <PageTransition>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AILoadingState lines={6} />
        </section>
      </PageTransition>
    )
  }

  if (error || !detail) {
    return (
      <PageTransition>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300"
          >
            {error || 'Project not found'}
          </motion.div>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </section>
      </PageTransition>
    )
  }

  const s = detail.stats || {}
  const pages = detail.frames.map((f) => ({
    id: f.id,
    name: f.name,
    type: f.type,
    children: [] as any[],
  }))

  const summaryCards = [
    { label: 'Frames', value: s.total_frames, icon: '🖼️' },
    { label: 'Components', value: s.total_components, icon: '🧩' },
    { label: 'Colors', value: s.total_colors, icon: '🎨' },
    { label: 'Typography', value: s.total_typography_styles, icon: '🔤' },
  ]

  return (
    <PageTransition>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="text-xs text-muted-foreground hover:text-white transition-colors"
              >
                &larr; Dashboard
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
                  {detail.project_name}
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Imported {new Date(detail.created_at).toLocaleDateString()} · File key {detail.figma_file_key.slice(0, 12)}...
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="gradient" className="text-xs">
                  {detail.frames.length} frames
                </Badge>
                <Badge variant="gradient" className="text-xs">
                  {detail.components.length} components
                </Badge>
                <Badge variant="gradient" className="text-xs">
                  {detail.colors.length} colors
                </Badge>
                <Badge variant="gradient" className="text-xs">
                  {detail.typography.length} styles
                </Badge>
              </div>
            </div>
          </div>

          <SpotlightCard className="rounded-2xl">
            <div className="glass rounded-2xl p-5 space-y-4">
              <div>
                <h2 className="text-sm font-semibold">Project summary</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  A quick overview of this Figma import and project metadata.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {summaryCards.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold">{item.value}</div>
                        <div className="text-[10px] text-muted-foreground mt-1">{item.label}</div>
                      </div>
                      <div className="text-lg">{item.icon}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  variant="gradient"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate(
                    '/dashboard/figma/' + projectId + '/codegen' +
                    (selectedFrameId ? `?frame_id=${selectedFrameId}` : '')
                  )}
                >
                  Generate Code
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate('/dashboard')}
                >
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </SpotlightCard>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300"
          >
            {error}
          </motion.div>
        )}

        {rendering && (
          <div className="mb-4 text-sm text-muted-foreground animate-pulse">
            Rendering images... please wait.
          </div>
        )}

        <SpotlightCard className="rounded-2xl">
          <div className="glass rounded-2xl p-5">
            <FigmaParserPanels
              pages={pages}
              frames={detail.frames}
              components={detail.components}
              images={detail.images}
              colors={detail.colors}
              typography={detail.typography}
              stats={detail.stats}
              onSelectFrame={handleSelectFrame}
              selectedFrameId={selectedFrameId}
              onRenderImage={handleRenderImage}
              renderedUrls={renderedUrls}
            />
          </div>
        </SpotlightCard>
      </section>
    </PageTransition>
  )
}
