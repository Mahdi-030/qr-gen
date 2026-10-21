import { memo } from 'react'
import type { StyleConfig } from '../../types/qr'
import { useQRPreview } from '../../hooks/useQRCode'

interface Props {
  payload: string
  style: StyleConfig
  size: number
  label: string
}

/** A small, genuinely generated QR code (used by the hero and the template gallery). */
export const MiniQR = memo(function MiniQR({ payload, style, size, label }: Props) {
  const { src, aspect, error } = useQRPreview(payload, style)
  const h = Math.round(size / (src ? aspect : 1))
  if (error) return <div className="grid place-items-center rounded-xl bg-surface-2 text-xs text-muted" style={{ width: size, height: size }}>Preview unavailable</div>
  if (!src) return <div className="skeleton rounded-xl" style={{ width: size, height: size }} aria-hidden />
  return <img src={src} alt={label} width={size} height={h} className="block max-w-full" draggable={false} />
})
