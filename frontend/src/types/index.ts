// ─── Shared Type Definitions ─────────────────────────────────────────

import type { ReactNode } from 'react'

// ─── Design Data ─────────────────────────────────────────────────────

export type DesignSource = 'figma' | 'image' | 'url'

export type DesignStatus =
  | 'uploading'
  | 'processing'
  | 'parsed'
  | 'error'
  | 'ready'
  | 'generating'
  | 'completed'

export type DesignData = {
  id: string
  projectId: string
  source: DesignSource
  status: DesignStatus
  name: string
  thumbnailUrl?: string
  originalUrl?: string
  figmaFileKey?: string
  error?: string
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export type ParsedDesign = {
  designId: string
  frames: FrameData[]
  components: ComponentData[]
  colors: ColorData[]
  typography: TypographyData[]
  assets: AssetData[]
}

export type FrameData = {
  id: string
  name: string
  type: string
  x: number
  y: number
  width: number
  height: number
  backgroundColor?: string
  childrenCount: number
}

export type ComponentData = {
  id: string
  name: string
  type: 'COMPONENT' | 'INSTANCE'
  componentSet?: string
  width: number
  height: number
  childrenCount: number
}

export type ColorData = {
  name: string
  hex: string
  rgba: { r: number; g: number; b: number; a: number }
  usageCount: number
}

export type TypographyData = {
  fontFamily: string
  fontSize: number
  fontWeight: number | string
  lineHeight: number
  letterSpacing: number
  textAlign: string
  usageCount: number
}

export type AssetData = {
  id: string
  name: string
  type: string
  url?: string
  width: number
  height: number
}

// ─── Code Generation ─────────────────────────────────────────────────

export type Framework = 'react' | 'nextjs' | 'html'
export type OptimizationLevel = 'standard' | 'aggressive'
export type ImprovementType =
  | 'structure'
  | 'accessibility'
  | 'responsiveness'
  | 'tailwind'
  | 'naming'

export type CodeGenerationRequest = {
  projectId: string
  frameIds: string[]
  framework: Framework
  typescript: boolean
  tailwind: boolean
  optimizationLevel: OptimizationLevel
}

export type CodeGenerationStatus =
  | 'idle'
  | 'queued'
  | 'generating'
  | 'optimizing'
  | 'completed'
  | 'failed'

export type CodeGenerationProgress = {
  step: number
  message: string
  percentage: number
  stage?: string
}

export type FileOutput = {
  path: string
  content: string
}

export type CodeGenerationResult = {
  id: string
  projectId: string
  versionNumber: number
  framework: Framework
  typescript: boolean
  tailwind: boolean
  optimizationLevel: string
  files: FileOutput[]
  folderStructure: string[]
  frameIds: string[]
  stats: GenerationStats
  createdAt: string
}

export type GenerationStats = {
  totalFiles: number
  totalComponents: number
  totalLines: number
  totalCharacters: number
  componentBreakdown?: Record<string, number>
}

// ─── User & Auth ─────────────────────────────────────────────────────

export type UserProfile = {
  id: string
  name: string
  email: string
  avatarUrl?: string
  createdAt: string
  plan?: 'free' | 'pro' | 'enterprise'
}

export type AuthState = {
  isAuthenticated: boolean
  isLoading: boolean
  user: UserProfile | null
  token: string | null
}

// ─── API Response ────────────────────────────────────────────────────

export type APIResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// ─── UI ──────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export type Toast = {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
}

export type TabItem = {
  id: string
  label: string
  icon?: ReactNode
  count?: number
  disabled?: boolean
}

export type SelectOption<T = string> = {
  value: T
  label: string
  disabled?: boolean
  icon?: ReactNode
}

// ─── Theme ───────────────────────────────────────────────────────────

export type Theme = 'dark' | 'light'

export type ThemeConfig = {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

// ─── Project ─────────────────────────────────────────────────────────

export type ProjectSummary = {
  id: string
  name: string
  createdAt: string
  updatedAt?: string
  designCount?: number
  generationCount?: number
  thumbnailUrl?: string
}

// ─── Figma ───────────────────────────────────────────────────────────

export type FigmaConnection = {
  connected: boolean
  tokenPrefix?: string
  userId?: string
}

export type FigmaImportPayload = {
  figmaUrl: string
  projectName?: string
}

export type FigmaImportResult = {
  projectId: string
  figmaFileKey: string
  pages: unknown[]
  frames: unknown[]
  components: unknown[]
  images: unknown[]
  colors: unknown[]
  typography: unknown[]
  stats: {
    totalFrames: number
    totalComponents: number
    totalImages: number
    totalColors: number
    totalTypographyStyles: number
  }
}

export type FigmaProjectSummary = {
  id: string
  projectName: string
  figmaFileKey: string
  createdAt: string
  stats: {
    totalFrames: number
    totalComponents: number
    totalImages: number
    totalColors: number
    totalTypographyStyles: number
  }
}

// ─── Event Handlers ──────────────────────────────────────────────────

export type DragEventHandlers = {
  onDragEnter: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
}

export type ClickEventHandlers = {
  onClick: (e: React.MouseEvent) => void
  onDoubleClick?: (e: React.MouseEvent) => void
  onContextMenu?: (e: React.MouseEvent) => void
}

// ─── Utility ─────────────────────────────────────────────────────────

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type ValueOf<T> = T[keyof T]

export type NonEmptyArray<T> = [T, ...T[]]

export type AsyncFunction<Args extends unknown[] = unknown[], Return = unknown> = (
  ...args: Args
) => Promise<Return>

export type Nullable<T> = T | null | undefined

