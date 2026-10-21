import { useEffect, useRef, useState } from 'react'
import type { StyleConfig } from '../types/qr'
import { createComposed } from '../lib/qrExport'
import { svgToDataUrl } from '../lib/qrRender'
import { verifyScan, type ScanCheck } from '../lib/qrExport'

export interface PreviewState {
  src: string | null
  loading: boolean
  error: string | null
  aspect: number
}

interface Result {
  payload: string
  style: StyleConfig
  src: string | null
  aspect: number
  error: string | null
}

/**
 * Renders the live preview (frame included) for a payload + style.
 * Keeps the previous image while a new one renders, and ignores stale results.
 */
export function useQRPreview(payload: string | null, style: StyleConfig, enabled = true): PreviewState {
  const [result, setResult] = useState<Result | null>(null)

  useEffect(() => {
    if (!payload || !enabled) return
    let cancelled = false
    const t = window.setTimeout(async () => {
      try {
        const c = await createComposed(payload, style, true)
        if (!cancelled) setResult({ payload, style, src: svgToDataUrl(c.svg), aspect: c.width / c.height, error: null })
      } catch (e) {
        if (!cancelled)
          setResult((r) => ({ payload, style, src: r?.src ?? null, aspect: r?.aspect ?? 1, error: e instanceof Error ? e.message : 'QR generation failed.' }))
      }
    }, 100)
    return () => {
      cancelled = true
      window.clearTimeout(t)
    }
  }, [payload, style, enabled])

  if (!payload || !enabled) return { src: null, loading: false, error: null, aspect: 1 }
  const current = result !== null && result.payload === payload && result.style === style
  return {
    src: result?.src ?? null,
    aspect: result?.aspect ?? 1,
    loading: !current,
    error: current ? result.error : null,
  }
}

/** Decodes the finished code with an independent decoder and reports whether it reads back. */
export function useScanCheck(payload: string | null, style: StyleConfig): ScanCheck | 'checking' | null {
  const [result, setResult] = useState<{ key: string; value: ScanCheck } | null>(null)
  const seq = useRef(0)
  const key = payload ? `${payload}\u0000${JSON.stringify(style)}` : ''

  useEffect(() => {
    if (!payload) return
    const id = ++seq.current
    const t = window.setTimeout(async () => {
      let value: ScanCheck = 'unreadable'
      try {
        value = await verifyScan(payload, style)
      } catch {
        value = 'unreadable'
      }
      if (id === seq.current) setResult({ key, value })
    }, 450)
    return () => window.clearTimeout(t)
  }, [payload, style, key])

  if (!payload) return null
  return result && result.key === key ? result.value : 'checking'
}
