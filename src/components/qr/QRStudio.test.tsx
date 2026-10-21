import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { installFakeAds } from '../../test/adFixtures'
import { useStudio } from '../../hooks/useStudio'
import { ToastProvider } from '../ui/ToastProvider'
import { QRStudio } from './QRStudio'

// The QR engine is mocked: these tests are about the Generate / ad / download flow, not rendering pixels.
const engine = vi.hoisted(() => ({
  createQrSvg: vi.fn(async () => '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"/>'),
  exportBlob: vi.fn(async () => new Blob(['x'], { type: 'image/png' })),
  downloadBlob: vi.fn(),
}))
vi.mock('../../lib/qrExport', () => ({
  EXPORT_SIZES: [512, 1024, 2048, 4096],
  createQrSvg: engine.createQrSvg,
  createComposed: vi.fn(async () => ({ svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600"/>', width: 600, height: 600 })),
  exportBlob: engine.exportBlob,
  downloadBlob: engine.downloadBlob,
  verifyScan: vi.fn(async () => 'ok'),
  readLogoFile: vi.fn(),
}))

function Harness() {
  const studio = useStudio()
  return <QRStudio studio={studio} />
}

let restore: () => void
beforeEach(() => {
  restore = installFakeAds()
  vi.spyOn(console, 'info').mockImplementation(() => undefined)
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1280 })
  engine.createQrSvg.mockClear()
  engine.exportBlob.mockClear()
  engine.downloadBlob.mockClear()
  localStorage.clear()
})
afterEach(() => restore())

const mount = () =>
  render(
    <ToastProvider>
      <Harness />
    </ToastProvider>,
  )
const generateButton = () => screen.getByRole('button', { name: /generate qr code/i })
const resultSlot = () => document.querySelector('[data-ad-slot="result-banner"]')
const typeUrl = (v: string) => fireEvent.change(screen.getByLabelText('Website address'), { target: { value: v } })
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

describe('Generate flow and the result banner', () => {
  it('an invalid click shows an error, makes no QR and does not reveal the result banner', async () => {
    mount()
    fireEvent.click(generateButton())
    expect(await screen.findByText('Enter a website address.')).toBeInTheDocument()
    expect(engine.createQrSvg).not.toHaveBeenCalled()
    expect(resultSlot()).toBeNull()
    expect(screen.queryByText('QR code ready')).not.toBeInTheDocument()
  })

  it('a valid click generates the QR and reveals the result banner exactly once', async () => {
    mount()
    expect(resultSlot()).toBeNull()
    typeUrl('https://example.com')
    fireEvent.click(generateButton())
    expect(await screen.findByText('QR code ready')).toBeInTheDocument()
    expect(engine.createQrSvg).toHaveBeenCalledTimes(1)
    expect(resultSlot()).not.toBeNull()
    expect(resultSlot()!.querySelectorAll('iframe')).toHaveLength(1)
  })

  it('repeated Generate clicks (including a double-click) never recreate the ad frame', async () => {
    mount()
    typeUrl('https://example.com')
    const btn = generateButton()
    fireEvent.click(btn)
    fireEvent.submit(btn.closest('form')!) // a second submit while the first is running must be ignored
    await screen.findByText('QR code ready')
    expect(engine.createQrSvg).toHaveBeenCalledTimes(1)
    const frame = resultSlot()!.querySelector('iframe')!
    const srcdoc = frame.getAttribute('srcdoc')
    for (let i = 0; i < 3; i++) {
      await wait(450) // outlast the short post-success lock
      fireEvent.click(generateButton())
      await waitFor(() => expect(engine.createQrSvg).toHaveBeenCalledTimes(i + 2))
    }
    expect(document.querySelectorAll('[data-ad-slot="result-banner"] iframe')).toHaveLength(1)
    expect(resultSlot()!.querySelector('iframe')).toBe(frame)
    expect(frame.getAttribute('srcdoc')).toBe(srcdoc)
  })

  it('a failed generation does not reveal the banner or show success', async () => {
    engine.createQrSvg.mockRejectedValueOnce(new Error('encoder exploded'))
    mount()
    typeUrl('https://example.com')
    fireEvent.click(generateButton())
    expect(await screen.findByText(/could not generate the qr code: encoder exploded/i)).toBeInTheDocument()
    expect(resultSlot()).toBeNull()
    expect(screen.queryByText('QR code ready')).not.toBeInTheDocument()
  })
})

describe('QR functionality is independent of advertising', () => {
  it('downloads work while the ad frame is stuck loading, blocked or broken', async () => {
    mount()
    typeUrl('https://example.com')
    fireEvent.click(generateButton())
    await screen.findByText('QR code ready')
    // The ad frame never loads here (no network in tests), which is the same as a blocked script.
    expect(resultSlot()!.getAttribute('data-ad-state')).toBe('loading')
    const png = screen.getByRole('button', { name: 'Download PNG' })
    expect(png).toBeEnabled()
    fireEvent.click(png)
    await waitFor(() => expect(engine.downloadBlob).toHaveBeenCalledTimes(1))
    expect(engine.exportBlob).toHaveBeenCalledWith('png', 'https://example.com', expect.anything(), expect.objectContaining({ size: 1024 }))
    expect(engine.downloadBlob.mock.calls[0][1]).toBe('my-qr-code.png')
  })

  it('an error event inside the ad frame cannot break the app', async () => {
    mount()
    typeUrl('https://example.com')
    fireEvent.click(generateButton())
    await screen.findByText('QR code ready')
    const frame = resultSlot()!.querySelector('iframe')!
    expect(() => {
      fireEvent.error(frame)
      frame.dispatchEvent(new ErrorEvent('error', { message: 'third-party script blew up' }))
    }).not.toThrow()
    expect(screen.getByRole('button', { name: 'Download SVG' })).toBeEnabled()
  })
})
