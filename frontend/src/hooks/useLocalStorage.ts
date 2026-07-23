import { useCallback, useEffect, useState } from 'react'

/**
 * Type-safe hook for reading and writing values to `localStorage`.
 * Automatically syncs across browser tabs using the `storage` event.
 *
 * @param key - The localStorage key.
 * @param initialValue - The fallback value if nothing is stored or parsing fails.
 * @returns A stateful value and a setter, similar to `useState`.
 *
 * @example
 * ```tsx
 * const [token, setToken] = useLocalStorage<string | null>('access_token', null)
 * const [theme, setTheme] = useLocalStorage<'dark' | 'light'>('theme', 'dark')
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item !== null ? (JSON.parse(item) as T) : initialValue
    } catch {
      console.warn(`[useLocalStorage] Failed to parse key "${key}", using initial value.`)
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const nextValue = value instanceof Function ? value(prev) : value
        try {
          window.localStorage.setItem(key, JSON.stringify(nextValue))
        } catch (error) {
          console.warn(`[useLocalStorage] Failed to set key "${key}":`, error)
        }
        return nextValue
      })
    },
    [key]
  )

  // Listen for storage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== key) return
      if (event.newValue === null) {
        setStoredValue(initialValue)
      } else {
        try {
          setStoredValue(JSON.parse(event.newValue) as T)
        } catch {
          setStoredValue(initialValue)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key, initialValue])

  return [storedValue, setValue]
}

/**
 * Convenience wrapper around `useLocalStorage` for string values.
 * Avoids JSON serialisation overhead for simple strings.
 *
 * @example
 * ```tsx
 * const [token, setToken] = useLocalStorageString('access_token', '')
 * ```
 */
export function useLocalStorageString(
  key: string,
  initialValue: string
): [string, (value: string | ((prev: string) => string)) => void] {
  const [storedValue, setStoredValue] = useState<string>(() => {
    try {
      return window.localStorage.getItem(key) ?? initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: string | ((prev: string) => string)) => {
      setStoredValue((prev) => {
        const nextValue = value instanceof Function ? value(prev) : value
        try {
          window.localStorage.setItem(key, nextValue)
        } catch (error) {
          console.warn(`[useLocalStorageString] Failed to set key "${key}":`, error)
        }
        return nextValue
      })
    },
    [key]
  )

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key) {
        setStoredValue(event.newValue ?? initialValue)
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key, initialValue])

  return [storedValue, setValue]
}

/**
 * Removes a key from localStorage and returns the previous value, if any.
 *
 * @param key - The localStorage key to remove.
 * @returns The previously stored value, or `null` if the key didn't exist.
 */
export function removeLocalStorage(key: string): string | null {
  try {
    const previous = window.localStorage.getItem(key)
    window.localStorage.removeItem(key)
    return previous
  } catch {
    return null
  }
}

