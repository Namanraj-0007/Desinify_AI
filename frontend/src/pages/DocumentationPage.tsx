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

const sections = ['Getting Started', 'Figma Integration Guide', 'AI Code Generation Guide', 'FAQ']

const gettingStartedSteps = [
  {
    title: '1. Upload Your Design',
    desc: 'Navigate to the dashboard and drag & drop a screenshot (PNG, JPG, WebP) or paste a Figma URL. Our AI supports multiple design sources.',
    code: `// Supported formats
- PNG, JPG, WebP images
- Figma file URLs
- Direct Figma account import`,
  },
  {
    title: '2. AI Analysis',
    desc: 'Google Gemini AI analyzes the structure, extracting layout hierarchy, typography, colors, spacing, and component boundaries.',
    code: `// What gets extracted automatically
{
  "layout": "flex/grid structure",
  "typography": "font families, sizes, weights",
  "colors": "color palette with hex values",
  "spacing": "margins, paddings, gaps",
  "components": "buttons, cards, inputs, etc."
}`,
  },
  {
    title: '3. Generate Code',
    desc: 'Click "Generate" to produce production-ready React 18 components with TypeScript types and Tailwind CSS styling.',
    code: `npx create-vite my-app --template react-ts
# Then paste generated components directly`,
  },
  {
    title: '4. Refine & Export',
    desc: 'Use AI chat to edit code, optimize for accessibility or responsiveness, compare versions, and export as ZIP.',
    code: `// Key features
- AI Chat Editing: "Make this responsive"
- Version History: Compare changes
- Export: ZIP or TAR download`,
  },
]

const figmaSteps = [
  {
    title: 'Connecting Figma',
    desc: 'Click "Connect Figma" in the dashboard, authorize via OAuth, and grant access to your files.',
  },
  {
    title: 'Importing a File',
    desc: 'Paste a Figma file URL directly, or browse your connected Figma projects from the dashboard.',
  },
  {
    title: 'Component Mapping',
    desc: 'Our AI maps Figma frames, auto-layout, text styles, and color fills to React components.',
  },
  {
    title: 'Design Tokens',
    desc: 'Colors, typography, and spacing are automatically converted to Tailwind CSS utility classes.',
  },
]

const aiCodeGuideSteps = [
  {
    title: 'Understanding the Output',
    desc: 'Generated code follows React 18 best practices with proper component decomposition, TypeScript interfaces, and Tailwind CSS classes.',
  },
  {
    title: 'AI Chat Editing',
    desc: 'Use natural language to modify generated code. Try: "Add dark mode support," "Make this responsive," or "Convert to a carousel."',
  },
  {
    title: 'Optimization Options',
    desc: 'Access the optimization panel to improve readability, accessibility (a11y), performance, and SEO.',
  },
  {
    title: 'Version Control',
    desc: 'Every generation is saved. Use the version history panel to compare, restore, or export previous versions.',
  },
]

const faqItems = [
  {
    q: 'What file formats does Designify AI support?',
    a: 'We support PNG, JPG, WebP image uploads, Figma file URLs, and direct Figma account integration. We\'re working on adding support for Sketch and Adobe XD files.',
  },
  {
    q: 'What frameworks does it generate code for?',
    a: 'Currently, we generate React 18 components with TypeScript and Tailwind CSS. Next.js support is in development and coming soon.',
  },
  {
    q: 'How accurate is the code generation?',
    a: 'The AI accurately captures layout structure, typography, colors, and spacing. Generated code is production-ready and follows modern best practices. Complex interactions may require manual adjustments.',
  },
  {
    q: 'Can I edit the generated code?',
    a: 'Absolutely! You can edit code directly, use AI chat to make changes with natural language, and iterate as many times as needed.',
  },
  {
    q: 'Is my design data secure?',
    a: 'Yes. All uploaded designs and generated code are encrypted in transit and at rest. We do not share or use your designs for training purposes without explicit consent.',
  },
  {
    q: 'Do I need coding experience to use this?',
    a: 'Designify AI is designed for both developers and designers. Developers can use the generated code directly, while designers can use it as a starting point or learning resource.',
  },
]

