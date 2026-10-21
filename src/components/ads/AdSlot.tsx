import { useEffect, useMemo, useRef, useState } from 'react'
import { AD_SLOTS, ADS_CONFIG, resolveAdUnit, type AdSlotId } from '../../config/ads'
import { AD_LOAD_TIMEOUT_MS, AD_POLL_MS, SANDBOX_ISOLATED, SANDBOX_SAME_ORIGIN, buildSrcDoc } from './adFrame'

interface Props {
  id: AdSlotId
  className?: string
}

type AdSlotStatus = 'loading' | 'ready' | 'empty'

function devLog(message: string) {
  if (import.meta.env.DEV) console.info(`[ads] ${message}`)
}

/**
 * One advertising placement.
 *
 *  - Configured: mounts the owner's Adsterra snippet ONCE in its own iframe (React re-renders never recreate it).
 *    The unit (desktop or mobile) is chosen once at mount. The reserved size comes from the snippet's own `atOptions`.
 *  - Status: after the frame loads we check whether the loader injected its ad frame. "ready" means the container
 *    exists and the loader ran. It does NOT prove a creative was returned. If nothing is injected within
 *    10 s (script blocked or failed) the slot collapses so no empty "Advertisement" box is left behind.
 *  - Not configured: a labelled placeholder in development only. Nothing in production.
 */
export function AdSlot({ id, className = '' }: Props) {
  const cfg = AD_SLOTS[id]
  // Decided once per mount: re-renders and viewport resizes never swap the snippet or reload the frame.
  const [unit] = useState(() => resolveAdUnit(id, typeof window === 'undefined' ? 1280 : window.innerWidth))
  const srcDoc = useMemo(() => (unit ? buildSrcDoc(unit.snippet) : ''), [unit])
  const frameRef = useRef<HTMLIFrameElement>(null)
  const timer = useRef<number | undefined>(undefined)
  const [status, setStatus] = useState<AdSlotStatus>('loading')

  useEffect(() => () => window.clearInterval(timer.current), [])

  if (!ADS_CONFIG.enabled) return null

  if (!unit) {
    if (!ADS_CONFIG.showPlaceholders) return null
    return (
      <div className={`mx-auto w-full max-w-5xl px-4 ${className}`} data-ad-slot={id} data-ad-state="placeholder">
        <div role="note" className="flex min-h-[72px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-warn/50 bg-warn/5 px-4 py-3 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-warn">Development placeholder · not an advertisement</p>
          <p className="mt-1 text-sm font-semibold">Adsterra integration not configured</p>
          <p className="mt-0.5 text-xs text-muted">
            Slot “{id}” · {cfg.width}×{cfg.height} · {cfg.description}
          </p>
        </div>
      </div>
    )
  }

  if (status === 'empty') return null

  /** Poll the frame (same-origin only) until the loader has injected its ad frame, or give up. */
  const onLoad = () => {
    window.clearInterval(timer.current)
    const started = Date.now()
    const check = () => {
      let doc: Document | null = null
      try {
        doc = frameRef.current?.contentDocument ?? null
      } catch {
        doc = null
      }
      if (!doc) {
        // Isolated frames cannot be inspected. Keep the slot; whether an ad appeared is unknown.
        window.clearInterval(timer.current)
        setStatus('ready')
        return
      }
      const injected = doc.querySelector('iframe, ins, img, a')
      if (injected) {
        window.clearInterval(timer.current)
        devLog(`${id}: loader injected a frame (${unit.variant} ${unit.width}x${unit.height}). This does not prove an ad was returned.`)
        setStatus('ready')
      } else if (Date.now() - started > AD_LOAD_TIMEOUT_MS) {
        window.clearInterval(timer.current)
        devLog(`${id}: nothing was injected within ${AD_LOAD_TIMEOUT_MS / 1000}s. The ad script was blocked, failed, or returned nothing. Slot collapsed.`)
        setStatus('empty')
      }
    }
    timer.current = window.setInterval(check, AD_POLL_MS)
    check()
  }

  return (
    <aside className={`mx-auto w-full max-w-5xl px-4 ${className}`} aria-label="Advertisement" data-ad-slot={id} data-ad-state={status} data-ad-variant={unit.variant}>
      <p className="mb-1 h-3 text-center text-[10px] font-semibold uppercase leading-3 tracking-[0.2em] text-muted">{status === 'ready' ? 'Advertisement' : ''}</p>
      <div className="mx-auto max-w-full overflow-hidden" style={{ width: unit.width, height: unit.height }}>
        <iframe
          ref={frameRef}
          title={`Advertisement (${id})`}
          srcDoc={srcDoc}
          width={unit.width}
          height={unit.height}
          loading="lazy"
          scrolling="no"
          referrerPolicy="no-referrer-when-downgrade"
          sandbox={ADS_CONFIG.isolateFrames ? SANDBOX_ISOLATED : SANDBOX_SAME_ORIGIN}
          onLoad={onLoad}
          style={{ border: 0, display: 'block' }}
        />
      </div>
    </aside>
  )
}
