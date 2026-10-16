import { useState } from 'react'
import { Button } from '@/shared/ui'
import Field from './Field'
import Message from './Message'
import styles from './InviteForm.module.css'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Uses an account id until the friends feature can supply a friend picker.
export default function InviteForm({ disabled, onInvite }) {
  const [accountId, setAccountId] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const submit = async event => {
    event.preventDefault()
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

  return <form className={styles.invite} aria-label="Invite a friend" onSubmit={submit}>
    <Field label="Invite a friend" value={accountId} onChange={event => setAccountId(event.target.value)}
      placeholder="Friend's account ID" spellCheck="false" />
    <Button type="submit" disabled={disabled || busy || !UUID.test(accountId.trim())}>{busy ? 'Sending…' : 'Send invite'}</Button>
    {message && <Message tone="success">{message}</Message>}
    {error && <Message tone="error">{error}</Message>}
  </form>
}
