import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import emailjs from '@emailjs/browser'
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

const contactMethods = [
  {
    label: 'Email',
    value: 'namandraj4777@gmail.com',
    href: 'mailto:namandraj4777@gmail.com',
    icon: 'M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75',
  },
  {
    label: 'Twitter',
    value: '@DesignifyAI',
    href: 'https://twitter.com',
    icon: 'M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84',
  },
  {
    label: 'GitHub',
    value: 'Namanraj-0007',
    href: 'https://github.com/Namanraj-0007',
    icon: 'M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z',
  },
  {
    label: 'Discord',
    value: 'Join our server',
    href: 'https://discord.com/users/763966768615915530',
    icon: 'M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z',
  },
]

const EMAILJS_SERVICE_ID = 'service_at3kuip'
const EMAILJS_ADMIN_TEMPLATE_ID = 'template_y5am5de'
const EMAILJS_USER_TEMPLATE_ID = 'template_kj7s16m'
const EMAILJS_PUBLIC_KEY = (import.meta as any).env?.VITE_EMAILJS_PUBLIC_KEY || ''

export default function ContactPage() {
  const formRef = useRef<HTMLFormElement>(null)
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formRef.current) return
    setSending(true)
    setSendError(null)
    try {
      const form = formRef.current
      const formData = new FormData(form)
      const name = formData.get('name') as string
      const email = formData.get('email') as string
      const subject = formData.get('subject') as string
      const message = formData.get('message') as string
      const templateParams = { from_name: name, from_email: email, subject, message, to_email: 'namandraj4777@gmail.com' }
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_ADMIN_TEMPLATE_ID, { ...templateParams, to_email: 'namandraj4777@gmail.com' }, EMAILJS_PUBLIC_KEY)
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_USER_TEMPLATE_ID, { ...templateParams, to_email: email }, EMAILJS_PUBLIC_KEY)
      setSubmitted(true)
      form.reset()
      setTimeout(() => setSubmitted(false), 5000)
    } catch (err: any) {
      setSendError(err?.text || err?.message || 'Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <PageTransition>
      <section className="relative min-h-[40vh] flex items-center overflow-hidden">
        <AuroraBackground />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 sm:py-36">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-3xl mx-auto text-center">
            <Badge variant="gradient" className="mb-4">Contact</Badge>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1]">
              Let&apos;s <span className="text-gradient">connect</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
              Have a question, feedback, or want to collaborate? We&apos;d love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            <motion.div {...fadeUp}>
              <h2 className="font-display text-2xl font-semibold mb-6">Send us a message</h2>
              {submitted ? (
                <div className="glass rounded-2xl p-8 text-center border border-emerald-500/20 bg-emerald-500/10">
                  <div className="text-3xl mb-3">{'\u2713'}</div>
                  <h3 className="font-semibold text-emerald-300 mb-2">Message sent!</h3>
                  <p className="text-sm text-muted-foreground">Thank you for reaching out. We&apos;ll get back to you as soon as possible.</p>
                </div>
              ) : (
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
                  {sendError && (
                    <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">{sendError}</div>
                  )}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">Name</label>
                      <input name="name" type="text" required placeholder="Your name" className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label>
                      <input name="email" type="email" required placeholder="you@example.com" className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Subject</label>
                    <input name="subject" type="text" required placeholder="What's this about?" className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Message</label>
                    <textarea name="message" required rows={5} placeholder="Your message..." className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 resize-y" />
                  </div>
                  <Button variant="gradient" type="submit" className="w-full" disabled={sending}>
                    {sending ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              )}
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.7 }}>
              <h2 className="font-display text-2xl font-semibold mb-6">Other ways to reach us</h2>
              <div className="space-y-4">
                {contactMethods.map((method) => (
                  <a key={method.label} href={method.href} target="_blank" rel="noopener noreferrer">
                    <SpotlightCard className="rounded-xl">
                      <div className="glass rounded-xl px-5 py-4 flex items-center gap-4 hover:bg-white/[0.04] transition-colors">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d={method.icon} />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{method.label}</p>
                          <p className="text-xs text-muted-foreground">{method.value}</p>
                        </div>
                        <svg className="h-4 w-4 text-muted-foreground ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </div>
                    </SpotlightCard>
                  </a>
                ))}
              </div>
              <div className="mt-8 glass rounded-2xl p-6 border border-white/5">
                <h3 className="font-display font-semibold mb-2">Office</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Designify AI HQ<br />
                  Remote-first &middot; Global team<br />
                  Available across time zones
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </PageTransition>
  )
}
