import { useState } from 'react'
import { Button } from '@/shared/ui'

export default function AvatarPresetRow({ preset, pending, onSave }) {
  const [name, setName] = useState(preset.name)
  const changed = name.trim() !== preset.name
  const valid = name.trim().length > 0 && name.length <= 100

  return <article className="grid grid-cols-[56px_1fr] items-center gap-space-md rounded-xl border border-outline-variant/40 bg-surface-container p-space-md md:grid-cols-[64px_1fr_auto_auto]">
    <img src={preset.avatarUrl} alt={preset.name} className="h-14 w-14 rounded-lg object-cover md:h-16 md:w-16"
      onError={event => { event.currentTarget.src = '/stitch-assets/avatar.svg' }} />
    <div className="min-w-0">
      <label className="mb-1 block text-xs uppercase tracking-wider text-on-surface-variant" htmlFor={`avatar-${preset.avatarId}`}>Preset name</label>
      <input id={`avatar-${preset.avatarId}`} value={name} onChange={event => setName(event.target.value)} maxLength={100} disabled={pending}
        className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary" />
      <p className="mt-1 text-xs text-outline">Updated {new Date(preset.updatedAt).toLocaleString()}</p>
    </div>
    <button type="button" disabled={pending} onClick={() => onSave({ name: name.trim() || preset.name, active: !preset.active })}
      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${preset.active ? 'bg-success/20 text-success' : 'bg-surface-container-high text-on-surface-variant'}`}>
      {preset.active ? 'Active' : 'Inactive'}
    </button>
    <Button variant="primary" onClick={() => onSave({ name: name.trim(), active: preset.active })} disabled={pending || !changed || !valid}>Save</Button>
  </article>
}
