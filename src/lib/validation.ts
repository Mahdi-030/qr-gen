import type { FormErrors, QRFormData, QRType } from '../types/qr'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_RE = /^\+?[0-9][0-9\s().-]{4,18}$/

/** Above this the QR becomes too dense to scan reliably on most phones. */
export const MAX_PAYLOAD_CHARS = 1800

export function isValidPhone(v: string): boolean {
  const digits = v.replace(/\D/g, '')
  return PHONE_RE.test(v.trim()) && digits.length >= 5 && digits.length <= 15
}

/** Strips formatting, keeps a leading + and digits. */
export function normalizePhone(v: string): string {
  const t = v.trim()
  return (t.startsWith('+') ? '+' : '') + t.replace(/\D/g, '')
}

export function normalizeUrl(raw: string): string {
  const t = raw.trim()
  // Already has a scheme (but not "host:port").
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(t) || /^(mailto|tel):/i.test(t)) return t
  return `https://${t}`
}

export function isValidUrl(raw: string): boolean {
  const t = raw.trim()
  if (!t || /\s/.test(t)) return false
  try {
    const u = new URL(normalizeUrl(t))
    if (!['http:', 'https:'].includes(u.protocol)) return false
    return u.hostname.includes('.') || u.hostname === 'localhost'
  } catch {
    return false
  }
}

export function validateForm<T extends QRType>(type: T, data: QRFormData[T]): FormErrors {
  const e: FormErrors = {}
  switch (type) {
    case 'url': {
      const d = data as QRFormData['url']
      if (!d.url.trim()) e.url = 'Enter a website address.'
      else if (!isValidUrl(d.url)) e.url = 'Enter a valid web address, e.g. https://example.com'
      break
    }
    case 'text': {
      const d = data as QRFormData['text']
      if (!d.text.trim()) e.text = 'Enter some text to encode.'
      break
    }
    case 'email': {
      const d = data as QRFormData['email']
      if (!d.to.trim()) e.to = 'Enter an email address.'
      else if (!EMAIL_RE.test(d.to.trim())) e.to = 'Enter a valid email address.'
      break
    }
    case 'phone': {
      const d = data as QRFormData['phone']
      if (!d.phone.trim()) e.phone = 'Enter a phone number.'
      else if (!isValidPhone(d.phone)) e.phone = 'Enter a valid phone number (5–15 digits, optional +).'
      break
    }
    case 'sms': {
      const d = data as QRFormData['sms']
      if (!d.phone.trim()) e.phone = 'Enter a phone number.'
      else if (!isValidPhone(d.phone)) e.phone = 'Enter a valid phone number (5–15 digits, optional +).'
      break
    }
    case 'wifi': {
      const d = data as QRFormData['wifi']
      if (!d.ssid.trim()) e.ssid = 'Enter the network name (SSID).'
      if (d.security !== 'nopass') {
        if (!d.password) e.password = 'Enter the network password.'
        else if (d.security === 'WPA' && (d.password.length < 8 || d.password.length > 63))
          e.password = 'WPA passwords must be 8–63 characters.'
      }
      break
    }
    case 'vcard': {
      const d = data as QRFormData['vcard']
      if (!d.firstName.trim() && !d.lastName.trim() && !d.organization.trim())
        e.firstName = 'Enter a name or an organization.'
      if (d.phone.trim() && !isValidPhone(d.phone)) e.phone = 'Enter a valid phone number.'
      if (d.email.trim() && !EMAIL_RE.test(d.email.trim())) e.email = 'Enter a valid email address.'
      if (d.website.trim() && !isValidUrl(d.website)) e.website = 'Enter a valid website address.'
      if (!d.phone.trim() && !d.email.trim() && !d.website.trim() && !d.address.trim() && !e.firstName)
        e.phone = 'Add at least a phone, email, website or address.'
      break
    }
    case 'whatsapp': {
      const d = data as QRFormData['whatsapp']
      if (!d.phone.trim()) e.phone = 'Enter a WhatsApp number with country code.'
      else if (!isValidPhone(d.phone)) e.phone = 'Enter a valid number including the country code.'
      break
    }
    case 'location': {
      const d = data as QRFormData['location']
      const lat = Number(d.latitude)
      const lng = Number(d.longitude)
      if (!d.latitude.trim() || Number.isNaN(lat)) e.latitude = 'Enter a latitude, e.g. 48.8584'
      else if (lat < -90 || lat > 90) e.latitude = 'Latitude must be between -90 and 90.'
      if (!d.longitude.trim() || Number.isNaN(lng)) e.longitude = 'Enter a longitude, e.g. 2.2945'
      else if (lng < -180 || lng > 180) e.longitude = 'Longitude must be between -180 and 180.'
      break
    }
    case 'event': {
      const d = data as QRFormData['event']
      if (!d.title.trim()) e.title = 'Enter an event title.'
      if (!d.start) e.start = 'Choose a start date and time.'
      if (!d.end) e.end = 'Choose an end date and time.'
      if (d.start && d.end && new Date(d.end) < new Date(d.start)) e.end = 'The end must be after the start.'
      break
    }
  }
  return e
}

export const IMAGE_MAX_BYTES = 1_500_000
export const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml']

export function validateImageFile(file: File): string | null {
  if (!IMAGE_TYPES.includes(file.type)) return 'Logo must be a PNG, JPG or SVG file.'
  if (file.size === 0) return 'That file is empty.'
  if (file.size > IMAGE_MAX_BYTES) return 'Logo is too large. Please use an image under 1.5 MB.'
  return null
}
