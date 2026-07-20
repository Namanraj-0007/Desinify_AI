import { useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import AuroraBackground from '../components/ui/AuroraBackground'
import FloatingShapes from '../components/ui/FloatingShapes'
import SpotlightCard from '../components/ui/SpotlightCard'
import MagneticButton from '../components/ui/MagneticButton'
import InteractiveUploadZone from '../components/ui/InteractiveUploadZone'
import PageTransition from '../components/ui/PageTransition'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { useAuth } from '../context/AuthContext'

// ─── Hero Section ─────────────────────────────────────

function HeroSection() {
  const navigate = useNavigate()
  const { token } = useAuth()
  const sectionRef = useRef<HTMLDivElement>(null!)
  const { scrollYProgress } = useScroll()
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, 50])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0.6])

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center overflow-hidden">
      <AuroraBackground />
      <FloatingShapes />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 grid-pattern opacity-30" />

      <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left content */}
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Badge variant="gradient" className="mb-6">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 mr-2 animate-pulse-glow" />
                  AI-Powered Design-to-Code
                </Badge>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold tracking-tight leading-[1.1]"
              >
                From{' '}
                <span className="text-gradient">
                  design
                </span>{' '}
                to{' '}
                <span className="text-gradient">
                  code
                </span>
                , in seconds.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed"
              >
                Upload any UI screenshot or design, and let AI generate production-ready React components with Tailwind CSS. Edit with natural language.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <MagneticButton>
                  <Button
                    size="xl"
                    variant="gradient"
                    onClick={() => navigate(token ? '/dashboard' : '/auth')}
                  >
                    {token ? 'Go to dashboard' : 'Start building free'}
                    <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Button>
                </MagneticButton>
                <MagneticButton>
                  <Button size="xl" variant="outline" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
                    See how it works
                  </Button>
                </MagneticButton>
              </motion.div>

              {/* Social proof */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mt-10 flex items-center gap-6 justify-center lg:justify-start text-sm text-muted-foreground"
              >
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-8 w-8 rounded-full border-2 border-background bg-gradient-to-br from-indigo-400 to-fuchsia-400"
                    />
                  ))}
                </div>
                <span>Trusted by <strong className="text-foreground">500+</strong> designers</span>
              </motion.div>
            </div>

            {/* Right - Upload Zone */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="relative"
            >
              <SpotlightCard className="rounded-2xl">
                <div className="glass rounded-2xl p-1 gradient-border">
                  <div className="rounded-2xl bg-card p-6 sm:p-8">
                    <div className="text-center mb-6">
                      <h3 className="font-display text-xl font-semibold">Try it now</h3>
                      <p className="text-sm text-muted-foreground mt-1">Drop a screenshot to see the magic</p>
                    </div>
                    <InteractiveUploadZone onFileSelect={() => {}} />
                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <svg className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      No credit card required · Free to start
                    </div>
                  </div>
                </div>
              </SpotlightCard>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

// ─── Metrics Bar ──────────────────────────────────────

function MetricsBar() {
  const metrics = [
    { value: '60%', label: 'Faster development' },
    { value: '90%', label: 'Reusable code' },
    { value: '100%', label: 'Tailwind CSS' },
    { value: '4.9/5', label: 'User rating' },
  ]

  return (
    <section className="relative -mt-20 z-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="glass rounded-2xl p-6 sm:p-8 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="font-display text-2xl sm:text-3xl font-bold text-gradient">{m.value}</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">{m.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── How It Works ─────────────────────────────────────

function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      title: 'Upload your design',
      desc: 'Drop a screenshot, export from Figma, or paste a URL. We support PNG, JPG, WebP, and Figma file links.',
      color: 'from-indigo-500/20 to-indigo-500/5',
    },
    {
      number: '02',
      title: 'AI analyzes the structure',
      desc: 'Gemini extracts layout hierarchy, typography, colors, spacing, and component boundaries from your design.',
      color: 'from-cyan-500/20 to-cyan-500/5',
    },
    {
      number: '03',
      title: 'Get React components',
      desc: 'Reusable, production-ready React + Tailwind components. Edit with AI chat, preview live, and export.',
      color: 'from-fuchsia-500/20 to-fuchsia-500/5',
    },
  ]

  return (
    <section id="how-it-works" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-16"
        >
          <Badge variant="gradient" className="mb-4">Workflow</Badge>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
            Three simple steps
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            From design to production-ready components in under a minute.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ delay: i * 0.15 }}
            >
              <SpotlightCard className="h-full rounded-2xl">
                <div className="glass rounded-2xl p-6 sm:p-8 h-full flex flex-col gradient-border">
                  <div className={`inline-flex h-12 w-12 rounded-2xl bg-gradient-to-br ${step.color} border border-white/10 items-center justify-center font-display text-lg font-bold text-indigo-300`}>
                    {step.number}
                  </div>
                  <h3 className="mt-5 font-display text-xl font-semibold">{step.title}</h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed flex-1">{step.desc}</p>
                  <div className="mt-6 h-px w-full bg-gradient-to-r from-indigo-500/0 via-indigo-500/30 to-fuchsia-500/0" />
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Features ─────────────────────────────────────────

