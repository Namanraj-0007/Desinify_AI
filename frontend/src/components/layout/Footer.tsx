import { Link } from 'react-router-dom'

const footerLinks = {
  Resources: [
    { label: 'Documentation', href: '/docs' },
    { label: 'API Reference', href: '/api' },
    { label: 'Changelog', href: '/changelog' },
    { label: 'Status', href: '/status' },
    { label: 'Tutorials', href: '/docs#tutorials' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact', href: '/contact' },
  ],
  Connect: [
    { label: 'Portfolio', href: 'https://portfolio-gamma-seven-58.vercel.app/' },
    { label: 'GitHub', href: 'https://github.com/Namanraj-0007' },
    { label: 'Email', href: 'mailto:namandraj4777@gmail.com' },
  ],
}

export default function Footer() {
  const handleSubscribe = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const email = (form.elements.nativeElement as HTMLInputElement)?.value || (form.querySelector('[type="email"]') as HTMLInputElement)?.value
    if (email) {
      window.location.href = `mailto:namandraj4777@gmail.com?subject=Newsletter Subscription&body=Please subscribe me to the Designify AI newsletter.%0D%0A%0D%0AMy email: ${encodeURIComponent(email)}`
    }
  }

  return (
    <footer className="relative border-t border-border/50 bg-gradient-to-b from-background/50 to-background/80">
      {/* Top decorative gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 lg:pt-20 pb-12">
        {/* Main grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand - spans 2 cols */}
          <div className="col-span-2 md:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 group mb-4">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 flex items-center justify-center shadow-[0_0_20px_hsl(252_87%_65%/0.3)] group-hover:shadow-[0_0_30px_hsl(252_87%_65%/0.4)] transition-shadow duration-300">
                <span className="text-sm font-bold text-white">D</span>
              </div>
              <span className="font-display font-semibold text-base">
                Designify <span className="text-gradient">AI</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Convert UI screenshots into production-ready React components powered by AI. Ship faster with Designify AI.
            </p>

            {/* Social proof - mini stats */}
            <div className="mt-6 flex items-center gap-4">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500/30 to-fuchsia-500/30 border-2 border-background flex items-center justify-center"
                  >
                    <span className="text-[8px] font-bold text-indigo-300">
                      {String.fromCharCode(65 + i)}
                    </span>
                  </div>
                ))}
              </div>
              <span className="text-[10px] text-muted-foreground">
                Trusted by <span className="text-foreground font-medium">500+</span> creators
              </span>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-display font-semibold text-xs text-foreground/70 uppercase tracking-wider mb-4">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('/') ? (
                      <Link
                        to={link.href}
                        className="text-sm text-muted-foreground hover:text-indigo-300 transition-colors duration-200 inline-flex items-center gap-1.5 group/link"
                      >
                        <span className="w-0 group-hover/link:w-1.5 h-1.5 rounded-full bg-indigo-400/60 transition-all duration-200" />
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-indigo-300 transition-colors duration-200 inline-flex items-center gap-1.5 group/link"
                      >
                        <span className="w-0 group-hover/link:w-1.5 h-1.5 rounded-full bg-indigo-400/60 transition-all duration-200" />
                        {link.label}
                        {link.href.startsWith('http') && (
                          <svg className="h-3 w-3 opacity-0 group-hover/link:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                          </svg>
                        )}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter signup */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-indigo-500/5 via-fuchsia-500/5 to-transparent border border-white/5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <div className="flex-1">
              <h4 className="font-display font-semibold text-sm text-foreground mb-1">
                Stay updated
              </h4>
              <p className="text-xs text-muted-foreground">
                Get the latest features and updates delivered to your inbox.
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex w-full sm:w-auto gap-2">
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                required
                className="flex-1 sm:w-56 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
              />
              <button type="submit" className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 text-white hover:shadow-[0_0_30px_hsl(252_87%_65%/0.3)] h-10 px-5 py-2 shrink-0">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Designify AI. All rights reserved.
            <span className="hidden sm:inline mx-2 text-muted-foreground/30">·</span>
            <span className="block sm:inline text-xs text-muted-foreground/60">
              Built with passion by{' '}
              <a
                href="https://github.com/Namanraj-0007"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-300 hover:text-indigo-200 transition-colors"
              >
                Namandip Raj
              </a>
              <span className="mx-1.5 text-muted-foreground/30">·</span>
              Designed by <span className="text-indigo-300">Namandip raj</span> with <span className="text-red-400">&#10084;</span>
            </span>
          </p>
          <div className="flex items-center gap-4">
            <a href="https://github.com/Namanraj-0007" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-indigo-300 transition-colors duration-200" aria-label="GitHub">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
            </a>
            <a href="mailto:namandraj4777@gmail.com" className="text-muted-foreground hover:text-indigo-300 transition-colors duration-200" aria-label="Email">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </a>
            <a href="https://discord.com/users/763966768615915530" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-indigo-300 transition-colors duration-200" aria-label="Discord">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
              </svg>
            </a>
            <a href="https://www.linkedin.com/in/namandraj0007" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-indigo-300 transition-colors duration-200" aria-label="LinkedIn">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

