import { useState } from 'react'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Uses an account id until the friends feature can supply a friend picker.
export default function InviteForm({ disabled, onInvite }) {
  const [accountId, setAccountId] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const submit = async event => {
    event.preventDefault()
    event.stopPropagation()
    setBusy(true)
    setError('')
    setMessage('')
    try {
      await onInvite(accountId.trim())
      setMessage('Invitation sent.')
      setAccountId('')
    } catch (failure) { setError(failure.message) }
    finally { setBusy(false) }
  }

  return <form className="room-invite" aria-label="Invite a friend" onSubmit={submit}>
    <label>Invite a friend<input value={accountId} onChange={event => setAccountId(event.target.value)} placeholder="Friend's account ID" spellCheck="false" /></label>
    <button className="room-secondary" disabled={disabled || busy || !UUID.test(accountId.trim())}>{busy ? 'Sending…' : 'Send invite'}</button>
    {message && <p className="room-success" role="status">{message}</p>}
    {error && <p className="room-error" role="alert">{error}</p>}
  </form>
}
