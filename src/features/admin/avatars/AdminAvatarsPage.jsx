import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { paths } from '@/shared/config/paths'
import { avatarFileError } from '@/shared/api/presignedUpload'
import { Button, Icon, useToast } from '@/shared/ui'
import { fetchAdminAvatars, updateAdminAvatar, uploadAdminAvatar } from './api/adminAvatarApi'
import AvatarPresetRow from './components/AvatarPresetRow'

const messageOf = error => error?.requestId ? `${error.message} Reference: ${error.requestId}` : error?.message

export default function AdminAvatarsPage() {
  const navigate = useNavigate()
  const notify = useToast()
  const fileRef = useRef(null)
  const [presets, setPresets] = useState([])
  const [name, setName] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pendingId, setPendingId] = useState('')
  const [error, setError] = useState('')


  useEffect(() => {
    const controller = new AbortController()
    fetchAdminAvatars(controller.signal)
      .then(setPresets)
      .catch(failure => { if (failure.name !== 'AbortError') setError(messageOf(failure) || 'Unable to load avatar presets.') })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [])

  const create = async event => {
    event.preventDefault()
    const cleanName = name.trim()
    const fileError = avatarFileError(file)
    if (!cleanName || name.length > 100) { setError('Preset name is required and must be no more than 100 characters.'); return }
    if (fileError) { setError(fileError); return }
    setPendingId('new'); setError('')
    try {
      const created = await uploadAdminAvatar(cleanName, file)
      setPresets(current => [created, ...current])
      setName(''); setFile(null)
      if (fileRef.current) fileRef.current.value = ''
      notify('Avatar preset created.')
    } catch (failure) { setError(messageOf(failure) || 'Unable to create the avatar preset.') } finally { setPendingId('') }
  }

  const update = avatarId => async values => {
    setPendingId(avatarId); setError('')
    try {
      const updated = await updateAdminAvatar(avatarId, values)
      setPresets(current => current.map(item => item.avatarId === avatarId ? updated : item))
      notify('Avatar preset updated.')
    } catch (failure) { setError(messageOf(failure) || 'Unable to update the avatar preset.') } finally { setPendingId('') }
  }

  return <div className="w-full px-margin pb-space-lg pt-space-md">
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-space-md">
      <header className="flex flex-wrap items-center justify-between gap-space-md">
        <div><p className="font-label-action text-label-action uppercase tracking-widest text-primary">Administration</p><h1 className="font-headline-lg text-headline-lg">Avatar presets</h1></div>
        <Button onClick={() => navigate(paths.lobby)}><Icon name="arrow_back" />Back to lobby</Button>
      </header>
      {error && <div className="rounded-xl border border-error/35 bg-error-container/20 p-3 text-sm text-on-error-container" role="alert">{error}</div>}
      <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-low/85 p-space-lg shadow-raised">
        <div className="mb-space-md"><h2 className="font-headline-md text-headline-md">Create preset</h2><p className="text-body-sm text-on-surface-variant">Upload a PNG or JPEG up to 2 MB. New presets are active immediately.</p></div>
        <form className="grid grid-cols-1 items-end gap-space-md md:grid-cols-[1fr_1fr_auto]" onSubmit={create}>
          <div><label className="mb-1.5 block text-xs uppercase tracking-wider" htmlFor="preset-name">Preset name</label><input id="preset-name" value={name} onChange={event => setName(event.target.value)} maxLength={100} disabled={pendingId === 'new'}
            className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-3.5 py-3 text-sm focus:outline-none focus:border-primary" /></div>
          <div><label className="mb-1.5 block text-xs uppercase tracking-wider" htmlFor="preset-file">Image</label><input ref={fileRef} id="preset-file" type="file" accept="image/png,image/jpeg" onChange={event => setFile(event.target.files?.[0] || null)} disabled={pendingId === 'new'}
            className="block w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary-container file:px-3 file:py-1.5 file:text-on-primary-container" /></div>
          <Button variant="primary" type="submit" disabled={pendingId === 'new'}>{pendingId === 'new' ? 'Creating…' : 'Create preset'}</Button>
        </form>
      </section>
      <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-low/85 p-space-lg shadow-raised">
        <div className="mb-space-md flex items-center justify-between"><div><h2 className="font-headline-md text-headline-md">Preset catalog</h2><p className="text-body-sm text-on-surface-variant">Inactive presets remain visible here but cannot be newly selected by users.</p></div><span className="rounded-full bg-surface-container-high px-3 py-1 text-xs">{presets.length} total</span></div>
        {loading && <p className="text-on-surface-variant" role="status">Loading presets…</p>}
        {!loading && presets.length === 0 && <p className="rounded-xl border border-dashed border-outline-variant p-space-lg text-center text-on-surface-variant">No avatar presets have been created.</p>}
        <div className="flex flex-col gap-space-sm">{presets.map(preset => <AvatarPresetRow key={`${preset.avatarId}:${preset.updatedAt}`} preset={preset} pending={pendingId === preset.avatarId} onSave={update(preset.avatarId)} />)}</div>
      </section>
    </div>
  </div>
}
