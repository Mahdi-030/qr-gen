import { Link } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'
import { PageShell } from '../components/layout/PageShell'
import { SITE } from '../config/site'

export default function TermsPage() {
  usePageMeta('Terms of Service', `The terms for using the ${SITE.name} QR code generator.`, '/terms')
  return (
    <PageShell title="Terms of Service" intro={`Last updated ${SITE.legalUpdated}`}>
      <p>By using {SITE.name} you agree to these terms. If you do not agree, please do not use the site.</p>

      <h2>The service</h2>
      <p>
        {SITE.name} lets you create static QR codes in your browser and download them as image or PDF files. The service is provided free of charge and supported by advertising.
      </p>

      <h2>Your content</h2>
      <p>
        You are responsible for what you encode. Do not create codes that link to unlawful, deceptive, malicious or infringing content, or that attempt to spread malware,
        phishing or spam. You keep all rights to the codes and logos you create. We do not receive or store them.
      </p>

      <h2>Scanning and printing</h2>
      <p>
        Scanning depends on the scanner, lighting, print quality and the design choices you make. We provide warnings and a built-in read-back test, but we cannot guarantee that every
        code will scan on every device. Always test your final design before printing large quantities.
      </p>

      <h2>Not a security feature</h2>
      <p>
        QR codes are not encrypted. Anyone who can see a code can read its contents, including any Wi-Fi password you encode. Do not use a QR code to protect sensitive information.
      </p>

      <h2>Third-party advertising and links</h2>
      <p>
        The site displays advertising from third parties. We do not endorse advertisers and are not responsible for their content or practices. See the{' '}
        <Link to="/privacy">Privacy Policy</Link> for details.
      </p>

      <h2>No warranty</h2>
      <p>
        The service is provided “as is” and “as available”, without warranties of any kind. To the fullest extent permitted by law, we are not liable for any indirect or consequential
        loss arising from your use of the site, including from a QR code that fails to scan.
      </p>

      <h2>Trademarks</h2>
      <p>QR Code is a registered trademark of DENSO WAVE INCORPORATED. {SITE.name} is not affiliated with DENSO WAVE.</p>

      <h2>Changes and contact</h2>
      <p>
        We may update these terms from time to time; continued use means you accept the updated terms. Questions? <Link to="/contact">Contact us</Link>.
      </p>
    </PageShell>
  )
}
