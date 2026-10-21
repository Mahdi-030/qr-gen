import { ChevronDown } from 'lucide-react'
import type { FaqItem } from '../../config/faq'

export function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y divide-line rounded-3xl border border-line bg-surface shadow-card">
      {items.map((it) => (
        <details key={it.q} className="group px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg font-bold">
            <h3 className="text-base font-bold">{it.q}</h3>
            <ChevronDown className="size-5 shrink-0 text-muted transition group-open:rotate-180" aria-hidden />
          </summary>
          <p className="mt-3 leading-relaxed text-muted">{it.a}</p>
        </details>
      ))}
    </div>
  )
}
