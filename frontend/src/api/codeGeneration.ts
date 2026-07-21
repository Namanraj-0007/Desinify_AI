import { API } from '../services/api'

// ─── Types ──────────────────────────────────────────────────────

export type GenerateCodeRequest = {
  project_id: string
  frame_ids: string[]
  framework: 'react' | 'nextjs' | 'html'
  typescript: boolean
  tailwind: boolean
  optimization_level: 'standard' | 'aggressive'
}

export type FileOutput = {
  path: string
  content: string
}

export type GeneratedCodeResponse = {
  generation_id: string
  project_id: string
  framework: string
  typescript: boolean
  tailwind: boolean
  files: FileOutput[]
  folder_structure: string[]
  stats: Record<string, any>
  frame_ids: string[]
  created_at: string
}

export type GenerationVersion = {
  id: string
  project_id: string
  project_name: string
  figma_file_key: string
  version_number: number
  framework: string
  typescript: boolean
  tailwind: boolean
  optimization_level: string
  files: FileOutput[]
  folder_structure: string[]
  stats: Record<string, any>
  frame_ids: string[]
  created_at: string
}

export type OptimizeCodeRequest = {
  generation_id: string
  improvement_type: 'structure' | 'accessibility' | 'responsiveness' | 'tailwind' | 'naming'
  framework: string
}

export type ExportRequest = {
  generation_id: string
  format: string
}

// ─── API Functions ──────────────────────────────────────────────

export async function generateCode(payload: GenerateCodeRequest): Promise<GeneratedCodeResponse> {
  const res = await API.post('/codegen/generate', payload)
  return res.data
}

export async function getGenerationHistory(projectId: string): Promise<{ versions: GenerationVersion[] }> {
  const res = await API.get(`/codegen/history/${projectId}`)
  return res.data
}

export async function getGeneration(generationId: string): Promise<GenerationVersion> {
  const res = await API.get(`/codegen/${generationId}`)
  return res.data
}

export async function regenerateCode(payload: OptimizeCodeRequest): Promise<GeneratedCodeResponse> {
  const res = await API.post('/codegen/regenerate', payload)
  return res.data
}

export async function exportGeneration(payload: ExportRequest): Promise<{
  ok: boolean
  files: FileOutput[]
  folder_structure: string[]
  export_format: string
  total_files: number
}> {
  const res = await API.post('/codegen/export', payload)
  return res.data
}
