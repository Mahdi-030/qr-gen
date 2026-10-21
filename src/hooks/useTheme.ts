import { useCallback, useEffect, useState } from 'react'
import { readStore, writeStore } from '../lib/storage'

type Theme = 'light' | 'dark'

function initial(): Theme {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(initial)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  // The inline script in index.html reads this raw key before first paint.
  const toggle = useCallback(() => {
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem('qrforge:theme', next)
      } catch {
        /* ignore */
      }
      return next
    })
  }, [])

  return { theme, toggle }
}

export function useFavorites() {
  const [ids, setIds] = useState<string[]>(() => readStore<string[]>('favorites', []))
  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      writeStore('favorites', next)
      return next
    })
  }, [])
  return { favorites: ids, toggleFavorite: toggle }
}
