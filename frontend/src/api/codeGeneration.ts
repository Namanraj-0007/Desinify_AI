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

export type StreamEvent = {
  type: 'progress' | 'log' | 'file_generated' | 'complete' | 'error' | 'done'
  data?: any
  done?: boolean
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

export async function downloadGenerationZip(generationId: string): Promise<Blob> {
  const res = await API.post('/codegen/export-zip', { generation_id: generationId, format: 'zip' }, {
    responseType: 'blob',
  })
  return res.data
}

// ─── Streaming API ──────────────────────────────────────────────

export function createGenerationStream(
  payload: GenerateCodeRequest,
  onEvent: (event: StreamEvent) => void,
): AbortController {
  const controller = new AbortController()
  const token = localStorage.getItem('access_token') || localStorage.getItem('token')

  const startStream = async () => {
    try {
      const response = await fetch(`${API.defaults?.baseURL || ''}/api/codegen/generate-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })

      if (!response.ok) {
        const errorText = await response.text()
        onEvent({ type: 'error', data: { message: `Stream error: ${errorText}` }, done: true })
        return
      }

      const reader = response.body?.getReader()
      if (!reader) {
        onEvent({ type: 'error', data: { message: 'No response body' }, done: true })
        return
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              onEvent({
                type: data.type || 'log',
                data: data.data,
                done: data.done || false,
              })
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }

      onEvent({ type: 'done', done: true })
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        onEvent({ type: 'error', data: { message: err.message }, done: true })
      }
    }
  }

  startStream()
  return controller
}

// ─── Helpers ────────────────────────────────────────────────────

export function downloadFilesAsZip(generationId: string, filename?: string) {
  downloadGenerationZip(generationId).then((blob) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename || `designify-project-${generationId.slice(0, 8)}.zip`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  })
}

export function getFileExtension(path: string): string {
  const parts = path.split('.')
  return parts.length > 1 ? parts[parts.length - 1] : 'txt'
}

export function getFileLanguage(path: string): string {
  const ext = getFileExtension(path)
  const langMap: Record<string, string> = {
    tsx: 'typescript',
    ts: 'typescript',
    jsx: 'javascript',
    js: 'javascript',
    css: 'css',
    html: 'html',
    json: 'json',
    md: 'markdown',
    yml: 'yaml',
    yaml: 'yaml',
  }
  return langMap[ext] || 'plaintext'
}

