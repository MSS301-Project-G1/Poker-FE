import { useState } from 'react'
import { Button, Eyebrow } from '@/shared/ui'
import Field from './Field'
import Message from './Message'
import Panel from './Panel'
import styles from './JoinRoomForm.module.css'

export default function JoinRoomForm({ disabled, onJoin }) {
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async event => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try { await onJoin(code.trim().toUpperCase(), password || null) }
    catch (failure) { setError(failure.message) }
    finally { setBusy(false) }
  }

  return <Panel as="form" className={styles.form} aria-label="Join with a code" onSubmit={submit}>
    <div><Eyebrow>GOT AN INVITE?</Eyebrow><h2 className={styles.title}>Join with a code</h2></div>
    <Field label="Room code" controlClassName={styles.code} required minLength={4} maxLength={16} autoComplete="off" spellCheck="false"
      value={code} onChange={event => setCode(event.target.value.toUpperCase())} placeholder="ABC123" />
    <Field label="Password" hint="(if the room has one)" type="password" autoComplete="off"
      value={password} onChange={event => setPassword(event.target.value)} />
    {error && <Message tone="error">{error}</Message>}
    <Button variant="primary" type="submit" disabled={disabled || busy || !code.trim()}>{busy ? 'Joining…' : 'Join room'}</Button>
  </Panel>
}
