export default function Footer() {
  return (
    <footer className="border-t border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-slate-400">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <div>© {new Date().getFullYear()} Designify AI. All rights reserved.</div>
          <div className="opacity-80">Dark mode by default • SaaS-ready foundation</div>
        </div>
      </div>
    </footer>
  )
}

