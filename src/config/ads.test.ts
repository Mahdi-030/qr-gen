import { describe, expect, it, vi } from 'vitest'
import { ADS_CONFIG, AD_SLOTS, isSlotConfigured, parseUnitSize, resolveAdUnit, type AdSlotId } from './ads'

const IDS = Object.keys(AD_SLOTS) as AdSlotId[]

describe('real ad configuration (structure only, keys are never asserted or printed)', () => {
  it('has advertising enabled', () => {
    expect(ADS_CONFIG.enabled).toBe(true)
  })

  it.each(IDS)('%s contains a complete banner snippet', (id) => {
    const s = AD_SLOTS[id].snippet ?? ''
    expect(isSlotConfigured(id)).toBe(true)
    expect(s).toMatch(/atOptions\s*=/)
    expect(s).toMatch(/<script src="https:\/\/[^"]+"><\/script>/)
    expect(s).not.toMatch(/TODO|YOUR_|PLACEHOLDER/i)
    // atOptions must be defined before the invoke script, which reads it synchronously.
    expect(s.indexOf('atOptions')).toBeLessThan(s.indexOf('<script src='))
  })

  it.each(IDS)('%s snippet size matches the fallback size in the config', (id) => {
    const parsed = parseUnitSize(AD_SLOTS[id].snippet ?? '')
    expect(parsed).toEqual({ width: AD_SLOTS[id].width, height: AD_SLOTS[id].height })
  })

  it('result banner is sized to its own unit (regression: 300x250 box around a 320x50 ad)', () => {
    expect(resolveAdUnit('result-banner', 1280)).toMatchObject({ width: 320, height: 50 })
  })

  it('uses the mobile unit below the breakpoint and the default unit at or above it', () => {
    for (const id of ['top-banner', 'mid-banner', 'footer-banner'] as const) {
      expect(resolveAdUnit(id, ADS_CONFIG.desktopMinWidth - 1)).toMatchObject({ variant: 'mobile', width: 320, height: 50 })
      expect(resolveAdUnit(id, ADS_CONFIG.desktopMinWidth)).toMatchObject({ variant: 'default', width: 728, height: 90 })
    }
    expect(resolveAdUnit('result-banner', 320)).toMatchObject({ variant: 'default' })
  })

  it('does not enable dev placeholders in a production build', async () => {
    vi.stubEnv('DEV', false)
    vi.stubEnv('VITE_SHOW_AD_PLACEHOLDERS', '')
    vi.resetModules()
    const prod = await import('./ads')
    expect(prod.ADS_CONFIG.showPlaceholders).toBe(false)
    vi.stubEnv('VITE_SHOW_AD_PLACEHOLDERS', 'true')
    vi.resetModules()
    expect((await import('./ads')).ADS_CONFIG.showPlaceholders).toBe(true)
    vi.unstubAllEnvs()
  })

  it('keeps full isolation as an explicit opt-in, off by default', () => {
    expect(ADS_CONFIG.isolateFrames).toBe(false)
  })
})

describe('parseUnitSize', () => {
  it('reads quoted and unquoted atOptions keys', () => {
    expect(parseUnitSize(`atOptions = { 'height' : 60, 'width' : 468 }`)).toEqual({ width: 468, height: 60 })
    expect(parseUnitSize(`atOptions = { height: 250, "width": 300 }`)).toEqual({ width: 300, height: 250 })
  })
  it('returns null when there is no size', () => {
    expect(parseUnitSize('<div id="container-abc"></div><script src="x"></script>')).toBeNull()
  })
})

describe('missing snippets', () => {
  it('resolveAdUnit returns null for a null, empty or whitespace snippet', () => {
    const slot = AD_SLOTS['top-banner']
    const saved = { s: slot.snippet, m: slot.mobileSnippet }
    for (const v of [null, '', '   \n']) {
      slot.snippet = v
      slot.mobileSnippet = v
      expect(isSlotConfigured('top-banner')).toBe(false)
      expect(resolveAdUnit('top-banner', 1280)).toBeNull()
      expect(resolveAdUnit('top-banner', 300)).toBeNull()
    }
    slot.snippet = saved.s
    slot.mobileSnippet = saved.m
  })
})
