import { useEffect, useRef, useState } from 'react'
import { Button, Icon } from '@/shared/ui'
import { adjustPlayerElo } from '../api/adminUserApi'
import { errorMessage, inputClass } from '../format'

const MAX_ELO = 100000

export default function EloDialog({ user, standing, onClose, onSaved }) {
  const dialog = useRef(null)
  const [opener] = useState(() => document.activeElement)
  const [elo, setElo] = useState(String(standing.elo))
  const [reason, setReason] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!dialog.current.open) dialog.current.showModal()
    return () => opener?.focus()
  }, [opener])

  const submit = async event => {
    event.preventDefault()
    const value = Number(elo)
    const cleanReason = reason.trim()
    if (!Number.isInteger(value) || value < 0 || value > MAX_ELO) { setError(`Enter a whole number from 0 to ${MAX_ELO}.`); return }
    if (value === standing.elo) { setError('The new Elo is the same as the current one.'); return }
    if (!cleanReason || cleanReason.length > 500) { setError('Enter a reason of 1–500 characters.'); return }
    setPending(true)
    setError('')
    try {
      onSaved(await adjustPlayerElo(user.accountId, { elo: value, reason: cleanReason }))
    } catch (failure) {
      setError(errorMessage(failure))
    } finally { setPending(false) }
  }

  const close = () => { if (!pending) onClose() }
  return <dialog ref={dialog} aria-labelledby="elo-dialog-title" className="m-auto w-[min(95vw,32rem)] rounded-2xl border border-outline-variant bg-surface-container p-6 text-on-surface shadow-dialog backdrop:bg-obsidian/70"
    onCancel={event => { event.preventDefault(); close() }} onClose={close}
    onClick={event => { if (event.target === event.currentTarget) close() }}>
    <form onSubmit={submit} className="space-y-4" noValidate>
      <h2 id="elo-dialog-title" className="font-headline-md text-headline-md flex items-center gap-2"><Icon name="tune" />Adjust Elo</h2>
      <p className="break-words text-sm text-on-surface-variant">{user.email} · current Elo {standing.elo}</p>
      <p className="text-sm">Sets the Elo of the active season. The tier follows the new value; streaks and match counts stay.</p>
      <div><label htmlFor="elo-value" className="mb-1 block text-sm">New Elo</label>
        <input id="elo-value" className={inputClass} type="number" min={0} max={MAX_ELO} step={1} value={elo} onChange={event => setElo(event.target.value)} disabled={pending} required />
      </div>
      <div><label htmlFor="elo-reason" className="mb-1 block text-sm">Reason</label>
        <textarea id="elo-reason" className={inputClass} value={reason} onChange={event => setReason(event.target.value)} maxLength={500} rows={3} disabled={pending} required />
        <p className="text-right text-xs text-outline">{reason.length}/500 · saved in the Elo history</p>
      </div>
      {error && <p role="alert" className="rounded-lg bg-error-container/30 p-3 text-sm text-on-error-container">{error}</p>}
      <div className="flex justify-end gap-3"><Button disabled={pending} onClick={close}>Cancel</Button>
        <Button type="submit" variant="primary" disabled={pending}>{pending ? 'Working…' : 'Save Elo'}</Button>
      </div>
    </form>
  </dialog>
}
