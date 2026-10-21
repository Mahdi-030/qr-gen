import { History, RotateCcw, Trash2, X } from 'lucide-react'
import type { Studio } from '../../hooks/useStudio'
import { QR_TYPES } from '../../lib/qrPayload'
import { Button } from '../ui/primitives'

export function QRHistory({ studio }: { studio: Studio }) {
  const { history, restore, removeHistory, clearHistory } = studio
  return (
    <section aria-labelledby="history-h" className="rounded-2xl border border-line p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 id="history-h" className="flex items-center gap-2 text-sm font-bold">
          <History className="size-4 text-accent" aria-hidden /> Recent on this device
        </h3>
        {history.length > 0 && (
          <Button size="sm" variant="ghost" onClick={clearHistory}>
            <Trash2 className="size-3.5" /> Clear history
          </Button>
        )}
      </div>
      {history.length === 0 ? (
        <p className="text-sm text-muted">Nothing yet. Codes you generate are remembered here, in your browser only.</p>
      ) : (
        <ul className="space-y-2">
          {history.map((h) => (
            <li key={h.id} className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2">
              <span className="rounded-md bg-accent-soft px-1.5 py-0.5 text-[11px] font-bold uppercase text-accent-strong">{QR_TYPES.find((t) => t.id === h.type)?.label}</span>
              <span className="min-w-0 flex-1 truncate text-sm" title={h.summary}>{h.summary}</span>
              <Button size="sm" variant="ghost" onClick={() => restore(h)} aria-label={`Restore ${h.summary}`}>
                <RotateCcw className="size-3.5" /> Restore
              </Button>
              <button type="button" onClick={() => removeHistory(h.id)} className="rounded-lg p-1 text-muted hover:bg-surface hover:text-danger" aria-label={`Delete ${h.summary} from history`}>
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-xs text-muted">Saved only in this browser. Wi-Fi passwords are never saved.</p>
    </section>
  )
}
