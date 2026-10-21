import { Link } from 'react-router-dom'
import { SITE } from '../../config/site'
import { AdSlot } from '../ads/AdSlot'
import { Logo } from './Header'

const YEAR = new Date().getFullYear()

export function Footer() {
  const col = 'space-y-2 text-sm'
  const a = 'text-muted transition hover:text-accent'
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <AdSlot id="footer-banner" className="pt-6" />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted">
            Free, private QR code generator. Your content is encoded in your browser and never sent to our servers.
          </p>
        </div>
        <nav aria-label="Product" className={col}>
          <p className="font-bold">Product</p>
          <Link className={`${a} block`} to="/#studio">QR Generator</Link>
          <Link className={`${a} block`} to="/#templates">Templates</Link>
          <Link className={`${a} block`} to="/#features">Features</Link>
          <Link className={`${a} block`} to="/faq">FAQ</Link>
        </nav>
        <nav aria-label="Company" className={col}>
          <p className="font-bold">Company</p>
          <Link className={`${a} block`} to="/about">About</Link>
          <Link className={`${a} block`} to="/contact">Contact</Link>
        </nav>
        <nav aria-label="Legal" className={col}>
          <p className="font-bold">Legal</p>
          <Link className={`${a} block`} to="/privacy">Privacy Policy</Link>
          <Link className={`${a} block`} to="/terms">Terms of Service</Link>
        </nav>
      </div>
      <div className="border-t border-line py-5 text-center text-xs text-muted">
        © {YEAR} {SITE.name}. QR Code is a registered trademark of DENSO WAVE INCORPORATED.
      </div>
    </footer>
  )
}
