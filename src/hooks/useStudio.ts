import { useCallback, useMemo, useRef, useState } from 'react'
import type { FormErrors, HistoryEntry, QRFormData, QRTemplate, QRType, StyleConfig } from '../types/qr'
import { DEFAULT_FORMS, buildPayload, summarize } from '../lib/qrPayload'
import { DEFAULT_STYLE, templateStyle } from '../lib/templates'
import { MAX_PAYLOAD_CHARS, validateForm } from '../lib/validation'
import { createQrSvg } from '../lib/qrExport'
import { useQRHistory } from './useQRHistory'
import { useToast } from './toastContext'

export interface Generated {
  payload: string
  type: QRType
  summary: string
  at: number
}

type Forms = { [K in QRType]: QRFormData[K] }

/** All state for the QR studio (editor, templates, generated result, history). */
export function useStudio() {
  const { toast } = useToast()
  const historyApi = useQRHistory()
  const [type, setTypeState] = useState<QRType>('url')
  const [forms, setForms] = useState<Forms>(() => structuredClone(DEFAULT_FORMS))
  const [errors, setErrors] = useState<FormErrors>({})
  const [style, setStyle] = useState<StyleConfig>(DEFAULT_STYLE)
  const [templateId, setTemplateId] = useState<string | null>(null)
  const [generated, setGenerated] = useState<Generated | null>(null)
  const [generateCount, setGenerateCount] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const submitted = useRef(false)
  const runId = useRef(0)

  const form = forms[type]

  const setType = useCallback((t: QRType) => {
    setTypeState(t)
    setErrors({})
    submitted.current = false
  }, [])

  const setField = useCallback(
    (key: string, value: string | boolean) => {
      setForms((prev) => {
        const nextForm = { ...prev[type], [key]: value } as Forms[QRType]
        if (submitted.current) setErrors(validateForm(type, nextForm as never))
        return { ...prev, [type]: nextForm }
      })
    },
    [type],
  )

  /** Used by the hero quick-start: switch to the URL type and prefill it. */
  const seedUrl = useCallback((url: string) => {
    setTypeState('url')
    setForms((prev) => ({ ...prev, url: { url } }))
    setErrors({})
    submitted.current = false
  }, [])

  const patchStyle = useCallback((patch: Partial<StyleConfig>) => setStyle((s) => ({ ...s, ...patch })), [])

  const applyTemplate = useCallback((t: QRTemplate) => {
    // A template restyles the code but keeps the user's logo and custom label text.
    setStyle((s) => {
      const base = templateStyle(t)
      return { ...base, logo: s.logo, logoSize: s.logoSize, logoMargin: s.logoMargin, logoHideDots: s.logoHideDots, frameText: t.style.frame ? base.frameText : s.frameText }
    })
    setTemplateId(t.id)
  }, [])

  const resetToTemplate = useCallback(
    (t: QRTemplate) => {
      setStyle((s) => ({ ...templateStyle(t), logo: s.logo }))
      setTemplateId(t.id)
      toast(`Reset to “${t.name}” defaults.`, 'info')
    },
    [toast],
  )

  const resetAll = useCallback(() => {
    runId.current++
    setForms(structuredClone(DEFAULT_FORMS))
    setStyle(DEFAULT_STYLE)
    setTemplateId(null)
    setErrors({})
    setGenerated(null)
    submitted.current = false
    toast('Everything was reset.', 'info')
  }, [toast])

  /** Validates, builds the payload, proves the QR renders, then commits the result. */
  const generate = useCallback(async (): Promise<boolean> => {
    submitted.current = true
    const errs = validateForm(type, forms[type] as never)
    setErrors(errs)
    if (Object.keys(errs).length) {
      toast('Please fix the highlighted fields.', 'error')
      return false
    }
    const payload = buildPayload(type, forms[type] as never)
    if (payload.length > MAX_PAYLOAD_CHARS) {
      toast('That content is too long to encode in a scannable QR code. Please shorten it.', 'error')
      return false
    }
    const id = ++runId.current
    setIsGenerating(true)
    try {
      await createQrSvg(payload, style) // throws if the library cannot encode it
      if (id !== runId.current) return false
      const summary = summarize(type, forms[type] as never) || type
      setGenerated({ payload, type, summary, at: Date.now() })
      setGenerateCount((c) => c + 1)
      historyApi.add({
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        type,
        form: structuredClone(forms[type]),
        style,
        templateId,
        summary,
      })
      toast('QR code generated.', 'success')
      return true
    } catch (e) {
      toast(e instanceof Error ? `Could not generate the QR code: ${e.message}` : 'Could not generate the QR code.', 'error')
      return false
    } finally {
      if (id === runId.current) setIsGenerating(false)
    }
  }, [type, forms, style, templateId, toast, historyApi])

  const restore = useCallback(
    (e: HistoryEntry) => {
      setTypeState(e.type)
      setForms((prev) => ({ ...prev, [e.type]: { ...DEFAULT_FORMS[e.type], ...e.form } }) as Forms)
      setStyle({ ...DEFAULT_STYLE, ...e.style })
      setTemplateId(e.templateId)
      setErrors({})
      submitted.current = false
      toast(e.type === 'wifi' ? 'Restored. Re-enter the Wi-Fi password (it is never saved).' : 'Restored. Click Generate to rebuild it.', 'info')
    },
    [toast],
  )

  /** True when the inputs were edited after the last Generate. */
  const isStale = useMemo(() => {
    if (!generated) return false
    if (generated.type !== type) return true
    if (Object.keys(validateForm(type, form as never)).length) return true
    return buildPayload(type, form as never) !== generated.payload
  }, [generated, type, form])

  return {
    type, setType, seedUrl, form, setField, errors,
    style, patchStyle, setStyle, templateId, applyTemplate, resetToTemplate,
    generated, isStale, generateCount, isGenerating, generate, resetAll,
    history: historyApi.history, removeHistory: historyApi.remove, clearHistory: historyApi.clear, restore,
  }
}

export type Studio = ReturnType<typeof useStudio>
