import { useEffect, useState } from 'react'
import { Icon } from '@/shared/ui'
import { otpError } from '../utils/authValidation'
import { fieldErrorClass, inputClass, labelClass, submitClass } from './authFormStyles'

const secondsUntil = (value, now) => value ? Math.max(0, Math.ceil((new Date(value).getTime() - now) / 1000)) : 0

export default function VerifyOtpForm({ email, otpExpiresAt, resendAvailableAt, pending, onSubmit, onResend, onBack }) {
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [now, setNow] = useState(Date.now)
  const remaining = secondsUntil(resendAvailableAt, now)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const submit = event => {
    event.preventDefault()
    const nextError = otpError(otp)
    setError(nextError)
    if (!nextError) void onSubmit({ email, otp })
  }

  return <form className="space-y-4" onSubmit={submit} noValidate>
    <div className="rounded-xl bg-primary-container/15 border border-primary/25 p-3 text-sm text-on-surface-variant">
      Enter the code sent to <strong className="text-on-surface break-all">{email}</strong>.
      {otpExpiresAt && <span className="block mt-1 text-xs text-outline">The latest code expires at {new Date(otpExpiresAt).toLocaleTimeString()}.</span>}
    </div>
    <div>
      <label className={labelClass} htmlFor="registration-otp">Verification code <span className="text-primary">*</span></label>
      <input id="registration-otp" className={`${inputClass} px-4 text-center tracking-[0.5em] font-label-numeric-md`} value={otp}
        onChange={event => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code"
        maxLength={6} disabled={pending} aria-invalid={Boolean(error)} />
      {error && <p className={fieldErrorClass}>{error}</p>}
    </div>
    <button className={submitClass} type="submit" disabled={pending}>
      <span>{pending ? 'VERIFYING…' : 'VERIFY EMAIL'}</span><Icon name="verified" className="text-base" />
    </button>
    <div className="flex items-center justify-between gap-3 text-xs">
      <button type="button" className="text-on-surface-variant hover:text-white transition-colors" onClick={onBack} disabled={pending}>Back to sign in</button>
      <button type="button" className="text-primary hover:text-primary-fixed transition-colors disabled:text-outline" onClick={onResend}
        disabled={pending || remaining > 0}>{remaining > 0 ? `Resend in ${remaining}s` : 'Resend code'}</button>
    </div>
  </form>
}
