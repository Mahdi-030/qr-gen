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

/** How long to wait for the loader to inject its ad frame before treating the slot as empty. */
export const AD_LOAD_TIMEOUT_MS = 10_000
export const AD_POLL_MS = 400

export function buildSrcDoc(snippet: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;padding:0;background:transparent;overflow:hidden}</style></head><body>${snippet}</body></html>`
}
