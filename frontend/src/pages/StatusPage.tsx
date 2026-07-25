import { motion } from 'framer-motion'
import PageTransition from '../components/ui/PageTransition'
import AuroraBackground from '../components/ui/AuroraBackground'
import { Badge } from '../components/ui/badge'
import SpotlightCard from '../components/ui/SpotlightCard'

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6 },
}

type ServiceStatus = 'operational' | 'degraded' | 'downtime'

interface ServiceCard {
  name: string
  status: ServiceStatus
  description: string
  uptime: string
  responseTime: string
  icon: string
}

const services: ServiceCard[] = [
  {
    name: 'Website',
    status: 'operational',
    description: 'Main website, landing pages, and public content delivery.',
    uptime: '99.99%',
    responseTime: '< 100ms',
    icon: 'M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418',
  },
  {
    name: 'Authentication',
    status: 'operational',
    description: 'User authentication, Google OAuth, JWT token management.',
    uptime: '99.95%',
    responseTime: '< 200ms',
    icon: 'M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9',
  },
  {
    name: 'Figma API',
    status: 'operational',
    description: 'Figma file import, OAuth integration, and design data fetching.',
    uptime: '99.90%',
    responseTime: '< 500ms',
    icon: 'M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42',
  },
  {
    name: 'AI Generation',
    status: 'operational',
    description: 'AI code generation, design analysis, and chat editing powered by Google Gemini.',
    uptime: '99.85%',
    responseTime: '< 2s',
    icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z',
  },
]

const statusConfig: Record<ServiceStatus, { label: string; color: string; dotColor: string }> = {
  operational: {
    label: 'Operational',
    color: 'border-emerald-500/20 bg-emerald-500/5',
    dotColor: 'bg-emerald-400 shadow-emerald-500/30',
  },
  degraded: {
    label: 'Degraded',
    color: 'border-amber-500/20 bg-amber-500/5',
    dotColor: 'bg-amber-400 shadow-amber-500/30',
  },
  downtime: {
    label: 'Downtime',
    color: 'border-red-500/20 bg-red-500/5',
    dotColor: 'bg-red-400 shadow-red-500/30',
  },
}

function StatusDot({ status }: { status: ServiceStatus }) {
  const config = statusConfig[status]
  return (
    <span className="relative flex h-3 w-3">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.dotColor} opacity-75`} />
      <span className={`relative inline-flex rounded-full h-3 w-3 ${config.dotColor}`} />
    </span>
  )
}

const incidentHistory = [
  {
    date: 'March 10, 2025',
    title: 'Figma API Latency',
    status: 'resolved' as const,
    description: 'Increased latency on Figma API endpoint due to upstream rate limiting. Resolved within 15 minutes.',
    duration: '15 min',
  },
  {
    date: 'February 28, 2025',
    title: 'AI Generation Delay',
    status: 'resolved' as const,
    description: 'Generation queue experienced a backlog due to high demand. All requests processed successfully with 10-minute delay.',
    duration: '45 min',
  },
]

export default function StatusPage() {
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
            <Badge variant="gradient" className="mb-4">System Status</Badge>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1]">
              All systems <span className="text-gradient">operational</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Current status of Designify AI services and infrastructure.
            </p>

            {/* Global Status Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-8 inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20"
            >
              <StatusDot status="operational" />
              <span className="text-sm font-medium text-emerald-300">
                All services operational
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Service Cards */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-4 lg:gap-6">
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
                  <SpotlightCard className="h-full rounded-2xl">
                    <div className={`glass rounded-2xl p-6 h-full border ${config.color}`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 flex items-center justify-center text-indigo-400">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d={service.icon} />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-display font-semibold text-base">{service.name}</h3>
                            <p className="text-xs text-muted-foreground">{service.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusDot status={service.status} />
                          <span className={`text-[10px] font-medium ${
                            service.status === 'operational' ? 'text-emerald-300' :
                            service.status === 'degraded' ? 'text-amber-300' : 'text-red-300'
                          }`}>
                            {config.label}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-6 pt-4 border-t border-white/5">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Uptime</p>
                          <p className="text-sm font-semibold text-foreground font-mono mt-0.5">{service.uptime}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Response Time</p>
                          <p className="text-sm font-semibold text-foreground font-mono mt-0.5">{service.responseTime}</p>
                        </div>
                      </div>
                    </div>
                  </SpotlightCard>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Incident History */}
      <section className="py-16 sm:py-24 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="mb-12 text-center">
            <Badge variant="gradient" className="mb-4">Incident History</Badge>
            <h2 className="font-display text-3xl font-semibold tracking-tight">Past Incidents</h2>
            <p className="mt-4 text-muted-foreground">
              Transparency on past incidents and our response times.
            </p>
          </motion.div>

          <div className="space-y-4">
            {incidentHistory.map((incident, i) => (
              <motion.div
                key={incident.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.08 }}
              >
                <SpotlightCard className="rounded-xl">
                  <div className="glass rounded-xl px-6 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-foreground">{incident.title}</span>
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-500/20">
                            Resolved
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {incident.description}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <time className="text-[10px] text-muted-foreground block">{incident.date}</time>
                        <span className="text-[10px] text-muted-foreground font-mono">{incident.duration}</span>
                      </div>
                    </div>
                  </div>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Uptime Promise */}
      <section className="py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeUp}>
            <div className="glass rounded-3xl p-8 sm:p-12 border border-white/5">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 flex items-center justify-center text-indigo-400 mx-auto mb-6">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight mb-4">
                Our uptime promise
              </h2>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
                We strive for 99.99% uptime across all services. In the event of any disruption,
                our team responds immediately to restore service and publishes a detailed incident
                report for transparency.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </PageTransition>
  )
}

