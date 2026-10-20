import { useState } from 'react'
import { Icon } from '@/shared/ui'
import { displayNameError, emailError, newPasswordError } from '../utils/authValidation'
import PasswordField from './PasswordField'
import { fieldErrorClass, inputClass, labelClass, submitClass } from './authFormStyles'

export default function RegisterForm({ pending, onSubmit }) {
  const [values, setValues] = useState({ email: '', displayName: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const update = field => value => setValues(current => ({ ...current, [field]: value }))

  const submit = event => {
    event.preventDefault()
    const nextErrors = {
      email: emailError(values.email),
      displayName: displayNameError(values.displayName),
      password: newPasswordError(values.password),
      confirmPassword: values.confirmPassword === values.password ? '' : 'Passwords do not match.',
    }
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return
    void onSubmit({ ...values, email: values.email.trim(), displayName: values.displayName.trim() })
  }

  return <form className="space-y-4" onSubmit={submit} noValidate>
    <div>
      <label className={labelClass} htmlFor="register-email">Email address <span className="text-primary">*</span></label>
      <input id="register-email" className={`${inputClass} px-4`} type="email" value={values.email}
        onChange={event => update('email')(event.target.value)} autoComplete="email" disabled={pending} aria-invalid={Boolean(errors.email)} />
      {errors.email && <p className={fieldErrorClass}>{errors.email}</p>}
    </div>
    <div>
      <label className={labelClass} htmlFor="register-display-name">Display name <span className="text-primary">*</span></label>
      <input id="register-display-name" className={`${inputClass} px-4`} value={values.displayName}
        onChange={event => update('displayName')(event.target.value)} autoComplete="nickname" maxLength={100} disabled={pending} aria-invalid={Boolean(errors.displayName)} />
      {errors.displayName && <p className={fieldErrorClass}>{errors.displayName}</p>}
    </div>
    <PasswordField id="register-password" label="Password" value={values.password} onChange={update('password')}
      error={errors.password} autoComplete="new-password" disabled={pending} />
    <PasswordField id="register-confirm-password" label="Confirm password" value={values.confirmPassword}
      onChange={update('confirmPassword')} error={errors.confirmPassword} autoComplete="new-password" disabled={pending} />
    <button className={submitClass} type="submit" disabled={pending}>
      <span>{pending ? 'CREATING ACCOUNT…' : 'CREATE ACCOUNT'}</span><Icon name="person_add" className="text-base" />
    </button>
  </form>
}
