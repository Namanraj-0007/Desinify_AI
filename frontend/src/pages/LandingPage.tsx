import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

function GlowBadge({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-slate-100 text-sm shadow-[0_0_24px_rgba(99,102,241,0.25)]">
      <span className="h-2 w-2 rounded-full bg-indigo-400 shadow-[0_0_18px_rgba(99,102,241,0.55)]" />
      {children}
    </div>
  )
}

function UploadDesignCard() {
  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  const accept = 'image/*,.png,.jpg,.jpeg,.webp'

  const hint = useMemo(() => {
    if (fileName) return `Selected: ${fileName}`
    return 'Drag & drop your screenshot or choose a file.'
  }, [fileName])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40 p-5"
    >
      <div className="pointer-events-none absolute -inset-28 bg-gradient-to-r from-indigo-500/20 via-cyan-500/10 to-fuchsia-500/20 blur-2xl" />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-slate-100 font-semibold">Upload Design</div>
            <div className="text-sm text-slate-400 mt-1">{hint}</div>
          </div>
          <div className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
            Phase 2-ready
          </div>
        </div>

        <div
          className={`mt-5 rounded-xl border border-dashed transition-colors ${
            dragging ? 'border-indigo-400/60 bg-indigo-500/10' : 'border-white/15 bg-white/5'
          }`}
          onDragEnter={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            const file = e.dataTransfer.files?.[0]
            if (!file) return
            setFileName(file.name)
          }}
        >
          <label className="block cursor-pointer">
            <div className="p-6 flex flex-col items-center justify-center text-center">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-fuchsia-500/30 flex items-center justify-center shadow-[0_0_32px_rgba(99,102,241,0.25)]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-indigo-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V8a2 2 0 012-2h6a2 2 0 012 2v8M7 16h10M10 12l2-2 2 2" />
                </svg>
              </div>
              <div className="mt-3 text-sm font-medium text-slate-100">Drop your design</div>
              <div className="mt-1 text-xs text-slate-400">PNG, JPG, WebP</div>

              <div className="mt-4 inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-xs text-slate-200">
                <span className="h-2 w-2 rounded-full bg-cyan-300" />
                Or browse files
              </div>

              <input
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  setFileName(file.name)
                }}
              />
            </div>
          </label>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Link
            to="/signup"
            className="inline-flex justify-center items-center rounded-xl bg-white px-4 py-2 text-slate-950 font-semibold hover:bg-white/90 transition"
          >
            Create account
          </Link>
          <div className="text-xs text-slate-400">
            No AI call yet (Phase 2 will start analysis & generation).
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function CodePreview() {
  const code = `// Mock preview (Phase 1)
// Navbar.jsx
export function Navbar(){
  return <nav className="flex items-center gap-3">...</nav>
}

// Hero.jsx
export function Hero(){
  return <section>Upload → Analyze → Generate</section>
}

// Pricing.jsx
export function Pricing(){
  return <div>Plans for teams & individuals</div>
}

// Footer.jsx
export function Footer(){
  return <footer>© Designify AI</footer>
}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6 }}
      className="rounded-2xl border border-white/10 bg-slate-950/40 overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
          <span className="ml-2">Mock code output</span>
        </div>
        <div className="text-xs text-slate-500">React + Tailwind</div>
      </div>
      <pre className="p-4 text-xs leading-relaxed text-slate-200 overflow-auto">
        <code>{code}</code>
      </pre>
    </motion.div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(circle_at_80%_20%,rgba(34,211,238,0.18),transparent_50%),radial-gradient(circle_at_50%_80%,rgba(236,72,153,0.14),transparent_55%)]" />
        <div className="absolute -top-40 -left-40 h-[380px] w-[380px] rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-44 -right-40 h-[420px] w-[420px] rounded-full bg-fuchsia-500/15 blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 pt-14 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col lg:flex-row gap-10 items-center"
          >
            <div className="flex-1">
              <GlowBadge>Design-to-code workflow powered by Gemini (Phase 2)</GlowBadge>

              <h1 className="mt-5 text-4xl sm:text-6xl font-semibold tracking-tight">
                Convert UI screenshots into <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-cyan-200 to-fuchsia-200">reusable React components</span>.
              </h1>
              <p className="mt-4 text-slate-400 text-lg max-w-xl">
                Upload a design, get structured components, edit with AI chat, and download a Tailwind-powered React project.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  to="/signup"
                  className="inline-flex justify-center items-center rounded-xl bg-white px-5 py-3 text-slate-950 font-semibold hover:bg-white/90 transition"
                >
                  Get started
                </Link>
                <Link
                  to="/login"
                  className="inline-flex justify-center items-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-slate-100 font-semibold hover:bg-white/10 transition"
                >
                  Login
                </Link>
              </div>

              {/* Metrics */}
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { title: '60%', sub: 'Faster development' },
                  { title: '90%', sub: 'Reusable components' },
                  { title: '100%', sub: 'Tailwind ready' }
                ].map((m) => (
                  <motion.div
                    key={m.title}
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_0_40px_rgba(99,102,241,0.10)]"
                  >
                    <div className="text-2xl font-semibold text-slate-100">{m.title}</div>
                    <div className="mt-1 text-sm text-slate-400">{m.sub}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="w-full lg:w-[420px]">
              <UploadDesignCard />
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-slate-300 text-sm">How it works</div>
              <h2 className="text-2xl sm:text-3xl font-semibold mt-2">
                From design to production-ready components.
              </h2>
            </div>
          </div>
        </motion.div>

        <div className="mt-8 grid md:grid-cols-3 gap-4">
          {[
            { title: 'Upload Design', desc: 'Drop a screenshot or export from your design flow.' },
            { title: 'AI Analysis', desc: 'Gemini extracts layout structure and UI parts.' },
            { title: 'Generate React Components', desc: 'Reusable React + Tailwind components you can edit.' }
          ].map((s, idx) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.55, delay: idx * 0.06 }}
              whileHover={{ y: -3 }}
              className="group rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500/25 to-cyan-500/15 border border-white/10 flex items-center justify-center text-indigo-200 font-semibold shadow-[0_0_28px_rgba(99,102,241,0.25)]">
                  {idx + 1}
                </div>
                <div className="font-semibold text-slate-100">{s.title}</div>
              </div>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">{s.desc}</p>
              <div className="mt-4 h-px w-full bg-gradient-to-r from-indigo-500/0 via-indigo-500/40 to-fuchsia-500/0 opacity-0 group-hover:opacity-100 transition" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <div className="text-slate-300 text-sm">Features</div>
            <h2 className="text-2xl sm:text-3xl font-semibold mt-2">Everything you need to ship faster.</h2>
          </div>
        </motion.div>

        <div className="mt-8 grid md:grid-cols-3 gap-4">
          {[
            { title: 'AI Design Analyzer', desc: 'Understands UI structure, spacing, and components.' },
            { title: 'React Component Generator', desc: 'Creates reusable React + Tailwind code blocks.' },
            { title: 'AI Chat Assistant', desc: 'Iterate quickly with natural-language changes.' },
            { title: 'Live Preview', desc: 'See generated UI immediately in your browser.' },
            { title: 'Code Optimization', desc: 'Improves readability, structure, and consistency.' }
          ].map((f, idx) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.55, delay: idx * 0.06 }}
              whileHover={{ y: -3 }}
              className="group rounded-2xl border border-white/10 bg-white/5 p-5 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-fuchsia-500/0 opacity-0 group-hover:opacity-100 transition" />
              <div className="relative">
                <div className="text-slate-100 font-semibold">{f.title}</div>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Mock code preview */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-2 gap-6 items-start">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-slate-300 text-sm">Preview</div>
              <h2 className="text-2xl sm:text-3xl font-semibold mt-2">A codebase that feels crafted, not generated.</h2>
              <p className="mt-3 text-slate-400 leading-relaxed">
                The generator produces clean components, consistent naming, and Tailwind-first styling.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Component-driven", "Tailwind-first", "Edit with chat"].map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          <CodePreview />
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-500/15 via-white/5 to-fuchsia-500/15 p-6 sm:p-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.28),transparent_45%),radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.20),transparent_45%)]" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="text-slate-100 text-xl font-semibold">Ready to build faster?</div>
              <div className="mt-2 text-slate-400">Start with a design upload. Improve with AI chat. Ship with confidence.</div>
            </div>
            <div className="flex gap-3">
              <Link
                to="/signup"
                className="inline-flex justify-center items-center rounded-xl bg-white px-5 py-3 text-slate-950 font-semibold hover:bg-white/90 transition"
              >
                Create account
              </Link>
              <Link
                to="/login"
                className="inline-flex justify-center items-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-slate-100 font-semibold hover:bg-white/10 transition"
              >
                Login
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  )
}


