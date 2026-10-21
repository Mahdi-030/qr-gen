import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ADS_CONFIG, AD_SLOTS } from '../../config/ads'
import { installFakeAds, FAKE_320, FAKE_728 } from '../../test/adFixtures'
import { AdSlot } from './AdSlot'
import { AD_LOAD_TIMEOUT_MS } from './adFrame'

let restore: () => void
beforeEach(() => {
  restore = installFakeAds()
  vi.spyOn(console, 'info').mockImplementation(() => undefined)
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1280 })
})
afterEach(() => restore())

const frame = () => document.querySelector('iframe') as HTMLIFrameElement | null

/** Simulates the Adsterra loader having document.write()-ed its ad frame into our frame. */
function injectAdFrame(f: HTMLIFrameElement) {
  const doc = f.contentDocument!
  doc.body.appendChild(doc.createElement('iframe'))
}

describe('AdSlot: configuration states', () => {
  it('renders nothing when advertising is disabled, even with snippets present', () => {
    ADS_CONFIG.enabled = false
    const { container } = render(<AdSlot id="top-banner" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing in production when a slot has no snippet', () => {
    ADS_CONFIG.showPlaceholders = false
    AD_SLOTS['top-banner'].snippet = null
    AD_SLOTS['top-banner'].mobileSnippet = null
    const { container } = render(<AdSlot id="top-banner" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows a clearly labelled placeholder (never an "Advertisement") in development when unconfigured', () => {
    ADS_CONFIG.showPlaceholders = true
    AD_SLOTS['top-banner'].snippet = null
    AD_SLOTS['top-banner'].mobileSnippet = null
    render(<AdSlot id="top-banner" />)
    expect(screen.getByText('Adsterra integration not configured')).toBeInTheDocument()
    expect(screen.getByText(/not an advertisement/i)).toBeInTheDocument()
    expect(screen.queryByText('Advertisement')).not.toBeInTheDocument()
    expect(frame()).toBeNull()
  })
})

describe('AdSlot: iframe integration', () => {
  it('creates exactly one iframe whose srcdoc contains the snippet verbatim, before the body closes', () => {
    render(<AdSlot id="top-banner" />)
    expect(document.querySelectorAll('iframe')).toHaveLength(1)
    const srcdoc = frame()!.getAttribute('srcdoc')!
    expect(srcdoc).toContain(FAKE_728)
    expect(srcdoc).toMatch(/<body>.*atOptions.*<script src=.*<\/body>/s)
    expect(frame()).toHaveAttribute('width', '728')
    expect(frame()).toHaveAttribute('height', '90')
  })

  it('uses a restricted sandbox: scripts, popups and same-origin only, never top navigation or forms', () => {
    render(<AdSlot id="top-banner" />)
    const flags = frame()!.getAttribute('sandbox')!.split(' ')
    expect(flags).toEqual(expect.arrayContaining(['allow-scripts', 'allow-popups', 'allow-same-origin']))
    for (const bad of ['allow-top-navigation', 'allow-top-navigation-by-user-activation', 'allow-forms', 'allow-modals', 'allow-downloads']) {
      expect(flags).not.toContain(bad)
    }
  })

  it('drops allow-same-origin when full isolation is enabled', () => {
    ADS_CONFIG.isolateFrames = true
    render(<AdSlot id="top-banner" />)
    expect(frame()!.getAttribute('sandbox')).not.toContain('allow-same-origin')
  })

  it('sends the page URL as referrer information', () => {
    render(<AdSlot id="top-banner" />)
    expect(frame()).toHaveAttribute('referrerpolicy', 'no-referrer-when-downgrade')
  })

  it('picks the mobile unit on a narrow viewport and sizes the frame from the snippet', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 })
    render(<AdSlot id="top-banner" />)
    expect(frame()!.getAttribute('srcdoc')).toContain(FAKE_320)
    expect(frame()).toHaveAttribute('width', '320')
    expect(frame()).toHaveAttribute('height', '50')
    expect(screen.getByRole('complementary', { hidden: true })).toHaveAttribute('data-ad-variant', 'mobile')
  })

  it('does not recreate the frame or change its srcdoc on re-render or resize (no duplicate script injection)', () => {
    const { rerender } = render(<AdSlot id="top-banner" className="a" />)
    const first = frame()!
    const srcdoc = first.getAttribute('srcdoc')
    rerender(<AdSlot id="top-banner" className="b" />)
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 300 })
    window.dispatchEvent(new Event('resize'))
    rerender(<AdSlot id="top-banner" className="c" />)
    expect(frame()).toBe(first)
    expect(frame()!.getAttribute('srcdoc')).toBe(srcdoc)
    expect(document.querySelectorAll('iframe')).toHaveLength(1)
  })
})

describe('AdSlot: load, failure and cleanup', () => {
  it('hides the "Advertisement" label until the loader has injected its frame, then shows it', () => {
    vi.useFakeTimers()
    render(<AdSlot id="top-banner" />)
    expect(screen.queryByText('Advertisement')).not.toBeInTheDocument()
    const f = frame()!
    fireEvent.load(f)
    act(() => vi.advanceTimersByTime(500))
    expect(screen.queryByText('Advertisement')).not.toBeInTheDocument()
    injectAdFrame(f)
    act(() => vi.advanceTimersByTime(500))
    expect(screen.getByText('Advertisement')).toBeInTheDocument()
    expect(document.querySelector('[data-ad-state]')).toHaveAttribute('data-ad-state', 'ready')
    expect(vi.getTimerCount()).toBe(0)
  })

  it('collapses the slot when nothing is injected (blocked or failed script) and does not throw', () => {
    vi.useFakeTimers()
    render(<AdSlot id="mid-banner" />)
    fireEvent.load(frame()!)
    act(() => vi.advanceTimersByTime(AD_LOAD_TIMEOUT_MS + 1000))
    expect(document.querySelector('[data-ad-slot]')).toBeNull()
    expect(frame()).toBeNull()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('clears its polling timer on unmount', () => {
    vi.useFakeTimers()
    const { unmount } = render(<AdSlot id="footer-banner" />)
    fireEvent.load(frame()!)
    expect(vi.getTimerCount()).toBeGreaterThan(0)
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('never claims a real ad: "ready" only means the loader injected a frame', () => {
    // The component exposes no state that says an ad creative was served. Documented in AdSlot.tsx.
    render(<AdSlot id="top-banner" />)
    expect(document.querySelector('[data-ad-state]')?.getAttribute('data-ad-state')).toBe('loading')
  })
})
