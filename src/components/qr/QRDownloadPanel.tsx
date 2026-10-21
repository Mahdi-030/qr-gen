import { useState } from 'react'
import { Download, FileImage, FileText, Image as ImageIcon, Shapes } from 'lucide-react'
import type { ExportFormat } from '../../types/qr'
import type { Studio } from '../../hooks/useStudio'
import { EXPORT_SIZES, downloadBlob, exportBlob } from '../../lib/qrExport'
import { useToast } from '../../hooks/toastContext'
import { Button, Spinner } from '../ui/primitives'

const FORMATS: { id: ExportFormat; label: string; sub: string; Icon: typeof Download }[] = [
  { id: 'png', label: 'PNG', sub: 'Best for web', Icon: ImageIcon },
  { id: 'svg', label: 'SVG', sub: 'Vector, scalable', Icon: Shapes },
  { id: 'jpeg', label: 'JPEG', sub: 'Solid background', Icon: FileImage },
  { id: 'pdf', label: 'PDF', sub: 'Print ready', Icon: FileText },
]

export function QRDownloadPanel({ studio }: { studio: Studio }) {
  const { toast } = useToast()
  const { generated, style } = studio
  const [size, setSize] = useState<number>(1024)
  const [includeFrame, setIncludeFrame] = useState(true)
  const [jpegBg, setJpegBg] = useState('#ffffff')
  const [name, setName] = useState('my-qr-code')
  const [busy, setBusy] = useState<ExportFormat | null>(null)
  const disabled = !generated

  const run = async (format: ExportFormat) => {
    if (!generated || busy) return
    setBusy(format)
    try {
      const safe = name.trim().replace(/[^\w.-]+/g, '-').replace(/^-+|-+$/g, '') || 'my-qr-code'
      const blob = await exportBlob(format, generated.payload, style, { size, includeFrame, jpegBackground: jpegBg })
      if (!blob.size) throw new Error('The exported file was empty.')
      downloadBlob(blob, `${safe}.${format === 'jpeg' ? 'jpg' : format}`)
      toast(`${format.toUpperCase()} downloaded.`, 'success')
    } catch (e) {
      toast(`Could not export ${format.toUpperCase()}: ${e instanceof Error ? e.message : 'unknown error'}`, 'error')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-line p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-bold">
        <Download className="size-4 text-accent" aria-hidden /> Download
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {FORMATS.map(({ id, label, sub, Icon }) => (
          <Button
            key={id}
            variant={id === 'png' ? 'primary' : 'secondary'}
            disabled={disabled || busy !== null}
            onClick={() => run(id)}
            className="!justify-start !py-3 text-left"
            aria-label={`Download ${label}`}
          >
            {busy === id ? <Spinner /> : <Icon className="size-5 shrink-0" aria-hidden />}
            <span className="flex flex-col leading-tight">
              <span>{label}</span>
              <span className="text-[11px] font-medium opacity-75">{sub}</span>
            </span>
          </Button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-semibold text-muted">
          Size (PNG / JPEG / PDF)
          <select className="input mt-1 !py-2" value={size} onChange={(e) => setSize(Number(e.target.value))}>
            {EXPORT_SIZES.map((s) => (
              <option key={s} value={s}>{s} × {s} px</option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold text-muted">
          File name
          <input className="input mt-1 !py-2" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="flex items-center gap-2 text-xs font-semibold text-muted">
          <input type="color" value={jpegBg} onChange={(e) => setJpegBg(e.target.value)} className="size-8 cursor-pointer rounded-lg border border-line bg-surface p-0.5" aria-label="JPEG background colour" />
          JPEG background
        </label>
        {style.frame !== 'none' && (
          <label className="flex items-center gap-2 text-xs font-semibold text-muted">
            <input type="checkbox" className="size-4 accent-[var(--c-accent)]" checked={includeFrame} onChange={(e) => setIncludeFrame(e.target.checked)} />
            Include frame &amp; label
          </label>
        )}
      </div>
      {disabled && <p className="mt-3 text-xs text-muted">Generate a QR code to enable downloads.</p>}
    </div>
  )
}
