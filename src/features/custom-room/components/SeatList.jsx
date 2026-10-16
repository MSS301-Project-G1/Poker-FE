import styles from './SeatList.module.css'

export default function SeatList({ room, accountId, profiles, busy, onKick, onTransfer }) {
  const isOwner = room.ownerId === accountId
  const waiting = room.status === 'WAITING'
  const empty = Math.max(0, room.maxPlayers - room.members.length)
  return <ol className={styles.seats} aria-label="Seats">
    {room.members.map((member, index) => {
      const name = profiles[member.accountId]?.displayName || `Player ${member.accountId.slice(-6)}`
      const you = member.accountId === accountId
      return <li key={member.accountId} className={`${styles.seat} ${you ? styles.you : ''}`}>
        <span className={styles.number}>{index + 1}</span>
        <span className={styles.avatar} aria-hidden="true">{name.slice(0, 1).toUpperCase()}</span>
        <div className={styles.name}>
          <strong className={styles.displayName}>{name}</strong>
          <span className={styles.tags}>{member.owner && <em className={`${styles.tag} ${styles.host}`}>Host</em>}{you && <em className={styles.tag}>You</em>}</span>
        </div>
        <span className={`${styles.ready} ${member.owner || member.ready ? styles.readyOn : ''}`}>{member.owner ? 'Hosting' : member.ready ? 'Ready' : 'Not ready'}</span>
        {isOwner && !member.owner && <div className={styles.actions}>
          <button type="button" className={styles.link} disabled={busy} onClick={() => onTransfer(member.accountId)}>Make host</button>
          {waiting && <button type="button" className={`${styles.link} ${styles.danger}`} disabled={busy} onClick={() => onKick(member.accountId)}>Remove</button>}
        </div>}
      </li>
    })}
    {Array.from({ length: empty }, (_, index) => <li key={`empty-${index}`} className={`${styles.seat} ${styles.empty}`}>
      <span className={styles.number}>{room.members.length + index + 1}</span><span>Open seat</span>
    </li>)}
  </ol>
}
