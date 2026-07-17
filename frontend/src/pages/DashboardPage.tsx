import { useEffect, useMemo, useState } from 'react'
import { API } from '../services/api'
import { useAuth } from '../context/AuthContext'

type Project = {
  id: string
  name: string
  created_at: string
}

export default function DashboardPage() {
  const { token } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <section className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-72">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="font-semibold">Your workspace</div>
            <div className="text-sm text-slate-400 mt-1">Projects are stored securely per account.</div>

            <div className="mt-6 p-3 rounded-xl border border-white/10 bg-slate-950/30">
              <div className="text-sm font-semibold text-slate-100">Upload area (Phase 2)</div>
              <div className="text-xs text-slate-400 mt-1">Screenshot upload + AI analysis will appear here.</div>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold">Dashboard</h1>
              <p className="text-slate-400 mt-2">Create and manage your projects.</p>
            </div>

            <div className="w-full sm:w-auto">
              <div className="flex gap-2">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="New project name"
                  className="flex-1 rounded-xl border border-white/10 bg-slate-950/30 px-3 py-2 outline-none focus:border-indigo-500 text-sm"
                />
                <button
                  onClick={createProject}
                  disabled={creating || !newName.trim()}
                  className="rounded-xl bg-white text-slate-950 font-semibold px-4 py-2 text-sm hover:bg-white/90 disabled:opacity-60"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>

          {error ? (
            <div className="mt-4 p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 text-sm">
              {error}
            </div>
          ) : null}

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 text-sm text-slate-300 flex items-center justify-between">
              <span>Projects</span>
              <span className="text-slate-500">{loading ? 'Loading...' : `${projects.length} total`}</span>
            </div>

            <div className="divide-y divide-white/10">
              {loading ? (
                <div className="p-6 text-slate-400 text-sm">Loading projects...</div>
              ) : projects.length === 0 ? (
                <div className="p-6 text-slate-400 text-sm">
                  No projects yet. Create your first project above.
                </div>
              ) : (
                projects.map((p) => (
                  <div key={p.id} className="p-4 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-semibold text-slate-100">{p.name}</div>
                      <div className="text-xs text-slate-500">Created: {new Date(p.created_at).toLocaleString()}</div>
                    </div>
                    <button
                      onClick={() => deleteProject(p.id)}
                      className="text-sm px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

