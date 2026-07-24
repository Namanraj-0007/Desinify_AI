import os

path = r'c:\Users\harsh\OneDrive\Desktop\DesinifyAI\frontend\src\components\codegen\CodePreview.tsx'

# Read the generated file and fix the JSX issues
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# The issue is that the file has closing div/ErrorBoundary issues
# Let's rewrite the file completely with clean syntax

new_content = r"""import { useState, useRef, useEffect, useMemo } from 'react'
import { ErrorBoundary } from './ErrorBoundary'

type FileEntry = {
  path: string
  content: string
}

type DeviceMode = 'mobile' | 'tablet' | 'desktop'

const DEVICE_DIMS = {
  mobile: { w: 375, h: 812 },
  tablet: { w: 768, h: 1024 },
  desktop: { w: 1280, h: 800 },
} as const

interface Props {
  files: FileEntry[]
  onRefresh?: () => void
  refreshing?: boolean
}

function esc(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$').replace(/<\/script>/gi, '<\\/script>')
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '<').replace(/>/g, '>')
}

function buildPreviewHtml(files: FileEntry[]): string {
  const allCss = files.filter(f => f.path.endsWith('.css')).map(f => f.content).join('\n')
  const appFile = files.find(f => f.path === 'src/App.tsx' || f.path === 'App.tsx')
  const otherFiles = files.filter(f => !f.path.endsWith('.css') && f.path !== 'src/App.tsx' && f.path !== 'App.tsx' && f.path !== 'src/main.tsx' && !f.path.includes('node_modules'))

  if (appFile) {
    const eApp = esc(appFile.content)
    let compDecl = ''
    for (const f of otherFiles) {
      const n = 'c_' + f.path.replace(/^(src\/)?/, '').replace(/\.(tsx|ts|jsx|js)$/, '').replace(/[\/\\]/g, '_').replace(/[^a-zA-Z0-9_]/g, '_')
      const eF = esc(f.content)
      compDecl += '// FILE: ' + f.path + '\n'
      compDecl += '(function(){\n'
      compDecl += 'var s = `' + eF + '`;\n'
      compDecl += 'try {\n'
      compDecl += 'var r = Babel.transform(s,{presets:["react","typescript"],filename:"' + f.path + '"}).code;\n'
      compDecl += 'r = r.replace(/import\s+[\s\S]*?from\s+["\'][\s\S]*?["\']\s*;?/g,"");\n'
      compDecl += 'r = r.replace(/import\s+["\'][\s\S]*?["\']\s*;?/g,"");\n'
      compDecl += 'r = r.replace(/export\s+default\s+/g,"window.' + n + '_default=");\n'
      compDecl += 'r = r
