import { useId, useState, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-accent text-white shadow-[0_8px_20px_-8px_var(--c-accent)] hover:bg-accent-strong disabled:opacity-60 disabled:shadow-none',
  secondary: 'border border-line bg-surface text-ink hover:border-accent/50 hover:bg-accent-soft disabled:opacity-50',
  ghost: 'text-muted hover:bg-surface-2 hover:text-ink disabled:opacity-50',
  danger: 'border border-danger/40 bg-surface text-danger hover:bg-danger/10 disabled:opacity-50',
}

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ variant = 'secondary', size = 'md', className = '', type = 'button', ...rest }: BtnProps) {
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2.5 text-sm', lg: 'px-6 py-3.5 text-base' }[size]
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed ${sizes} ${VARIANTS[variant]} ${className}`}
      {...rest}
    />
  )
}

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      role="status"
      aria-label="Loading"
    />
  )
}

export function InfoTip({ text }: { text: string }) {
  const id = useId()
  return (
    <span className="group relative inline-flex align-middle">
      <button
        type="button"
        aria-describedby={id}
        className="rounded-full text-muted hover:text-accent focus-visible:text-accent"
        aria-label="More information"
      >
        <HelpCircle className="size-3.5" />
      </button>
      <span
        id={id}
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 w-56 -translate-x-1/2 rounded-xl bg-ink px-3 py-2 text-xs font-normal leading-snug text-bg opacity-0 shadow-card transition group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {text}
      </span>
    </span>
  )
}

interface FieldProps {
  label: string
  error?: string
  hint?: string
  tip?: string
  children: (props: { id: string; 'aria-invalid': boolean; 'aria-describedby'?: string }) => ReactNode
  className?: string
}

export function Field({ label, error, hint, tip, children, className = '' }: FieldProps) {
  const id = useId()
  const descId = `${id}-d`
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold">
        {label}
        {tip && <InfoTip text={tip} />}
      </label>
      {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': error || hint ? descId : undefined })}
      {(error || hint) && (
        <p id={descId} className={`mt-1.5 text-xs ${error ? 'font-medium text-danger' : 'text-muted'}`} role={error ? 'alert' : undefined}>
          {error || hint}
        </p>
      )}
    </div>
  )
}

interface SegmentedProps<T extends string> {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
  columns?: string
}

/** Accessible single-choice chip group (radiogroup). */
export function Segmented<T extends string>({ label, value, options, onChange, columns = 'grid-cols-3' }: SegmentedProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className={`grid gap-2 ${columns}`}>
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`rounded-xl border px-2 py-2 text-xs font-semibold transition ${
              active ? 'border-accent bg-accent-soft text-accent-strong' : 'border-line bg-surface text-muted hover:border-accent/50 hover:text-ink'
            }`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

export function Collapsible({ title, children, defaultOpen = false }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  const id = useId()
  return (
    <div className="rounded-2xl border border-line">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-bold"
        >
          {title}
          <ChevronDown className={`size-4 text-muted transition ${open ? 'rotate-180' : ''}`} aria-hidden />
        </button>
      </h3>
      {open && (
        <div id={id} className="space-y-4 border-t border-line px-4 py-4">
          {children}
        </div>
      )}
    </div>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-3xl border border-line bg-surface shadow-card ${className}`}>{children}</div>
}
