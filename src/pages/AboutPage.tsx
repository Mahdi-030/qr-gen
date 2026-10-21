import { Link } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'
import { PageShell } from '../components/layout/PageShell'
import { SITE } from '../config/site'

export default function AboutPage() {
  usePageMeta('About', `${SITE.name} is a free, private QR code generator with real customization and reliable exports.`, '/about')
  return (
    <PageShell title={`About ${SITE.name}`} intro="A QR code generator that treats the code like a piece of design, and like a tool that has to work.">
      <p>
        QR codes are everywhere: menus, business cards, event tickets, Wi-Fi sign-ins. Most generators either hide the good options behind a subscription or produce
        pretty codes that quietly fail to scan. {SITE.name} aims for both: a design you are proud of, and a code that reads on the first try.
      </p>
      <h2>How it works</h2>
      <ul>
        <li>Everything is generated locally in your browser. The content of your codes is never uploaded.</li>
        <li>Each code type is encoded in its standard format (URI schemes, WIFI:, vCard, iCalendar), so phones recognise it natively.</li>
        <li>After you generate, an independent decoder reads the result back and warns you about low contrast, oversized logos and dense data.</li>
        <li>Exports are real files: PNG and JPEG at up to 4096 px, vector SVG, and PDF sized for print.</li>
      </ul>
      <h2>How we pay for it</h2>
      <p>
        The generator is free and has no account wall. The site is funded by advertising, shown around the tool and never in the way of your QR code or downloads.
        Details are in our <Link to="/privacy">Privacy Policy</Link>.
      </p>
      <h2>Static codes only</h2>
      <p>
        The codes you make here are static: the data lives inside the pattern itself. They never expire and do not depend on our service, but they also cannot be edited
        after printing. Point the code at a link you control if you may need to change the destination later.
      </p>
      <p>
        Questions or feedback? <Link to="/contact">Get in touch</Link>.
      </p>
    </PageShell>
  )
}
