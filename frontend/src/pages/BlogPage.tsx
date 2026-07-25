import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import PageTransition from '../components/ui/PageTransition'
import AuroraBackground from '../components/ui/AuroraBackground'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6 },
}

const blogPosts = [
  {
    title: 'How AI is Transforming Design-to-Code Workflows',
    excerpt: 'Discover how artificial intelligence is bridging the gap between design and development, making frontend engineering faster and more accessible.',
    date: 'March 15, 2025',
    category: 'AI & Tech',
    readTime: '5 min read',
  },
  {
    title: 'Best Practices for Component-Based Architecture with React 18',
    excerpt: 'Learn how to structure your React components for maximum reusability, maintainability, and performance using the latest React 18 features.',
    date: 'March 10, 2025',
    category: 'Development',
    readTime: '7 min read',
  },
  {
    title: 'From Figma to Code: A Complete Guide',
    excerpt: 'Step-by-step walkthrough on how to take your Figma designs and transform them into production-ready React components using Designify AI.',
    date: 'March 5, 2025',
    category: 'Tutorial',
    readTime: '10 min read',
  },
  {
    title: 'Why TypeScript Matters for Design Systems',
    excerpt: 'Explore how TypeScript brings type safety to your design system components and improves collaboration between designers and developers.',
    date: 'February 28, 2025',
    category: 'TypeScript',
    readTime: '6 min read',
  },
  {
    title: 'The Future of UI Development: AI-Assisted Coding',
    excerpt: 'What does the future hold for frontend development? We explore trends in AI-assisted coding and how it will shape the industry.',
    date: 'February 20, 2025',
    category: 'Industry',
    readTime: '8 min read',
  },
  {
    title: 'Optimizing Tailwind CSS for Production',
    excerpt: 'Tips and tricks for configuring Tailwind CSS to minimize bundle size and maximize performance in your production builds.',
    date: 'February 12, 2025',
    category: 'CSS',
    readTime: '4 min read',
  },
]

export default function BlogPage() {
  const navigate = useNavigate()

  return (
    <PageTransition>
      <section className="relative min-h-[40vh] flex items-center overflow-hidden">
        <AuroraBackground />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 sm:py-36">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl mx-auto text-center"
          >
            <Badge variant="gradient" className="mb-4">Blog</Badge>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1]">
              Insights &amp; <span className="text-gradient">Updates</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
              Stories, tutorials, and thoughts on design, code, and building with AI.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {blogPosts.map((post, i) => (
              <motion.article
                key={post.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className="group cursor-pointer"
              >
                <div className="glass rounded-2xl p-6 h-full flex flex-col border border-white/5 hover:bg-white/[0.04] transition-all duration-300">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                      {post.category}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">{post.date}</span>
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-3 group-hover:text-indigo-300 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-[10px] text-muted-foreground">{post.readTime}</span>
                    <span className="text-xs text-indigo-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      Read more
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeUp}>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight mb-4">
              Subscribe to our newsletter
            </h2>
            <p className="text-muted-foreground mb-6">
              Get the latest posts delivered straight to your inbox.
            </p>
            <div className="flex max-w-md mx-auto gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
              />
              <Button variant="gradient" size="sm">
                Subscribe
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeUp}>
            <h2 className="font-display text-2xl font-semibold tracking-tight mb-2">
              Want to contribute?
            </h2>
            <p className="text-muted-foreground mb-6">
              Have an idea for a post? We&apos;d love to hear from you.
            </p>
            <Button variant="outline" onClick={() => navigate('/contact')}>
              Get in touch
            </Button>
          </motion.div>
        </div>
      </section>
    </PageTransition>
  )
}

