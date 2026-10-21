import type { DotType, CornerSquareType, CornerDotType } from 'qr-code-styling'

export type QRType =
  | 'url'
  | 'text'
  | 'email'
  | 'phone'
  | 'sms'
  | 'wifi'
  | 'vcard'
  | 'whatsapp'
  | 'location'
  | 'event'

export interface QRFormData {
  url: { url: string }
  text: { text: string }
  email: { to: string; subject: string; body: string }
  phone: { phone: string }
  sms: { phone: string; message: string }
  wifi: { ssid: string; security: 'WPA' | 'WEP' | 'nopass'; password: string; hidden: boolean }
  vcard: {
    firstName: string
    lastName: string
    phone: string
    email: string
    organization: string
    title: string
    website: string
    address: string
  }
  whatsapp: { phone: string; message: string }
  location: { latitude: string; longitude: string }
  event: {
    title: string
    location: string
    start: string // datetime-local value
    end: string
    description: string
    allDay: boolean
  }
}

export type FormErrors = Record<string, string>

export type FillMode = 'solid' | 'linear' | 'radial'
export type FrameId = 'none' | 'bottom-bar' | 'top-bar' | 'outline-tag' | 'pill'

export interface StyleConfig {
  dotType: DotType
  cornerSquareType: CornerSquareType
  cornerDotType: CornerDotType
  fillMode: FillMode
  fg1: string
  fg2: string
  gradientAngle: number
  bg: string
  /** Separate corner colour; null = follow the main fill */
  cornerColor: string | null
  logo: string | null
  logoSize: number // 0.15 – 0.5 (fraction of QR)
  logoMargin: number // px
  logoHideDots: boolean
  frame: FrameId
  frameText: string
  frameColor: string
  frameTextColor: string
}

export type TemplateCategory = 'Minimal' | 'Business' | 'Colorful' | 'Creative' | 'Social'

export interface QRTemplate {
  id: string
  name: string
  category: TemplateCategory
  style: Partial<StyleConfig>
}

export type ExportFormat = 'png' | 'svg' | 'jpeg' | 'pdf'

export interface HistoryEntry {
  id: string
  createdAt: number
  type: QRType
  form: QRFormData[QRType]
  style: StyleConfig
  templateId: string | null
  summary: string
}
