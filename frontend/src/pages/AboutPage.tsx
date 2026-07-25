import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import PageTransition from '../components/ui/PageTransition'
import AuroraBackground from '../components/ui/AuroraBackground'
import SpotlightCard from '../components/ui/SpotlightCard'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import MagneticButton from '../components/ui/MagneticButton'
import { useAuth } from '../context/AuthContext'

// ─── Fade-in helper ──────────────────────────────────────────

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6 },
}

// ─── Hero ────────────────────────────────────────────────────

function HeroSection() {
  const navigate = useNavigate()
  const { token } = useAuth()

  return (
    <section className="relative min-h-[70vh] flex items-center overflow-hidden">
      <AuroraBackground />
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 sm:py-36">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto text-center"
        >
          <Badge variant="gradient" className="mb-6">About Designify AI</Badge>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold tracking-tight leading-[1.1]">
            Turning designs into{' '}
            <span className="text-gradient">production code</span>
            , powered by AI
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Designify AI is an intelligent design-to-code platform that converts UI screenshots, Figma files,
            and design mockups into clean, reusable React + TypeScript + Tailwind CSS components — in seconds.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <MagneticButton>
              <Button variant="gradient" size="xl" onClick={() => navigate(token ? '/dashboard' : '/auth')}>
                Start building free
                <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Button>
            </MagneticButton>
            <MagneticButton>
              <Button variant="outline" size="xl" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
                Learn more
              </Button>
            </MagneticButton>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Story & Mission ────────────────────────────────────────

function StorySection() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div {...fadeUp}>
            <Badge variant="gradient" className="mb-4">Our Story</Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
              Why we built{' '}
              <span className="text-gradient">Designify AI</span>
            </h2>
            <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Designify AI was born from a simple observation: the gap between design and development is
                one of the biggest friction points in modern software development. Designers craft beautiful
                interfaces, but translating those pixels into clean, maintainable code is time-consuming,
                error-prone, and often frustrating.
              </p>
              <p>
                We set out to build a tool that bridges this gap — not by replacing developers, but by
                augmenting them. Designify AI uses state-of-the-art AI to understand design structure,
                extract layout hierarchy, recognize component boundaries, and generate production-ready
                React code that follows modern best practices.
              </p>
              <p>
                What started as a side project to automate repetitive frontend work has grown into a
                full-featured platform used by hundreds of designers and developers to ship faster.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
          >
            <SpotlightCard className="rounded-2xl">
              <div className="glass rounded-2xl p-8 lg:p-10">
                <Badge variant="gradient" className="mb-4">Our Mission</Badge>
                <h3 className="font-display text-2xl font-semibold mb-4">
                  Empowering creators to ship faster
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  We believe the future of frontend development is AI-assisted. Our mission is to make
                  the design-to-code pipeline invisible — so developers can focus on logic and architecture,
                  not pixel-perfect translations.
                </p>
                <div className="space-y-3">
                  {[
                    'Transform any visual design into clean, reusable code',
                    'Reduce frontend development time by up to 60%',
                    'Maintain full control — edit, optimize, and customize generated code',
                    'Bridge the gap between design teams and engineering teams',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3 text-sm">
                      <svg className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </SpotlightCard>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ─── How It Works ────────────────────────────────────────────

function HowItWorksSection() {
  const steps = [
    { step: '01', title: 'Upload Your Design', desc: 'Drop a screenshot (PNG, JPG, WebP), paste a Figma URL, or import from your connected Figma account. Our AI supports multiple design sources.' },
    { step: '02', title: 'AI Analyzes the Structure', desc: 'Google Gemini extracts layout hierarchy, typography, colors, spacing, component boundaries, and design tokens from your visual input.' },
    { step: '03', title: 'Generate React Components', desc: 'Production-ready React 18 components are generated with TypeScript types, Tailwind CSS styling, and proper component decomposition.' },
    { step: '04', title: 'Refine & Export', desc: 'Edit generated code with AI chat, optimize for accessibility or responsiveness, compare version history, and export as ZIP or TAR.' },
  ]

  return (
    <section id="how-it-works" className="relative py-24 sm:py-32 bg-white/[0.02] border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUp} className="text-center mb-16">
          <Badge variant="gradient" className="mb-4">How It Works</Badge>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
            From design to code in four steps
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            A streamlined pipeline designed for speed, quality, and developer happiness.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
            >
              <SpotlightCard className="h-full rounded-2xl">
                <div className="glass rounded-2xl p-6 h-full flex flex-col gradient-border">
                  <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 border border-white/10 items-center justify-center font-display text-lg font-bold text-indigo-300">
                    {s.step}
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold">{s.title}</h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed flex-1">{s.desc}</p>
                  {i < steps.length - 1 && (
                    <div className="mt-4 hidden lg:block">
                      <svg className="w-5 h-5 text-indigo-400/50 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </div>
                  )}
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Features ────────────────────────────────────────────────

const features = [
  { title: 'AI Design Analyzer', desc: 'Automatically extracts layout, typography, colors, spacing, and component boundaries.', icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z' },
  { title: 'React + TypeScript Code Gen', desc: 'Creates production-ready components with TypeScript types and Tailwind CSS.', icon: 'M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5' },
  { title: 'Figma Integration', desc: 'Connect your Figma files directly via URL. Import designs with one click.', icon: 'M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5' },
  { title: 'AI Chat Editing', desc: 'Refine code with natural language — adjust styles, add features, fix issues.', icon: 'M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z' },
  { title: 'Optimization Engine', desc: 'Automatically improves readability, structure, accessibility, and performance.', icon: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z' },
  { title: 'Version History', desc: 'Every generation is saved. Compare, restore, or export previous versions.', icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z' },
  { title: 'Export Options', desc: 'Download as ZIP or TAR. Copy individual files. Integrate into your existing workflow.', icon: 'M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3' },
  { title: 'Streaming Generation', desc: 'Watch code being generated in real-time with live progress updates and logs.', icon: 'M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z' },
]

function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUp} className="text-center mb-16">
          <Badge variant="gradient" className="mb-4">Features</Badge>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
            Everything you need to ship faster
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            A complete AI-powered design-to-code pipeline.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.04, duration: 0.4 }}
            >
              <SpotlightCard className="h-full rounded-2xl">
                <div className="glass rounded-2xl p-6 h-full group hover:bg-white/[0.04] transition-all duration-300">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={feature.icon} />
                    </svg>
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

// ─── Tech Stack ──────────────────────────────────────────────

const techStack = [
  { category: 'Frontend', items: ['React 18', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Vite'] },
  { category: 'Backend', items: ['FastAPI (Python)', 'MongoDB', 'JWT Auth', 'REST API', 'SSE Streaming'] },
  { category: 'AI & ML', items: ['Google Gemini', 'Babel Transpiler', 'Prompt Engineering', 'Code Analysis', 'Design Parsing'] },
  { category: 'DevOps', items: ['Docker', 'CI/CD Pipeline', 'Cloud Hosting', 'CORS Security', 'Health Monitoring'] },
]

function TechStackSection() {
  return (
    <section className="relative py-24 sm:py-32 bg-white/[0.02] border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUp} className="text-center mb-16">
          <Badge variant="gradient" className="mb-4">Technology</Badge>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
            Built with modern tools
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Carefully chosen for performance, scalability, and developer experience.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {techStack.map((group, i) => (
            <motion.div
              key={group.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.1 }}
            >
              <SpotlightCard className="h-full rounded-2xl">
                <div className="glass rounded-2xl p-6 h-full">
                  <h3 className="font-display font-semibold text-sm text-indigo-300 uppercase tracking-wider mb-4">
                    {group.category}
                  </h3>
                  <ul className="space-y-2">
                    {group.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500/60 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Benefits ────────────────────────────────────────────────

function BenefitsSection() {
  const developerBenefits = [
    'Save hours of manual markup and styling',
    'Get consistent, component-driven architecture',
    'TypeScript-first — full type safety out of the box',
    'Tailwind CSS — utility-first, responsive by default',
    'Iterate faster with AI chat editing',
    'Export directly into your existing codebase',
  ]
  const designerBenefits = [
    'See your designs come to life as real code',
    'Bridge the gap between design and engineering',
    'Maintain design consistency across components',
    'Collaborate more effectively with developers',
    'Export design tokens (colors, typography) automatically',
    'Reduce back-and-forth on implementation details',
  ]

  return (
    <section className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUp} className="text-center mb-16">
          <Badge variant="gradient" className="mb-4">Benefits</Badge>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
            Built for developers &amp; designers
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you write code or create designs, Designify AI fits into your workflow.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
          >
            <SpotlightCard className="rounded-2xl h-full">
              <div className="glass rounded-2xl p-8 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center text-cyan-400">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                    </svg>
                  </div>
                  <h3 className="font-display text-xl font-semibold">For Developers</h3>
                </div>
                <ul className="space-y-3">
                  {developerBenefits.map((b) => (
                    <li key={b} className="flex items-start gap-3 text-sm">
                      <svg className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <span className="text-muted-foreground">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </SpotlightCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
          >
            <SpotlightCard className="rounded-2xl h-full">
              <div className="glass rounded-2xl p-8 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-pink-500/20 flex items-center justify-center text-fuchsia-400">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                    </svg>
                  </div>
                  <h3 className="font-display text-xl font-semibold">For Designers</h3>
                </div>
                <ul className="space-y-3">
                  {designerBenefits.map((b) => (
                    <li key={b} className="flex items-start gap-3 text-sm">
                      <svg className="h-5 w-5 text-fuchsia-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <span className="text-muted-foreground">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </SpotlightCard>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ─── Meet the Developer ──────────────────────────────────────

function DeveloperSection() {
  return (
    <section className="relative py-24 sm:py-32 bg-white/[0.02] border-y border-white/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUp} className="text-center mb-12">
          <Badge variant="gradient" className="mb-4">Meet the Developer</Badge>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
            Built with passion by{' '}
            <span className="text-gradient">Naman Raj</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            A full-stack developer and AI enthusiast dedicated to creating tools that empower creators.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
        >
          <SpotlightCard spotlightSize={500} spotlightOpacity={0.12}>
            <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-indigo-500/10 via-background to-fuchsia-500/10 p-8 sm:p-12 text-center">
              <div className="pointer-events-none absolute -top-40 -right-40 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-fuchsia-500/15 blur-3xl" />

              <div className="relative">
                <div className="inline-flex h-24 w-24 rounded-full bg-gradient-to-br from-indigo-400 to-fuchsia-400 items-center justify-center text-4xl font-bold text-white mb-6 shadow-lg shadow-indigo-500/20 ring-2 ring-white/10">
                  NR
                </div>
                <h3 className="font-display text-2xl font-semibold">Naman Raj</h3>
                <p className="mt-2 text-sm text-indigo-300 font-medium">Full-Stack Developer &amp; AI Enthusiast</p>
                <p className="mt-4 text-muted-foreground max-w-lg mx-auto leading-relaxed">
                  I believe that AI should augment human creativity, not replace it. Designify AI is my
                  contribution to making frontend development faster, more enjoyable, and more accessible
                  to everyone — from seasoned engineers to aspiring designers learning to code.
                </p>

                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <a href="https://github.com/Namanraj-0007" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="gap-2">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                      GitHub
                    </Button>
                  </a>
                  <a href="https://www.linkedin.com/in/namandraj0007" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="gap-2">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                      LinkedIn
                    </Button>
                  </a>
                  <a href="https://portfolio-gamma-seven-58.vercel.app/" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="gap-2">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                      </svg>
                      Portfolio
                    </Button>
                  </a>
                  <a href="mailto:namandraj4777@gmail.com">
                    <Button variant="outline" size="sm" className="gap-2">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                      Email
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </SpotlightCard>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Roadmap ────────────────────────────────────────────────

const roadmap = [
  { phase: 'Q1 2025', title: 'Foundation', items: ['Initial release with basic design-to-code', 'Figma URL import', 'React + Tailwind output'], status: 'completed' },
  { phase: 'Q2 2025', title: 'Enhancement', items: ['AI chat editing', 'Version history', 'Streaming generation', 'Export options'], status: 'completed' },
  { phase: 'Q3 2025', title: 'Expansion', items: ['Next.js framework support', 'Custom component libraries', 'Team collaboration', 'API public access'], status: 'current' },
  { phase: 'Q4 2025', title: 'Scale', items: ['Enterprise SSO', 'Custom AI model fine-tuning', 'Design system integration', 'VS Code extension'], status: 'upcoming' },
]

function RoadmapSection() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUp} className="text-center mb-16">
          <Badge variant="gradient" className="mb-4">Roadmap</Badge>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
            What&apos;s coming next
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            We&apos;re just getting started. Here&apos;s what we&apos;re building.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {roadmap.map((phase, i) => (
            <motion.div
              key={phase.phase}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.1 }}
            >
              <SpotlightCard className="h-full rounded-2xl">
                <div className="glass rounded-2xl p-6 h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={cn(
                      'inline-flex h-2 w-2 rounded-full',
                      phase.status === 'completed' ? 'bg-emerald-400' :
                      phase.status === 'current' ? 'bg-indigo-400 animate-pulse' : 'bg-muted-foreground/30'
                    )} />
                    <span className={cn(
                      'text-[10px] font-medium uppercase tracking-wider',
                      phase.status === 'completed' ? 'text-emerald-400' :
                      phase.status === 'current' ? 'text-indigo-400' : 'text-muted-foreground/50'
                    )}>
                      {phase.status === 'completed' ? 'Done' : phase.status === 'current' ? 'In Progress' : 'Planned'}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">{phase.phase}</span>
                  <h3 className="mt-1 font-display font-semibold text-base">{phase.title}</h3>
                  <ul className="mt-3 space-y-1.5 flex-1">
                    {phase.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="h-1 w-1 rounded-full bg-indigo-500/60 mt-1.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

// ─── FAQs ──────────────────────────────────────────────────

const faqs = [
  { q: 'What file formats does Designify AI support?', a: 'We support PNG, JPG, WebP image uploads, Figma file URLs, and direct Figma account integration. We\'re working on adding support for Sketch and Adobe XD files.' },
  { q: 'What frameworks does it generate code for?', a: 'Currently, we generate React 18 components with TypeScript and Tailwind CSS. Next.js support is in development and coming soon.' },
  { q: 'How accurate is the code generation?', a: 'The AI accurately captures layout structure, typography, colors, and spacing. Generated code is production-ready and follows modern best practices. Complex interactions may require manual adjustments.' },
  { q: 'Can I edit the generated code?', a: 'Absolutely! You can edit code directly, use AI chat to make changes with natural language, and iterate as many times as needed.' },
  { q: 'Is my design data secure?', a: 'Yes. All uploaded designs and generated code are encrypted in transit and at rest. We do not share or use your designs for training purposes without explicit consent.' },
  { q: 'Do I need coding experience to use this?', a: 'Designify AI is designed for both developers and designers. Developers can use the generated code directly, while designers can use it as a starting point or learning resource.' },
]

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="relative py-24 sm:py-32 bg-white/[0.02] border-y border-white/5">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUp} className="text-center mb-12">
          <Badge variant="gradient" className="mb-4">FAQs</Badge>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
            Frequently asked questions
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.05 }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full text-left"
              >
                <SpotlightCard className="rounded-xl">
                  <div className="glass rounded-xl px-6 py-4 transition-colors hover:bg-white/[0.03]">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-medium text-foreground">{faq.q}</span>
                      <svg
                        className={cn(
                          'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
                          openIndex === i && 'rotate-180'
                        )}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>
                    {openIndex === i && (
                      <motion.p
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="mt-3 text-sm text-muted-foreground leading-relaxed border-t border-white/5 pt-3"
                      >
                        {faq.a}
                      </motion.p>
                    )}
                  </div>
                </SpotlightCard>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Testimonials ────────────────────────────────────────────

const testimonials = [
  { name: 'Sarah Chen', role: 'Lead Frontend Engineer', company: 'TechCorp', text: 'Designify AI cut our design-to-implementation time by more than half. The generated code is clean and follows our team\'s conventions.' },
  { name: 'Marcus Johnson', role: 'UI/UX Designer', company: 'DesignStudio', text: 'Finally, a tool that understands both design and code. I can hand off designs to my dev team as actual React components.' },
  { name: 'Priya Patel', role: 'Indie Developer', company: 'BuildFast', text: 'As a solo developer, this is a game-changer. I go from Figma mockup to working prototype in minutes instead of days.' },
]

function TestimonialsSection() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUp} className="text-center mb-16">
          <Badge variant="gradient" className="mb-4">Testimonials</Badge>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
            Loved by developers &amp; designers
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Here&apos;s what early users are saying about Designify AI.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4 lg:gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.1 }}
            >
              <SpotlightCard className="h-full rounded-2xl">
                <div className="glass rounded-2xl p-6 h-full flex flex-col">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">"{t.text}"</p>
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <p className="text-sm font-medium text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role} · {t.company}</p>
                  </div>
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Final CTA ──────────────────────────────────────────────

function CTASection() {
  const navigate = useNavigate()
  const { token } = useAuth()

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
              <div className="pointer-events-none absolute -top-40 -right-40 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-fuchsia-500/15 blur-3xl" />

              <div className="relative">
                <Badge variant="gradient" className="mb-4">Get Started</Badge>
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
                  Start building with{' '}
                  <span className="text-gradient">Designify AI</span>
                </h2>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                  Upload your first design and get production-ready code in seconds. No credit card required.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                  <MagneticButton>
                    <Button variant="gradient" size="xl" onClick={() => navigate(token ? '/dashboard' : '/auth')}>
                      Start building free
                      <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </Button>
                  </MagneticButton>
                  <MagneticButton>
                    <Button variant="outline" size="xl" onClick={() => navigate('/')}>
                      Back to home
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

// ─── Main Export ────────────────────────────────────────────

export default function AboutPage() {
  return (
    <PageTransition>
      <HeroSection />
      <StorySection />
      <HowItWorksSection />
      <FeaturesSection />
      <TechStackSection />
      <BenefitsSection />
      <DeveloperSection />
      <RoadmapSection />
      <FAQSection />
      <TestimonialsSection />
      <CTASection />
    </PageTransition>
  )
}

