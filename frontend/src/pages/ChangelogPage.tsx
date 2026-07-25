import { motion } from 'framer-motion'
import PageTransition from '../components/ui/PageTransition'
import AuroraBackground from '../components/ui/AuroraBackground'
import { Badge } from '../components/ui/badge'

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6 },
}

const releases = [
  {
    version: 'v1.0.0',
    date: 'March 15, 2025',
    type: 'major',
    badge: 'Stable Release',
    badgeColor: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
    sections: [
      {
        title: '🚀 New Features',
        items: [
          'Real-time streaming code generation with live progress indicators',
          'AI Chat Editing — refine generated code using natural language',
          'Version History — every generation is saved with compare & restore functionality',
          'Figma OAuth integration — connect your Figma account directly',
          'Figma URL import — paste any Figma file URL to generate code',
          'Export as ZIP or TAR — download your generated project',
          'Optimization Engine — auto-improve accessibility, performance, and SEO',
        ],
      },
      {
        title: '⚡ Improvements',
        items: [
          '50% faster code generation with optimized AI pipeline',
          'Improved component decomposition for complex layouts',
          'Better TypeScript type generation with stricter type safety',
          'Enhanced responsive design detection in uploads',
          'Reduced bundle size for generated code outputs',
          'Improved error handling with detailed error messages',
        ],
      },
      {
        title: '🐛 Bug Fixes',
        items: [
          'Fixed issue with nested Flexbox layout detection',
          'Fixed incorrect color token extraction from gradient backgrounds',
          'Fixed font-weight mapping for variable fonts',
          'Resolved overflow in code preview for long files',
          'Fixed authentication token refresh timing issue',
        ],
      },
    ],
  },
  {
    version: 'v0.5.0',
    date: 'February 20, 2025',
    type: 'minor',
    badge: 'Beta Release',
    badgeColor: 'text-indigo-300 bg-indigo-500/10 border-indigo-500/20',
    sections: [
      {
        title: '🚀 New Features',
        items: [
          'Initial design-to-code generation from image uploads',
          'Google Gemini AI integration for design analysis',
          'React 18 + TypeScript + Tailwind CSS output',
          'Basic component detection (buttons, cards, inputs, navigation)',
          'Dashboard with project management',
          'Authentication system (email + Google OAuth)',
          'Interactive upload zone with drag & drop',
        ],
      },
      {
        title: '⚡ Improvements',
        items: [
          'Optimized image preprocessing for better AI accuracy',
          'Improved layout hierarchy detection',
          'Better color palette extraction from complex designs',
          'Enhanced error messages for unsupported file types',
        ],
      },
      {
        title: '🐛 Bug Fixes',
        items: [
          'Fixed image upload size limitation',
          'Fixed CORS issues with Figma URL import',
          'Resolved occasional blank screen on generation',
          'Fixed mobile responsiveness on the dashboard',
        ],
      },
    ],
  },
  {
    version: 'v0.2.0',
    date: 'January 10, 2025',
    type: 'minor',
    badge: 'Alpha Release',
    badgeColor: 'text-fuchsia-300 bg-fuchsia-500/10 border-fuchsia-500/20',
    sections: [
      {
        title: '🚀 New Features',
        items: [
          'MVP with basic design-to-code pipeline',
          'Support for PNG and JPG uploads',
          'Simple React component generation (no TypeScript)',
          'Basic dashboard UI',
          'Landing page with product information',
        ],
      },
      {
        title: '⚡ Improvements',
        items: [
          'Initial AI model training for design recognition',
          'Basic error handling and validation',
        ],
      },
    ],
  },
]

export default function ChangelogPage() {
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
            <Badge variant="gradient" className="mb-4">Changelog</Badge>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1]">
              What&apos;s <span className="text-gradient">new</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Stay up to date with the latest features, improvements, and fixes.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Changelog Timeline */}
      <section className="py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/50 via-fuchsia-500/30 to-transparent hidden md:block" />

            <div className="space-y-16">
              {releases.map((release, i) => (
                <motion.div
                  key={release.version}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                  className="relative md:pl-12"
                >
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-1 -translate-x-[3.5px] hidden md:block">
                    <div className={`h-2 w-2 rounded-full ${
                      release.type === 'major' ? 'bg-emerald-400 shadow-lg shadow-emerald-500/30' : 'bg-indigo-400'
                    }`} />
                  </div>

                  {/* Version header */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 mb-8">
                    <div className="flex items-center gap-3">
                      <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
                        {release.version}
                      </h2>
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${release.badgeColor}`}>
                        {release.badge}
                      </span>
                    </div>
                    <time className="text-sm text-muted-foreground font-mono">{release.date}</time>
                  </div>

                  {/* Release content */}
                  <div className="space-y-8">
                    {release.sections.map((section) => (
                      <div key={section.title}>
                        <h3 className="font-display font-semibold text-base mb-4 text-foreground/90">
                          {section.title}
                        </h3>
                        <ul className="space-y-2">
                          {section.items.map((item) => (
                            <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500/50 mt-1.5 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* Divider */}
                  {i < releases.length - 1 && (
                    <div className="mt-12 border-t border-white/5" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Subscribe section */}
          <motion.div
            {...fadeUp}
            className="mt-20 glass rounded-2xl p-8 sm:p-10 text-center border border-white/5"
          >
            <h3 className="font-display text-xl font-semibold mb-3">Stay in the loop</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Get notified about new releases, features, and updates directly in your inbox.
            </p>
            <div className="flex max-w-md mx-auto gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
              />
              <button className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 text-white hover:shadow-[0_0_40px_hsl(252_87%_65%/0.3)] h-10 px-5 py-2">
                Subscribe
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </PageTransition>
  )
}

