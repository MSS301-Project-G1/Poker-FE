import { useEffect, useRef, useState } from 'react'
import { Button, Icon } from '@/shared/ui'
import { banUser, unbanUser } from '../api/adminUserApi'
import { errorMessage, inputClass } from '../format'

export default function BanUserDialog({ user, onClose, onSaved, onReload }) {
  const dialog = useRef(null)
  const [opener] = useState(() => document.activeElement)
  const [reason, setReason] = useState('')
  const [duration, setDuration] = useState('permanent')
  const [until, setUntil] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const unbanning = user.banned

  useEffect(() => {
    if (!dialog.current.open) dialog.current.showModal()
    return () => opener?.focus()
  }, [opener])

  const submit = async event => {
    event.preventDefault()
    const cleanReason = reason.trim()
    if (!cleanReason || cleanReason.length > 500) { setError('Enter a reason of 1–500 characters.'); return }
    let expiresAt = null
    if (!unbanning && duration === 'timed') {
      const timestamp = new Date(until).getTime()
      if (!Number.isFinite(timestamp) || timestamp <= Date.now()) { setError('The end time must be in the future.'); return }
      expiresAt = new Date(timestamp).toISOString()
    }
    setPending(true)
    setError('')
    try {
      const result = unbanning ? await unbanUser(user.accountId, { reason: cleanReason })
        : await banUser(user.accountId, { reason: cleanReason, until: expiresAt })
      onSaved(result)
    } catch (failure) {
      setError(errorMessage(failure))
    } finally { setPending(false) }
  }

  const close = () => { if (!pending) onClose() }
  return <dialog ref={dialog} aria-labelledby="ban-dialog-title" className="m-auto w-[min(95vw,32rem)] rounded-2xl border border-outline-variant bg-surface-container p-6 text-on-surface shadow-dialog backdrop:bg-obsidian/70"
    onCancel={event => { event.preventDefault(); close() }} onClose={close}
    onClick={event => { if (event.target === event.currentTarget) close() }}>
    <form onSubmit={submit} className="space-y-4" noValidate>
      <h2 id="ban-dialog-title" className="font-headline-md text-headline-md flex items-center gap-2"><Icon name={unbanning ? 'lock_open' : 'block'} />{unbanning ? 'Unban account' : 'Ban account'}</h2>
      <p className="break-words text-sm text-on-surface-variant">{user.email}</p>
      <p className="text-sm">{unbanning ? 'The user will need to sign in again after the ban is lifted.' : 'The user loses API and socket access and can’t sign in while banned.'}</p>
      <div><label htmlFor="ban-reason" className="mb-1 block text-sm">Reason</label>
        <textarea id="ban-reason" className={inputClass} value={reason} onChange={event => setReason(event.target.value)} maxLength={500} rows={3} disabled={pending} required />
        <p className="text-right text-xs text-outline">{reason.length}/500</p>
      </div>
      {!unbanning && <>
        <div><label htmlFor="ban-duration" className="mb-1 block text-sm">Duration</label>
          <select id="ban-duration" className={inputClass} value={duration} onChange={event => setDuration(event.target.value)} disabled={pending}>
            <option value="permanent">Until an admin lifts it</option><option value="timed">Until a specific time</option>
          </select>
        </div>
        {duration === 'timed' && <div><label htmlFor="ban-until" className="mb-1 block text-sm">Ban until</label>
          <input id="ban-until" className={inputClass} type="datetime-local" value={until} onChange={event => setUntil(event.target.value)} disabled={pending} required />
          <p className="mt-1 text-xs text-outline">In your device’s time zone. The user can sign in again once it ends.</p>
        </div>}
      </>}
      {error && <div role="alert" className="rounded-lg bg-error-container/30 p-3 text-sm text-on-error-container">
        <p>{error}</p><button type="button" className="mt-2 underline" disabled={pending} onClick={onReload}>Close and reload status</button>
      </div>}
      <div className="flex justify-end gap-3"><Button disabled={pending} onClick={close}>Cancel</Button>
        <Button type="submit" variant={unbanning ? 'primary' : 'danger'} disabled={pending}>{pending ? 'Working…' : unbanning ? 'Confirm unban' : 'Confirm ban'}</Button>
      </div>
    </form>
  </dialog>
}
