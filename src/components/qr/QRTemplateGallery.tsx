import { useMemo, useState } from 'react'
import { Check, RotateCcw, Search, Star } from 'lucide-react'
import type { QRTemplate, TemplateCategory } from '../../types/qr'
import { TEMPLATES, templateStyle } from '../../lib/templates'
import type { Studio } from '../../hooks/useStudio'
import { useFavorites } from '../../hooks/useTheme'
import { useToast } from '../../hooks/toastContext'
import { Button } from '../ui/primitives'
import { MiniQR } from './MiniQR'

const SAMPLE = 'https://example.com'
type Filter = 'All' | 'Favorites' | TemplateCategory
const FILTERS: Filter[] = ['All', 'Favorites', 'Minimal', 'Business', 'Colorful', 'Creative', 'Social']

export function QRTemplateGallery({ studio }: { studio: Studio }) {
  const { toast } = useToast()
  const { favorites, toggleFavorite } = useFavorites()
  const [filter, setFilter] = useState<Filter>('All')
  const [query, setQuery] = useState('')

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return TEMPLATES.filter((t) => {
      if (filter === 'Favorites' && !favorites.includes(t.id)) return false
      if (filter !== 'All' && filter !== 'Favorites' && t.category !== filter) return false
      return !q || t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
    })
  }, [filter, query, favorites])

  const selected = TEMPLATES.find((t) => t.id === studio.templateId) ?? null

  const choose = (t: QRTemplate) => {
    studio.applyTemplate(t)
    toast(`“${t.name}” applied to the studio.`, 'success')
    document.getElementById('studio')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section id="templates" aria-labelledby="templates-h" className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="templates-h" className="text-3xl font-extrabold tracking-tight">Start from a template</h2>
          <p className="mt-2 max-w-xl text-muted">Every preview below is a real, scannable QR code. Pick one and it fills the studio instantly.</p>
        </div>
        {selected && (
          <Button onClick={() => studio.resetToTemplate(selected)}>
            <RotateCcw className="size-4" /> Reset to “{selected.name}”
          </Button>
        )}
      </div>

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div role="tablist" aria-label="Template categories" className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${filter === f ? 'border-accent bg-accent text-white' : 'border-line bg-surface text-muted hover:text-ink'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative md:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <input type="search" aria-label="Search templates" placeholder="Search templates…" value={query} onChange={(e) => setQuery(e.target.value)} className="input !pl-9" />
        </div>
      </div>

      {list.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line py-16 text-center text-muted">
          {filter === 'Favorites' ? 'No favourites yet. Tap the star on a template to save it here.' : 'No templates match your search.'}
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {list.map((t) => {
            const active = t.id === studio.templateId
            const fav = favorites.includes(t.id)
            return (
              <li key={t.id} className={`group relative rounded-3xl border bg-surface p-3 shadow-card transition hover:-translate-y-1 ${active ? 'border-accent ring-2 ring-accent/30' : 'border-line'}`}>
                <button
                  type="button"
                  onClick={() => toggleFavorite(t.id)}
                  aria-pressed={fav}
                  aria-label={fav ? `Remove ${t.name} from favourites` : `Save ${t.name} to favourites`}
                  className="absolute right-3 top-3 z-10 rounded-full bg-surface/90 p-1.5 shadow-sm hover:bg-accent-soft"
                >
                  <Star className={`size-4 ${fav ? 'fill-warn text-warn' : 'text-muted'}`} />
                </button>
                <button type="button" onClick={() => choose(t)} className="block w-full text-left" aria-pressed={active}>
                  <div className="grid aspect-square place-items-center overflow-hidden rounded-2xl bg-surface-2 p-3">
                    <MiniQR payload={SAMPLE} style={templateStyle(t)} size={150} label={`${t.name} template preview`} />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2 px-1">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{t.name}</p>
                      <p className="text-xs text-muted">{t.category}</p>
                    </div>
                    {active && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-bold text-accent-strong">
                        <Check className="size-3" /> Selected
                      </span>
                    )}
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
