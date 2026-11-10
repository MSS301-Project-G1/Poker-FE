import { useState } from 'react'
import { Caption, Icon } from '@/shared/ui'
import Message from './Message'
import styles from './RoomHeading.module.css'

export default function RoomHeading({ room, connectionError }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(room.roomCode); setCopied(true) } catch { setCopied(false) }
  }

  return <section className={styles.heading}>
    <h1 className={styles.title}>Room
      <button type="button" className={styles.code} onClick={copy} aria-label={`Copy room code ${room.roomCode}`}>
        {room.roomCode}<Icon name={copied ? 'check' : 'content_copy'} className={styles.copyIcon} />
      </button>
    </h1>
    <Caption>{room.visibility === 'PUBLIC' ? 'Public room' : 'Private room'}{room.hasPassword ? ' · Password protected' : ''}</Caption>
    <p className={styles.muted}>Blinds {room.smallBlind} / {room.bigBlind} · {room.members.length} of {room.maxPlayers} seats · No entry fee, no Elo change</p>
    {connectionError && <Message tone="notice">Connection issue: {connectionError} Retrying…</Message>}
  </section>
}
