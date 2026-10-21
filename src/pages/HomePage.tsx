import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Download, Layers, Lock, ScanLine, Smartphone, Sparkles, Wand2 } from 'lucide-react'
import { usePageMeta } from '../hooks/usePageMeta'
import { useStudio } from '../hooks/useStudio'
import { FAQ_ITEMS } from '../config/faq'
import { TEMPLATES, templateStyle } from '../lib/templates'
import { AdSlot } from '../components/ads/AdSlot'
import { QRStudio } from '../components/qr/QRStudio'
import { QRTemplateGallery } from '../components/qr/QRTemplateGallery'
import { MiniQR } from '../components/qr/MiniQR'
import { FaqList } from '../components/ui/FaqList'
import { Button } from '../components/ui/primitives'

const SHOWCASE = ['purple-gradient', 'modern-blue', 'neon'].map((id) => TEMPLATES.find((t) => t.id === id)!)

const FEATURES = [
  { Icon: Lock, title: 'Private by design', text: 'QR codes are created in your browser. Your links, contacts and Wi-Fi passwords never reach a server.' },
  { Icon: Wand2, title: 'Real customization', text: 'Dot and corner shapes, gradients, logos, frames and labels. All of it exports exactly as previewed.' },
  { Icon: ScanLine, title: 'Scan-tested', text: 'Every code is read back by an independent decoder, with clear warnings when a style could hurt scanning.' },
  { Icon: Download, title: 'PNG, SVG, JPEG, PDF', text: 'High-resolution files up to 4096 px, true vector SVG and print-ready PDF.' },
  { Icon: Layers, title: '10 QR types', text: 'Websites, Wi-Fi, contacts, events, WhatsApp, locations and more, each in its standard format.' },
  { Icon: Smartphone, title: 'Works everywhere', text: 'Responsive on phones and tablets, with light and dark themes and full keyboard support.' },
]

export default function HomePage() {
  usePageMeta(
    'Free Custom QR Code Generator',
    'Create beautiful, customizable QR codes for links, Wi-Fi, contacts, events and more. Generated privately in your browser. Download PNG, SVG, JPEG or PDF for free.',
  )
  const studio = useStudio()
  const [quick, setQuick] = useState('')

  const quickStart = (e: FormEvent) => {
    e.preventDefault()
    if (quick.trim()) studio.seedUrl(quick.trim())
    document.getElementById('studio')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <AdSlot id="top-banner" className="pt-4" />

      <section className="relative overflow-hidden" aria-labelledby="hero-h">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(60%_60%_at_70%_0%,var(--c-accent-soft),transparent)]" aria-hidden />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-6 pt-14 lg:grid-cols-[1.1fr_0.9fr] lg:pt-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-bold text-accent-strong shadow-sm">
              <Sparkles className="size-3.5" aria-hidden /> Free · No sign-up · Private
            </span>
            <h1 id="hero-h" className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Create Beautiful QR Codes in Seconds
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
              Generate customizable QR codes for links, businesses, Wi-Fi, contact details, and more. Download in high quality for free.
            </p>
            <form onSubmit={quickStart} className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row" aria-label="Quick start">
              <label htmlFor="quick-url" className="sr-only">Website address</label>
              <input id="quick-url" className="input !rounded-2xl !py-3.5" placeholder="Paste a link, e.g. https://example.com" inputMode="url" value={quick} onChange={(e) => setQuick(e.target.value)} />
              <Button type="submit" variant="primary" size="lg" className="shrink-0">
                Create QR Code <ArrowRight className="size-4" aria-hidden />
              </Button>
            </form>
            <p className="mt-3 text-sm text-muted">Or <Link to="/#templates" className="font-semibold text-accent underline-offset-4 hover:underline">start from a template</Link>.</p>
          </div>

          <div className="relative mx-auto h-[360px] w-full max-w-[420px] sm:h-[400px]" aria-label="Examples of QR code styles">
            {SHOWCASE.map((t, i) => (
              <div
                key={t.id}
                className="absolute rounded-3xl border border-line bg-surface p-3 shadow-pop transition hover:z-10 hover:scale-105"
                style={{ left: `${[0, 38, 12][i]}%`, top: `${[2, 6, 46][i]}%`, transform: `rotate(${[-6, 5, -2][i]}deg)`, zIndex: i }}
              >
                <MiniQR payload="https://example.com" style={templateStyle(t)} size={i === 2 ? 170 : 150} label={`${t.name} example`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <QRStudio studio={studio} />

      <AdSlot id="mid-banner" className="py-2" />

      <QRTemplateGallery studio={studio} />

      <AdSlot id="features-banner" className="py-2" />

      <section id="features" aria-labelledby="features-h" className="mx-auto max-w-6xl px-4 py-12">
        <h2 id="features-h" className="text-3xl font-extrabold tracking-tight">Everything you need, nothing you don’t</h2>
        <p className="mt-2 max-w-2xl text-muted">A focused toolkit for QR codes that look good and scan reliably.</p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ Icon, title, text }) => (
            <li key={title} className="rounded-3xl border border-line bg-surface p-6 shadow-card transition hover:-translate-y-1">
              <span className="grid size-11 place-items-center rounded-2xl bg-accent-soft text-accent"><Icon className="size-5" aria-hidden /></span>
              <h3 className="mt-4 font-bold">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="faq" aria-labelledby="faq-h" className="mx-auto max-w-3xl px-4 py-12">
        <h2 id="faq-h" className="mb-6 text-center text-3xl font-extrabold tracking-tight">Frequently asked questions</h2>
        <FaqList items={FAQ_ITEMS.slice(0, 5)} />
        <p className="mt-5 text-center text-sm">
          <Link to="/faq" className="font-semibold text-accent hover:underline">See all questions →</Link>
        </p>
      </section>

      <AdSlot id="faq-banner" className="py-2" />
    </>
  )
}
