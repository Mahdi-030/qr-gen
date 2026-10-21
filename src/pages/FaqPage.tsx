import { FAQ_ITEMS } from '../config/faq'
import { usePageMeta } from '../hooks/usePageMeta'
import { FaqList } from '../components/ui/FaqList'

export default function FaqPage() {
  usePageMeta('FAQ', 'Answers about QR code formats, downloads, privacy and scanability.', '/faq')
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-4xl font-extrabold tracking-tight">Frequently asked questions</h1>
      <p className="mb-8 mt-3 text-lg text-muted">Formats, downloads, privacy and making sure your code scans.</p>
      <FaqList items={FAQ_ITEMS} />
    </div>
  )
}
