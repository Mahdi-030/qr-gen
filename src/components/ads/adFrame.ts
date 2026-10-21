/**
 * Frame permissions.
 *
 * Default ("same-origin"): `allow-same-origin` lets the ad code run as part of this site's origin. Adsterra then
 * sees the real page as the Referer and can use cookies and storage, like a banner pasted directly into the page.
 * Without it the frame has an opaque origin: the ad request carries NO Referer and storage/cookie access throws
 * (measured in Chromium, see ADSTERRA_SETUP.md). The sandbox still blocks top-level navigation, forms, modals and
 * downloads. Scripts allowed to run with `allow-same-origin` can in principle remove the sandbox or read this
 * site's browser storage, so only the owner's own Adsterra snippets may be placed in `src/config/ads.ts`.
 *
 * `ADS_CONFIG.isolateFrames = true` restores fully isolated frames.
 */
export const SANDBOX_SAME_ORIGIN = 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox'
export const SANDBOX_ISOLATED = 'allow-scripts allow-popups allow-popups-to-escape-sandbox'

/**
 * How long to wait for a creative to appear before treating the slot as empty. Generous on purpose: VPN and proxy
 * routes add latency, and a slot is only removed when nothing has rendered by then.
 */
export const AD_LOAD_TIMEOUT_MS = 15_000
export const AD_POLL_MS = 400

export function buildSrcDoc(snippet: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;padding:0;background:transparent;overflow:hidden}</style></head><body>${snippet}</body></html>`
}

/**
 * What the ad frame contains right now.
 *  - none: the loader has not injected anything yet
 *  - pending: a frame exists and a creative is still downloading
 *  - empty: a frame exists but holds no creative (empty response, or its image failed to load)
 *  - content: a creative is rendered (an image larger than a 1x1 tracking pixel, or media)
 *  - unknown: the ad runs in a cross-origin frame that cannot be inspected, so assume it is fine
 * An HTTP 200 from the ad server proves none of these. Only "content" means something is visible.
 */
export type AdContentState = 'none' | 'pending' | 'empty' | 'content' | 'unknown'

export interface AdInspection {
  state: AdContentState
  /** Hosts of creatives that failed to load (for example blocked by a DNS filter). Host names only. */
  failedHosts: string[]
}

function hostOf(url: string): string | null {
  try {
    return new URL(url).host || null
  } catch {
    return null
  }
}

/** Inspects the (same-origin) ad document and the frames the loader injected into it. Never throws. */
export function inspectAdDocument(root: Document): AdInspection {
  const failed = new Set<string>()
  let pending = false
  let unknown = false
  let frames = 0
  let images = 0

  const scan = (doc: Document, depth: number): boolean => {
    let found = false
    for (const img of Array.from(doc.images)) {
      images++
      if (!img.complete) pending = true
      else if (img.naturalWidth > 1 && img.naturalHeight > 1) found = true
      else if (img.naturalWidth === 0) {
        const h = hostOf(img.currentSrc || img.src)
        if (h) failed.add(h)
      }
    }
    if (doc.querySelector('video, object, embed')) found = true
    if (depth < 4) {
      for (const f of Array.from(doc.querySelectorAll('iframe'))) {
        frames++
        let inner: Document | null = null
        try {
          inner = f.contentDocument
        } catch {
          inner = null
        }
        if (!inner) unknown = true
        else if (scan(inner, depth + 1)) found = true
      }
    }
    return found
  }

  const found = scan(root, 0)
  const failedHosts = [...failed]
  if (found) return { state: 'content', failedHosts }
  if (unknown) return { state: 'unknown', failedHosts }
  if (pending) return { state: 'pending', failedHosts }
  if (frames === 0 && images === 0) return { state: 'none', failedHosts }
  return { state: 'empty', failedHosts }
}
