import { useState } from 'react'
import { Button, Icon } from '@/shared/ui'
import { displayNameError } from '@/features/auth'
import { errorClass, inputClass, labelClass, panelClass } from './accountFormStyles'

const fields = ['displayName', 'fullName', 'phoneNumber', 'gender', 'birthDate', 'bio', 'countryCode', 'city']
const optionalText = value => value.trim() || null

function todayInVietnam() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date())
  const value = Object.fromEntries(parts.map(part => [part.type, part.value]))
  return `${value.year}-${value.month}-${value.day}`
}

function toForm(profile) {
  return Object.fromEntries(fields.map(field => [field, profile?.[field] || '']))
}

function validate(values) {
  const errors = { displayName: displayNameError(values.displayName) }
  if (values.fullName.length > 150) errors.fullName = 'Full name must be no more than 150 characters.'
  const phone = values.phoneNumber.trim()
  if (phone && !/^\+?[0-9]{7,15}$/.test(phone)) errors.phoneNumber = 'Use 7–15 digits, with an optional leading +.'
  if (values.birthDate && values.birthDate > todayInVietnam()) errors.birthDate = 'Birth date cannot be in the future.'
  if (values.bio.length > 500) errors.bio = 'Bio must be no more than 500 characters.'
  const country = values.countryCode.trim()
  if (country && !/^[A-Za-z]{2}$/.test(country)) errors.countryCode = 'Use a two-letter country code.'
  if (values.city.length > 100) errors.city = 'City must be no more than 100 characters.'
  return errors
}

export default function ProfileForm({ profile, pending, onSave }) {
  const [values, setValues] = useState(() => toForm(profile))
  const [errors, setErrors] = useState({})

  const update = field => event => setValues(current => ({ ...current, [field]: event.target.value }))

  const submit = event => {
    event.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return
    void onSave({
      displayName: values.displayName.trim(),
      fullName: optionalText(values.fullName),
      phoneNumber: optionalText(values.phoneNumber),
      gender: values.gender || null,
      birthDate: values.birthDate || null,
      bio: optionalText(values.bio),
      countryCode: optionalText(values.countryCode)?.toUpperCase() || null,
      city: optionalText(values.city),
    })
  }

  return <section className={panelClass}>
    <div className="mb-space-md flex items-center gap-space-sm">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container/30"><Icon name="person" className="text-primary" /></span>
      <div><h2 className="font-headline-md text-headline-md">Personal profile</h2><p className="text-body-sm text-on-surface-variant">Update the information shown on your account.</p></div>
    </div>
    <form className="grid grid-cols-1 gap-x-space-md gap-y-gutter-mobile md:grid-cols-2 xl:grid-cols-3" onSubmit={submit} noValidate>
      <Field id="profile-display-name" label="Display name" required error={errors.displayName}>
        <input id="profile-display-name" className={inputClass} value={values.displayName} onChange={update('displayName')} maxLength={100} disabled={pending} />
      </Field>
      <Field id="profile-email" label="Email address">
        <input id="profile-email" className={inputClass} value={profile.email} disabled />
      </Field>
      <Field id="profile-full-name" label="Full name" error={errors.fullName}>
        <input id="profile-full-name" className={inputClass} value={values.fullName} onChange={update('fullName')} maxLength={150} autoComplete="name" disabled={pending} />
      </Field>
      <Field id="profile-phone" label="Phone number" error={errors.phoneNumber}>
        <input id="profile-phone" className={inputClass} value={values.phoneNumber} onChange={update('phoneNumber')} maxLength={20} autoComplete="tel" disabled={pending} />
      </Field>
      <Field id="profile-gender" label="Gender">
        <select id="profile-gender" className={inputClass} value={values.gender} onChange={update('gender')} disabled={pending}>
          <option value="">Prefer not to say</option><option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option>
        </select>
      </Field>
      <Field id="profile-birth-date" label="Birth date" error={errors.birthDate}>
        <input id="profile-birth-date" className={inputClass} type="date" value={values.birthDate} onChange={update('birthDate')} max={todayInVietnam()} disabled={pending} />
      </Field>
      <Field id="profile-country" label="Country code" error={errors.countryCode}>
        <input id="profile-country" className={`${inputClass} uppercase`} value={values.countryCode} onChange={update('countryCode')} maxLength={2} placeholder="VN" autoComplete="country" disabled={pending} />
      </Field>
      <Field id="profile-city" label="City" error={errors.city}>
        <input id="profile-city" className={inputClass} value={values.city} onChange={update('city')} maxLength={100} autoComplete="address-level2" disabled={pending} />
      </Field>
      <div className="md:col-span-2 xl:col-span-3">
        <label className={labelClass} htmlFor="profile-bio">Bio</label>
        <textarea id="profile-bio" className={`${inputClass} min-h-16 resize-y`} value={values.bio} onChange={update('bio')} maxLength={500} disabled={pending} />
        <div className="mt-1 flex justify-between text-xs"><span className={errorClass}>{errors.bio}</span><span className="text-outline">{values.bio.length}/500</span></div>
      </div>
      <div className="md:col-span-2 xl:col-span-3 flex justify-end"><Button variant="primary" type="submit" disabled={pending}>{pending ? 'Saving…' : 'Save profile'}</Button></div>
    </form>
  </section>
}

function Field({ id, label, required = false, error, children }) {
  return <div><label className={labelClass} htmlFor={id}>{label}{required && <span className="text-primary"> *</span>}</label>{children}{error && <p className={errorClass}>{error}</p>}</div>
}
