import { useEffect, useState } from 'react'
import { Icon } from '@/shared/ui'
import { newPasswordError, otpError } from '../utils/authValidation'
import PasswordField from './PasswordField'
import { fieldErrorClass, inputClass, labelClass, submitClass } from './authFormStyles'

const secondsUntil = (value, now) => value ? Math.max(0, Math.ceil((value - now) / 1000)) : 0

export default function ResetPasswordForm({ pending, email, resendAvailableAt, onSubmit, onResend, onBack }) {
  const [values, setValues] = useState({ otp: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [now, setNow] = useState(Date.now)
  const remaining = secondsUntil(resendAvailableAt, now)
  const update = field => value => setValues(current => ({ ...current, [field]: value }))

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const submit = event => {
    event.preventDefault()
    const nextErrors = {
      otp: otpError(values.otp),
      password: newPasswordError(values.password),
      confirmPassword: values.confirmPassword === values.password ? '' : 'Passwords do not match.',
    }
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return
    void onSubmit({ email, ...values })
  }

  return <form className="space-y-4" onSubmit={submit} noValidate>
    <div className="rounded-xl bg-primary-container/15 border border-primary/25 p-3 text-sm text-on-surface-variant">
      Enter the recovery code for <strong className="text-on-surface break-all">{email}</strong> and choose a new password.
    </div>
    <div>
      <label className={labelClass} htmlFor="recovery-otp">Recovery code <span className="text-primary">*</span></label>
      <input id="recovery-otp" className={`${inputClass} px-4 text-center tracking-[0.5em] font-label-numeric-md`}
        value={values.otp} onChange={event => update('otp')(event.target.value.replace(/\D/g, '').slice(0, 6))}
        inputMode="numeric" autoComplete="one-time-code" maxLength={6} disabled={pending} aria-invalid={Boolean(errors.otp)} />
      {errors.otp && <p className={fieldErrorClass}>{errors.otp}</p>}
    </div>
    <PasswordField id="recovery-password" label="New password" value={values.password} onChange={update('password')}
      error={errors.password} autoComplete="new-password" disabled={pending} />
    <PasswordField id="recovery-confirm-password" label="Confirm new password" value={values.confirmPassword}
      onChange={update('confirmPassword')} error={errors.confirmPassword} autoComplete="new-password" disabled={pending} />
    <button className={submitClass} type="submit" disabled={pending}>
      <span>{pending ? 'RESETTING PASSWORD…' : 'RESET PASSWORD'}</span><Icon name="password" className="text-base" />
    </button>
    <div className="flex items-center justify-between gap-3 text-xs">
      <button type="button" className="text-on-surface-variant hover:text-white transition-colors" onClick={onBack} disabled={pending}>Back to sign in</button>
      <button type="button" className="text-primary hover:text-primary-fixed transition-colors disabled:text-outline"
        onClick={onResend} disabled={pending || remaining > 0}>{remaining > 0 ? `Resend in ${remaining}s` : 'Resend code'}</button>
    </div>
  </form>
}
