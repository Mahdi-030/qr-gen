import { useEffect, useMemo, useRef, useState } from 'react'
import { AD_SLOTS, ADS_CONFIG, isSlotConfigured, type AdSlotId } from '../../config/ads'

interface Props {
  id: AdSlotId
  className?: string
}

function buildSrcDoc(snippet: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;padding:0;background:transparent;overflow:hidden}</style></head><body>${snippet}</body></html>`
}

/**
 * One advertising placement.
 *
 *  - Configured (owner pasted real Adsterra code in src/config/ads.ts): mounts that code ONCE inside
 *    its own sandboxed iframe. Re-renders never rebuild the iframe, and nothing else reloads it.
 *    Ad blockers or network failures only leave this reserved box empty. The app is unaffected.
 *  - Not configured: renders a clearly labelled placeholder in development only (or when
 *    VITE_SHOW_AD_PLACEHOLDERS=true). In production the slot renders nothing.
 */
export function AdSlot({ id, className = '' }: Props) {
  const cfg = AD_SLOTS[id]
  const configured = isSlotConfigured(id)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  const srcDoc = useMemo(() => (cfg.snippet ? buildSrcDoc(cfg.snippet) : ''), [cfg.snippet])

  // Scale fixed-size ad units down to fit narrow screens, never up.
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const update = () => setScale(Math.min(1, el.clientWidth / cfg.width) || 1)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [cfg.width, configured])

  if (!ADS_CONFIG.enabled) return null

  if (!configured) {
    if (!ADS_CONFIG.showPlaceholders) return null
    return (
      <div className={`mx-auto w-full max-w-5xl px-4 ${className}`} data-ad-slot={id} data-ad-state="placeholder">
        <div
          role="note"
          className="flex min-h-[72px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-warn/50 bg-warn/5 px-4 py-3 text-center"
        >
          <p className="text-xs font-bold uppercase tracking-wider text-warn">Development placeholder · not an advertisement</p>
          <p className="mt-1 text-sm font-semibold">Adsterra integration not configured</p>
          <p className="mt-0.5 text-xs text-muted">
            Slot “{id}” · {cfg.width}×{cfg.height} · {cfg.description}
          </p>
        </div>
      </div>
    )
  }

  return (
    <aside className={`mx-auto w-full max-w-5xl px-4 ${className}`} aria-label="Advertisement" data-ad-slot={id} data-ad-state="configured">
      <p className="mb-1 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">Advertisement</p>
      <div ref={wrapRef} className="mx-auto w-full overflow-hidden" style={{ maxWidth: cfg.width, height: cfg.height * scale }}>
        <iframe
          title={`Advertisement (${id})`}
          srcDoc={srcDoc}
          width={cfg.width}
          height={cfg.height}
          loading="lazy"
          scrolling="no"
          referrerPolicy="no-referrer-when-downgrade"
          // No allow-same-origin: third-party ad code cannot reach this app's storage or DOM.
          sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
          style={{ border: 0, display: 'block', transform: `scale(${scale})`, transformOrigin: 'top left' }}
        />
      </div>
    </aside>
  )
}
