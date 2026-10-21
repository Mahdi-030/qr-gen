import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, Moon, Sun, X } from 'lucide-react'
import { SITE } from '../../config/site'
import { Button } from '../ui/primitives'

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/#studio', label: 'QR Generator' },
  { to: '/#templates', label: 'Templates' },
  { to: '/#features', label: 'Features' },
  { to: '/faq', label: 'FAQ' },
]

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight" aria-label={`${SITE.name} home`}>
      <span className="grid size-8 place-items-center rounded-xl bg-accent text-white shadow-[0_6px_16px_-6px_var(--c-accent)]">
        <svg viewBox="0 0 24 24" className="size-4.5" fill="currentColor" aria-hidden>
          <path d="M3 3h8v8H3zm2 2v4h4V5zm8-2h8v8h-8zm2 2v4h4V5zM3 13h8v8H3zm2 2v4h4v-4zm9-2h2v2h-2zm4 0h3v3h-3zm-4 4h3v2h-3zm5 1h2v2h-2z" />
        </svg>
      </span>
      {SITE.name}
    </Link>
  )
}

export function Header({ theme, onToggleTheme }: { theme: 'light' | 'dark'; onToggleTheme: () => void }) {
  const [open, setOpen] = useState(false)
  const linkCls = 'rounded-lg px-3 py-2 text-sm font-semibold text-muted transition hover:bg-surface-2 hover:text-ink'

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) =>
            l.to.includes('#') ? (
              <Link key={l.to} to={l.to} className={linkCls}>{l.label}</Link>
            ) : (
              <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => `${linkCls} ${isActive ? '!text-ink' : ''}`}>{l.label}</NavLink>
            ),
          )}
        </nav>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleTheme}
            className="rounded-xl border border-line bg-surface p-2.5 text-muted transition hover:text-ink"
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          <Link to="/#studio" className="hidden sm:block">
            <Button variant="primary">Create QR Code</Button>
          </Link>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="rounded-xl border border-line bg-surface p-2.5 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="animate-fade-up border-t border-line bg-bg px-4 py-3 lg:hidden">
          <ul className="space-y-1">
            {LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to} onClick={() => setOpen(false)} className={`${linkCls} block`}>{l.label}</Link>
              </li>
            ))}
            <li>
              <Link to="/#studio" onClick={() => setOpen(false)}>
                <Button variant="primary" className="mt-2 w-full">Create QR Code</Button>
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}
