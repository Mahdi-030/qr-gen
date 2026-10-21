import type { ExportFormat, StyleConfig } from '../types/qr'
import { buildOptions, composeSvg, type ComposedQR } from './qrRender'

export const EXPORT_SIZES = [512, 1024, 2048, 4096] as const

/** Creates the raw (unframed) QR SVG markup using qr-code-styling. Loaded lazily. */
export async function createQrSvg(payload: string, style: StyleConfig): Promise<string> {
  const { default: QRCodeStyling } = await import('qr-code-styling')
  const qr = new QRCodeStyling(buildOptions(payload, style))
  const raw = await qr.getRawData('svg')
  if (!raw) throw new Error('The QR library returned no data.')
  return await (raw as Blob).text()
}

export async function createComposed(payload: string, style: StyleConfig, withFrame: boolean): Promise<ComposedQR> {
  const qrSvg = await createQrSvg(payload, style)
  return composeSvg(qrSvg, style, withFrame)
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not rasterize the QR image.'))
    img.src = src
  })
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Canvas export failed.'))), type, quality)
  })
}

/** Rasterizes composed SVG to a canvas whose width equals `size` px. */
export async function rasterize(composed: ComposedQR, size: number, background: string | null): Promise<HTMLCanvasElement> {
  const scale = size / composed.width
  const w = Math.round(size)
  const h = Math.round(composed.height * scale)
  // Re-size the root element so the vector is rasterized directly at the target resolution.
  const sized = composed.svg.replace(/^<svg([^>]*?) width="[^"]*" height="[^"]*"/, `<svg$1 width="${w}" height="${h}"`)
  const img = await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(sized)}`)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not available in this browser.')
  if (background) {
    ctx.fillStyle = background
    ctx.fillRect(0, 0, w, h)
  }
  ctx.drawImage(img, 0, 0, w, h)
  return canvas
}

export interface ExportOptions {
  size: number
  includeFrame: boolean
  jpegBackground: string
}

export async function exportBlob(
  format: ExportFormat,
  payload: string,
  style: StyleConfig,
  opts: ExportOptions,
): Promise<Blob> {
  const composed = await createComposed(payload, style, opts.includeFrame)
  switch (format) {
    case 'svg':
      return new Blob([`<?xml version="1.0" encoding="UTF-8"?>\n${composed.svg}`], { type: 'image/svg+xml' })
    case 'png':
      return canvasToBlob(await rasterize(composed, opts.size, null), 'image/png')
    case 'jpeg':
      return canvasToBlob(await rasterize(composed, opts.size, opts.jpegBackground), 'image/jpeg', 0.95)
    case 'pdf': {
      // 300 dpi print size on a page with a 15 mm margin.
      const canvas = await rasterize(composed, opts.size, '#ffffff')
      const mm = (px: number) => (px / 300) * 25.4
      const imgW = mm(canvas.width)
      const imgH = mm(canvas.height)
      const margin = 15
      const { jsPDF } = await import('jspdf')
      const pdf = new jsPDF({
        unit: 'mm',
        format: [imgW + margin * 2, imgH + margin * 2],
        orientation: imgW >= imgH ? 'landscape' : 'portrait',
        compress: true,
      })
      pdf.setProperties({ title: 'QR Code', creator: 'QRForge' })
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', margin, margin, imgW, imgH, undefined, 'FAST')
      return pdf.output('blob')
    }
  }
}

/** Safe download through a short-lived object URL. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 4000)
}

export type ScanCheck = 'ok' | 'mismatch' | 'unreadable'

/** Decodes the rendered QR with an independent decoder (jsQR) to confirm it reads back correctly. */
export async function verifyScan(payload: string, style: StyleConfig): Promise<ScanCheck> {
  const [{ default: jsQR }, composed] = await Promise.all([import('jsqr'), createComposed(payload, style, false)])
  const canvas = await rasterize(composed, 700, '#ffffff')
  const ctx = canvas.getContext('2d')
  if (!ctx) return 'unreadable'
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const res = jsQR(data.data, data.width, data.height, { inversionAttempts: 'attemptBoth' })
  if (!res) return 'unreadable'
  const norm = (s: string) => s.replace(/\r\n/g, '\n')
  return norm(res.data) === norm(payload) ? 'ok' : 'mismatch'
}

/** Reads an uploaded logo, rasterizes it to a bounded PNG (also neutralises SVG content). */
export function readLogoFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read that file.'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('That image could not be decoded. Try a different file.'))
      img.onload = () => {
        const max = 512
        const ratio = Math.min(1, max / Math.max(img.naturalWidth || max, img.naturalHeight || max))
        const w = Math.max(1, Math.round((img.naturalWidth || max) * ratio))
        const h = Math.max(1, Math.round((img.naturalHeight || max) * ratio))
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('Canvas is not available.'))
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/png'))
      }
      img.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  })
}
