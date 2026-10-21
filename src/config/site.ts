/**
 * Site-wide settings. Replace the placeholder values before deploying.
 */
export const SITE = {
  name: 'QRForge',
  /** Public origin without trailing slash. Used for canonical + Open Graph URLs. */
  url: 'https://qr-gen-two-psi.vercel.app',
  /** Shown on the Contact page. Replace with a real mailbox you monitor. */
  contactEmail: 'hello@example.com',
  /** Date shown on legal pages. Update whenever the text changes. */
  legalUpdated: '2026-10-21',
} as const
