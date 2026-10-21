import { AlertTriangle, CheckCircle2, ClipboardCopy, Info, QrCode, ShieldQuestion } from 'lucide-react'
import type { Studio } from '../../hooks/useStudio'
import { useQRPreview, useScanCheck } from '../../hooks/useQRCode'
import { getScanWarnings } from '../../lib/qrRender'
import { QR_TYPES } from '../../lib/qrPayload'
import { TEMPLATES } from '../../lib/templates'
import { useToast } from '../../hooks/toastContext'
import { Button, Spinner } from '../ui/primitives'

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for non-secure contexts / denied permission.
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.setAttribute('readonly', '')
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand('copy')
      ta.remove()
      return ok
    } catch {
      return false
    }
  }
}

export function QRPreview({ studio }: { studio: Studio }) {
  const { toast } = useToast()
  const { generated, style, isGenerating, isStale } = studio
  const payload = generated?.payload ?? null
  const preview = useQRPreview(payload, style)
  const scan = useScanCheck(payload, style)
  const warnings = payload ? getScanWarnings(style, payload) : []
  const tpl = TEMPLATES.find((t) => t.id === studio.templateId)
  const typeLabel = generated ? QR_TYPES.find((t) => t.id === generated.type)?.label : null

  const copy = async () => {
    if (!payload) return
    const ok = await copyText(payload)
    toast(ok ? 'QR content copied to clipboard.' : 'Could not copy to the clipboard.', ok ? 'success' : 'error')
  }

  return (
    <div>
      <div className="relative grid min-h-[340px] place-items-center rounded-3xl bg-surface-2 p-5" aria-busy={isGenerating || preview.loading}>
        {preview.src ? (
          <img
            src={preview.src}
            alt={`Generated ${typeLabel ?? ''} QR code`}
            className={`block w-full max-w-[340px] rounded-xl transition ${preview.loading || isGenerating ? 'opacity-50' : 'opacity-100'}`}
            style={{ aspectRatio: String(preview.aspect) }}
            draggable={false}
          />
        ) : preview.error ? (
          <div role="alert" className="flex flex-col items-center gap-2 text-center text-danger">
            <AlertTriangle className="size-8" />
            <p className="max-w-xs text-sm font-medium">{preview.error}</p>
          </div>
        ) : isGenerating || preview.loading ? (
          <div className="skeleton aspect-square w-full max-w-[300px] rounded-2xl" aria-label="Generating QR code" />
        ) : (
          <div className="flex flex-col items-center gap-3 px-6 text-center">
            <span className="grid size-16 place-items-center rounded-2xl bg-accent-soft text-accent"><QrCode className="size-8" aria-hidden /></span>
            <p className="font-bold">Your QR code will appear here</p>
            <p className="max-w-[16rem] text-sm text-muted">Fill in the details, style it, then press <strong>Generate QR code</strong>.</p>
          </div>
        )}
        {(isGenerating || preview.loading) && preview.src && (
          <span className="absolute right-4 top-4 rounded-full bg-surface p-2 shadow-card text-accent"><Spinner /></span>
        )}
      </div>

      <div className="mt-4 space-y-3" aria-live="polite">
        {generated && !isGenerating && !preview.error && (
          <p className="flex items-center gap-2 text-sm font-semibold text-success">
            <CheckCircle2 className="size-4" aria-hidden /> QR code ready
          </p>
        )}
        {isStale && (
          <p className="flex items-start gap-2 rounded-xl bg-warn/10 px-3 py-2 text-sm text-warn" role="status">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
            Your inputs changed. This preview still shows the last generated code. Press Generate to update it.
          </p>
        )}
        {payload && scan === 'checking' && (
          <p className="flex items-center gap-2 text-sm text-muted"><Spinner /> Running a scan test…</p>
        )}
        {scan === 'ok' && (
          <p className="flex items-start gap-2 rounded-xl bg-success/10 px-3 py-2 text-sm text-success">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden /> Scan test passed. An independent decoder read back your exact content.
          </p>
        )}
        {scan === 'unreadable' && (
          <p className="flex items-start gap-2 rounded-xl bg-warn/10 px-3 py-2 text-sm text-warn">
            <ShieldQuestion className="mt-0.5 size-4 shrink-0" aria-hidden /> Our built-in checker could not read this style. Phones often still can, but test it with your own device before printing.
          </p>
        )}
        {scan === 'mismatch' && (
          <p role="alert" className="flex items-start gap-2 rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden /> The decoded content did not match what you entered. Try a simpler style.
          </p>
        )}
        {warnings.map((w) => (
          <p key={w.text} className={`flex items-start gap-2 rounded-xl px-3 py-2 text-sm ${w.level === 'warn' ? 'bg-warn/10 text-warn' : 'bg-accent-soft text-accent-strong'}`}>
            {w.level === 'warn' ? <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden /> : <Info className="mt-0.5 size-4 shrink-0" aria-hidden />}
            {w.text}
          </p>
        ))}
      </div>

      {generated && (
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 rounded-2xl border border-line p-4 text-sm">
          <dt className="text-muted">Type</dt>
          <dd className="text-right font-semibold">{typeLabel}</dd>
          <dt className="text-muted">Template</dt>
          <dd className="text-right font-semibold">{tpl?.name ?? 'Custom'}</dd>
          <dt className="text-muted">Style</dt>
          <dd className="text-right font-semibold capitalize">{style.dotType.replace('-', ' ')}{style.fillMode !== 'solid' ? ` · ${style.fillMode}` : ''}</dd>
          <dt className="text-muted">Data size</dt>
          <dd className="text-right font-semibold">{generated.payload.length} chars</dd>
          <dt className="text-muted">Error correction</dt>
          <dd className="text-right font-semibold">{style.logo ? 'High (H)' : generated.payload.length > 600 ? 'Medium (M)' : 'Quartile (Q)'}</dd>
        </dl>
      )}

      {generated && (
        <Button className="mt-3 w-full" onClick={copy}>
          <ClipboardCopy className="size-4" /> Copy QR content
        </Button>
      )}
    </div>
  )
}
