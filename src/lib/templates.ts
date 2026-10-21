import type { QRTemplate, StyleConfig } from '../types/qr'

export const DEFAULT_STYLE: StyleConfig = {
  dotType: 'rounded',
  cornerSquareType: 'extra-rounded',
  cornerDotType: 'dot',
  fillMode: 'solid',
  fg1: '#0f1535',
  fg2: '#6d4aff',
  gradientAngle: 45,
  bg: '#ffffff',
  cornerColor: null,
  logo: null,
  logoSize: 0.28,
  logoMargin: 6,
  logoHideDots: true,
  frame: 'none',
  frameText: 'SCAN ME',
  frameColor: '#0f1535',
  frameTextColor: '#ffffff',
}

export const FRAME_PRESETS = [
  'SCAN ME',
  'SCAN TO VISIT',
  'SCAN TO CONNECT',
  'MY WEBSITE',
  'CONTACT ME',
] as const

export const TEMPLATES: QRTemplate[] = [
  {
    id: 'minimal-black',
    name: 'Minimal Black',
    category: 'Minimal',
    style: { dotType: 'square', cornerSquareType: 'square', cornerDotType: 'square', fillMode: 'solid', fg1: '#000000', bg: '#ffffff', cornerColor: null, frame: 'none' },
  },
  {
    id: 'elegant-mono',
    name: 'Elegant Monochrome',
    category: 'Minimal',
    style: { dotType: 'classy-rounded', cornerSquareType: 'extra-rounded', cornerDotType: 'dot', fillMode: 'solid', fg1: '#2b2d42', bg: '#f7f7f9', cornerColor: '#111827', frame: 'none' },
  },
  {
    id: 'rounded-dots',
    name: 'Rounded Dots',
    category: 'Minimal',
    style: { dotType: 'dots', cornerSquareType: 'dot', cornerDotType: 'dot', fillMode: 'solid', fg1: '#1f2937', bg: '#ffffff', cornerColor: null, frame: 'none' },
  },
  {
    id: 'modern-blue',
    name: 'Modern Blue',
    category: 'Business',
    style: { dotType: 'rounded', cornerSquareType: 'extra-rounded', cornerDotType: 'dot', fillMode: 'solid', fg1: '#1d4ed8', bg: '#ffffff', cornerColor: '#0b2a8a', frame: 'bottom-bar', frameText: 'SCAN ME', frameColor: '#1d4ed8', frameTextColor: '#ffffff' },
  },
  {
    id: 'business-pro',
    name: 'Business Professional',
    category: 'Business',
    style: { dotType: 'classy', cornerSquareType: 'square', cornerDotType: 'square', fillMode: 'solid', fg1: '#0f172a', bg: '#ffffff', cornerColor: '#0f172a', frame: 'outline-tag', frameText: 'CONTACT ME', frameColor: '#0f172a', frameTextColor: '#ffffff' },
  },
  {
    id: 'restaurant-menu',
    name: 'Restaurant Menu',
    category: 'Business',
    style: { dotType: 'extra-rounded', cornerSquareType: 'extra-rounded', cornerDotType: 'dot', fillMode: 'solid', fg1: '#7c2d12', bg: '#fff7ed', cornerColor: '#9a3412', frame: 'top-bar', frameText: 'SCAN TO VISIT', frameColor: '#9a3412', frameTextColor: '#fff7ed' },
  },
  {
    id: 'purple-gradient',
    name: 'Purple Gradient',
    category: 'Colorful',
    style: { dotType: 'rounded', cornerSquareType: 'extra-rounded', cornerDotType: 'dot', fillMode: 'linear', fg1: '#6d28d9', fg2: '#db2777', gradientAngle: 45, bg: '#ffffff', cornerColor: '#4c1d95', frame: 'none' },
  },
  {
    id: 'ocean-radial',
    name: 'Ocean Radial',
    category: 'Colorful',
    style: { dotType: 'dots', cornerSquareType: 'extra-rounded', cornerDotType: 'dot', fillMode: 'radial', fg1: '#0369a1', fg2: '#0f172a', bg: '#ecfeff', cornerColor: '#0c4a6e', frame: 'none' },
  },
  {
    id: 'soft-pastel',
    name: 'Soft Pastel',
    category: 'Colorful',
    style: { dotType: 'extra-rounded', cornerSquareType: 'extra-rounded', cornerDotType: 'dot', fillMode: 'linear', fg1: '#7c6bd1', fg2: '#d1648f', gradientAngle: 90, bg: '#fdf4ff', cornerColor: '#5b4bb0', frame: 'pill', frameText: 'SCAN ME', frameColor: '#7c6bd1', frameTextColor: '#ffffff' },
  },
  {
    id: 'nature-green',
    name: 'Nature Green',
    category: 'Creative',
    style: { dotType: 'classy-rounded', cornerSquareType: 'extra-rounded', cornerDotType: 'dot', fillMode: 'linear', fg1: '#14532d', fg2: '#15803d', gradientAngle: 135, bg: '#f0fdf4', cornerColor: '#052e16', frame: 'none' },
  },
  {
    id: 'luxury-gold',
    name: 'Luxury Gold',
    category: 'Creative',
    style: { dotType: 'classy', cornerSquareType: 'extra-rounded', cornerDotType: 'dot', fillMode: 'linear', fg1: '#8a6a12', fg2: '#4a3a08', gradientAngle: 45, bg: '#fffbeb', cornerColor: '#3b2f06', frame: 'bottom-bar', frameText: 'SCAN ME', frameColor: '#1c1917', frameTextColor: '#e9c46a' },
  },
  {
    id: 'neon',
    name: 'Neon Night',
    category: 'Creative',
    style: { dotType: 'rounded', cornerSquareType: 'extra-rounded', cornerDotType: 'dot', fillMode: 'linear', fg1: '#22f5c8', fg2: '#7c5cff', gradientAngle: 45, bg: '#0b0e1f', cornerColor: '#22f5c8', frame: 'outline-tag', frameText: 'SCAN ME', frameColor: '#7c5cff', frameTextColor: '#ffffff' },
  },
  {
    id: 'social-media',
    name: 'Social Media',
    category: 'Social',
    style: { dotType: 'rounded', cornerSquareType: 'extra-rounded', cornerDotType: 'dot', fillMode: 'linear', fg1: '#c026d3', fg2: '#ea580c', gradientAngle: 45, bg: '#ffffff', cornerColor: '#86198f', frame: 'pill', frameText: 'SCAN ME', frameColor: '#c026d3', frameTextColor: '#ffffff' },
  },
  {
    id: 'chat-green',
    name: 'Chat Green',
    category: 'Social',
    style: { dotType: 'dots', cornerSquareType: 'extra-rounded', cornerDotType: 'dot', fillMode: 'solid', fg1: '#128c4a', bg: '#ffffff', cornerColor: '#075e33', frame: 'bottom-bar', frameText: 'CONTACT ME', frameColor: '#128c4a', frameTextColor: '#ffffff' },
  },
]

export function templateStyle(t: QRTemplate): StyleConfig {
  return { ...DEFAULT_STYLE, ...t.style }
}
