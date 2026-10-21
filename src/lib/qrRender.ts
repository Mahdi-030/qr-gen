import type { Options } from 'qr-code-styling'
import type { FrameId, StyleConfig } from '../types/qr'
import { MAX_PAYLOAD_CHARS } from './validation'

/** Internal drawing resolution of the QR itself (the SVG scales losslessly). */
export const QR_BASE = 600

/**
 * qr-code-styling writes each JS char as one byte (Latin-1), which garbles accented and non-Latin text.
 * Re-expressing the payload as its UTF-8 bytes (one char per byte) makes the QR contain proper UTF-8.
 * Pure-ASCII payloads are unchanged.
 */
export function toUtf8Binary(s: string): string {
  if (!Array.from(s).some((ch) => ch.charCodeAt(0) > 127)) return s
  return Array.from(new TextEncoder().encode(s), (b) => String.fromCharCode(b)).join('')
}

export function buildOptions(payload: string, s: StyleConfig): Options {
  const gradient =
    s.fillMode === 'solid'
      ? undefined
      : {
          type: s.fillMode,
          rotation: (s.gradientAngle * Math.PI) / 180,
          colorStops: [
            { offset: 0, color: s.fg1 },
            { offset: 1, color: s.fg2 },
          ],
        }
  const hasLogo = Boolean(s.logo)
  // H survives ~30% damage (needed for a centre logo). Very long payloads drop to M to limit density.
  const ecc = hasLogo ? 'H' : payload.length > 600 ? 'M' : 'Q'
  const cornerColor = s.cornerColor ?? undefined

  return {
    type: 'svg',
    width: QR_BASE,
    height: QR_BASE,
    margin: 24,
    data: toUtf8Binary(payload),
    image: s.logo ?? undefined,
    qrOptions: { errorCorrectionLevel: ecc },
    imageOptions: {
      hideBackgroundDots: s.logoHideDots,
      imageSize: s.logoSize,
      margin: s.logoMargin,
      crossOrigin: 'anonymous',
    },
    dotsOptions: { type: s.dotType, color: s.fg1, gradient },
    backgroundOptions: { color: s.bg },
    cornersSquareOptions: {
      type: s.cornerSquareType,
      color: cornerColor ?? s.fg1,
      gradient: cornerColor ? undefined : gradient,
    },
    cornersDotOptions: {
      type: s.cornerDotType,
      color: cornerColor ?? s.fg1,
      gradient: cornerColor ? undefined : gradient,
    },
  }
}

function stripXmlHeader(svg: string): string {
  return svg.replace(/<\?xml[^>]*\?>/i, '').replace(/<!DOCTYPE[^>]*>/i, '').trim()
}

export function escapeXml(v: string): string {
  return v.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c] as string)
}

export interface ComposedQR {
  svg: string
  width: number
  height: number
}

const FONT = "'Inter','Segoe UI',Helvetica,Arial,sans-serif"

function fitText(text: string, maxWidth: number, maxSize: number): number {
  // Bold caps average ≈ 0.68em per glyph plus letter-spacing.
  const est = maxWidth / (Math.max(text.length, 1) * 0.78)
  return Math.max(8, Math.min(maxSize, est))
}

/**
 * Wraps the raw QR SVG in an outer SVG, optionally adding a frame + label.
 * The QR is inlined (not an <image>), so the export stays fully vector.
 * The frame is drawn around the QR and never overlaps it.
 */
