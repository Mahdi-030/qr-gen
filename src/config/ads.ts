/**
 * Adsterra configuration.
 *
 * NOTHING here is a real publisher credential. Every `snippet` is `null` until the
 * site owner pastes the exact code Adsterra generates in the publisher dashboard
 * (Websites -> your site -> Get code). See ADSTERRA_SETUP.md.
 *
 * Banner formats (728x90, 468x60, 320x50, 300x250, 160x300/600, Native Banner) are
 * mounted here, each inside its own sandboxed iframe so that Adsterra's global
 * `atOptions` variable cannot collide between slots. A snippet is mounted ONCE per
 * page view. It is never re-injected on Generate clicks.
 *
 * Page-level formats (Social Bar, Popunder, Interstitial) are different: Adsterra's
 * own script decides when they show. They go in index.html (see ADSTERRA_SETUP.md).
 * They cannot be triggered on demand and this app does not try to.
 */

export type AdSlotId = 'top-banner' | 'mid-banner' | 'result-banner' | 'footer-banner'

export interface AdSlotConfig {
  id: AdSlotId
  /** Human-readable description for dev placeholders and docs. */
  description: string
  /** Reserved size in CSS px. Must match the unit created in Adsterra. Prevents layout shift. */
  width: number
  height: number
  /**
   * Exact HTML snippet from Adsterra (the script tags, including the atOptions block
   * for banners, or the container + script for Native Banner). `null` = not configured.
   */
  snippet: string | null
}

export const AD_SLOTS: Record<AdSlotId, AdSlotConfig> = {
  'top-banner': {
    id: 'top-banner',
    description: 'Responsive banner near the top of the main content (e.g. 728x90)',
    width: 728,
    height: 90,
    snippet: null, // TODO(owner): paste Adsterra banner code here
  },
  'mid-banner': {
    id: 'mid-banner',
    description: 'Banner between the QR editor and the lower content (e.g. 728x90)',
    width: 728,
    height: 90,
    snippet: null, // TODO(owner): paste Adsterra banner code here
  },
  'result-banner': {
    id: 'result-banner',
    description: 'Banner below the generated QR and download controls (e.g. 300x250)',
    width: 300,
    height: 250,
    snippet: null, // TODO(owner): paste Adsterra banner code here
  },
  'footer-banner': {
    id: 'footer-banner',
    description: 'Responsive footer banner (e.g. 728x90)',
    width: 728,
    height: 90,
    snippet: null, // TODO(owner): paste Adsterra banner code here
  },
}

export const ADS_CONFIG = {
  /** Master switch. false removes every ad slot (and placeholder) from the UI. */
  enabled: true,
  /**
   * Show the "Adsterra integration not configured" placeholder for slots with no snippet.
   * Defaults to development only. Set VITE_SHOW_AD_PLACEHOLDERS=true to force it on in a build.
   */
  showPlaceholders: import.meta.env.DEV || import.meta.env.VITE_SHOW_AD_PLACEHOLDERS === 'true',
  /**
   * What a user-initiated Generate click does for ads:
   *  - 'reveal-result-slot': the first time the user generates, the result banner under the
   *    QR is shown. Its script is mounted once, not once per click.
   *  - 'none': Generate never touches ads.
   */
  generateAction: 'reveal-result-slot' as 'reveal-result-slot' | 'none',
}

/** True when a slot has real owner-supplied code. */
export function isSlotConfigured(id: AdSlotId): boolean {
  const s = AD_SLOTS[id].snippet
  return Boolean(s && s.trim())
}
