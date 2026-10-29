import { API } from '../services/api'

// ─── Response Types ───────────────────────────────────────────────

export type ConnectFigmaResponse = {
  ok: boolean
  connected?: boolean
  user?: {
    handle?: string
    email?: string
    img_url?: string
  }
}

export type FigmaImportResponse = {
  project_id: string
  figma_file_key: string
  pages: any[]
  frames: any[]
  components: any[]
  images: any[]
  typography: any[]
  colors: any[]
  stats: {
    total_frames: number
    total_components: number
    total_images: number
    total_colors: number
    total_typography_styles: number
  }
}

export type FrameDetail = {
  id: string
  name: string
  type: string
  x: number | null
  y: number | null
  width: number | null
  height: number | null
  children_count: number
  backgroundColor: string | null
  clipsContent: boolean
}

export type ComponentDetail = {
  id: string
  name: string
  type: string
  componentSet: string | null
  width: number | null
  height: number | null
  children_count: number
}

export type ImageDetail = {
  id: string
  name: string
  type: string
  imageRef: string | null
  width: number | null
  height: number | null
  opacity: number
}

export type ColorDetail = {
  name: string
  hex: string
  rgba: { r: number; g: number; b: number; a: number }
  usage_count: number
  node_type: string
}

export type TypographyDetail = {
  fontFamily: string | null
  fontSize: number | null
  lineHeightPx: number | null
  lineHeightPercent: number | null
  fontWeight: string | null
  letterSpacing: number | null
  textAlignHorizontal: string | null
  textAlignVertical: string | null
  usage_count: number
}

export type FigmaProjectSummary = {
  id: string
  project_name: string
  figma_file_key: string
  created_at: string
  stats: {
    total_frames: number
    total_components: number
    total_images: number
    total_colors: number
    total_typography_styles: number
  }
}

export type FigmaProjectDetail = {
  id: string
  project_name: string
  figma_file_key: string
  created_at: string
  stats: {
    total_frames: number
    total_components: number
    total_images: number
    total_colors: number
    total_typography_styles: number
  }
  frames: FrameDetail[]
  components: ComponentDetail[]
  images: ImageDetail[]
  colors: ColorDetail[]
  typography: TypographyDetail[]
}

export type ImageRenderResult = {
  images: Record<string, string> // node_id -> image_url
}

export type FigmaConnectedStatus = {
  connected: boolean
  has_user_token?: boolean
  has_env_token?: boolean
  user?: {
    handle?: string
    email?: string
    img_url?: string
  } | null
}

// ─── Client Helper: Extract file key for instant UI feedback ─────

export function extractFigmaFileKey(urlOrKey: string): string | null {
  if (!urlOrKey) return null
  const cleaned = decodeURIComponent(urlOrKey.trim().replace(/^["']|["']$/g, ''))

  // 1. /design/branch/:key or /file/branch/:key
  const branchMatch = cleaned.match(/\/(?:file|design|proto|board)\/branch\/([a-zA-Z0-9_\-]{10,})/)
  if (branchMatch) return branchMatch[1]

  // 2. Standard /(file|design|proto|board)/:key
  const stdMatch = cleaned.match(/\/(?:file|design|proto|board)\/([a-zA-Z0-9_\-]{10,})/)
  if (stdMatch) return stdMatch[1]

  // 3. /community/file/:key
  const comMatch = cleaned.match(/\/community\/file\/([0-9a-zA-Z_\-]{10,})/)
  if (comMatch) return comMatch[1]

  // 4. Raw key (15-45 base62 or alphanumeric chars)
  const keyOnly = cleaned.split('?')[0].split('#')[0].replace(/^\/+|\/+$/g, '')
  if (/^[a-zA-Z0-9_\-]{10,45}$/.test(keyOnly) && !keyOnly.startsWith('http') && !keyOnly.startsWith('figma')) {
    return keyOnly
  }

  return null
}

// ─── API Functions ────────────────────────────────────────────────

export async function connectFigmaToken(accessToken: string): Promise<ConnectFigmaResponse> {
  const res = await API.post('/figma/token', { access_token: accessToken.trim() })
  return res.data
}

export type ImportByUrlPayload = {
  figma_url: string
  project_name?: string
  access_token?: string
}

export async function importFigmaByUrl(payload: ImportByUrlPayload): Promise<FigmaImportResponse> {
  const res = await API.post('/figma/import', {
    figma_url: payload.figma_url.trim(),
    project_name: payload.project_name?.trim() || undefined,
    access_token: payload.access_token?.trim() || undefined,
  })
  return res.data
}

export async function getFigmaConnected(): Promise<FigmaConnectedStatus> {
  const res = await API.get('/figma/connected')
  return res.data
}

export async function listFigmaProjects(): Promise<{ projects: FigmaProjectSummary[] }> {
  const res = await API.get('/figma/projects')
  return res.data
}

export async function getFigmaProjectDetail(id: string): Promise<FigmaProjectDetail> {
  const res = await API.get(`/figma/projects/${id}`)
  return res.data
}

export async function getProjectFrames(projectId: string): Promise<FrameDetail[]> {
  const res = await API.get(`/figma/projects/${projectId}/frames`)
  return res.data
}

export async function getProjectFrame(projectId: string, frameId: string): Promise<FrameDetail> {
  const res = await API.get(`/figma/projects/${projectId}/frames/${frameId}`)
  return res.data
}

export async function getProjectComponents(projectId: string): Promise<ComponentDetail[]> {
  const res = await API.get(`/figma/projects/${projectId}/components`)
  return res.data
}

export async function getProjectImages(projectId: string): Promise<ImageDetail[]> {
  const res = await API.get(`/figma/projects/${projectId}/images`)
  return res.data
}

export async function selectFigmaFrame(projectId: string, frameId: string): Promise<{ ok: boolean }> {
  const res = await API.post(`/figma/projects/${projectId}/select-frame`, { frame_id: frameId })
  return res.data
}

export async function renderFigmaImages(
  fileKey: string,
  nodeIds: string[],
  scale = 1.0,
  format = 'png'
): Promise<ImageRenderResult> {
  const res = await API.post('/figma/image-render', {
    file_key: fileKey,
    node_ids: nodeIds,
    scale,
    format,
  })
  return res.data
}

export async function deleteFigmaProject(id: string): Promise<{ ok: boolean }> {
  const res = await API.delete(`/figma/projects/${id}`)
  return res.data
}
