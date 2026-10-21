import { ADS_CONFIG, AD_SLOTS, type AdSlotId } from '../config/ads'

/**
 * Inert, fake ad snippets for tests. They contain no publisher keys and point at the reserved
 * `.invalid` TLD, so nothing can ever reach a real ad network.
 */
export const FAKE_728 = `<script>atOptions={'key':'TEST','format':'iframe','height':90,'width':728,'params':{}};</script><script src="https://ads.invalid/22/TEST"></script>`
export const FAKE_320 = `<script>atOptions={'key':'TEST','format':'iframe','height':50,'width':320,'params':{}};</script><script src="https://ads.invalid/22/TEST"></script>`

type Saved = { slots: Record<string, { snippet: string | null; mobileSnippet?: string | null }>; config: typeof ADS_CONFIG }

/** Replaces every slot's code with fakes and returns a function that restores the real config. */
export function installFakeAds(): () => void {
  const saved: Saved = {
    slots: Object.fromEntries(Object.entries(AD_SLOTS).map(([k, v]) => [k, { snippet: v.snippet, mobileSnippet: v.mobileSnippet }])),
    config: { ...ADS_CONFIG },
  }
  for (const id of Object.keys(AD_SLOTS) as AdSlotId[]) {
    const wide = id !== 'result-banner'
    AD_SLOTS[id].snippet = wide ? FAKE_728 : FAKE_320
    AD_SLOTS[id].mobileSnippet = wide ? FAKE_320 : undefined
  }
  return () => {
    for (const id of Object.keys(AD_SLOTS) as AdSlotId[]) {
      AD_SLOTS[id].snippet = saved.slots[id].snippet
      AD_SLOTS[id].mobileSnippet = saved.slots[id].mobileSnippet
    }
    Object.assign(ADS_CONFIG, saved.config)
  }
}