const tabs = ['Getting Started', 'Figma Integration Guide', 'AI Code Generation Guide', 'FAQ']

export default function DocumentationPage() {
  const [activeTab, setActiveTab] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <PageTransition>
      {/* Hero */}
      <section className="relative min-h-[45vh] flex items-center overflow-hidden">
        <AuroraBackground />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 sm:py-36">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl mx-auto text-center"
          >
            <Badge variant="gradient" className="mb-4">Documentation</Badge>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1]">
              Everything you need to <span className="text-gradient">get started</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Learn how to use Designify AI — from your first upload to advanced AI code generation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="sticky top-20 z-30 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1 overflow-x-auto no-scrollbar" role="tablist">
            {tabs.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                role="tab"
                aria-selected={activeTab === i}
                className={`relative px-4 sm:px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === i
                    ? 'text-indigo-300'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
                {activeTab === i && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-fuchsia-500"
                  />
                )}
              </button>
            ))}
          </nav>
        </div>
      </section>

      {/* Tab Content */}
      <section className="py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Getting Started */}
          {activeTab === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <div className="mb-12">
                <h2 className="font-display text-3xl font-semibold tracking-tight mb-4">Getting Started</h2>
                <p className="text-muted-foreground">
                  Follow these steps to convert your first design into production-ready React code.
                </p>
              </div>
              <div className="space-y-8">
                {gettingStartedSteps.map((step, i) => (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                  >
                    <SpotlightCard className="rounded-2xl">
                      <div className="glass rounded-2xl p-6 sm:p-8">
                        <h3 className="font-display text-lg font-semibold mb-3">{step.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{step.desc}</p>
                        <pre className="bg-black/40 rounded-xl p-4 overflow-x-auto text-xs text-indigo-200/80 font-mono leading-relaxed border border-white/5">
                          <code>{step.code}</code>
                        </pre>
                      </div>
                    </SpotlightCard>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Figma Integration Guide */}
          {activeTab === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <div className="mb-12">
                <h2 className="font-display text-3xl font-semibold tracking-tight mb-4">Figma Integration Guide</h2>
                <p className="text-muted-foreground">
                  Connect your Figma account and turn designs into code with one click.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                {figmaSteps.map((step, i) => (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                  >
                    <SpotlightCard className="h-full rounded-2xl">
                      <div className="glass rounded-2xl p-6 h-full">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-pink-500/20 flex items-center justify-center text-fuchsia-400 mb-4">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                          </svg>
                        </div>
                        <h3 className="font-display font-semibold text-base mb-2">{step.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                      </div>
                    </SpotlightCard>
                  </motion.div>
                ))}
              </div>

              <div className="mt-12">
                <SpotlightCard className="rounded-2xl">
                  <div className="glass rounded-2xl p-6 sm:p-8">
                    <h3 className="font-display text-lg font-semibold mb-4">Example: Figma URL Import</h3>
                    <pre className="bg-black/40 rounded-xl p-4 overflow-x-auto text-xs text-indigo-200/80 font-mono leading-relaxed border border-white/5">
                      <code>{`// Step 1: Open your Figma file
// Step 2: Copy the URL from the browser address bar
// Step 3: Paste into Designify AI dashboard

Example URL:
https://www.figma.com/file/abc123/My-Design?node-id=0%3A1

// Step 4: Select specific pages or frames
// Step 5: Click "Generate Code"`}</code>
                    </pre>
                  </div>
                </SpotlightCard>
              </div>
            </motion.div>
          )}

          {/* AI Code Generation Guide */}
          {activeTab === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <div className="mb-12">
                <h2 className="font-display text-3xl font-semibold tracking-tight mb-4">AI Code Generation Guide</h2>
                <p className="text-muted-foreground">
                  Understand how our AI generates code and how to get the best results.
                </p>
              </div>
              <div className="space-y-6">
                {aiCodeGuideSteps.map((step, i) => (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                  >
                    <SpotlightCard className="rounded-2xl">
                      <div className="glass rounded-2xl p-6 sm:p-8 flex items-start gap-4">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                          <span className="font-display font-bold text-sm">{i + 1}</span>
                        </div>
                        <div>
                          <h3 className="font-display font-semibold text-base mb-2">{step.title}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                        </div>
                      </div>
                    </SpotlightCard>
                  </motion.div>
                ))}
              </div>

              <div className="mt-12">
                <SpotlightCard className="rounded-2xl">
                  <div className="glass rounded-2xl p-6 sm:p-8">
                    <h3 className="font-display text-lg font-semibold mb-4">Sample Generated Component</h3>
                    <pre className="bg-black/40 rounded-xl p-4 overflow-x-auto text-xs text-indigo-200/80 font-mono leading-relaxed border border-white/5">
                      <code>{`import React from 'react'

interface ButtonProps {
  variant?: 'primary' | 'secondary'
  children: React.ReactNode
  onClick?: () => void
}

export function Button({ variant = 'primary', children, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={
        variant === 'primary'
          ? 'px-6 py-3 bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all'
          : 'px-6 py-3 border border-white/10 bg-white/5 text-white rounded-xl font-medium hover:bg-white/10 transition-all'
      }
    >
      {children}
    </button>
  )
}`}</code>
                    </pre>
                  </div>
                </SpotlightCard>
              </div>
            </motion.div>
          )}

          {/* FAQ */}
          {activeTab === 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <div className="mb-12">
                <h2 className="font-display text-3xl font-semibold tracking-tight mb-4">Frequently Asked Questions</h2>
                <p className="text-muted-foreground">
                  Common questions about Designify AI and how it works.
                </p>
              </div>
              <div className="space-y-3">
                {faqItems.map((faq, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full text-left"
                    >
                      <SpotlightCard className="rounded-xl">
                        <div className="glass rounded-xl px-6 py-4 transition-colors hover:bg-white/[0.03]">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-sm font-medium text-foreground">{faq.q}</span>
                            <svg
                              className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                                openFaq === i ? 'rotate-180' : ''
                              }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                          </div>
                          {openFaq === i && (
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
            </motion.div>
          )}
        </div>
      </section>

      {/* Tutorials Section */}
      <section id="tutorials" className="py-16 sm:py-24 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-12">
            <Badge variant="gradient" className="mb-4">Tutorials</Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
              Video & Written <span className="text-gradient">Tutorials</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Step-by-step guides to help you master Designify AI.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Getting Started with Designify AI',
                desc: 'A complete walkthrough from your first upload to generated code.',
                duration: '5 min',
                type: 'Written',
              },
              {
                title: 'Figma to React in 3 Minutes',
                desc: 'Turn your Figma designs into working React components fast.',
                duration: '3 min',
                type: 'Video',
              },
              {
                title: 'AI Chat Editing Deep Dive',
                desc: 'Learn advanced prompts and techniques for refining generated code.',
                duration: '8 min',
                type: 'Written',
              },
              {
                title: 'Optimizing Generated Code',
                desc: 'Optimize for accessibility, responsiveness, and performance.',
                duration: '6 min',
                type: 'Written',
              },
              {
                title: 'Using Version History',
                desc: 'Track changes, compare versions, and restore previous generations.',
                duration: '4 min',
                type: 'Video',
              },
              {
                title: 'Exporting & Deployment',
                desc: 'Export your code and integrate it into your existing projects.',
                duration: '7 min',
                type: 'Written',
              },
            ].map((tutorial, i) => (
              <motion.div
                key={tutorial.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
              >
                <SpotlightCard className="h-full rounded-2xl">
                  <div className="glass rounded-2xl p-6 h-full group hover:bg-white/[0.04] transition-all duration-300 cursor-pointer">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                        {tutorial.type}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">{tutorial.duration}</span>
                    </div>
                    <h3 className="font-display font-semibold text-base mb-2 group-hover:text-indigo-300 transition-colors">
                      {tutorial.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{tutorial.desc}</p>
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <span className="text-xs text-amber-300/80 group-hover:text-amber-300 transition-colors inline-flex items-center gap-1">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                        </span>
                        Coming soon
                      </span>
                    </div>
                  </div>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </PageTransition>
  )
}

