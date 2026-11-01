import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { API } from '../services/api'
import { useAuth } from '../context/AuthContext'
import {
  connectFigmaToken,
  importFigmaByUrl,
  listFigmaProjects,
  deleteFigmaProject,
  getFigmaConnected,
  extractFigmaFileKey,
  FigmaProjectSummary,
  FigmaImportResponse,
  FigmaConnectedStatus,
} from '../api/figma'
import { FigmaParserPanels } from '../components/figma/FigmaParserPanels'
import { FigmaProjectCard } from '../components/figma/FigmaProjectCard'
import PageTransition from '../components/ui/PageTransition'
import SpotlightCard from '../components/ui/SpotlightCard'
import AILoadingState from '../components/ui/AILoadingState'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'

type Project = {
  id: string
  name: string
  created_at: string
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { token } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [figmaProjects, setFigmaProjects] = useState<FigmaProjectSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [figmaProjectsLoading, setFigmaProjectsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')

  // Figma state
  const [figmaToken, setFigmaToken] = useState('')
  const [figmaUrl, setFigmaUrl] = useState('')
  const [figmaBusy, setFigmaBusy] = useState(false)
  const [figmaStep, setFigmaStep] = useState<string | null>(null)
  const [figmaResult, setFigmaResult] = useState<FigmaImportResponse | null>(null)
  const [figmaStatus, setFigmaStatus] = useState<FigmaConnectedStatus>({ connected: false })
  const [showTokenInput, setShowTokenInput] = useState(false)

  const detectedFileKey = extractFigmaFileKey(figmaUrl)

  const totalFigmaComponents = figmaProjects.reduce(
    (sum, project) => sum + (project.stats?.total_components ?? 0),
    0
  )
  const totalFigmaColors = figmaProjects.reduce(
    (sum, project) => sum + (project.stats?.total_colors ?? 0),
    0
  )

  const topStats = [
    { label: 'Total Projects', value: `${projects.length}`, icon: '📁' },
    { label: 'Imported Figma Files', value: `${figmaProjects.length}`, icon: '🎨' },
  ]

  const bottomStats = [
    { label: 'Components Generated', value: `${totalFigmaComponents}`, icon: '🧩' },
    { label: 'Colors Extracted', value: `${totalFigmaColors}`, icon: '🎨' },
  ]

  async function refresh() {
    setLoading(true)
    setError(null)
    try {
      const res = await API.get('/projects')
      setProjects(res.data.projects)
    } catch (e: any) {
      if (e?.message?.includes('login again') || e?.message?.includes('expired') || e?.message?.includes('Invalid JWT')) {
        navigate('/auth')
        return
      }
      setError(e?.message ?? 'Failed to fetch projects')
    } finally {
      setLoading(false)
    }
  }

  const refreshFigmaProjects = useCallback(async () => {
    setFigmaProjectsLoading(true)
    try {
      const result = await listFigmaProjects()
      setFigmaProjects(result.projects)
    } catch {
      // Silently fail - figma may not be connected
    } finally {
      setFigmaProjectsLoading(false)
    }
  }, [])

  const checkFigmaConnection = useCallback(async () => {
    try {
      const res = await getFigmaConnected()
      setFigmaStatus(res)
      if (!res.connected) {
        setShowTokenInput(true)
      }
    } catch {
      // If error checking connected status
      setFigmaStatus({ connected: false })
      setShowTokenInput(true)
    }
  }, [])

  useEffect(() => {
    refresh()
    refreshFigmaProjects()
    checkFigmaConnection()

    // Restore any Figma URL from session storage (e.g. from Landing Page upload zone)
    const storedUrl = sessionStorage.getItem('figmaUrl')
    if (storedUrl) {
      setFigmaUrl(storedUrl)
      sessionStorage.removeItem('figmaUrl')
    }
  }, [refreshFigmaProjects, checkFigmaConnection])

  async function createProject() {
    if (!newName.trim()) return
    setCreating(true)
    setError(null)
    try {
      await API.post('/projects', { name: newName })
      setNewName('')
      await refresh()
    } catch (e: any) {
      setError(e?.message ?? 'Failed to create project')
    } finally {
      setCreating(false)
    }
  }

  async function deleteProject(id: string) {
    setError(null)
    try {
      await API.delete(`/projects/${id}`)
      setProjects((prev) => prev.filter((p) => p.id !== id))
    } catch (e: any) {
      setError(e?.message ?? 'Failed to delete project')
    }
  }

  return (
    <PageTransition>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your projects and Figma integrations.</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="gradient" className="text-xs">
              {projects.length} project{projects.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs sm:text-sm text-red-300 flex items-start gap-3 backdrop-blur-md"
          >
            <span className="text-red-400 font-bold shrink-0 text-base">⚠️</span>
            <div className="flex-1">
              <div className="font-semibold text-red-200">Import Issue</div>
              <div className="mt-0.5 leading-relaxed">{error}</div>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-200 text-xs px-2 py-1 rounded bg-white/5"
            >
              Dismiss
            </button>
          </motion.div>
        )}

        {/* Import Results */}
        {figmaResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <SpotlightCard className="rounded-2xl">
              <div className="glass rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-lg font-semibold text-white">Import Complete ✓</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      File Key: <code className="font-mono text-cyan-400">{figmaResult.figma_file_key}</code> &middot; {figmaResult.stats?.total_frames || 0} frames &middot; {figmaResult.stats?.total_components || 0} components &middot; {figmaResult.colors.length} colors &middot; {figmaResult.typography.length} typography styles
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/dashboard/figma/' + figmaResult.project_id)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/30 transition-colors text-xs font-medium"
                  >
                    View Details &rarr;
                  </button>
                </div>
                <FigmaParserPanels
                  pages={figmaResult.pages}
                  frames={figmaResult.frames}
                  components={figmaResult.components}
                  images={figmaResult.images}
                  colors={figmaResult.colors}
                  typography={figmaResult.typography}
                  stats={figmaResult.stats}
                  onSelectFrame={() => navigate('/dashboard/figma/' + figmaResult.project_id)}
                />
              </div>
            </SpotlightCard>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] gap-8">
          {/* Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-24">
            {/* Stats mini-cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {topStats.map((stat) => (
                <SpotlightCard key={stat.label} className="rounded-xl">
                  <div className="glass rounded-xl p-3 text-center">
                    <div className="text-lg">{stat.icon}</div>
                    <div className="text-lg font-semibold font-display mt-1">{stat.value}</div>
                    <div className="text-[10px] text-muted-foreground">{stat.label}</div>
                  </div>
                </SpotlightCard>
              ))}
            </div>

            {/* Figma Integration Card */}
            <SpotlightCard className="rounded-2xl">
              <div className="glass rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-semibold text-sm text-white">Figma Sync Studio</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Parse frames, styles, and vector tokens.</p>
                  </div>
                  {figmaStatus.connected ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      Token Required
                    </span>
                  )}
                </div>

                {/* Token Status / Input Area */}
                {figmaStatus.connected && !showTokenInput ? (
                  <div className="rounded-xl bg-white/[0.03] border border-white/10 p-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-7 w-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                        🎨
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-white text-[11px] truncate">
                          {figmaStatus.user?.handle ? `@${figmaStatus.user.handle}` : 'Personal Token Active'}
                        </div>
                        <div className="text-[10px] text-slate-400">Authenticated with Figma</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowTokenInput(true)}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      Update
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 rounded-xl bg-black/30 border border-white/10 p-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-medium text-slate-300">Personal Access Token</label>
                      <a
                        href="https://www.figma.com/settings"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        Get Token &rarr;
                      </a>
                    </div>
                    <Input
                      type="password"
                      value={figmaToken}
                      onChange={(e) => setFigmaToken(e.target.value)}
                      placeholder="figd_..."
                      className="text-xs h-8 bg-black/40 border-white/15"
                    />
                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        className="flex-1 h-7 text-xs bg-indigo-600 hover:bg-indigo-500 text-white"
                        disabled={figmaBusy || !figmaToken.trim()}
                        onClick={async () => {
                          setFigmaBusy(true)
                          setFigmaStep('Validating...')
                          setError(null)
                          try {
                            const res = await connectFigmaToken(figmaToken.trim())
                            setFigmaStep('Connected ✓')
                            setFigmaStatus({
                              connected: true,
                              user: res.user,
                            })
                            setShowTokenInput(false)
                          } catch (e: any) {
                            setError(e?.message ?? 'Failed to connect token')
                            setFigmaStep(null)
                          } finally {
                            setFigmaBusy(false)
                            setTimeout(() => setFigmaStep(null), 1500)
                          }
                        }}
                      >
                        {figmaBusy && figmaStep ? figmaStep : 'Save Token'}
                      </Button>
                      {figmaStatus.connected && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-slate-400"
                          onClick={() => setShowTokenInput(false)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                    <p className="text-[9px] text-slate-500 leading-normal">
                      Figma Settings &rarr; Security &rarr; Personal access tokens &rarr; Generate new token.
                    </p>
                  </div>
                )}

                {/* File URL Input */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-slate-300 font-medium">Figma File URL or Key</label>
                    {detectedFileKey && (
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                        <span>✓</span> Key: {detectedFileKey.slice(0, 8)}...
                      </span>
                    )}
                  </div>
                  <Input
                    value={figmaUrl}
                    onChange={(e) => setFigmaUrl(e.target.value)}
                    placeholder="https://www.figma.com/design/... or /file/..."
                    className="text-xs h-9 bg-black/40 border-white/15"
                  />
                  {figmaUrl.trim() && !detectedFileKey && (
                    <p className="text-[10px] text-amber-400/90 leading-tight">
                      Note: Paste any standard Figma link (/design, /file, /proto, /board) or raw file key.
                    </p>
                  )}
                </div>

                {/* Import Action Button */}
                <Button
                  size="sm"
                  className="w-full h-9 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-medium text-xs shadow-lg shadow-indigo-500/20"
                  disabled={figmaBusy || !figmaUrl.trim()}
                  onClick={async () => {
                    setFigmaBusy(true)
                    setFigmaStep('Importing design...')
                    setError(null)
                    setFigmaResult(null)
                    try {
                      const res = await importFigmaByUrl({
                        figma_url: figmaUrl.trim(),
                        project_name: 'Figma Import',
                        access_token: figmaToken.trim() || undefined,
                      })
                      setFigmaResult(res)
                      setFigmaStep('Complete ✓')
                      setFigmaStatus((prev) => ({ ...prev, connected: true }))
                      setShowTokenInput(false)
                      await refreshFigmaProjects()
                    } catch (e: any) {
                      setError(e?.message ?? 'Import failed. Check your Figma URL and token.')
                      setFigmaStep(null)
                    } finally {
                      setFigmaBusy(false)
                      setTimeout(() => setFigmaStep(null), 1500)
                    }
                  }}
                >
                  {figmaBusy && figmaStep ? figmaStep : 'Import Figma Design'}
                </Button>
              </div>
            </SpotlightCard>

            {/* Figma Projects */}
            {figmaProjectsLoading ? (
              <AILoadingState lines={2} />
            ) : figmaProjects.length > 0 ? (
              <SpotlightCard className="rounded-2xl">
                <div className="glass rounded-2xl p-5">
                  <h3 className="font-display font-semibold text-sm mb-3">Imported Projects</h3>
                  <div className="space-y-2">
                    {figmaProjects.map((fp) => (
                      <FigmaProjectCard
                        key={fp.id}
                        project={fp}
                        onClick={() => navigate('/dashboard/figma/' + fp.id)}
                        onDelete={async () => {
                          await deleteFigmaProject(fp.id)
                          await refreshFigmaProjects()
                        }}
                      />
                    ))}
                  </div>
                </div>
              </SpotlightCard>
            ) : (
              <SpotlightCard className="rounded-2xl">
                <div className="glass rounded-2xl p-5 text-sm text-muted-foreground">
                  <div className="font-display font-semibold text-sm mb-2 text-white">No imported Figma projects yet.</div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Connect your Figma token and paste a file URL above to extract frames, components, color tokens, and generate clean React code.
                  </p>
                </div>
              </SpotlightCard>
            )}
          </aside>

          {/* Main content */}
          <div className="space-y-6">
            {/* Create project */}
            <SpotlightCard className="rounded-2xl">
              <div className="glass rounded-2xl p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="New project name..."
                    className="flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && createProject()}
                  />
                  <Button
                    onClick={createProject}
                    disabled={creating || !newName.trim()}
                    variant="gradient"
                    className="w-full sm:w-auto"
                  >
                    {creating ? 'Creating...' : 'Create project'}
                  </Button>
                </div>
              </div>
            </SpotlightCard>

            {/* Projects list */}
            <SpotlightCard className="rounded-2xl">
              <div className="glass rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h3 className="font-display font-semibold">Projects</h3>
                  <span className="text-xs text-muted-foreground">
                    {loading ? 'Loading...' : `${projects.length} total`}
                  </span>
                </div>
                <div className="divide-y divide-border/50">
                  {loading ? (
                    <AILoadingState lines={3} />
                  ) : projects.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="text-2xl mb-3">🚀</div>
                      <p className="text-sm text-muted-foreground">No projects yet. Create your first project above.</p>
                    </div>
                  ) : (
                    projects.map((p) => (
                      <div key={p.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 flex items-center justify-center shrink-0">
                            <span className="text-sm font-semibold text-indigo-300">{p.name[0]?.toUpperCase()}</span>
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-sm truncate">{p.name}</div>
                            <div className="text-xs text-muted-foreground">Created {new Date(p.created_at).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteProject(p.id)}
                          className="text-muted-foreground hover:text-red-400 shrink-0 self-stretch sm:self-auto"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </SpotlightCard>

            {/* Bottom stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              {bottomStats.map((stat) => (
                <SpotlightCard key={stat.label} className="rounded-xl">
                  <div className="glass rounded-xl p-3 text-center">
                    <div className="text-lg">{stat.icon}</div>
                    <div className="text-lg font-semibold font-display mt-1">{stat.value}</div>
                    <div className="text-[10px] text-muted-foreground">{stat.label}</div>
                  </div>
                </SpotlightCard>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PageTransition>
  )
}
