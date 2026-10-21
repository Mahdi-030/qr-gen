import { ADS_CONFIG } from '../../config/ads'
import { AdSlot } from './AdSlot'

/**
 * The advertising action tied to a user-initiated Generate click.
 *
 * What it does: after the user's first successful Generate, it reveals the result banner below the
 * QR and download controls. The banner's script is mounted once (see AdSlot) and is NOT recreated or
 * reloaded on later Generate clicks, so impressions are never inflated.
 *
 * What it deliberately does NOT do: open popups, redirect, simulate clicks or call undocumented
 * Adsterra APIs. Interstitial / popunder / social-bar formats are page-level scripts that Adsterra
 * itself schedules (see ADSTERRA_SETUP.md). They cannot be triggered on demand from application code.
 */
export function GenerateAdExperience({ generateCount }: { generateCount: number }) {
  if (ADS_CONFIG.generateAction !== 'reveal-result-slot' || generateCount < 1) return null
  return <AdSlot id="result-banner" className="mt-4 !px-0" />
}
