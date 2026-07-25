import { useState } from 'react'
import { motion } from 'framer-motion'
import PageTransition from '../components/ui/PageTransition'
import AuroraBackground from '../components/ui/AuroraBackground'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import SpotlightCard from '../components/ui/SpotlightCard'

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6 },
}

const endpoints = [
  {
    method: 'POST',
    path: '/api/v1/generate',
    desc: 'Generate code from a design input (image URL or Figma URL).',
    auth: 'Required',
    body: `{
  "design_url": "https://figma.com/file/...",
  "framework": "react",
  "styling": "tailwind",
  "options": {
    "typescript": true,
    "responsive": true
  }
}`,
    response: `{
  "id": "gen_abc123",
  "status": "processing",
  "components": [...],
  "created_at": "2025-03-15T10:30:00Z"
}`,
  },
  {
    method: 'GET',
    path: '/api/v1/generate/{id}',
    desc: 'Get the status and result of a generation job.',
    auth: 'Required',
    body: 'N/A',
    response: `{
  "id": "gen_abc123",
  "status": "completed",
  "components": [
    {
      "name": "Button",
      "code": "...",
      "types": "...",
      "dependencies": []
    }
  ],
  "created_at": "2025-03-15T10:30:00Z",
  "completed_at": "2025-03-15T10:30:15Z"
}`,
  },
  {
    method: 'POST',
    path: '/api/v1/analyze',
    desc: 'Analyze a design and return extracted design tokens without generating code.',
    auth: 'Required',
    body: `{
  "design_url": "https://example.com/design.png",
  "extract_tokens": true
}`,
    response: `{
  "colors": ["#1a1a2e", "#16213e", "#0f3460"],
  "typography": {
    "fonts": ["Inter", "Space Grotesk"],
    "sizes": [...]
  },
  "layout": "flex column",
  "spacing": { "unit": 8, "grid": 4 }
}`,
  },
  {
    method: 'POST',
    path: '/api/v1/chat/edit',
    desc: 'Use AI to edit previously generated code via natural language.',
    auth: 'Required',
    body: `{
  "generation_id": "gen_abc123",
  "prompt": "Add dark mode support",
  "component": "Button"
}`,
    response: `{
  "id": "edit_def456",
  "status": "completed",
  "components": [
    {
      "name": "Button",
      "code": "... (updated)",
      "changes": ["Added dark mode variants"]
    }
  ]
}`,
  },
  {
    method: 'GET',
    path: '/api/v1/versions/{generation_id}',
    desc: 'List all versions for a given generation.',
    auth: 'Required',
    body: 'N/A',
    response: `{
  "versions": [
    {
      "id": "v1",
      "created_at": "2025-03-15T10:30:00Z",
      "description": "Initial generation"
    },
    {
      "id": "v2",
      "created_at": "2025-03-15T10:35:00Z",
      "description": "Added responsive design"
    }
  ]
}`,
  },
  {
    method: 'GET',
    path: '/api/v1/health',
    desc: 'Check API health and service status.',
    auth: 'Not required',
    body: 'N/A',
    response: `{
  "status": "healthy",
  "version": "1.0.0",
  "uptime": "99.9%",
  "services": {
    "database": "connected",
    "ai": "operational",
    "figma": "operational"
  }
}`,
  },
]

const methodColors: Record<string, string> = {
  GET: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  POST: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  PUT: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  DELETE: 'text-red-400 bg-red-500/10 border-red-500/20',
}

