import { useEffect, useRef, useState } from 'react'
import { Button, Icon } from '@/shared/ui'
import { avatarFileError } from '@/shared/api/presignedUpload'
import { fetchAvatarPresets, selectAvatarPreset, uploadMyAvatar } from '../api/profileApi'
import { panelClass } from './accountFormStyles'

const messageOf = error => error?.requestId ? `${error.message} Reference: ${error.requestId}` : error?.message

export default function AvatarSettings({ currentAvatarUrl, displayName, onChanged }) {
  const inputRef = useRef(null)
  const [presets, setPresets] = useState([])
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  const load = async signal => {
    setLoading(true); setError('')
    try { setPresets(await fetchAvatarPresets(signal)) } catch (failure) {
      if (failure.name !== 'AbortError') setError(messageOf(failure) || 'Unable to load avatars.')
    } finally { if (!signal?.aborted) setLoading(false) }
  }

  useEffect(() => {
    const controller = new AbortController()
    fetchAvatarPresets(controller.signal)
      .then(setPresets)
      .catch(failure => { if (failure.name !== 'AbortError') setError(messageOf(failure) || 'Unable to load avatars.') })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [])

  const choose = async avatarId => {
    setPending(true); setError('')
    try { await selectAvatarPreset(avatarId); await onChanged('Avatar updated.') } catch (failure) {
      setError(messageOf(failure) || 'Unable to select this avatar.')
      if (failure.code === 'AUTH_AVATAR_INVALID') void load()
    } finally { setPending(false) }
  }

  const upload = async event => {
    const file = event.target.files?.[0]
    event.target.value = ''
    const validationError = avatarFileError(file)
    if (validationError) { setError(validationError); return }
    setPending(true); setError('')
    try { await uploadMyAvatar(file); await onChanged('Avatar uploaded.') } catch (failure) {
      setError(messageOf(failure) || 'Unable to upload the avatar.')
    } finally { setPending(false) }
  }

  return <section className={panelClass}>
    <div className="mb-space-lg flex flex-wrap items-center justify-between gap-space-md">
      <div className="flex items-center gap-space-md">
        <img className="h-16 w-16 rounded-xl object-cover ring-2 ring-primary/40" src={currentAvatarUrl || '/stitch-assets/avatar.svg'} alt={displayName || 'Player'}
          onError={event => { event.currentTarget.src = '/stitch-assets/avatar.svg' }} />
        <div><h2 className="font-headline-md text-headline-md">Avatar</h2><p className="text-body-sm text-on-surface-variant">Choose a preset or upload PNG/JPEG up to 2 MB.</p></div>
      </div>
      <Button onClick={() => inputRef.current?.click()} disabled={pending}><Icon name="upload" />Upload image</Button>
      <input ref={inputRef} className="hidden" type="file" accept="image/png,image/jpeg" onChange={upload} disabled={pending} />
    </div>
    {error && <div className="mb-space-md rounded-xl border border-error/35 bg-error-container/20 p-3 text-sm text-on-error-container" role="alert">{error}</div>}
    {loading && <p className="text-sm text-on-surface-variant" role="status">Loading avatar presets…</p>}
    {!loading && presets.length === 0 && <div className="rounded-xl border border-dashed border-outline-variant p-space-lg text-center text-sm text-on-surface-variant">
      No preset avatars are available. You can still upload your own image.
    </div>}
    <div className="grid grid-cols-3 gap-space-sm sm:grid-cols-5 md:grid-cols-7">
      {presets.map(preset => <button key={preset.avatarId} type="button" onClick={() => choose(preset.avatarId)} disabled={pending}
        className="group rounded-xl border border-outline-variant/50 bg-surface-container p-2 hover:border-primary disabled:opacity-50">
        <img src={preset.avatarUrl} alt={preset.name} className="aspect-square w-full rounded-lg object-cover" onError={event => { event.currentTarget.src = '/stitch-assets/avatar.svg' }} />
        <span className="mt-1 block truncate text-xs text-on-surface-variant group-hover:text-on-surface">{preset.name}</span>
      </button>)}
    </div>
  </section>
}
