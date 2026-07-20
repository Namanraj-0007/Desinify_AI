import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { API } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { connectFigmaToken, importFigmaByUrl } from '../api/figma'
import { FigmaParserPanels } from '../components/figma/FigmaParserPanels'
import PageTransition from '../components/ui/PageTransition'
import SpotlightCard from '../components/ui/SpotlightCard'
import AILoadingState from '../components/ui/AILoadingState'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'

type Project = {
  id: string
  name: string
  created_at: string
}

const statsCards = [
  { label: 'Total Projects', value: '—', icon: '📁' },
  { label: 'Components Generated', value: '—', icon: '⚛️' },
  { label: 'AI Edits Used', value: '—', icon: '🤖' },
  { label: 'Storage Used', value: '—', icon: '💾' },
]

export default function DashboardPage() {
  const { token } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')

  const [figmaToken, setFigmaToken] = useState('')
  const [figmaUrl, setFigmaUrl] = useState('')
  const [figmaBusy, setFigmaBusy] = useState(false)
  const [figmaStep, setFigmaStep] = useState<string | null>(null)
  const [figmaResult, setFigmaResult] = useState<null | {
    pages: any[]
    typography: any[]
    colors: any[]
  }>(null)

  async function refresh() {
    setLoading(true)
    setError(null)
    try {
      const res = await API.get('/projects')
      setProjects(res.data.projects)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to fetch projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

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
      await refresh()
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

        {figmaResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <FigmaParserPanels
              pages={figmaResult.pages}
              typography={figmaResult.typography}
              colors={figmaResult.colors}
            />
          </motion.div>
        )}

        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Stats mini-cards */}
            <div className="grid grid-cols-2 gap-3">
              {statsCards.slice(0, 2).map((stat) => (
                <SpotlightCard key={stat.label} className="rounded-xl">
                  <div className="glass rounded-xl p-3 text-center">
                    <div className="text-lg">{stat.icon}</div>
                    <div className="text-lg font-semibold font-display mt-1">{stat.value}</div>
                    <div className="text-[10px] text-muted-foreground">{stat.label}</div>
                  </div>
                </SpotlightCard>
              ))}
            </div>

            {/* Figma Integration */}
            <SpotlightCard className="rounded-2xl">
              <div className="glass rounded-2xl p-5 space-y-4">
                <div>
                  <h3 className="font-display font-semibold text-sm">Figma Integration</h3>
                  <p className="text-xs text-muted-foreground mt-1">Connect your Figma token and import designs.</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Access Token</label>
                    <Input
                      value={figmaToken}
                      onChange={(e) => setFigmaToken(e.target.value)}
                      placeholder="figd_..."
                      className="text-xs h-9"
                    />
                  </div>

                  <Button
                    size="sm"
                    className="w-full"
                    disabled={figmaBusy || !figmaToken.trim()}
                    onClick={async () => {
                      setFigmaBusy(true)
                      setFigmaStep('Validating...')
                      setError(null)
                      try {
                        await connectFigmaToken(figmaToken.trim())
                        setFigmaStep('Connected ✓')
                      } catch (e: any) {
                        setError(e?.message ?? 'Failed to connect')
                        setFigmaStep(null)
                      } finally {
                        setFigmaBusy(false)
                        setTimeout(() => setFigmaStep(null), 1500)
                      }
                    }}
                  >
                    {figmaBusy && figmaStep ? figmaStep : 'Connect'}
                  </Button>

                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">File URL</label>
                    <Input
                      value={figmaUrl}
                      onChange={(e) => setFigmaUrl(e.target.value)}
                      placeholder="https://www.figma.com/file/..."
                      className="text-xs h-9"
                    />
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    disabled={figmaBusy || !figmaUrl.trim()}
                    onClick={async () => {
                      setFigmaBusy(true)
                      setFigmaStep('Importing...')
                      setError(null)
                      setFigmaResult(null)
                      try {
                        const res = await importFigmaByUrl({
                          figma_url: figmaUrl.trim(),
                          project_name: 'Figma Import',
                        })
                        setFigmaResult({ pages: res.pages, typography: res.typography, colors: res.colors })
                        setFigmaStep('Complete ✓')
                      } catch (e: any) {
                        setError(e?.message ?? 'Import failed')
                        setFigmaStep(null)
                      } finally {
                        setFigmaBusy(false)
                        setTimeout(() => setFigmaStep(null), 1500)
                      }
                    }}
                  >
                    {figmaBusy && figmaStep ? figmaStep : 'Import'}
                  </Button>
                </div>
              </div>
            </SpotlightCard>
          </aside>

          {/* Main content */}
          <div className="space-y-6">
            {/* Create project */}
            <SpotlightCard className="rounded-2xl">
              <div className="glass rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row gap-3">
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
                  >
                    {creating ? 'Creating...' : 'Create project'}
                  </Button>
                </div>
              </div>
            </SpotlightCard>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300"
              >
                {error}
              </motion.div>
            )}

            {/* Projects list */}
            <SpotlightCard className="rounded-2xl">
              <div className="glass rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
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
                      <div key={p.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 flex items-center justify-center shrink-0">
                            <span className="text-sm font-semibold text-indigo-300">{p.name[0]?.toUpperCase()}</span>
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-sm truncate">{p.name}</div>
                            <div className="text-xs text-muted-foreground">
                              Created {new Date(p.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteProject(p.id)}
                          className="text-muted-foreground hover:text-red-400 shrink-0"
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {statsCards.slice(2).map((stat) => (
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

