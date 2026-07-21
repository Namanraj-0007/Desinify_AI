import { API } from '../services/api'

export type Project = { id: string; name: string; created_at: string }

export async function listProjects() {
  const res = await API.get('/projects')
  return res.data as { projects: Project[] }
}

export async function createProject(name: string) {
  const res = await API.post('/projects', { name })
  return res.data as Project
}

export async function deleteProject(id: string) {
  const res = await API.delete(`/projects/${id}`)
  return res.data
}


