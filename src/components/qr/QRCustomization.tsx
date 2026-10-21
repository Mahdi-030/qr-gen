import { useRef, useState } from 'react'
import type { CornerDotType, CornerSquareType, DotType } from 'qr-code-styling'
import { ArrowLeftRight, ImagePlus, Trash2 } from 'lucide-react'
import type { FillMode, FrameId, StyleConfig } from '../../types/qr'
import { Button, Collapsible, Field, InfoTip, Segmented } from '../ui/primitives'
import { FRAME_PRESETS } from '../../lib/templates'
import { isHexColor } from '../../lib/qrRender'
import { readLogoFile } from '../../lib/qrExport'
import { validateImageFile } from '../../lib/validation'
import { useToast } from '../../hooks/toastContext'

const DOTS: { value: DotType; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'dots', label: 'Dots' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'extra-rounded', label: 'Extra rounded' },
  { value: 'classy', label: 'Classy' },
  { value: 'classy-rounded', label: 'Classy rounded' },
]
const CORNER_SQUARES: { value: CornerSquareType; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'extra-rounded', label: 'Extra rounded' },
  { value: 'dot', label: 'Circle' },
  { value: 'classy', label: 'Classy' },
]
const CORNER_DOTS: { value: CornerDotType; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'dot', label: 'Dot' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'extra-rounded', label: 'Extra rounded' },
  { value: 'classy-rounded', label: 'Classy' },
]
const FRAMES: { value: FrameId; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'bottom-bar', label: 'Bottom bar' },
  { value: 'top-bar', label: 'Top bar' },
  { value: 'outline-tag', label: 'Outline tag' },
  { value: 'pill', label: 'Pill' },
]
const PRESETS: { name: string; fg1: string; fg2: string; bg: string; mode: FillMode }[] = [
  { name: 'Classic', fg1: '#000000', fg2: '#000000', bg: '#ffffff', mode: 'solid' },
  { name: 'Navy', fg1: '#0f1535', fg2: '#6d4aff', bg: '#ffffff', mode: 'solid' },
  { name: 'Royal blue', fg1: '#1d4ed8', fg2: '#0ea5e9', bg: '#ffffff', mode: 'linear' },
  { name: 'Violet pink', fg1: '#6d28d9', fg2: '#db2777', bg: '#ffffff', mode: 'linear' },
  { name: 'Emerald', fg1: '#065f46', fg2: '#059669', bg: '#f0fdf4', mode: 'linear' },
  { name: 'Sunset', fg1: '#b91c1c', fg2: '#ea580c', bg: '#fffbeb', mode: 'linear' },
  { name: 'Gold', fg1: '#7a5c0a', fg2: '#3b2f06', bg: '#fffbeb', mode: 'linear' },
  { name: 'Ocean', fg1: '#0369a1', fg2: '#0f172a', bg: '#ecfeff', mode: 'radial' },
]

