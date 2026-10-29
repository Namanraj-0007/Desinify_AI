import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border border-white/10 bg-white/5 text-slate-200 backdrop-blur-sm',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
        outline: 'border border-border text-foreground',
        gradient: 'border border-indigo-500/30 bg-gradient-to-r from-indigo-500/15 via-indigo-500/10 to-cyan-500/15 text-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.2)] backdrop-blur-md',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
