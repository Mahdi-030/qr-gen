import { useCallback, useState } from 'react'
import type { HistoryEntry } from '../types/qr'
import { readStore, removeStore, writeStore } from '../lib/storage'

const KEY = 'history'
const MAX = 12
/** Logos larger than this (as data URL chars) are not persisted, to protect the storage quota. */
const MAX_LOGO_CHARS = 180_000

function sanitize(e: HistoryEntry): HistoryEntry {
  const copy: HistoryEntry = { ...e, style: { ...e.style }, form: { ...e.form } }
  // Never persist Wi-Fi passwords.
  if (copy.type === 'wifi') (copy.form as { password: string }).password = ''
  if (copy.style.logo && copy.style.logo.length > MAX_LOGO_CHARS) copy.style.logo = null
  return copy
}

export function useQRHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>(() => readStore<HistoryEntry[]>(KEY, []))

  const add = useCallback((entry: HistoryEntry) => {
    setHistory((prev) => {
      const next = [sanitize(entry), ...prev.filter((p) => p.summary !== entry.summary || p.type !== entry.type)].slice(0, MAX)
      if (!writeStore(KEY, next)) {
        // Quota exceeded: retry without logos.
        const slim = next.map((n) => ({ ...n, style: { ...n.style, logo: null } }))
        writeStore(KEY, slim)
        return slim
      }
      return next
    })
  }, [])

  const remove = useCallback((id: string) => {
    setHistory((prev) => {
      const next = prev.filter((p) => p.id !== id)
      writeStore(KEY, next)
      return next
    })
  }, [])

  const clear = useCallback(() => {
    removeStore(KEY)
    setHistory([])
  }, [])

  return { history, add, remove, clear }
}
