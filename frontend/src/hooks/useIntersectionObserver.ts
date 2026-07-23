import { useEffect, useRef, useState, useCallback, type RefObject } from 'react'

/**
 * Configuration options for the intersection observer hook.
 */
export type IntersectionOptions = {
  /**
   * The root element used as the viewport for checking visibility.
   * Defaults to the browser viewport if `null`.
   */
  root?: Element | Document | null

  /**
   * Margin around the root element, specified similar to CSS margin.
   * e.g. `'10px'`, `'10px 20px'`, or `'0px 0px 100px 0px'`.
   */
  rootMargin?: string

  /**
   * A single number or an array of numbers between 0 and 1 indicating
   * the percentage of the target element that must be visible.
   * Defaults to `0`.
   */
  threshold?: number | number[]

  /**
   * If `true`, the observer will disconnect after the element first becomes visible.
   * Useful for "once" animations or lazy-loading images. Defaults to `false`.
   */
  triggerOnce?: boolean

  /**
   * If `true`, the element is considered visible even if partially outside the viewport,
   * as long as some part is intersecting. Equivalent to setting the root margin to
   * `'100px'` on all sides. Defaults to `false`.
   */
  lazy?: boolean
}

/**
 * The return value of the intersection observer hook.
 */
export type IntersectionResult = {
  /**
   * Ref to attach to the element you want to observe.
   */
  ref: RefObject<Element | null>

  /**
   * Whether the element is currently intersecting the viewport.
   */
  isIntersecting: boolean

  /**
   * The intersection ratio (0 to 1).
   */
  intersectionRatio: number

  /**
   * The raw `IntersectionObserverEntry` object, useful for advanced use cases.
   */
  entry: IntersectionObserverEntry | null

  /**
   * Manually disconnect the observer.
   */
  disconnect: () => void

  /**
   * Manually re-observe the element (e.g. after content changes).
   */
  reobserve: () => void
}

/**
 * Reactively tracks an element's visibility relative to a root viewport
 * using the Intersection Observer API.
 *
 * @param options - Configuration for the intersection observer.
 * @returns An object containing a `ref` to attach to your element and visibility state.
 *
 * @example
 * ```tsx
 * function LazyImage({ src }: { src: string }) {
 *   const { ref, isIntersecting } = useIntersectionObserver({ triggerOnce: true, rootMargin: '200px' })
 *
 *   return (
 *     <div ref={ref} className="min-h-[200px]">
 *       {isIntersecting ? <img src={src} alt="" /> : <div className="shimmer h-full" />}
 *     </div>
 *   )
 * }
 * ```
 */
export function useIntersectionObserver(options: IntersectionOptions = {}): IntersectionResult {
  const {
    root = null,
    rootMargin = '0px',
    threshold = 0,
    triggerOnce = false,
    lazy = false,
  } = options

  const elementRef = useRef<Element | null>(null)
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [intersectionRatio, setIntersectionRatio] = useState(0)
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const hasTriggeredRef = useRef(false)

  const effectiveRootMargin = lazy ? '100px' : rootMargin

  const disconnect = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }
  }, [])

  const reobserve = useCallback(() => {
    disconnect()
    hasTriggeredRef.current = false

    if (!elementRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
        setIntersectionRatio(entry.intersectionRatio)
        setEntry(entry)

        if (entry.isIntersecting && triggerOnce && !hasTriggeredRef.current) {
          hasTriggeredRef.current = true
          disconnect()
        }
      },
      {
        root,
        rootMargin: effectiveRootMargin,
        threshold,
      }
    )

    observer.observe(elementRef.current)
    observerRef.current = observer
  }, [root, effectiveRootMargin, threshold, triggerOnce, disconnect])

  useEffect(() => {
    reobserve()
    return disconnect
  }, [reobserve, disconnect])

  return {
    ref: elementRef,
    isIntersecting,
    intersectionRatio,
    entry,
    disconnect,
    reobserve,
  }
}

/**
 * A convenience hook that returns `true` only once when the element enters the viewport.
 * Useful for triggering entrance animations or lazy loading exactly once.
 *
 * @param options - Intersection observer options. `triggerOnce` is always `true`.
 * @returns `true` once the element has become visible.
 *
 * @example
 * ```tsx
 * const { ref, hasBeenVisible } = useWasInViewport({ rootMargin: '-50px' })
 *
 * return (
 *   <motion.div
 *     ref={ref}
 *     initial={{ opacity: 0 }}
 *     animate={hasBeenVisible ? { opacity: 1 } : {}}
 *   >
 *     Content
 *   </motion.div>
 * )
 * ```
 */
export function useWasInViewport(options: IntersectionOptions = {}): {
  ref: RefObject<Element | null>
  hasBeenVisible: boolean
} {
  const { ref, isIntersecting } = useIntersectionObserver({
    ...options,
    triggerOnce: true,
  })
  const [hasBeenVisible, setHasBeenVisible] = useState(false)

  useEffect(() => {
    if (isIntersecting && !hasBeenVisible) {
      setHasBeenVisible(true)
    }
  }, [isIntersecting, hasBeenVisible])

  return { ref, hasBeenVisible }
}

/**
 * Tracks the visibility percentage of an element.
 * Returns a value between 0 (hidden) and 1 (fully visible).
 *
 * @param thresholdStep - The step granularity for threshold updates (default: 0.1).
 * @returns An object with the ref and visibility fraction.
 *
 * @example
 * ```tsx
 * const { ref, visibility } = useVisibilityTracker(0.05)
 * // visibility is 0.45 when 45% of the element is in view
 * ```
 */
export function useVisibilityTracker(thresholdStep = 0.1): {
  ref: RefObject<Element | null>
  visibility: number
} {
  const thresholds = Array.from({ length: Math.floor(1 / thresholdStep) + 1 }, (_, i) =>
    Number((i * thresholdStep).toFixed(2))
  )

  const { ref, intersectionRatio } = useIntersectionObserver({
    threshold: thresholds,
  })

  return { ref, visibility: intersectionRatio }
}

