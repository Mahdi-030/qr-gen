import { CalendarDays, Contact, Link2, Mail, MapPin, MessageCircle, MessageSquare, Phone, Type, Wifi, type LucideIcon } from 'lucide-react'
import type { QRType } from '../../types/qr'
import { QR_TYPES } from '../../lib/qrPayload'

const ICONS: Record<QRType, LucideIcon> = {
  url: Link2,
  text: Type,
  email: Mail,
  phone: Phone,
  sms: MessageSquare,
  wifi: Wifi,
  vcard: Contact,
  whatsapp: MessageCircle,
  location: MapPin,
  event: CalendarDays,
}

export function QRTypeSelector({ value, onChange }: { value: QRType; onChange: (t: QRType) => void }) {
  return (
    <div role="radiogroup" aria-label="QR code type" className="grid grid-cols-5 gap-2 sm:gap-2.5">
      {QR_TYPES.map((t) => {
        const Icon = ICONS[t.id]
        const active = t.id === value
        return (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(t.id)}
            className={`flex flex-col items-center gap-1.5 rounded-2xl border px-1 py-2.5 text-[11px] font-semibold transition sm:text-xs ${
              active
                ? 'border-accent bg-accent-soft text-accent-strong shadow-sm'
                : 'border-line bg-surface text-muted hover:-translate-y-0.5 hover:border-accent/50 hover:text-ink'
            }`}
          >
            <Icon className="size-5" aria-hidden />
            {t.label}
          </button>
        )
      })}
    </div>
  )
}
