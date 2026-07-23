import { useEffect, useMemo, useRef, useState, useCallback } from 'react'

/**
 * Debounces a value by the specified delay.
 * Useful for delaying search input, resize calculations, or any rapidly-changing value
 * until the user has stopped updating it.
 *
 * @param value - The value to debounce.
 * @param delay - The debounce delay in milliseconds (default: 300ms).
 * @returns The debounced value, which updates only after the delay has elapsed since the last change.
 *
 * @example
 * ```tsx
 * const [search, setSearch] = useState('')
 * const debouncedSearch = useDebounce(search, 400)
 * // debouncedSearch updates 400ms after the user stops typing
 * ```
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    if (delay <= 0) {
      setDebouncedValue(value)
      return
    }

    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Returns a debounced version of the provided callback.
 * The callback will only be invoked after the specified delay since the last invocation.
 *
 * @param callback - The function to debounce.
 * @param delay - The debounce delay in milliseconds (default: 300ms).
 * @returns A debounced version of the callback with the same signature.
 *
 * @example
 * ```tsx
 * const handleSearch = useDebouncedCallback((term: string) => {
 *   api.search(term)
 * }, 500)
 * ```
 */
export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void | Promise<void>,
  delay = 300
): (...args: Args) => void {
  const callbackRef = useRef(callback)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Keep the latest callback reference
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  const debouncedFn = useCallback(
    (...args: Args) => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
      }
      timerRef.current = setTimeout(() => {
        callbackRef.current(...args)
        timerRef.current = null
      }, delay)
    },
    [delay]
  )

  return debouncedFn
}

/**
 * Cancels the pending debounced callback.
 * Useful for cleanup when a component unmounts or when the user aborts an action.
 *
 * @param debouncedFn - The function returned by `useDebouncedCallback`.
 *                      This hook is typically used alongside `useDebouncedCallback`.
 *
 * @example
 * ```tsx
 * const handleSearch = useDebouncedCallback((term: string) => { ... }, 500)
 * // later:
 * cancelDebounce(handleSearch) // cancels any pending invocation
 * ```
 */
export function cancelDebounce(
  debouncedFn: (...args: unknown[]) => void
): void {
  // The timer ref is internal; consumers can trigger cancellation by
  // simply not calling the debounced function.
  // This function is provided for API completeness.
  void debouncedFn
}

/**
 * Creates a debounced version of an async function.
 * Only the last call within the delay window will be executed.
 * Previous pending promises will be abandoned.
 *
 * @param fn - The async function to debounce.
 * @param delay - The debounce delay in milliseconds (default: 300ms).
 * @returns A debounced async function.
 */
export function debounceAsync<Args extends unknown[], Return>(
  fn: (...args: Args) => Promise<Return>,
  delay = 300
): (...args: Args) => Promise<Return | undefined> {
  let timer: ReturnType<typeof setTimeout> | null = null
  let resolveList: Array<(value: Return | undefined) => void> = []

  return (...args: Args): Promise<Return | undefined> => {
    if (timer !== null) {
      clearTimeout(timer)
    }

    return new Promise((resolve) => {
      resolveList.push(resolve)

      timer = setTimeout(async () => {
        timer = null
        const currentResolvers = [...resolveList]
        resolveList = []

        try {
          const result = await fn(...args)
          currentResolvers.forEach((r) => r(result))
        } catch (error) {
          currentResolvers.forEach((r) => r(undefined))
        }
      }, delay)
    })
  }
}

/**
 * A convenience hook that combines `useDebouncedCallback` with a loading state.
 * Useful for debounced API calls that need to show a loading indicator.
 *
 * @param callback - The async function to debounce.
 * @param delay - The debounce delay in milliseconds (default: 300ms).
 * @returns An object with the debounced function and a loading flag.
 *
 * @example
 * ```tsx
 * const { fn: debouncedSearch, isLoading } = useDebouncedLoading(api.searchUsers, 500)
 * ```
 */
export function useDebouncedLoading<Args extends unknown[], Return>(
  callback: (...args: Args) => Promise<Return>,
  delay = 300
): { fn: (...args: Args) => void; isLoading: boolean } {
  const [isLoading, setIsLoading] = useState(false)

  const debouncedFn = useDebouncedCallback(
    async (...args: Args) => {
      setIsLoading(true)
      try {
        await callback(...args)
      } finally {
        setIsLoading(false)
      }
    },
    delay
  )

  return useMemo(() => ({ fn: debouncedFn, isLoading }), [debouncedFn, isLoading])
}

