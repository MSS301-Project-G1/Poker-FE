import { useState } from 'react'
import { Icon } from '@/shared/ui'
import { emailError, loginPasswordError } from '../utils/authValidation'
import PasswordField from './PasswordField'
import { fieldErrorClass, inputClass, labelClass, submitClass } from './authFormStyles'

export default function SignInForm({ pending, onSubmit, onForgotPassword }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})

  const submit = event => {
    event.preventDefault()
    const nextErrors = { email: emailError(email), password: loginPasswordError(password) }
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return
    void onSubmit({ email: email.trim(), password })
  }

  return <form className="space-y-4" onSubmit={submit} noValidate>
    <div>
      <label className={labelClass} htmlFor="login-email">Email address <span className="text-primary">*</span></label>
      <div className="relative">
        <Icon name="mail" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-lg pointer-events-none" />
        <input id="login-email" className={`${inputClass} pl-11 pr-4`} type="email" value={email}
          onChange={event => setEmail(event.target.value)} autoComplete="email" disabled={pending} aria-invalid={Boolean(errors.email)} />
      </div>
      {errors.email && <p className={fieldErrorClass}>{errors.email}</p>}
    </div>
    <PasswordField id="login-password" label="Password" value={password} onChange={setPassword}
      error={errors.password} autoComplete="current-password" disabled={pending} />
    <div className="flex justify-end -mt-1">
      <button type="button" className="text-xs text-primary hover:text-primary-fixed transition-colors"
        onClick={onForgotPassword} disabled={pending}>Forgot password?</button>
    </div>
    <button className={submitClass} type="submit" disabled={pending}>
      <span>{pending ? 'SIGNING IN…' : 'ENTER ARENA'}</span><Icon name="arrow_forward" className="text-base" />
    </button>
  </form>
}
