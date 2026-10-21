import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import { ToastContext, type ToastKind } from '../../hooks/toastContext'

interface Item {
  id: number
  message: string
  kind: ToastKind
}

const ICON = { success: CheckCircle2, error: AlertCircle, info: Info } as const
const COLOR = { success: 'text-success', error: 'text-danger', info: 'text-accent' } as const

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([])
  const idRef = useRef(0)
  const timers = useRef<number[]>([])

  const dismiss = useCallback((id: number) => setItems((p) => p.filter((t) => t.id !== id)), [])

  const toast = useCallback(
    (message: string, kind: ToastKind = 'info') => {
      const id = ++idRef.current
      setItems((p) => [...p.slice(-3), { id, message, kind }])
      timers.current.push(window.setTimeout(() => dismiss(id), kind === 'error' ? 6000 : 3800))
    },
    [dismiss],
  )

  useEffect(() => {
    const t = timers.current
    return () => t.forEach((x) => window.clearTimeout(x))
  }, [])

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-20 z-[100] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:items-end sm:pr-6"
        role="region"
        aria-label="Notifications"
        aria-live="polite"
      >
        {items.map((t) => {
          const Icon = ICON[t.kind]
          return (
            <div
              key={t.id}
              role={t.kind === 'error' ? 'alert' : 'status'}
              className="animate-fade-up pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-line bg-surface p-3.5 pr-2.5 text-sm shadow-card"
            >
              <Icon className={`mt-0.5 size-5 shrink-0 ${COLOR[t.kind]}`} aria-hidden />
              <p className="flex-1 leading-snug">{t.message}</p>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="rounded-lg p-1 text-muted hover:bg-surface-2 hover:text-ink"
                aria-label="Dismiss notification"
              >
                <X className="size-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
