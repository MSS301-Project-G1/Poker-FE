import { useEffect, useRef, useState } from 'react'
import { Button, Icon } from '@/shared/ui'
import { moderateUser } from '../api/adminUserApi'
import { errorMessage, inputClass } from '../format'

export default function ModerationDialog({ user, item, onClose, onSaved }) {
  const dialog = useRef(null)
  const [opener] = useState(() => document.activeElement)
  const [reason, setReason] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!dialog.current.open) dialog.current.showModal()
    return () => opener?.focus()
  }, [opener])

  const submit = async event => {
    event.preventDefault()
    const cleanReason = reason.trim()
    if (!cleanReason || cleanReason.length > 500) { setError('Enter a reason of 1–500 characters.'); return }
    setPending(true)
    setError('')
    try {
      onSaved(await moderateUser(user.accountId, { action: item.action, reason: cleanReason }))
    } catch (failure) {
      setError(errorMessage(failure))
    } finally { setPending(false) }
  }

  const close = () => { if (!pending) onClose() }
  return <dialog ref={dialog} aria-labelledby="moderation-dialog-title" className="m-auto w-[min(95vw,32rem)] rounded-2xl border border-outline-variant bg-surface-container p-6 text-on-surface shadow-dialog backdrop:bg-obsidian/70"
    onCancel={event => { event.preventDefault(); close() }} onClose={close}
    onClick={event => { if (event.target === event.currentTarget) close() }}>
    <form onSubmit={submit} className="space-y-4" noValidate>
      <h2 id="moderation-dialog-title" className="font-headline-md text-headline-md flex items-center gap-2"><Icon name={item.icon} />{item.label}</h2>
      <p className="break-words text-sm text-on-surface-variant">{user.email}</p>
      <p className="text-sm">{item.description(user)}</p>
      <div><label htmlFor="moderation-reason" className="mb-1 block text-sm">Reason</label>
        <textarea id="moderation-reason" className={inputClass} value={reason} onChange={event => setReason(event.target.value)} maxLength={500} rows={3} disabled={pending} required />
        <p className="text-right text-xs text-outline">{reason.length}/500 · saved in the moderation history</p>
      </div>
      {error && <p role="alert" className="rounded-lg bg-error-container/30 p-3 text-sm text-on-error-container">{error}</p>}
      <div className="flex justify-end gap-3"><Button disabled={pending} onClick={close}>Cancel</Button>
        <Button type="submit" variant="primary" disabled={pending}>{pending ? 'Working…' : 'Confirm'}</Button>
      </div>
    </form>
  </dialog>
}