function ColorField({ label, value, onChange, tip }: { label: string; value: string; onChange: (v: string) => void; tip?: string }) {
  // While typing we show the draft; otherwise the committed value (so presets/reverse update the field).
  const [draft, setDraft] = useState<string | null>(null)
  const text = draft ?? value
  const valid = isHexColor(text)
  return (
    <Field label={label} tip={tip} error={valid ? undefined : 'Use a HEX colour like #6d4aff'}>
      {(p) => (
        <div className="flex items-center gap-2">
          <input
            type="color"
            aria-label={`${label} colour picker`}
            value={isHexColor(value) && value.length === 7 ? value : '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="size-10 shrink-0 cursor-pointer rounded-xl border border-line bg-surface p-1"
          />
          <input
            {...p}
            className="input font-mono uppercase"
            value={text}
            maxLength={7}
            spellCheck={false}
            onBlur={() => setDraft(null)}
            onChange={(e) => {
              const v = e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`
              setDraft(v)
              if (/^#[0-9a-f]{6}$/i.test(v)) onChange(v.toLowerCase())
            }}
          />
        </div>
      )}
    </Field>
  )
}

function Range({ label, value, min, max, step, onChange, format, tip }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; format: (v: number) => string; tip?: string }) {
  return (
    <Field label={`${label}: ${format(value)}`} tip={tip}>
      {(p) => <input {...p} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="h-2 w-full cursor-pointer accent-[var(--c-accent)]" />}
    </Field>
  )
}

interface Props {
  style: StyleConfig
  patch: (p: Partial<StyleConfig>) => void
}

export function QRCustomization({ style, patch }: Props) {
  const { toast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  const onFile = async (file: File | undefined) => {
    if (!file) return
    const err = validateImageFile(file)
    if (err) return toast(err, 'error')
    setBusy(true)
    try {
      patch({ logo: await readLogoFile(file) })
      toast('Logo added. Error correction was raised to High.', 'success')
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Could not use that image.', 'error')
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="space-y-3">
      <Collapsible title="Pattern & corners" defaultOpen>
        <div>
          <p className="mb-2 text-sm font-semibold">Dot style</p>
          <Segmented label="Dot style" value={style.dotType} options={DOTS} onChange={(v) => patch({ dotType: v })} />
        </div>
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
            Corner frame <InfoTip text="The large squares in three corners of the code (finder patterns)." />
          </p>
          <Segmented label="Corner frame style" value={style.cornerSquareType} options={CORNER_SQUARES} onChange={(v) => patch({ cornerSquareType: v })} columns="grid-cols-3 sm:grid-cols-5" />
        </div>
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
            Corner dot <InfoTip text="The small accent inside each corner frame." />
          </p>
          <Segmented label="Corner dot style" value={style.cornerDotType} options={CORNER_DOTS} onChange={(v) => patch({ cornerDotType: v })} columns="grid-cols-3 sm:grid-cols-5" />
        </div>
      </Collapsible>

      <Collapsible title="Colors & gradient">
        <div>
          <p className="mb-2 text-sm font-semibold">Presets</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Colour presets">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                title={p.name}
                aria-label={`${p.name} colour preset`}
                onClick={() => patch({ fg1: p.fg1, fg2: p.fg2, bg: p.bg, fillMode: p.mode, cornerColor: null })}
                className="size-9 rounded-xl border border-line transition hover:scale-110"
                style={{ background: `linear-gradient(135deg, ${p.fg1} 50%, ${p.bg} 50%)` }}
              />
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold">Fill</p>
          <Segmented<FillMode>
            label="Fill type"
            value={style.fillMode}
            options={[
              { value: 'solid', label: 'Solid' },
              { value: 'linear', label: 'Linear gradient' },
              { value: 'radial', label: 'Radial gradient' },
            ]}
            onChange={(v) => patch({ fillMode: v })}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ColorField label={style.fillMode === 'solid' ? 'Foreground' : 'Gradient start'} value={style.fg1} onChange={(v) => patch({ fg1: v })} />
          {style.fillMode !== 'solid' && <ColorField label="Gradient end" value={style.fg2} onChange={(v) => patch({ fg2: v })} />}
          <ColorField label="Background" value={style.bg} onChange={(v) => patch({ bg: v })} />
        </div>
        {style.fillMode === 'linear' && (
          <Range label="Gradient angle" value={style.gradientAngle} min={0} max={360} step={15} format={(v) => `${v}°`} onChange={(v) => patch({ gradientAngle: v })} />
        )}
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm" onClick={() => patch({ fg1: style.bg, bg: style.fg1, fillMode: 'solid', cornerColor: null })}>
            <ArrowLeftRight className="size-3.5" /> Reverse colours
          </Button>
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              className="size-4 accent-[var(--c-accent)]"
              checked={style.cornerColor !== null}
              onChange={(e) => patch({ cornerColor: e.target.checked ? style.fg1 : null })}
            />
            Different corner colour
          </label>
        </div>
        {style.cornerColor !== null && <ColorField label="Corner colour" value={style.cornerColor} onChange={(v) => patch({ cornerColor: v })} />}
      </Collapsible>

      <Collapsible title="Logo">
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/svg+xml" className="sr-only" id="logo-file" onChange={(e) => onFile(e.target.files?.[0])} />
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => fileRef.current?.click()} disabled={busy}>
            <ImagePlus className="size-4" /> {style.logo ? 'Replace logo' : 'Upload logo'}
          </Button>
          {style.logo && (
            <>
              <img src={style.logo} alt="Uploaded logo preview" className="size-10 rounded-lg border border-line bg-[repeating-conic-gradient(#0001_0_25%,transparent_0_50%)] bg-[length:10px_10px] object-contain" />
              <Button variant="danger" onClick={() => patch({ logo: null })}>
                <Trash2 className="size-4" /> Remove
              </Button>
            </>
          )}
        </div>
        <p className="text-xs text-muted">PNG, JPG or SVG up to 1.5 MB. Your logo stays in your browser and is never uploaded.</p>
        {style.logo && (
          <>
            <Range label="Logo size" value={style.logoSize} min={0.15} max={0.45} step={0.01} format={(v) => `${Math.round(v * 100)}%`} tip="Larger logos hide more of the code. Stay under 30% for reliable scanning." onChange={(v) => patch({ logoSize: v })} />
            <Range label="Logo margin" value={style.logoMargin} min={0} max={20} step={1} format={(v) => `${v}px`} onChange={(v) => patch({ logoMargin: v })} />
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
              <input type="checkbox" className="size-4 accent-[var(--c-accent)]" checked={style.logoHideDots} onChange={(e) => patch({ logoHideDots: e.target.checked })} />
              Clear dots behind the logo
              <InfoTip text="Keeps transparent logos clean by removing the dots hidden behind them." />
            </label>
          </>
        )}
      </Collapsible>

      <Collapsible title="Frame & label">
        <Segmented<FrameId> label="Frame style" value={style.frame} options={FRAMES} onChange={(v) => patch({ frame: v })} columns="grid-cols-2 sm:grid-cols-5" />
        {style.frame !== 'none' && (
          <>
            <div>
              <p className="mb-2 text-sm font-semibold">Label</p>
              <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Label presets">
                {FRAME_PRESETS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => patch({ frameText: t })}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${style.frameText === t ? 'border-accent bg-accent-soft text-accent-strong' : 'border-line text-muted hover:border-accent/50 hover:text-ink'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <Field label="Custom label text">
                {(p) => <input {...p} className="input" maxLength={28} value={style.frameText} onChange={(e) => patch({ frameText: e.target.value })} placeholder="SCAN ME" />}
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <ColorField label="Frame colour" value={style.frameColor} onChange={(v) => patch({ frameColor: v })} />
              <ColorField label="Label colour" value={style.frameTextColor} onChange={(v) => patch({ frameTextColor: v })} />
            </div>
          </>
        )}
      </Collapsible>
    </div>
  )
}
