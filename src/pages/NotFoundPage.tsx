import { Link } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'
import { Button } from '../components/ui/primitives'

export default function NotFoundPage() {
  usePageMeta('Page not found', 'The page you are looking for does not exist.', '/404')
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-6xl font-extrabold text-accent">404</p>
      <h1 className="mt-4 text-2xl font-extrabold">We couldn’t find that page</h1>
      <p className="mt-2 text-muted">The link may be broken or the page may have moved.</p>
      <Link to="/" className="mt-6 inline-block"><Button variant="primary">Back to the generator</Button></Link>
    </div>
  )
}
