import { useState } from 'react'
import { Button, Icon } from '@/shared/ui'
import Message from './Message'
import styles from './InviteRow.module.css'

export default function InviteRow({ invite, inviter, disabled, onJoin }) {
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const join = async event => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try { await onJoin(invite.roomCode, password || null) }
    catch (failure) { setError(failure.message) }
    finally { setBusy(false) }
  }

  return <li className={styles.row}>
    <form className={styles.form} onSubmit={join} aria-label={`Invitation to room ${invite.roomCode}`}>
      <div className={styles.details}>
        <strong className={styles.code}>{invite.roomCode}</strong>
        <span>from <span className={styles.inviter}>{inviter}</span></span>
        {invite.hasPassword && <span className={styles.lock}><Icon name="lock" className={styles.lockIcon} />Password</span>}
      </div>
      <div className={styles.actions}>
        {invite.hasPassword && <input className={styles.password} type="password" aria-label={`Password for room ${invite.roomCode}`}
          placeholder="Password" value={password} onChange={event => setPassword(event.target.value)} />}
        <Button variant="primary" type="submit" disabled={disabled || busy}>{busy ? 'Joining…' : 'Join'}</Button>
      </div>
    </form>
    {error && <Message tone="error">{error}</Message>}
  </li>
}