function FeaturesSection() {
  const features = [
    {
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
      ),
      title: 'AI Design Analyzer',
      desc: 'Understands UI structure, spacing, typography, and component boundaries automatically.',
    },
    {
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
        </svg>
      ),
      title: 'Code Generation',
      desc: 'Creates clean, reusable React + Tailwind components with consistent naming conventions.',
    },
    {
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
      ),
      title: 'AI Chat Editing',
      desc: 'Iterate quickly with natural-language changes — like having a senior developer on hand.',
    },
    {
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: 'Live Preview',
      desc: 'See generated UI immediately in your browser. Real-time updates as you iterate.',
    },
    {
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      ),
      title: 'Smart Optimization',
      desc: 'Automatically improves readability, structure, and performance of generated code.',
    },
    {
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
        </svg>
      ),
      title: 'Figma Integration',
      desc: 'Connect your Figma files directly. Import designs with a single URL and get components back.',
    },
  ]

  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-16"
        >
          <Badge variant="gradient" className="mb-4">Features</Badge>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
            Everything you need to ship faster
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            A complete toolchain for converting designs to production-ready code.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.05 }}
            >
              <SpotlightCard className="h-full rounded-2xl">
                <div className="glass rounded-2xl p-6 h-full group hover:bg-white/[0.04] transition-all duration-300">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="mt-4 font-display font-semibold text-base">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Code Preview Section ─────────────────────────────

function CodePreviewSection() {
  const code = `// Generated Component
export function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-950 border-b">
      <Logo />
      <div className="flex items-center gap-6">
        <NavLink href="#features">Features</NavLink>
        <NavLink href="#pricing">Pricing</NavLink>
        <Button>Get Started</Button>
      </div>
    </nav>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 py-24">
        <div className="text-center">
          <Badge>AI-Powered</Badge>
          <h1 className="font-display text-6xl font-bold mt-6">
            Design to Code
          </h1>
          <p className="text-xl text-muted-foreground mt-4 max-w-2xl mx-auto">
            Upload any design and get production-ready components.
          </p>
          <div className="flex gap-4 justify-center mt-8">
            <Button size="lg">Get Started</Button>
            <Button size="lg" variant="outline">Learn More</Button>
          </div>
        </div>
      </div>
    </section>
  );
}`

  return (
    <section id="preview" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
          >
            <Badge variant="gradient" className="mb-4">Preview</Badge>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
              Code that feels{' '}
              <span className="text-gradient">
                handcrafted
              </span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-lg leading-relaxed">
              Our AI generates clean, component-driven code with consistent naming, proper TypeScript types, and Tailwind-first styling — just like a senior engineer would write.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {['Component-driven', 'TypeScript-first', 'Tailwind CSS', 'Responsive', 'Accessible'].map((tag) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className="relative"
          >
            <SpotlightCard className="rounded-2xl">
              <div className="glass rounded-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                    <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                  </div>
                  <span className="text-xs text-muted-foreground ml-2">Components.tsx</span>
                </div>
                <pre className="p-4 sm:p-6 text-xs leading-relaxed overflow-x-auto no-scrollbar">
                  <code className="text-slate-200">{code}</code>
                </pre>
              </div>
            </SpotlightCard>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ─── CTA Section ──────────────────────────────────────

function CTASection() {
  const navigate = useNavigate()

  return (
    <section className="relative py-24 sm:py-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
        >
          <SpotlightCard spotlightSize={500} spotlightOpacity={0.12}>
            <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-indigo-500/10 via-background to-fuchsia-500/10 p-8 sm:p-12 lg:p-16 text-center">
              {/* Animated gradient orbs */}
              <div className="pointer-events-none absolute -top-40 -right-40 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-fuchsia-500/15 blur-3xl" />

              <div className="relative">
                <Badge variant="gradient" className="mb-4">Get Started</Badge>
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
                  Ready to build faster?
                </h2>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                  Start with a design upload. Improve with AI chat. Ship with confidence. No credit card required.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                  <MagneticButton>
                    <Button size="xl" variant="gradient" onClick={() => navigate('/auth')}>
                      Start building free
                      <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </Button>
                  </MagneticButton>
                  <MagneticButton>
                    <Button size="xl" variant="outline" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
                      Explore features
                    </Button>
                  </MagneticButton>
                </div>
              </div>
            </div>
          </SpotlightCard>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Main Export ──────────────────────────────────────

export default function LandingPage() {
  return (
    <PageTransition>
      <HeroSection />
      <MetricsBar />
      <HowItWorksSection />
      <FeaturesSection />
      <CodePreviewSection />
      <CTASection />
    </PageTransition>
  )
}

