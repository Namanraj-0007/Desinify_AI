import { API } from '../services/api'

type AuthConfig = { headers?: Record<string, string> }

export type Project = { id: string; name: string; created_at: string }

export async function listProjects(config?: AuthConfig) {
  const res = await API.get('/projects', config)
  return res.data as { projects: Project[] }
}

export async function createProject(name: string, config?: AuthConfig) {
  const res = await API.post('/projects', { name }, config)
  return res.data as Project
}

export async function deleteProject(id: string, config?: AuthConfig) {
  const res = await API.delete(`/projects/${id}`, config)
  return res.data
}

