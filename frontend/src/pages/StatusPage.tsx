import { motion } from 'framer-motion'
import PageTransition from '../components/ui/PageTransition'
import AuroraBackground from '../components/ui/AuroraBackground'
import { Badge } from '../components/ui/Badge'
import SpotlightCard from '../components/ui/SpotlightCard'
import SpatialTiltCard from '../components/ui/SpatialTiltCard'

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6 },
}

type ServiceStatus = 'operational' | 'ready' | 'connected'

interface ServiceCard {
  name: string
  status: ServiceStatus
  description: string
  target: string
  runtime: string
  icon: string
}

const services: ServiceCard[] = [
  {
    name: 'Frontend Web Application',
    status: 'operational',
    description: 'React 18 + Vite SPA, Three.js 3D spatial viewport, and Tailwind CSS styling.',
    target: 'Client-Side SPA',
    runtime: 'Vite 5 / React 18',
    icon: 'M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418',
  },
  {
    name: 'FastAPI Backend Engine',
    status: 'operational',
    description: 'Asynchronous REST API, JWT authentication, and project generation orchestration.',
    target: 'Port 8000',
    runtime: 'Python 3.12 / Uvicorn',
    icon: 'M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9',
  },
  {
    name: 'Google Gemini 2.5 Flash',
    status: 'connected',
    description: 'Multimodal vision and code inference engine parsing design layouts into ASTs.',
    target: 'Gemini API',
    runtime: 'google-genai SDK',
    icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z',
  },
  {
    name: 'Figma REST Gateway',
    status: 'ready',
    description: 'Direct Figma file inspection, frame tree parsing, and asset export coordinator.',
    target: 'Figma v1 API',
    runtime: 'OAuth & Access Token',
    icon: 'M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42',
  },
  {
    name: 'Persistence & Cache',
    status: 'operational',
    description: 'Document database storing projects, AST trees, with seamless In-Memory fallback.',
    target: 'MongoDB / Memory',
    runtime: 'Motor Async Driver',
    icon: 'M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125',
  },
]

const statusConfig: Record<ServiceStatus, { label: string; color: string; dotColor: string }> = {
  operational: {
    label: 'Operational',
    color: 'border-emerald-500/20 bg-emerald-500/5',
    dotColor: 'bg-emerald-400 shadow-emerald-500/30',
  },
  connected: {
    label: 'Connected',
    color: 'border-cyan-500/20 bg-cyan-500/5',
    dotColor: 'bg-cyan-400 shadow-cyan-500/30',
  },
  ready: {
    label: 'Ready',
    color: 'border-indigo-500/20 bg-indigo-500/5',
    dotColor: 'bg-indigo-400 shadow-indigo-500/30',
  },
}

function StatusDot({ status }: { status: ServiceStatus }) {
  const config = statusConfig[status]
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.dotColor} opacity-75`} />
      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${config.dotColor}`} />
    </span>
  )
}

export default function StatusPage() {
  return (
    <PageTransition>
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <AuroraBackground />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div {...fadeUp} className="text-center">
            <Badge variant="gradient" className="mb-4">System Architecture</Badge>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight">
              Service <span className="text-gradient">Health</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Live status of the Designify AI application stack and neural pipeline services.
            </p>

            {/* Global Status Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-8 inline-flex items-center gap-3 px-6 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md"
            >
              <StatusDot status="operational" />
              <span className="text-sm font-medium text-emerald-300">
                All Core Services Operational
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Service Cards */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((service, i) => {
              const config = statusConfig[service.status]
              return (
                <motion.div
                  key={service.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                >
                  <SpatialTiltCard className="h-full">
                    <div className={`glass rounded-2xl p-6 h-full border ${config.color} flex flex-col justify-between`}>
                      <div>
                        <div className="flex items-start justify-between mb-4">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 flex items-center justify-center text-indigo-400">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d={service.icon} />
                            </svg>
                          </div>
                          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                            <StatusDot status={service.status} />
                            <span className="text-[11px] font-medium text-foreground">
                              {config.label}
                            </span>
                          </div>
                        </div>
                        <h3 className="font-display font-semibold text-base">{service.name}</h3>
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{service.description}</p>
                      </div>

                      <div className="flex items-center justify-between pt-5 mt-4 border-t border-white/5 text-xs">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Target</p>
                          <p className="font-mono text-indigo-300 font-medium mt-0.5">{service.target}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Runtime</p>
                          <p className="font-mono text-foreground/80 mt-0.5">{service.runtime}</p>
                        </div>
                      </div>
                    </div>
                  </SpatialTiltCard>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Self-Project Architecture Details */}
      <section className="py-16 sm:py-20 border-t border-border/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeUp}>
            <div className="glass rounded-3xl p-8 sm:p-12 border border-white/10 relative overflow-hidden">
              <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-cyan-500/20 blur-3xl" />

              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto mb-5">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                </svg>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight mb-3">
                Independent AI Engineering Project
              </h2>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
                Designify AI is an open architecture project designed and built by <span className="text-foreground font-medium">Namandip Raj</span>. All modules run locally or via official direct APIs (Google Gemini, Figma) with zero commercial tracking.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </PageTransition>
  )
}
