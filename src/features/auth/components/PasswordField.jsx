import { useState } from 'react'
import { Icon } from '@/shared/ui'
import { fieldErrorClass, inputClass, labelClass } from './authFormStyles'

export default function PasswordField({ id, label, value, onChange, error, autoComplete, disabled }) {
  const [visible, setVisible] = useState(false)
  return <div>
    <label className={labelClass} htmlFor={id}>{label} <span className="text-primary">*</span></label>
    <div className="relative">
      <Icon name="lock" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-lg pointer-events-none" />
      <input id={id} className={`${inputClass} pl-11 pr-11`} type={visible ? 'text' : 'password'} value={value}
        onChange={event => onChange(event.target.value)} autoComplete={autoComplete} disabled={disabled} aria-invalid={Boolean(error)} />
      <button className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors" type="button"
        aria-label={visible ? 'Hide password' : 'Show password'} onClick={() => setVisible(current => !current)} disabled={disabled}>
        <Icon name={visible ? 'visibility_off' : 'visibility'} className="text-lg" />
      </button>
    </div>
    {error && <p className={fieldErrorClass}>{error}</p>}
  </div>
}
