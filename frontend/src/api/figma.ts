import { API } from '../services/api'

export type ConnectFigmaResponse = { ok: boolean; connected?: boolean }

export async function connectFigmaToken(accessToken: string): Promise<ConnectFigmaResponse> {
  // Use x-www-form-urlencoded to reduce browser preflight
  const form = new URLSearchParams()
  form.set('access_token', accessToken)

  const res = await API.post('/figma/token', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  })
  return res.data
}

export type ImportByUrlPayload = { figma_url: string; project_name?: string }

export type FigmaImportResponse = {
  project_id: string
  figma_file_key: string
  pages: any[]
  frames: any[]
  components: any[]
  images: any[]
  typography: any[]
  colors: any[]
}

export async function importFigmaByUrl(payload: ImportByUrlPayload): Promise<FigmaImportResponse> {
  const form = new URLSearchParams()
  form.set('figma_url', payload.figma_url)
  if (payload.project_name) form.set('project_name', payload.project_name)

  const res = await API.post('/figma/import', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  })
  return res.data
}


export async function getFigmaConnected(): Promise<{ connected: boolean }> {
  const res = await API.get('/figma/connected')
  return res.data
}

