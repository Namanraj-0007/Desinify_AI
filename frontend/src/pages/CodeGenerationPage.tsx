import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { CodePreview } from '../components/codegen/CodePreview'
import { CodeGenerationToolbar } from '../components/codegen/CodeGenerationToolbar'
import { generateCode, getGenerationHistory, regenerateCode, exportGeneration } from '../api/codeGeneration'
import type { FileOutput, GenerationVersion, GenerateCodeRequest } from '../api/codeGeneration'
import PageTransition from '../components/ui/PageTransition'
import AILoadingState from '../components/ui/AILoadingState'
import { Button } from '../components/ui/button'

export default function CodeGenerationPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()

  const [files, setFiles] = useState<FileOutput[]>([])
  const [versions, setVersions] = useState<GenerationVersion[]>([])
  const [currentVersionId, setCurrentVersionId] = useState<string | undefined>()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('optimize')
  const [searchParams] = useSearchParams()
  const selectedFrameId = searchParams.get('frame_id')

  const currentVersion = versions.find((v) => v.id === currentVersionId)
  const currentVersionFrameIds = currentVersion?.frame_ids || []

  const loadVersions = useCallback(async () => {
    if (!projectId) return
    try {
      const result = await getGenerationHistory(projectId)
      setVersions(result.versions || [])
      if (result.versions && result.versions.length > 0) {
        const latest = result.versions[0]
        setCurrentVersionId(latest.id)
        setFiles(latest.files || [])
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load generation history')
    }
  }, [projectId])

  useEffect(() => {
    if (projectId) {
      setIsLoading(true)
      loadVersions().finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [projectId, loadVersions])

  const handleGenerate = useCallback(async () => {
    if (!projectId) return
    setIsGenerating(true)
    setError(null)
    try {
      const payload: GenerateCodeRequest = {
        project_id: projectId,
        frame_ids: selectedFrameId ? [selectedFrameId] : [],
        framework: 'react',
        typescript: true,
        tailwind: true,
        optimization_level: 'standard',
      }
      const result = await generateCode(payload)
      setFiles(result.files || [])
      setCurrentVersionId(result.generation_id)
      await loadVersions()
    } catch (e: any) {
      setError(e?.message || 'Failed to generate code')
    } finally {
      setIsGenerating(false)
    }
  }, [projectId, selectedFrameId, loadVersions])

  const handleRegenerate = useCallback(async () => {
    if (!projectId || !currentVersionId) return
    setIsGenerating(true)
    setError(null)
    try {
      const result = await regenerateCode({
        generation_id: currentVersionId,
        improvement_type: 'structure',
        framework: 'react',
      })
      setFiles(result.files || [])
      setCurrentVersionId(result.generation_id)
      await loadVersions()
    } catch (e: any) {
      setError(e?.message || 'Failed to regenerate code')
    } finally {
      setIsGenerating(false)
    }
  }, [projectId, currentVersionId, loadVersions])

  const handleOptimize = useCallback(async (type: string) => {
    if (!projectId || !currentVersionId) return
    setIsOptimizing(true)
    setError(null)
    try {
      const result = await regenerateCode({
        generation_id: currentVersionId,
        improvement_type: type as any,
        framework: 'react',
      })
      setFiles(result.files || [])
      setCurrentVersionId(result.generation_id)
      await loadVersions()
    } catch (e: any) {
      setError(e?.message || 'Failed to optimize code')
    } finally {
      setIsOptimizing(false)
    }
  }, [projectId, currentVersionId, loadVersions])

  const handleExport = useCallback(async (format: 'zip' | 'tar') => {
    if (!projectId || !currentVersionId) return
    setIsExporting(true)
    setError(null)
    try {
      await exportGeneration({
        generation_id: currentVersionId,
        format: format,
      })
    } catch (e: any) {
      setError(e?.message || 'Failed to export code')
    } finally {
      setIsExporting(false)
    }
  }, [projectId, currentVersionId])

  const handleSelectVersion = useCallback((version: GenerationVersion) => {
    setCurrentVersionId(version.id)
    setFiles(version.files || [])
  }, [])

  const handleRestoreVersion = useCallback((version: GenerationVersion) => {
    setCurrentVersionId(version.id)
    setFiles(version.files || [])
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-full max-w-md">
          <AILoadingState lines={4} />
        </div>
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-gray-950/80">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-xs text-muted-foreground hover:text-white transition-colors"
            >
              &larr; Dashboard
            </button>
            <h1 className="text-sm font-semibold">Code Generation</h1>
            {(selectedFrameId || currentVersionFrameIds.length > 0) && (
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-muted-foreground">
                Source frame{currentVersionFrameIds.length > 1 ? 's' : ''}: {selectedFrameId || currentVersionFrameIds.join(', ')}
              </span>
            )}
            {files.length > 0 && (
              <span className="text-[10px] text-muted-foreground">
                {files.length} files
              </span>
            )}
          </div>
          <Button onClick={handleGenerate} disabled={isGenerating} size="sm" variant="gradient">
            {isGenerating ? 'Generating...' : 'Generate Code'}
          </Button>
        </div>

        {error && (
          <div className="px-4 py-2 bg-red-500/10 border-b border-red-500/20">
            <p className="text-xs text-red-300">{error}</p>
          </div>
        )}

        {!selectedFrameId && (
          <div className="px-4 py-3 bg-yellow-500/10 border-b border-yellow-500/20 text-xs text-yellow-200">
            No frame selected. Code generation will use all available frames unless you choose a frame from the Figma project detail page first.
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          <CodeGenerationToolbar
            versions={versions}
            currentVersionId={currentVersionId}
            onSelectVersion={handleSelectVersion}
            onRestoreVersion={handleRestoreVersion}
            onOptimize={handleOptimize}
            onExport={handleExport}
            onRegenerate={handleRegenerate}
            isGenerating={isGenerating}
            isOptimizing={isOptimizing}
            isExporting={isExporting}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            disabled={versions.length === 0}
          />
          <div className="flex-1 flex flex-col">
            {files.length > 0 ? (
              <CodePreview
                files={files}
                onRefresh={handleGenerate}
                refreshing={isGenerating}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-md px-4">
                  <div className="text-3xl mb-4">&#127912;</div>
                  <h2 className="font-display text-lg font-semibold mb-2">AI Code Generation</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Generate production-ready React, TypeScript, and Tailwind CSS code from your Figma designs.
                    Click Generate Code above to get started.
                  </p>
                  <Button onClick={handleGenerate} disabled={isGenerating} variant="gradient">
                    {isGenerating ? 'Generating...' : 'Generate Code'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
