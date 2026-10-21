import { useCallback, useEffect, useRef } from 'react'
import { RotateCcw, Sparkles } from 'lucide-react'
import type { Studio } from '../../hooks/useStudio'
import { TEMPLATES } from '../../lib/templates'
import { Button, Card, Spinner } from '../ui/primitives'
import { GenerateAdExperience } from '../ads/GenerateAdExperience'
import { QRTypeSelector } from './QRTypeSelector'
import { QRInputForm } from './QRInputForm'
import { QRCustomization } from './QRCustomization'
import { QRPreview } from './QRPreview'
import { QRDownloadPanel } from './QRDownloadPanel'
import { QRHistory } from './QRHistory'

export function QRStudio({ studio }: { studio: Studio }) {
  const previewRef = useRef<HTMLDivElement>(null)
  const busyRef = useRef(false)
  const unlockTimer = useRef<number | undefined>(undefined)
  const { generate } = studio

  useEffect(() => () => window.clearTimeout(unlockTimer.current), [])

  /**
   * The single entry point for the Generate button.
   *  1. Ignores rapid double-clicks while a generation is running.
   *  2. Starts QR generation immediately (validate -> payload -> render -> commit).
   *  3. Only a valid, successful, user-initiated click advances `generateCount`, which is what
   *     GenerateAdExperience listens to. That component reveals the result banner once; it does
   *     not re-inject or reload ad scripts, and the QR + downloads never wait for it.
   */
  const handleGenerateClick = useCallback(async () => {
    if (busyRef.current) return
    busyRef.current = true
    let ok = false
    try {
      ok = await generate()
      if (ok && window.matchMedia('(max-width: 1023px)').matches) {
        previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    } finally {
      // A short lock after success swallows double-clicks; failures unlock immediately.
      unlockTimer.current = window.setTimeout(() => (busyRef.current = false), ok ? 400 : 0)
    }
  }, [generate])

  return (
    <section id="studio" aria-labelledby="studio-h" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-10">
      <h2 id="studio-h" className="sr-only">QR code studio</h2>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <Card className="min-w-0 p-5 sm:p-7">
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              void handleGenerateClick()
            }}
          >
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">1 · Choose a type</p>
            <QRTypeSelector value={studio.type} onChange={studio.setType} />

            <p className="mb-3 mt-7 text-xs font-bold uppercase tracking-widest text-muted">2 · Enter your content</p>
            <div className="animate-fade-up" key={studio.type}>
              <QRInputForm type={studio.type} form={studio.form} errors={studio.errors} setField={studio.setField} />
            </div>

            <p className="mb-3 mt-7 text-xs font-bold uppercase tracking-widest text-muted">3 · Pick a template</p>
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2" role="group" aria-label="Quick templates">
              {TEMPLATES.map((t) => {
                const active = studio.templateId === t.id
                const c1 = t.style.fg1 ?? '#000'
                const c2 = t.style.fillMode && t.style.fillMode !== 'solid' ? t.style.fg2 ?? c1 : c1
                return (
                  <button
                    key={t.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => studio.applyTemplate(t)}
                    className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${active ? 'border-accent bg-accent-soft text-accent-strong' : 'border-line bg-surface text-muted hover:text-ink'}`}
                  >
                    <span className="size-4 rounded-full border border-line" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }} aria-hidden />
                    {t.name}
                  </button>
                )
              })}
            </div>

            <p className="mb-3 mt-7 text-xs font-bold uppercase tracking-widest text-muted">4 · Customize the design</p>
            <QRCustomization style={studio.style} patch={studio.patchStyle} />

            <div className="sticky bottom-3 z-20 mt-7 flex gap-3 rounded-2xl border border-line bg-surface/95 p-3 shadow-pop backdrop-blur">
              <Button type="submit" variant="primary" size="lg" className="flex-1" disabled={studio.isGenerating}>
                {studio.isGenerating ? <Spinner /> : <Sparkles className="size-5" aria-hidden />}
                {studio.isGenerating ? 'Generating…' : 'Generate QR code'}
              </Button>
              <Button size="lg" onClick={studio.resetAll} aria-label="Reset everything">
                <RotateCcw className="size-4" aria-hidden /> <span className="hidden sm:inline">Reset</span>
              </Button>
            </div>
          </form>
          <div className="mt-6">
            <QRHistory studio={studio} />
          </div>
        </Card>

        <div ref={previewRef} className="min-w-0 scroll-mt-20 lg:sticky lg:top-20 lg:self-start">
          <Card className="p-5 sm:p-6">
            <h3 className="mb-4 text-lg font-extrabold">Preview</h3>
            <QRPreview studio={studio} />
            <QRDownloadPanel studio={studio} />
          </Card>
          <GenerateAdExperience generateCount={studio.generateCount} />
        </div>
      </div>
    </section>
  )
}