export function composeSvg(qrSvg: string, s: StyleConfig, withFrame: boolean): ComposedQR {
  const S = QR_BASE
  const inner = stripXmlHeader(qrSvg)
  const frame: FrameId = withFrame ? s.frame : 'none'
  const label = escapeXml((s.frameText || '').trim().slice(0, 28))

  if (frame === 'none' || !label) {
    return {
      width: S,
      height: S,
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" width="${S}" height="${S}">${inner}</svg>`,
    }
  }

  const pad = S * 0.06
  const W = S + pad * 2
  const bar = S * 0.19
  const col = s.frameColor
  const txt = s.frameTextColor
  const card = s.bg
  const rx = S * 0.07
  let H = 0
  let body = ''
  const textEl = (cx: number, cy: number, maxW: number, size: number, fill: string) => {
    const fs = fitText(s.frameText.trim().slice(0, 28), maxW, size)
    return `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central" font-family="${FONT}" font-weight="800" font-size="${fs.toFixed(1)}" letter-spacing="${(fs * 0.06).toFixed(1)}" fill="${fill}">${label}</text>`
  }

  if (frame === 'bottom-bar' || frame === 'top-bar') {
    H = S + pad * 2 + bar
    const top = frame === 'top-bar'
    const qy = top ? bar + pad : pad
    const cardY = top ? bar + pad * 0.5 : pad * 0.5
    const barCy = top ? bar / 2 + pad * 0.25 : S + pad * 1.5 + bar / 2
    body =
      `<rect width="${W}" height="${H}" rx="${rx}" fill="${col}"/>` +
      `<rect x="${pad * 0.5}" y="${cardY}" width="${W - pad}" height="${S + pad}" rx="${rx * 0.6}" fill="${card}"/>` +
      `<g transform="translate(${pad} ${qy})">${inner}</g>` +
      textEl(W / 2, barCy, W * 0.8, bar * 0.46, txt)
  } else if (frame === 'outline-tag') {
    const tagH = S * 0.16
    const stroke = S * 0.02
    const bodyH = S + pad * 2
    H = bodyH + tagH / 2 + stroke
    const tagW = Math.min(W * 0.86, S * 0.9)
    body =
      `<rect x="${stroke / 2}" y="${stroke / 2}" width="${W - stroke}" height="${bodyH - stroke}" rx="${rx}" fill="${card}" stroke="${col}" stroke-width="${stroke}"/>` +
      `<g transform="translate(${pad} ${pad})">${inner}</g>` +
      `<rect x="${(W - tagW) / 2}" y="${bodyH - tagH / 2}" width="${tagW}" height="${tagH}" rx="${tagH / 2}" fill="${col}"/>` +
      textEl(W / 2, bodyH, tagW * 0.84, tagH * 0.46, txt)
  } else {
    // pill
    const pillH = S * 0.15
    const gap = S * 0.04
    const stroke = S * 0.016
    const bodyH = S + pad * 2
    H = bodyH + gap + pillH
    const pillW = Math.min(W, S * 0.8)
    body =
      `<rect x="${stroke / 2}" y="${stroke / 2}" width="${W - stroke}" height="${bodyH - stroke}" rx="${rx * 1.4}" fill="${card}" stroke="${col}" stroke-width="${stroke}"/>` +
      `<g transform="translate(${pad} ${pad})">${inner}</g>` +
      `<rect x="${(W - pillW) / 2}" y="${bodyH + gap}" width="${pillW}" height="${pillH}" rx="${pillH / 2}" fill="${col}"/>` +
      textEl(W / 2, bodyH + gap + pillH / 2, pillW * 0.84, pillH * 0.46, txt)
  }

  return {
    width: W,
    height: H,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W.toFixed(2)} ${H.toFixed(2)}" width="${W.toFixed(0)}" height="${H.toFixed(0)}">${body}</svg>`,
  }
}

export function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

/* ---------- Scan reliability ---------- */

function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return null
  let h = m[1]
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  const n = parseInt(h, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export function isHexColor(v: string): boolean {
  return hexToRgb(v) !== null
}

function luminance(hex: string): number {
  const rgb = hexToRgb(hex) ?? [0, 0, 0]
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrastRatio(a: string, b: string): number {
  const la = luminance(a)
  const lb = luminance(b)
  const [hi, lo] = la > lb ? [la, lb] : [lb, la]
  return (hi + 0.05) / (lo + 0.05)
}

export interface ScanWarning {
  level: 'warn' | 'info'
  text: string
}

export function getScanWarnings(s: StyleConfig, payload: string): ScanWarning[] {
  const out: ScanWarning[] = []
  const fills = [s.fg1, ...(s.fillMode === 'solid' ? [] : [s.fg2]), ...(s.cornerColor ? [s.cornerColor] : [])]
  const worst = Math.min(...fills.map((f) => contrastRatio(f, s.bg)))
  if (worst < 2) out.push({ level: 'warn', text: 'Contrast between the QR and its background is very low. Most scanners will fail.' })
  else if (worst < 3.5) out.push({ level: 'warn', text: 'Contrast is low. Use a darker foreground or a lighter background for reliable scanning.' })
  if (luminance(s.fg1) > luminance(s.bg) + 0.05)
    out.push({ level: 'warn', text: 'Light-on-dark (inverted) codes are not read by some older scanner apps. Test before printing.' })
  if (s.logo) {
    if (s.logoSize > 0.32) out.push({ level: 'warn', text: 'The logo is large and covers a lot of the code. Reduce its size if scanning is unreliable.' })
    if (payload.length > 350) out.push({ level: 'warn', text: 'A logo plus long content makes a dense code. Shorten the content or remove the logo.' })
    out.push({ level: 'info', text: 'Maximum error correction (H) is used automatically because a logo is present.' })
  }
  if (payload.length > MAX_PAYLOAD_CHARS) out.push({ level: 'warn', text: 'The content is very long. The code will be dense and hard to scan.' })
  else if (payload.length > 700) out.push({ level: 'info', text: 'Long content creates a dense code. Print it larger for reliable scanning.' })
  if (s.dotType === 'dots' && payload.length > 300)
    out.push({ level: 'info', text: 'Round dots are harder to read on dense codes. Try Rounded or Square.' })
  return out
}
