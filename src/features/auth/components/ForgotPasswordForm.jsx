import { useState } from 'react'
import { Icon } from '@/shared/ui'
import { emailError } from '../utils/authValidation'
import { fieldErrorClass, inputClass, labelClass, submitClass } from './authFormStyles'

export default function ForgotPasswordForm({ pending, initialEmail, onSubmit, onBack }) {
  const [email, setEmail] = useState(initialEmail || '')
  const [error, setError] = useState('')


  const submit = event => {
    event.preventDefault()
    const nextError = emailError(email)
    setError(nextError)
    if (!nextError) void onSubmit({ email: email.trim() })
  }

  return <form className="space-y-4" onSubmit={submit} noValidate>
    <p className="text-sm text-on-surface-variant">Enter your email. If the account is eligible, we will send a 6-digit recovery code.</p>
    <div>
      <label className={labelClass} htmlFor="recovery-email">Email address <span className="text-primary">*</span></label>
      <input id="recovery-email" className={`${inputClass} px-4`} type="email" value={email}
        onChange={event => setEmail(event.target.value)} autoComplete="email" disabled={pending} aria-invalid={Boolean(error)} />
      {error && <p className={fieldErrorClass}>{error}</p>}
    </div>
    <button className={submitClass} type="submit" disabled={pending}>
      <span>{pending ? 'REQUESTING CODE…' : 'SEND RECOVERY CODE'}</span><Icon name="outgoing_mail" className="text-base" />
    </button>
    <button type="button" className="text-xs text-on-surface-variant hover:text-white transition-colors" onClick={onBack} disabled={pending}>
      Back to sign in
    </button>
  </form>
}
