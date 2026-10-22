import { useState } from 'react'
import { Button, Icon } from '@/shared/ui'
import Message from './Message'
import styles from './PublicRoomRow.module.css'

export default function PublicRoomRow({ room, disabled, onJoin }) {
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const full = room.playerCount >= room.maxPlayers

  const join = async event => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try { await onJoin(room.roomCode, password || null) }
    catch (failure) { setError(failure.message) }
    finally { setBusy(false) }
  }

  return <li className={styles.row}>
    <form className={styles.form} onSubmit={join} aria-label={`Room ${room.roomCode}`}>
      <div className={styles.details}>
        <strong className={styles.code}>{room.roomCode}</strong>
        <span>{room.smallBlind} / {room.bigBlind} blinds</span>
        <span className={full ? styles.full : ''}>{room.playerCount} / {room.maxPlayers} seated</span>
        {room.hasPassword && <span className={styles.lock}><Icon name="lock" className={styles.lockIcon} />Password</span>}
      </div>
      <div className={styles.actions}>
        {room.hasPassword && <input className={styles.password} type="password" aria-label={`Password for room ${room.roomCode}`}
          placeholder="Password" value={password} onChange={event => setPassword(event.target.value)} />}
        <Button type="submit" disabled={disabled || busy || full}>{full ? 'Full' : busy ? 'Joining…' : 'Join'}</Button>
      </div>
    </form>
    {error && <Message tone="error">{error}</Message>}
  </li>
}