export default function ApiReferencePage() {
  const [expandedEndpoint, setExpandedEndpoint] = useState<number | null>(null)

  return (
    <PageTransition>
      {/* Hero */}
      <section className="relative min-h-[40vh] flex items-center overflow-hidden">
        <AuroraBackground />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 sm:py-36">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl mx-auto text-center"
          >
            <Badge variant="gradient" className="mb-4">API Reference</Badge>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1]">
              <span className="text-gradient">REST API</span> Reference
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Build powerful integrations with the Designify AI API. Generate, analyze, and manage code programmatically.
            </p>
          </motion.div>
        </div>
      </section>

      {/* API Overview */}
      <section className="py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="mb-16">
            <Badge variant="gradient" className="mb-4">Overview</Badge>
            <h2 className="font-display text-3xl font-semibold tracking-tight mb-6">API Overview</h2>
            <div className="glass rounded-2xl p-6 sm:p-8 space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                The Designify AI API allows you to programmatically generate React components from designs,
                analyze design tokens, edit generated code via AI chat, and manage version history.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                <div>
                  <h4 className="text-xs font-medium text-foreground uppercase tracking-wider mb-2">Base URL</h4>
                  <pre className="text-xs text-indigo-300 font-mono bg-black/40 rounded-lg px-3 py-2 border border-white/5">
                    https://api.designifyai.com
                  </pre>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-foreground uppercase tracking-wider mb-2">Version</h4>
                  <pre className="text-xs text-indigo-300 font-mono bg-black/40 rounded-lg px-3 py-2 border border-white/5">
                    v1 (latest)
                  </pre>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Authentication */}
          <motion.div {...fadeUp} className="mb-16">
            <Badge variant="gradient" className="mb-4">Authentication</Badge>
            <h2 className="font-display text-3xl font-semibold tracking-tight mb-6">Authentication</h2>
            <div className="glass rounded-2xl p-6 sm:p-8 space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                All API requests (except health check) require authentication via Bearer token.
                You can generate an API key from your Designify AI dashboard settings.
              </p>
              <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                <p className="text-xs text-muted-foreground mb-2 font-medium">Authentication Header:</p>
                <pre className="text-xs text-indigo-200/80 font-mono leading-relaxed">
                  {`Authorization: Bearer dsn_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`}
                </pre>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                <p className="text-xs text-amber-300 font-medium flex items-center gap-2">
                  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  Never expose your API key in client-side code. Use server-side proxies for frontend applications.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Endpoints */}
          <motion.div {...fadeUp}>
            <Badge variant="gradient" className="mb-4">Endpoints</Badge>
            <h2 className="font-display text-3xl font-semibold tracking-tight mb-6">Endpoints</h2>
            <div className="space-y-4">
              {endpoints.map((ep, i) => (
                <motion.div
                  key={ep.path}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: i * 0.05 }}
                >
                  <button
                    onClick={() => setExpandedEndpoint(expandedEndpoint === i ? null : i)}
                    className="w-full text-left"
                  >
                    <SpotlightCard className="rounded-xl">
                      <div className="glass rounded-xl px-6 py-4 hover:bg-white/[0.03] transition-colors">
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex px-2 py-0.5 rounded border text-[10px] font-mono font-semibold uppercase ${methodColors[ep.method] || 'text-muted-foreground'}`}>
                            {ep.method}
                          </span>
                          <span className="text-sm font-mono text-foreground flex-1">{ep.path}</span>
                          <span className="text-xs text-muted-foreground hidden sm:block">{ep.desc}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                            ep.auth === 'Required'
                              ? 'text-amber-300 bg-amber-500/10'
                              : 'text-emerald-300 bg-emerald-500/10'
                          }`}>
                            {ep.auth}
                          </span>
                          <svg
                            className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                              expandedEndpoint === i ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                          </svg>
                        </div>
                        {expandedEndpoint === i && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            transition={{ duration: 0.2 }}
                            className="mt-4 pt-4 border-t border-white/5 space-y-4"
                          >
                            <p className="text-sm text-muted-foreground">{ep.desc}</p>
                            {ep.body !== 'N/A' && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-2 font-medium">Request Body:</p>
                                <pre className="bg-black/40 rounded-lg p-3 overflow-x-auto text-xs text-indigo-200/80 font-mono leading-relaxed border border-white/5">
                                  <code>{ep.body}</code>
                                </pre>
                              </div>
                            )}
                            <div>
                              <p className="text-xs text-muted-foreground mb-2 font-medium">Response:</p>
                              <pre className="bg-black/40 rounded-lg p-3 overflow-x-auto text-xs text-indigo-200/80 font-mono leading-relaxed border border-white/5">
                                <code>{ep.response}</code>
                              </pre>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </SpotlightCard>
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Rate Limits */}
          <motion.div {...fadeUp} className="mt-16">
            <Badge variant="gradient" className="mb-4">Rate Limits</Badge>
            <h2 className="font-display text-3xl font-semibold tracking-tight mb-6">Rate Limits</h2>
            <div className="glass rounded-2xl p-6 sm:p-8">
              <div className="grid sm:grid-cols-3 gap-6">
                {[
                  { tier: 'Free', limit: '60 requests/hour', desc: 'For testing and evaluation' },
                  { tier: 'Pro', limit: '10,000 requests/hour', desc: 'For production applications' },
                  { tier: 'Enterprise', limit: 'Custom', desc: 'Contact us for custom limits' },
                ].map((tier) => (
                  <div key={tier.tier} className="text-center p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <h4 className="font-display font-semibold text-sm text-indigo-300 mb-2">{tier.tier}</h4>
                    <p className="text-lg font-semibold text-foreground mb-1">{tier.limit}</p>
                    <p className="text-[10px] text-muted-foreground">{tier.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </PageTransition>
  )
}

