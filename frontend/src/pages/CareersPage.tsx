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

const values = [
  {
    title: 'Innovation First',
    desc: 'We push the boundaries of what AI can do for design and development, constantly exploring new ideas.',
    icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z',
  },
  {
    title: 'Remote-First Culture',
    desc: 'Work from anywhere in the world. We trust our team to do their best work, wherever they are.',
    icon: 'M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418',
  },
  {
    title: 'Growth & Learning',
    desc: 'We invest in your development with learning budgets, mentorship, and opportunities to work on challenging problems.',
    icon: 'M4.26 10.147a60.438 60.438 0 0-.490-2.326 1.125 1.125 0 0 1 .194-1.066A1.125 1.125 0 0 1 4.7 6.25l7.743-1.936a1.125 1.125 0 0 1 .557 0l7.743 1.936a1.125 1.125 0 0 1 .744 1.066c-.163 1.035-.351 2.067-.49 2.326m-15.282 1.924a57.17 57.17 0 0 0-.268 3.82c.465.167.94.31 1.424.443m15.154-4.263c.25.737.46 1.494.63 2.27M12 17.25c-2.08 0-4.07-.356-5.92-1.01m11.84 0a20.8 20.8 0 0 1-5.92 1.01m-5.92-1.01a20.8 20.8 0 0 1-1.01-5.92m0 0a20.8 20.8 0 0 1 5.92-1.01m5.92 1.01c.36.736.63 1.514.79 2.33',
  },
  {
    title: 'Open Source Spirit',
    desc: 'We believe in giving back. Our team contributes to open source and builds tools that help the community.',
    icon: 'M12 21v-6m0 0l-2.25 2.25M12 15l2.25 2.25M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
]

const openRoles = [
  { title: 'Senior Frontend Engineer', dept: 'Engineering', location: 'Remote' },
  { title: 'AI/ML Engineer', dept: 'Engineering', location: 'Remote' },
  { title: 'Full-Stack Developer', dept: 'Engineering', location: 'Remote' },
  { title: 'Product Designer', dept: 'Design', location: 'Remote' },
  { title: 'Developer Relations Lead', dept: 'Marketing', location: 'Remote' },
]

export default function CareersPage() {
  return (
    <PageTransition>
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        <AuroraBackground />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 sm:py-36">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl mx-auto text-center"
          >
            <Badge variant="gradient" className="mb-4">Careers</Badge>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1]">
              Join the <span className="text-gradient">team</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
              Help us build the future of design-to-code AI. We&apos;re looking for passionate people.
            </p>

            {/* Coming Soon Banner */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-10 inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-500/20 border border-amber-500/30 shadow-lg shadow-amber-500/10"
            >
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
              </span>
              <span className="font-display font-semibold text-amber-300">
                🚀 Career page coming soon!
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-16">
            <Badge variant="gradient" className="mb-4">About Us</Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
              Why work with us?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Designify AI is a small, ambitious team building at the intersection of AI and frontend
              development. We value creativity, autonomy, and impact over everything else.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.08 }}
              >
                <SpotlightCard className="h-full rounded-2xl">
                  <div className="glass rounded-2xl p-6 h-full">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 flex items-center justify-center text-indigo-400 mb-4">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={v.icon} />
                      </svg>
                    </div>
                    <h3 className="font-display font-semibold text-base mb-2">{v.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                  </div>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Perks */}
      <section className="py-16 sm:py-24 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="font-display text-3xl font-semibold tracking-tight mb-4">
              Perks &amp; Benefits
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-4">
            {[
              'Competitive salary & equity',
              'Remote-first, async culture',
              'Home office stipend',
              'Annual learning & conference budget',
              'Flexible PTO',
              'Health & wellness benefit',
              'Latest tech equipment',
              'Team retreats (twice a year)',
            ].map((perk, i) => (
              <motion.div
                key={perk}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 text-sm"
              >
                <svg className="h-4 w-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span className="text-muted-foreground">{perk}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Roles */}
      <section className="py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-12">
            <Badge variant="gradient" className="mb-4">Open Positions</Badge>
            <h2 className="font-display text-3xl font-semibold tracking-tight mb-4">
              We&apos;re hiring
            </h2>
            <p className="text-muted-foreground">
              All roles are remote-first. We welcome applicants from anywhere in the world.
            </p>
          </motion.div>

          <div className="space-y-3">
            {openRoles.map((role, i) => (
              <motion.div
                key={role.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.05 }}
              >
                <SpotlightCard className="rounded-xl">
                  <div className="glass rounded-xl px-6 py-4 flex items-center justify-between gap-4 hover:bg-white/[0.03] transition-colors cursor-pointer">
                    <div>
                      <h3 className="text-sm font-medium text-foreground">{role.title}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded">{role.dept}</span>
                        <span className="text-[10px] text-muted-foreground">{role.location}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="shrink-0">
                      <span className="text-amber-300 flex items-center gap-1">
                        🚀 Coming soon
                      </span>
                    </Button>
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

