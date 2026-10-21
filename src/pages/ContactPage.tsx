import { useState, type FormEvent } from 'react'
import { Mail } from 'lucide-react'
import { usePageMeta } from '../hooks/usePageMeta'
import { PageShell } from '../components/layout/PageShell'
import { Field, Button } from '../components/ui/primitives'
import { SITE } from '../config/site'

export default function ContactPage() {
  usePageMeta('Contact', `Contact the ${SITE.name} team with questions, feedback or bug reports.`, '/contact')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Please tell us your name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) errs.email = 'Enter a valid email address.'
    if (message.trim().length < 10) errs.message = 'Please write at least a sentence.'
    setErrors(errs)
    if (Object.keys(errs).length) return
    const body = `${message.trim()}\n\n— ${name.trim()} (${email.trim()})`
    window.location.href = `mailto:${SITE.contactEmail}?subject=${encodeURIComponent(`${SITE.name} message from ${name.trim()}`)}&body=${encodeURIComponent(body)}`
  }

  return (
    <PageShell title="Contact us" intro="Questions, feedback or a bug to report? We read every message.">
      <p>
        This form opens your email app with the message ready to send to <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>. Nothing is sent
        until you press send in your email app, and we do not store what you type here.
      </p>
      <form noValidate onSubmit={submit} className="not-prose mt-6 space-y-4 rounded-3xl border border-line bg-surface p-6 shadow-card">
        <Field label="Your name" error={errors.name}>
          {(p) => <input {...p} className="input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />}
        </Field>
        <Field label="Your email" error={errors.email}>
          {(p) => <input {...p} className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />}
        </Field>
        <Field label="Message" error={errors.message}>
          {(p) => <textarea {...p} className="input" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} />}
        </Field>
        <Button type="submit" variant="primary">
          <Mail className="size-4" /> Open email app
        </Button>
      </form>
    </PageShell>
  )
}
