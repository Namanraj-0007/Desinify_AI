import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import ModernStudioBackground from '../components/ui/ModernStudioBackground'
import InteractiveStudioDeck from '../components/ui/InteractiveStudioDeck'
import InteractiveUploadZone from '../components/ui/InteractiveUploadZone'
import PageTransition from '../components/ui/PageTransition'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'

// ─── Hero Section ─────────────────────────────────────

function HeroSection() {
  const navigate = useNavigate()
  const { token } = useAuth()
  const sectionRef = useRef<HTMLDivElement>(null!)
  const { scrollYProgress } = useScroll()
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, 30])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.6])
  const [showDirectUpload, setShowDirectUpload] = useState(false)

  return (
    <section ref={sectionRef} className="relative min-h-screen pt-28 pb-20 overflow-hidden">
      {/* Clean Modern Studio Background (No 3D Blobs) */}
      <ModernStudioBackground />

      <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Header Text */}
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs font-medium text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.2)] mb-6 backdrop-blur-md"
            >
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
              <span>Next-Gen Design-to-Code Platform</span>
              <span className="text-white/20">|</span>
              <span className="text-slate-400">By Namandip Raj</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]"
            >
              Transform designs into clean,{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-sky-200 to-cyan-300">
                production React code
              </span>
              .
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed font-normal"
            >
              Upload UI screenshots or paste Figma artboard URLs. Powered by Google Gemini to extract vector layouts, color tokens, and clean modular React + Tailwind CSS components.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-4"
            >
              <Button
                size="lg"
                variant="gradient"
                onClick={() => navigate(token ? '/dashboard' : '/auth')}
                className="shadow-[0_0_30px_rgba(99,102,241,0.45)] hover:shadow-[0_0_45px_rgba(99,102,241,0.65)] h-12 px-7 text-sm font-semibold rounded-xl"
              >
                {token ? 'Launch Studio Dashboard' : 'Start Building Free'}
                <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setShowDirectUpload(!showDirectUpload)}
                className="h-12 px-6 text-sm text-slate-200 border-white/15 bg-white/5 hover:bg-white/10 rounded-xl"
              >
                {showDirectUpload ? 'Hide Dropzone' : 'Quick Screenshot Drop'}
              </Button>
            </motion.div>
          </div>

          {/* Quick Direct Upload Drawer (Collapsible) */}
          {showDirectUpload && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="max-w-2xl mx-auto mb-12 p-6 rounded-2xl bg-[#0e1322] border border-indigo-500/30 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Upload Screenshot or Design File</h3>
                <span className="text-xs font-mono text-cyan-400">PNG, JPG, SVG, WebP</span>
              </div>
              <InteractiveUploadZone
                onFileSelect={(file) => {
                  const reader = new FileReader()
                  reader.onload = (e) => {
                    const dataUrl = e.target?.result as string
                    sessionStorage.setItem('uploadedImage', dataUrl)
                    sessionStorage.setItem('uploadedImageName', file.name)
                    navigate(token ? '/dashboard' : '/auth')
                  }
                  reader.readAsDataURL(file)
                }}
                onFigmaUrl={(url) => {
                  sessionStorage.setItem('figmaUrl', url)
                  navigate(token ? '/dashboard' : '/auth')
                }}
              />
            </motion.div>
          )}

          {/* Hero Centerpiece: Interactive Studio Cockpit */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="w-full"
          >
            <InteractiveStudioDeck />
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}

// ─── Core Workflow Bento Grid ─────────────────────────

