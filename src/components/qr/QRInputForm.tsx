import type { FormErrors, QRFormData, QRType } from '../../types/qr'
import { Field } from '../ui/primitives'

interface Props {
  type: QRType
  form: QRFormData[QRType]
  errors: FormErrors
  setField: (key: string, value: string | boolean) => void
}

export function QRInputForm({ type, form, errors, setField }: Props) {
  const f = form as unknown as Record<string, string | boolean>
  const s = (k: string) => String(f[k] ?? '')
  const text = (key: string, label: string, opts: { placeholder?: string; type?: string; hint?: string; tip?: string; autoComplete?: string; inputMode?: 'tel' | 'email' | 'url' | 'decimal' } = {}) => (
    <Field label={label} error={errors[key]} hint={opts.hint} tip={opts.tip}>
      {(p) => (
        <input
          {...p}
          className="input"
          type={opts.type ?? 'text'}
          inputMode={opts.inputMode}
          autoComplete={opts.autoComplete ?? 'off'}
          placeholder={opts.placeholder}
          value={s(key)}
          onChange={(e) => setField(key, e.target.value)}
        />
      )}
    </Field>
  )
  const area = (key: string, label: string, placeholder: string, rows = 3, hint?: string) => (
    <Field label={label} error={errors[key]} hint={hint}>
      {(p) => <textarea {...p} className="input resize-y" rows={rows} placeholder={placeholder} value={s(key)} onChange={(e) => setField(key, e.target.value)} />}
    </Field>
  )

  switch (type) {
    case 'url':
      return text('url', 'Website address', { placeholder: 'https://example.com', inputMode: 'url', hint: 'https:// is added automatically if you leave it out.' })
    case 'text':
      return area('text', 'Your text', 'Type or paste any text…', 4)
    case 'email':
      return (
        <div className="space-y-4">
          {text('to', 'Email address', { placeholder: 'name@example.com', type: 'email', inputMode: 'email', autoComplete: 'email' })}
          {text('subject', 'Subject (optional)', { placeholder: 'Hello!' })}
          {area('body', 'Message (optional)', 'Write a pre-filled message…')}
        </div>
      )
    case 'phone':
      return text('phone', 'Phone number', { placeholder: '+1 555 123 4567', type: 'tel', inputMode: 'tel', hint: 'Include the country code for international use.' })
    case 'sms':
      return (
        <div className="space-y-4">
          {text('phone', 'Phone number', { placeholder: '+1 555 123 4567', type: 'tel', inputMode: 'tel' })}
          {area('message', 'Message (optional)', 'Pre-filled text message…')}
        </div>
      )
    case 'wifi':
      return (
        <div className="space-y-4">
          {text('ssid', 'Network name (SSID)', { placeholder: 'My Home Wi-Fi' })}
          <Field label="Security">
            {(p) => (
              <select {...p} className="input" value={s('security')} onChange={(e) => setField('security', e.target.value)}>
                <option value="WPA">WPA / WPA2 / WPA3</option>
                <option value="WEP">WEP</option>
                <option value="nopass">No password</option>
              </select>
            )}
          </Field>
          {f.security !== 'nopass' &&
            text('password', 'Password', {
              placeholder: 'Network password',
              hint: 'Stored in the QR code as plain text. Anyone who scans it can read the password.',
              autoComplete: 'off',
            })}
          <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium">
            <input type="checkbox" className="size-4 accent-[var(--c-accent)]" checked={Boolean(f.hidden)} onChange={(e) => setField('hidden', e.target.checked)} />
            Hidden network
          </label>
        </div>
      )
    case 'vcard':
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          {text('firstName', 'First name', { placeholder: 'Ada', autoComplete: 'given-name' })}
          {text('lastName', 'Last name', { placeholder: 'Lovelace', autoComplete: 'family-name' })}
          {text('phone', 'Phone', { placeholder: '+44 20 7946 0958', type: 'tel', inputMode: 'tel' })}
          {text('email', 'Email', { placeholder: 'ada@example.com', type: 'email', inputMode: 'email' })}
          {text('organization', 'Organization', { placeholder: 'Analytical Engines Ltd', autoComplete: 'organization' })}
          {text('title', 'Job title', { placeholder: 'Founder' })}
          <div className="sm:col-span-2">{text('website', 'Website', { placeholder: 'https://example.com', inputMode: 'url' })}</div>
          <div className="sm:col-span-2">{area('address', 'Address', 'Street, city, postcode, country', 2)}</div>
        </div>
      )
    case 'whatsapp':
      return (
        <div className="space-y-4">
          {text('phone', 'WhatsApp number', { placeholder: '+1 555 123 4567', type: 'tel', inputMode: 'tel', hint: 'Use the full international number with country code.' })}
          {area('message', 'Pre-filled message (optional)', 'Hi! I scanned your QR code…')}
        </div>
      )
    case 'location':
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          {text('latitude', 'Latitude', { placeholder: '48.8584', inputMode: 'decimal', tip: 'Decimal degrees, between -90 and 90.' })}
          {text('longitude', 'Longitude', { placeholder: '2.2945', inputMode: 'decimal', tip: 'Decimal degrees, between -180 and 180.' })}
        </div>
      )
    case 'event': {
      const allDay = Boolean(f.allDay)
      const toggleAllDay = (v: boolean) => {
        setField('allDay', v)
        const conv = (val: string) => (v ? val.slice(0, 10) : val && !val.includes('T') ? `${val}T09:00` : val)
        setField('start', conv(s('start')))
        setField('end', conv(s('end')))
      }
      const when = (key: 'start' | 'end', label: string) => (
        <Field label={label} error={errors[key]}>
          {(p) => <input {...p} className="input" type={allDay ? 'date' : 'datetime-local'} value={s(key)} onChange={(e) => setField(key, e.target.value)} />}
        </Field>
      )
      return (
        <div className="space-y-4">
          {text('title', 'Event title', { placeholder: 'Product launch party' })}
          {text('location', 'Location (optional)', { placeholder: '221B Baker Street, London' })}
          <div className="grid gap-4 sm:grid-cols-2">
            {when('start', 'Starts')}
            {when('end', 'Ends')}
          </div>
          <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium">
            <input type="checkbox" className="size-4 accent-[var(--c-accent)]" checked={allDay} onChange={(e) => toggleAllDay(e.target.checked)} />
            All-day event
          </label>
          {area('description', 'Description (optional)', 'What is this event about?')}
        </div>
      )
    }
  }
}
