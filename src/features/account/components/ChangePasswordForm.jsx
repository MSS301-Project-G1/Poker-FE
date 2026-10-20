import { useState } from 'react'
import { Button, Icon } from '@/shared/ui'
import { changePassword, loginPasswordError, newPasswordError, PasswordField } from '@/features/auth'
import { panelClass } from './accountFormStyles'

const messageOf = error => error?.requestId ? `${error.message} Reference: ${error.requestId}` : error?.message

export default function ChangePasswordForm({ onChanged }) {
  const [values, setValues] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [pending, setPending] = useState(false)
  const [requestError, setRequestError] = useState('')
  const update = field => value => setValues(current => ({ ...current, [field]: value }))

  const submit = async event => {
    event.preventDefault()
    const nextErrors = {
      currentPassword: loginPasswordError(values.currentPassword),
      newPassword: newPasswordError(values.newPassword),
      confirmPassword: values.confirmPassword === values.newPassword ? '' : 'Passwords do not match.',
    }
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return
    setPending(true); setRequestError('')
    try { await changePassword(values); onChanged() } catch (failure) {
      setRequestError(messageOf(failure) || 'Unable to change the password.')
    } finally { setPending(false) }
  }

  return <section className={panelClass}>
    <div className="mb-space-lg flex items-center gap-space-sm">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-tertiary-container/25"><Icon name="password" className="text-tertiary" /></span>
      <div><h2 className="font-headline-md text-headline-md">Change password</h2><p className="text-body-sm text-on-surface-variant">You will need to sign in again after changing it.</p></div>
    </div>
    {requestError && <div className="mb-space-md rounded-xl border border-error/35 bg-error-container/20 p-3 text-sm text-on-error-container" role="alert">{requestError}</div>}
    <form className="space-y-4" onSubmit={submit} noValidate>
      <PasswordField id="current-password" label="Current password" value={values.currentPassword} onChange={update('currentPassword')}
        error={errors.currentPassword} autoComplete="current-password" disabled={pending} />
      <PasswordField id="new-password" label="New password" value={values.newPassword} onChange={update('newPassword')}
        error={errors.newPassword} autoComplete="new-password" disabled={pending} />
      <PasswordField id="confirm-new-password" label="Confirm new password" value={values.confirmPassword} onChange={update('confirmPassword')}
        error={errors.confirmPassword} autoComplete="new-password" disabled={pending} />
      <div className="flex justify-end"><Button variant="primary" type="submit" disabled={pending}>{pending ? 'Changing…' : 'Change password'}</Button></div>
    </form>
  </section>
}
