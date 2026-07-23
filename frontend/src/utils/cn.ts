/**
 * Re-export of the `cn` utility from `@/lib/utils`.
 *
 * This file exists as an alias so consumers can import from `@/utils/cn`
 * rather than `@/lib/utils`, providing a cleaner import path.
 *
 * `cn` merges Tailwind CSS class names using `clsx` and `tailwind-merge`,
 * intelligently resolving conflicts between utility classes.
 *
 * @example
 * ```tsx
 * import { cn } from '@/utils/cn'
 *
 * <div className={cn('px-4 py-2', isActive && 'bg-blue-500', className)} />
 * ```
 */
export { cn } from '../lib/utils'