function BentoFeatures() {
  const bentoItems = [
    {
      title: 'Multimodal Vision AST Parser',
      category: 'AI Pipeline',
      desc: 'Gemini 2.5 extracts font hierarchies, padding, flex alignments, and component boundaries with high fidelity.',
      badge: 'Gemini 2.5',
      accent: 'border-indigo-500/30 bg-indigo-500/5',
      icon: (
        <svg className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </svg>
      ),
    },
    {
      title: 'Direct Figma REST Sync',
      category: 'Integration',
      desc: 'Paste any public Figma file or frame link. Pull vector artboards and color tokens directly without manual exports.',
      badge: 'Figma API',
      accent: 'border-cyan-500/30 bg-cyan-500/5',
      icon: (
        <svg className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
        </svg>
      ),
    },
    {
      title: 'Natural AI Chat Refinement',
      category: 'Interactive Prompting',
      desc: 'Request design adjustments in plain English: "Make the card darker", "Add responsive grid", or "Include hover states".',
      badge: 'Multi-turn Chat',
      accent: 'border-purple-500/30 bg-purple-500/5',
      icon: (
        <svg className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
      ),
    },
    {
      title: 'Pure React + Tailwind Export',
      category: 'Code Quality',
      desc: 'Outputs clean, modular JSX with proper TypeScript interfaces, semantic markup, and zero third-party dependencies.',
      badge: 'Production Ready',
      accent: 'border-emerald-500/30 bg-emerald-500/5',
      icon: (
        <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
        </svg>
      ),
    },
  ]

  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="gradient" className="mb-4">Core Architecture</Badge>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            Built for engineering precision
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300">
            A developer-first toolchain bridging visual creativity and production software.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {bentoItems.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: idx * 0.08, duration: 0.5 }}
              className="h-full"
            >
              <div className={`p-6 rounded-2xl border ${item.accent} backdrop-blur-xl h-full flex flex-col justify-between hover:border-white/20 transition-all shadow-lg`}>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                      {item.icon}
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="font-display font-semibold text-base text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
                <div className="mt-6 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{item.category}</span>
                  <span className="text-cyan-400 font-mono">&rarr;</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── How It Works Section ─────────────────────────────

function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      title: 'Import your UI design',
      desc: 'Drag & drop a screenshot, paste a Figma file URL, or choose a design preset. We support PNG, JPG, WebP, SVG, and direct Figma links.',
      tag: 'Any Visual Input',
    },
    {
      number: '02',
      title: 'Neural AST extraction',
      desc: 'Gemini analyzes typography, padding, color schemes, component hierarchies, and interactive boundaries into structured design tokens.',
      tag: 'Gemini 2.5 Vision',
    },
    {
      number: '03',
      title: 'Export React + Tailwind',
      desc: 'Generate clean, modular React + Tailwind CSS code. Inspect live in the preview sandbox, edit via AI chat, and copy.',
      tag: 'Instant TSX Output',
    },
  ]

  return (
    <section id="how-it-works" className="relative py-24 sm:py-32 border-t border-white/5 bg-[#090b14]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="gradient" className="mb-4">Workflow</Badge>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            Three simple steps
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300">
            From design visual to clean production-ready React components in seconds.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className="p-7 rounded-2xl bg-[#0e1220]/80 border border-white/10 flex flex-col justify-between hover:border-indigo-500/40 transition-colors shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center font-display text-lg font-bold text-cyan-400">
                    {step.number}
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                    {step.tag}
                  </span>
                </div>
                <h3 className="font-display text-xl font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-muted-foreground font-mono">
                <span className="text-indigo-400">Step {step.number} / 03</span>
                <span className="text-cyan-400">&rarr;</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── CTA Section ──────────────────────────────────────

function CTASection() {
  const navigate = useNavigate()
  const { token } = useAuth()

  return (
    <section className="relative py-24 sm:py-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 lg:p-16 rounded-3xl bg-gradient-to-br from-[#12182c] via-[#0d1222] to-[#0a0e1c] border border-white/15 text-center shadow-[0_25px_60px_rgba(0,0,0,0.8)] relative overflow-hidden">
          {/* Subtle Accent Glows */}
          <div className="pointer-events-none absolute -top-32 -right-32 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />

          <div className="relative z-10">
            <Badge variant="gradient" className="mb-4">Get Started</Badge>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
              Ready to ship your designs?
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-xl mx-auto">
              Start building clean React components from screenshots or Figma frames right now.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="xl"
                variant="gradient"
                onClick={() => navigate(token ? '/dashboard' : '/auth')}
                className="shadow-[0_0_35px_rgba(99,102,241,0.45)] h-12 px-7 text-base font-medium rounded-xl"
              >
                {token ? 'Go to Dashboard' : 'Start Building Free'}
                <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Button>
              <Button
                size="xl"
                variant="outline"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="border-white/15 bg-white/5 hover:bg-white/10 h-12 px-7 text-base text-slate-200 rounded-xl"
              >
                Explore Capabilities
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Landing Page Export ─────────────────────────

export default function LandingPage() {
  return (
    <PageTransition>
      <HeroSection />
      <BentoFeatures />
      <HowItWorksSection />
      <CTASection />
    </PageTransition>
  )
}
