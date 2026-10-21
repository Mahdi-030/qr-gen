import type { QRFormData, QRType } from '../types/qr'
import { normalizePhone, normalizeUrl } from './validation'

/** Escape for the WIFI: format (\ ; , : ") */
function escWifi(v: string): string {
  return v.replace(/([\\;,:"])/g, '\\$1')
}

/** Escape for vCard / iCalendar TEXT values. */
function escText(v: string): string {
  return v.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')
}

/** `2026-03-05T14:30` (datetime-local) -> `20260305T143000` (floating local time) */
export function toIcsLocal(v: string): string {
  const [d, t = '00:00'] = v.split('T')
  const [h = '00', m = '00', s = '00'] = t.split(':')
  return `${d.replace(/-/g, '')}T${h}${m}${s.slice(0, 2).padEnd(2, '0')}`
}

function toIcsDate(v: string): string {
  return v.split('T')[0].replace(/-/g, '')
}

function addDay(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().slice(0, 10).replace(/-/g, '')
}

/** Converts validated form data into a standard QR payload (URI scheme / MECARD-like formats). */
export function buildPayload<T extends QRType>(type: T, data: QRFormData[T]): string {
  switch (type) {
    case 'url':
      return normalizeUrl((data as QRFormData['url']).url)
    case 'text':
      return (data as QRFormData['text']).text
    case 'email': {
      const d = data as QRFormData['email']
      const params: string[] = []
      if (d.subject.trim()) params.push(`subject=${encodeURIComponent(d.subject.trim())}`)
      if (d.body.trim()) params.push(`body=${encodeURIComponent(d.body.trim())}`)
      return `mailto:${d.to.trim()}${params.length ? `?${params.join('&')}` : ''}`
    }
    case 'phone':
      return `tel:${normalizePhone((data as QRFormData['phone']).phone)}`
    case 'sms': {
      const d = data as QRFormData['sms']
      // SMSTO: is the widely supported QR convention (iOS and Android scanners).
      return `SMSTO:${normalizePhone(d.phone)}:${d.message}`
    }
    case 'wifi': {
      const d = data as QRFormData['wifi']
      const pass = d.security === 'nopass' ? '' : `P:${escWifi(d.password)};`
      return `WIFI:T:${d.security};S:${escWifi(d.ssid)};${pass}${d.hidden ? 'H:true;' : ''};`
    }
    case 'vcard': {
      const d = data as QRFormData['vcard']
      const lines = ['BEGIN:VCARD', 'VERSION:3.0']
      lines.push(`N:${escText(d.lastName.trim())};${escText(d.firstName.trim())};;;`)
      const fn = `${d.firstName.trim()} ${d.lastName.trim()}`.trim() || d.organization.trim()
      lines.push(`FN:${escText(fn)}`)
      if (d.organization.trim()) lines.push(`ORG:${escText(d.organization.trim())}`)
      if (d.title.trim()) lines.push(`TITLE:${escText(d.title.trim())}`)
      if (d.phone.trim()) lines.push(`TEL;TYPE=CELL:${normalizePhone(d.phone)}`)
      if (d.email.trim()) lines.push(`EMAIL:${d.email.trim()}`)
      if (d.website.trim()) lines.push(`URL:${normalizeUrl(d.website)}`)
      if (d.address.trim()) lines.push(`ADR;TYPE=WORK:;;${escText(d.address.trim())};;;;`)
      lines.push('END:VCARD')
      return lines.join('\r\n')
    }
    case 'whatsapp': {
      const d = data as QRFormData['whatsapp']
      const num = normalizePhone(d.phone).replace('+', '')
      return `https://wa.me/${num}${d.message.trim() ? `?text=${encodeURIComponent(d.message.trim())}` : ''}`
    }
    case 'location': {
      const d = data as QRFormData['location']
      return `geo:${Number(d.latitude)},${Number(d.longitude)}`
    }
    case 'event': {
      const d = data as QRFormData['event']
      const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//QRForge//EN', 'BEGIN:VEVENT']
      lines.push(`SUMMARY:${escText(d.title.trim())}`)
      if (d.allDay) {
        lines.push(`DTSTART;VALUE=DATE:${toIcsDate(d.start)}`)
        lines.push(`DTEND;VALUE=DATE:${addDay(d.end.split('T')[0])}`)
      } else {
        lines.push(`DTSTART:${toIcsLocal(d.start)}`)
        lines.push(`DTEND:${toIcsLocal(d.end)}`)
      }
      if (d.location.trim()) lines.push(`LOCATION:${escText(d.location.trim())}`)
      if (d.description.trim()) lines.push(`DESCRIPTION:${escText(d.description.trim())}`)
      lines.push('END:VEVENT', 'END:VCALENDAR')
      return lines.join('\r\n')
    }
  }
  return ''
}

/** Short human-readable label used in the history list. */
export function summarize<T extends QRType>(type: T, data: QRFormData[T]): string {
  switch (type) {
    case 'url':
      return (data as QRFormData['url']).url.trim()
    case 'text':
      return (data as QRFormData['text']).text.trim().slice(0, 60)
    case 'email':
      return (data as QRFormData['email']).to.trim()
    case 'phone':
      return (data as QRFormData['phone']).phone.trim()
    case 'sms':
      return (data as QRFormData['sms']).phone.trim()
    case 'wifi':
      return (data as QRFormData['wifi']).ssid.trim()
    case 'vcard': {
      const d = data as QRFormData['vcard']
      return `${d.firstName} ${d.lastName}`.trim() || d.organization
    }
    case 'whatsapp':
      return (data as QRFormData['whatsapp']).phone.trim()
    case 'location': {
      const d = data as QRFormData['location']
      return `${d.latitude}, ${d.longitude}`
    }
    case 'event':
      return (data as QRFormData['event']).title.trim()
  }
  return ''
}

export const DEFAULT_FORMS: { [K in QRType]: QRFormData[K] } = {
  url: { url: '' },
  text: { text: '' },
  email: { to: '', subject: '', body: '' },
  phone: { phone: '' },
  sms: { phone: '', message: '' },
  wifi: { ssid: '', security: 'WPA', password: '', hidden: false },
  vcard: { firstName: '', lastName: '', phone: '', email: '', organization: '', title: '', website: '', address: '' },
  whatsapp: { phone: '', message: '' },
  location: { latitude: '', longitude: '' },
  event: { title: '', location: '', start: '', end: '', description: '', allDay: false },
}

export const QR_TYPES: { id: QRType; label: string }[] = [
  { id: 'url', label: 'Website' },
  { id: 'text', label: 'Text' },
  { id: 'email', label: 'Email' },
  { id: 'phone', label: 'Phone' },
  { id: 'sms', label: 'SMS' },
  { id: 'wifi', label: 'Wi-Fi' },
  { id: 'vcard', label: 'Contact' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'location', label: 'Location' },
  { id: 'event', label: 'Event' },
]
