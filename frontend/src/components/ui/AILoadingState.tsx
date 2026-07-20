import { cn } from '../../lib/utils'

interface AILoadingStateProps {
  className?: string
  lines?: number
}

function SkeletonPulse({ className }: { className?: string }) {
  return (
    <div
      className={cn('rounded-xl shimmer', className)}
      style={{ minHeight: '1em' }}
    />
  )
}

export default function AILoadingState({ className, lines = 3 }: AILoadingStateProps) {
  return (
    <div className={cn('space-y-4 p-6', className)}>
      <div className="flex items-center gap-3 mb-6">
        <div className="relative h-8 w-8">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 animate-pulse-glow" />
          <div className="absolute inset-1 rounded-full bg-background flex items-center justify-center">
            <svg className="h-3 w-3 text-indigo-400 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        </div>
        <div className="space-y-1">
          <SkeletonPulse className="h-3 w-28" />
          <SkeletonPulse className="h-2 w-20" />
        </div>
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonPulse
          key={i}
          className={cn('h-4', i === lines - 1 ? 'w-3/4' : 'w-full')}
        />
      ))}
      <div className="flex gap-2 pt-2">
        <SkeletonPulse className="h-8 w-20 rounded-lg" />
        <SkeletonPulse className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  )
}

