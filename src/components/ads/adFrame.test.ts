import { beforeEach, describe, expect, it } from 'vitest'
import { inspectAdDocument } from './adFrame'

// The real jsdom document is used so injected iframes get a browsing context (detached documents have none).
beforeEach(() => {
  document.body.innerHTML = ''
})

function docWithFrame() {
  const f = document.createElement('iframe')
  document.body.appendChild(f)
  return { host: document, frame: f }
}

/** jsdom never loads images, so state is set explicitly. */
function img(doc: Document, o: { complete: boolean; w: number; h: number; src: string }) {
  const i = doc.createElement('img')
  Object.defineProperty(i, 'complete', { value: o.complete })
  Object.defineProperty(i, 'naturalWidth', { value: o.w })
  Object.defineProperty(i, 'naturalHeight', { value: o.h })
  Object.defineProperty(i, 'currentSrc', { value: o.src })
  return i
}

describe('inspectAdDocument', () => {
  it('none: nothing injected yet', () => {
    expect(inspectAdDocument(document).state).toBe('none')
  })

  it('empty: the loader injected a frame that holds nothing (empty ad response)', () => {
    const { host } = docWithFrame()
    expect(inspectAdDocument(host).state).toBe('empty')
  })

  it('content: a creative image larger than a tracking pixel', () => {
    const { host, frame } = docWithFrame()
    const inner = frame.contentDocument!
    inner.body.appendChild(img(inner, { complete: true, w: 728, h: 90, src: 'https://cdn.example/c.gif' }))
    expect(inspectAdDocument(host).state).toBe('content')
  })

  it('a 1x1 tracking pixel is not an ad', () => {
    const { host, frame } = docWithFrame()
    const inner = frame.contentDocument!
    inner.body.appendChild(img(inner, { complete: true, w: 1, h: 1, src: 'https://t.example/p.gif' }))
    expect(inspectAdDocument(host).state).toBe('empty')
  })

  it('empty, reporting only the HOST of a creative that failed to load (blocked CDN)', () => {
    const { host, frame } = docWithFrame()
    const inner = frame.contentDocument!
    inner.body.appendChild(img(inner, { complete: true, w: 0, h: 0, src: 'https://cdn.blocked.example/path/secret-token.gif?x=1' }))
    const r = inspectAdDocument(host)
    expect(r.state).toBe('empty')
    expect(r.failedHosts).toEqual(['cdn.blocked.example'])
    expect(JSON.stringify(r)).not.toContain('secret-token')
  })

  it('pending: the creative is still downloading', () => {
    const { host, frame } = docWithFrame()
    const inner = frame.contentDocument!
    inner.body.appendChild(img(inner, { complete: false, w: 0, h: 0, src: 'https://cdn.example/c.gif' }))
    expect(inspectAdDocument(host).state).toBe('pending')
  })

  it('unknown: a nested frame that cannot be inspected is assumed fine', () => {
    const { host, frame } = docWithFrame()
    Object.defineProperty(frame, 'contentDocument', { get: () => { throw new DOMException('blocked', 'SecurityError') } })
    expect(inspectAdDocument(host).state).toBe('unknown')
  })
})
